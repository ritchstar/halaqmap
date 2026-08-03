/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة خفيفة لعضو الطاقم عبر رابط سري — عرض الحجوزات + منبّه عند حجز جديد.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bell, Clock, Home, Loader2, Phone, Scissors, User } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib/index';
import {
  fetchStaffTeamBookingsRemote,
  type StaffTeamBookingRemote,
  type StaffTeamBookingsPayload,
} from '@/lib/namedBarberBookingRemote';
import { cn } from '@/lib/utils';

const POLL_MS = 20_000;

function statusLabel(status: StaffTeamBookingRemote['status']): string {
  if (status === 'confirmed') return 'مؤكد';
  if (status === 'pending') return 'قيد الانتظار';
  if (status === 'completed') return 'مكتمل';
  if (status === 'cancelled') return 'ملغي';
  return status;
}

function statusClass(status: StaffTeamBookingRemote['status']): string {
  if (status === 'confirmed') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
  if (status === 'pending') return 'bg-amber-500/10 text-amber-800 border-amber-500/30';
  return 'bg-muted text-muted-foreground';
}

function playSoftChime(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.4);
    window.setTimeout(() => {
      void ctx.close();
    }, 500);
  } catch {
    /* ignore audio failures */
  }
}

function alertNewBooking(): void {
  playSoftChime();
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([80, 40, 80]);
    }
  } catch {
    /* ignore */
  }
}

export default function StaffTeamBookingsPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<StaffTeamBookingsPayload | null>(null);
  const [freshAlert, setFreshAlert] = useState(false);
  const lastPendingRef = useRef<number | null>(null);
  const alertTimerRef = useRef<number | null>(null);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    const accessToken = token.trim();
    if (!accessToken) {
      setError('رابط المتابعة غير صالح.');
      setLoading(false);
      return;
    }
    if (!opts?.silent) setLoading(true);
    const res = await fetchStaffTeamBookingsRemote(accessToken);
    if (!opts?.silent) setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setPayload(res.data);

    const pending = res.data.pendingCount;
    if (lastPendingRef.current != null && pending > lastPendingRef.current) {
      alertNewBooking();
      setFreshAlert(true);
      if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = window.setTimeout(() => setFreshAlert(false), 8000);
    }
    lastPendingRef.current = pending;
  }, [token]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      void refresh({ silent: true });
    }, POLL_MS);
    return () => {
      window.clearInterval(id);
      if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current);
    };
  }, [refresh]);

  if (loading && !payload) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error && !payload) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-12" dir="rtl">
          <Card>
            <CardHeader>
              <CardTitle>تعذّر فتح صفحة الحجوزات</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to={ROUTE_PATHS.HOME}>
                  <Home className="ml-2 h-4 w-4" />
                  العودة للرئيسية
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!payload) return null;

  const { member, salon, bookings } = payload;

  return (
    <Layout>
      <div className="mx-auto max-w-lg px-4 py-6 sm:py-10" dir="rtl">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Scissors className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{salon.name || 'الصالون'}</p>
            <h1 className="text-xl font-bold tracking-tight">{member.displayName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              حجوزاتك القادمة باسمك — حدّث الصفحة تبقى مفتوحة لاستقبال المنبّه.
            </p>
          </div>
        </div>

        {freshAlert ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2.5 text-sm font-medium text-amber-950 dark:text-amber-50">
            <Bell className="h-4 w-4 shrink-0" />
            حجز جديد بانتظارك
          </div>
        ) : null}

        {!member.isActive ? (
          <p className="mb-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            حالتك حالياً خارج الخدمة لدى المالك — قد لا تظهر حجوزات جديدة حتى تُعاد الإتاحة.
          </p>
        ) : null}

        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">
            الحجوزات ({bookings.length})
            {payload.pendingCount > 0 ? (
              <span className="mr-2 text-amber-700 dark:text-amber-300">
                · {payload.pendingCount} قيد الانتظار
              </span>
            ) : null}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => void refresh()}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            تحديث
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              لا توجد حجوزات قادمة باسمك الآن.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li key={b.id}>
                <Card
                  className={cn(
                    'border-border/80',
                    b.status === 'pending' ? 'border-amber-500/35 bg-amber-500/5' : '',
                  )}
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="truncate font-semibold">{b.customer_name || 'عميل'}</p>
                      </div>
                      <Badge className={cn('shrink-0 text-[10px]', statusClass(b.status))}>
                        {statusLabel(b.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{b.service_name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {b.booking_date} · {b.booking_time}
                      </span>
                      {b.customer_phone ? (
                        <a
                          href={`tel:${b.customer_phone}`}
                          className="inline-flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
                          dir="ltr"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {b.customer_phone}
                        </a>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          التأكيد والإلغاء من لوحة مالك الصالون. هذه الصفحة للمتابعة والتنبيه فقط.
        </p>
      </div>
    </Layout>
  );
}
