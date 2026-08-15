/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_BRAND_EN,
  COIFFEUR_BRAND_LOGO_PATH,
  COIFFEUR_BRAND_LOGO_SRCSET,
} from '@/config/coiffeurMapUmbrella';
import { cn } from '@/lib/utils';

type Props = {
  alt?: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  /** دمج الاسم الإنجليزي أسفل الختم */
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function CoiffeurBrandMark({
  alt = COIFFEUR_BRAND_AR,
  className,
  imgClassName,
  sizes = '80px',
  showWordmark = true,
  wordmarkClassName,
}: Props) {
  return (
    <span className="inline-flex shrink-0 flex-col items-center gap-0.5">
      <span className={cn('inline-flex overflow-hidden rounded-full', className)}>
        <img
          src={COIFFEUR_BRAND_LOGO_PATH}
          srcSet={COIFFEUR_BRAND_LOGO_SRCSET}
          sizes={sizes}
          alt={alt}
          width={80}
          height={80}
          decoding="async"
          className={cn('block h-full w-full object-cover', imgClassName)}
        />
      </span>
      {showWordmark ? (
        <span
          dir="ltr"
          className={cn(
            'whitespace-nowrap text-[1.15rem] font-black tracking-[0.04em] text-[#f7efe8]',
            wordmarkClassName,
          )}
        >
          {COIFFEUR_BRAND_EN}
        </span>
      ) : null}
    </span>
  );
}
