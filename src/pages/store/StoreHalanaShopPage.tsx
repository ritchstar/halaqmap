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
  STORE_HALANA_LIVE_ACCENT,
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
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { StoreHalanaShareDesk } from '@/components/store/StoreHalanaShareDesk';
import { STORE_HALANA_SUPPORT } from '@/config/storeProductSupport';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { splitHalanaYoutubeLines } from '@/lib/storeHalanaShare';
import { StoreDirectPayDesk } from '@/components/store/StoreDirectPayDesk';
import { StoreDirectPayGuest, StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';
import { DIRECT_PAY_REQUEST_KEY, directPayCopyText } from '@/lib/storeDirectPay';
import { fetchDirectPay } from '@/lib/storeDirectPayRemote';
import { HALANA_PAY_REQUEST_KEY } from '@/lib/storeHalanaPay';
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
  proof_src?: string;
};

type GalleryItem = { id: string; caption: string; src: string };

type PayPublic = { bankTransfer: boolean; cashOnPickup: boolean; networkOnPickup: boolean };
type HalanaPayDesk = {
  bankName: string;
  beneficiaryName: string;
  iban: string;
  cashRemainder: boolean;
  networkRemainder: boolean;
};

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
  payPublic: PayPublic;
  payDesk: HalanaPayDesk;
};

