/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  ArrowRight,
  BookmarkPlus,
  Copy,
  Download,
  MessageCircle,
  Share2,
  Star,
} from 'lucide-react';
import { MapContactCardPreview } from '@/components/mapContactCard/MapContactCardPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { getSiteOrigin } from '@/config/siteOrigin';
import {
  MAP_CONTACT_CARD_FAVORITE_SAVED_AR,
  MAP_CONTACT_CARD_KEEP_HINT_AR,
  MAP_CONTACT_CARD_LEAD_AR,
  MAP_CONTACT_CARD_META,
  MAP_CONTACT_CARD_PRODUCT_NAME_AR,
  MAP_CONTACT_CARD_DOWNLOAD_HINT_AR,
  MAP_CONTACT_CITY_SEALS,
  MAP_CONTACT_ICON_OPTIONS,
  MAP_CONTACT_MESSAGE_TEMPLATES,
  MAP_CONTACT_PRIVACY_NOTE_AR,
  buildMapContactPartnerUrl,
  buildMapContactWhatsAppText,
} from '@/config/mapContactCardCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  clearMapContactCardFavorite,
  loadMapContactCardFavorite,
  saveMapContactCardFavorite,
} from '@/lib/mapContactCardFavoriteStorage';
import {
  mapContactCardPngFile,
  saveMapContactCardPng,
  type MapContactCardPngInput,
} from '@/lib/mapContactCardPng';
import {
  buildMapContactFacebookShareHref,
  buildMapContactTelegramShareHref,
  buildMapContactWhatsAppHref,
  buildMapContactXShareHref,
  canNativeShareFiles,
  shareMapContactCardNative,
} from '@/lib/mapContactCardShare';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { isValidSaudiWhatsAppMobile } from '@/lib/saudiWhatsAppPhone';
import { cn } from '@/lib/utils';

type BusyKind = 'save' | 'share' | 'snap' | null;

function cardFilename(cityId: string): string {
  return `halaqmap-contact-card-${cityId || 'sa'}.png`;
}

