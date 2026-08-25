/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة QR عمودية لواجهة المتجر — مناسبة لشاشة الآيفون وللتحميل PNG.
 */
import { useCallback, useState } from 'react';
import QRCode from 'react-qr-code';
import { Copy, Download } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { STORE_VISUALS } from '@/config/storeFront';
import {
  STORE_QR_BOARD_COLORS as C,
  STORE_QR_BOARD_COPY as COPY,
  storeQrBoardTargetUrl,
} from '@/config/storeQrBoard';
import { downloadStoreQrBoardPng } from '@/lib/storeQrBoardPng';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

function GoldCorner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('pointer-events-none absolute h-5 w-5 border-[#e8c547]', className)}
    />
  );
}

export function StoreQrBoard({ className }: Props) {
  const targetUrl = storeQrBoardTargetUrl();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyUrl = useCallback(() => {
    void navigator.clipboard.writeText(targetUrl).then(
      () => {
        setCopied(true);
        toast.success(COPY.copiedAr);
        window.setTimeout(() => setCopied(false), 2200);
      },
      () => toast.error(COPY.copyFailAr),
    );
  }, [targetUrl]);

  const downloadPng = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await downloadStoreQrBoardPng({ targetUrl, fileName: COPY.fileName });
      toast.success(COPY.downloadDoneAr);
    } catch {
      toast.error(COPY.downloadFailAr);
    } finally {
      setBusy(false);
    }
  }, [busy, targetUrl]);

  return (
    <div className={cn('mx-auto flex w-full max-w-[420px] flex-col gap-4', className)}>
      <div
        id="store-qr-board"
        dir="rtl"
        className="relative overflow-hidden rounded-[1.75rem] border border-[#e8c547]/45 text-[#f4efe4] shadow-[0_24px_60px_-20px_rgba(6,16,24,0.75)]"
        style={{
          aspectRatio: '9 / 16',
          backgroundImage:
            'radial-gradient(ellipse 90% 48% at 50% 0%, rgba(232,197,71,0.32), transparent 58%), linear-gradient(168deg, #061018 0%, #0c1a2e 46%, #12243a 100%)',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{
            background: `linear-gradient(90deg, ${C.bronze} 0%, ${C.gold} 48%, ${C.cream} 100%)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-[#f4efe4]/18"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-4 rounded-[1.2rem] border border-[#e8c547]/35"
          aria-hidden
        />

        <div className="relative flex h-full flex-col items-center px-5 pb-5 pt-7 sm:px-6 sm:pt-8">
          <img
            src={STORE_VISUALS.logo}
            alt=""
            width={88}
            height={88}
            className="h-[4.75rem] w-[4.75rem] rounded-full object-cover shadow-[0_0_32px_rgba(232,197,71,0.42)] ring-[3px] ring-[#e8c547]/85 sm:h-24 sm:w-24"
            decoding="async"
          />
          <p dir="ltr" className="mt-2 text-xs font-black tracking-[0.1em] text-[#f4efe4] sm:text-sm">
            {COPY.brandLatin}
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight text-[#e8c547] sm:text-3xl">
            {COPY.brandAr}
          </h1>
          <p className="mt-2 text-center text-sm font-extrabold text-[#f4efe4] sm:text-base">
            {COPY.headlineAr}
          </p>
          <p className="mt-2 max-w-[18rem] text-center text-[0.72rem] font-bold leading-5 text-white/70 sm:text-xs sm:leading-6">
            {COPY.leadAr}
          </p>

          <p className="mt-5 rounded-full border border-[#e8c547]/55 bg-[#061018]/80 px-4 py-1.5 text-xs font-extrabold text-[#e8c547] sm:text-sm">
            {COPY.kickerAr}
          </p>

          <div className="mt-4 flex flex-1 flex-col items-center justify-center">
            <div className="relative rounded-2xl bg-[#f4efe4] p-3.5 shadow-[0_0_32px_rgba(232,197,71,0.35)] ring-[3px] ring-[#e8c547] ring-offset-[3px] ring-offset-[#0c1a2e] sm:p-4">
              <GoldCorner className="start-1.5 top-1.5 rounded-tl-md border-s-[3px] border-t-[3px]" />
              <GoldCorner className="end-1.5 top-1.5 rounded-tr-md border-e-[3px] border-t-[3px]" />
              <GoldCorner className="bottom-1.5 start-1.5 rounded-bl-md border-s-[3px] border-b-[3px]" />
              <GoldCorner className="bottom-1.5 end-1.5 rounded-br-md border-e-[3px] border-b-[3px]" />
              <div className="relative">
                <QRCode
                  value={targetUrl}
                  size={220}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  fgColor={C.qrDark}
                  bgColor={C.qrLight}
                  level="H"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <img
                    src={STORE_VISUALS.logo}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-[#e8c547] shadow-[0_0_12px_rgba(232,197,71,0.55)]"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
            <p
              dir="ltr"
              className="mt-3 max-w-[16rem] break-all text-center text-[0.7rem] font-black leading-tight text-[#e8c547] sm:text-xs"
            >
              {COPY.hostLine}
            </p>
            <p className="mt-1 text-center text-[0.65rem] font-bold text-[#d4af67]">{COPY.verifiedAr}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-1 pb-[env(safe-area-inset-bottom,0px)] sm:flex-row">
        <button
          type="button"
          onClick={() => void downloadPng()}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#e8c547] px-4 py-3 text-sm font-extrabold text-[#061018] shadow-[0_12px_30px_-12px_rgba(232,197,71,0.8)] hover:bg-[#f0d36a] disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden />
          {busy ? COPY.downloadingAr : COPY.downloadAr}
        </button>
        <button
          type="button"
          onClick={copyUrl}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#e8c547]/55 px-4 py-3 text-sm font-extrabold text-[#e8c547] hover:bg-[#e8c547]/10"
        >
          <Copy className="h-4 w-4" aria-hidden />
          {copied ? COPY.copiedAr : COPY.copyAr}
        </button>
      </div>
      <p className="px-1 text-center text-xs leading-6 text-white/55">{COPY.hintAr}</p>
    </div>
  );
}
