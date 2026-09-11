/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { SolutionCatalogStripe } from '@/config/storeSolutionCatalog';
import { sanitizeStoreProductImageSrc } from '@/lib/storeDisallowedImagery';

const accentStyles = {
  brick: {
    frame: 'border-[#b84c3a] bg-[#fffaf4] text-[#b84c3a]',
    rule: 'bg-[#b84c3a]',
  },
  blue: {
    frame: 'border-[#1d4f69] bg-[#f5f8f8] text-[#1d4f69]',
    rule: 'bg-[#1d4f69]',
  },
  yellow: {
    frame: 'border-[#d1a728] bg-[#fffdf2] text-[#8b6a13]',
    rule: 'bg-[#d1a728]',
  },
} as const satisfies Record<SolutionCatalogStripe, { frame: string; rule: string }>;

type ProductMarkProps = {
  logoSrc: string | null;
  name: string;
  code: string;
  accent: SolutionCatalogStripe;
  compact?: boolean;
};

export function ProductMark({ logoSrc, name, code, accent, compact = false }: ProductMarkProps) {
  const colors = accentStyles[accent];
  const firstCharacter = name.trim().charAt(0) || '؟';
  const safeLogo = sanitizeStoreProductImageSrc(logoSrc || '');

  return (
    <div
      className={`relative isolate shrink-0 overflow-hidden border ${colors.frame} ${compact ? 'size-16' : 'size-20'}`}
      aria-label={safeLogo ? `شعار ${name}` : `علامة بديلة لـ ${name}`}
    >
      <span className="absolute inset-x-2 top-2 flex items-center justify-between text-[10px] font-bold opacity-70">
        <span>{code}</span>
        <span>mark</span>
      </span>

      {safeLogo ? (
        <img
          src={safeLogo}
          alt={`شعار ${name}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain p-3"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className={compact ? 'text-3xl' : 'text-4xl'}>{firstCharacter}</span>
        </span>
      )}

      <span className={`absolute inset-x-0 bottom-0 h-1 ${colors.rule}`} />
    </div>
  );
}
