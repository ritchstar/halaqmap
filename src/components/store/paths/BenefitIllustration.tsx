/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رسم توضيحي لفائدة جامعة. إن تعذّر تحميل الصورة يبقى النص وحده.
 */
import { useState } from 'react';
import {
  STORE_BENEFIT_ILLUSTRATIONS,
  type StoreBenefitIllustrationId,
} from '@/config/storeBenefitIllustrations';

export function BenefitIllustration({ id }: { id: StoreBenefitIllustrationId }) {
  const item = STORE_BENEFIT_ILLUSTRATIONS[id];
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <figure className="mx-auto w-full max-w-[280px] sm:max-w-xs">
      <img
        src={item.src}
        alt={item.altAr}
        width={1200}
        height={1200}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-2xl object-contain"
        onError={() => setVisible(false)}
      />
    </figure>
  );
}
