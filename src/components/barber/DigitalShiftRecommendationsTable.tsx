import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DIGITAL_SHIFT_CATEGORY_LABELS, DIGITAL_SHIFT_RECOMMENDATIONS_TITLE } from '@/config/digitalShiftAssistant';
import type { DigitalShiftRecommendation } from '@/lib/digitalShiftAssistantRemote';
import { sanitizeBarberFacingCopyAr } from '@/lib/barberFacingCopySanitize';
import { cn } from '@/lib/utils';
import { Moon, Sparkles, Wallet, ImageIcon, Megaphone, MessageCircle, X } from 'lucide-react';

const CATEGORY_ICON = {
  balance: Wallet,
  banner: Megaphone,
  gallery: ImageIcon,
  shift_chat: MessageCircle,
} as const;

export function DigitalShiftRecommendationsTable({
  recommendations,
  onDismiss,
  dismissingId,
}: {
  recommendations: DigitalShiftRecommendation[];
  onDismiss?: (id: string) => void;
  dismissingId?: string | null;
}) {
  const grouped = recommendations.reduce(
    (acc, rec) => {
      (acc[rec.category] ??= []).push(rec);
      return acc;
    },
    {} as Record<string, DigitalShiftRecommendation[]>,
  );

  return (
    <Card className="overflow-hidden border-indigo-500/25 bg-gradient-to-br from-indigo-500/[0.06] via-background to-violet-500/[0.05] shadow-sm ring-1 ring-indigo-500/10">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            {DIGITAL_SHIFT_RECOMMENDATIONS_TITLE}
          </CardTitle>
          <Badge variant="outline" className="gap-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-900 dark:text-indigo-100">
            <Sparkles className="h-3 w-3" />
            Diamond Add-on
          </Badge>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          رؤى تفاعلية من إضافة المناوب الرقمي (Software Add-on) — الشحن، البنرات، المعرض، والمناوبة على المحادثات.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            لا توجد توصيات نشطة بعد. حدّث الرؤى من زر «تحديث طاولة التوصيات».
          </p>
        ) : (
          (['balance', 'banner', 'gallery', 'shift_chat'] as const).map((category) => {
            const items = grouped[category];
            if (!items?.length) return null;
            const Icon = CATEGORY_ICON[category];
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-800/90 dark:text-indigo-200">
                  <Icon className="h-4 w-4" />
                  {DIGITAL_SHIFT_CATEGORY_LABELS[category]}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={cn(
                        'relative rounded-xl border border-border/60 bg-background/80 p-4 text-right shadow-sm',
                        rec.priority >= 80 && 'border-amber-500/40 bg-amber-500/[0.04]',
                      )}
                    >
                      {onDismiss ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-2 h-7 w-7 text-muted-foreground"
                          disabled={dismissingId === rec.id}
                          onClick={() => onDismiss(rec.id)}
                          aria-label="إخفاء التوصية"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                      <p className="pr-0 pl-8 text-sm font-semibold leading-snug">
                        {sanitizeBarberFacingCopyAr(rec.title)}
                      </p>
                      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground/85">
                        {sanitizeBarberFacingCopyAr(rec.body)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
