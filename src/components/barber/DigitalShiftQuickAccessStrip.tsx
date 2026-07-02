import { Building2, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DIGITAL_SHIFT_BADGE_OFFICE_AR,
  DIGITAL_SHIFT_BADGE_SHIFT_AR,
  DIGITAL_SHIFT_QUICK_ACCESS_LEDE_AR,
} from '@/config/digitalShiftDashboardCopy';

export type DigitalShiftQuickTarget = 'shift-settings' | 'private-office';

const SCROLL_TARGET_KEY = 'halaqmap_shift_scroll_target';

export function stashDigitalShiftScrollTarget(target: DigitalShiftQuickTarget): void {
  try {
    sessionStorage.setItem(SCROLL_TARGET_KEY, target);
  } catch {
    /* ignore quota / private mode */
  }
}

export function consumeDigitalShiftScrollTarget(): DigitalShiftQuickTarget | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_TARGET_KEY);
    sessionStorage.removeItem(SCROLL_TARGET_KEY);
    if (raw === 'shift-settings' || raw === 'private-office') return raw;
  } catch {
    /* ignore */
  }
  return null;
}

type DigitalShiftQuickAccessStripProps = {
  onOpenShift: (target: DigitalShiftQuickTarget) => void;
};

export function DigitalShiftQuickAccessStrip({ onOpenShift }: DigitalShiftQuickAccessStripProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">{DIGITAL_SHIFT_QUICK_ACCESS_LEDE_AR}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-background to-violet-500/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/35 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200">
                <Moon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-bold text-foreground">{DIGITAL_SHIFT_BADGE_SHIFT_AR}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  إعدادات المناوبة، الردود الآلية، وطاولة التوصيات.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="shrink-0 gap-1.5 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => onOpenShift('shift-settings')}
            >
              <Moon className="h-4 w-4" />
              فتح المناوب
            </Button>
          </CardContent>
        </Card>

        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-background to-amber-500/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/35 bg-violet-500/15 text-violet-700 dark:text-violet-200">
                <Building2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-bold text-foreground">{DIGITAL_SHIFT_BADGE_OFFICE_AR}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  تعليمات دائمة، مهام، ومحادثة داخلية مع المناوب.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5 border-violet-400/40 bg-violet-500/10 text-violet-950 hover:bg-violet-500/20 dark:text-violet-100"
              onClick={() => onOpenShift('private-office')}
            >
              <Building2 className="h-4 w-4" />
              فتح المكتب الخاص
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
