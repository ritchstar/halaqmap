/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useRef, useState } from 'react';
import {
  BadgeCheck,
  Download,
  FileCheck,
  Loader2,
  MapPin,
  Radar,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import { toast } from '@/components/ui/sonner';
import {
  BARBER_NAME_LABEL_AR,
  PLATFORM_NAME_AR,
  type DigitalActivationCertificateView,
} from '@/config/geospatialLicenseDoctrine';
import {
  downloadActivationCertificateFallbackPng,
  downloadElementAsPngCard,
} from '@/lib/downloadElementAsPngCard';
import { cn } from '@/lib/utils';

type Props = {
  certificate: DigitalActivationCertificateView;
  barberName?: string;
  packageLabelAr?: string;
  className?: string;
  compact?: boolean;
  /** إظهار زر تحميل الكرت — يُفعّل عند صدور الشهادة */
  showDownload?: boolean;
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16).replace('T', ' ');
  }
}

function resolveBarberName(explicit: string | undefined, certificate: DigitalActivationCertificateView): string {
  if (explicit?.trim()) return explicit.trim();
  const fromSnap = certificate.geoSnapshot?.businessName;
  if (typeof fromSnap === 'string' && fromSnap.trim()) return fromSnap.trim();
  return '—';
}

function safeFileToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').slice(0, 48);
}

