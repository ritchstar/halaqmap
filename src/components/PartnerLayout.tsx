import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Headphones,
  Home,
  type LucideIcon,
  LogIn,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  UserPlus,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import { capturePartnerAttributionFromLocation } from '@/lib/partnerAttribution';
import { PARTNER_LAYOUT_FOOTER_LINE } from '@/lib/partnerMarketingCopy';
import { PLATFORM_IDENTITY_BOILERPLATE_AR } from '@/config/platformIdentity';
import { PlatformTrustStrip } from '@/components/PlatformTrustStrip';
import { DOMAIN_VERIFICATION_META_CONTENT, ensureDomainVerificationMeta } from '@/config/domainVerification';
import { SOFTWARE_SERVICES_PORTAL_HEADING, SOFTWARE_SERVICES_PORTAL_LABEL } from '@/config/partnerPortal';
import { usePartnerTutorialSectionVisible } from '@/lib/partnerTutorialVideosPublic';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { LicenseRechargeWidget } from '@/components/billing/LicenseRechargeWidget';
import { DIGITAL_SOFTWARE_PACKAGES_POLICY_TITLE_AR } from '@/config/partnerLegal';
import { PlatformAmbientBackground } from '@/components/PlatformAmbientBackground';
import { PlatformAmbientToggle } from '@/components/PlatformAmbientToggle';
import { usePlatformAmbient } from '@/context/PlatformAmbientContext';
// PartnerDigitalBarberAssistant مُحال للتقاعد — موجود في مركز الوكلاء فقط
// LegalObserverChat مُضمَّن مباشرةً في PartnerPrivacy و SubscriptionPolicy
import { AppBuildStamp } from '@/components/AppBuildStamp';
import { PlatformOfficialFooterStrip } from '@/components/PlatformOfficialFooterStrip';
import { PartnerPromoVideoBand } from '@/components/partner/PartnerPromoVideoBand';
import { B2BAmbientGlowField } from '@/components/b2b/B2BAmbientGlowField';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  MOBILE_FIXED_NAV_SAFE,
  MOBILE_PARTNER_NAV_CLEARANCE,
  MOBILE_SHELL_OVERFLOW,
} from '@/lib/mobilePageShell';
import { useMapCommunityBadge } from '@/hooks/useMapCommunityBadge';
import { useIsMobile } from '@/hooks/use-mobile';

interface PartnerLayoutProps {
  children: React.ReactNode;
}

type PartnerNavItem = {
  path: string;
  label: string;
  Icon?: LucideIcon;
};

const partnerNavItems: PartnerNavItem[] = [
  { path: ROUTE_PATHS.BARBERS_LANDING, label: 'الصفحة التسويقية' },
  { path: ROUTE_PATHS.PARTNER_WHY, label: 'لماذا تنضم؟' },
  { path: ROUTE_PATHS.PARTNER_STORY, label: 'القصة والمسار' },
  { path: ROUTE_PATHS.PARTNER_TUTORIALS, label: 'فيديوهات رخصة النفاذ' },
  { path: ROUTE_PATHS.PARTNER_SALES_OFFICE, label: 'مكتب مدير المبيعات' },
  { path: ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW, label: 'مركز الباقات 🏛️' },
  { path: ROUTE_PATHS.REGISTER, label: 'التسجيل كحلاق' },
  { path: ROUTE_PATHS.PARTNER_SUPPORT, label: 'الدعم الفني (واتساب)' },
  { path: ROUTE_PATHS.PARTNER_PRIVACY, label: 'خصوصية الشركاء' },
  { path: ROUTE_PATHS.SUBSCRIPTION_POLICY, label: DIGITAL_SOFTWARE_PACKAGES_POLICY_TITLE_AR },
];

const partnerBottomNav: ReadonlyArray<Required<PartnerNavItem>> = [
  { path: ROUTE_PATHS.HOME, label: 'الرئيسية', Icon: Home },
  { path: ROUTE_PATHS.REGISTER, label: 'تسجيل', Icon: UserPlus },
  { path: ROUTE_PATHS.PARTNER_SUPPORT, label: 'دعم', Icon: Headphones },
];

