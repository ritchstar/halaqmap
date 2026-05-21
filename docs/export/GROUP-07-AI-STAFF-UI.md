# AI Staff & Founder UI Panels

> Export group `GROUP-07-AI-STAFF-UI` · Commit `b0e9e73`

### `src/modules/ai-staff/components/AiStaffControlRoom.tsx`

```tsx
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
  crisisLabOpen?: boolean;
  onCrisisLabOpenChange?: (open: boolean) => void;
  crisisMode?: boolean;
};

export function AiStaffControlRoom({
  can,
  canViewZatcaFinancialOffice,
  isBootstrapAdmin,
  onOpenZatcaFinancialOffice,
  crisisLabOpen: crisisLabOpenProp,
  onCrisisLabOpenChange,
  crisisMode: crisisModeProp,
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
    </>
  );
}

```

### `src/modules/ai-staff/components/AiStaffAgentWorkspace.tsx`

```tsx
import { X } from 'lucide-react';

import { StaffProfessionalCard } from '@/components/admin/staff/StaffProfessionalCard';

import { staffTheme } from '@/components/admin/staff/staffTheme';

import { Button } from '@/components/ui/button';

import { DigitalShiftOversightPanel } from '@/modules/ai-staff/components/DigitalShiftOversightPanel';

import { FleetDirectorIntelligenceFeed } from '@/modules/ai-staff/components/FleetDirectorIntelligenceFeed';

import { PartnerLiaisonAnalyticsPanel } from '@/modules/ai-staff/components/PartnerLiaisonAnalyticsPanel';
import { EngineeringCouncilPanel } from '@/modules/ai-staff/components/EngineeringCouncilPanel';
import { PublicProsecutorDashboard } from '@/modules/ai-staff/components/PublicProsecutorDashboard';

import type { AiStaffAgentDef } from '@/modules/ai-staff/types';

import { cn } from '@/lib/utils';



type Props = {
  agent: AiStaffAgentDef;
  onClose: () => void;
  onOpenProsecutorLab?: () => void;
  onOpenTechnicalConsultantLab?: () => void;
};

export function AiStaffAgentWorkspace({
  agent,
  onClose,
  onOpenProsecutorLab,
  onOpenTechnicalConsultantLab,
}: Props) {

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

        {agent.workspaceKind === 'prosecutor_governance' ? (
          <PublicProsecutorDashboard compact onOpenLab={onOpenProsecutorLab} />
        ) : null}

        {agent.workspaceKind === 'engineering_council' ? (
          <EngineeringCouncilPanel onOpenLab={onOpenTechnicalConsultantLab} />
        ) : null}

        {agent.workspaceKind === 'billing_dialog' || agent.workspaceKind === 'zatca_settings' ? (

          <p className="text-right text-sm text-slate-400">

            يُفتح هذا المكتب عبر الزر الرئيسي في البطاقة — لا حاجة لوحة فرعية هنا.

          </p>

        ) : null}

      </div>

    </StaffProfessionalCard>

  );

}


```

### `src/modules/ai-staff/components/EngineeringCouncilPanel.tsx`

