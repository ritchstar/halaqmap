/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * بوابة المستعلمة لكوافير ماب — مرحلة البحث أولاً.
 */
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CoiffeurSearchButton, COIFFEUR_VISITOR_CANVAS_CLASS } from '@/components/coiffeur/CoiffeurSearchButton';
import { CoiffeurRadarButton } from '@/components/coiffeur/CoiffeurRadarButton';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_FOOTER_ECOMMERCE_AR,
  COIFFEUR_FOOTER_LEGAL_AR,
  COIFFEUR_INQUIRY_COPY,
  COIFFEUR_LANDING_META,
  COIFFEUR_UMBRELLA_LINE_AR,
} from '@/config/coiffeurMapUmbrella';

export default function CoiffeurLanding() {
  const navigate = useNavigate();
  useDocumentTitle(COIFFEUR_LANDING_META.documentTitle);

  const goInquire = () => {
    navigate(ROUTE_PATHS.COIFFEUR_INQUIRE);
  };

  return (
    <div dir="rtl" className={COIFFEUR_VISITOR_CANVAS_CLASS}>
      <div className="pointer-events-none absolute -left-24 top-24 h-[22rem] w-[22rem] rounded-full bg-rose-400/12 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-10 h-[26rem] w-[26rem] rounded-full bg-amber-200/10 blur-[120px]" aria-hidden />

      <header className="relative sticky top-0 z-40 border-b border-rose-200/10 bg-[#14080e]/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-black tracking-wide text-[#f4d4c0]">{COIFFEUR_BRAND_AR}</p>
            <p className="text-[10px] text-rose-100/50">{COIFFEUR_INQUIRY_COPY.isolationBadge}</p>
          </div>
          <CoiffeurSearchButton
            size="header"
            label={COIFFEUR_INQUIRY_COPY.searchHeaderLong}
            shortLabel={COIFFEUR_INQUIRY_COPY.searchHeader}
            onClick={goInquire}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f4d4c0]/40 to-transparent" />
      </header>

      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 md:min-h-[78svh] md:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_auto]">
          <div>
            <span className="inline-flex rounded-full border border-rose-200/25 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100">
              {COIFFEUR_INQUIRY_COPY.badge}
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 text-[clamp(2.1rem,7vw,4.2rem)] font-black leading-[1.12] text-white"
            >
              {COIFFEUR_INQUIRY_COPY.title}
              <span className="mt-1 block bg-gradient-to-l from-rose-200 via-[#f4d4c0] to-amber-200 bg-clip-text text-transparent">
                {COIFFEUR_INQUIRY_COPY.titleAccent}
              </span>
            </motion.h1>
            <p className="mt-8 max-w-xl text-sm leading-8 text-rose-50/70">
              استعلام للمستعلمات فقط: مشغل، كوافير، سبا، وتجميل — بلا خلط مع حلاقة الرجال.
            </p>
          </div>
          <CoiffeurRadarButton
            onClick={goInquire}
            idleTitle={COIFFEUR_INQUIRY_COPY.searchHero}
            idleHint={COIFFEUR_INQUIRY_COPY.searchHeaderLong}
          />
        </div>
      </section>

      <footer className="border-t border-rose-200/10 px-5 py-8 text-center">
        <p className="text-xs leading-7 text-rose-100/45">{COIFFEUR_UMBRELLA_LINE_AR}</p>
        <p className="mt-2 text-[11px] text-rose-100/30">{COIFFEUR_FOOTER_LEGAL_AR}</p>
        <p className="mt-1 text-[11px] text-rose-100/30">{COIFFEUR_FOOTER_ECOMMERCE_AR}</p>
        <Link to={ROUTE_PATHS.COIFFEUR_PARTNERS} className="mt-4 inline-block text-[11px] text-rose-100/40">
          مسار المنشآت — مرحلة لاحقة
        </Link>
      </footer>
    </div>
  );
}
