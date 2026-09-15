/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قطع الصفحة الرئيسية غير الحرجة لأول رسم — تُحمَّل بعد الـ hero أو عند الحاجة.
 * قراءة المسمّى خارج ملف import() مباشرةً حتى لا يحوّل Vite المسمّى إلى default فارغ.
 */
import { lazy, type ComponentType } from 'react';

function pickNamedExport(mod: unknown, name: string): ComponentType {
  if (typeof mod === 'function') return mod as ComponentType;
  if (mod && typeof mod === 'object') {
    const rec = mod as Record<string, unknown>;
    if (typeof rec[name] === 'function') return rec[name] as ComponentType;
    if (typeof rec.default === 'function') return rec.default as ComponentType;
  }
  throw new Error(`${name} failed to load`);
}

function lazyNamed(loader: () => Promise<unknown>, name: string) {
  return lazy(async () => ({ default: pickNamedExport(await loader(), name) }));
}

export const LandingSearchResults = lazyNamed(
  () => import('@/pages/landing/LandingSearchResults'),
  'LandingSearchResults',
);

export const LandingAgentPanelBody = lazyNamed(
  () => import('@/pages/landing/LandingAgentPanelBody'),
  'LandingAgentPanelBody',
);

export const LandingBarberDetailModal = lazyNamed(
  () => import('@/components/BarberDetailModal'),
  'BarberDetailModal',
);

export const LandingFloatingPlatformActions = lazyNamed(
  () => import('@/components/FloatingPlatformActions'),
  'FloatingPlatformActions',
);

export const LandingPlatformAmbientBackground = lazyNamed(
  () => import('@/components/PlatformAmbientBackground'),
  'PlatformAmbientBackground',
);

export const LandingPulseRadarHero = lazyNamed(
  () => import('@/pages/landing/LandingPulseRadarHero'),
  'LandingPulseRadarHero',
);
