import { moveAction } from "@/app/admin/actions";
import { DownIcon, UpIcon } from "@/components/ui/icons";
import type { ContentTable } from "@/lib/content/types";
import { mnAdmin } from "@/lib/i18n/mn-admin";

const iconButton =
  "flex size-8 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-30";

export function MoveButtons({
  table,
  id,
  title,
  isFirst,
  isLast,
}: {
  table: ContentTable;
  id: string;
  title: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <form action={moveAction} className="flex">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        name="direction"
        value="up"
        disabled={isFirst}
        aria-label={`${mnAdmin.dashboard.moveUp}: ${title}`}
        title={mnAdmin.dashboard.moveUp}
        className={iconButton}
      >
        <UpIcon size={16} />
      </button>
      <button
        type="submit"
        name="direction"
        value="down"
        disabled={isLast}
        aria-label={`${mnAdmin.dashboard.moveDown}: ${title}`}
        title={mnAdmin.dashboard.moveDown}
        className={iconButton}
      >
        <DownIcon size={16} />
      </button>
    </form>
  );
}
