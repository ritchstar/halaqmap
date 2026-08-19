/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { CoiffeurGlowFrame } from '@/components/coiffeur/CoiffeurGlowFrame';
import { cn } from '@/lib/utils';

type Props = {
  src: string;
  alt: string;
  align: 'start' | 'end';
};

export function CoiffeurStageFlankShot({ src, alt, align }: Props) {
  return (
    <div
      className={cn(
        'relative flex w-full',
        align === 'end' ? 'justify-end' : 'justify-start',
      )}
    >
      <div className="relative w-[3.35rem] sm:w-[6.2rem] md:w-[9.5rem] lg:w-[11.5rem]">
        <div className="pointer-events-none absolute -inset-6 sm:-inset-10" aria-hidden>
          <span className="absolute start-[-6%] top-[18%] h-12 w-12 rounded-full bg-[#f4d4c0]/35 blur-2xl sm:h-24 sm:w-24" />
          <span className="absolute end-[-8%] top-[-6%] h-10 w-10 rounded-full bg-[#e8b4a2]/40 blur-xl sm:h-20 sm:w-20" />
          <span className="absolute start-[20%] bottom-[-10%] h-12 w-12 rounded-full bg-[#c98b96]/28 blur-2xl sm:h-24 sm:w-24" />
        </div>
        <CoiffeurGlowFrame rounded="xl" className="relative">
          <img
            src={src}
            alt={alt}
            width={720}
            height={960}
            className="aspect-[3/4] w-full object-cover"
            decoding="async"
          />
          <span
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(247,239,232,0.16)_0%,transparent_26%,transparent_70%,rgba(20,8,14,0.32)_100%)]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-x-3 top-2 h-px bg-gradient-to-l from-transparent via-[#f7efe8]/55 to-transparent"
            aria-hidden
          />
        </CoiffeurGlowFrame>
        <span
          className="pointer-events-none absolute start-1.5 top-1.5 h-3 w-3 border-s border-t border-[#f7efe8]/55 sm:h-4 sm:w-4"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute end-1.5 bottom-1.5 h-3 w-3 border-e border-b border-[#f4d4c0]/45 sm:h-4 sm:w-4"
          aria-hidden
        />
      </div>
    </div>
  );
}
