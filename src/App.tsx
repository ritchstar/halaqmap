import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Fragment, lazy, Suspense, type ReactNode } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { PlatformAmbientProvider } from "@/context/PlatformAmbientContext";
import { Layout } from "@/components/Layout";
/** ???????? PartnerLayout ?????? ????????? ?????????? ??? PartnerDigitalBarberAssistant ??? ???????? ????????? ?????????? ??? ????? ????????? ??????????? ??????????. */
import { PartnerLayout } from "@/components/PartnerLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PolicySectionHashRedirect } from "@/components/PolicySectionHashRedirect";
import { MoyasarPaymentReturnGate } from "@/components/MoyasarPaymentReturnGate";
import { RouteScopedErrorBoundary } from "@/components/RouteScopedErrorBoundary";
import { LEGACY_PARTNER_ROUTE_PATHS, ROUTE_PATHS } from "@/lib/index";
import { getAdminPortalBasePath, getAdminPortalBasePaths } from "@/config/adminAuth";
import { PUBLIC_PULSE_EXPERIENCE_ENABLED } from '@/config/publicPulseExperience';
import { AdminAuthHashGate, AdminSentinelSecurityGate } from "@/components/AdminAuthHashGate";
import HospitalityB2BRequestLanding from "@/pages/HospitalityB2BRequestLanding";