```tsx
import { useCallback, useEffect, useState } from 'react';
import { Cog, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SELF_DEVELOPMENT_PROTOCOL_LABELS_AR } from '@/config/engineeringCouncil';
import {
  SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR,
} from '@/config/superIntelligenceFeed';
import {
  fetchEngineeringCouncil,
  proposeEngineeringTask,
  proposeProsecutorDrivenRefactor,
} from '@/lib/engineeringCouncilRemote';
import type { AgentCouncilMessage } from '@/modules/ai-staff/types';
import { toast } from '@/components/ui/sonner';

type Props = {
  onOpenLab?: () => void;
};

export function EngineeringCouncilPanel({ onOpenLab }: Props) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<AgentCouncilMessage[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchEngineeringCouncil();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setMessages(result.messages);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handlePropose = async () => {
    if (title.trim().length < 4 || description.trim().length < 12) {
      toast.error('أدخل عنواناً ووصفاً للمهمة.');
      return;
    }
    setBusy(true);
    const result = await proposeEngineeringTask({
      title: title.trim(),
      taskDescription: description.trim(),
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      result.execution?.status === 'gate_blocked'
        ? 'Prosecutor Gate BLOCKED — راجع Performance Delta.'
        : 'Super-Intelligence Protocol — Pending Founder Approval.',
    );
    setTitle('');
    setDescription('');
    void refresh();
  };

  const handleProsecutorRefactor = async () => {
    setBusy(true);
    const result = await proposeProsecutorDrivenRefactor();
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.message(result.execution ? 'Refactor من feedback المدعي العام — Pending Approval.' : result.suggestion);
    void refresh();
  };

  return (
    <div className="space-y-5 text-right">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {Object.values(SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR).map((label) => (
          <Badge key={label} variant="outline" className="border-violet-800/40 text-[10px] text-violet-200">
            {label}
          </Badge>
        ))}
        {Object.values(SELF_DEVELOPMENT_PROTOCOL_LABELS_AR).map((label) => (
          <Badge key={label} variant="outline" className="border-cyan-800/40 text-[10px] text-cyan-200">
            {label}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان المهمة الهندسية"
          className="border-slate-600 bg-slate-950 text-slate-100"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="صف refactor المطلوب — سيُستشار المدعي العام تلقائياً"
          className="min-h-[88px] border-slate-600 bg-slate-950 text-slate-100"
        />
        <div className="flex flex-wrap gap-2 justify-end">
          {onOpenLab ? (
            <Button type="button" variant="outline" size="sm" onClick={onOpenLab}>
              <MessageSquare className="ml-2 h-4 w-4" />
              محادثة Consultant
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void handleProsecutorRefactor()}
          >
            <Sparkles className="ml-2 h-4 w-4" />
            Refactor من المدعي العام
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-cyan-700 hover:bg-cyan-600 text-white"
            disabled={busy}
            onClick={() => void handlePropose()}
          >
            {busy ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Cog className="ml-2 h-4 w-4" />}
            تشغيل Protocol
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-200">Agent-to-Agent Council Bus</h4>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">جاري تحميل الرسائل…</span>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">لا رسائل بعد — ابدأ مهمة لتفعيل الاستشارة.</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {messages.map((msg) => (
              <article
                key={msg.id}
                className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2 text-sm"
              >
                <div className="mb-1 flex flex-wrap items-center justify-end gap-2 text-[10px] text-slate-500">
                  <span>{msg.fromAgent} → {msg.toAgent}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {msg.messageType}
                  </Badge>
                </div>
                <p className="font-medium text-slate-100">{msg.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-400">{msg.body.slice(0, 400)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

```

### `src/modules/ai-staff/components/EngineeringPendingApprovalsPanel.tsx`

```tsx
import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Shield, X } from 'lucide-react';
import { FounderGlassCard } from '@/components/admin/founder/FounderGlassCard';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  approveEngineeringExecutionRemote,
  fetchPendingEngineeringApprovals,
  rejectEngineeringExecutionRemote,
} from '@/lib/engineeringCouncilRemote';
import type { EngineeringExecution } from '@/modules/ai-staff/types';
import { toast } from '@/components/ui/sonner';

export function EngineeringPendingApprovalsPanel() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<EngineeringExecution[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchPendingEngineeringApprovals();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPending(result.pendingApprovals);
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const handleApprove = async (executionId: string) => {
    setBusyId(executionId);
    const result = await approveEngineeringExecutionRemote(executionId);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.messageAr);
    void refresh();
  };

  const handleReject = async (executionId: string) => {
    setBusyId(executionId);
    const result = await rejectEngineeringExecutionRemote(executionId, 'Founder rejected execution');
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.message('تم رفض التنفيذ.');
    void refresh();
  };

  return (
    <FounderGlassCard className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <Badge className="border-cyan-700/40 bg-cyan-950/40 text-cyan-100">Pending Approval</Badge>
        <div className="flex-1 space-y-1 text-right">
          <h3 className={`${founderTheme.sectionTitle} flex items-center justify-end gap-2`}>
            <Shield className="h-5 w-5 text-cyan-300" />
            موافقة التنفيذ — Engineering Wing
          </h3>
          <p className="text-sm text-slate-400">
            لا يُنفَّذ refactor على Draft Branch / Cursor إلا بعد «Approve Execution».
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري التحميل…</span>
        </div>
      ) : pending.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-6">لا مهام معلّقة — المجلس في وضع الاستعداد.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((exec) => (
            <article
              key={exec.id}
              className="rounded-lg border border-cyan-900/40 bg-slate-950/60 p-4 text-right"
            >
              <p className="font-semibold text-white">{exec.title}</p>
              <p className="mt-1 text-xs text-slate-400">{exec.taskDescription.slice(0, 200)}</p>
              {exec.draftBranch ? (
                <p className="mt-2 text-xs text-cyan-200">Draft: {exec.draftBranch}</p>
              ) : null}
              {exec.prosecutorVerdict ? (
                <p className="mt-2 text-xs text-slate-300">
                  Prosecutor:{' '}
                  {String((exec.prosecutorVerdict as { headlineAr?: string }).headlineAr ?? '—')}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-slate-600"
                  disabled={busyId === exec.id}
                  onClick={() => void handleReject(exec.id)}
                >
                  <X className="ml-2 h-4 w-4" />
                  رفض
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white"
                  disabled={busyId === exec.id}
                  onClick={() => void handleApprove(exec.id)}
                >
                  {busyId === exec.id ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="ml-2 h-4 w-4" />
                  )}
                  Approve Execution
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </FounderGlassCard>
  );
}

```

