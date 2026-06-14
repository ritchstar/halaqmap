import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { SaudiBishtIcon } from '@/components/icons/SaudiBishtIcon';
import {
  GROOM_PREP_ARRIVAL_WINDOWS,
  GROOM_PREP_CONTACT_DISCLAIMER_AR,
  GROOM_PREP_PACKAGES,
  GROOM_PREP_VENUE_TYPES,
  type GroomPrepContactFormValues,
} from '@/lib/groomPrepContactTemplate';

type Props = {
  barberName: string;
  onSubmit: (values: GroomPrepContactFormValues) => void | Promise<void>;
  disabled?: boolean;
};

export function GroomPrepContactRequestForm({ barberName, onSubmit, disabled }: Props) {
  const [eventDate, setEventDate] = useState('');
  const [district, setDistrict] = useState('');
  const [venueType, setVenueType] = useState<string>(GROOM_PREP_VENUE_TYPES[0].id);
  const [servicePackage, setServicePackage] = useState<string>(GROOM_PREP_PACKAGES[0]);
  const [headCount, setHeadCount] = useState('');
  const [arrivalTime, setArrivalTime] = useState('flexible');
  const [note, setNote] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!eventDate.trim()) {
      toast.error('أدخل تاريخ المناسبة.');
      return;
    }
    if (!district.trim()) {
      toast.error('أدخل الحي أو المدينة (بدون عنوان دقيق).');
      return;
    }
    if (!accepted) {
      toast.error('يُرجى الموافقة على إخلاء المسؤولية قبل الإرسال.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        eventDate: eventDate.trim(),
        district: district.trim(),
        venueType,
        servicePackage,
        headCount: headCount.trim(),
        arrivalTime,
        note: note.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] to-card p-4 space-y-4">
      <div className="flex items-start gap-2">
        <SaudiBishtIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" title="تجهيز عريس" />
        <div>
          <p className="text-sm font-semibold">طلب تواصل — تجهيز عريس</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            يُرسل طلبك كرسالة خاصة إلى {barberName} — ليس حجزاً. التنسيق والتنفيذ مباشرة بينكما.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="groom-event-date">تاريخ المناسبة</Label>
          <Input
            id="groom-event-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="groom-district">الحي / المدينة</Label>
          <Input
            id="groom-district"
            placeholder="مثال: حي الياسمين — بدون عنوان دقيق"
            value={district}
            maxLength={120}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>مكان التجهيز</Label>
          <Select value={venueType} onValueChange={setVenueType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROOM_PREP_VENUE_TYPES.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>باقة الخدمة</Label>
          <Select value={servicePackage} onValueChange={setServicePackage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROOM_PREP_PACKAGES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="groom-head-count">عدد الأشخاص (اختياري)</Label>
          <Input
            id="groom-head-count"
            inputMode="numeric"
            placeholder="مثال: 3"
            value={headCount}
            maxLength={8}
            onChange={(e) => setHeadCount(e.target.value.replace(/[^\d]/g, ''))}
            dir="ltr"
            className="text-left"
          />
        </div>
        <div className="space-y-2">
          <Label>وقت الوصول</Label>
          <Select value={arrivalTime} onValueChange={setArrivalTime}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GROOM_PREP_ARRIVAL_WINDOWS.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="groom-note">ملاحظة (اختياري)</Label>
        <Textarea
          id="groom-note"
          rows={2}
          maxLength={400}
          placeholder="مثال: تفضيلات بسيطة، تنسيق مع العوال…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3">
        <Checkbox
          id="groom-disclaimer"
          checked={accepted}
          onCheckedChange={(c) => setAccepted(c === true)}
        />
        <Label htmlFor="groom-disclaimer" className="text-xs leading-relaxed cursor-pointer font-normal">
          {GROOM_PREP_CONTACT_DISCLAIMER_AR}
        </Label>
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={disabled || submitting}
        onClick={() => void handleSubmit()}
      >
        {submitting ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري الإرسال…
          </>
        ) : (
          'إرسال طلب التواصل عبر الشات'
        )}
      </Button>
    </div>
  );
}
