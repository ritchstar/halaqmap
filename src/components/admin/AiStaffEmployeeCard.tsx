import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  shortName: string;
  roleDescription: string;
  accentClass: string;
  available: boolean;
  comingSoonLabel?: string;
  locked?: boolean;
  onActivate?: () => void;
};

export function AiStaffEmployeeCard({
  shortName,
  roleDescription,
  accentClass,
  available,
  comingSoonLabel,
  locked,
  onActivate,
}: Props) {
  const interactive = available && !locked && Boolean(onActivate);

  return (
    <article
      className={cn(
        'group relative flex h-full min-h-[220px] flex-col rounded-xl border bg-gradient-to-br p-5 shadow-sm transition-all duration-300',
        accentClass,
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40',
        !interactive && 'opacity-80',
      )}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onActivate : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivate?.();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-background/80 text-2xl shadow-inner">
          {shortName.includes(' ') ? shortName.split(' ').slice(-1)[0] : '🤖'}
        </div>
        {comingSoonLabel ? (
          <Badge variant="secondary" className="text-xs">
            {comingSoonLabel}
          </Badge>
        ) : locked ? (
          <Badge variant="outline" className="gap-1 text-xs">
            <Lock className="h-3 w-3" />
            صلاحية مطلوبة
          </Badge>
        ) : (
          <Badge className="gap-1 bg-emerald-600/90 text-xs hover:bg-emerald-600">
            <Sparkles className="h-3 w-3" />
            نشط
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-bold leading-snug text-foreground">{shortName}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{roleDescription}</p>

      {interactive && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4 w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onActivate?.();
          }}
        >
          <span>فتح المكتب</span>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
    </article>
  );
}
