/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط الدعوة الحرة بعد تصنيف الستايل.
 */
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreEventInviteCard } from '@/components/store/StoreEventInviteCard';
import { StoreGiftPromoBanner } from '@/components/store/StoreGiftPromoBanner';
import { StoreProductBenefitsLink } from '@/components/store/StoreProductBenefitsLink';
import { StoreShot } from '@/components/store/StoreShot';
import { StoreEventLiveStudio } from '@/components/store/StoreEventLiveStudio';
import { StoreEventOrderForm } from '@/components/store/StoreEventOrderForm';
import {
  STORE_EVENT_LIVE_LAB_TOKEN,
  STORE_EVENT_LIVE_LAB_TOKEN_WOMEN,
  STORE_EVENT_LIVE_PUBLIC_ENABLED,
  eventLiveCopy,
  eventLiveFillClass,
  eventLiveTextClass,
  type StoreEventLiveVoice,
} from '@/config/storeEventLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { defaultEventLiveLabState, eventLiveDefaultStyle } from '@/lib/storeEventLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const FEATURES_MEN = [
  'قاعة تفاعلية حية تتصل بشاشة العرض، فيرسل الضيوف التهاني لتظهر فوراً في وسط الشاشة.',
  'شريط التنويهات والوسائط: فيديو أو يوتيوب، وتنويه نابض على الشاشة عند تغيّر حالة الحفل.',
  'لوحة تحكم فورية لمراجعة التهاني وتحديد ما يُعرض على شاشة القاعة.',
] as const;

const FEATURES_WOMEN = [
  'قاعة تفاعلية حية تتصل بشاشة العرض، فترسل الضيفات التهاني لتظهر فوراً في وسط الشاشة.',
  'شريط التنويهات والوسائط: فيديو أو يوتيوب، وتنويه نابض على الشاشة عند تغيّر حالة الحفل.',
  'لوحة تحكم فورية لمراجعة التهاني وتحديد ما يُعرض على شاشة القاعة.',
] as const;

export default function StoreEventLandingPage() {
  const location = useLocation();
  const voice: StoreEventLiveVoice = location.pathname.includes('/women') ? 'women' : 'men';
  const copy = eventLiveCopy(voice);
  const demo = defaultEventLiveLabState(voice);
  const [termsOpen, setTermsOpen] = useState(false);
  useDocumentTitle(copy.documentTitle);

  if (!STORE_EVENT_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const features = voice === 'women' ? FEATURES_WOMEN : FEATURES_MEN;
  const fill = eventLiveFillClass(voice);
  const text = eventLiveTextClass(voice);
  const labToken = voice === 'women' ? STORE_EVENT_LIVE_LAB_TOKEN_WOMEN : STORE_EVENT_LIVE_LAB_TOKEN;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <StoreGiftPromoBanner compact />
      <section className="px-4 py-10 md:py-14" data-voice={voice}>
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className={cn('text-sm font-bold tracking-wide', text)}>{copy.kickerAr}</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[#f4efe4]">{copy.titleAr}</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/78">{copy.leadAr}</p>
            <p className={cn('mt-4 text-2xl font-black', text)}>{copy.priceLineAr}</p>
            <ul className="mt-6 space-y-2 text-sm leading-7 text-white/75">
              {features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#live-preview"
                className={cn('rounded-full px-5 py-2.5 text-sm font-bold', fill)}
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {copy.tryCtaAr}
              </a>
              <a
                href="#event-order"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('event-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {copy.orderCtaAr}
              </a>
              <Link to={ROUTE_PATHS.STORE_EVENT} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white/55">
                غيّر التصنيف
              </Link>
              <StoreProductBenefitsLink />
            </div>
            <StoreEnterpriseDirectMail
              className="mt-5 max-w-xl"
              linkClassName={text}
              productTitleAr={copy.titleAr}
            />
            <Collapsible open={termsOpen} onOpenChange={setTermsOpen} className="mt-6">
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold"
              >
                <span>{copy.termsFoldTriggerAr}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', text, termsOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 rounded-xl border border-white/10 bg-[#0b1a24]/80 p-4 text-sm leading-8 text-white/70">
                <p>{copy.termsFoldTitleAr}</p>
                <p className="mt-2">{copy.termsFoldBodyAr}</p>
                <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className={cn('mt-3 inline-flex', text)}>
                  شروط الخدمة
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <div className="space-y-4">
            <figure className="overflow-hidden rounded-2xl border border-white/12">
              <StoreShot
                reel={voice === 'women' ? 'event-women' : 'event'}
                alt={copy.titleAr}
                className="aspect-[16/9]"
                eager
              />
            </figure>
            <StoreEventInviteCard host={demo.host} styleId={eventLiveDefaultStyle(voice)} />
          </div>
        </div>
      </section>
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-6xl">
          <StoreEventLiveStudio token={labToken} />
          <div className="mt-10 max-w-2xl">
            <StoreEventOrderForm voice={voice} />
          </div>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
