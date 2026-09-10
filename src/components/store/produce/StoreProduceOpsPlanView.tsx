/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { StoreOpsFieldSnapshot } from '@/components/store/ops/StoreOpsFieldSnapshot';
import {
  STORE_PRODUCE_OPS_PLAN_COPY,
  type ProduceOpsStageId,
} from '@/config/storeProduceOpsPlanCopy';
import { StoreProduceOpsIllustration } from '@/components/store/produce/StoreProduceOpsIllustrations';
import { cn } from '@/lib/utils';

function scrollToStage(id: ProduceOpsStageId) {
  document.getElementById(`produce-ops-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function StoreProduceOpsPlanView({ preview = false }: { preview?: boolean }) {
  const copy = STORE_PRODUCE_OPS_PLAN_COPY;

  return (
    <article className="produce-ops-plan mx-auto max-w-4xl px-4 py-8 md:py-10">
      {preview ? (
        <p className="mb-4 text-center text-sm font-bold leading-7 text-amber-200/90">{copy.previewBannerAr}</p>
      ) : null}

      <p className="text-sm font-bold" style={{ color: copy.accent }}>
        {copy.kickerAr}
      </p>
      <h1 className="produce-ops-title mt-2 font-extrabold leading-tight text-[#f4efe4]">{copy.titleAr}</h1>
      <p className="produce-ops-intro mt-4 leading-8 text-white/78">{copy.introAr}</p>
      <Link to={copy.landingPath} className="mt-4 inline-flex text-sm font-bold" style={{ color: copy.accent }}>
        {copy.backAr}
      </Link>

      <section className="produce-ops-central mt-10 rounded-2xl border border-[#3d8b4a]/25 bg-[#3d8b4a]/[0.06] px-5 py-6 md:px-8 md:py-8">
        <p className="produce-ops-central-hook font-extrabold text-[#e8c547]">{copy.centralHookAr}</p>
        <p className="produce-ops-central-support mt-3 font-bold leading-8 text-white/88">{copy.centralSupportAr}</p>
        <p className="produce-ops-body mt-4 leading-8 text-white/72">{copy.centralExplainAr}</p>
      </section>

      <nav
        aria-label={copy.stagesNavLabelAr}
        className="sticky top-0 z-20 mt-8 border-b border-white/10 bg-[#061018]/95 py-2 backdrop-blur"
      >
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {copy.stages.map((stage) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => scrollToStage(stage.id)}
              className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/85 hover:border-[#3d8b4a]/50 hover:text-[#3d8b4a]"
            >
              {stage.navTitleAr}
            </button>
          ))}
        </div>
      </nav>

      <ol className="produce-ops-timeline relative mt-8 space-y-10 pb-4">
        {copy.stages.map((stage) => (
          <Fragment key={stage.id}>
          <li id={`produce-ops-${stage.id}`} className="scroll-mt-24">
            <p className="text-xs font-bold tracking-wide text-[#3d8b4a]">{stage.navTitleAr}</p>
            <div className="mt-4 space-y-8">
              {stage.steps.map((step) => (
                <section
                  key={step.stepNumber}
                  className="produce-ops-step rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black text-[#061018]"
                      style={{ backgroundColor: copy.accent }}
                      aria-hidden
                    >
                      {step.stepNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="produce-ops-step-title font-extrabold leading-snug text-[#f4efe4]">
                        {step.headlineAr}
                      </h2>
                      <p className="produce-ops-step-hook mt-3 font-extrabold leading-8 text-[#e8c547]">
                        {step.hookAr}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] md:items-start">
                    <div>
                      {step.bodyAr.map((line) => (
                        <p key={line} className="produce-ops-body mt-3 leading-8 text-white/76 first:mt-0">
                          {line}
                        </p>
                      ))}

                      {step.stepNumber === 1 ? (
                        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                          <p className="text-sm leading-7 text-white/65">{copy.activationButtonsNoteAr}</p>
                          <div className="mt-3 flex flex-wrap gap-3">
                            <span
                              className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-bold text-[#061018]"
                              style={{ backgroundColor: copy.accent }}
                            >
                              {copy.deskButtonAr}
                            </span>
                            <span className="inline-flex min-h-11 items-center rounded-full border border-[#3d8b4a]/45 px-4 py-2 text-sm font-bold text-[#3d8b4a]">
                              {copy.guestPageButtonAr}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      {step.checklistAr?.length ? (
                        <ul className="mt-5 space-y-2">
                          {step.checklistAr.map((item) => (
                            <li key={item} className="flex gap-2 text-base leading-8 text-white/76">
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#3d8b4a]" aria-hidden />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {step.fieldScriptAr ? (
                        <blockquote className="mt-5 rounded-xl border border-[#3d8b4a]/25 bg-[#3d8b4a]/[0.07] px-4 py-3 text-base font-bold leading-8 text-white/85">
                          {step.fieldScriptAr}
                        </blockquote>
                      ) : null}

                      {step.comeClarificationAr ? (
                        <p className="mt-3 text-base font-bold leading-8 text-[#3d8b4a]">
                          {step.comeClarificationAr}: {copy.fieldScriptComeAr}
                        </p>
                      ) : null}

                      {step.alertAr ? (
                        <p
                          className={cn(
                            'mt-5 flex gap-2 rounded-xl border px-4 py-3 text-base leading-8',
                            step.stepNumber === 8
                              ? 'border-[#e8c547]/30 bg-[#e8c547]/[0.08] font-bold text-[#e8c547]'
                              : 'border-amber-300/25 bg-amber-400/[0.06] text-white/78',
                          )}
                        >
                          {step.stepNumber === 8 ? null : (
                            <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-amber-200" aria-hidden />
                          )}
                          <span>{step.alertAr}</span>
                        </p>
                      ) : null}

                      {step.visual === 'radius' ? (
                        <p className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-bold text-white/55">
                          <span>شمال</span>
                          <span>جنوب</span>
                          <span>شرق</span>
                          <span>غرب</span>
                        </p>
                      ) : null}

                      {step.visual === 'qr' ? (
                        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                          <p className="text-base font-extrabold text-[#e8c547]">{copy.qrCaptionAr}</p>
                          <p className="mt-1 text-sm leading-7 text-white/72">{copy.qrCaptionSubAr}</p>
                        </div>
                      ) : null}
                    </div>

                    {step.visual ? (
                      <div className="mx-auto w-full max-w-xs md:mx-0">
                        <StoreProduceOpsIllustration visual={step.visual} />
                      </div>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>
          </li>
          {stage.id === 'qr' ? (
            <li className="list-none">
              <StoreOpsFieldSnapshot {...copy.fieldSnapshot} accent={copy.accent} />
            </li>
          ) : null}
          </Fragment>
        ))}
      </ol>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 md:px-8">
        <h2 className="produce-ops-step-title font-extrabold text-[#f4efe4]">{copy.comeUxNoteTitleAr}</h2>
        <p className="produce-ops-body mt-3 leading-8 text-white/76">{copy.comeUxNoteAr}</p>
        <p className="mt-3 text-base font-bold text-[#3d8b4a]">
          {copy.comeClarificationAr} — {STORE_PRODUCE_OPS_PLAN_COPY.fieldScriptComeAr}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="produce-ops-step-title font-extrabold text-[#f4efe4]">{copy.dayPlanTitleAr}</h2>
        <p className="produce-ops-body mt-2 leading-8 text-white/65">{copy.dayPlanNoteAr}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {copy.dayPlanBlocks.map((block) => (
            <article key={block.titleAr} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-base font-extrabold text-[#3d8b4a]">{block.titleAr}</h3>
              <ul className="mt-3 space-y-2">
                {block.itemsAr.map((item) => (
                  <li key={item} className="text-base leading-7 text-white/74">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[#3d8b4a]/20 bg-[#3d8b4a]/[0.05] px-5 py-6">
        <h2 className="produce-ops-step-title font-extrabold text-[#f4efe4]">{copy.produceOnlyTitleAr}</h2>
        <ul className="mt-4 space-y-2">
          {copy.produceOnlyItemsAr.map((item) => (
            <li key={item} className="produce-ops-body leading-8 text-white/76">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="produce-ops-trust mt-10 rounded-2xl border border-white/12 bg-black/25 px-5 py-6 md:px-8">
        <h2 className="text-lg font-extrabold text-[#f4efe4]">{copy.trustTitleAr}</h2>
        <ul className="mt-4 space-y-3">
          {copy.trustItemsAr.map((item) => (
            <li key={item} className="produce-ops-body leading-8 text-white/72">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
