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
import { StoreHallNoticePlaque } from '@/components/store/StoreHallNoticePlaque';
import { StoreHallVideoWell } from '@/components/store/StoreHallVideoWell';
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
  const reel = voice === 'women' ? 'wedding-women' : 'wedding';

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
  const heroLine = welcomeSet.lines.find((line) => line.weight === 'hero') ?? welcomeSet.lines[0];
  const restLines = welcomeSet.lines.filter((line) => line.id !== heroLine.id);

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

      <div className="relative z-10 flex min-h-[36rem] flex-col gap-4 p-4 pt-5 sm:p-6 sm:pt-7 md:min-h-[42rem] md:p-8">
        {state.host.announcement.trim() ? (
          <StoreHallNoticePlaque text={state.host.announcement.trim()} accent={accent} />
        ) : null}

        <header className="wedding-hall-masthead">
          <div className="hall-masthead-kicker invite-luminous" data-bidi="off" style={{ color: accent }}>
            عقد قران
          </div>
          <div className="hall-ornament-rule" style={{ ['--hall-ornament' as string]: accent }} aria-hidden />
          <div className="hall-masthead-host" data-bidi="off">
            {weddingHostInviteLine(state.host)}
          </div>
          <div className="hall-masthead-names invite-luminous" data-bidi="off">
            {weddingCoupleLine(state.host)}
          </div>
          <div className="invite-luminous max-w-2xl text-base leading-8 text-white/90 md:text-lg" data-bidi="off">
            {invitation}
          </div>
          {state.host.welcomeAr.trim() ? (
            <div className="max-w-xl text-base leading-8 text-white/75" data-bidi="off">
              {state.host.welcomeAr.trim()}
            </div>
          ) : null}
          <div className="text-base text-white/70" data-bidi="off">
            {state.host.eventTime}
          </div>
        </header>
        {maps ? (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold"
          >
            <StoreWeddingMapsPin className="h-5 w-5" />
            {STORE_WEDDING_LIVE.mapsLabelAr}
          </a>
        ) : null}

        <div className="wedding-hall-center">
          <div className="wedding-hall-glow w-full max-w-4xl text-center">
            <div className="invite-luminous mb-3 text-sm font-bold tracking-wide" data-bidi="off" style={{ color: accent }}>
              {welcomeSet.toneAr}
            </div>
            <div
              data-bidi="off"
              className={welcomeSizeClass(heroLine.weight, displayTone)}
              style={{ color: '#fff8ee', textAlign: 'center' }}
            >
              {heroLine.textAr}
            </div>
          </div>

          <StoreHallVideoWell
            embed={embed}
            fallback={
              state.host.panoramaSrc.startsWith('data:') ? (
                <img src={state.host.panoramaSrc} alt="" />
              ) : (
                <StoreShot reel={reel} alt="" className="h-full w-full" />
              )
            }
          />

          <div className="w-full max-w-4xl space-y-3 text-center">
            {restLines.map((line) => (
              <div
                key={line.id}
                data-bidi="off"
                className={cn('wedding-hall-glow', welcomeSizeClass(line.weight, displayTone))}
                style={{ textAlign: 'center' }}
              >
                {line.textAr}
              </div>
            ))}
          </div>
        </div>

        <ul className="mx-auto mt-2 grid w-full max-w-4xl gap-3 sm:grid-cols-2">
          {latest.length ? (
            latest.map((item) => (
              <li key={item.id} className="rounded-2xl border border-white/12 bg-black/40 p-4">
                <div className="invite-luminous text-base font-extrabold" data-bidi="off" style={{ color: accent }}>
                  {item.name}
                </div>
                <div className="mt-1 text-base leading-7" data-bidi="off">
                  {item.cannedText}
                </div>
                {item.extra ? (
                  <div className="mt-1 text-base text-white/70" data-bidi="off">
                    {item.extra}
                  </div>
                ) : null}
              </li>
            ))
          ) : (
            <li className="rounded-2xl border border-white/12 bg-black/40 p-4 text-base text-white/55 sm:col-span-2">
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
