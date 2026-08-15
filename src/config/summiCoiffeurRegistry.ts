/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سمي — ربط صفحات النوايا الثابتة باستعلام كوافير ماب.
 * المصدر التشغيلي للنوايا يبقى COIFFEUR_INQUIRY_INTENTS.
 */
import type { CoiffeurInquiryIntentId } from '@/config/coiffeurMapUmbrella';
import { COIFFEUR_INQUIRY_INTENTS } from '@/config/coiffeurMapUmbrella';
import { readHashQueryParam } from '@/lib/hashQueryParams';

export const SUMMI_HUB_PATH = '/summi' as const;
export const SUMMI_SITE_ORIGIN = 'https://coiffeur.halaqmap.com' as const;

export const SUMMI_SLUG_TO_INTENT = {
  'near-me': 'near_open',
  coiffeur: 'coiffeur',
  'beauty-salon': 'beauty_salon',
  spa: 'spa',
  makeup: 'makeup',
  nails: 'nails',
  skin: 'skin',
  independents: 'independents',
} as const satisfies Record<string, CoiffeurInquiryIntentId>;

const INTENT_IDS = new Set(COIFFEUR_INQUIRY_INTENTS.map((row) => row.id));

export function isCoiffeurInquiryIntentId(value: string): value is CoiffeurInquiryIntentId {
  return INTENT_IDS.has(value as CoiffeurInquiryIntentId);
}

export function summiIntentFromSlug(slug: string): CoiffeurInquiryIntentId | null {
  const key = slug.trim().toLowerCase();
  return key in SUMMI_SLUG_TO_INTENT
    ? SUMMI_SLUG_TO_INTENT[key as keyof typeof SUMMI_SLUG_TO_INTENT]
    : null;
}

/** يقرأ نية سمي من الهاش: `intent=` أو `summi=` */
export function readCoiffeurIntentFromQuery(): CoiffeurInquiryIntentId | null {
  const intent = readHashQueryParam('intent');
  if (intent && isCoiffeurInquiryIntentId(intent)) return intent;
  const slug = readHashQueryParam('summi');
  if (slug) return summiIntentFromSlug(slug);
  return null;
}
