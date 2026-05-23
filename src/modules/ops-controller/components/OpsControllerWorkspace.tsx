import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { StaffProfessionalCard } from '@/components/admin/staff/StaffProfessionalCard';
import { StaffMetricTile } from '@/components/admin/staff/StaffMetricTile';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import type { AdminPermissionKey } from '@/lib/adminPermissions';
import { FounderOperationalFeedPanel } from '@/modules/ops-controller/components/FounderOperationalFeedPanel';
import { OpsReportSubmissionForm } from '@/modules/ops-controller/components/OpsReportSubmissionForm';
import {
  OPS_CONTROLLER_DEF,
  OPS_CONTROLLER_WORKSPACE_SUBTITLE_AR,
  OPS_CONTROLLER_WORKSPACE_TITLE_AR,
} from '@/modules/ops-controller/registry';
import { OPS_MANAGER_ROLE } from '@/modules/ops-controller/types';

type Props = {
  can: (perm: AdminPermissionKey) => boolean;
  isActive?: boolean;
};

export function OpsControllerWorkspace({ can, isActive = true }: Props) {
  const canSubmit = can('submit_ops_controller');
  const canViewFeed = can('view_ops_controller') || canSubmit;
  const [feedNonce, setFeedNonce] = useState(0);

  if (!canViewFeed && !canSubmit) return null;

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-right">
        <p className={staffTheme.pageEyebrow}>Professional Sovereignty · OPS</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={staffTheme.pageTitle}>{OPS_CONTROLLER_WORKSPACE_TITLE_AR}</h2>
            <p className={staffTheme.muted}>{OPS_CONTROLLER_WORKSPACE_SUBTITLE_AR}</p>
          </div>
          <span className={staffTheme.badgeNeutral}>{OPS_MANAGER_ROLE}</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StaffMetricTile
          title="الدور"
          value={OPS_CONTROLLER_DEF.role}
          subtitle={OPS_CONTROLLER_DEF.titleAr}
          icon={ClipboardList}
          accent="violet"
        />
        <StaffMetricTile
          title="إرسال التقارير"
          value={canSubmit ? 'مفعّل' : 'قراءة فقط'}
          subtitle="submit_ops_controller"
          icon={ClipboardList}
          accent={canSubmit ? 'emerald' : 'amber'}
        />
        <StaffMetricTile
          title="التغذية"
          value={canViewFeed ? 'متصلة' : '—'}
          subtitle="Founder operational feed"
          icon={ClipboardList}
          accent="slate"
        />
      </div>

      {canSubmit ? (
        <OpsReportSubmissionForm
          disabled={!isActive}
          onSubmitted={() => setFeedNonce((n) => n + 1)}
        />
      ) : (
        <StaffProfessionalCard className="p-5">
          <p className={staffTheme.muted}>
            لديك صلاحية عرض التغذية فقط. اطلب صلاحية «إرسال تقارير مراقب العمليات» لرفع تقارير جديدة.
          </p>
        </StaffProfessionalCard>
      )}

      {canViewFeed ? (
        <FounderOperationalFeedPanel
          key={feedNonce}
          isActive={isActive}
          titleAr="سجل التقارير الأخيرة"
          subtitleAr="تظهر التقارير المرسلة هنا وفي تغذية المؤسس على النظرة العامة."
        />
      ) : null}
    </div>
  );
}
