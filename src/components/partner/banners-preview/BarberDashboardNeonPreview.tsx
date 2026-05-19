import { CalendarDays, Clock, LayoutDashboard, MessageCircle, Radar, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  DASHBOARD_NEON_MUTED_TOOLS,
  DASHBOARD_NEON_OPERATIONAL_TOOLS,
  type DashboardNeonToolId,
} from '@/config/partnerFeaturePreviewsCopy';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const TOOL_ICONS: Record<DashboardNeonToolId, typeof CalendarDays> = {
  live_schedule: CalendarDays,
  chairs_staff: Users,
  shifts: Clock,
};

const HALO_CLASS: Record<'cyan' | 'emerald', string> = {
  cyan: 'feature-preview-neon-halo-cyan',
  emerald: 'feature-preview-neon-halo-emerald',
};

export function BarberDashboardNeonPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="feature-preview-glass relative w-full overflow-hidden rounded-2xl border border-white/10 p-4 shadow-2xl md:p-5"
      dir="rtl"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl"
        animate={reduceMotion ? undefined : { opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-10 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl"
        animate={reduceMotion ? undefined : { opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />

      <motion.header
        className="relative mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10">
            <LayoutDashboard className="h-5 w-5 text-cyan-300" aria-hidden />
          </motion.div>
          <div>
            <p className="text-[10px] font-semibold text-cyan-200/70">مركز إدارة الصالون</p>
            <h3 className="text-sm font-extrabold text-white md:text-base">لوحة التشغيل الداخلية</h3>
          </div>
        </motion.div>
        <span className="rounded-full border border-emerald-400/25 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
          تشغيل · ضيافة · توفر
        </span>
      </motion.header>

      <div className="relative grid gap-2 sm:grid-cols-3">
        {DASHBOARD_NEON_OPERATIONAL_TOOLS.map((tool, index) => {
          const Icon = TOOL_ICONS[tool.id];
          return (
            <Tooltip key={tool.id} delayDuration={120}>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  className={cn(
                    'feature-preview-tool-tile relative flex min-h-[88px] flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-right transition-colors hover:bg-white/[0.07]',
                    HALO_CLASS[tool.halo],
                  )}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * index }}
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg border',
                      tool.halo === 'cyan'
                        ? 'border-cyan-400/30 bg-cyan-500/15 text-cyan-200'
                        : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-xs font-bold leading-snug text-white">{tool.label}</span>
                  <span className="text-[10px] text-slate-400">مؤشر تشغيل حي</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[240px] border border-cyan-400/20 bg-[#0f172a] text-right text-xs leading-relaxed text-slate-100"
              >
                {tool.tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="relative mt-3 grid gap-2 sm:grid-cols-3">
        {DASHBOARD_NEON_MUTED_TOOLS.map((label) => (
          <motion.div
            key={label}
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 opacity-70"
          >
            {label.includes('الرادار') ? (
              <Radar className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
            ) : label.includes('رسائل') ? (
              <MessageCircle className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
            ) : (
              <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
            )}
            <span className="text-[11px] text-slate-400">{label}</span>
          </motion.div>
        ))}
      </motion.div>

      <p className="relative mt-3 text-center text-[10px] leading-relaxed text-slate-500">
        المنصة لا تعرض ولا تخزّن أي سجلات نقدية أو محافظ — فقط مؤشرات ضيافة وتشغيل.
      </p>
    </motion.div>
  );
}
