import { getSiteOrigin } from '@/config/siteOrigin';
import { ROUTE_PATHS, type SubscriptionTier } from '@/lib/index';
import type { BarberShareTemplateId } from '@/config/barberSocialShareCopy';
import { buildRatingInviteUrl, buildRatingInviteUrlStatic } from '@/lib/ratingInvite';
import type { BarberShareTemplateMeta } from '@/config/barberSocialShareCopy';
import { subscriptionTierShareLabelAr } from '@/config/barberSocialShareCopy';

export type BarberShareCardFormat = 'square' | 'story';

export const BARBER_SHARE_CARD_DIMENSIONS: Record<
  BarberShareCardFormat,
  { width: number; height: number; labelAr: string; filenameSuffix: string }
> = {
  square: { width: 1080, height: 1080, labelAr: '1080×1080', filenameSuffix: 'post' },
  story: { width: 1080, height: 1920, labelAr: '1080×1920', filenameSuffix: 'story' },
};

export function buildBarberMapShareUrl(barberId: string): string {
  const base = getSiteOrigin().replace(/\/+$/, '');
  const q = new URLSearchParams({
    utm_source: 'barber_share',
    utm_medium: 'social',
    utm_campaign: 'map_presence',
    ref: barberId.slice(0, 8),
  });
  return `${base}/#${ROUTE_PATHS.HOME}?${q.toString()}`;
}

export function buildBarberShareUrlForTemplate(input: {
  templateId: BarberShareTemplateId;
  barberId: string;
  ratingInviteToken: string;
}): string {
  if (input.templateId === 'rating_invite' && input.ratingInviteToken.trim()) {
    if (typeof window !== 'undefined') {
      return buildRatingInviteUrl(input.barberId, input.ratingInviteToken);
    }
    return buildRatingInviteUrlStatic(
      getSiteOrigin(),
      input.barberId,
      input.ratingInviteToken,
    );
  }
  return buildBarberMapShareUrl(input.barberId);
}

export function buildFacebookShareHref(shareUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
}

export function buildXShareHref(caption: string, shareUrl: string): string {
  const text = caption.includes(shareUrl) ? caption.replace(shareUrl, '').trim() : caption;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
}

export function buildWhatsAppShareHref(caption: string): string {
  return `https://wa.me/?text=${encodeURIComponent(caption)}`;
}

export type BarberShareCardRenderInput = {
  template: BarberShareTemplateMeta;
  salonName: string;
  tier: SubscriptionTier;
  memberNumber: number | null;
  shareUrl: string;
  logoUrl: string;
  format?: BarberShareCardFormat;
};

const TIER_ACCENT: Record<SubscriptionTier, { primary: string; glow: string }> = {
  bronze: { primary: '#b45309', glow: 'rgba(180, 83, 9, 0.35)' },
  gold: { primary: '#d97706', glow: 'rgba(217, 119, 6, 0.4)' },
  diamond: { primary: '#7c3aed', glow: 'rgba(124, 58, 237, 0.45)' },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('logo_load_failed'));
    img.src = src;
  });
}

function wrapRtlLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines);
}

function drawRoundRect(
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
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function paintBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accent: { primary: string; glow: string },
): void {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#041322');
  bg.addColorStop(0.4, '#0b2840');
  bg.addColorStop(1, '#062a24');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = accent.glow;
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.12, Math.min(w, h) * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
  ctx.beginPath();
  ctx.arc(w * 0.12, h * 0.78, Math.min(w, h) * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

function drawLogoOrFallback(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
): void {
  if (logo) {
    ctx.save();
    drawRoundRect(ctx, x - 8, y - 8, size + 16, size + 16, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.drawImage(logo, x, y, size, size);
    ctx.restore();
    return;
  }
  ctx.font = 'bold 28px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#5eead4';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText('حلاق ماب', x + size / 2, y + size / 2 + 10);
}

type LayoutContext = {
  ctx: CanvasRenderingContext2D;
  input: BarberShareCardRenderInput;
  accent: { primary: string; glow: string };
  qrImg: HTMLImageElement;
  logo: HTMLImageElement | null;
  tierLine: string;
};

function paintSquareLayout(lc: LayoutContext): void {
  const { ctx, input, accent, qrImg, logo, tierLine } = lc;
  const W = 1080;
  const H = 1080;
  const pad = 48;

  paintBackground(ctx, W, H, accent);

  ctx.strokeStyle = `${accent.primary}55`;
  ctx.lineWidth = 3;
  drawRoundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 36);
  ctx.stroke();

  drawLogoOrFallback(ctx, logo, W - pad - 96 - 8, 72, 96);

  ctx.direction = 'rtl';
  ctx.textAlign = 'right';

  ctx.font = '600 26px Tahoma, Arial, sans-serif';
  ctx.fillStyle = accent.primary;
  ctx.fillText(input.template.cardKickerAr, W - pad, 200);

  ctx.font = '900 52px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#f8fafc';
  wrapRtlLines(ctx, input.salonName.trim() || 'صالوننا', W - 128, 2).forEach((ln, i) => {
    ctx.fillText(ln, W - pad, 280 + i * 62);
  });

  ctx.font = 'bold 38px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#99f6e4';
  ctx.fillText(input.template.headlineAr, W - pad, 420);

  ctx.font = '500 28px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  wrapRtlLines(ctx, input.template.sublineAr, W - 128, 3).forEach((ln, i) => {
    ctx.fillText(ln, W - pad, 490 + i * 40);
  });

  ctx.font = '600 22px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(tierLine, W - pad, 640);

  const qrSize = 280;
  const qrX = pad;
  const qrY = H - pad - qrSize;
  ctx.fillStyle = '#ffffff';
  drawRoundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 20);
  ctx.fill();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.font = '600 24px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'right';
  wrapRtlLines(ctx, input.template.cardFooterAr, W - qrSize - 160, 2).forEach((ln, i) => {
    ctx.fillText(ln, W - pad - qrSize - 40, qrY + 48 + i * 34);
  });

  ctx.font = '500 20px ui-monospace, monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'left';
  ctx.direction = 'ltr';
  ctx.fillText(`${input.shareUrl.replace(/^https?:\/\//, '').slice(0, 42)}…`, qrX, H - 72);

  ctx.textAlign = 'right';
  ctx.direction = 'rtl';
  ctx.font = '700 22px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#2dd4bf';
  ctx.fillText('halaqmap.com', W - pad, H - 72);
}

