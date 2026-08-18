/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مسودة نموذج التسجيل — تُحفظ أثناء التنقّل لصفحة التعليمات والعودة.
 * الحقول النصية في sessionStorage؛ ملفات الصور في ذاكرة الجلسة (SPA).
 * استئناف الخطوة الوسطى فقط عند العودة الصريحة من دليل التعليمات — لا عند دخول حملة/شركاء جديد.
 */

import type { SubscriptionTier } from '@/lib/index';
import type { BarberSpecialtyTrack } from '@/config/childrenSpecialistPolicy';
import type { SaudiLocationSelection } from '@/components/SaudiRegionCityDistrictFields';
import type { WorkingWeekFormRow } from '@/lib/saudiWorkingWeek';
import { createInitialWorkingWeekForm } from '@/lib/saudiWorkingWeek';

const STORAGE_KEY = 'halaqmap_registration_form_draft_v1';

export type RegistrationFormDraftImages = {
  shopExterior: File | null;
  shopInterior: File | null;
  bannerImages: [File | null, File | null, File | null, File | null];
};

export type RegistrationFormDraftSerializable = {
  currentStep: number;
  /** بصمة دخول الحملة/الرابط — إن تغيّرت نعيد الخطوة إلى اختيار الباقة */
  entryFingerprint?: string;
  tier: SubscriptionTier | '';
  plan: 'monthly';
  digitalShiftAddon: boolean;
  shopName: string;
  email: string;
  phone: string;
  whatsapp: string;
  taxNumber: string;
  categories: string[];
  specialtyTrack: BarberSpecialtyTrack;
  /** مسار كوافير ماب — لا يُخلط مع تخصصات الرجال */
  coiffeurTrack?: 'salon' | 'independents';
  listingSector?: 'mens_barber' | 'coiffeur_women';
  groomingCenterBannerLines: string[];
  legalDisclaimerAccepted: boolean;
  professionalCommitmentAccepted: boolean;
  softwareProductAcknowledged: boolean;
  location: {
    lat: string;
    lng: string;
    address: string;
    saudi: SaudiLocationSelection;
  };
  services: { name: string; price: string }[];
  inclusiveAccessibleCare: { offered: boolean; price: string };
  workingWeek: WorkingWeekFormRow[];
  payment: { method: 'monthly' | '' };
  registrationTermsAccepted: boolean;
  savedAt: number;
};

let memoryImages: RegistrationFormDraftImages | null = null;

function emptyImages(): RegistrationFormDraftImages {
  return {
    shopExterior: null,
    shopInterior: null,
    bannerImages: [null, null, null, null],
  };
}

/** بصمة معاملات الدخول التي تميّز حملة/إحالة جديدة عن استئناف مسودة */
export function buildRegistrationEntryFingerprint(search: string): string {
  const p = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const tier = (p.get('tier') || '').trim().toLowerCase();
  const qty = (p.get('qty') || '').trim();
  const ref = (p.get('ref') || '').trim();
  const purpose = (p.get('purpose') || '').trim().toLowerCase();
  const aiAddon = (p.get('aiAddon') || p.get('addon') || '').trim().toLowerCase();
  const plan = (p.get('plan') || '').trim().toLowerCase();
  let surface = (p.get('surface') || '').trim().toLowerCase();
  if (!surface && typeof window !== 'undefined') {
    const hash = window.location.hash || '';
    if (hash.includes('?')) {
      surface = (new URLSearchParams(hash.slice(hash.indexOf('?') + 1)).get('surface') || '')
        .trim()
        .toLowerCase();
    }
  }
  return [tier, qty, ref, purpose, aiAddon, plan, surface].join('|');
}

/**
 * استئناف الخطوة المحفوظة:
 * - عودة صريحة من دليل التعليمات (`resumeFlag`)، أو
 * - إعادة تحميل نفس الصفحة (F5) مع تطابق بصمة الرابط.
 * أي دخول جديد من مسار الشركاء/حملة بدون هذين الشرطين → الخطوة 1.
 */
export function shouldResumeRegistrationStep(input: {
  resumeFlag: boolean;
  currentFingerprint: string;
  draftFingerprint?: string;
  isPageReload?: boolean;
}): boolean {
  const draftFp = String(input.draftFingerprint ?? '');
  const fingerprintOk = !draftFp || draftFp === input.currentFingerprint;

  if (input.resumeFlag && fingerprintOk) return true;
  if (input.isPageReload && fingerprintOk) return true;
  return false;
}

function detectPageReload(): boolean {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav?.type === 'reload') return true;
  } catch {
    /* ignore */
  }
  try {
    // legacy
    const legacy = (performance as unknown as { navigation?: { type?: number } }).navigation;
    if (legacy?.type === 1) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export { detectPageReload as isRegistrationPageReload };

export function saveRegistrationFormDraft(
  draft: Omit<RegistrationFormDraftSerializable, 'savedAt'>,
  images: RegistrationFormDraftImages,
): void {
  memoryImages = {
    shopExterior: images.shopExterior,
    shopInterior: images.shopInterior,
    bannerImages: [...images.bannerImages] as RegistrationFormDraftImages['bannerImages'],
  };
  try {
    const payload: RegistrationFormDraftSerializable = {
      ...draft,
      savedAt: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadRegistrationFormDraft(): {
  data: RegistrationFormDraftSerializable;
  images: RegistrationFormDraftImages;
} | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RegistrationFormDraftSerializable;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.currentStep !== 'number' || parsed.currentStep < 1 || parsed.currentStep > 7) {
      return null;
    }
    return {
      data: {
        ...parsed,
        workingWeek: Array.isArray(parsed.workingWeek)
          ? parsed.workingWeek
          : createInitialWorkingWeekForm(),
        services: Array.isArray(parsed.services) ? parsed.services : [{ name: '', price: '' }],
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      },
      images: memoryImages
        ? {
            shopExterior: memoryImages.shopExterior,
            shopInterior: memoryImages.shopInterior,
            bannerImages: [...memoryImages.bannerImages] as RegistrationFormDraftImages['bannerImages'],
          }
        : emptyImages(),
    };
  } catch {
    return null;
  }
}

export function clearRegistrationFormDraft(): void {
  memoryImages = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
