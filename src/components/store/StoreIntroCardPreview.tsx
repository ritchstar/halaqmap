/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_VISUALS } from '@/config/storeFront';
import {
  STORE_BRAND_LATIN,
  STORE_INTRO_CARD_COPY as COPY,
  STORE_INTRO_CARD_SHARE_ASPECT,
  STORE_INTRO_CARD_SECTORS,
  STORE_PUBLIC_NAME_AR,
  STORE_SATELLITE_HOST,
  storeIntroCardCenteredNameClass,
  storeIntroCardCta,
  storeIntroCardPitch,
} from '@/config/storeIntroCardCopy';
import { cn } from '@/lib/utils';

type Props = {
  displayName: string;
  role: string;
  qrDataUrl: string | null;
  className?: string;
};

export function StoreIntroCardPreview({ displayName, role, qrDataUrl, className }: Props) {
  const name = displayName.trim() || COPY.namePlaceholder;
  const title = role.trim() || COPY.rolePlaceholder;
  const pitch = storeIntroCardPitch(role.trim());

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[1.75rem]',
        'border border-[#e8c547]/40 text-[#f4efe4]',
        'shadow-[0_20px_50px_rgba(6,16,24,0.55)]',
        className,
      )}
      style={{
        aspectRatio: STORE_INTRO_CARD_SHARE_ASPECT,
        backgroundImage:
          'radial-gradient(ellipse 80% 42% at 72% 8%, rgba(232,197,71,0.22), transparent 55%), linear-gradient(165deg, #061018 0%, #0c1a2e 48%, #12243a 100%)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: 'linear-gradient(90deg, #b8860b 0%, #e8c547 48%, #f4efe4 100%)',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-[#f4efe4]/20" aria-hidden />
      <div className="pointer-events-none absolute inset-4 rounded-[1.2rem] border border-[#e8c547]/35" aria-hidden />

      <div className="relative flex h-full flex-col items-center px-5 pb-4 pt-5">
        <img
          src={STORE_VISUALS.logo}
          alt=""
          width={72}
          height={72}
          className="h-[4.5rem] w-[4.5rem] rounded-full object-cover ring-[3px] ring-[#e8c547]/80 shadow-[0_0_28px_rgba(232,197,71,0.4)]"
          decoding="async"
        />
        <p dir="ltr" className="mt-1.5 text-[0.68rem] font-black tracking-[0.08em] text-[#f4efe4]">
          {STORE_BRAND_LATIN}
        </p>
        <p className="text-[0.72rem] font-extrabold text-[#e8c547]">{STORE_PUBLIC_NAME_AR}</p>

        {pitch.kicker ? (
          <p className="mt-2 inline-flex rounded-full border border-[#e8c547]/50 bg-[#061018]/80 px-3 py-1 text-center text-[0.65rem] font-extrabold text-[#e8c547]">
            {pitch.kicker}
          </p>
        ) : null}

        <div className="mt-2 w-full overflow-hidden rounded-2xl border border-[#f4efe4]/25 shadow-[0_0_18px_rgba(232,197,71,0.16)]">
          <img
            src={STORE_VISUALS.radar}
            alt=""
            className="h-16 w-full object-cover"
            decoding="async"
          />
        </div>

        <div className="mt-2 flex min-h-[3.35rem] w-full items-center justify-center rounded-2xl border border-[#e8c547]/50 bg-[#061018]/80 px-3 py-2.5 shadow-[0_0_16px_rgba(232,197,71,0.16)]">
          <p
            dir="rtl"
            data-bidi="off"
            className={cn(
              'w-full text-center font-black leading-snug text-[#f4efe4] [text-align-last:center]',
              storeIntroCardCenteredNameClass(name),
            )}
          >
            {name}
          </p>
        </div>
        <p
          dir="rtl"
          data-bidi="off"
          className="mt-1.5 inline-flex max-w-full justify-center rounded-full border border-[#e8c547]/45 bg-[#061018]/75 px-3 py-1 text-center text-[0.72rem] font-extrabold leading-5 text-[#e8c547] [text-align-last:center]"
        >
          {title}
        </p>

        <div className="mt-2 w-full rounded-2xl border border-[#e8c547]/40 bg-[#061018]/75 px-3 py-2.5 text-center">
          <p className="text-[0.88rem] font-black text-[#f4efe4]">{pitch.headline}</p>
          <p className="mt-1 text-[0.68rem] font-bold leading-5 text-[#e8c547]">{pitch.tagline}</p>
          {pitch.invite ? (
            <p className="mt-1 text-[0.62rem] font-bold text-[#e8c547]">{pitch.invite}</p>
          ) : null}
          <ul className="mt-2 flex flex-wrap justify-center gap-1.5" data-bidi="off">
            {STORE_INTRO_CARD_SECTORS.map((item) => (
              <li
                key={item}
                dir="rtl"
                className="rounded-full border border-[#e8c547]/45 bg-[#061018]/90 px-2 py-0.5 text-[0.62rem] font-extrabold text-[#e8c547] [unicode-bidi:isolate]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-2 w-full rounded-full bg-gradient-to-l from-[#f4efe4] via-[#e8c547] to-[#b8860b] py-1.5 text-center text-[0.78rem] font-black text-[#061018] shadow-[0_0_18px_rgba(232,197,71,0.35)]">
          {storeIntroCardCta(role)}
        </p>

        <div className="mt-auto flex flex-col items-center pb-1 pt-2">
          {qrDataUrl ? (
            <div className="rounded-xl bg-white p-1.5">
              <img src={qrDataUrl} alt="" width={96} height={96} className="h-24 w-24" />
            </div>
          ) : (
            <div className="h-24 w-24 rounded-xl bg-white/90" aria-hidden />
          )}
          <p dir="ltr" className="mt-1.5 text-[0.62rem] font-bold tracking-wide text-[#f4efe4]/90">
            {STORE_SATELLITE_HOST}
          </p>
          <p className="mt-0.5 text-[0.62rem] font-bold text-[#e8c547]">{COPY.scanHint}</p>
        </div>
      </div>
    </div>
  );
}
