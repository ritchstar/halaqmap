/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import {
  STORE_ISSUED_CARDS_LEGAL_FOLD_HINT_AR,
  STORE_ISSUED_CARDS_LEGAL_FOLD_TRIGGER_AR,
  STORE_ISSUED_CARDS_LEGAL_SECTIONS,
  STORE_ISSUED_CARDS_LEGAL_SUBTITLE_AR,
  STORE_ISSUED_CARDS_LEGAL_TITLE_AR,
  STORE_ISSUED_CARDS_POLICY_VERSION,
  acceptedChecksForTrack,
  consentsForTrack,
  unifiedConsentLabelForTrack,
  type StoreIssuedCardTrack,
} from '@/config/storeIssuedCardsLegal';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';
import { STORE_DIRECT_PAY_POLICY_TITLE_AR } from '@/config/storeDirectPayLegal';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { storeStoreIssuedConsent } from '@/lib/storeIssuedCardsConsent';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

export default function StoreIssuedCardsLegalHub() {
  useDocumentTitle(STORE_ISSUED_CARDS_LEGAL_TITLE_AR);
  const navigate = useNavigate();
  const track: StoreIssuedCardTrack = 'paid';
  const checksForTrack = consentsForTrack(track);
  const unifiedLabel = unifiedConsentLabelForTrack(track);

  const [accepted, setAccepted] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    setAccepted(false);
    setDetailsOpen(false);
  }, [track]);

  const onContinue = () => {
    if (!accepted) {
      toast.error('وافق على الشروط للمتابعة.');
      return;
    }
    storeStoreIssuedConsent(track, acceptedChecksForTrack(track));
    navigate(ROUTE_PATHS.STORE_INVITES);
  };

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-bold tracking-wide text-[#e8c547]">halaqmap · خريطة الحل</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#f4efe4]">{STORE_ISSUED_CARDS_LEGAL_TITLE_AR}</h1>
        <p className="mt-3 text-sm leading-7 text-white/75">{STORE_ISSUED_CARDS_LEGAL_SUBTITLE_AR}</p>
        <p className="mt-2 text-sm leading-7 text-white/70">
          <Link to={ROUTE_PATHS.STORE_DIRECT_PAY_POLICY} className="text-[#e8c547] underline">
            {STORE_DIRECT_PAY_POLICY_TITLE_AR}
          </Link>
        </p>
        <p className="mt-2 text-xs text-white/45">نسخة السياسات: {STORE_ISSUED_CARDS_POLICY_VERSION}</p>

        <section id="issued-card-consents" className="mt-8 rounded-2xl border border-[#e8c547]/30 bg-[#0b1a24] p-5">
          <h2 className="text-xl font-bold text-[#e8c547]">موافقة واحدة قبل البدء</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{STORE_ISSUED_CARDS_LEGAL_FOLD_HINT_AR}</p>
          <p className="mt-1 text-xs text-white/45">تُحفظ الموافقة في جلسة المتصفح الحالية فقط، وترتبط بنسخة السياسات أعلاه.</p>

          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="mt-5">
            <CollapsibleTrigger
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold text-[#f4efe4] transition-colors hover:bg-white/10"
            >
              <span>{STORE_ISSUED_CARDS_LEGAL_FOLD_TRIGGER_AR}</span>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-[#e8c547] transition-transform', detailsOpen && 'rotate-180')}
                aria-hidden
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              {STORE_ISSUED_CARDS_LEGAL_SECTIONS.map((section) => (
                <article key={section.id} id={section.id} className="rounded-2xl border border-white/10 bg-[#0b1a24]/80 p-5">
                  <h3 className="text-lg font-bold text-[#f4efe4]">{section.title}</h3>
                  <div className="partner-legal-prose mt-3 max-w-none">{renderLegalContentBlocks(section.content)}</div>
                </article>
              ))}
              <article className="rounded-2xl border border-[#e8c547]/20 bg-[#e8c547]/5 p-5">
                <h3 className="text-lg font-bold text-[#e8c547]">التعهدات المدرجة في هذه الموافقة</h3>
                <ul className="mt-3 list-disc space-y-2 pr-5 text-sm leading-relaxed text-[#f4efe4]">
                  {checksForTrack.map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </article>
            </CollapsibleContent>
          </Collapsible>

          <div
            className={cn(
              'mt-5 flex items-start gap-3 rounded-xl border p-4',
              accepted ? 'border-[#e8c547]/40 bg-[#e8c547]/5' : 'border-white/10',
            )}
          >
            <Checkbox
              id="issued-unified-consent"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
            />
            <Label htmlFor="issued-unified-consent" className="cursor-pointer text-sm leading-relaxed text-[#f4efe4]">
              {unifiedLabel}
            </Label>
          </div>
          <Button
            type="button"
            disabled={!accepted}
            onClick={onContinue}
            className="mt-6 w-full bg-[#e8c547] text-[#061018] hover:bg-[#f0d36a]"
          >
            أوافق وأبدأ الآن
          </Button>
        </section>
      </main>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
