/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة العميلة ولوحة حلانا1. غير معلنة. لا تُستورد إعداداتها من App.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import {
  STORE_HALANA_DEFAULT_FLAVORS_AR,
  STORE_HALANA_DEFAULT_POLICY_AR,
  STORE_HALANA_LIVE_COPY,
  STORE_HALANA_REQUEST_STATUSES,
  type StoreHalanaRequestStatus,
} from '@/config/storeHalanaLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchHalanaPublic, postHalanaAction } from '@/lib/storeHalanaLiveRemote';

type RequestRow = {
  id: string;
  status: string;
  deliver_at: string;
  quantity: string;
  sweet_type: string;
  fillings: string;
  ref_note: string;
  guest_name: string;
  guest_whatsapp: string;
  quote_amount_sar: string;
  quote_note: string;
  locked_date: string;
};

type Payload = {
  shopName: string;
  flavorsAr: string;
  policyAr: string;
  quotesAr: string;
  whatsapp: string;
  galleryUrls: string;
  readyLines: string;
  requests: RequestRow[];
};

const fieldClass =
  'mt-1 w-full rounded-xl border border-white/15 bg-[#1a0c12] px-3 py-2.5 text-sm text-[#f4efe4] outline-none';

function whatsappHref(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? `966${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text.slice(0, 1200))}`;
}

function splitLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function StoreHalanaShopPage() {
  const copy = STORE_HALANA_LIVE_COPY;
  useDocumentTitle(copy.documentTitle);
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const { token = '' } = useParams<{ token: string }>();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetchHalanaPublic(token, desk ? 'desk' : 'shop');
    if (!res.ok || !res.payload || typeof res.payload !== 'object') {
      setError(res.error || 'تعذر فتح النسخة.');
      setPayload(null);
      return;
    }
    setError('');
    setPayload(res.payload as Payload);
  }

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    void load();
  }, [token, desk]);

  if (error && !payload) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#14080c] px-6 text-center text-[#f4efe4]" dir="rtl">
        {error}
      </div>
    );
  }
  if (!payload) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#14080c] text-[#f4efe4]/70" dir="rtl">
        يجري فتح حلانا1…
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-svh bg-[#14080c] text-[#f4efe4]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm font-bold tracking-wide text-[#e8a0b4]">{copy.kickerAr}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{payload.shopName || copy.titleAr}</h1>
        {desk ? <DeskPanel token={token} payload={payload} onSaved={() => void load()} /> : <ShopPanel token={token} payload={payload} busy={busy} setBusy={setBusy} />}
      </div>
    </div>
  );
}

