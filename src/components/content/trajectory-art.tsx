// Нүүр хуудасны чимэглэл: шидэгдсэн биеийн траектори, хурдны вектор.
// Зөвхөн чимэглэлийн зориулалттай тул дэлгэц уншигчаас нуусан.
export function TrajectoryArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 320" className={className} aria-hidden="true" focusable="false">
      <defs>
        <marker id="arrow-accent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--accent)" />
        </marker>
        <marker id="arrow-ink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--ink-3)" />
        </marker>
      </defs>

      {/* тэнхлэгүүд */}
      <path d="M40 280H392" stroke="var(--line-strong)" strokeWidth="1.5" markerEnd="url(#arrow-ink)" />
      <path d="M40 280V36" stroke="var(--line-strong)" strokeWidth="1.5" markerEnd="url(#arrow-ink)" />
      <text x="396" y="298" fontSize="13" fill="var(--ink-3)" fontStyle="italic" textAnchor="end">x</text>
      <text x="24" y="44" fontSize="13" fill="var(--ink-3)" fontStyle="italic">y</text>

      {/* траектори */}
      <path d="M40 280 Q 200 -40 360 280" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5 7" strokeLinecap="round" />

      {/* байрлалууд */}
      {[
        [40, 280],
        [120, 160],
        [200, 120],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="var(--ink-3)" opacity="0.5" />
      ))}

      {/* анхны хурд */}
      <path d="M40 280 L 104 152" stroke="var(--accent)" strokeWidth="2.2" markerEnd="url(#arrow-accent)" />
      <text x="58" y="196" fontSize="15" fill="var(--accent)" fontStyle="italic" fontFamily="var(--font-display)">
        v₀
      </text>

      {/* бие ба түүн дээрх хүч */}
      <path d="M280 172 L 280 228" stroke="var(--ink-2)" strokeWidth="2" markerEnd="url(#arrow-ink)" />
      <text x="256" y="220" fontSize="15" fill="var(--ink-2)" fontStyle="italic" fontFamily="var(--font-display)">
        mg
      </text>
      <path d="M288 168 L 330 210" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arrow-accent)" />
      <text x="336" y="200" fontSize="15" fill="var(--accent)" fontStyle="italic" fontFamily="var(--font-display)">
        v
      </text>
      <circle cx="280" cy="160" r="9" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />

      {/* оргил цэгийн өндөр */}
      <path d="M200 120 V 280" stroke="var(--line-strong)" strokeDasharray="3 5" />
      <text x="206" y="210" fontSize="13" fill="var(--ink-3)" fontStyle="italic">h</text>
    </svg>
  );
}
