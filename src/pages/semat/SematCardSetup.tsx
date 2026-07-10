import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CreditCard, ImagePlus, Pencil, Scissors, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SematCardPreview } from '@/components/semat/SematCardPreview';
import {
  SEMAT_BEARD_STYLE_OPTIONS,
  SEMAT_HAIR_PRESET_OPTIONS,
} from '@/config/sematCardFormOptions';
import { SEMAT_CARD_PRODUCT_NAME_AR } from '@/config/sematCardLegalPolicy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib';
import { hasValidSematConsent } from '@/lib/sematCardConsent';
import {
  createSematPreviewPublicId,
  readSematDraft,
  storeSematDraft,
  type SematCardDraft,
} from '@/lib/sematCardDraft';
import { toast } from '@/components/ui/sonner';

type SetupForm = {
  displayName: string;
  hairPreset: string;
  hairDetail: string;
  beardStyle: string;
  notes: string;
  referenceImage: File | null;
};

const INITIAL_FORM: SetupForm = {
  displayName: '',
  hairPreset: '',
  hairDetail: '',
  beardStyle: '',
  notes: '',
  referenceImage: null,
};

type Phase = 'form' | 'preview';

const SEMAT_PRICE_SAR = 9;

export default function SematCardSetup() {
  useDocumentTitle(`${SEMAT_CARD_PRODUCT_NAME_AR} · إعداد البطاقة`);

  const [bootstrapped, setBootstrapped] = useState(false);
  const [consentReady, setConsentReady] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [form, setForm] = useState<SetupForm>(INITIAL_FORM);
  const [draft, setDraft] = useState<SematCardDraft | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  useEffect(() => {
    const ok = hasValidSematConsent();
    setConsentReady(ok);
    if (ok) {
      const existing = readSematDraft();
      if (existing) {
        setDraft(existing);
        setForm({
          displayName: existing.displayName,
          hairPreset: existing.hairPreset,
          hairDetail: existing.hairDetail,
          beardStyle: existing.beardStyle,
          notes: existing.notes,
          referenceImage: null,
        });
        setPhase('preview');
      }
    }
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    if (!form.referenceImage) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(form.referenceImage);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.referenceImage]);

  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070a] text-sm text-slate-400" dir="rtl">
        جاري التحميل…
      </div>
    );
  }

  if (!consentReady) {
    return <Navigate to={ROUTE_PATHS.SEMAT_LEGAL} replace />;
  }

  const onImageChange = (file: File | null) => {
    if (!file) {
      setForm((prev) => ({ ...prev, referenceImage: null }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة فقط.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('حجم الصورة يجب ألا يتجاوز 8 ميغابايت.');
      return;
    }
    setForm((prev) => ({ ...prev, referenceImage: file }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const displayName = form.displayName.trim();
    if (!displayName) {
      toast.error('يرجى إدخال الاسم الأول أو اللقب.');
      return;
    }
    if (!form.hairPreset) {
      toast.error('يرجى اختيار تفاصيل الشعر.');
      return;
    }
    if (!form.beardStyle) {
      toast.error('يرجى اختيار أسلوب الذقن.');
      return;
    }

    const next: SematCardDraft = {
      publicId: draft?.publicId ?? createSematPreviewPublicId(),
      displayName,
      hairPreset: form.hairPreset,
      hairDetail: form.hairDetail.trim(),
      beardStyle: form.beardStyle,
      notes: form.notes.trim(),
      referenceImageName: form.referenceImage?.name ?? draft?.referenceImageName ?? null,
      createdAt: new Date().toISOString(),
    };
    storeSematDraft(next);
    setDraft(next);
    setPhase('preview');
    toast.success('تم توليد المعاينة — فعّل البطاقة لإزالة الغباش.');
  };

  const onActivateClick = () => {
    toast.info(
      `بوابة الدفع (${SEMAT_PRICE_SAR} ريال) تُربط في المرحلة التالية. المعاينة جاهزة الآن.`,
    );
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(212,175,55,0.12),transparent_50%)]" />

      <header className="relative z-10 border-b border-white/8 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to={ROUTE_PATHS.SEMAT_LEGAL}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-amber-200/90"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
            السياسات
          </Link>
          <span className="text-xs font-medium text-amber-200/70">
            {phase === 'form' ? 'المرحلة الثانية — إعداد البطاقة' : 'معاينة قبل التفعيل'}
          </span>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-2xl px-4 py-10">
        <AnimatePresence mode="wait">
          {phase === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="mb-8 text-center">
                <h1 className="mb-3 text-3xl font-black text-white">أعدّ بطاقة سمات</h1>
                <p className="text-sm leading-relaxed text-slate-400">
                  الاسم الأول فقط — بدون حساب — صورة مرجعية اختيارية. بعد التعبئة تظهر معاينة مغبّشة ثم زر التفعيل.
                </p>
              </div>

              <Card className="border-white/10 bg-[#0f0f14]/95 text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-amber-100">
                    <Scissors className="h-5 w-5 text-amber-400" aria-hidden />
                    بيانات البطاقة
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    املأ الحقول ثم ولّد المعاينة. الدفع يفعّل البطاقة النهائية لاحقاً.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="semat-name" className="flex items-center gap-2 text-slate-200">
                        <User className="h-4 w-4 text-amber-400/80" aria-hidden />
                        الاسم أو اللقب (الأول فقط)
                      </Label>
                      <Input
                        id="semat-name"
                        value={form.displayName}
                        onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                        placeholder="مثال: أبو سعود"
                        maxLength={40}
                        className="border-white/15 bg-black/30 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-200">تفاصيل شعر الرأس</Label>
                      <Select
                        value={form.hairPreset}
                        onValueChange={(v) => setForm((p) => ({ ...p, hairPreset: v }))}
                      >
                        <SelectTrigger className="border-white/15 bg-black/30 text-white">
                          <SelectValue placeholder="اختر النمرة أو الأسلوب" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEMAT_HAIR_PRESET_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={form.hairDetail}
                        onChange={(e) => setForm((p) => ({ ...p, hairDetail: e.target.value }))}
                        placeholder="تفصيل إضافي: مثال مقص من الجوانب فقط"
                        maxLength={200}
                        className="border-white/15 bg-black/30 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-200">استايل وتحديد الذقن</Label>
                      <Select
                        value={form.beardStyle}
                        onValueChange={(v) => setForm((p) => ({ ...p, beardStyle: v }))}
                      >
                        <SelectTrigger className="border-white/15 bg-black/30 text-white">
                          <SelectValue placeholder="اختر أسلوب اللحية" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEMAT_BEARD_STYLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semat-notes" className="text-slate-200">
                        ملاحظات إضافية (اختياري)
                      </Label>
                      <Textarea
                        id="semat-notes"
                        value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="مثال: بشرة حساسة للموس — ليست استشارة طبية"
                        maxLength={400}
                        rows={3}
                        className="border-white/15 bg-black/30 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semat-image" className="flex items-center gap-2 text-slate-200">
                        <ImagePlus className="h-4 w-4 text-amber-400/80" aria-hidden />
                        صورة مرجعية (اختياري — صورة واحدة)
                      </Label>
                      <Input
                        id="semat-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                        className="border-white/15 bg-black/30 text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-amber-500/20 file:px-3 file:py-1 file:text-amber-100"
                      />
                      {form.referenceImage ? (
                        <p className="text-xs text-slate-500">تم اختيار: {form.referenceImage.name}</p>
                      ) : null}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-xl bg-amber-500 font-bold text-black hover:bg-amber-400"
                    >
                      توليد المعاينة
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : draft ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="mb-2 text-3xl font-black text-white">معاينة بطاقتك</h1>
                <p className="text-sm leading-relaxed text-slate-400">
                  الشكل النهائي يظهر أمامك — QR وبعض البيانات مغطاة حتى التفعيل.
                </p>
              </div>

              <SematCardPreview
                displayName={draft.displayName}
                hairPreset={draft.hairPreset}
                hairDetail={draft.hairDetail}
                beardStyle={draft.beardStyle}
                notes={draft.notes}
                publicId={draft.publicId}
                locked
                referenceImageUrl={imagePreviewUrl}
              />

              <div className="space-y-3">
                <Button
                  type="button"
                  size="lg"
                  onClick={onActivateClick}
                  className="w-full rounded-xl bg-amber-500 text-base font-bold text-black hover:bg-amber-400"
                >
                  <CreditCard className="ml-2 h-5 w-5" aria-hidden />
                  فعّل بطاقتك الذكية مدى الحياة بـ {SEMAT_PRICE_SAR} ريال فقط
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPhase('form')}
                  className="w-full border-white/15 text-slate-200 hover:bg-white/5"
                >
                  <Pencil className="ml-2 h-4 w-4" aria-hidden />
                  تعديل البيانات
                </Button>
              </div>

              <p className="text-center text-xs leading-relaxed text-slate-500">
                بالضغط على التفعيل لاحقاً ستُفتح بوابة الدفع (ميسر / Apple Pay). المنتج رقمي غير قابل للاسترجاع بعد التسليم وفق سياسة سمات.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
