import { Link } from 'react-router-dom';
import { Radar } from 'lucide-react';
import { SHOWCASE_RADAR_ROUTE } from '@/config/showcaseRadarConfig';
import { cn } from '@/lib/utils';

type Props = {
  variant?: 'icon' | 'pill';
  className?: string;
};

/** أيقونة/رابط معاينة نظام الرصد الذكي */
export function RadarShowcaseLink({ variant = 'icon', className }: Props) {
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