const COMPACT_PARTNER_HEADER_PATHS = new Set<string>([
  ROUTE_PATHS.REGISTER,
  ROUTE_PATHS.REGISTER_SUCCESS,
  ROUTE_PATHS.PAYMENT,
  ROUTE_PATHS.PARTNER_SUPPORT,
  ROUTE_PATHS.PARTNER_PRIVACY,
  ROUTE_PATHS.SUBSCRIPTION_POLICY,
  ROUTE_PATHS.BARBER_PORTAL_ENTER,
  ROUTE_PATHS.BARBER_ACCOUNT_DELETE_REQUEST,
]);

function compactPartnerHeaderTitle(pathname: string): string {
  if (pathname === ROUTE_PATHS.REGISTER) return 'التسجيل في المنصة';
  if (pathname === ROUTE_PATHS.REGISTER_SUCCESS) return 'تم إرسال الطلب';
  if (pathname === ROUTE_PATHS.PAYMENT) return 'إتمام الدفع';
  if (pathname === ROUTE_PATHS.PARTNER_SUPPORT) return 'الدعم الفني';
  if (pathname === ROUTE_PATHS.PARTNER_PRIVACY) return 'خصوصية الشركاء';
  if (pathname === ROUTE_PATHS.SUBSCRIPTION_POLICY) return DIGITAL_SOFTWARE_PACKAGES_POLICY_TITLE_AR;
  if (pathname === ROUTE_PATHS.BARBER_PORTAL_ENTER) return 'الدخول الخاص';
  if (pathname === ROUTE_PATHS.BARBER_ACCOUNT_DELETE_REQUEST) return 'طلب حذف الحساب';
  return SOFTWARE_SERVICES_PORTAL_LABEL;
}

/** يطابق رأس مسار الخدمات البرمجية للمنصة — شريط عنوان المتصفح / PWA على الجوال */
const PARTNER_THEME_COLOR = '#071426';

/** نفس أسلوب الشعار في Layout.tsx مع لون إزاحة الحلقة يطابق الخلفية الداكنة (تفادي هالة بيضاء من ring-offset-background). */
const partnerBrandMarkSurfaceClass =
  'ring-offset-[#071426] shadow-[0_14px_32px_-8px_color-mix(in_srgb,var(--primary)_50%,transparent),0_6px_16px_-4px_rgba(0,0,0,0.22),inset_0_2px_6px_rgba(255,255,255,0.55)] transition-[box-shadow,ring-color] duration-300 group-hover:ring-primary/60 group-hover:shadow-[0_18px_40px_-10px_color-mix(in_srgb,var(--primary)_60%,transparent),0_8px_20px_-4px_rgba(0,0,0,0.28),inset_0_2px_8px_rgba(255,255,255,0.65)]';

function desktopNavClass(isActive: boolean) {
  return cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors touch-manipulation',
    isActive ? 'bg-emerald-500/20 text-emerald-100' : 'text-slate-200 hover:bg-white/10 hover:text-white',
  );
}

function sheetNavClass(isActive: boolean) {
  return cn(
    'block rounded-xl px-3 py-3 text-sm font-medium transition-colors touch-manipulation border border-transparent',
    isActive
      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
      : 'text-slate-100 hover:border-white/15 hover:bg-white/10',
  );
}

function bottomNavClass(isActive: boolean) {
  return cn(
    'flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold leading-tight transition-colors touch-manipulation',
    isActive ? 'text-emerald-200' : 'text-slate-400 hover:text-slate-200',
  );
}

