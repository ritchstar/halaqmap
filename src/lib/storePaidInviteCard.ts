/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إصدار PNG لبطاقة المناسبة المدفوعة في المتصفح — بلا تخزين إضافي.
 */
import { savePngBlob, type SavePngBlobResult } from '@/lib/savePngBlob';

const FONT = "Tajawal, 'Segoe UI', Tahoma, Arial, sans-serif";
const CARD_W = 1080;
const CARD_H = 1350;

export type PaidInviteCardDrawInput = {
  hostName: string;
  occasionLine: string;
  whenText: string;
  placeText: string;
  message: string;
  stamp: string;
};

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
    if (chunk) line = chunk;
  };

  for (const word of tokens) {
    if (lines.length >= maxLines) break;
    pushWord(word);
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines);
}

async function ensureFont(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${FONT}`, 'عبدالله'),
      document.fonts.load(`700 36px ${FONT}`, 'halaqmap'),
    ]);
  } catch {
    /* خط احتياطي */
  }
}

export async function renderPaidInviteCardPng(input: PaidInviteCardDrawInput): Promise<Blob> {
  await ensureFont();
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');

  const grad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  grad.addColorStop(0, '#10222e');
  grad.addColorStop(1, '#061018');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.strokeStyle = 'rgba(232, 197, 71, 0.45)';
  ctx.lineWidth = 8;
  const x = 48;
  const y0 = 48;
  const w = CARD_W - 96;
  const h = CARD_H - 96;
  const r = 48;
  ctx.beginPath();
  ctx.moveTo(x + r, y0);
  ctx.arcTo(x + w, y0, x + w, y0 + h, r);
  ctx.arcTo(x + w, y0 + h, x, y0 + h, r);
  ctx.arcTo(x, y0 + h, x, y0, r);
  ctx.arcTo(x, y0, x + w, y0, r);
  ctx.closePath();
  ctx.stroke();

  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  const inner = CARD_W - 200;
  let y = 220;

  ctx.fillStyle = '#e8c547';
  ctx.font = `700 36px ${FONT}`;
  const occasion = wrapLines(ctx, input.occasionLine, inner, 2);
  for (const line of occasion) {
    ctx.fillText(line, CARD_W / 2, y);
    y += 48;
  }

  y += 36;
  ctx.fillStyle = '#f4efe4';
  ctx.font = `800 72px ${FONT}`;
  const names = wrapLines(ctx, input.hostName, inner, 3);
  for (const line of names) {
    ctx.fillText(line, CARD_W / 2, y);
    y += 86;
  }

  ctx.fillStyle = 'rgba(244, 239, 228, 0.88)';
  ctx.font = `600 32px ${FONT}`;
  if (input.whenText) {
    y += 28;
    ctx.fillText(input.whenText, CARD_W / 2, y);
    y += 48;
  }
  if (input.placeText) {
    ctx.fillText(input.placeText, CARD_W / 2, y);
    y += 48;
  }

  if (input.message) {
    y += 36;
    ctx.fillStyle = 'rgba(244, 239, 228, 0.8)';
    ctx.font = `500 30px ${FONT}`;
    const body = wrapLines(ctx, input.message, inner, 6);
    for (const line of body) {
      ctx.fillText(line, CARD_W / 2, y);
      y += 44;
    }
  }

  ctx.fillStyle = 'rgba(244, 239, 228, 0.45)';
  ctx.font = `600 22px ${FONT}`;
  ctx.fillText(input.stamp, CARD_W / 2, CARD_H - 110);

  const blob = await new Promise<Blob | null>((resolve, reject) => {
    try {
      canvas.toBlob((next) => resolve(next), 'image/png');
    } catch (err) {
      reject(err);
    }
  });
  if (!blob) throw new Error('png');
  return blob;
}

export function paidInviteCardFilename(hostName: string): string {
  const slug = hostName.replace(/[^\u0600-\u06FFa-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `halaqmap-occasion-${slug || 'card'}.png`;
}

export async function downloadPaidInviteCard(blob: Blob, hostName: string): Promise<SavePngBlobResult> {
  return savePngBlob({
    blob,
    fileName: paidInviteCardFilename(hostName),
    shareTitle: hostName || 'halaqmap',
    preferShare: false,
  });
}
