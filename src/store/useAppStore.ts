import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveSession, Category, HistoryEntry, Screen, SessionResult } from '@/types';
import {
  createExamSession,
  createLearningSession,
  createTopicSession,
  createRandomSession,
  submitAnswer,
  advance,
  timeUp,
  buildResult,
} from '@/utils/examEngine';
import { getActiveErrors } from '@/utils/stats';
import { getByKey } from '@/data/pddQuestions';

interface AppState {
  category: Category;
  screenStack: Screen[];
  session: ActiveSession | null;
  lastResult: SessionResult | null;
  history: HistoryEntry[];
  sessionResults: SessionResult[];

  setCategory: (c: Category) => void;
  push: (screen: Screen) => void;
  pop: () => boolean;
  goHome: () => void;

  startExam: (ticketNumber: number) => void;
  startLearning: (ticketNumber: number) => void;
  startTopicPractice: (topic: string) => void;
  startRandomPractice: () => void;
  startErrorsReview: () => void;

  answerCurrent: (selectedIndex: number) => void;
  goNext: () => void;
  onTimeUp: () => void;
  abandonSession: () => void;

  resetProgress: () => void;
}

function commitSessionToHistory(get: () => AppState, set: (partial: Partial<AppState>) => void) {
  const session = get().session;
  if (!session) return;
  const entries: HistoryEntry[] = session.queue
    .filter((item) => item.isCorrect !== null)
    .map((item) => {
      const q = getByKey(item.questionKey);
      return {
        questionKey: item.questionKey,
        category: session.category,
        ticketNumber: session.ticketNumber,
        topics: q?.topics ?? [],
        correct: !!item.isCorrect,
        timestamp: Date.now(),
        mode: session.mode,
      };
    });
  const result = buildResult(session);
  set({
    history: [...get().history, ...entries],
    sessionResults: [...get().sessionResults, result],
    lastResult: result,
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      category: 'AB',
      screenStack: ['home'],
      session: null,
      lastResult: null,
      history: [],
      sessionResults: [],

      setCategory: (c) => set({ category: c }),

      push: (screen) => set({ screenStack: [...get().screenStack, screen] }),
      pop: () => {
        const stack = get().screenStack;
        if (stack.length <= 1) return false;
        set({ screenStack: stack.slice(0, -1) });
        return true;
      },
      goHome: () => set({ screenStack: ['home'], session: null }),

      startExam: (ticketNumber) => {
        set({
          session: createExamSession(get().category, ticketNumber),
          screenStack: [...get().screenStack, 'question'],
        });
      },
      startLearning: (ticketNumber) => {
        set({
          session: createLearningSession(get().category, ticketNumber),
          screenStack: [...get().screenStack, 'question'],
        });
      },
      startTopicPractice: (topic) => {
        set({
          session: createTopicSession(get().category, topic),
          screenStack: [...get().screenStack, 'question'],
        });
      },
      startRandomPractice: () => {
        set({
          session: createRandomSession(get().category, 20),
          screenStack: [...get().screenStack, 'question'],
        });
      },
      startErrorsReview: () => {
        const errors = getActiveErrors(get().history, get().category);
        if (errors.length === 0) return;
        const session: ActiveSession = {
          mode: 'learning',
          category: get().category,
          ticketNumber: null,
          topic: null,
          startedAt: Date.now(),
          timeLimitSec: null,
          queue: errors.map((q) => ({
            questionKey: q.key,
            isBonus: false,
            blockIndex: q.blockIndex,
            selectedIndex: null,
            isCorrect: null,
          })),
          currentIndex: 0,
          mistakenBlocks: [],
          failed: false,
          failReason: null,
          finished: false,
        };
        set({ session, screenStack: [...get().screenStack, 'question'] });
      },

      answerCurrent: (selectedIndex) => {
        const session = get().session;
        if (!session) return;
        const updated = submitAnswer(session, selectedIndex);
        set({ session: updated });
        if (updated.finished) {
          commitSessionToHistory(get, set);
          set({ screenStack: [...get().screenStack, 'results'] });
        }
      },

      goNext: () => {
        const session = get().session;
        if (!session) return;
        const updated = advance(session);
        set({ session: updated });
        if (updated.finished) {
          commitSessionToHistory(get, set);
          set({ screenStack: [...get().screenStack, 'results'] });
        }
      },

      onTimeUp: () => {
        const session = get().session;
        if (!session) return;
        const updated = timeUp(session);
        set({ session: updated });
        if (updated.finished) {
          commitSessionToHistory(get, set);
          set({ screenStack: [...get().screenStack, 'results'] });
        }
      },

      abandonSession: () => {
        // Не трогаем screenStack — навигацию уже отработал pop()/push(), здесь только фиксируем прогресс.
        const session = get().session;
        if (session) commitSessionToHistory(get, set);
        set({ session: null });
      },

      resetProgress: () => set({ history: [], sessionResults: [], session: null }),
    }),
    {
      name: 'pdd-trainer-storage',
      partialize: (state) => ({
        category: state.category,
        history: state.history,
        sessionResults: state.sessionResults,
      }),
    }
  )
);

export function useCurrentScreen(): Screen {
  return useAppStore((s) => s.screenStack[s.screenStack.length - 1]);
}
