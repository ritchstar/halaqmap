/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معرض حلانا1 وصفحة الطلب ولوحة المتخصصة. غير معلنة. لا تُستورد إعداداتها من App.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
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
import { StoreLiveStoreLink } from '@/components/store/StoreLiveStoreLink';
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { StoreDeskCornerDock } from '@/components/store/StoreDeskCornerNav';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { StoreOpsSection } from '@/components/store/StoreOpsSection';
import { StoreShopLogoDesk } from '@/components/store/StoreShopLogoDesk';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { STORE_SHOP_LOGO_COPY } from '@/config/storeShopLogo';
import { STORE_HALANA_SUPPORT } from '@/config/storeProductSupport';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { StoreDirectPayDesk } from '@/components/store/StoreDirectPayDesk';
import { HalanaActivityOrderFlow } from '@/components/store/halana/HalanaActivityOrderFlow';
import { HalanaActivityShowcase } from '@/components/store/halana/HalanaActivityShowcase';
import { StoreHalanaShareDesk } from '@/components/store/StoreHalanaShareDesk';
import { directPayCopyText } from '@/lib/storeDirectPay';
import { fetchHalanaPublic, postHalanaAction } from '@/lib/storeHalanaLiveRemote';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';
import { parseShopLogoSrc } from '@/lib/storeShopLogo';
import { cn } from '@/lib/utils';

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
  shopToken: string;
  shopUrl: string;
  orderUrl: string;
  logoSrc: string;
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

function HalanaGalleryMedia({
  src,
  alt,
  size = 'grid',
}: {
  src: string;
  alt: string;
  size?: 'lead' | 'grid';
}) {
  return (
    <div
      className={cn(
        'halana-work-media relative w-full overflow-hidden rounded-[1.15rem]',
        size === 'lead' ? 'aspect-[5/4] min-h-[14rem] sm:aspect-[16/10] sm:min-h-[18rem]' : 'aspect-square min-h-[11rem]',
      )}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain object-center p-3"
        loading="lazy"
      />
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
      shopToken: String(raw.shopToken || '').trim(),
      shopUrl: String(raw.shopUrl || '').trim(),
      orderUrl: String(raw.orderUrl || '').trim(),
      logoSrc: parseShopLogoSrc(raw.logoSrc, ''),
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
              <h1 className="halana-title mt-3 flex items-center gap-3">
                <StoreShopLogoMark src={payload.logoSrc} />
                <span>{payload.shopName || copy.titleAr}</span>
              </h1>
            </div>
          </header>
          <div className="halana-shell mx-auto max-w-3xl px-4 py-8">
            <DeskPanel token={token} payload={payload} onSaved={() => void load()} />
          </div>
        </>
      ) : order ? (
        <HalanaActivityOrderFlow token={token} payload={payload} busy={busy} setBusy={setBusy} />
      ) : (
        <HalanaActivityShowcase token={token} payload={payload} />
      )}
      {!desk ? <StoreLiveStoreLink /> : null}
    </div>
  );
}

type PendingGalleryRow = { id: string; caption: string };

function HalanaGalleryUploadButton({
  busy,
  label,
  compact = false,
  fullWidth = false,
  onPick,
}: {
  busy: boolean;
  label: string;
  compact?: boolean;
  fullWidth?: boolean;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'halana-action relative z-10 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-extrabold shadow-lg ring-2 ring-[#f3c48a]/55 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60',
          fullWidth && 'w-full',
          compact ? 'px-4 py-2 text-sm' : 'min-h-[3.25rem] px-6 py-3 text-base sm:text-lg',
        )}
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <ImagePlus className="h-6 w-6 shrink-0" aria-hidden />}
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onPick(file);
        }}
      />
    </>
  );
}

