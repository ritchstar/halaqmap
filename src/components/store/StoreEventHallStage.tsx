/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشهد قاعة الدعوة الحرة — يوتيوب في الوسط، تهاني منسّقة، تنويه.
 */
import { STORE_EVENT_LIVE, eventLiveAccent } from '@/config/storeEventLive';
import { StoreHallAtmosphere } from '@/components/store/StoreHallAtmosphere';
import { StoreHallNoticePlaque } from '@/components/store/StoreHallNoticePlaque';
import { StoreHallVideoWell } from '@/components/store/StoreHallVideoWell';
import { StoreLivePanoramaCycle } from '@/components/store/StoreLivePanoramaCycle';
import { StoreShot } from '@/components/store/StoreShot';
import { StoreWeddingMapsPin } from '@/components/store/StoreWeddingMapsPin';
import { STORE_EVENT_MARKETING_FRAMES, STORE_EVENT_WOMEN_MARKETING_FRAMES } from '@/config/storeMarketingReels';
import type { EventLiveLabState } from '@/lib/storeEventLiveLab';
import { eventHostInviteLine, eventPlaceLine, safeMapsHref, youtubeEmbedSrc } from '@/lib/storeEventLiveLab';
import { cn } from '@/lib/utils';

export function StoreEventHallStage({
  state,
  className,
  immersive = false,
}: {
  state: EventLiveLabState;
  className?: string;
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
  const accent = eventLiveAccent(voice);
  const reel = voice === 'women' ? 'event-women' : 'event';

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
        frames={voice === 'women' ? STORE_EVENT_WOMEN_MARKETING_FRAMES : STORE_EVENT_MARKETING_FRAMES}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-black/18 to-black/58" />
      <StoreHallAtmosphere voice={voice} />

      <div className="relative z-10 flex min-h-[36rem] flex-col gap-4 p-4 pt-5 sm:p-6 sm:pt-7 md:min-h-[42rem] md:p-8">
        {state.host.announcement.trim() ? (
          <StoreHallNoticePlaque text={state.host.announcement.trim()} accent={accent} />
        ) : null}

        <header className="wedding-hall-masthead">
          <div className="hall-masthead-kicker invite-luminous" data-bidi="off" style={{ color: accent }}>
            {STORE_EVENT_LIVE.hallKickerAr}
          </div>
          <div className="hall-ornament-rule" style={{ ['--hall-ornament' as string]: accent }} aria-hidden />
          <div className="hall-masthead-host" data-bidi="off">
            {eventHostInviteLine(state.host)}
          </div>
          <div className="hall-masthead-names invite-luminous" data-bidi="off">
            {state.host.occasionTitle || STORE_EVENT_LIVE.titleAr}
          </div>
          <div className="text-base text-white/80" data-bidi="off">
            {state.host.eventDate}
          </div>
          <div className="text-base text-white/70" data-bidi="off">
            {state.host.eventTime}
          </div>
          <div className="text-base text-white/70" data-bidi="off">
            {eventPlaceLine(state.host)}
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
            {STORE_EVENT_LIVE.mapsLabelAr}
          </a>
        ) : null}

        <div className="wedding-hall-center">
          <div className="wedding-hall-glow invite-luminous max-w-3xl text-center text-base leading-8 text-white/90 md:text-lg" data-bidi="off">
            {state.host.welcomeAr}
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
