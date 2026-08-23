/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إطارات الشاشة والحقول، وخلفيات القاعة الخفيفة. لا يُستورد من App.
 */
import { STORE_LIVE_PANORAMAS } from '@/config/storeLiveAtmosphere';

export const STORE_HALL_SCREEN_FRAME = '/images/store/frames/hall-screen-frame.png';
export const STORE_HALL_FIELD_FRAME = '/images/store/frames/hall-field-frame.png';

export const STORE_HALL_BACKDROPS = STORE_LIVE_PANORAMAS;

export const STORE_HALL_PREVIEW_BACKDROP = STORE_LIVE_PANORAMAS[0];
export const STORE_HALL_PREVIEW_BACKDROP_WOMEN = STORE_LIVE_PANORAMAS[2];

export function storeHallBackdrops(voice: 'men' | 'women', preview = false): readonly string[] {
  if (preview) {
    return voice === 'women' ? [STORE_HALL_PREVIEW_BACKDROP_WOMEN] : [STORE_HALL_PREVIEW_BACKDROP];
  }
  return STORE_HALL_BACKDROPS;
}
