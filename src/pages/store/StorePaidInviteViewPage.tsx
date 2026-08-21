/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Download, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { STORE_PAID_INVITE_COPY, templateById } from '@/config/storeIssuedCardsCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { downloadPaidInviteCard, paidInviteCardFilename, renderPaidInviteCardPng } from '@/lib/storePaidInviteCard';
import { fetchIssuedCardPublic } from '@/lib/storeIssuedCardsRemote';
import {
  buildOccasionCardShareCaption,
  buildOccasionCardWhatsAppHref,
  occasionCardShareUrlFromToken,
} from '@/lib/storeOccasionCardShare';
import { STORE_LIVE_MARK_AR } from '@/config/storeLiveAtmosphere';

export default function StorePaidInviteViewPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [status, setStatus] = useState<string>('loading');
  const [card, setCard] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<'png' | 'share' | null>(null);
  useDocumentTitle(STORE_PAID_INVITE_COPY.documentTitle);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchIssuedCardPublic(token).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setStatus('missing');
        return;
      }
      setStatus(result.status);
      if (result.card) setCard(result.card as Record<string, string>);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const template = templateById(String(card.templateId || ''));
  const live = status === 'live';
  const shareUrl = useMemo(() => occasionCardShareUrlFromToken(token), [token]);
  const shareCaption = useMemo(
    () =>
      buildOccasionCardShareCaption({
        hostName: card.hostName || '',
        occasionLine: card.occasionLine || template?.titleAr || '',
        whenText: card.whenText,
        placeText: card.placeText,
        shareUrl,
      }),
    [card.hostName, card.occasionLine, card.whenText, card.placeText, shareUrl, template?.titleAr],
  );

  const cardPngInput = () => ({
    hostName: card.hostName || '',
    occasionLine: card.occasionLine || template?.titleAr || '',
    whenText: card.whenText || '',
    placeText: card.placeText || '',
    message: card.message || '',
    stamp: STORE_PAID_INVITE_COPY.stampAr,
  });

  const onDownload = async () => {
    if (!live) return;
    setBusy('png');
    try {
      const blob = await renderPaidInviteCardPng(cardPngInput());
      await downloadPaidInviteCard(blob, card.hostName || 'card');
      toast.success('تم تحميل البطاقة.');
    } catch {
      toast.error('تعذّر تحميل البطاقة. أعد المحاولة من المتصفح.');
    } finally {
      setBusy(null);
    }
  };

  const onShare = async () => {
    if (!live) return;
    setBusy('share');
    try {
      const blob = await renderPaidInviteCardPng(cardPngInput());
      const file = new File([blob], paidInviteCardFilename(card.hostName || 'card'), { type: 'image/png' });
      if (typeof navigator.share === 'function') {
        const withFile: ShareData = {
          title: card.occasionLine || STORE_PAID_INVITE_COPY.titleAr,
          text: shareCaption,
          url: shareUrl,
          files: [file],
        };
        if (typeof navigator.canShare !== 'function' || navigator.canShare(withFile)) {
          await navigator.share(withFile);
          toast.success('أُرسلت البطاقة.');
          return;
        }
        await navigator.share({ title: card.occasionLine || STORE_PAID_INVITE_COPY.titleAr, text: shareCaption, url: shareUrl });
        return;
      }
      window.open(buildOccasionCardWhatsAppHref(shareCaption), '_blank', 'noopener,noreferrer');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      window.open(buildOccasionCardWhatsAppHref(shareCaption), '_blank', 'noopener,noreferrer');
    } finally {
      setBusy(null);
    }
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('نُسخ رابط المشاركة.');
    } catch {
      toast.error('تعذّر نسخ الرابط.');
    }
  };

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      <main className="mx-auto max-w-lg px-4 py-16">
        {status === 'loading' ? <p className="text-center text-white/60">جاري فتح البطاقة…</p> : null}
        {status === 'missing' || status === 'revoked' ? (
          <p className="text-center text-white/70">هذا الرابط غير متاح.</p>
        ) : null}
        {status === 'pending_payment' ? (
          <p className="text-center text-white/70">البطاقة بانتظار إتمام الدفع عبر ميسر.</p>
        ) : null}
        {live ? (
          <>
            <p className="mb-4 text-center text-sm text-white/70">{STORE_PAID_INVITE_COPY.paidLiveHintAr}</p>
            <div className="rounded-3xl border border-[#e8c547]/30 bg-[#10222e] p-8 text-center">
              <p className="text-sm text-[#e8c547]">{card.occasionLine || template?.titleAr}</p>
              <p className="mt-4 text-3xl font-black">{card.hostName}</p>
              {card.whenText ? <p className="mt-4 text-sm">{card.whenText}</p> : null}
              {card.placeText ? <p className="mt-1 text-sm">{card.placeText}</p> : null}
              {card.message ? <p className="mt-6 text-sm leading-7 text-white/80">{card.message}</p> : null}
              <p className="mt-10 text-[11px] text-white/45">{STORE_PAID_INVITE_COPY.stampAr}</p>
            </div>
            <div className="mt-6 space-y-3">
              <Button
                type="button"
                disabled={busy !== null}
                onClick={() => void onShare()}
                className="w-full bg-[#e8c547] text-[#061018]"
              >
                <Share2 className="h-4 w-4" />
                {busy === 'share' ? 'جاري التجهيز…' : STORE_PAID_INVITE_COPY.shareCtaAr}
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-white/20 bg-transparent text-[#f4efe4]"
              >
                <a
                  href={buildOccasionCardWhatsAppHref(shareCaption)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  {STORE_PAID_INVITE_COPY.whatsappCtaAr}
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy !== null}
                onClick={() => void onDownload()}
                className="w-full border-white/20 bg-transparent text-[#f4efe4]"
              >
                <Download className="h-4 w-4" />
                {busy === 'png' ? 'جاري التحميل…' : STORE_PAID_INVITE_COPY.downloadCtaAr}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onCopyLink()}
                className="w-full border-white/20 bg-transparent text-[#f4efe4]"
              >
                <Copy className="h-4 w-4" />
                {STORE_PAID_INVITE_COPY.copyLinkCtaAr}
              </Button>
            </div>
          </>
        ) : null}
        <p className="store-live-mark mt-10 text-center">{STORE_LIVE_MARK_AR}</p>
      </main>
    </div>
  );
}
