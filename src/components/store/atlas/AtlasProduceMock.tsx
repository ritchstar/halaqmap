/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نموذج صفحة خضارنا1 داخل المعاينة. بلا باقة تجريب وبلا منتجات أخرى.
 */
import { Link } from 'react-router-dom';
import { AtlasFooter } from '@/components/store/atlas/AtlasFooter';
import { AtlasHeader } from '@/components/store/atlas/AtlasHeader';
import { MobileStickyCTA } from '@/components/store/atlas/MobileStickyCTA';
import { ProduceDeskPreview } from '@/components/store/atlas/ProduceDeskPreview';
import { ProductUiPreview } from '@/components/store/atlas/ProductUiPreview';
import { RegisteredWorkBadge } from '@/components/store/atlas/RegisteredWorkBadge';
import {
  STORE_ATLAS_COPY,
  STORE_ATLAS_PRODUCE_DESK,
  STORE_ATLAS_PRODUCE_FAQ,
  STORE_ATLAS_PRODUCE_GUEST,
  STORE_ATLAS_PRODUCE_TRANSFORM,
} from '@/config/storeAtlasTokens';
import { STORE_PRODUCE_LIVE, STORE_PRODUCE_LIVE_FEATURES, STORE_PRODUCE_LIVE_PACKS } from '@/config/storeProduceLive';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function AtlasProduceMock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="store-atlas min-h-full">
      <AtlasHeader compact={compact} />
      <section className="store-atlas__section store-atlas__hero">
        <div className="store-atlas__shell grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="store-atlas__copy-veil">
            <p className="store-atlas__meta font-bold text-[var(--atlas-teal)]">{STORE_PRODUCE_LIVE.kickerAr}</p>
            <h1 className={compact ? 'mt-2 text-[2.1rem] font-extrabold' : 'mt-2 text-5xl font-extrabold md:text-6xl'}>
              {STORE_PRODUCE_LIVE.titleAr}
            </h1>
            <p className="store-atlas__meta mt-3 font-extrabold text-[var(--atlas-teal)]">{STORE_ATLAS_COPY.forWhomLabelAr}</p>
            <p className="store-atlas__body mt-1 font-bold">{STORE_ATLAS_COPY.produceForWhomAr}</p>
            <p className="store-atlas__body mt-3 max-w-xl text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.produceResultAr}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to={ROUTE_PATHS.STORE_PRODUCE} className="store-atlas__btn store-atlas__btn--gold">
                {STORE_ATLAS_COPY.produceCtaAr}
              </Link>
              <RegisteredWorkBadge />
            </div>
          </div>
          <div className="store-atlas__card store-atlas__skin store-atlas__skin--warm relative overflow-hidden p-5">
            <img
              src="/images/store/produce/produce-01.jpg"
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="relative z-10 flex justify-center">
              <ProductUiPreview kind="produce" compact={compact} actionAr="أرسل الطلب للصندوق" />
            </div>
          </div>
        </div>
      </section>

      <section className="store-atlas__section bg-[var(--atlas-raised)]">
        <div className="store-atlas__shell grid gap-4 md:grid-cols-3">
          {STORE_ATLAS_PRODUCE_TRANSFORM.map((item) => (
            <article key={item.id} className="border-s-2 border-[var(--atlas-teal)] ps-4">
              <h2 className="store-atlas__card-title">{item.titleAr}</h2>
            </article>
          ))}
        </div>
      </section>

      <section className="store-atlas__section">
        <div className="store-atlas__shell">
          <h2 className="store-atlas__section-title">{STORE_ATLAS_COPY.produceGuestTitleAr}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {STORE_ATLAS_PRODUCE_GUEST.map((step, index) => (
              <li key={step} className="border-s-2 border-[var(--atlas-teal)] ps-4">
                <p className="store-atlas__meta font-bold text-[var(--atlas-teal)]">{index + 1}</p>
                <p className="store-atlas__body mt-2">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="store-atlas__section bg-[var(--atlas-raised)]">
        <div className="store-atlas__shell grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="store-atlas__section-title">{STORE_ATLAS_COPY.produceDeskTitleAr}</h2>
            <ul className="store-atlas__body mt-5 space-y-3">
              {STORE_ATLAS_PRODUCE_DESK.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="store-atlas__card relative overflow-hidden p-4">
            <img
              src="/images/store/produce/produce-02.jpg"
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15"
            />
            <div className="relative z-10">
              <ProduceDeskPreview compact={compact} />
            </div>
          </div>
        </div>
      </section>

      <section className="store-atlas__section">
        <div className="store-atlas__shell">
          <h2 className="store-atlas__section-title">{STORE_ATLAS_COPY.produceOfferTitleAr}</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {STORE_PRODUCE_LIVE_FEATURES.slice(0, 4).map((item) => (
              <li key={item.titleAr} className="border-s-2 border-[var(--atlas-teal)] ps-4">
                <h3 className="store-atlas__card-title">{item.titleAr}</h3>
                <p className="store-atlas__body mt-2 text-[var(--atlas-muted)]">{item.bodyAr}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="store-atlas__section bg-[var(--atlas-raised)]">
        <div className="store-atlas__shell max-w-3xl">
          <h2 className="store-atlas__section-title">{STORE_ATLAS_COPY.producePriceTitleAr}</h2>
          <ul className="mt-6 space-y-3">
            {STORE_PRODUCE_LIVE_PACKS.map((pack) => (
              <li key={pack.id} className="store-atlas__card p-5">
                <p className="font-extrabold">{pack.titleAr}</p>
                <p className="store-atlas__body mt-1">{pack.priceLineAr}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="store-atlas__section">
        <div className="store-atlas__shell max-w-3xl">
          <h2 className="store-atlas__section-title">{STORE_ATLAS_COPY.produceTrustTitleAr}</h2>
          <p className="store-atlas__body mt-3 text-[var(--atlas-teal)]">{STORE_ATLAS_COPY.produceSaipLineAr}</p>
          <ul className="mt-6 space-y-4">
            {STORE_ATLAS_PRODUCE_FAQ.map((item) => (
              <li key={item.qAr} className="store-atlas__card p-5">
                <p className="font-extrabold">{item.qAr}</p>
                <p className="store-atlas__body mt-2 text-[var(--atlas-muted)]">{item.aAr}</p>
              </li>
            ))}
          </ul>
          <Link to={ROUTE_PATHS.STORE_PRODUCE} className="store-atlas__btn store-atlas__btn--gold mt-8">
            {STORE_ATLAS_COPY.produceFinalCtaAr}
          </Link>
        </div>
      </section>
      <AtlasFooter />
      {compact ? <MobileStickyCTA to={ROUTE_PATHS.STORE_PRODUCE} labelAr={STORE_ATLAS_COPY.produceCtaAr} /> : null}
    </div>
  );
}
