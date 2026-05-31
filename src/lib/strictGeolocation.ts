import { calculateDistance } from '@/lib';

export type StrictGeoSuccess = {
  ok: true;
  coords: { lat: number; lng: number };
  accuracyM: number;
  samples: number;
  warning?: string;
};

export type StrictGeoFailure = {
  ok: false;
  error: string;
};

export type StrictGeoResult = StrictGeoSuccess | StrictGeoFailure;

type StrictGeoOptions = {
  previousCoords?: { lat: number; lng: number } | null;
  highAccuracyTimeoutMs?: number;
  sampleWindowMs?: number;
  minDesiredAccuracyM?: number;
  maxAcceptableAccuracyM?: number;
};

function geoErrorMessage(code: number | undefined): string {
  if (code === 1) return 'تم رفض الإذن — فعّل الموقع من إعدادات المتصفح ثم أعد المحاولة.';
  if (code === 2) return 'إشارة الموقع غير متاحة حاليًا. جرّب قرب نافذة أو خارج المبنى.';
  if (code === 3) return 'انتهت مهلة تحديد الموقع. حاول مجددًا مع اتصال أقوى.';
  return 'تعذّر تحديد الموقع بدقة كافية.';
}

function requestPosition(enableHighAccuracy: boolean, timeoutMs: number): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy,
      timeout: timeoutMs,
      maximumAge: 0,
    });
  });
}

function collectBestSample(
  initial: GeolocationPosition,
  sampleWindowMs: number,
  minDesiredAccuracyM: number,
): Promise<{ best: GeolocationPosition; samples: number }> {
  return new Promise((resolve) => {
    let best = initial;
    let samples = 1;
    let done = false;

    const finish = (watchId: number | null) => {
      if (done) return;
      done = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      resolve({ best, samples });
    };

    if ((initial.coords.accuracy ?? Infinity) <= minDesiredAccuracyM) {
      finish(null);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        samples += 1;
        if ((pos.coords.accuracy ?? Infinity) < (best.coords.accuracy ?? Infinity)) {
          best = pos;
        }
        if ((best.coords.accuracy ?? Infinity) <= minDesiredAccuracyM) {
          finish(watchId);
        }
      },
      () => {
        finish(watchId);
      },
      {
        enableHighAccuracy: true,
        timeout: Math.max(10_000, sampleWindowMs),
        maximumAge: 0,
      },
    );

    window.setTimeout(() => finish(watchId), sampleWindowMs);
  });
}

function staleLikely(
  previousCoords: { lat: number; lng: number } | null | undefined,
  currentCoords: { lat: number; lng: number },
  accuracyM: number,
): boolean {
  if (!previousCoords) return false;
  const meters = calculateDistance(
    previousCoords.lat,
    previousCoords.lng,
    currentCoords.lat,
    currentCoords.lng,
  ) * 1000;
  // If browser returns almost same point but with weak accuracy, suspect stale network fix.
  return meters < 25 && accuracyM > 180;
}

export async function resolveStrictUserLocation(options: StrictGeoOptions = {}): Promise<StrictGeoResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return { ok: false, error: 'المتصفح لا يدعم تحديد الموقع الجغرافي.' };
  }

  const highAccuracyTimeoutMs = options.highAccuracyTimeoutMs ?? 12_000;
  const sampleWindowMs = options.sampleWindowMs ?? 9_000;
  const minDesiredAccuracyM = options.minDesiredAccuracyM ?? 60;
  const maxAcceptableAccuracyM = options.maxAcceptableAccuracyM ?? 350;

  try {
    let initial: GeolocationPosition;
    try {
      initial = await requestPosition(true, highAccuracyTimeoutMs);
    } catch (err) {
      const code = (err as GeolocationPositionError).code;
      if (code === 1) return { ok: false, error: geoErrorMessage(code) };
      initial = await requestPosition(false, 20_000);
    }

    const { best, samples } = await collectBestSample(initial, sampleWindowMs, minDesiredAccuracyM);
    const coords = { lat: best.coords.latitude, lng: best.coords.longitude };
    const accuracyM = Math.round(best.coords.accuracy ?? Infinity);

    if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
      return { ok: false, error: 'إحداثيات غير صالحة من خدمة الموقع.' };
    }

    if (!Number.isFinite(accuracyM) || accuracyM > maxAcceptableAccuracyM) {
      return {
        ok: false,
        error: `دقة الموقع ضعيفة جدًا (±${Number.isFinite(accuracyM) ? accuracyM : '∞'}م). حاول من مكان مكشوف أو فعّل GPS.`,
      };
    }

    const warning = staleLikely(options.previousCoords, coords, accuracyM)
      ? 'النقطة قريبة جدًا من القراءة السابقة بدقة شبكة متوسطة. إن تغيّرت منطقتك فعليًا أعد المحاولة قرب نافذة أو عبر شبكة مختلفة.'
      : undefined;

    return { ok: true, coords, accuracyM, samples, ...(warning ? { warning } : {}) };
  } catch (err) {
    return { ok: false, error: geoErrorMessage((err as GeolocationPositionError).code) };
  }
}
