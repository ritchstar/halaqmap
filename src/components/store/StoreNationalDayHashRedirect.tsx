/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NATIONAL_DAY_EXPLORER_SCROLL_QUERY,
  NATIONAL_DAY_EXPLORER_SECTION_ID,
} from '@/config/storeNationalDay';
import { ROUTE_PATHS } from '@/lib/routePaths';

/**
 * يصلح `#national-day-explorer` على HashRouter — كان يُفسَّر كمسار ويُظهر 404.
 */
export function StoreNationalDayHashRedirect(): null {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = window.location.hash.slice(1);
    if (!raw) return;

    const pathOnly = raw.split('?')[0]?.trim() || '';
    const normalized = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
    if (normalized !== `/${NATIONAL_DAY_EXPLORER_SECTION_ID}`) return;

    navigate(
      `${ROUTE_PATHS.STORE_NATIONAL_DAY}?scroll=${NATIONAL_DAY_EXPLORER_SCROLL_QUERY}`,
      { replace: true },
    );
  }, [navigate]);

  return null;
}
