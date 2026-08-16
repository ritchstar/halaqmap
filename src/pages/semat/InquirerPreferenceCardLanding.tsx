/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Pencil, Scissors, Share2 } from 'lucide-react';
import { SematCardPreview } from '@/components/semat/SematCardPreview';
import {
  cityNameAr,
  INQUIRER_PREFERENCE_CARD_CITIES,
  INQUIRER_PREFERENCE_CARD_META,
  INQUIRER_PREFERENCE_CARD_NAME_AR,
  INQUIRER_PREFERENCE_CARD_PAGE,
} from '@/config/inquirerPreferenceCardCopy';
import {
  SEMAT_BEARD_STYLE_OPTIONS,
  SEMAT_HAIR_PRESET_OPTIONS,
} from '@/config/sematCardFormOptions';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import {
  buildInquirerPreferenceShareUrl,
  buildInquirerPreferenceWhatsappText,
  normalizeInquirerPreferenceCard,
  type InquirerPreferenceCard,
} from '@/lib/inquirerPreferenceCardShare';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { toast } from '@/components/ui/sonner';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type FormState = {
  displayName: string;
  cityId: string;
  hairPreset: string;
  hairDetail: string;
  beardStyle: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  displayName: '',
  cityId: '',
  hairPreset: '',
  hairDetail: '',
  beardStyle: '',
  notes: '',
};