/** عنوان تسويقي ثابت (بدون رابط) — إحساس «قاعة صفقات» مع نبض خفيف */
function PartnerPathDealPulseTitle({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.p
      className={cn(
        'm-0 bg-gradient-to-l from-amber-200 via-yellow-100 to-emerald-200 bg-clip-text font-extrabold leading-snug tracking-tight text-transparent',
        'drop-shadow-[0_0_16px_rgba(250,204,21,0.28)]',
        className,
      )}
      animate={
        reduceMotion
          ? false
          : {
              opacity: [0.86, 1, 0.86],
              filter: [
                'brightness(1) saturate(1)',
                'brightness(1.14) saturate(1.12)',
                'brightness(1) saturate(1)',
              ],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration: 2.35, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      {SOFTWARE_SERVICES_PORTAL_HEADING}
    </motion.p>
  );
}

export function PartnerLayout({ children }: PartnerLayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { effectivePhase, control } = usePlatformAmbient();
  const { visible: tutorialsVisible } = usePartnerTutorialSectionVisible();
  const { hasNewPosts: hasNewMapCommunityPosts } = useMapCommunityBadge();
  const navItems = tutorialsVisible
    ? partnerNavItems
    : partnerNavItems.filter((item) => item.path !== ROUTE_PATHS.PARTNER_TUTORIALS);
  const isMapCommunityPage = location.pathname === ROUTE_PATHS.MAP_COMMUNITY;
  const isPreviewHeavyPage = location.pathname === ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW;
  const isCompactHeaderPage = COMPACT_PARTNER_HEADER_PATHS.has(location.pathname);
  const shouldTrimMobileChrome = isMobile && isCompactHeaderPage;
  const compactTitle = compactPartnerHeaderTitle(location.pathname);

  useDocumentTitle(isMapCommunityPage ? 'مجتمع ماب' : SOFTWARE_SERVICES_PORTAL_HEADING);

  useEffect(() => {
    capturePartnerAttributionFromLocation();
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    ensureDomainVerificationMeta();
  }, []);

  /** theme-color + شريط حالة iOS أقرب لتطبيق مثبت؛ يُستعاد عند مغادرة المسار */
  useEffect(() => {
    const themeMetas = [...document.querySelectorAll('meta[name="theme-color"]')] as HTMLMetaElement[];
    const previousTheme = themeMetas.map((el) => ({ el, content: el.getAttribute('content') }));
    themeMetas.forEach((el) => el.setAttribute('content', PARTNER_THEME_COLOR));

    const appleStatus = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]',
    ) as HTMLMetaElement | null;
    const previousApple = appleStatus?.getAttribute('content') ?? null;
    appleStatus?.setAttribute('content', 'black-translucent');

    const root = document.documentElement;
    const previousColorScheme = root.style.colorScheme;
    root.style.colorScheme = 'dark';

    return () => {
      previousTheme.forEach(({ el, content }) => {
        if (content != null) el.setAttribute('content', content);
      });
      if (appleStatus) {
        if (previousApple != null) appleStatus.setAttribute('content', previousApple);
        else appleStatus.setAttribute('content', 'default');
      }
      root.style.colorScheme = previousColorScheme;
    };
  }, []);

  return (
    <div
      className={cn(
        'platform-dark platform-ambient relative flex min-h-dvh flex-col bg-gradient-to-b from-[#061223] via-background to-background md:pb-0',
        MOBILE_SHELL_OVERFLOW,
        isMapCommunityPage ? 'pb-0' : MOBILE_PARTNER_NAV_CLEARANCE,
      )}
      dir="rtl"
      data-ambient-phase={effectivePhase}
      data-ambient-control={control}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.018]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,158,11,1) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,1) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden
      />
      {!(isMobile && isPreviewHeavyPage) && !shouldTrimMobileChrome ? <PlatformAmbientBackground variant="partner" /> : null}
      {!(isMobile && isPreviewHeavyPage) && !shouldTrimMobileChrome ? <B2BAmbientGlowField /> : null}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <header
          className={cn(
            'sticky top-0 z-50 shrink-0 border-b border-white/10 pt-[env(safe-area-inset-top)]',
            isMobile && isPreviewHeavyPage
              ? 'bg-[#071426]/96'
              : 'bg-[#071426]/92 backdrop-blur supports-[backdrop-filter]:bg-[#071426]/75',
            isMapCommunityPage && 'border-emerald-500/15',
          )}
        >
          <div className="container mx-auto px-3 sm:px-4">
            {isMapCommunityPage ? (
              <div className="flex h-12 items-center gap-2">
                <HalaqmapBrandMark
                  className={cn(
                    'h-9 w-9 shrink-0 rounded-xl ring-2 ring-primary/40 ring-offset-2',
                    partnerBrandMarkSurfaceClass,
                  )}
                />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <MessageCircle className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
                  <p className="truncate text-sm font-black text-emerald-50">مجتمع ماب</p>
                  {hasNewMapCommunityPosts ? (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-300" />
                    </span>
                  ) : null}
                  <span className="hidden text-[0.65rem] text-slate-500 sm:inline">· Map Chat</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 border-white/15 bg-white/5 px-2 text-[0.65rem] text-slate-200 hover:bg-white/10 sm:px-2.5 sm:text-xs"
                  asChild
                >
                  <NavLink to={ROUTE_PATHS.HOME}>
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline max-[420px]:hidden sm:inline">للمستخدم</span>
                  </NavLink>
                </Button>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 shrink-0 border-emerald-500/30 bg-emerald-500/15 text-emerald-50 hover:bg-emerald-500/25"
                    aria-label={`فتح قائمة ${SOFTWARE_SERVICES_PORTAL_LABEL}`}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
              </div>
            ) : (
              isCompactHeaderPage ? (
              <>
            <div className="flex min-h-12 items-center justify-between gap-3 py-2.5 md:hidden">
              <div className="flex min-w-0 items-center gap-2">
                <HalaqmapBrandMark
                  className={cn(
                    'h-10 w-10 shrink-0 rounded-2xl ring-2 ring-primary/40 ring-offset-2',
                    partnerBrandMarkSurfaceClass,
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-emerald-50">{compactTitle}</p>
                  <p className="text-[0.65rem] text-slate-400">خطوة تنفيذية داخل مسار الشركاء</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 border-white/20 bg-white/5 px-2.5 text-xs text-slate-100 hover:bg-white/10"
                  asChild
                >
                  <NavLink to={ROUTE_PATHS.BARBERS_LANDING}>
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span className="max-[380px]:hidden">للمسار</span>
                  </NavLink>
                </Button>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 shrink-0 border-emerald-500/30 bg-emerald-500/15 text-emerald-50 hover:bg-emerald-500/25"
                    aria-label={`فتح قائمة ${SOFTWARE_SERVICES_PORTAL_LABEL}`}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </div>
            </div>

            <div className="hidden min-h-14 items-center justify-between gap-4 py-2.5 md:flex">
              <div className="flex min-w-0 items-center gap-3">
                <HalaqmapBrandMark
                  className={cn(
                    'h-11 w-11 shrink-0 rounded-2xl ring-2 ring-primary/40 ring-offset-2',
                    partnerBrandMarkSurfaceClass,
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-emerald-50">{compactTitle}</p>
                  <p className="text-xs text-slate-400">مسار مختصر يركز على الإجراء الأساسي</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <NavLink
                  to={ROUTE_PATHS.BARBERS_LANDING}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                  العودة للمسار التسويقي
                </NavLink>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 shrink-0 border-emerald-500/30 bg-emerald-500/15 text-emerald-50 hover:bg-emerald-500/25"
                    aria-label={`فتح قائمة ${SOFTWARE_SERVICES_PORTAL_LABEL}`}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </div>
            </div>
              </>
              ) : (
              <>
            {/* شريط علوي للجوال — بدون تفاف يشغل نصف الشاشة */}
            <div className="flex min-h-14 items-center gap-2 py-2 md:hidden">
              <div className="group flex min-h-11 shrink-0 items-center [perspective:640px]">
                <motion.div
                  className="relative shrink-0 [transform-style:preserve-3d]"
                  whileHover={{ scale: 1.06, rotateY: -8 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                >
                  <HalaqmapBrandMark
                    className={cn(
                      'h-11 w-11 shrink-0 rounded-2xl ring-2 ring-primary/40 ring-offset-2',
                      partnerBrandMarkSurfaceClass,
                    )}
                    imgClassName="[transform:translateZ(4px)]"
                  />
                </motion.div>
              </div>
              <PartnerPathDealPulseTitle className="min-w-0 flex-1 text-center text-[12px] sm:text-sm" />
              <div className="flex shrink-0 items-center gap-1.5">
                <PlatformAmbientToggle variant="partner" className="hidden sm:inline-flex" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 border-white/20 bg-white/5 px-2.5 text-xs text-slate-100 hover:bg-white/10"
                  asChild
                >
                  <NavLink to={ROUTE_PATHS.HOME}>
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span className="max-[380px]:hidden">للمستخدم</span>
                  </NavLink>
                </Button>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 shrink-0 border-emerald-500/30 bg-emerald-500/15 text-emerald-50 hover:bg-emerald-500/25"
                    aria-label={`فتح قائمة ${SOFTWARE_SERVICES_PORTAL_LABEL}`}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </div>
            </div>

            {/* شريط سطح المكتب */}
            <div className="hidden min-h-16 flex-wrap items-center justify-between gap-3 py-2 md:flex">
              <div className="flex min-w-0 items-center gap-3 lg:gap-4">
                <div className="group flex min-h-11 shrink-0 items-center [perspective:640px]">
                  <motion.div
                    className="relative shrink-0 [transform-style:preserve-3d]"
                    whileHover={{ scale: 1.06, rotateY: -8 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                  >
                    <HalaqmapBrandMark
                      className={cn(
                        'h-12 w-12 shrink-0 rounded-2xl ring-2 ring-primary/40 ring-offset-2',
                        partnerBrandMarkSurfaceClass,
                      )}
                      imgClassName="[transform:translateZ(4px)]"
                    />
                  </motion.div>
                </div>
                <PartnerPathDealPulseTitle className="min-w-0 max-w-[10rem] text-[11px] leading-snug sm:max-w-[12rem] sm:text-sm md:max-w-none md:text-base lg:text-lg" />
              </div>

              <nav className="flex max-w-[58%] flex-1 flex-wrap items-center justify-end gap-2 lg:max-w-none">
                {navItems.map((item) => {
                  const ItemIcon = item.Icon;
                  return (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => desktopNavClass(isActive)}>
                      <span className="inline-flex items-center gap-1.5">
                        {ItemIcon ? <ItemIcon className="h-3.5 w-3.5 text-emerald-300" /> : null}
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}
                <PlatformAmbientToggle variant="partner" className="hidden xl:inline-flex" />
              </nav>

              <NavLink
                to={ROUTE_PATHS.HOME}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
                الرجوع لمسار المستخدم
              </NavLink>
            </div>
              </>
              )
            )}
          </div>
        </header>

        <SheetContent
          side="right"
          dir="rtl"
          className="flex w-[min(100vw,20rem)] flex-col border-white/10 bg-[#071426] text-white [&>button]:text-slate-300 [&>button]:hover:text-white"
        >
          <SheetHeader className="space-y-1 border-b border-white/10 pb-4 text-right">
            <SheetTitle className="text-emerald-50">
              {isMapCommunityPage ? 'مجتمع ماب' : `تصفّح ${SOFTWARE_SERVICES_PORTAL_LABEL}`}
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              {isMapCommunityPage ? 'للحلاقين المسجّلين والمفعّلين في حلاق ماب' : 'جميع الصفحات والوثائق'}
            </SheetDescription>
          </SheetHeader>
          <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain pb-6" aria-label={isMapCommunityPage ? 'مجتمع ماب' : 'صفحات الشركاء'}>
            {isMapCommunityPage ? (
              <>
                <NavLink
                  to={ROUTE_PATHS.HOME}
                  onClick={() => setMobileNavOpen(false)}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-medium text-slate-200 touch-manipulation hover:bg-white/10"
                >
                  <ArrowRight className="h-4 w-4" />
                  مسار المستخدم
                </NavLink>
              </>
            ) : (
              <>
            {navItems.map((item) => {
              const ItemIcon = item.Icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) => sheetNavClass(isActive)}
                >
                  <span className="flex items-center gap-2">
                    {ItemIcon ? <ItemIcon className="h-4 w-4 text-emerald-300" /> : null}
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
            <NavLink
              to={ROUTE_PATHS.HOME}
              onClick={() => setMobileNavOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-medium text-slate-200 touch-manipulation hover:bg-white/10"
            >
              <ArrowRight className="h-4 w-4" />
              الرجوع لمسار المستخدم
            </NavLink>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {!isMapCommunityPage && !isCompactHeaderPage && !(isMobile && isPreviewHeavyPage) ? <PartnerPromoVideoBand /> : null}

      <main
        className={cn(
          'b2b-nebula-scope relative z-10 min-h-0 w-full flex-1',
          isMapCommunityPage && 'flex flex-col overflow-hidden',
          !isMapCommunityPage && `${MOBILE_PARTNER_NAV_CLEARANCE} md:pb-0`,
        )}
      >
        {children}
      </main>

      {/* شريط تنقّل سفلي للجوال — يُخفى داخل مجتمع ماب (له شريط خاص) */}
      {!isMapCommunityPage ? (
        <nav
          className={cn(
            'fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-[#071426]/95 pt-1 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden',
            MOBILE_FIXED_NAV_SAFE,
          )}
          aria-label={`تنقّل سريع — ${SOFTWARE_SERVICES_PORTAL_LABEL}`}
        >
          {partnerBottomNav.map(({ path, label, Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => bottomNavClass(isActive)} end={path === ROUTE_PATHS.HOME}>
              <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      ) : null}

      {!isMapCommunityPage ? (
      <footer className="shrink-0 border-t border-white/10 bg-[#071426]/70">
        {/* فوتر مضغوط للجوال */}
        <div className="container mx-auto px-3 py-4 md:hidden">
          {!isMapCommunityPage && !shouldTrimMobileChrome ? (
            <div className="mb-4">
              <LicenseRechargeWidget mode="auto" showHeader={false} />
            </div>
          ) : null}
          <p className="mt-3 rounded-md border border-amber-400/25 bg-amber-500/[0.06] px-3 py-2 text-center text-[10.5px] leading-relaxed text-amber-100/90">
            {PLATFORM_IDENTITY_BOILERPLATE_AR}
          </p>
          <PlatformTrustStrip variant="inline" tone="dark" className="mt-2" />
          <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">{PARTNER_LAYOUT_FOOTER_LINE}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-300">
            <a href="tel:+966559602685" className="inline-flex items-center gap-1.5 touch-manipulation">
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">+966559602685</span>
            </a>
            <a href="mailto:admin@halaqmap.com" className="inline-flex items-center gap-1.5 touch-manipulation">
              <Mail className="h-3.5 w-3.5" />
              <span>admin@halaqmap.com</span>
            </a>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 border-t border-white/5 pt-3 text-[11px]">
            <NavLink to={ROUTE_PATHS.TERMS_OF_SERVICE} className="text-slate-500 hover:text-emerald-300 touch-manipulation">
              شروط الاستخدام
            </NavLink>
            <NavLink to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="text-slate-500 hover:text-emerald-300 touch-manipulation">
              سياسة الخصوصية
            </NavLink>
            <NavLink to={ROUTE_PATHS.EPHEMERAL_PROCESSING_GOVERNANCE} className="text-slate-500 hover:text-emerald-300 touch-manipulation">
              حوكمة المعالجة اللحظية
            </NavLink>
            <NavLink to={ROUTE_PATHS.PRIVACY_DETAILED} className="text-slate-500 hover:text-emerald-300 touch-manipulation">
              خصوصية (تفصيلية)
            </NavLink>
          </div>
          <div className="mt-3 border-t border-white/5 pt-3">
            <PlatformOfficialFooterStrip variant="dark" />
          </div>
          <AppBuildStamp variant="dark" className="mt-2 text-center text-[10px] opacity-80" />
        </div>

        <div className="container mx-auto hidden px-4 py-6 md:block">
          {!isMapCommunityPage ? (
            <div className="mb-8">
              <LicenseRechargeWidget mode="auto" />
            </div>
          ) : null}
          <div className="mb-4 rounded-lg border border-amber-400/25 bg-amber-500/[0.06] px-4 py-3 text-sm leading-relaxed text-amber-100/90">
            {PLATFORM_IDENTITY_BOILERPLATE_AR}
          </div>
          <PlatformTrustStrip variant="inline" tone="dark" className="mb-4" />
          <div className="flex flex-col gap-3 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
            <p className="max-w-3xl leading-relaxed">{PARTNER_LAYOUT_FOOTER_LINE}</p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="tel:+966559602685" className="inline-flex items-center gap-2 transition-colors hover:text-emerald-200">
                <Phone className="h-4 w-4" />
                <span dir="ltr">+966559602685</span>
              </a>
              <a href="mailto:admin@halaqmap.com" className="inline-flex items-center gap-2 transition-colors hover:text-emerald-200">
                <Mail className="h-4 w-4" />
                <span>admin@halaqmap.com</span>
              </a>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 pt-4 text-sm">
            <NavLink to={ROUTE_PATHS.TERMS_OF_SERVICE} className="text-slate-400 transition-colors hover:text-emerald-200">
              شروط الاستخدام
            </NavLink>
            <NavLink to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="text-slate-400 transition-colors hover:text-emerald-200">
              سياسة الخصوصية
            </NavLink>
            <NavLink to={ROUTE_PATHS.EPHEMERAL_PROCESSING_GOVERNANCE} className="text-slate-400 transition-colors hover:text-emerald-200">
              حوكمة المعالجة اللحظية
            </NavLink>
            <NavLink to={ROUTE_PATHS.PRIVACY_DETAILED} className="text-slate-400 transition-colors hover:text-emerald-200">
              خصوصية المستخدم (تفصيلية)
            </NavLink>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <PlatformOfficialFooterStrip variant="dark" />
          </div>
          <AppBuildStamp variant="dark" className="mt-4 border-t border-white/5 pt-3" />
        </div>
      </footer>
      ) : null}
    </div>
  );
}
