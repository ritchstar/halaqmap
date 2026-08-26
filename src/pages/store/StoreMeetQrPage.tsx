/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة رمز متجر خريطة الحل للعرض من الآيفون أثناء المقابلات.
 */
import { useEffect, useState } from 'react';
import { Download, Maximize2, Minimize2 } from 'lucide-react';
import { StoreMeetQrBoard } from '@/components/store/StoreMeetQrBoard';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { STORE_MEET_QR_COPY as COPY, STORE_MEET_QR_TARGET_URL } from '@/config/storeMeetQr';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { renderStoreMeetQrPng, saveStoreMeetQrPng, storeMeetQrDataUrl } from '@/lib/storeMeetQr';

export default function StoreMeetQrPage() {
  useDocumentTitle(COPY.documentTitle);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [present, setPresent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    ProductEvents.storeMeetQrView();
  }, []);

  useEffect(() => {
    let cancelled = false;
    storeMeetQrDataUrl(720)
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!present || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return undefined;
    }
    let sentinel: WakeLockSentinel | null = null;
    const lock = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        sentinel = null;
      }
    };
    void lock();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void lock();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [present]);

  const onSave = async () => {
    if (!qrDataUrl) return;
    setBusy(true);
    try {
      const blob = await renderStoreMeetQrPng(qrDataUrl);
      const result = await saveStoreMeetQrPng(blob);
      if (!result.ok) {
        if (result.error !== 'cancelled') toast.error(COPY.saveFailAr);
        return;
      }
      toast.success(COPY.saveOkAr);
    } catch {
      toast.error(COPY.saveFailAr);
    } finally {
      setBusy(false);
    }
  };

  const board = <StoreMeetQrBoard qrDataUrl={qrDataUrl} present={present} />;

  if (present) {
    return (
      <div
        dir="rtl"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#061018] px-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={() => setPresent(false)}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full">
          {board}
        </div>
        <button
          type="button"
          onClick={() => setPresent(false)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e8c547]/40 px-4 py-2 text-sm font-bold text-[#e8c547]"
        >
          <Minimize2 className="h-4 w-4" />
          {COPY.presentExitAr}
        </button>
        <p className="mt-2 text-center text-xs text-[#f4efe4]/60">{COPY.presentTapAr}</p>
      </div>
    );
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-8 md:py-10">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-sm font-bold text-[#e8c547]">{COPY.kickerAr}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#f4efe4]">{COPY.titleAr}</h1>
          <p className="mt-3 text-base leading-8 text-[#f4efe4]/80">{COPY.leadAr}</p>
          <p dir="ltr" className="mt-2 text-sm font-black tracking-wide text-[#e8c547]">
            {COPY.hostLine}
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-lg">{board}</div>
        <div className="mx-auto mt-6 flex max-w-lg flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={() => setPresent(true)}
            className="bg-gradient-to-l from-[#f4efe4] via-[#e8c547] to-[#b8860b] font-black text-[#061018] hover:opacity-95"
          >
            <Maximize2 className="h-4 w-4" />
            {COPY.presentCtaAr}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy || !qrDataUrl}
            onClick={() => void onSave()}
            className="border-[#e8c547]/35 bg-transparent text-[#f4efe4]"
          >
            <Download className="h-4 w-4" />
            {busy ? COPY.savingAr : COPY.saveCtaAr}
          </Button>
        </div>
        <p dir="ltr" className="mt-4 text-center text-xs text-[#f4efe4]/45">
          {STORE_MEET_QR_TARGET_URL}
        </p>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
