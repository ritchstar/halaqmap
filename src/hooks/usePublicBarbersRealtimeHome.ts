import { useEffect, useRef } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';

type BarberRowPatch = {
  id?: unknown;
  is_active?: unknown;
  open_for_customers?: unknown;
  latitude?: unknown;
  longitude?: unknown;
};

/**
 * يستمع لتغييرات صفوف `public.barbers` (UPDATE) ويحدّث قائمة العرض محلياً دون إعادة تحميل الصفحة.
 * يعتمد على نشر Realtime لجدول barbers + سياسة SELECT للزائر على الصفوف النشطة.
 */
export function usePublicBarbersRealtimeHome(opts: {
  enabled: boolean;
  onBarberUpdated: (patch: { id: string; isOpen: boolean; lat?: number; lng?: number }) => void;
  /** قناة منفصلة إن وُجد أكثر من مستمع في الصفحة */
  channelName?: string;
}): void {
  const cbRef = useRef(opts.onBarberUpdated);
  cbRef.current = opts.onBarberUpdated;
  const channelName = opts.channelName ?? 'public_barbers_map_open_status';

  useEffect(() => {
    if (!opts.enabled || !isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'barbers' },
        (payload) => {
          const row = (payload.new ?? {}) as BarberRowPatch;
          const id = String(row.id ?? '').trim();
          if (!id) return;
          const isActive = row.is_active !== false;
          const openForCustomers = row.open_for_customers !== false;
          const isOpen = isActive && openForCustomers;
          let lat: number | undefined;
          let lng: number | undefined;
          if (typeof row.latitude === 'number' && Number.isFinite(row.latitude)) lat = row.latitude;
          if (typeof row.longitude === 'number' && Number.isFinite(row.longitude)) lng = row.longitude;
          cbRef.current({ id, isOpen, lat, lng });
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [opts.enabled, channelName]);
}
