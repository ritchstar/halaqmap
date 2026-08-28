/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أيقونة موقع الزبون — تظهر فقط إن أُبرز الموقع ووُجد رابط خرائط.
 */
import { MapPin } from 'lucide-react';
import { isShopMapsUrl } from '@/lib/storeShopPlace';

export function StoreShopPlacePin({
  mapsUrl,
  visible,
  accent,
  labelAr,
}: {
  mapsUrl: string;
  visible: boolean;
  accent: string;
  labelAr: string;
}) {
  if (!visible || !mapsUrl || !isShopMapsUrl(mapsUrl)) return null;
  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={labelAr}
      title={labelAr}
      className="inline-flex shrink-0 items-center justify-center rounded-full p-1.5"
      style={{ color: accent }}
    >
      <MapPin className="h-6 w-6" strokeWidth={2.4} aria-hidden />
    </a>
  );
}
