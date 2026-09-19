/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة ورقة بلوت واحدة — عرض بصري خفيف بلا صور (رتبة + رمز البذلة) يعمل
 * فوراً بلا أصول خارجية، على نمط الأدوات المساعدة الأخرى في المنصة.
 */
import { BALOOT_SUIT_SYMBOLS } from '@/config/balootArena';
import type { BalootCard, BalootSuit } from '@/lib/balootEngine';
import { cn } from '@/lib/utils';

const RED_SUITS: readonly BalootSuit[] = ['hearts', 'diamonds'];

type BalootCardFaceProps = {
  card: BalootCard;
  trumpSuit?: BalootSuit | null;
  faceDown?: boolean;
  disabled?: boolean;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
};

const SIZE_CLASS: Record<NonNullable<BalootCardFaceProps['size']>, string> = {
  sm: 'h-14 w-10 text-xs',
  md: 'h-20 w-14 text-sm',
  lg: 'h-24 w-16 text-base',
};

export function BalootCardFace({
  card,
  trumpSuit,
  faceDown = false,
  disabled = false,
  selected = false,
  size = 'md',
  onClick,
  className,
}: BalootCardFaceProps) {
  if (faceDown) {
    return (
      <div
        className={cn(
          SIZE_CLASS[size],
          'rounded-lg border border-[#3a2a12] bg-gradient-to-br from-[#7a4a1e] to-[#4a2c10] shadow-inner',
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  const isRed = RED_SUITS.includes(card.suit);
  const isTrump = trumpSuit ? card.suit === trumpSuit : false;

  return (
    <button
      type="button"
      disabled={disabled || !onClick}
      onClick={onClick}
      className={cn(
        SIZE_CLASS[size],
        'flex flex-col items-center justify-between rounded-lg border bg-white px-1.5 py-1 font-black shadow-md transition-transform',
        isRed ? 'text-[#b2233a]' : 'text-[#141414]',
        isTrump ? 'border-[#d8ac52] ring-2 ring-[#d8ac52]/60' : 'border-black/15',
        onClick && !disabled ? 'cursor-pointer hover:-translate-y-1.5' : 'cursor-default',
        disabled ? 'opacity-40' : '',
        selected ? '-translate-y-2 ring-2 ring-[#3d8b4a]' : '',
        className,
      )}
      aria-label={`${card.rank} ${BALOOT_SUIT_SYMBOLS[card.suit]}`}
    >
      <span className="self-start leading-none">{card.rank}</span>
      <span className="text-xl leading-none">{BALOOT_SUIT_SYMBOLS[card.suit]}</span>
      <span className="self-end rotate-180 leading-none">{card.rank}</span>
    </button>
  );
}
