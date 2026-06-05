import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, ChevronDown } from 'lucide-react';
import { AiStaffEmployeeCard } from '@/components/admin/AiStaffEmployeeCard';
import { OpsBillingAiAssistant } from '@/components/admin/OpsBillingAiAssistant';
import { DigitalShiftAdminLabChat } from '@/components/admin/DigitalShiftAdminLabChat';
import { PartnerLiaisonAdminLabChat } from '@/components/admin/PartnerLiaisonAdminLabChat';
import { FleetDirectorAdminLabChat } from '@/components/admin/FleetDirectorAdminLabChat';
import { SystemCrisisAdvisorLabChat } from '@/components/admin/SystemCrisisAdvisorLabChat';
import { PublicProsecutorLabChat } from '@/components/admin/PublicProsecutorLabChat';
import { TechnicalConsultantLabChat } from '@/components/admin/TechnicalConsultantLabChat';
import { ZatcaAdvisorLabChat } from '@/components/admin/ZatcaAdvisorLabChat';
import { MarketingCouncilLabChat } from '@/components/admin/MarketingCouncilLabChat';
import { MediaSpokespersonLabChat } from '@/components/admin/MediaSpokespersonLabChat';
import { CyberDefenseCommanderLabChat } from '@/components/admin/CyberDefenseCommanderLabChat';
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

const HUB_BOUNDARY_ORDER = [
  'supreme_defense',
  'covert_sovereign',
  'internal_governance',
  'engineering_council',
  'marketing_council',
  'media_office',
  'external_partner_ops',
  'legal_governance',
] as const;

type Props = {
  can: (perm: AdminPermissionKey) => boolean;
  canViewZatcaFinancialOffice: boolean;
  isBootstrapAdmin: boolean;
  onOpenZatcaFinancialOffice?: () => void;
  onOpenCommandCenter?: () => void;
  crisisLabOpen?: boolean;
  onCrisisLabOpenChange?: (open: boolean) => void;
  crisisMode?: boolean;
  /** وضع العرض: dashboard = إخفاء بطاقات الوكلاء من لوحة المؤسس · hub = عرض مركز الوكلاء الكامل */
  dashboardMode?: boolean;
};

