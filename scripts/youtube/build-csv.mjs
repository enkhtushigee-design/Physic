// channel.json → сэдэв/бүлэгт хуваасан CSV (Magsar Physics импортын формат)
import { readFileSync, writeFileSync } from "node:fs";

const { videos } = JSON.parse(readFileSync(new URL("../../content/youtube-channel.json", import.meta.url), "utf8"));
const chrono = [...videos].reverse(); // хамгийн эртнийхээс

// Зохиогчийн дугаарласан цувралууд: "N.M ..." → бүлэг
const SERIES = {
  1: ["Механик", "Кинематик"],
  2: ["Механик", "Динамик"],
  3: ["Механик", "Ажил, энерги ба импульс"],
  8: ["Механик", "Хатуу биеийн эргэлдэх хөдөлгөөн"],
  4: ["Хэлбэлзэл ба долгион", "Хэлбэлзэл ба долгион"],
  5: ["Дулаан ба молекул физик", "Термодинамик"],
  6: ["Цахилгаан", "Электростатик"],
  7: ["Цахилгаан", "Тогтмол гүйдлийн хэлхээ"],
  9: ["Соронзон орон", "Соронзон орон ба цахилгаан соронзон индукц"],
};

const TOPIC_ORDER = [
  "Механик",
  "Хэлбэлзэл ба долгион",
  "Дулаан ба молекул физик",
  "Цахилгаан",
  "Соронзон орон",
  "Оптик",
  "Орчин үеийн физик",
  "Цахим хичээлийн цуврал",
  "Физикт хэрэглэгдэх математик",
  "Олимпиадын бодлого",
  "Физикийн ЭЕШ-ийн бодолт",
  "Математикийн ЭЕШ-ийн бодолт",
  "Лекц ба ярилцлага",
];

const ATOM = new Set(["sjSld-MrSBc", "EpAZfhMeppc", "GYh8U42msb8", "3DTg9IjdtEk", "LHQxmYW8wEg"]);
const OPTICS = new Set(["Oe_lApBDIB8", "xw-dBYXPYn4", "b_yFIhx-mHw", "x1XsRvScS5o", "BAasMvzJbDk", "fWAYu4WOjo0", "cOxqZSzCGb0", "nWLW9WE_ohE"]);
const HEAT_SCHOOL = new Set(["BR-nqm7c9o8", "X5DjEH9moyc", "VKbjqKPOMUY", "mannosfTayQ", "UulYLaO2rSk", "YxSqiHZ7nXg", "i4IWjT-bE58", "rqJ7LtsACKE"]);
const MATH_TOOLS = new Set(["GygSxEFKk-g", "RhMe7QdmjbY", "OIAUGMujdgs", "mVU0JR1t91g", "UYptttByetQ", "DGmiEIItmjI"]);
const OLYMPIAD = new Set(["4n9s-nAV5fE", "eVV7x5h7t3c", "Hij81tyTGzQ", "XeDbT2cUhFQ"]);
const BLUEPRINT = new Set(["5BAFAJ94qro", "qwssHPDoxCo", "4VDWTVnzR9Q", "d_KRlHEeMqY", "WanbmYIILx0"]);
const TALKS = new Set(["UGEOV-1arjk", "tn3ECPEII6s"]);
const MAGNET_EXTRA = new Set(["M3Zk9NWoQOc"]); // "Соронзон орон-1" (Азжаргалын хичээл)

// Бүлгийн нэртэй давхардсан угтварууд (бүлгийн нэр аль хэдийн харагддаг)
const REDUNDANT = [/^механик\s*-\s*(кинематик\s*-\s*)?/i, /^динамик\s*-\s*/i, /^термодинамик\s*-\s*/i, /^цахилгаан хэлхээ\s*-\s*/i];

