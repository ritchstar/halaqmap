import { motion } from 'framer-motion';
import { ArrowLeft, BriefcaseBusiness, MapPin, Scissors, ShieldCheck, Sparkles, Store, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { B2BSalesManagerChat } from '@/components/B2BSalesManagerChat';
import { ROUTE_PATHS } from '@/lib';
import { PlatformTrustStrip } from '@/components/PlatformTrustStrip';

const OFFICE_PILLARS = [
  { icon: Store, title: 'مبني على واقع الصالونات', desc: 'الأسئلة، الاعتراضات، والعائد تُعرض بمنطق منشآت الحلاقة لا بلغة عامة.' },
  { icon: MapPin, title: 'مرتبط بالرادار الجغرافي', desc: 'كل شرح داخل المكتب يعيد ربط البيع بفكرة الظهور عند الطلب وربح المساحة الصحيحة.' },
  { icon: TrendingUp, title: 'بيع واضح بالأرقام', desc: 'العائد، التوفير، الباقات، وإضافة المكتب الخاص تُشرح مباشرة دون تشتيت.' },
] as const;

export default function PartnerSalesOfficePage() {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[linear-gradient(180deg,#fffdf7_0%,#f8fbff_38%,#f6faf7_100%)] text-slate-900"
    >
      <section className="relative overflow-hidden border-b border-slate-200/80">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_24%),radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.06),transparent_20%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-10 md:py-14">
          <Link
            to={ROUTE_PATHS.BARBERS_LANDING}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-amber-200 hover:text-amber-800"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة لصفحة الشركاء
          </Link>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-700">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                مكتب مدير المبيعات B2B
              </div>

              <div className="space-y-3">
                <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-black leading-[1.08] text-slate-950">
                  مجلس التفاوض التجاري
                  <span className="mt-1 block bg-gradient-to-l from-amber-600 via-cyan-700 to-emerald-600 bg-clip-text text-transparent">
                    لمنصة حلاق ماب
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600">
                  هذه ليست صفحة قراءة عامة، بل مكتب مستقل لمدير المبيعات يشرح الباقات، مضاعفة الرخص،
                  وإضافة المكتب الخاص بمنطق أقرب للصالونات والمنشآت.
                </p>
              </div>

              <PlatformTrustStrip variant="strip" tone="light" className="max-w-2xl" />

              <div className="grid gap-3 sm:grid-cols-3">
                {OFFICE_PILLARS.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-[1.35rem] border border-slate-200 bg-white/92 p-4 shadow-[0_14px_32px_rgba(148,163,184,0.10)]"
                  >
                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                      <pillar.icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-black text-slate-950">{pillar.title}</p>
                    <p className="mt-2 text-[0.8rem] leading-6 text-slate-600">{pillar.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { icon: Scissors, text: 'خاص بالصالونات والحلاقين' },
                  { icon: Sparkles, text: 'مضاعفة الرخص التأسيسية' },
                  { icon: ShieldCheck, text: 'شرح واضح دون وساطة أو عمولة' },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 px-3 py-1.5 text-[0.75rem] font-bold text-cyan-800"
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.text}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(ROUTE_PATHS.REGISTER)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-6 py-3.5 text-sm font-black text-black shadow-[0_10px_24px_rgba(245,158,11,0.18)] transition-all hover:from-amber-400"
                >
                  سجّل صالونك الآن
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <Link
                  to={ROUTE_PATHS.BARBERS_LANDING}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-950"
                >
                  العودة للمسار التسويقي
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5 }}
              className="relative"
            >
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.08),transparent_28%)] blur-2xl" />
              <div className="relative">
                <B2BSalesManagerChat mode="office" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
