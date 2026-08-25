/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * استوديو كروت كوافير ماب — اسم وصفة ثم توليد بطاقة للمشاركة.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { Copy, Download, MessageCircle, Share2 } from 'lucide-react';
import { CoiffeurIntroCardPreview } from '@/components/coiffeur/CoiffeurIntroCardPreview';
import { CoiffeurGlowFrame } from '@/components/coiffeur/CoiffeurGlowFrame';
import {
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_CARD_NAME_MAX,
  COIFFEUR_CARD_ROLE_CHIPS,
  COIFFEUR_CARD_ROLE_MAX,
  COIFFEUR_INTRO_CARD_COPY as COPY,
  buildCoiffeurCardWhatsAppText,
  coiffeurCardLandingUrl,
  coiffeurCardPublicUrl,
  isCoiffeurMarketingLeadRole,
} from '@/config/coiffeurIntroCardCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import {
  buildCoiffeurCardFacebookHref,
  buildCoiffeurCardTelegramHref,
  buildCoiffeurCardWhatsAppHref,
  buildCoiffeurCardXHref,
  coiffeurIntroCardFilename,
  renderCoiffeurIntroCardPng,
  sanitizeCoiffeurCardName,
  sanitizeCoiffeurCardRole,
  saveCoiffeurIntroCardPng,
  shareCoiffeurIntroCardNative,
  shouldPreferNativeShare,
} from '@/lib/coiffeurIntroCard';
import { encodeCoiffeurCardToken } from '@/lib/coiffeurCardShare';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type BusyKind = 'png' | 'share' | 'whatsapp' | null;

function initialCardField(kind: 'name' | 'role'): string {
  const fromQuery = kind === 'name' ? readHashQueryParam('n') : readHashQueryParam('r');
  return fromQuery || '';
}

