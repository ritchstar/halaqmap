/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Fragment, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { PlatformAmbientProvider } from "@/context/PlatformAmbientContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AnalyticsRouteTracker } from "@/components/AnalyticsRouteTracker";
import { PolicySectionHashRedirect } from "@/components/PolicySectionHashRedirect";
import { MoyasarPaymentReturnGate } from "@/components/MoyasarPaymentReturnGate";
import { RouteScopedErrorBoundary } from "@/components/RouteScopedErrorBoundary";
import { LEGACY_PARTNER_ROUTE_PATHS, ROUTE_PATHS } from "@/lib/routePaths";
import { getAdminPortalBasePath, getAdminPortalBasePaths } from "@/config/adminAuth";
import { PUBLIC_PULSE_EXPERIENCE_ENABLED } from '@/config/publicPulseExperience';
import { AdminAuthHashGate, AdminSentinelSecurityGate } from "@/components/AdminAuthHashGate";

/** لا تُحمَّل مع الرئيسية — Layout/PartnerLayout لصفحات المحتوى/الشركاء فقط */
const Layout = lazy(() =>
  import("@/components/Layout").then((m) => ({ default: m.Layout })),
);
const PartnerLayout = lazy(() =>
  import("@/components/PartnerLayout").then((m) => ({ default: m.PartnerLayout })),
);

const LandingPreview = lazy(async () => {
  const mod = await import("@/pages/LandingPreview");
  const C = mod.default;
  if (typeof C !== "function") {
    throw new Error("LandingPreview failed to load");
  }
  return { default: C };
});
const HospitalityB2BRequestLanding = lazy(() => import("@/pages/HospitalityB2BRequestLanding"));
const PartnerMarketingPreview = lazy(() => import("@/pages/PartnerMarketingPreview"));
const PartnersB2BLanding = lazy(() => import("@/pages/PartnersB2BLanding"));
const PulseMapPage = lazy(() => import("@/pages/PulseMapPage"));
const AdminRadarFullScreenPage = lazy(() => import("@/app/admin/radar/full-screen/page"));
const AdminCyberOperationsPage = lazy(() => import("@/app/admin/cyber/page"));
const StaffHubPage = lazy(() => import("@/app/admin/staff-hub/page"));
const AdminDashboard = lazy(async () => {
  const mod = await import("@/pages/AdminDashboard");
  const C = mod.default;
  if (typeof C !== "function") {
    throw new Error("AdminDashboard failed to load");
  }
  return { default: C };
});
const BarberDashboard = lazy(async () => {
  const mod = await import("@/pages/BarberDashboard");
  const C = mod.default;
  if (typeof C !== "function") {
    throw new Error("BarberDashboard failed to load");
  }
  return { default: C };
});
const SaudiAgentLanding = lazy(() => import("@/pages/SaudiAgentLanding"));
const About = lazy(() => import("@/pages/About"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const UserPrivacyPolicy = lazy(() => import("@/pages/UserPrivacyPolicy"));
const EphemeralProcessingGovernance = lazy(() => import("@/pages/EphemeralProcessingGovernance"));
const PlatformReviews = lazy(() => import("@/pages/PlatformReviews"));
const Register = lazy(() => import("@/pages/Register"));
const PartnerRegistrationGuide = lazy(() => import("@/pages/PartnerRegistrationGuide"));
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
const BronzeTrialApplyLanding = lazy(() => import("@/pages/BronzeTrialApplyLanding"));
const BronzeTrialConfirmLanding = lazy(() => import("@/pages/BronzeTrialConfirmLanding"));
const PartnerWhyPage = lazy(() => import("@/pages/PartnerWhyPage"));
const PartnerStoryPage = lazy(() => import("@/pages/PartnerStoryPage"));
const BarberPortalEnter = lazy(() => import("@/pages/BarberPortalEnter"));
const BarberLogin = lazy(() => import("@/pages/BarberLogin"));
const PartnerAppInstall = lazy(() => import("@/pages/PartnerAppInstall"));
const BarberAccountDeletionRequest = lazy(() => import("@/pages/BarberAccountDeletionRequest"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const Payment = lazy(() => import("@/pages/Payment"));
const PartnerSubscriptionTutorials = lazy(() => import("@/pages/PartnerSubscriptionTutorials"));
const MapCommunity = lazy(() => import("@/pages/MapCommunity"));
const PartnerBannersPreviewLanding = lazy(() => import("@/pages/PartnerBannersPreviewLanding"));
const RateBarber = lazy(() => import("@/pages/RateBarber"));
const BookBarber = lazy(() => import("@/pages/BookBarber"));
const AdminSentinelPage = lazy(() => import("@/pages/AdminSentinelPage"));
const CosmicShowcase = lazy(() => import("@/pages/CosmicShowcase"));
const DigitalShiftFeaturePage = lazy(() => import("@/pages/DigitalShiftFeaturePage"));
const PrivateOfficeGuide = lazy(() => import("@/pages/PrivateOfficeGuide"));
const SematLegalHub = lazy(() => import("@/pages/semat/SematLegalHub"));
const SematCardSetup = lazy(() => import("@/pages/semat/SematCardSetup"));
const SematScanPage = lazy(() => import("@/pages/semat/SematScanPage"));
const AmbassadorRulesHub = lazy(() => import("@/pages/ambassador/AmbassadorRulesHub"));
const AmbassadorEnter = lazy(() => import("@/pages/ambassador/AmbassadorEnter"));
const AmbassadorDashboard = lazy(() => import("@/pages/ambassador/AmbassadorDashboard"));
const AmbassadorTrainingDeck = lazy(() => import("@/pages/ambassador/AmbassadorTrainingDeck"));

const queryClient = new QueryClient();

const RouteBusy = () => (
  <div dir="rtl" className="flex min-h-[48vh] items-center justify-center text-sm text-muted-foreground">
    جاري التحميل…
  </div>
);

function LazyRoute({ children, fallback = <RouteBusy /> }: { children: ReactNode; fallback?: ReactNode }) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

function WithPublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<RouteBusy />}>
      <Layout>{children}</Layout>
    </Suspense>
  );
}

function WithPartnerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<RouteBusy />}>
      <PartnerLayout>{children}</PartnerLayout>
    </Suspense>
  );
}

