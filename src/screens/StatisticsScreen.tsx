import { useAppStore } from '@/store/useAppStore';
import { getOverallStats } from '@/utils/stats';
import ScreenHeader from '@/components/ScreenHeader';
import TopicBar from '@/components/TopicBar';
import GaugeProgress from '@/components/GaugeProgress';
import { TICKET_COUNT } from '@/data/pddQuestions';

export default function StatisticsScreen() {
  const category = useAppStore((s) => s.category);
  const history = useAppStore((s) => s.history);
  const sessionResults = useAppStore((s) => s.sessionResults);

  const stats = getOverallStats(history, category);
  const examResults = sessionResults.filter((r) => r.category === category && r.mode === 'exam');
  const examsPassed = examResults.filter((r) => r.passed).length;

  return (
    <div className="min-h-[100dvh] pb-8">
      <ScreenHeader title="Статистика" subtitle={`Категория ${category === 'AB' ? 'A, B' : 'C, D'}`} />

      {stats.totalAnswered === 0 ? (
        <div className="px-8 py-16 text-center">
          <p className="font-display text-lg uppercase tracking-wide text-ink-muted">Пока нет данных</p>
          <p className="mt-2 text-sm text-ink-muted">Пройдите хотя бы один билет, чтобы увидеть статистику.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-5 px-5 pt-5">
            <GaugeProgress current={stats.accuracy} total={100} label="точность" size={100} />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-surface px-3.5 py-2.5">
                <span className="text-xs text-ink-muted">Отвечено вопросов</span>
                <span className="font-mono tabular text-sm font-semibold text-ink">{stats.totalAnswered}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-surface px-3.5 py-2.5">
                <span className="text-xs text-ink-muted">Билетов пройдено</span>
                <span className="font-mono tabular text-sm font-semibold text-ink">
                  {stats.ticketsAttempted}/{TICKET_COUNT}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-surface px-3.5 py-2.5">
                <span className="text-xs text-ink-muted">Экзаменов сдано</span>
                <span className="font-mono tabular text-sm font-semibold text-ink">
                  {examsPassed}/{examResults.length}
                </span>
              </div>
            </div>
          </div>

          {stats.byTopic.length > 0 && (
            <div className="px-5 pt-7">
              <h3 className="mb-1 font-display text-sm font-medium uppercase tracking-wide text-ink-muted">
                Слабые разделы
              </h3>
              <p className="mb-2 text-xs text-ink-muted">Отсортировано от худшего к лучшему результату</p>
              <div className="divide-y divide-white/5">
                {stats.byTopic.map((t) => (
                  <TopicBar key={t.topic} topic={t.topic} accuracy={t.accuracy} total={t.total} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
