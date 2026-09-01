/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حفظ PNG من المتصفح. Safari على آيفون يتجاهل خاصية download لروابط blob،
 * لذلك يُفتح مسار ضغط مطوّل بدل الإيهام بأن الملف نُزّل.
 */
export type SavePngBlobMethod = 'download' | 'share' | 'open';

export type SavePngBlobResult =
  | { ok: true; method: SavePngBlobMethod }
  | { ok: false; error: string };

const OVERLAY_ID = 'hm-png-save-overlay';
const REVOKE_MS = 120_000;

export function isIosLikeUserAgent(
  userAgent: string,
  platform = '',
  maxTouchPoints = 0,
): boolean {
  if (/iPad|iPhone|iPod/i.test(userAgent)) return true;
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return true;
  if (/MacIntel/i.test(platform) && maxTouchPoints > 1) return true;
  return false;
}

export function isIosLike(): boolean {
  if (typeof navigator === 'undefined') return false;
  return isIosLikeUserAgent(navigator.userAgent, navigator.platform, navigator.maxTouchPoints || 0);
}

export function isMobileUa(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function pngSaveStrategy(input: {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
  preferShare: boolean;
}): SavePngBlobMethod {
  if (input.preferShare) return 'share';
  if (isIosLikeUserAgent(input.userAgent, input.platform || '', input.maxTouchPoints || 0)) {
    return 'open';
  }
  return 'download';
}

export function safePngFileName(fileName: string, fallback = 'halaqmap-card.png'): string {
  const raw = (fileName || fallback).trim();
  const withExt = raw.toLowerCase().endsWith('.png') ? raw : `${raw}.png`;
  const ascii = withExt.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');
  return ascii.length > 8 ? ascii : fallback;
}

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  try {
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      try {
        canvas.toBlob((next) => resolve(next), 'image/png');
      } catch (err) {
        reject(err);
      }
    });
    if (blob && blob.size > 0) return blob;
  } catch {
    /* toBlob مرفوض أو اللوحة ملوّثة */
  }
  const dataUrl = canvas.toDataURL('image/png');
  const res = await fetch(dataUrl);
  const fromData = await res.blob();
  if (!fromData.size) throw new Error('png_blob_failed');
  return fromData;
}

export function loadImageWithTimeout(
  src: string,
  opts?: { timeoutMs?: number; crossOrigin?: boolean },
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    if (opts?.crossOrigin) img.crossOrigin = 'anonymous';
    let settled = false;
    const done = (el: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(el);
    };
    const timer = window.setTimeout(() => done(null), opts?.timeoutMs ?? 8000);
    img.onload = () => done(img.naturalWidth > 0 ? img : null);
    img.onerror = () => done(null);
    img.src = src;
  });
}

export async function loadSameOriginImage(
  src: string,
  timeoutMs = 8000,
): Promise<HTMLImageElement | null> {
  const trimmed = src.trim();
  if (!trimmed) return null;
  const isInline = trimmed.startsWith('data:') || trimmed.startsWith('blob:');
  const isRelative = trimmed.startsWith('/');
  const sameOrigin =
    isInline ||
    isRelative ||
    (typeof location !== 'undefined' && trimmed.startsWith(location.origin));
  if (sameOrigin) {
    return loadImageWithTimeout(trimmed, { timeoutMs, crossOrigin: false });
  }
  const cors = await loadImageWithTimeout(trimmed, { timeoutMs, crossOrigin: true });
  if (cors) return cors;
  return loadImageWithTimeout(trimmed, { timeoutMs, crossOrigin: false });
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
    window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_MS);
  }
}

function closePngSaveOverlay(url: string): void {
  document.getElementById(OVERLAY_ID)?.remove();
  document.body.style.removeProperty('overflow');
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_MS);
}

function showIosSaveOverlay(blob: Blob, fileName: string): void {
  if (typeof document === 'undefined') return;
  document.getElementById(OVERLAY_ID)?.remove();
  const url = URL.createObjectURL(blob);

  const wrap = document.createElement('div');
  wrap.id = OVERLAY_ID;
  wrap.setAttribute('dir', 'rtl');
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'background:rgba(6,16,24,0.96)',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'justify-content:flex-start',
    'padding:24px 16px 32px',
    'overflow:auto',
    'font-family:Tajawal,"Segoe UI",Tahoma,Arial,sans-serif',
  ].join(';');

  const hint = document.createElement('p');
  hint.textContent = 'اضغط الصورة مطولاً ثم احفظها في الجهاز.';
  hint.style.cssText = 'color:#e8c547;font-weight:800;margin:8px 0 16px;text-align:center;font-size:16px';

  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.style.cssText = 'max-width:min(100%,420px);width:100%;height:auto;border-radius:16px;border:1px solid rgba(232,197,71,0.35)';

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:18px';

  const openLink = document.createElement('a');
  openLink.href = url;
  openLink.target = '_blank';
  openLink.rel = 'noopener';
  openLink.download = fileName;
  openLink.textContent = 'فتح الصورة كاملة';
  openLink.style.cssText =
    'color:#061018;background:linear-gradient(90deg,#f4efe4,#e8c547);font-weight:800;padding:10px 16px;border-radius:999px;text-decoration:none';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = 'إغلاق';
  closeBtn.style.cssText =
    'color:#f4efe4;background:transparent;border:1px solid rgba(232,197,71,0.4);font-weight:800;padding:10px 16px;border-radius:999px;cursor:pointer';
  closeBtn.addEventListener('click', () => closePngSaveOverlay(url));

  actions.append(openLink, closeBtn);
  wrap.append(hint, img, actions);
  document.body.appendChild(wrap);
  document.body.style.overflow = 'hidden';
}

export async function savePngBlob(opts: {
  blob: Blob;
  fileName: string;
  shareTitle?: string;
  shareText?: string;
  preferShare?: boolean;
}): Promise<SavePngBlobResult> {
  try {
    if (!opts.blob || opts.blob.size < 1) return { ok: false, error: 'empty_blob' };
    const name = safePngFileName(opts.fileName);
    const file = new File([opts.blob], name, { type: 'image/png' });
    const strategy = pngSaveStrategy({
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      platform: typeof navigator !== 'undefined' ? navigator.platform : '',
      maxTouchPoints: typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0,
      preferShare: Boolean(opts.preferShare),
    });

    if (strategy === 'share' && canShareFile(file)) {
      try {
        const payload: ShareData = {
          files: [file],
          title: opts.shareTitle || name,
          text: opts.shareText || '',
        };
        if (typeof navigator.canShare !== 'function' || navigator.canShare(payload)) {
          await navigator.share(payload);
          return { ok: true, method: 'share' };
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return { ok: false, error: 'cancelled' };
        }
      }
    }

    if (strategy === 'open' || isIosLike()) {
      showIosSaveOverlay(opts.blob, name);
      return { ok: true, method: 'open' };
    }

    triggerAnchorDownload(opts.blob, name);
    return { ok: true, method: 'download' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'save_failed' };
  }
}
