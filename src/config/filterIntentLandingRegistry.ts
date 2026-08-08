/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحات مساعدة من حلاق ماب — `/need/{slug}` تربط نية البحث بفلاتر المنصة الحقيقية.
 * العبارات الشائعة مستمدة من صيغ بحث المستخدمين (مثل «من موقعي») دون ذكر علامات تجارية منافسة.
 */
import type { VisitorServiceIntentId } from '@/lib/visitorServiceIntents';
import filterIntentLandingPagesJson from './filterIntentLandingPages.json';

export const FILTER_INTENT_HUB_PATH = '/need' as const;
export const FILTER_INTENT_SITE_ORIGIN = 'https://www.halaqmap.com' as const;

export type FilterIntentRelatedNearLink = {
  href: string;
  labelAr: string;
};

export type FilterIntentLandingPage = {
  slug: string;
  h1Ar: string;
  titleAr: string;
  descriptionAr: string;
  intentId: VisitorServiceIntentId;
  aliasesAr: readonly string[];
  leadAr: string;
  bodyAr: string;
  filterNoteAr: string;
  /** روابط مساعدة جغرافية اختيارية (أحياء/مدن موجودة) */
  relatedNearLinks?: readonly FilterIntentRelatedNearLink[];
};

type FilterIntentPageJson = {
  slug: string;
  h1: string;
  title: string;
  description: string;
  intentId: string;
  aliases: string[];
  lead: string;
  body: string;
  filterNote: string;
  relatedNearLinks?: FilterIntentRelatedNearLink[];
};

function mapJsonPage(p: FilterIntentPageJson): FilterIntentLandingPage {
  return {
    slug: p.slug,
    h1Ar: p.h1,
    titleAr: p.title,
    descriptionAr: p.description,
    intentId: p.intentId as VisitorServiceIntentId,
    aliasesAr: p.aliases,
    leadAr: p.lead,
    bodyAr: p.body,
    filterNoteAr: p.filterNote,
    ...(p.relatedNearLinks?.length ? { relatedNearLinks: p.relatedNearLinks } : {}),
  };
}

/**
 * صفحات مساعدة حسب الحاجة — كل صفحة تفتح `#/?need={slug}` ثم تُطبَّق النية.
 * المصدر: filterIntentLandingPages.json (مولَّد من scripts/data/filterIntentLandingPages.mjs).
 */
export const FILTER_INTENT_LANDING_PAGES: readonly FilterIntentLandingPage[] = (
  filterIntentLandingPagesJson.pages as FilterIntentPageJson[]
).map(mapJsonPage);

export function filterIntentPath(slug: string): string {
  return `${FILTER_INTENT_HUB_PATH}/${slug}`;
}

export function filterIntentAppCtaUrl(slug: string, origin = FILTER_INTENT_SITE_ORIGIN): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}/#/?need=${encodeURIComponent(slug)}`;
}

export function findFilterIntentLandingBySlug(slug: string): FilterIntentLandingPage | null {
  const key = String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+/, '')
    .replace(/^need\//, '');
  if (!key) return null;
  return FILTER_INTENT_LANDING_PAGES.find((p) => p.slug === key) ?? null;
}
