/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * بنر حزمة كوافير:
 * ويب — نافذة عرض دائرية مؤطّرة.
 * جوال — بطاقة مكدّسة بعرض الشاشة كما في حلاق ماب.
 */
import { Sparkles } from 'lucide-react';
import {
  type CoiffeurBannerTierId,
  COIFFEUR_BANNER_SAMPLES,
} from '@/config/coiffeurBannerSamples';
import { COIFFEUR_BRAND_AR } from '@/config/coiffeurMapUmbrella';
import { cn } from '@/lib/utils';

const THEME: Record<
  CoiffeurBannerTierId,
  {
    bezel: string;
    ring: string;
    inner: string;
    name: string;
    glow: string;
    mark: string;
    tick: string;
    card: string;
    cardBorder: string;
  }
> = {
  bronze: {
    bezel: 'from-[#e8c4a8] via-[#8c5a4a] to-[#c4a484]',
    ring: 'border-[#c4a484]/50',
    inner: 'bg-[radial-gradient(circle_at_38%_32%,#4a2a22_0%,#1c100e_72%)]',
    name: 'text-[#e8c4a8]',
    glow: 'shadow-[0_0_36px_rgba(196,164,132,0.28)]',
    mark: 'from-[#c4a484] to-[#8c5a4a]',
    tick: 'bg-[#e8c4a8]',
    card: 'from-[#2a1614] via-[#3d221c] to-[#1c100e]',
    cardBorder: 'border-[#c4a484]/45',
  },
  gold: {
    bezel: 'from-[#f7efe8] via-[#c98b96] to-[#f4d4c0]',
    ring: 'border-[#f4d4c0]/55',
    inner: 'bg-[radial-gradient(circle_at_38%_32%,#4a2c1c_0%,#1a100c_72%)]',
    name: 'text-[#f4d4c0]',
    glow: 'shadow-[0_0_40px_rgba(244,212,192,0.34)]',
    mark: 'from-[#f7efe8] via-[#f4d4c0] to-[#c98b96]',
    tick: 'bg-[#f4d4c0]',
    card: 'from-[#2a1810] via-[#3d2818] to-[#1a100c]',
    cardBorder: 'border-[#f4d4c0]/50',
  },
  diamond: {
    bezel: 'from-white via-[#e8b4a2] to-rose-100',
    ring: 'border-rose-100/40',
    inner: 'bg-[radial-gradient(circle_at_38%_32%,#3a1824_0%,#12080e_72%)]',
    name: 'text-rose-50',
    glow: 'shadow-[0_0_42px_rgba(244,212,220,0.28)]',
    mark: 'from-white via-rose-100 to-[#e8b4a2]',
    tick: 'bg-rose-100',
    card: 'from-[#1a0c14] via-[#2a1420] to-[#12080e]',
    cardBorder: 'border-rose-100/35',
  },
};

type Props = {
  tierId: CoiffeurBannerTierId;
  layout: 'window' | 'card';
  selected?: boolean;
  onSelect?: () => void;
};

function WindowBezel({ theme }: { theme: (typeof THEME)[CoiffeurBannerTierId] }) {
  return (
    <>
      <span
        className={cn('pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br', theme.bezel)}
        aria-hidden
      />
      <span className={cn('pointer-events-none absolute inset-[5px] rounded-full border', theme.ring)} aria-hidden />
      <span className="pointer-events-none absolute inset-[10px] rounded-full border border-white/15" aria-hidden />
      <span className="pointer-events-none absolute inset-[15px] rounded-full border border-white/8" aria-hidden />
      {['top-2 left-1/2 -translate-x-1/2', 'bottom-2 left-1/2 -translate-x-1/2', 'left-2 top-1/2 -translate-y-1/2', 'right-2 top-1/2 -translate-y-1/2'].map(
        (pos) => (
          <span
            key={pos}
            className={cn('pointer-events-none absolute h-1.5 w-1.5 rotate-45 rounded-[1px]', theme.tick, pos)}
            aria-hidden
          />
        ),
      )}
    </>
  );
}

export function CoiffeurPackageBanner({ tierId, layout, selected = false, onSelect }: Props) {
  const sample = COIFFEUR_BANNER_SAMPLES.find((item) => item.id === tierId);
  if (!sample) return null;
  const theme = THEME[tierId];

  if (layout === 'card') {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          'relative mx-auto w-full max-w-sm overflow-hidden rounded-[1.7rem] border bg-gradient-to-b text-right shadow-[0_22px_48px_rgba(20,8,14,0.28)]',
          theme.card,
          theme.cardBorder,
          selected && 'ring-2 ring-[#f4d4c0]/70',
        )}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(244,212,192,0.55), transparent)' }}
        />
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className={cn('text-lg font-black', theme.name)}>{sample.nameAr}</p>
            <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br', theme.mark)}>
              <Sparkles className="h-3.5 w-3.5 text-[#2a1218]" />
            </span>
          </div>
          <p className="text-sm font-bold text-[#f7efe8]">{sample.sampleAtelier}</p>
          <p className="mt-0.5 text-[0.65rem] text-rose-100/50">{COIFFEUR_BRAND_AR}</p>
          <ul className="mt-3 space-y-1.5">
            {sample.lines.map((line) => (
              <li key={line} className="text-[0.75rem] leading-5 text-rose-50/75">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </button>
    );
  }

  return (
    <div className="flex w-[16.5rem] flex-col items-center">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={sample.nameAr}
        className={cn(
          'relative h-[15.75rem] w-[15.75rem] shrink-0 rounded-full transition',
          theme.glow,
          selected ? 'scale-[1.03]' : 'hover:scale-[1.02]',
        )}
      >
        <WindowBezel theme={theme} />
        <span
          className={cn(
            'absolute inset-[18px] flex flex-col items-center justify-center overflow-hidden rounded-full',
            theme.inner,
          )}
        >
          <span className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br', theme.mark)}>
            <Sparkles className="h-5 w-5 text-[#2a1218]" />
          </span>
          <span className="text-[0.62rem] font-bold tracking-[0.18em] text-rose-100/65">{sample.ribbon}</span>
          <span className={cn('mt-1 text-2xl font-black', theme.name)}>{sample.nameAr}</span>
        </span>
      </button>
      <p className="mt-5 text-sm font-bold text-[#f7efe8]">{sample.sampleAtelier}</p>
      <p className="mt-0.5 text-[0.65rem] text-rose-100/45">{COIFFEUR_BRAND_AR}</p>
      <ul className="mt-3 space-y-1.5 text-center">
        {sample.lines.map((line) => (
          <li key={line} className="text-[0.72rem] leading-5 text-rose-50/70">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