const EMPTY_PAY_PUBLIC: PayPublic = { bankTransfer: false, cashOnPickup: false, networkOnPickup: false };
const EMPTY_PAY_DESK: HalanaPayDesk = {
  bankName: '',
  beneficiaryName: '',
  iban: '',
  cashRemainder: false,
  networkRemainder: false,
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

const HALANA_SPARKS = [
  { top: '7%', right: '8%', size: 5, delay: '0s', duration: '8s' },
  { top: '14%', right: '78%', size: 3, delay: '1.2s', duration: '11s' },
  { top: '28%', right: '18%', size: 4, delay: '2.1s', duration: '9s' },
  { top: '36%', right: '62%', size: 6, delay: '0.6s', duration: '12s' },
  { top: '48%', right: '10%', size: 3, delay: '3s', duration: '10s' },
  { top: '58%', right: '84%', size: 5, delay: '1.8s', duration: '8.5s' },
  { top: '72%', right: '22%', size: 4, delay: '2.6s', duration: '13s' },
  { top: '81%', right: '70%', size: 3, delay: '0.4s', duration: '9.4s' },
  { top: '88%', right: '40%', size: 5, delay: '1.5s', duration: '11.5s' },
] as const;

const HALANA_PETALS = [
  { top: '12%', right: '42%', delay: '0s' },
  { top: '40%', right: '88%', delay: '3s' },
  { top: '66%', right: '8%', delay: '5s' },
  { top: '84%', right: '54%', delay: '2s' },
] as const;

function HalanaSparkLayer() {
  return (
    <div className="halana-spark-layer" aria-hidden>
      {HALANA_SPARKS.map((spark, index) => (
        <span
          key={`spark-${index}`}
          className="halana-spark"
          style={{
            top: spark.top,
            right: spark.right,
            width: spark.size,
            height: spark.size,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
          }}
        />
      ))}
      {HALANA_PETALS.map((petal, index) => (
        <span
          key={`petal-${index}`}
          className="halana-petal"
          style={{ top: petal.top, right: petal.right, animationDelay: petal.delay }}
        />
      ))}
    </div>
  );
}

function HalanaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="halana-field-shell block">
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
  const [lead, ...rest] = items;
  if (featured && lead) {
    return (
      <div className="space-y-6">
        <figure className="halana-work-card overflow-hidden rounded-[1.75rem] p-1.5">
          <img src={lead.src} alt={lead.caption || copy.galleryTitleAr} className="h-[22rem] w-full object-cover sm:h-[28rem]" />
          {lead.caption ? (
            <figcaption className="halana-work-caption px-5 py-5 text-lg leading-9">{lead.caption}</figcaption>
          ) : null}
        </figure>
        {rest.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {rest.map((item) => (
              <figure key={item.id} className="halana-work-card overflow-hidden rounded-[1.6rem] p-1.5">
                <img src={item.src} alt={item.caption || copy.galleryTitleAr} className="h-64 w-full object-cover" />
                {item.caption ? (
                  <figcaption className="halana-work-caption px-4 py-4 text-base leading-8">{item.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <figure key={item.id} className="halana-work-card overflow-hidden rounded-3xl p-1.5">
          <img src={item.src} alt={item.caption || copy.galleryTitleAr} className="h-52 w-full object-cover" />
          {item.caption ? <figcaption className="halana-work-caption px-4 py-3 text-sm leading-7">{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}

function ShowcaseSection({ kicker, title, children }: { kicker?: string; title: string; children: ReactNode }) {
  return (
    <section className="halana-section">
      {kicker ? <p className="halana-section-kicker">{kicker}</p> : null}
      <h2 className="halana-title-sm mt-2">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
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
      payPublic: raw.payPublic || EMPTY_PAY_PUBLIC,
      payDesk: raw.payDesk || EMPTY_PAY_DESK,
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
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#14080c] px-6 text-center text-[#f4efe4]" dir="rtl">
        <p>{error}</p>
        {error.includes('انتهت مدة التشغيل') ? (
          <Link className="text-[#c45c7a] underline" to={`${ROUTE_PATHS.STORE_HALANA}?renew=${encodeURIComponent(token)}`}>
            إعادة الشراء على نفس الصفحة
          </Link>
        ) : null}
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
      <HalanaSparkLayer />
      {desk ? (
        <>
          <header className="halana-desk-hero">
            <img
              src={payload.gallery[0]?.src || STORE_HALANA_ATMOSPHERE.atelier}
              alt={payload.shopName || copy.titleAr}
            />
            <div className="halana-hero-frame" />
            <div className="halana-hero-veil absolute inset-0" />
            <div className="halana-desk-hero__copy">
              <p className="halana-section-kicker">{copy.deskTitleAr}</p>
              <h1 className="halana-title mt-3">{payload.shopName || copy.titleAr}</h1>
            </div>
          </header>
          <div className="halana-shell mx-auto max-w-3xl px-4 py-8">
            <DeskPanel token={token} payload={payload} onSaved={() => void load()} />
          </div>
        </>
      ) : order ? (
        <div className="halana-shell mx-auto max-w-3xl px-4 py-8">
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
  const youtube = splitHalanaYoutubeLines(payload.youtubeUrls);
  const clips = youtube.clips
    .map((url) => ({ url, embed: youtubeEmbedSrc(url, { loop: false, autoplay: false }) }))
    .filter((item) => item.embed);
  const promo = splitLines(payload.promoAr);
  const ready = splitLines(payload.readyLines);
  const hero = payload.gallery[0]?.src || STORE_HALANA_ATMOSPHERE.hero;
  const heroCaption = payload.gallery[0]?.caption || '';
  const works = payload.gallery;

  return (
    <div>
      <header className="halana-hero-stage relative overflow-hidden">
        <img src={hero} alt={heroCaption || payload.shopName || copy.titleAr} className="h-[30rem] w-full object-cover sm:h-[38rem]" />
        <div className="halana-hero-frame" />
        <div className="halana-hero-veil absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 z-[2] mx-auto max-w-3xl px-5 pb-12">
          <p className="halana-section-kicker">{copy.showcaseKickerAr}</p>
          <h1 className="halana-title mt-3">{payload.shopName || copy.titleAr}</h1>
          <p className="halana-lead mt-4 max-w-xl font-extrabold">
            {payload.promoTitleAr || copy.showcaseLeadAr}
          </p>
          {heroCaption ? <p className="mt-3 max-w-xl text-base leading-8 text-[#ffe8c4]/80">{heroCaption}</p> : null}
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-14 px-4 py-12">
        {promo.length > 0 ? (
          <ShowcaseSection kicker={copy.promoSectionAr} title={payload.promoTitleAr || copy.promoSectionAr}>
            <div className="halana-promo-card space-y-4">
              {promo.map((line) => (
                <p key={line} className="text-lg leading-9 text-[#fff6e6]/90">
                  {line}
                </p>
              ))}
            </div>
          </ShowcaseSection>
        ) : (
          <p className="text-sm leading-8 text-white/65">{copy.showcaseLeadAr}</p>
        )}
        <ShowcaseSection kicker={copy.worksLeadAr} title={copy.galleryTitleAr}>
          <ProductGallery items={works} emptyAr={copy.galleryEmptyAr} featured />
        </ShowcaseSection>
        {youtube.channels.length > 0 ? (
          <ShowcaseSection title={copy.youtubeChannelAr}>
            <div className="flex flex-col gap-2">
              {youtube.channels.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-[#ffe2b4]/35 px-5 py-3 text-sm font-extrabold text-[#ffe8c4]"
                >
                  {copy.youtubeChannelAr}
                </a>
              ))}
            </div>
          </ShowcaseSection>
        ) : null}
        {clips.length > 0 ? (
          <ShowcaseSection title={copy.youtubeTitleAr}>
            <div className="space-y-6">
              {clips.map((item) => (
                <div key={item.url} className="halana-youtube-frame overflow-hidden rounded-[1.6rem] p-1.5">
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
          </ShowcaseSection>
        ) : null}
        {quotes.length > 0 ? (
          <ShowcaseSection title={copy.quotesTitleAr}>
            <ul className="space-y-3">
              {quotes.map((line) => (
                <li key={line} className="halana-quote rounded-2xl px-5 py-4 text-base leading-8 text-[#fff6e6]/88">
                  {line}
                </li>
              ))}
            </ul>
          </ShowcaseSection>
        ) : null}
        {flavors.length > 0 ? (
          <ShowcaseSection title={copy.flavorsTitleAr}>
            <div className="flex flex-wrap gap-2">
              {flavors.map((line) => (
                <span key={line} className="halana-flavor-chip">
                  {line}
                </span>
              ))}
            </div>
          </ShowcaseSection>
        ) : null}
        {ready.length > 0 ? (
          <ShowcaseSection title={copy.readyTitleAr}>
            <ul className="halana-promo-card space-y-2 text-sm leading-8 text-white/78">
              {ready.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </ShowcaseSection>
        ) : null}
        <ShowcaseSection title={copy.policyTitleAr}>
          <p className="halana-lead">{payload.policyAr || STORE_HALANA_DEFAULT_POLICY_AR}</p>
        </ShowcaseSection>
        <ShowcaseSection title={copy.payTitleAr}>
          <StoreDirectPayPublicMount product="store_halana_live" token={token} accent={STORE_HALANA_LIVE_ACCENT} />
        </ShowcaseSection>
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
  const [payTick, setPayTick] = useState(0);

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
    if (res.requestId) {
      sessionStorage.setItem(`${HALANA_PAY_REQUEST_KEY}:${token}`, res.requestId);
      sessionStorage.setItem(`${DIRECT_PAY_REQUEST_KEY}:store_halana_live:${token}`, res.requestId);
      setPayTick((n) => n + 1);
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
      <Link to={`/h/${encodeURIComponent(token)}`} className="text-sm font-bold text-[#ffe8c4] underline">
        {copy.orderBackAr}
      </Link>
      <div className="halana-ornament overflow-hidden rounded-[1.6rem] p-1.5">
        <img
          src={payload.gallery[0]?.src || STORE_HALANA_ATMOSPHERE.cake}
          alt=""
          className="h-48 w-full rounded-[1.2rem] object-cover"
        />
      </div>
      <p className="halana-section-kicker">{copy.orderKickerAr}</p>
      <h1 className="halana-title">{payload.shopName || copy.titleAr}</h1>
      <p className="halana-lead">{copy.shopLeadAr}</p>
      {ready.length > 0 ? (
        <section>
          <h2 className="halana-title-sm">{copy.readyTitleAr}</h2>
          <ul className="mt-3 space-y-1 text-base leading-8 text-[#ffe8c4]/85">
            {ready.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <h2 className="halana-title-sm">{copy.policyTitleAr}</h2>
        <p className="halana-lead mt-3">{payload.policyAr || STORE_HALANA_DEFAULT_POLICY_AR}</p>
      </section>
      <p className="text-base leading-8 text-amber-100/85">{copy.refWarnAr}</p>
      <p className="text-base leading-8 text-amber-100/85">{copy.depositWarnAr}</p>
      <p className="text-base leading-8 text-[#ffe8c4]/70">{copy.pickupWarnAr}</p>
      <form onSubmit={(event) => void onSubmit(event)} className="halana-form-card space-y-4 rounded-2xl p-5">
        <p className="halana-title-sm">{copy.formTitleAr}</p>
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
          className="halana-action w-full rounded-full px-5 py-3 text-sm font-extrabold disabled:opacity-60"
        >
          {copy.submitAr}
        </button>
      </form>
      <StoreDirectPayGuest
        key={`${token}-${payTick}`}
        product="store_halana_live"
        token={token}
        accent={STORE_HALANA_LIVE_ACCENT}
      />
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

  async function onSaveCaption(imageId: string, nextCaption: string) {
    setBusy(true);
    const res = await postHalanaAction({
      action: 'update_gallery',
      token,
      imageId,
      caption: nextCaption.slice(0, STORE_HALANA_CAPTION_MAX),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('حُفظ وصف العمل.');
    onSaved();
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
    <div className="space-y-8">
      <p className="halana-lead">{copy.deskLeadAr}</p>
      <p className="halana-lead">
        الصفحة التي توجّهين إليها العميلات هي المعرض. الطلب في صفحة مستقلة أسفل المعرض.
      </p>
      <section className="halana-form-card space-y-4 rounded-2xl p-5">
        <h2 className="halana-title-sm">{copy.galleryDeskTitleAr}</h2>
        <p className="text-base leading-8 text-[#ffe8c4]/80">{copy.galleryDeskLeadAr}</p>
        <ProductGallery items={gallery} />
        {gallery.map((item) => (
          <GalleryCaptionEditor
            key={`cap-${item.id}`}
            item={item}
            busy={busy}
            onSave={onSaveCaption}
            onRemove={onRemove}
          />
        ))}
        <HalanaField label={copy.galleryCaptionAr}>
          <textarea
            className="halana-field min-h-20"
            maxLength={STORE_HALANA_CAPTION_MAX}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
        </HalanaField>
        <label className="halana-action inline-flex cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold">
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
      <section className="halana-form-card space-y-4 rounded-2xl p-5">
        <h2 className="halana-title-sm">نصوص المعرض ولقطاته</h2>
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
          className="halana-action rounded-full px-5 py-2.5 text-sm font-extrabold disabled:opacity-60"
        >
          حفظ المعرض
        </button>
      </section>
      <StoreDirectPayDesk product="store_halana_live" token={token} accent={STORE_HALANA_LIVE_ACCENT} onSaved={onSaved} />
      <StoreHalanaShareDesk token={token} shopName={shopName} />
      <StoreDeskGuideLink
        to={ROUTE_PATHS.STORE_HALANA_SUPPORT}
        leadAr={STORE_HALANA_SUPPORT.deskLeadAr}
        ctaAr={STORE_HALANA_SUPPORT.deskCtaAr}
        accent={STORE_HALANA_SUPPORT.accent}
      />
      <StoreDeskHelpSupport product="halana" />
      <section className="space-y-3">
        <h2 className="halana-title-sm">الطلبات</h2>
        {(payload.requests || []).length === 0 ? (
          <p className="text-sm leading-8 text-white/55">لا طلبات بعد.</p>
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
                {row.proof_src ? (
                  <img src={row.proof_src} alt={copy.payProofAr} className="mt-2 max-h-40 rounded-xl object-cover" />
                ) : null}
                <DeskRequestActions
                  row={row}
                  busy={busy}
                  whatsapp={payload.whatsapp}
                  payDesk={payload.payDesk}
                  onUpdate={updateRequest}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function GalleryCaptionEditor({
  item,
  busy,
  onSave,
  onRemove,
}: {
  item: GalleryItem;
  busy: boolean;
  onSave: (imageId: string, caption: string) => Promise<void>;
  onRemove: (imageId: string) => Promise<void>;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [caption, setCaption] = useState(item.caption);

  useEffect(() => {
    setCaption(item.caption);
  }, [item.caption, item.id]);

  return (
    <div className="halana-ornament space-y-2 rounded-2xl p-3">
      <HalanaField label={copy.galleryCaptionAr}>
        <textarea
          className="halana-field min-h-16"
          maxLength={STORE_HALANA_CAPTION_MAX}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
      </HalanaField>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          className="halana-action rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-60"
          onClick={() => void onSave(item.id, caption)}
        >
          {copy.galleryCaptionSaveAr}
        </button>
        <button type="button" disabled={busy} className="text-xs underline" onClick={() => void onRemove(item.id)}>
          {copy.galleryRemoveAr}
        </button>
      </div>
    </div>
  );
}

function DeskRequestActions({
  row,
  busy,
  whatsapp,
  payDesk,
  onUpdate,
}: {
  row: RequestRow;
  busy: boolean;
  whatsapp: string;
  payDesk: HalanaPayDesk;
  onUpdate: (row: RequestRow, status: StoreHalanaRequestStatus, extra?: Record<string, string>) => Promise<void>;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [amount, setAmount] = useState(row.quote_amount_sar);
  const [note, setNote] = useState(row.quote_note);
  const payText = payDesk.iban
    ? directPayCopyText({
        bankName: payDesk.bankName,
        beneficiaryName: payDesk.beneficiaryName,
        iban: payDesk.iban,
        amountSar: row.quote_amount_sar || amount,
        requestRef: row.id.slice(0, 8),
      })
    : '';
  const message = [
    `طلب حلانا1: ${row.sweet_type}`,
    `العدد: ${row.quantity}`,
    `الوصول: ${row.deliver_at}`,
    row.quote_amount_sar ? `العرض: ${row.quote_amount_sar} ر.س` : '',
    payText,
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
          className="halana-action rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-60"
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
