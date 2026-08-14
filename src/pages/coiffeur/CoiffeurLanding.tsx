/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * بوابة المستعلمة — زر الاستعلام في الوسط، العنوان يميناً، التصنيفات يساراً.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CoiffeurInquiryStage } from '@/components/coiffeur/CoiffeurInquiryStage';
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

  const goInquire = () => {
    navigate(ROUTE_PATHS.COIFFEUR_INQUIRE);
  };

  return (
    <CoiffeurVisitorShell>
      <CoiffeurVisitorHeader />
      <CoiffeurInquiryStage
        intent={intent}
        onIntentChange={setIntent}
        onInquire={goInquire}
      />
      <CoiffeurVisitorFooter showPartnersLater />
      <CoiffeurMobileSearchDock onClick={goInquire} />
    </CoiffeurVisitorShell>
  );
}
