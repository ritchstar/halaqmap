import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Clapperboard, Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchPartnerPromoVideoPublic } from '@/lib/partnerPromoVideoPublic';

const STORAGE_PREFIX = 'halaqmap_partner_promo_autoplay_';
const NARROW_MQ = '(max-width: 767px)';

function useNarrowScreen() {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(NARROW_MQ).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(NARROW_MQ);
    const fn = () => setNarrow(mql.matches);
    mql.addEventListener('change', fn);
    return () => mql.removeEventListener('change', fn);
  }, []);
  return narrow;
}

export function PartnerPromoVideoBand() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mountedRef = useRef(true);
  const narrow = useNarrowScreen();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [payload, setPayload] = useState<{ videoUrl: string | null; updatedAt: string | null }>({
    videoUrl: null,
    updatedAt: null,
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unmuteHint, setUnmuteHint] = useState(false);

  const showPlayer = !narrow || mobileExpanded;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (narrow === false) {
      setMobileExpanded(false);
    }
  }, [narrow]);

  useEffect(() => {
    let cancelled = false;
    void fetchPartnerPromoVideoPublic().then((r) => {
      if (cancelled || !mountedRef.current) return;
      if (!r.ok) {
        setLoadError(null);
        setPayload({ videoUrl: null, updatedAt: null });
        return;
      }
      setLoadError(null);
      setPayload({ videoUrl: r.videoUrl, updatedAt: r.updatedAt });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tryAutoplayOnce = useCallback(() => {
    const v = videoRef.current;
    const url = payload.videoUrl;
    const stamp = payload.updatedAt || '0';
    if (!v || !url) return;
    const key = `${STORAGE_PREFIX}${stamp}`;
    const already = typeof localStorage !== 'undefined' && localStorage.getItem(key) === '1';
    v.muted = true;
    v.playsInline = true;
    if (already) {
      if (mountedRef.current) setUnmuteHint(true);
      return;
    }
    const p = v.play().catch((): undefined => undefined);
    void p.then(() => {
      if (!mountedRef.current) return;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, '1');
      }
      setUnmuteHint(true);
    });
  }, [payload.videoUrl, payload.updatedAt]);

  useEffect(() => {
    if (!payload.videoUrl || !showPlayer) return;
    const v = videoRef.current;
    if (!v) return;
    const t = window.requestAnimationFrame(() => {
      if (!mountedRef.current || !videoRef.current) return;
      videoRef.current.load();
      tryAutoplayOnce();
    });
    return () => window.cancelAnimationFrame(t);
  }, [payload.videoUrl, payload.updatedAt, tryAutoplayOnce, showPlayer]);

  if (!payload.videoUrl) {
    return null;
  }

  return (
    <div className="shrink-0 border-b border-emerald-500/25 bg-gradient-to-b from-[#061923] via-[#0a1628] to-[#071426]">
      <div className="container mx-auto px-3 py-2 md:px-4 md:py-8">
        <div className="mx-auto max-w-3xl">
          {narrow && !mobileExpanded ? (
            <button
              type="button"
              onClick={() => setMobileExpanded(true)}
              className="flex w-full touch-manipulation items-center justify-between gap-3 rounded-xl border border-primary/45 bg-black/30 px-3 py-3 text-right shadow-md ring-1 ring-primary/15 transition-colors hover:border-primary/60 hover:bg-black/40 active:bg-black/50"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5 text-emerald-100">
                <Clapperboard className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">فيديو تعريفي — مسار الخدمات البرمجية للمنصة</p>
                  <p className="text-[11px] text-slate-400">اضغط للعرض دون إزاحة النماذج</p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 shrink-0 text-emerald-200/90" aria-hidden />
            </button>
          ) : (
            <div className="relative rounded-2xl border-2 border-primary/50 bg-black/35 p-1 shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_12px_40px_rgba(0,0,0,0.35)] ring-2 ring-primary/20 md:rounded-2xl">
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/30 via-transparent to-primary/10 opacity-80" />
              <div className="relative rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-2.5 md:p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-right md:mb-3">
                  <div className="flex items-center gap-2 text-emerald-100">
                    <Clapperboard className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-white">فيديو تعريفي — مسار الخدمات البرمجية للمنصة</p>
                      <p className="text-xs text-slate-400">شغّل الصوت من أزرار المشغّل إن رغبت</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {narrow ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 border-white/25 px-2 text-xs text-emerald-100 touch-manipulation hover:bg-white/10"
                        onClick={() => setMobileExpanded(false)}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                        إخفاء
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-1 border border-white/15 bg-white/10 text-white touch-manipulation hover:bg-white/20"
                      onClick={() => {
                        const v = videoRef.current;
                        if (!v) return;
                        v.currentTime = 0;
                        void v.play();
                      }}
                    >
                      <Play className="h-4 w-4" />
                      إعادة التشغيل
                    </Button>
                    {unmuteHint ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1 border-primary/40 text-emerald-100 touch-manipulation hover:bg-primary/15"
                        onClick={() => {
                          const v = videoRef.current;
                          if (!v) return;
                          v.muted = false;
                          void v.play();
                        }}
                      >
                        <Volume2 className="h-4 w-4" />
                        تشغيل الصوت
                      </Button>
                    ) : null}
                  </div>
                </div>
                {loadError ? <p className="text-center text-sm text-red-300">{loadError}</p> : null}
                <div className="overflow-hidden rounded-lg border border-white/10 bg-black shadow-inner">
                  <video
                    ref={videoRef}
                    key={payload.videoUrl}
                    className="aspect-video w-full object-contain"
                    src={payload.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                  >
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
