/** Shared mobile shell tokens — aligned with LandingPreview + Layout.tsx */

export const MOBILE_SHELL_OVERFLOW = 'overflow-x-hidden';

export const MOBILE_SAFE_TOP = 'pt-[env(safe-area-inset-top)]';

export const MOBILE_SAFE_BOTTOM_MIN = 'pb-[max(1rem,env(safe-area-inset-bottom,0px))]';

/** Fixed bottom dock with query lens — LandingPreview mobile (filters + CTA) */
export const MOBILE_QUERY_DOCK_CLEARANCE =
  'pb-[calc(18rem+env(safe-area-inset-bottom,0px))]';

/** Legacy dock clearance (simple search bar) */
export const MOBILE_DOCK_CLEARANCE = MOBILE_QUERY_DOCK_CLEARANCE;

/** Layout.tsx MobileBottomNav clearance */
export const MOBILE_LAYOUT_NAV_CLEARANCE = 'pb-[calc(5rem+env(safe-area-inset-bottom,0px))]';

/** Partner marketing fixed bottom dual-CTA clearance */
export const MOBILE_PARTNER_ACTION_DOCK_CLEARANCE =
  'pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]';

/** Fixed nav bar safe-area inset */
export const MOBILE_FIXED_NAV_SAFE = 'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]';

/** PartnerLayout fixed bottom nav clearance */
export const MOBILE_PARTNER_NAV_CLEARANCE = MOBILE_DOCK_CLEARANCE;

/** Extra scroll-end pad for long legal / prose pages inside partner shell */
export const MOBILE_SCROLL_END_EXTRA = 'pb-[calc(2rem+env(safe-area-inset-bottom,0px))]';
