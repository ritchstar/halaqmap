/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * صفحة اهتمام كوافير ماب — تحويل يوتيوب وتسجيل بريد + عدّة كروت برمجية.
 * لا تستبدل استعلام الرئيسية؛ المسار مستقل.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bell, Download, Mail, Share2, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { submitCoiffeurInterestSignup } from '@/lib/coiffeurInterestSignupRemote';
import {
  downloadCoiffeurInterestBrief,
  downloadCoiffeurIntroCard,
  shareOrSaveCoiffeurShareCard,
} from '@/lib/coiffeurInterestKit';
import {
  COIFFEUR_INTEREST_LANDING_COPY as COPY,
  COIFFEUR_INTEREST_ROLES,
} from '@/config/coiffeurInterestCopy';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_INQUIRY_INTENTS,
} from '@/config/coiffeurMapUmbrella';
import {
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';

function clipSource(raw: string | null): string {
  return (raw || '').trim().slice(0, 40).replace(/[^\w.-]/g, '') || 'direct';
}

export default function CoiffeurInterestLanding() {
  useDocumentTitle(COPY.documentTitle);
  const [params] = useSearchParams();
  const source = clipSource(params.get('utm_source') || params.get('source'));

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('visitor');
  const [intentId, setIntentId] = useState('coiffeur');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [kitBusy, setKitBusy] = useState<'intro' | 'share' | 'brief' | null>(null);

  useEffect(() => {
    ProductEvents.coiffeurInterestView({ source });
  }, [source]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('يرجى إدخال البريد الإلكتروني.');
      return;
    }
    if (!consent) {
      toast.error('يرجى الموافقة على متابعة التحديثات لتتمكني من الإرسال.');
      return;
    }
    setLoading(true);
    const result = await submitCoiffeurInterestSignup({
      email: trimmed,
      consentFollowUpdates: true,
      displayName,
      role,
      intentId,
      source,
      phone,
      website: honeypot,
    });
    setLoading(false);
    if (result.ok === false) {
      toast.error(result.error || 'تعذّر الإرسال. حاول لاحقاً.');
      return;
    }
    ProductEvents.coiffeurInterestSubmit({ role, intent: intentId, source });
    toast.success(result.alreadyRegistered ? COPY.already : COPY.afterSubmit);
    setEmail('');
    setConsent(false);
  };

  const runKit = async (kind: 'intro' | 'share' | 'brief') => {
    setKitBusy(kind);
    try {
      const result =
        kind === 'intro'
          ? await downloadCoiffeurIntroCard(displayName)
          : kind === 'share'
            ? await shareOrSaveCoiffeurShareCard(displayName)
            : downloadCoiffeurInterestBrief();
      if (!result.ok) {
        if (result.error !== 'cancelled') toast.error('تعذّر التحميل. جرّبي من المتصفح مباشرة.');
        return;
      }
      ProductEvents.coiffeurKitDownload({ kind });
      if (result.method === 'share') toast.success('جاهز للمشاركة من قائمة الجهاز.');
      else toast.success('تم التحميل.');
    } catch {
      toast.error('تعذّر التحميل. جرّبي من المتصفح مباشرة.');
    } finally {
      setKitBusy(null);
    }
  };

  return (
    <CoiffeurVisitorShell withMobileDock={false}>
      <CoiffeurVisitorHeader brandTo={ROUTE_PATHS.COIFFEUR_LANDING} />

      <section className="border-b border-rose-200/10 px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f4d4c0]/30 bg-[#2a1218] px-4 py-1.5 text-sm font-semibold text-[#f4d4c0]">
            <Sparkles className="h-4 w-4" />
            {COPY.badge}
          </div>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-[#f7efe8] md:text-5xl">
            {COPY.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-rose-100/75">
            {COPY.lead}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <Alert className="border-amber-500/40 bg-amber-50/90 text-amber-950 dark:bg-amber-950/30 dark:text-amber-50">
          <Shield className="h-4 w-4" />
          <AlertTitle>{COPY.legalTitle}</AlertTitle>
          <AlertDescription className="leading-relaxed">
            {COPY.legalBody}{' '}
            <Link to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="font-semibold underline underline-offset-2">
              سياسة الخصوصية
            </Link>
            . مسار الانضمام للمنشآت عبر{' '}
            <Link to={ROUTE_PATHS.COIFFEUR_REGISTER} className="font-semibold underline underline-offset-2">
              طلب الشركاء
            </Link>
            {' '}وليس من هنا.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-[#f4d4c0]/20 bg-[#2a1218]/60 text-[#f7efe8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-[#f4d4c0]" />
                ماذا يحدث بعد التسجيل؟
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-rose-100/70">
              نخزّن بريدك على الخادم بشكل محمي، ونستخدمه لتحديثات رسمية عن الإطلاق والشروط — دون بريد دعائي عشوائي.
            </CardContent>
          </Card>
          <Card className="border-[#f4d4c0]/20 bg-[#2a1218]/60 text-[#f7efe8]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-[#f4d4c0]" />
                {COIFFEUR_BRAND_AR}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-rose-100/70">
              سطح قطاعي نسائي تحت مظلة حلاق ماب. الاستعلام على الرئيسية يبقى مجانياً. هذه الصفحة للتحديثات والكروت فقط.
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#f4d4c0]/30 bg-[#2a1218]/80 text-[#f7efe8] shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#f4d4c0]" />
              {COPY.formTitle}
            </CardTitle>
            <CardDescription className="text-rose-100/60">{COPY.formHint}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="coiffeur-interest-name">الاسم أو الاسم المستعار (اختياري)</Label>
                <Input
                  id="coiffeur-interest-name"
                  autoComplete="nickname"
                  maxLength={80}
                  placeholder="يظهر على الكرت التعريفي"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="border-[#f4d4c0]/25 bg-[#14080e] text-[#f7efe8]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="coiffeur-interest-role">صفتك</Label>
                  <select
                    id="coiffeur-interest-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-[#f4d4c0]/25 bg-[#14080e] px-3 text-sm text-[#f7efe8]"
                  >
                    {COIFFEUR_INTEREST_ROLES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coiffeur-interest-intent">الفئة التي تهمّك</Label>
                  <select
                    id="coiffeur-interest-intent"
                    value={intentId}
                    onChange={(e) => setIntentId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-[#f4d4c0]/25 bg-[#14080e] px-3 text-sm text-[#f7efe8]"
                  >
                    {COIFFEUR_INQUIRY_INTENTS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coiffeur-interest-email">البريد الإلكتروني</Label>
                <Input
                  id="coiffeur-interest-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="border-[#f4d4c0]/25 bg-[#14080e] text-left text-[#f7efe8]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coiffeur-interest-phone">الجوال (اختياري)</Label>
                <Input
                  id="coiffeur-interest-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={20}
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  className="border-[#f4d4c0]/25 bg-[#14080e] text-left text-[#f7efe8]"
                />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-[#f4d4c0]/20 bg-[#14080e]/80 p-4">
                <Checkbox
                  id="coiffeur-interest-consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="coiffeur-interest-consent" className="cursor-pointer text-sm font-normal leading-relaxed">
                  أرغب في متابعة كل جديد المتعلق بكوافير ماب، وأقرّ بأنني قرأت{' '}
                  <Link to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="text-[#f4d4c0] underline underline-offset-2">
                    سياسة الخصوصية
                  </Link>
                  .
                </Label>
              </div>

              <div className="sr-only" aria-hidden="true">
                <Label htmlFor="coiffeur-interest-website">Website</Label>
                <Input
                  id="coiffeur-interest-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || !consent}
                  className="bg-gradient-to-l from-[#f7efe8] via-[#f4d4c0] to-[#c98b96] font-black text-[#2a1218] hover:opacity-95"
                >
                  {loading ? 'جاري الإرسال…' : 'إرسال الاهتمام'}
                </Button>
                <Link to={ROUTE_PATHS.COIFFEUR_LANDING}>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="border-[#f4d4c0]/30 bg-transparent text-[#f7efe8]"
                  >
                    العودة إلى الرئيسية
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#f4d4c0]/30 bg-[#2a1218]/80 text-[#f7efe8]">
          <CardHeader>
            <CardTitle>{COPY.kitTitle}</CardTitle>
            <CardDescription className="text-rose-100/60">{COPY.kitLead}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              disabled={kitBusy !== null}
              onClick={() => void runKit('intro')}
              className="border-[#f4d4c0]/35 bg-transparent text-[#f7efe8]"
            >
              <Download className="h-4 w-4" />
              {kitBusy === 'intro' ? 'جاري التجهيز…' : COPY.introCardCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={kitBusy !== null}
              onClick={() => void runKit('share')}
              className="border-[#f4d4c0]/35 bg-transparent text-[#f7efe8]"
            >
              <Share2 className="h-4 w-4" />
              {kitBusy === 'share' ? 'جاري التجهيز…' : COPY.shareCardCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={kitBusy !== null}
              onClick={() => void runKit('brief')}
              className="border-[#f4d4c0]/35 bg-transparent text-[#f7efe8]"
            >
              <Download className="h-4 w-4" />
              {kitBusy === 'brief' ? 'جاري التجهيز…' : COPY.briefCta}
            </Button>
          </CardContent>
        </Card>
      </div>

      <CoiffeurVisitorFooter showPartnersLater showInterest={false} />
    </CoiffeurVisitorShell>
  );
}
