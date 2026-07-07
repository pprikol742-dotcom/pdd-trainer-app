declare global {
  interface Window {
    pddAds?: {
      showBanner: () => void;
      hideBanner: () => void;
      showInterstitial: () => void;
    };
  }
}

export function showBanner() {
  window.pddAds?.showBanner();
}

export function hideBanner() {
  window.pddAds?.hideBanner();
}

export function showInterstitial() {
  window.pddAds?.showInterstitial();
}

export {};
