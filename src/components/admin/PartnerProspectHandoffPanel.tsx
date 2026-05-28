import { useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  PARTNER_PROSPECT_UNKNOWN_LABEL,
  type CommandLeadChannel,
  type PartnerProspectTierFit,
} from '@/lib/adminCommandCenter';
import { parsePartnerProspectFromAssistantText } from '@/lib/partnerProspectParse';
import { createPartnerProspect } from '@/lib/partnerProspectsRemote';

type Props = {
  permitted: boolean;
  canManage: boolean;
  lastAssistantText?: string;
  onOpenCommandCenter?: () => void;
  onHandoffSuccess?: () => void;
};

const EMPTY_FORM = {
  name: '',
  city: '',
  region: '',
  address: '',
  phone: '',
  email: '',
  instagram: '',
  website: '',
  tierFit: 'gold' as PartnerProspectTierFit,
  channel: 'whatsapp' as CommandLeadChannel,
  suggestedPitch: '',
};

export function PartnerProspectHandoffPanel({
  permitted,
  canManage,
  lastAssistantText = '',
  onOpenCommandCenter,
  onHandoffSuccess,
}: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const canSubmit = permitted && canManage;

  const patchField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const extractFromAssistant = () => {
    const text = lastAssistantText.trim();
    if (!text) {
      toast({ title: 'لا يوجد رد للاستخراج منه', variant: 'destructive' });
      return;
    }
    const parsed = parsePartnerProspectFromAssistantText(text);
    setForm((prev) => ({
      ...prev,
      name: parsed.name ?? prev.name,
      city: parsed.city ?? prev.city,
      region: parsed.region ?? prev.region,
      address: parsed.address ?? prev.address,
      phone: parsed.phone ?? prev.phone,
      email: parsed.email ?? prev.email,
      instagram: parsed.instagram ?? prev.instagram,
      website: parsed.website ?? prev.website,
      tierFit: parsed.tierFit ?? prev.tierFit,
      channel: parsed.channel ?? prev.channel,
      suggestedPitch: parsed.suggestedPitch ?? prev.suggestedPitch,
    }));
    toast({ title: 'تم استخراج الحقول من آخر رد', description: 'راجع البيانات قبل الإحالة.' });
  };

  const submit = async () => {
    if (!canSubmit) return;
    const phone = form.phone.trim();
    if (!phone) {
      toast({ title: 'رقم الواتساب مطلوب للمراسلة', variant: 'destructive' });
      return;
    }

    setBusy(true);
    const result = await createPartnerProspect({
      name: form.name.trim() || `محل — ${phone.slice(-4)}`,
      city: form.city.trim() || PARTNER_PROSPECT_UNKNOWN_LABEL,
      region: form.region.trim() || PARTNER_PROSPECT_UNKNOWN_LABEL,
      address: form.address.trim() || undefined,
      phone,
      email: form.email.trim() || undefined,
      instagram: form.instagram.trim() || undefined,
      website: form.website.trim() || undefined,
      tierFit: form.tierFit,
      channel: form.channel,
      suggestedPitch: form.suggestedPitch.trim() || undefined,
      source: 'b2b_strategist',
      sourceMeta: { handoffFrom: 'marketing_b2b_lab' },
    });
    setBusy(false);

    if (result.ok === false) {
      toast({ title: 'تعذّرت الإحالة', description: result.error, variant: 'destructive' });
      return;
    }

    toast({
      title: 'تمت الإحالة إلى غرفة القيادة',
      description: `${result.prospect.name} — ${result.prospect.city}`,
    });
    setForm(EMPTY_FORM);
    onHandoffSuccess?.();
  };

  const helper = useMemo(
    () =>
      'للمراسلة عبر واتساب يكفي رقم الجوال. الاسم والمدينة اختياريان — يُستخرجان من الصور في غرفة القيادة أو من رد استراتيجي B2B.',
    [],
  );

  return (
    <div className="rounded-lg border border-sky-500/25 bg-sky-500/5 p-3 space-y-3" dir="rtl">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-relaxed text-sky-100/80">{helper}</p>
        <Sparkles className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-[11px]">اسم المحل</Label>
          <Input value={form.name} onChange={(e) => patchField('name', e.target.value)} disabled={!canSubmit || busy} />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">المدينة</Label>
          <Input value={form.city} onChange={(e) => patchField('city', e.target.value)} disabled={!canSubmit || busy} />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">المنطقة</Label>
          <Input value={form.region} onChange={(e) => patchField('region', e.target.value)} disabled={!canSubmit || busy} />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">العنوان</Label>
          <Input value={form.address} onChange={(e) => patchField('address', e.target.value)} disabled={!canSubmit || busy} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[11px]">الجوال / واتساب *</Label>
          <Input value={form.phone} onChange={(e) => patchField('phone', e.target.value)} disabled={!canSubmit || busy} dir="ltr" placeholder="+9665xxxxxxxx" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">انستقرام</Label>
          <Input value={form.instagram} onChange={(e) => patchField('instagram', e.target.value)} disabled={!canSubmit || busy} dir="ltr" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">البريد</Label>
          <Input value={form.email} onChange={(e) => patchField('email', e.target.value)} disabled={!canSubmit || busy} dir="ltr" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">الموقع</Label>
          <Input value={form.website} onChange={(e) => patchField('website', e.target.value)} disabled={!canSubmit || busy} dir="ltr" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">الباقة المقترحة</Label>
          <Select value={form.tierFit} onValueChange={(v) => patchField('tierFit', v as PartnerProspectTierFit)} disabled={!canSubmit || busy}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gold">ذهبي</SelectItem>
              <SelectItem value="diamond">ماسي</SelectItem>
              <SelectItem value="mixed">ذهبي/ماسي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">قناة التواصل</Label>
          <Select value={form.channel} onValueChange={(v) => patchField('channel', v as CommandLeadChannel)} disabled={!canSubmit || busy}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">واتساب</SelectItem>
              <SelectItem value="phone">اتصال</SelectItem>
              <SelectItem value="instagram">انستقرام</SelectItem>
              <SelectItem value="email">بريد</SelectItem>
              <SelectItem value="website">موقع</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px]">رسالة مخاطبة مقترحة (اختياري)</Label>
        <Textarea
          value={form.suggestedPitch}
          onChange={(e) => patchField('suggestedPitch', e.target.value)}
          rows={3}
          className="resize-none text-sm"
          disabled={!canSubmit || busy}
        />
      </div>

      {!canManage ? (
        <p className="text-[11px] text-destructive text-right">يتطلب صلاحية manage_command_center للإحالة.</p>
      ) : null}

      <div className="flex flex-wrap gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={extractFromAssistant} disabled={!canSubmit || busy || !lastAssistantText}>
          استخراج من آخر رد
        </Button>
        <Button type="button" size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={() => void submit()} disabled={!canSubmit || busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إحالة إلى غرفة القيادة'}
        </Button>
        {onOpenCommandCenter ? (
          <Button type="button" variant="ghost" size="sm" onClick={onOpenCommandCenter}>
            <ArrowLeft className="h-4 w-4 ml-1" />
            فتح pipeline
          </Button>
        ) : null}
      </div>
    </div>
  );
}
