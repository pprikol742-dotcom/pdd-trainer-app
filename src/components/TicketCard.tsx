interface TicketCardProps {
  number: number;
  status: 'none' | 'passed' | 'failed';
  onClick: () => void;
}

export default function TicketCard({ number, status, onClick }: TicketCardProps) {
  const dot =
    status === 'passed' ? 'bg-good' : status === 'failed' ? 'bg-bad' : 'bg-ink-faint';

  return (
    <button
      onClick={onClick}
      className="relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-white/8 bg-surface transition-colors active:bg-surface2"
    >
      <span className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="font-display text-xl font-medium text-ink">{number}</span>
    </button>
  );
}
