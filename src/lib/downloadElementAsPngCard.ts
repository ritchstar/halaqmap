/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
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

  // بعض المتصفحات تُرجع null من toBlob — نمرّ عبر dataURL
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

/**
 * يسطّح أنماطاً تكسر html2canvas (oklch / background-clip / filters / animations).
 */
function prepareCloneForCapture(originalRoot: HTMLElement, clonedRoot: HTMLElement): void {
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
    dst.style.webkitBackdropFilter = 'none';
    dst.style.boxShadow = 'none';
    dst.style.textShadow = 'none';
    dst.style.transform = 'none';
    dst.style.willChange = 'auto';

    // ألوان محسوبة بصيغة rgb يدعمها html2canvas
    dst.style.color = cs.color;
    dst.style.backgroundColor = cs.backgroundColor;
    dst.style.borderColor = cs.borderColor;
    dst.style.outlineColor = cs.outlineColor;

    const clip =
      cs.backgroundClip ||
      (cs as CSSStyleDeclaration & { webkitBackgroundClip?: string }).webkitBackgroundClip;
    if (
      clip === 'text' ||
      src.classList.contains('text-transparent') ||
      src.getAttribute('data-cert-code') === '1'
    ) {
      dst.style.backgroundImage = 'none';
      dst.style.webkitBackgroundClip = 'border-box';
      dst.style.backgroundClip = 'border-box';
      dst.style.color = '#fde68a';
      dst.style.webkitTextFillColor = '#fde68a';
    }

    // تدرجات معقدة / أنماط متكررة — خلفية صلبة كافية للكرت
    if (cs.backgroundImage && cs.backgroundImage !== 'none') {
      const bg = cs.backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
        dst.style.backgroundColor = '#0f766e';
      }
      dst.style.backgroundImage = 'none';
    }
  }

  clonedRoot.querySelectorAll('.halaqmap-brand-shortname').forEach((el) => {
    const h = el as HTMLElement;
    h.style.background = 'none';
    h.style.webkitBackgroundClip = 'unset';
    h.style.backgroundClip = 'unset';
    h.style.color = '#5eead4';
    h.style.webkitTextFillColor = '#5eead4';
    h.style.filter = 'none';
  });

  clonedRoot.querySelectorAll('.halaqmap-brand-mark').forEach((el) => {
    const h = el as HTMLElement;
    h.style.background = '#0d9488';
    h.style.boxShadow = 'none';
    h.style.animation = 'none';
  });

  // الجذر نفسه — خلفية تيل ثابتة
  clonedRoot.style.backgroundImage = 'none';
  clonedRoot.style.backgroundColor = '#0a4f4a';
  clonedRoot.style.boxShadow = 'none';
}

/**
 * يلتقط عنصر HTML كـ PNG Blob (للتنزيل أو Web Share / سناب / واتساب…).
 */
export async function captureElementAsPngBlob(element: HTMLElement): Promise<Blob> {
  await waitForImages(element);

  // امنح المتصفح إطاراً لإكمال التخطيط قبل الالتقاط
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  const canvas = await html2canvas(element, {
    scale: Math.min(2.5, (window.devicePixelRatio || 1) * 2),
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#0a4f4a',
    logging: false,
    foreignObjectRendering: false,
    imageTimeout: 12000,
    removeContainer: true,
    windowWidth: Math.max(element.scrollWidth, element.clientWidth),
    windowHeight: Math.max(element.scrollHeight, element.clientHeight),
    onclone: (_doc, cloned) => {
      prepareCloneForCapture(element, cloned);
    },
  });

  if (!canvas.width || !canvas.height) {
    throw new Error('canvas_empty');
  }

  return canvasToPngBlob(canvas);
}

/**
 * يلتقط عنصر HTML (شهادة/كرت) ويُنزّله كصورة PNG عالية الدقة للاحتفاظ بها.
 */
export async function downloadElementAsPngCard(
  element: HTMLElement,
  fileName: string,
): Promise<void> {
  const blob = await captureElementAsPngBlob(element);
  triggerBlobDownload(blob, fileName);
}

export type ActivationCertificateCardPayload = {
  certificateNumber: string;
  salonName: string;
  packageLabel: string;
  issuedAtLabel: string;
  validUntilLabel: string;
  mapLive: boolean;
};

/**
 * مسار بديل موثوق: رسم الكرت على Canvas دون html2canvas (عند فشل الالتقاط).
 */
export async function downloadActivationCertificateFallbackPng(
  payload: ActivationCertificateCardPayload,
  fileName: string,
): Promise<void> {
  const W = 900;
  const H = 1280;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0f766e');
  grad.addColorStop(0.45, '#115e59');
  grad.addColorStop(1, '#042f2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // إطار
  ctx.strokeStyle = 'rgba(94, 234, 212, 0.55)';
  ctx.lineWidth = 6;
  roundRect(ctx, 28, 28, W - 56, H - 56, 36);
  ctx.stroke();

  ctx.fillStyle = '#ecfdf5';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';

  ctx.font = '800 42px Tajawal, "Segoe UI", sans-serif';
  ctx.fillText('شهادة تفعيل رقمية', W / 2, 120);

  ctx.font = '700 28px Tajawal, "Segoe UI", sans-serif';
  ctx.fillStyle = '#99f6e4';
  ctx.fillText('HMap · حلاق ماب', W / 2, 175);

  // صندوق الكود
  ctx.fillStyle = 'rgba(6, 78, 59, 0.85)';
  roundRect(ctx, 80, 230, W - 160, 220, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(153, 246, 228, 0.45)';
  ctx.lineWidth = 3;
  roundRect(ctx, 80, 230, W - 160, 220, 24);
  ctx.stroke();

  ctx.fillStyle = '#ccfbf1';
  ctx.font = '700 22px Tajawal, "Segoe UI", sans-serif';
  ctx.fillText('كود التفعيل — مفتاح رخصتك', W / 2, 290);

  ctx.fillStyle = '#fde68a';
  ctx.font = '800 36px ui-monospace, monospace';
  ctx.direction = 'ltr';
  ctx.fillText(payload.certificateNumber, W / 2, 360);
  ctx.direction = 'rtl';

  ctx.fillStyle = 'rgba(204, 251, 241, 0.85)';
  ctx.font = '600 18px Tajawal, "Segoe UI", sans-serif';
  ctx.fillText('احفظ هذا الرمز — مرجعك للتحقق والدعم وربط اللوحة', W / 2, 415);

  const rows: Array<[string, string]> = [
    ['الباقة المختارة', payload.packageLabel],
    ['اسم الصالون', payload.salonName],
    ['تاريخ الإصدار', payload.issuedAtLabel],
    ['صالحة حتى', payload.validUntilLabel],
    ['حالة الخريطة', payload.mapLive ? 'الظهور على الخريطة نشط' : 'بانتظار ربط الموقع'],
  ];

  let y = 520;
  for (const [label, value] of rows) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, 80, y, W - 160, 100, 18);
    ctx.fill();
    ctx.fillStyle = '#99f6e4';
    ctx.font = '600 20px Tajawal, "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(label, W - 110, y + 38);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 26px Tajawal, "Segoe UI", sans-serif';
    ctx.fillText(value, W - 110, y + 74);
    y += 118;
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#5eead4';
  ctx.font = '700 22px Tajawal, "Segoe UI", sans-serif';
  ctx.fillText('مُصدَرة ومُسجَّلة على نظام حلاق ماب — نشطة', W / 2, H - 80);

  const blob = await canvasToPngBlob(canvas);
  triggerBlobDownload(blob, fileName);
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