export default function CoiffeurCardStudioPage() {
  useDocumentTitle(COPY.documentTitleStudio);

  const [name, setName] = useState(() => initialCardField('name'));
  const [role, setRole] = useState(() => initialCardField('role'));
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<BusyKind>(null);

  const displayName = sanitizeCoiffeurCardName(name);
  const displayRole = sanitizeCoiffeurCardRole(role);
  const ready = displayName.length >= 2 && displayRole.length >= 2;
  const shareToken = useMemo(
    () => (ready ? encodeCoiffeurCardToken(displayName, displayRole) : null),
    [ready, displayName, displayRole],
  );
  const landingUrl = useMemo(() => coiffeurCardLandingUrl(), []);
  const cardUrl = useMemo(
    () => (ready ? coiffeurCardPublicUrl(displayName, displayRole) : landingUrl),
    [ready, displayName, displayRole, landingUrl],
  );
  const whatsappText = useMemo(
    () =>
      buildCoiffeurCardWhatsAppText({
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
    ProductEvents.coiffeurCardStudioView();
  }, []);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(landingUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 384,
      color: { dark: '#14080e', light: '#ffffff' },
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
    renderCoiffeurIntroCardPng({
      displayName,
      role: displayRole,
      qrDataUrl,
    });

  const onDownload = async () => {
    if (!requireReady()) return;
    setBusy('png');
    try {
      const blob = await makeBlob();
      const result = await saveCoiffeurIntroCardPng({
        blob,
        shareTitle: COIFFEUR_BRAND_AR,
        shareText: whatsappText,
        preferShare: false,
      });
      if (!result.ok) {
        if (result.error !== 'cancelled') toast.error('تعذّر التحميل. جرّبي من المتصفح مباشرة.');
        return;
      }
      ProductEvents.coiffeurCardShare({ method: 'download' });
      toast.success('تم تجهيز الصورة.');
    } catch {
      toast.error('تعذّر التحميل. جرّبي من المتصفح مباشرة.');
    } finally {
      setBusy(null);
    }
  };

  const onShare = async () => {
    if (!requireReady()) return;
    setBusy('share');
    try {
      const blob = await makeBlob();
      const file = new File([blob], coiffeurIntroCardFilename(), { type: 'image/png' });
      const native = await shareCoiffeurIntroCardNative({
        title: COIFFEUR_BRAND_AR,
        text: whatsappText,
        url: cardUrl,
        file,
      });
      if (native === 'shared') {
        ProductEvents.coiffeurCardShare({ method: 'native' });
        toast.success('جاهز من قائمة الجهاز.');
        return;
      }
      if (native === 'cancelled') return;
      const result = await saveCoiffeurIntroCardPng({
        blob,
        shareTitle: COIFFEUR_BRAND_AR,
        shareText: whatsappText,
        preferShare: shouldPreferNativeShare(),
      });
      if (!result.ok) {
        if (result.error !== 'cancelled') toast.error('تعذّرت المشاركة. انسخي الرابط أو حمّلي الصورة.');
        return;
      }
      ProductEvents.coiffeurCardShare({ method: result.method });
      toast.success(result.method === 'share' ? 'جاهز من قائمة الجهاز.' : 'تم تحميل الصورة.');
    } catch {
      toast.error('تعذّرت المشاركة. انسخي الرابط أو حمّلي الصورة.');
    } finally {
      setBusy(null);
    }
  };

  const onCopyLink = async () => {
    if (!requireReady()) return;
    try {
      await navigator.clipboard.writeText(cardUrl);
      ProductEvents.coiffeurCardShare({ method: 'copy' });
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
      const file = new File([blob], coiffeurIntroCardFilename(), { type: 'image/png' });
      const native = await shareCoiffeurIntroCardNative({
        title: COIFFEUR_BRAND_AR,
        text: whatsappText,
        url: cardUrl,
        file,
      });
      if (native === 'shared') {
        ProductEvents.coiffeurCardShare({ method: 'whatsapp' });
        toast.success(COPY.whatsappReady);
        return;
      }
      if (native === 'cancelled') return;
      const result = await saveCoiffeurIntroCardPng({
        blob,
        shareTitle: COIFFEUR_BRAND_AR,
        shareText: whatsappText,
        preferShare: false,
      });
      if (!result.ok && result.error !== 'cancelled') {
        toast.error('تعذّر تجهيز الصورة. انسخي الرابط أو حمّلي الصورة.');
        return;
      }
      ProductEvents.coiffeurCardShare({ method: 'whatsapp' });
      window.open(buildCoiffeurCardWhatsAppHref(whatsappText), '_blank', 'noopener,noreferrer');
      toast.success(COPY.whatsappFallback);
    } catch {
      toast.error('تعذّر فتح واتساب. حمّلي الصورة وأرفقيها مع الرابط.');
    } finally {
      setBusy(null);
    }
  };

  const fieldClass =
    'h-12 min-w-0 w-full touch-manipulation border-[#f4d4c0]/25 bg-[#14080e] text-[16px] leading-normal text-[#f7efe8]';
  const marketingLead = isCoiffeurMarketingLeadRole(displayRole);

  return (
    <CoiffeurVisitorShell withMobileDock={false}>
      <CoiffeurVisitorHeader brandTo={ROUTE_PATHS.COIFFEUR_LANDING} sticky={false} />

      <section className="border-b border-rose-200/10 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-[#f4d4c0]">{COPY.studioKicker}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#f7efe8] md:text-4xl">
            {COPY.studioTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#f7efe8] md:text-lg">
            {marketingLead ? COPY.studioLeadMarketing : COPY.studioLead}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start">
        <section className="space-y-5 rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218]/55 p-4 sm:p-5">
          <div>
            <Label htmlFor="coiffeur-card-name" className="text-[#f4d4c0]">
              {COPY.nameLabel}
            </Label>
            <Input
              id="coiffeur-card-name"
              value={name}
              maxLength={COIFFEUR_CARD_NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              placeholder={COPY.namePlaceholder}
              autoComplete="name"
              className={cn('mt-1.5', fieldClass)}
              style={{ fontSize: 16 }}
            />
            <p className="mt-1 text-[0.65rem] text-[#f4d4c0]/70">
              {displayName.length}/{COIFFEUR_CARD_NAME_MAX}
            </p>
          </div>

          <div>
            <Label htmlFor="coiffeur-card-role" className="text-[#f4d4c0]">
              {COPY.roleLabel}
            </Label>
            <Input
              id="coiffeur-card-role"
              value={role}
              maxLength={COIFFEUR_CARD_ROLE_MAX}
              onChange={(e) => setRole(e.target.value)}
              placeholder={COPY.rolePlaceholder}
              className={cn('mt-1.5', fieldClass)}
              style={{ fontSize: 16 }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {COIFFEUR_CARD_ROLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setRole(chip)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[0.72rem] font-bold transition',
                    displayRole === chip
                      ? 'border-[#f4d4c0]/70 bg-[#f4d4c0]/20 text-[#f7efe8]'
                      : 'border-[#f4d4c0]/20 bg-[#14080e]/60 text-[#f4d4c0] hover:border-[#f4d4c0]/40',
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[#f7efe8]/85">{COPY.generateHint}</p>
          <p className="text-xs leading-relaxed text-[#f4d4c0]/75">{COPY.privacyLine}</p>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              disabled={busy !== null}
              onClick={() => void onShare()}
              className="bg-gradient-to-l from-[#f7efe8] via-[#f4d4c0] to-[#c98b96] font-black text-[#2a1218] hover:opacity-95"
            >
              <Share2 className="h-4 w-4" />
              {busy === 'share' ? 'جاري التجهيز…' : COPY.shareCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void onDownload()}
              className="border-[#f4d4c0]/35 bg-transparent text-[#f7efe8]"
            >
              <Download className="h-4 w-4" />
              {busy === 'png' ? 'جاري التجهيز…' : COPY.downloadCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void onWhatsApp()}
              className="border-[#f4d4c0]/35 bg-transparent text-[#f7efe8]"
            >
              <MessageCircle className="h-4 w-4" />
              {busy === 'whatsapp' ? 'جاري التجهيز…' : COPY.whatsappCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void onCopyLink()}
              className="border-[#f4d4c0]/35 bg-transparent text-[#f7efe8]"
            >
              <Copy className="h-4 w-4" />
              {COPY.copyLinkCta}
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-bold text-[#f4d4c0]">
            <a
              href={ready ? buildCoiffeurCardFacebookHref(cardUrl) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(!ready && 'pointer-events-none opacity-50')}
              onClick={() => ready && ProductEvents.coiffeurCardShare({ method: 'facebook' })}
            >
              فيسبوك
            </a>
            <a
              href={ready ? buildCoiffeurCardXHref(whatsappText, cardUrl) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(!ready && 'pointer-events-none opacity-50')}
              onClick={() => ready && ProductEvents.coiffeurCardShare({ method: 'x' })}
            >
              منصة إكس
            </a>
            <a
              href={ready ? buildCoiffeurCardTelegramHref(whatsappText, cardUrl) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(!ready && 'pointer-events-none opacity-50')}
              onClick={() => ready && ProductEvents.coiffeurCardShare({ method: 'telegram' })}
            >
              تيليجرام
            </a>
            {shareToken ? (
              <Link to={`${ROUTE_PATHS.COIFFEUR_CARD_VIEW}?c=${encodeURIComponent(shareToken)}`}>
                {COPY.openPreviewCta}
              </Link>
            ) : null}
          </div>
        </section>

        <aside className="lg:sticky lg:top-6">
          <p className="mb-3 text-center text-sm font-bold text-[#f4d4c0]">{COPY.previewHint}</p>
          <CoiffeurGlowFrame>
            <CoiffeurIntroCardPreview
              displayName={displayName}
              role={displayRole}
              qrDataUrl={qrDataUrl}
            />
          </CoiffeurGlowFrame>
        </aside>
      </div>

      <CoiffeurVisitorFooter showPartnersLater showInterest />
    </CoiffeurVisitorShell>
  );
}