### `src/modules/ai-staff/components/SuperIntelligenceFeedPanel.tsx`

```tsx
import { useCallback, useEffect, useState } from 'react';
import { Brain, Loader2, Shield } from 'lucide-react';
import { FounderGlassCard } from '@/components/admin/founder/FounderGlassCard';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { Badge } from '@/components/ui/badge';
import {
  SUPER_INTELLIGENCE_DOCTRINE,
  SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR,
} from '@/config/superIntelligenceFeed';
import { fetchSuperIntelligenceFeed } from '@/lib/superIntelligenceFeedRemote';
import { toast } from '@/components/ui/sonner';

export function SuperIntelligenceFeedPanel() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<
    Awaited<ReturnType<typeof fetchSuperIntelligenceFeed>> extends { ok: true; snapshot: infer S }
      ? S
      : null
  >(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchSuperIntelligenceFeed();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSnapshot(result.snapshot);
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 45_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return (
    <FounderGlassCard className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <Badge className="border-violet-700/40 bg-violet-950/40 text-violet-100">
          Executive Strategic Mode
        </Badge>
        <div className="flex-1 space-y-1 text-right">
          <h3 className={`${founderTheme.sectionTitle} flex items-center justify-end gap-2`}>
            <Brain className="h-5 w-5 text-violet-300" />
            Super-Intelligence Feed
          </h3>
          <p className="text-sm text-slate-400">
            Hive Mind · Prosecutor Gate · Crisis Simulation · Performance Delta
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap justify-end gap-1">
        {Object.values(SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR).map((label) => (
          <Badge key={label} variant="outline" className="border-slate-600 text-[10px] text-slate-300">
            {label}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري تحميل Hive Mind…</span>
        </div>
      ) : snapshot ? (
        <div className="space-y-4 text-right">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Compliance Gaps" value={String(snapshot.baseline.complianceGaps)} />
            <Metric label="Radar Pulses 24h" value={String(snapshot.baseline.inspectorPulseCount24h)} />
            <Metric label="Pending Approvals" value={String(snapshot.baseline.pendingEngineeringApprovals)} />
            <Metric
              label="Handshake"
              value={snapshot.baseline.handshakeOk ? 'OK' : 'PENDING'}
              accent={snapshot.baseline.handshakeOk ? 'ok' : 'warn'}
            />
          </div>

          <div className="rounded-lg border border-slate-700/80 bg-slate-950/50 p-3">
            <p className="mb-2 flex items-center justify-end gap-2 text-xs font-semibold text-slate-300">
              <Shield className="h-4 w-4 text-violet-300" />
              Council Bus (latest)
            </p>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {snapshot.councilMessages.length === 0 ? (
                <p className="text-xs text-slate-500">لا رسائل — شغّل Engineering Protocol.</p>
              ) : (
                snapshot.councilMessages.slice(0, 8).map((msg) => (
                  <article key={msg.id} className="rounded border border-slate-800 px-2 py-1.5 text-xs">
                    <div className="flex justify-end gap-2 text-slate-500">
                      <span>{msg.message_type}</span>
                      <span>
                        {msg.from_agent} → {msg.to_agent}
                      </span>
                    </div>
                    <p className="font-medium text-slate-200">{msg.title}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <ul className="space-y-1 text-xs text-slate-400">
            {SUPER_INTELLIGENCE_DOCTRINE.slice(0, 4).map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </FounderGlassCard>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'ok' | 'warn';
}) {
  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-950/40 px-3 py-2 text-right">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`text-lg font-semibold ${
          accent === 'ok' ? 'text-emerald-300' : accent === 'warn' ? 'text-amber-300' : 'text-slate-100'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

```

### `src/modules/ai-staff/components/FounderSystemStatusPanel.tsx`

```tsx
import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, RefreshCw, ShieldAlert, Wifi } from 'lucide-react';
import { FounderGlassCard } from '@/components/admin/founder/FounderGlassCard';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  fetchEngineeringHandshakeStatus,
  runEngineeringHandshakeRemote,
  type EngineeringHandshakeSnapshot,
  type HandshakeServicePing,
} from '@/lib/engineeringHandshakeRemote';
import { toast } from '@/components/ui/sonner';

type Props = {
  onOpsControllerEnabledChange?: (enabled: boolean) => void;
};

function statusBadge(systemStatus: EngineeringHandshakeSnapshot['systemStatus']) {
  if (systemStatus === 'OK') {
    return (
      <Badge className="border-emerald-700/50 bg-emerald-950/50 text-emerald-200">
        System Status: OK
      </Badge>
    );
  }
  if (systemStatus === 'FAIL') {
    return (
      <Badge className="border-red-700/50 bg-red-950/50 text-red-200">System Status: FAIL</Badge>
    );
  }
  return (
    <Badge className="border-amber-700/50 bg-amber-950/50 text-amber-200">
      System Status: PENDING
    </Badge>
  );
}