function DeskGalleryUploadTile({
  busy,
  onPick,
}: {
  busy: boolean;
  onPick: (file: File) => void;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      disabled={busy}
      aria-label={copy.galleryUploadAr}
      onClick={() => inputRef.current?.click()}
      className="halana-gallery-add-tile relative z-10 flex aspect-square min-h-[11rem] w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[#f3c48a] bg-gradient-to-b from-[#f3c48a]/28 to-[#c45c7a]/18 p-4 text-[#14080c] shadow-[0_0_28px_rgba(243,196,138,0.35)] transition hover:from-[#f3c48a]/38 hover:to-[#c45c7a]/24 disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="h-14 w-14 animate-spin text-[#14080c]" aria-hidden />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14080c]/12 ring-2 ring-[#14080c]/10">
          <ImagePlus className="h-10 w-10 text-[#14080c]" strokeWidth={2.25} aria-hidden />
        </span>
      )}
      <span className="text-base font-black">{copy.galleryUploadAr}</span>
      <span className="text-xs font-bold text-[#14080c]/75">اضغطي لاختيار صورة</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onPick(file);
        }}
      />
    </button>
  );
}

function DeskGalleryGrid({
  items,
  busy,
  galleryCount,
  onUpload,
}: {
  items: GalleryItem[];
  busy: boolean;
  galleryCount: number;
  onUpload: (caption: string, file: File) => Promise<boolean>;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const slotsLeft = Math.max(0, STORE_HALANA_GALLERY_MAX - galleryCount);
  const cellCount = items.length + (slotsLeft > 0 ? 1 : 0);

  async function pick(file: File) {
    await onUpload('', file);
  }

  if (items.length === 0 && slotsLeft <= 0) {
    return <p className="text-sm text-amber-100/80">{copy.galleryFullAr}</p>;
  }

  if (items.length === 0 && slotsLeft > 0) {
    return <DeskGalleryUploadTile busy={busy} onPick={(file) => void pick(file)} />;
  }

  return (
    <div className={cn('grid gap-3', cellCount >= 4 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2')}>
      {slotsLeft > 0 ? <DeskGalleryUploadTile busy={busy} onPick={(file) => void pick(file)} /> : null}
      {items.map((item) => (
        <figure key={item.id} className="halana-work-card overflow-hidden rounded-3xl">
          <HalanaGalleryMedia src={item.src} alt={item.caption || copy.galleryTitleAr} />
          {item.caption ? <figcaption className="halana-work-caption px-4 py-3 text-sm leading-7">{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}

function GalleryUploadProminent({
  busy,
  galleryCount,
  onUpload,
}: {
  busy: boolean;
  galleryCount: number;
  onUpload: (caption: string, file: File) => Promise<boolean>;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const slotsLeft = Math.max(0, STORE_HALANA_GALLERY_MAX - galleryCount);

  if (slotsLeft <= 0) {
    return <p className="text-sm text-amber-100/80">{copy.galleryFullAr}</p>;
  }

  return (
    <div className="halana-gallery-upload-bar relative z-10 rounded-2xl border-2 border-[#f3c48a]/55 bg-gradient-to-l from-[#f3c48a]/22 via-[#c45c7a]/16 to-[#14080c]/88 p-4 shadow-[0_0_32px_rgba(243,196,138,0.28)]">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-lg font-black text-[#ffe8c4]">{copy.galleryUploadAr}</p>
          <p className="text-sm text-white/75">{copy.galleryCountAr(galleryCount, STORE_HALANA_GALLERY_MAX)}</p>
        </div>
        <HalanaGalleryUploadButton
          busy={busy}
          fullWidth
          label="رفع صورة — اضغطي هنا"
          onPick={(file) => {
            void onUpload('', file);
          }}
        />
      </div>
    </div>
  );
}

function GalleryUploadRows({
  busy,
  galleryCount,
  onUpload,
  hideSummary = false,
}: {
  busy: boolean;
  galleryCount: number;
  onUpload: (caption: string, file: File) => Promise<boolean>;
  hideSummary?: boolean;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const slotsLeft = Math.max(0, STORE_HALANA_GALLERY_MAX - galleryCount);
  const [rows, setRows] = useState<PendingGalleryRow[]>([{ id: 'row-0', caption: '' }]);

  useEffect(() => {
    setRows((current) => (current.length > slotsLeft && slotsLeft > 0 ? current.slice(0, slotsLeft) : current));
  }, [slotsLeft]);

  function addRow() {
    if (rows.length >= slotsLeft) return;
    setRows((current) => [...current, { id: `row-${Date.now()}`, caption: '' }]);
  }

  function updateCaption(id: string, caption: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, caption } : row)));
  }

  function removeRow(id: string) {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
  }

  async function handleFile(id: string, file: File | undefined) {
    if (!file || busy) return;
    const row = rows.find((item) => item.id === id);
    if (!row) return;
    const ok = await onUpload(row.caption, file);
    if (!ok) return;
    setRows((current) => {
      if (current.length <= 1) return [{ id: current[0]?.id || 'row-0', caption: '' }];
      return current.filter((item) => item.id !== id);
    });
  }

  if (slotsLeft <= 0) {
    return <p className="text-sm text-amber-100/80">{copy.galleryFullAr}</p>;
  }

  return (
    <div className="space-y-4">
      {hideSummary ? (
        <p className="text-sm font-bold text-[#ffe8c4]/85">إضافة أعمال متعددة مع وصف لكل صورة</p>
      ) : (
        <p className="text-sm text-white/65">{copy.galleryCountAr(galleryCount, STORE_HALANA_GALLERY_MAX)}</p>
      )}
      {rows.map((row, index) => (
        <div key={row.id} className="halana-ornament space-y-3 rounded-2xl p-4">
          <p className="text-sm font-bold text-[#ffe8c4]/90">حقل العمل {index + 1}</p>
          <HalanaField label={copy.galleryCaptionAr}>
            <textarea
              className="halana-field min-h-20"
              maxLength={STORE_HALANA_CAPTION_MAX}
              value={row.caption}
              onChange={(event) => updateCaption(row.id, event.target.value)}
            />
          </HalanaField>
          <div className="flex flex-wrap items-center gap-2">
            <HalanaGalleryUploadButton
              busy={busy}
              compact
              label={copy.galleryUploadAr}
              onPick={(file) => {
                void handleFile(row.id, file);
              }}
            />
            {rows.length > 1 ? (
              <button type="button" disabled={busy} className="text-xs underline" onClick={() => removeRow(row.id)}>
                {copy.galleryRemoveAr}
              </button>
            ) : null}
          </div>
        </div>
      ))}
      {rows.length < slotsLeft ? (
        <button
          type="button"
          disabled={busy}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold"
          onClick={addRow}
        >
          {copy.galleryAddFieldAr}
        </button>
      ) : null}
    </div>
  );
}

function DeskPanel({ token, payload, onSaved }: { token: string; payload: Payload; onSaved: () => void }) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [shopName, setShopName] = useState(payload.shopName);
  const [logoSrc, setLogoSrc] = useState(payload.logoSrc);
  const [flavorsAr, setFlavorsAr] = useState(payload.flavorsAr || STORE_HALANA_DEFAULT_FLAVORS_AR);
  const [policyAr, setPolicyAr] = useState(payload.policyAr || STORE_HALANA_DEFAULT_POLICY_AR);
  const [quotesAr, setQuotesAr] = useState(payload.quotesAr);
  const [whatsapp, setWhatsapp] = useState(payload.whatsapp);
  const [readyLines, setReadyLines] = useState(payload.readyLines);
  const [promoTitleAr, setPromoTitleAr] = useState(payload.promoTitleAr);
  const [promoAr, setPromoAr] = useState(payload.promoAr);
  const [youtubeUrls, setYoutubeUrls] = useState(payload.youtubeUrls);
  const [busy, setBusy] = useState(false);
  const gallery = payload.gallery || [];

  useEffect(() => {
    setShopName(payload.shopName);
    setLogoSrc(payload.logoSrc);
  }, [payload.shopName, payload.logoSrc]);

  async function saveHost() {
    setBusy(true);
    const res = await postHalanaAction({
      action: 'save_host',
      token,
      shopName,
      logoSrc,
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

  async function onUpload(captionText: string, file: File): Promise<boolean> {
    if (busy) return false;
    if (gallery.length >= STORE_HALANA_GALLERY_MAX) {
      toast.error(copy.galleryFullAr);
      return false;
    }
    setBusy(true);
    try {
      let imageSrc = await compressImageFile(file, 900);
      if (imageSrc.length > STORE_HALANA_IMAGE_MAX_CHARS) {
        imageSrc = await compressImageFile(file, 640);
      }
      if (imageSrc.length > STORE_HALANA_IMAGE_MAX_CHARS) {
        toast.error('الصورة أكبر من حد العرض. جرّبي صورة أوضح وأصغر.');
        return false;
      }
      const res = await postHalanaAction({
        action: 'add_gallery',
        token,
        imageSrc,
        caption: captionText.slice(0, STORE_HALANA_CAPTION_MAX),
      });
      if (!res.ok) {
        toast.error(res.error);
        return false;
      }
      toast.success('ظهرت الصورة في معرض العميلات.');
      onSaved();
      return true;
    } catch {
      toast.error('تعذر رفع الصورة. جرّبي ملفاً أصغر.');
      return false;
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
    <div className="space-y-8 pb-14">
      <p className="halana-lead">{copy.deskLeadAr}</p>
      <p className="halana-lead">
        الصفحة التي توجّهين إليها العميلات هي المعرض. الطلب في صفحة مستقلة أسفل المعرض.
      </p>
      <StoreOpsSection titleAr={STORE_SHOP_LOGO_COPY.sectionAr} accent={STORE_HALANA_LIVE_ACCENT} defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          <HalanaField label={copy.shopNameLabelAr}>
            <input className="halana-field" value={shopName} onChange={(event) => setShopName(event.target.value)} />
          </HalanaField>
          <StoreShopLogoDesk
            logoSrc={logoSrc}
            onChange={setLogoSrc}
            accent={STORE_HALANA_LIVE_ACCENT}
            leadAr={copy.logoLeadAr}
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveHost()}
          className="halana-action rounded-full px-5 py-2.5 text-sm font-extrabold disabled:opacity-60"
        >
          {copy.identitySaveAr}
        </button>
      </StoreOpsSection>
      <section className="halana-form-card halana-form-card--desk-gallery relative space-y-4 rounded-2xl p-5">
        <h2 className="halana-title-sm">{copy.galleryDeskTitleAr}</h2>
        <p className="text-base leading-8 text-[#ffe8c4]/80">{copy.galleryDeskLeadAr}</p>
        <GalleryUploadProminent busy={busy} galleryCount={gallery.length} onUpload={onUpload} />
        <DeskGalleryGrid items={gallery} busy={busy} galleryCount={gallery.length} onUpload={onUpload} />
        {gallery.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-bold text-[#ffe8c4]/85">وصف الأعمال الحالية</p>
            {gallery.map((item) => (
              <GalleryCaptionEditor
                key={`cap-${item.id}`}
                item={item}
                busy={busy}
                onSave={onSaveCaption}
                onRemove={onRemove}
              />
            ))}
          </div>
        ) : null}
        <GalleryUploadRows busy={busy} galleryCount={gallery.length} hideSummary onUpload={onUpload} />
      </section>
      <section className="halana-form-card space-y-4 rounded-2xl p-5">
        <h2 className="halana-title-sm">نصوص المعرض ولقطاته</h2>
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
      <StoreHalanaShareDesk
        shopToken={payload.shopToken}
        shopUrl={payload.shopUrl}
        orderUrl={payload.orderUrl}
        shopName={shopName}
      />
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
      <StoreDeskCornerDock>
        <StoreDeskGuideLink
          to={ROUTE_PATHS.STORE_HALANA_SUPPORT}
          leadAr={STORE_HALANA_SUPPORT.deskLeadAr}
          labelAr={STORE_HALANA_SUPPORT.landingCtaAr}
        />
        <StoreDeskHelpSupport product="halana" />
      </StoreDeskCornerDock>
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
