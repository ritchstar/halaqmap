import { Link } from 'react-router-dom';
import { PlatformStorySlideDeck } from '@/components/pitch/PlatformStorySlideDeck';
import {
  PLATFORM_STORY_DECK_SUBTITLE_AR,
  PLATFORM_STORY_DECK_TITLE_AR,
} from '@/config/platformStorySlides';
import { ROUTE_PATHS } from '@/lib';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * صفحة هبوط تسويقية عامة — عرض شرائح قصة المنصة.
 * للمشاركة في الحملات والتعريف بالمنصة (B2C-first).
 */
export default function PlatformDiscoverLandingPage() {
  useDocumentTitle(`${PLATFORM_STORY_DECK_TITLE_AR} · ${PLATFORM_STORY_DECK_SUBTITLE_AR}`);

  return (
    <>
      <p className="sr-only">
        {PLATFORM_STORY_DECK_TITLE_AR} — {PLATFORM_STORY_DECK_SUBTITLE_AR}
      </p>
      <PlatformStorySlideDeck />
      <div className="sr-only">
        <Link to={ROUTE_PATHS.ABOUT}>من نحن</Link>
        <Link to={ROUTE_PATHS.HOME}>ابحث عن حلاق</Link>
        <Link to={ROUTE_PATHS.BARBERS_LANDING}>مسار الشركاء</Link>
      </div>
    </>
  );
}
