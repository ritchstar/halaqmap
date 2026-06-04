import { useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { fetchMapCommunityBadgeRemote } from '@/lib/mapCommunityRemote';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';

export function useMapCommunityBadge(): { hasNewPosts: boolean; loading: boolean } {
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setHasNewPosts(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      if (!isPollingTabActive()) return;
      const client = getSupabaseClient();
      if (!client) {
        if (!cancelled) {
          setHasNewPosts(false);
          setLoading(false);
        }
        return;
      }
      const { data: session } = await client.auth.getSession();
      if (!session.session?.access_token) {
        if (!cancelled) {
          setHasNewPosts(false);
          setLoading(false);
        }
        return;
      }
      const res = await fetchMapCommunityBadgeRemote();
      if (!cancelled) {
        setHasNewPosts(res.ok ? res.hasNewPosts : false);
        setLoading(false);
      }
    };

    void load();
    const id = window.setInterval(() => {
      void load();
    }, POLL_MS.MAP_COMMUNITY_BADGE);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return { hasNewPosts, loading };
}
