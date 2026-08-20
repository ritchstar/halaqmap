/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import {
  STORE_ISSUED_CARDS_LEGAL_SECTIONS,
  STORE_ISSUED_CARDS_LEGAL_SUBTITLE_AR,
  STORE_ISSUED_CARDS_LEGAL_TITLE_AR,
  STORE_ISSUED_CARDS_POLICY_VERSION,
  consentsForTrack,
  type StoreIssuedCardTrack,
  type StoreIssuedConsentCheckId,
} from '@/config/storeIssuedCardsLegal';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { storeStoreIssuedConsent } from '@/lib/storeIssuedCardsConsent';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

function parseTrack(raw: string | null): StoreIssuedCardTrack {
  return raw === 'bereavement' ? 'bereavement' : 'paid';
}

export default function StoreIssuedCardsLegalHub() {
  useDocumentTitle(STORE_ISSUED_CARDS_LEGAL_TITLE_AR);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const track = parseTrack(params.get('track'));
  const checksForTrack = consentsForTrack(track);

  const [checks, setChecks] = useState<Partial<Record<StoreIssuedConsentCheckId, boolean>>>({});

  const allRequired = useMemo(
    () => checksForTrack.filter((item) => item.required).every((item) => checks[item.id] === true),
    [checks, checksForTrack],
  );

  const onContinue = () => {
    if (!allRequired) {
      toast.error('يرجى الموافقة على جميع الإقرارات الإلزامية قبل المتابعة.');
      return;
    }
    storeStoreIssuedConsent(track, checks);
    navigate(track === 'bereavement' ? ROUTE_PATHS.STORE_BEREAVEMENT_CREATE : ROUTE_PATHS.STORE_INVITES);
  };

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-bold tracking-wide text-[#e8c547]">halaqmap · خريطة الحل</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#f4efe4]">{STORE_ISSUED_CARDS_LEGAL_TITLE_AR}</h1>
        <p className="mt-3 text-sm leading-7 text-white/75">{STORE_ISSUED_CARDS_LEGAL_SUBTITLE_AR}</p>
        <p className="mt-2 text-xs text-white/45">نسخة السياسات: {STORE_ISSUED_CARDS_POLICY_VERSION}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            to={`${ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL}?track=paid`}
            className={cn('rounded-full px-3 py-1.5', track === 'paid' ? 'bg-[#e8c547] text-[#061018]' : 'border border-white/20 text-white/80')}
          >
            بطاقة مدفوعة
          </Link>
          <Link
            to={`${ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL}?track=bereavement`}
            className={cn('rounded-full px-3 py-1.5', track === 'bereavement' ? 'bg-white/90 text-[#061018]' : 'border border-white/20 text-white/80')}
          >
            بلاغ وفاة وعزاء
          </Link>
        </div>

        <div className="mt-8 space-y-5">
          {STORE_ISSUED_CARDS_LEGAL_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="rounded-2xl border border-white/10 bg-[#0b1a24]/80 p-5">
              <h2 className="text-xl font-bold text-[#f4efe4]">{section.title}</h2>
              <div className="partner-legal-prose mt-3 max-w-none">{renderLegalContentBlocks(section.content)}</div>
            </section>
          ))}
        </div>

        <section id="issued-card-consents" className="mt-10 rounded-2xl border border-[#e8c547]/30 bg-[#0b1a24] p-5">
          <h2 className="text-xl font-bold text-[#e8c547]">التعهدات والإقرارات الإلزامية</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            تُحفظ الموافقة في جلسة المتصفح الحالية فقط، وترتبط بنسخة السياسات أعلاه.
          </p>
          <div className="mt-5 space-y-3">
            {checksForTrack.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4',
                  checks[item.id] ? 'border-[#e8c547]/40 bg-[#e8c547]/5' : 'border-white/10',
                )}
              >
                <Checkbox
                  id={`issued-${item.id}`}
                  checked={checks[item.id] === true}
                  onCheckedChange={(v) => setChecks((prev) => ({ ...prev, [item.id]: v === true }))}
                />
                <Label htmlFor={`issued-${item.id}`} className="cursor-pointer text-sm leading-relaxed text-[#f4efe4]">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
          <Button
            type="button"
            disabled={!allRequired}
            onClick={onContinue}
            className="mt-6 w-full bg-[#e8c547] text-[#061018] hover:bg-[#f0d36a]"
          >
            أوافق وأنتقل إلى الإنشاء
          </Button>
        </section>
      </main>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
