/**
 * BarberDashboardNeonPreview — لوحة تحكم الحلاق بستايل المنصة الجديد
 * نسخة صباحية مشرقة · لمسات تيل وزمردية · أيقونات جذابة بتصميم متكامل
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
      className="feature-preview-glass relative w-full overflow-hidden rounded-2xl border border-teal-200/80
        shadow-[0_22px_54px_rgba(148,163,184,0.16)]
        ring-1 ring-teal-100"
      dir="rtl"
    >
      {/* Background glow blobs */}
      <motion.div aria-hidden className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-teal-300/18 blur-[60px]"
        animate={reduceMotion ? undefined : { opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }} />
      <motion.div aria-hidden className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-emerald-300/18 blur-[50px]"
        animate={reduceMotion ? undefined : { opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, delay: 0.8, repeat: Infinity }} />
      <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/25 blur-[40px]"
        animate={reduceMotion ? undefined : { opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 7, repeat: Infinity }} />

      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />

      {/* ── Header ─────────────────────────────────────── */}
      <motion.header
        className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 md:px-5"
        initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl
            border border-teal-200 bg-teal-50
            shadow-[0_10px_24px_rgba(45,212,191,0.12)]">
            <LayoutDashboard className="h-4.5 w-4.5 text-teal-700" />
          </div>
          <div>
            <p className="text-[0.6rem] font-bold tracking-widest text-teal-700 uppercase">مركز إدارة الصالون</p>
            <h3 className="text-[0.9rem] font-black leading-tight text-slate-950">لوحة التشغيل الداخلية</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
            <motion.div className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[0.58rem] font-bold text-emerald-700">حيّ الآن</span>
          </div>
          <div className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[0.6rem] font-bold text-teal-700">
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
                      ? 'border-teal-200 bg-teal-50/80 hover:border-teal-300 hover:bg-teal-50'
                      : 'border-emerald-200 bg-emerald-50/80 hover:border-emerald-300 hover:bg-emerald-50',
                  )}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * index }}
                >
                  {/* Inner glow */}
                  <div className={cn(
                    'pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                    isCyan ? 'bg-teal-200/40' : 'bg-emerald-200/40',
                  )} />

                  {/* Icon */}
                  <div className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-xl border',
                    isCyan
                      ? 'border-teal-200 bg-teal-100 text-teal-800 shadow-[0_10px_22px_rgba(45,212,191,0.12)]'
                      : 'border-emerald-200 bg-emerald-100 text-emerald-800 shadow-[0_10px_22px_rgba(52,211,153,0.12)]',
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Label */}
                  <span className="relative text-[0.78rem] font-bold leading-snug text-slate-900">{tool.label}</span>

                  {/* Sub label */}
                  <div className={cn(
                    'flex items-center gap-1 text-[0.6rem] font-semibold',
                    isCyan ? 'text-teal-700' : 'text-emerald-700',
                  )}>
                    <motion.div className={cn('h-1 w-1 rounded-full', isCyan ? 'bg-teal-400' : 'bg-emerald-400')}
                      animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.3 }} />
                    مؤشر حيّ
                  </div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[240px] border border-teal-200 bg-white text-right text-xs leading-relaxed text-slate-800 shadow-xl"
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
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 opacity-80 transition-opacity hover:opacity-100"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span className="text-[0.68rem] font-medium text-slate-600">{label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Performance strip */}
      <div className="mx-4 mb-4 rounded-xl border border-teal-200 bg-teal-50/90 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-[0.65rem] font-bold text-teal-700">أداء الصالون اليوم</span>
          </div>
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[0.6rem] font-black text-teal-700">ممتاز</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
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
