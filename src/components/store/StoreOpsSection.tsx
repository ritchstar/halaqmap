/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قسم تشغيل قابل للطي على الجوال: ساعات، موقع، ملصق، شاشات.
 */
import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export function StoreOpsSection({
  titleAr,
  accent = '#e8c547',
  defaultOpen = false,
  children,
}: {
  titleAr: string;
  accent?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="store-ops-section">
      <CollapsibleTrigger
        type="button"
        className="store-ops-tool flex w-full items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-right"
      >
        <span className="text-sm font-extrabold" style={{ color: accent }}>
          {titleAr}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
          style={{ color: accent }}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
