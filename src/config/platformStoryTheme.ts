import type {
  GrowthPitchLane,
  GrowthPitchSlideLayout,
} from '@/config/growthPitchTheme';
import { GROWTH_PITCH_LANE_LABEL } from '@/config/growthPitchTheme';

export const PLATFORM_STORY_SLIDE_LAYOUT: Record<string, GrowthPitchSlideLayout> = {
  cover: 'hero-spotlight',
  shift: 'two-column-bullets',
  journey: 'default',
  filters: 'two-column-bullets',
  'free-trust': 'two-column-bullets',
  compliance: 'default',
  'partner-teaser': 'default',
  cta: 'cta-spotlight',
};

export const PLATFORM_STORY_SLIDE_LANE: Record<string, GrowthPitchLane> = {
  cover: 'neutral',
  shift: 'b2c',
  journey: 'b2c',
  filters: 'b2c',
  'free-trust': 'b2c',
  compliance: 'neutral',
  'partner-teaser': 'b2b',
  cta: 'neutral',
};

export const PLATFORM_STORY_LANE_LABEL = {
  ...GROWTH_PITCH_LANE_LABEL,
  neutral: 'حلاق ماب',
} as const;

export function platformStoryLayoutForSlide(slideId: string): GrowthPitchSlideLayout {
  return PLATFORM_STORY_SLIDE_LAYOUT[slideId] ?? 'default';
}

export function platformStoryLaneForSlide(slideId: string): GrowthPitchLane {
  return PLATFORM_STORY_SLIDE_LANE[slideId] ?? 'neutral';
}
