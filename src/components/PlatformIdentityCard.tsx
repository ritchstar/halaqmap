import { CheckCircle2, Shield, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PLATFORM_IDENTITY_BADGE_AR,
  PLATFORM_IDENTITY_COMPARISON_AR,
  PLATFORM_IDENTITY_HEADLINE_AR,
  PLATFORM_IDENTITY_PARAGRAPH_AR,
  PLATFORM_IDENTITY_PROOF_POINTS_AR,
  PLATFORM_IDENTITY_SUBHEADLINE_AR,
} from '@/config/platformIdentity';
import { cn } from '@/lib/utils';

type Props = {
  /** Compact: skip the comparison grid + proof bullets, keep paragraph only. */
  compact?: boolean;
  className?: string;
  /** Override default container background — useful in dark hero sections. */
  toneClass?: string;
};

function renderEmphasised(text: string) {
  return text.split('**').map((part, idx) =>
    idx % 2 === 0 ? (
      <span key={idx}>{part}</span>
    ) : (
      <strong key={idx} className="font-semibold text-foreground">
        {part}
      </strong>
    ),
  );
}

/**
 * Reusable identity card — reinforces that حلاق ماب is a technical
 * solutions provider (B2B digital products) and NOT a commercial
 * intermediary. Mount it on policies, partner pages, banner previews,
 * subscription policy, etc.
 */
export function PlatformIdentityCard({ compact, className, toneClass }: Props) {
  return (
    <Card
      className={cn(
        'border-primary/30',
        toneClass ?? 'bg-primary/5',
        className,
      )}
    >
      <CardHeader className="space-y-3 pb-3 text-right">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className="bg-primary/15 text-primary border-primary/30">
            <Shield className="ml-1.5 inline h-3.5 w-3.5" aria-hidden />
            {PLATFORM_IDENTITY_BADGE_AR}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-snug md:text-2xl">
          {PLATFORM_IDENTITY_HEADLINE_AR}
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed md:text-base">
          {PLATFORM_IDENTITY_SUBHEADLINE_AR}
        </p>
      </CardHeader>
      <CardContent className="space-y-5 text-right">
        <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
          {renderEmphasised(PLATFORM_IDENTITY_PARAGRAPH_AR)}
        </p>

        {compact ? null : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  ما هي المنصة
                </h4>
                <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                  {PLATFORM_IDENTITY_COMPARISON_AR.is.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-rose-500/25 bg-rose-500/[0.05] p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
                  <XCircle className="h-4 w-4" aria-hidden />
                  ما هي ليست
                </h4>
                <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                  {PLATFORM_IDENTITY_COMPARISON_AR.isNot.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                نقاط الإثبات
              </h4>
              <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                {PLATFORM_IDENTITY_PROOF_POINTS_AR.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{renderEmphasised(line)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
