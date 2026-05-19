/**
 * Founder's Command Center — Obsidian Luxury & Glassmorphism
 * Scoped design tokens (Tailwind class fragments).
 */
export const founderTheme = {
  /** Full-screen obsidian shell */
  shell:
    'founder-command-center relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased',

  /** Ambient depth layers */
  ambientOrbCyan:
    'pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[120px]',
  ambientOrbGold:
    'pointer-events-none absolute top-[28%] -right-24 h-[360px] w-[360px] rounded-full bg-amber-500/[0.05] blur-[100px]',
  ambientOrbSlate:
    'pointer-events-none absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-slate-700/[0.06] blur-[90px]',

  /** Glassmorphism header panel */
  header:
    'sticky top-0 z-50 border-b border-cyan-500/20 bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40',

  /** Floating glass card — gray-900/30 + crisp white text */
  glassCard:
    'rounded-2xl border border-slate-800/70 bg-gray-900/30 text-white backdrop-blur-xl shadow-xl shadow-black/60',
  glassCardInteractive:
    'transition-all duration-500 ease-out hover:border-cyan-500/30 hover:bg-gray-900/40 hover:shadow-[0_0_32px_rgba(34,211,238,0.14)]',

  /** Primary metric tile */
  metricTile:
    'group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-gray-900/30 p-6 text-white backdrop-blur-xl shadow-lg shadow-black/50 transition-all duration-500 ease-out hover:border-cyan-500/30 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)]',
  metricGlow:
    'pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-cyan-400/12 via-transparent to-amber-400/10',

  /** Deep charcoal nav rail + cyan active glow */
  navRail:
    'flex w-full flex-wrap gap-2 rounded-2xl border border-slate-800/80 bg-[#141416]/90 p-2 shadow-inner shadow-black/40 backdrop-blur-md lg:inline-flex lg:w-auto',
  navItem:
    'inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 ease-out hover:bg-slate-800/50 hover:text-slate-100',
  navItemActive:
    'data-[state=active]:border data-[state=active]:border-cyan-400/35 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300 data-[state=active]:shadow-[0_0_20px_rgba(34,211,238,0.35)]',

  /** Typography */
  pageEyebrow: 'text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80',
  pageTitle: 'text-2xl font-bold tracking-tight text-white md:text-3xl',
  sectionTitle: 'text-lg font-semibold tracking-tight text-white',
  muted: 'text-sm leading-relaxed text-slate-400',

  /** Glowing status badges */
  badgeOk:
    'inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.25)]',
  badgeWarn:
    'inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/12 px-2.5 py-0.5 text-[10px] font-semibold text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.2)]',
  badgeNeutral:
    'inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-0.5 text-[10px] font-medium text-slate-300',

  /** Premium data table */
  tableWrap:
    'overflow-x-auto rounded-2xl border border-slate-800/80 bg-gray-900/20 backdrop-blur-md',
  tableHead:
    'border-b border-slate-800 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400',
  tableRow:
    'border-b border-slate-800 transition-colors duration-300 hover:bg-gray-900/40 align-top last:border-b-0',
  tableCell: 'px-5 py-5 text-sm text-white',
  tableCellMuted: 'px-5 py-5 text-sm text-slate-400',

  /** Founder crest with pulse halo */
  crest:
    'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-500/30 to-cyan-500/20 shadow-lg shadow-amber-500/25',
  crestPulse:
    'pointer-events-none absolute -inset-1 rounded-2xl bg-cyan-400/25 blur-md animate-pulse',
} as const;

export const founderMotion = {
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
  stagger: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const },
    },
  },
  tabContent: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};
