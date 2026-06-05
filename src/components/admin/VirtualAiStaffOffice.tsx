import { AiStaffControlRoom } from '@/modules/ai-staff/components/AiStaffControlRoom';
import type { AdminPermissionKey } from '@/lib/adminPermissions';

type Props = {
  can: (perm: AdminPermissionKey) => boolean;
  canViewZatcaFinancialOffice: boolean;
  isBootstrapAdmin?: boolean;
  onOpenZatcaFinancialOffice?: () => void;
  onOpenCommandCenter?: () => void;
  crisisLabOpen?: boolean;
  onCrisisLabOpenChange?: (open: boolean) => void;
  crisisMode?: boolean;
};

/** توافق قديم للوحة المؤسس بعد نقل الوكلاء بالكامل إلى مركز الوكلاء */
export function VirtualAiStaffOffice({
  can,
  canViewZatcaFinancialOffice,
  isBootstrapAdmin = false,
  onOpenZatcaFinancialOffice,
  onOpenCommandCenter,
  crisisLabOpen,
  onCrisisLabOpenChange,
  crisisMode,
}: Props) {
  return (
    <AiStaffControlRoom
      can={can}
      canViewZatcaFinancialOffice={canViewZatcaFinancialOffice}
      isBootstrapAdmin={isBootstrapAdmin}
      onOpenZatcaFinancialOffice={onOpenZatcaFinancialOffice}
      onOpenCommandCenter={onOpenCommandCenter}
      crisisLabOpen={crisisLabOpen}
      onCrisisLabOpenChange={onCrisisLabOpenChange}
      crisisMode={crisisMode}
      dashboardMode={true}
    />
  );
}
