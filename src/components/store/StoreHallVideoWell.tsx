/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شاشة القاعة في الوسط: يوتيوب داخل إطار ذهبي.
 */
import { STORE_HALL_SCREEN_FRAME } from '@/config/storeHallFrames';
import { StoreHallOrnamentFrame } from '@/components/store/StoreHallOrnamentFrame';
import type { ReactNode } from 'react';

export function StoreHallVideoWell({
  embed,
  fallback,
  title = 'فيديو المناسبة',
}: {
  embed: string | null;
  fallback: ReactNode;
  title?: string;
}) {
  return (
    <div className="wedding-hall-video-well">
      <div className="wedding-hall-video-well__stage">
        <div className="wedding-hall-video-well__media">
          {embed ? (
            <iframe
              title={title}
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            fallback
          )}
        </div>
        <StoreHallOrnamentFrame src={STORE_HALL_SCREEN_FRAME} className="z-[4]" />
      </div>
    </div>
  );
}
