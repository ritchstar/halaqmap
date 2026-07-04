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

type Accent = { primary: string; deep: string; glow: string };

const TIER_ACCENT: Record<SubscriptionTier, Accent> = {
  bronze: { primary: '#e6a86b', deep: '#5a2f0e', glow: 'rgba(230, 168, 107, 0.30)' },
  gold: { primary: '#f7cf5c', deep: '#5f3d0c', glow: 'rgba(247, 207, 92, 0.32)' },
  diamond: { primary: '#b79dfb', deep: '#33236a', glow: 'rgba(183, 157, 251, 0.34)' },
};

const BRAND = {
  ink: '#f8fafc',
  inkSoft: '#d7e2ec',
  inkFaint: '#9fb0c2',
  teal: '#2dd4bf',
  tealSoft: '#8bf3e2',
} as const;

const FONT_FAMILY = "'Tajawal','IBM Plex Sans Arabic',Tahoma,Arial,sans-serif";
const font = (weight: number, size: number): string =>
  `${weight} ${Math.round(size)}px ${FONT_FAMILY}`;

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * يضمن توفّر خط Tajawal (خط المنصة) للرسم على الـ canvas قبل التصدير.
 * ملاحظة: index.html يتخطّى تحميل الخط على الجوّال، وهو الاستخدام الأساسي
 * لعُدّة المشاركة؛ لذا نحقنه عند الطلب لضمان بطاقة متّسقة الهوية على كل جهاز.
 */
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
    /* حقن الرابط اختياري — نكمل مع الخط الاحتياطي */
  }
  const sample = 'حلاق ماب 0123';
  const specs = ['400', '500', '700', '800'].map((w) => `${w} 40px 'Tajawal'`);
  const deadline = Date.now() + 2200;
  const fontSet = (document as Document).fonts;
  while (Date.now() < deadline) {
    try {
      const loaded = await Promise.all(specs.map((s) => fontSet.load(s, sample)));
      if (loaded.every((faces) => faces.length > 0)) return;
    } catch {
      /* تجاهل ونعيد المحاولة حتى المهلة */
    }
    if (fontSet.check("700 40px 'Tajawal'", sample)) return;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
}

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
  accent: Accent,
): void {
  const base = ctx.createLinearGradient(0, 0, w * 0.4, h);
  base.addColorStop(0, '#020912');
  base.addColorStop(0.45, '#071a2b');
  base.addColorStop(1, '#04231d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  const glowA = ctx.createRadialGradient(
    w * 0.84,
    h * 0.12,
    0,
    w * 0.84,
    h * 0.12,
    Math.max(w, h) * 0.55,
  );
  glowA.addColorStop(0, accent.glow);
  glowA.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, w, h);

  const glowB = ctx.createRadialGradient(
    w * 0.12,
    h * 0.9,
    0,
    w * 0.12,
    h * 0.9,
    Math.max(w, h) * 0.5,
  );
  glowB.addColorStop(0, 'rgba(45, 212, 191, 0.14)');
  glowB.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, w, h);

  const vignette = ctx.createRadialGradient(
    w / 2,
    h * 0.44,
    Math.min(w, h) * 0.2,
    w / 2,
    h * 0.5,
    Math.max(w, h) * 0.74,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

/** حلقات رادارية خفيفة تذكّر بنظام الاستجابة النشطة على المنصة. */
function drawRadarRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
): void {
  ctx.save();
  ctx.lineWidth = 2;
  for (let i = 1; i <= 4; i += 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, baseR * i, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(45, 212, 191, ${Math.max(0.03, 0.13 - i * 0.02)})`;
    ctx.stroke();
  }
  ctx.restore();
}

/** إطار مزدوج ناعم: خط رمادي خفيف + خط شعري بلون الباقة. */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: Accent,
): void {
  const r = Math.round(Math.min(w, h) * 0.05);
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  drawRoundRect(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = hexToRgba(accent.primary, 0.28);
  drawRoundRect(ctx, x + 12, y + 12, w - 24, h - 24, Math.max(6, r - 8));
  ctx.stroke();
  ctx.restore();
}

function drawLogoBadge(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
  accent: Accent,
): void {
  const radius = size * 0.24;
  ctx.save();
  ctx.shadowColor = accent.glow;
  ctx.shadowBlur = size * 0.36;
  drawRoundRect(ctx, x, y, size, size, radius);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fill();
  ctx.restore();

  if (logo) {
    ctx.save();
    drawRoundRect(ctx, x, y, size, size, radius);
    ctx.clip();
    ctx.drawImage(logo, x, y, size, size);
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = hexToRgba(accent.primary, 0.5);
    drawRoundRect(ctx, x, y, size, size, radius);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.font = font(800, size * 0.26);
  ctx.fillStyle = BRAND.tealSoft;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillText('حلاق ماب', x + size / 2, y + size / 2);
  ctx.restore();
}

/** شارة الباقة (برونزي/ذهبي/ماسي) على هيئة قرص بلون الباقة. */
function drawTierPill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  top: number,
  text: string,
  accent: Accent,
  fontSize: number,
): number {
  ctx.save();
  ctx.font = font(700, fontSize);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  const padX = fontSize * 1.05;
  const width = ctx.measureText(text).width + padX * 2;
  const height = fontSize + fontSize * 0.95;
  const x = cx - width / 2;
  drawRoundRect(ctx, x, top, width, height, height / 2);
  ctx.fillStyle = hexToRgba(accent.primary, 0.14);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = hexToRgba(accent.primary, 0.5);
  ctx.stroke();
  ctx.fillStyle = accent.primary;
  ctx.fillText(text, cx, top + height / 2);
  ctx.restore();
  return top + height;
}

/** لوحة QR بيضاء بحواف دائرية وظل ناعم. */
function drawQrPanel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  top: number,
  qrSize: number,
  qrPad: number,
  qrImg: HTMLImageElement,
): number {
  const size = qrSize + qrPad * 2;
  const x = cx - size / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  drawRoundRect(ctx, x, top, size, size, size * 0.1);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
  ctx.drawImage(qrImg, x + qrPad, top + qrPad, qrSize, qrSize);
  return top + size;
}

function drawDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  width: number,
  accent: Accent,
): void {
  const grad = ctx.createLinearGradient(cx - width / 2, 0, cx + width / 2, 0);
  grad.addColorStop(0, 'rgba(148, 163, 184, 0)');
  grad.addColorStop(0.5, hexToRgba(accent.primary, 0.55));
  grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
  ctx.save();
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, y);
  ctx.lineTo(cx + width / 2, y);
  ctx.stroke();
  ctx.restore();
}

type LayoutContext = {
  ctx: CanvasRenderingContext2D;
  input: BarberShareCardRenderInput;
  accent: Accent;
  qrImg: HTMLImageElement;
  logo: HTMLImageElement | null;
  tierLine: string;
};

type CardCfg = {
  W: number;
  H: number;
  safeTop: number;
  safeBottom: number;
  pad: number;
  logo: number;
  wordmark: number;
  tagline: number;
  pill: number;
  kicker: number;
  salon: number;
  salonMaxLines: number;
  headline: number;
  headlineMaxLines: number;
  subline: number;
  sublineMaxLines: number;
  qr: number;
  qrPad: number;
  caption: number;
  brand: number;
};

const STORY_CFG: CardCfg = {
  W: 1080,
  H: 1920,
  safeTop: 140,
  safeBottom: 150,
  pad: 56,
  logo: 120,
  wordmark: 46,
  tagline: 26,
  pill: 26,
  kicker: 28,
  salon: 60,
  salonMaxLines: 2,
  headline: 40,
  headlineMaxLines: 2,
  subline: 30,
  sublineMaxLines: 3,
  qr: 300,
  qrPad: 26,
  caption: 25,
  brand: 30,
};

const SQUARE_CFG: CardCfg = {
  W: 1080,
  H: 1080,
  safeTop: 60,
  safeBottom: 66,
  pad: 48,
  logo: 92,
  wordmark: 40,
  tagline: 22,
  pill: 24,
  kicker: 24,
  salon: 54,
  salonMaxLines: 2,
  headline: 34,
  headlineMaxLines: 2,
  subline: 28,
  sublineMaxLines: 2,
  qr: 232,
  qrPad: 22,
  caption: 22,
  brand: 27,
};

/** تخطيط موحّد متوسّط المحاذاة لكلتا الصيغتين (مربّع/Story). */
function drawCard(lc: LayoutContext, cfg: CardCfg): void {
  const { ctx, input, accent, qrImg, logo, tierLine } = lc;
  const { W, H, safeTop, safeBottom, pad } = cfg;
  const cx = W / 2;
  const g = (n: number): number => n * (H / 1920);
  const textWidth = W - pad * 2 - g(48);

  paintBackground(ctx, W, H, accent);
  drawRadarRings(ctx, W * 0.82, safeTop + g(60), Math.min(W, H) * 0.09);
  drawFrame(ctx, pad, safeTop, W - pad * 2, H - safeTop - safeBottom, accent);

  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.textBaseline = 'top';

  let y = safeTop + g(48);

  drawLogoBadge(ctx, logo, cx - cfg.logo / 2, y, cfg.logo, accent);
  y += cfg.logo + g(22);

  ctx.font = font(800, cfg.wordmark);
  ctx.fillStyle = BRAND.ink;
  ctx.fillText('حلاق ماب', cx, y);
  y += cfg.wordmark + g(8);

  ctx.font = font(500, cfg.tagline);
  ctx.fillStyle = BRAND.inkFaint;
  ctx.fillText('منصّة الاستعلام عن الحلاقين', cx, y);
  y += cfg.tagline + g(30);

  y = drawTierPill(ctx, cx, y, tierLine, accent, cfg.pill) + g(34);

  ctx.font = font(700, cfg.kicker);
  ctx.fillStyle = accent.primary;
  ctx.fillText(input.template.cardKickerAr, cx, y);
  y += cfg.kicker + g(16);

  ctx.font = font(800, cfg.salon);
  const salonGrad = ctx.createLinearGradient(W * 0.22, 0, W * 0.78, 0);
  salonGrad.addColorStop(0, BRAND.tealSoft);
  salonGrad.addColorStop(1, accent.primary);
  ctx.fillStyle = salonGrad;
  for (const ln of wrapRtlLines(
    ctx,
    input.salonName.trim() || 'صالوننا',
    textWidth,
    cfg.salonMaxLines,
  )) {
    ctx.fillText(ln, cx, y);
    y += cfg.salon + g(10);
  }
  y += g(12);

  ctx.font = font(700, cfg.headline);
  ctx.fillStyle = BRAND.tealSoft;
  for (const ln of wrapRtlLines(ctx, input.template.headlineAr, textWidth, cfg.headlineMaxLines)) {
    ctx.fillText(ln, cx, y);
    y += cfg.headline + g(8);
  }
  y += g(14);

  ctx.font = font(500, cfg.subline);
  ctx.fillStyle = BRAND.inkSoft;
  for (const ln of wrapRtlLines(ctx, input.template.sublineAr, textWidth, cfg.sublineMaxLines)) {
    ctx.fillText(ln, cx, y);
    y += cfg.subline + g(8);
  }

  const brandBottom = H - safeBottom - g(18);
  const panelSize = cfg.qr + cfg.qrPad * 2;
  const captionGap = g(16);
  const qrBlockH = panelSize + captionGap + cfg.caption;
  const footerBlockH = cfg.brand;
  const spaceTop = y + g(18);
  const spaceBottom = brandBottom - footerBlockH - g(20);
  const qrTop = spaceTop + Math.max(g(6), (spaceBottom - spaceTop - qrBlockH) / 2);

  drawDivider(ctx, cx, spaceTop, W * 0.42, accent);

  const panelBottom = drawQrPanel(ctx, cx, qrTop, cfg.qr, cfg.qrPad, qrImg);

  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.textBaseline = 'top';
  ctx.font = font(600, cfg.caption);
  ctx.fillStyle = BRAND.inkFaint;
  ctx.fillText(input.template.cardFooterAr, cx, panelBottom + captionGap);

  ctx.save();
  ctx.direction = 'ltr';
  ctx.font = font(800, cfg.brand);
  ctx.fillStyle = BRAND.teal;
  ctx.fillText('halaqmap.com', cx, brandBottom - cfg.brand);
  ctx.restore();
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
  const cfg = format === 'story' ? STORY_CFG : SQUARE_CFG;
  const dims = BARBER_SHARE_CARD_DIMENSIONS[format];
  const QRCode = (await import('qrcode')).default;
  const accent = TIER_ACCENT[input.tier] ?? TIER_ACCENT.gold;

  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  // نرسم رمز QR بدقّة مضاعفة ثم نصغّره في اللوحة للحصول على حواف حادّة.
  const qrDataUrl = await QRCode.toDataURL(input.shareUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: cfg.qr * 2,
    color: { dark: '#041322', light: '#ffffff' },
  });

  const [, qrImg, logo] = await Promise.all([
    ensureBrandFont(),
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
  drawCard(lc, cfg);

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
