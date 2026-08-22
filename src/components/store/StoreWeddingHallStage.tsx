/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشهد قاعة الحفل — يوتيوب في الوسط، تهاني منسّقة، تنويه، ترحيب ثلاثي.
 */
import { useEffect, useState } from 'react';
import { STORE_WEDDING_LIVE, weddingLiveAccent } from '@/config/storeWeddingLive';
import {
  nextWeddingWelcomeSetIndex,
  weddingWelcomeSetAt,
  weddingWelcomeSetCount,
} from '@/config/storeWeddingWelcomeSets';
import { StoreHallAtmosphere } from '@/components/store/StoreHallAtmosphere';
import { StoreLivePanoramaCycle } from '@/components/store/StoreLivePanoramaCycle';
import { StoreShot } from '@/components/store/StoreShot';
import { StoreWeddingMapsPin } from '@/components/store/StoreWeddingMapsPin';
import { STORE_WEDDING_MARKETING_FRAMES, STORE_WEDDING_WOMEN_MARKETING_FRAMES } from '@/config/storeMarketingReels';
import type { WeddingLiveLabState } from '@/lib/storeWeddingLiveLab';
import {
  safeMapsHref,
  weddingCoupleLine,
  weddingHostInviteLine,
  weddingInvitationLead,
  youtubeEmbedSrc,
} from '@/lib/storeWeddingLiveLab';
import { cn } from '@/lib/utils';

function welcomeSizeClass(weight: 'hero' | 'support' | 'caption', displayTone: boolean): string {
  if (weight === 'hero') {
    return displayTone
      ? 'text-2xl font-black leading-10 md:text-4xl md:leading-snug'
      : 'text-xl font-black leading-9 md:text-3xl md:leading-snug';
  }
  if (weight === 'support') {
    return displayTone
      ? 'text-lg font-extrabold leading-8 md:text-2xl'
      : 'text-base font-extrabold leading-8 md:text-xl';
  }
  return displayTone
    ? 'text-base font-bold leading-7 md:text-lg'
    : 'text-base font-bold leading-7';
}

