import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Phone, PlayCircle } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { IMAGES } from '@/assets/images';
import { capturePartnerAttributionFromLocation } from '@/lib/partnerAttribution';
import { PARTNER_LAYOUT_FOOTER_LINE } from '@/lib/partnerMarketingCopy';
/** المساعد الحيّ (OpenAI/Anthropic) — المكوّن الوحيد؛ لا يوجد مسار استيراد قديم. */
import { PartnerDigitalBarberAssistant } from '@/components/partner/PartnerDigitalBarberAssistant';
import { AppBuildStamp } from '@/components/AppBuildStamp';
import { LegalEntityPublicStrip } from '@/components/LegalEntityPublicStrip';
import { PartnerPromoVideoBand } from '@/components/partner/PartnerPromoVideoBand';

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

export function PartnerLayout({ children }: PartnerLayoutProps) {
  const location = useLocation();

  useEffect(() => {
    capturePartnerAttributionFromLocation();
  }, [location.pathname, location.search, location.hash]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061223] via-background to-background" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071426]/88 backdrop-blur supports-[backdrop-filter]:bg-[#071426]/72">
        <div className="container mx-auto px-4">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-3">
              <img
                src={IMAGES.HALAQMAP_LOGO_20260409_073322_83}
                alt="حلاق ماب"
                className="h-11 w-11 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
              />
              <div>
                <p className="text-sm font-bold text-amber-100">مسار الشركاء</p>
                <p className="text-xs text-slate-300">Landing + Onboarding Funnel</p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              {partnerNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-100'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <NavLink
              to={ROUTE_PATHS.PARTNER_TUTORIALS}
              className={({ isActive }) =>
                `inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary/25 text-emerald-100' : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`
              }
              title="فيديوهات شرح الاشتراك"
            >
              <PlayCircle className="h-4 w-4" />
              <span>شرح الاشتراك</span>
            </NavLink>

            <NavLink
              to={ROUTE_PATHS.HOME}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              الرجوع لمسار المستخدم
            </NavLink>
          </div>
        </div>
      </header>

      <PartnerPromoVideoBand />

      <main>{children}</main>

      <PartnerDigitalBarberAssistant />

      <footer className="border-t border-white/10 bg-[#071426]/70">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <LegalEntityPublicStrip variant="dark" />
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
            <p className="max-w-3xl leading-relaxed">{PARTNER_LAYOUT_FOOTER_LINE}</p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="tel:+966559602685" className="inline-flex items-center gap-2 hover:text-emerald-200 transition-colors">
                <Phone className="h-4 w-4" />
                <span dir="ltr">+966559602685</span>
              </a>
              <a href="mailto:admin@halaqmap.com" className="inline-flex items-center gap-2 hover:text-emerald-200 transition-colors">
                <Mail className="h-4 w-4" />
                <span>admin@halaqmap.com</span>
              </a>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 pt-4 text-sm">
            <NavLink to={ROUTE_PATHS.TERMS_OF_SERVICE} className="text-slate-400 hover:text-emerald-200 transition-colors">
              شروط الاستخدام
            </NavLink>
            <NavLink to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="text-slate-400 hover:text-emerald-200 transition-colors">
              سياسة الخصوصية
            </NavLink>
            <NavLink to={ROUTE_PATHS.PRIVACY} className="text-slate-400 hover:text-emerald-200 transition-colors">
              خصوصية المستخدم (تفصيلية)
            </NavLink>
          </div>
          <AppBuildStamp variant="dark" className="mt-2 border-t border-white/5 pt-3" />
        </div>
      </footer>
    </div>
  );
}