function ServiceRow({ service }: { service: HandshakeServicePing }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 text-left">
        {service.ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <ShieldAlert className="h-4 w-4 text-red-400" />
        )}
        <span className="text-slate-300">{service.latencyMs}ms</span>
      </div>
      <div className="flex-1 text-right">
        <p className="font-medium text-slate-100">{service.label}</p>
        <p className="text-xs text-slate-400">{service.message}</p>
      </div>
    </div>
  );
}

export function FounderSystemStatusPanel({ onOpsControllerEnabledChange }: Props) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<EngineeringHandshakeSnapshot | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchEngineeringHandshakeStatus();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSnapshot(result.snapshot);
    onOpsControllerEnabledChange?.(result.snapshot.opsControllerEnabled);
  }, [onOpsControllerEnabledChange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runHandshake = async () => {
    setBusy(true);
    const result = await runEngineeringHandshakeRemote();
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSnapshot(result.snapshot);
    onOpsControllerEnabledChange?.(result.opsControllerEnabled);
    if (result.systemStatus === 'OK') {
      toast.success('Handshake OK — Operations Controller مفعّل.');
    } else {
      toast.error('Handshake FAIL — راجع المفاتيح وخدمات الاتصال.');
    }
  };

  return (
    <FounderGlassCard className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {snapshot ? statusBadge(snapshot.systemStatus) : null}
          <Badge variant="outline" className="border-cyan-700/40 text-cyan-100">
            Engineering Wing Handshake
          </Badge>
        </div>
        <div className="flex-1 space-y-1 text-right">
          <h3 className={`${founderTheme.sectionTitle} flex items-center justify-end gap-2`}>
            <Wifi className="h-5 w-5 text-cyan-300" />
            حالة النظام — Autonomous Engineering Wing
          </h3>
          <p className="text-sm text-slate-400">
            فحص رسمي لـ Supabase · Vercel · GitHub — يفعّل مراقب العمليات عند النجاح.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري قراءة حالة Handshake…</span>
        </div>
      ) : (
        <div className="space-y-4">
          {snapshot?.secretIssues?.length ? (
            <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-right text-xs text-amber-100">
              {snapshot.secretIssues.join(' · ')}
            </div>
          ) : null}

          <div className="space-y-2">
            {(snapshot?.services ?? []).length > 0 ? (
              snapshot?.services.map((service) => <ServiceRow key={service.id} service={service} />)
            ) : (
              <p className="text-center text-sm text-slate-500 py-4">
                لم يُجرَ Handshake بعد — اضغط «تشغيل Handshake».
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/80 pt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-slate-600"
                disabled={busy}
                onClick={() => void refresh()}
              >
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-cyan-700 hover:bg-cyan-600 text-white"
                disabled={busy}
                onClick={() => void runHandshake()}
              >
                {busy ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wifi className="ml-2 h-4 w-4" />
                )}
                تشغيل Handshake
              </Button>
            </div>

            {snapshot?.vercelDeploymentUrl ? (
              <a
                href={snapshot.vercelDeploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
              >
                آخر نشر Vercel
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <span className="text-xs text-slate-500">لا رابط نشر متاح بعد</span>
            )}
          </div>

          {snapshot?.opsControllerEnabled ? (
            <p className="text-right text-xs text-emerald-300">
              Operations Controller: ENABLED
            </p>
          ) : (
            <p className="text-right text-xs text-slate-500">
              Operations Controller: locked until Handshake OK
            </p>
          )}
        </div>
      )}
    </FounderGlassCard>
  );
}

```

### `src/modules/ai-staff/components/PublicProsecutorDashboard.tsx`

```tsx
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Radar, Scale, ShieldAlert } from 'lucide-react';
import { FounderGlassCard } from '@/components/admin/founder/FounderGlassCard';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  auditPublicProsecutorCompliance,
  fetchPublicProsecutorDashboard,
  repairPublicProsecutorCompliance,
  syncPublicProsecutorRadar,
} from '@/lib/publicProsecutorDashboardRemote';
import { PublicProsecutorWorkingPapers } from '@/modules/ai-staff/components/PublicProsecutorWorkingPapers';
import type { PublicProsecutorDashboardSnapshot } from '@/modules/ai-staff/types';
import { toast } from '@/components/ui/sonner';

type Props = {
  compact?: boolean;
  onOpenLab?: () => void;
};

