import { B2BMediaSpokespersonChat } from '@/components/B2BMediaSpokespersonChat';
import { LegalObserverChat } from '@/components/LegalObserverChat';

type Panel = 'media' | 'legal';

export function LandingAgentPanelBody({ panel }: { panel: Panel }) {
  if (panel === 'media') {
    return (
      <B2BMediaSpokespersonChat
        key="landing-media-agent"
        audience="consumer"
        mode="inline"
        collapseOnScroll={false}
        defaultOpen
      />
    );
  }

  return <LegalObserverChat key="landing-legal-agent" page="سياسة الخصوصية" defaultOpen />;
}
