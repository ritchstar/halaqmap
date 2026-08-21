/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * المعاينة الكاملة انتقلت إلى صفحة المنتج.
 */
import { Navigate } from 'react-router-dom';
import { STORE_WEDDING_LIVE_PUBLIC_ENABLED } from '@/config/storeWeddingLive';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreWeddingLabPage() {
  if (!STORE_WEDDING_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  return <Navigate to={ROUTE_PATHS.STORE_WEDDING} replace />;
}
