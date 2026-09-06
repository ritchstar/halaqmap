/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رابط دليل التشغيل والتسويق — ضمن ركن النمو والدعم أسفل يسار اللوحة.
 */
import { StoreDeskCornerLink } from '@/components/store/StoreDeskCornerNav';

export function StoreDeskGuideLink({
  to,
  leadAr,
  labelAr,
}: {
  to: string;
  leadAr: string;
  labelAr: string;
  accent?: string;
  ctaAr?: string;
}) {
  return <StoreDeskCornerLink to={to} labelAr={labelAr} ariaLabel={leadAr} />;
}
