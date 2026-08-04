/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import {
  CONSUMER_APP_LIVE_ORIGIN,
  isConsumerAppExternalPath,
} from '@/config/consumerAppShell';
import { buildAbsoluteAppHashUrl } from '@/lib/partnerAppShell';

/** هل نعمل داخل غلاف Capacitor الأصلي (iOS/Android)؟ */
export function isConsumerNativeShell(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function isConsumerIosShell(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
}

/** يفتح رابطاً في Safari/المتصفح الخارجي من غلاف المستخدم */
export async function openConsumerExternalUrl(url: string): Promise<boolean> {
  if (!isConsumerNativeShell()) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const absolute = trimmed.startsWith('http')
      ? trimmed
      : buildAbsoluteAppHashUrl(trimmed.startsWith('#') ? trimmed.slice(1) : trimmed);
    await Browser.open({ url: absolute });
    return true;
  } catch {
    try {
      window.open(trimmed, '_blank', 'noopener,noreferrer');
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * إن كان المسار خاصاً بالشريك/الدفع داخل غلاف المستخدم — افتحه خارجياً وأعد التوجيه للرئيسية.
 */
export async function breakOutConsumerExternalPath(pathnameWithSearch: string): Promise<boolean> {
  if (!isConsumerNativeShell()) return false;
  const pathOnly = pathnameWithSearch.split('?')[0] || '';
  if (!isConsumerAppExternalPath(pathOnly)) return false;

  const absolute = buildAbsoluteAppHashUrl(pathnameWithSearch);
  await openConsumerExternalUrl(absolute);

  // أعد المستخدم لصفحة آمنة داخل الغلاف
  try {
    const home = `${CONSUMER_APP_LIVE_ORIGIN}/#/`;
    if (window.location.href !== home) {
      window.location.replace(`${window.location.pathname}${window.location.search}#/`);
    }
  } catch {
    /* ignore */
  }
  return true;
}
