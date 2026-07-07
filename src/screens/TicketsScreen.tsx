import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import ScreenHeader from '@/components/ScreenHeader';
import TicketCard from '@/components/TicketCard';
import { TICKET_COUNT } from '@/data/pddQuestions';

type Mode = 'learning' | 'exam';

export default function TicketsScreen() {
  const category = useAppStore((s) => s.category);
  const sessionResults = useAppStore((s) => s.sessionResults);
  const startExam = useAppStore((s) => s.startExam);
  const startLearning = useAppStore((s) => s.startLearning);
  const [mode, setMode] = useState<Mode>('learning');

  const statusByTicket = useMemo(() => {
    const map = new Map<number, 'passed' | 'failed'>();
    for (const r of sessionResults) {
      if (r.category !== category || r.mode !== 'exam' || r.ticketNumber === null) continue;
      map.set(r.ticketNumber, r.passed ? 'passed' : 'failed');
    }
    return map;
  }, [sessionResults, category]);

  const tickets = Array.from({ length: TICKET_COUNT }, (_, i) => i + 1);

  return (
    <div className="min-h-[100dvh]">
      <ScreenHeader title="Билеты" subtitle={`Категория ${category === 'AB' ? 'A, B' : 'C, D'}`} />

      <div className="flex gap-2 px-5 pt-4">
        <button
          onClick={() => setMode('learning')}
          className={`flex-1 rounded-xl py-2.5 font-display text-sm font-medium uppercase tracking-wide transition-colors ${
            mode === 'learning' ? 'bg-accent text-bg' : 'bg-surface text-ink-muted'
          }`}
        >
          Учить
        </button>
        <button
          onClick={() => setMode('exam')}
          className={`flex-1 rounded-xl py-2.5 font-display text-sm font-medium uppercase tracking-wide transition-colors ${
            mode === 'exam' ? 'bg-accent text-bg' : 'bg-surface text-ink-muted'
          }`}
        >
          Экзамен
        </button>
      </div>
      <p className="px-5 pb-2 pt-3 text-xs text-ink-muted">
        {mode === 'learning'
          ? 'Ответ и разбор сразу после выбора, без ограничения по времени.'
          : 'Как на настоящем экзамене: 20 минут, не более 2 ошибок в разных блоках.'}
      </p>

      <div className="grid grid-cols-5 gap-2.5 px-5 py-4">
        {tickets.map((n) => (
          <TicketCard
            key={n}
            number={n}
            status={statusByTicket.get(n) ?? 'none'}
            onClick={() => (mode === 'exam' ? startExam(n) : startLearning(n))}
          />
        ))}
      </div>
    </div>
  );
}
