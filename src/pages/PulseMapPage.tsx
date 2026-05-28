/**
 * PulseMapPage — خريطة النبض الحي (slot-based)
 * Route: /radar
 */
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Radar, Search } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { PULSE_MAP_CONFIG, PULSE_MAP_ROUTE } from '@/config/pulseMapConfig';
import { PulseMapShell, usePulseMapData } from '@/modules/pulse-map';

function ValueCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: 'teal' | 'amber' | 'sky';
}) {
  const border =
    accent === 'teal'
      ? 'border-teal-400/25 bg-teal-500/8'
      : accent === 'amber'
        ? 'border-amber-400/25 bg-amber-500/8'
        : 'border-sky-400/25 bg-sky-500/8';
  return (
    <div className={`rounded-2xl border p-4 ${border}`}>
      <p className="font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}

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
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.BARBERS_LANDING)}
            className="hidden rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-black text-amber-200 sm:inline-flex"
          >
            مسار الشركاء
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/10 shadow-[0_0_40px_rgba(56,189,248,0.15)]">
            <Radar className="h-7 w-7 text-sky-300" />
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">{PULSE_MAP_CONFIG.heroTitleAr}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            {PULSE_MAP_CONFIG.heroSubtitleAr}
          </p>
          <p className="mx-auto mt-2 text-xs text-sky-300/70">{PULSE_MAP_CONFIG.onDemandTaglineAr}</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <PulseMapShell payload={payload} loading={loading} error={error} />
        </motion.div>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <ValueCard
            accent="sky"
            title="Slots ثابتة"
            body="11 مدينة pilot — موضع كل slot مُ calibrate داخل المضلّع، بدون GPS على الخريطة."
          />
          <ValueCard
            accent="amber"
            title="نبض طلب"
            body="نقطة ذهبية = نشاط بحث (توضيحي في المرحلة 1)."
          />
          <ValueCard
            accent="teal"
            title="نبض ربط"
            body="نقطة خضراء = حلاق في pilot (توضيحي). خطوط الربط في المرحلة 2."
          />
        </section>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`${ROUTE_PATHS.HOME}#search-anchor`)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 px-6 py-3 text-sm font-black text-white shadow-[0_0_24px_rgba(20,184,166,0.25)]"
          >
            <Search className="h-4 w-4" />
            جرّب البحث الآن
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.BARBERS_LANDING)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-6 py-3 text-sm font-black text-amber-100"
          >
            <Building2 className="h-4 w-4" />
            انضم وثبّت مرساك
          </button>
        </div>

        <p className="mt-8 text-center text-[0.65rem] leading-relaxed text-slate-600">
          المرحلة 1 — نواة خريطة النبض (pilot جنوبي). البيانات الحية وخطوط الربط في المراحل التالية.
        </p>
      </div>
    </div>
  );
}

export { PULSE_MAP_ROUTE };
