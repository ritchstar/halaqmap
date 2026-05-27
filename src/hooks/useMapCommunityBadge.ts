import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { fetchMapCommunityBadgeRemote } from '@/lib/mapCommunityRemote';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';

export function useMapCommunityBadge(): { hasNewPosts: boolean; loading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['map-community-badge'],
    queryFn: async () => {
      if (!isPollingTabActive()) return false;
      const client = getSupabaseClient();
      if (!client) return false;
      const { data: session } = await client.auth.getSession();
      if (!session.session?.access_token) return false;
      const res = await fetchMapCommunityBadgeRemote();
      return res.ok ? res.hasNewPosts : false;
    },
    enabled: isSupabaseConfigured(),
    staleTime: POLL_MS.MAP_COMMUNITY_BADGE - 5_000,
    refetchInterval: POLL_MS.MAP_COMMUNITY_BADGE,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  return { hasNewPosts: Boolean(data), loading: isLoading };
}
