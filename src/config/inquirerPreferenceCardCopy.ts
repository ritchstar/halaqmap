/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * كرت تفضيلي للمستعلم — الطبقة الظاهرة فوق منتج سمات.
 * مجاني تجريبي الآن. التفعيل المدفوع يُؤجَّل. بلا صورة في هذه المرحلة.
 */
import { MAP_CONTACT_CITY_SEALS } from '@/config/mapContactCardCopy';

export const INQUIRER_PREFERENCE_CARD_PATH = '/card' as const;

export const INQUIRER_PREFERENCE_CARD_NAME_AR = 'كرت تفضيلي' as const;

export const INQUIRER_PREFERENCE_CARD_LEGAL_PRODUCT_AR = 'بطاقة سمات' as const;

export const INQUIRER_PREFERENCE_CARD_CITIES = MAP_CONTACT_CITY_SEALS;

export const INQUIRER_PREFERENCE_CARD_META = {
  titleAr: 'كرت تفضيلي — وضّح حلاقتك للحلاق | حلاق ماب',
  descriptionAr:
    'أنشئ كرتاً تفضيلياً مجاناً الآن: لقب، مدينة، وطريقة الحلاقة المطلوبة. مرّره للحلاق برابط أو واتساب. ليس حجزاً.',
} as const;

export const INQUIRER_PREFERENCE_CARD_PAGE = {
  badge: 'إنتاج تجريبي مجاني الآن',
  title: 'كرت تفضيلي لطريقة حلاقتك',
  lead:
    'عبّئ اللقب والمدينة وطريقة الحلاقة، ثم مرّر الكرت للحلاق برابط أو واتساب. هذا توضيح للطلب — ليس حجزاً عبر المنصة.',
  legalNote: 'المنتج التقني الداخلي: بطاقة سمات. التفعيل الدائم يُسعَّر لاحقاً بعد التطوير.',
  pledge:
    'أقرّ أنني أدخل لقباً فقط، وأن الكرت لتوضيح التفضيل وليس حجزاً، وأن الصورة المرجعية غير مطلوبة في هذه المرحلة.',
  submit: 'أظهر الكرت',
  edit: 'تعديل البيانات',
  shareWhatsapp: 'أرسل عبر واتساب',
  copyLink: 'انسخ رابط الكرت',
  copied: 'نُسخ الرابط',
  cityLabel: 'المدينة',
  nameLabel: 'الاسم أو اللقب',
  namePlaceholder: 'مثال: أبو فهد',
  hairLabel: 'طريقة الحلاقة',
  hairDetailPlaceholder: 'تفصيل إضافي إن لزم',
  beardLabel: 'اللحية (اختياري)',
  beardNone: 'بدون تحديد',
  notesLabel: 'شرط أو ملاحظة قصيرة',
  notesPlaceholder: 'مثال: الجوانب أقصر من الأعلى',
  previewKicker: 'معاينة الكرت',
  scanHint: 'الحلاق يفتح الرابط أو يمسح الرمز في الصالون',
} as const;

export function cityNameAr(cityId: string): string {
  return INQUIRER_PREFERENCE_CARD_CITIES.find((c) => c.id === cityId)?.nameAr ?? '';
}
