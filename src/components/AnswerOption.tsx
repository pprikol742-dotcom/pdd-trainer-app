import { Check, X } from 'lucide-react';

interface AnswerOptionProps {
  index: number;
  text: string;
  selected: boolean;
  isCorrectAnswer: boolean;
  revealed: boolean;
  disabled: boolean;
  onSelect: () => void;
}

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д'];

export default function AnswerOption({
  index,
  text,
  selected,
  isCorrectAnswer,
  revealed,
  disabled,
  onSelect,
}: AnswerOptionProps) {
  let borderClass = 'border-white/8';
  let bgClass = 'bg-surface';
  let badgeClass = 'bg-surface2 text-ink-muted';
  let icon: React.ReactNode = null;

  if (revealed && isCorrectAnswer) {
    borderClass = 'border-good/50';
    bgClass = 'bg-good-soft';
    badgeClass = 'bg-good text-bg';
    icon = <Check size={16} strokeWidth={3} />;
  } else if (revealed && selected && !isCorrectAnswer) {
    borderClass = 'border-bad/50';
    bgClass = 'bg-bad-soft';
    badgeClass = 'bg-bad text-bg';
    icon = <X size={16} strokeWidth={3} />;
  } else if (!revealed && selected) {
    borderClass = 'border-accent/60';
    bgClass = 'bg-accent-soft';
    badgeClass = 'bg-accent text-bg';
  }

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${borderClass} ${bgClass} ${
        disabled ? '' : 'active:opacity-80'
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeClass}`}
      >
        {icon ?? LETTERS[index]}
      </span>
      <span className="text-[15px] leading-snug text-ink">{text}</span>
    </button>
  );
}
