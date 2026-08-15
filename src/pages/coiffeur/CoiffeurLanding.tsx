/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * بوابة المستعلمة — زر الاستعلام في الوسط، العنوان يميناً، التصنيفات يساراً.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { CoiffeurInquiryStage } from '@/components/coiffeur/CoiffeurInquiryStage';
import { CoiffeurVisitorHowItWorks } from '@/components/coiffeur/CoiffeurVisitorHowItWorks';
import { CoiffeurBannerGallery } from '@/components/coiffeur/CoiffeurBannerGallery';
import { CoiffeurMoodGallery } from '@/components/coiffeur/CoiffeurMoodGallery';
import { CoiffeurInterestCta } from '@/components/coiffeur/CoiffeurInterestCta';
import {
  CoiffeurMobileSearchDock,
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';
import {
  COIFFEUR_LANDING_META,
  type CoiffeurInquiryIntentId,
} from '@/config/coiffeurMapUmbrella';

export default function CoiffeurLanding() {
  const navigate = useNavigate();
  const [intent, setIntent] = useState<CoiffeurInquiryIntentId>('near_open');
  useDocumentTitle(COIFFEUR_LANDING_META.documentTitle);

  useEffect(() => {
    ProductEvents.coiffeurLandingView({ source: 'landing' });
  }, []);

  const goInquire = () => {
    ProductEvents.coiffeurCtaClick({ source: 'landing' });
    navigate(ROUTE_PATHS.COIFFEUR_INQUIRE);
  };

  return (
    <CoiffeurVisitorShell>
      <CoiffeurVisitorHeader />
      <CoiffeurInquiryStage
        intent={intent}
        onIntentChange={(id) => {
          setIntent(id);
          ProductEvents.coiffeurCategoryClick({ intent: id, source: 'landing' });
        }}
        onInquire={goInquire}
      />
      <CoiffeurVisitorHowItWorks />
      <CoiffeurInterestCta source="landing_stage" />
      <CoiffeurMoodGallery />
      <CoiffeurBannerGallery />
      <CoiffeurInterestCta source="landing" className="pb-10" />
      <CoiffeurVisitorFooter showPartnersLater />
      <CoiffeurMobileSearchDock onClick={goInquire} />
    </CoiffeurVisitorShell>
  );
}
