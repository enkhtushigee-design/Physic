import type { Metadata } from "next";
import { PageIntro } from "@/components/content/page-intro";
import { TopicCard } from "@/components/content/topic-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getCatalog } from "@/lib/content/catalog";
import { mn } from "@/lib/i18n/mn";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: mn.topicsPage.heading,
  description: mn.topicsPage.intro,
  alternates: { canonical: "/physics" },
};

export default async function TopicsPage() {
  const { topics } = await getCatalog();
  return (
    <>
      <PageIntro
        crumbs={[{ label: mn.nav.home, href: "/" }, { label: mn.topicsPage.title }]}
        title={mn.topicsPage.heading}
        description={mn.topicsPage.intro}
      />
      <Container className="mt-10">
        {topics.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        ) : (
          <EmptyState title={mn.home.emptyTitle}>{mn.home.emptyText}</EmptyState>
        )}
      </Container>
    </>
  );
}
