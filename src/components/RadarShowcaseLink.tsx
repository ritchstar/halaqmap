import { Link } from 'react-router-dom';
import { Radar } from 'lucide-react';
import { SHOWCASE_RADAR_ROUTE } from '@/config/showcaseRadarConfig';
import { cn } from '@/lib/utils';

type Props = {
  variant?: 'icon' | 'pill' | 'showcase';
  className?: string;
};

function SmartRadarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-9 w-9 shrink-0', className)} aria-hidden>
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.28" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
      <circle cx="16" cy="16" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.65" />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
      <g opacity="0.85">
        <line x1="16" y1="16" x2="16" y2="3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 16 16"
            to="360 16 16"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </line>
      </g>
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.2">
        <animate attributeName="r" values="10;13;10" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.1;0.35" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/** أيقونة/رابط معاينة نظام الرصد الذكي */
export function RadarShowcaseLink({ variant = 'icon', className }: Props) {
  if (variant === 'showcase') {
    return (
      <Link
        to={SHOWCASE_RADAR_ROUTE}
        title="رادار الرصد — استعراض تقنيات المنصة حياً"
        className={cn(
          'group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-cyan-400/40 bg-[#050f1f]/95 px-4 py-2.5 shadow-[0_0_22px_rgba(34,211,238,0.14)] backdrop-blur-sm transition-all duration-300 hover:border-cyan-300/55 hover:shadow-[0_0_32px_rgba(34,211,238,0.26)] hover:-translate-y-0.5 active:translate-y-0',
          className,
        )}
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-l from-cyan-500/8 via-transparent to-cyan-400/10 opacity-0 transition-opacity group-hover:opacity-100" />
        <SmartRadarGlyph className="relative text-cyan-400 transition-transform duration-300 group-hover:scale-105" />
        <span className="relative flex flex-col items-start leading-none">
          <span className="text-[0.94rem] font-black tracking-tight text-white">الرصد</span>
          <span className="mt-0.5 text-[0.94rem] font-black tracking-tight text-white">الذكي</span>
        </span>
      </Link>
    );
  }

  if (variant === 'pill') {
    return (
      <Link
        to={SHOWCASE_RADAR_ROUTE}
        title="معاينة نظام الرصد الذكي — حلاق ماب"
        className={cn(
          'group inline-flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/10 px-3.5 py-2 text-[0.82rem] font-bold text-sky-200 transition-all hover:border-sky-400/50 hover:bg-sky-500/15',
          className,
        )}
      >
        <Radar className="h-4 w-4 text-sky-400 transition-transform group-hover:scale-110" />
        <span>الرصد الذكي</span>
      </Link>
    );
  }

  return (
    <Link
      to={SHOWCASE_RADAR_ROUTE}
      title="معاينة نظام الرصد الذكي — حلاق ماب"
      aria-label="معاينة نظام الرصد الذكي"
      className={cn(
        'group relative flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-300/80 transition-all hover:border-sky-400/50 hover:bg-sky-500/15 hover:text-sky-200',
        className,
      )}
    >
      <Radar className="h-4 w-4" />
      <span className="absolute -bottom-1.5 -left-1 rounded-full bg-sky-500 px-1 py-0 text-[0.5rem] font-black leading-tight text-black">
        🛰
      </span>
    </Link>
  );
}
