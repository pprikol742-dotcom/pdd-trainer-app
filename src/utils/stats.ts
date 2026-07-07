import type { HistoryEntry, Category } from '@/types';
import { getByKey, pddTopics, type PddQuestion } from '@/data/pddQuestions';

export interface TopicStat {
  topic: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface OverallStats {
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  byTopic: TopicStat[];
  ticketsAttempted: number;
}

export function getOverallStats(history: HistoryEntry[], category: Category): OverallStats {
  const filtered = history.filter((h) => h.category === category);
  const totalAnswered = filtered.length;
  const totalCorrect = filtered.filter((h) => h.correct).length;
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const topicMap = new Map<string, { total: number; correct: number }>();
  for (const h of filtered) {
    for (const t of h.topics) {
      const cur = topicMap.get(t) ?? { total: 0, correct: 0 };
      cur.total += 1;
      if (h.correct) cur.correct += 1;
      topicMap.set(t, cur);
    }
  }

  const byTopic: TopicStat[] = pddTopics[category]
    .map((topic) => {
      const cur = topicMap.get(topic) ?? { total: 0, correct: 0 };
      return {
        topic,
        total: cur.total,
        correct: cur.correct,
        accuracy: cur.total ? Math.round((cur.correct / cur.total) * 100) : 0,
      };
    })
    .filter((t) => t.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy);

  const ticketsAttempted = new Set(
    filtered.filter((h) => h.ticketNumber !== null).map((h) => h.ticketNumber)
  ).size;

  return { totalAnswered, totalCorrect, accuracy, byTopic, ticketsAttempted };
}

/** Вопросы, последний ответ на которые был неверным. Как только отвечаешь правильно — вопрос уходит из списка. */
export function getActiveErrors(history: HistoryEntry[], category: Category): PddQuestion[] {
  const latestByKey = new Map<string, HistoryEntry>();
  for (const h of history) {
    if (h.category !== category) continue;
    const prev = latestByKey.get(h.questionKey);
    if (!prev || h.timestamp > prev.timestamp) latestByKey.set(h.questionKey, h);
  }
  const wrong = [...latestByKey.values()]
    .filter((h) => !h.correct)
    .sort((a, b) => b.timestamp - a.timestamp);
  return wrong.map((h) => getByKey(h.questionKey)).filter((q): q is PddQuestion => !!q);
}
