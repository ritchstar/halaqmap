import { cn } from '@/lib/utils';

type IconProps = { className?: string; title?: string };

/** أيقونة مركز العناية بالرجل — ذهبي/كهرماني. */
export function MensGroomingCenterIcon({ className, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('h-4 w-4', className)}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M12 3l1.2 3.6h3.8l-3.1 2.3 1.2 3.6L12 10.2 8.9 12.5l1.2-3.6L7 6.6h3.8L12 3z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M5 18.5c2-1.5 4.5-2.2 7-2.2s5 0.7 7 2.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
