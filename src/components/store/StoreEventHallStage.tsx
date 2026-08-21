/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشهد قاعة الدعوة الحرة — يوتيوب أو بانوراما، شريط تهاني، تنويه.
 */
import { STORE_EVENT_LIVE, eventLiveAccent } from '@/config/storeEventLive';
import { StoreWeddingMapsPin } from '@/components/store/StoreWeddingMapsPin';
import type { EventLiveLabState } from '@/lib/storeEventLiveLab';
import { eventHostInviteLine, safeMapsHref, youtubeEmbedSrc } from '@/lib/storeEventLiveLab';
import { cn } from '@/lib/utils';

export function StoreEventHallStage({
  state,
  className,
}: {
  state: EventLiveLabState;
  className?: string;
}) {
  const visible = state.blessings.filter((item) => !item.hidden);
  const ticker = visible
    .map((item) => `${item.name}: ${item.extra ? `${item.cannedText} ${item.extra}` : item.cannedText}`)
    .join('   ·   ');
  const embed = !state.host.youtubeHidden ? youtubeEmbedSrc(state.host.youtubeUrl) : null;
  const latest = visible.slice(-4).reverse();
  const maps = safeMapsHref(state.host.venueMapsUrl);
  const stageImage = state.host.youtubeHidden ? state.host.panoramaSrc : state.host.photoSrc;
  const voice = state.host.voice === 'women' ? 'women' : 'men';
  const accent = eventLiveAccent(voice);

  return (
    <div
      data-voice={voice}
      className={cn(
        'relative overflow-hidden rounded-[28px] border bg-black text-[#f7edd8]',
        voice === 'women' ? 'border-[#e4b7c5]/35 text-[#f8eef2]' : 'border-[#d4af67]/35',
        className,
      )}
    >
      <img src={stageImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/80" />

      {state.host.announcement.trim() ? (
        <div
          className="absolute inset-x-4 top-4 z-20 rounded-2xl border bg-black/75 px-4 py-3 text-center"
          style={{ borderColor: accent, boxShadow: `0 0 40px ${accent}40` }}
        >
          <p className="text-sm font-black tracking-wide md:text-lg" style={{ color: accent }}>
            {state.host.announcement.trim()}
          </p>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-[32rem] flex-col p-5 pt-16 md:p-8">
        <p className="text-center text-[11px] tracking-[0.35em]" style={{ color: accent }}>
          {STORE_EVENT_LIVE.hallKickerAr}
        </p>
        <p className="mt-2 text-center text-sm text-white/70">{eventHostInviteLine(state.host)}</p>
        <h2 className="mt-1 text-center text-3xl font-black md:text-5xl">
          {state.host.occasionTitle || STORE_EVENT_LIVE.titleAr}
        </h2>
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
            {STORE_EVENT_LIVE.mapsLabelAr}
          </a>
        ) : null}
        <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-8 text-white/85">{state.host.welcomeAr}</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
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
                {voice === 'women'
                  ? 'أرسلي تهنئة من تجربة الضيفة لتظهر هنا فوراً.'
                  : 'أرسل تهنئة من تجربة الضيف لتظهر هنا فوراً.'}
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
        <p className="mt-3 text-center text-[10px] text-white/40">{STORE_EVENT_LIVE.hallStampAr}</p>
      </div>
    </div>
  );
}
