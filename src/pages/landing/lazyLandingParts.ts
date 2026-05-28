import { lazy } from 'react';

export const LandingSearchResults = lazy(() =>
  import('@/pages/landing/LandingSearchResults').then((m) => ({ default: m.LandingSearchResults })),
);

export const LandingAgentPanelBody = lazy(() =>
  import('@/pages/landing/LandingAgentPanelBody').then((m) => ({ default: m.LandingAgentPanelBody })),
);

export const LandingBarberDetailModal = lazy(() =>
  import('@/components/BarberDetailModal').then((m) => ({ default: m.BarberDetailModal })),
);

export const LandingFloatingPlatformActions = lazy(() =>
  import('@/components/FloatingPlatformActions').then((m) => ({ default: m.FloatingPlatformActions })),
);

export const LandingPlatformAmbientBackground = lazy(() =>
  import('@/components/PlatformAmbientBackground').then((m) => ({ default: m.PlatformAmbientBackground })),
);
