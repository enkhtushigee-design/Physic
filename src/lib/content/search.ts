import type { Catalog } from "./types";

export type Segment = { text: string; match: boolean };

export type SearchResult = {
  kind: "topic" | "chapter" | "lesson";
  id: string;
  href: string;
  title: Segment[];
  snippet: Segment[] | null;
  /** Байршлын мөр: сэдэв / бүлэг */
  context: string[];
  score: number;
};

// ө→о, ү→у, ё→е гэж адилтгаснаар ө, ү үсэг бичих боломжгүй гартай хэрэглэгч
// ч хайж олох боломжтой. Солилт нь 1:1 тул тэмдэгтийн байрлал өөрчлөгдөхгүй.
const FOLD: Record<string, string> = { ө: "о", ү: "у", ё: "е" };

export function foldText(value: string): string {
  let out = "";
  for (const ch of value.toLocaleLowerCase("mn")) out += FOLD[ch] ?? ch;
  return out;
}

export function tokenize(query: string): string[] {
  return Array.from(new Set(foldText(query.normalize("NFC")).split(/[\s,.;:!?"“”'()«»]+/).filter((t) => t.length > 0)));
}

function highlight(text: string, tokens: string[]): Segment[] {
  const folded = foldText(text);
  const marks = new Array<boolean>(text.length).fill(false);
  for (const token of tokens) {
    let from = 0;
    for (;;) {
      const at = folded.indexOf(token, from);
      if (at === -1) break;
      for (let i = at; i < at + token.length; i++) marks[i] = true;
      from = at + token.length;
    }
  }
  const segments: Segment[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = segments.at(-1);
    if (last && last.match === marks[i]) last.text += text[i];
    else segments.push({ text: text[i], match: marks[i] });
  }
  return segments;
}

function snippetOf(text: string, tokens: string[], radius = 90): Segment[] {
  const folded = foldText(text);
  const first = Math.min(...tokens.map((t) => folded.indexOf(t)).filter((i) => i >= 0));
  if (!Number.isFinite(first) || text.length <= radius * 2) return highlight(text, tokens);
  const start = Math.max(0, first - radius / 2);
  const end = Math.min(text.length, start + radius * 2);
  const slice = text.slice(start, end).trim();
  const segments = highlight(slice, tokens);
  if (start > 0) segments.unshift({ text: "…", match: false });
  if (end < text.length) segments.push({ text: "…", match: false });
  return segments;
}

function scoreOf(title: string, description: string, tokens: string[]): number {
  const t = foldText(title);
  const d = foldText(description);
  let score = 0;
  for (const token of tokens) {
    const inTitle = t.includes(token);
    const inDescription = d.includes(token);
    if (!inTitle && !inDescription) return 0; // бүх үг заавал таарах ёстой
    if (inTitle) score += t.startsWith(token) || t.includes(` ${token}`) ? 12 : 8;
    if (inDescription) score += 2;
  }
  return score;
}

const KIND_WEIGHT = { topic: 3, chapter: 2, lesson: 0 } as const;

export function searchCatalog(catalog: Catalog, query: string, limit = 50): SearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const results: SearchResult[] = [];

  const consider = (
    kind: SearchResult["kind"],
    item: { id: string; title: string; description: string | null; href: string },
    context: string[],
  ) => {
    const description = item.description ?? "";
    const score = scoreOf(item.title, description, tokens);
    if (score === 0) return;
    const descriptionMatches = tokens.some((token) => foldText(description).includes(token));
    results.push({
      kind,
      id: item.id,
      href: item.href,
      title: highlight(item.title, tokens),
      snippet: description ? (descriptionMatches ? snippetOf(description, tokens) : snippetOf(description, [])) : null,
      context,
      score: score + KIND_WEIGHT[kind],
    });
  };

  for (const topic of catalog.topics) {
    consider("topic", topic, []);
    for (const chapter of topic.chapters) {
      consider("chapter", chapter, [topic.title]);
      for (const lesson of chapter.lessons) consider("lesson", lesson, [topic.title, chapter.title]);
    }
  }

  // Тэнцүү оноотой үед суралцах замын дарааллыг хадгална (sort нь тогтвортой).
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
