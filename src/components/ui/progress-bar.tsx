export function ProgressBar({
  value,
  label,
  size = "md",
}: {
  /** 0–100 */
  value: number;
  label: string;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={`w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line ${size === "sm" ? "h-1.5" : "h-2"}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${clamped === 100 ? "bg-success" : "bg-accent"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
