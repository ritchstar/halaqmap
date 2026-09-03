/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معرض حلانا1 وصفحة الطلب ولوحة المتخصصة. غير معلنة. لا تُستورد إعداداتها من App.
 */
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import {
  STORE_HALANA_ATMOSPHERE,
  STORE_HALANA_CAPTION_MAX,
  STORE_HALANA_DEFAULT_FLAVORS_AR,
  STORE_HALANA_DEFAULT_POLICY_AR,
  STORE_HALANA_GALLERY_MAX,
  STORE_HALANA_IMAGE_MAX_CHARS,
  STORE_HALANA_LIVE_COPY,
  STORE_HALANA_REQUEST_STATUSES,
  type StoreHalanaRequestStatus,
} from '@/config/storeHalanaLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchHalanaPublic, postHalanaAction } from '@/lib/storeHalanaLiveRemote';
import { compressImageFile, youtubeEmbedSrc } from '@/lib/storeWeddingLiveLab';

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

type GalleryItem = { id: string; caption: string; src: string };

type Payload = {
  shopName: string;
  flavorsAr: string;
  policyAr: string;
  quotesAr: string;
  whatsapp: string;
  gallery: GalleryItem[];
  readyLines: string;
  promoTitleAr: string;
  promoAr: string;
  youtubeUrls: string;
  requests: RequestRow[];
};

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

function HalanaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="halana-field-shell block text-sm">
      {label}
      {children}
    </label>
  );
}

