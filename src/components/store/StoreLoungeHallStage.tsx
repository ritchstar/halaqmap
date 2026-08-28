/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شاشة لاونجا1 — فعالية، ترحيبات، تنويه.
 */
import QRCode from 'react-qr-code';
import { STORE_LOUNGE_LIVE, STORE_LOUNGE_LIVE_ACCENT } from '@/config/storeLoungeLive';
import { STORE_LOUNGE_MARKETING_FRAMES } from '@/config/storeMarketingReels';
import { StoreHallNoticePlaque } from '@/components/store/StoreHallNoticePlaque';
import { StoreHallVideoWell } from '@/components/store/StoreHallVideoWell';
import { StoreLivePanoramaCycle } from '@/components/store/StoreLivePanoramaCycle';
import { StoreLoungeNightSky } from '@/components/store/StoreLoungeNightSky';
import { StoreShopPlacePin } from '@/components/store/StoreShopPlacePin';
import { StoreShot } from '@/components/store/StoreShot';
import type { LoungeLiveLabState } from '@/lib/storeLoungeLiveLab';
import { loungeBlessingOnScreen, loungeScreenTitle, youtubeEmbedSrc } from '@/lib/storeLoungeLiveLab';
import { cn } from '@/lib/utils';

export function StoreLoungeHallStage({
  state,
  className,
  immersive = false,
  guestUrl = '',
  screenLive = true,
}: {
  state: LoungeLiveLabState;
  className?: string;
  immersive?: boolean;
  guestUrl?: string;
  screenLive?: boolean;
}) {
  const visible = state.blessings.filter(loungeBlessingOnScreen);
  const ticker = visible
    .map((item) => `${item.name}: ${item.extra ? `${item.cannedText} ${item.extra}` : item.cannedText}`)
    .join('   ·   ');
  const embed = !state.host.youtubeHidden ? youtubeEmbedSrc(state.host.youtubeUrl) : null;
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
      <StoreLivePanoramaCycle frames={STORE_LOUNGE_MARKETING_FRAMES} />
      <StoreLoungeNightSky fixed={false} className="opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/72" />
      <div className="wedding-hall-lights pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex min-h-[36rem] flex-col gap-4 p-4 pt-5 sm:p-6 sm:pt-7 md:p-8">
        {state.host.announcement.trim() ? (
          <StoreHallNoticePlaque text={state.host.announcement.trim()} accent={accent} />
        ) : null}

        <header className="wedding-hall-masthead">
          <p className="mb-2 text-center text-[11px] tracking-wide text-white/55">
            {screenLive ? STORE_LOUNGE_LIVE.screenLiveAr : STORE_LOUNGE_LIVE.screenStaleAr}
          </p>
          <div className="hall-masthead-kicker" data-bidi="off" style={{ color: accent }}>
            {STORE_LOUNGE_LIVE.hallKickerAr}
          </div>
          <div className="hall-ornament-rule" style={{ ['--hall-ornament' as string]: accent }} aria-hidden />
          <div className="hall-masthead-host flex items-center justify-center gap-2" data-bidi="off">
            <span>{state.host.loungeName}</span>
            <StoreShopPlacePin
              mapsUrl={state.host.pickupMapsUrl}
              visible={state.host.pickupPlaceVisible}
              accent={accent}
              labelAr={STORE_LOUNGE_LIVE.pickupPinAriaAr}
            />
          </div>
          <div className="hall-masthead-names" data-bidi="off">
            {loungeScreenTitle(state.host)}
          </div>
        </header>

        <div className="wedding-hall-center">
          <div className="wedding-hall-glow max-w-xl text-center text-sm leading-8 text-white/85" data-bidi="off">
            {state.host.welcomeAr}
          </div>
          <StoreHallVideoWell
            title="فيديو اللاونج"
            embed={embed}
            fallback={
              state.host.panoramaSrc.startsWith('data:') ? (
                <img src={state.host.panoramaSrc} alt="" />
              ) : (
                <StoreShot reel="lounge" alt="" className="h-full w-full" eager />
              )
            }
          />
        </div>

        <ul className="mx-auto grid w-full max-w-4xl gap-3 sm:grid-cols-2">
          {latest.length ? (
            latest.map((item) => (
              <li key={item.id} className="lounge-frame-glow-soft rounded-2xl border border-[#d4a574]/30 bg-black/50 p-4">
                <p className="text-sm font-extrabold" style={{ color: accent }}>{item.name}</p>
                <p className="mt-1 text-sm leading-7">{item.cannedText}</p>
                {item.extra ? <p className="mt-1 text-sm text-white/70">{item.extra}</p> : null}
              </li>
            ))
          ) : (
            <li className="lounge-frame-glow-soft flex flex-col items-center gap-3 rounded-2xl border border-[#d4a574]/30 bg-black/50 p-5 text-center sm:col-span-2 sm:flex-row sm:text-right">
              {guestUrl ? (
                <div className="rounded-xl bg-white p-2">
                  <QRCode value={guestUrl} size={112} />
                </div>
              ) : null}
              <div>
                <p className="text-sm font-extrabold text-[#f4efe4]">{STORE_LOUNGE_LIVE.screenIdleCtaAr}</p>
                <p className="mt-1 text-xs leading-6 text-white/60">
                  {guestUrl ? STORE_LOUNGE_LIVE.screenQrHintAr : 'بانتظار أولى الترحيبات على الشاشة.'}
                </p>
              </div>
            </li>
          )}
        </ul>

        <div className="mt-auto overflow-hidden border-t pt-4" style={{ borderColor: `${accent}4d` }}>
          <p className="wedding-live-ticker whitespace-nowrap text-sm text-[#f4e6c8]" data-bidi="off">
            {ticker || 'بانتظار أولى الترحيبات على شاشة اللاونج'}
          </p>
        </div>
      </div>
    </div>
  );
}
