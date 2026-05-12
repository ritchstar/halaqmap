import { useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Barber } from '@/lib/index';
import { usePublicBarbersRealtimeHome } from '@/hooks/usePublicBarbersRealtimeHome';

type Props = {
  barbers: Barber[];
  userLocation: { lat: number; lng: number };
  onBarberPatch: (patch: { id: string; isOpen: boolean; lat?: number; lng?: number }) => void;
  /** اشتراك Realtime حتى مع قائمة فارغة مؤقتاً (مثلاً فلاتر) ليبقى تحديث القائمة لحظياً */
  realtimeEnabled: boolean;
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

type PinPos = { id: string; name: string; isOpen: boolean; left: number; top: number };

/**
 * معاينة «خريطة» الدبابيس مع اشتراك Realtime على تحديثات `barbers` (مفتوح/مغلق).
 * يُكمّل قائمة البطاقات على الصفحة الرئيسية — يعتمد ترحيل `70_barbers_realtime_for_map.sql`.
 */
export function BarberMap({ barbers, userLocation, onBarberPatch, realtimeEnabled }: Props) {
  usePublicBarbersRealtimeHome({
    enabled: realtimeEnabled,
    onBarberUpdated: onBarberPatch,
    channelName: 'barber_map_pins_realtime',
  });

  const { userPct, pins } = useMemo(() => {
    const valid = barbers.filter(
      (b) =>
        Number.isFinite(b.location.lat) &&
        Number.isFinite(b.location.lng) &&
        !(b.location.lat === 0 && b.location.lng === 0)
    );
    if (valid.length === 0) {
      return {
        userPct: { left: 50, top: 50 },
        pins: [] as PinPos[],
      };
    }

    const lats = [...valid.map((b) => b.location.lat), userLocation.lat];
    const lngs = [...valid.map((b) => b.location.lng), userLocation.lng];
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = Math.max(0.006, maxLat - minLat);
    const spanLng = Math.max(0.006, maxLng - minLng);

    const toPct = (lat: number, lng: number) => {
      const x = ((lng - minLng) / spanLng) * 86 + 7;
      const y = ((maxLat - lat) / spanLat) * 86 + 7;
      return { left: clamp(x, 6, 94), top: clamp(y, 6, 94) };
    };

    const user = toPct(userLocation.lat, userLocation.lng);
    const barberPins: PinPos[] = valid.map((b) => {
      const p = toPct(b.location.lat, b.location.lng);
      return { id: b.id, name: b.name, isOpen: b.isOpen, left: p.left, top: p.top };
    });
    return { userPct: user, pins: barberPins };
  }, [barbers, userLocation]);

  if (barbers.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">خريطة قريبة</h3>
        <p className="text-[11px] text-muted-foreground">
          تحديث فوري للدبابيس عند تغيّر الحلاق لحالته عبر الرابط السريع (Realtime)
        </p>
      </div>
      <div
        className="relative h-52 w-full overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-sky-950/25 via-muted/40 to-emerald-950/15 md:h-60"
        role="img"
        aria-label="معاينة مواقع الحلاقين القريبين"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:18px_18px] text-foreground" />

        <div
          className="absolute z-20 flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ left: `${userPct.left}%`, top: `${userPct.top}%` }}
        >
          <Navigation className="h-7 w-7 text-sky-500 drop-shadow-md" aria-hidden />
          <span className="mt-0.5 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow">
            أنت
          </span>
        </div>

        {pins.map((pin) => (
          <div
            key={pin.id}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center"
            style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
            title={pin.name}
            role="img"
            aria-label={pin.isOpen ? `${pin.name} — مفتوح` : `${pin.name} — مغلق`}
          >
            <MapPin
              className={cn(
                'h-7 w-7 drop-shadow-md transition-colors duration-150',
                pin.isOpen ? 'text-emerald-500' : 'text-zinc-500'
              )}
              strokeWidth={2.25}
              aria-hidden
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          مفتوح للعملاء
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
          مغلق على الخريطة
        </span>
        <span className="inline-flex items-center gap-1">
          <Navigation className="h-3.5 w-3.5 text-sky-500" aria-hidden />
          موقعك
        </span>
      </div>
    </div>
  );
}
