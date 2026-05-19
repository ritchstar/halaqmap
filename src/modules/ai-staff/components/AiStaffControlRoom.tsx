import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, ChevronDown } from 'lucide-react';
import { AiStaffEmployeeCard } from '@/components/admin/AiStaffEmployeeCard';
import { OpsBillingAiAssistant } from '@/components/admin/OpsBillingAiAssistant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.04] via-background to-background shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 space-y-1 text-right">
                  <CardTitle className="flex items-center justify-end gap-2 text-xl">
                    <Bot className="h-5 w-5 shrink-0 text-primary" />
                    {AI_STAFF_CONTROL_ROOM_TITLE}
                  </CardTitle>
                  <CardDescription className="mr-0 max-w-3xl text-sm leading-relaxed">
                    {AI_STAFF_CONTROL_ROOM_SUBTITLE}
                  </CardDescription>
                </div>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="shrink-0 gap-1">
                    {expanded ? 'طي غرفة القيادة' : 'توسيع غرفة القيادة'}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>

            <CollapsibleContent>
              <CardContent className="space-y-8 pb-6 pt-0">
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
              </CardContent>
            </CollapsibleContent>
          </Card>
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
