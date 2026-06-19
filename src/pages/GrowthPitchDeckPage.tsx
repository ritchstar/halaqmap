import { useEffect } from 'react';
import { GrowthPitchSlideDeck } from '@/components/pitch/GrowthPitchSlideDeck';
import {
  GROWTH_PITCH_DECK_SUBTITLE_AR,
  GROWTH_PITCH_DECK_TITLE_AR,
} from '@/config/growthPitchSlides';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * عرض تقديمي داخلي — شرائح مقارنة تسويقية + جذب الزبائن.
 * المسار: ROUTE_PATHS.GROWTH_PITCH_DECK — لا يُربط من القوائم العامة.
 */
export default function GrowthPitchDeckPage() {
  useDocumentTitle(`${GROWTH_PITCH_DECK_TITLE_AR} · ${GROWTH_PITCH_DECK_SUBTITLE_AR}`);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  return (
    <>
      <p className="sr-only">عرض تقديمي داخلي لحلاق ماب — للاستخدام في الاجتماعات والعروض</p>
      <GrowthPitchSlideDeck />
    </>
  );
}
