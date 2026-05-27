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
        'sticky top-14 z-30 border-b border-white/10 bg-[#0b0f19]/92 backdrop-blur-md md:top-16',
        className,
      )}
    >
      <div className="container mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-cyan-400/35 hover:bg-cyan-500/10 hover:text-cyan-100"
          >
            <span className="hidden sm:inline">{section.label}</span>
            <span className="sm:hidden">{section.shortLabel ?? section.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
