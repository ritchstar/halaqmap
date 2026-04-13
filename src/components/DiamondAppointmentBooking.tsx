import { useMemo, useState, useCallback, useEffect } from 'react';
import { Calendar, Clock, Smartphone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDaysIso(base: string, days: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** فتحات كل 30 دقيقة — معاينة دقة الجدولة (ماسي) */
const SLOT_STEP_MIN = 30;
const DAY_START_H = 10;
const DAY_END_H = 20;

function buildSlotsForDate(_dateIso: string): string[] {
  const slots: string[] = [];
  for (let h = DAY_START_H; h < DAY_END_H; h++) {
    for (let m = 0; m < 60; m += SLOT_STEP_MIN) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
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

  const slots = useMemo(() => buildSlotsForDate(date), [date]);

  useEffect(() => {
    if (!slots.includes(time)) {
      setTime(slots[0] ?? '10:00');
    }
  }, [slots, time]);

  const submit = useCallback(() => {
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error('أدخل رقم جوال سعودي صحيح يبدأ بـ 05 (10 أرقام) لاعتماد طلب الحجز.');
      return;
    }
    toast.success(
      'تم إرسال طلب الحجز. سيُراجعه الصالون ويتم التأكيد على رقمك — هذه معاينة للباقة الماسية.',
      { duration: 5000 }
    );
    // معاينة: يمكن لاحقاً الإرسال إلى API
    if (import.meta.env.DEV) {
      console.info('[halaqmap] diamond booking preview', { barberId, barberName, date, time, phone });
    }
  }, [barberId, barberName, date, time, phone]);

  if (compact) {
    return (
      <Card className="border-accent/40 bg-gradient-to-br from-accent/8 via-card to-primary/5 shadow-inner">
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
          <Button type="button" size="sm" className="w-full h-8 text-xs gap-1 bg-accent hover:bg-accent/90" onClick={submit}>
            <Send className="w-3.5 h-3.5" />
            إرسال طلب الحجز
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/50 bg-gradient-to-br from-accent/10 via-card to-primary/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">جدولة مواعيد دقيقة — باقة ماسية</h4>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
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
        <Button type="button" className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" onClick={submit}>
          <Send className="w-4 h-4" />
          إرسال طلب الحجز
        </Button>
      </CardContent>
    </Card>
  );
}
