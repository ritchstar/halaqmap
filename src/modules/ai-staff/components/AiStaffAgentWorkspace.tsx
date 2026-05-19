import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DigitalShiftOversightPanel } from '@/modules/ai-staff/components/DigitalShiftOversightPanel';
import { FleetDirectorIntelligenceFeed } from '@/modules/ai-staff/components/FleetDirectorIntelligenceFeed';
import { PartnerLiaisonAnalyticsPanel } from '@/modules/ai-staff/components/PartnerLiaisonAnalyticsPanel';
import type { AiStaffAgentDef } from '@/modules/ai-staff/types';
import { cn } from '@/lib/utils';

type Props = {
  agent: AiStaffAgentDef;
  onClose: () => void;
};

export function AiStaffAgentWorkspace({ agent, onClose }: Props) {
  const isCovert = agent.classification === 'elite_covert';

  return (
    <Card
      className={cn(
        'border-2 shadow-lg',
        isCovert ? 'border-red-500/40 bg-slate-950/95' : 'border-primary/25 bg-background/95',
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={onClose} aria-label="إغلاق">
          <X className="h-4 w-4" />
        </Button>
        <div className="space-y-1 text-right flex-1">
          <CardTitle className="text-lg">{agent.title ?? agent.shortName}</CardTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">{agent.roleDescription}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {agent.workspaceKind === 'digital_shift_oversight' ? (
          <DigitalShiftOversightPanel doctrineNotes={agent.doctrineNotes} />
        ) : null}
        {agent.workspaceKind === 'partner_analytics' ? <PartnerLiaisonAnalyticsPanel /> : null}
        {agent.workspaceKind === 'fleet_intelligence' ? <FleetDirectorIntelligenceFeed /> : null}
        {agent.workspaceKind === 'billing_dialog' || agent.workspaceKind === 'zatca_settings' ? (
          <p className="text-sm text-muted-foreground text-right">
            يُفتح هذا المكتب عبر الزر الرئيسي في البطاقة — لا حاجة لوحة فرعية هنا.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
