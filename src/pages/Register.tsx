/**
 * Register — صفحة التسجيل المُعاد تصميمها
 * تتبع هوية المنصة الداكنة لمسار تسجيل الشركاء
 */

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RegistrationForm } from '@/components/RegistrationForm';
import { RegistrationErrorBoundary } from '@/components/RegistrationErrorBoundary';
import { ROUTE_PATHS } from '@/lib/index';
import { Scissors, Shield, ChevronRight } from 'lucide-react';

export default function Register() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tierParam = params.get('tier'); // 'bronze' | 'gold' | 'diamond'

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #020912 0%, #040d1a 50%, #020912 100%)', fontFamily: 'Tajawal, system-ui' }}
    >
      {/* ── شريط التنقل العلوي ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#020912]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to={ROUTE_PATHS.BARBERS_LANDING}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ChevronRight className="h-4 w-4" />
            العودة للشركاء
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10">
              <Scissors className="h-4 w-4 text-amber-300" />
            </div>
            <span className="text-sm font-black text-white">حلاق ماب</span>
            <span className="hidden sm:inline text-[0.6rem] text-slate-500">· مسار الشركاء</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/8 px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.58rem] font-bold text-emerald-300">تفعيل وفق الحالة</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        {/* ── رأس الصفحة ── */}
        <motion.header
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-3 text-3xl font-black leading-tight text-white sm:text-4xl">
            سجّل صالونك في منصة حلاق ماب
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-400">
            {`حزمة ${tierParam === 'bronze' ? 'برونزي' : tierParam === 'gold' ? 'ذهبي' : tierParam === 'diamond' ? 'ماسي' : 'مناسبة'} — رخصة نفاذ رقمية مسبقة الدفع تُفعَّل وفق الحزمة التي تختارها.`}
          </p>

          {/* مراحل الشراء */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1">
            {['اختر الحزمة', 'أكمل البيانات', 'ادفع الآن', 'إتمام التفعيل'].map((s, i, arr) => (
              <div key={s} className="flex items-center">
                <span className={`rounded-full px-2.5 py-1 text-[0.6rem] font-bold ${
                  i === 0 ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30' :
                  i === 3 ? 'bg-emerald-500/12 text-emerald-300 border border-emerald-400/25' :
                  'bg-white/5 text-slate-500 border border-white/8'
                }`}>{s}</span>
                {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-slate-700 mx-0.5" />}
              </div>
            ))}
          </div>

          {/* تأكيدات */}
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-[0.6rem] text-slate-600">
            {['✅ لا عمولات', '✅ لا تجديد تلقائي', '✅ حزمة رقمية مسبقة الدفع', '✅ وفق سياسة رخصة النفاذ'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </motion.header>

        {/* ── نموذج التسجيل ── */}
        <motion.section
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.15 }}
          className="mx-auto max-w-4xl"
        >
          <RegistrationErrorBoundary>
            <RegistrationForm />
          </RegistrationErrorBoundary>
        </motion.section>

        {/* ── تذييل ── */}
        <footer className="mx-auto mt-10 max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Shield className="h-3.5 w-3.5 text-slate-600" />
            <p className="text-slate-600 text-xs">
              بالتسجيل توافق على{' '}
              <Link to={ROUTE_PATHS.SUBSCRIPTION_POLICY} className="text-slate-400 underline hover:text-amber-300">
                سياسة رخصة النفاذ
              </Link>
              {' '}و{' '}
              <Link to={ROUTE_PATHS.PARTNER_PRIVACY} className="text-slate-400 underline hover:text-amber-300">
                سياسة الخصوصية
              </Link>
            </p>
          </div>
          <p className="text-xs text-slate-700">ISIC4 474151 · حلاق ماب · B2B Technology Platform</p>
        </footer>
      </div>
    </div>
  );
}
