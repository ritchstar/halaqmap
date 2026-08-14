/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { BriefcaseBusiness, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOBILE_FIXED_NAV_SAFE } from '@/lib/mobilePageShell';
import { PARTNER_JOIN_PATH_PRIMARY_CTA_AR } from '@/config/partnerJoinPathCopy';

type Props = {
  onRegister: () => void;
  onSalesOffice: () => void;
  className?: string;
};

/** شريط إجراء ثابت لمسار الشركاء على الجوال — انضم + مكتب المبيعات */
export function MobilePartnerActionDock({ onRegister, onSalesOffice, className }: Props) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#020912]/96 px-4 pt-3 shadow-[0_-10px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden',
        MOBILE_FIXED_NAV_SAFE,
        className,
      )}
      dir="rtl"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <button
          type="button"
          onClick={onRegister}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-teal-500 to-cyan-500 px-3 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(20,184,166,0.22)] transition active:scale-[0.98]"
        >
          <Scissors className="h-4 w-4 shrink-0" />
          {PARTNER_JOIN_PATH_PRIMARY_CTA_AR}
        </button>
        <button
          type="button"
          onClick={onSalesOffice}
          className="flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-3.5 text-sm font-bold text-white transition active:bg-white/10"
        >
          <BriefcaseBusiness className="h-4 w-4 shrink-0 text-amber-300" />
          المبيعات
        </button>
      </div>
    </div>
  );
}
