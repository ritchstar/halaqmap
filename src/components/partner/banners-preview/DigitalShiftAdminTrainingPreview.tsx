import { useState } from 'react';
import { GraduationCap, MessageCircle, User } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DIGITAL_SHIFT_ADMIN_TRAINING_SCENARIOS,
  DIGITAL_SHIFT_ADMIN_TRAINING_SECTION,
  type DigitalShiftTrainingScenario,
} from '@/config/digitalShiftAdminTrainingScenarios';
import { cn } from '@/lib/utils';

const CATEGORY_STYLES: Record<
  DigitalShiftTrainingScenario['category'],
  { badge: string; prompt: string; response: string }
> = {
  operations: {
    badge: 'border-cyan-300/70 bg-cyan-50 text-cyan-900',
    prompt: 'border-emerald-300/70 bg-emerald-50 text-emerald-900',
    response: 'border-slate-200 bg-white/92',
  },
  hospitality: {
    badge: 'border-violet-300/70 bg-violet-50 text-violet-900',
    prompt: 'border-emerald-300/70 bg-emerald-50 text-emerald-900',
    response: 'border-slate-200 bg-white/92',
  },
  multilingual: {
    badge: 'border-amber-300/70 bg-amber-50 text-amber-900',
    prompt: 'border-emerald-300/70 bg-emerald-50 text-emerald-900',
    response: 'border-slate-200 bg-white/92',
  },
};

function ScenarioResponse({ scenario }: { scenario: DigitalShiftTrainingScenario }) {
  const styles = CATEGORY_STYLES[scenario.category];

  return (
    <div className={cn('rounded-xl border p-4 space-y-3 shadow-sm', styles.response)}>
      <p className="text-sm leading-relaxed text-slate-800">{scenario.introAr}</p>
      <ol className="space-y-3">
        {scenario.steps.map((step, i) => (
          <li key={step.titleAr} className="text-sm leading-relaxed text-slate-700">
            <span className="font-bold text-violet-800">
              {i + 1}. {step.titleAr}:
            </span>{' '}
            {step.bodyAr}
          </li>
        ))}
      </ol>
      <p className="border-t border-slate-200 pt-3 text-sm leading-relaxed text-slate-600">{scenario.conclusionAr}</p>
    </div>
  );
}

export function DigitalShiftAdminTrainingPreview() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(DIGITAL_SHIFT_ADMIN_TRAINING_SCENARIOS[0]!.id);
  const active =
    DIGITAL_SHIFT_ADMIN_TRAINING_SCENARIOS.find((s) => s.id === activeId) ??
    DIGITAL_SHIFT_ADMIN_TRAINING_SCENARIOS[0]!;
  const styles = CATEGORY_STYLES[active.category];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="feature-preview-glass w-full overflow-hidden rounded-[1.6rem] border border-slate-200/85 p-4 md:p-5"
      dir="rtl"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 text-right">
          <div className="flex items-center justify-end gap-2 text-[10px] font-semibold text-violet-700">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden />
            {DIGITAL_SHIFT_ADMIN_TRAINING_SECTION.eyebrow}
          </div>
          <h3 className="text-base font-bold text-slate-950 md:text-lg">{DIGITAL_SHIFT_ADMIN_TRAINING_SECTION.title}</h3>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-600">{DIGITAL_SHIFT_ADMIN_TRAINING_SECTION.subtitle}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap justify-end gap-2">
        {DIGITAL_SHIFT_ADMIN_TRAINING_SCENARIOS.map((scenario) => (
          <Button
            key={scenario.id}
            type="button"
            size="sm"
            variant={scenario.id === activeId ? 'default' : 'outline'}
            className={cn(
              'h-auto min-h-8 whitespace-normal py-1.5 text-[11px] font-medium',
              scenario.id === activeId
                ? 'border-violet-200 bg-white text-violet-800 shadow-[0_8px_18px_rgba(139,92,246,0.08)] hover:bg-violet-50'
                : 'border-slate-200 bg-white/88 text-slate-700 hover:bg-white hover:text-slate-950',
            )}
            onClick={() => setActiveId(scenario.id)}
          >
            {scenario.shortLabelAr}
          </Button>
        ))}
      </div>

      <motion.div
        key={active.id}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-3"
      >
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="outline" className={cn('text-[10px]', styles.badge)}>
            {active.categoryLabelAr}
          </Badge>
          <span className="text-[10px] text-slate-500">سيناريو تدريبي · لا يُنفَّذ على بيانات حقيقية</span>
        </div>

        <div className="space-y-3 rounded-[1.2rem] border border-slate-200 bg-white/90 p-3 shadow-[0_18px_40px_rgba(148,163,184,0.10)]">
          <div className="flex flex-col items-end gap-1 max-w-[95%] mr-0 ml-auto">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <User className="h-3 w-3" />
              <span>سؤال التدريب الإداري</span>
            </div>
            <div
              className={cn(
                'rounded-2xl rounded-br-md border px-3 py-2.5 text-sm leading-relaxed',
                styles.prompt,
              )}
            >
              {active.promptAr}
            </div>
          </div>

          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <MessageCircle className="h-3 w-3 text-violet-500" />
              <span>رد المناوب · نموذج مرجعي</span>
            </div>
            <ScenarioResponse scenario={active} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
