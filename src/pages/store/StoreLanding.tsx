/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة متجر halaqmap على store.halaqmap.com — البداية.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StoreServiceRequestForm } from '@/components/store/StoreServiceRequestForm';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreDeskChatCard } from '@/components/store/StoreDeskChatCard';
import { StoreShot } from '@/components/store/StoreShot';
import {
  STORE_GREETING_OCCASIONS,
  STORE_LANDING_COPY,
  STORE_LIVE_PRODUCTS,
  STORE_SOFTWARE_SHOTS,
  STORE_VISUALS,
  storeCardsPath,
} from '@/config/storeFront';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreLanding() {
  useDocumentTitle(STORE_LANDING_COPY.documentTitle);

  useEffect(() => {
    ProductEvents.storeLandingView({ source: 'landing' });
  }, []);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_LANDING_COPY.kicker}</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4] md:text-5xl">
              {STORE_LANDING_COPY.latinMark}
            </h1>
            <p className="mt-2 text-2xl font-extrabold text-[#e8c547] md:text-3xl">
              {STORE_LANDING_COPY.publicName}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/78 md:text-lg">
              {STORE_LANDING_COPY.heroLead}
            </p>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#e8c547]/30 shadow-[0_24px_60px_-28px_rgba(232,197,71,0.45)]">
            <StoreShot
              src={STORE_VISUALS.hero}
              alt={STORE_LANDING_COPY.heroShotAlt}
              className="aspect-[4/3]"
              eager
            />
            <figcaption className="border-t border-white/10 bg-[#0b1a24] px-4 py-2 text-sm font-bold text-[#e8c547]">
              {STORE_LANDING_COPY.heroShotCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="mx-auto max-w-sm">
          <h2 className="text-center text-lg font-extrabold text-white/90">{STORE_LANDING_COPY.deskChatTitle}</h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-white/70">{STORE_LANDING_COPY.deskChatLead}</p>
          <div className="mt-5">
            <StoreDeskChatCard />
          </div>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-extrabold text-white/90">{STORE_LANDING_COPY.softwareStripTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {STORE_SOFTWARE_SHOTS.map((shot) => (
              <figure
                key={shot.src}
                className="overflow-hidden rounded-2xl border border-white/12 bg-[#0b1a24]/70"
              >
                <StoreShot src={shot.src} alt={shot.alt} className="aspect-[16/10]" />
                <figcaption className="px-3 py-2 text-sm font-bold text-white/75">{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="request" className="px-4 pb-12">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-6">
            <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_LANDING_COPY.requestTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{STORE_LANDING_COPY.requestLead}</p>
            <div className="mt-6">
              <StoreServiceRequestForm source="store-landing" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
              <h2 className="text-xl font-extrabold">المنتجات الحالية</h2>
              <ul className="mt-4 space-y-3">
                {STORE_LIVE_PRODUCTS.map((product) => (
                  <li key={product.id}>
                    <a
                      href={product.href}
                      className="block overflow-hidden rounded-xl border border-white/10 bg-[#061018]/70 transition hover:border-[#e8c547]/40"
                    >
                      <StoreShot src={product.image} alt={product.imageAlt} className="aspect-[16/9]" />
                      <div className="flex items-start gap-3 p-4">
                        <img
                          src={product.mark}
                          alt=""
                          width={44}
                          height={44}
                          className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-extrabold text-[#e8c547]">{product.nameAr}</p>
                          <p className="mt-1 text-sm leading-relaxed text-white/70">{product.blurb}</p>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04]">
              <StoreShot
                src={STORE_VISUALS.ops}
                alt="لوحة تشغيل برمجية لخدمات لاحقة قيد التجهيز"
                className="aspect-[16/8]"
              />
              <div className="p-5">
                <h2 className="text-xl font-extrabold">{STORE_LANDING_COPY.comingSoonTitle}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {STORE_LANDING_COPY.comingSoonLead}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#e8c547]/25 bg-[#0b1a24]/70 p-5 md:p-6">
          <h2 className="text-2xl font-extrabold">{STORE_LANDING_COPY.freeCardsTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
            {STORE_LANDING_COPY.freeCardsLead}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {STORE_GREETING_OCCASIONS.map((item) => (
              <Link
                key={item.id}
                to={storeCardsPath(item.id)}
                className="overflow-hidden rounded-xl border border-white/12 bg-[#061018] transition hover:border-[#e8c547]/50"
              >
                <StoreShot src={item.image} alt={item.imageAlt} className="aspect-[16/10]" />
                <div className="p-4">
                  <p className="font-extrabold text-[#f4efe4]">{item.titleAr}</p>
                  <p className="mt-1 text-sm text-white/65">{item.subtitleAr}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#e8c547]">
                    إصدار البطاقة
                    <ArrowLeft className="h-4 w-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to={ROUTE_PATHS.STORE_CARDS}
            className="mt-4 inline-flex text-sm font-bold text-white/70 underline-offset-4 hover:underline"
          >
            فتح الاستوديو
          </Link>
        </div>
      </section>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
