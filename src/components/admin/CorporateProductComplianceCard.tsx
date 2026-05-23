import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronDown, FileBadge, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  CORPORATE_PRODUCT_COMPLIANCE_BADGE,
  CORPORATE_PRODUCT_COMPLIANCE_SECTIONS,
  CORPORATE_PRODUCT_COMPLIANCE_TITLE,
} from '@/config/corporateProductCompliance';
import { cn } from '@/lib/utils';

type CorporateProductComplianceCardProps = {
  variant?: 'admin' | 'public';
};

export function CorporateProductComplianceCard({ variant = 'admin' }: CorporateProductComplianceCardProps) {
  const isPublic = variant === 'public';
  const [expanded, setExpanded] = useState(true);

  const card = (
    <Card className="h-full overflow-hidden border-emerald-600/25 bg-gradient-to-br from-emerald-500/[0.06] via-amber-500/[0.04] to-background shadow-sm ring-1 ring-amber-500/10">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2 text-right flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge className="gap-1.5 border-0 bg-gradient-to-r from-emerald-700 to-emerald-600 text-emerald-50 hover:from-emerald-700 hover:to-emerald-600 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                {CORPORATE_PRODUCT_COMPLIANCE_BADGE}
              </Badge>
              <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                مرجع تدقيق
              </Badge>
            </div>
            <CardTitle
              id={isPublic ? 'corporate-product-compliance-title' : undefined}
              className="flex items-center gap-2 text-xl justify-end leading-snug"
            >
              <FileBadge className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              {CORPORATE_PRODUCT_COMPLIANCE_TITLE}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed mr-0 ml-auto max-w-2xl">
              {isPublic
                ? 'مرجع رسمي للتعريف المؤسسي بالمنتج — متاح للمراجعين والتدقيق التجاري على الصفحة العامة.'
                : 'مرجع رسمي للتعريف المؤسسي بالمنتج — جاهز للعرض في مراجعات الأعمال والامتثال الرقمي.'}
            </CardDescription>
          </div>
          {!isPublic ? (
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="gap-1 shrink-0">
                {expanded ? 'طي الوثيقة' : 'عرض الوثيقة'}
                <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
          ) : null}
        </div>
      </CardHeader>

      {isPublic ? (
        <CardContent className="pt-0 pb-6">
          <ComplianceSectionsTable />
        </CardContent>
      ) : (
        <CollapsibleContent>
          <CardContent className="pt-0 pb-6">
            <ComplianceSectionsTable />
          </CardContent>
        </CollapsibleContent>
      )}
    </Card>
  );

  const motionProps = isPublic
    ? {
        initial: { opacity: 0, y: 20 } as const,
        whileInView: { opacity: 1, y: 0 } as const,
        viewport: { once: true, margin: '-40px' } as const,
        transition: { duration: 0.55, ease: 'easeOut' } as const,
      }
    : {
        initial: { opacity: 0, y: 16 } as const,
        animate: { opacity: 1, y: 0 } as const,
        transition: { duration: 0.45, delay: 0.05 } as const,
      };

  if (isPublic) {
    return (
      <motion.div {...motionProps} className="h-full">
        {card}
      </motion.div>
    );
  }

  return (
    <motion.div {...motionProps} className="h-full">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        {card}
      </Collapsible>
    </motion.div>
  );
}

function ComplianceSectionsTable() {
  return (
    <div className="rounded-xl border border-emerald-600/15 bg-background/70 backdrop-blur-sm divide-y divide-border/60">
      {CORPORATE_PRODUCT_COMPLIANCE_SECTIONS.map((section) => (
        <div key={section.id} className="px-4 py-4 sm:px-5 sm:py-4 text-right">
          <p className="text-xs font-semibold tracking-wide text-emerald-800/80 dark:text-emerald-300/90 mb-1.5">
            {section.label}
          </p>
          <p className="text-sm sm:text-[0.9375rem] leading-relaxed text-foreground/90">{section.body}</p>
        </div>
      ))}
    </div>
  );
}
