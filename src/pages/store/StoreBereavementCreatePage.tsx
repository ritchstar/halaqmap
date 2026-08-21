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
  STORE_BEREAVEMENT_CONDOLENCE,
  STORE_BEREAVEMENT_COPY,
  STORE_BEREAVEMENT_GENDER,
  STORE_BEREAVEMENT_KIN_MAX,
  STORE_BEREAVEMENT_PRAYERS,
  STORE_BEREAVEMENT_PUBLIC_ENABLED,
  STORE_BEREAVEMENT_RELATIONS,
  condolenceLabelsAr,
  type BereavementCondolenceMode,
  type BereavementDraft,
  type BereavementKinRow,
} from '@/config/storeBereavementCopy';
import { ARAB_DIAL_CODES, composeArabMobileDigits } from '@/lib/arabMobileDial';
import { hijriFromIsoDate } from '@/lib/gregorianHijri';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { hasValidStoreIssuedConsent } from '@/lib/storeIssuedCardsConsent';
import { publishBereavementNotice, sendBereavementOtp } from '@/lib/storeIssuedCardsRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-12 min-w-0 w-full border-white/15 bg-[#101418] text-[16px] text-[#e8eee6] placeholder:text-white/35';

const emptyKin = (): BereavementKinRow => ({ name: '', phoneLocal: '', phoneDial: '966', relation: '' });