export default function MapContactCardPage() {
  useDocumentTitle(MAP_CONTACT_CARD_META.titleAr);

  const cardRef = useRef<HTMLDivElement>(null);
  const [alias, setAlias] = useState('زائر ماب');
  const [templateId, setTemplateId] = useState<string>(MAP_CONTACT_MESSAGE_TEMPLATES[0].id);
  const [message, setMessage] = useState<string>(MAP_CONTACT_MESSAGE_TEMPLATES[0].textAr);
  const [cityId, setCityId] = useState<string>(MAP_CONTACT_CITY_SEALS[0].id);
  const [iconId, setIconId] = useState<string>(MAP_CONTACT_ICON_OPTIONS[0].id);
  const [favoriteBarberPhone, setFavoriteBarberPhone] = useState('');
  const [hasFavorite, setHasFavorite] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<BusyKind>(null);
  const [hydrated, setHydrated] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const closePreview = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const city = MAP_CONTACT_CITY_SEALS.find((c) => c.id === cityId) ?? MAP_CONTACT_CITY_SEALS[0];
  const icon = MAP_CONTACT_ICON_OPTIONS.find((i) => i.id === iconId) ?? MAP_CONTACT_ICON_OPTIONS[0];
  const siteOrigin = getSiteOrigin();

  const partnerUrl = useMemo(
    () => buildMapContactPartnerUrl(siteOrigin, city.id),
    [siteOrigin, city.id],
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
    const fav = loadMapContactCardFavorite();
    if (fav) {
      setAlias(fav.alias);
      setTemplateId(fav.templateId || MAP_CONTACT_MESSAGE_TEMPLATES[0].id);
      setMessage(fav.message);
      setCityId(fav.cityId);
      setIconId(fav.iconId);
      setFavoriteBarberPhone(fav.favoriteBarberPhone ?? '');
      setHasFavorite(true);
    }
    setHydrated(true);
  }, []);

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

  const persistFavorite = (opts?: { toastOnSave?: boolean }) => {
    saveMapContactCardFavorite({
      alias,
      templateId,
      message,
      cityId,
      iconId,
      favoriteBarberPhone: favoriteBarberPhone.trim() || undefined,
    });
    setHasFavorite(true);
    if (opts?.toastOnSave) {
      toast.success(MAP_CONTACT_CARD_FAVORITE_SAVED_AR);
    }
  };

  const onClearFavorite = () => {
    clearMapContactCardFavorite();
    setHasFavorite(false);
    toast.message('أُزيلت البطاقة المفضلة من هذا الجهاز');
  };

  const pngInput = (): MapContactCardPngInput => ({
    alias,
    message,
    cityNameAr: city.nameAr,
    iconGlyph: icon.glyph,
    qrDataUrl,
  });

  const onDownload = async () => {
    setBusy('save');
    try {
      const result = await saveMapContactCardPng(pngInput(), cardFilename(city.id), {
        preferShareOnMobile: true,
        openPreview: (url) => setPreviewUrl(url),
      });
      if (!result.ok) {
        if (result.error === 'cancelled') return;
        toast.error('تعذّر تحميل الصورة — جرّب «سناب / تطبيقات» أو واتساب');
        return;
      }
      persistFavorite();
      if (result.method === 'share') {
        toast.success('اختر «حفظ الصورة» أو التطبيق من قائمة المشاركة');
      } else if (result.method === 'preview') {
        toast.message('اضغط مطولاً على الصورة لحفظها في الاستوديو');
      } else {
        toast.success('تم تحميل بطاقتك — احتفظ بها في الاستوديو');
      }
    } catch {
      toast.error('تعذّر تحميل الصورة — جرّب متصفحاً آخر أو مشاركة واتساب');
    } finally {
      setBusy(null);
    }
  };

  const captureShareFile = async (): Promise<File | null> => {
    try {
      return await mapContactCardPngFile(pngInput(), cardFilename(city.id));
    } catch {
      return null;
    }
  };

  const onWhatsApp = () => {
    const phone = favoriteBarberPhone.trim();
    if (phone && !isValidSaudiWhatsAppMobile(phone)) {
      toast.error('رقم واتساب الصالون غير صالح — استخدم صيغة 05xxxxxxxx');
      return;
    }
    persistFavorite();
    const url = buildMapContactWhatsAppHref(whatsappText, phone || undefined);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const onShareNative = async () => {
    setBusy('share');
    try {
      let file: File | null = null;
      if (canNativeShareFiles()) {
        try {
          file = await captureShareFile();
        } catch {
          file = null;
        }
      }
      const result = await shareMapContactCardNative({
        title: MAP_CONTACT_CARD_PRODUCT_NAME_AR,
        text: whatsappText,
        partnerUrl,
        file,
      });
      if (result === 'unsupported') {
        await navigator.clipboard.writeText(whatsappText);
        toast.success('نُسخ نص البطاقة — الصقه في أي تطبيق');
      } else if (result === 'shared') {
        persistFavorite();
      }
    } catch {
      toast.error('تعذّر فتح نافذة المشاركة');
    } finally {
      setBusy(null);
    }
  };

  const onShareSnapOrStory = async () => {
    setBusy('snap');
    try {
      if (canNativeShareFiles()) {
        const file = await captureShareFile();
        const result = await shareMapContactCardNative({
          title: MAP_CONTACT_CARD_PRODUCT_NAME_AR,
          text: whatsappText,
          partnerUrl,
          file,
        });
        if (result === 'shared') {
          persistFavorite();
          toast.success('اختر سناب أو أي تطبيق من قائمة المشاركة');
          return;
        }
        if (result === 'cancelled') return;
      }
      const result = await saveMapContactCardPng(pngInput(), cardFilename(city.id), {
        preferShareOnMobile: true,
        openPreview: (url) => setPreviewUrl(url),
      });
      if (!result.ok) {
        if (result.error === 'cancelled') return;
        throw new Error(result.error);
      }
      persistFavorite();
      toast.message(
        result.method === 'preview'
          ? 'اضغط مطولاً على الصورة ثم شاركها من سناب أو الاستوديو'
          : MAP_CONTACT_CARD_DOWNLOAD_HINT_AR,
      );
    } catch {
      toast.error('تعذّر تجهيز البطاقة للمشاركة');
    } finally {
      setBusy(null);
    }
  };

  const onCopyText = async () => {
    try {
      await navigator.clipboard.writeText(whatsappText);
      toast.success('نُسخ نص الدعوة مع رابط الشركاء');
    } catch {
      toast.error('تعذّر النسخ');
    }
  };

  const onCopyPartnerLink = async () => {
    try {
      await navigator.clipboard.writeText(partnerUrl);
      toast.success('نُسخ رابط مسار الشركاء');
    } catch {
      toast.error('تعذّر النسخ');
    }
  };

  if (!hydrated) {
    return <div className="min-h-screen bg-[#020912]" aria-busy="true" />;
  }

  return (
    <div className="min-h-screen bg-[#020912] text-slate-100" dir="rtl">
      {previewUrl ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="معاينة البطاقة للحفظ"
        >
          <div className="max-h-[92vh] w-full max-w-md overflow-auto rounded-2xl border border-white/15 bg-[#041016] p-4 shadow-2xl">
            <p className="mb-3 text-center text-sm font-bold text-teal-100">
              اضغط مطولاً على الصورة ← حفظ الصورة
            </p>
            <img
              src={previewUrl}
              alt="بطاقة تواصل ماب"
              className="mx-auto max-h-[70vh] w-auto rounded-xl"
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="flex-1 bg-teal-600 font-bold"
                onClick={async () => {
                  try {
                    const file = await mapContactCardPngFile(
                      pngInput(),
                      cardFilename(city.id),
                    );
                    if (canNativeShareFiles()) {
                      await navigator.share({
                        files: [file],
                        title: MAP_CONTACT_CARD_PRODUCT_NAME_AR,
                      });
                    } else {
                      toast.message('استخدم الضغط المطوّل على الصورة للحفظ');
                    }
                  } catch {
                    toast.message('استخدم الضغط المطوّل على الصورة للحفظ');
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                مشاركة / حفظ
              </Button>
              <Button type="button" variant="outline" className="font-bold" onClick={closePreview}>
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      ) : null}

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
          <p className="text-xs font-bold text-amber-300/90">بطاقتك الخاصة · ادعُ أي صالون</p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {MAP_CONTACT_CARD_PRODUCT_NAME_AR}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            {MAP_CONTACT_CARD_LEAD_AR}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-teal-300/80">
            {MAP_CONTACT_CARD_KEEP_HINT_AR}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{MAP_CONTACT_PRIVACY_NOTE_AR}</p>
          {hasFavorite ? (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-[0.7rem] font-bold text-amber-100">
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              بطاقتك المفضلة محمّلة على هذا الجهاز
            </p>
          ) : null}
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

            <div>
              <Label htmlFor="mcc-barber-phone" className="text-slate-300">
                واتساب صالونك المفضّل (اختياري)
              </Label>
              <Input
                id="mcc-barber-phone"
                value={favoriteBarberPhone}
                maxLength={20}
                inputMode="tel"
                autoComplete="tel"
                onChange={(e) => setFavoriteBarberPhone(e.target.value)}
                className="mt-1.5 border-white/15 bg-black/30"
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
              <p className="mt-1 text-[0.65rem] leading-relaxed text-slate-500">
                إن أدخلت الرقم يُفتح واتساب مباشرة إلى الصالون. بدون رقم تختار جهة الاتصال بنفسك — والبطاقة تصلح لأي صالون.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-teal-400/25 bg-teal-500/5 p-3">
              <p className="text-xs font-black text-teal-100">احفظ بطاقتك ثم شاركها</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  onClick={() => persistFavorite({ toastOnSave: true })}
                  variant="secondary"
                  className="font-bold"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  احفظ كبطاقتي المفضلة
                </Button>
                <Button
                  type="button"
                  onClick={onDownload}
                  disabled={busy === 'save'}
                  className="bg-teal-600 font-bold text-white hover:bg-teal-500"
                >
                  <Download className="h-4 w-4" />
                  {busy === 'save' ? 'جارٍ التحميل…' : 'تحميل البطاقة (PNG)'}
                </Button>
              </div>
              {hasFavorite ? (
                <button
                  type="button"
                  onClick={onClearFavorite}
                  className="text-[0.65rem] font-bold text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
                >
                  إزالة البطاقة المفضلة من الجهاز
                </button>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-300">أرسل لصالون أو شارك على المنصات</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  onClick={onWhatsApp}
                  className="bg-emerald-600 font-bold text-white hover:bg-emerald-500"
                >
                  <MessageCircle className="h-4 w-4" />
                  واتساب لصالوني / أي صالون
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onShareSnapOrStory}
                  disabled={busy === 'snap'}
                  className="font-bold"
                >
                  <Share2 className="h-4 w-4" />
                  {busy === 'snap' ? 'جارٍ التجهيز…' : 'سناب / ستوري / تطبيقات'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onShareNative}
                  disabled={busy === 'share'}
                  className="font-bold"
                >
                  <Share2 className="h-4 w-4" />
                  مشاركة النظام
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={buildMapContactFacebookShareHref(partnerUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.7rem] font-bold text-slate-200 hover:border-white/30"
                >
                  فيسبوك
                </a>
                <a
                  href={buildMapContactXShareHref(whatsappText, partnerUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.7rem] font-bold text-slate-200 hover:border-white/30"
                >
                  X
                </a>
                <a
                  href={buildMapContactTelegramShareHref(whatsappText, partnerUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.7rem] font-bold text-slate-200 hover:border-white/30"
                >
                  تيليجرام
                </a>
                <button
                  type="button"
                  onClick={onCopyText}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.7rem] font-bold text-slate-200 hover:border-white/30"
                >
                  <Copy className="h-3 w-3" />
                  نسخ النص
                </button>
                <button
                  type="button"
                  onClick={onCopyPartnerLink}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.7rem] font-bold text-slate-200 hover:border-white/30"
                >
                  <Copy className="h-3 w-3" />
                  نسخ رابط الشركاء
                </button>
              </div>
            </div>

            <p className="text-[0.7rem] leading-relaxed text-slate-500">
              الوجهة دائماً مسار الشركاء:{' '}
              <code className="rounded bg-white/10 px-1 break-all" dir="ltr">
                /partners/interest?ref=map-contact-card
              </code>
              . المنصة ليست وسيط حجز — أنت تدعو الصالون، والعلاقة مباشرة بينكما.
            </p>

            <Link
              to={ROUTE_PATHS.COVERAGE_SALON_NOMINATE}
              className="inline-block text-sm font-bold text-cyan-300 hover:text-cyan-200"
            >
              أو رشّح صالوناً لتغطية منطقتك ←
            </Link>
          </section>

          <aside className="lg:sticky lg:top-6">
            <p className="mb-3 text-center text-[0.7rem] font-bold text-slate-500">
              معاينة بطاقتك — للتحميل والمشاركة
            </p>
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