export function PublicProsecutorDashboard({ compact = false, onOpenLab }: Props) {
  const [snapshot, setSnapshot] = useState<PublicProsecutorDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchPublicProsecutorDashboard();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSnapshot(result.snapshot);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleRadarSync = async () => {
    setSyncing(true);
    const result = await syncPublicProsecutorRadar();
    setSyncing(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (result.drafted) {
      toast.success('تم إعداد تقرير وقائي في التغذية التشغيلية.');
    } else {
      toast.message(result.reason === 'no_inspector_pattern' ? 'لا نمط Inspector حالياً.' : 'لم يُنشأ تقرير جديد.');
    }
    setSnapshot((prev) =>
      prev
        ? { ...prev, workingPapers: result.workingPapers, lastSyncedAt: new Date().toISOString() }
        : prev,
    );
  };

  const handleComplianceAudit = async () => {
    setSyncing(true);
    const result = await auditPublicProsecutorCompliance();
    setSyncing(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.message(
      result.complianceGaps > 0
        ? `رُصدت ${result.complianceGaps} فجوة امتثال في التسجيل.`
        : 'مسار ComplianceCheckbox متوافق في آخر الدفعة.',
    );
    setSnapshot((prev) =>
      prev ? { ...prev, complianceGaps: result.complianceGaps, workingPapers: result.workingPapers } : prev,
    );
  };

  const handleComplianceRepair = async () => {
    setSyncing(true);
    const result = await repairPublicProsecutorCompliance();
    setSyncing(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (result.repaired > 0) {
      toast.success(`تم إصلاح ${result.repaired} طلب(ات) — الالتزام المهني محفوظ الآن في payload.`);
    } else {
      toast.message('لا توجد طلبات قابلة للإصلاح التلقائي.');
    }
    setSnapshot((prev) =>
      prev
        ? {
            ...prev,
            complianceGaps: result.complianceGaps,
            workingPapers: result.workingPapers,
            sovereigntyAlerts: result.complianceGaps > 0 ? prev.sovereigntyAlerts : 0,
            lastSyncedAt: new Date().toISOString(),
          }
        : prev,
    );
  };

  return (
    <FounderGlassCard className={compact ? 'p-5 md:p-6' : 'p-6 md:p-7'}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
            disabled={syncing}
            onClick={() => void handleRadarSync()}
          >
            {syncing ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Radar className="ml-2 h-4 w-4" />}
            Radar Sync
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
            disabled={syncing}
            onClick={() => void handleComplianceAudit()}
          >
            <Scale className="ml-2 h-4 w-4" />
            Compliance Audit
          </Button>
          {(snapshot?.complianceGaps ?? 0) > 0 ? (
            <Button
              type="button"
              size="sm"
              className="bg-red-900/80 text-red-50 hover:bg-red-800"
              disabled={syncing}
              onClick={() => void handleComplianceRepair()}
            >
              {syncing ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              إصلاح الامتثال
            </Button>
          ) : null}
          {onOpenLab ? (
            <Button
              type="button"
              size="sm"
              className="bg-slate-100 text-slate-900 hover:bg-white"
              onClick={onOpenLab}
            >
              مكتب المدعي العام
            </Button>
          ) : null}
        </div>
        <div className="flex-1 space-y-2 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge className="border-slate-500 bg-slate-900 text-slate-200">Central Governance</Badge>
            {snapshot?.crisisWatchActive ? (
              <Badge className="border-orange-700/50 bg-orange-950/40 text-orange-200">Crisis Watch</Badge>
            ) : null}
          </div>
          <h3 className={`${founderTheme.sectionTitle} flex items-center justify-end gap-2`}>
            <ShieldAlert className="h-5 w-5 text-slate-300" />
            أوراق عمل المدعي العام
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            تجميع استباقي لتقارير الامتثال — Radar · B2B Registration · Crisis Watch · Professional Sovereignty.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري تحميل أوراق العمل…</span>
        </div>
      ) : snapshot ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Inspector (24س)', value: snapshot.inspectorPulseCount24h },
              { label: 'فجوات امتثال', value: snapshot.complianceGaps },
              { label: 'تنبيهات سيادة', value: snapshot.sovereigntyAlerts },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-4 py-3 text-right"
              >
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-xl font-bold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
          <PublicProsecutorWorkingPapers papers={snapshot.workingPapers} compact={compact} />
        </>
      ) : null}
    </FounderGlassCard>
  );
}

```

### `src/components/admin/TechnicalConsultantLabChat.tsx`

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Cog, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { chatWithTechnicalConsultantLab } from '@/lib/technicalConsultantLabRemote';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const GREETING =
  '⚙️ **Technical Consultant — Autonomous Engineering Wing**\n\n' +
  'Self-Development Protocol:\n' +
  '1. Propose Plan\n' +
  '2. Consult Public Prosecutor\n' +
  '3. Draft Branch\n' +
  '4. Unit Tests\n' +
  '5. Pending Founder Approval\n\n' +
  'Describe a refactor or cross-agent consultation.';

type Props = {
  permitted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
};

export function TechnicalConsultantLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = useCallback(async () => {
    if (!permitted || busy) return;
    const text = input.trim();
    if (!text) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setBusy(true);

    try {
      const r = await chatWithTechnicalConsultantLab({
        userMessage: text,
        conversationHistory: history,
      });
      if (!r.ok) {
        toast({ title: r.error, variant: 'destructive' });
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${r.error}` }]);
        return;
      }
      setMessages((m) => [...m, { role: 'assistant', content: r.reply }]);
    } finally {
      setBusy(false);
    }
  }, [busy, input, messages, permitted]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2 border-cyan-700/40">
            <Cog className="h-4 w-4" />
            Technical Consultant
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-cyan-900/40 bg-slate-950 p-0 sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 border-b border-cyan-900/30 bg-slate-900 px-4 py-4 text-right">
          <SheetTitle className="flex items-center justify-end gap-2 text-slate-50">
            <Cog className="h-5 w-5 text-cyan-300" />
            Engineering Wing
          </SheetTitle>
          <SheetDescription className="text-right text-slate-300">
            <Badge variant="outline" className="border-cyan-700/40 text-[10px]">
              Self-Development Protocol · A2A Council
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-3 pb-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'mr-8 bg-cyan-950/30 text-slate-100'
                    : 'ml-8 border border-cyan-900/30 bg-slate-900/80 text-slate-200'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {busy ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                استشارة المدعي العام…
              </div>
            ) : null}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="shrink-0 space-y-2 border-t border-cyan-900/30 p-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="صف refactor أو استشارة cross-agent…"
            className="min-h-[80px] border-slate-600 bg-slate-900 text-right"
            disabled={!permitted || busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="button"
            className="w-full bg-cyan-700 hover:bg-cyan-600"
            disabled={!permitted || busy || !input.trim()}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

```

### `src/components/admin/PublicProsecutorLabChat.tsx`

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Gavel, Loader2, Send, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { PublicProsecutorInterjectBanner } from '@/components/admin/PublicProsecutorInterjectBanner';
import {
  chatWithPublicProsecutorLab,
  fetchPublicProsecutorLabDiagnostics,
} from '@/lib/publicProsecutorLabRemote';
import type { PublicProsecutorGovernanceAction } from '@/modules/ai-staff/types';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const LOADING_STEPS = [
  'يراجع سجلات المختبرات…',
  'يزامن Platform Radar…',
  'يدقّق ComplianceCheckbox…',
  'يجهّز توجيه الحوكمة…',
] as const;

const GREETING =
  '⚖️ **مكتب المدعي العام الرقمي — Central Governance**\n\n' +
  'أنا **ضابط الامتثال والحوكمة الاستراتيجية**. صلاحيتي:\n' +
  '- قراءة مختبرات ZATCA · Crisis Advisor · Fleet Director.\n' +
  '- Radar Sync · Compliance Enforcement · Crisis Watch.\n' +
  '- **سلطة المقاطعة (Interject)** عند انحراف إجرائي.\n\n' +
  'صف الانحراف أو اطلب تدقيقاً استباقياً.';

type Props = {
  permitted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
};

function LoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 animate-in fade-in space-y-2 rounded-lg border border-slate-600/50 bg-slate-900/80 p-4">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 animate-pulse text-slate-300" />
        <p className="text-sm text-slate-100">{label}</p>
      </div>
    </div>
  );
}

export function PublicProsecutorLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [modelLabel, setModelLabel] = useState<string | null>(null);
  const [lastInterject, setLastInterject] = useState<PublicProsecutorGovernanceAction | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open || !permitted) return;
    void fetchPublicProsecutorLabDiagnostics().then((r) => {
      if (r.ok && r.model) setModelLabel(r.model);
      else if (!r.ok && r.error) toast({ title: r.error, variant: 'destructive' });
    });
  }, [open, permitted]);

  useEffect(() => {
    if (!busy) {
      setLoadingStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingStep((p) => (p + 1) % LOADING_STEPS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [busy]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy, lastInterject]);

  const send = useCallback(async () => {
    if (!permitted || busy) return;
    const text = input.trim();
    if (!text) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const historyForApi = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setBusy(true);
    setLastInterject(null);

    try {
      const r = await chatWithPublicProsecutorLab(
        { userMessage: text, conversationHistory: historyForApi },
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      if (r.ok === false) {
        toast({ title: r.error, variant: 'destructive' });
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${r.error}` }]);
        return;
      }

      if (r.interject) setLastInterject(r.interject);
      setMessages((m) => [...m, { role: 'assistant', content: r.reply }]);
    } finally {
      setBusy(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [busy, input, messages, permitted]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-slate-500 text-slate-100"
          >
            <Gavel className="h-4 w-4" />
            المدعي العام
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-slate-700 bg-slate-950 p-0 text-slate-100 sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 border-b border-slate-700 bg-slate-900 px-4 py-4 text-right">
          <SheetTitle className="flex items-center justify-end gap-2 text-slate-50">
            <Gavel className="h-5 w-5 text-slate-300" aria-hidden />
            مكتب المدعي العام
          </SheetTitle>
          <SheetDescription className="space-y-2 text-right text-slate-300">
            <Badge variant="outline" className="mr-auto border-slate-500 text-[10px]">
              Central Governance · Professional Sovereignty
            </Badge>
            <span className="block text-xs">
              Radar Sync · Compliance Enforcement · Crisis Watch · Interject Authority
            </span>
            {modelLabel ? (
              <Badge variant="outline" className="mr-auto block w-fit border-slate-600 text-[10px]">
                {modelLabel}
              </Badge>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-3 pb-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed text-slate-100 ${
                  msg.role === 'user'
                    ? 'mr-8 ml-0 bg-slate-800'
                    : 'ml-8 mr-0 border border-slate-600/50 bg-slate-900/80'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {lastInterject ? <PublicProsecutorInterjectBanner interject={lastInterject} /> : null}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="shrink-0 space-y-2 border-t border-slate-700 bg-slate-950 p-4">
          {busy ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-slate-100 hover:bg-slate-800"
              onClick={() => abortRef.current?.abort()}
            >
              <X className="ml-2 h-4 w-4" />
              إيقاف
            </Button>
          ) : null}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="صف الانحراف الإجرائي أو اطلب تدقيق حوكمة…"
            className="min-h-[88px] resize-none border-slate-600 bg-slate-900 text-right text-slate-100 placeholder:text-slate-500"
            disabled={!permitted || busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="button"
            className="w-full gap-2 bg-slate-100 text-slate-900 hover:bg-white"
            disabled={!permitted || busy || !input.trim()}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال — توجيه الحوكمة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

```

### `src/components/admin/SystemCrisisAdvisorLabChat.tsx`

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send, ShieldAlert, Siren, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  chatWithSystemCrisisAdvisorLab,
  fetchSystemCrisisAdvisorLabDiagnostics,
} from '@/lib/systemCrisisAdvisorLabRemote';
import { evaluatePublicProsecutorInterject } from '@/lib/publicProsecutorLabRemote';
import { PublicProsecutorInterjectBanner } from '@/components/admin/PublicProsecutorInterjectBanner';
import type { PublicProsecutorGovernanceAction } from '@/modules/ai-staff/types';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const LOADING_STEPS = [
  'يقرأ Crisis Playbook…',
  'يُقيّم Uptime وسلامة البيانات…',
  'يرتّب الأولويات P0/P1…',
  'يجهّز خطة التعافي…',
] as const;

const GREETING =
  '🚨 **Crisis Discussion — مستشار الأزمات التقنية**\n\n' +
  'أنا **Strategic Technical Consultant** لمنصة **حلاق ماب**. في هذا الخيط:\n' +
  '- **Uptime** و**Data integrity** فقط — لا UX ولا تحسينات غير حرجة.\n' +
  '- أرتّب مهامك P0→P2 وفق **Crisis Playbook**.\n' +
  '- أعرف بنية: Vercel API · Supabase RLS · Moyasar · ops-controller · AI staff.\n\n' +
  'صف الأعراض: ماذا توقف؟ متى بدأ؟ من المتأثر (مستهلك / شريك / دفع / إدارة)؟';

const PANIC_SEED =
  'تفعيل بروtokol الأزمة — قدّم تقييماً فورياً P0/P1: Uptime، سلامة البيانات، وخطوات الـ 5 دقائق الأولى.';

type Props = {
  permitted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  /** Opens with crisis protocol — used by founder panic button */
  crisisMode?: boolean;
};

function LoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 rounded-lg border border-orange-500/35 bg-orange-950/25 p-4 space-y-2 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-orange-400 animate-pulse" />
        <p className="text-sm text-slate-100">{label}</p>
      </div>
    </div>
  );
}

export function SystemCrisisAdvisorLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
  crisisMode = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [modelLabel, setModelLabel] = useState<string | null>(null);
  const [playbookOk, setPlaybookOk] = useState<boolean | null>(null);
  const [prosecutorInterject, setProsecutorInterject] = useState<PublicProsecutorGovernanceAction | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const panicBootstrappedRef = useRef(false);

  useEffect(() => {
    if (!open || !permitted) return;
    void fetchSystemCrisisAdvisorLabDiagnostics().then((r) => {
      if (r.ok) {
        if (r.model) setModelLabel(r.model);
        setPlaybookOk(r.playbookLoaded);
      } else if (r.error) {
        toast({ title: r.error, variant: 'destructive' });
      }
    });
  }, [open, permitted]);

  useEffect(() => {
    if (!open) {
      panicBootstrappedRef.current = false;
      return;
    }
    if (!crisisMode || panicBootstrappedRef.current || !permitted) return;
    panicBootstrappedRef.current = true;
    setMessages([{ role: 'assistant', content: GREETING }]);
    setInput(PANIC_SEED);
  }, [open, crisisMode, permitted]);

  useEffect(() => {
    if (!busy) {
      setLoadingStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingStep((p) => (p + 1) % LOADING_STEPS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [busy]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = useCallback(async () => {
    if (!permitted || busy) return;
    const text = input.trim();
    if (!text) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const historyForApi = messages.map((m) => ({ role: m.role, content: m.content }));
    const isFirstUserInCrisis =
      crisisMode && historyForApi.filter((m) => m.role === 'user').length === 0;

    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setBusy(true);
    setProsecutorInterject(null);

    try {
      const r = await chatWithSystemCrisisAdvisorLab(
        {
          userMessage: text,
          crisisMode: isFirstUserInCrisis,
          conversationHistory: historyForApi,
        },
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      if (r.ok === false) {
        toast({ title: r.error, variant: 'destructive' });
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${r.error}` }]);
        return;
      }

      setMessages((m) => [...m, { role: 'assistant', content: r.reply }]);

      const interjectScan = await evaluatePublicProsecutorInterject({
        userMessage: text,
        assistantSnippet: r.reply,
        watchAgent: 'system_crisis_advisor',
        crisisMode: isFirstUserInCrisis || crisisMode,
      });
      if (interjectScan.ok && interjectScan.interject) {
        setProsecutorInterject(interjectScan.interject);
      }
    } finally {
      setBusy(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [busy, crisisMode, input, messages, permitted]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2 border-orange-500/40 text-slate-100">
            <ShieldAlert className="h-4 w-4" />
            مستشار الأزمات
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-orange-900/50 bg-slate-950 p-0 text-slate-100 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-orange-900/40 bg-orange-950/20 px-4 py-4 text-right shrink-0">
          <SheetTitle className="flex items-center justify-end gap-2 text-slate-50">
            <Siren className="h-5 w-5 text-orange-400" aria-hidden />
            Crisis Discussion
          </SheetTitle>
          <SheetDescription className="text-right space-y-2 text-slate-100">
            <Badge
              variant="outline"
              className="mr-auto border-orange-500/50 text-[10px] text-slate-50"
            >
              Strategic Technical Consultant · B2B Internal
            </Badge>
            <span className="block text-xs text-slate-100">
              Uptime · Data integrity · Crisis Playbook — تجاهل الملاحظات غير الحرجة.
            </span>
            {playbookOk === false ? (
              <Badge variant="destructive" className="mr-auto text-[10px] text-white">
                Crisis Playbook غير محمّل على الخادم
              </Badge>
            ) : null}
            {modelLabel ? (
              <Badge
                variant="outline"
                className="mr-auto block w-fit border-orange-500/30 text-[10px] text-slate-100"
              >
                {modelLabel}
              </Badge>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-3 pb-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-100 ${
                  msg.role === 'user'
                    ? 'mr-8 ml-0 bg-orange-500/10'
                    : 'ml-8 mr-0 border border-orange-500/25 bg-orange-950/20'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
            {prosecutorInterject ? (
              <PublicProsecutorInterjectBanner interject={prosecutorInterject} />
            ) : null}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t border-orange-900/40 bg-slate-950 p-4 space-y-2">
          {busy ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-slate-100 hover:text-white hover:bg-orange-950/40"
              onClick={() => abortRef.current?.abort()}
            >
              <X className="h-4 w-4 ml-2" />
              إيقاف
            </Button>
          ) : null}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="صف الحادث — الأعراض، التوقيت، النطاق المتأثر…"
            className="min-h-[88px] resize-none border-orange-900/40 bg-slate-900 text-right text-slate-100 placeholder:text-slate-400"
            disabled={!permitted || busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="button"
            className="w-full gap-2 bg-orange-700 hover:bg-orange-600 text-white"
            disabled={!permitted || busy || !input.trim()}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال — أولوية الأزمة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

```

### `src/components/admin/PublicProsecutorInterjectBanner.tsx`

```tsx
import type { PublicProsecutorGovernanceAction } from '@/modules/ai-staff/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  interject: PublicProsecutorGovernanceAction;
  className?: string;
};

export function PublicProsecutorInterjectBanner({ interject, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-right',
        interject.severity === 'urgent'
          ? 'border-red-800/60 bg-red-950/40 text-red-100'
          : 'border-amber-700/50 bg-amber-950/30 text-amber-100',
        className,
      )}
      role="alert"
    >
      <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
        <Badge className="border-slate-500 bg-slate-950 text-[10px] text-slate-200">المدعي العام</Badge>
        {interject.p0RecoveryRequired ? (
          <Badge variant="destructive" className="text-[10px]">
            P0 Required
          </Badge>
        ) : null}
      </div>
      <p className="text-sm font-bold">{interject.headlineAr}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-200">{interject.directiveAr}</p>
      {interject.targetAgent ? (
        <p className="mt-2 text-[11px] text-slate-400">الوكيل المستهدف: {interject.targetAgent}</p>
      ) : null}
    </div>
  );
}

```
