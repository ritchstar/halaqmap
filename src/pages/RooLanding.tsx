/**
 * RooLanding — صفحة هبوط تجريبية
 * المسار: /lab/roo-landing
 * 
 * تصميم حيوي أقل عتمة · RTL عربي · واجهة تجريبية مستقلة
 * ممنوع تعديل صفحات الإنتاج أو منطق الأعمال
 */

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  MapPin, Scissors, Star, Shield, Search, Zap,
  CheckCircle2, Clock, Sparkles, Navigation2,
  Globe2, Users, Award, TrendingUp, Heart,
  Crown, Menu, X, ArrowLeft, Phone, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

// ─── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-sky-200/40 to-blue-300/40 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-200/40 to-green-300/40 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-300/30 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 shadow-lg">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                حلاق ماب
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link to={ROUTE_PATHS.ABOUT} className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors">
                عن المنصة
              </Link>
              <Link to={ROUTE_PATHS.BARBERS_LANDING} className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors">
                للشركاء
              </Link>
              <Link to={ROUTE_PATHS.PLATFORM_REVIEWS} className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors">
                الآراء
              </Link>
              <Link
                to={ROUTE_PATHS.REGISTER}
                className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                ابدأ الآن
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-md"
            >
              <div className="space-y-1 px-4 py-3">
                <Link
                  to={ROUTE_PATHS.ABOUT}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  عن المنصة
                </Link>
                <Link
                  to={ROUTE_PATHS.BARBERS_LANDING}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  للشركاء
                </Link>
                <Link
                  to={ROUTE_PATHS.PLATFORM_REVIEWS}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  الآراء
                </Link>
                <Link
                  to={ROUTE_PATHS.REGISTER}
                  className="block rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-2 text-center text-sm font-semibold text-white shadow-lg mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ابدأ الآن
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-100 to-emerald-100 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              تجربة تصميمية جديدة
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-black leading-tight"
          >
            <span className="bg-gradient-to-r from-sky-600 via-emerald-600 to-sky-600 bg-clip-text text-transparent">
              اكتشف أقرب صالون
            </span>
            <br />
            <span className="text-slate-800">
              بضغطة واحدة
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-lg sm:text-xl text-slate-600 leading-relaxed"
          >
            منصة ذكية تربطك بأفضل صالونات الحلاقة في المملكة.
            <br />
            حجز فوري، تقييمات حقيقية، وخدمة استثنائية.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to={ROUTE_PATHS.HOME}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:shadow-sky-500/50 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Search className="h-5 w-5" />
                ابحث الآن
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>

            <Link
              to={ROUTE_PATHS.BARBERS_LANDING}
              className="rounded-full border-2 border-slate-300 bg-white/80 backdrop-blur-sm px-8 py-4 text-lg font-bold text-slate-700 shadow-lg transition-all hover:border-sky-500 hover:text-sky-600 hover:shadow-xl hover:scale-105"
            >
              انضم كشريك
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Users, value: '500+', label: 'صالون شريك', color: 'from-sky-500 to-blue-500' },
              { icon: Star, value: '4.8', label: 'تقييم المنصة', color: 'from-amber-500 to-orange-500' },
              { icon: MapPin, value: '13', label: 'مدينة سعودية', color: 'from-emerald-500 to-green-500' },
              { icon: Heart, value: '50K+', label: 'عميل راضٍ', color: 'from-pink-500 to-rose-500' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ────────────────────────────────────────────────────────
function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Navigation2,
      title: 'رادار جغرافي ذكي',
      desc: 'اكتشف الصالونات القريبة منك بدقة عالية باستخدام تقنية GPS المتقدمة',
      color: 'from-sky-500 to-blue-500',
      delay: 0,
    },
    {
      icon: Clock,
      title: 'حجز فوري',
      desc: 'احجز موعدك في ثوانٍ معدودة بدون انتظار أو تعقيدات',
      color: 'from-emerald-500 to-green-500',
      delay: 0.1,
    },
    {
      icon: Star,
      title: 'تقييمات موثوقة',
      desc: 'اطلع على آراء العملاء الحقيقية واختر الأفضل بثقة',
      color: 'from-amber-500 to-orange-500',
      delay: 0.2,
    },
    {
      icon: Shield,
      title: 'أمان وخصوصية',
      desc: 'بياناتك محمية بأعلى معايير الأمان السيبراني',
      color: 'from-purple-500 to-pink-500',
      delay: 0.3,
    },
    {
      icon: Zap,
      title: 'سرعة فائقة',
      desc: 'واجهة سريعة وسلسة تعمل على جميع الأجهزة',
      color: 'from-yellow-500 to-amber-500',
      delay: 0.4,
    },
    {
      icon: Crown,
      title: 'خدمة مميزة',
      desc: 'دعم فني متواصل وتجربة استخدام استثنائية',
      color: 'from-rose-500 to-red-500',
      delay: 0.5,
    },
  ];

  return (
    <section ref={ref} className="relative py-24 bg-gradient-to-br from-white via-sky-50/30 to-emerald-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
              لماذا حلاق ماب؟
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            نقدم لك تجربة فريدة تجمع بين التكنولوجيا الحديثة والخدمة المتميزة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: feature.delay }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-800">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              <div className={`absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${feature.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works Section ────────────────────────────────────────────────────
function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: '1',
      icon: Search,
      title: 'ابحث عن صالون',
      desc: 'استخدم الرادار الجغرافي للعثور على أقرب الصالونات',
      color: 'from-sky-500 to-blue-500',
    },
    {
      number: '2',
      icon: Star,
      title: 'اختر الأفضل',
      desc: 'قارن التقييمات والأسعار واختر ما يناسبك',
      color: 'from-emerald-500 to-green-500',
    },
    {
      number: '3',
      icon: CheckCircle2,
      title: 'احجز موعدك',
      desc: 'أكمل الحجز في ثوانٍ واحصل على تأكيد فوري',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 bg-gradient-to-br from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
              كيف يعمل؟
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            ثلاث خطوات بسيطة للحصول على أفضل خدمة حلاقة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="relative"
            >
              <div className="text-center">
                <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-2xl`}>
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-2xl font-black text-white shadow-lg`}>
                  {step.number}
                </div>
                <h3 className="mb-3 text-2xl font-bold text-slate-800">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-slate-300 to-transparent -translate-x-1/2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────
