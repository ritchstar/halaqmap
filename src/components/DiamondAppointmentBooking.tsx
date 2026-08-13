/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, Home, Loader2, Send, Smartphone, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { createDiamondAppointmentBookingRemote } from '@/lib/diamondAppointmentBookingRemote';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  formatCustomerBookingRef,
  homeWithSalonPath,
  persistCustomerNamedBookingReceipt,
} from '@/lib/customerNamedBookingReceipt';

function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDaysIso(base: string, days: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** فتحات كل 30 دقيقة — من 10:00 حتى 23:00 (ماسي) */
const SLOT_STEP_MIN = 30;
const DAY_START_MIN = 10 * 60; // 10:00
const DAY_END_MIN = 23 * 60; // 23:00 inclusive

function buildSlotsForDate(_dateIso: string): string[] {
  const slots: string[] = [];
  for (let mins = DAY_START_MIN; mins <= DAY_END_MIN; mins += SLOT_STEP_MIN) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

interface DiamondAppointmentBookingProps {
  barberId: string;
  barberName: string;
  /** بطاقة القائمة: أكثر ضغطاً */
  compact?: boolean;
}

export function DiamondAppointmentBooking({ barberId, barberName, compact }: DiamondAppointmentBookingProps) {
  const minDate = todayIso();
  const maxDate = addDaysIso(minDate, 13);
  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState('10:00');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const slots = useMemo(() => buildSlotsForDate(date), [date]);

  useEffect(() => {
    if (!slots.includes(time)) {
      setTime(slots[0] ?? '10:00');
    }
  }, [slots, time]);

  const submit = useCallback(async () => {
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error('أدخل رقم جوال سعودي صحيح يبدأ بـ 05 (10 أرقام) لاعتماد طلب الحجز.');
      return;
    }
    if (!isSupabaseConfigured()) {
      toast.error('حجز المواعيد الحي يتطلب ضبط قاعدة البيانات على المنصة.');
      return;
    }
    setSubmitting(true);
    const result = await createDiamondAppointmentBookingRemote({
      barberId,
      bookingDate: date,
      bookingTime: time,
      customerPhone: phone.trim(),
      durationMinutes: SLOT_STEP_MIN,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    persistCustomerNamedBookingReceipt({
      bookingId: result.bookingId,
      barberId,
      barberName,
      date,
      time,
    });
    setBookingRef(formatCustomerBookingRef(result.bookingId));
    setPhone('');
    toast.success('تم إرسال طلب الحجز. سيُراجعه الصالون ويتم التأكيد على رقمك.', { duration: 5000 });
  }, [barberId, barberName, date, time, phone]);

  if (bookingRef) {
    return (
      <Card className="barber-contact-inner min-w-0 max-w-full overflow-hidden border-emerald-400/40 bg-emerald-500/10">
        <CardContent className={compact ? 'space-y-3 p-3' : 'space-y-4 p-4'}>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <p className="font-bold text-foreground">تم إرسال الطلب</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                وصل طلبك إلى {barberName}. رقم الموعد{' '}
                <span className="font-mono font-bold text-foreground" dir="ltr">
                  {bookingRef}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm" className="w-full gap-1 font-bold">
              <Link to={homeWithSalonPath(barberId)}>
                <Store className="h-3.5 w-3.5" />
                المتابعة مع الصالون
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full gap-1">
              <Link to={ROUTE_PATHS.HOME}>
                <Home className="h-3.5 w-3.5" />
                العودة للرئيسية
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="barber-contact-inner min-w-0 max-w-full overflow-hidden border-accent/40 bg-gradient-to-br from-accent/8 via-card to-primary/5 shadow-inner">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-accent">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>جدولة مواعيد — ماسي</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug">
            اختر اليوم والوقت وأرسل رقم جوالك لاعتماد الحجز (يتحكم الحلاق بإظهار هذه الكتلة من لوحته).
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">اليوم</Label>
              <Input
                type="date"
                min={minDate}
                max={maxDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">الوقت</Label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              >
                {slots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              الجوال (إلزامي للاعتماد)
            </Label>
            <Input
              type="tel"
              dir="ltr"
              placeholder="05xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full h-8 text-xs gap-1 bg-accent hover:bg-accent/90"
            onClick={() => void submit()}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            إرسال طلب الحجز
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="barber-contact-inner min-w-0 max-w-full overflow-hidden border-accent/50 bg-gradient-to-br from-accent/10 via-card to-primary/5">
      <CardContent className="min-w-0 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold break-words text-foreground">جدولة مواعيد دقيقة — باقة ماسية</h4>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed break-words">
              يتحكم صاحب الصالون في <strong>إظهار أو إخفاء</strong> هذه الكتلة للعملاء. اختر تاريخاً ووقتاً محدداً
              وأدخل رقم جوالك؛ يُستخدم الرقم لاعتماد الحجز والتواصل.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              التاريخ
            </Label>
            <Input type="date" min={minDate} max={maxDate} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              الوقت (كل {SLOT_STEP_MIN} دقيقة)
            </Label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {slots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            رقم الجوال لاعتماد الحجز *
          </Label>
          <Input
            type="tel"
            dir="ltr"
            placeholder="05xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button
          type="button"
          className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          onClick={() => void submit()}
          disabled={submitting}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          إرسال طلب الحجز
        </Button>
      </CardContent>
    </Card>
  );
}