export function DigitalActivationCertificateCard({
  certificate,
  barberName,
  packageLabelAr,
  className,
  compact,
  showDownload = true,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const mapLive = certificate.mapIntegrationStatus === 'map_live';
  const displayBarber = resolveBarberName(barberName, certificate);
  const displayPackage = packageLabelAr?.trim() || certificate.tierLabelAr?.trim() || '—';

  const handleDownload = useCallback(async () => {
    const el = cardRef.current;
    if (!el || downloading) return;
    setDownloading(true);
    const stamp = new Date().toISOString().slice(0, 10);
    const file = `halaqmap-activation-${safeFileToken(certificate.certificateNumber)}-${stamp}.png`;
    const fallbackPayload = {
      certificateNumber: certificate.certificateNumber,
      salonName: displayBarber,
      packageLabel: displayPackage,
      issuedAtLabel: formatDate(certificate.issuedAt),
      validUntilLabel: formatDate(certificate.validUntil),
      mapLive,
    };
    try {
      await downloadElementAsPngCard(el, file);
      toast.success('تم تحميل الشهادة ككرت — احفظها في جهازك');
    } catch (primaryErr) {
      console.warn('[activation-certificate] html2canvas failed, using canvas fallback', primaryErr);
      try {
        await downloadActivationCertificateFallbackPng(fallbackPayload, file);
        toast.success('تم تحميل الشهادة ككرت — احفظها في جهازك');
      } catch (fallbackErr) {
        console.error('[activation-certificate] download failed', fallbackErr);
        toast.error('تعذّر تحميل الشهادة — أعد المحاولة أو التقط لقطة شاشة للكرت');
      }
    } finally {
      setDownloading(false);
    }
  }, [
    certificate.certificateNumber,
    certificate.issuedAt,
    certificate.validUntil,
    displayBarber,
    displayPackage,
    downloading,
    mapLive,
  ]);

  return (
    <div className={cn('space-y-3', className)} dir="rtl">
      <div
        ref={cardRef}
        className={cn(
          'relative overflow-hidden rounded-3xl border-2 border-teal-300/45 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_36%),linear-gradient(165deg,#0f766e_0%,#115e59_38%,#0a4f4a_72%,#042f2e_100%)] p-5 text-slate-100 shadow-[0_0_40px_rgba(20,184,166,0.22)] sm:p-6',
          compact && 'p-4 sm:p-5',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #5eead4 0, #5eead4 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
          }}
        />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 bottom-8 h-24 w-24 rounded-full bg-amber-300/10 blur-2xl" />

        <div className={cn('relative space-y-4', compact && 'space-y-3.5')}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <HalaqmapBrandMark className="h-14 w-14 shrink-0 rounded-2xl ring-2 ring-teal-200/35 shadow-lg shadow-teal-500/25" />
              <div className="min-w-0">
                <h3 className={cn('text-base font-black text-white sm:text-lg', compact && 'text-base')}>
                  شهادة تفعيل رقمية
                </h3>
                <p className="mt-0.5 text-[0.68rem] leading-relaxed text-teal-50/75">
                  وثيقة رسمية تُثبت ملكيتك لمنتج {PLATFORM_NAME_AR} الرقمي
                </p>
              </div>
            </div>
            <Badge className="shrink-0 border border-emerald-300/45 bg-emerald-500/20 text-emerald-50">
              نشطة
            </Badge>
          </div>

          <div className="rounded-2xl border border-white/14 bg-black/30 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-[0.58rem] font-semibold tracking-wide text-teal-100/70">
              صاحب الرخصة · رخصة النفاذ الرقمية
            </p>
            <p className="mt-1 text-base font-bold text-white sm:text-lg">{displayBarber}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-teal-200/50 bg-[linear-gradient(180deg,rgba(13,148,136,0.45)_0%,rgba(6,78,59,0.72)_48%,rgba(2,44,34,0.92)_100%)] px-4 py-5 text-center shadow-[inset_0_1px_0_rgba(153,246,228,0.28),0_0_36px_rgba(20,184,166,0.22)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
            <div className="relative">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-teal-200/40 bg-teal-500/20 px-3 py-0.5">
                <Sparkles className="h-3 w-3 text-teal-100" />
                <span className="text-[0.62rem] font-bold text-teal-50">كود التفعيل — مفتاح رخصتك</span>
              </div>
              <p
                data-cert-code="1"
                className="font-mono text-[1.1rem] font-black tracking-[0.1em] text-[#fde68a] sm:text-[1.3rem] sm:bg-gradient-to-l sm:from-[#ecfdf5] sm:via-[#5eead4] sm:to-[#d4af37] sm:bg-clip-text sm:text-transparent"
                dir="ltr"
              >
                {certificate.certificateNumber}
              </p>
              <p className="mt-2 text-[0.62rem] leading-relaxed text-teal-50/80">
                احفظ هذا الرمز — مرجعك للتحقق، الدعم، وربط لوحة التحكم
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-[0.62rem] sm:gap-3">
            {[
              { label: 'الباقة المختارة', value: displayPackage },
              { label: BARBER_NAME_LABEL_AR, value: displayBarber },
              { label: 'تاريخ الإصدار', value: formatDate(certificate.issuedAt) },
              { label: 'صالحة حتى', value: formatDate(certificate.validUntil) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/12 bg-white/[0.07] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-3"
              >
                <p className="text-teal-100/65">{item.label}</p>
                <p className="mt-1 font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div
            className={cn(
              'rounded-xl border px-3 py-2.5',
              mapLive
                ? 'border-emerald-300/40 bg-emerald-950/35'
                : 'border-amber-300/35 bg-amber-950/25',
            )}
          >
            <div className="flex items-start gap-2">
              {mapLive ? (
                <Radar className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              ) : (
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  {mapLive
                    ? 'الظهور على الخريطة نشط'
                    : 'بانتظار اكتمال ربط موقع الصالون على الخريطة'}
                </p>
                <p className="text-[11px] text-teal-50/75">
                  {mapLive
                    ? 'صالونك ظاهر ضمن نظام الاستجابة الذكية حسب أيام الرخصة المتبقية.'
                    : 'إن كان موقعك مسجّلاً مسبقاً سيكتمل الربط تلقائياً — وإلا راجع بيانات العنوان في لوحة التحكم أو مع الدعم.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-teal-200/30 bg-teal-500/12 px-3 py-2.5">
            <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-100" />
            <div>
              <p className="text-[0.68rem] font-bold text-teal-50">
                مُصدَرة ومُسجَّلة على نظام {PLATFORM_NAME_AR} — نشطة
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[0.58rem] leading-relaxed text-teal-50/75">
                <BadgeCheck className="h-3 w-3 shrink-0 text-cyan-200" />
                صدرت: {formatDate(certificate.issuedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showDownload ? (
        <Button
          type="button"
          onClick={() => void handleDownload()}
          disabled={downloading}
          className="w-full gap-2 border border-teal-300/35 bg-gradient-to-l from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20 hover:from-teal-500 hover:to-cyan-500"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloading ? 'جاري تجهيز الكرت…' : 'تحميل الشهادة ككرت'}
        </Button>
      ) : null}
    </div>
  );
}
