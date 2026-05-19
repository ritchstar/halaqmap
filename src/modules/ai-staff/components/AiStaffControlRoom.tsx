import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, ChevronDown } from 'lucide-react';
import { AiStaffEmployeeCard } from '@/components/admin/AiStaffEmployeeCard';
import { OpsBillingAiAssistant } from '@/components/admin/OpsBillingAiAssistant';
import { StaffProfessionalCard } from '@/components/admin/staff/StaffProfessionalCard';
import { staffMotion, staffTheme } from '@/components/admin/staff/staffTheme';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useZatcaTaxAdvisorAttention } from '@/hooks/useZatcaTaxAdvisorAttention';
import type { AdminPermissionKey } from '@/lib/adminPermissions';
import { AiStaffAgentWorkspace } from '@/modules/ai-staff/components/AiStaffAgentWorkspace';
import { AiStaffBoundarySection } from '@/modules/ai-staff/components/AiStaffBoundarySection';
import {
  AI_STAFF_AGENT_REGISTRY,
  AI_STAFF_BOUNDARIES,
  AI_STAFF_CONTROL_ROOM_SUBTITLE,
  AI_STAFF_CONTROL_ROOM_TITLE,
  getAgentsForBoundary,
} from '@/modules/ai-staff/registry';
import type { AiStaffAgentDef, AiStaffAgentId } from '@/modules/ai-staff/types';
import { cn } from '@/lib/utils';

type ResolvedAgent = AiStaffAgentDef & { permitted: boolean };

type Props = {
  can: (perm: AdminPermissionKey) => boolean;
  canViewZatcaFinancialOffice: boolean;
  isBootstrapAdmin: boolean;
  onOpenZatcaFinancialOffice?: () => void;
};

export function AiStaffControlRoom({
  can,
  canViewZatcaFinancialOffice,
  isBootstrapAdmin,
  onOpenZatcaFinancialOffice,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [billingOpen, setBillingOpen] = useState(false);
  const [workspaceAgentId, setWorkspaceAgentId] = useState<AiStaffAgentId | null>(null);

  const agents = useMemo<ResolvedAgent[]>(
    () =>
      AI_STAFF_AGENT_REGISTRY.map((agent) => ({
        ...agent,
        permitted:
          agent.id === 'fleet_director_general'
            ? isBootstrapAdmin || agent.requiredAny.some((p) => can(p))
            : agent.requiredAny.some((p) => can(p)),
      })),
    [can, isBootstrapAdmin],
  );

  const zatcaPermitted = agents.some((a) => a.id === 'zatca_tax_advisor' && a.permitted);
  const { level: zatcaAttention } = useZatcaTaxAdvisorAttention(zatcaPermitted);

  const canSeeCovertSovereign = isBootstrapAdmin || can('manage_admins');

  const visibleBoundaries = AI_STAFF_BOUNDARIES.filter(
    (b) => !b.covert || canSeeCovertSovereign,
  );

  const workspaceAgent = workspaceAgentId
    ? agents.find((a) => a.id === workspaceAgentId) ?? null
    : null;

  const hasAnyVisibleAgent = visibleBoundaries.some((boundary) => {
    const boundaryAgents = getAgentsForBoundary(boundary.id).filter(
      (def) => agents.find((a) => a.id === def.id)?.available || def.comingSoonLabel,
    );
    return boundaryAgents.length > 0;
  });

  if (!hasAnyVisibleAgent) return null;

  const handleActivate = (agent: ResolvedAgent) => {
    if (!agent.permitted || !agent.available) return;

    if (agent.id === 'billing_treasurer') {
      setBillingOpen(true);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'zatca_tax_advisor') {
      if (!canViewZatcaFinancialOffice) return;
      onOpenZatcaFinancialOffice?.();
      setWorkspaceAgentId(null);
      return;
    }
    if (
      agent.workspaceKind === 'digital_shift_oversight' ||
      agent.workspaceKind === 'partner_analytics' ||
      agent.workspaceKind === 'fleet_intelligence'
    ) {
      setWorkspaceAgentId(agent.id);
    }
  };

  const showBillingAssistant = agents.some((a) => a.id === 'billing_treasurer' && a.permitted);

  return (
    <>
      <motion.div {...staffMotion.enter}>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <StaffProfessionalCard className="overflow-hidden p-0">
            <div className="border-b border-slate-700 px-5 py-4 md:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 space-y-1 text-right">
                  <h2 className={`${staffTheme.sectionTitle} flex items-center justify-end gap-2 text-lg`}>
                    <Bot className="h-5 w-5 shrink-0 text-slate-400" />
                    {AI_STAFF_CONTROL_ROOM_TITLE}
                  </h2>
                  <p className="mr-0 max-w-3xl text-sm leading-relaxed text-slate-400">
                    {AI_STAFF_CONTROL_ROOM_SUBTITLE}
                  </p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 gap-1 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                  >
                    {expanded ? 'طي غرفة القيادة' : 'توسيع غرفة القيادة'}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            <CollapsibleContent>
              <div className="space-y-8 px-5 pb-6 pt-5 md:px-6">
                {visibleBoundaries.map((boundary) => {
                  const boundaryDefs = getAgentsForBoundary(boundary.id);
                  const boundaryAgents = boundaryDefs
                    .map((def) => agents.find((a) => a.id === def.id))
                    .filter((a): a is ResolvedAgent => Boolean(a))
                    .filter((a) => a.available || a.comingSoonLabel);

                  if (boundaryAgents.length === 0) return null;

                  return (
                    <AiStaffBoundarySection key={boundary.id} boundary={boundary}>
                      <div className={cn('grid gap-4', boundary.gridClassName)}>
                        {boundaryAgents.map((agent) => (
                          <AiStaffEmployeeCard
                            key={agent.id}
                            shortName={agent.shortName}
                            headline={agent.title}
                            roleDescription={agent.roleDescription}
                            accentClass={agent.accentClass}
                            available={agent.available}
                            comingSoonLabel={agent.comingSoonLabel}
                            locked={agent.available && !agent.permitted}
                            statusBadgeAr={agent.statusBadgeAr}
                            ctaLabelAr={agent.ctaLabelAr}
                            iconKind={agent.iconKind}
                            eliteCovert={agent.classification === 'elite_covert'}
                            attentionLevel={
                              agent.id === 'zatca_tax_advisor' &&
                              agent.permitted &&
                              canViewZatcaFinancialOffice
                                ? zatcaAttention
                                : 'none'
                            }
                            onActivate={
                              agent.available &&
                              agent.permitted &&
                              (agent.id !== 'zatca_tax_advisor' || canViewZatcaFinancialOffice)
                                ? () => handleActivate(agent)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </AiStaffBoundarySection>
                  );
                })}

                {workspaceAgent && workspaceAgent.permitted ? (
                  <AiStaffAgentWorkspace
                    agent={workspaceAgent}
                    onClose={() => setWorkspaceAgentId(null)}
                  />
                ) : null}
              </div>
            </CollapsibleContent>
          </StaffProfessionalCard>
        </Collapsible>
      </motion.div>

      {showBillingAssistant ? (
        <OpsBillingAiAssistant
          canMutate={can('manage_centralized_billing_ops')}
          open={billingOpen}
          onOpenChange={setBillingOpen}
          hideTrigger
        />
      ) : null}
    </>
  );
}
