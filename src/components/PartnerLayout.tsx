import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Headphones,
  Home,
  LogIn,
  Mail,
  Menu,
  Phone,
  UserPlus,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import { capturePartnerAttributionFromLocation } from '@/lib/partnerAttribution';
import { PARTNER_LAYOUT_FOOTER_LINE } from '@/lib/partnerMarketingCopy';
import { PartnerDigitalBarberAssistant } from '@/components/partner/PartnerDigitalBarberAssistant';
import { AppBuildStamp } from '@/components/AppBuildStamp';
import { LegalEntityPublicStrip } from '@/components/LegalEntityPublicStrip';
import { PlatformOfficialFooterStrip } from '@/components/PlatformOfficialFooterStrip';
import { PartnerPromoVideoBand } from '@/components/partner/PartnerPromoVideoBand';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface PartnerLayoutProps {
  children: React.ReactNode;
}

const partnerNavItems = [
  { path: ROUTE_PATHS.BARBERS_LANDING, label: 'الصفحة التسويقية' },
  { path: ROUTE_PATHS.PARTNER_WHY, label: 'لماذا تنضم؟' },
  { path: ROUTE_PATHS.PARTNER_STORY, label: 'القصة والمسار' },
  { path: ROUTE_PATHS.PARTNER_TUTORIALS, label: 'فيديوهات الاشتراك' },
  { path: ROUTE_PATHS.REGISTER, label: 'التسجيل كحلاق' },
  { path: ROUTE_PATHS.PARTNER_SUPPORT, label: 'دعم الشركاء' },
  { path: ROUTE_PATHS.PARTNER_PRIVACY, label: 'خصوصية الشركاء' },
  { path: ROUTE_PATHS.SUBSCRIPTION_POLICY, label: 'سياسة الاشتراك' },
  { path: ROUTE_PATHS.BARBER_LOGIN, label: 'دخول الحلاق' },
];

const partnerBottomNav = [
  { path: ROUTE_PATHS.BARBERS_LANDING, label: 'الرئيسية', Icon: Home },
  { path: ROUTE_PATHS.REGISTER, label: 'تسجيل', Icon: UserPlus },
  { path: ROUTE_PATHS.BARBER_LOGIN, label: 'دخول', Icon: LogIn },
  { path: ROUTE_PATHS.PARTNER_SUPPORT, label: 'دعم', Icon: Headphones },
] as const;

/** يطابق رأس مسار الشركاء — شريط عنوان المتصفح / PWA على الجوال */
const PARTNER_THEME_COLOR = '#071426';

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

export function PartnerLayout({ children }: PartnerLayoutProps) {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    capturePartnerAttributionFromLocation();
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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
      className="flex min-h-dvh flex-col bg-gradient-to-b from-[#061223] via-background to-background pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:pb-0"
      dir="rtl"
    >
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <header className="sticky top-0 z-50 shrink-0 border-b border-white/10 bg-[#071426]/92 backdrop-blur supports-[backdrop-filter]:bg-[#071426]/75">
          <div className="container mx-auto px-3 sm:px-4">
            {/* شريط علوي للجوال — بدون تفاف يشغل نصف الشاشة */}
            <div className="flex min-h-14 items-center justify-between gap-2 py-2 md:hidden">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <HalaqmapBrandMark
                  className="h-10 w-10 shrink-0 rounded-2xl ring-2 ring-primary/30 ring-offset-2 ring-offset-[#071426]"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-amber-100">مسار الشركاء</p>
                  <p className="truncate text-[11px] text-slate-400">انضمام الحلاقين</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
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
                    aria-label="فتح قائمة مسار الشركاء"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </div>
            </div>

            {/* شريط سطح المكتب */}
            <div className="hidden min-h-16 flex-wrap items-center justify-between gap-3 py-2 md:flex">
              <div className="flex items-center gap-3">
                <HalaqmapBrandMark
                  className="h-11 w-11 shrink-0 rounded-2xl ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                />
                <div>
                  <p className="text-sm font-bold text-amber-100">مسار الشركاء</p>
                  <p className="text-xs text-slate-300">Landing + Onboarding Funnel</p>
                </div>
              </div>

              <nav className="flex max-w-[58%] flex-1 flex-wrap items-center justify-end gap-2 lg:max-w-none">
                {partnerNavItems.map((item) => (
                  <NavLink key={item.path} to={item.path} className={({ isActive }) => desktopNavClass(isActive)}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <NavLink
                to={ROUTE_PATHS.HOME}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
                الرجوع لمسار المستخدم
              </NavLink>
            </div>
          </div>
        </header>

        <SheetContent
          side="right"
          dir="rtl"
          className="flex w-[min(100vw,20rem)] flex-col border-white/10 bg-[#071426] text-white [&>button]:text-slate-300 [&>button]:hover:text-white"
        >
          <SheetHeader className="space-y-1 border-b border-white/10 pb-4 text-right">
            <SheetTitle className="text-emerald-50">تصفّح مسار الشركاء</SheetTitle>
            <SheetDescription className="text-slate-400">جميع الصفحات والوثائق</SheetDescription>
          </SheetHeader>
          <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain pb-6" aria-label="صفحات الشركاء">
            {partnerNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) => sheetNavClass(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to={ROUTE_PATHS.HOME}
              onClick={() => setMobileNavOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-medium text-slate-200 touch-manipulation hover:bg-white/10"
            >
              <ArrowRight className="h-4 w-4" />
              الرجوع لمسار المستخدم
            </NavLink>
          </nav>
        </SheetContent>
      </Sheet>

      <PartnerPromoVideoBand />

      <main className="min-h-0 w-full flex-1">{children}</main>

      <PartnerDigitalBarberAssistant />

      {/* شريط تنقّل سفلي للجوال — نمط تطبيق */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-[#071426]/95 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] pt-1 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden"
        aria-label="تنقّل سريع — مسار الشركاء"
      >
        {partnerBottomNav.map(({ path, label, Icon }) => (
          <NavLink key={path} to={path} className={({ isActive }) => bottomNavClass(isActive)} end={path === ROUTE_PATHS.BARBERS_LANDING}>
            <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <footer className="shrink-0 border-t border-white/10 bg-[#071426]/70">
        {/* فوتر مضغوط للجوال */}
        <div className="container mx-auto px-3 py-4 md:hidden">
          <LegalEntityPublicStrip variant="dark" />
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
          <div className="mb-6">
            <LegalEntityPublicStrip variant="dark" />
          </div>
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
    </div>
  );
}
