/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نموذج الرئيسية لأطلس الحلول. بلا طقس وبلا أسعار داخل البطاقات.
 */
import { Link } from 'react-router-dom';
import { AtlasFooter } from '@/components/store/atlas/AtlasFooter';
import { AtlasHeader } from '@/components/store/atlas/AtlasHeader';
import { AtlasHero } from '@/components/store/atlas/AtlasHero';
import { JourneySteps } from '@/components/store/atlas/JourneySteps';
import { MobileStickyCTA } from '@/components/store/atlas/MobileStickyCTA';
import { SectorNavigator } from '@/components/store/atlas/SectorNavigator';
import { TrustRail } from '@/components/store/atlas/TrustRail';
import { STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function AtlasHome({ compact = false }: { compact?: boolean }) {
  return (
    <div className="store-atlas min-h-full">
      <AtlasHeader compact={compact} />
      <AtlasHero compact={compact} />
      <TrustRail />
      <SectorNavigator compact={compact} />
      <JourneySteps />
      <section className="bg-[var(--atlas-raised)] px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">{STORE_ATLAS_COPY.requestTitleAr}</h2>
          <p className="mt-3 text-lg leading-8 text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.requestLeadAr}</p>
          <Link to={ROUTE_PATHS.STORE_REQUEST} className="store-atlas__btn store-atlas__btn--gold mt-6">
            {STORE_ATLAS_COPY.requestCtaAr}
          </Link>
        </div>
      </section>
      <AtlasFooter />
      {compact ? (
        <MobileStickyCTA to={ROUTE_PATHS.STORE_GENERAL_TRIAL} labelAr={STORE_ATLAS_COPY.stickyTrialAr} />
      ) : null}
    </div>
  );
}
