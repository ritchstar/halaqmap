import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  FileText,
  Scale,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  SEMAT_CARD_CONSENT_CHECKS,
  SEMAT_CARD_LEGAL_HUB_SUBTITLE_AR,
  SEMAT_CARD_LEGAL_HUB_TITLE_AR,
  SEMAT_CARD_LEGAL_SECTIONS,
  SEMAT_CARD_POLICY_VERSION,
  SEMAT_CARD_PRODUCT_NAME_AR,
  type SematConsentCheckId,
} from '@/config/sematCardLegalPolicy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';
import { storeSematConsent } from '@/lib/sematCardConsent';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

const SECTION_ICONS = [Scale, Shield, FileText, AlertTriangle] as const;

function sectionIcon(index: number) {
  return SECTION_ICONS[index % SECTION_ICONS.length];
}

export default function SematLegalHub() {
  useDocumentTitle(`${SEMAT_CARD_PRODUCT_NAME_AR} · السياسات والتعهدات`);

  const navigate = useNavigate();
  const [checks, setChecks] = useState<Record<SematConsentCheckId, boolean>>(() => {
    const initial = {} as Record<SematConsentCheckId, boolean>;
    for (const item of SEMAT_CARD_CONSENT_CHECKS) {
      initial[item.id] = false;
    }
    return initial;
  });

  const allRequiredAccepted = useMemo(
    () => SEMAT_CARD_CONSENT_CHECKS.filter((c) => c.required).every((c) => checks[c.id]),
    [checks],
  );

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  const toggleCheck = (id: SematConsentCheckId, value: boolean) => {
    setChecks((prev) => ({ ...prev, [id]: value }));
  };

  const onContinue = () => {
    if (!allRequiredAccepted) {
      toast.error('يرجى الموافقة على جميع الإقرارات الإلزامية قبل المتابعة.');
      return;
    }
    storeSematConsent(checks);
    navigate(ROUTE_PATHS.SEMAT_SETUP);
  };

  const scrollToConsents = () => {
    document.getElementById('semat-consents')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,55,0.14),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(20,184,166,0.06),transparent_45%)]" />

      <header className="relative z-10 border-b border-white/8 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to={ROUTE_PATHS.HOME}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-amber-200/90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            حلاق ماب
          </Link>
          <span className="text-xs font-medium tracking-wide text-amber-200/70">{SEMAT_CARD_PRODUCT_NAME_AR}</span>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-3xl px-4 py-10 pb-36">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-1 text-xs font-bold text-amber-200">
            ✦ المرحلة الأولى — الموافقة القانونية
          </div>
          <h1 className="mb-4 text-3xl font-black leading-tight text-white md:text-4xl">
            {SEMAT_CARD_LEGAL_HUB_TITLE_AR}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400">
            {SEMAT_CARD_LEGAL_HUB_SUBTITLE_AR}
          </p>
          <p className="mt-3 text-xs text-slate-500">نسخة السياسات: {SEMAT_CARD_POLICY_VERSION}</p>
        </motion.div>

        <div className="space-y-5">
          {SEMAT_CARD_LEGAL_SECTIONS.map((section, index) => {
            const Icon = sectionIcon(index);
            return (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: index * 0.03 }}
                className="rounded-2xl border border-white/10 bg-[#0f0f14]/90 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10">
                    <Icon className="h-5 w-5 text-amber-300" aria-hidden />
                  </div>
                  <h2 className="pt-1 text-xl font-bold text-slate-50">{section.title}</h2>
                </div>
                <div className="partner-legal-prose max-w-none">{renderLegalContentBlocks(section.content)}</div>
              </motion.section>
            );
          })}
        </div>

        <motion.section
          id="semat-consents"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border border-amber-400/30 bg-gradient-to-b from-amber-500/10 to-[#0f0f14] p-6"
        >
          <h2 className="mb-2 text-xl font-bold text-amber-100">التعهدات والإقرارات الإلزامية</h2>
          <p className="mb-6 text-sm leading-relaxed text-slate-400">
            يجب تأشير جميع البنود أدناه للانتقال إلى صفحة إعداد البطاقة. تُحفظ موافقتك في جلسة المتصفح الحالية فقط.
          </p>

          <div className="space-y-4">
            {SEMAT_CARD_CONSENT_CHECKS.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 transition-colors',
                  checks[item.id]
                    ? 'border-amber-400/35 bg-amber-500/5'
                    : 'border-white/10 bg-black/20',
                )}
              >
                <Checkbox
                  id={`semat-consent-${item.id}`}
                  checked={checks[item.id]}
                  onCheckedChange={(v) => toggleCheck(item.id, v === true)}
                  className="mt-0.5 border-amber-400/40 data-[state=checked]:bg-amber-500 data-[state=checked]:text-black"
                />
                <Label
                  htmlFor={`semat-consent-${item.id}`}
                  className="cursor-pointer text-sm font-medium leading-relaxed text-slate-200"
                >
                  {item.label}
                </Label>
              </div>
            ))}
          </div>

          <Button
            type="button"
            size="lg"
            disabled={!allRequiredAccepted}
            onClick={onContinue}
            className="mt-8 w-full rounded-xl bg-amber-500 text-base font-bold text-black hover:bg-amber-400 disabled:opacity-40"
          >
            أوافق وأنتقل إلى إعداد البطاقة
          </Button>
        </motion.section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#07070a]/95 p-4 backdrop-blur-md md:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={scrollToConsents}
          className="w-full border-amber-400/30 text-amber-100"
        >
          <ChevronDown className="ml-2 h-4 w-4" aria-hidden />
          الانتقال إلى الإقرارات
        </Button>
      </div>
    </div>
  );
}
