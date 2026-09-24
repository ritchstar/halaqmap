/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * استعداد طبختنا1 لرمضان — صفحة هبوط موسمية مستقلة عن صفحة الشراء
 * الرئيسية (StoreKitchenLandingPage) وعن صفحة home-food-orders العامة.
 * تُبنى من مكونات مستقلة لكل قسم (src/components/store/kitchen/ramadan)
 * مع تمرير كل النصوص من ملف محتوى واحد (storeKitchenRamadanCopy.ts)
 * حرفياً كما ورد في مستند التصميم. الطابع البصري كريمي فاتح بأخضر طبيعي
 * عميق — لا يستخدم البرتقالي الطيني #b45a3c المعتمد في صفحات المتجر
 * الأخرى، ولا وجوه بشرية أو نصوصاً داخل الصور.
 */
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { TabkhatnaRamadanHero } from '@/components/store/kitchen/ramadan/TabkhatnaRamadanHero';
import { TabkhatnaRamadanProblem } from '@/components/store/kitchen/ramadan/TabkhatnaRamadanProblem';
import { TabkhatnaRamadanBenefits } from '@/components/store/kitchen/ramadan/TabkhatnaRamadanBenefits';
import { TabkhatnaRamadanSteps } from '@/components/store/kitchen/ramadan/TabkhatnaRamadanSteps';
import { TabkhatnaRamadanOperations } from '@/components/store/kitchen/ramadan/TabkhatnaRamadanOperations';
import { TabkhatnaRamadanLearningCta } from '@/components/store/kitchen/ramadan/TabkhatnaRamadanLearningCta';
import { TabkhatnaRamadanFaq } from '@/components/store/kitchen/ramadan/TabkhatnaRamadanFaq';
import { TabkhatnaRamadanFinalCta } from '@/components/store/kitchen/ramadan/TabkhatnaRamadanFinalCta';
import { STORE_KITCHEN_RAMADAN_COPY } from '@/config/storeKitchenRamadanCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMetaDescription } from '@/hooks/useMetaDescription';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreKitchenRamadanLandingPage() {
  const copy = STORE_KITCHEN_RAMADAN_COPY;
  useDocumentTitle(copy.documentTitle);
  useMetaDescription(copy.metaDescriptionAr);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <article className="px-4 py-10 md:py-14">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <TabkhatnaRamadanHero
            titleAr={copy.hero.titleAr}
            bodyAr={copy.hero.bodyAr}
            primaryCtaAr={copy.hero.primaryCtaAr}
            primaryTo={ROUTE_PATHS.STORE_KITCHEN}
            secondaryCtaAr={copy.hero.secondaryCtaAr}
            trustLineAr={copy.hero.trustLineAr}
            imageSrc={copy.hero.imageSrc}
            imageAltAr={copy.hero.imageAltAr}
          />

          <TabkhatnaRamadanProblem titleAr={copy.problem.titleAr} bodyAr={copy.problem.bodyAr} cards={copy.problem.cards} />

          <TabkhatnaRamadanBenefits
            titleAr={copy.benefits.titleAr}
            leadAr={copy.benefits.leadAr}
            pageGroup={copy.benefits.pageGroup}
            shareCard={copy.benefits.shareCard}
          />

          <TabkhatnaRamadanSteps
            titleAr={copy.steps.titleAr}
            imageSrc={copy.steps.imageSrc}
            imageAltAr={copy.steps.imageAltAr}
            items={copy.steps.items}
          />

          <TabkhatnaRamadanOperations
            titleAr={copy.operations.titleAr}
            bodyAr={copy.operations.bodyAr}
            imageSrc={copy.operations.imageSrc}
            imageAltAr={copy.operations.imageAltAr}
          />

          <TabkhatnaRamadanLearningCta
            titleAr={copy.learningCta.titleAr}
            bodyAr={copy.learningCta.bodyAr}
            primaryCtaAr={copy.learningCta.primaryCtaAr}
            primaryTo={ROUTE_PATHS.STORE_KITCHEN}
            secondaryCtaAr={copy.learningCta.secondaryCtaAr}
            secondaryTo={ROUTE_PATHS.STORE_KITCHEN_READ}
          />

          <TabkhatnaRamadanFaq titleAr={copy.faq.titleAr} items={copy.faq.items} />

          <TabkhatnaRamadanFinalCta
            titleAr={copy.finalCta.titleAr}
            bodyAr={copy.finalCta.bodyAr}
            ctaAr={copy.finalCta.ctaAr}
            to={ROUTE_PATHS.STORE_KITCHEN}
          />
        </div>
      </article>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
