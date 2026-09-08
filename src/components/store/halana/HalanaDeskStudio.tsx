/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * استوديو لوحة حلانا1 — تحرير + معاينة مباشرة.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ExternalLink, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import {
  STORE_HALANA_CAPTION_MAX,
  STORE_HALANA_DEFAULT_FLAVORS_AR,
  STORE_HALANA_DEFAULT_POLICY_AR,
  STORE_HALANA_GALLERY_MAX,
  STORE_HALANA_IMAGE_MAX_CHARS,
  STORE_HALANA_LIVE_ACCENT,
  STORE_HALANA_LIVE_COPY,
  STORE_HALANA_REQUEST_STATUSES,
  type StoreHalanaRequestStatus,
} from '@/config/storeHalanaLive';
import { STORE_HALANA_SUPPORT } from '@/config/storeProductSupport';
import { STORE_DIRECT_PAY_COPY } from '@/config/storeDirectPay';
import { STORE_SHOP_LOGO_COPY } from '@/config/storeShopLogo';
import { HalanaActivityShowcase } from '@/components/store/halana/HalanaActivityShowcase';
import { StoreDeskCornerDock } from '@/components/store/StoreDeskCornerNav';
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { StoreDirectPayDesk } from '@/components/store/StoreDirectPayDesk';
import { StoreHalanaShareDesk } from '@/components/store/StoreHalanaShareDesk';
import { StoreOpsSection } from '@/components/store/StoreOpsSection';
import { StoreShopLogoDesk } from '@/components/store/StoreShopLogoDesk';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { directPayCopyText } from '@/lib/storeDirectPay';
import {
  HALANA_GALLERY_KINDS,
  halanaGalleryKindLabel,
  normalizeHalanaGalleryKind,
  type HalanaGalleryKind,
} from '@/lib/storeHalanaGalleryKind';
import { postHalanaAction } from '@/lib/storeHalanaLiveRemote';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
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

export type HalanaGalleryItem = { id: string; caption: string; src: string; itemKind?: HalanaGalleryKind };

type HalanaPayDesk = {
  bankName: string;
  beneficiaryName: string;
  iban: string;
  cashRemainder: boolean;
  networkRemainder: boolean;
};

export type HalanaDeskPayload = {
  shopName: string;
  shopToken: string;
  shopUrl: string;
  orderUrl: string;
  logoSrc: string;
  flavorsAr: string;
  policyAr: string;
  quotesAr: string;
  whatsapp: string;
  gallery: HalanaGalleryItem[];
  readyLines: string;
  promoTitleAr: string;
  promoAr: string;
  youtubeUrls: string;
  acceptingOrders?: boolean;
  requests: RequestRow[];
  payDesk: HalanaPayDesk;
};

type DeskTab = 'edit' | 'preview';

function whatsappHref(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? `966${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text.slice(0, 1200))}`;
}

function HalanaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="halana-desk-field block">
      <span className="halana-desk-field__label">{label}</span>
      {children}
    </label>
  );
}

