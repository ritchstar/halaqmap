/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هبوط دعوة الزواج التفاعلية — معاينة كاملة داخل الصفحة.
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
import { StoreShot } from '@/components/store/StoreShot';
import { StoreWeddingInviteCard } from '@/components/store/StoreWeddingInviteCard';
import { StoreWeddingLiveStudio } from '@/components/store/StoreWeddingLiveStudio';
import { StoreWeddingOrderForm } from '@/components/store/StoreWeddingOrderForm';
import {
  STORE_WEDDING_LIVE_LAB_TOKEN,
  STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN,
  STORE_WEDDING_LIVE_PUBLIC_ENABLED,
  weddingLiveCopy,
  weddingLiveFillClass,
  weddingLiveTextClass,
  type StoreWeddingLiveVoice,
} from '@/config/storeWeddingLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { defaultWeddingLiveLabState, weddingLiveDefaultStyle } from '@/lib/storeWeddingLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const FEATURES_MEN = [
  'قاعة تفاعلية حية تتصل بشاشة عرض القاعة، فيرسل الضيوف التهاني لتظهر فوراً في وسط الشاشة.',
  'شريط التنويهات والوسائط: فيديو أو يوتيوب، وتنويه نابض على الشاشة عند تغيّر حالة الحفل.',
  'لوحة تحكم فورية لمراجعة التهاني وتحديد ما يُعرض على شاشة القاعة.',
] as const;

const FEATURES_WOMEN = [
  'قاعة تفاعلية حية تتصل بشاشة عرض القاعة، فترسل الضيفات التهاني لتظهر فوراً في وسط الشاشة.',
  'شريط التنويهات والوسائط: فيديو أو يوتيوب، وتنويه نابض على الشاشة عند تغيّر حالة الحفل.',
  'لوحة تحكم فورية لمراجعة التهاني وتحديد ما يُعرض على شاشة القاعة.',
] as const;

export default function StoreWeddingLandingPage() {
  const location = useLocation();
  const voice: StoreWeddingLiveVoice = location.pathname.includes('/wedding/women') ? 'women' : 'men';
  const copy = weddingLiveCopy(voice);
  const demo = defaultWeddingLiveLabState(voice);
  const [termsOpen, setTermsOpen] = useState(false);
  useDocumentTitle(copy.documentTitle);

  if (!STORE_WEDDING_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const features = voice === 'women' ? FEATURES_WOMEN : FEATURES_MEN;
  const fill = weddingLiveFillClass(voice);
  const text = weddingLiveTextClass(voice);
  const labToken = voice === 'women' ? STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN : STORE_WEDDING_LIVE_LAB_TOKEN;
  const sisterHref = voice === 'women' ? ROUTE_PATHS.STORE_WEDDING : ROUTE_PATHS.STORE_WEDDING_WOMEN;
  const sisterLabel = voice === 'women' ? 'النموذج الرجالي' : 'النموذج النسائي';

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
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
                href="#wedding-order"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('wedding-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {copy.orderCtaAr}
              </a>
              <Link to={sisterHref} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white/55">
                {sisterLabel}
              </Link>
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
                reel={voice === 'women' ? 'wedding-women' : 'wedding'}
                alt={copy.titleAr}
                className="aspect-[16/9]"
                eager
              />
            </figure>
            <StoreWeddingInviteCard host={demo.host} styleId={weddingLiveDefaultStyle(voice)} />
          </div>
        </div>
      </section>
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-6xl">
          <StoreWeddingLiveStudio token={labToken} />
          <div className="mt-10 max-w-2xl">
            <StoreWeddingOrderForm voice={voice} />
          </div>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
