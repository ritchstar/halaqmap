/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { StoreKitchenOpsIllustration } from '@/components/store/kitchen/StoreKitchenOpsIllustrations';
import { StoreOpsKitchenMiniSnapshot } from '@/components/store/ops/StoreOpsKitchenMiniSnapshot';
import {
  STORE_KITCHEN_OPS_PLAN_COPY,
  kitchenOpsMiniSnapshotById,
  type KitchenOpsStageId,
} from '@/config/storeKitchenOpsPlanCopy';
import { cn } from '@/lib/utils';

function scrollToStage(id: KitchenOpsStageId) {
  document.getElementById(`kitchen-ops-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function StoreKitchenOpsPlanView({ preview = false }: { preview?: boolean }) {
  const copy = STORE_KITCHEN_OPS_PLAN_COPY;

  return (
    <article className="kitchen-ops-plan mx-auto max-w-4xl px-4 py-8 md:py-10">
      {preview ? (
        <p className="mb-4 text-center text-sm font-bold leading-7 text-amber-200/90">{copy.previewBannerAr}</p>
      ) : null}

      <p className="text-sm font-bold" style={{ color: copy.accent }}>
        {copy.kickerAr}
      </p>
      <h1 className="kitchen-ops-title mt-2 font-extrabold leading-tight text-[#f4efe4]">{copy.titleAr}</h1>
      <p className="kitchen-ops-intro mt-4 leading-8 text-white/78">{copy.introAr}</p>
      <Link to={copy.landingPath} className="mt-4 inline-flex text-sm font-bold" style={{ color: copy.accent }}>
        {copy.backAr}
      </Link>

      <section className="kitchen-ops-central mt-10 rounded-2xl border border-[#b45a3c]/25 bg-[#b45a3c]/[0.06] px-5 py-6 md:px-8 md:py-8">
        <p className="kitchen-ops-central-hook font-extrabold text-[#e8c547]">{copy.centralHookAr}</p>
        <p className="kitchen-ops-central-support mt-3 font-bold leading-8 text-white/88">{copy.centralSupportAr}</p>
        <p className="kitchen-ops-step-hook mt-4 font-extrabold leading-8 text-white/82">{copy.centralTransformAr}</p>
        <p className="kitchen-ops-body mt-4 leading-8 text-white/72">{copy.centralExplainAr}</p>
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
              className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/85 hover:border-[#b45a3c]/50 hover:text-[#b45a3c]"
            >
              {stage.navTitleAr}
            </button>
          ))}
        </div>
      </nav>

      <ol className="kitchen-ops-timeline relative mt-8 space-y-10 pb-4">
        {copy.stages.map((stage) => (
          <Fragment key={stage.id}>
            <li id={`kitchen-ops-${stage.id}`} className="scroll-mt-24">
              <p className="text-xs font-bold tracking-wide text-[#b45a3c]">{stage.navTitleAr}</p>
              <div className="mt-4 space-y-8">
                {stage.steps.map((step) => (
                  <section
                    key={step.stepNumber}
                    className="kitchen-ops-step rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
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
                        <h2 className="kitchen-ops-step-title font-extrabold leading-snug text-[#f4efe4]">
                          {step.headlineAr}
                        </h2>
                        <p className="kitchen-ops-step-hook mt-3 font-extrabold leading-8 text-[#e8c547]">
                          {step.hookAr}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] md:items-start">
                      <div>
                        {step.bodyAr.map((line) => (
                          <p key={line} className="kitchen-ops-body mt-3 leading-8 text-white/76 first:mt-0">
                            {line}
                          </p>
                        ))}

                        {step.stepNumber === 1 ? (
                          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-sm leading-7 text-white/65">{copy.activationButtonsNoteAr}</p>
                            <p className="mt-2 text-sm leading-7 text-white/55">{copy.trialNoteAr}</p>
                            <div className="mt-3 flex flex-wrap gap-3">
                              <span
                                className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-bold text-[#061018]"
                                style={{ backgroundColor: copy.accent }}
                              >
                                {copy.deskButtonAr}
                              </span>
                              <span className="inline-flex min-h-11 items-center rounded-full border border-[#b45a3c]/45 px-4 py-2 text-sm font-bold text-[#b45a3c]">
                                {copy.guestPageButtonAr}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {step.checklistAr?.length ? (
                          <ul className="mt-5 space-y-2">
                            {step.checklistAr.map((item) => (
                              <li key={item} className="flex gap-2 text-base leading-8 text-white/76">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#b45a3c]" aria-hidden />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        {step.marketingTemplatesAr?.length ? (
                          <div className="mt-5 space-y-3">
                            {step.marketingTemplatesAr.map((item) => (
                              <blockquote
                                key={item}
                                className="rounded-xl border border-[#b45a3c]/25 bg-[#b45a3c]/[0.07] px-4 py-3 text-base font-bold leading-8 text-white/85"
                              >
                                {item}
                              </blockquote>
                            ))}
                          </div>
                        ) : null}

                        {step.quoteAr ? (
                          <blockquote className="mt-5 rounded-xl border border-[#e8c547]/30 bg-[#e8c547]/[0.08] px-4 py-3 text-base font-bold leading-8 text-[#e8c547]">
                            {step.quoteAr}
                          </blockquote>
                        ) : null}

                        {step.alertAr ? (
                          <p
                            className={cn(
                              'mt-5 flex gap-2 rounded-xl border px-4 py-3 text-base leading-8',
                              step.stepNumber === 9
                                ? 'border-[#e8c547]/30 bg-[#e8c547]/[0.08] font-bold text-[#e8c547]'
                                : 'border-amber-300/25 bg-amber-400/[0.06] text-white/78',
                            )}
                          >
                            {step.stepNumber === 9 ? null : (
                              <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-amber-200" aria-hidden />
                            )}
                            <span>{step.alertAr}</span>
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
                          <StoreKitchenOpsIllustration visual={step.visual} />
                        </div>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            </li>

            {stage.miniSnapshotId ? (
              <li className="list-none">
                {(() => {
                  const snap = kitchenOpsMiniSnapshotById(stage.miniSnapshotId);
                  if (!snap) return null;
                  return (
                    <StoreOpsKitchenMiniSnapshot
                      id={snap.id}
                      seriesTitleAr={copy.miniSeriesTitleAr}
                      hookAr={snap.hookAr}
                      sceneImageSrc={snap.sceneImageSrc}
                      sceneAltAr={snap.sceneAltAr}
                      accent={copy.accent}
                      guestPathPrefix={copy.guestPathPrefix}
                      qrToken={copy.labToken}
                      boardTitleAr={copy.qrCaptionAr}
                      boardQrCaptionAr={copy.qrCaptionSubAr}
                      phonePreviewLabelAr="معاينة صفحة طبختنا1 التجريبية"
                      deskPreviewLabelAr="معاينة لوحة النشاط التجريبية"
                    />
                  );
                })()}
              </li>
            ) : null}
          </Fragment>
        ))}
      </ol>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 md:px-8">
        <h2 className="kitchen-ops-step-title font-extrabold text-[#f4efe4]">{copy.dayPlanTitleAr}</h2>
        <p className="kitchen-ops-body mt-2 leading-8 text-white/65">{copy.dayPlanNoteAr}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {copy.dayPlanBlocks.map((block) => (
            <article key={block.titleAr} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-base font-extrabold text-[#b45a3c]">{block.titleAr}</h3>
              <ul className="mt-3 space-y-2">
                {block.itemsAr.map((item) => (
                  <li key={item} className="kitchen-ops-body leading-7 text-white/74">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[#b45a3c]/20 bg-[#b45a3c]/[0.05] px-5 py-6">
        <h2 className="kitchen-ops-step-title font-extrabold text-[#f4efe4]">ملاحظات تشغيلية</h2>
        <p className="kitchen-ops-body mt-3 leading-8 text-white/76">{copy.manualCapacityNoteAr}</p>
        <p className="kitchen-ops-body mt-3 leading-8 text-white/76">{copy.whatsappManualNoteAr}</p>
      </section>

      <section className="kitchen-ops-trust mt-10 rounded-2xl border border-white/12 bg-black/25 px-5 py-6 md:px-8">
        <h2 className="text-lg font-extrabold text-[#f4efe4]">{copy.trustTitleAr}</h2>
        <ul className="mt-4 space-y-3">
          {copy.trustItemsAr.map((item) => (
            <li key={item} className="kitchen-ops-body leading-8 text-white/72">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