const LandingPreview = lazy(() => import("@/pages/LandingPreview"));
const PartnerMarketingPreview = lazy(() => import("@/pages/PartnerMarketingPreview"));
const PartnersB2BLanding = lazy(() => import("@/pages/PartnersB2BLanding"));
const PulseMapPage = lazy(() => import("@/pages/PulseMapPage"));
const AdminRadarFullScreenPage = lazy(() => import("@/app/admin/radar/full-screen/page"));
const AdminCyberOperationsPage = lazy(() => import("@/app/admin/cyber/page"));
const StaffHubPage = lazy(() => import("@/app/admin/staff-hub/page"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const SaudiAgentLanding = lazy(() => import("@/pages/SaudiAgentLanding"));
const About = lazy(() => import("@/pages/About"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const UserPrivacyPolicy = lazy(() => import("@/pages/UserPrivacyPolicy"));
const EphemeralProcessingGovernance = lazy(() => import("@/pages/EphemeralProcessingGovernance"));
const PlatformReviews = lazy(() => import("@/pages/PlatformReviews"));
const Register = lazy(() => import("@/pages/Register"));
const PartnerPrivacy = lazy(() => import("@/pages/PartnerPrivacy"));
const SubscriptionPolicy = lazy(() => import("@/pages/SubscriptionPolicy"));
const PartnerSupportChat = lazy(() => import("@/pages/PartnerSupportChat"));
const PartnerSalesOfficePage = lazy(() => import("@/pages/PartnerSalesOfficePage"));

const ArchiveHome = lazy(() => import("@/pages/Home"));
const RegisterSuccess = lazy(() => import("@/pages/RegisterSuccess"));
const ShopOpenStatus = lazy(() => import("@/pages/ShopOpenStatus"));
const ShopOpenStatusRotateRequest = lazy(() => import("@/pages/ShopOpenStatusRotateRequest"));
const ShopOpenStatusRotateConfirm = lazy(() => import("@/pages/ShopOpenStatusRotateConfirm"));
const BarberGrowthLanding = lazy(() => import("@/pages/BarberGrowthLanding"));
const InternalPartnerPathPrintCard = lazy(() => import("@/pages/InternalPartnerPathPrintCard"));
const InvoicePreviewSamples = lazy(() => import("@/pages/InvoicePreviewSamples"));
const GrowthPitchDeckPage = lazy(() => import("@/pages/GrowthPitchDeckPage"));
const PlatformDiscoverLandingPage = lazy(() => import("@/pages/PlatformDiscoverLandingPage"));
const PartnerInterestLanding = lazy(() => import("@/pages/PartnerInterestLanding"));
const PartnerWhyPage = lazy(() => import("@/pages/PartnerWhyPage"));
const PartnerStoryPage = lazy(() => import("@/pages/PartnerStoryPage"));
const BarberPortalEnter = lazy(() => import("@/pages/BarberPortalEnter"));
const BarberLogin = lazy(() => import("@/pages/BarberLogin"));
const BarberDashboard = lazy(() => import("@/pages/BarberDashboard"));
const BarberAccountDeletionRequest = lazy(() => import("@/pages/BarberAccountDeletionRequest"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const Payment = lazy(() => import("@/pages/Payment"));
const PartnerSubscriptionTutorials = lazy(() => import("@/pages/PartnerSubscriptionTutorials"));
const MapCommunity = lazy(() => import("@/pages/MapCommunity"));
const PartnerBannersPreviewLanding = lazy(() => import("@/pages/PartnerBannersPreviewLanding"));
const RateBarber = lazy(() => import("@/pages/RateBarber"));
const AdminSentinelPage = lazy(() => import("@/pages/AdminSentinelPage"));
const CosmicShowcase = lazy(() => import("@/pages/CosmicShowcase"));
const DigitalShiftFeaturePage = lazy(() => import("@/pages/DigitalShiftFeaturePage"));
const PrivateOfficeGuide = lazy(() => import("@/pages/PrivateOfficeGuide"));

const queryClient = new QueryClient();

const RouteBusy = () => (
  <div dir="rtl" className="flex min-h-[48vh] items-center justify-center text-sm text-muted-foreground">
    جاري التحميل…
  </div>
);

function LazyRoute({ children, fallback = <RouteBusy /> }: { children: ReactNode; fallback?: ReactNode }) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

const NotFound = () => (
  <Layout>
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">??????? ???? ?????????</h2>
        <p className="text-muted-foreground">???????? ??????? ?????? ???? ?????? ???? ????????</p>
        <Link
          to={ROUTE_PATHS.HOME}
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          العودة للرئيسية
        </Link>
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
 * was aligned across build and runtime: any `/admin/in?email=???` or
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

// ?????? Dedicated Map Community domain ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
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

/** partners.halaqmap.com — صفحة هبوط B2B الافتراضية */
function PartnersDomainRedirect() {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname.toLowerCase();
  if (host !== 'partners.halaqmap.com') return null;

  const hash = window.location.hash.replace(/^#/, '');
  const pathOnly = (hash.split('?')[0] || '/').trim();

  if (!window.location.hash || pathOnly === '/' || pathOnly === '') {
    window.location.replace(`/#${ROUTE_PATHS.PARTNERS_B2B_LANDING}`);
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
        <RouteScopedErrorBoundary>
        <NotaCouncilRedirect />
        <PartnersDomainRedirect />
        <AdminAuthHashGate>
        <ScrollToTop />
        <PolicySectionHashRedirect />
        <MoyasarPaymentReturnGate />
        <Routes>
          {/* ?????? ?????????? ?????????????? ???????????? ????????????????????????????????????????????????????????????????????????????????? */}
          <Route path={ROUTE_PATHS.HOME} element={<LazyRoute><LandingPreview /></LazyRoute>} />
          <Route path={ROUTE_PATHS.PLATFORM_REVIEWS} element={<LazyRoute><PlatformReviews /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COSMIC_SHOWCASE} element={<LazyRoute><CosmicShowcase /></LazyRoute>} />
          <Route path={ROUTE_PATHS.SAUDI_AGENT} element={<LazyRoute><SaudiAgentLanding /></LazyRoute>} />
          <Route
            path={ROUTE_PATHS.RADAR_SHOWCASE}
            element={
              PUBLIC_PULSE_EXPERIENCE_ENABLED
                ? <LazyRoute><PulseMapPage /></LazyRoute>
                : <Navigate to={ROUTE_PATHS.HOME} replace />
            }
          />
          <Route path={ROUTE_PATHS.DIGITAL_SHIFT_FEATURE} element={<LazyRoute><DigitalShiftFeaturePage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.PRIVATE_OFFICE_GUIDE} element={<LazyRoute><PrivateOfficeGuide /></LazyRoute>} />
          <Route
            path={ROUTE_PATHS.HOSPITALITY_B2B_REQUEST}
            element={<Layout><HospitalityB2BRequestLanding /></Layout>}
          />
          <Route
            path={`${ROUTE_PATHS.HOSPITALITY_B2B_REQUEST}/`}
            element={<Layout><HospitalityB2BRequestLanding /></Layout>}
          />

          {/* ?????? ?????? ???????? ??????????? ??? ?????? ?????????? ???????????????????????????????????????????????? */}
          <Route
            path="/archive/home"
            element={
              <Layout>
                <Suspense
                  fallback={
                    <div dir="rtl" className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
                      ???? ????????
                    </div>
                  }
                >
                  <ArchiveHome />
                </Suspense>
              </Layout>
            }
          />
          <Route path="/archive/partners" element={<PartnerLayout><LazyRoute><BarberGrowthLanding /></LazyRoute></PartnerLayout>} />

          {/* ?????? ????? ???????????? ??? ?????? ???????? ???????????????????????????????????????????????????????????????????????? */}
          <Route path={ROUTE_PATHS.LANDING_PREVIEW} element={<LazyRoute><LandingPreview /></LazyRoute>} />
          <Route path={ROUTE_PATHS.LANDING_PARTNERS_PREVIEW} element={<LazyRoute><PartnerMarketingPreview /></LazyRoute>} />
          <Route path={ROUTE_PATHS.INTERNAL_PARTNER_PATH_PRINT_CARD} element={<LazyRoute><InternalPartnerPathPrintCard /></LazyRoute>} />
          <Route path={ROUTE_PATHS.INVOICE_PREVIEW_SAMPLES} element={<LazyRoute><InvoicePreviewSamples /></LazyRoute>} />
          <Route path={ROUTE_PATHS.GROWTH_PITCH_DECK} element={<LazyRoute><GrowthPitchDeckPage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.PLATFORM_DISCOVER} element={<LazyRoute><PlatformDiscoverLandingPage /></LazyRoute>} />
          <Route
            path={ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW}
            element={
              <PartnerLayout>
                <LazyRoute><PartnerBannersPreviewLanding /></LazyRoute>
              </PartnerLayout>
            }
          />
          <Route path={ROUTE_PATHS.ABOUT} element={<Layout><LazyRoute><About /></LazyRoute></Layout>} />
          <Route path={ROUTE_PATHS.TERMS_OF_SERVICE} element={<Layout><LazyRoute><TermsOfService /></LazyRoute></Layout>} />
          <Route path={ROUTE_PATHS.USER_PRIVACY_POLICY} element={<Layout><LazyRoute><UserPrivacyPolicy /></LazyRoute></Layout>} />
          <Route path={ROUTE_PATHS.EPHEMERAL_PROCESSING_GOVERNANCE} element={<Layout><LazyRoute><EphemeralProcessingGovernance /></LazyRoute></Layout>} />
          <Route path={ROUTE_PATHS.PRIVACY_DETAILED} element={<Layout><LazyRoute><Privacy /></LazyRoute></Layout>} />
          <Route path={ROUTE_PATHS.PRIVACY} element={<Navigate to={ROUTE_PATHS.PRIVACY_DETAILED} replace />} />

          {/* ????? ????????? ??? ??????? ????????? */}
          <Route path={ROUTE_PATHS.PARTNERS_B2B_LANDING} element={<LazyRoute><PartnersB2BLanding /></LazyRoute>} />
          <Route path={ROUTE_PATHS.BARBERS_LANDING} element={<LazyRoute><PartnerMarketingPreview /></LazyRoute>} />
          <Route
            path={ROUTE_PATHS.PARTNER_INTEREST}
            element={
              <PartnerLayout>
                <LazyRoute><PartnerInterestLanding /></LazyRoute>
              </PartnerLayout>
            }
          />
          <Route path={ROUTE_PATHS.PARTNER_WHY} element={<PartnerLayout><LazyRoute><PartnerWhyPage /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_STORY} element={<PartnerLayout><LazyRoute><PartnerStoryPage /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER} element={<PartnerLayout><LazyRoute><Register /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER_SUCCESS} element={<PartnerLayout><LazyRoute><RegisterSuccess /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.SHOP_OPEN_STATUS} element={<PartnerLayout><LazyRoute><ShopOpenStatus /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.SHOP_OPEN_ROTATE} element={<PartnerLayout><LazyRoute><ShopOpenStatusRotateRequest /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.SHOP_OPEN_ROTATE_CONFIRM} element={<PartnerLayout><LazyRoute><ShopOpenStatusRotateConfirm /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_PRIVACY} element={<PartnerLayout><LazyRoute><PartnerPrivacy /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.SUBSCRIPTION_POLICY} element={<PartnerLayout><LazyRoute><SubscriptionPolicy /></LazyRoute></PartnerLayout>} />
          <Route
            path="/partners/refund-policy"
            element={
              <Navigate to={`${ROUTE_PATHS.SUBSCRIPTION_POLICY}?section=refund-policy`} replace />
            }
          />
          <Route
            path="/partners/pricing"
            element={
              <Navigate to={`${ROUTE_PATHS.SUBSCRIPTION_POLICY}?section=pricing`} replace />
            }
          />
          <Route
            path="/partners/subscription-policy%23refund-policy"
            element={
              <Navigate to={`${ROUTE_PATHS.SUBSCRIPTION_POLICY}?section=refund-policy`} replace />
            }
          />
          <Route
            path="/partners/subscription-policy%23pricing"
            element={
              <Navigate to={`${ROUTE_PATHS.SUBSCRIPTION_POLICY}?section=pricing`} replace />
            }
          />
          <Route path="/partners/hospitality-b2b-request" element={<Navigate to={ROUTE_PATHS.HOSPITALITY_B2B_REQUEST} replace />} />
          <Route path="/partners/hospitality-qr-request" element={<Navigate to={ROUTE_PATHS.HOSPITALITY_B2B_REQUEST} replace />} />
          <Route path="/hospitality-request" element={<Navigate to={ROUTE_PATHS.HOSPITALITY_B2B_REQUEST} replace />} />
          <Route path={ROUTE_PATHS.BARBER_LOGIN} element={<LazyRoute><BarberLogin /></LazyRoute>} />
          <Route path={ROUTE_PATHS.BARBER_PORTAL_ENTER} element={<PartnerLayout><LazyRoute><BarberPortalEnter /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PAYMENT} element={<PartnerLayout><LazyRoute><Payment /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_TUTORIALS} element={<PartnerLayout><LazyRoute><PartnerSubscriptionTutorials /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.MAP_COMMUNITY} element={<PartnerLayout><LazyRoute><MapCommunity /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_SUPPORT} element={<PartnerLayout><LazyRoute><PartnerSupportChat /></LazyRoute></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_SALES_OFFICE} element={<LazyRoute><PartnerSalesOfficePage /></LazyRoute>} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.BARBERS_LANDING} element={<LegacyPartnerRedirect to={ROUTE_PATHS.BARBERS_LANDING} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.REGISTER} element={<LegacyPartnerRedirect to={ROUTE_PATHS.REGISTER} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.REGISTER_SUCCESS} element={<LegacyPartnerRedirect to={ROUTE_PATHS.REGISTER_SUCCESS} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.SUBSCRIPTION_POLICY} element={<LegacyPartnerRedirect to={ROUTE_PATHS.SUBSCRIPTION_POLICY} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.BARBER_LOGIN} element={<LegacyPartnerRedirect to={ROUTE_PATHS.BARBER_LOGIN} />} />
          <Route path={LEGACY_PARTNER_ROUTE_PATHS.PAYMENT} element={<LegacyPartnerRedirect to={ROUTE_PATHS.PAYMENT} />} />

          <Route path={ROUTE_PATHS.BARBER_DASHBOARD} element={<LazyRoute><BarberDashboard /></LazyRoute>} />
          <Route
            path={ROUTE_PATHS.BARBER_ACCOUNT_DELETE_REQUEST}
            element={
              <PartnerLayout>
                <LazyRoute><BarberAccountDeletionRequest /></LazyRoute>
              </PartnerLayout>
            }
          />
          {getAdminPortalBasePaths().map((adminBase) => (
            <Fragment key={adminBase}>
              <Route path={`${adminBase}/in`} element={<LazyRoute><AdminLogin /></LazyRoute>} />
              <Route path={`${adminBase}/ctrl`} element={<LazyRoute><AdminDashboard /></LazyRoute>} />
              <Route
                path={`${adminBase}/sentinel`}
                element={
                  <AdminSentinelSecurityGate>
                    <LazyRoute><AdminSentinelPage /></LazyRoute>
                  </AdminSentinelSecurityGate>
                }
              />
              <Route path={`${adminBase}/radar/full-screen`} element={<LazyRoute><AdminRadarFullScreenPage /></LazyRoute>} />
              <Route path={`${adminBase}/cyber`} element={<LazyRoute><AdminCyberOperationsPage /></LazyRoute>} />
              <Route path={`${adminBase}/staff-hub`} element={<LazyRoute><StaffHubPage /></LazyRoute>} />
            </Fragment>
          ))}
          {/* Safety net for legacy invitation links built before VITE_ADMIN_PORTAL_BASE alignment. */}
          <Route path="/admin/in" element={<LegacyAdminRedirect suffix="/in" />} />
          <Route path="/admin/ctrl" element={<LegacyAdminRedirect suffix="/ctrl" />} />
          <Route path="/admin/sentinel" element={<LegacyAdminRedirect suffix="/sentinel" />} />
          <Route path="/admin/radar/full-screen" element={<LegacyAdminRedirect suffix="/radar/full-screen" />} />
          <Route path="/admin/cyber" element={<LegacyAdminRedirect suffix="/cyber" />} />
          <Route path="/admin/staff-hub" element={<LegacyAdminRedirect suffix="/staff-hub" />} />
          <Route path="/admin" element={<LegacyAdminRedirect suffix="/in" />} />
          <Route path={ROUTE_PATHS.RATE_BARBER} element={<LazyRoute><RateBarber /></LazyRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AdminAuthHashGate>
        </RouteScopedErrorBoundary>
      </HashRouter>
    </TooltipProvider>
    </PlatformAmbientProvider>
  </QueryClientProvider>
);

export default App;