/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { COIFFEUR_BRAND_LOGO_PATH, COIFFEUR_BRAND_LOGO_SRCSET } from '@/config/coiffeurMapUmbrella';
import { COIFFEUR_VISUALS } from '@/config/coiffeurVisuals';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_BRAND_EN,
  COIFFEUR_INTRO_CARD_COPY as COPY,
  COIFFEUR_SATELLITE_HOST,
} from '@/config/coiffeurIntroCardCopy';
import { cn } from '@/lib/utils';

type Props = {
  displayName: string;
  role: string;
  qrDataUrl: string | null;
  className?: string;
};

export function CoiffeurIntroCardPreview({ displayName, role, qrDataUrl, className }: Props) {
  const name = displayName.trim() || COPY.namePlaceholder;
  const title = role.trim() || COPY.rolePlaceholder;

  return (
    <div
      dir="rtl"
      className={cn(
        'relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[1.75rem]',
        'border border-[#f4d4c0]/40 text-[#f7efe8]',
        'shadow-[0_20px_50px_rgba(20,8,14,0.55)]',
        className,
      )}
      style={{
        aspectRatio: '9 / 16',
        backgroundImage:
          'radial-gradient(ellipse 80% 42% at 72% 8%, rgba(244,212,192,0.28), transparent 55%), linear-gradient(165deg, #14080e 0%, #2a1218 48%, #3a1820 100%)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: 'linear-gradient(90deg, #c98b96 0%, #f4d4c0 48%, #f7efe8 100%)',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-[#f7efe8]/25" aria-hidden />
      <div className="pointer-events-none absolute inset-4 rounded-[1.2rem] border border-[#c98b96]/35" aria-hidden />

      <div className="relative flex h-full flex-col items-center px-5 pb-4 pt-5">
        <img
          src={COIFFEUR_BRAND_LOGO_PATH}
          srcSet={COIFFEUR_BRAND_LOGO_SRCSET}
          sizes="88px"
          alt=""
          width={88}
          height={88}
          className="h-[5.5rem] w-[5.5rem] rounded-full object-cover ring-[3px] ring-[#f7efe8]/80 shadow-[0_0_28px_rgba(247,239,232,0.45)]"
          decoding="async"
        />
        <p dir="ltr" className="mt-2 text-[0.72rem] font-black tracking-[0.08em] text-[#f7efe8]">
          {COIFFEUR_BRAND_EN}
        </p>
        <p className="text-[0.78rem] font-extrabold text-[#f4d4c0]">{COIFFEUR_BRAND_AR}</p>

        <div className="mt-3 w-full overflow-hidden rounded-2xl border border-[#f7efe8]/35 shadow-[0_0_18px_rgba(244,212,192,0.2)]">
          <img
            src={COIFFEUR_VISUALS.cardIntro}
            alt=""
            className="h-20 w-full object-cover"
            decoding="async"
          />
        </div>

        <div className="mt-3 w-full rounded-2xl border border-[#f4d4c0]/50 bg-[#14080e]/80 px-3 py-3 text-center shadow-[0_0_16px_rgba(244,212,192,0.18)]">
          <p className="chat-arabic-text text-xl font-black leading-snug text-[#f7efe8]">{name}</p>
        </div>
        <p className="mt-2 inline-flex max-w-full rounded-full border border-[#f4d4c0]/45 bg-[#14080e]/75 px-3 py-1 text-center text-[0.78rem] font-extrabold text-[#f4d4c0]">
          {title}
        </p>

        <div className="mt-3 w-full rounded-2xl border border-[#f4d4c0]/40 bg-[#14080e]/75 px-3 py-3 text-center">
          <p className="text-[0.95rem] font-black text-[#f7efe8]">{COPY.headline}</p>
          <p className="mt-1 text-[0.72rem] font-bold leading-5 text-[#f4d4c0]">{COPY.tagline}</p>
          <p className="mt-1.5 text-[0.68rem] font-bold text-[#e8b4a2]">{COPY.sectors}</p>
        </div>

        <p className="mt-3 w-full rounded-full bg-gradient-to-l from-[#f7efe8] via-[#f4d4c0] to-[#c98b96] py-2 text-center text-[0.82rem] font-black text-[#2a1218] shadow-[0_0_18px_rgba(244,212,192,0.35)]">
          {COPY.cta}
        </p>

        <div className="mt-auto flex flex-col items-center pb-1 pt-3">
          {qrDataUrl ? (
            <div className="rounded-xl bg-white p-1.5">
              <img src={qrDataUrl} alt="" width={88} height={88} className="h-[5.5rem] w-[5.5rem]" />
            </div>
          ) : (
            <div className="h-[5.5rem] w-[5.5rem] rounded-xl bg-white/90" aria-hidden />
          )}
          <p dir="ltr" className="mt-1.5 text-[0.62rem] font-bold tracking-wide text-[#f7efe8]/90">
            {COIFFEUR_SATELLITE_HOST}
          </p>
          <p className="mt-0.5 text-[0.62rem] font-bold text-[#f4d4c0]">{COPY.scanHint}</p>
        </div>
      </div>
    </div>
  );
}
