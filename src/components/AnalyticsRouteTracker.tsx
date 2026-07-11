import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getAdminPortalBaseFromPathname } from '@/config/adminAuth';
import type { PresencePersona } from '@/config/platformPresence';
import {
  classifyRouteBucketSafe,
  initProductAnalytics,
  isProductAnalyticsEnabled,
  trackPageView,
} from '@/lib/analytics/productAnalytics';
import { getSupabaseClient } from '@/integrations/supabase/client';
import { readBarberAuthSession } from '@/lib/barberPortalSession';
import { readAmbassadorPortal } from '@/lib/ambassadorPortalStore';
import { startPresenceHeartbeatLoop } from '@/lib/presenceHeartbeat';

function isAdminPath(pathname: string): boolean {
  return getAdminPortalBaseFromPathname(pathname) != null;
}

function resolvePersona(pathname: string): PresencePersona {
  if (isAdminPath(pathname)) return 'admin';
  if (pathname.startsWith('/ambassadors') && readAmbassadorPortal()) return 'ambassador';
  if (readBarberAuthSession()) return 'barber';
  if (pathname.startsWith('/ambassadors')) return 'ambassador';
  return 'anon';
}

/**
 * HashRouter pageviews (PostHog) + presence heartbeat (visible tab only).
 */
export function AnalyticsRouteTracker(): null {
  const { pathname } = useLocation();
  const pathRef = useRef(pathname);
  const adminTokenRef = useRef('');
  pathRef.current = pathname;

  useEffect(() => {
    initProductAnalytics();
  }, []);

  useEffect(() => {
    const bucket = classifyRouteBucketSafe(pathname, isAdminPath);
    if (isProductAnalyticsEnabled()) {
      trackPageView(pathname, bucket);
    }
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      const client = getSupabaseClient();
      if (!client) {
        adminTokenRef.current = '';
        return;
      }
      void client.auth.getSession().then(({ data }) => {
        if (!cancelled) adminTokenRef.current = data.session?.access_token?.trim() || '';
      });
    };
    refresh();
    const client = getSupabaseClient();
    const sub = client?.auth.onAuthStateChange(() => refresh());
    const id = window.setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const stop = startPresenceHeartbeatLoop(() => {
      const path = pathRef.current;
      const bucket = classifyRouteBucketSafe(path, isAdminPath);
      const persona = resolvePersona(path);
      const barber = readBarberAuthSession();

      if (persona === 'barber' && barber) {
        return {
          persona: 'barber',
          routeBucket: bucket,
          barberId: barber.id,
          email: barber.email,
          barberPortalSessionToken: barber.barberSessionToken,
        };
      }

      if (persona === 'admin') {
        const token = adminTokenRef.current.trim();
        if (!token) return { persona: 'anon', routeBucket: bucket };
        return {
          persona: 'admin',
          routeBucket: bucket,
          adminAccessToken: token,
        };
      }

      if (persona === 'ambassador') {
        return { persona: 'ambassador', routeBucket: bucket };
      }

      return { persona: 'anon', routeBucket: bucket };
    });
    return stop;
  }, []);

  return null;
}
