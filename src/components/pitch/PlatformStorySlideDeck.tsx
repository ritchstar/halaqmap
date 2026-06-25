import { MarketingSlideDeck } from '@/components/pitch/MarketingSlideDeck';
import { PLATFORM_STORY_SLIDES } from '@/config/platformStorySlides';
import {
  PLATFORM_STORY_LANE_LABEL,
  platformStoryLaneForSlide,
  platformStoryLayoutForSlide,
} from '@/config/platformStoryTheme';

const PLATFORM_STORY_THEME = {
  laneLabels: PLATFORM_STORY_LANE_LABEL,
  layoutForSlide: platformStoryLayoutForSlide,
  laneForSlide: platformStoryLaneForSlide,
};

export function PlatformStorySlideDeck() {
  return (
    <MarketingSlideDeck
      slides={PLATFORM_STORY_SLIDES}
      headerTitle="اكتشف حلاق ماب"
      headerHint="← → · F ملء الشاشة · للمستخدم والتسويق"
      theme={PLATFORM_STORY_THEME}
    />
  );
}
