import { X } from 'lucide-react';
import { StaffProfessionalCard } from '@/components/admin/staff/StaffProfessionalCard';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import { Button } from '@/components/ui/button';
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
    <StaffProfessionalCard
      className={cn(
        'p-0',
        isCovert && 'border-red-900/50',
      )}
    >
      <div className="flex flex-row items-start justify-between gap-3 border-b border-slate-700 px-5 py-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex-1 space-y-1 text-right">
          <h3 className={staffTheme.sectionTitle}>{agent.title ?? agent.shortName}</h3>
          <p className="text-xs leading-relaxed text-slate-400">{agent.roleDescription}</p>
        </div>
      </div>
      <div className="p-5">
        {agent.workspaceKind === 'digital_shift_oversight' ? (
          <DigitalShiftOversightPanel doctrineNotes={agent.doctrineNotes} />
        ) : null}
        {agent.workspaceKind === 'partner_analytics' ? <PartnerLiaisonAnalyticsPanel /> : null}
        {agent.workspaceKind === 'fleet_intelligence' ? <FleetDirectorIntelligenceFeed /> : null}
        {agent.workspaceKind === 'billing_dialog' || agent.workspaceKind === 'zatca_settings' ? (
          <p className="text-right text-sm text-slate-400">
            يُفتح هذا المكتب عبر الزر الرئيسي في البطاقة — لا حاجة لوحة فرعية هنا.
          </p>
        ) : null}
      </div>
    </StaffProfessionalCard>
  );
}