function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-emerald-500 to-blue-600" />
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          backgroundSize: '100% 100%',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            جاهز لتجربة استثنائية؟
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            انضم إلى آلاف العملاء الذين يثقون بحلاق ماب للحصول على أفضل خدمة حلاقة
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={ROUTE_PATHS.HOME}
              className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-lg font-bold text-sky-600 shadow-2xl transition-all hover:shadow-white/50 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Search className="h-5 w-5" />
                ابدأ البحث الآن
              </span>
            </Link>
            <Link
              to={ROUTE_PATHS.BARBERS_LANDING}
              className="rounded-full border-2 border-white bg-transparent px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-white hover:text-sky-600 hover:shadow-xl hover:scale-105"
            >
              للشركاء: انضم الآن
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 shadow-lg">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">حلاق ماب</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              منصة ذكية تربطك بأفضل صالونات الحلاقة في المملكة العربية السعودية
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTE_PATHS.ABOUT} className="text-slate-400 hover:text-white transition-colors">عن المنصة</Link></li>
              <li><Link to={ROUTE_PATHS.BARBERS_LANDING} className="text-slate-400 hover:text-white transition-colors">للشركاء</Link></li>
              <li><Link to={ROUTE_PATHS.PLATFORM_REVIEWS} className="text-slate-400 hover:text-white transition-colors">الآراء</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">قانوني</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTE_PATHS.TERMS_OF_SERVICE} className="text-slate-400 hover:text-white transition-colors">شروط الاستخدام</Link></li>
              <li><Link to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="text-slate-400 hover:text-white transition-colors">سياسة الخصوصية</Link></li>
              <li><Link to={ROUTE_PATHS.PRIVACY_DETAILED} className="text-slate-400 hover:text-white transition-colors">الخصوصية التفصيلية</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4" />
                <span>الدعم الفني</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <MessageCircle className="h-4 w-4" />
                <span>المحادثة المباشرة</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Globe2 className="h-4 w-4" />
                <span>المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center">
          <p className="text-sm text-slate-400">
            © 2026 حلاق ماب. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            صفحة تجريبية — Lab Experiment
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RooLanding() {
  return (
    <div dir="rtl" className="min-h-screen bg-white font-sans antialiased">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
