import { APP_BUILD } from '@/lib/appBuild';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'dark';

export function AppBuildStamp({ className, variant = 'default' }: { className?: string; variant?: Variant }) {
  const built = APP_BUILD.builtAtIso.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');

  return (
    <p
      className={cn(
        'text-center text-[10px] leading-snug tabular-nums tracking-tight',
        variant === 'default' && 'text-muted-foreground/65',
        variant === 'dark' && 'text-slate-500',
        className
      )}
      dir="rtl"
    >
      <span className={variant === 'dark' ? 'text-slate-400' : 'text-muted-foreground/80'}>الإصدار </span>
      <span
        dir="ltr"
        className={cn('inline-block', variant === 'dark' ? 'text-slate-300' : 'text-muted-foreground')}
        title={`وقت البناء ${APP_BUILD.builtAtIso}`}
      >
        v{APP_BUILD.version} · {APP_BUILD.commit} · {built}
      </span>
    </p>
  );
}