export function StoreWeddingHallStage({
  state,
  className,
  autoWelcome = false,
  immersive = false,
}: {
  state: WeddingLiveLabState;
  className?: string;
  autoWelcome?: boolean;
  immersive?: boolean;
}) {
  const visible = state.blessings.filter((item) => !item.hidden);
  const ticker = visible
    .map((item) => `${item.name}: ${item.extra ? `${item.cannedText} ${item.extra}` : item.cannedText}`)
    .join('   ·   ');
  const embed = !state.host.youtubeHidden ? youtubeEmbedSrc(state.host.youtubeUrl) : null;
  const latest = visible.slice(-4).reverse();
  const maps = safeMapsHref(state.host.venueMapsUrl);
  const voice = state.host.voice === 'women' ? 'women' : 'men';
  const accent = weddingLiveAccent(voice);
  const pinnedIndex = Number(state.host.welcomeSetIndex) || 0;
  const [cycleIndex, setCycleIndex] = useState(pinnedIndex);
  const invitation = weddingInvitationLead(state.host);

  useEffect(() => {
    setCycleIndex(pinnedIndex);
  }, [pinnedIndex]);

  useEffect(() => {
    if (!autoWelcome || weddingWelcomeSetCount() < 2) return undefined;
    const timer = window.setInterval(() => {
      setCycleIndex((current) => nextWeddingWelcomeSetIndex(current));
    }, 28000);
    return () => window.clearInterval(timer);
  }, [autoWelcome, pinnedIndex]);

  const welcomeSet = weddingWelcomeSetAt(cycleIndex);
  const displayTone = welcomeSet.id === 'display';

  return (
    <div
      data-voice={voice}
      className={cn(
        'relative overflow-hidden bg-black text-[#f7edd8]',
        immersive
          ? 'min-h-[100svh] rounded-none border-0'
          : cn(
              'rounded-[28px] border',
              voice === 'women' ? 'border-[#e4b7c5]/35 text-[#f8eef2]' : 'border-[#d4af67]/35',
            ),
        className,
      )}
    >
      <StoreLivePanoramaCycle
        frames={voice === 'women' ? STORE_WEDDING_WOMEN_MARKETING_FRAMES : STORE_WEDDING_MARKETING_FRAMES}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-black/18 to-black/58" />
      <StoreHallAtmosphere voice={voice} />

      {state.host.announcement.trim() ? (
        <div
          className="wedding-hall-glow absolute inset-x-4 top-4 z-20 rounded-2xl border bg-black/75 px-4 py-3 text-center"
          style={{ borderColor: accent }}
        >
          <p className="invite-luminous text-base font-black tracking-wide md:text-lg" style={{ color: accent }}>
            {state.host.announcement.trim()}
          </p>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-[32rem] flex-col p-4 pt-14 sm:p-5 sm:pt-16 md:p-8">
        <p className="invite-luminous text-center text-sm tracking-[0.35em]" style={{ color: accent }}>
          عقد قران
        </p>
        <p className="mt-2 text-center text-base text-white/75">{weddingHostInviteLine(state.host)}</p>
        <h2 className="invite-luminous mt-1 text-center text-3xl font-black md:text-5xl">
          {weddingCoupleLine(state.host)}
        </h2>
        <p className="invite-luminous mx-auto mt-4 max-w-2xl text-center text-base leading-8 text-white/90 md:text-lg">
          {invitation}
        </p>
        {state.host.welcomeAr.trim() ? (
          <p className="mx-auto mt-3 max-w-xl text-center text-base leading-8 text-white/75">
            {state.host.welcomeAr.trim()}
          </p>
        ) : null}
        <p className="mt-3 text-center text-base text-white/70">{state.host.eventTime}</p>
        {maps ? (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold"
          >
            <StoreWeddingMapsPin className="h-5 w-5" />
            {STORE_WEDDING_LIVE.mapsLabelAr}
          </a>
        ) : null}

        <div
          dir="rtl"
          className="wedding-hall-glow mx-auto mt-6 w-full max-w-2xl rounded-3xl border bg-black/45 px-4 py-5 text-center md:px-6"
          style={{ borderColor: `${accent}66` }}
        >
          <p className="invite-luminous mb-3 text-sm font-bold tracking-wide" style={{ color: accent }}>
            {welcomeSet.toneAr}
          </p>
          <div className="space-y-3">
            {welcomeSet.lines.map((line) => (
              <p
                key={line.id}
                className={cn('chat-arabic-text', welcomeSizeClass(line.weight, displayTone))}
                style={{ color: line.weight === 'hero' ? '#fff8ee' : undefined }}
              >
                {line.textAr}
              </p>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-black/45">
          {embed ? (
            <iframe
              title="فيديو المناسبة"
              src={embed}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : state.host.panoramaSrc.startsWith('data:') ? (
            <img src={state.host.panoramaSrc} alt="" className="aspect-video w-full object-cover" />
          ) : (
            <StoreShot
              reel={voice === 'women' ? 'wedding-women' : 'wedding'}
              alt=""
              className="aspect-video w-full"
            />
          )}
        </div>

        <ul className="mx-auto mt-5 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
          {latest.length ? (
            latest.map((item) => (
              <li key={item.id} className="rounded-2xl border border-white/12 bg-black/50 p-4">
                <p className="invite-luminous text-base font-extrabold" style={{ color: accent }}>
                  {item.name}
                </p>
                <p className="mt-1 text-base leading-7">{item.cannedText}</p>
                {item.extra ? <p className="mt-1 text-base text-white/70">{item.extra}</p> : null}
              </li>
            ))
          ) : (
            <li className="rounded-2xl border border-white/12 bg-black/50 p-4 text-base text-white/55 sm:col-span-2">
              بانتظار أولى التهاني على الشاشة.
            </li>
          )}
        </ul>

        <div className="mt-auto overflow-hidden border-t pt-4" style={{ borderColor: `${accent}4d` }}>
          <p
            className="wedding-live-ticker whitespace-nowrap text-base"
            data-bidi="off"
            style={{ color: voice === 'women' ? '#f4e4ea' : '#f4e6c8' }}
          >
            {ticker || 'بانتظار أولى التهاني على شاشة القاعة'}
          </p>
        </div>
      </div>
    </div>
  );
}
