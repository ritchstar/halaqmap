import { useEffect, useState } from 'react';

export type BannerSimPhase = 'portfolio' | 'comms' | 'map';

const PHASE_ORDER: BannerSimPhase[] = ['portfolio', 'comms', 'map'];
const PHASE_MS: Record<BannerSimPhase, number> = {
  portfolio: 4800,
  comms: 3600,
  map: 4800,
};

export function useBannerPreviewSim(
  visibleGallerySlots: number,
  reduceMotion: boolean | null,
  startDelayMs = 0,
  enabled = true,
): { phase: BannerSimPhase; portfolioIndex: number } {
  const [phase, setPhase] = useState<BannerSimPhase>('portfolio');
  const [portfolioIndex, setPortfolioIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || !enabled) {
      setPhase('portfolio');
      setPortfolioIndex(0);
      return;
    }

    let phaseIdx = 0;
    let phaseTimeout: ReturnType<typeof setTimeout>;

    const schedulePhase = () => {
      const current = PHASE_ORDER[phaseIdx]!;
      setPhase(current);
      phaseTimeout = setTimeout(() => {
        phaseIdx = (phaseIdx + 1) % PHASE_ORDER.length;
        schedulePhase();
      }, PHASE_MS[current]);
    };

    const startTimer = setTimeout(() => {
      schedulePhase();
    }, startDelayMs);

    const galleryTimer = setInterval(() => {
      setPortfolioIndex((prev) => (prev + 1) % Math.max(1, visibleGallerySlots));
    }, 900);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(phaseTimeout);
      clearInterval(galleryTimer);
    };
  }, [visibleGallerySlots, reduceMotion, startDelayMs, enabled]);

  return { phase, portfolioIndex };
}
