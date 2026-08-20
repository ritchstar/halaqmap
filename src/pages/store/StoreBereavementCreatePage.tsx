/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  EMPTY_BEREAVEMENT_DRAFT,
  STORE_BEREAVEMENT_BURIAL,
  STORE_BEREAVEMENT_CITIES,
  STORE_BEREAVEMENT_COPY,
  STORE_BEREAVEMENT_GENDER,
  STORE_BEREAVEMENT_PRAYERS,
  type BereavementDraft,
} from '@/config/storeBereavementCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { hasValidStoreIssuedConsent } from '@/lib/storeIssuedCardsConsent';
import { publishBereavementNotice, sendBereavementOtp } from '@/lib/storeIssuedCardsRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-12 min-w-0 w-full border-white/15 bg-[#101418] text-[16px] text-[#e8eee6] placeholder:text-white/35';

export default function StoreBereavementCreatePage() {
  useDocumentTitle(STORE_BEREAVEMENT_COPY.documentTitle);
  const navigate = useNavigate();
  const consented = hasValidStoreIssuedConsent('bereavement');
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<BereavementDraft>(EMPTY_BEREAVEMENT_DRAFT);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const patch = <K extends keyof BereavementDraft>(key: K, value: BereavementDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const step1Ready = draft.fullName.trim().length >= 3 && draft.city.trim().length >= 2;
  const step2Ready = draft.prayerAt.trim().length >= 2 && draft.mosqueName.trim().length >= 2 && draft.cemeteryName.trim().length >= 2;

  if (!consented) {
    return <Navigate to={`${ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL}?track=bereavement`} replace />;
  }

  const sendCode = async () => {
    setBusy(true);
    const result = await sendBereavementOtp(draft.phone);
    setBusy(false);
    if (!result.ok) {
      toast.error(typeof result.error === 'string' ? result.error : 'تعذر إرسال الرمز');
      return;
    }
    setOtpSent(true);
    toast.success('أُرسل رمز التحقق إلى الجوال الموثّق.');
  };

  const publish = async () => {
    if (!otpSent || otp.trim().length < 4) {
      toast.error('أدخل رمز التحقق بعد إرساله إلى جوالك.');
      return;
    }
    setBusy(true);
    const result = await publishBereavementNotice({ ...draft, otp });
    setBusy(false);
    if (!result.ok) {
      toast.error(typeof result.error === 'string' ? result.error : 'تعذر النشر');
      return;
    }
    const token = String(result.token || '');
    toast.success('نُشر البلاغ. رابط الإدارة يصل إلى جوالك فقط.');
    navigate(`/n/${token}`);
  };

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#0e1412] text-[#e8eee6]">
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to={ROUTE_PATHS.STORE_LANDING} className="text-sm text-white/60">
            خريطة الحل
          </Link>
          <span className="text-xs text-white/45">{STORE_BEREAVEMENT_COPY.kicker}</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm leading-7 text-emerald-100/80">{STORE_BEREAVEMENT_COPY.consolationAr}</p>
        <h1 className="mt-4 text-3xl font-extrabold">{STORE_BEREAVEMENT_COPY.titleAr}</h1>
        <p className="mt-3 text-sm leading-7 text-white/70">{STORE_BEREAVEMENT_COPY.leadAr}</p>
        <p className="mt-2 text-xs text-white/45">{STORE_BEREAVEMENT_COPY.locationHintAr}</p>

        <div className="mt-6 flex gap-2 text-xs">
          {[1, 2, 3].map((n) => (
            <span key={n} className={cn('rounded-full px-3 py-1', step === n ? 'bg-white/90 text-[#0e1412]' : 'bg-white/10')}>
              {n === 1 ? STORE_BEREAVEMENT_COPY.step1Ar : n === 2 ? STORE_BEREAVEMENT_COPY.step2Ar : STORE_BEREAVEMENT_COPY.step3Ar}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <div className="mt-8 space-y-4">
            <div className="flex gap-2">
              {STORE_BEREAVEMENT_GENDER.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => patch('gender', item.id)}
                  className={cn('rounded-full px-4 py-2 text-sm', draft.gender === item.id ? 'bg-white text-[#0e1412]' : 'border border-white/20')}
                >
                  {item.labelAr}
                </button>
              ))}
            </div>
            <div>
              <Label>الاسم الكامل كما ترغب الأسرة في ظهوره</Label>
              <Input value={draft.fullName} onChange={(e) => patch('fullName', e.target.value)} className={fieldClass} maxLength={80} />
            </div>
            <div>
              <Label>اسم الشهرة أو الكنية — اختياري</Label>
              <Input value={draft.nickname} onChange={(e) => patch('nickname', e.target.value)} className={fieldClass} maxLength={40} />
            </div>
            <div>
              <Label>تاريخ الوفاة — اختياري</Label>
              <Input value={draft.deathDate} onChange={(e) => patch('deathDate', e.target.value)} className={fieldClass} maxLength={32} />
            </div>
            <div>
              <Label>المدينة</Label>
              <select
                value={draft.city}
                onChange={(e) => patch('city', e.target.value)}
                className={cn(fieldClass, 'rounded-md')}
              >
                <option value="">اختر المدينة</option>
                {STORE_BEREAVEMENT_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" disabled={!step1Ready} onClick={() => setStep(2)} className="w-full bg-white text-[#0e1412]">
              التالي — الصلاة والدفن
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-8 space-y-4">
            <div>
              <Label>تاريخ ووقت الصلاة</Label>
              <Input value={draft.prayerAt} onChange={(e) => patch('prayerAt', e.target.value)} className={fieldClass} maxLength={80} />
            </div>
            <div>
              <Label>اسم المسجد</Label>
              <Input value={draft.mosqueName} onChange={(e) => patch('mosqueName', e.target.value)} className={fieldClass} maxLength={80} />
            </div>
            <div>
              <Label>موقع المسجد — رابط خرائط عام اختياري</Label>
              <Input value={draft.mosqueMapUrl} onChange={(e) => patch('mosqueMapUrl', e.target.value)} className={fieldClass} dir="ltr" />
            </div>
            <div>
              <Label>اسم المقبرة</Label>
              <Input value={draft.cemeteryName} onChange={(e) => patch('cemeteryName', e.target.value)} className={fieldClass} maxLength={80} />
            </div>
            <div>
              <Label>موقع المقبرة — رابط خرائط عام اختياري</Label>
              <Input value={draft.cemeteryMapUrl} onChange={(e) => patch('cemeteryMapUrl', e.target.value)} className={fieldClass} dir="ltr" />
            </div>
            <div className="flex flex-wrap gap-2">
              {STORE_BEREAVEMENT_BURIAL.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => patch('burial', item.id)}
                  className={cn('rounded-full px-3 py-1.5 text-sm', draft.burial === item.id ? 'bg-white text-[#0e1412]' : 'border border-white/20')}
                >
                  {item.labelAr}
                </button>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" checked={draft.condolenceMode === 'phone_only'} onChange={() => patch('condolenceMode', 'phone_only')} />
                {STORE_BEREAVEMENT_COPY.condolencePhoneOnlyAr}
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={draft.condolenceMode === 'cemetery_only'} onChange={() => patch('condolenceMode', 'cemetery_only')} />
                {STORE_BEREAVEMENT_COPY.condolenceCemeteryOnlyAr}
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={draft.condolenceMode === 'none'} onChange={() => patch('condolenceMode', 'none')} />
                {STORE_BEREAVEMENT_COPY.condolenceNoneAr}
              </label>
            </div>
            <div>
              <Label>نص الدعاء</Label>
              <select value={draft.prayerText} onChange={(e) => patch('prayerText', e.target.value)} className={cn(fieldClass, 'rounded-md')}>
                {STORE_BEREAVEMENT_PRAYERS.map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>ملاحظات الأسرة — اختيارية، بلا عنوان منزل</Label>
              <Textarea value={draft.familyNote} onChange={(e) => patch('familyNote', e.target.value)} maxLength={280} className="min-h-24 border-white/15 bg-[#101418] text-[#e8eee6]" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/20">
                السابق
              </Button>
              <Button type="button" disabled={!step2Ready} onClick={() => setStep(3)} className="flex-1 bg-white text-[#0e1412]">
                المراجعة والنشر
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-white/15 bg-[#141c18] p-5 text-sm leading-7">
              <p className="text-lg font-extrabold">{draft.fullName}</p>
              {draft.nickname ? <p className="text-white/60">{draft.nickname}</p> : null}
              <p className="mt-3">الصلاة: {draft.prayerAt}</p>
              <p>المسجد: {draft.mosqueName}</p>
              <p>المقبرة: {draft.cemeteryName}</p>
              <p>المدينة: {draft.city}</p>
              <p className="mt-3 text-white/70">{draft.prayerText}</p>
            </div>
            <p className="text-sm text-amber-100/80">{STORE_BEREAVEMENT_COPY.warningAccuracyAr}</p>
            <div>
              <Label>جوال منشئ البلاغ — للتحقق ورابط الإدارة</Label>
              <Input value={draft.phone} onChange={(e) => patch('phone', e.target.value)} className={fieldClass} dir="ltr" />
            </div>
            <div>
              <Label>اسم من اعتمد البلاغ — لا يظهر للزوار</Label>
              <Input value={draft.attestorName} onChange={(e) => patch('attestorName', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <Label>صفته — لا تظهر للزوار</Label>
              <Input value={draft.attestorRole} onChange={(e) => patch('attestorRole', e.target.value)} className={fieldClass} />
            </div>
            <Button type="button" disabled={busy} onClick={() => void sendCode()} className="w-full border border-white/30 bg-transparent">
              إرسال رمز التحقق
            </Button>
            {otpSent ? (
              <div>
                <Label>رمز التحقق</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} className={fieldClass} dir="ltr" inputMode="numeric" />
              </div>
            ) : null}
            <p className="text-xs text-white/45">{STORE_BEREAVEMENT_COPY.manageOnlyPhoneAr}</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 border-white/20">
                السابق
              </Button>
              <Button type="button" disabled={busy} onClick={() => void publish()} className="flex-1 bg-white text-[#0e1412]">
                نشر البلاغ
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
