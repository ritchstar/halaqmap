/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة تنويه موسّطة داخل إطار حقلي. بلا p/span حتى لا تُحاذى لبداية السطر.
 */
import { STORE_HALL_FIELD_FRAME } from '@/config/storeHallFrames';
import { StoreHallOrnamentFrame } from '@/components/store/StoreHallOrnamentFrame';
import { cn } from '@/lib/utils';

export function StoreHallNoticePlaque({
  text,
  accent,
  kickerAr = 'تنويه المضيف',
  className,
}: {
  text: string;
  accent: string;
  kickerAr?: string;
  className?: string;
}) {
  return (
    <div
      key={text}
      className={cn('hall-notice-plaque hall-notice-pulse', className)}
      style={{ color: accent }}
    >
      <StoreHallOrnamentFrame src={STORE_HALL_FIELD_FRAME} />
      <div className="hall-notice-plaque__inner" data-bidi="off">
        <div className="hall-notice-kicker" data-bidi="off">
          {kickerAr}
        </div>
        <div className="hall-ornament-rule" style={{ ['--hall-ornament' as string]: accent }} aria-hidden />
        <div className="hall-notice-pulse__text" data-bidi="off">
          <div className="hall-notice-pulse__line" data-bidi="off">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
