export default function TopicBar({
  topic,
  accuracy,
  total,
}: {
  topic: string;
  accuracy: number;
  total: number;
}) {
  const color = accuracy >= 80 ? 'bg-good' : accuracy >= 50 ? 'bg-accent' : 'bg-bad';
  return (
    <div className="py-2">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm text-ink">{topic}</span>
        <span className="shrink-0 font-mono tabular text-xs text-ink-muted">
          {accuracy}% · {total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface2">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${accuracy}%` }} />
      </div>
    </div>
  );
}
