import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getByKey } from '@/data/pddQuestions';
import ScreenHeader from '@/components/ScreenHeader';
import GaugeProgress from '@/components/GaugeProgress';
import AnswerOption from '@/components/AnswerOption';
import QuestionImage from '@/components/QuestionImage';
import { sessionModeLabel } from '@/utils/examEngine';

function formatTime(sec: number): string {
  const m = Math.max(0, Math.floor(sec / 60));
  const s = Math.max(0, sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function QuestionScreen() {
  const session = useAppStore((s) => s.session);
  const answerCurrent = useAppStore((s) => s.answerCurrent);
  const goNext = useAppStore((s) => s.goNext);
  const onTimeUp = useAppStore((s) => s.onTimeUp);

  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!session || session.mode !== 'exam') return;
    const id = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - session.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [session?.startedAt, session?.mode]);

  useEffect(() => {
    if (!session || session.mode !== 'exam' || session.finished || !session.timeLimitSec) return;
    if (elapsedSec >= session.timeLimitSec) onTimeUp();
  }, [elapsedSec, session, onTimeUp]);

  const item = session?.queue[session.currentIndex];
  const question = useMemo(() => (item ? getByKey(item.questionKey) : null), [item?.questionKey]);

  if (!session || !item || !question) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-ink-muted">
        Сессия не найдена
      </div>
    );
  }

  const isExam = session.mode === 'exam';
  const answered = item.selectedIndex !== null;
  const revealed = !isExam && answered;
  const remaining = session.timeLimitSec ? Math.max(0, session.timeLimitSec - elapsedSec) : null;
  const lowTime = remaining !== null && remaining <= 60;

  const title =
    session.mode === 'exam'
      ? `Билет ${session.ticketNumber} · Экзамен`
      : session.mode === 'topic'
        ? `Тема: ${session.topic}`
        : session.ticketNumber
          ? `Билет ${session.ticketNumber} · Обучение`
          : 'Работа над ошибками';

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ScreenHeader title={sessionModeLabel(session.mode)} subtitle={title} />

      <div className="flex items-center justify-between px-5 pt-4">
        <GaugeProgress current={session.currentIndex + 1} total={session.queue.length} label="вопрос" />
        {remaining !== null && (
          <div
            className={`rounded-xl border px-3 py-2 text-right ${
              lowTime ? 'border-bad/40 bg-bad-soft' : 'border-white/8 bg-surface'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wide text-ink-muted">Время</div>
            <div className={`font-mono tabular text-lg font-bold ${lowTime ? 'text-bad' : 'text-ink'}`}>
              {formatTime(remaining)}
            </div>
          </div>
        )}
        {item.isBonus && (
          <span className="rounded-full border border-accent/40 bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
            Доп. вопрос
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {question.image && <QuestionImage src={question.image} alt="Иллюстрация к вопросу" />}

        <p className="font-display text-xl font-medium leading-snug text-ink">{question.question}</p>

        <div className="space-y-2.5">
          {question.answers.map((text, idx) => (
            <AnswerOption
              key={idx}
              index={idx}
              text={text}
              selected={item.selectedIndex === idx}
              isCorrectAnswer={idx === question.correctIndex}
              revealed={revealed}
              disabled={answered}
              onSelect={() => answerCurrent(idx)}
            />
          ))}
        </div>

        {revealed && (
          <div className="rounded-2xl border border-white/8 bg-surface p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent">Пояснение</p>
            <p className="text-sm leading-relaxed text-ink-muted">{question.explanation}</p>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 bg-bg/95 px-5 py-4 backdrop-blur">
        <button
          onClick={goNext}
          disabled={!answered}
          className="w-full rounded-2xl bg-accent py-3.5 text-center font-display text-base font-semibold uppercase tracking-wide text-bg transition-opacity disabled:opacity-30"
        >
          Далее
        </button>
      </div>
    </div>
  );
}
