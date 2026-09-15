/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ListingLicensePricingMatrix } from '@/components/billing/ListingLicensePricingMatrix';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { COIFFEUR_REGISTRATION_SURFACE } from '@/config/coiffeurPartnerSector';
import { lockPartnerDarkCanvas } from '@/lib/partnerDarkCanvas';
import type { SoftwareLicenseFormSurface } from '@/config/softwareLicenseTerminology';

const CHECKOUT_CONTEXT_KEYS = [
  'purpose',
  'requestId',
  'linkedBarberId',
  'barberName',
  'plan',
  'surface',
] as const;

export default function PartnerPackagesPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => lockPartnerDarkCanvas(), []);

  const licenseSurface: SoftwareLicenseFormSurface = useMemo(() => {
    const fromUrl = (searchParams.get('surface') ?? '').trim().toLowerCase();
    return fromUrl === COIFFEUR_REGISTRATION_SURFACE ? 'coiffeur' : 'halaqmap';
  }, [searchParams]);

  const extraPaymentSearch = useMemo(() => {
    const out: Record<string, string> = {};
    for (const key of CHECKOUT_CONTEXT_KEYS) {
      const v = searchParams.get(key)?.trim();
      if (v) out[key] = v;
    }
    return out;
  }, [searchParams]);

  const showMissingTierNotice = searchParams.get('reason') === 'missing_tier';

  return (
    <div className="min-h-screen bg-[#020912] px-4 py-10 sm:py-14" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        {showMissingTierNotice ? (
          <Alert className="border-amber-400/50 bg-amber-500/15 text-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-200" />
            <AlertDescription className="text-sm leading-relaxed text-amber-50/95">
              لم تُحدَّد حزمة الاشتراك في الرابط. اختر المستوى وعدد الحزم صراحةً أدناه، ثم انتقل إلى
              الدفع — لا يُفترض أي مستوى افتراضي.
            </AlertDescription>
          </Alert>
        ) : null}

        <ListingLicensePricingMatrix
          variant="standalone-dark"
          showHeader
          licenseSurface={licenseSurface}
          extraPaymentSearch={extraPaymentSearch}
        />
      </div>
    </div>
  );
}
