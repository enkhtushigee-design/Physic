-- Magsar Physics — анхны схем (V1)
--
-- Бүтэц: topics → chapters → lessons (YouTube видео нь хичээлийн нэг талбар).
-- Ахиц: lesson_progress (одоогоор зөвхөн нэвтэрсэн хэрэглэгчид зориулж бэлтгэсэн;
-- V1-д нэвтрээгүй хэрэглэгчийн ахиц хөтөч дээр хадгалагдана).
--
-- Хожим нэмэх боломжтой хүснэгтүүд (quizzes, questions, simulations, notes,
-- bookmarks, achievements, subscriptions г.м.) lessons.id эсвэл chapters.id-г
-- гадаад түлхүүрээр холбоход хангалттай. Одоогийн хүснэгтүүдийг өөрчлөх шаардлагагүй.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Туслах функц: updated_at-ийг автоматаар шинэчилнэ
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Сэдэв (жишээ: Механик)
-- ---------------------------------------------------------------------------
create table public.topics (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(btrim(title)) between 1 and 200),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description   text,
  order_index   integer not null default 0,
  thumbnail_url text,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index topics_order_idx on public.topics (order_index);

-- ---------------------------------------------------------------------------
-- Бүлэг (жишээ: Кинематик)
-- ---------------------------------------------------------------------------
create table public.chapters (
  id           uuid primary key default gen_random_uuid(),
  topic_id     uuid not null references public.topics (id) on delete cascade,
  title        text not null check (char_length(btrim(title)) between 1 and 200),
  slug         text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description  text,
  order_index  integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (topic_id, slug)
);

create index chapters_topic_order_idx on public.chapters (topic_id, order_index);

-- ---------------------------------------------------------------------------
-- Хичээл (нэг YouTube видеотой)
-- youtube_video_id-д зөвхөн 11 тэмдэгтэй ID хадгална, бүтэн URL хадгалахгүй.
-- ---------------------------------------------------------------------------
create table public.lessons (
  id                  uuid primary key default gen_random_uuid(),
  chapter_id          uuid not null references public.chapters (id) on delete cascade,
  title               text not null check (char_length(btrim(title)) between 1 and 200),
  slug                text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description         text,
  youtube_video_id    text check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  duration_seconds    integer check (duration_seconds is null or duration_seconds >= 0),
  order_index         integer not null default 0,
  learning_objectives text[] not null default '{}',
  is_published        boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (chapter_id, slug)
);

create index lessons_chapter_order_idx on public.lessons (chapter_id, order_index);
create index lessons_youtube_video_idx on public.lessons (youtube_video_id);

-- ---------------------------------------------------------------------------
-- Хичээлийн ахиц
-- user_id — Supabase Auth хэрэглэгч; anonymous_id — ирээдүйд нэвтрээгүй
-- хэрэглэгчийн хөтөч дээрх ахицыг бүртгэлтэй нь нэгтгэхэд зориулсан.
-- ---------------------------------------------------------------------------
create table public.lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete cascade,
  anonymous_id text,
  lesson_id    uuid not null references public.lessons (id) on delete cascade,
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint lesson_progress_owner_check check (user_id is not null or anonymous_id is not null),
  constraint lesson_progress_user_lesson_key unique (user_id, lesson_id),
  constraint lesson_progress_anon_lesson_key unique (anonymous_id, lesson_id)
);

create index lesson_progress_lesson_idx on public.lesson_progress (lesson_id);

-- ---------------------------------------------------------------------------
-- updated_at триггерүүд
-- ---------------------------------------------------------------------------
create trigger topics_set_updated_at before update on public.topics
  for each row execute function public.set_updated_at();
create trigger chapters_set_updated_at before update on public.chapters
  for each row execute function public.set_updated_at();
create trigger lessons_set_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();
create trigger lesson_progress_set_updated_at before update on public.lesson_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Агуулгыг хэн ч унших боломжтой (зөвхөн нийтлэгдсэнийг).
-- Бичих эрх зөвхөн service role-д (админ хэсэг серверээс ашиглана) байна —
-- anon болон authenticated хэрэглэгчид бичих бодлого байхгүй тул хаалттай.
-- ---------------------------------------------------------------------------
alter table public.topics enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Нийтлэгдсэн сэдвийг хэн ч үзнэ"
  on public.topics for select
  to anon, authenticated
  using (is_published);

create policy "Нийтлэгдсэн бүлгийг хэн ч үзнэ"
  on public.chapters for select
  to anon, authenticated
  using (
    is_published
    and exists (select 1 from public.topics t where t.id = topic_id and t.is_published)
  );

create policy "Нийтлэгдсэн хичээлийг хэн ч үзнэ"
  on public.lessons for select
  to anon, authenticated
  using (
    is_published
    and exists (
      select 1
      from public.chapters c
      join public.topics t on t.id = c.topic_id
      where c.id = chapter_id and c.is_published and t.is_published
    )
  );

create policy "Хэрэглэгч өөрийн ахицыг үзнэ"
  on public.lesson_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Хэрэглэгч өөрийн ахицыг нэмнэ"
  on public.lesson_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Хэрэглэгч өөрийн ахицыг шинэчилнэ"
  on public.lesson_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Хэрэглэгч өөрийн ахицыг устгана"
  on public.lesson_progress for delete
  to authenticated
  using ((select auth.uid()) = user_id);
