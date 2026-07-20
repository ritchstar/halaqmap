/**
 * مسودة نموذج التسجيل — تُحفظ أثناء التنقّل لصفحة التعليمات والعودة.
 * الحقول النصية في sessionStorage؛ ملفات الصور في ذاكرة الجلسة (SPA).
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
