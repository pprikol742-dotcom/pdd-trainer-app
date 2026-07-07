import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.pddtrainer.app',
  appName: 'ПДД Тренажёр',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      backgroundColor: '#0B0D12',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
