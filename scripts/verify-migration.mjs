// Supabase-ийн migration-ийг жинхэнэ PostgreSQL (PGlite) дээр ажиллуулж,
// хязгаарлалт болон RLS бодлогуудыг шалгана.
// Ажиллуулах: npm run db:verify
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const db = new PGlite({ extensions: { pgcrypto } });

// Supabase орчинд байдаг зүйлсийг дуурайлгана.
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
`);

const dir = "supabase/migrations";
for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  await db.exec(readFileSync(join(dir, file), "utf8"));
  console.log(`✓ ${file}`);
}

await db.exec(`
  grant usage on schema public to anon, authenticated, service_role;
  grant all on all tables in schema public to anon, authenticated, service_role;
`);

let failures = 0;
async function expect(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures++;
    console.error(`✗ ${name}\n  ${error.message}`);
  }
}
async function expectError(name, sql) {
  await expect(name, async () => {
    try {
      await db.exec(sql);
    } catch {
      return;
    }
    throw new Error("Алдаа гарах ёстой байсан ч амжилттай биеллээ.");
  });
}
async function asRole(role, fn, sub = "") {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${sub}', false);`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role;");
  }
}

// Туршилтын өгөгдөл (superuser, RLS-ийг тойрно)
await db.exec(`
  insert into topics (id, title, slug, order_index) values
    ('00000000-0000-0000-0000-000000000001', 'Нийтлэгдсэн сэдэв', 'published-topic', 1),
    ('00000000-0000-0000-0000-000000000002', 'Ноорог сэдэв', 'draft-topic', 2);
  update topics set is_published = false where slug = 'draft-topic';
  insert into chapters (id, topic_id, title, slug, order_index) values
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Бүлэг', 'chapter', 1),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', 'Далд бүлэг', 'hidden-chapter', 1);
  insert into lessons (id, chapter_id, title, slug, youtube_video_id, order_index, learning_objectives) values
    ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000011', 'Хичээл', 'lesson', 'abcdefghijk', 1, '{"Зорилго 1"}'),
    ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000012', 'Далд хичээл', 'hidden-lesson', null, 1, '{}');
`);

await expectError("Буруу slug-ийг хүлээж авахгүй", `insert into topics (title, slug) values ('x', 'Bad Slug')`);
await expectError("Давхардсан slug-ийг хүлээж авахгүй", `insert into topics (title, slug) values ('x', 'published-topic')`);
await expectError("Хоосон гарчгийг хүлээж авахгүй", `insert into topics (title, slug) values ('  ', 'empty-title')`);
await expectError(
  "Буруу YouTube ID-г хүлээж авахгүй",
  `insert into lessons (chapter_id, title, slug, youtube_video_id) values ('00000000-0000-0000-0000-000000000011', 'x', 'bad-video', 'https://youtu.be/x')`,
);
await expectError(
  "Сөрөг үргэлжлэх хугацааг хүлээж авахгүй",
  `insert into lessons (chapter_id, title, slug, duration_seconds) values ('00000000-0000-0000-0000-000000000011', 'x', 'neg', -5)`,
);
await expectError(
  "Эзэнгүй ахицын мөрийг хүлээж авахгүй",
  `insert into lesson_progress (lesson_id) values ('00000000-0000-0000-0000-000000000021')`,
);

await expect("updated_at автоматаар шинэчлэгдэнэ", async () => {
  const before = await db.query(`select updated_at from topics where slug = 'published-topic'`);
  await db.exec(`select pg_sleep(0.01); update topics set title = 'Шинэ' where slug = 'published-topic'`);
  const after = await db.query(`select updated_at from topics where slug = 'published-topic'`);
  if (!(after.rows[0].updated_at > before.rows[0].updated_at)) throw new Error("updated_at өөрчлөгдсөнгүй");
});

await expect("anon зөвхөн нийтлэгдсэн агуулгыг харна", async () => {
  const counts = await asRole("anon", async () => ({
    topics: (await db.query("select * from topics")).rows.length,
    chapters: (await db.query("select * from chapters")).rows.length,
    lessons: (await db.query("select * from lessons")).rows.length,
  }));
  if (counts.topics !== 1 || counts.chapters !== 1 || counts.lessons !== 1) {
    throw new Error(`Хүлээгдэж буй 1/1/1, гарсан ${JSON.stringify(counts)}`);
  }
});

for (const [role, sub] of [["anon", ""], ["authenticated", "00000000-0000-0000-0000-0000000000aa"]]) {
  await expect(`${role} агуулга нэмж чадахгүй`, async () => {
    let blocked = false;
    try {
      await asRole(role, () => db.exec(`insert into topics (title, slug) values ('Халдлага', 'attack')`), sub);
    } catch {
      blocked = true;
    }
    if (!blocked) throw new Error("Бичих боломжтой байна!");
  });
  await expect(`${role} агуулга өөрчилж, устгаж чадахгүй`, async () => {
    await asRole(role, () => db.exec(`update topics set title = 'Эвдэрсэн'; delete from lessons;`), sub);
    const { rows } = await db.query(`select count(*)::int as n from lessons`);
    const { rows: t } = await db.query(`select count(*)::int as n from topics where title = 'Эвдэрсэн'`);
    if (rows[0].n !== 2 || t[0].n !== 0) throw new Error("Өгөгдөл өөрчлөгдсөн байна!");
  });
}

await expect("Нэвтэрсэн хэрэглэгч зөвхөн өөрийн ахицыг удирдана", async () => {
  const me = "00000000-0000-0000-0000-0000000000aa";
  const other = "00000000-0000-0000-0000-0000000000bb";
  await db.exec(`insert into auth.users (id) values ('${me}'), ('${other}')`);
  await db.exec(
    `insert into lesson_progress (user_id, lesson_id, completed) values ('${other}', '00000000-0000-0000-0000-000000000021', true)`,
  );
  await asRole(
    "authenticated",
    () =>
      db.exec(
        `insert into lesson_progress (user_id, lesson_id, completed, completed_at) values ('${me}', '00000000-0000-0000-0000-000000000021', true, now())`,
      ),
    me,
  );
  const visible = await asRole("authenticated", () => db.query("select user_id from lesson_progress"), me);
  if (visible.rows.length !== 1 || visible.rows[0].user_id !== me) throw new Error("Бусдын ахиц харагдаж байна");
  let blocked = false;
  try {
    await asRole(
      "authenticated",
      () => db.exec(`insert into lesson_progress (user_id, lesson_id) values ('${other}', '00000000-0000-0000-0000-000000000022')`),
      me,
    );
  } catch {
    blocked = true;
  }
  if (!blocked) throw new Error("Бусдын нэр дээр ахиц нэмэх боломжтой байна");
});

await expect("Сэдэв устгахад бүлэг, хичээл хамт устана", async () => {
  await db.exec(`delete from topics where slug = 'draft-topic'`);
  const { rows } = await db.query(`select count(*)::int as n from lessons where slug = 'hidden-lesson'`);
  if (rows[0].n !== 0) throw new Error("Хичээл устаагүй");
});

await db.close();
if (failures > 0) {
  console.error(`\n${failures} шалгалт амжилтгүй боллоо.`);
  process.exit(1);
}
console.log("\nБүх шалгалт амжилттай.");
