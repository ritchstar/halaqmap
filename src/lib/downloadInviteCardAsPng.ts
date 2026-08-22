/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تنزيل كرت الدعوة كصورة. مسار مستقل عن شهادات التفعيل.
 */
import html2canvas from 'html2canvas';

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png');
  });
  if (blob) return blob;
  const dataUrl = canvas.toDataURL('image/png');
  const res = await fetch(dataUrl);
  const fromData = await res.blob();
  if (!fromData.size) throw new Error('png_blob_failed');
  return fromData;
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          window.setTimeout(done, 4000);
        }),
    ),
  );
}

function prepareInviteClone(originalRoot: HTMLElement, clonedRoot: HTMLElement): void {
  const originals = [originalRoot, ...Array.from(originalRoot.querySelectorAll<HTMLElement>('*'))];
  const clones = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll<HTMLElement>('*'))];
  const n = Math.min(originals.length, clones.length);
  for (let i = 0; i < n; i++) {
    const src = originals[i]!;
    const dst = clones[i]!;
    const cs = window.getComputedStyle(src);
    dst.style.animation = 'none';
    dst.style.transition = 'none';
    dst.style.filter = 'none';
    dst.style.backdropFilter = 'none';
    dst.style.transform = 'none';
    dst.style.willChange = 'auto';
    dst.style.color = cs.color;
    if (src.tagName !== 'IMG') {
      dst.style.backgroundColor = cs.backgroundColor;
    }
    dst.style.borderColor = cs.borderColor;
  }
  clonedRoot.querySelectorAll('[data-invite-atmosphere]').forEach((el) => el.remove());
  clonedRoot.style.backgroundColor = '#120c08';
}

async function captureInviteElement(element: HTMLElement): Promise<Blob> {
  await waitForImages(element);
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  const canvas = await html2canvas(element, {
    scale: Math.min(2.5, (window.devicePixelRatio || 1) * 2),
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#120c08',
    logging: false,
    foreignObjectRendering: false,
    imageTimeout: 12000,
    removeContainer: true,
    windowWidth: Math.max(element.scrollWidth, element.clientWidth, 360),
    windowHeight: Math.max(element.scrollHeight, element.clientHeight, 480),
    onclone: (_doc, cloned) => {
      prepareInviteClone(element, cloned);
    },
  });
  if (!canvas.width || !canvas.height) throw new Error('canvas_empty');
  return canvasToPngBlob(canvas);
}

export type InviteCardFallbackPayload = {
  titleAr: string;
  leadAr: string;
  dateAr: string;
  timeAr: string;
  placeAr: string;
  stampAr: string;
  accent: string;
  photoSrc?: string;
  voice?: 'men' | 'women';
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
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
  ctx.arcTo(x + w, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function downloadInviteFallbackPng(payload: InviteCardFallbackPayload, fileName: string): Promise<void> {
  const W = 900;
  const H = 1280;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  const photo = payload.photoSrc ? await loadImage(payload.photoSrc) : null;
  if (photo) {
    const scale = Math.max(W / photo.width, H / photo.height);
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    ctx.drawImage(photo, (W - dw) / 2, (H - dh) / 2, dw, dh);
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

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, H * 0.42, W, H * 0.58);

  ctx.strokeStyle = payload.accent;
  ctx.lineWidth = 4;
  roundRect(ctx, 36, 36, W - 72, H - 72, 36);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 10;
  roundRect(ctx, 48, 48, W - 96, H - 96, 28);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillStyle = payload.accent;
  ctx.font = '700 28px Tajawal, "Segoe UI", sans-serif';
  ctx.fillText(payload.titleAr, W / 2, 720);

  ctx.fillStyle = '#f7edd8';
  ctx.font = '700 30px Tajawal, "Segoe UI", sans-serif';
  const leadLines = wrapText(ctx, payload.leadAr, W - 160);
  let y = 780;
  for (const line of leadLines.slice(0, 6)) {
    ctx.fillText(line, W / 2, y);
    y += 42;
  }

  ctx.font = '600 24px Tajawal, "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(247, 237, 216, 0.88)';
  if (payload.dateAr) {
    ctx.fillText(payload.dateAr, W / 2, y + 24);
    y += 40;
  }
  if (payload.timeAr) {
    ctx.fillText(payload.timeAr, W / 2, y + 16);
    y += 36;
  }
  if (payload.placeAr) {
    ctx.fillText(payload.placeAr, W / 2, y + 16);
  }

  ctx.fillStyle = payload.accent;
  ctx.font = '600 22px Tajawal, "Segoe UI", sans-serif';
  ctx.fillText(payload.stampAr, W / 2, H - 70);

  const blob = await canvasToPngBlob(canvas);
  triggerBlobDownload(blob, fileName);
}

export async function downloadInviteCardAsPng(
  element: HTMLElement,
  fileName: string,
  fallback: InviteCardFallbackPayload,
): Promise<void> {
  try {
    const blob = await captureInviteElement(element);
    triggerBlobDownload(blob, fileName);
  } catch {
    await downloadInviteFallbackPng(fallback, fileName);
  }
}
