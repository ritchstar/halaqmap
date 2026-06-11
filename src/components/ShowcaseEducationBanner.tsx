import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

type ShowcaseEducationBannerProps = {
  intro: string;
};

export function ShowcaseEducationBanner({ intro }: ShowcaseEducationBannerProps) {
  return (
    <motion.div
      className="container mx-auto px-4 pb-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div
        dir="rtl"
        className="mx-auto max-w-3xl rounded-2xl border border-teal-400/30 bg-gradient-to-br from-teal-500/10 via-[#020912]/80 to-amber-500/5 px-5 py-4 shadow-[0_0_40px_rgba(20,184,166,0.08)]"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-400/25 bg-teal-500/10">
            <GraduationCap className="h-5 w-5 text-teal-300" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="text-sm font-bold text-teal-200">نموذج تعليمي من المنصة</p>
            <p className="text-sm leading-relaxed text-slate-300">{intro}</p>
            <p className="text-xs text-slate-500">
              عند انضمام صالونات حقيقية في منطقتك ستظهر نتائج فعلية وفق استعلامك وفلترتك.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ShowcasePreviewCardBadge() {
  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full border border-teal-400/40 bg-[#020912]/85 px-2.5 py-1 text-[11px] font-bold text-teal-200 backdrop-blur-sm shadow-lg shadow-teal-500/10">
      <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>عرض تعليمي</span>
    </div>
  );
}
