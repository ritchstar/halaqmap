/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { NATIONAL_DAY_EXPLORER_SECTION_ID } from '@/config/storeNationalDay';

export function scrollToNationalDayExplorer(): void {
  document.getElementById(NATIONAL_DAY_EXPLORER_SECTION_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}
