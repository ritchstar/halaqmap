/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * قطاع كوافير ماب على محرّك تسجيل حلاق ماب — بلا شؤون قانونية ثقيلة.
 * لا تستورد هذا الملف من App.tsx أو coiffeurHostRedirect.ts.
 */

export const MENS_LISTING_SECTOR = 'mens_barber' as const;
export const COIFFEUR_LISTING_SECTOR = 'coiffeur_women' as const;

export type ListingSector = typeof MENS_LISTING_SECTOR | typeof COIFFEUR_LISTING_SECTOR;

export const COIFFEUR_REGISTRATION_SURFACE = 'coiffeur' as const;

export type CoiffeurRegistrationTrack = 'salon' | 'independents';

export const COIFFEUR_INDEPENDENTS_CATEGORY = 'مستقلات تجميل' as const;

export const COIFFEUR_REGISTRATION_CATEGORIES = [
  'كوافير نسائي',
  'مشغل تجميل',
  'سبا ومساج',
  'مكياج وسهرات',
  'عناية أظافر',
  'عناية بشرة',
  COIFFEUR_INDEPENDENTS_CATEGORY,
  'زيارة منزلية',
] as const;

export type CoiffeurRegistrationCategory = (typeof COIFFEUR_REGISTRATION_CATEGORIES)[number];

const COIFFEUR_CATEGORY_SET = new Set<string>(COIFFEUR_REGISTRATION_CATEGORIES);

export const MENS_REGISTRATION_CATEGORIES = [
  'حلاقة رجالي',
  'حلاقة أطفال',
  'حلاقة تقليدية',
  'احتياجات خاصة',
  'زيارة منزلية',
  'حلاقة 24 ساعة',
  'تشذيب لحية',
  'صبغ شعر',
  'عناية بالبشرة',
] as const;

const MENS_CATEGORY_SET = new Set<string>(MENS_REGISTRATION_CATEGORIES);

export const COIFFEUR_INDEPENDENT_REGISTER_HINT_AR =
  'المستقلة بوثيقة عمل حر أو المتعهّدة تُدرَج في تصنيف مستقلات بعد التأشير على التعهد القانوني.';

export const COIFFEUR_REGISTER_COPY = {
  brand: 'كوافير ماب',
  backToPartners: 'العودة لشركاء كوافير ماب',
  title: 'سجّلي مشغلك في كوافير ماب',
  documentTitle: 'اشتراك كوافير ماب — رخصة برمجية',
  kicker: 'سطح نسائي تحت مظلة حلاق ماب — رخصة برمجية كوافير ماب، ونفس الدفع على النطاق المعتمد.',
  shopStepTitle: 'بيانات المشغل',
  shopStepDescription: 'أدخل معلومات المشغل النسائي',
  shopNameLabel: 'اسم المشغل *',
  shopNamePlaceholder: 'مثال: مشغل ندى',
  specialtyLabel: 'مسار التخصص *',
  salonTrackTitle: 'مشغل متعدد الخدمات',
  salonTrackHint: 'اختاري التصنيفات المناسبة أدناه. الظهور عند الطلب في استعلام كوافير ماب فقط.',
  independentsTrackTitle: 'مستقلة',
  categoriesLabel: 'نوع الخدمات *',
} as const;

/** ألوان سطح كوافير ماب — لا تُستخدم في مسار الرجال */
export const COIFFEUR_REGISTER_THEME = {
  pageClass:
    'relative min-h-screen overflow-x-hidden bg-[linear-gradient(165deg,#14080e_0%,#1c0c14_45%,#12070c_100%)] text-[#f7efe8]',
  header:
    'sticky top-0 z-40 border-b border-rose-200/10 bg-[#14080e]/92 pt-[env(safe-area-inset-top)] backdrop-blur-md',
  field:
    'border-[#f4d4c0]/30 bg-[#14080e] text-[#f7efe8] placeholder:text-rose-100/35 focus-visible:ring-[#f4d4c0]/45',
  label: 'text-[#f7efe8]',
  muted: 'text-rose-100/60',
  alert: 'rounded-lg border border-[#f4d4c0]/25 bg-[#2a1218]/80 p-4 text-[#f7efe8]',
  card: 'rounded-xl border border-[#f4d4c0]/20 bg-[#1c0c14] text-[#f7efe8]',
  stepperActive: 'bg-[#f4d4c0] text-[#2a1218]',
  stepperDone: 'bg-[#c98b96]/80 text-[#f7efe8]',
  stepperIdle: 'bg-[#2a1218] text-rose-100/40 border border-[#f4d4c0]/25',
  progress: 'h-2 bg-[#2a1218] [&>div]:bg-[#f4d4c0]',
  next:
    'bg-gradient-to-l from-[#e8b4a2] to-[#c98b96] font-black text-[#2a1218] hover:opacity-95',
  prev: 'border-[#f4d4c0]/30 bg-[#2a1218] text-[#f7efe8] hover:bg-[#3d221c]',
  outlineBtn: 'border-[#f4d4c0]/30 bg-[#2a1218] text-[#f7efe8] hover:bg-[#3d221c]',
} as const;

function readSurfaceFromSearch(search: string): string {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  return (new URLSearchParams(raw).get('surface') || '').trim().toLowerCase();
}

function readSurfaceFromWindow(): string {
  if (typeof window === 'undefined') return '';
  const hash = window.location.hash || '';
  if (hash.includes('?')) {
    const fromHash = readSurfaceFromSearch(hash.slice(hash.indexOf('?')));
    if (fromHash) return fromHash;
  }
  return readSurfaceFromSearch(window.location.search || '');
}

export function isCoiffeurRegistrationSurface(search?: string): boolean {
  if (search && readSurfaceFromSearch(search) === COIFFEUR_REGISTRATION_SURFACE) return true;
  return readSurfaceFromWindow() === COIFFEUR_REGISTRATION_SURFACE;
}

export function isCoiffeurRegistrationCategory(value: string): boolean {
  return COIFFEUR_CATEGORY_SET.has(value);
}

export function sanitizeCategoriesForRegistrationSurface(
  categories: readonly string[] | undefined,
  isCoiffeur: boolean,
): string[] {
  const list = Array.isArray(categories) ? categories.filter((c) => typeof c === 'string') : [];
  if (isCoiffeur) {
    return list.filter((c) => COIFFEUR_CATEGORY_SET.has(c));
  }
  return list.filter((c) => MENS_CATEGORY_SET.has(c));
}

export function resolveCoiffeurRegistrationCategories(input: {
  track: CoiffeurRegistrationTrack;
  categories: readonly string[];
}): string[] {
  if (input.track === 'independents') {
    return [COIFFEUR_INDEPENDENTS_CATEGORY];
  }
  return sanitizeCategoriesForRegistrationSurface(input.categories, true);
}
