// Дарааллын туслах функцууд. Ижил түвшний мөрүүдийн order_index-ийг
// үргэлж 1, 2, 3, … гэж цэвэр дугаарлан хадгална.

type Orderable = { id: string; order_index: number; created_at: string; title: string };

export type OrderUpdate = { id: string; order_index: number };

function sorted<T extends Orderable>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) => a.order_index - b.order_index || a.created_at.localeCompare(b.created_at) || a.title.localeCompare(b.title, "mn"),
  );
}

/** Дараалсан id жагсаалтаас зөвхөн өөрчлөгдөх order_index-үүдийг буцаана. */
export function renumber(orderedIds: readonly string[], current: ReadonlyMap<string, number>): OrderUpdate[] {
  return orderedIds
    .map((id, index) => ({ id, order_index: index + 1 }))
    .filter((u) => current.get(u.id) !== u.order_index);
}

/**
 * `id`-тай мөрийг ижил түвшинд `position` (1-ээс эхэлсэн) байрлалд тавина.
 * `id` нь siblings-д байхгүй бол (шинэ эсвэл өөр эцгээс шилжиж ирсэн) шинээр оруулна.
 * position хоосон бол хамгийн сүүлд тавина.
 */
export function placeAt<T extends Orderable>(siblings: readonly T[], id: string, position?: number | null): OrderUpdate[] {
  const ids = sorted(siblings)
    .map((s) => s.id)
    .filter((sid) => sid !== id);
  const target = position == null ? ids.length : Math.min(Math.max(position - 1, 0), ids.length);
  ids.splice(target, 0, id);
  return renumber(ids, new Map(siblings.map((s) => [s.id, s.order_index])));
}

/** Мөрийг нэг байрлал дээш (-1) эсвэл доош (+1) зөөнө. */
export function shift<T extends Orderable>(siblings: readonly T[], id: string, direction: -1 | 1): OrderUpdate[] {
  const ids = sorted(siblings).map((s) => s.id);
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= ids.length) return renumber(ids, new Map(siblings.map((s) => [s.id, s.order_index])));
  [ids[from], ids[to]] = [ids[to], ids[from]];
  return renumber(ids, new Map(siblings.map((s) => [s.id, s.order_index])));
}

/** Нэг мөрийг хассаны дараа үлдсэнийг дахин дугаарлана. */
export function closeGap<T extends Orderable>(siblings: readonly T[], removedId: string): OrderUpdate[] {
  const ids = sorted(siblings)
    .map((s) => s.id)
    .filter((sid) => sid !== removedId);
  return renumber(ids, new Map(siblings.map((s) => [s.id, s.order_index])));
}

/** Тухайн мөрийн одоогийн байрлал (1-ээс эхэлсэн). */
export function positionOf<T extends Orderable>(siblings: readonly T[], id: string): number {
  return sorted(siblings).findIndex((s) => s.id === id) + 1;
}
