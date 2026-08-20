/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import {
  STORE_PAID_INVITE_COPY,
  STORE_PAID_INVITE_FAMILIES,
  STORE_PAID_INVITE_PRICES_SAR,
  STORE_PAID_INVITE_TEMPLATES,
  priceSarForTemplate,
  templateById,
} from '@/config/storeIssuedCardsCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { hasValidStoreIssuedConsent } from '@/lib/storeIssuedCardsConsent';
import { createPaidInvitePending } from '@/lib/storeIssuedCardsRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-12 min-w-0 w-full border-white/15 bg-[#0b1a24] text-[16px] text-[#f4efe4] placeholder:text-white/35';

export default function StorePaidInviteStudioPage() {
  useDocumentTitle(STORE_PAID_INVITE_COPY.documentTitle);
  const navigate = useNavigate();
  const consented = hasValidStoreIssuedConsent('paid');

  const [templateId, setTemplateId] = useState(STORE_PAID_INVITE_TEMPLATES[0].id);
  const [hostName, setHostName] = useState('');
  const [occasionLine, setOccasionLine] = useState('');
  const [whenText, setWhenText] = useState('');
  const [placeText, setPlaceText] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const template = templateById(templateId);
  const price = priceSarForTemplate(templateId);

  const previewReady = hostName.trim().length >= 2 && template;

  const preview = useMemo(
    () => ({
      hostName: hostName.trim() || 'اسم صاحب المناسبة',
      occasionLine: occasionLine.trim() || template?.titleAr || '',
      whenText: whenText.trim(),
      placeText: placeText.trim(),
      message: message.trim(),
    }),
    [hostName, occasionLine, whenText, placeText, message, template],
  );

  if (!consented) {
    return <Navigate to={`${ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL}?track=paid`} replace />;
  }

  const onPublish = async () => {
    if (!previewReady || price == null) return;
    setBusy(true);
    const result = await createPaidInvitePending({
      templateId,
      hostName,
      occasionLine,
      whenText,
      placeText,
      message,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(typeof result.error === 'string' ? result.error : 'تعذر إنشاء طلب النشر');
      return;
    }
    const token = String(result.token || '');
    const payPath = String(result.payPath || `/pay/occasion-card/${token}`);
    window.location.assign(`https://www.halaqmap.com/#${payPath}`);
  };

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-bold text-[#e8c547]">{STORE_PAID_INVITE_COPY.kicker}</p>
          <h1 className="mt-2 text-3xl font-extrabold">{STORE_PAID_INVITE_COPY.titleAr}</h1>
          <p className="mt-3 text-sm leading-7 text-white/75">{STORE_PAID_INVITE_COPY.leadAr}</p>
          <p className="mt-2 text-xs text-white/50">
            سريعة {STORE_PAID_INVITE_PRICES_SAR.quick} · مميزة {STORE_PAID_INVITE_PRICES_SAR.featured} · فاخرة{' '}
            {STORE_PAID_INVITE_PRICES_SAR.luxury} ر.س. {STORE_PAID_INVITE_COPY.noPackAr}
          </p>

          <div className="mt-6 space-y-6">
            {STORE_PAID_INVITE_FAMILIES.map((family) => (
              <div key={family.id}>
                <p className="font-extrabold text-[#f4efe4]">{family.titleAr}</p>
                <p className="text-xs text-white/55">{family.leadAr}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {STORE_PAID_INVITE_TEMPLATES.filter((item) => item.family === family.id).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTemplateId(item.id)}
                      className={cn(
                        'rounded-xl border p-3 text-right',
                        templateId === item.id ? 'border-[#e8c547] bg-[#e8c547]/10' : 'border-white/12',
                      )}
                    >
                      <p className="font-bold">{item.titleAr}</p>
                      <p className="mt-1 text-xs text-white/60">{item.subtitleAr}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <Label htmlFor="host-name">اسم صاحب المناسبة</Label>
              <Input id="host-name" value={hostName} onChange={(e) => setHostName(e.target.value)} className={fieldClass} maxLength={80} />
            </div>
            <div>
              <Label htmlFor="occasion-line">سطر المناسبة</Label>
              <Input id="occasion-line" value={occasionLine} onChange={(e) => setOccasionLine(e.target.value)} className={fieldClass} maxLength={80} />
            </div>
            <div>
              <Label htmlFor="when-text">الوقت</Label>
              <Input id="when-text" value={whenText} onChange={(e) => setWhenText(e.target.value)} className={fieldClass} maxLength={80} />
            </div>
            <div>
              <Label htmlFor="place-text">المكان</Label>
              <Input id="place-text" value={placeText} onChange={(e) => setPlaceText(e.target.value)} className={fieldClass} maxLength={120} />
            </div>
            <div>
              <Label htmlFor="message">رسالة قصيرة</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={280} className="min-h-24 border-white/15 bg-[#0b1a24] text-[#f4efe4]" />
            </div>
          </div>

          <Button
            type="button"
            disabled={!previewReady || busy}
            onClick={() => void onPublish()}
            className="mt-6 w-full bg-[#e8c547] text-[#061018] hover:bg-[#f0d36a]"
          >
            {STORE_PAID_INVITE_COPY.payAtPublishAr}
            {price != null ? ` — ${price} ر.س` : ''}
          </Button>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            الدفع عبر ميسر على www.halaqmap.com. بعد نجاح الدفع يصبح الرابط حيّاً ولا يُسترد.
          </p>
          <Link to={`${ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL}?track=paid`} className="mt-3 inline-block text-xs text-white/50 underline">
            {STORE_PAID_INVITE_COPY.legalGateAr}
          </Link>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-[#0b1a24] p-6">
          <p className="text-xs text-white/50">معاينة مجانية</p>
          <div className="mt-4 min-h-[280px] rounded-2xl border border-[#e8c547]/30 bg-[#10222e] p-6 text-center">
            <p className="text-sm text-[#e8c547]">{preview.occasionLine}</p>
            <p className="mt-4 text-3xl font-black">{preview.hostName}</p>
            {preview.whenText ? <p className="mt-4 text-sm text-white/80">{preview.whenText}</p> : null}
            {preview.placeText ? <p className="mt-1 text-sm text-white/80">{preview.placeText}</p> : null}
            {preview.message ? <p className="mt-6 text-sm leading-7 text-white/75">{preview.message}</p> : null}
            <p className="mt-10 text-[11px] text-white/45">{STORE_PAID_INVITE_COPY.stampAr}</p>
          </div>
          <Button type="button" variant="ghost" className="mt-4 w-full text-white/70" onClick={() => navigate(ROUTE_PATHS.STORE_INVITES)}>
            {STORE_PAID_INVITE_COPY.createCtaAr}
          </Button>
        </aside>
      </main>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
