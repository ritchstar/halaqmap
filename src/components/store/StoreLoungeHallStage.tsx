/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شاشة لاونجا1 — فعالية، ترحيبات، تنويه.
 */
import { STORE_LOUNGE_LIVE, STORE_LOUNGE_LIVE_ACCENT } from '@/config/storeLoungeLive';
import { StoreLivePanoramaCycle } from '@/components/store/StoreLivePanoramaCycle';
import type { LoungeLiveLabState } from '@/lib/storeLoungeLiveLab';
import { loungeScreenTitle, youtubeEmbedSrc } from '@/lib/storeLoungeLiveLab';
import { cn } from '@/lib/utils';

export function StoreLoungeHallStage({
  state,
  className,
  immersive = false,
}: {
  state: LoungeLiveLabState;
  className?: string;
  immersive?: boolean;
}) {
  const visible = state.blessings.filter((item) => !item.hidden);
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
        immersive ? 'min-h-[100svh] rounded-none border-0' : 'rounded-[28px] border border-[#d4a574]/35',
        className,
      )}
    >
      <StoreLivePanoramaCycle />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/72" />
      <div className="wedding-hall-lights pointer-events-none absolute inset-0" aria-hidden />

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

      <div className="relative z-10 flex min-h-[32rem] flex-col p-4 pt-14 sm:p-5 sm:pt-16 md:p-8">
        <p className="text-center text-[11px] tracking-[0.35em]" style={{ color: accent }}>
          {STORE_LOUNGE_LIVE.hallKickerAr}
        </p>
        <p className="mt-2 text-center text-sm text-white/70">{state.host.loungeName}</p>
        <h2 className="mt-1 text-center text-3xl font-black md:text-5xl">{loungeScreenTitle(state.host)}</h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-8 text-white/85">{state.host.welcomeAr}</p>

        <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/45">
            {embed ? (
              <iframe
                title="فيديو اللاونج"
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
