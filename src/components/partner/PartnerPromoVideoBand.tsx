import { useCallback, useEffect, useRef, useState } from 'react';
import { Clapperboard, Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchPartnerPromoVideoPublic } from '@/lib/partnerPromoVideoPublic';

const STORAGE_PREFIX = 'halaqmap_partner_promo_autoplay_';

export function PartnerPromoVideoBand() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mountedRef = useRef(true);
  const [payload, setPayload] = useState<{ videoUrl: string | null; updatedAt: string | null }>({
    videoUrl: null,
    updatedAt: null,
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unmuteHint, setUnmuteHint] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
    const p = v.play().catch(() => undefined);
    void p.then(() => {
      if (!mountedRef.current) return;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, '1');
      }
      setUnmuteHint(true);
    });
  }, [payload.videoUrl, payload.updatedAt]);

  useEffect(() => {
    if (!payload.videoUrl) return;
    const v = videoRef.current;
    if (!v) return;
    const t = window.requestAnimationFrame(() => {
      if (!mountedRef.current || !videoRef.current) return;
      videoRef.current.load();
      tryAutoplayOnce();
    });
    return () => window.cancelAnimationFrame(t);
  }, [payload.videoUrl, payload.updatedAt, tryAutoplayOnce]);

  if (!payload.videoUrl) {
    return null;
  }

  return (
    <div className="border-b border-emerald-500/25 bg-gradient-to-b from-[#061923] via-[#0a1628] to-[#071426]">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl border-2 border-primary/50 bg-black/35 p-1 shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_12px_40px_rgba(0,0,0,0.35)] ring-2 ring-primary/20">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/30 via-transparent to-primary/10 opacity-80" />
            <div className="relative rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-3 md:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-right">
                <div className="flex items-center gap-2 text-emerald-100">
                  <Clapperboard className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">فيديو تعريفي — مسار الشركاء</p>
                    <p className="text-xs text-slate-400">شغّل الصوت من أزرار المشغّل إن رغبت</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="gap-1 border border-white/15 bg-white/10 text-white hover:bg-white/20"
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
                      className="gap-1 border-primary/40 text-emerald-100 hover:bg-primary/15"
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
        </div>
      </div>
    </div>
  );
}
