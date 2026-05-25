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
        'overflow-hidden border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 text-slate-100 shadow-xl',
        className,
      )}
      dir="rtl"
    >
      <CardHeader className={cn('space-y-2', compact && 'pb-3')}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-cyan-400/30 bg-cyan-500/15 text-cyan-100">
            <Shield className="ml-1 h-3 w-3" />
            Digital Activation Certificate
          </Badge>
          <Badge variant="outline" className="border-emerald-400/30 text-emerald-200">
            {ISIC_ACTIVITY_CODE_LABEL_AR}: {certificate.isicCode || ISIC_ACTIVITY_CODE}
          </Badge>
        </div>
        <CardTitle className={cn('text-xl font-extrabold text-white', compact && 'text-lg')}>
          شهادة تفعيل رقمية فاخرة — {PLATFORM_NAME_AR}
        </CardTitle>
        <CardDescription className="text-slate-300">
          {SOFTWARE_LICENSE_MANAGER_LABEL_AR} — وثيقة رسمية تُثبت ملكيتك لمنتجنا الرقمي
        </CardDescription>
      </CardHeader>
      <CardContent className={cn('space-y-4', compact && 'pt-0')}>
        <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/45 bg-gradient-to-br from-amber-950/40 via-slate-950 to-black/50 p-4 sm:col-span-2">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-amber-200/5 to-transparent" />
          <div className="relative text-center sm:text-right">
            <p className="text-[10px] font-bold tracking-wide text-amber-200/80">
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
            <p className="mt-2 text-[11px] leading-relaxed text-amber-100/50">
              احفظ هذا الرمز — مرجعك للتحقق، الدعم، وربط لوحة التحكم
            </p>
          </div>
        </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] text-slate-400">{ISIC_ACTIVITY_CODE_LABEL_AR}</p>
            <p className="mt-1 font-mono text-sm font-bold text-emerald-200" dir="ltr">
              {certificate.isicCode || ISIC_ACTIVITY_CODE}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] text-slate-400">{BARBER_NAME_LABEL_AR}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
              <Store className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
              {displayBarber}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] text-slate-400">الباقة البرمجية</p>
            <p className="mt-1 text-sm font-bold">{certificate.tierLabelAr}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] text-slate-400">صالحة حتى</p>
            <p className="mt-1 text-sm font-bold">{formatDate(certificate.validUntil)}</p>
          </div>
        </div>

        <div
          className={cn(
            'rounded-xl border p-3',
            mapLive
              ? 'border-emerald-400/40 bg-emerald-950/30'
              : 'border-amber-400/30 bg-amber-950/20',
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

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <BadgeCheck className="h-3.5 w-3.5 text-cyan-300" />
          <span>صدرت: {formatDate(certificate.issuedAt)}</span>
        </div>
        <p className="text-[10px] text-slate-500 dir-ltr text-left" dir="ltr">
          {INVOICE_PRODUCT_DESCRIPTION_EN}
        </p>
      </CardContent>
    </Card>
  );
}
