import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getActiveErrors } from '@/utils/stats';
import ScreenHeader from '@/components/ScreenHeader';

export default function ErrorReviewScreen() {
  const category = useAppStore((s) => s.category);
  const history = useAppStore((s) => s.history);
  const startErrorsReview = useAppStore((s) => s.startErrorsReview);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const errors = getActiveErrors(history, category);

  return (
    <div className="min-h-[100dvh] pb-8">
      <ScreenHeader title="Мои ошибки" subtitle={`${errors.length} вопросов требуют повтора`} />

      {errors.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
          <p className="font-display text-lg uppercase tracking-wide text-ink-muted">Пусто</p>
          <p className="text-sm text-ink-muted">
            Здесь появятся вопросы, на которые вы ответили неверно. Как только ответите правильно — вопрос уйдёт из списка.
          </p>
        </div>
      ) : (
        <>
          <div className="px-5 pt-4">
            <button
              onClick={startErrorsReview}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-bg"
            >
              <RotateCcw size={16} />
              Повторить все ({errors.length})
            </button>
          </div>

          <div className="space-y-2.5 px-5 py-5">
            {errors.map((q) => {
              const open = openKey === q.key;
              return (
                <div key={q.key} className="overflow-hidden rounded-2xl border border-white/8 bg-surface">
                  <button
                    onClick={() => setOpenKey(open ? null : q.key)}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="flex-1 text-sm leading-snug text-ink">{q.question}</span>
                    <ChevronDown
                      size={18}
                      className={`mt-0.5 shrink-0 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <div className="border-t border-white/5 px-4 py-3.5">
                      <p className="mb-2 text-xs font-medium text-good">Верно: {q.answers[q.correctIndex]}</p>
                      <p className="text-xs leading-relaxed text-ink-muted">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