function cleanTitle(raw, { series = false } = {}) {
  let t = raw;
  if (series) t = t.replace(/^\d+\.\d+\s*[.\-–]?\s*/, ""); // зөвхөн "1.3 ", "3.14-", "8.1. " дугаарыг хасна
  t = t
    .replace(/^Физикийн\s+хичэ+л\s*[-–]?\s*/i, "")
    .replace(/\s+[a-z ]+$/i, (m) => (/[а-яөү]/i.test(t) ? "" : m)) // "hurd hugatsaa diagram" мэт латин давхардал
    .replace(/'/g, "")
    .replace(/(\d)\s*-\s*р\b/g, "$1-р") // "2-р", "9-р"
    .replace(/(\d)р анги/g, "$1-р анги")
    .replace(/([^\d\s])\s*-\s*(?=\S)/g, "$1 - ") // үгийн хоорондох зураасыг жигдэлнэ
    .replace(/\s+/g, " ")
    .replace(/^[-–\s]+|[-–.\s]+$/g, "")
    .trim();
  for (const re of REDUNDANT) t = t.replace(re, "");
  return t.charAt(0).toLocaleUpperCase("mn") + t.slice(1);
}

/** ЭЕШ-ийн бичлэгийн нэрийг бүлэг (он) дотроо ойлгомжтой болгоно: "А хувилбар (1–10)". */
function examTitle(raw) {
  const variant = (/([АAСCB])[\s-]*хувилбар/i.exec(raw)?.[1] ?? "А").toUpperCase().replace("A", "А").replace("C", "С");
  const range = /\(([^)]*)\)/.exec(raw)?.[1]?.replace(/\s*-\s*/g, "–").replace("–дуустал", "-аас төгсгөл хүртэл");
  const part = range ? ` (${range})` : "";
  if (/задгай/i.test(raw)) return `${variant} хувилбар — задгай даалгавар${part}`;
  return `${variant} хувилбар${part}`;
}

function classify(v) {
  const t = v.title;
  const series = /^(\d+)\.(\d+)/.exec(t);
  if (series && SERIES[series[1]] && !/^\d{4}/.test(t)) {
    const [topic, chapter] = SERIES[series[1]];
    return { topic, chapter, order: Number(series[2]), title: cleanTitle(t, { series: true }) };
  }
  if (ATOM.has(v.id)) return { topic: "Орчин үеийн физик", chapter: "Атом ба цөм", title: t };
  if (OPTICS.has(v.id)) return { topic: "Оптик", chapter: "Геометр оптик", title: cleanTitle(t) };
  if (HEAT_SCHOOL.has(v.id)) return { topic: "Дулаан ба молекул физик", chapter: "Дулааны үзэгдэл", title: cleanTitle(t) };
  if (MAGNET_EXTRA.has(v.id)) return { topic: "Соронзон орон", chapter: "Соронзон орон: нэмэлт хичээл", title: t };
  if (MATH_TOOLS.has(v.id)) return { topic: "Физикт хэрэглэгдэх математик", chapter: "Интеграл ба тооцооллын арга", title: cleanTitle(t) };
  if (OLYMPIAD.has(v.id)) return { topic: "Олимпиадын бодлого", chapter: "Олимпиад ба нэмэлт бодлого", title: cleanTitle(t) };
  if (TALKS.has(v.id)) return { topic: "Лекц ба ярилцлага", chapter: "Лекц ба ярилцлага", title: t };
  if (BLUEPRINT.has(v.id)) {
    const title = t === "blueprint-physics-exam-analysis-2022" ? "2022 оны физикийн ЭЕШ-ийн блюпринтийн шинжилгээ" : t;
    return { topic: "Физикийн ЭЕШ-ийн бодолт", chapter: "Блюпринтийн сорил", title };
  }
  if (/математик/i.test(t) && /эеш/i.test(t)) return { topic: "Математикийн ЭЕШ-ийн бодолт", chapter: "Математикийн ЭЕШ", title: t };
  const lecture = /^(\d{1,2})\.\s*(.+)$/.exec(t);
  if (lecture) {
    const n = Number(lecture[1]);
    const chapter = n <= 17 ? "Механик (1–17-р лекц)" : "Цахилгаан ба соронзон (18–26-р лекц)";
    return { topic: "Цахим хичээлийн цуврал", chapter, order: n, title: cleanTitle(lecture[2]) };
  }
  const year = /(20\d{2})/.exec(t);
  if (year && /эеш|хувилбар/i.test(t)) return { topic: "Физикийн ЭЕШ-ийн бодолт", chapter: `${year[1]} оны ЭЕШ`, year: Number(year[1]), title: examTitle(t) };
  return null;
}

