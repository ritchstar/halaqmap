/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنر معاينة باقة كوافير ماب — اسم وصورة وتواصل وزر موقع كما في بنر حلاق ماب.
 */
import { MapPin, Phone, Sparkles } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import {
  type CoiffeurBannerSample,
  type CoiffeurBannerTierId,
  COIFFEUR_BANNER_SAMPLES,
} from '@/config/coiffeurBannerSamples';
import { COIFFEUR_BRAND_AR } from '@/config/coiffeurMapUmbrella';
import { buildWhatsAppChatHref } from '@/lib/saudiWhatsAppPhone';
import { cn } from '@/lib/utils';

const THEME: Record<
  CoiffeurBannerTierId,
  {
    card: string;
    cardBorder: string;
    badge: string;
    name: string;
    heroRing: string;
  }
> = {
  bronze: {
    card: 'from-[#2a1614] via-[#3d221c] to-[#1c100e]',
    cardBorder: 'border-[#c4a484]/45',
    badge: 'bg-[#c4a484]/20 text-[#e8c4a8] border-[#c4a484]/40',
    name: 'text-[#e8c4a8]',
    heroRing: 'ring-[#c4a484]/35',
  },
  gold: {
    card: 'from-[#2a1810] via-[#3d2818] to-[#1a100c]',
    cardBorder: 'border-[#f4d4c0]/50',
    badge: 'bg-[#f4d4c0]/20 text-[#f4d4c0] border-[#f4d4c0]/45',
    name: 'text-[#f4d4c0]',
    heroRing: 'ring-[#f4d4c0]/40',
  },
  diamond: {
    card: 'from-[#1a0c14] via-[#2a1420] to-[#12080e]',
    cardBorder: 'border-rose-100/35',
    badge: 'bg-rose-100/15 text-rose-50 border-rose-100/35',
    name: 'text-rose-50',
    heroRing: 'ring-rose-100/30',
  },
};

type Props = {
  tierId: CoiffeurBannerTierId;
  sample?: CoiffeurBannerSample;
};

function openMaps(sample: CoiffeurBannerSample) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${sample.lat},${sample.lng}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function CoiffeurPackageBanner({ tierId, sample: sampleProp }: Props) {
  const sample = sampleProp ?? COIFFEUR_BANNER_SAMPLES.find((item) => item.id === tierId);
  if (!sample) return null;
  const theme = THEME[tierId];
  const whatsappHref = buildWhatsAppChatHref(sample.phone);
  const showWhatsApp = Boolean(whatsappHref) && tierId !== 'bronze';

  return (
    <article
      className={cn(
        'relative mx-auto w-full max-w-sm overflow-hidden rounded-[1.7rem] border bg-gradient-to-b text-right shadow-[0_22px_48px_rgba(20,8,14,0.28)]',
        theme.card,
        theme.cardBorder,
      )}
    >
      <div className={cn('relative aspect-[5/3] overflow-hidden ring-1 ring-inset', theme.heroRing)}>
        <img
          src={sample.image}
          alt={sample.sampleAtelier}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14080e] via-[#14080e]/35 to-transparent" />
        <span
          className={cn(
            'absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-black',
            theme.badge,
          )}
        >
          {sample.nameAr}
        </span>
        <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-[#14080e]/70 px-2.5 py-1 text-[11px] font-bold text-[#f7efe8]">
          معاينة
        </span>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className={cn('text-lg font-black', theme.name)}>{sample.sampleAtelier}</h3>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f4d4c0]/20">
            <Sparkles className="h-3.5 w-3.5 text-[#f4d4c0]" aria-hidden />
          </span>
        </div>
        <p className="text-[0.65rem] text-rose-100/50">{COIFFEUR_BRAND_AR}</p>
        <p className="mt-1 text-xs leading-6 text-rose-50/70">{sample.address}</p>
        <p className="mt-0.5 font-mono text-sm text-[#f7efe8]" dir="ltr">
          {sample.phone}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => openMaps(sample)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-[#e8b4a2] to-[#c98b96] px-3 py-2.5 text-sm font-black text-[#2a1218]"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            الموقع
          </button>
          <a
            href={`tel:${sample.phone}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#f4d4c0]/35 bg-white/5 text-[#f4d4c0] no-underline"
            aria-label="اتصال"
          >
            <Phone className="h-4 w-4" />
          </a>
          {showWhatsApp && whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-white no-underline"
              aria-label="واتساب"
            >
              <SiWhatsapp className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
