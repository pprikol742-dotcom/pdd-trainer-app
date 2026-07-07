import type { Category } from '@/types';

export default function CategoryToggle({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/8 bg-surface p-1">
      {(['AB', 'CD'] as Category[]).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`rounded-full px-4 py-1.5 font-display text-sm font-medium tracking-wide transition-colors ${
            value === c ? 'bg-accent text-bg' : 'text-ink-muted'
          }`}
        >
          {c === 'AB' ? 'A, B' : 'C, D'}
        </button>
      ))}
    </div>
  );
}
