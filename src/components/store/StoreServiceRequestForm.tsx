/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { submitStoreServiceRequest } from '@/lib/storeServiceRequestRemote';
import { STORE_LANDING_COPY } from '@/config/storeFront';

const fieldClass =
  'h-12 min-w-0 w-full border-white/15 bg-[#0b1a24] text-[16px] text-[#f4efe4] placeholder:text-white/35';

type FormState = {
  applicantName: string;
  entityName: string;
  freelanceWorkDoc: string;
  email: string;
  phone: string;
  whatsapp: string;
  requestBody: string;
  consent: boolean;
  website: string;
};

const INITIAL: FormState = {
  applicantName: '',
  entityName: '',
  freelanceWorkDoc: '',
  email: '',
  phone: '',
  whatsapp: '',
  requestBody: '',
  consent: false,
  website: '',
};

export function StoreServiceRequestForm({ source = 'store-landing' }: { source?: string }) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.applicantName.trim().length < 2) {
      toast.error('أدخل اسم صاحب الطلب.');
      return;
    }
    if (!form.email.trim()) {
      toast.error('أدخل البريد.');
      return;
    }
    if (form.phone.trim().length < 8 || form.whatsapp.trim().length < 8) {
      toast.error('أدخل رقم التواصل ورقم واتساب.');
      return;
    }
    if (form.requestBody.trim().length < 12) {
      toast.error('اشرح الطلب في مربع الكتابة.');
      return;
    }
    if (!form.consent) {
      toast.error('الموافقة على الدراسة والرد مطلوبة.');
      return;
    }

    setLoading(true);
    const result = await submitStoreServiceRequest({
      applicantName: form.applicantName,
      entityName: form.entityName,
      freelanceWorkDoc: form.freelanceWorkDoc,
      email: form.email,
      phone: form.phone,
      whatsapp: form.whatsapp,
      requestBody: form.requestBody,
      consentStudyReply: true,
      website: form.website,
      source,
    });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    ProductEvents.storeRequestSubmit();
    toast.success(STORE_LANDING_COPY.requestSuccess);
    setForm(INITIAL);
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="store-applicant-name" className="text-[#e8c547]">
          اسم صاحب الطلب
        </Label>
        <Input
          id="store-applicant-name"
          value={form.applicantName}
          onChange={(e) => patch('applicantName', e.target.value)}
          autoComplete="name"
          maxLength={80}
          className={`mt-1.5 ${fieldClass}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="store-entity-name" className="text-[#e8c547]">
            اسم المنشأة إن وُجد
          </Label>
          <Input
            id="store-entity-name"
            value={form.entityName}
            onChange={(e) => patch('entityName', e.target.value)}
            maxLength={120}
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="store-freelance-doc" className="text-[#e8c547]">
            رقم وثيقة العمل الحر إن وُجدت
          </Label>
          <Input
            id="store-freelance-doc"
            value={form.freelanceWorkDoc}
            onChange={(e) => patch('freelanceWorkDoc', e.target.value)}
            maxLength={80}
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="store-email" className="text-[#e8c547]">
          البريد
        </Label>
        <Input
          id="store-email"
          type="email"
          value={form.email}
          onChange={(e) => patch('email', e.target.value)}
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          className={`mt-1.5 ${fieldClass}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="store-phone" className="text-[#e8c547]">
            رقم التواصل
          </Label>
          <Input
            id="store-phone"
            value={form.phone}
            onChange={(e) => patch('phone', e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            maxLength={24}
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="store-whatsapp" className="text-[#e8c547]">
            واتساب
          </Label>
          <Input
            id="store-whatsapp"
            value={form.whatsapp}
            onChange={(e) => patch('whatsapp', e.target.value)}
            inputMode="tel"
            maxLength={24}
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="store-request-body" className="text-[#e8c547]">
          شرح الطلب
        </Label>
        <Textarea
          id="store-request-body"
          value={form.requestBody}
          onChange={(e) => patch('requestBody', e.target.value)}
          maxLength={4000}
          rows={6}
          placeholder="اكتب طلبك بشرح مبدئي أو مفصّل ليُدرس ويُرد عليه لاحقاً."
          className="mt-1.5 min-h-[140px] border-white/15 bg-[#0b1a24] text-[16px] text-[#f4efe4] placeholder:text-white/35"
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="store-website">موقع</label>
        <input
          id="store-website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => patch('website', e.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
        <Checkbox
          checked={form.consent}
          onCheckedChange={(v) => patch('consent', v === true)}
          className="mt-0.5 border-white/30 data-[state=checked]:bg-[#e8c547] data-[state=checked]:text-[#061018]"
        />
        <span>{STORE_LANDING_COPY.consentLabel}</span>
      </label>

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-[#e8c547] font-extrabold text-[#061018] hover:bg-[#f0d46a]"
      >
        {loading ? 'جارٍ الإرسال…' : 'إرسال الطلب للدراسة'}
      </Button>
    </form>
  );
}
