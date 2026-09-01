/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تنزيل كرت الدعوة كصورة من صورة الستايل والنص فقط.
 * الرسم على الكانفاس مباشرة حتى لا تُلتقط طبقات الصفحة أو كروت أخرى.
 */
import { canvasToPngBlob, loadSameOriginImage, savePngBlob } from '@/lib/savePngBlob';

const FONT = 'Tajawal, "Segoe UI", Tahoma, Arial, sans-serif';

async function ensureInviteFont(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.all([
      document.fonts.load(`700 28px ${FONT}`),
      document.fonts.load(`800 44px ${FONT}`),
    ]);
  } catch {
    /* الخط احتياطي */
  }
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return loadSameOriginImage(src, 8000);
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
  ctx.arcTo(x + w, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 8,
): string[] {
  const raw = String(text || '').trim();
  if (!raw) return [];
  const words = raw.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  const flush = () => {
    if (current) {
      lines.push(current);
      current = '';
    }
  };

  const splitLong = (word: string): string => {
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
    return chunk;
  };

  for (const word of words) {
    if (ctx.measureText(word).width > maxWidth) {
      flush();
      current = splitLong(word);
      continue;
    }
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  flush();
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1] || '';
  kept[maxLines - 1] = `${last.replace(/[،.\s]+$/u, '')}…`;
  return kept;
}

function paintBalancedInviteFrame(canvas: HTMLCanvasElement, accent: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const inset = Math.round(Math.min(w, h) * 0.032);
  const radius = Math.round(Math.min(w, h) * 0.048);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowBlur = 0;
  ctx.strokeStyle = accent || '#d4af67';
  ctx.lineWidth = Math.max(5, Math.round(w / 150));
  roundRect(ctx, inset, inset, w - inset * 2, h - inset * 2, radius);
  ctx.stroke();
  const inset2 = inset + Math.round(w / 42);
  ctx.strokeStyle = 'rgba(247, 237, 216, 0.35)';
  ctx.lineWidth = Math.max(2, Math.round(w / 260));
  roundRect(ctx, inset2, inset2, w - inset2 * 2, h - inset2 * 2, Math.max(8, radius - 10));
  ctx.stroke();
  ctx.restore();
}

function drawCoverPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  w: number,
  h: number,
): void {
  const scale = Math.max(w / photo.width, h / photo.height);
  const dw = photo.width * scale;
  const dh = photo.height * scale;
  ctx.drawImage(photo, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export type InviteCardPngPayload = {
  kickerAr: string;
  hostLineAr: string;
  titleAr: string;
  leadAr: string;
  dateAr: string;
  timeAr: string;
  placeAr: string;
  stampAr: string;
  accent: string;
  photoSrc: string;
  voice?: 'men' | 'women';
};

/**
 * صورة الستايل هي خلفية التحميل. الرفع اليدوي يظهر على المعاينة فقط إن كان data.
 */
export function inviteCardPhotoSrc(hostPhotoSrc: string | undefined, styleImage: string): string {
  const photo = String(hostPhotoSrc || '').trim();
  if (photo.startsWith('data:image/')) return photo;
  return styleImage;
}

function paintInviteCard(
  canvas: HTMLCanvasElement,
  payload: InviteCardPngPayload,
  photo: HTMLImageElement | null,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');
  const W = canvas.width;
  const H = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 48);
  ctx.clip();

  if (photo) {
    drawCoverPhoto(ctx, photo, W, H);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    if (payload.voice === 'women') {
      grad.addColorStop(0, '#3a242c');
      grad.addColorStop(1, '#12080c');
    } else {
      grad.addColorStop(0, '#3a2c14');
      grad.addColorStop(1, '#120c08');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  const veil = ctx.createLinearGradient(0, H * 0.32, 0, H);
  veil.addColorStop(0, 'rgba(8, 6, 4, 0)');
  veil.addColorStop(0.45, 'rgba(8, 6, 4, 0.35)');
  veil.addColorStop(1, 'rgba(8, 6, 4, 0.82)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  try {
    ctx.direction = 'rtl';
  } catch {
    /* RTL على الكانفاس */
  }

  const platePad = 56;
  const plateX = 88;
  const plateW = W - plateX * 2;
  const textW = plateW - platePad * 2;
  const accent = payload.accent || (payload.voice === 'women' ? '#e4b7c5' : '#e8c547');
  const ink = '#f7edd8';

  ctx.font = `700 26px ${FONT}`;
  const kickerLines = wrapText(ctx, payload.kickerAr, textW, 1);
  ctx.font = `600 26px ${FONT}`;
  const hostLines = wrapText(ctx, payload.hostLineAr, textW, 2);
  ctx.font = `800 44px ${FONT}`;
  const titleLines = wrapText(ctx, payload.titleAr, textW, 3);
  ctx.font = `700 30px ${FONT}`;
  const leadLines = wrapText(ctx, payload.leadAr, textW, 6);
  ctx.font = `600 26px ${FONT}`;
  const meta = [payload.dateAr, payload.timeAr, payload.placeAr].map((item) => item.trim()).filter(Boolean);

  const lineGap = 40;
  let contentH = 36;
  contentH += kickerLines.length * 34;
  contentH += hostLines.length * 34;
  contentH += 12;
  contentH += titleLines.length * 54;
  contentH += 28;
  contentH += leadLines.length * lineGap;
  contentH += meta.length * 38;
  contentH += 56;
  const plateH = Math.min(H * 0.58, Math.max(320, contentH + platePad));
  const plateY = H - 88 - plateH;

  ctx.fillStyle = 'rgba(8, 6, 4, 0.72)';
  roundRect(ctx, plateX, plateY, plateW, plateH, 28);
  ctx.fill();
  ctx.strokeStyle = `${accent}73`;
  ctx.lineWidth = 2;
  roundRect(ctx, plateX, plateY, plateW, plateH, 28);
  ctx.stroke();

  let y = plateY + platePad + 8;
  ctx.fillStyle = accent;
  ctx.font = `700 26px ${FONT}`;
  for (const line of kickerLines) {
    ctx.fillText(line, W / 2, y);
    y += 34;
  }
  ctx.fillStyle = 'rgba(247, 237, 216, 0.82)';
  ctx.font = `600 26px ${FONT}`;
  for (const line of hostLines) {
    ctx.fillText(line, W / 2, y);
    y += 34;
  }
  y += 10;
  ctx.fillStyle = ink;
  ctx.font = `800 44px ${FONT}`;
  for (const line of titleLines) {
    ctx.fillText(line, W / 2, y);
    y += 54;
  }
  y += 8;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 90, y);
  ctx.lineTo(W / 2 + 90, y);
  ctx.stroke();
  y += 36;
  ctx.fillStyle = ink;
  ctx.font = `700 30px ${FONT}`;
  for (const line of leadLines) {
    ctx.fillText(line, W / 2, y);
    y += lineGap;
  }
  y += 8;
  ctx.fillStyle = 'rgba(247, 237, 216, 0.88)';
  ctx.font = `600 26px ${FONT}`;
  for (const line of meta) {
    ctx.fillText(line, W / 2, y);
    y += 38;
  }

  ctx.fillStyle = accent;
  ctx.font = `600 24px ${FONT}`;
  ctx.fillText(payload.stampAr, W / 2, plateY + plateH - 28);

  ctx.restore();
  paintBalancedInviteFrame(canvas, accent);
}

export async function downloadInviteCardAsPng(
  fileName: string,
  payload: InviteCardPngPayload,
): Promise<void> {
  await ensureInviteFont();
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  if (!canvas.getContext('2d')) throw new Error('canvas_unavailable');

  const photo = payload.photoSrc ? await loadImage(payload.photoSrc) : null;
  let blob: Blob;
  try {
    paintInviteCard(canvas, payload, photo);
    blob = await canvasToPngBlob(canvas);
  } catch {
    paintInviteCard(canvas, payload, null);
    blob = await canvasToPngBlob(canvas);
  }

  const result = await savePngBlob({
    blob,
    fileName,
    shareTitle: payload.titleAr || 'halaqmap',
    preferShare: false,
  });
  if (!result.ok) {
    if (result.error === 'cancelled') return;
    throw new Error(result.error);
  }
}
