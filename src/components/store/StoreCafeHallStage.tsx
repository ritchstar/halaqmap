/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شاشات كافينا1: رئيسية وهادئة وقائمة.
 */
import QRCode from 'react-qr-code';
import { STORE_CAFE_LIVE, STORE_CAFE_LIVE_ACCENT } from '@/config/storeCafeLive';
import { STORE_LOUNGE_MARKETING_FRAMES } from '@/config/storeMarketingReels';
import { StoreHallNoticePlaque } from '@/components/store/StoreHallNoticePlaque';
import { StoreHallVideoWell } from '@/components/store/StoreHallVideoWell';
import { StoreLivePanoramaCycle } from '@/components/store/StoreLivePanoramaCycle';
import { StoreShot } from '@/components/store/StoreShot';
import {
  cafeBlessingOnScreen,
  cafeScreenTitle,
  youtubeEmbedSrc,
  type CafeLabState,
} from '@/lib/storeCafeLiveLab';
import { cn } from '@/lib/utils';

export type CafeScreenMode = 'main' | 'quiet' | 'menu';

export function StoreCafeHallStage({
  state,
  mode = 'main',
  className,
  immersive = false,
  guestUrl = '',
  screenLive = true,
}: {
  state: CafeLabState;
  mode?: CafeScreenMode;
  className?: string;
  immersive?: boolean;
  guestUrl?: string;
  screenLive?: boolean;
}) {
  const visible = state.blessings.filter(cafeBlessingOnScreen);
  const ticker = visible
    .map((item) => `${item.name}: ${item.extra ? `${item.cannedText} ${item.extra}` : item.cannedText}`)
    .join('   ·   ');
  const embed = !state.host.youtubeHidden ? youtubeEmbedSrc(state.host.youtubeUrl) : null;
  const latest = visible.slice(-4).reverse();
  const accent = STORE_CAFE_LIVE_ACCENT;
  const featured = state.shelf.filter((item) => item.inStock && item.featured).slice(0, 8);
  const menuRows = state.shelf.filter((item) => item.inStock).slice(0, 18);
  const quiet = mode === 'quiet';
  const menu = mode === 'menu';

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-black text-[#f7edd8]',
        immersive ? 'min-h-[100svh] rounded-none border-0' : 'rounded-[28px] border border-[#c48a4a]/45',
        className,
      )}
    >
      <StoreLivePanoramaCycle frames={STORE_LOUNGE_MARKETING_FRAMES} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/78" />

      <div className="relative z-10 flex min-h-[36rem] flex-col gap-4 p-4 pt-5 sm:p-6 sm:pt-7 md:p-8">
        {state.host.announcement.trim() ? (
          <StoreHallNoticePlaque text={state.host.announcement.trim()} accent={accent} />
        ) : null}

        <header className="wedding-hall-masthead">
          <p className="mb-2 text-center text-[11px] tracking-wide text-white/55">
            {screenLive ? STORE_CAFE_LIVE.screenLiveAr : STORE_CAFE_LIVE.screenStaleAr}
          </p>
          <div className="hall-masthead-kicker" data-bidi="off" style={{ color: accent }}>
            {menu ? STORE_CAFE_LIVE.menuScreenTitleAr : quiet ? STORE_CAFE_LIVE.quietScreenTitleAr : STORE_CAFE_LIVE.hallKickerAr}
          </div>
          <div className="hall-ornament-rule" style={{ ['--hall-ornament' as string]: accent }} aria-hidden />
          <div className="hall-masthead-host" data-bidi="off">
            {state.host.shopName}
          </div>
          {quiet ? null : (
            <div className="hall-masthead-names" data-bidi="off">
              {cafeScreenTitle(state.host)}
            </div>
          )}
        </header>

        {menu ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {state.host.flashAr ? (
              <p className="sm:col-span-2 rounded-2xl border border-[#c48a4a]/40 bg-black/55 px-4 py-3 text-center text-sm font-extrabold">
                {state.host.flashAr}
              </p>
            ) : null}
            {menuRows.map((item) => (
              <p key={item.catalogId} className="flex justify-between rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-sm">
                <span>{item.nameAr}</span>
                <span style={{ color: accent }}>{item.price} ر.س</span>
              </p>
            ))}
            {state.host.customFields.filter(Boolean).map((field) => (
              <p key={field} className="sm:col-span-2 text-center text-sm leading-7 text-white/80">
                {field}
              </p>
            ))}
          </div>
        ) : (
          <>
            <div className="wedding-hall-center">
              {quiet ? null : (
                <div className="wedding-hall-glow max-w-xl text-center text-sm leading-8 text-white/85" data-bidi="off">
                  {state.host.welcomeAr}
                </div>
              )}
              <StoreHallVideoWell
                title="فيديو المقهى"
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
            {quiet ? null : (
              <>
                {state.host.flashAr ? (
                  <p className="rounded-2xl border border-[#c48a4a]/35 bg-black/50 px-4 py-3 text-center text-sm font-extrabold">
                    {state.host.flashAr}
                  </p>
                ) : null}
                {featured.length ? (
                  <ul className="mx-auto grid w-full max-w-4xl gap-3 sm:grid-cols-2">
                    {featured.slice(0, 4).map((item) => (
                      <li key={item.catalogId} className="rounded-2xl border border-[#c48a4a]/30 bg-black/50 p-4">
                        <p className="text-sm font-extrabold" style={{ color: accent }}>{item.nameAr}</p>
                        <p className="mt-1 text-sm">{item.price} ر.س</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <ul className="mx-auto grid w-full max-w-4xl gap-3 sm:grid-cols-2">
                  {latest.length ? (
                    latest.map((item) => (
                      <li key={item.id} className="rounded-2xl border border-[#c48a4a]/30 bg-black/50 p-4">
                        <p className="text-sm font-extrabold" style={{ color: accent }}>{item.name}</p>
                        <p className="mt-1 text-sm leading-7">{item.cannedText}</p>
                        {item.extra ? <p className="mt-1 text-sm text-white/70">{item.extra}</p> : null}
                      </li>
                    ))
                  ) : (
                    <li className="flex flex-col items-center gap-3 rounded-2xl border border-[#c48a4a]/30 bg-black/50 p-5 text-center sm:col-span-2 sm:flex-row sm:text-right">
                      {guestUrl ? (
                        <div className="rounded-xl bg-white p-2">
                          <QRCode value={guestUrl} size={112} />
                        </div>
                      ) : null}
                      <div>
                        <p className="text-sm font-extrabold text-[#f4efe4]">{STORE_CAFE_LIVE.screenIdleCtaAr}</p>
                        <p className="mt-1 text-xs leading-6 text-white/60">
                          {guestUrl ? STORE_CAFE_LIVE.screenQrHintAr : 'بانتظار أولى المشاركات على الشاشة.'}
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </>
            )}
          </>
        )}

        {quiet || menu ? null : (
          <div className="mt-auto overflow-hidden border-t pt-4" style={{ borderColor: `${accent}4d` }}>
            <p className="wedding-live-ticker whitespace-nowrap text-sm text-[#f4e6c8]" data-bidi="off">
              {ticker || 'بانتظار أولى المشاركات على شاشة المقهى'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
