import type { ActiveSession, SessionItem, SessionMode, SessionResult, Category } from '@/types';
import {
  getTicket,
  getByTopic,
  getRandom,
  getBonusQuestions,
  getByKey,
  QUESTIONS_PER_TICKET,
  type PddQuestion,
} from '@/data/pddQuestions';

const EXAM_BASE_TIME_SEC = 20 * 60;
const BONUS_TIME_SEC = 5 * 60;
const BONUS_BLOCK_SIZE = 5;
const MAX_BLOCK_MISTAKES = 2;

function toQueue(questions: PddQuestion[], isBonus = false, blockIndex = -1): SessionItem[] {
  return questions.map((q) => ({
    questionKey: q.key,
    isBonus,
    blockIndex: isBonus ? blockIndex : q.blockIndex,
    selectedIndex: null,
    isCorrect: null,
  }));
}

export function createExamSession(category: Category, ticketNumber: number): ActiveSession {
  const questions = getTicket(category, ticketNumber).slice(0, QUESTIONS_PER_TICKET);
  return {
    mode: 'exam',
    category,
    ticketNumber,
    topic: null,
    startedAt: Date.now(),
    timeLimitSec: EXAM_BASE_TIME_SEC,
    queue: toQueue(questions),
    currentIndex: 0,
    mistakenBlocks: [],
    failed: false,
    failReason: null,
    finished: false,
  };
}

export function createLearningSession(category: Category, ticketNumber: number): ActiveSession {
  const questions = getTicket(category, ticketNumber);
  return {
    mode: 'learning',
    category,
    ticketNumber,
    topic: null,
    startedAt: Date.now(),
    timeLimitSec: null,
    queue: toQueue(questions),
    currentIndex: 0,
    mistakenBlocks: [],
    failed: false,
    failReason: null,
    finished: false,
  };
}

export function createTopicSession(category: Category, topic: string, count = 20): ActiveSession {
  const questions = getByTopic(category, topic).sort(() => Math.random() - 0.5).slice(0, count);
  return {
    mode: 'topic',
    category,
    ticketNumber: null,
    topic,
    startedAt: Date.now(),
    timeLimitSec: null,
    queue: toQueue(questions),
    currentIndex: 0,
    mistakenBlocks: [],
    failed: false,
    failReason: null,
    finished: false,
  };
}

export function createRandomSession(category: Category, count = 20): ActiveSession {
  const questions = getRandom(category, count);
  return {
    mode: 'learning',
    category,
    ticketNumber: null,
    topic: null,
    startedAt: Date.now(),
    timeLimitSec: null,
    queue: toQueue(questions),
    currentIndex: 0,
    mistakenBlocks: [],
    failed: false,
    failReason: null,
    finished: false,
  };
}

export function getCurrentQuestion(session: ActiveSession): PddQuestion | null {
  const item = session.queue[session.currentIndex];
  if (!item) return null;
  return getByKey(item.questionKey) ?? null;
}

/**
 * Чистая функция: применяет ответ на текущий вопрос и возвращает НОВУЮ сессию.
 * Инкапсулирует всю механику билета: блоки, доп.вопросы за ошибку, условия провала.
 */
export function submitAnswer(session: ActiveSession, selectedIndex: number): ActiveSession {
  const item = session.queue[session.currentIndex];
  const question = item ? getByKey(item.questionKey) : null;
  if (!item || !question || session.finished) return session;

  const isCorrect = selectedIndex === question.correctIndex;
  const updatedQueue = [...session.queue];
  updatedQueue[session.currentIndex] = { ...item, selectedIndex, isCorrect };

  let next: ActiveSession = { ...session, queue: updatedQueue };

  // В режиме обучения/по темам — только фиксируем ответ, без механики провала.
  if (session.mode !== 'exam') {
    return next;
  }

  if (isCorrect) {
    return next;
  }

  // --- Ошибка в экзамене ---
  if (item.isBonus) {
    // Любая ошибка в доп.блоке — незачёт немедленно.
    return { ...next, failed: true, finished: true, failReason: 'bonus-mistake' };
  }

  const alreadyMistakenHere = session.mistakenBlocks.includes(item.blockIndex);
  if (alreadyMistakenHere) {
    // Вторая ошибка в том же тематическом блоке — незачёт.
    return { ...next, failed: true, finished: true, failReason: 'mistakes' };
  }

  const newMistakenBlocks = [...session.mistakenBlocks, item.blockIndex];
  if (newMistakenBlocks.length > MAX_BLOCK_MISTAKES) {
    // Третья ошибка в разных блоках — тоже незачёт (правило "не более 2 ошибок").
    return { ...next, mistakenBlocks: newMistakenBlocks, failed: true, finished: true, failReason: 'mistakes' };
  }

  // Начисляем 5 доп.вопросов по теме этой ошибки + 5 минут.
  const usedKeys = updatedQueue.map((q) => q.questionKey);
  const bonus = getBonusQuestions(session.category, question, BONUS_BLOCK_SIZE, usedKeys);
  const bonusQueueItems = toQueue(bonus, true, item.blockIndex);

  next = {
    ...next,
    mistakenBlocks: newMistakenBlocks,
    queue: [...updatedQueue, ...bonusQueueItems],
    timeLimitSec: (next.timeLimitSec ?? EXAM_BASE_TIME_SEC) + BONUS_TIME_SEC,
  };

  return next;
}

/** Продвигает сессию к следующему вопросу; если очередь кончилась — завершает сессию (сдал). */
export function advance(session: ActiveSession): ActiveSession {
  if (session.finished) return session;
  const nextIndex = session.currentIndex + 1;
  if (nextIndex >= session.queue.length) {
    return { ...session, finished: true, currentIndex: nextIndex };
  }
  return { ...session, currentIndex: nextIndex };
}

export function timeUp(session: ActiveSession): ActiveSession {
  if (session.finished || session.mode !== 'exam') return session;
  return { ...session, failed: true, finished: true, failReason: 'time' };
}

export function buildResult(session: ActiveSession): SessionResult {
  const answered = session.queue.filter((q) => q.isCorrect !== null);
  const correct = answered.filter((q) => q.isCorrect).length;
  const passed = session.mode === 'exam' ? !session.failed && session.finished : true;
  return {
    mode: session.mode,
    category: session.category,
    ticketNumber: session.ticketNumber,
    total: answered.length,
    correct,
    passed,
    failReason: session.failReason,
    durationSec: Math.round((Date.now() - session.startedAt) / 1000),
    finishedAt: Date.now(),
  };
}

export function sessionModeLabel(mode: SessionMode): string {
  if (mode === 'exam') return 'Экзамен';
  if (mode === 'topic') return 'Тренировка по теме';
  return 'Обучение';
}
