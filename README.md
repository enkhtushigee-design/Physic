# Magsar Physics

Magsar Physics YouTube сувгийн физикийн хичээлүүдийг **Сэдэв → Бүлэг → Хичээл → YouTube видео** дарааллаар эмхэлсэн суралцах платформ (V1).

- Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (PostgreSQL + RLS)
- Сайтын бүх текст монгол хэл дээр: `src/lib/i18n/mn.ts`, `src/lib/i18n/mn-admin.ts`
- Явц (дуусгасан хичээл) V1-д хөтөч дээр (localStorage) хадгалагдана; схем нь Supabase Auth-тай холбогдоход бэлэн.

## Агуулга

`content/magsar-channel-lessons.csv` — сувгийн **262 бичлэгийг** (2026-09-28-нд YouTube-ээс уншсан) 13 сэдэв, 32 бүлэгт хуваасан импортын файл. Бичлэгийн ID, үргэлжлэх хугацаа нь жинхэнэ; тайлбар, зорилго зохиогоогүй (хоосон).

Сувагт шинэ бичлэг нэмэгдсэний дараа:

```bash
npm run youtube:fetch   # content/youtube-channel.json-г шинэчилнэ (зөвхөн метадата)
npm run youtube:csv     # content/magsar-channel-lessons.csv-г дахин үүсгэнэ
```

Дараа нь `/admin/import` дээр CSV-г оруулна — аль хэдийн байгаа хичээлүүд автоматаар алгасагдана. Шинэ цуврал/бүлгийн хуваарилалтыг `scripts/youtube/build-csv.mjs` доторх дүрмээр засна.

## Локал орчинд ажиллуулах

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD, ADMIN_SESSION_SECRET-ийг бөглөнө
npm run dev                  # http://localhost:3000
```

Supabase тохируулаагүй үед агуулга `.data/content.json` файлд хадгалагдана (зөвхөн хөгжүүлэлтэд).
`npm run dev` нь webpack ашиглана — энэ компьютер дээр Turbopack dev сервер server action илгээхэд унаж байсан (`npm run dev:turbo`).

Шалгалтууд: `npm run typecheck`, `npm run lint`, `npm test`, `npm run db:verify` (migration + RLS-ийг PostgreSQL дээр шалгана), `npm run build`.

## Supabase холбох

1. [supabase.com](https://supabase.com) дээр шинэ төсөл үүсгэнэ.
2. **SQL Editor** → `supabase/migrations/20260927000000_init.sql`-ийн агуулгыг бүтнээр нь ажиллуулна.
3. **Project Settings → API** хэсгээс `.env.local` (болон Vercel) руу:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon / publishable)
   - `SUPABASE_SERVICE_ROLE_KEY` (service role / secret — **зөвхөн серверт**)
4. `/admin` → нэвтрэх → **CSV файлаас оруулах** → `content/magsar-channel-lessons.csv` → Шалгах → Оруулах.

Аюулгүй байдал: RLS идэвхтэй — нийтэд зөвхөн нийтлэгдсэн агуулга уншигдана, бичих эрх зөвхөн service role-д. Админ хэсэг `proxy.ts` болон server action бүр дэх `requireAdmin()`-аар хамгаалагдсан.

## Vercel-д байршуулах

1. Төслийг GitHub руу push хийгээд Vercel дээр import хийнэ (Framework: Next.js).
2. Environment Variables: `.env.example`-д байгаа бүх хувьсагч (`NEXT_PUBLIC_SITE_URL`-д production домэйн).
3. Deploy → `/admin`-аар CSV-г оруулна.

## Бүтэц

```
src/app/(site)/          нийтийн хуудсууд: /, /physics, /learning-path, /search, /[topic]/[chapter]/[lesson]
src/app/admin/           агуулгын удирдлага (CRUD, дараалал, зөөх, CSV импорт)
src/lib/content/         каталог, хайлт
src/lib/data/            repository (Supabase / локал файл)
src/lib/admin/           бизнес логик, баталгаажуулалт, CSV
src/lib/progress/        явцын store (V2-д Supabase-ээр солиход бэлэн)
supabase/migrations/     SQL схем + RLS
content/, scripts/youtube/  сувгийн өгөгдөл ба импортын скрипт
```

## V2-т үлдсэн

Хэрэглэгчийн бүртгэл (Supabase Auth) ба явцыг `lesson_progress` руу синк хийх, хичээлийн тайлбар/зорилгыг бөглөх, тест ба бодлого, интерактив симуляц, AI багш.
