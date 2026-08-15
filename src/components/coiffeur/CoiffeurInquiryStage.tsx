/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مسرح الاستعلام: قطاع نسائي في الأعلى، الزر في الوسط، العنوان يميناً والتصنيفات يساراً.
 */
import { motion } from 'framer-motion';
import { CoiffeurRadarButton, type CoiffeurRadarPhase } from '@/components/coiffeur/CoiffeurRadarButton';
import {
  COIFFEUR_INQUIRY_COPY,
  COIFFEUR_INQUIRY_INTENTS,
  type CoiffeurInquiryIntentId,
} from '@/config/coiffeurMapUmbrella';
import { cn } from '@/lib/utils';

type Props = {
  phase?: CoiffeurRadarPhase;
  intent: CoiffeurInquiryIntentId;
  onIntentChange: (id: CoiffeurInquiryIntentId) => void;
  onInquire: () => void;
  locateMessage?: string | null;
};

export function CoiffeurInquiryStage({
  phase = 'idle',
  intent,
  onIntentChange,
  onInquire,
  locateMessage,
}: Props) {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-6 pt-6 md:min-h-[78svh] md:pb-12 md:pt-10">
      <div className="flex flex-col items-center">
        <span className="inline-flex rounded-full border border-rose-200/40 bg-rose-400/15 px-4 py-1.5 text-sm font-semibold tracking-wide text-[#f7efe8]">
          {COIFFEUR_INQUIRY_COPY.sectorBadge}
        </span>
        <p className="mt-8 text-base font-bold text-[#f4d4c0]">{COIFFEUR_INQUIRY_COPY.freeBadge}</p>
        <div className="mt-3 flex justify-center overflow-x-clip">
          <CoiffeurRadarButton
            phase={phase}
            onClick={onInquire}
            idleTitle={COIFFEUR_INQUIRY_COPY.searchRadarIdle}
            idleHint={COIFFEUR_INQUIRY_COPY.searchHero}
          />
        </div>
      </div>

      <div className="mt-10 grid items-start gap-8 md:mt-14 md:grid-cols-2 md:gap-12">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[clamp(1.75rem,8vw,2.35rem)] font-black leading-[1.12] text-white md:text-[clamp(2.1rem,5vw,3.4rem)]"
          >
            {COIFFEUR_INQUIRY_COPY.title}
            <span className="mt-1 block bg-gradient-to-l from-rose-200 via-[#f4d4c0] to-amber-200 bg-clip-text text-transparent">
              {COIFFEUR_INQUIRY_COPY.titleAccent}
            </span>
          </motion.h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#f7efe8] md:text-base md:leading-8">
            {COIFFEUR_INQUIRY_COPY.lead}
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-3 text-sm font-black tracking-[0.12em] text-[#f4d4c0]">
            {COIFFEUR_INQUIRY_COPY.kicker}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {COIFFEUR_INQUIRY_INTENTS.map((item) => {
              const active = intent === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onIntentChange(item.id)}
                  className={cn(
                    'min-h-[3.25rem] rounded-xl px-2 py-2 text-center text-sm leading-5 font-bold',
                    active
                      ? 'border border-[#f4d4c0] bg-[#e8b4a2]/25 text-[#f7efe8]'
                      : 'border border-white/20 bg-white/[0.06] text-[#f7efe8]',
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          {locateMessage ? (
            <p className="mt-3 text-sm leading-6 text-rose-50">{locateMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
