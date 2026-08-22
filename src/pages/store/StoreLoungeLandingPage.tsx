/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط لاونجا1 — تشغيل شاشات اللاونج.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreLoungeLiveStudio } from '@/components/store/StoreLoungeLiveStudio';
import { StoreLoungeOrderForm } from '@/components/store/StoreLoungeOrderForm';
import {
  STORE_LOUNGE_LIVE,
  STORE_LOUNGE_LIVE_EVENTS,
  STORE_LOUNGE_LIVE_LAB_TOKEN,
  STORE_LOUNGE_LIVE_PUBLIC_ENABLED,
} from '@/config/storeLoungeLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const FEATURES = [
  'حزمة فعاليات جاهزة للشاشة: ترحيب، عيد ميلاد، إهداء ترحيب، افتتاحية الليلة، وما يضيفه اللاونج.',
  'لوحة تحكم لإدارة ما يظهر على الشاشات.',
  'رابط يوزّعه اللاونج على زبائنه لترحيبات باسمهم تظهر على الشاشة.',
  'شراء مرة واحدة لثلاثة أشهر. عند الانتهاء يبقى الرابط ويحوّلكم لإعادة الشراء على نفس الصفحة.',
  'لا تحصيل من الزائر غير سعر المنتج.',
] as const;

export default function StoreLoungeLandingPage() {
  const [termsOpen, setTermsOpen] = useState(false);
  const renewToken = useMemo(() => readHashQueryParam('renew') || '', []);
  useDocumentTitle(STORE_LOUNGE_LIVE.documentTitle);

  if (!STORE_LOUNGE_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold tracking-wide text-[#d4a574]">{STORE_LOUNGE_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4]">{STORE_LOUNGE_LIVE.titleAr}</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/78">{STORE_LOUNGE_LIVE.leadAr}</p>
            <p className="mt-4 text-2xl font-black text-[#d4a574]">{STORE_LOUNGE_LIVE.priceLineAr}</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/65">{STORE_LOUNGE_LIVE.durationLineAr}</p>
            {renewToken ? (
              <p className="mt-4 rounded-xl border border-[#d4a574]/35 bg-[#d4a574]/10 px-4 py-3 text-sm leading-7">
                {STORE_LOUNGE_LIVE.expiredLeadAr}
              </p>
            ) : null}
            <ul className="mt-6 space-y-2 text-sm leading-7 text-white/75">
              {FEATURES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {STORE_LOUNGE_LIVE_EVENTS.map((item) => (
                <span key={item.id} className="rounded-full border border-[#d4a574]/30 px-3 py-1 text-xs text-[#d4a574]">
                  {item.titleAr}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#live-preview"
                className="rounded-full bg-[#d4a574] px-5 py-2.5 text-sm font-bold text-[#12090c]"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_LOUNGE_LIVE.tryCtaAr}
              </a>
              <a
                href="#lounge-order"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('lounge-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {renewToken ? STORE_LOUNGE_LIVE.renewCtaAr : STORE_LOUNGE_LIVE.orderCtaAr}
              </a>
            </div>
            <Collapsible open={termsOpen} onOpenChange={setTermsOpen} className="mt-6">
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold"
              >
                <span>{STORE_LOUNGE_LIVE.termsFoldTriggerAr}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform text-[#d4a574]', termsOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#0b1a24]/80 p-4 text-sm leading-8 text-white/70">
                <p>{STORE_LOUNGE_LIVE.termsFoldTitleAr}</p>
                <p className="mt-2">{STORE_LOUNGE_LIVE.termsFoldBodyAr}</p>
                <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="mt-3 inline-flex text-[#d4a574]">
                  شروط الخدمة
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-[#d4a574]/30 bg-[#0b1a24]/80 shadow-[0_24px_60px_-28px_rgba(212,165,116,0.55)]">
            <img
              src={STORE_LOUNGE_LIVE.heroImage}
              alt={STORE_LOUNGE_LIVE.heroAltAr}
              className="aspect-[16/10] w-full object-cover"
            />
            <figcaption className="border-t border-[#d4a574]/20 bg-[#0b1a24] px-5 py-4">
              <p className="text-xs tracking-[0.3em] text-[#d4a574]">{STORE_LOUNGE_LIVE.hallKickerAr}</p>
              <p className="mt-2 text-lg font-black text-[#f4efe4]">{STORE_LOUNGE_LIVE.heroCaptionAr}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {STORE_LOUNGE_LIVE_EVENTS.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-full border border-[#d4a574]/25 px-2.5 py-1 text-[11px] text-[#d4a574]"
                  >
                    {item.titleAr}
                  </li>
                ))}
              </ul>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-6xl">
          <StoreLoungeLiveStudio token={STORE_LOUNGE_LIVE_LAB_TOKEN} />
          <div className="mt-10 max-w-2xl">
            <StoreLoungeOrderForm renewToken={renewToken} />
          </div>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
