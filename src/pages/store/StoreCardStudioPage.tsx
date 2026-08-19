/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إصدار بطاقة تهنئة مجانية — نسخة أولى قابلة للتعديل لاحقاً.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import {
  STORE_GREETING_OCCASIONS,
  STORE_LANDING_COPY,
  type StoreGreetingOccasion,
} from '@/config/storeFront';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import {
  downloadStoreGreetingCard,
  isAllowedStorePhotoUrl,
  loadStoreCardPhoto,
  renderStoreGreetingCardPng,
  sanitizeStoreCardName,
  STORE_CARD_EMAIL_MAX,
  STORE_CARD_NAME_MAX,
  STORE_CARD_PHOTO_URL_MAX,
} from '@/lib/storeGreetingCard';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-12 min-w-0 w-full border-white/15 bg-[#0b1a24] text-[16px] text-[#f4efe4] placeholder:text-white/35';

function parseOccasion(raw: string | null): StoreGreetingOccasion {
  if (raw === 'national_day' || raw === 'graduation' || raw === 'greeting') return raw;
  return 'national_day';
}

export default function StoreCardStudioPage() {
  useDocumentTitle(STORE_LANDING_COPY.cardsTitle);
  const [params, setParams] = useSearchParams();
  const occasion = parseOccasion(params.get('kind'));

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [localPhoto, setLocalPhoto] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const displayName = sanitizeStoreCardName(name);
  const ready = displayName.length >= 2;

  useEffect(() => {
    ProductEvents.storeCardStudioView({ occasion });
  }, [occasion]);

  const photoSrc = useMemo(() => {
    if (localPhoto) return 'local';
    return photoUrl.trim();
  }, [localPhoto, photoUrl]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!ready) {
        setPreviewUrl(null);
        return;
      }
      let photo: HTMLImageElement | null = localPhoto;
      if (!photo && isAllowedStorePhotoUrl(photoUrl)) {
        photo = await loadStoreCardPhoto(photoUrl);
      }
      try {
        const blob = await renderStoreGreetingCardPng({
          occasion,
          displayName,
          phone,
          email,
          photo,
        });
        if (cancelled) return;
        const next = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return next;
        });
      } catch {
        if (!cancelled) setPreviewUrl(null);
      }
    };
    const t = window.setTimeout(() => void run(), 280);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [ready, occasion, displayName, phone, email, photoSrc, localPhoto, photoUrl]);

  const onPickFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) {
      setLocalPhoto(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setLocalPhoto(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setLocalPhoto(null);
      URL.revokeObjectURL(url);
      toast.error('تعذّر قراءة الصورة.');
    };
    img.src = url;
  };

  const onDownload = async () => {
    if (!ready) {
      toast.error('أدخل الاسم أولاً.');
      return;
    }
    setBusy(true);
    try {
      let photo: HTMLImageElement | null = localPhoto;
      if (!photo && isAllowedStorePhotoUrl(photoUrl)) {
        photo = await loadStoreCardPhoto(photoUrl);
        if (!photo) toast.error('تعذّر تحميل رابط الصورة. تُصدر البطاقة بدونها أو ارفع ملفاً محلياً.');
      }
      const blob = await renderStoreGreetingCardPng({
        occasion,
        displayName,
        phone,
        email,
        photo,
      });
      await downloadStoreGreetingCard(blob, occasion);
      ProductEvents.storeCardDownload({ occasion });
      toast.success('تم تنزيل البطاقة.');
    } catch {
      toast.error('تعذّر إصدار البطاقة.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold text-[#e8c547]">{STORE_LANDING_COPY.freeCardsTitle}</p>
          <h1 className="mt-1 text-3xl font-extrabold">أصدر بطاقتك</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
            {STORE_LANDING_COPY.freeCardsLead}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {STORE_GREETING_OCCASIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set('kind', item.id);
                  setParams(next, { replace: true });
                }}
                className={cn(
                  'overflow-hidden rounded-xl border text-right transition',
                  occasion === item.id
                    ? 'border-[#e8c547] ring-1 ring-[#e8c547]/60'
                    : 'border-white/15 hover:border-[#e8c547]/40',
                )}
              >
                <img src={item.image} alt="" className="h-24 w-full object-cover" />
                <span
                  className={cn(
                    'block px-3 py-2 text-sm font-bold',
                    occasion === item.id ? 'bg-[#e8c547] text-[#061018]' : 'bg-[#0b1a24] text-white/80',
                  )}
                >
                  {item.titleAr}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_minmax(260px,360px)] lg:items-start">
            <div className="space-y-4 rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5">
              <div>
                <Label htmlFor="store-card-name" className="text-[#e8c547]">
                  الاسم
                </Label>
                <Input
                  id="store-card-name"
                  value={name}
                  maxLength={STORE_CARD_NAME_MAX}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-1.5 ${fieldClass}`}
                />
              </div>
              <div>
                <Label htmlFor="store-card-phone" className="text-[#e8c547]">
                  رقم الجوال
                </Label>
                <Input
                  id="store-card-phone"
                  value={phone}
                  inputMode="tel"
                  maxLength={24}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`mt-1.5 ${fieldClass}`}
                />
              </div>
              <div>
                <Label htmlFor="store-card-email" className="text-[#e8c547]">
                  البريد
                </Label>
                <Input
                  id="store-card-email"
                  type="email"
                  value={email}
                  maxLength={STORE_CARD_EMAIL_MAX}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1.5 ${fieldClass}`}
                />
              </div>
              <div>
                <Label htmlFor="store-card-photo-url" className="text-[#e8c547]">
                  رابط صورة شخصية
                </Label>
                <Input
                  id="store-card-photo-url"
                  value={photoUrl}
                  maxLength={STORE_CARD_PHOTO_URL_MAX}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    setLocalPhoto(null);
                  }}
                  placeholder="https://"
                  className={`mt-1.5 ${fieldClass}`}
                />
                <p className="mt-1 text-xs text-white/45">رابط `https` مباشر للصورة. إن تعذّر التحميل ارفع ملفاً من جهازك.</p>
              </div>
              <div>
                <Label htmlFor="store-card-photo-file" className="text-[#e8c547]">
                  أو ارفع صورة من جهازك
                </Label>
                <Input
                  id="store-card-photo-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickFile(e.target.files?.[0])}
                  className="mt-1.5 border-white/15 bg-[#0b1a24] text-sm text-white/80 file:text-[#061018]"
                />
              </div>
              <Button
                type="button"
                disabled={busy}
                onClick={() => void onDownload()}
                className="h-12 w-full bg-[#e8c547] font-extrabold text-[#061018] hover:bg-[#f0d46a]"
              >
                {busy ? 'جارٍ الإصدار…' : 'تنزيل البطاقة'}
              </Button>
            </div>

            <div className="rounded-2xl border border-white/12 bg-black/30 p-3">
              {previewUrl ? (
                <img src={previewUrl} alt="معاينة البطاقة" className="w-full rounded-xl" />
              ) : (
                <div className="flex min-h-[280px] items-center justify-center text-sm text-white/50">
                  أدخل الاسم لمعاينة البطاقة.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
