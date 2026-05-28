import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Fragment, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PlatformAmbientProvider } from "@/context/PlatformAmbientContext";
import { Layout } from "@/components/Layout";
/** يتضمن PartnerLayout مساعد الشركاء الرقمي عبر PartnerDigitalBarberAssistant — المسار الوحيد للمساعد في مسار الخدمات البرمجية للمنصة. */
import { PartnerLayout } from "@/components/PartnerLayout";
import { RouteLoadingFallback } from "@/components/RouteLoadingFallback";
import { ScrollToTop } from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import RegisterSuccess from "@/pages/RegisterSuccess";
import ShopOpenStatus from "@/pages/ShopOpenStatus";
import About from "@/pages/About";
import BarberGrowthLanding from "@/pages/BarberGrowthLanding";
import PartnerInterestLanding from "@/pages/PartnerInterestLanding";
import PartnerWhyPage from "@/pages/PartnerWhyPage";
import PartnerStoryPage from "@/pages/PartnerStoryPage";
import Privacy from "@/pages/Privacy";
import UserPrivacyPolicy from "@/pages/UserPrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import PartnerPrivacy from "@/pages/PartnerPrivacy";
import SubscriptionPolicy from "@/pages/SubscriptionPolicy";
import BarberLogin from "@/pages/BarberLogin";
import BarberPortalEnter from "@/pages/BarberPortalEnter";
import BarberAccountDeletionRequest from "@/pages/BarberAccountDeletionRequest";
import Payment from "@/pages/Payment";
import PartnerSupportChat from "@/pages/PartnerSupportChat";
import PartnerSubscriptionTutorials from "@/pages/PartnerSubscriptionTutorials";
import PartnerBannersPreviewLanding from "@/pages/PartnerBannersPreviewLanding";
import RateBarber from "@/pages/RateBarber";
import { LEGACY_PARTNER_ROUTE_PATHS, ROUTE_PATHS } from "@/lib/index";
import DigitalShiftFeaturePage from "@/pages/DigitalShiftFeaturePage";
import PrivateOfficeGuide from "@/pages/PrivateOfficeGuide";
import LandingPreview from "@/pages/LandingPreview";
import PartnerMarketingPreview from "@/pages/PartnerMarketingPreview";
import PlatformReviews from "@/pages/PlatformReviews";
import PulseMapPage from "@/pages/PulseMapPage";
import {
  AdminCyberOperationsPage,
  AdminDashboard,
  AdminLogin,
  AdminRadarFullScreenPage,
  AdminSentinelPage,
  BarberDashboard,
  CosmicShowcase,
  InternalPartnerPathPrintCard,
  InvoicePreviewSamples,
  MapCommunity,
  Register,
  SaudiAgentLanding,
  StaffHubPage,
} from "@/app/lazyPages";
import { getAdminPortalBasePath, getAdminPortalBasePaths } from "@/config/adminAuth";
import { AdminAuthHashGate, AdminSentinelSecurityGate } from "@/components/AdminAuthHashGate";

const queryClient = new QueryClient();

const NotFound = () => (
  <Layout>
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground">عذراً، الصفحة التي تبحث عنها غير متوفرة</p>
        <a
          href="#/"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          العودة للرئيسية
        </a>
      </div>
    </div>
  </Layout>
);

const LegacyPartnerRedirect = ({ to }: { to: string }) => {
  const location = useLocation();
  return <Navigate to={`${to}${location.search || ''}`} replace />;
};

/**
 * Safety net for invitation emails sent before `VITE_ADMIN_PORTAL_BASE`
 * was aligned across build and runtime: any `/admin/in?email=…` or
 * `/admin/ctrl` link is redirected to the canonical obfuscated base
 * so the recipient lands on the real login (or dashboard) instead of 404.
 */
const LegacyAdminRedirect = ({ suffix }: { suffix: string }) => {
  const location = useLocation();
  return (
    <Navigate
      to={`${getAdminPortalBasePath()}${suffix}${location.search || ''}`}
      replace
    />
  );
};

