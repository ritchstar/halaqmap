/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ملصق QR وكرت الجوال ومشاركة الصفحة على القنوات — لوحات الحي.
 */
import type { ReactNode } from 'react';
import QRCode from 'react-qr-code';
import { toast } from '@/components/ui/sonner';
import { StoreProductPassDeskButton } from '@/components/store/StoreProductPassDeskButton';
import { STORE_LIVE_SHOP_SHARE_COPY, storeLiveShopShareCaption } from '@/config/storeLiveShopShare';
import { STORE_PRODUCT_PASS_META, type StoreProductPassKind } from '@/config/storeProductPass';
import type { StoreLiveShopShareKind } from '@/lib/storeHostRedirect';
import {
  liveShopTelegramShareHref,
  liveShopWhatsappShareHref,
  liveShopXShareHref,
} from '@/lib/storeLiveShopShare';
import { passCardAbsoluteUrl } from '@/lib/storeProductPass';
import { cn } from '@/lib/utils';

export function StoreLiveShopShareDesk({
  kind,
  token,
  shopName,
  shopUrl,
  qrPhraseAr,
  qrPrintAr,
  accent,
  qrStamp,
  qrValue,
  afterPrint,
  showTitle = true,
  variant = 'default',
}: {
  kind: StoreLiveShopShareKind;
  token: string;
  shopName: string;
  shopUrl: string;
  qrPhraseAr: string;
  qrPrintAr: string;
  accent: string;
  qrStamp?: string;
  qrValue?: string;
  afterPrint?: ReactNode;
  showTitle?: boolean;
  variant?: 'default' | 'halana';
}) {
  const copy = STORE_LIVE_SHOP_SHARE_COPY;
  const meta = STORE_PRODUCT_PASS_META[kind as StoreProductPassKind];
  const caption = storeLiveShopShareCaption(kind, shopName, shopUrl);
  const printId = `${kind}-qr-print`;
  const qrCodeValue = qrValue ?? shopUrl;
  const cardUrl = passCardAbsoluteUrl({
    kind: kind as StoreProductPassKind,
    token,
    name: shopName.trim().slice(0, 40) || meta.skuAr,
    role: kind === 'halana' ? 'specialist' : 'owner',
    shopName: shopName.trim().slice(0, 40) || meta.skuAr,
    qrStamp: qrStamp || '',
  });
  const cardCaption = `${meta.skuAr}\n${cardUrl}`;
  const shellClass =
    variant === 'halana' ? 'halana-form-card space-y-4 rounded-2xl p-5' : 'space-y-4 rounded-2xl border border-white/12 p-4';
  const titleClass = variant === 'halana' ? 'halana-title-sm' : 'text-lg font-extrabold';
  const buttonClass =
    variant === 'halana'
      ? 'rounded-full border border-white/20 py-2 text-center text-sm font-bold'
      : 'rounded-full border border-white/20 py-2 text-center text-sm font-bold';
  const printButtonClass =
    variant === 'halana'
      ? 'w-full rounded-full py-2.5 text-sm font-extrabold text-[#14080c]'
      : 'w-full rounded-full py-2 text-sm font-bold text-[#061018]';

  function printQr() {
    const node = document.getElementById(printId);
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

  async function copyThenOpen(href: string) {
    await copyCaption();
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  return (
    <section className={shellClass}>
      {showTitle ? <h2 className={titleClass}>{copy.shareTitleAr}</h2> : null}
      <p className={cn('text-base leading-8', variant === 'halana' ? 'text-[#ffe8c4]/80' : 'text-white/70')}>
        {copy.shareLeadAr}
      </p>
      <div id={printId} className="mx-auto w-64 rounded-xl bg-white p-4 text-center text-[#14080c]">
        <p className="text-sm font-black">{shopName || meta.skuAr}</p>
        <div className="mx-auto my-3 w-40">
          <QRCode value={qrCodeValue} size={160} />
        </div>
        <p className="text-xs leading-6">{qrPhraseAr}</p>
      </div>
      <button type="button" onClick={printQr} className={printButtonClass} style={{ backgroundColor: accent }}>
        {qrPrintAr}
      </button>
      {afterPrint}
      <StoreProductPassDeskButton kind={kind as StoreProductPassKind} token={token} shopName={shopName} qrStamp={qrStamp} />
      <a
        href={liveShopWhatsappShareHref(cardCaption)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('flex w-full items-center justify-center', buttonClass)}
      >
        {meta.skuAr} · {copy.shareWhatsappAr}
      </a>
      <p className={cn('text-sm leading-7', variant === 'halana' ? 'text-white/70' : 'text-white/55')}>{copy.instagramHintAr}</p>
      <pre
        className={cn(
          'whitespace-pre-wrap text-sm leading-7',
          variant === 'halana' ? 'halana-promo-card text-white/80' : 'rounded-xl border border-white/10 bg-black/20 p-3 text-white/75',
        )}
      >
        {caption}
      </pre>
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => void copyCaption()} className={buttonClass}>
          {copy.shareCopyAr}
        </button>
        <a href={liveShopWhatsappShareHref(caption)} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          {copy.shareWhatsappAr}
        </a>
        <button type="button" onClick={() => void copyThenOpen('https://www.instagram.com/')} className={buttonClass}>
          {copy.shareInstagramAr}
        </button>
        <button type="button" onClick={() => void copyThenOpen('https://www.snapchat.com/')} className={buttonClass}>
          {copy.shareSnapAr}
        </button>
        <button type="button" onClick={() => void copyThenOpen('https://www.tiktok.com/')} className={buttonClass}>
          {copy.shareTiktokAr}
        </button>
        <a href={liveShopTelegramShareHref(shopUrl, caption)} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          {copy.shareTelegramAr}
        </a>
        <a href={liveShopXShareHref(shopUrl, caption)} target="_blank" rel="noopener noreferrer" className={cn(buttonClass, 'sm:col-span-2')}>
          {copy.shareXAr}
        </a>
      </div>
    </section>
  );
}
