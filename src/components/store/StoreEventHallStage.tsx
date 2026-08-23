/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشهد قاعة الدعوة الحرة — يوتيوب في الوسط، تهاني منسّقة، تنويه.
 */
import { STORE_EVENT_LIVE, eventLiveAccent } from '@/config/storeEventLive';
import { StoreHallAtmosphere } from '@/components/store/StoreHallAtmosphere';
import { StoreHallNoticePlaque } from '@/components/store/StoreHallNoticePlaque';
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

      <div className="relative z-10 flex min-h-[32rem] flex-col gap-5 p-4 pt-6 sm:p-5 sm:pt-8 md:p-8">
        {state.host.announcement.trim() ? (
          <StoreHallNoticePlaque text={state.host.announcement.trim()} accent={accent} />
        ) : null}

        <header className="wedding-hall-masthead">
          <p className="hall-masthead-kicker invite-luminous" style={{ color: accent }}>
            {STORE_EVENT_LIVE.hallKickerAr}
          </p>
          <span className="hall-ornament-rule" style={{ ['--hall-ornament' as string]: accent }} aria-hidden />
          <p className="hall-masthead-host">{eventHostInviteLine(state.host)}</p>
          <h2 className="hall-masthead-names invite-luminous">
            {state.host.occasionTitle || STORE_EVENT_LIVE.titleAr}
          </h2>
          <p className="text-base text-white/80">{state.host.eventDate}</p>
          <p className="text-base text-white/70">{state.host.eventTime}</p>
          <p className="text-base text-white/70">{eventPlaceLine(state.host)}</p>
        </header>
        {maps ? (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold"
          >
            <StoreWeddingMapsPin className="h-5 w-5" />
            {STORE_EVENT_LIVE.mapsLabelAr}
          </a>
        ) : null}
        <p className="invite-luminous mx-auto mt-5 max-w-xl text-center text-base leading-8 text-white/90">
          {state.host.welcomeAr}
        </p>

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
              reel={voice === 'women' ? 'event-women' : 'event'}
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
