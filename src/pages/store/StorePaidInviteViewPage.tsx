/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { STORE_PAID_INVITE_COPY, templateById } from '@/config/storeIssuedCardsCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { downloadPaidInviteCard, renderPaidInviteCardPng } from '@/lib/storePaidInviteCard';
import { fetchIssuedCardPublic } from '@/lib/storeIssuedCardsRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StorePaidInviteViewPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [status, setStatus] = useState<string>('loading');
  const [card, setCard] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
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

  const onDownload = async () => {
    if (!live) return;
    setBusy(true);
    try {
      const blob = await renderPaidInviteCardPng({
        hostName: card.hostName || '',
        occasionLine: card.occasionLine || template?.titleAr || '',
        whenText: card.whenText || '',
        placeText: card.placeText || '',
        message: card.message || '',
        stamp: STORE_PAID_INVITE_COPY.stampAr,
      });
      await downloadPaidInviteCard(blob, card.hostName || 'card');
      toast.success('تم تحميل البطاقة.');
    } catch {
      toast.error('تعذّر تحميل البطاقة. أعد المحاولة من المتصفح.');
    } finally {
      setBusy(false);
    }
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
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
                disabled={busy}
                onClick={() => void onDownload()}
                className="w-full bg-[#e8c547] text-[#061018]"
              >
                {busy ? 'جاري التحميل…' : STORE_PAID_INVITE_COPY.downloadCtaAr}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onCopyLink()}
                className="w-full border-white/20 bg-transparent text-[#f4efe4]"
              >
                {STORE_PAID_INVITE_COPY.copyLinkCtaAr}
              </Button>
            </div>
          </>
        ) : null}
        <Link to={ROUTE_PATHS.STORE_INVITES} className="mt-8 block text-center">
          <Button variant={live ? 'ghost' : 'default'} className={live ? 'text-white/70' : 'bg-[#e8c547] text-[#061018]'}>
            {STORE_PAID_INVITE_COPY.createCtaAr}
          </Button>
        </Link>
      </main>
    </div>
  );
}
