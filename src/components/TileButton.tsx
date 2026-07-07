import type { LucideIcon } from 'lucide-react';

interface TileButtonProps {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  onClick: () => void;
  accent?: boolean;
  disabled?: boolean;
}

export default function TileButton({ icon: Icon, label, sublabel, onClick, accent, disabled }: TileButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border p-4 text-left shadow-card transition-transform active:scale-[0.98] ${
        accent ? 'border-accent/40 bg-gradient-to-br from-accent-soft to-surface' : 'border-white/8 bg-surface'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          accent ? 'bg-accent text-bg' : 'bg-surface2 text-accent'
        }`}
      >
        <Icon size={22} strokeWidth={2} />
      </span>
      <span>
        <span className="block font-display text-base font-medium uppercase tracking-wide text-ink">{label}</span>
        {sublabel && <span className="mt-0.5 block text-xs text-ink-muted">{sublabel}</span>}
      </span>
    </button>
  );
}
