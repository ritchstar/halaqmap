import { useMemo } from 'react';
import { CalendarPlus, CheckCircle2, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { buildBookingIcs, buildGoogleCalendarUrl, downloadTextFile } from '@/lib/bookingCalendar';

export type BookingSuccessPayload = {
  barberName: string;
  date: string;
  time: string;
  durationMinutes: number;
  bookingId: string | null;
};

type BookingSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: BookingSuccessPayload | null;
};

export function BookingSuccessDialog({ open, onOpenChange, payload }: BookingSuccessDialogProps) {
  const title = useMemo(() => {
    if (!payload) return '';
    return `حجز — ${payload.barberName} (حلاق ماب)`;
  }, [payload]);

  const details = useMemo(() => {
    if (!payload) return '';
    const parts = [
      `موعدك في صالون ${payload.barberName} عبر حلاق ماب.`,
      `المدة: ${payload.durationMinutes} دقيقة.`,
      'سيُراجع الصالون الطلب ويُؤكد معك على الجوال.',
    ];
    if (payload.bookingId) parts.push(`مرجع الحجز: ${payload.bookingId}`);
    return parts.join('\n');
  }, [payload]);

  const formattedDateAr = useMemo(() => {
    if (!payload) return '';
    const [y, m, d] = payload.date.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dt);
  }, [payload]);

  const googleHref = useMemo(() => {
    if (!payload) return '';
    return buildGoogleCalendarUrl({
      title,
      details,
      dateStr: payload.date,
      timeStr: payload.time,
      durationMinutes: payload.durationMinutes,
    });
  }, [payload, title, details]);

  const handleDownloadIcs = () => {
    if (!payload) return;
    const uid = payload.bookingId
      ? `${payload.bookingId}@halaqmap.local`
      : `booking-${payload.date}-${payload.time}@halaqmap.local`;
    const ics = buildBookingIcs({
      uid,
      title,
      description: details,
      dateStr: payload.date,
      timeStr: payload.time,
      durationMinutes: payload.durationMinutes,
    });
    downloadTextFile(`halaqmap-${payload.date}-${payload.time.replace(':', '')}.ics`, ics, 'text/calendar');
  };

  if (!payload) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md border-primary/20 bg-gradient-to-b from-primary/5 via-background to-accent/5 overflow-hidden gap-0 p-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="relative px-6 pt-8 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 ring-4 ring-emerald-500/10 shadow-inner">
            <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
          </div>
          <DialogHeader className="mt-5 space-y-2 text-center sm:text-center">
            <DialogTitle className="text-xl font-bold text-foreground">تم تسجيل حجزك بنجاح</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <p>
                  طلبك لدى <span className="font-semibold text-foreground">{payload.barberName}</span> مسجّل كـ &quot;قيد
                  المراجعة&quot;. سيُتواصل معك الصالون لتأكيد الموعد.
                </p>
                <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-foreground">
                  <span className="block text-xs text-muted-foreground mb-0.5">الموعد المختار</span>
                  {formattedDateAr} — الساعة {payload.time}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="relative space-y-2 px-6 pb-2">
          <p className="text-xs font-medium text-muted-foreground text-center">أضف الموعد إلى تقويمك</p>
          <div className="grid gap-2">
            <Button variant="default" className="w-full gap-2 h-11" asChild>
              <a href={googleHref} target="_blank" rel="noopener noreferrer">
                <CalendarPlus className="h-4 w-4 shrink-0" />
                فتح Google Calendar
              </a>
            </Button>
            <Button variant="outline" className="w-full gap-2 h-11 border-primary/30 bg-background/80" type="button" onClick={handleDownloadIcs}>
              <Download className="h-4 w-4 shrink-0" />
              تنزيل ملف التقويم (.ics) — Apple وغيرها
            </Button>
          </div>
          <p className="text-[11px] text-center text-muted-foreground leading-snug px-1">
            ملف ‎.ics‎ يعمل مع تقويم آيفون وتطبيقات أخرى بعد التنزيل: افتح الملف من مجلد التنزيلات أو شاركه إلى «تقويم».
          </p>
        </div>
        <DialogFooter className="border-t border-border/50 bg-muted/20 px-6 py-4 sm:justify-center">
          <Button type="button" variant="secondary" className="min-w-[120px]" onClick={() => onOpenChange(false)}>
            تم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