function DeskProgress({ shopName, logoSrc, galleryCount, textsReady }: {
  shopName: string;
  logoSrc: string;
  galleryCount: number;
  textsReady: boolean;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const steps = [
    { id: 'identity', label: copy.deskProgressIdentityAr, done: shopName.trim().length >= 2 },
    { id: 'gallery', label: copy.deskProgressContentAr, done: galleryCount > 0 },
    { id: 'texts', label: copy.deskProgressTextsAr, done: textsReady },
    { id: 'review', label: copy.deskProgressReviewAr, done: shopName.trim().length >= 2 && galleryCount > 0 },
  ] as const;

  return (
    <div className="halana-desk-progress" aria-label="تقدم الإعداد">
      {steps.map((step) => (
        <div key={step.id} className={cn('halana-desk-progress__step', step.done && 'halana-desk-progress__step--done')}>
          <span className="halana-desk-progress__dot" aria-hidden />
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function HalanaDeskHeader({
  shopName,
  logoSrc,
  acceptingOrders,
  busy,
  previewUrl,
  onToggleAccepting,
  onSave,
}: {
  shopName: string;
  logoSrc: string;
  acceptingOrders: boolean;
  busy: boolean;
  previewUrl: string;
  onToggleAccepting: () => void;
  onSave: () => void;
}) {
  const copy = STORE_HALANA_LIVE_COPY;

  return (
    <header className="halana-desk-header">
      <div className="halana-desk-header__row">
        <div className="halana-desk-header__brand min-w-0">
          <StoreShopLogoMark src={logoSrc} className="halana-desk-header__logo" />
          <div className="min-w-0">
            <p className="halana-desk-header__kicker">{copy.deskStudioTitleAr}</p>
            <h1 className="halana-desk-header__title truncate">{shopName || copy.titleAr}</h1>
          </div>
        </div>
        <div className="halana-desk-header__actions">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="halana-desk-btn halana-desk-btn--ghost inline-flex items-center gap-1.5"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            {copy.deskPreviewAr}
          </a>
          <button type="button" disabled={busy} onClick={onSave} className="halana-desk-btn halana-desk-btn--primary">
            حفظ التغييرات
          </button>
        </div>
      </div>
      <div className="halana-desk-header__availability">
        <button
          type="button"
          disabled={busy}
          onClick={onToggleAccepting}
          className={cn(
            'halana-desk-availability',
            acceptingOrders ? 'halana-desk-availability--open' : 'halana-desk-availability--paused',
          )}
        >
          <span className="halana-desk-availability__dot" aria-hidden />
          {acceptingOrders ? copy.deskAcceptingOnAr : copy.deskAcceptingOffAr}
        </button>
        <p className="halana-desk-header__hint">{copy.deskAcceptingHintAr}</p>
      </div>
    </header>
  );
}

function GalleryItemCard({
  item,
  busy,
  onSave,
  onRemove,
}: {
  item: HalanaGalleryItem;
  busy: boolean;
  onSave: (id: string, caption: string, itemKind: HalanaGalleryKind) => void;
  onRemove: (id: string) => void;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [caption, setCaption] = useState(item.caption);
  const [kind, setKind] = useState<HalanaGalleryKind>(normalizeHalanaGalleryKind(item.itemKind));

  useEffect(() => {
    setCaption(item.caption);
    setKind(normalizeHalanaGalleryKind(item.itemKind));
  }, [item.caption, item.id, item.itemKind]);

  return (
    <article className="halana-desk-gallery-card">
      <div className="halana-desk-gallery-card__media">
        <img src={item.src} alt={item.caption || copy.galleryTitleAr} loading="lazy" />
        <span className="halana-desk-gallery-card__badge">{halanaGalleryKindLabel(kind)}</span>
      </div>
      <HalanaField label={copy.galleryKindLabelAr}>
        <select className="halana-desk-input" value={kind} onChange={(e) => setKind(normalizeHalanaGalleryKind(e.target.value))}>
          {HALANA_GALLERY_KINDS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.labelAr}
            </option>
          ))}
        </select>
      </HalanaField>
      <HalanaField label={copy.galleryCaptionAr}>
        <textarea
          className="halana-desk-input min-h-16"
          maxLength={STORE_HALANA_CAPTION_MAX}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </HalanaField>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          className="halana-desk-btn halana-desk-btn--primary text-xs"
          onClick={() => onSave(item.id, caption, kind)}
        >
          {copy.galleryCaptionSaveAr}
        </button>
        <button type="button" disabled={busy} className="text-xs underline opacity-70" onClick={() => onRemove(item.id)}>
          {copy.galleryRemoveAr}
        </button>
      </div>
    </article>
  );
}

function GalleryUploadButton({
  busy,
  onPick,
}: {
  busy: boolean;
  onPick: (file: File) => void;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="halana-desk-upload-btn"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
        {copy.galleryPickImageAr}
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

function PreviewPhone({ children }: { children: ReactNode }) {
  return (
    <div className="halana-desk-preview">
      <p className="halana-desk-preview__label">{STORE_HALANA_LIVE_COPY.deskPreviewAr}</p>
      <div className="halana-desk-preview__frame">
        <div className="halana-desk-preview__screen">{children}</div>
      </div>
    </div>
  );
}

export function HalanaDeskStudio({
  token,
  payload,
  onSaved,
}: {
  token: string;
  payload: HalanaDeskPayload;
  onSaved: () => void;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [tab, setTab] = useState<DeskTab>('edit');
  const [shopName, setShopName] = useState(payload.shopName);
  const [logoSrc, setLogoSrc] = useState(payload.logoSrc);
  const [acceptingOrders, setAcceptingOrders] = useState(payload.acceptingOrders !== false);
  const [flavorsAr, setFlavorsAr] = useState(payload.flavorsAr || STORE_HALANA_DEFAULT_FLAVORS_AR);
  const [policyAr, setPolicyAr] = useState(payload.policyAr || STORE_HALANA_DEFAULT_POLICY_AR);
  const [quotesAr, setQuotesAr] = useState(payload.quotesAr);
  const [whatsapp, setWhatsapp] = useState(payload.whatsapp);
  const [readyLines, setReadyLines] = useState(payload.readyLines);
  const [promoTitleAr, setPromoTitleAr] = useState(payload.promoTitleAr);
  const [promoAr, setPromoAr] = useState(payload.promoAr);
  const [youtubeUrls, setYoutubeUrls] = useState(payload.youtubeUrls);
  const [busy, setBusy] = useState(false);
  const [uploadKind, setUploadKind] = useState<HalanaGalleryKind>('inspire');
  const gallery = payload.gallery || [];

  useEffect(() => {
    setShopName(payload.shopName);
    setLogoSrc(payload.logoSrc);
    setAcceptingOrders(payload.acceptingOrders !== false);
  }, [payload.shopName, payload.logoSrc, payload.acceptingOrders]);

  const previewPayload = useMemo(
    () => ({
      shopName,
      logoSrc,
      promoTitleAr,
      promoAr,
      flavorsAr,
      policyAr,
      quotesAr,
      gallery: gallery.map((item) => ({ ...item, itemKind: normalizeHalanaGalleryKind(item.itemKind) })),
      readyLines,
      youtubeUrls,
      acceptingOrders,
    }),
    [shopName, logoSrc, promoTitleAr, promoAr, flavorsAr, policyAr, quotesAr, gallery, readyLines, youtubeUrls, acceptingOrders],
  );

  const previewUrl = payload.shopUrl || (payload.shopToken ? `https://store.halaqmap.com/#/h/${encodeURIComponent(payload.shopToken)}` : '#');
  const previewToken = payload.shopToken || token;
  const textsReady = Boolean(promoTitleAr.trim() || promoAr.trim() || policyAr.trim());

  async function saveHost(patch: Record<string, unknown> = {}) {
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
      acceptingOrders,
      ...patch,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    if (res.acceptingOrdersSaved === false) {
      toast.message(copy.deskAcceptingPendingAr);
    } else {
      toast.success('حُفظت التغييرات.');
    }
    onSaved();
    return true;
  }

  async function onUpload(file: File) {
    if (busy) return;
    if (gallery.length >= STORE_HALANA_GALLERY_MAX) {
      toast.error(copy.galleryFullAr);
      return;
    }
    setBusy(true);
    try {
      let imageSrc = await compressImageFile(file, 900);
      if (imageSrc.length > STORE_HALANA_IMAGE_MAX_CHARS) imageSrc = await compressImageFile(file, 640);
      if (imageSrc.length > STORE_HALANA_IMAGE_MAX_CHARS) {
        toast.error('الصورة أكبر من حد العرض. جرّبي ملفاً أصغر.');
        return;
      }
      const res = await postHalanaAction({ action: 'add_gallery', token, imageSrc, caption: '', itemKind: uploadKind });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('ظهر العمل في المعاينة.');
      onSaved();
    } catch {
      toast.error('تعذر رفع الصورة.');
    } finally {
      setBusy(false);
    }
  }

  async function onSaveCaption(imageId: string, caption: string, itemKind: HalanaGalleryKind) {
    setBusy(true);
    const res = await postHalanaAction({
      action: 'update_gallery',
      token,
      imageId,
      caption: caption.slice(0, STORE_HALANA_CAPTION_MAX),
      itemKind,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('حُفظ العمل.');
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

  const editor = (
    <div className="halana-desk-editor space-y-6">
      <p className="halana-desk-lead">{copy.deskStudioLeadAr}</p>
      <DeskProgress shopName={shopName} logoSrc={logoSrc} galleryCount={gallery.length} textsReady={textsReady} />

      <StoreOpsSection titleAr={STORE_SHOP_LOGO_COPY.sectionAr} accent={STORE_HALANA_LIVE_ACCENT} defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          <HalanaField label={copy.shopNameLabelAr}>
            <input className="halana-desk-input" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </HalanaField>
          <StoreShopLogoDesk logoSrc={logoSrc} onChange={setLogoSrc} accent={STORE_HALANA_LIVE_ACCENT} leadAr={copy.logoLeadAr} />
        </div>
      </StoreOpsSection>

      <StoreOpsSection titleAr={copy.galleryDeskTitleAr} accent={STORE_HALANA_LIVE_ACCENT} defaultOpen>
        <p className="mb-4 text-sm leading-7 text-[#4a3a32]/85">{copy.galleryDeskLeadAr}</p>
        <p className="mb-3 text-sm font-bold text-[#4a3a32]">{copy.galleryCountAr(gallery.length, STORE_HALANA_GALLERY_MAX)}</p>
        <HalanaField label={copy.galleryKindLabelAr}>
          <select className="halana-desk-input" value={uploadKind} onChange={(e) => setUploadKind(normalizeHalanaGalleryKind(e.target.value))}>
            {HALANA_GALLERY_KINDS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.labelAr}
              </option>
            ))}
          </select>
        </HalanaField>
        <p className="mt-1 text-xs leading-6 text-[#4a3a32]/70">{HALANA_GALLERY_KINDS.find((k) => k.id === uploadKind)?.hintAr}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <GalleryUploadButton busy={busy} onPick={(file) => void onUpload(file)} />
          <p className="text-sm leading-7 text-[#4a3a32]/75">{copy.galleryUploadHintAr}</p>
        </div>
        {gallery.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {gallery.map((item) => (
              <GalleryItemCard key={item.id} item={item} busy={busy} onSave={(id, cap, kind) => void onSaveCaption(id, cap, kind)} onRemove={(id) => void onRemove(id)} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#4a3a32]/70">{copy.galleryEmptyAr}</p>
        )}
      </StoreOpsSection>

      <StoreOpsSection titleAr="نصوص المعرض والتوفر" accent={STORE_HALANA_LIVE_ACCENT}>
        <HalanaField label={copy.promoTitleLabelAr}>
          <input className="halana-desk-input" value={promoTitleAr} onChange={(e) => setPromoTitleAr(e.target.value)} />
        </HalanaField>
        <HalanaField label={copy.promoBodyLabelAr}>
          <textarea className="halana-desk-input min-h-28" value={promoAr} onChange={(e) => setPromoAr(e.target.value)} />
        </HalanaField>
        <HalanaField label={copy.youtubeLabelAr}>
          <textarea className="halana-desk-input min-h-24" dir="ltr" value={youtubeUrls} onChange={(e) => setYoutubeUrls(e.target.value)} />
        </HalanaField>
        <HalanaField label="واتساب التشغيل">
          <input className="halana-desk-input" dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </HalanaField>
        <HalanaField label="النكهات، سطراً لكل نكهة">
          <textarea className="halana-desk-input min-h-24" value={flavorsAr} onChange={(e) => setFlavorsAr(e.target.value)} />
        </HalanaField>
        <HalanaField label="آراء تظهرها للمتصفحة">
          <textarea className="halana-desk-input min-h-20" value={quotesAr} onChange={(e) => setQuotesAr(e.target.value)} />
        </HalanaField>
        <HalanaField label="سياسة الطلب المسبق">
          <textarea className="halana-desk-input min-h-24" value={policyAr} onChange={(e) => setPolicyAr(e.target.value)} />
        </HalanaField>
        <HalanaField label="جاهز لتاريخ معيّن، سطراً لكل صنف">
          <textarea className="halana-desk-input min-h-20" value={readyLines} onChange={(e) => setReadyLines(e.target.value)} />
        </HalanaField>
      </StoreOpsSection>

      <StoreOpsSection titleAr={STORE_DIRECT_PAY_COPY.titleAr} accent={STORE_HALANA_LIVE_ACCENT}>
        <StoreDirectPayDesk product="store_halana_live" token={token} accent={STORE_HALANA_LIVE_ACCENT} onSaved={onSaved} />
      </StoreOpsSection>

      <StoreOpsSection titleAr={copy.shareTitleAr} accent={STORE_HALANA_LIVE_ACCENT}>
        <StoreHalanaShareDesk
          shopToken={payload.shopToken}
          shopUrl={payload.shopUrl}
          orderUrl={payload.orderUrl}
          shopName={shopName}
          variant="desk"
        />
      </StoreOpsSection>

      <StoreOpsSection titleAr="الطلبات" accent={STORE_HALANA_LIVE_ACCENT}>
        {(payload.requests || []).length === 0 ? (
          <p className="text-sm leading-8 text-[#4a3a32]/70">لا طلبات بعد.</p>
        ) : (
          <ul className="space-y-3">
            {(payload.requests || []).map((row) => (
              <li key={row.id} className="halana-desk-card rounded-2xl p-4 text-sm leading-7">
                <DeskRequestRow row={row} busy={busy} whatsapp={payload.whatsapp} payDesk={payload.payDesk} onUpdate={updateRequest} />
              </li>
            ))}
          </ul>
        )}
      </StoreOpsSection>

      <StoreDeskCornerDock>
        <StoreDeskGuideLink to={ROUTE_PATHS.STORE_HALANA_SUPPORT} leadAr={STORE_HALANA_SUPPORT.deskLeadAr} labelAr={STORE_HALANA_SUPPORT.landingCtaAr} />
        <StoreDeskHelpSupport product="halana" />
      </StoreDeskCornerDock>
    </div>
  );

  return (
    <div className="halana-desk-studio">
      <HalanaDeskHeader
        shopName={shopName}
        logoSrc={logoSrc}
        acceptingOrders={acceptingOrders}
        busy={busy}
        previewUrl={previewUrl}
        onToggleAccepting={() => {
          const next = !acceptingOrders;
          setAcceptingOrders(next);
          void saveHost({ acceptingOrders: next });
        }}
        onSave={() => void saveHost()}
      />

      <div className="halana-desk-tabs lg:hidden">
        <button type="button" className={cn('halana-desk-tabs__btn', tab === 'edit' && 'halana-desk-tabs__btn--active')} onClick={() => setTab('edit')}>
          {copy.deskEditTabAr}
        </button>
        <button type="button" className={cn('halana-desk-tabs__btn', tab === 'preview' && 'halana-desk-tabs__btn--active')} onClick={() => setTab('preview')}>
          {copy.deskPreviewTabAr}
        </button>
      </div>

      <div className="halana-desk-studio__grid">
        <div className={cn('halana-desk-studio__editor', tab !== 'edit' && 'hidden lg:block')}>{editor}</div>
        <div className={cn('halana-desk-studio__preview-pane', tab !== 'preview' && 'hidden lg:block')}>
          <PreviewPhone>
            <HalanaActivityShowcase token={previewToken} payload={previewPayload} preview />
          </PreviewPhone>
        </div>
      </div>
    </div>
  );
}

function DeskRequestRow({
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
  const message = [`طلب حلانا1: ${row.sweet_type}`, `العدد: ${row.quantity}`, `الوصول: ${row.deliver_at}`, row.quote_amount_sar ? `العرض: ${row.quote_amount_sar} ر.س` : '', payText]
    .filter(Boolean)
    .join('\n');

  return (
    <>
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
      {row.proof_src ? <img src={row.proof_src} alt={copy.payProofAr} className="mt-2 max-h-40 rounded-xl object-cover" /> : null}
      <div className="mt-3 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <HalanaField label="مبلغ العرض">
            <input className="halana-desk-input" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </HalanaField>
          <HalanaField label="ملاحظة السعر">
            <input className="halana-desk-input" value={note} onChange={(e) => setNote(e.target.value)} />
          </HalanaField>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void onUpdate(row, 'quoted', { quoteAmountSar: amount, quoteNote: note })} className="halana-desk-btn halana-desk-btn--primary text-xs">
            {copy.quoteCtaAr}
          </button>
          <button type="button" disabled={busy} onClick={() => void onUpdate(row, 'awaiting_deposit')} className="halana-desk-btn halana-desk-btn--ghost text-xs">
            بانتظار العربون
          </button>
          <button type="button" disabled={busy} onClick={() => void onUpdate(row, 'confirmed')} className="halana-desk-btn halana-desk-btn--ghost text-xs">
            {copy.depositCtaAr}
          </button>
          {STORE_HALANA_REQUEST_STATUSES.filter((s) => s === 'preparing' || s === 'ready' || s === 'completed' || s === 'declined').map((status) => (
            <button key={status} type="button" disabled={busy} onClick={() => void onUpdate(row, status)} className="halana-desk-btn halana-desk-btn--ghost text-xs">
              {copy.statusAr[status]}
            </button>
          ))}
          {row.guest_whatsapp || whatsapp ? (
            <a className="halana-desk-btn halana-desk-btn--ghost text-xs" href={whatsappHref(row.guest_whatsapp || whatsapp, message)} target="_blank" rel="noreferrer">
              {copy.whatsappCtaAr}
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}
