import { BadgeCheck, MapPin, Radar, Shield, Store } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BARBER_NAME_LABEL_AR,
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  MAP_INTEGRATION_PROTOCOL,
  PLATFORM_NAME_AR,
  SOFTWARE_LICENSE_MANAGER_LABEL_AR,
  type DigitalActivationCertificateView,
} from '@/config/geospatialLicenseDoctrine';
import { INVOICE_PRODUCT_DESCRIPTION_EN } from '@/config/softwareLicenseTerminology';
import { cn } from '@/lib/utils';

type Props = {
  certificate: DigitalActivationCertificateView;
  barberName?: string;
  className?: string;
  compact?: boolean;
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

export function DigitalActivationCertificateCard({ certificate, barberName, className, compact }: Props) {
  const mapLive = certificate.mapIntegrationStatus === 'map_live';
  const displayBarber = resolveBarberName(barberName, certificate);

  return (
    <Card
      className={cn(
        'overflow-hidden border-cyan-400/40 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_28%),linear-gradient(180deg,#061018_0%,#0a1320_45%,#07131a_100%)] text-slate-100 shadow-xl',
        className,
      )}
      dir="rtl"
    >
      <CardHeader className={cn('space-y-2', compact && 'pb-3')}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-cyan-300/45 bg-cyan-500/18 text-cyan-50">
            <Shield className="ml-1 h-3 w-3" />
            Digital Activation Certificate
          </Badge>
          <Badge variant="outline" className="border-emerald-300/45 text-emerald-100">
            {ISIC_ACTIVITY_CODE_LABEL_AR}: {certificate.isicCode || ISIC_ACTIVITY_CODE}
          </Badge>
        </div>
        <CardTitle className={cn('text-xl font-extrabold text-white', compact && 'text-lg')}>
          شهادة تفعيل رقمية معتمدة — {PLATFORM_NAME_AR}
        </CardTitle>
        <CardDescription className="text-slate-200/85">
          {SOFTWARE_LICENSE_MANAGER_LABEL_AR} — وثيقة رسمية تُثبت ملكيتك لمنتجنا الرقمي
        </CardDescription>
      </CardHeader>
      <CardContent className={cn('space-y-4', compact && 'pt-0')}>
        <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-amber-300/65 bg-[linear-gradient(180deg,rgba(55,33,2,0.96)_0%,rgba(22,16,5,0.98)_50%,rgba(5,10,16,0.98)_100%)] p-4 shadow-[inset_0_1px_0_rgba(253,230,138,0.22),0_0_38px_rgba(245,158,11,0.18)] sm:col-span-2">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-amber-200/10 to-transparent" />
          <div className="relative text-center sm:text-right">
            <p className="text-[10px] font-bold tracking-wide text-amber-100">
              كود التفعيل — مفتاح رخصة النفاذ الرقمي
            </p>
            <p
              className="mt-2 font-mono text-xl font-black tracking-[0.1em] text-transparent sm:text-2xl"
              dir="ltr"
              style={{
                backgroundImage: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              {certificate.certificateNumber}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-amber-100/80">
              احفظ هذا الرمز — مرجعك للتحقق، الدعم، وربط لوحة التحكم
            </p>
          </div>
        </div>
          <div className="rounded-lg border border-white/14 bg-white/[0.08] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[10px] text-slate-300">{ISIC_ACTIVITY_CODE_LABEL_AR}</p>
            <p className="mt-1 font-mono text-sm font-bold text-emerald-200" dir="ltr">
              {certificate.isicCode || ISIC_ACTIVITY_CODE}
            </p>
          </div>
          <div className="rounded-lg border border-white/14 bg-white/[0.08] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[10px] text-slate-300">{BARBER_NAME_LABEL_AR}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
              <Store className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
              {displayBarber}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/14 bg-white/[0.08] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[10px] text-slate-300">الباقة البرمجية</p>
            <p className="mt-1 text-sm font-bold">{certificate.tierLabelAr}</p>
          </div>
          <div className="rounded-lg border border-white/14 bg-white/[0.08] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[10px] text-slate-300">صالحة حتى</p>
            <p className="mt-1 text-sm font-bold">{formatDate(certificate.validUntil)}</p>
          </div>
        </div>

        <div
          className={cn(
            'rounded-xl border p-3',
            mapLive
              ? 'border-emerald-300/40 bg-emerald-950/34'
              : 'border-amber-300/35 bg-amber-950/24',
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
                  ? 'بروتوكول الربط الآلي — الإدراج الجغرافي نشط على الخريطة'
                  : 'بروتوكول الربط الآلي — بانتظار ربط الإحداثيات الجغرافية'}
              </p>
              <p className="text-[11px] text-slate-300">
                {MAP_INTEGRATION_PROTOCOL} · API-Driven Integration
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <BadgeCheck className="h-3.5 w-3.5 text-cyan-300" />
          <span>صدرت: {formatDate(certificate.issuedAt)}</span>
        </div>
        <p className="text-[10px] text-slate-400 dir-ltr text-left" dir="ltr">
          {INVOICE_PRODUCT_DESCRIPTION_EN}
        </p>
      </CardContent>
    </Card>
  );
}
