import { AiStaffControlRoom } from '@/modules/ai-staff/components/AiStaffControlRoom';
import type { AdminPermissionKey } from '@/lib/adminPermissions';

type Props = {
  can: (perm: AdminPermissionKey) => boolean;
  canViewZatcaFinancialOffice: boolean;
  isBootstrapAdmin?: boolean;
  onOpenZatcaFinancialOffice?: () => void;
};

/** @deprecated Use `AiStaffControlRoom` — thin compatibility wrapper. */
export function VirtualAiStaffOffice({
  can,
  canViewZatcaFinancialOffice,
  isBootstrapAdmin = false,
  onOpenZatcaFinancialOffice,
}: Props) {
  return (
    <AiStaffControlRoom
      can={can}
      canViewZatcaFinancialOffice={canViewZatcaFinancialOffice}
      isBootstrapAdmin={isBootstrapAdmin}
      onOpenZatcaFinancialOffice={onOpenZatcaFinancialOffice}
    />
  );
}
