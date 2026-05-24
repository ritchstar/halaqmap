/**
 * BarberDashboardNeonPreview — لوحة تحكم الحلاق بستايل المنصة الجديد
 * خلفية داكنة متدرجة · توهجات تيل وزمردية · أيقونات جذابة بتصميم متكامل
 */

import { CalendarDays, Clock, LayoutDashboard, MessageCircle, Radar, Users, Zap, TrendingUp, Bell } from 'lucide-react';
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

// ── Muted tool icons ───────────────────────────────────────────────────────────
function getMutedIcon(label: string) {
  if (label.includes('الرادار')) return Radar;
  if (label.includes('رسائل')) return MessageCircle;
  if (label.includes('تقارير') || label.includes('إحصاء')) return TrendingUp;
  if (label.includes('تنبيه') || label.includes('إشعار')) return Bell;
  return LayoutDashboard;
}

export function BarberDashboardNeonPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55 }}
      className="relative w-full overflow-hidden rounded-2xl border border-teal-400/20
        bg-gradient-to-b from-[#050f1a] via-[#040c16] to-[#020912]
        shadow-[0_0_40px_rgba(20,184,166,0.10),0_8px_32px_rgba(0,0,0,0.5)]
        ring-1 ring-teal-400/10"
      dir="rtl"
    >
      {/* Background glow blobs */}
      <motion.div aria-hidden className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-teal-500/12 blur-[60px]"
        animate={reduceMotion ? undefined : { opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }} />
      <motion.div aria-hidden className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-[50px]"
        animate={reduceMotion ? undefined : { opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, delay: 0.8, repeat: Infinity }} />
      <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[40px]"
        animate={reduceMotion ? undefined : { opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 7, repeat: Infinity }} />

      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />

      {/* ── Header ─────────────────────────────────────── */}
      <motion.header
        className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3.5 md:px-5"
        initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl
            border border-teal-400/30 bg-teal-500/12
            shadow-[0_0_12px_rgba(20,184,166,0.20)]">
            <LayoutDashboard className="h-4.5 w-4.5 text-teal-300" />
          </div>
          <div>
            <p className="text-[0.6rem] font-bold tracking-widest text-teal-400/60 uppercase">مركز إدارة الصالون</p>
            <h3 className="text-[0.9rem] font-black leading-tight text-white">لوحة التشغيل الداخلية</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1">
            <motion.div className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[0.58rem] font-bold text-emerald-300">حيّ الآن</span>
          </div>
          <div className="rounded-full border border-teal-400/20 bg-teal-500/8 px-2.5 py-1 text-[0.6rem] font-bold text-teal-300/80">
            ضيافة · تشغيل · توفر
          </div>
        </div>
      </motion.header>

      {/* ── Operational tool tiles ──────────────────────── */}
      <div className="relative grid gap-2 p-4 sm:grid-cols-3 md:p-5">
        {DASHBOARD_NEON_OPERATIONAL_TOOLS.map((tool, index) => {
          const Icon = TOOL_ICONS[tool.id];
          const isCyan = tool.halo === 'cyan';
          return (
            <Tooltip key={tool.id} delayDuration={120}>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  className={cn(
                    'group relative flex min-h-[92px] flex-col items-start gap-2 overflow-hidden rounded-xl border p-3 text-right',
                    'transition-all duration-200 hover:scale-[1.02]',
                    isCyan
                      ? 'border-teal-400/22 bg-teal-500/8 hover:border-teal-400/40 hover:bg-teal-500/14'
                      : 'border-emerald-400/20 bg-emerald-500/8 hover:border-emerald-400/35 hover:bg-emerald-500/14',
                  )}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * index }}
                >
                  {/* Inner glow */}
                  <div className={cn(
                    'pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                    isCyan ? 'bg-teal-400/5' : 'bg-emerald-400/5',
                  )} />

                  {/* Icon */}
                  <div className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-xl border',
                    isCyan
                      ? 'border-teal-400/35 bg-teal-500/15 text-teal-200 shadow-[0_0_10px_rgba(20,184,166,0.20)]'
                      : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.20)]',
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Label */}
                  <span className="relative text-[0.78rem] font-bold leading-snug text-white">{tool.label}</span>

                  {/* Sub label */}
                  <div className={cn(
                    'flex items-center gap-1 text-[0.6rem] font-semibold',
                    isCyan ? 'text-teal-400/70' : 'text-emerald-400/70',
                  )}>
                    <motion.div className={cn('h-1 w-1 rounded-full', isCyan ? 'bg-teal-400' : 'bg-emerald-400')}
                      animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.3 }} />
                    مؤشر حيّ
                  </div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[240px] border border-teal-400/20 bg-[#050f1a] text-right text-xs leading-relaxed text-slate-100 shadow-xl"
              >
                {tool.tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* ── Muted/additional tools ──────────────────────── */}
      <div className="grid gap-1.5 px-4 pb-4 sm:grid-cols-3 md:px-5">
        {DASHBOARD_NEON_MUTED_TOOLS.map((label) => {
          const Icon = getMutedIcon(label);
          return (
            <motion.div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2.5 opacity-60 hover:opacity-80 transition-opacity"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span className="text-[0.68rem] font-medium text-slate-400">{label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Performance strip */}
      <div className="mx-4 mb-4 rounded-xl border border-teal-400/12 bg-teal-500/5 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-[0.65rem] font-bold text-teal-300">أداء الصالون اليوم</span>
          </div>
          <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[0.6rem] font-black text-teal-300">ممتاز</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
            initial={{ width: 0 }} whileInView={{ width: '78%' }} transition={{ duration: 1.2, delay: 0.3 }}
            viewport={{ once: true }} />
        </div>
      </div>

      <p className="relative px-4 pb-4 text-center text-[0.6rem] leading-relaxed text-slate-600">
        المنصة لا تعرض ولا تخزّن أي سجلات نقدية — فقط مؤشرات ضيافة وتشغيل.
      </p>

      {/* Bottom accent */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
    </motion.div>
  );
}