/** رؤى Vercel بعد idle حتى لا تتنافس مع أول رسم للرئيسية */
function DeferredVercelInsights() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(enable, { timeout: 5000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(enable, 2800);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <LazyVercelInsights />
    </Suspense>
  );
}

const LazyVercelInsights = lazy(async () => {
  const [{ Analytics }, { SpeedInsights }] = await Promise.all([
    import('@vercel/analytics/react'),
    import('@vercel/speed-insights/react'),
  ]);
  return {
    default: function VercelInsightsMount() {
      return (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      );
    },
  };
});

const NotFound = () => (
  <WithPublicLayout>
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground">الرابط الذي فتحته غير متاح أو لم يُنشر بعد على المنصة.</p>
        <Link
          to={ROUTE_PATHS.HOME}
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  </WithPublicLayout>
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

export function App() {
  return (
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
        <AnalyticsRouteTracker />
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
            element={<WithPublicLayout><LazyRoute><HospitalityB2BRequestLanding /></LazyRoute></WithPublicLayout>}
          />
          <Route
            path={`${ROUTE_PATHS.HOSPITALITY_B2B_REQUEST}/`}
            element={<WithPublicLayout><LazyRoute><HospitalityB2BRequestLanding /></LazyRoute></WithPublicLayout>}
          />

          {/* ?????? ?????? ???????? ??????????? ??? ?????? ?????????? ???????????????????????????????????????????????? */}
          <Route
            path="/archive/home"
            element={
              <WithPublicLayout>
                <Suspense
                  fallback={
                    <div dir="rtl" className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
                      ???? ????????
                    </div>
                  }
                >
                  <ArchiveHome />
                </Suspense>
              </WithPublicLayout>
            }
          />
          <Route path="/archive/partners" element={<WithPartnerLayout><LazyRoute><BarberGrowthLanding /></LazyRoute></WithPartnerLayout>} />

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
              <WithPartnerLayout>
                <LazyRoute><PartnerBannersPreviewLanding /></LazyRoute>
              </WithPartnerLayout>
            }
          />
          <Route path={ROUTE_PATHS.ABOUT} element={<WithPublicLayout><LazyRoute><About /></LazyRoute></WithPublicLayout>} />
          <Route path={ROUTE_PATHS.TERMS_OF_SERVICE} element={<WithPublicLayout><LazyRoute><TermsOfService /></LazyRoute></WithPublicLayout>} />
          <Route path={ROUTE_PATHS.USER_PRIVACY_POLICY} element={<WithPublicLayout><LazyRoute><UserPrivacyPolicy /></LazyRoute></WithPublicLayout>} />
          <Route path={ROUTE_PATHS.EPHEMERAL_PROCESSING_GOVERNANCE} element={<WithPublicLayout><LazyRoute><EphemeralProcessingGovernance /></LazyRoute></WithPublicLayout>} />
          <Route path={ROUTE_PATHS.PRIVACY_DETAILED} element={<WithPublicLayout><LazyRoute><Privacy /></LazyRoute></WithPublicLayout>} />
          <Route path={ROUTE_PATHS.PRIVACY} element={<Navigate to={ROUTE_PATHS.PRIVACY_DETAILED} replace />} />

          {/* ????? ????????? ??? ??????? ????????? */}
          <Route path={ROUTE_PATHS.PARTNERS_B2B_LANDING} element={<LazyRoute><PartnersB2BLanding /></LazyRoute>} />
          <Route path={ROUTE_PATHS.BARBERS_LANDING} element={<LazyRoute><PartnerMarketingPreview /></LazyRoute>} />
          <Route
            path={ROUTE_PATHS.PARTNER_INTEREST}
            element={
              <WithPartnerLayout>
                <LazyRoute><PartnerInterestLanding /></LazyRoute>
              </WithPartnerLayout>
            }
          />
          <Route
            path={ROUTE_PATHS.BRONZE_TRIAL_APPLY}
            element={
              <WithPartnerLayout>
                <LazyRoute><BronzeTrialApplyLanding /></LazyRoute>
              </WithPartnerLayout>
            }
          />
          <Route
            path={ROUTE_PATHS.BRONZE_TRIAL_CONFIRM}
            element={
              <WithPartnerLayout>
                <LazyRoute><BronzeTrialConfirmLanding /></LazyRoute>
              </WithPartnerLayout>
            }
          />
          <Route path={ROUTE_PATHS.PARTNER_WHY} element={<WithPartnerLayout><LazyRoute><PartnerWhyPage /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_STORY} element={<WithPartnerLayout><LazyRoute><PartnerStoryPage /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER} element={<WithPartnerLayout><LazyRoute><Register /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER_GUIDE} element={<WithPartnerLayout><LazyRoute><PartnerRegistrationGuide /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER_SUCCESS} element={<WithPartnerLayout><LazyRoute><RegisterSuccess /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.SHOP_OPEN_STATUS} element={<WithPartnerLayout><LazyRoute><ShopOpenStatus /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.SHOP_OPEN_ROTATE} element={<WithPartnerLayout><LazyRoute><ShopOpenStatusRotateRequest /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.SHOP_OPEN_ROTATE_CONFIRM} element={<WithPartnerLayout><LazyRoute><ShopOpenStatusRotateConfirm /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_PRIVACY} element={<WithPartnerLayout><LazyRoute><PartnerPrivacy /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.SUBSCRIPTION_POLICY} element={<WithPartnerLayout><LazyRoute><SubscriptionPolicy /></LazyRoute></WithPartnerLayout>} />
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
          <Route path={ROUTE_PATHS.PARTNER_APP} element={<LazyRoute><PartnerAppInstall /></LazyRoute>} />
          <Route path={ROUTE_PATHS.BARBER_PORTAL_ENTER} element={<LazyRoute><BarberPortalEnter /></LazyRoute>} />
          <Route path={ROUTE_PATHS.PAYMENT} element={<WithPartnerLayout><LazyRoute><Payment /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_TUTORIALS} element={<WithPartnerLayout><LazyRoute><PartnerSubscriptionTutorials /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.MAP_COMMUNITY} element={<WithPartnerLayout><LazyRoute><MapCommunity /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_SUPPORT} element={<WithPartnerLayout><LazyRoute><PartnerSupportChat /></LazyRoute></WithPartnerLayout>} />
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
              <WithPartnerLayout>
                <LazyRoute><BarberAccountDeletionRequest /></LazyRoute>
              </WithPartnerLayout>
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
          <Route path={ROUTE_PATHS.BOOK_BARBER} element={<LazyRoute><BookBarber /></LazyRoute>} />
          <Route path={ROUTE_PATHS.SEMAT_LEGAL} element={<LazyRoute><SematLegalHub /></LazyRoute>} />
          <Route path={ROUTE_PATHS.SEMAT_SETUP} element={<LazyRoute><SematCardSetup /></LazyRoute>} />
          <Route path={ROUTE_PATHS.SEMAT_SCAN} element={<LazyRoute><SematScanPage /></LazyRoute>} />
          <Route
            path={ROUTE_PATHS.AMBASSADOR_HOME}
            element={<Navigate to={ROUTE_PATHS.AMBASSADOR_ENTER} replace />}
          />
          <Route
            path={`${ROUTE_PATHS.AMBASSADOR_HOME}/`}
            element={<Navigate to={ROUTE_PATHS.AMBASSADOR_ENTER} replace />}
          />
          <Route path={ROUTE_PATHS.AMBASSADOR_RULES} element={<LazyRoute><AmbassadorRulesHub /></LazyRoute>} />
          <Route path={ROUTE_PATHS.AMBASSADOR_ENTER} element={<LazyRoute><AmbassadorEnter /></LazyRoute>} />
          <Route path={ROUTE_PATHS.AMBASSADOR_DASHBOARD} element={<LazyRoute><AmbassadorDashboard /></LazyRoute>} />
          <Route path={ROUTE_PATHS.AMBASSADOR_TRAINING} element={<LazyRoute><AmbassadorTrainingDeck /></LazyRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AdminAuthHashGate>
        </RouteScopedErrorBoundary>
      </HashRouter>
      <DeferredVercelInsights />
    </TooltipProvider>
    </PlatformAmbientProvider>
    </QueryClientProvider>
  );
}

export default App;