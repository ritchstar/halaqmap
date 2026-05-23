/**
 * Server-side fallback broadcast for Platform Radar (when DB trigger is unavailable).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type PlatformRadarBroadcastPayload = {
  id: string;
  kind: 'user_search';
  lat: number;
  lng: number;
  createdAt: string;
  label?: string;
  suspicious?: boolean;
  scopeType?: string;
};

const CHANNEL = 'platform_radar_channel';
const EVENT = 'user_search';

export function isKsaGeoPulse(lat: number, lng: number): boolean {
  return lat >= 16 && lat <= 33.5 && lng >= 34 && lng <= 56.5;
}

export async function broadcastPlatformRadarUserSearchServer(
  supabase: SupabaseClient,
  payload: PlatformRadarBroadcastPayload,
  authToken?: string,
): Promise<void> {
  try {
    const token = authToken?.trim();
    if (token) {
      await supabase.realtime.setAuth(token);
    }

    const channel = supabase.channel(CHANNEL, {
      config: { private: true, broadcast: { self: false, ack: false } },
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        void supabase.removeChannel(channel);
        reject(new Error('radar broadcast timeout'));
      }, 3500);

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.send({
              type: 'broadcast',
              event: EVENT,
              payload,
            });
            clearTimeout(timeout);
            await supabase.removeChannel(channel);
            resolve();
          } catch (e) {
            clearTimeout(timeout);
            await supabase.removeChannel(channel);
            reject(e);
          }
          return;
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout);
          void supabase.removeChannel(channel);
          reject(new Error(`radar broadcast ${status}`));
        }
      });
    });
  } catch {
    // DB trigger or polling may still deliver the pulse
  }
}
