/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يطوي تفاصيل صفحة المنتج على الجوال، ويبقيها مفتوحة على الشاشات الأوسع.
 */
import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export function StoreLandingFold({
  titleAr = 'تفاصيل المنتج',
  accentClass = 'text-[#e8c547]',
  children,
}: {
  titleAr?: string;
  accentClass?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <Collapsible open={open} onOpenChange={setOpen} className="mt-5">
          <CollapsibleTrigger
            type="button"
            className="store-ops-tool flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold"
          >
            <span>{titleAr}</span>
            <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', accentClass, open && 'rotate-180')} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">{children}</CollapsibleContent>
        </Collapsible>
      </div>
      <div className="hidden lg:block">{children}</div>
    </>
  );
}
