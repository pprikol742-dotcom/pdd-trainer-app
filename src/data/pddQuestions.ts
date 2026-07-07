import questionsAB from './questionsAB.json';
import questionsCD from './questionsCD.json';
import topicsABData from './topicsAB.json';
import topicsCDData from './topicsCD.json';
import type { Category } from '@/types';

export interface PddQuestion {
  id: string;
  /** Гарантированно уникальный ключ вида "AB-t1-q1". Используй его как React key и для истории/ошибок. */
  key: string;
  category: Category;
  ticketNumber: number;
  /** 0..3 — какому из 4 тематических блоков билета (по 5 вопросов) принадлежит вопрос. Нужно для механики доп.вопросов. */
  blockIndex: number;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
  topics: string[];
  image: string | null;
}

const ALL_AB = questionsAB as PddQuestion[];
const ALL_CD = questionsCD as PddQuestion[];

export const pddTopics: Record<Category, string[]> = {
  AB: topicsABData as string[],
  CD: topicsCDData as string[],
};

export const TICKET_COUNT = 40;
export const QUESTIONS_PER_TICKET = 20;
export const BLOCKS_PER_TICKET = 4;
export const QUESTIONS_PER_BLOCK = 5;

export function allQuestions(category: Category): PddQuestion[] {
  return category === 'AB' ? ALL_AB : ALL_CD;
}

const byKey: Record<string, PddQuestion> = {};
for (const q of [...ALL_AB, ...ALL_CD]) byKey[q.key] = q;

export function getByKey(key: string): PddQuestion | undefined {
  return byKey[key];
}

export function getTicket(category: Category, ticketNumber: number): PddQuestion[] {
  return allQuestions(category)
    .filter((q) => q.ticketNumber === ticketNumber)
    .sort((a, b) => {
      const ai = Number(a.key.split('-q')[1]);
      const bi = Number(b.key.split('-q')[1]);
      return ai - bi;
    });
}

export function getByTopic(category: Category, topic: string): PddQuestion[] {
  return allQuestions(category).filter((q) => q.topics.includes(topic));
}

export function getRandom(category: Category, count: number, excludeKeys: string[] = []): PddQuestion[] {
  const pool = allQuestions(category).filter((q) => !excludeKeys.includes(q.key));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** Доп. вопросы "по теме ошибки" — из того же блока билета, тот же набор тем, что и у вопроса с ошибкой. */
export function getBonusQuestions(
  category: Category,
  missedQuestion: PddQuestion,
  count: number,
  excludeKeys: string[]
): PddQuestion[] {
  const pool = allQuestions(category).filter(
    (q) =>
      q.key !== missedQuestion.key &&
      !excludeKeys.includes(q.key) &&
      q.topics.some((t) => missedQuestion.topics.includes(t))
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  if (shuffled.length >= count) return shuffled.slice(0, count);
  // если в теме не набралось достаточно вопросов — докидываем случайные из категории
  const rest = getRandom(category, count - shuffled.length, [
    ...excludeKeys,
    missedQuestion.key,
    ...shuffled.map((q) => q.key),
  ]);
  return [...shuffled, ...rest];
}

export function searchQuestions(category: Category, query: string): PddQuestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allQuestions(category).filter((item) => item.question.toLowerCase().includes(q));
}
