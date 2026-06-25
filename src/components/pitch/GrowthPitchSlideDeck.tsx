import { MarketingSlideDeck } from '@/components/pitch/MarketingSlideDeck';
import {
  GROWTH_PITCH_LANE_LABEL,
  GROWTH_PITCH_SLIDE_LAYOUT,
  GROWTH_PITCH_SLIDE_LANE,
  layoutForSlide,
  laneForSlide,
} from '@/config/growthPitchTheme';
import { GROWTH_PITCH_SLIDES } from '@/config/growthPitchSlides';

const GROWTH_PITCH_THEME = {
  laneLabels: GROWTH_PITCH_LANE_LABEL,
  layoutForSlide: (id: string) => GROWTH_PITCH_SLIDE_LAYOUT[id] ?? layoutForSlide(id),
  laneForSlide: (id: string) => GROWTH_PITCH_SLIDE_LANE[id] ?? laneForSlide(id),
};

export function GrowthPitchSlideDeck() {
  return (
    <MarketingSlideDeck
      slides={GROWTH_PITCH_SLIDES}
      headerTitle="عرض الشركاء"
      headerHint="← → · F ملء الشاشة · لأصحاب الصالونات"
      theme={GROWTH_PITCH_THEME}
    />
  );
}
