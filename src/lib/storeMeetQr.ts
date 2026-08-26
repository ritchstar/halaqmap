/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صورة رمز المقابلة لشاشة الآيفون وألبوم الصور.
 */
import QRCode from 'qrcode';
import { STORE_VISUALS } from '@/config/storeFront';
import {
  STORE_BRAND_LATIN,
  STORE_MEET_QR_COPY as COPY,
  STORE_MEET_QR_SECTORS,
  STORE_MEET_QR_TARGET_URL,
  STORE_PUBLIC_NAME_AR,
} from '@/config/storeMeetQr';
import { saveStoreIntroCardPng } from '@/lib/storeIntroCard';

const FONT = "Tajawal, 'Segoe UI', Tahoma, Arial, sans-serif";
const NAVY = {
  bg0: '#061018',
  bg1: '#0c1a2e',
  gold: '#e8c547',
  cream: '#f4efe4',
} as const;

export async function storeMeetQrDataUrl(size = 720): Promise<string> {
  return QRCode.toDataURL(STORE_MEET_QR_TARGET_URL, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: size,
    color: { dark: NAVY.bg0, light: '#ffffff' },
  });
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    const timer = window.setTimeout(() => resolve(null), 4000);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export async function renderStoreMeetQrPng(qrDataUrl: string): Promise<Blob> {
  const logo = await loadImageSafe(STORE_VISUALS.logo);
  const qr = await loadImageSafe(qrDataUrl);
  const w = 1080;
  const h = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, NAVY.bg0);
  bg.addColorStop(0.55, NAVY.bg1);
  bg.addColorStop(1, '#12243a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const bar = ctx.createLinearGradient(0, 0, w, 0);
  bar.addColorStop(0, '#b8860b');
  bar.addColorStop(0.5, NAVY.gold);
  bar.addColorStop(1, NAVY.cream);
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, w, 18);

  const mark = 168;
  const markX = (w - mark) / 2;
  const markY = 88;
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, markY + mark / 2, mark / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, markX, markY, mark, mark);
    ctx.restore();
    ctx.strokeStyle = 'rgba(232,197,71,0.85)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(w / 2, markY + mark / 2, mark / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillStyle = NAVY.cream;
  ctx.font = `800 32px ${FONT}`;
  ctx.fillText(STORE_BRAND_LATIN, w / 2, markY + mark + 56);

  ctx.direction = 'rtl';
  ctx.fillStyle = NAVY.gold;
  ctx.font = `900 52px ${FONT}`;
  ctx.fillText(STORE_PUBLIC_NAME_AR, w / 2, markY + mark + 118);

  ctx.fillStyle = NAVY.cream;
  ctx.font = `700 28px ${FONT}`;
  ctx.fillText(COPY.kickerAr, w / 2, markY + mark + 168);

  const qrBox = 720;
  const boxX = (w - qrBox) / 2;
  const boxY = markY + mark + 214;
  ctx.fillStyle = NAVY.gold;
  roundRect(ctx, boxX - 18, boxY - 18, qrBox + 36, qrBox + 36, 36);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, boxX, boxY, qrBox, qrBox, 24);
  ctx.fill();
  if (qr) ctx.drawImage(qr, boxX + 28, boxY + 28, qrBox - 56, qrBox - 56);

  ctx.direction = 'ltr';
  ctx.fillStyle = NAVY.cream;
  ctx.font = `800 34px ${FONT}`;
  ctx.fillText(COPY.hostLine, w / 2, boxY + qrBox + 78);

  ctx.direction = 'rtl';
  ctx.fillStyle = NAVY.gold;
  ctx.font = `800 30px ${FONT}`;
  ctx.fillText(COPY.scanHintAr, w / 2, boxY + qrBox + 128);

  ctx.font = `800 26px ${FONT}`;
  ctx.fillText(STORE_MEET_QR_SECTORS.join('   ·   '), w / 2, boxY + qrBox + 188);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png');
  });
  if (!blob || blob.size < 1) throw new Error('png_blob_failed');
  return blob;
}

export async function saveStoreMeetQrPng(blob: Blob) {
  return saveStoreIntroCardPng({
    blob,
    shareTitle: STORE_PUBLIC_NAME_AR,
    shareText: `${STORE_PUBLIC_NAME_AR}\n${STORE_MEET_QR_TARGET_URL}`,
    preferShare: true,
  });
}
