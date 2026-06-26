import { BriefcaseBusiness, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOBILE_FIXED_NAV_SAFE } from '@/lib/mobilePageShell';

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
        'fixed inset-x-0 bottom-0 z-[60] border-t border-amber-200/80 bg-white/96 px-4 pt-3 shadow-[0_-10px_36px_rgba(15,23,42,0.12)] backdrop-blur-xl md:hidden',
        MOBILE_FIXED_NAV_SAFE,
        className,
      )}
      dir="rtl"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <button
          type="button"
          onClick={onRegister}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-teal-500 to-cyan-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(20,184,166,0.22)] transition active:scale-[0.98]"
        >
          <Scissors className="h-4 w-4 shrink-0" />
          ابدأ الانضمام
        </button>
        <button
          type="button"
          onClick={onSalesOffice}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 transition active:bg-slate-50"
        >
          <BriefcaseBusiness className="h-4 w-4 shrink-0 text-amber-700" />
          مكتب المبيعات
        </button>
      </div>
    </div>
  );
}
