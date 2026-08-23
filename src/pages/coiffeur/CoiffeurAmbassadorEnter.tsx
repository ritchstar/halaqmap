/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * طلب انضمام مسوّقة ميدانية لكوافير ماب — نسخة مؤنثة مطابقة لمسار سفراء حلاق ماب.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';
import {
  COIFFEUR_AMBASSADOR_COPY as COPY,
  COIFFEUR_AMBASSADOR_RULES_VERSION,
} from '@/config/coiffeurAmbassadorCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  ambassadorApplyErrorAr,
  submitAmbassadorApplicationRemoteApi,
} from '@/lib/ambassadorApplicationsRemote';
import { toast } from '@/components/ui/sonner';

const HALAQ_AMBASSADOR_HREF = `https://www.halaqmap.com/#${ROUTE_PATHS.AMBASSADOR_ENTER}`;

export default function CoiffeurAmbassadorEnter({ embedded = false }: { embedded?: boolean }) {
  useDocumentTitle(COPY.documentTitle);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [coverageArea, setCoverageArea] = useState('');
  const [salesExperience, setSalesExperience] = useState('');
  const [socialProofUrl, setSocialProofUrl] = useState('');
  const [socialProofLabel, setSocialProofLabel] = useState('');
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      toast.error('أدخلي الاسم الظاهر (حرفان على الأقل).');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      toast.error('أدخلي رقم جوال صالحاً.');
      return;
    }
    if (coverageArea.trim().length < 8) {
      toast.error('اكتبي الحي أو النطاق الجغرافي الذي تستطيعين تغطيته.');
      return;
    }
    if (salesExperience.trim().length < 20) {
      toast.error('اشرحي خبرتك أو استعدادك للمبيعات الميدانية بجملة واضحة.');
      return;
    }
    if (!acceptedRules) {
      toast.error('يجب الموافقة على وثيقة قواعد المسوّقات.');
      return;
    }

    setSubmitting(true);
    const remote = await submitAmbassadorApplicationRemoteApi({
      displayName,
      phone,
      coverageArea: `كوافير ماب — ${coverageArea.trim()}`,
      salesExperience: `مسوّقة كوافير ماب. ${salesExperience.trim()}`,
      socialProofUrl,
      socialProofLabel,
    });
    setSubmitting(false);

    if (!remote.ok) {
      toast.error(ambassadorApplyErrorAr(remote.error));
      return;
    }

    toast.success(COPY.successAr);
    setSubmitted(true);
  };

  const body = (
    <>
      <div className={embedded ? 'mb-6 text-center' : 'mb-8 text-center'}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f4d4c0]/35 bg-[#e8b4a2]/15">
            <Handshake className="h-7 w-7 text-[#f4d4c0]" aria-hidden />
          </div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#f4d4c0]">{COPY.badgeAr}</p>
          <h1 className={embedded ? 'mt-2 text-2xl font-black text-white' : 'mt-2 text-3xl font-black text-white'}>
            {COPY.titleAr}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-rose-100/80">{COPY.leadAr}</p>
          <p className="mt-3 text-xs leading-relaxed text-[#f4d4c0]/90">{COPY.reviewHintAr}</p>
          <p className="mt-2 text-xs text-rose-100/50">
            {COPY.rulesVersionLabelAr}: {COIFFEUR_AMBASSADOR_RULES_VERSION}
          </p>
          <Link
            to={ROUTE_PATHS.COIFFEUR_AMBASSADOR_RULES}
            className="mt-4 inline-flex text-sm font-bold text-[#f4d4c0] underline-offset-4 hover:underline"
          >
            {COPY.navRulesAr}
          </Link>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-[#f4d4c0]/30 bg-[#2a1218]/80 p-6 text-center">
            <h2 className="text-xl font-extrabold text-[#f4d4c0]">{COPY.pendingTitleAr}</h2>
            <p className="mt-3 text-sm leading-7 text-rose-50/85">{COPY.pendingBodyAr}</p>
          </div>
        ) : (
          <form
            onSubmit={(event) => void onSubmit(event)}
            className="space-y-5 rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218]/80 p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="cf-amb-name" className="text-rose-50">
                {COPY.nameLabelAr}
              </Label>
              <Input
                id="cf-amb-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={80}
                placeholder={COPY.namePlaceholderAr}
                className="border-[#f4d4c0]/25 bg-black/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-amb-phone" className="text-rose-50">
                {COPY.phoneLabelAr}
              </Label>
              <Input
                id="cf-amb-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={20}
                placeholder="05xxxxxxxx"
                inputMode="tel"
                className="border-[#f4d4c0]/25 bg-black/30 text-white"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-amb-coverage" className="text-rose-50">
                {COPY.coverageLabelAr}
              </Label>
              <Textarea
                id="cf-amb-coverage"
                value={coverageArea}
                onChange={(event) => setCoverageArea(event.target.value)}
                rows={2}
                maxLength={300}
                placeholder={COPY.coveragePlaceholderAr}
                className="border-[#f4d4c0]/25 bg-black/30 text-white placeholder:text-rose-100/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-amb-exp" className="text-rose-50">
                {COPY.experienceLabelAr}
              </Label>
              <Textarea
                id="cf-amb-exp"
                value={salesExperience}
                onChange={(event) => setSalesExperience(event.target.value)}
                rows={3}
                maxLength={600}
                placeholder={COPY.experiencePlaceholderAr}
                className="border-[#f4d4c0]/25 bg-black/30 text-white placeholder:text-rose-100/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-amb-social-url" className="text-rose-50">
                {COPY.socialUrlLabelAr}
              </Label>
              <Input
                id="cf-amb-social-url"
                value={socialProofUrl}
                onChange={(event) => setSocialProofUrl(event.target.value)}
                placeholder="https://x.com/…"
                className="border-[#f4d4c0]/25 bg-black/30 text-white"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-amb-social-file" className="text-rose-50">
                {COPY.socialFileLabelAr}
              </Label>
              <Input
                id="cf-amb-social-file"
                type="file"
                accept="image/*"
                onChange={(event) => setSocialProofLabel(event.target.files?.[0]?.name ?? '')}
                className="border-[#f4d4c0]/25 bg-black/30 text-rose-100/80 file:bg-[#f4d4c0]/20 file:text-[#f4d4c0]"
              />
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[#f4d4c0]/25 bg-[#e8b4a2]/10 p-4">
              <Checkbox
                id="cf-amb-rules"
                checked={acceptedRules}
                onCheckedChange={(value) => setAcceptedRules(value === true)}
                className="mt-0.5 border-[#f4d4c0]/40 data-[state=checked]:bg-[#e8b4a2]"
              />
              <Label htmlFor="cf-amb-rules" className="cursor-pointer text-sm leading-relaxed text-rose-50">
                {COPY.rulesAcceptBeforeAr}{' '}
                <Link to={ROUTE_PATHS.COIFFEUR_AMBASSADOR_RULES} className="font-semibold text-[#f4d4c0] underline">
                  {COPY.rulesAcceptLinkAr}
                </Link>
                {COPY.rulesAcceptAfterAr}
              </Label>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full rounded-xl bg-[#e8b4a2] font-bold text-[#2a1218] hover:bg-[#f4d4c0]"
            >
              {submitting ? COPY.submittingAr : COPY.submitAr}
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-rose-100/45">{COPY.footerHintAr}</p>
          </form>
        )}

        <div className="mt-8 space-y-2 text-center text-sm">
          <p className="font-bold text-[#f4d4c0]">{COPY.kitTitleAr}</p>
          <p className="text-xs leading-6 text-rose-100/60">{COPY.kitLeadAr}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
            <Link to={ROUTE_PATHS.COIFFEUR_PARTNERS} className="text-rose-100/80 hover:text-[#f4d4c0]">
              {COPY.kitPartnersAr}
            </Link>
            <Link to={ROUTE_PATHS.COIFFEUR_MARKETING} className="text-rose-100/80 hover:text-[#f4d4c0]">
              {COPY.kitMarketingAr}
            </Link>
          </div>
        </div>

        {embedded ? null : (
          <p className="mt-8 text-center text-xs text-rose-100/45">
            {COPY.counterpartKickerAr}
            {' · '}
            <a href={HALAQ_AMBASSADOR_HREF} className="text-[#f4d4c0] underline-offset-4 hover:underline">
              {COPY.counterpartAr}
            </a>
          </p>
        )}
    </>
  );

  if (embedded) return <div className="mx-auto max-w-lg">{body}</div>;

  return (
    <CoiffeurVisitorShell withMobileDock={false}>
      <CoiffeurVisitorHeader brandTo={ROUTE_PATHS.COIFFEUR_LANDING} />
      <main className="mx-auto max-w-lg px-4 py-10 pb-16">{body}</main>
      <CoiffeurVisitorFooter showPartnersLater />
    </CoiffeurVisitorShell>
  );
}
