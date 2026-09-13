/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أيقونة عقدة «حيّك في واجهة واحدة» — رمز خفيف (منزل أو متجر) بدل صورة فوتوغرافية،
 * لأن الصور الحقيقية تفقد وضوحها في حجم صغير داخل المشهد السداسي.
 */
import type { SolutionCatalogStripe } from '@/config/storeSolutionCatalog';

export type HoodNodeIconKind = 'house' | 'shop';

const accentStyles = {
  brick: {
    frame: 'border-[#d8c3b6] bg-[#fdf5f0] text-[#b84c3a]',
    rule: 'bg-[#b84c3a]',
  },
  blue: {
    frame: 'border-[#c7d6dc] bg-[#f2f7f8] text-[#1d4f69]',
    rule: 'bg-[#1d4f69]',
  },
  yellow: {
    frame: 'border-[#e6d4ab] bg-[#fdf9ee] text-[#8b6a13]',
    rule: 'bg-[#d1a728]',
  },
} as const satisfies Record<SolutionCatalogStripe, { frame: string; rule: string }>;

function HouseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
      <path
        d="M4 11.5 12 5l8 6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.2V18a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 19v-4.2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V19" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function ShopGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
      <path
        d="M4.5 9.5 5.6 5h12.8l1.1 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 9.5a2 2 0 0 0 4 .3 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4-.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 10v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 19v-3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V19" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function HoodNodeIcon({
  kind,
  accent,
  name,
  compact = false,
}: {
  kind: HoodNodeIconKind;
  accent: SolutionCatalogStripe;
  name: string;
  compact?: boolean;
}) {
  const colors = accentStyles[accent];
  return (
    <div
      className={`relative isolate shrink-0 overflow-hidden border ${colors.frame} ${compact ? 'size-16' : 'size-20'}`}
      role="img"
      aria-label={`رمز ${kind === 'house' ? 'منزل' : 'متجر'} لـ ${name}`}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        {kind === 'house' ? <HouseGlyph /> : <ShopGlyph />}
      </span>
      <span className={`absolute inset-x-0 bottom-0 h-1 ${colors.rule}`} />
    </div>
  );
}