function ProductGallery({ items, emptyAr, featured }: { items: GalleryItem[]; emptyAr?: string; featured?: boolean }) {
  const copy = STORE_HALANA_LIVE_COPY;
  if (items.length === 0) {
    return emptyAr ? <p className="text-sm leading-7 text-white/60">{emptyAr}</p> : null;
  }
  return (
    <div className={featured ? 'grid gap-5 sm:grid-cols-2' : 'grid gap-3 sm:grid-cols-2'}>
      {items.map((item) => (
        <figure key={item.id} className="halana-work-card overflow-hidden rounded-3xl">
          <img src={item.src} alt={item.caption || copy.galleryTitleAr} className={featured ? 'h-64 w-full object-cover' : 'h-40 w-full object-cover'} />
          {item.caption ? (
            <figcaption className="px-4 py-3 text-sm leading-7 text-white/80">{item.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

export default function StoreHalanaShopPage() {
  const copy = STORE_HALANA_LIVE_COPY;
  useDocumentTitle(copy.documentTitle);
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const order = location.pathname.endsWith('/order');
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
    const raw = res.payload as Payload;
    setError('');
    setPayload({
      ...raw,
      gallery: Array.isArray(raw.gallery) ? raw.gallery : [],
      promoTitleAr: raw.promoTitleAr || '',
      promoAr: raw.promoAr || '',
      youtubeUrls: raw.youtubeUrls || '',
    });
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
  }, [token, desk, order]);

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
    <div dir="rtl" className="halana-page min-h-svh text-[#f4efe4]">
      {desk ? (
        <div className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm font-bold tracking-wide text-[#e8a0b4]">{copy.deskTitleAr}</p>
          <h1 className="mt-2 text-3xl font-extrabold">{payload.shopName || copy.titleAr}</h1>
          <DeskPanel token={token} payload={payload} onSaved={() => void load()} />
        </div>
      ) : order ? (
        <div className="mx-auto max-w-3xl px-4 py-8">
          <OrderPanel token={token} payload={payload} busy={busy} setBusy={setBusy} />
        </div>
      ) : (
        <ShowcasePanel token={token} payload={payload} />
      )}
    </div>
  );
}

function ShowcasePanel({ token, payload }: { token: string; payload: Payload }) {
  const copy = STORE_HALANA_LIVE_COPY;
  const flavors = splitLines(payload.flavorsAr || STORE_HALANA_DEFAULT_FLAVORS_AR);
  const quotes = splitLines(payload.quotesAr);
  const clips = splitLines(payload.youtubeUrls)
    .map((url) => ({ url, embed: youtubeEmbedSrc(url, { loop: false, autoplay: false }) }))
    .filter((item) => item.embed);
  const promo = splitLines(payload.promoAr);
  const hero = payload.gallery[0]?.src || STORE_HALANA_ATMOSPHERE.hero;
  const works = payload.gallery.length > 1 ? payload.gallery.slice(1) : payload.gallery;

  return (
    <div>
      <header className="halana-hero-stage relative overflow-hidden">
        <img src={hero} alt="" className="h-[28rem] w-full object-cover sm:h-[34rem]" />
        <div className="halana-hero-veil absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-5 pb-10">
          <p className="text-sm font-bold tracking-wide text-[#f6d7b0]">{copy.kickerAr}</p>
          <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">{payload.shopName || copy.titleAr}</h1>
          <p className="mt-3 max-w-xl text-lg font-extrabold text-[#ffe8c4]">
            {payload.promoTitleAr || copy.showcaseLeadAr}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-12 px-4 py-10">
        {promo.length > 0 ? (
          <section className="space-y-4">
            {promo.map((line) => (
              <p key={line} className="text-base leading-9 text-white/80">
                {line}
              </p>
            ))}
          </section>
        ) : (
          <p className="text-sm leading-8 text-white/65">{copy.showcaseLeadAr}</p>
        )}
        <section>
          <h2 className="text-2xl font-black">{copy.galleryTitleAr}</h2>
          <div className="mt-5">
            <ProductGallery items={works} emptyAr={copy.galleryEmptyAr} featured />
          </div>
        </section>
        {clips.length > 0 ? (
          <section>
            <h2 className="text-2xl font-black">{copy.youtubeTitleAr}</h2>
            <div className="mt-5 space-y-5">
              {clips.map((item) => (
                <div key={item.url} className="halana-youtube-frame overflow-hidden rounded-3xl">
                  <iframe
                    title={copy.youtubeTitleAr}
                    src={item.embed || ''}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {quotes.length > 0 ? (
          <section>
            <h2 className="text-2xl font-black">{copy.quotesTitleAr}</h2>
            <ul className="mt-4 space-y-3">
              {quotes.map((line) => (
                <li key={line} className="halana-quote rounded-2xl px-4 py-3 text-sm leading-8 text-white/75">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {flavors.length > 0 ? (
          <section>
            <h2 className="text-2xl font-black">{copy.flavorsTitleAr}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {flavors.map((line) => (
                <span key={line} className="rounded-full border border-[#ffe2b4]/25 bg-black/25 px-4 py-1.5 text-sm">
                  {line}
                </span>
              ))}
            </div>
          </section>
        ) : null}
        <Link to={`/h/${encodeURIComponent(token)}/order`} className="halana-order-cta">
          <span className="halana-order-cta__mark" aria-hidden>
            ح
          </span>
          <span>{copy.orderCtaAr}</span>
        </Link>
      </div>
    </div>
  );
}

function OrderPanel({
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

  const ready = splitLines(payload.readyLines);

  return (
    <div className="space-y-8">
      <Link to={`/h/${encodeURIComponent(token)}`} className="text-sm font-bold text-[#e8a0b4] underline">
        {copy.orderBackAr}
      </Link>
      <img
        src={payload.gallery[0]?.src || STORE_HALANA_ATMOSPHERE.cake}
        alt=""
        className="h-40 w-full rounded-3xl object-cover shadow-[0_0_48px_rgba(255,210,160,0.28)]"
      />
      <p className="text-sm font-bold tracking-wide text-[#e8a0b4]">{copy.orderKickerAr}</p>
      <h1 className="text-3xl font-extrabold">{payload.shopName || copy.titleAr}</h1>
      <p className="text-sm leading-8 text-white/75">{copy.shopLeadAr}</p>
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
      <section>
        <h2 className="text-lg font-extrabold">{copy.policyTitleAr}</h2>
        <p className="mt-2 text-sm leading-8 text-white/75">{payload.policyAr || STORE_HALANA_DEFAULT_POLICY_AR}</p>
      </section>
      <p className="text-sm leading-7 text-amber-100/80">{copy.refWarnAr}</p>
      <p className="text-sm leading-7 text-amber-100/80">{copy.depositWarnAr}</p>
      <p className="text-sm leading-7 text-white/60">{copy.pickupWarnAr}</p>
      <form onSubmit={(event) => void onSubmit(event)} className="halana-form-card space-y-4 rounded-2xl p-4">
        <p className="text-lg font-extrabold">{copy.formTitleAr}</p>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
        <HalanaField label={copy.deliverAtAr}>
          <input className="halana-field" value={deliverAt} onChange={(event) => setDeliverAt(event.target.value)} />
        </HalanaField>
        <HalanaField label={copy.quantityAr}>
          <input className="halana-field" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </HalanaField>
        <HalanaField label={copy.sweetTypeAr}>
          <input className="halana-field" value={sweetType} onChange={(event) => setSweetType(event.target.value)} />
        </HalanaField>
        <HalanaField label={copy.fillingsAr}>
          <input className="halana-field" value={fillings} onChange={(event) => setFillings(event.target.value)} />
        </HalanaField>
        <HalanaField label={copy.refNoteAr}>
          <textarea className="halana-field min-h-24" value={refNote} onChange={(event) => setRefNote(event.target.value)} />
        </HalanaField>
        <HalanaField label={copy.guestNameAr}>
          <input className="halana-field" value={guestName} onChange={(event) => setGuestName(event.target.value)} />
        </HalanaField>
        <HalanaField label={copy.guestWhatsappAr}>
          <input className="halana-field" dir="ltr" value={guestWhatsapp} onChange={(event) => setGuestWhatsapp(event.target.value)} />
        </HalanaField>
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
  const [readyLines, setReadyLines] = useState(payload.readyLines);
  const [promoTitleAr, setPromoTitleAr] = useState(payload.promoTitleAr);
  const [promoAr, setPromoAr] = useState(payload.promoAr);
  const [youtubeUrls, setYoutubeUrls] = useState(payload.youtubeUrls);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const gallery = payload.gallery || [];

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
      readyLines,
      promoTitleAr,
      promoAr,
      youtubeUrls,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('حُفظ المعرض.');
    onSaved();
  }

  async function onUpload(file: File | undefined) {
    if (!file || busy) return;
    if (gallery.length >= STORE_HALANA_GALLERY_MAX) {
      toast.error(copy.galleryFullAr);
      return;
    }
    setBusy(true);
    try {
      let imageSrc = await compressImageFile(file, 900);
      if (imageSrc.length > STORE_HALANA_IMAGE_MAX_CHARS) {
        imageSrc = await compressImageFile(file, 640);
      }
      if (imageSrc.length > STORE_HALANA_IMAGE_MAX_CHARS) {
        toast.error('الصورة أكبر من حد العرض. جرّبي صورة أوضح وأصغر.');
        return;
      }
      const res = await postHalanaAction({
        action: 'add_gallery',
        token,
        imageSrc,
        caption: caption.slice(0, STORE_HALANA_CAPTION_MAX),
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setCaption('');
      toast.success('ظهرت الصورة في معرض العميلات.');
      onSaved();
    } catch {
      toast.error('تعذر رفع الصورة. جرّبي ملفاً أصغر.');
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(imageId: string) {
    setBusy(true);
    const res = await postHalanaAction({ action: 'remove_gallery', token, imageId });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
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
      <p className="text-sm leading-7 text-[#f6d7b0]">
        الصفحة التي توجّهين إليها العميلات هي المعرض. الطلب في صفحة مستقلة أسفل المعرض.
      </p>
      <section className="halana-form-card space-y-4 rounded-2xl p-4">
        <h2 className="text-lg font-extrabold">{copy.galleryDeskTitleAr}</h2>
        <p className="text-sm leading-7 text-white/70">{copy.galleryDeskLeadAr}</p>
        <ProductGallery items={gallery} />
        {gallery.map((item) => (
          <div key={`rm-${item.id}`} className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-white/65">{item.caption || 'صورة عمل'}</span>
            <button type="button" disabled={busy} className="underline" onClick={() => void onRemove(item.id)}>
              {copy.galleryRemoveAr}
            </button>
          </div>
        ))}
        <HalanaField label={copy.galleryCaptionAr}>
          <textarea
            className="halana-field min-h-20"
            maxLength={STORE_HALANA_CAPTION_MAX}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
        </HalanaField>
        <label className="inline-flex cursor-pointer rounded-full bg-[#c45c7a] px-4 py-2 text-sm font-extrabold text-[#14080c]">
          {copy.galleryUploadAr}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy || gallery.length >= STORE_HALANA_GALLERY_MAX}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              void onUpload(file);
            }}
          />
        </label>
        {gallery.length >= STORE_HALANA_GALLERY_MAX ? <p className="text-sm text-amber-100/80">{copy.galleryFullAr}</p> : null}
      </section>
      <section className="halana-form-card space-y-4 rounded-2xl p-4">
        <h2 className="text-lg font-extrabold">نصوص المعرض ولقطاته</h2>
        <HalanaField label="اسم الصفحة">
          <input className="halana-field" value={shopName} onChange={(event) => setShopName(event.target.value)} />
        </HalanaField>
        <HalanaField label={copy.promoTitleLabelAr}>
          <input className="halana-field" value={promoTitleAr} onChange={(event) => setPromoTitleAr(event.target.value)} />
        </HalanaField>
        <HalanaField label={copy.promoBodyLabelAr}>
          <textarea className="halana-field min-h-28" value={promoAr} onChange={(event) => setPromoAr(event.target.value)} />
        </HalanaField>
        <HalanaField label={copy.youtubeLabelAr}>
          <textarea className="halana-field min-h-24" dir="ltr" value={youtubeUrls} onChange={(event) => setYoutubeUrls(event.target.value)} />
        </HalanaField>
        <HalanaField label="واتساب التشغيل">
          <input className="halana-field" dir="ltr" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
        </HalanaField>
        <HalanaField label="النكهات، سطراً لكل نكهة">
          <textarea className="halana-field min-h-24" value={flavorsAr} onChange={(event) => setFlavorsAr(event.target.value)} />
        </HalanaField>
        <HalanaField label="آراء تظهرها للمتصفحة">
          <textarea className="halana-field min-h-20" value={quotesAr} onChange={(event) => setQuotesAr(event.target.value)} />
        </HalanaField>
        <HalanaField label="سياسة الطلب المسبق">
          <textarea className="halana-field min-h-24" value={policyAr} onChange={(event) => setPolicyAr(event.target.value)} />
        </HalanaField>
        <HalanaField label="جاهز لتاريخ معيّن، سطراً لكل صنف">
          <textarea className="halana-field min-h-20" value={readyLines} onChange={(event) => setReadyLines(event.target.value)} />
        </HalanaField>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveHost()}
          className="rounded-full bg-[#c45c7a] px-5 py-2.5 text-sm font-extrabold text-[#14080c] disabled:opacity-60"
        >
          حفظ المعرض
        </button>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">الطلبات</h2>
        {(payload.requests || []).length === 0 ? (
          <p className="text-sm text-white/55">لا طلبات بعد.</p>
        ) : (
          <ul className="space-y-3">
            {(payload.requests || []).map((row) => (
              <li key={row.id} className="halana-form-card rounded-2xl p-4 text-sm leading-7">
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
        <HalanaField label="مبلغ العرض">
          <input className="halana-field" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </HalanaField>
        <HalanaField label="ملاحظة السعر">
          <input className="halana-field" value={note} onChange={(event) => setNote(event.target.value)} />
        </HalanaField>
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
