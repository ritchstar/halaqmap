import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { PartnerProductHubSection } from '@/config/partnerProductHubCopy';

type Props = {
  sections: readonly PartnerProductHubSection[];
  className?: string;
};

export function PartnerProductHubSectionNav({ sections, className }: Props) {
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <nav
      aria-label="فهرس أقسام المعاينة"
      className={cn(
        'sticky top-14 z-30 border-b border-slate-200/85 bg-white/88 shadow-[0_12px_32px_rgba(148,163,184,0.10)] backdrop-blur-xl md:top-16',
        className,
      )}
    >
      <div className="container mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            className="shrink-0 rounded-full border border-slate-200 bg-white/92 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800"
          >
            <span className="hidden sm:inline">{section.label}</span>
            <span className="sm:hidden">{section.shortLabel ?? section.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
