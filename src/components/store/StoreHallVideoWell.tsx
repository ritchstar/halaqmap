/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شاشة القاعة في الوسط: يوتيوب يعمل داخل إطار ذهبي.
 */
import { STORE_HALL_SCREEN_FRAME } from '@/config/storeHallFrames';
import { StoreHallOrnamentFrame } from '@/components/store/StoreHallOrnamentFrame';
import { StoreHallYoutubePlayer } from '@/components/store/StoreHallYoutubePlayer';
import type { ReactNode } from 'react';

export function StoreHallVideoWell({
  embed,
  fallback,
  title = 'فيديو المناسبة',
  soundLabelAr = 'تشغيل الصوت',
}: {
  embed: string | null;
  fallback: ReactNode;
  title?: string;
  soundLabelAr?: string;
}) {
  return (
    <div className="wedding-hall-video-well">
      <div className="wedding-hall-video-well__stage">
        <div className="wedding-hall-video-well__media">
          {embed ? (
            <StoreHallYoutubePlayer src={embed} title={title} soundLabelAr={soundLabelAr} />
          ) : (
            fallback
          )}
        </div>
        <StoreHallOrnamentFrame src={STORE_HALL_SCREEN_FRAME} className="z-[4]" />
      </div>
    </div>
  );
}
