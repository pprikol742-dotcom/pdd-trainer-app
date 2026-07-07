import { BookOpen, Timer, RotateCcw, BarChart3, Shuffle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import TileButton from '@/components/TileButton';
import CategoryToggle from '@/components/CategoryToggle';
import { getOverallStats } from '@/utils/stats';
import { getActiveErrors } from '@/utils/stats';
import { TICKET_COUNT } from '@/data/pddQuestions';

export default function HomeScreen() {
  const category = useAppStore((s) => s.category);
  const setCategory = useAppStore((s) => s.setCategory);
  const push = useAppStore((s) => s.push);
  const history = useAppStore((s) => s.history);
  const startExam = useAppStore((s) => s.startExam);
  const startRandomPractice = useAppStore((s) => s.startRandomPractice);

  const stats = getOverallStats(history, category);
  const errorsCount = getActiveErrors(history, category).length;

  return (
    <div className="min-h-[100dvh] bg-dash-noise">
      <div className="px-5 pb-8 pt-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-muted">Тренажёр</p>
            <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-ink">
              ПДД
            </h1>
          </div>
          <CategoryToggle value={category} onChange={setCategory} />
        </div>

        {stats.totalAnswered > 0 && (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/8 bg-surface px-4 py-3">
            <div className="flex-1">
              <div className="mb-1.5 flex items-baseline justify-between text-xs text-ink-muted">
                <span>Правильных ответов</span>
                <span className="font-mono tabular">{stats.accuracy}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface2">
                <div className="h-full rounded-full bg-accent" style={{ width: `${stats.accuracy}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lane-divider" />

      <div className="grid grid-cols-2 gap-3 px-5 py-6">
        <TileButton
          icon={BookOpen}
          label="Билеты"
          sublabel={`${TICKET_COUNT} билетов`}
          onClick={() => push('tickets')}
        />
        <TileButton
          icon={Timer}
          label="Экзамен"
          sublabel="Случайный билет"
          accent
          onClick={() => startExam(Math.ceil(Math.random() * TICKET_COUNT))}
        />
        <TileButton
          icon={RotateCcw}
          label="Мои ошибки"
          sublabel={errorsCount > 0 ? `${errorsCount} вопросов` : 'Пока пусто'}
          disabled={errorsCount === 0}
          onClick={() => push('errors')}
        />
        <TileButton
          icon={BarChart3}
          label="Статистика"
          sublabel="По разделам"
          onClick={() => push('stats')}
        />
      </div>

      <button
        onClick={startRandomPractice}
        className="mx-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/12 py-3.5 text-sm text-ink-muted transition-colors active:bg-surface"
      >
        <Shuffle size={16} />
        Случайные вопросы вперемешку
      </button>
    </div>
  );
}
