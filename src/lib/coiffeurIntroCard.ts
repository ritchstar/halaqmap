/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * توليد بطاقة كوافير ماب للمشاركة — اسم وصفة + عبارات تسويقية قصيرة.
 */
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_BRAND_EN,
  COIFFEUR_BRAND_LOGO_PATH,
} from '@/config/coiffeurMapUmbrella';
import { COIFFEUR_VISUALS } from '@/config/coiffeurVisuals';
import {
  COIFFEUR_INTRO_CARD_COPY as COPY,
  COIFFEUR_INTRO_CARD_SECTORS,
  COIFFEUR_SATELLITE_HOST,
  coiffeurCardPitch,
} from '@/config/coiffeurIntroCardCopy';
import {
  sanitizeCoiffeurCardName,
  sanitizeCoiffeurCardRole,
} from '@/lib/coiffeurCardShare';

export {
  sanitizeCoiffeurCardName,
  sanitizeCoiffeurCardRole,
  sanitizeCoiffeurCardText,
} from '@/lib/coiffeurCardShare';

export type CoiffeurIntroCardSaveResult =
  | { ok: true; method: 'download' | 'share' | 'preview' }
  | { ok: false; error: string };

const FONT = "Tajawal, 'Segoe UI', Tahoma, Arial, sans-serif";
const LOGO_PNG = '/images/coiffeur-map-logo-seal.png';

const WINE = {
  bg0: '#14080e',
  bg1: '#2a1218',
  bg2: '#3a1820',
  cream: '#f7efe8',
  blush: '#f4d4c0',
  rose: '#e8b4a2',
  line: 'rgba(244, 212, 192, 0.55)',
} as const;

function safePngName(fileName: string): string {
  const raw = (fileName || 'coiffeur-map-card.png').trim();
  const withExt = raw.toLowerCase().endsWith('.png') ? raw : `${raw}.png`;
  const ascii = withExt.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');
  return ascii.length > 8 ? ascii : 'coiffeur-map-card.png';
}

function isMobileUa(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  try {
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      try {
        canvas.toBlob((b) => resolve(b), 'image/png');
      } catch (err) {
        reject(err);
      }
    });
    if (blob && blob.size > 0) return blob;
  } catch {
    /* toBlob مرفوض */
  }
  const dataUrl = canvas.toDataURL('image/png');
  const res = await fetch(dataUrl);
  const fromData = await res.blob();
  if (!fromData.size) throw new Error('png_blob_failed');
  return fromData;
}

async function ensureBrandFont(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    if (!document.querySelector('link[data-hm-font="tajawal"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap';
      link.setAttribute('data-hm-font', 'tajawal');
      document.head.appendChild(link);
    }
  } catch {
    /* اختياري */
  }
  try {
    await Promise.race([
      document.fonts.load('800 40px Tajawal', COIFFEUR_BRAND_AR),
      new Promise<void>((r) => setTimeout(r, 900)),
    ]);
  } catch {
    /* خط النظام */
  }
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    const isAbsoluteOtherOrigin =
      /^https?:\/\//i.test(src) &&
      typeof location !== 'undefined' &&
      !src.startsWith(location.origin);
    if (isAbsoluteOtherOrigin) img.crossOrigin = 'anonymous';
    const done = (el: HTMLImageElement | null) => {
      window.clearTimeout(timer);
      resolve(el);
    };
    const timer = window.setTimeout(() => done(null), 4000);
    img.onload = () => done(img);
    img.onerror = () => done(null);
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

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const lines: string[] = [];
  let line = '';

  const pushWord = (word: string) => {
    if (ctx.measureText(word).width <= maxWidth) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
      return;
    }
    if (line) {
      lines.push(line);
      line = '';
    }
    let chunk = '';
    for (const ch of Array.from(word)) {
      const next = chunk + ch;
      if (ctx.measureText(next).width > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk = next;
      }
    }
    line = chunk;
  };

  for (const word of tokens) {
    if (lines.length >= maxLines) break;
    pushWord(word);
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines);
}

function paintWineBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, WINE.bg0);
  bg.addColorStop(0.42, WINE.bg1);
  bg.addColorStop(1, WINE.bg2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.78, 90, 10, w * 0.55, 280, 820);
  glow.addColorStop(0, 'rgba(244, 212, 192, 0.26)');
  glow.addColorStop(1, 'rgba(244, 212, 192, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h * 0.6);

  const stripe = ctx.createLinearGradient(0, 0, w, 0);
  stripe.addColorStop(0, '#c98b96');
  stripe.addColorStop(0.45, '#f4d4c0');
  stripe.addColorStop(1, '#f7efe8');
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, w, 10);

  ctx.strokeStyle = 'rgba(247, 239, 232, 0.42)';
  ctx.lineWidth = 3;
  roundRect(ctx, 36, 36, w - 72, h - 72, 48);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(201, 139, 150, 0.55)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 48, 48, w - 96, h - 96, 40);
  ctx.stroke();
}

function paintPlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 24,
): void {
  ctx.save();
  ctx.shadowColor = 'rgba(244, 212, 192, 0.28)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = 'rgba(20, 8, 14, 0.78)';
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(244, 212, 192, 0.7)';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, radius);
  ctx.stroke();
  ctx.restore();
}

function paintLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
): void {
  ctx.save();
  ctx.shadowColor = 'rgba(247, 239, 232, 0.55)';
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 + 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(244, 212, 192, 0.18)';
  ctx.fill();
  ctx.restore();

  if (!logo || logo.naturalWidth <= 0) {
    ctx.fillStyle = WINE.cream;
    ctx.font = `800 36px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(COIFFEUR_BRAND_AR, x + size / 2, y + size / 2);
    return;
  }
  try {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logo, x, y, size, size);
    ctx.restore();
    ctx.strokeStyle = 'rgba(247, 239, 232, 0.92)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(201, 139, 150, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 9, 0, Math.PI * 2);
    ctx.stroke();
  } catch {
    ctx.restore();
  }
}

function paintMoodBand(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  if (!photo || photo.naturalWidth <= 0) return;
  ctx.save();
  roundRect(ctx, x, y, w, h, 28);
  ctx.clip();
  const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
  const dw = photo.naturalWidth * scale;
  const dh = photo.naturalHeight * scale;
  ctx.drawImage(photo, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  const veil = ctx.createLinearGradient(x, y, x, y + h);
  veil.addColorStop(0, 'rgba(20, 8, 14, 0.15)');
  veil.addColorStop(1, 'rgba(20, 8, 14, 0.45)');
  ctx.fillStyle = veil;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.strokeStyle = 'rgba(247, 239, 232, 0.75)';
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 28);
  ctx.stroke();
}

function paintNamedChips(
  ctx: CanvasRenderingContext2D,
  names: readonly string[],
  plateX: number,
  y: number,
  plateW: number,
  border: string,
  textColor: string,
): number {
  ctx.save();
  ctx.font = `800 20px ${FONT}`;
  try {
    ctx.direction = 'rtl';
  } catch {
    /* عزل الاسم داخل الشارة */
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const gap = 10;
  const chipH = 36;
  const padX = 16;
  const maxW = plateW - 40;
  const chips = names.map((name) => ({
    name,
    w: Math.min(maxW, Math.max(88, ctx.measureText(name).width + padX * 2)),
  }));
  const rows: (typeof chips)[] = [];
  let row: typeof chips = [];
  let rowW = 0;
  for (const chip of chips) {
    const add = chip.w + (row.length ? gap : 0);
    if (row.length && rowW + add > maxW) {
      rows.push(row);
      row = [chip];
      rowW = chip.w;
    } else {
      row.push(chip);
      rowW += add;
    }
  }
  if (row.length) rows.push(row);

  let cy = y;
  for (const items of rows) {
    const visual = [...items].reverse();
    const total = visual.reduce((sum, chip) => sum + chip.w, 0) + gap * (visual.length - 1);
    let x = plateX + (plateW - total) / 2;
    for (const chip of visual) {
      ctx.fillStyle = 'rgba(20, 8, 14, 0.92)';
      roundRect(ctx, x, cy, chip.w, chipH, 18);
      ctx.fill();
      ctx.strokeStyle = border;
      ctx.lineWidth = 1.5;
      roundRect(ctx, x, cy, chip.w, chipH, 18);
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.fillText(`\u2067${chip.name}\u2069`, x + chip.w / 2, cy + chipH / 2 + 1);
      x += chip.w + gap;
    }
    cy += chipH + 8;
  }
  ctx.restore();
  return cy;
}

function setCenterRtl(ctx: CanvasRenderingContext2D): void {
  ctx.textAlign = 'center';
  try {
    ctx.direction = 'rtl';
  } catch {
    /* بعض المحركات */
  }
}

/** توسيط عبارة عربية داخل لوحة مصمّمة — لا يعتمد على اتجاه المحرّك لنقطة الرسم. */
function paintCenteredPlateLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  plateX: number,
  plateY: number,
  plateW: number,
  plateH: number,
  lineHeight: number,
): void {
  const usable = lines.length ? lines : [''];
  const blockH = usable.length * lineHeight;
  let y = plateY + (plateH - blockH) / 2 + lineHeight * 0.72;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  try {
    ctx.direction = 'ltr';
  } catch {
    /* موضع الرسم يبقى وسط الخانة */
  }
  const cx = plateX + plateW / 2;
  for (const ln of usable) {
    ctx.fillText(ln, cx, y);
    y += lineHeight;
  }
  ctx.restore();
}

export async function renderCoiffeurIntroCardPng(input: {
  displayName: string;
  role: string;
  qrDataUrl: string | null;
}): Promise<Blob> {
  await ensureBrandFont();
  const logo =
    (await loadImageSafe(LOGO_PNG)) || (await loadImageSafe(COIFFEUR_BRAND_LOGO_PATH));
  const photo = await loadImageSafe(COIFFEUR_VISUALS.cardIntro);
  const qr = input.qrDataUrl ? await loadImageSafe(input.qrDataUrl) : null;

  const w = 1080;
  const h = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  const name = sanitizeCoiffeurCardName(input.displayName);
  const role = sanitizeCoiffeurCardRole(input.role);
  if (!name || !role) throw new Error('card_fields_required');
  const pitch = coiffeurCardPitch(role);

  paintWineBackground(ctx, w, h);

  const markSize = 148;
  paintLogo(ctx, logo, (w - markSize) / 2, 44, markSize);

  ctx.textAlign = 'center';
  try {
    ctx.direction = 'ltr';
  } catch {
    /* ltr لاسم الشعار */
  }
  ctx.fillStyle = WINE.cream;
  ctx.font = `800 28px ${FONT}`;
  ctx.fillText(COIFFEUR_BRAND_EN, w / 2, 44 + markSize + 36);

  setCenterRtl(ctx);
  ctx.fillStyle = WINE.blush;
  ctx.font = `800 26px ${FONT}`;
  ctx.fillText(COIFFEUR_BRAND_AR, w / 2, 44 + markSize + 70);

  let cursorY = 44 + markSize + 88;
  if (pitch.kicker) {
    ctx.font = `800 22px ${FONT}`;
    const kickW = Math.min(w - 280, Math.max(280, ctx.measureText(pitch.kicker).width + 48));
    paintPlate(ctx, (w - kickW) / 2, cursorY, kickW, 44, 22);
    ctx.fillStyle = WINE.rose;
    ctx.fillText(pitch.kicker, w / 2, cursorY + 30);
    cursorY += 56;
  }

  paintMoodBand(ctx, photo, 92, cursorY, w - 184, 90);
  const nameTop = photo && photo.naturalWidth > 0 ? cursorY + 104 : cursorY + 8;
  paintPlate(ctx, 92, nameTop, w - 184, 118, 24);
  ctx.fillStyle = WINE.cream;
  ctx.font = `900 44px ${FONT}`;
  const namePlateW = w - 184;
  const nameLines = wrapLines(ctx, name, namePlateW - 76, 2);
  paintCenteredPlateLines(ctx, nameLines, 92, nameTop, namePlateW, 118, 46);

  const roleY = nameTop + 130;
  const roleLines = wrapLines(ctx, role, 640, 2);
  ctx.font = `800 26px ${FONT}`;
  const roleW = Math.min(
    w - 240,
    Math.max(280, Math.max(...roleLines.map((ln) => ctx.measureText(ln).width)) + 56),
  );
  const roleH = roleLines.length === 1 ? 52 : 84;
  paintPlate(ctx, (w - roleW) / 2, roleY, roleW, roleH, 26);
  ctx.fillStyle = WINE.blush;
  paintCenteredPlateLines(ctx, roleLines, (w - roleW) / 2, roleY, roleW, roleH, 34);

  const pitchY = roleY + roleH + 16;
  const pitchH = pitch.invite ? 228 : 200;
  paintPlate(ctx, 92, pitchY, w - 184, pitchH, 22);
  ctx.fillStyle = WINE.cream;
  ctx.font = `900 30px ${FONT}`;
  ctx.fillText(pitch.headline, w / 2, pitchY + 40);
  ctx.fillStyle = WINE.blush;
  ctx.font = `800 22px ${FONT}`;
  const tagLines = wrapLines(ctx, pitch.tagline, w - 260, 2);
  let ty = pitchY + 74;
  for (const ln of tagLines) {
    ctx.fillText(ln, w / 2, ty);
    ty += 30;
  }
  const chipsEnd = paintNamedChips(
    ctx,
    COIFFEUR_INTRO_CARD_SECTORS,
    92,
    ty + 8,
    w - 184,
    'rgba(244, 212, 192, 0.7)',
    WINE.rose,
  );
  if (pitch.invite) {
    ctx.fillStyle = WINE.blush;
    ctx.font = `800 20px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(pitch.invite, w / 2, Math.min(chipsEnd + 22, pitchY + pitchH - 18));
  }

  const ctaW = 600;
  const ctaY = pitchY + pitchH + 16;
  ctx.save();
  ctx.shadowColor = 'rgba(247, 239, 232, 0.45)';
  ctx.shadowBlur = 16;
  const ctaGrad = ctx.createLinearGradient((w - ctaW) / 2, ctaY, (w + ctaW) / 2, ctaY);
  ctaGrad.addColorStop(0, '#f7efe8');
  ctaGrad.addColorStop(0.5, '#f4d4c0');
  ctaGrad.addColorStop(1, '#c98b96');
  ctx.fillStyle = ctaGrad;
  roundRect(ctx, (w - ctaW) / 2, ctaY, ctaW, 62, 31);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#2a1218';
  ctx.font = `900 26px ${FONT}`;
  ctx.fillText(COPY.cta, w / 2, ctaY + 42);

  const qrSize = 168;
  const qrY = h - 268;
  if (qr && qr.naturalWidth > 0) {
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, (w - qrSize) / 2 - 10, qrY - 10, qrSize + 20, qrSize + 20, 16);
    ctx.fill();
    ctx.drawImage(qr, (w - qrSize) / 2, qrY, qrSize, qrSize);
  }

  ctx.fillStyle = WINE.cream;
  ctx.font = `800 20px ${FONT}`;
  try {
    ctx.direction = 'ltr';
  } catch {
    /* ltr للنطاق */
  }
  ctx.textAlign = 'center';
  ctx.fillText(COIFFEUR_SATELLITE_HOST, w / 2, h - 64);

  setCenterRtl(ctx);
  ctx.fillStyle = WINE.blush;
  ctx.font = `800 18px ${FONT}`;
  ctx.fillText(COPY.scanHint, w / 2, h - 36);

  return canvasToPngBlob(canvas);
}

function triggerAnchorDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

function canShareFile(file: File): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
  try {
    if (typeof navigator.canShare === 'function') return navigator.canShare({ files: [file] });
    return true;
  } catch {
    return false;
  }
}

export async function saveCoiffeurIntroCardPng(opts: {
  blob: Blob;
  shareTitle: string;
  shareText: string;
  preferShare: boolean;
}): Promise<CoiffeurIntroCardSaveResult> {
  try {
    const name = safePngName('coiffeur-map-card.png');
    const file = new File([opts.blob], name, { type: 'image/png' });
    if (opts.preferShare && canShareFile(file)) {
      try {
        const withFiles: ShareData = {
          files: [file],
          title: opts.shareTitle,
          text: opts.shareText,
        };
        if (typeof navigator.canShare !== 'function' || navigator.canShare(withFiles)) {
          await navigator.share(withFiles);
          return { ok: true, method: 'share' };
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return { ok: false, error: 'cancelled' };
        }
      }
    }
    triggerAnchorDownload(opts.blob, name);
    return { ok: true, method: 'download' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'save_failed' };
  }
}

export function coiffeurIntroCardFilename(): string {
  return safePngName('coiffeur-map-card.png');
}

export function shouldPreferNativeShare(): boolean {
  return isMobileUa();
}

export function buildCoiffeurCardWhatsAppHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildCoiffeurCardFacebookHref(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function buildCoiffeurCardXHref(text: string, url: string): string {
  const body = text.includes(url) ? text.replace(url, '').trim() : text;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(body)}&url=${encodeURIComponent(url)}`;
}

export function buildCoiffeurCardTelegramHref(text: string, url: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export async function shareCoiffeurIntroCardNative(opts: {
  title: string;
  text: string;
  url: string;
  file?: File | null;
}): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported';
  }
  try {
    const payload: ShareData = {
      title: opts.title,
      text: opts.text,
      url: opts.url,
    };
    if (opts.file) {
      const withFiles: ShareData = {
        files: [opts.file],
        title: opts.title,
        text: opts.text,
      };
      if (typeof navigator.canShare !== 'function' || navigator.canShare(withFiles)) {
        await navigator.share(withFiles);
        return 'shared';
      }
    }
    await navigator.share(payload);
    return 'shared';
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
    throw err;
  }
}