const rows = [];
const unassigned = [];
chrono.forEach((v, i) => {
  const c = classify(v);
  if (!c) unassigned.push(v);
  else rows.push({ ...c, id: v.id, duration: v.duration, seq: i });
});

// Эрэмбэ: сэдэв → бүлэг (ЭЕШ шинээс хуучин руу, бусад нь анх гарсан дарааллаар) → хичээл
const chapterFirstSeen = new Map();
rows.forEach((r) => chapterFirstSeen.has(`${r.topic}|${r.chapter}`) || chapterFirstSeen.set(`${r.topic}|${r.chapter}`, r.seq));
const CHAPTER_PRIORITY = { "Дулааны үзэгдэл": -1, "Блюпринтийн сорил": -1 }; // сургуулийн түвшин эхэнд; блюпринт ЭЕШ-ийн эхэнд
rows.sort((a, b) => {
  const ta = TOPIC_ORDER.indexOf(a.topic) - TOPIC_ORDER.indexOf(b.topic);
  if (ta) return ta;
  if (a.chapter !== b.chapter) {
    const pa = CHAPTER_PRIORITY[a.chapter] ?? 0, pb = CHAPTER_PRIORITY[b.chapter] ?? 0;
    if (pa !== pb) return pa - pb;
    if (a.year && b.year) return b.year - a.year;
    return chapterFirstSeen.get(`${a.topic}|${a.chapter}`) - chapterFirstSeen.get(`${b.topic}|${b.chapter}`);
  }
  return (a.order ?? Infinity) - (b.order ?? Infinity) || a.seq - b.seq;
});

// Нэг бүлэгт ижил гарчиг давхцвал (импорт давхардал гэж алгасахаас сэргийлж) ялгана.
const seen = new Map();
for (const r of rows) {
  const key = `${r.topic}|${r.chapter}|${r.title.toLocaleLowerCase("mn")}`;
  const n = (seen.get(key) ?? 0) + 1;
  seen.set(key, n);
  if (n > 1) r.title = `${r.title} (${n})`;
}

// Бүлэг бүрт 1..n дараалал
const counters = new Map();
for (const r of rows) {
  const k = `${r.topic}|${r.chapter}`;
  counters.set(k, (counters.get(k) ?? 0) + 1);
  r.orderIndex = counters.get(k);
}

const esc = (v) => (/[",\r\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const header = ["topic_title", "chapter_title", "lesson_title", "description", "youtube_url", "duration_seconds", "order_index", "learning_objectives"];
const csv = [header.join(","), ...rows.map((r) => [r.topic, r.chapter, r.title, "", `https://www.youtube.com/watch?v=${r.id}`, r.duration ?? "", r.orderIndex, ""].map(esc).join(","))].join("\r\n");
writeFileSync(new URL("../../content/magsar-channel-lessons.csv", import.meta.url), "﻿" + csv + "\r\n");

console.log(`rows=${rows.length} unassigned=${unassigned.length}`);
unassigned.forEach((v) => console.log("  UNASSIGNED", v.id, v.title));
let last = "";
for (const r of rows) {
  const k = `${r.topic} › ${r.chapter}`;
  if (k !== last) console.log(`\n## ${k}`);
  last = k;
  console.log(`  ${String(r.orderIndex).padStart(2)}. ${r.title}`);
}
