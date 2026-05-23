import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  onActivate: () => void;
  className?: string;
};

/** Founder-only emergency entry — opens Crisis Discussion thread. */
export function SystemCrisisPanicButton({ onActivate, className }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onActivate}
      className={cn(
        'h-9 shrink-0 gap-1.5 border-red-500/50 bg-red-950/40 px-2.5 text-red-100',
        'hover:bg-red-900/60 hover:text-white hover:border-red-400/60',
        'animate-pulse hover:animate-none',
        className,
      )}
      title="Emergency Advisor — Crisis Discussion"
      aria-label="Emergency Advisor — مستشار الأزمات"
    >
      <Siren className="h-4 w-4 text-red-300" aria-hidden />
      <span className="hidden md:inline font-semibold">استنفار</span>
    </Button>
  );
}
