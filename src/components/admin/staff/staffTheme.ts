/**
 * Professional Workspace — Staff-tier design tokens.
 * Clean, solid, productivity-focused. No glass, blur, or neon glow.
 */
export const staffTheme = {
  /** Soft-dark workspace shell */
  shell: 'staff-workspace relative min-h-screen overflow-x-hidden bg-slate-900 text-slate-100 antialiased',

  /** Solid header — no transparency */
  header: 'sticky top-0 z-50 border-b border-slate-700 bg-slate-900',

  /** Clean professional card */
  card: 'rounded-lg border border-slate-700 bg-slate-800 text-slate-100 shadow-sm',
  cardInteractive:
    'transition-colors duration-200 hover:border-slate-600 hover:bg-slate-800/95',

  /** Metric / stat tile */
  metricTile:
    'rounded-lg border border-slate-700 bg-slate-800 p-5 shadow-sm transition-colors duration-200 hover:border-slate-600',

  /** Navigation */
  navRail:
    'flex w-full flex-wrap gap-1.5 rounded-lg border border-slate-700 bg-slate-800 p-1.5 lg:inline-flex lg:w-auto',
  navItem:
    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition-colors duration-150 hover:bg-slate-700/60 hover:text-slate-100',
  navItemActive:
    'data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-none',

  /** Typography */
  pageEyebrow: 'text-[11px] font-semibold uppercase tracking-wider text-slate-500',
  pageTitle: 'text-2xl font-bold tracking-tight text-white md:text-3xl',
  sectionTitle: 'text-base font-semibold tracking-tight text-slate-100',
  muted: 'text-sm leading-relaxed text-slate-400',

  /** Status badges — flat, no glow */
  badgeOk:
    'inline-flex items-center rounded-md border border-emerald-700/50 bg-emerald-900/40 px-2 py-0.5 text-[10px] font-medium text-emerald-300',
  badgeWarn:
    'inline-flex items-center rounded-md border border-amber-700/50 bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium text-amber-200',
  badgeNeutral:
    'inline-flex items-center rounded-md border border-slate-600 bg-slate-700/50 px-2 py-0.5 text-[10px] font-medium text-slate-300',
  badgeCovert:
    'inline-flex items-center rounded-md border border-red-800/60 bg-red-950/50 px-2 py-0.5 text-[10px] font-medium text-red-200',

  /** Data table */
  tableWrap: 'overflow-x-auto rounded-lg border border-slate-700 bg-slate-800/80',
  tableHead:
    'border-b border-slate-700 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500',
  tableRow: 'border-b border-slate-700 transition-colors duration-150 hover:bg-slate-800 align-top last:border-b-0',
  tableCell: 'px-4 py-4 text-sm text-slate-100',
  tableCellMuted: 'px-4 py-4 text-sm text-slate-400',

  /** Boundary / section panels */
  boundaryPanel: 'space-y-4 rounded-lg border border-slate-700 bg-slate-800/60 p-5 md:p-6',
  boundaryPanelCovert: 'space-y-4 rounded-lg border border-red-900/50 bg-slate-900 p-5 md:p-6',

  /** Agent card accents — left border stripe, solid fill */
  accentEmerald: 'border-slate-700 border-r-4 border-r-emerald-500 bg-slate-800',
  accentAmber: 'border-slate-700 border-r-4 border-r-amber-500 bg-slate-800',
  accentIndigo: 'border-slate-700 border-r-4 border-r-indigo-500 bg-slate-800',
  accentViolet: 'border-slate-700 border-r-4 border-r-violet-500 bg-slate-800',
  accentCovert: 'border-slate-700 border-r-4 border-r-red-600 bg-slate-900',
  accentCrisis: 'border-slate-700 border-r-4 border-r-orange-600 bg-slate-900',
  accentGovernance: 'border-slate-700 border-r-4 border-r-slate-400 bg-slate-950',
  accentEngineering: 'border-slate-700 border-r-4 border-r-cyan-600 bg-slate-950',
  accentMarketingConsumer: 'border-slate-700 border-r-4 border-r-rose-500 bg-slate-800',
  accentMarketingPartner: 'border-slate-700 border-r-4 border-r-sky-500 bg-slate-800',
  accentMedia: 'border-slate-700 border-r-4 border-r-purple-500 bg-slate-800',
  /** Supreme Defense — القائد الأعلى للدفاع السيبراني */
  accentSupremeDefense: 'border-red-900/60 border-r-4 border-r-red-700 bg-slate-950',
} as const;

export const staffMotion = {
  enter: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
  panel: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.18, ease: 'easeOut' as const },
  },
};
