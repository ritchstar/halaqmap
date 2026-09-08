/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رحلة الطلب الموجّه — 4 خطوات مع ربط النكهات.
 */
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import {
  STORE_HALANA_ATMOSPHERE,
  STORE_HALANA_DEFAULT_FLAVORS_AR,
  STORE_HALANA_DEFAULT_POLICY_AR,
  STORE_HALANA_LIVE_COPY,
} from '@/config/storeHalanaLive';
import { STORE_HALANA_ACTIVITY_COPY } from '@/config/storeHalanaActivity';
import { StoreDirectPayGuest } from '@/components/store/StoreDirectPayGuest';
import { DIRECT_PAY_REQUEST_KEY } from '@/lib/storeDirectPay';
import { HALANA_PAY_REQUEST_KEY } from '@/lib/storeHalanaPay';
import { postHalanaAction } from '@/lib/storeHalanaLiveRemote';
import {
  clearHalanaActivityDraft,
  loadHalanaActivityDraft,
  saveHalanaActivityDraft,
} from '@/lib/storeHalanaActivityDraft';
import { cn } from '@/lib/utils';

type GalleryItem = { id: string; caption: string; src: string };

type OrderPayload = {
  shopName: string;
  flavorsAr: string;
  policyAr: string;
  readyLines: string;
  gallery: GalleryItem[];
  acceptingOrders?: boolean;
};

type StepId = 'intent' | 'customize' | 'schedule' | 'review';

const STEPS: StepId[] = ['intent', 'customize', 'schedule', 'review'];

function splitLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function HalanaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="halana-field-shell block">
      {label}
      {children}
    </label>
  );
}

function StepProgress({ step }: { step: StepId }) {
  const activity = STORE_HALANA_ACTIVITY_COPY;
  const index = STEPS.indexOf(step);
  return (
    <ol className="halana-activity-steps" aria-label="خطوات الطلب">
      {STEPS.map((id, i) => (
        <li key={id} className={cn('halana-activity-steps__item', i <= index && 'halana-activity-steps__item--done')}>
          <span className="halana-activity-steps__dot" aria-hidden />
          <span className="halana-activity-steps__label">{activity.orderSteps[id]}</span>
        </li>
      ))}
    </ol>
  );
}

