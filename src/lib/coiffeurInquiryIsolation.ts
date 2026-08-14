/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * عزل استعلام كوافير ماب عن بحث حلاق ماب للرجال.
 * لا يُستدعى /api/public-barbers من هنا — تلك الواجهة لصالونات الرجال فقط.
 */
import { COIFFEUR_LISTING_SECTOR } from '@/config/coiffeurMapUmbrella';

export type CoiffeurInquiryListing = {
  id: string;
  name: string;
  sector: typeof COIFFEUR_LISTING_SECTOR;
};

export function isCoiffeurWomenListing(row: { sector?: unknown }): boolean {
  return row.sector === COIFFEUR_LISTING_SECTOR;
}

/**
 * جلب نتائج الاستعلام النسائي فقط.
 * حتى يتوفر عمود/مصدر قطاع نسائي في القاعدة: نُرجع قائمة فارغة عمداً
 * بدل السقوط إلى قائمة الحلاقين الرجال.
 */
export async function fetchCoiffeurInquiryListings(): Promise<{
  listings: CoiffeurInquiryListing[];
  isolatedFromMensBarbers: true;
}> {
  return { listings: [], isolatedFromMensBarbers: true };
}
