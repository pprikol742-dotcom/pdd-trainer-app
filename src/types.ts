export type Category = 'AB' | 'CD';

export type Screen = 'home' | 'tickets' | 'question' | 'results' | 'errors' | 'stats';

export type SessionMode = 'learning' | 'exam' | 'topic';

/** Один вопрос в очереди активной сессии — либо основной (0..19), либо добавленный доп.вопрос. */
export interface SessionItem {
  questionKey: string;
  isBonus: boolean;
  /** Индекс блока (0-3), к которому относится вопрос — для механики "доп.вопросы по теме ошибки". */
  blockIndex: number;
  selectedIndex: number | null;
  isCorrect: boolean | null;
}

export interface ActiveSession {
  mode: SessionMode;
  category: Category;
  ticketNumber: number | null;
  topic: string | null;
  startedAt: number;
  /** Общий лимит времени в секундах. Растёт при доп.блоках. Null — без ограничения (обучение). */
  timeLimitSec: number | null;
  queue: SessionItem[];
  currentIndex: number;
  /** Блоки (0-3), в которых уже была допущена ошибка в основной части. */
  mistakenBlocks: number[];
  failed: boolean;
  failReason: 'time' | 'mistakes' | 'bonus-mistake' | null;
  finished: boolean;
}

export interface HistoryEntry {
  questionKey: string;
  category: Category;
  ticketNumber: number | null;
  topics: string[];
  correct: boolean;
  timestamp: number;
  mode: SessionMode;
}

export interface SessionResult {
  mode: SessionMode;
  category: Category;
  ticketNumber: number | null;
  total: number;
  correct: number;
  passed: boolean;
  failReason: ActiveSession['failReason'];
  durationSec: number;
  finishedAt: number;
}