export function HalanaActivityOrderFlow({
  token,
  payload,
  busy,
  setBusy,
}: {
  token: string;
  payload: OrderPayload;
  busy: boolean;
  setBusy: (v: boolean) => void;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const activity = STORE_HALANA_ACTIVITY_COPY;
  const flavors = useMemo(
    () => splitLines(payload.flavorsAr || STORE_HALANA_DEFAULT_FLAVORS_AR),
    [payload.flavorsAr],
  );

  const [step, setStep] = useState<StepId>('intent');
  const [intent, setIntent] = useState<'work' | 'inspired' | 'fresh'>('fresh');
  const [deliverAt, setDeliverAt] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sweetType, setSweetType] = useState('');
  const [fillings, setFillings] = useState('');
  const [refNote, setRefNote] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestWhatsapp, setGuestWhatsapp] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [refSrc, setRefSrc] = useState('');
  const [payTick, setPayTick] = useState(0);

  useEffect(() => {
    const draft = loadHalanaActivityDraft(token);
    if (draft.refWorkId || draft.refWorkSrc) {
      setIntent(draft.refWorkId ? 'inspired' : 'work');
      setRefSrc(draft.refWorkSrc);
      if (draft.sweetType) setSweetType(draft.sweetType);
      if (draft.refWorkCaption && !draft.sweetType) setSweetType(draft.refWorkCaption);
      if (draft.fillings) setFillings(draft.fillings);
      if (draft.selectedFlavors.length) setSelectedFlavors(draft.selectedFlavors);
      if (draft.refWorkId) setStep('customize');
    }
  }, [token]);

  function toggleFlavor(line: string) {
    setSelectedFlavors((current) => {
      const next = current.includes(line) ? current.filter((item) => item !== line) : [...current, line];
      saveHalanaActivityDraft(token, { selectedFlavors: next, fillings: next.join('، ') });
      setFillings(next.join('، '));
      return next;
    });
  }

  function persistDraft() {
    saveHalanaActivityDraft(token, {
      sweetType,
      fillings,
      selectedFlavors,
      refWorkSrc: refSrc,
    });
  }

  async function onSubmit() {
    if (busy) return;
    setBusy(true);
    const mergedFillings = selectedFlavors.length > 0 ? selectedFlavors.join('، ') : fillings;
    const res = await postHalanaAction({
      action: 'add_request',
      token,
      deliverAt,
      quantity,
      sweetType,
      fillings: mergedFillings,
      refNote: refSrc ? `${refNote}\n[مرجع بصري]`.trim() : refNote,
      guestName,
      guestWhatsapp,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (res.requestId) {
      sessionStorage.setItem(`${HALANA_PAY_REQUEST_KEY}:${token}`, res.requestId);
      sessionStorage.setItem(`${DIRECT_PAY_REQUEST_KEY}:store_halana_live:${token}`, res.requestId);
      setPayTick((n) => n + 1);
    }
    clearHalanaActivityDraft(token);
    toast.success(copy.sentAr);
    setStep('intent');
    setDeliverAt('');
    setQuantity('');
    setSweetType('');
    setFillings('');
    setRefNote('');
    setGuestName('');
    setGuestWhatsapp('');
    setSelectedFlavors([]);
    setRefSrc('');
  }

  const heroSrc = refSrc || payload.gallery[0]?.src || STORE_HALANA_ATMOSPHERE.cake;
  const showcaseHref = `/h/${encodeURIComponent(token)}`;

  if (payload.acceptingOrders === false) {
    return (
      <div className="halana-activity-order halana-shell mx-auto max-w-3xl space-y-6 px-4 py-16 pb-24 text-center">
        <p className="halana-activity-status halana-activity-status--paused mx-auto">{activity.statusPausedAr}</p>
        <p className="mt-4 text-base leading-8 text-[#ffe8c4]/85">عُدّي إلى المعرض للاطلاع على الأعمال.</p>
        <Link to={showcaseHref} className="halana-activity-secondary mt-6 inline-flex min-h-[2.75rem] items-center rounded-full px-6 text-sm font-bold">
          {copy.orderBackAr}
        </Link>
      </div>
    );
  }

  return (
    <div className="halana-activity-order halana-shell mx-auto max-w-3xl space-y-6 px-4 py-8 pb-24">
      <Link to={`/h/${encodeURIComponent(token)}`} className="text-sm font-bold text-[#ffe8c4] underline">
        {copy.orderBackAr}
      </Link>

      <StepProgress step={step} />

      <div className="halana-activity-surface overflow-hidden rounded-2xl">
        <img src={heroSrc} alt="" className="aspect-[16/9] w-full object-cover object-center" />
      </div>

      {step === 'intent' ? (
        <section className="halana-form-card space-y-4 rounded-2xl p-5">
          <h1 className="halana-title-sm">{activity.orderIntentTitleAr}</h1>
          <div className="grid gap-2">
            {(
              [
                { id: 'work' as const, label: activity.orderFromWorkAr },
                { id: 'inspired' as const, label: activity.orderInspiredChoiceAr },
                { id: 'fresh' as const, label: activity.orderFreshAr },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIntent(item.id)}
                className={cn(
                  'min-h-[2.75rem] rounded-2xl border px-4 py-3 text-right text-sm font-bold',
                  intent === item.id ? 'border-[#f3c48a] bg-[#f3c48a]/12' : 'border-white/15',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep('customize')} className="halana-activity-primary w-full rounded-full py-3 text-sm font-extrabold">
            {activity.orderNextAr}
          </button>
        </section>
      ) : null}

      {step === 'customize' ? (
        <section className="halana-form-card space-y-4 rounded-2xl p-5">
          <h2 className="halana-title-sm">{activity.orderFlavorsTitleAr}</h2>
          <p className="text-sm leading-7 text-white/70">{activity.orderFlavorsLeadAr}</p>
          {flavors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {flavors.map((line) => (
                <button
                  key={line}
                  type="button"
                  onClick={() => toggleFlavor(line)}
                  className={cn('halana-flavor-chip transition', selectedFlavors.includes(line) && 'ring-2 ring-[#f3c48a]')}
                >
                  {line}
                </button>
              ))}
            </div>
          ) : null}
          <HalanaField label={copy.sweetTypeAr}>
            <input className="halana-field" value={sweetType} onChange={(e) => setSweetType(e.target.value)} onBlur={persistDraft} />
          </HalanaField>
          <HalanaField label={copy.quantityAr}>
            <input className="halana-field" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </HalanaField>
          <HalanaField label={copy.fillingsAr}>
            <input className="halana-field" value={fillings} onChange={(e) => setFillings(e.target.value)} onBlur={persistDraft} />
          </HalanaField>
          <HalanaField label={copy.refNoteAr}>
            <textarea className="halana-field min-h-24" value={refNote} onChange={(e) => setRefNote(e.target.value)} />
          </HalanaField>
          <p className="text-xs leading-6 text-white/50">{copy.refWarnAr}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('intent')} className="halana-activity-secondary flex-1 rounded-full py-3 text-sm font-bold">
              {activity.orderBackAr}
            </button>
            <button type="button" onClick={() => setStep('schedule')} className="halana-activity-primary flex-1 rounded-full py-3 text-sm font-extrabold">
              {activity.orderNextAr}
            </button>
          </div>
        </section>
      ) : null}

      {step === 'schedule' ? (
        <section className="halana-form-card space-y-4 rounded-2xl p-5">
          <HalanaField label={copy.deliverAtAr}>
            <input className="halana-field" value={deliverAt} onChange={(e) => setDeliverAt(e.target.value)} />
          </HalanaField>
          <p className="text-sm leading-7 text-amber-100/85">{activity.orderDateWarnAr}</p>
          <HalanaField label={copy.guestNameAr}>
            <input className="halana-field" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          </HalanaField>
          <HalanaField label={copy.guestWhatsappAr}>
            <input className="halana-field" dir="ltr" value={guestWhatsapp} onChange={(e) => setGuestWhatsapp(e.target.value)} />
          </HalanaField>
          <p className="text-xs leading-6 text-white/50">{copy.changeWarnAr}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('customize')} className="halana-activity-secondary flex-1 rounded-full py-3 text-sm font-bold">
              {activity.orderBackAr}
            </button>
            <button type="button" onClick={() => setStep('review')} className="halana-activity-primary flex-1 rounded-full py-3 text-sm font-extrabold">
              {activity.orderNextAr}
            </button>
          </div>
        </section>
      ) : null}

      {step === 'review' ? (
        <section className="halana-form-card space-y-4 rounded-2xl p-5">
          <h2 className="halana-title-sm">{activity.orderReviewTitleAr}</h2>
          <dl className="halana-activity-surface space-y-2 rounded-2xl p-4 text-sm leading-8">
            <div>
              <dt className="text-white/55">{copy.sweetTypeAr}</dt>
              <dd className="font-bold">{sweetType || '—'}</dd>
            </div>
            <div>
              <dt className="text-white/55">{copy.quantityAr}</dt>
              <dd className="font-bold">{quantity || '—'}</dd>
            </div>
            <div>
              <dt className="text-white/55">{copy.fillingsAr}</dt>
              <dd className="font-bold">{fillings || selectedFlavors.join('، ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-white/55">{copy.deliverAtAr}</dt>
              <dd className="font-bold">{deliverAt || '—'}</dd>
            </div>
            <div>
              <dt className="text-white/55">{copy.guestNameAr}</dt>
              <dd className="font-bold">{guestName || '—'}</dd>
            </div>
          </dl>
          <p className="text-sm leading-7 text-[#ffe8c4]/80">{activity.orderReviewWarnAr}</p>
          <p className="text-sm leading-7 text-white/65">{payload.policyAr || STORE_HALANA_DEFAULT_POLICY_AR}</p>
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              void onSubmit();
            }}
            className="space-y-3"
          >
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep('schedule')} className="halana-activity-secondary flex-1 rounded-full py-3 text-sm font-bold">
                {activity.orderBackAr}
              </button>
              <button type="submit" disabled={busy} className="halana-activity-primary flex-1 rounded-full py-3 text-sm font-extrabold disabled:opacity-60">
                {activity.orderSendAr}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <StoreDirectPayGuest key={`${token}-${payTick}`} product="store_halana_live" token={token} accent="#c45c7a" />
    </div>
  );
}