function paintStoryLayout(lc: LayoutContext): void {
  const { ctx, input, accent, qrImg, logo, tierLine } = lc;
  const W = 1080;
  const H = 1920;
  const pad = 56;
  const safeTop = 132;
  const safeBottom = 200;

  paintBackground(ctx, W, H, accent);

  ctx.strokeStyle = `${accent.primary}44`;
  ctx.lineWidth = 4;
  drawRoundRect(ctx, pad, safeTop, W - pad * 2, H - safeTop - safeBottom, 40);
  ctx.stroke();

  const logoSize = 112;
  const logoX = (W - logoSize) / 2;
  drawLogoOrFallback(ctx, logo, logoX, safeTop + 36, logoSize);

  ctx.direction = 'rtl';
  ctx.textAlign = 'center';

  ctx.font = '600 28px Tahoma, Arial, sans-serif';
  ctx.fillStyle = accent.primary;
  ctx.fillText(input.template.cardKickerAr, W / 2, safeTop + 180);

  ctx.font = '900 58px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#f8fafc';
  wrapRtlLines(ctx, input.salonName.trim() || 'صالوننا', W - 120, 2).forEach((ln, i) => {
    ctx.fillText(ln, W / 2, safeTop + 280 + i * 68);
  });

  ctx.font = 'bold 42px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#99f6e4';
  ctx.fillText(input.template.headlineAr, W / 2, safeTop + 440);

  ctx.font = '500 30px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  wrapRtlLines(ctx, input.template.sublineAr, W - 120, 4).forEach((ln, i) => {
    ctx.fillText(ln, W / 2, safeTop + 510 + i * 44);
  });

  ctx.font = '600 24px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(tierLine, W / 2, safeTop + 680);

  const qrSize = 340;
  const qrX = (W - qrSize) / 2;
  const qrY = H - safeBottom - qrSize - 120;
  ctx.fillStyle = '#ffffff';
  drawRoundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 24);
  ctx.fill();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.font = '700 30px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(input.template.cardFooterAr, W / 2, qrY + qrSize + 56);

  ctx.font = '600 22px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Story · حلاق ماب', W / 2, qrY + qrSize + 96);

  ctx.font = '700 26px Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#2dd4bf';
  ctx.fillText('halaqmap.com', W / 2, H - safeBottom + 48);

  ctx.font = '500 18px ui-monospace, monospace';
  ctx.fillStyle = '#475569';
  ctx.direction = 'ltr';
  ctx.textAlign = 'center';
  ctx.fillText(input.shareUrl.replace(/^https?:\/\//, '').slice(0, 48), W / 2, H - safeBottom + 88);
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('png_export_failed'));
      },
      'image/png',
      1,
    );
  });
}

export async function renderBarberSocialShareCardPng(
  input: BarberShareCardRenderInput,
): Promise<Blob> {
  const format = input.format ?? 'square';
  const dims = BARBER_SHARE_CARD_DIMENSIONS[format];
  const QRCode = (await import('qrcode')).default;
  const accent = TIER_ACCENT[input.tier] ?? TIER_ACCENT.gold;

  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  const qrSize = format === 'story' ? 340 : 280;
  const qrDataUrl = await QRCode.toDataURL(input.shareUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: qrSize,
    color: { dark: '#041322', light: '#ffffff' },
  });

  const [qrImg, logo] = await Promise.all([
    loadImage(qrDataUrl),
    loadImage(input.logoUrl).catch(() => null),
  ]);

  const tierLabel = subscriptionTierShareLabelAr(input.tier);
  const member =
    input.memberNumber != null && Number.isFinite(input.memberNumber)
      ? ` · عضو ${Math.floor(input.memberNumber)}`
      : '';
  const tierLine = `باقة ${tierLabel}${member}`;

  const lc: LayoutContext = { ctx, input, accent, qrImg, logo, tierLine };

  if (format === 'story') {
    paintStoryLayout(lc);
  } else {
    paintSquareLayout(lc);
  }

  return canvasToPngBlob(canvas);
}

export function downloadBarberShareCardBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function slugifySalonFilename(name: string): string {
  const base = name.trim().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '').slice(0, 40);
  return base || 'salon';
}

export function barberShareDownloadFilename(input: {
  format: BarberShareCardFormat;
  templateId: string;
  salonName: string;
}): string {
  const suffix = BARBER_SHARE_CARD_DIMENSIONS[input.format].filenameSuffix;
  return `halaqmap-${suffix}-${input.templateId}-${slugifySalonFilename(input.salonName)}.png`;
}
