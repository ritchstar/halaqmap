import { useEffect, useMemo, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Barber } from '@/lib/index';
import { usePublicBarbersRealtimeHome } from '@/hooks/usePublicBarbersRealtimeHome';

type Props = {
  barbers: Barber[];
  userLocation: { lat: number; lng: number };
  onBarberPatch: (patch: { id: string; isOpen: boolean; lat?: number; lng?: number }) => void;
  /** ربط Realtime حتى مع قائمة فارغة مؤقتاً (مثلاً فلاتر) ليبقى تحديث القائمة لحظياً */
  realtimeEnabled: boolean;
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** اتجاه جغرافي من نقطة إلى أخرى بالدرجات (0 = شمال، مع عقارب الساعة) */
function bearingDeg(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const φ1 = (fromLat * Math.PI) / 180;
  const φ2 = (toLat * Math.PI) / 180;
  const Δλ = ((toLng - fromLng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

type RelativeDir = 'أمامك' | 'خلفك' | 'يمينك' | 'يسارك';

function relativeFacing(headingDeg: number, targetBearingDeg: number): RelativeDir {
  const delta = ((targetBearingDeg - headingDeg + 540) % 360) - 180;
  const abs = Math.abs(delta);
  if (abs <= 45) return 'أمامك';
  if (abs >= 135) return 'خلفك';
  return delta > 0 ? 'يمينك' : 'يسارك';
}

type PinPos = {
  id: string;
  name: string;
  isOpen: boolean;
  left: number;
  top: number;
  lat: number;
  lng: number;
  bearing: number;
};

/**
 * معاينة «خريطة» الدبابيس مع ربط Realtime على تحديثات `barbers` (مفتوح/مغلق).
 * يُكمّل قائمة البطاقات على الصفحة الرئيسية — يعتمد ترحيل `70_barbers_realtime_for_map.sql`.
 */
export function BarberMap({ barbers, userLocation, onBarberPatch, realtimeEnabled }: Props) {
  usePublicBarbersRealtimeHome({
    enabled: realtimeEnabled,
    onBarberUpdated: onBarberPatch,
    channelName: 'barber_map_pins_realtime',
  });

  /** اتجاه جهاز المستعلم (بوصلة) — إن توفّر؛ وإلا تُعرض إشارات نسبةً لشمال الخريطة */
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onOrientation = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number })
        .webkitCompassHeading;
      let heading: number | null = null;
      if (typeof webkitHeading === 'number' && Number.isFinite(webkitHeading)) {
        heading = webkitHeading;
      } else if (typeof event.alpha === 'number' && Number.isFinite(event.alpha)) {
        // alpha: 0 عند الشمال في معظم المتصفحات عند absolute؛ وإلا تقدير تقريبي
        heading = (360 - event.alpha) % 360;
      }
      if (heading == null) return;
      setDeviceHeading(heading);
    };

    window.addEventListener('deviceorientation', onOrientation, true);
    window.addEventListener('deviceorientationabsolute', onOrientation as EventListener, true);

    return () => {
      window.removeEventListener('deviceorientation', onOrientation, true);
      window.removeEventListener('deviceorientationabsolute', onOrientation as EventListener, true);
    };
  }, []);

  const enableDeviceCompass = async () => {
    try {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
      };
      if (typeof DOE.requestPermission === 'function') {
        const permission = await DOE.requestPermission();
        if (permission !== 'granted') return;
      }
      // الاستماع مفعّل مسبقاً؛ الطلب على iOS يكفي لبدء وصول heading
    } catch {
      /* تجاهل — يبقى وضع شمال الخريطة */
    }
  };

  const { userPct, pins, nearestOpen } = useMemo(() => {
    const valid = barbers.filter(
      (b) =>
        Number.isFinite(b.location.lat) &&
        Number.isFinite(b.location.lng) &&
        !(b.location.lat === 0 && b.location.lng === 0),
    );
    if (valid.length === 0) {
      return {
        userPct: { left: 50, top: 50 },
        pins: [] as PinPos[],
        nearestOpen: null as PinPos | null,
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

    /** هامش أكبر حتى لا تُقصّ أيقونة/تسمية نقطة الاستعلام عند الحواف */
    const toPct = (lat: number, lng: number) => {
      const x = ((lng - minLng) / spanLng) * 72 + 14;
      const y = ((maxLat - lat) / spanLat) * 68 + 16;
      return { left: clamp(x, 14, 86), top: clamp(y, 16, 84) };
    };

    const user = toPct(userLocation.lat, userLocation.lng);
    const barberPins: PinPos[] = valid.map((b) => {
      const p = toPct(b.location.lat, b.location.lng);
      return {
        id: b.id,
        name: b.name,
        isOpen: b.isOpen,
        left: p.left,
        top: p.top,
        lat: b.location.lat,
        lng: b.location.lng,
        bearing: bearingDeg(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng),
      };
    });

    const openPins = barberPins.filter((p) => p.isOpen);
    const pool = openPins.length > 0 ? openPins : barberPins;
    let nearest: PinPos | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const p of pool) {
      const dLat = p.lat - userLocation.lat;
      const dLng = p.lng - userLocation.lng;
      const d2 = dLat * dLat + dLng * dLng;
      if (d2 < best) {
        best = d2;
        nearest = p;
      }
    }

    return { userPct: user, pins: barberPins, nearestOpen: nearest };
  }, [barbers, userLocation]);

  const facingHint = useMemo(() => {
    if (!nearestOpen) return null;
    if (deviceHeading != null) {
      const dir = relativeFacing(deviceHeading, nearestOpen.bearing);
      return {
        mode: 'compass' as const,
        text: `${nearestOpen.name} — ${dir}`,
        dir,
      };
    }
    /** بدون بوصلة: نسبةً لشمال الخريطة (أعلى الإطار) */
    const northish = nearestOpen.top < userPct.top - 2;
    const southish = nearestOpen.top > userPct.top + 2;
    const eastish = nearestOpen.left > userPct.left + 2;
    const westish = nearestOpen.left < userPct.left - 2;
    let mapDir = 'باتجاه موقعك على الخريطة';
    if (northish && !southish) mapDir = 'أعلى الخريطة (شمال)';
    else if (southish && !northish) mapDir = 'أسفل الخريطة (جنوب)';
    if (eastish && !westish) mapDir = northish ? 'شمال‑شرق الخريطة' : southish ? 'جنوب‑شرق الخريطة' : 'يمين الخريطة (شرق)';
    else if (westish && !eastish) mapDir = northish ? 'شمال‑غرب الخريطة' : southish ? 'جنوب‑غرب الخريطة' : 'يسار الخريطة (غرب)';
    return {
      mode: 'map' as const,
      text: `${nearestOpen.name} — ${mapDir}`,
      dir: northish ? ('أمام الخريطة' as const) : southish ? ('خلف اتجاه الشمال' as const) : ('بجوارك' as const),
    };
  }, [nearestOpen, deviceHeading, userPct.top, userPct.left]);

  if (barbers.length === 0) return null;

  const headingRotation = deviceHeading != null ? deviceHeading : 0;

  return (
    <div className="mb-8 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">معاينة الاستجابة النشطة</h3>
        <p className="text-[11px] text-muted-foreground">
          تحديث فوري للدبابيس عند تغيّر الحلاق لحالته عبر الرابط السريع (Realtime)
        </p>
      </div>
      <div
        className="relative h-56 w-full overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-sky-950/25 via-muted/40 to-emerald-950/15 md:h-64"
        role="img"
        aria-label="معاينة مواقع الحلاقين المتاحين واتجاه نقطة الاستعلام"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:18px_18px] text-foreground" />

        {/* سهم شمال الخريطة */}
        <div className="pointer-events-none absolute left-2 top-2 z-30 rounded-md border border-border/50 bg-background/85 px-1.5 py-1 text-[9px] font-bold text-muted-foreground shadow-sm">
          شمال ↑
        </div>

        {/* خط توجيه خفيف نحو أقرب حلاق */}
        {nearestOpen ? (
          <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full" aria-hidden>
            <line
              x1={`${userPct.left}%`}
              y1={`${userPct.top}%`}
              x2={`${nearestOpen.left}%`}
              y2={`${nearestOpen.top}%`}
              stroke="rgb(56 189 248 / 0.45)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          </svg>
        ) : null}

        {/* نقطة الاستعلام — الأيقونة فوق النقطة والتسمية تحتها داخل الإطار */}
        <div
          className="absolute z-20 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${userPct.left}%`, top: `${userPct.top}%` }}
        >
          <div
            className="-mt-4 flex flex-col items-center"
            style={{ transform: `rotate(${headingRotation}deg)` }}
            title={deviceHeading != null ? 'اتجاه جهازك' : 'شمال الخريطة لأعلى'}
          >
            <Navigation
              className="h-8 w-8 text-sky-500 drop-shadow-md"
              strokeWidth={2.4}
              aria-hidden
            />
          </div>
          <span className="mt-1 max-w-[7.5rem] rounded-md border border-sky-500/30 bg-background/95 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-tight text-sky-700 shadow dark:text-sky-300">
            نقطة الاستعلام
            {deviceHeading != null ? (
              <span className="mt-0.5 block text-[9px] font-medium text-muted-foreground">اتجاهك</span>
            ) : null}
          </span>
        </div>

        {pins.map((pin) => {
          const isNearest = nearestOpen?.id === pin.id;
          const dirLabel =
            isNearest && deviceHeading != null
              ? relativeFacing(deviceHeading, pin.bearing)
              : isNearest && facingHint
                ? facingHint.dir
                : null;
          return (
            <div
              key={pin.id}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-[85%] flex-col items-center"
              style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
              title={pin.name}
              role="img"
              aria-label={
                pin.isOpen
                  ? `${pin.name} — مفتوح${dirLabel ? ` — ${dirLabel}` : ''}`
                  : `${pin.name} — مغلق`
              }
            >
              <MapPin
                className={cn(
                  'h-7 w-7 drop-shadow-md transition-colors duration-150',
                  pin.isOpen ? 'text-emerald-500' : 'text-zinc-500',
                  isNearest && 'scale-110',
                )}
                strokeWidth={2.25}
                aria-hidden
              />
              {isNearest && dirLabel ? (
                <span className="mt-0.5 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                  {dirLabel}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {facingHint ? (
        <p className="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-[11px] leading-relaxed text-foreground">
          <span className="font-semibold text-sky-700 dark:text-sky-300">اتجاه أقرب حلاق: </span>
          {facingHint.text}
          {facingHint.mode === 'map' ? (
            <>
              <span className="mt-1 block text-muted-foreground">
                حرّك الجهاز أو فعّل البوصلة لمعرفة إن كان الحلاق أمامك أو خلفك بالنسبة لاتجاه نظرك.
              </span>
              <button
                type="button"
                onClick={() => void enableDeviceCompass()}
                className="mt-2 inline-flex rounded-md border border-sky-500/35 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold text-sky-700 transition hover:bg-sky-500/20 dark:text-sky-300"
              >
                تفعيل اتجاه الجهاز (بوصلة)
              </button>
            </>
          ) : (
            <span className="mt-1 block text-muted-foreground">
              السهم الأزرق يتبع اتجاه جهازك — «أمامك» يعني في مسار سيرك، و«خلفك» خلفك.
            </span>
          )}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          مفتوح للعملاء
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
          مغلق ضمن حالة التوفر
        </span>
        <span className="inline-flex items-center gap-1">
          <Navigation className="h-3.5 w-3.5 text-sky-500" aria-hidden />
          نقطة الاستعلام (اتجاهك)
        </span>
      </div>
    </div>
  );
}