function PhoneFields({
  dial,
  local,
  onDial,
  onLocal,
  idPrefix,
}: {
  dial: string;
  local: string;
  onDial: (value: string) => void;
  onLocal: (value: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="flex gap-2">
      <select
        id={`${idPrefix}-dial`}
        value={dial}
        onChange={(e) => onDial(e.target.value)}
        className={cn(fieldClass, 'w-[9.5rem] shrink-0 rounded-md')}
        dir="ltr"
      >
        {ARAB_DIAL_CODES.map((item) => (
          <option key={item.iso} value={item.dial}>
            {item.nameAr} +{item.dial}
          </option>
        ))}
      </select>
      <Input
        id={`${idPrefix}-local`}
        value={local}
        onChange={(e) => onLocal(e.target.value)}
        className={fieldClass}
        dir="ltr"
        inputMode="tel"
        placeholder="5xxxxxxxx"
        maxLength={12}
      />
    </div>
  );
}

export default function StoreBereavementCreatePage() {
  useDocumentTitle(STORE_BEREAVEMENT_COPY.documentTitle);
  const navigate = useNavigate();
  const consented = hasValidStoreIssuedConsent('bereavement');
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<BereavementDraft>(EMPTY_BEREAVEMENT_DRAFT);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!STORE_BEREAVEMENT_PUBLIC_ENABLED) {
    return (
      <div dir="rtl" className="min-h-[100svh] bg-[#0e1412] text-[#e8eee6]">
        <header className="border-b border-white/10 px-4 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Link to={ROUTE_PATHS.STORE_LANDING} className="text-sm text-white/60">
              خريطة الحل
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold">{STORE_BEREAVEMENT_COPY.pausedTitleAr}</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">{STORE_BEREAVEMENT_COPY.pausedLeadAr}</p>
          <Link
            to={ROUTE_PATHS.STORE_INVITES}
            className="mt-8 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#0e1412]"
          >
            {STORE_BEREAVEMENT_COPY.pausedCtaAr}
          </Link>
        </main>
      </div>
    );
  }

  const patch = <K extends keyof BereavementDraft>(key: K, value: BereavementDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const publisherPhone = composeArabMobileDigits(draft.phoneDial, draft.phoneLocal);
  const hijri = hijriFromIsoDate(draft.deathDate);
  const step1Ready = draft.fullName.trim().length >= 3 && draft.city.trim().length >= 2;
  const step2Ready = draft.prayerAt.trim().length >= 2 && draft.mosqueName.trim().length >= 2 && draft.cemeteryName.trim().length >= 2;

  const toggleMode = (id: BereavementCondolenceMode) => {
    setDraft((prev) => {
      const has = prev.condolenceModes.includes(id);
      let next = has ? prev.condolenceModes.filter((item) => item !== id) : [...prev.condolenceModes, id];
      if (!next.length) next = [id];
      return { ...prev, condolenceModes: next.slice(0, 3) };
    });
  };

  const patchKin = (index: number, next: Partial<BereavementKinRow>) => {
    setDraft((prev) => ({
      ...prev,
      kin: prev.kin.map((row, i) => (i === index ? { ...row, ...next } : row)),
    }));
  };

  if (!consented) {
    return <Navigate to={`${ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL}?track=bereavement`} replace />;
  }

  const sendCode = async () => {
    if (!publisherPhone) {
      toast.error('اختر الدولة واكتب الرقم المحلي دون صفر البداية.');
      return;
    }
    setBusy(true);
    const result = await sendBereavementOtp(publisherPhone);
    setBusy(false);
    if (!result.ok) {
      toast.error(typeof result.error === 'string' ? result.error : 'تعذر إرسال الرمز');
      return;
    }
    setOtpSent(true);
    toast.success('أُرسل رمز التحقق إلى جوالك.');
  };

  const publish = async () => {
    if (!otpSent || otp.trim().length < 4) {
      toast.error('أدخل رمز التحقق بعد إرساله إلى جوالك.');
      return;
    }
    if (!publisherPhone) {
      toast.error('رقم جوال منشئ البلاغ غير صالح.');
      return;
    }
    const kin = draft.kin
      .map((row) => ({
        name: row.name.trim(),
        relation: row.relation,
        phoneDial: row.phoneDial,
        phone: composeArabMobileDigits(row.phoneDial, row.phoneLocal) || '',
      }))
      .filter((row) => row.name && row.relation && row.phone);
    setBusy(true);
    const result = await publishBereavementNotice({
      ...draft,
      phone: publisherPhone,
      phoneDial: draft.phoneDial,
      deathDateHijri: hijri,
      kin,
      otp,
    });
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
              <Label htmlFor="death-date-g">تاريخ الوفاة الميلادي</Label>
              <Input
                id="death-date-g"
                type="date"
                value={draft.deathDate}
                onChange={(e) => patch('deathDate', e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <Label htmlFor="death-date-h">التاريخ الهجري الموافق</Label>
              <Input id="death-date-h" value={hijri} readOnly className={cn(fieldClass, 'opacity-90')} placeholder="يُعبَّأ تلقائياً بعد اختيار الميلادي" />
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
              <p className="text-xs text-white/55">{STORE_BEREAVEMENT_COPY.condolenceMultiHintAr}</p>
              {STORE_BEREAVEMENT_CONDOLENCE.map((item) => (
                <label key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.condolenceModes.includes(item.id)}
                    onChange={() => toggleMode(item.id)}
                  />
                  {item.labelAr}
                </label>
              ))}
              {draft.condolenceModes.includes('at_home') ? (
                <p className="text-xs leading-6 text-amber-100/80">{STORE_BEREAVEMENT_COPY.condolenceAtHomeHintAr}</p>
              ) : null}
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
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="font-bold">{STORE_BEREAVEMENT_COPY.kinTitleAr}</p>
              <p className="mt-1 text-xs leading-6 text-white/55">{STORE_BEREAVEMENT_COPY.kinLeadAr}</p>
              <div className="mt-4 space-y-4">
                {draft.kin.map((row, index) => (
                  <div key={`kin-${index}`} className="space-y-2 rounded-xl border border-white/10 p-3">
                    <Input
                      value={row.name}
                      onChange={(e) => patchKin(index, { name: e.target.value })}
                      className={fieldClass}
                      placeholder="الاسم"
                      maxLength={80}
                    />
                    <select
                      value={row.relation}
                      onChange={(e) => patchKin(index, { relation: e.target.value as BereavementKinRow['relation'] })}
                      className={cn(fieldClass, 'rounded-md')}
                    >
                      <option value="">الصفة</option>
                      {STORE_BEREAVEMENT_RELATIONS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.labelAr}
                        </option>
                      ))}
                    </select>
                    <PhoneFields
                      idPrefix={`kin-${index}`}
                      dial={row.phoneDial}
                      local={row.phoneLocal}
                      onDial={(value) => patchKin(index, { phoneDial: value })}
                      onLocal={(value) => patchKin(index, { phoneLocal: value })}
                    />
                  </div>
                ))}
              </div>
              {draft.kin.length < STORE_BEREAVEMENT_KIN_MAX ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 border-white/20"
                  onClick={() => patch('kin', [...draft.kin, emptyKin()])}
                >
                  + {STORE_BEREAVEMENT_COPY.kinAddAr}
                </Button>
              ) : null}
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
              {draft.deathDate ? (
                <p className="mt-3">
                  الوفاة: {draft.deathDate}
                  {hijri ? ` · ${hijri}` : ''}
                </p>
              ) : null}
              <p className="mt-3">الصلاة: {draft.prayerAt}</p>
              <p>المسجد: {draft.mosqueName}</p>
              <p>المقبرة: {draft.cemeteryName}</p>
              <p>العزاء: {condolenceLabelsAr(draft.condolenceModes)}</p>
              <p>المدينة: {draft.city}</p>
              <p className="mt-3 text-white/70">{draft.prayerText}</p>
            </div>
            <p className="text-sm text-amber-100/80">{STORE_BEREAVEMENT_COPY.warningAccuracyAr}</p>
            <div>
              <Label>جوال منشئ البلاغ — للتحقق ورابط الإدارة</Label>
              <p className="mb-2 text-xs text-white/50">{STORE_BEREAVEMENT_COPY.phoneDialHintAr}</p>
              <PhoneFields
                idPrefix="publisher"
                dial={draft.phoneDial}
                local={draft.phoneLocal}
                onDial={(value) => patch('phoneDial', value)}
                onLocal={(value) => patch('phoneLocal', value)}
              />
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