export default function InquirerPreferenceCardLanding() {
  useDocumentTitle(INQUIRER_PREFERENCE_CARD_META.titleAr);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [pledged, setPledged] = useState(false);
  const [card, setCard] = useState<InquirerPreferenceCard | null>(null);
  const [salonName, setSalonName] = useState('');

  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', INQUIRER_PREFERENCE_CARD_META.descriptionAr);
  }, []);

  useEffect(() => {
    const salon = readHashQueryParam('salon') || '';
    const named = readHashQueryParam('salonName') || '';
    if (named) {
      setSalonName(named.slice(0, 80));
      return;
    }
    if (!UUID_RE.test(salon)) return;
    let cancelled = false;
    void import('@/lib/publicBarbersFromSupabase')
      .then((m) => m.fetchPublicBarberById(salon))
      .then((barber) => {
        if (!cancelled && barber?.name) setSalonName(String(barber.name).slice(0, 80));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const shareUrl = useMemo(() => (card ? buildInquirerPreferenceShareUrl(card) : null), [card]);
  const cityLabel = card ? cityNameAr(card.cityId) : '';
  const hairLabel = card
    ? SEMAT_HAIR_PRESET_OPTIONS.find((o) => o.value === card.hairPreset)?.label || ''
    : '';
  const beardLabel = card?.beardStyle
    ? SEMAT_BEARD_STYLE_OPTIONS.find((o) => o.value === card.beardStyle)?.label || ''
    : '';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pledged) {
      toast.error('يلزم التأشير على الإقرار قبل إظهار الكرت.');
      return;
    }
    const next = normalizeInquirerPreferenceCard(form);
    if (!next) {
      toast.error('أدخل اللقب والمدينة وطريقة الحلاقة.');
      return;
    }
    setCard(next);
  };

  const onCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(INQUIRER_PREFERENCE_CARD_PAGE.copied);
    } catch {
      toast.error('تعذّر نسخ الرابط.');
    }
  };

  const onWhatsapp = () => {
    if (!card || !shareUrl) return;
    const text = buildInquirerPreferenceWhatsappText({
      card,
      shareUrl,
      cityName: cityLabel,
      hairLabel,
      beardLabel,
      salonName: salonName || undefined,
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(20,184,166,0.12),transparent_50%)]" />

      <header className="relative z-10 border-b border-white/8 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <Link to={ROUTE_PATHS.HOME} className="text-sm text-slate-400 hover:text-teal-200">
            حلاق ماب
          </Link>
          <span className="rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-200">
            {INQUIRER_PREFERENCE_CARD_PAGE.badge}
          </span>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-2xl px-4 py-10">
        {!card ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="mb-3 text-3xl font-black text-white">{INQUIRER_PREFERENCE_CARD_PAGE.title}</h1>
              <p className="text-sm leading-relaxed text-slate-300">{INQUIRER_PREFERENCE_CARD_PAGE.lead}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-5">
              <Field label={INQUIRER_PREFERENCE_CARD_PAGE.nameLabel}>
                <input
                  value={form.displayName}
                  onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder={INQUIRER_PREFERENCE_CARD_PAGE.namePlaceholder}
                  maxLength={40}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-white placeholder:text-slate-500"
                />
              </Field>

              <Field label={INQUIRER_PREFERENCE_CARD_PAGE.cityLabel}>
                <select
                  value={form.cityId}
                  onChange={(e) => setForm((p) => ({ ...p, cityId: e.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-white"
                >
                  <option value="">اختر المدينة</option>
                  {INQUIRER_PREFERENCE_CARD_CITIES.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.nameAr}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={INQUIRER_PREFERENCE_CARD_PAGE.hairLabel}>
                <select
                  value={form.hairPreset}
                  onChange={(e) => setForm((p) => ({ ...p, hairPreset: e.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-white"
                >
                  <option value="">اختر الأسلوب</option>
                  {SEMAT_HAIR_PRESET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  value={form.hairDetail}
                  onChange={(e) => setForm((p) => ({ ...p, hairDetail: e.target.value }))}
                  placeholder={INQUIRER_PREFERENCE_CARD_PAGE.hairDetailPlaceholder}
                  maxLength={200}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-white placeholder:text-slate-500"
                />
              </Field>

              <Field label={INQUIRER_PREFERENCE_CARD_PAGE.beardLabel}>
                <select
                  value={form.beardStyle}
                  onChange={(e) => setForm((p) => ({ ...p, beardStyle: e.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-white"
                >
                  <option value="">{INQUIRER_PREFERENCE_CARD_PAGE.beardNone}</option>
                  {SEMAT_BEARD_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={INQUIRER_PREFERENCE_CARD_PAGE.notesLabel}>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder={INQUIRER_PREFERENCE_CARD_PAGE.notesPlaceholder}
                  maxLength={200}
                  rows={3}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-white placeholder:text-slate-500"
                />
              </Field>

              <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
                <input
                  type="checkbox"
                  checked={pledged}
                  onChange={(e) => setPledged(e.target.checked)}
                  className="mt-1"
                />
                <span>{INQUIRER_PREFERENCE_CARD_PAGE.pledge}</span>
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-base font-bold text-black hover:bg-teal-400"
              >
                <Scissors className="h-4 w-4" aria-hidden />
                {INQUIRER_PREFERENCE_CARD_PAGE.submit}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="mb-2 text-xs font-bold text-teal-300">{INQUIRER_PREFERENCE_CARD_PAGE.previewKicker}</p>
              <h1 className="text-2xl font-black text-white">{INQUIRER_PREFERENCE_CARD_NAME_AR}</h1>
              {salonName ? <p className="mt-2 text-sm text-slate-400">للصالون: {salonName}</p> : null}
            </div>

            <SematCardPreview
              displayName={card.displayName}
              hairPreset={card.hairPreset}
              hairDetail={card.hairDetail}
              beardStyle={card.beardStyle}
              notes={card.notes}
              publicId="p"
              cityLabel={cityLabel}
              productNameAr={INQUIRER_PREFERENCE_CARD_NAME_AR}
              shareUrl={shareUrl || undefined}
              locked={false}
            />

            <p className="text-center text-xs text-slate-500">{INQUIRER_PREFERENCE_CARD_PAGE.scanHint}</p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={onWhatsapp}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-base font-bold text-black hover:bg-teal-400"
              >
                <Share2 className="h-4 w-4" aria-hidden />
                {INQUIRER_PREFERENCE_CARD_PAGE.shareWhatsapp}
              </button>
              <button
                type="button"
                onClick={() => void onCopy()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-3 text-sm font-semibold text-slate-100 hover:bg-white/5"
              >
                <Copy className="h-4 w-4" aria-hidden />
                {INQUIRER_PREFERENCE_CARD_PAGE.copyLink}
              </button>
              <button
                type="button"
                onClick={() => setCard(null)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-slate-400 hover:text-white"
              >
                <Pencil className="h-4 w-4" aria-hidden />
                {INQUIRER_PREFERENCE_CARD_PAGE.edit}
              </button>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-relaxed text-slate-500">
          {INQUIRER_PREFERENCE_CARD_PAGE.legalNote}
        </p>
        <p className="mt-3 text-center">
          <Link to={ROUTE_PATHS.SEMAT_LEGAL} className="text-xs text-teal-300/80 hover:underline">
            سياسات بطاقة سمات
          </Link>
        </p>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <Check className="h-3.5 w-3.5 text-teal-300" aria-hidden />
        {label}
      </span>
      {children}
    </label>
  );
}
