/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ImagePlus, Loader2, MapPin, MapPinned } from 'lucide-react';
import {
  COVERAGE_NOMINATE_FORM_HINT_AR,
  COVERAGE_NOMINATE_LEAD_AR,
  COVERAGE_NOMINATE_LOCATION_DENIED_AR,
  COVERAGE_NOMINATE_NEED_INSIDE_AR,
  COVERAGE_NOMINATE_Q_INSIDE_AR,
  COVERAGE_NOMINATE_Q_LOCATION_AR,
  COVERAGE_NOMINATE_THANKS_AR,
  COVERAGE_NOMINATE_TITLE_AR,
} from '@/config/coverageSalonNominateCopy';
import { submitCoverageSalonNomination } from '@/lib/coverageSalonNominateRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

type Step = 'inside' | 'need_inside' | 'location' | 'form' | 'thanks';

const MAX_PHOTO_BYTES = 2.5 * 1024 * 1024;

export default function CoverageSalonNominatePage() {
  useDocumentTitle(COVERAGE_NOMINATE_TITLE_AR);

  const [step, setStep] = useState<Step>('inside');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [salonName, setSalonName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const requestLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError(COVERAGE_NOMINATE_LOCATION_DENIED_AR);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        setStep('form');
      },
      () => {
        setLocating(false);
        setLocationError(COVERAGE_NOMINATE_LOCATION_DENIED_AR);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  const onPhotoChange = (file: File | null) => {
    setSubmitError(null);
    if (!file) {
      setPhoto(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setSubmitError('الصورة يجب أن تكون بصيغة صورة.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setSubmitError('حجم الصورة كبير — اختر صورة أصغر من ٢.٥ ميجابايت.');
      return;
    }
    setPhoto(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitCoverageSalonNomination({
      salonName,
      contactPhone,
      latitude: coords.lat,
      longitude: coords.lng,
      photo,
    });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(
        result.error === 'invalid_salon_name'
          ? 'أدخل اسم الصالون بوضوح.'
          : result.error === 'invalid_contact_phone'
            ? 'أدخل رقم تواصل صالحاً.'
            : result.error === 'invalid_photo_type' || result.error === 'invalid_photo_size'
              ? 'تعذّر قبول الصورة — جرّب صورة أخرى أصغر.'
              : 'تعذّر إرسال الترشيح. حاول مرة أخرى.',
      );
      return;
    }
    setStep('thanks');
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #020912 0%, #041018 45%, #020912 100%)',
        fontFamily: 'Tajawal, system-ui',
      }}
    >
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#020912]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link
            to={ROUTE_PATHS.HOME}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
            العودة
          </Link>
          <span className="text-xs font-bold text-cyan-200/90">ترشيح تغطية</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[0.7rem] font-bold text-cyan-100">
            <MapPinned className="h-3.5 w-3.5" />
            مساعدة التغطية
          </div>
          <h1 className="mb-3 text-2xl font-black text-white sm:text-3xl">{COVERAGE_NOMINATE_TITLE_AR}</h1>
          <p className="mb-4 text-sm leading-7 text-slate-400">{COVERAGE_NOMINATE_LEAD_AR}</p>
          <Link
            to={ROUTE_PATHS.MAP_CONTACT_CARD}
            className="mb-8 inline-flex text-sm font-bold text-teal-300 hover:text-teal-200"
          >
            أو صمّم بطاقة تواصل ماب وأرسلها لصالونك ←
          </Link>
        </motion.div>

        {step === 'inside' ? (
          <section className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] p-5">
            <p className="mb-4 text-base font-bold text-cyan-50">{COVERAGE_NOMINATE_Q_INSIDE_AR}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep('location')}
                className="flex-1 rounded-xl bg-gradient-to-l from-cyan-500 to-teal-500 px-4 py-3 text-sm font-bold text-white"
              >
                نعم
              </button>
              <button
                type="button"
                onClick={() => setStep('need_inside')}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
              >
                لا
              </button>
            </div>
          </section>
        ) : null}

        {step === 'need_inside' ? (
          <section className="rounded-2xl border border-amber-400/25 bg-amber-500/[0.07] p-5 text-sm leading-7 text-amber-50/95">
            {COVERAGE_NOMINATE_NEED_INSIDE_AR}
            <button
              type="button"
              onClick={() => setStep('inside')}
              className="mt-4 block text-xs font-bold text-cyan-200 underline"
            >
              العودة للسؤال
            </button>
          </section>
        ) : null}

        {step === 'location' ? (
          <section className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] p-5">
            <p className="mb-4 text-base font-bold text-cyan-50">{COVERAGE_NOMINATE_Q_LOCATION_AR}</p>
            <button
              type="button"
              disabled={locating}
              onClick={requestLocation}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-500 to-teal-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              مشاركة موقعي الآن
            </button>
            {locationError ? (
              <p className="mt-3 text-xs leading-6 text-rose-300">{locationError}</p>
            ) : null}
          </section>
        ) : null}

        {step === 'form' && coords ? (
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs leading-6 text-slate-400">{COVERAGE_NOMINATE_FORM_HINT_AR}</p>
            <p className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-emerald-300/90">
              <MapPin className="h-3.5 w-3.5" />
              تم تثبيت الموقع
            </p>

            <label className="block text-right">
              <span className="mb-1.5 block text-xs font-bold text-slate-300">اسم الصالون</span>
              <input
                required
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                maxLength={120}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                placeholder="مثال: صالون الأناقة"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1.5 block text-xs font-bold text-slate-300">رقم تواصل</span>
              <input
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                maxLength={32}
                inputMode="tel"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                placeholder="05xxxxxxxx"
              />
            </label>

            <label className="block text-right">
              <span className="mb-1.5 block text-xs font-bold text-slate-300">صورة واحدة اختيارية</span>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-dashed border-cyan-400/25 bg-cyan-500/[0.04] px-3 py-3',
                )}
              >
                <ImagePlus className="h-5 w-5 shrink-0 text-cyan-300/80" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full text-xs text-slate-300 file:me-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-cyan-100"
                  onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                />
              </div>
              {photo ? (
                <p className="mt-1 text-[0.65rem] text-slate-500">{photo.name}</p>
              ) : null}
            </label>

            {/* honeypot */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden
              onChange={() => undefined}
            />

            {submitError ? <p className="text-xs text-rose-300">{submitError}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-500 to-teal-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              إرسال الترشيح
            </button>
          </form>
        ) : null}

        {step === 'thanks' ? (
          <section className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.08] p-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-300" />
            <p className="text-sm leading-7 text-emerald-50">{COVERAGE_NOMINATE_THANKS_AR}</p>
            <Link
              to={ROUTE_PATHS.HOME}
              className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white"
            >
              العودة للرئيسية
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  );
}