function ShopPanel({
  token,
  payload,
  busy,
  setBusy,
}: {
  token: string;
  payload: Payload;
  busy: boolean;
  setBusy: (v: boolean) => void;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [deliverAt, setDeliverAt] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sweetType, setSweetType] = useState('');
  const [fillings, setFillings] = useState('');
  const [refNote, setRefNote] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestWhatsapp, setGuestWhatsapp] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await postHalanaAction({
      action: 'add_request',
      token,
      deliverAt,
      quantity,
      sweetType,
      fillings,
      refNote,
      guestName,
      guestWhatsapp,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(copy.sentAr);
    setDeliverAt('');
    setQuantity('');
    setSweetType('');
    setFillings('');
    setRefNote('');
    setGuestName('');
    setGuestWhatsapp('');
  }

  const flavors = splitLines(payload.flavorsAr || STORE_HALANA_DEFAULT_FLAVORS_AR);
  const gallery = splitLines(payload.galleryUrls);
  const ready = splitLines(payload.readyLines);
  const quotes = splitLines(payload.quotesAr);

  return (
    <div className="mt-6 space-y-8">
      <p className="text-sm leading-8 text-white/75">{copy.shopLeadAr}</p>
      {gallery.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {gallery.map((src) => (
            <img key={src} src={src} alt="" className="h-40 w-full rounded-2xl object-cover" />
          ))}
        </div>
      ) : null}
      <section>
        <h2 className="text-lg font-extrabold">{copy.flavorsTitleAr}</h2>
        <ul className="mt-2 list-disc pr-5 text-sm leading-7 text-white/75">
          {flavors.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
      {ready.length > 0 ? (
        <section>
          <h2 className="text-lg font-extrabold">{copy.readyTitleAr}</h2>
          <ul className="mt-2 space-y-1 text-sm leading-7 text-white/75">
            {ready.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {quotes.length > 0 ? (
        <section>
          <h2 className="text-lg font-extrabold">{copy.quotesTitleAr}</h2>
          <ul className="mt-2 space-y-2 text-sm leading-7 text-white/70">
            {quotes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <h2 className="text-lg font-extrabold">{copy.policyTitleAr}</h2>
        <p className="mt-2 text-sm leading-8 text-white/75">{payload.policyAr || STORE_HALANA_DEFAULT_POLICY_AR}</p>
      </section>
      <p className="text-sm leading-7 text-amber-100/80">{copy.refWarnAr}</p>
      <p className="text-sm leading-7 text-amber-100/80">{copy.depositWarnAr}</p>
      <p className="text-sm leading-7 text-white/60">{copy.pickupWarnAr}</p>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="text-lg font-extrabold">{copy.formTitleAr}</p>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
        <label className="block text-sm">
          {copy.deliverAtAr}
          <input className={fieldClass} value={deliverAt} onChange={(event) => setDeliverAt(event.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.quantityAr}
          <input className={fieldClass} value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.sweetTypeAr}
          <input className={fieldClass} value={sweetType} onChange={(event) => setSweetType(event.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.fillingsAr}
          <input className={fieldClass} value={fillings} onChange={(event) => setFillings(event.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.refNoteAr}
          <textarea className={`${fieldClass} min-h-24`} value={refNote} onChange={(event) => setRefNote(event.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.guestNameAr}
          <input className={fieldClass} value={guestName} onChange={(event) => setGuestName(event.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.guestWhatsappAr}
          <input className={fieldClass} dir="ltr" value={guestWhatsapp} onChange={(event) => setGuestWhatsapp(event.target.value)} />
        </label>
        <p className="text-xs leading-6 text-white/50">{copy.changeWarnAr}</p>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-[#c45c7a] px-5 py-3 text-sm font-extrabold text-[#14080c] disabled:opacity-60"
        >
          {copy.submitAr}
        </button>
      </form>
    </div>
  );
}

function DeskPanel({ token, payload, onSaved }: { token: string; payload: Payload; onSaved: () => void }) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [shopName, setShopName] = useState(payload.shopName);
  const [flavorsAr, setFlavorsAr] = useState(payload.flavorsAr || STORE_HALANA_DEFAULT_FLAVORS_AR);
  const [policyAr, setPolicyAr] = useState(payload.policyAr || STORE_HALANA_DEFAULT_POLICY_AR);
  const [quotesAr, setQuotesAr] = useState(payload.quotesAr);
  const [whatsapp, setWhatsapp] = useState(payload.whatsapp);
  const [galleryUrls, setGalleryUrls] = useState(payload.galleryUrls);
  const [readyLines, setReadyLines] = useState(payload.readyLines);
  const [busy, setBusy] = useState(false);

  async function saveHost() {
    setBusy(true);
    const res = await postHalanaAction({
      action: 'save_host',
      token,
      shopName,
      flavorsAr,
      policyAr,
      quotesAr,
      whatsapp,
      galleryUrls,
      readyLines,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('حُفظت الصفحة.');
    onSaved();
  }

  async function updateRequest(row: RequestRow, status: StoreHalanaRequestStatus, extra: Record<string, string> = {}) {
    setBusy(true);
    const res = await postHalanaAction({
      action: 'update_request',
      token,
      requestId: row.id,
      status,
      quoteAmountSar: extra.quoteAmountSar ?? row.quote_amount_sar,
      quoteNote: extra.quoteNote ?? row.quote_note,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onSaved();
  }

  return (
    <div className="mt-6 space-y-8">
      <p className="text-sm leading-8 text-white/75">{copy.deskLeadAr}</p>
      <section className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
        <h2 className="text-lg font-extrabold">إعداد الصفحة</h2>
        <label className="block text-sm">
          اسم الصفحة
          <input className={fieldClass} value={shopName} onChange={(event) => setShopName(event.target.value)} />
        </label>
        <label className="block text-sm">
          واتساب التشغيل
          <input className={fieldClass} dir="ltr" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
        </label>
        <label className="block text-sm">
          النكهات، سطراً لكل نكهة
          <textarea className={`${fieldClass} min-h-24`} value={flavorsAr} onChange={(event) => setFlavorsAr(event.target.value)} />
        </label>
        <label className="block text-sm">
          سياسة الطلب المسبق
          <textarea className={`${fieldClass} min-h-24`} value={policyAr} onChange={(event) => setPolicyAr(event.target.value)} />
        </label>
        <label className="block text-sm">
          آراء تظهرها للمتصفحة
          <textarea className={`${fieldClass} min-h-20`} value={quotesAr} onChange={(event) => setQuotesAr(event.target.value)} />
        </label>
        <label className="block text-sm">
          روابط صور المعرض، سطراً لكل رابط
          <textarea className={`${fieldClass} min-h-20`} value={galleryUrls} onChange={(event) => setGalleryUrls(event.target.value)} />
        </label>
        <label className="block text-sm">
          جاهز لتاريخ معيّن، سطراً لكل صنف
          <textarea className={`${fieldClass} min-h-20`} value={readyLines} onChange={(event) => setReadyLines(event.target.value)} />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveHost()}
          className="rounded-full bg-[#c45c7a] px-5 py-2.5 text-sm font-extrabold text-[#14080c] disabled:opacity-60"
        >
          حفظ الصفحة
        </button>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">الطلبات</h2>
        {(payload.requests || []).length === 0 ? (
          <p className="text-sm text-white/55">لا طلبات بعد.</p>
        ) : (
          <ul className="space-y-3">
            {(payload.requests || []).map((row) => (
              <li key={row.id} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7">
                <p className="font-bold">
                  {copy.statusAr[row.status as StoreHalanaRequestStatus] || row.status} · {row.sweet_type} · {row.quantity}
                </p>
                <p>الوصول: {row.deliver_at}</p>
                {row.locked_date ? <p>الموعد المقفول: {row.locked_date}</p> : null}
                <p>الحشوات: {row.fillings}</p>
                {row.ref_note ? <p>المرجع: {row.ref_note}</p> : null}
                <p>
                  {row.guest_name || 'عميلة'} {row.guest_whatsapp}
                </p>
                {row.quote_amount_sar ? (
                  <p>
                    العرض: {row.quote_amount_sar} ر.س {row.quote_note}
                  </p>
                ) : null}
                <DeskRequestActions row={row} busy={busy} whatsapp={payload.whatsapp} onUpdate={updateRequest} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DeskRequestActions({
  row,
  busy,
  whatsapp,
  onUpdate,
}: {
  row: RequestRow;
  busy: boolean;
  whatsapp: string;
  onUpdate: (row: RequestRow, status: StoreHalanaRequestStatus, extra?: Record<string, string>) => Promise<void>;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [amount, setAmount] = useState(row.quote_amount_sar);
  const [note, setNote] = useState(row.quote_note);
  const message = [
    `طلب حلانا1: ${row.sweet_type}`,
    `العدد: ${row.quantity}`,
    `الوصول: ${row.deliver_at}`,
    row.quote_amount_sar ? `العرض: ${row.quote_amount_sar} ر.س` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="mt-3 space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <input className={fieldClass} placeholder="مبلغ العرض" value={amount} onChange={(event) => setAmount(event.target.value)} />
        <input className={fieldClass} placeholder="ملاحظة السعر" value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onUpdate(row, 'quoted', { quoteAmountSar: amount, quoteNote: note })}
          className="rounded-lg bg-[#c45c7a] px-3 py-1.5 text-xs font-bold text-[#14080c] disabled:opacity-60"
        >
          {copy.quoteCtaAr}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onUpdate(row, 'awaiting_deposit')}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold"
        >
          بانتظار العربون
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onUpdate(row, 'confirmed')}
          className="rounded-lg border border-emerald-300/40 px-3 py-1.5 text-xs font-bold text-emerald-100"
        >
          {copy.depositCtaAr}
        </button>
        {STORE_HALANA_REQUEST_STATUSES.filter((status) => status === 'preparing' || status === 'ready' || status === 'completed' || status === 'declined').map(
          (status) => (
            <button
              key={status}
              type="button"
              disabled={busy}
              onClick={() => void onUpdate(row, status)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs"
            >
              {copy.statusAr[status]}
            </button>
          ),
        )}
        {row.guest_whatsapp || whatsapp ? (
          <a
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold"
            href={whatsappHref(row.guest_whatsapp || whatsapp, message)}
            target="_blank"
            rel="noreferrer"
          >
            {copy.whatsappCtaAr}
          </a>
        ) : null}
      </div>
    </div>
  );
}
