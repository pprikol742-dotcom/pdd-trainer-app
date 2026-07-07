import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useAppStore, useCurrentScreen } from '@/store/useAppStore';
import { showBanner, hideBanner } from '@/utils/ads';
import HomeScreen from '@/screens/HomeScreen';
import TicketsScreen from '@/screens/TicketsScreen';
import QuestionScreen from '@/screens/QuestionScreen';
import ResultsScreen from '@/screens/ResultsScreen';
import ErrorReviewScreen from '@/screens/ErrorReviewScreen';
import StatisticsScreen from '@/screens/StatisticsScreen';

export default function App() {
  const screen = useCurrentScreen();
  const pop = useAppStore((s) => s.pop);
  const abandonSession = useAppStore((s) => s.abandonSession);
  const session = useAppStore((s) => s.session);

  useEffect(() => {
    // Баннер живёт везде, кроме экрана вопроса — там снизу кнопка "Далее", а не место для рекламы.
    if (screen === 'question') hideBanner();
    else showBanner();
  }, [screen]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#0B0D12' }).catch(() => {});

    const listener = CapApp.addListener('backButton', () => {
      const didPop = pop();
      if (!didPop) {
        CapApp.exitApp();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Если вышли из экрана вопроса кнопкой "назад", не бросаем сессию молча — фиксируем прогресс.
  useEffect(() => {
    if (screen !== 'question' && session && !session.finished) {
      abandonSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  return (
    <div className="min-h-[100dvh] bg-bg text-ink font-body">
      {screen === 'home' && <HomeScreen />}
      {screen === 'tickets' && <TicketsScreen />}
      {screen === 'question' && <QuestionScreen />}
      {screen === 'results' && <ResultsScreen />}
      {screen === 'errors' && <ErrorReviewScreen />}
      {screen === 'stats' && <StatisticsScreen />}
    </div>
  );
}
