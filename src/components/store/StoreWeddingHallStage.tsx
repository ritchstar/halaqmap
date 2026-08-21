/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشهد قاعة الحفل — يوتيوب أو بانوراما، شريط تهاني، تنويه، ترحيب ثلاثي.
 */
import { useEffect, useState } from 'react';
import { STORE_WEDDING_LIVE, weddingLiveAccent } from '@/config/storeWeddingLive';
import {
  nextWeddingWelcomeSetIndex,
  weddingWelcomeSetAt,
  weddingWelcomeSetCount,
} from '@/config/storeWeddingWelcomeSets';
import { StoreLivePanoramaCycle } from '@/components/store/StoreLivePanoramaCycle';
import { StoreWeddingMapsPin } from '@/components/store/StoreWeddingMapsPin';
import type { WeddingLiveLabState } from '@/lib/storeWeddingLiveLab';
import { safeMapsHref, weddingCoupleLine, weddingHostInviteLine, youtubeEmbedSrc } from '@/lib/storeWeddingLiveLab';
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
    : 'text-sm font-bold leading-7 md:text-base';
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
      <StoreLivePanoramaCycle />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/72" />
      <div className="wedding-hall-lights pointer-events-none absolute inset-0" data-voice={voice} aria-hidden />

      {state.host.announcement.trim() ? (
        <div
          className="wedding-hall-glow absolute inset-x-4 top-4 z-20 rounded-2xl border bg-black/75 px-4 py-3 text-center"
          style={{ borderColor: accent }}
        >
          <p className="text-sm font-black tracking-wide md:text-lg" style={{ color: accent }}>
            {state.host.announcement.trim()}
          </p>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-[32rem] flex-col p-4 pt-14 sm:p-5 sm:pt-16 md:p-8">
        <p className="text-center text-[11px] tracking-[0.35em]" style={{ color: accent }}>عقد قران</p>
        <p className="mt-2 text-center text-sm text-white/70">{weddingHostInviteLine(state.host)}</p>
        <h2 className="mt-1 text-center text-3xl font-black md:text-5xl">{weddingCoupleLine(state.host)}</h2>
        <p className="mt-2 text-center text-sm text-white/75">
          العريس {state.host.groomName}
          {' · '}
          العروس {state.host.brideName}
        </p>
        <p className="mt-3 text-center text-sm text-white/75">{state.host.eventDate}</p>
        <p className="text-center text-sm text-white/65">{state.host.eventTime}</p>
        <p className="text-center text-sm text-white/65">{state.host.venueName}</p>
        {maps ? (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold"
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
          <p className="mb-3 text-[11px] font-bold tracking-wide" style={{ color: accent }}>
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

        <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/45">
            {embed ? (
              <iframe
                title="فيديو المناسبة"
                src={embed}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img src={state.host.panoramaSrc} alt="" className="aspect-video w-full object-cover" />
            )}
          </div>
          <ul className="space-y-3">
            {latest.length ? (
              latest.map((item) => (
                <li key={item.id} className="rounded-2xl border border-white/12 bg-black/50 p-4">
                  <p className="text-sm font-extrabold" style={{ color: accent }}>{item.name}</p>
                  <p className="mt-1 text-sm leading-7">{item.cannedText}</p>
                  {item.extra ? <p className="mt-1 text-sm text-white/70">{item.extra}</p> : null}
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-white/12 bg-black/50 p-4 text-sm text-white/55">
                {voice === 'women' ? 'بانتظار أولى التهاني على الشاشة.' : 'بانتظار أولى التهاني على الشاشة.'}
              </li>
            )}
          </ul>
        </div>

        <div className="mt-auto overflow-hidden border-t pt-4" style={{ borderColor: `${accent}4d` }}>
          <p
            className="wedding-live-ticker whitespace-nowrap text-sm"
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
