import { CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BARBER_NAME_LABEL_AR,
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  PLATFORM_NAME_AR,
  PLATFORM_NAME_EN,
  UNIFIED_DIGITAL_LICENSE_LABEL_AR,
  type DigitalActivationCertificateView,
} from '@/config/geospatialLicenseDoctrine';
import { DigitalActivationCertificateCard } from '@/components/billing/DigitalActivationCertificateCard';
import { cn } from '@/lib/utils';

type Props = {
  barberName?: string;
  certificate: DigitalActivationCertificateView | null;
  loading?: boolean;
  /** فشل الإصدار بعد انتهاء المحاولات */
  failed?: boolean;
  className?: string;
};

function resolveBarberDisplayName(
  explicit: string | undefined,
  certificate: DigitalActivationCertificateView | null,
): string {
  if (explicit?.trim()) return explicit.trim();
  const snap = certificate?.geoSnapshot;
  const fromSnap = snap?.businessName;
  if (typeof fromSnap === 'string' && fromSnap.trim()) return fromSnap.trim();
  return '—';
}

function IdentityField({
  label,
  value,
  mono,
  pending,
}: {
  label: string;
  value: string;
  mono?: boolean;
  pending?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="text-[10px] font-semibold text-cyan-200/80">{label}</p>
      {pending ? (
        <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
          جاري الإصدار…
        </p>
      ) : (
        <p
          className={cn(
            'mt-1 text-sm font-bold text-white',
            mono && 'font-mono text-base tracking-wide',
          )}
          dir={mono ? 'ltr' : 'rtl'}
        >
          {value}
        </p>
      )}
    </div>
  );
}

export function PaymentSuccessPanel({ barberName, certificate, loading, failed, className }: Props) {
  const displayBarber = resolveBarberDisplayName(barberName, certificate);
  const licenseNumber = certificate?.certificateNumber ?? null;
  const isicCode = certificate?.isicCode ?? ISIC_ACTIVITY_CODE;
  const licensePending = Boolean(loading) && !licenseNumber;

  return (
    <div className={cn('space-y-4', className)} dir="rtl">
      <Card className="overflow-hidden border-emerald-500/35 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 text-slate-100 shadow-xl">
        <CardHeader className="space-y-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-200/90">تم الدفع بنجاح</p>
              <CardTitle className="mt-1 text-2xl font-extrabold text-white">{PLATFORM_NAME_AR}</CardTitle>
              <p className="text-sm text-slate-400 dir-ltr text-left" dir="ltr">
                {PLATFORM_NAME_EN}
              </p>
            </div>
            <Badge className="border-emerald-400/40 bg-emerald-500/15 text-emerald-100">
              <CheckCircle2 className="ml-1 h-3.5 w-3.5" />
              Success
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <IdentityField
              label={UNIFIED_DIGITAL_LICENSE_LABEL_AR}
              value={licenseNumber ?? (failed ? 'تعذّر الإصدار — أعد المحاولة' : '—')}
              mono
              pending={licensePending}
            />
            <IdentityField
              label={ISIC_ACTIVITY_CODE_LABEL_AR}
              value={isicCode}
              mono
            />
          </div>
          <IdentityField label={BARBER_NAME_LABEL_AR} value={displayBarber} />
        </CardContent>
      </Card>

      {certificate ? (
        <DigitalActivationCertificateCard certificate={certificate} compact barberName={displayBarber} />
      ) : null}
    </div>
  );
}
