import { useMemo, useState } from 'react';
import { Crosshair, Loader2, MapPin, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { clearStoredUserCoords, readStoredUserCoords, storeUserCoords } from '@/lib/userRegionWeather';
import { resolveStrictUserLocation, type StrictGeoResult } from '@/lib/strictGeolocation';

type Props = {
  canRun: boolean;
};

function formatLatLng(v: number): string {
  return Number(v).toFixed(6);
}

export function GeolocationDiagnosticsPanel({ canRun }: Props) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<StrictGeoResult | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const stored = useMemo(() => readStoredUserCoords(), [nonce]);

  const runProbe = async () => {
    if (!canRun || running) return;
    setRunning(true);
    setResult(null);
    try {
      const probe = await resolveStrictUserLocation({
        previousCoords: readStoredUserCoords(),
        highAccuracyTimeoutMs: 12_000,
        sampleWindowMs: 9_000,
        minDesiredAccuracyM: 60,
        maxAcceptableAccuracyM: 350,
      });
      if (probe.ok) {
        storeUserCoords(probe.coords);
        setCapturedAt(new Date().toISOString());
      }
      setResult(probe);
      setNonce((n) => n + 1);
    } finally {
      setRunning(false);
    }
  };

  const clearProbe = () => {
    clearStoredUserCoords();
    setResult(null);
    setCapturedAt(null);
    setNonce((n) => n + 1);
  };

  return (
    <Card className="border-cyan-500/35 bg-cyan-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crosshair className="h-5 w-5 text-cyan-300" />
          Geolocation Diagnostics
        </CardTitle>
        <CardDescription>
          فحص جنائي لجودة تحديد الموقع: دقة بالمتر، عدد العينات، وتحذير القراءة الراكدة.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground">آخر إحداثيات محفوظة في الجلسة</p>
            {stored ? (
              <div className="space-y-1">
                <p className="font-mono text-[11px]">lat: {formatLatLng(stored.lat)}</p>
                <p className="font-mono text-[11px]">lng: {formatLatLng(stored.lng)}</p>
              </div>
            ) : (
              <p>لا توجد إحداثيات محفوظة حالياً.</p>
            )}
          </div>
          <div className="rounded-lg border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground">بيئة العميل</p>
            <div className="space-y-1">
              <p className="break-all">
                <span className="text-foreground">UA:</span> {typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a'}
              </p>
              <p>
                <span className="text-foreground">المنصة:</span>{' '}
                {typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
                  ? 'mobile'
                  : 'desktop'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={runProbe} disabled={!canRun || running}>
            {running ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الالتقاط...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                التقاط جديد
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={clearProbe} disabled={running}>
            مسح الحالة
          </Button>
          {!canRun ? <Badge variant="outline">صلاحية الإدارة لا تسمح بالتشغيل</Badge> : null}
        </div>

        {result ? (
          <div className="rounded-lg border border-border/70 bg-background/70 p-3 text-xs">
            {result.ok ? (
              <div className="space-y-2 text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    ناجح
                  </Badge>
                  <Badge variant="outline">samples: {result.samples}</Badge>
                  <Badge variant="outline">accuracy: ±{result.accuracyM}m</Badge>
                  <Badge variant="outline">
                    stale: {result.warning ? 'yes' : 'no'}
                  </Badge>
                </div>
                <p className="font-mono text-[11px]">
                  lat: {formatLatLng(result.coords.lat)} | lng: {formatLatLng(result.coords.lng)}
                </p>
                <p>
                  <span className="text-foreground">وقت الالتقاط:</span>{' '}
                  {capturedAt ? new Date(capturedAt).toLocaleString() : 'n/a'}
                </p>
                {result.warning ? (
                  <p className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-amber-200">
                    <TriangleAlert className="mr-1 inline-block h-3.5 w-3.5 align-text-top" />
                    {result.warning}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2 text-rose-300">
                <Badge variant="destructive">فشل الالتقاط</Badge>
                <p>{result.error}</p>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
