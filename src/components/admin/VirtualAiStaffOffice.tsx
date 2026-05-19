import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  ADMIN_AI_STAFF_AGENTS,
  AI_STAFF_OFFICE_SUBTITLE,
  AI_STAFF_OFFICE_TITLE,
  type AiStaffAgentId,
} from '@/config/adminAiStaffOffice';
import type { AdminPermissionKey } from '@/lib/adminPermissions';
import { AiStaffEmployeeCard } from '@/components/admin/AiStaffEmployeeCard';
import { OpsBillingAiAssistant } from '@/components/admin/OpsBillingAiAssistant';
import { useZatcaTaxAdvisorAttention } from '@/hooks/useZatcaTaxAdvisorAttention';
import { cn } from '@/lib/utils';

type Props = {
  can: (perm: AdminPermissionKey) => boolean;
  canViewZatcaFinancialOffice: boolean;
  onOpenZatcaFinancialOffice?: () => void;
};

export function VirtualAiStaffOffice({
  can,
  canViewZatcaFinancialOffice,
  onOpenZatcaFinancialOffice,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [billingOpen, setBillingOpen] = useState(false);

  const agents = useMemo(
    () =>
      ADMIN_AI_STAFF_AGENTS.map((agent) => ({
        ...agent,
        permitted: agent.requiredAny.some((p) => can(p)),
      })),
    [can],
  );

  const zatcaPermitted = agents.some((a) => a.id === 'zatca_tax_advisor' && a.permitted);
  const { level: zatcaAttention } = useZatcaTaxAdvisorAttention(zatcaPermitted);

  const visibleAgents = agents.filter((a) => a.available || a.comingSoonLabel);
  if (visibleAgents.length === 0) return null;

  const onActivate = (id: AiStaffAgentId, permitted: boolean) => {
    if (!permitted) return;
    if (id === 'billing_treasurer') setBillingOpen(true);
    if (id === 'zatca_tax_advisor') {
      if (!canViewZatcaFinancialOffice) return;
      onOpenZatcaFinancialOffice?.();
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
                <div className="space-y-1 text-right flex-1">
                  <CardTitle className="flex items-center gap-2 text-xl justify-end">
                    <Bot className="h-5 w-5 text-primary shrink-0" />
                    {AI_STAFF_OFFICE_TITLE}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed max-w-3xl mr-0 ml-auto">
                    {AI_STAFF_OFFICE_SUBTITLE}
                  </CardDescription>
                </div>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="gap-1 shrink-0">
                    {expanded ? 'طي المكتب' : 'توسيع المكتب'}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>

            <CollapsibleContent>
              <CardContent className="pt-0 pb-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {visibleAgents.map((agent) => (
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
                          ? () => onActivate(agent.id, agent.permitted)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {showBillingAssistant && (
        <OpsBillingAiAssistant
          canMutate={can('manage_centralized_billing_ops')}
          open={billingOpen}
          onOpenChange={setBillingOpen}
          hideTrigger
        />
      )}
    </>
  );
}
