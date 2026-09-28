"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveChapterAction, saveLessonAction, saveTopicAction, type FormState } from "@/app/admin/actions";
import { buttonClass } from "@/components/ui/button";
import type { ChapterRow, LessonRow, TopicRow } from "@/lib/content/types";
import { formatClock } from "@/lib/duration";
import { mnAdmin } from "@/lib/i18n/mn-admin";
import { parseYouTubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";
import { Checkbox, Field, FormAlert, Select, TextArea, TextInput } from "./fields";
import { SubmitButton } from "./submit-button";

const F = mnAdmin.fields;
const initial: FormState = { status: "idle" };

function FormShell({
  state,
  action,
  children,
}: {
  state: FormState;
  action: (form: FormData) => void;
  children: React.ReactNode;
}) {
  return (
    <form action={action} className="space-y-6" noValidate>
      <FormAlert message={state.status === "error" ? state.message : undefined} />
      {children}
      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <SubmitButton pendingLabel={mnAdmin.actions.saving}>{mnAdmin.actions.save}</SubmitButton>
        <Link href="/admin" className={buttonClass({ variant: "ghost" })}>
          {mnAdmin.actions.cancel}
        </Link>
      </div>
    </form>
  );
}

function CommonFields({
  state,
  values,
  position,
  maxPosition,
}: {
  state: FormState;
  values?: { title: string; slug: string; description: string | null; is_published: boolean };
  position?: number;
  maxPosition: number;
}) {
  const errors = state.fieldErrors ?? {};
  return (
    <>
      <Field id="title" label={F.title} error={errors.title}>
        <TextInput id="title" defaultValue={values?.title} error={errors.title} required maxLength={200} />
      </Field>
      <Field id="description" label={F.description} error={errors.description}>
        <TextArea id="description" defaultValue={values?.description ?? ""} error={errors.description} rows={4} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-[1fr_10rem]">
        <Field id="slug" label={F.slug} hint={F.slugHint} error={errors.slug}>
          <TextInput
            id="slug"
            defaultValue={values?.slug}
            error={errors.slug}
            hasHint
            spellCheck={false}
            autoCapitalize="off"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className="font-mono text-sm"
          />
        </Field>
        <Field id="position" label={F.position} hint={F.positionHint(maxPosition)} error={errors.position}>
          <TextInput
            id="position"
            type="number"
            inputMode="numeric"
            min={1}
            max={maxPosition}
            defaultValue={position}
            error={errors.position}
            hasHint
          />
        </Field>
      </div>
      <Checkbox id="is_published" label={F.published} hint={F.publishedHint} defaultChecked={values?.is_published ?? true} />
    </>
  );
}

// ---------------------------------------------------------------------------

export function TopicForm({ topic, position, maxPosition }: { topic?: TopicRow; position?: number; maxPosition: number }) {
  const [state, action] = useActionState(saveTopicAction.bind(null, topic?.id ?? null), initial);
  const errors = state.fieldErrors ?? {};
  return (
    <FormShell state={state} action={action}>
      <CommonFields state={state} values={topic} position={position} maxPosition={maxPosition} />
      <Field id="thumbnail_url" label={F.thumbnailUrl} hint={F.thumbnailHint} error={errors.thumbnail_url}>
        <TextInput id="thumbnail_url" type="url" defaultValue={topic?.thumbnail_url ?? ""} error={errors.thumbnail_url} hasHint />
      </Field>
    </FormShell>
  );
}

export function ChapterForm({
  chapter,
  topics,
  defaultTopicId,
  position,
  maxPosition,
}: {
  chapter?: ChapterRow;
  topics: { id: string; title: string }[];
  defaultTopicId?: string;
  position?: number;
  maxPosition: number;
}) {
  const [state, action] = useActionState(saveChapterAction.bind(null, chapter?.id ?? null), initial);
  const errors = state.fieldErrors ?? {};
  return (
    <FormShell state={state} action={action}>
      <Field id="topic_id" label={F.topic} error={errors.topic_id}>
        <Select id="topic_id" defaultValue={chapter?.topic_id ?? defaultTopicId} error={errors.topic_id} required>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </Select>
      </Field>
      <CommonFields state={state} values={chapter} position={position} maxPosition={maxPosition} />
    </FormShell>
  );
}

export function LessonForm({
  lesson,
  chapterGroups,
  defaultChapterId,
  position,
  maxPosition,
}: {
  lesson?: LessonRow;
  chapterGroups: { topic: string; chapters: { id: string; title: string }[] }[];
  defaultChapterId?: string;
  position?: number;
  maxPosition: number;
}) {
  const [state, action] = useActionState(saveLessonAction.bind(null, lesson?.id ?? null), initial);
  const errors = state.fieldErrors ?? {};
  const [youtube, setYoutube] = useState(lesson?.youtube_video_id ? `https://www.youtube.com/watch?v=${lesson.youtube_video_id}` : "");
  const detected = youtube.trim() ? parseYouTubeVideoId(youtube) : null;
  const liveError = youtube.trim() && !detected ? mnAdmin.errors.invalidYoutube : undefined;

  return (
    <FormShell state={state} action={action}>
      <Field id="chapter_id" label={F.chapter} error={errors.chapter_id}>
        <Select id="chapter_id" defaultValue={lesson?.chapter_id ?? defaultChapterId} error={errors.chapter_id} required>
          {chapterGroups.map((group) => (
            <optgroup key={group.topic} label={group.topic}>
              {group.chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      <CommonFields state={state} values={lesson} position={position} maxPosition={maxPosition} />

      <div className="grid gap-6 sm:grid-cols-[1fr_10rem]">
        <Field id="youtube" label={F.youtube} hint={F.youtubeHint} error={liveError ?? errors.youtube}>
          <TextInput
            id="youtube"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            error={liveError ?? errors.youtube}
            hasHint
            spellCheck={false}
            autoCapitalize="off"
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </Field>
        <Field id="duration" label={F.duration} hint={F.durationHint} error={errors.duration}>
          <TextInput
            id="duration"
            defaultValue={formatClock(lesson?.duration_seconds ?? null)}
            error={errors.duration}
            hasHint
            placeholder="12:34"
            inputMode="numeric"
          />
        </Field>
      </div>

      {detected && (
        <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-2 p-3" aria-live="polite">
          {/* eslint-disable-next-line @next/next/no-img-element -- жижиг урьдчилсан зураг */}
          <img src={youtubeThumbnailUrl(detected)} alt="" width={120} height={90} className="rounded-lg" />
          <p className="font-mono text-sm text-ink-2">{F.youtubeDetected(detected)}</p>
        </div>
      )}

      <Field id="learning_objectives" label={F.objectives} hint={F.objectivesHint} error={errors.learning_objectives}>
        <TextArea
          id="learning_objectives"
          defaultValue={lesson?.learning_objectives.join("\n") ?? ""}
          error={errors.learning_objectives}
          hasHint
          rows={4}
        />
      </Field>
    </FormShell>
  );
}
