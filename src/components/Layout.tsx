import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import { Menu, X, MapPin, Phone, Mail, Star, MessageSquare } from 'lucide-react';
import { SiX, SiFacebook, SiInstagram, SiWhatsapp } from 'react-icons/si';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AppBuildStamp } from '@/components/AppBuildStamp';
import { LegalEntityPublicStrip } from '@/components/LegalEntityPublicStrip';
import { PlatformOfficialFooterStrip } from '@/components/PlatformOfficialFooterStrip';
import { PLATFORM_FOOTER_TAGLINE } from '@/config/platformGrowthNarrative';
import { PLATFORM_IDENTITY_BOILERPLATE_AR } from '@/config/platformIdentity';
import { PlatformTrustStrip } from '@/components/PlatformTrustStrip';
import { SOFTWARE_SERVICES_PORTAL_LABEL } from '@/config/partnerPortal';
import { LicenseRechargeWidget } from '@/components/billing/LicenseRechargeWidget';
import { KSACityClocksBar } from '@/components/KSACityClocksBar';
import { FloatingPlatformActions } from '@/components/FloatingPlatformActions';
import { PlatformVoluntaryEngagementStrip } from '@/components/platformEngagement/PlatformVoluntaryEngagementStrip';
import { PlatformAmbientBackground } from '@/components/PlatformAmbientBackground';
import { PlatformAmbientToggle } from '@/components/PlatformAmbientToggle';
import { usePlatformAmbient } from '@/context/PlatformAmbientContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { effectivePhase, control } = usePlatformAmbient();
  const [deferMobileExtras, setDeferMobileExtras] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 768,
  );

  const navItems = [
    { path: ROUTE_PATHS.HOME, label: 'الرئيسية' },
    { path: ROUTE_PATHS.BARBERS_LANDING, label: SOFTWARE_SERVICES_PORTAL_LABEL },
    { path: ROUTE_PATHS.ABOUT, label: 'من نحن' },
    { path: ROUTE_PATHS.PRIVACY_DETAILED, label: 'سياسة الخصوصية' },
  ];

  useEffect(() => {
    if (!isMobile) {
      setDeferMobileExtras(true);
      return;
    }
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setDeferMobileExtras(true);
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(enable, { timeout: 2200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(enable, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [isMobile]);

  return (
    <div
      className="platform-dark platform-ambient min-h-[100dvh] min-h-screen flex flex-col bg-background overflow-x-hidden"
      dir="rtl"
      style={{ fontFamily: 'Tajawal, IBM Plex Sans Arabic, system-ui' }}
      data-ambient-phase={effectivePhase}
      data-ambient-control={control}
    >
      {/* شبكة التكتير الخفية — تظهر على كل الصفحات */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.022]"
        style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,1) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
        aria-hidden
      />

      {deferMobileExtras ? <PlatformAmbientBackground variant="default" /> : null}

      {/* شريط توقيت مدن المملكة */}
      {!isMobile || deferMobileExtras ? <KSACityClocksBar /> : null}

      {/* ── التنقل الرئيسي — داكن زجاجي ──────────────────────────────── */}
      <header className={cn(
        'sticky top-0 z-50 w-full border-b border-teal-400/10 pt-[env(safe-area-inset-top)]',
        isMobile ? 'bg-[#020912]/96' : 'bg-[#020912]/92 backdrop-blur-xl',
      )}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* الشعار */}
            <NavLink
              to={ROUTE_PATHS.HOME}
              className="flex items-center gap-3 group [perspective:640px]"
            >
              <motion.div
                className="relative shrink-0 [transform-style:preserve-3d]"
                whileHover={{ scale: 1.06, rotateY: -8 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <HalaqmapBrandMark
                  className="h-11 w-11 shrink-0 rounded-2xl ring-2 ring-teal-400/30 ring-offset-1 ring-offset-[#020912] shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-300 group-hover:ring-teal-400/60 group-hover:shadow-[0_0_30px_rgba(20,184,166,0.35)]"
                  imgClassName="[transform:translateZ(4px)]"
                />
              </motion.div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-black bg-gradient-to-l from-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  حلاق ماب
                </span>
                <span className="text-[0.55rem] tracking-widest text-teal-500/60">HALAQ MAP</span>
              </div>
            </NavLink>

            {/* روابط التنقل — سطح مكتب */}
            <nav className="hidden md:flex items-center gap-5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-teal-300'
                        : 'text-slate-400 hover:text-teal-300'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to={ROUTE_PATHS.PLATFORM_REVIEWS}
                className={({ isActive }) =>
                  `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-amber-300' : 'text-slate-500 hover:text-amber-300'}`
                }
              >
                <Star className="h-3.5 w-3.5" />
                آراؤنا
              </NavLink>
              <PlatformAmbientToggle variant="partner" className="hidden lg:inline-flex" />
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <PlatformAmbientToggle variant="partner" />
              <button
                type="button"
                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors touch-manipulation hover:bg-white/10 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="القائمة"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

        {/* قائمة موبايل */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-white/8 bg-[#020912]/98"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {[...navItems, { path: ROUTE_PATHS.PLATFORM_REVIEWS, label: '⭐ آراء المستخدمين' }].map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-400/25'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </header>

      <main className="relative z-10 flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>

      {/* أزرار عائمة: مشاركة + تقييم + آراء */}
      {deferMobileExtras ? <FloatingPlatformActions /> : null}

      {/* ── الفوتر — داكن احترافي ──────────────────────────────────────── */}
      <footer className="border-t border-teal-400/10 bg-[#020912] mt-auto pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        {/* شريط هوية المنصة */}
        <div className="border-b border-white/5 bg-white/[0.02]">
          <div className="container mx-auto px-4 py-4">
            <p className="text-center text-[0.65rem] text-slate-600 leading-relaxed">
              {PLATFORM_IDENTITY_BOILERPLATE_AR}
            </p>
            <PlatformTrustStrip variant="inline" tone="dark" className="mt-2" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* العلامة التجارية */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <HalaqmapBrandMark
                  className="h-11 w-11 shrink-0 rounded-2xl ring-2 ring-teal-400/25 ring-offset-1 ring-offset-[#020912] shadow-[0_0_20px_rgba(20,184,166,0.15)]"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-black bg-gradient-to-l from-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    حلاق ماب
                  </span>
                  <span className="text-[0.5rem] tracking-widest text-teal-500/60">HALAQ MAP</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{PLATFORM_FOOTER_TAGLINE}</p>
              {/* تواصل اجتماعي */}
              <div className="flex gap-2">
                {[
                  { href: 'https://twitter.com/halaqmap', icon: SiX, label: 'X', color: 'hover:text-white' },
                  { href: 'https://instagram.com/halaqmap', icon: SiInstagram, label: 'Instagram', color: 'hover:text-pink-400' },
                  { href: 'https://wa.me/966559602685', icon: SiWhatsapp, label: 'WhatsApp', color: 'hover:text-green-400' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 transition-all hover:border-white/25 hover:bg-white/10 hover:scale-105 ${social.color}`}
                  >
                    <social.icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* روابط سريعة */}
            <div>
              <h4 className="mb-4 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">المنصة</h4>
              <div className="flex flex-col gap-2.5">
                {[
                  { path: ROUTE_PATHS.HOME, label: 'الرئيسية — ابحث عن حلاق' },
                  { path: ROUTE_PATHS.ABOUT, label: 'من نحن' },
                  { path: ROUTE_PATHS.PLATFORM_REVIEWS, label: '⭐ آراء المستخدمين' },
                ].map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-teal-300 transition-colors"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* سياسات */}
            <div>
              <h4 className="mb-4 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">قانوني</h4>
              <div className="flex flex-col gap-2.5">
                {[
                  { path: ROUTE_PATHS.TERMS_OF_SERVICE, label: 'شروط الاستخدام' },
                  { path: ROUTE_PATHS.USER_PRIVACY_POLICY, label: 'سياسة الخصوصية' },
                  { path: ROUTE_PATHS.EPHEMERAL_PROCESSING_GOVERNANCE, label: 'حوكمة المعالجة اللحظية' },
                  { path: ROUTE_PATHS.PRIVACY_DETAILED, label: 'خصوصية تفصيلية' },
                  { path: ROUTE_PATHS.SUBSCRIPTION_POLICY, label: 'سياسة الرخص' },
                ].map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-teal-300 transition-colors"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* تواصل */}
            <div>
              <h4 className="mb-4 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">تواصل معنا</h4>
              <div className="flex flex-col gap-3">
                <a href="tel:+966559602685" className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-teal-300 transition-colors group">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-teal-500/10 group-hover:border-teal-400/30">
                    <Phone className="h-3.5 w-3.5 text-teal-500" />
                  </div>
                  <span dir="ltr">+966 559 602 685</span>
                </a>
                <a href="mailto:admin@halaqmap.com" className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-teal-300 transition-colors group">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-teal-500/10 group-hover:border-teal-400/30">
                    <Mail className="h-3.5 w-3.5 text-teal-500" />
                  </div>
                  <span>admin@halaqmap.com</span>
                </a>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <MapPin className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <span>المملكة العربية السعودية</span>
                </div>
              </div>
            </div>
          </div>

          {/* شاحن رخصة النفاذ */}
          <div className="mt-10 overflow-visible">
            <LicenseRechargeWidget mode="register" showHeader={true} />
          </div>

          <div className="mt-6">
            <LegalEntityPublicStrip variant="light" />
          </div>
          <div className="mt-4">
            <PlatformOfficialFooterStrip variant="light" />
          </div>

          <div className="mt-10 max-w-3xl mx-auto">
            <PlatformVoluntaryEngagementStrip variant="compact" />
          </div>

          {/* الشريط السفلي */}
          <div className="mt-10 pt-6 border-t border-white/8 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {[
                { path: ROUTE_PATHS.TERMS_OF_SERVICE, label: 'الشروط' },
                { path: ROUTE_PATHS.USER_PRIVACY_POLICY, label: 'الخصوصية' },
                { path: ROUTE_PATHS.ABOUT, label: 'من نحن' },
              ].map((link) => (
                <NavLink key={link.path} to={link.path} className="text-[0.7rem] text-slate-600 hover:text-teal-400 transition-colors">
                  {link.label}
                </NavLink>
              ))}
              <span className="text-slate-700 text-[0.7rem]">© ٢٠٢٦ حلاق ماب · ISIC4 474151</span>
            </div>
            <AppBuildStamp className="opacity-30" />
          </div>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
}