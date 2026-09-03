/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ملصق QR وكرت الجوال ومشاركة المعرض على القنوات. من لوحة حلانا1 فقط.
 */
import QRCode from 'react-qr-code';
import { toast } from '@/components/ui/sonner';
import { StoreProductPassDeskButton } from '@/components/store/StoreProductPassDeskButton';
import { STORE_HALANA_LIVE_ACCENT, STORE_HALANA_LIVE_COPY } from '@/config/storeHalanaLive';
import {
  halanaPassCardShareUrl,
  halanaShareCaptionAr,
  halanaShowcaseAbsoluteUrl,
  halanaTelegramShareHref,
  halanaWhatsappShareHref,
  halanaXShareHref,
} from '@/lib/storeHalanaShare';

export function StoreHalanaShareDesk({ token, shopName }: { token: string; shopName: string }) {
  const copy = STORE_HALANA_LIVE_COPY;
  const shopUrl = halanaShowcaseAbsoluteUrl(token);
  const caption = halanaShareCaptionAr(shopName, shopUrl);
  const cardUrl = halanaPassCardShareUrl({ token, shopName });
  const cardCaption = `${copy.passWhatsappAr}\n${cardUrl}`;

  function printQr() {
    const node = document.getElementById('halana-qr-print');
    if (!node) return;
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) return;
    win.document.write(`<html lang="ar" dir="rtl"><head><title>ملصق QR</title></head><body>${node.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success(copy.shareCopiedAr);
    } catch {
      toast.error(copy.shareCopyFailAr);
    }
  }

  return (
    <section className="halana-form-card space-y-4 rounded-2xl p-4">
      <h2 className="text-lg font-extrabold">{copy.shareTitleAr}</h2>
      <p className="text-sm leading-7 text-white/70">{copy.shareLeadAr}</p>
      <div id="halana-qr-print" className="mx-auto w-64 rounded-xl bg-white p-4 text-center text-[#14080c]">
        <p className="text-sm font-black">{shopName || copy.titleAr}</p>
        <div className="mx-auto my-3 w-40">
          <QRCode value={shopUrl} size={160} />
        </div>
        <p className="text-xs leading-6">{copy.qrPhraseAr}</p>
      </div>
      <button
        type="button"
        onClick={printQr}
        className="w-full rounded-full py-2.5 text-sm font-extrabold text-[#14080c]"
        style={{ backgroundColor: STORE_HALANA_LIVE_ACCENT }}
      >
        {copy.qrPrintAr}
      </button>
      <StoreProductPassDeskButton kind="halana" token={token} shopName={shopName} />
      <a
        href={halanaWhatsappShareHref(cardCaption)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center rounded-full border border-white/20 py-2 text-sm font-bold"
      >
        {copy.passWhatsappAr}
      </a>
      <p className="text-sm leading-7 text-white/70">{copy.instagramHintAr}</p>
      <pre className="halana-promo-card whitespace-pre-wrap text-sm leading-7 text-white/80">{caption}</pre>
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => void copyCaption()} className="rounded-full border border-white/20 py-2 text-sm font-bold">
          {copy.shareCopyAr}
        </button>
        <a
          href={halanaWhatsappShareHref(caption)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/20 py-2 text-center text-sm font-bold"
        >
          {copy.shareWhatsappAr}
        </a>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => void copyCaption()}
          className="rounded-full border border-white/20 py-2 text-center text-sm font-bold"
        >
          {copy.shareInstagramAr}
        </a>
        <a
          href="https://www.snapchat.com/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => void copyCaption()}
          className="rounded-full border border-white/20 py-2 text-center text-sm font-bold"
        >
          {copy.shareSnapAr}
        </a>
        <a
          href="https://www.tiktok.com/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => void copyCaption()}
          className="rounded-full border border-white/20 py-2 text-center text-sm font-bold"
        >
          {copy.shareTiktokAr}
        </a>
        <a
          href={halanaTelegramShareHref(shopUrl, caption)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/20 py-2 text-center text-sm font-bold"
        >
          {copy.shareTelegramAr}
        </a>
        <a
          href={halanaXShareHref(shopUrl, caption)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/20 py-2 text-center text-sm font-bold sm:col-span-2"
        >
          {copy.shareXAr}
        </a>
      </div>
    </section>
  );
}
