/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * بوابة المستعلمة — رأس مضغوط، رادار لسطح المكتب فقط، بحث الجوال في الرصيف السفلي.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CoiffeurRadarButton } from '@/components/coiffeur/CoiffeurRadarButton';
import {
  CoiffeurMobileSearchDock,
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';
import {
  COIFFEUR_INQUIRY_COPY,
  COIFFEUR_LANDING_META,
} from '@/config/coiffeurMapUmbrella';

export default function CoiffeurLanding() {
  const navigate = useNavigate();
  useDocumentTitle(COIFFEUR_LANDING_META.documentTitle);

  const goInquire = () => {
    navigate(ROUTE_PATHS.COIFFEUR_INQUIRE);
  };

  return (
    <CoiffeurVisitorShell>
      <CoiffeurVisitorHeader onSearch={goInquire} />

      <section className="relative mx-auto max-w-6xl px-5 pb-8 pt-8 md:min-h-[78svh] md:pb-16 md:pt-24">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:gap-10">
          <div>
            <span className="inline-flex rounded-full border border-rose-200/25 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100">
              {COIFFEUR_INQUIRY_COPY.badge}
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-[clamp(1.75rem,8vw,2.25rem)] font-black leading-[1.12] text-white md:mt-5 md:text-[clamp(2.1rem,7vw,4.2rem)]"
            >
              {COIFFEUR_INQUIRY_COPY.title}
              <span className="mt-1 block bg-gradient-to-l from-rose-200 via-[#f4d4c0] to-amber-200 bg-clip-text text-transparent">
                {COIFFEUR_INQUIRY_COPY.titleAccent}
              </span>
            </motion.h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-rose-50/70 md:mt-8 md:leading-8">
              استعلام للمستعلمات فقط: مشغل، كوافير، سبا، وتجميل.
            </p>
          </div>
          <div className="hidden justify-center overflow-x-clip md:flex">
            <CoiffeurRadarButton
              onClick={goInquire}
              idleTitle={COIFFEUR_INQUIRY_COPY.searchRadarIdle}
              idleHint={COIFFEUR_INQUIRY_COPY.searchHero}
            />
          </div>
        </div>
      </section>

      <CoiffeurVisitorFooter showPartnersLater />
      <CoiffeurMobileSearchDock onClick={goInquire} />
    </CoiffeurVisitorShell>
  );
}
