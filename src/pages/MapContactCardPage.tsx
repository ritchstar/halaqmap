/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { ArrowRight, Download, MessageCircle, Share2 } from 'lucide-react';
import { MapContactCardPreview } from '@/components/mapContactCard/MapContactCardPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import {
  MAP_CONTACT_CARD_LEAD_AR,
  MAP_CONTACT_CARD_META,
  MAP_CONTACT_CARD_PRODUCT_NAME_AR,
  MAP_CONTACT_CITY_SEALS,
  MAP_CONTACT_ICON_OPTIONS,
  MAP_CONTACT_MESSAGE_TEMPLATES,
  MAP_CONTACT_PRIVACY_NOTE_AR,
  buildMapContactPartnerUrl,
  buildMapContactWhatsAppText,
} from '@/config/mapContactCardCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { downloadElementAsPngCard } from '@/lib/downloadElementAsPngCard';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const SITE_ORIGIN = 'https://www.halaqmap.com';

export default function MapContactCardPage() {
  useDocumentTitle(MAP_CONTACT_CARD_META.titleAr);

  const cardRef = useRef<HTMLDivElement>(null);
  const [alias, setAlias] = useState('زائر ماب');
  const [templateId, setTemplateId] = useState(MAP_CONTACT_MESSAGE_TEMPLATES[0].id);
  const [message, setMessage] = useState(MAP_CONTACT_MESSAGE_TEMPLATES[0].textAr);
  const [cityId, setCityId] = useState(MAP_CONTACT_CITY_SEALS[0].id);
  const [iconId, setIconId] = useState(MAP_CONTACT_ICON_OPTIONS[0].id);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<'save' | 'share' | null>(null);

  const city = MAP_CONTACT_CITY_SEALS.find((c) => c.id === cityId) ?? MAP_CONTACT_CITY_SEALS[0];
  const icon = MAP_CONTACT_ICON_OPTIONS.find((i) => i.id === iconId) ?? MAP_CONTACT_ICON_OPTIONS[0];

  const partnerUrl = useMemo(
    () => buildMapContactPartnerUrl(SITE_ORIGIN, city.id),
    [city.id],
  );

  const whatsappText = useMemo(
    () =>
      buildMapContactWhatsAppText({
        alias,
        message,
        cityNameAr: city.nameAr,
        partnerUrl,
      }),
    [alias, message, city.nameAr, partnerUrl],
  );

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(partnerUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: { dark: '#041016', light: '#ffffff' },
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
  }, [partnerUrl]);

  const applyTemplate = (id: string) => {
    const t = MAP_CONTACT_MESSAGE_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setTemplateId(t.id);
    setMessage(t.textAr);
  };

  const onSave = async () => {
    if (!cardRef.current) return;
    setBusy('save');
    try {
      await downloadElementAsPngCard(cardRef.current, `بطاقة-تواصل-ماب-${city.id}.png`);
      toast.success('تم حفظ البطاقة على جهازك');
    } catch {
      toast.error('تعذّر حفظ الصورة — جرّب متصفحاً آخر أو مشاركة واتساب');
    } finally {
      setBusy(null);
    }
  };

  const onWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const onShareLink = async () => {
    setBusy('share');
    try {
      if (navigator.share) {
        await navigator.share({
          title: MAP_CONTACT_CARD_PRODUCT_NAME_AR,
          text: whatsappText,
          url: partnerUrl,
        });
      } else {
        await navigator.clipboard.writeText(whatsappText);
        toast.success('نُسخ نص البطاقة — الصقه لصالونك');
      }
    } catch {
      /* المستخدم ألغى المشاركة */
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020912] text-slate-100" dir="rtl">
      <div className="border-b border-white/8 bg-[#041016]/90">
        <div className="container mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to={ROUTE_PATHS.HOME}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-300 hover:text-teal-200"
          >
            <ArrowRight className="h-4 w-4" />
            الرئيسية
          </Link>
          <p className="text-sm font-black text-white">{MAP_CONTACT_CARD_PRODUCT_NAME_AR}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <header className="mb-8 max-w-2xl">
          <p className="text-xs font-bold text-amber-300/90">طلب تواصل من زبون · بلا صور شخصية</p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {MAP_CONTACT_CARD_PRODUCT_NAME_AR}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            {MAP_CONTACT_CARD_LEAD_AR}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{MAP_CONTACT_PRIVACY_NOTE_AR}</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start">
          <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div>
              <Label htmlFor="mcc-alias" className="text-slate-300">
                اسم مستعار يظهر على البطاقة
              </Label>
              <Input
                id="mcc-alias"
                value={alias}
                maxLength={40}
                onChange={(e) => setAlias(e.target.value)}
                className="mt-1.5 border-white/15 bg-black/30"
                placeholder="مثال: زائر من الرياض"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-bold text-slate-300">قالب الرسالة</p>
              <div className="flex flex-wrap gap-2">
                {MAP_CONTACT_MESSAGE_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[0.72rem] font-bold transition',
                      templateId === t.id
                        ? 'border-teal-400/60 bg-teal-500/20 text-teal-100'
                        : 'border-white/12 bg-white/5 text-slate-400 hover:border-white/25',
                    )}
                  >
                    {t.labelAr}
                  </button>
                ))}
              </div>
              <Textarea
                value={message}
                maxLength={180}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-3 min-h-[100px] border-white/15 bg-black/30"
              />
              <p className="mt-1 text-[0.65rem] text-slate-500">{message.length}/180</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold text-slate-300">أيقونة البطاقة</p>
              <div className="flex flex-wrap gap-2">
                {MAP_CONTACT_ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIconId(opt.id)}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl border text-xl transition',
                      iconId === opt.id
                        ? 'border-teal-400/70 bg-teal-500/20'
                        : 'border-white/12 bg-white/5 hover:border-white/25',
                    )}
                    aria-label={opt.labelAr}
                    title={opt.labelAr}
                  >
                    {opt.glyph}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold text-slate-300">ختم المدينة</p>
              <div className="flex flex-wrap gap-2">
                {MAP_CONTACT_CITY_SEALS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCityId(c.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[0.72rem] font-bold transition',
                      cityId === c.id
                        ? 'border-amber-400/60 bg-amber-500/15 text-amber-100'
                        : 'border-white/12 bg-white/5 text-slate-400 hover:border-white/25',
                    )}
                  >
                    {c.nameAr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                onClick={onWhatsApp}
                className="bg-emerald-600 font-bold text-white hover:bg-emerald-500"
              >
                <MessageCircle className="h-4 w-4" />
                أرسل لصالوني (واتساب)
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onSave}
                disabled={busy === 'save'}
                className="font-bold"
              >
                <Download className="h-4 w-4" />
                {busy === 'save' ? 'جارٍ الحفظ…' : 'حفظ الصورة'}
              </Button>
              <Button type="button" variant="outline" onClick={onShareLink} className="font-bold">
                <Share2 className="h-4 w-4" />
                مشاركة / نسخ النص
              </Button>
            </div>

            <p className="text-[0.7rem] leading-relaxed text-slate-500">
              بعد الإرسال يظهر للصالون رابط انضمام/اهتمام مع{' '}
              <code className="rounded bg-white/10 px-1" dir="ltr">
                ref=map-contact-card
              </code>
              . المنصة ليست وسيط حجز — العلاقة مباشرة بينك وبين الصالون.
            </p>

            <Link
              to={ROUTE_PATHS.COVERAGE_SALON_NOMINATE}
              className="inline-block text-sm font-bold text-cyan-300 hover:text-cyan-200"
            >
              أو رشّح صالوناً لتغطية منطقتك ←
            </Link>
          </section>

          <aside className="lg:sticky lg:top-6">
            <MapContactCardPreview
              cardRef={cardRef}
              alias={alias}
              message={message}
              cityNameAr={city.nameAr}
              iconGlyph={icon.glyph}
              qrDataUrl={qrDataUrl}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
