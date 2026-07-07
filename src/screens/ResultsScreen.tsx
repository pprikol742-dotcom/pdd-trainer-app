import { useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Home, GraduationCap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getByKey } from '@/data/pddQuestions';
import ScreenHeader from '@/components/ScreenHeader';
import { showInterstitial } from '@/utils/ads';

const FAIL_REASON_TEXT: Record<string, string> = {
  time: 'Закончилось время',
  mistakes: 'Превышен лимит ошибок (не более 2, и только в разных блоках)',
  'bonus-mistake': 'Ошибка в дополнительном вопросе',
};

export default function ResultsScreen() {
  const session = useAppStore((s) => s.session);
  const lastResult = useAppStore((s) => s.lastResult);
  const goHome = useAppStore((s) => s.goHome);
  const startExam = useAppStore((s) => s.startExam);
  const startLearning = useAppStore((s) => s.startLearning);
  const pop = useAppStore((s) => s.pop);

  useEffect(() => {
    if (lastResult?.mode === 'exam') showInterstitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session || !lastResult) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-ink-muted">Нет данных</div>
    );
  }

  const isExam = lastResult.mode === 'exam';
  const mistakes = session.queue.filter((q) => q.isCorrect === false);

  const retry = () => {
    pop();
    if (isExam && session.ticketNumber) startExam(session.ticketNumber);
    else if (session.ticketNumber) startLearning(session.ticketNumber);
  };

  return (
    <div className="min-h-[100dvh] pb-8">
      <ScreenHeader title="Результат" onBack={goHome} />

      <div className="px-5 pt-6">
        {isExam ? (
          <div
            className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center ${
              lastResult.passed ? 'border-good/40 bg-good-soft' : 'border-bad/40 bg-bad-soft'
            }`}
          >
            {lastResult.passed ? (
              <CheckCircle2 size={48} className="text-good" strokeWidth={1.5} />
            ) : (
              <XCircle size={48} className="text-bad" strokeWidth={1.5} />
            )}
            <h2 className={`font-display text-2xl font-bold uppercase tracking-wide ${lastResult.passed ? 'text-good' : 'text-bad'}`}>
              {lastResult.passed ? 'Сдал' : 'Не сдал'}
            </h2>
            {!lastResult.passed && lastResult.failReason && (
              <p className="text-sm text-ink-muted">{FAIL_REASON_TEXT[lastResult.failReason]}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-surface p-6 text-center">
            <GraduationCap size={40} className="text-accent" strokeWidth={1.5} />
            <h2 className="font-display text-xl font-medium uppercase tracking-wide">Готово</h2>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-white/8 bg-surface p-3 text-center">
            <div className="font-mono tabular text-xl font-bold text-ink">
              {lastResult.correct}/{lastResult.total}
            </div>
            <div className="text-[11px] text-ink-muted">правильно</div>
          </div>
          <div className="rounded-xl border border-white/8 bg-surface p-3 text-center">
            <div className="font-mono tabular text-xl font-bold text-ink">
              {lastResult.total ? Math.round((lastResult.correct / lastResult.total) * 100) : 0}%
            </div>
            <div className="text-[11px] text-ink-muted">точность</div>
          </div>
          <div className="rounded-xl border border-white/8 bg-surface p-3 text-center">
            <div className="font-mono tabular text-xl font-bold text-ink">
              {Math.floor(lastResult.durationSec / 60)}:{(lastResult.durationSec % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-[11px] text-ink-muted">время</div>
          </div>
        </div>

        {mistakes.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-display text-sm font-medium uppercase tracking-wide text-ink-muted">
              Разбор ошибок ({mistakes.length})
            </h3>
            <div className="space-y-3">
              {mistakes.map((m) => {
                const q = getByKey(m.questionKey);
                if (!q) return null;
                return (
                  <div key={m.questionKey} className="rounded-2xl border border-bad/25 bg-surface p-4">
                    <p className="mb-2 text-sm leading-snug text-ink">{q.question}</p>
                    <p className="mb-1 text-xs text-bad">
                      Ваш ответ: {m.selectedIndex !== null ? q.answers[m.selectedIndex] : '—'}
                    </p>
                    <p className="mb-2 text-xs text-good">Верно: {q.answers[q.correctIndex]}</p>
                    <p className="text-xs leading-relaxed text-ink-muted">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-7 space-y-2.5">
          {session.ticketNumber && (
            <button
              onClick={retry}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-bg"
            >
              <RotateCcw size={16} />
              Пройти ещё раз
            </button>
          )}
          <button
            onClick={goHome}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface py-3.5 font-display text-sm font-medium uppercase tracking-wide text-ink"
          >
            <Home size={16} />
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}
