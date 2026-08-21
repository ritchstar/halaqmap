/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط دعوة الزواج التفاعلية — معاينة كاملة داخل الصفحة.
 */
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreWeddingInviteCard } from '@/components/store/StoreWeddingInviteCard';
import { StoreWeddingLiveStudio } from '@/components/store/StoreWeddingLiveStudio';
import { StoreWeddingOrderForm } from '@/components/store/StoreWeddingOrderForm';
import {
  STORE_WEDDING_LIVE,
  STORE_WEDDING_LIVE_PUBLIC_ENABLED,
} from '@/config/storeWeddingLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { defaultWeddingLiveLabState } from '@/lib/storeWeddingLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const FEATURES = [
  'كرت بأسماء الداعي والعريس والعروس، والتاريخ والوقت وقاعة الحفل.',
  'أيقونة خرائط جوجل تفتح موقع القاعة من الكرت نفسه.',
  'قاعة حيّة على الشاشة الكبيرة: تهاني، تنويهات، صور، ويوتيوب.',
  'احجب الفيديو متى شئت وأظهر بانوراما، ثم أعده بضغطة.',
  'ارفع صورك، اكتب نصوصك، وجرّب تهنئة الضيف قبل الطلب.',
] as const;

export default function StoreWeddingLandingPage() {
  useDocumentTitle(STORE_WEDDING_LIVE.documentTitle);
  const demo = defaultWeddingLiveLabState();
  const [termsOpen, setTermsOpen] = useState(false);

  if (!STORE_WEDDING_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold tracking-wide text-[#e8c547]">{STORE_WEDDING_LIVE.kickerAr}</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4]">{STORE_WEDDING_LIVE.titleAr}</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/78">{STORE_WEDDING_LIVE.leadAr}</p>
            <p className="mt-4 text-2xl font-black text-[#e8c547]">{STORE_WEDDING_LIVE.priceLineAr}</p>
            <ul className="mt-6 space-y-2 text-sm leading-7 text-white/75">
              {FEATURES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={ROUTE_PATHS.STORE_WEDDING}
                className="rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-bold text-[#061018]"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_WEDDING_LIVE.tryCtaAr}
              </a>
              <a
                href="#wedding-order"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('wedding-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {STORE_WEDDING_LIVE.orderCtaAr}
              </a>
            </div>
            <Collapsible open={termsOpen} onOpenChange={setTermsOpen} className="mt-6">
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold"
              >
                <span>{STORE_WEDDING_LIVE.termsFoldTriggerAr}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#e8c547] transition-transform', termsOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#0b1a24]/80 p-4 text-sm leading-8 text-white/70">
                <p>{STORE_WEDDING_LIVE.termsFoldTitleAr}</p>
                <p className="mt-2">{STORE_WEDDING_LIVE.termsFoldBodyAr}</p>
                <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="mt-3 inline-flex text-[#e8c547]">
                  شروط إصدار البطاقات
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <StoreWeddingInviteCard host={demo.host} styleId="gold" />
        </div>
      </section>
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-6xl">
          <StoreWeddingLiveStudio />
          <div className="mt-10 max-w-2xl">
            <StoreWeddingOrderForm />
          </div>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
