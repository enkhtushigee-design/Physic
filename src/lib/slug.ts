// Монгол кирилл гарчгийг URL-д тохирох латин slug болгоно.
// Жишээ: "Кинематик" → "kinematik", "Хөдөлгөөн" → "khodolgoon".

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "ye", ё: "yo", ж: "j", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch",
  ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "i", э: "e", ю: "yu", я: "ya",
};

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 80;

/** Сэдвийн slug нь сайтын үндсэн замтай давхцахгүй байх ёстой. */
export const RESERVED_TOPIC_SLUGS = new Set([
  "admin", "api", "physics", "search", "learning-path", "sitemap", "robots",
  "favicon", "_next", "static", "images", "login", "logout",
]);

const VOWELS_AND_SIGNS = new Set(Array.from("аэиоуөүыяёюеьъ"));

export function slugify(input: string): string {
  const chars = Array.from(input.normalize("NFC").toLowerCase());
  const latin = chars
    .map((ch, i) => {
      // "е" үгийн эхэнд эсвэл эгшгийн дараа "ye", гийгүүлэгчийн дараа "e" (Ерөнхий → yeronkhii, Механик → mekhanik).
      if (ch === "е") {
        const prev = chars[i - 1];
        return !prev || !/\p{L}/u.test(prev) || VOWELS_AND_SIGNS.has(prev) ? "ye" : "e";
      }
      // "ь" iotated эгшгийн өмнө дуудагдахгүй (Ньютон → nyuton), бусад үед "i" (морь → mori).
      if (ch === "ь" && "яюеё".includes(chars[i + 1] ?? "")) return "";
      return CYRILLIC_TO_LATIN[ch] ?? ch;
    })
    .join("")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

  return latin
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length <= MAX_SLUG_LENGTH;
}

/** Ижил түвшний бусад slug-тай давхцвал "-2", "-3" гэх мэтээр төгсгөнө. */
export function uniqueSlug(base: string, taken: Iterable<string>, fallback = "item"): string {
  const used = new Set(taken);
  const root = base || fallback;
  if (!used.has(root)) return root;
  for (let i = 2; ; i++) {
    const candidate = `${root}-${i}`;
    if (!used.has(candidate)) return candidate;
  }
}
