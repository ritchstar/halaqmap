/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * استوديو كروت واجهة المتجر — اسم وصفة ثم توليد بطاقة للمشاركة.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { Copy, Download, MessageCircle, Share2 } from 'lucide-react';
import { StoreGoldFrame } from '@/components/store/StoreGoldFrame';
import { StoreIntroCardPreview } from '@/components/store/StoreIntroCardPreview';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import {
  STORE_BRAND_LATIN,
  STORE_INTRO_CARD_COPY as COPY,
  STORE_INTRO_CARD_NAME_MAX,
  STORE_INTRO_CARD_ROLE_MAX,
  STORE_INTRO_CARD_ROLES,
  STORE_PUBLIC_NAME_AR,
  buildStoreIntroCardWhatsAppText,
  storeIntroCardLandingUrl,
  storeIntroCardPublicUrl,
} from '@/config/storeIntroCardCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import {
  buildStoreIntroCardFacebookHref,
  buildStoreIntroCardTelegramHref,
  buildStoreIntroCardWhatsAppHref,
  buildStoreIntroCardXHref,
  renderStoreIntroCardPng,
  sanitizeStoreIntroCardName,
  sanitizeStoreIntroCardRole,
  saveStoreIntroCardPng,
  shareStoreIntroCardNative,
  shouldPreferNativeShare,
  storeIntroCardFilename,
} from '@/lib/storeIntroCard';
import { encodeStoreIntroCardToken } from '@/lib/storeIntroCardShare';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type BusyKind = 'png' | 'share' | 'whatsapp' | null;

function initialCardField(kind: 'name' | 'role'): string {
  const fromQuery = kind === 'name' ? readHashQueryParam('n') : readHashQueryParam('r');
  return fromQuery || '';
}

