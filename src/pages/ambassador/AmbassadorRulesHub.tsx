import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Scale, Wallet } from 'lucide-react';
import {
  AMBASSADOR_GEO_MATCH_MAX_METERS,
  AMBASSADOR_PAYOUT_MIN_SAR,
  AMBASSADOR_PROGRAM_NAME_AR,
  AMBASSADOR_RULES_HUB_SUBTITLE_AR,
  AMBASSADOR_RULES_HUB_TITLE_AR,
  AMBASSADOR_RULES_SECTIONS,
  AMBASSADOR_RULES_VERSION,
  AMBASSADOR_TARGET_EXPIRY_DAYS,
  AMBASSADOR_TARGET_REMINDER_DAYS,
} from '@/config/ambassadorFieldRulesPolicy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';

const ICONS = [Scale, MapPin, Wallet] as const;

export default function AmbassadorRulesHub() {
  useDocumentTitle(`${AMBASSADOR_RULES_HUB_TITLE_AR} · حلاق ماب`);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(20,184,166,0.12),transparent_55%)]" />

      <header className="relative z-10 border-b border-white/8 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to={ROUTE_PATHS.HOME}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-teal-200/90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            حلاق ماب
          </Link>
          <span className="text-xs font-medium text-teal-200/70">سفراء ميدانيون</span>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-3xl px-4 py-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-500/10 px-4 py-1 text-xs font-bold text-teal-200">
            ✦ وثيقة قواعد — قبل بناء اللوحة
          </div>
          <h1 className="mb-3 text-3xl font-black text-white md:text-4xl">
            {AMBASSADOR_RULES_HUB_TITLE_AR}
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            {AMBASSADOR_RULES_HUB_SUBTITLE_AR}
          </p>
          <p className="text-xs text-slate-500">{AMBASSADOR_PROGRAM_NAME_AR}</p>
          <p className="mt-1 text-xs text-slate-500">نسخة: {AMBASSADOR_RULES_VERSION}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
              تطابق جغرافي {AMBASSADOR_GEO_MATCH_MAX_METERS}م
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
              تنبيه يوم {AMBASSADOR_TARGET_REMINDER_DAYS} · انتهاء يوم{' '}
              {AMBASSADOR_TARGET_EXPIRY_DAYS}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
              صرف من {AMBASSADOR_PAYOUT_MIN_SAR} ر.س
            </span>
          </div>

          <div className="mt-6">
            <Link
              to={ROUTE_PATHS.AMBASSADOR_ENTER}
              className="inline-flex rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-teal-400"
            >
              الدخول إلى لوحة السفير
            </Link>
          </div>
        </motion.div>

        <div className="space-y-5">
          {AMBASSADOR_RULES_SECTIONS.map((section, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: index * 0.02 }}
                className="rounded-2xl border border-white/10 bg-[#0f0f14]/90 p-6"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-500/10">
                    <Icon className="h-5 w-5 text-teal-300" aria-hidden />
                  </div>
                  <h2 className="pt-1 text-xl font-bold text-slate-50">{section.title}</h2>
                </div>
                <div className="partner-legal-prose max-w-none">
                  {renderLegalContentBlocks(section.content)}
                </div>
              </motion.section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
