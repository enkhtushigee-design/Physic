import Link from "next/link";
import { AdminPageHeader, StatusBadge } from "@/components/admin/admin-page-header";
import { FormAlert } from "@/components/admin/fields";
import { MoveButtons } from "@/components/admin/move-buttons";
import { buttonClass } from "@/components/ui/button";
import { ExternalIcon, PlusIcon } from "@/components/ui/icons";
import { loadAdminData } from "@/lib/admin/load";
import { mn } from "@/lib/i18n/mn";
import { mnAdmin } from "@/lib/i18n/mn-admin";

const D = mnAdmin.dashboard;

const FLASH: Record<string, { text: string; tone: "success" | "error" }> = {
  saved: { text: mnAdmin.flash.saved, tone: "success" },
  created: { text: mnAdmin.flash.created, tone: "success" },
  deleted: { text: mnAdmin.flash.deleted, tone: "success" },
  error: { text: mnAdmin.errors.generic, tone: "error" },
};

const smallLink = "rounded-md px-2 py-1 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink";

export default async function AdminDashboard({ searchParams }: PageProps<"/admin">) {
  const flashKey = (await searchParams).flash;
  const flash = typeof flashKey === "string" ? FLASH[flashKey] : undefined;
  const data = await loadAdminData();

  if (!data.ok) {
    return (
      <>
        <AdminPageHeader title={D.heading} back={false} />
        <FormAlert message={data.reason === "not_configured" ? mnAdmin.errors.notConfigured : mn.states.loadFailed} />
      </>
    );
  }

  const { topics } = data.catalog;

  return (
    <>
      <AdminPageHeader
        title={D.heading}
        intro={D.intro}
        back={false}
        actions={
          <Link href="/admin/topics/new" className={buttonClass()}>
            <PlusIcon size={18} />
            {D.addTopic}
          </Link>
        }
      />

      {flash && (
        <div className="mb-6">
          <FormAlert message={flash.text} tone={flash.tone} />
        </div>
      )}

      <p className="mb-6 text-xs text-ink-3">
        {mnAdmin.dataSource.label}: {mnAdmin.dataSource[data.source]}
      </p>

      {topics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center">
          <p className="text-ink-2">{D.empty}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/admin/topics/new" className={buttonClass()}>
              {D.addTopic}
            </Link>
            <Link href="/admin/import" className={buttonClass({ variant: "secondary" })}>
              {mnAdmin.nav.import}
            </Link>
          </div>
        </div>
      ) : (
        <ol className="space-y-6">
          {topics.map((topic, ti) => (
            <li key={topic.id} id={`topic-${topic.id}`} className="scroll-mt-6 rounded-2xl border border-line bg-surface">
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
                <MoveButtons table="topics" id={topic.id} title={topic.title} isFirst={ti === 0} isLast={ti === topics.length - 1} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-semibold text-ink">
                      {topic.number}. {topic.title}
                    </span>
                    <StatusBadge published={topic.is_published} />
                  </p>
                  <p className="font-mono text-xs text-ink-3">{topic.href}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Link href={`/admin/topics/${topic.id}`} className={smallLink}>
                    {D.edit}
                  </Link>
                  <Link href={`/admin/chapters/new?topic=${topic.id}`} className={smallLink}>
                    + {D.addChapter}
                  </Link>
                  {topic.is_published && (
                    <Link href={topic.href} target="_blank" className={smallLink} aria-label={`${D.open}: ${topic.title}`}>
                      <ExternalIcon size={14} />
                    </Link>
                  )}
                </div>
              </div>

              {topic.chapters.length === 0 ? (
                <p className="px-5 py-4 text-sm text-ink-3">{D.noChapters}</p>
              ) : (
                <ol className="divide-y divide-line">
                  {topic.chapters.map((chapter, ci) => (
                    <li key={chapter.id} id={`chapter-${chapter.id}`} className="scroll-mt-6 px-4 py-3 sm:px-5">
                      <div className="flex flex-wrap items-center gap-3">
                          <MoveButtons
                            table="chapters"
                            id={chapter.id}
                            title={chapter.title}
                            isFirst={ci === 0}
                            isLast={ci === topic.chapters.length - 1}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2 font-medium text-ink">
                              {topic.number}.{chapter.number}. {chapter.title}
                              <StatusBadge published={chapter.is_published} />
                              <span className="text-xs font-normal text-ink-3">{mn.counts.lessons(chapter.lessons.length)}</span>
                            </span>
                          </span>
                          <span className="flex flex-wrap items-center gap-1">
                            <Link href={`/admin/chapters/${chapter.id}`} className={smallLink}>
                              {D.edit}
                            </Link>
                            <Link href={`/admin/lessons/new?chapter=${chapter.id}`} className={smallLink}>
                              + {D.addLesson}
                            </Link>
                          </span>
                      </div>

                        {chapter.lessons.length === 0 ? (
                          <p className="mt-2 pl-[4.75rem] text-sm text-ink-3">{D.noLessons}</p>
                        ) : (
                          <ol className="mt-2 space-y-0.5 sm:pl-10">
                            {chapter.lessons.map((lesson, li) => (
                              <li
                                key={lesson.id}
                                id={`lesson-${lesson.id}`}
                                className="flex scroll-mt-6 flex-wrap items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2"
                              >
                                <MoveButtons
                                  table="lessons"
                                  id={lesson.id}
                                  title={lesson.title}
                                  isFirst={li === 0}
                                  isLast={li === chapter.lessons.length - 1}
                                />
                                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm text-ink">
                                  <span className="tabular-nums text-ink-3">{lesson.number}.</span>
                                  {lesson.title}
                                  <StatusBadge published={lesson.is_published} noVideo={!lesson.youtube_video_id} />
                                </span>
                                <Link href={`/admin/lessons/${lesson.id}`} className={smallLink}>
                                  {D.edit}
                                </Link>
                              </li>
                            ))}
                          </ol>
                        )}
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
