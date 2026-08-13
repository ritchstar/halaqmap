/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Calendar, CheckCircle2, Home, Loader2, Scissors, Smartphone, Store, User } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { ROUTE_PATHS } from '@/lib/index';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import {
  createNamedBookingRemote,
  fetchAvailableSlotsRemote,
  fetchPublicBookingContextRemote,
  type PublicBookingContext,
  type PublicBookingTeamMember,
} from '@/lib/namedBarberBookingRemote';
import { cn } from '@/lib/utils';
import {
  formatCustomerBookingRef,
  homeWithSalonPath,
  persistCustomerNamedBookingReceipt,
} from '@/lib/customerNamedBookingReceipt';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(base: string, days: number): string {
  const d = new Date(`${base}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function BookBarber() {
  const { barberId = '' } = useParams<{ barberId: string }>();
  const minDate = todayIso();
  const maxDate = addDaysIso(minDate, 13);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<PublicBookingContext | null>(null);
  const [selectedMember, setSelectedMember] = useState<PublicBookingTeamMember | null>(null);
  const [date, setDate] = useState(minDate);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!barberId.trim()) {
        setError('معرّف الصالون غير صالح.');
        setLoading(false);
        return;
      }
      if (!isSupabaseConfigured()) {
        setError('حجز المواعيد يتطلب ضبط قاعدة البيانات على المنصة.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await fetchPublicBookingContextRemote(barberId);
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setContext(res.context);
      setSelectedMember(res.context.team[0] ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [barberId]);

  const refreshSlots = useCallback(async () => {
    if (!barberId.trim() || !date) return;
    setSlotsLoading(true);
    const res = await fetchAvailableSlotsRemote({
      barberId,
      bookingDate: date,
      teamMemberId: selectedMember?.id ?? null,
      durationMinutes: selectedMember?.defaultDurationMinutes,
    });
    setSlotsLoading(false);
    if (!res.ok) {
      setSlots([]);
      setTime('');
      toast.error(res.error);
      return;
    }
    setSlots(res.slots);
    setTime((prev) => (res.slots.includes(prev) ? prev : res.slots[0] ?? ''));
  }, [barberId, date, selectedMember]);

  useEffect(() => {
    void refreshSlots();
  }, [refreshSlots]);

  const canSubmit = useMemo(() => {
    return Boolean(date && time && /^05\d{8}$/.test(phone.trim()) && !submitting);
  }, [date, time, phone, submitting]);

  const submit = async () => {
    if (!canSubmit) {
      toast.error('أكمل التاريخ والوقت ورقم الجوال الصحيح.');
      return;
    }
    setSubmitting(true);
    const result = await createNamedBookingRemote({
      barberId,
      bookingDate: date,
      bookingTime: time,
      customerPhone: phone.trim(),
      teamMemberId: selectedMember?.id ?? null,
      durationMinutes: selectedMember?.defaultDurationMinutes,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      void refreshSlots();
      return;
    }
    persistCustomerNamedBookingReceipt({
      bookingId: result.bookingId,
      barberId,
      barberName: context?.salon.name || '',
      date,
      time,
    });
    setBookingRef(formatCustomerBookingRef(result.bookingId));
    setSubmitted(true);
    window.scrollTo(0, 0);
    toast.success('تم إرسال طلب الحجز. سيُراجعه الصالون ويتم التأكيد على رقمك.');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center" dir="rtl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !context) {
    return (
      <Layout>
        <div className="container mx-auto max-w-lg px-4 py-12" dir="rtl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                تعذّر فتح صفحة الحجز
              </CardTitle>
              <CardDescription>{error || 'الصالون غير متاح للحجز حالياً.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="gap-2">
                <Link to={ROUTE_PATHS.HOME}>
                  <Home className="h-4 w-4" />
                  الرئيسية
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto flex min-h-[80svh] max-w-lg items-start px-4 py-10" dir="rtl">
          <Card className="w-full border-emerald-400/40 bg-emerald-500/5">
            <CardHeader className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
              <CardTitle className="mt-3 text-2xl text-foreground">تم إرسال الطلب</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                وصل طلبك إلى {context.salon.name}. سيراجع الصالون الموعد ويتواصل معك على جوالك.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookingRef ? (
                <div className="rounded-xl border border-emerald-400/30 bg-background/80 px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">رقم الموعد</p>
                  <p className="mt-1 font-mono text-xl font-black tracking-wide" dir="ltr">
                    {bookingRef}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {date} — الساعة {time}
                  </p>
                </div>
              ) : null}
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full gap-2 font-bold">
                  <Link to={homeWithSalonPath(barberId)}>
                    <Store className="h-4 w-4" />
                    المتابعة مع الصالون
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link to={ROUTE_PATHS.HOME}>
                    <Home className="h-4 w-4" />
                    العودة للرئيسية
                  </Link>
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setSubmitted(false)}>
                  حجز موعد آخر
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 py-8 sm:py-12" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-accent" />
              حجز موعد — {context.salon.name}
            </CardTitle>
            <CardDescription>
              اختر الحلاق والوقت المتاح ثم أرسل رقم جوالك. الطلب يصل للصالون للمراجعة والتأكيد.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {context.team.length > 0 ? (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  اختر الحلاق
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {context.team.map((member) => {
                    const active = selectedMember?.id === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition',
                          active
                            ? 'border-accent bg-accent/10 ring-1 ring-accent/40'
                            : 'border-border hover:bg-muted/40',
                        )}
                      >
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-muted">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Scissors className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-xs font-semibold leading-snug">{member.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                الحجز على مستوى الصالون (لم يُضف طاقم حلاقين بعد).
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="book-date">التاريخ</Label>
                <Input
                  id="book-date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="book-phone" className="flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5" />
                  جوالك
                </Label>
                <Input
                  id="book-phone"
                  inputMode="numeric"
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  className="text-left"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الوقت المتاح</Label>
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري تحميل الأوقات…
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد أوقات فارغة في هذا اليوم. جرّب يوماً آخر.</p>
              ) : (
                <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={cn(
                        'rounded-md border px-2 py-2 text-sm tabular-nums',
                        time === slot
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border hover:bg-muted/50',
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={!canSubmit || slots.length === 0}
              onClick={() => void submit()}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إرسال طلب الحجز'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