export function AiStaffControlRoom({
  can,
  canViewZatcaFinancialOffice,
  isBootstrapAdmin,
  onOpenZatcaFinancialOffice,
  onOpenCommandCenter,
  crisisLabOpen: crisisLabOpenProp,
  onCrisisLabOpenChange,
  crisisMode: crisisModeProp,
  dashboardMode = false,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [billingOpen, setBillingOpen] = useState(false);
  const [digitalShiftLabOpen, setDigitalShiftLabOpen] = useState(false);
  const [zatcaLabOpen, setZatcaLabOpen] = useState(false);
  const [partnerLiaisonLabOpen, setPartnerLiaisonLabOpen] = useState(false);
  const [fleetDirectorLabOpen, setFleetDirectorLabOpen] = useState(false);
  const [crisisAdvisorLabInternalOpen, setCrisisAdvisorLabInternalOpen] = useState(false);
  const [publicProsecutorLabOpen, setPublicProsecutorLabOpen] = useState(false);
  const [technicalConsultantLabOpen, setTechnicalConsultantLabOpen] = useState(false);
  const [b2cMarketingLabOpen, setB2cMarketingLabOpen] = useState(false);
  const [b2bMarketingLabOpen, setB2bMarketingLabOpen] = useState(false);
  const [mediaSpokespersonLabOpen, setMediaSpokespersonLabOpen] = useState(false);
  const [cyberDefenseLabOpen, setCyberDefenseLabOpen] = useState(false);
  const [crisisModeActive, setCrisisModeActive] = useState(false);

  const crisisLabControlled = crisisLabOpenProp !== undefined && onCrisisLabOpenChange !== undefined;
  const crisisAdvisorLabOpen = crisisLabControlled ? crisisLabOpenProp : crisisAdvisorLabInternalOpen;
  const setCrisisAdvisorLabOpen = crisisLabControlled
    ? onCrisisLabOpenChange!
    : setCrisisAdvisorLabInternalOpen;
  const crisisMode = crisisModeProp ?? crisisModeActive;
  const [workspaceAgentId, setWorkspaceAgentId] = useState<AiStaffAgentId | null>(null);

  const agents = useMemo<ResolvedAgent[]>(
    () =>
      AI_STAFF_AGENT_REGISTRY.map((agent) => ({
        ...agent,
        permitted:
          agent.id === 'fleet_director_general' || agent.id === 'cyber_defense_commander'
            ? isBootstrapAdmin || agent.requiredAny.some((p) => can(p))
            : agent.requiredAny.some((p) => can(p)),
      })),
    [can, isBootstrapAdmin],
  );

  const zatcaPermitted = agents.some((a) => a.id === 'zatca_tax_advisor' && a.permitted);
  const { level: zatcaAttention } = useZatcaTaxAdvisorAttention(zatcaPermitted);

  const canSeeCovertSovereign = isBootstrapAdmin || can('manage_admins');

  const visibleBoundaries = AI_STAFF_BOUNDARIES
    .filter((b) => {
      if (dashboardMode) return false;
      return !b.covert || canSeeCovertSovereign;
    })
    .sort((a, b) => {
      const aIndex = HUB_BOUNDARY_ORDER.indexOf(a.id as (typeof HUB_BOUNDARY_ORDER)[number]);
      const bIndex = HUB_BOUNDARY_ORDER.indexOf(b.id as (typeof HUB_BOUNDARY_ORDER)[number]);
      const safeAIndex = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const safeBIndex = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      return safeAIndex - safeBIndex;
    });

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

    if (agent.id === 'cyber_defense_commander') {
      setCyberDefenseLabOpen(true);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setCrisisAdvisorLabOpen(false);
      setPublicProsecutorLabOpen(false);
      setTechnicalConsultantLabOpen(false);
      setB2cMarketingLabOpen(false);
      setB2bMarketingLabOpen(false);
      setMediaSpokespersonLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'billing_treasurer') {
      setBillingOpen(true);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'digital_shift_field') {
      setDigitalShiftLabOpen(true);
      setBillingOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'zatca_tax_advisor') {
      if (!canViewZatcaFinancialOffice) return;
      setZatcaLabOpen(true);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'partner_relations_liaison') {
      setPartnerLiaisonLabOpen(true);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'fleet_director_general') {
      setFleetDirectorLabOpen(true);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setCrisisAdvisorLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'system_crisis_advisor') {
      setCrisisModeActive(false);
      setCrisisAdvisorLabOpen(true);
      setPublicProsecutorLabOpen(false);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'public_prosecutor') {
      setPublicProsecutorLabOpen(true);
      setTechnicalConsultantLabOpen(false);
      setCrisisAdvisorLabOpen(false);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId('public_prosecutor');
      return;
    }
    if (agent.id === 'technical_consultant_engineering') {
      setTechnicalConsultantLabOpen(true);
      setPublicProsecutorLabOpen(false);
      setCrisisAdvisorLabOpen(false);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId('technical_consultant_engineering');
      return;
    }
    if (agent.id === 'b2c_marketing_strategist') {
      setB2cMarketingLabOpen(true);
      setB2bMarketingLabOpen(false);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'b2b_marketing_strategist') {
      setB2bMarketingLabOpen(true);
      setB2cMarketingLabOpen(false);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.id === 'media_spokesperson') {
      setMediaSpokespersonLabOpen(true);
      setB2cMarketingLabOpen(false);
      setB2bMarketingLabOpen(false);
      setBillingOpen(false);
      setDigitalShiftLabOpen(false);
      setZatcaLabOpen(false);
      setPartnerLiaisonLabOpen(false);
      setFleetDirectorLabOpen(false);
      setWorkspaceAgentId(null);
      return;
    }
    if (agent.workspaceKind === 'fleet_intelligence') {
      setWorkspaceAgentId(agent.id);
    }
  };

  const showBillingAssistant = agents.some((a) => a.id === 'billing_treasurer' && a.permitted);
  const showDigitalShiftLab = agents.some((a) => a.id === 'digital_shift_field' && a.permitted);
  const showZatcaLab = agents.some(
    (a) => a.id === 'zatca_tax_advisor' && a.permitted && canViewZatcaFinancialOffice,
  );
  const showPartnerLiaisonLab = agents.some((a) => a.id === 'partner_relations_liaison' && a.permitted);
  const showFleetDirectorLab = agents.some((a) => a.id === 'fleet_director_general' && a.permitted);
  const showCrisisAdvisorLab = agents.some((a) => a.id === 'system_crisis_advisor' && a.permitted);
  const showPublicProsecutorLab = agents.some((a) => a.id === 'public_prosecutor' && a.permitted);
  const showTechnicalConsultantLab = agents.some(
    (a) => a.id === 'technical_consultant_engineering' && a.permitted,
  );
  const showB2cMarketingLab = agents.some(
    (a) => a.id === 'b2c_marketing_strategist' && a.permitted,
  );
  const showB2bMarketingLab = agents.some(
    (a) => a.id === 'b2b_marketing_strategist' && a.permitted,
  );
  const showMediaSpokespersonLab = agents.some(
    (a) => a.id === 'media_spokesperson' && a.permitted,
  );
  const showCyberDefenseLab = agents.some(
    (a) => a.id === 'cyber_defense_commander' && a.permitted,
  );

  const openPartnerReportsPanel = () => {
    setPartnerLiaisonLabOpen(false);
    setWorkspaceAgentId('partner_relations_liaison');
  };

  const openFleetIntelligenceFeed = () => {
    setFleetDirectorLabOpen(false);
    setWorkspaceAgentId('fleet_director_general');
  };

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
                            retired={Boolean(agent.retired)}
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
                    onOpenProsecutorLab={() => setPublicProsecutorLabOpen(true)}
                    onOpenTechnicalConsultantLab={() => setTechnicalConsultantLabOpen(true)}
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

      {showDigitalShiftLab ? (
        <DigitalShiftAdminLabChat
          permitted
          open={digitalShiftLabOpen}
          onOpenChange={setDigitalShiftLabOpen}
          hideTrigger
        />
      ) : null}

      {showZatcaLab ? (
        <ZatcaAdvisorLabChat
          permitted
          open={zatcaLabOpen}
          onOpenChange={setZatcaLabOpen}
          hideTrigger
          onOpenFinancialOffice={onOpenZatcaFinancialOffice}
        />
      ) : null}

      {showPartnerLiaisonLab ? (
        <PartnerLiaisonAdminLabChat
          permitted
          open={partnerLiaisonLabOpen}
          onOpenChange={setPartnerLiaisonLabOpen}
          hideTrigger
          onOpenReportsPanel={openPartnerReportsPanel}
        />
      ) : null}

      {showFleetDirectorLab ? (
        <FleetDirectorAdminLabChat
          permitted
          open={fleetDirectorLabOpen}
          onOpenChange={setFleetDirectorLabOpen}
          hideTrigger
          onOpenIntelligenceFeed={openFleetIntelligenceFeed}
        />
      ) : null}

      {showCrisisAdvisorLab ? (
        <SystemCrisisAdvisorLabChat
          permitted
          open={crisisAdvisorLabOpen}
          onOpenChange={(next) => {
            setCrisisAdvisorLabOpen(next);
            if (!next) setCrisisModeActive(false);
          }}
          hideTrigger
          crisisMode={crisisMode}
        />
      ) : null}

      {showPublicProsecutorLab ? (
        <PublicProsecutorLabChat
          permitted
          open={publicProsecutorLabOpen}
          onOpenChange={setPublicProsecutorLabOpen}
          hideTrigger
        />
      ) : null}

      {showTechnicalConsultantLab ? (
        <TechnicalConsultantLabChat
          permitted
          open={technicalConsultantLabOpen}
          onOpenChange={setTechnicalConsultantLabOpen}
          hideTrigger
        />
      ) : null}

      {showB2cMarketingLab ? (
        <MarketingCouncilLabChat
          channel="b2c"
          permitted
          open={b2cMarketingLabOpen}
          onOpenChange={setB2cMarketingLabOpen}
          hideTrigger
          onSummonProsecutor={
            showPublicProsecutorLab ? () => setPublicProsecutorLabOpen(true) : undefined
          }
        />
      ) : null}

      {showB2bMarketingLab ? (
        <MarketingCouncilLabChat
          channel="b2b"
          permitted
          open={b2bMarketingLabOpen}
          onOpenChange={setB2bMarketingLabOpen}
          hideTrigger
          canManageCommandCenter={can('manage_command_center')}
          onOpenCommandCenter={onOpenCommandCenter}
          onSummonProsecutor={
            showPublicProsecutorLab ? () => setPublicProsecutorLabOpen(true) : undefined
          }
        />
      ) : null}

      {showMediaSpokespersonLab ? (
        <MediaSpokespersonLabChat
          permitted
          open={mediaSpokespersonLabOpen}
          onOpenChange={setMediaSpokespersonLabOpen}
          hideTrigger
          onSummonProsecutor={
            showPublicProsecutorLab ? () => setPublicProsecutorLabOpen(true) : undefined
          }
          onSummonCrisisAdvisor={
            showCrisisAdvisorLab ? () => setCrisisAdvisorLabOpen(true) : undefined
          }
          onSummonB2cMarketing={
            showB2cMarketingLab ? () => setB2cMarketingLabOpen(true) : undefined
          }
          onSummonB2bMarketing={
            showB2bMarketingLab ? () => setB2bMarketingLabOpen(true) : undefined
          }
        />
      ) : null}

      {showCyberDefenseLab ? (
        <CyberDefenseCommanderLabChat
          permitted
          open={cyberDefenseLabOpen}
          onOpenChange={setCyberDefenseLabOpen}
          hideTrigger
          onSummonProsecutor={
            showPublicProsecutorLab ? () => setPublicProsecutorLabOpen(true) : undefined
          }
          onSummonCrisisAdvisor={
            showCrisisAdvisorLab ? () => setCrisisAdvisorLabOpen(true) : undefined
          }
          onSummonTechnicalConsultant={
            showTechnicalConsultantLab ? () => setTechnicalConsultantLabOpen(true) : undefined
          }
          onSummonFleetDirector={
            showFleetDirectorLab ? () => setFleetDirectorLabOpen(true) : undefined
          }
        />
      ) : null}
    </>
  );
}
