/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شاشة لاونجا1 — فعالية، ترحيبات، تنويه.
 */
import { STORE_LOUNGE_LIVE, STORE_LOUNGE_LIVE_ACCENT } from '@/config/storeLoungeLive';
import { STORE_HALL_SCREEN_FRAME } from '@/config/storeHallFrames';
import { STORE_LOUNGE_MARKETING_FRAMES } from '@/config/storeMarketingReels';
import { StoreHallFieldPlate } from '@/components/store/StoreHallFieldPlate';
import { StoreHallNoticePlaque } from '@/components/store/StoreHallNoticePlaque';
import { StoreHallOrnamentFrame } from '@/components/store/StoreHallOrnamentFrame';
import { StoreLivePanoramaCycle } from '@/components/store/StoreLivePanoramaCycle';
import { StoreLoungeNightSky } from '@/components/store/StoreLoungeNightSky';
import { StoreShot } from '@/components/store/StoreShot';
import type { LoungeLiveLabState } from '@/lib/storeLoungeLiveLab';
import { loungeScreenTitle, youtubeEmbedSrc } from '@/lib/storeLoungeLiveLab';
import { cn } from '@/lib/utils';

export function StoreLoungeHallStage({
  state,
  className,
  immersive = false,
  preview = false,
}: {
  state: LoungeLiveLabState;
  className?: string;
  immersive?: boolean;
  preview?: boolean;
}) {
  const visible = state.blessings.filter((item) => !item.hidden);
  const ticker = visible
    .map((item) => `${item.name}: ${item.extra ? `${item.cannedText} ${item.extra}` : item.cannedText}`)
    .join('   ·   ');
  const embed = !preview && !state.host.youtubeHidden ? youtubeEmbedSrc(state.host.youtubeUrl) : null;
  const latest = visible.slice(-4).reverse();
  const accent = STORE_LOUNGE_LIVE_ACCENT;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-black text-[#f7edd8]',
        immersive ? 'min-h-[100svh] rounded-none border-0' : 'lounge-frame-glow rounded-[28px] border border-[#d4a574]/45',
        className,
      )}
    >
      <StoreLivePanoramaCycle frames={preview ? STORE_LOUNGE_MARKETING_FRAMES.slice(0, 1) : STORE_LOUNGE_MARKETING_FRAMES} />
      {preview ? null : <StoreLoungeNightSky fixed={false} className="opacity-80" />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/72" />
      {preview ? null : <div className="wedding-hall-lights pointer-events-none absolute inset-0" aria-hidden />}
      <StoreHallOrnamentFrame src={STORE_HALL_SCREEN_FRAME} className="z-[12]" />

      <div className="relative z-10 flex min-h-[32rem] flex-col gap-5 px-6 pb-6 pt-8 sm:px-8 sm:pt-10 md:px-10 md:pt-12">
        {state.host.announcement.trim() ? (
          <StoreHallNoticePlaque text={state.host.announcement.trim()} accent={accent} />
        ) : null}

        <StoreHallFieldPlate>
          <header className="wedding-hall-masthead">
            <div className="hall-masthead-kicker" data-bidi="off" style={{ color: accent }}>
              {STORE_LOUNGE_LIVE.hallKickerAr}
            </div>
            <div className="hall-ornament-rule" style={{ ['--hall-ornament' as string]: accent }} aria-hidden />
            <div className="hall-masthead-host" data-bidi="off">
              {state.host.loungeName}
            </div>
            <div className="hall-masthead-names" data-bidi="off">
              {loungeScreenTitle(state.host)}
            </div>
          </header>
        </StoreHallFieldPlate>
        <StoreHallFieldPlate>
          <div className="max-w-xl text-center text-sm leading-8 text-white/85" data-bidi="off">
            {state.host.welcomeAr}
          </div>
        </StoreHallFieldPlate>

        <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="lounge-frame-glow-soft overflow-hidden rounded-2xl border border-[#d4a574]/35 bg-black/45">
            {embed ? (
              <iframe
                title="فيديو اللاونج"
                src={embed}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              state.host.panoramaSrc.startsWith('data:') ? (
                <img src={state.host.panoramaSrc} alt="" className="aspect-video w-full object-cover" />
              ) : (
                <StoreShot
                  src={preview ? STORE_LOUNGE_MARKETING_FRAMES[0] : undefined}
                  reel={preview ? undefined : 'lounge'}
                  alt=""
                  className="aspect-video w-full"
                  eager={!preview}
                />
              )
            )}
          </div>
          <ul className="space-y-3">
            {latest.length ? (
              latest.map((item) => (
                <li key={item.id} className="lounge-frame-glow-soft rounded-2xl border border-[#d4a574]/30 bg-black/50 p-4">
                  <p className="text-sm font-extrabold" style={{ color: accent }}>{item.name}</p>
                  <p className="mt-1 text-sm leading-7">{item.cannedText}</p>
                  {item.extra ? <p className="mt-1 text-sm text-white/70">{item.extra}</p> : null}
                </li>
              ))
            ) : (
              <li className="lounge-frame-glow-soft rounded-2xl border border-[#d4a574]/30 bg-black/50 p-4 text-sm text-white/55">
                بانتظار أولى الترحيبات على الشاشة.
              </li>
            )}
          </ul>
        </div>

        <div className="mt-auto overflow-hidden border-t pt-4" style={{ borderColor: `${accent}4d` }}>
          <p className="wedding-live-ticker whitespace-nowrap text-sm text-[#f4e6c8]" data-bidi="off">
            {ticker || 'بانتظار أولى الترحيبات على شاشة اللاونج'}
          </p>
        </div>
      </div>
    </div>
  );
}
