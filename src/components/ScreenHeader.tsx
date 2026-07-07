import { ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export default function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  const pop = useAppStore((s) => s.pop);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/5 bg-bg/90 px-4 py-3 backdrop-blur">
      <button
        onClick={() => (onBack ? onBack() : pop())}
        aria-label="Назад"
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink active:bg-surface2"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-medium uppercase tracking-wide">{title}</h1>
        {subtitle && <p className="truncate text-xs text-ink-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
