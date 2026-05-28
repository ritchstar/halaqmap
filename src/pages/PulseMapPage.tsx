/**
 * PulseMapPage — خريطة النبض (خطوة 1: رسم المملكة)
 * Route: /radar
 */
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Radar } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { PULSE_MAP_CONFIG, PULSE_MAP_ROUTE } from '@/config/pulseMapConfig';
import { PulseMapShell, usePulseMapData } from '@/modules/pulse-map';

export default function PulseMapPage() {
  const navigate = useNavigate();
  const { payload, loading, error } = usePulseMapData();

  useEffect(() => {
    document.title = PULSE_MAP_CONFIG.pageTitleAr;
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen"
      style={{ background: 'linear-gradient(165deg, #020617 0%, #041018 45%, #030712 100%)' }}
    >
      <div className="sticky top-0 z-40 border-b border-sky-500/15 bg-[#020617]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.HOME)}
            className="flex items-center gap-2 text-sm text-sky-400/75 transition-colors hover:text-sky-300"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            الرئيسية
          </button>
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-black text-sky-100">خريطة النبض</span>
          </div>
          <div className="hidden w-[4.5rem] sm:block" aria-hidden />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-5">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/10 shadow-[0_0_40px_rgba(56,189,248,0.15)]">
            <Radar className="h-7 w-7 text-sky-300" />
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">{PULSE_MAP_CONFIG.heroTitleAr}</h1>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <PulseMapShell payload={payload} loading={loading} error={error} />
        </motion.div>
      </div>
    </div>
  );
}

export { PULSE_MAP_ROUTE };