// ── Dedicated Map Community domain ───────────────────────────────────────────
function NotaCouncilRedirect() {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname.toLowerCase();
  const isCommunityDomain = host === 'community.nota-council.com';
  const isNotaRoot = host === 'nota-council.com' || host === 'www.nota-council.com';

  if (isNotaRoot) {
    window.location.replace('https://community.nota-council.com/#/partners/community');
    return null;
  }

  if (isCommunityDomain && !window.location.hash.includes('/partners/community')) {
    window.location.replace('/#/partners/community');
  }

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PlatformAmbientProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <NotaCouncilRedirect />
        <AdminAuthHashGate>
        <ScrollToTop />
        <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* ── الصفحتان الرئيسيتان الجديدتان ─────────────────────────── */}
          <Route path={ROUTE_PATHS.HOME} element={<LandingPreview />} />
          <Route path={ROUTE_PATHS.PLATFORM_REVIEWS} element={<PlatformReviews />} />
          <Route path={ROUTE_PATHS.COSMIC_SHOWCASE} element={<CosmicShowcase />} />
          <Route path={ROUTE_PATHS.SAUDI_AGENT} element={<SaudiAgentLanding />} />
          <Route path={ROUTE_PATHS.RADAR_SHOWCASE} element={<PulseMapPage />} />
          <Route path={ROUTE_PATHS.DIGITAL_SHIFT_FEATURE} element={<DigitalShiftFeaturePage />} />
          <Route path={ROUTE_PATHS.PRIVATE_OFFICE_GUIDE} element={<PrivateOfficeGuide />} />

          {/* ── أرشيف الصفحات القديمة — ذكرى البدايات ──────────────── */}
          <Route path="/archive/home" element={<Layout><Home /></Layout>} />
          <Route path="/archive/partners" element={<PartnerLayout><BarberGrowthLanding /></PartnerLayout>} />

          {/* ── صفحات المعاينة — تبقى مرجعاً ──────────────────────── */}
          <Route path={ROUTE_PATHS.LANDING_PREVIEW} element={<LandingPreview />} />
          <Route path={ROUTE_PATHS.LANDING_PARTNERS_PREVIEW} element={<PartnerMarketingPreview />} />
          <Route path={ROUTE_PATHS.INTERNAL_PARTNER_PATH_PRINT_CARD} element={<InternalPartnerPathPrintCard />} />
          <Route path={ROUTE_PATHS.INVOICE_PREVIEW_SAMPLES} element={<InvoicePreviewSamples />} />
          <Route
            path={ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW}
            element={
              <PartnerLayout>
                <PartnerBannersPreviewLanding />
              </PartnerLayout>
            }
          />
          <Route path={ROUTE_PATHS.ABOUT} element={<Layout><About /></Layout>} />
          <Route path={ROUTE_PATHS.TERMS_OF_SERVICE} element={<Layout><TermsOfService /></Layout>} />
          <Route path={ROUTE_PATHS.USER_PRIVACY_POLICY} element={<Layout><UserPrivacyPolicy /></Layout>} />
          <Route path={ROUTE_PATHS.PRIVACY_DETAILED} element={<Layout><Privacy /></Layout>} />
          <Route path={ROUTE_PATHS.PRIVACY} element={<Navigate to={ROUTE_PATHS.PRIVACY_DETAILED} replace />} />

          {/* مسار الشركاء — الصفحة الجديدة */}
          <Route path={ROUTE_PATHS.BARBERS_LANDING} element={<PartnerMarketingPreview />} />
          <Route
            path={ROUTE_PATHS.PARTNER_INTEREST}
            element={
              <PartnerLayout>
                <PartnerInterestLanding />
              </PartnerLayout>
            }
          />
          <Route path={ROUTE_PATHS.PARTNER_WHY} element={<PartnerLayout><PartnerWhyPage /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_STORY} element={<PartnerLayout><PartnerStoryPage /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER} element={<PartnerLayout><Register /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER_SUCCESS} element={<PartnerLayout><RegisterSuccess /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.SHOP_OPEN_STATUS} element={<PartnerLayout><ShopOpenStatus /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_PRIVACY} element={<PartnerLayout><PartnerPrivacy /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.SUBSCRIPTION_POLICY} element={<PartnerLayout><SubscriptionPolicy /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.BARBER_LOGIN} element={<PartnerLayout><BarberLogin /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.BARBER_PORTAL_ENTER} element={<PartnerLayout><BarberPortalEnter /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PAYMENT} element={<PartnerLayout><Payment /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_TUTORIALS} element={<PartnerLayout><PartnerSubscriptionTutorials /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.MAP_COMMUNITY} element={<PartnerLayout><MapCommunity /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_SUPPORT} element={<PartnerLayout><PartnerSupportChat /></PartnerLayout>} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.BARBERS_LANDING} element={<LegacyPartnerRedirect to={ROUTE_PATHS.BARBERS_LANDING} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.REGISTER} element={<LegacyPartnerRedirect to={ROUTE_PATHS.REGISTER} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.REGISTER_SUCCESS} element={<LegacyPartnerRedirect to={ROUTE_PATHS.REGISTER_SUCCESS} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.SUBSCRIPTION_POLICY} element={<LegacyPartnerRedirect to={ROUTE_PATHS.SUBSCRIPTION_POLICY} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.BARBER_LOGIN} element={<LegacyPartnerRedirect to={ROUTE_PATHS.BARBER_LOGIN} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.PAYMENT} element={<LegacyPartnerRedirect to={ROUTE_PATHS.PAYMENT} />} />

          <Route path={ROUTE_PATHS.BARBER_DASHBOARD} element={<BarberDashboard />} />
          <Route
            path={ROUTE_PATHS.BARBER_ACCOUNT_DELETE_REQUEST}
            element={
              <PartnerLayout>
                <BarberAccountDeletionRequest />
              </PartnerLayout>
            }
          />
          {getAdminPortalBasePaths().map((adminBase) => (
            <Fragment key={adminBase}>
              <Route path={`${adminBase}/in`} element={<AdminLogin />} />
              <Route path={`${adminBase}/ctrl`} element={<AdminDashboard />} />
              <Route
                path={`${adminBase}/sentinel`}
                element={
                  <AdminSentinelSecurityGate>
                    <AdminSentinelPage />
                  </AdminSentinelSecurityGate>
                }
              />
              <Route path={`${adminBase}/radar/full-screen`} element={<AdminRadarFullScreenPage />} />
              <Route path={`${adminBase}/cyber`} element={<AdminCyberOperationsPage />} />
              <Route path={`${adminBase}/staff-hub`} element={<StaffHubPage />} />
            </Fragment>
          ))}
          {/* Safety net for legacy invitation links built before VITE_ADMIN_PORTAL_BASE alignment. */}
          <Route path="/admin/in" element={<LegacyAdminRedirect suffix="/in" />} />
          <Route path="/admin/ctrl" element={<LegacyAdminRedirect suffix="/ctrl" />} />
          <Route path="/admin/sentinel" element={<LegacyAdminRedirect suffix="/sentinel" />} />
          <Route path="/admin/radar/full-screen" element={<LegacyAdminRedirect suffix="/radar/full-screen" />} />
          <Route path="/admin/cyber" element={<LegacyAdminRedirect suffix="/cyber" />} />
          <Route path="/admin" element={<LegacyAdminRedirect suffix="/in" />} />
          <Route path={ROUTE_PATHS.RATE_BARBER} element={<RateBarber />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </AdminAuthHashGate>
      </HashRouter>
    </TooltipProvider>
    </PlatformAmbientProvider>
  </QueryClientProvider>
);

export default App;
