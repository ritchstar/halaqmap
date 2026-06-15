import { useState } from 'react';
import { Home, Loader2 } from 'lucide-react';
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
import {
  HOME_SERVICE_CONTACT_DISCLAIMER_AR,
  HOME_SERVICE_TIME_WINDOWS,
  HOME_SERVICE_TYPES,
  type HomeServiceContactFormValues,
} from '@/lib/homeServiceContactTemplate';

type Props = {
  barberName: string;
  onSubmit: (values: HomeServiceContactFormValues) => void | Promise<void>;
  disabled?: boolean;
};

export function HomeServiceContactRequestForm({ barberName, onSubmit, disabled }: Props) {
  const [district, setDistrict] = useState('');
  const [timeWindow, setTimeWindow] = useState('flexible');
  const [serviceType, setServiceType] = useState<string>(HOME_SERVICE_TYPES[0]);
  const [note, setNote] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!district.trim()) {
      toast.error('أدخل الحي أو المنطقة (بدون عنوان دقيق).');
      return;
    }
    if (!accepted) {
      toast.error('يُرجى الموافقة على إخلاء المسؤولية قبل الإرسال.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        district: district.trim(),
        timeWindow,
        serviceType,
        note: note.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="barber-contact-inner min-w-0 max-w-full overflow-x-clip rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.04] to-card p-4 space-y-4">
      <div className="flex items-start gap-2">
        <Home className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold break-words">طلب تواصل لخدمة منزلية</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 break-words">
            يُرسل طلبك كرسالة خاصة إلى {barberName} — ليس حجزاً. التنسيق والتنفيذ مباشرة بينكما.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="home-district">الحي / المنطقة</Label>
        <Input
          id="home-district"
          placeholder="مثال: حي النرجس — بدون رقم منزل"
          value={district}
          maxLength={120}
          onChange={(e) => setDistrict(e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>الوقت المفضل</Label>
          <Select value={timeWindow} onValueChange={setTimeWindow}>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOME_SERVICE_TIME_WINDOWS.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>نوع الخدمة</Label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOME_SERVICE_TYPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="home-note">ملاحظة (اختياري)</Label>
        <Textarea
          id="home-note"
          rows={2}
          maxLength={400}
          placeholder="مثال: عدد الأشخاص، تفضيلات بسيطة…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3">
        <Checkbox
          id="home-disclaimer"
          checked={accepted}
          onCheckedChange={(c) => setAccepted(c === true)}
        />
        <Label htmlFor="home-disclaimer" className="min-w-0 text-xs leading-relaxed cursor-pointer font-normal break-words">
          {HOME_SERVICE_CONTACT_DISCLAIMER_AR}
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