export default function StoreIntroCardStudioPage() {
  useDocumentTitle(COPY.documentTitleStudio);

  const [name, setName] = useState(() => initialCardField('name'));
  const [role, setRole] = useState(() => initialCardField('role'));
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<BusyKind>(null);

  const displayName = sanitizeStoreIntroCardName(name);
  const displayRole = sanitizeStoreIntroCardRole(role);
  const ready = displayName.length >= 2 && displayRole.length >= 2;
  const shareToken = useMemo(
    () => (ready ? encodeStoreIntroCardToken(displayName, displayRole) : null),
    [ready, displayName, displayRole],
  );
  const landingUrl = useMemo(() => storeIntroCardLandingUrl(), []);
  const cardUrl = useMemo(
    () => (ready ? storeIntroCardPublicUrl(displayName, displayRole) : landingUrl),
    [ready, displayName, displayRole, landingUrl],
  );
  const whatsappText = useMemo(
    () =>
      buildStoreIntroCardWhatsAppText({
        name: displayName,
        role: displayRole,
        cardUrl,
      }),
    [displayName, displayRole, cardUrl],
  );

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    ProductEvents.storeIntroCardStudioView();
  }, []);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(landingUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 384,
      color: { dark: '#061018', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [landingUrl]);

  const requireReady = (): boolean => {
    if (ready) return true;
    toast.error(COPY.needFields);
    return false;
  };

  const makeBlob = async () =>
    renderStoreIntroCardPng({
      displayName,
      role: displayRole,
      qrDataUrl,
    });

  const onDownload = async () => {
    if (!requireReady()) return;
    setBusy('png');
    try {
      const blob = await makeBlob();
      const result = await saveStoreIntroCardPng({
        blob,
        shareTitle: STORE_PUBLIC_NAME_AR,
        shareText: whatsappText,
        preferShare: false,
      });
      if (!result.ok) {
        if (result.error !== 'cancelled') toast.error('تعذّر التحميل. جرّب من المتصفح مباشرة.');
        return;
      }
      ProductEvents.storeIntroCardShare({ method: 'download' });
      toast.success(result.method === 'open' ? COPY.downloadIosHint : COPY.downloadReady);
    } catch {
      toast.error('تعذّر التحميل. جرّب من المتصفح مباشرة.');
    } finally {
      setBusy(null);
    }
  };

  const onShare = async () => {
    if (!requireReady()) return;
    setBusy('share');
    try {
      const blob = await makeBlob();
      const file = new File([blob], storeIntroCardFilename(), { type: 'image/png' });
      const native = await shareStoreIntroCardNative({
        title: STORE_PUBLIC_NAME_AR,
        text: whatsappText,
        url: cardUrl,
        file,
      });
      if (native === 'shared') {
        ProductEvents.storeIntroCardShare({ method: 'native' });
        toast.success('جاهز من قائمة الجهاز.');
        return;
      }
      if (native === 'cancelled') return;
      const result = await saveStoreIntroCardPng({
        blob,
        shareTitle: STORE_PUBLIC_NAME_AR,
        shareText: whatsappText,
        preferShare: shouldPreferNativeShare(),
      });
      if (!result.ok) {
        if (result.error !== 'cancelled') toast.error('تعذّرت المشاركة. انسخ الرابط أو حمّل الصورة.');
        return;
      }
      ProductEvents.storeIntroCardShare({ method: result.method });
      toast.success(result.method === 'share' ? 'جاهز من قائمة الجهاز.' : 'تم تحميل الصورة.');
    } catch {
      toast.error('تعذّرت المشاركة. انسخ الرابط أو حمّل الصورة.');
    } finally {
      setBusy(null);
    }
  };

  const onCopyLink = async () => {
    if (!requireReady()) return;
    try {
      await navigator.clipboard.writeText(cardUrl);
      ProductEvents.storeIntroCardShare({ method: 'copy' });
      toast.success('نُسخ رابط البطاقة.');
    } catch {
      toast.error('تعذّر النسخ.');
    }
  };

  const onWhatsApp = async () => {
    if (!requireReady()) return;
    setBusy('whatsapp');
    try {
      const blob = await makeBlob();
      const file = new File([blob], storeIntroCardFilename(), { type: 'image/png' });
      const native = await shareStoreIntroCardNative({
        title: STORE_PUBLIC_NAME_AR,
        text: whatsappText,
        url: cardUrl,
        file,
      });
      if (native === 'shared') {
        ProductEvents.storeIntroCardShare({ method: 'whatsapp' });
        toast.success(COPY.whatsappReady);
        return;
      }
      if (native === 'cancelled') return;
      const result = await saveStoreIntroCardPng({
        blob,
        shareTitle: STORE_PUBLIC_NAME_AR,
        shareText: whatsappText,
        preferShare: false,
      });
      if (!result.ok && result.error !== 'cancelled') {
        toast.error('تعذّر تجهيز الصورة. انسخ الرابط أو حمّل الصورة.');
        return;
      }
      ProductEvents.storeIntroCardShare({ method: 'whatsapp' });
      window.open(buildStoreIntroCardWhatsAppHref(whatsappText), '_blank', 'noopener,noreferrer');
      toast.success(COPY.whatsappFallback);
    } catch {
      toast.error('تعذّر فتح واتساب. حمّل الصورة وأرفقها مع الرابط.');
    } finally {
      setBusy(null);
    }
  };

  const fieldClass =
    'h-12 min-w-0 w-full touch-manipulation border-[#e8c547]/25 bg-[#061018] text-[16px] leading-normal text-[#f4efe4]';
  const viewPath = (ROUTE_PATHS as { STORE_INTRO_CARD_VIEW?: string }).STORE_INTRO_CARD_VIEW || '/store/id-card';

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      <section className="border-b border-[#e8c547]/15 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-[#e8c547]">{COPY.studioKicker}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#f4efe4] md:text-4xl">
            {COPY.studioTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#f4efe4] md:text-lg">
            {COPY.studioLead}
          </p>
          <p dir="ltr" className="mt-2 text-xs font-bold tracking-wide text-[#e8c547]/80">
            {STORE_BRAND_LATIN}
          </p>
          <Link
            to={(ROUTE_PATHS as { STORE_MEET_QR?: string }).STORE_MEET_QR || '/store/qr'}
            className="mt-4 inline-flex text-sm font-bold text-[#e8c547]"
          >
            رمز المقابلة على الآيفون
          </Link>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start">
        <section className="space-y-5 rounded-2xl border border-[#e8c547]/20 bg-[#0c1a2e]/70 p-4 sm:p-5">
          <div>
            <Label htmlFor="store-intro-card-name" className="text-[#e8c547]">
              {COPY.nameLabel}
            </Label>
            <Input
              id="store-intro-card-name"
              value={name}
              maxLength={STORE_INTRO_CARD_NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              placeholder={COPY.namePlaceholder}
              autoComplete="name"
              className={cn('mt-1.5', fieldClass)}
              style={{ fontSize: 16 }}
            />
            <p className="mt-1 text-[0.65rem] text-[#e8c547]/70">
              {displayName.length}/{STORE_INTRO_CARD_NAME_MAX}
            </p>
          </div>

          <div>
            <Label htmlFor="store-intro-card-role" className="text-[#e8c547]">
              {COPY.roleLabel}
            </Label>
            <Input
              id="store-intro-card-role"
              value={role}
              maxLength={STORE_INTRO_CARD_ROLE_MAX}
              onChange={(e) => setRole(e.target.value)}
              placeholder={COPY.rolePlaceholder}
              className={cn('mt-1.5', fieldClass)}
              style={{ fontSize: 16 }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {STORE_INTRO_CARD_ROLES.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setRole(chip.labelAr)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[0.72rem] font-bold transition',
                    displayRole === chip.labelAr
                      ? 'border-[#e8c547]/70 bg-[#e8c547]/20 text-[#f4efe4]'
                      : 'border-[#e8c547]/20 bg-[#061018]/60 text-[#e8c547] hover:border-[#e8c547]/40',
                  )}
                >
                  {chip.labelAr}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[#f4efe4]/85">{COPY.generateHint}</p>
          <p className="text-xs leading-relaxed text-[#e8c547]/75">{COPY.privacyLine}</p>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              disabled={busy !== null}
              onClick={() => void onShare()}
              className="bg-gradient-to-l from-[#f4efe4] via-[#e8c547] to-[#b8860b] font-black text-[#061018] hover:opacity-95"
            >
              <Share2 className="h-4 w-4" />
              {busy === 'share' ? 'جاري التجهيز…' : COPY.shareCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void onDownload()}
              className="border-[#e8c547]/35 bg-transparent text-[#f4efe4]"
            >
              <Download className="h-4 w-4" />
              {busy === 'png' ? 'جاري التجهيز…' : COPY.downloadCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void onWhatsApp()}
              className="border-[#e8c547]/35 bg-transparent text-[#f4efe4]"
            >
              <MessageCircle className="h-4 w-4" />
              {busy === 'whatsapp' ? 'جاري التجهيز…' : COPY.whatsappCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void onCopyLink()}
              className="border-[#e8c547]/35 bg-transparent text-[#f4efe4]"
            >
              <Copy className="h-4 w-4" />
              {COPY.copyLinkCta}
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-bold text-[#e8c547]">
            <a
              href={ready ? buildStoreIntroCardFacebookHref(cardUrl) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(!ready && 'pointer-events-none opacity-50')}
              onClick={() => ready && ProductEvents.storeIntroCardShare({ method: 'facebook' })}
            >
              فيسبوك
            </a>
            <a
              href={ready ? buildStoreIntroCardXHref(whatsappText, cardUrl) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(!ready && 'pointer-events-none opacity-50')}
              onClick={() => ready && ProductEvents.storeIntroCardShare({ method: 'x' })}
            >
              منصة إكس
            </a>
            <a
              href={ready ? buildStoreIntroCardTelegramHref(whatsappText, cardUrl) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(!ready && 'pointer-events-none opacity-50')}
              onClick={() => ready && ProductEvents.storeIntroCardShare({ method: 'telegram' })}
            >
              تيليجرام
            </a>
            {shareToken ? (
              <Link to={`${viewPath}?c=${encodeURIComponent(shareToken)}`}>
                {COPY.openPreviewCta}
              </Link>
            ) : null}
          </div>
        </section>

        <aside className="lg:sticky lg:top-6">
          <p className="mb-3 text-center text-sm font-bold text-[#e8c547]">{COPY.previewHint}</p>
          <StoreGoldFrame>
            <StoreIntroCardPreview
              displayName={displayName}
              role={displayRole}
              qrDataUrl={qrDataUrl}
            />
          </StoreGoldFrame>
        </aside>
      </div>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
