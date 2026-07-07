interface GaugeProgressProps {
  current: number;
  total: number;
  label?: string;
  danger?: boolean;
  size?: number;
}

export default function GaugeProgress({ current, total, label, danger, size = 88 }: GaugeProgressProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.min(current / total, 1) : 0;
  const offset = circumference * (1 - ratio);
  const ticks = Array.from({ length: 24 });

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90" width={size} height={size}>
        {ticks.map((_, i) => {
          const angle = (i / ticks.length) * 360;
          const major = i % 6 === 0;
          return (
            <line
              key={i}
              x1={50 + 46 * Math.cos((angle * Math.PI) / 180)}
              y1={50 + 46 * Math.sin((angle * Math.PI) / 180)}
              x2={50 + (major ? 42 : 44) * Math.cos((angle * Math.PI) / 180)}
              y2={50 + (major ? 42 : 44) * Math.sin((angle * Math.PI) / 180)}
              stroke="currentColor"
              strokeWidth={major ? 1 : 0.5}
              className="text-ink-faint"
            />
          );
        })}
        <circle cx="50" cy="50" r={radius} strokeWidth="7" fill="none" className="stroke-surface3" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={danger ? 'stroke-bad transition-[stroke-dashoffset] duration-300' : 'stroke-accent transition-[stroke-dashoffset] duration-300'}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono tabular text-lg font-bold leading-none">
          {current}
          <span className="text-ink-muted">/{total}</span>
        </span>
        {label && <span className="mt-1 text-[10px] uppercase tracking-wide text-ink-muted">{label}</span>}
      </div>
    </div>
  );
}
