/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Fragment, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { lazyPage } from "@/lib/resolveLazyPage";
import { HashRouter, Routes, Route, Navigate, useLocation, useParams, Link } from "react-router-dom";
import { PlatformAmbientProvider } from "@/context/PlatformAmbientContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AnalyticsRouteTracker } from "@/components/AnalyticsRouteTracker";
import { PolicySectionHashRedirect } from "@/components/PolicySectionHashRedirect";
import { MoyasarPaymentReturnGate } from "@/components/MoyasarPaymentReturnGate";
import { ConsumerNativeShellGate } from "@/components/consumer/ConsumerNativeShellGate";
import { RouteScopedErrorBoundary } from "@/components/RouteScopedErrorBoundary";
import { LEGACY_PARTNER_ROUTE_PATHS, ROUTE_PATHS } from "@/lib/routePaths";
import { resolveMensHostCoiffeurRedirect } from "@/lib/coiffeurHostRedirect";
import {
  isHalaqmapStoreHost,
  isStoreHostPaymentPath,
  resolveMensHostStoreRedirect,
} from "@/lib/storeHostRedirect";
import { readHashQueryParam } from "@/lib/hashQueryParams";
import { buildMapContactPartnerInterestPath } from "@/config/mapContactCardCopy";
import { getAdminLoginPath, getAdminPortalBasePath, getAdminPortalBasePaths } from "@/config/adminAuth";
import { PUBLIC_PULSE_EXPERIENCE_ENABLED } from '@/config/publicPulseExperience';
import { AdminAuthHashGate, AdminSentinelSecurityGate } from "@/components/AdminAuthHashGate";

/** حرفي احتياطي — حزمة `route-paths` منفصلة؛ مفتاح جديد + كاش قديم = path undefined ويُسقط التوجيه. */
const FOUNDER_DESK_LANDING_PATH =
  (ROUTE_PATHS as { FOUNDER_DESK_LANDING?: string }).FOUNDER_DESK_LANDING || "/m/hm-desk-k7q3";
const FOUNDER_DESK_VISITOR_CHAT_PATH =
  (ROUTE_PATHS as { FOUNDER_DESK_VISITOR_CHAT?: string }).FOUNDER_DESK_VISITOR_CHAT || "/partners/live-chat";
const GEO_NEAR_HUB_PATH =
  (ROUTE_PATHS as { GEO_NEAR_HUB?: string }).GEO_NEAR_HUB || "/near";
const STORE_LANDING_PATH =
  (ROUTE_PATHS as { STORE_LANDING?: string }).STORE_LANDING || "/store";
const STORE_REQUEST_PATH =
  (ROUTE_PATHS as { STORE_REQUEST?: string }).STORE_REQUEST || "/store/request";
const STORE_CARDS_PATH =
  (ROUTE_PATHS as { STORE_CARDS?: string }).STORE_CARDS || "/store/cards";
const STORE_INTRO_CARDS_PATH =
  (ROUTE_PATHS as { STORE_INTRO_CARDS?: string }).STORE_INTRO_CARDS || "/store/id-cards";
const STORE_INTRO_CARD_VIEW_PATH =
  (ROUTE_PATHS as { STORE_INTRO_CARD_VIEW?: string }).STORE_INTRO_CARD_VIEW || "/store/id-card";
const STORE_MEET_QR_PATH =
  (ROUTE_PATHS as { STORE_MEET_QR?: string }).STORE_MEET_QR || "/store/qr";
const STORE_ABOUT_PATH =
  (ROUTE_PATHS as { STORE_ABOUT?: string }).STORE_ABOUT || "/store/about";
const STORE_TRUST_PATH =
  (ROUTE_PATHS as { STORE_TRUST?: string }).STORE_TRUST || "/store/trust";
const STORE_ISSUED_CARDS_LEGAL_PATH =
  (ROUTE_PATHS as { STORE_ISSUED_CARDS_LEGAL?: string }).STORE_ISSUED_CARDS_LEGAL || "/store/cards/legal";
const STORE_INVITES_PATH =
  (ROUTE_PATHS as { STORE_INVITES?: string }).STORE_INVITES || "/store/invites";
const STORE_INVITES_VIEW_PATH =
  (ROUTE_PATHS as { STORE_INVITES_VIEW?: string }).STORE_INVITES_VIEW || "/store/invites/v/:token";
const STORE_OCCASION_CARD_PAY_PATH =
  (ROUTE_PATHS as { STORE_OCCASION_CARD_PAY?: string }).STORE_OCCASION_CARD_PAY || "/pay/occasion-card/:token";
const STORE_INVITES_LAB_PATH =
  (ROUTE_PATHS as { STORE_INVITES_LAB?: string }).STORE_INVITES_LAB || "/store/invites/lab";
const STORE_WEDDING_PATH =
  (ROUTE_PATHS as { STORE_WEDDING?: string }).STORE_WEDDING || "/store/wedding";
const STORE_WEDDING_WOMEN_PATH =
  (ROUTE_PATHS as { STORE_WEDDING_WOMEN?: string }).STORE_WEDDING_WOMEN || "/store/wedding/women";
const STORE_WEDDING_LAB_PATH =
  (ROUTE_PATHS as { STORE_WEDDING_LAB?: string }).STORE_WEDDING_LAB || "/store/wedding/lab";
const STORE_WEDDING_VIEW_PATH =
  (ROUTE_PATHS as { STORE_WEDDING_VIEW?: string }).STORE_WEDDING_VIEW || "/w/:token";
const STORE_WEDDING_GUEST_PATH =
  (ROUTE_PATHS as { STORE_WEDDING_GUEST?: string }).STORE_WEDDING_GUEST || "/w/:token/guest";
const STORE_WEDDING_HOST_PATH =
  (ROUTE_PATHS as { STORE_WEDDING_HOST?: string }).STORE_WEDDING_HOST || "/w/:token/host";
const STORE_WEDDING_PAY_PATH =
  (ROUTE_PATHS as { STORE_WEDDING_PAY?: string }).STORE_WEDDING_PAY || "/pay/wedding/:token";
const STORE_EVENT_PATH =
  (ROUTE_PATHS as { STORE_EVENT?: string }).STORE_EVENT || "/store/event";
const STORE_EVENT_MEN_PATH =
  (ROUTE_PATHS as { STORE_EVENT_MEN?: string }).STORE_EVENT_MEN || "/store/event/men";
const STORE_EVENT_WOMEN_PATH =
  (ROUTE_PATHS as { STORE_EVENT_WOMEN?: string }).STORE_EVENT_WOMEN || "/store/event/women";
const STORE_EVENT_VIEW_PATH =
  (ROUTE_PATHS as { STORE_EVENT_VIEW?: string }).STORE_EVENT_VIEW || "/e/:token";
const STORE_EVENT_GUEST_PATH =
  (ROUTE_PATHS as { STORE_EVENT_GUEST?: string }).STORE_EVENT_GUEST || "/e/:token/guest";
const STORE_EVENT_HOST_PATH =
  (ROUTE_PATHS as { STORE_EVENT_HOST?: string }).STORE_EVENT_HOST || "/e/:token/host";
const STORE_EVENT_PAY_PATH =
  (ROUTE_PATHS as { STORE_EVENT_PAY?: string }).STORE_EVENT_PAY || "/pay/event/:token";
const STORE_LOUNGE_PATH =
  (ROUTE_PATHS as { STORE_LOUNGE?: string }).STORE_LOUNGE || "/store/lounge";
const STORE_LOUNGE_VIEW_PATH =
  (ROUTE_PATHS as { STORE_LOUNGE_VIEW?: string }).STORE_LOUNGE_VIEW || "/l/:token";
const STORE_LOUNGE_GUEST_PATH =
  (ROUTE_PATHS as { STORE_LOUNGE_GUEST?: string }).STORE_LOUNGE_GUEST || "/l/:token/guest";
const STORE_LOUNGE_HOST_PATH =
  (ROUTE_PATHS as { STORE_LOUNGE_HOST?: string }).STORE_LOUNGE_HOST || "/l/:token/host";
const STORE_LOUNGE_PAY_PATH =
  (ROUTE_PATHS as { STORE_LOUNGE_PAY?: string }).STORE_LOUNGE_PAY || "/pay/lounge/:token";
const STORE_GROCERS_PATH =
  (ROUTE_PATHS as { STORE_GROCERS?: string }).STORE_GROCERS || "/store/grocers";
const STORE_GROCERS_VIEW_PATH =
  (ROUTE_PATHS as { STORE_GROCERS_VIEW?: string }).STORE_GROCERS_VIEW || "/g/:token";
const STORE_GROCERS_DESK_PATH =
  (ROUTE_PATHS as { STORE_GROCERS_DESK?: string }).STORE_GROCERS_DESK || "/g/:token/desk";
const STORE_GROCERS_PAY_PATH =
  (ROUTE_PATHS as { STORE_GROCERS_PAY?: string }).STORE_GROCERS_PAY || "/pay/grocers/:token";
const STORE_RESTAURANT_PATH =
  (ROUTE_PATHS as { STORE_RESTAURANT?: string }).STORE_RESTAURANT || "/store/restaurant";
const STORE_RESTAURANT_VIEW_PATH =
  (ROUTE_PATHS as { STORE_RESTAURANT_VIEW?: string }).STORE_RESTAURANT_VIEW || "/r/:token";
const STORE_RESTAURANT_DESK_PATH =
  (ROUTE_PATHS as { STORE_RESTAURANT_DESK?: string }).STORE_RESTAURANT_DESK || "/r/:token/desk";
const STORE_RESTAURANT_PAY_PATH =
  (ROUTE_PATHS as { STORE_RESTAURANT_PAY?: string }).STORE_RESTAURANT_PAY || "/pay/restaurant/:token";
const STORE_CAFE_PATH =
  (ROUTE_PATHS as { STORE_CAFE?: string }).STORE_CAFE || "/store/cafe";
const STORE_CAFE_VIEW_PATH =
  (ROUTE_PATHS as { STORE_CAFE_VIEW?: string }).STORE_CAFE_VIEW || "/c/:token";
const STORE_CAFE_DESK_PATH =
  (ROUTE_PATHS as { STORE_CAFE_DESK?: string }).STORE_CAFE_DESK || "/c/:token/desk";
const STORE_CAFE_HOST_PATH =
  (ROUTE_PATHS as { STORE_CAFE_HOST?: string }).STORE_CAFE_HOST || "/c/:token/host";
const STORE_CAFE_GUEST_PATH =
  (ROUTE_PATHS as { STORE_CAFE_GUEST?: string }).STORE_CAFE_GUEST || "/c/:token/guest";
const STORE_CAFE_QUIET_PATH =
  (ROUTE_PATHS as { STORE_CAFE_QUIET?: string }).STORE_CAFE_QUIET || "/c/:token/quiet";
const STORE_CAFE_MENU_PATH =
  (ROUTE_PATHS as { STORE_CAFE_MENU?: string }).STORE_CAFE_MENU || "/c/:token/menu";
const STORE_CAFE_PAY_PATH =
  (ROUTE_PATHS as { STORE_CAFE_PAY?: string }).STORE_CAFE_PAY || "/pay/cafe/:token";
const STORE_AFFILIATES_PATH =
  (ROUTE_PATHS as { STORE_AFFILIATES?: string }).STORE_AFFILIATES || "/store/affiliates";
const STORE_AFFILIATES_ENTER_PATH =
  (ROUTE_PATHS as { STORE_AFFILIATES_ENTER?: string }).STORE_AFFILIATES_ENTER || "/store/affiliates/enter";
const STORE_AFFILIATES_DESK_PATH =
  (ROUTE_PATHS as { STORE_AFFILIATES_DESK?: string }).STORE_AFFILIATES_DESK || "/store/affiliates/desk";
const STORE_AFFILIATES_RULES_PATH =
  (ROUTE_PATHS as { STORE_AFFILIATES_RULES?: string }).STORE_AFFILIATES_RULES || "/store/affiliates/rules";
const STORE_OPS_PATH =
  (ROUTE_PATHS as { STORE_OPS?: string }).STORE_OPS || "/store/ops";
const ADMIN_STORE_OPS_PATH =
  (ROUTE_PATHS as { ADMIN_STORE_OPS?: string }).ADMIN_STORE_OPS || "/store-ops";
const STORE_BEREAVEMENT_PATH =
  (ROUTE_PATHS as { STORE_BEREAVEMENT?: string }).STORE_BEREAVEMENT || "/store/bereavement";
const STORE_BEREAVEMENT_CREATE_PATH =
  (ROUTE_PATHS as { STORE_BEREAVEMENT_CREATE?: string }).STORE_BEREAVEMENT_CREATE || "/store/bereavement/create";
const STORE_BEREAVEMENT_VIEW_PATH =
  (ROUTE_PATHS as { STORE_BEREAVEMENT_VIEW?: string }).STORE_BEREAVEMENT_VIEW || "/n/:token";
const STORE_BEREAVEMENT_MANAGE_PATH =
  (ROUTE_PATHS as { STORE_BEREAVEMENT_MANAGE?: string }).STORE_BEREAVEMENT_MANAGE || "/n/:token/manage";

/** اختصار /i و /i/:city → مسار اهتمام الشركاء من بطاقة تواصل ماب */
function MapContactShortJoinRedirect() {
  const { cityId } = useParams<{ cityId?: string }>();
  return <Navigate to={buildMapContactPartnerInterestPath(cityId)} replace />;
}

/** لا تُحمَّل مع الرئيسية — Layout/PartnerLayout لصفحات المحتوى/الشركاء فقط */
const Layout = lazy(() =>
  import("@/components/Layout").then((m) => ({ default: m.Layout })),
);
const PartnerLayout = lazy(() =>
  import("@/components/PartnerLayout").then((m) => ({ default: m.PartnerLayout })),
);

const LandingPreview = lazyPage(() => import("@/pages/LandingPreview"), "LandingPreview");
const HospitalityB2BRequestLanding = lazy(() => import("@/pages/HospitalityB2BRequestLanding"));
const PartnerMarketingPreview = lazyPage(
  () => import("@/pages/PartnerMarketingPreview"),
  "PartnerMarketingPreview",
);
const PartnersB2BLanding = lazy(() => import("@/pages/PartnersB2BLanding"));
const PulseMapPage = lazy(() => import("@/pages/PulseMapPage"));
const AdminRadarFullScreenPage = lazy(() => import("@/app/admin/radar/full-screen/page"));
const AdminCyberOperationsPage = lazy(() => import("@/app/admin/cyber/page"));
const StaffHubPage = lazy(() => import("@/app/admin/staff-hub/page"));
const CoiffeurHubPage = lazy(() => import("@/app/admin/coiffeur-hub/page"));
const StoreDeskPage = lazy(() => import("@/app/admin/store-desk/page"));
const StoreSalesHubPage = lazy(() => import("@/app/admin/store-sales/page"));
const StoreSalesLedgerPage = lazy(() => import("@/app/admin/store-sales/[product]/page"));
const FazaaListingAdminPage = lazy(() => import("@/app/admin/fazaa-listing/page"));
const FazaaListingConsentLanding = lazy(() => import("@/pages/FazaaListingConsentLanding"));
const AdminDashboard = lazyPage(() => import("@/pages/AdminDashboard"), "AdminDashboard");
const BarberDashboard = lazyPage(() => import("@/pages/BarberDashboard"), "BarberDashboard");
const SaudiAgentLanding = lazy(() => import("@/pages/SaudiAgentLanding"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const EphemeralProcessingGovernance = lazy(() => import("@/pages/EphemeralProcessingGovernance"));
const PlatformReviews = lazy(() => import("@/pages/PlatformReviews"));
const Register = lazy(() => import("@/pages/Register"));
const PartnerRegistrationGuide = lazy(() => import("@/pages/PartnerRegistrationGuide"));
const PartnerPrivacy = lazy(() => import("@/pages/PartnerPrivacy"));
const SubscriptionPolicy = lazy(() => import("@/pages/SubscriptionPolicy"));
const PartnerSupportChat = lazy(() => import("@/pages/PartnerSupportChat"));
const PartnerSalesOfficePage = lazy(() => import("@/pages/PartnerSalesOfficePage"));
const MerchantSettlementLanding = lazy(() => import("@/pages/MerchantSettlementLanding"));
const HajjNusukLanding = lazy(() => import("@/pages/HajjNusukLanding"));
const StaticSeoRedirect = lazy(() =>
  import("@/components/StaticSeoRedirect").then((m) => ({ default: m.StaticSeoRedirect })),
);

const ArchiveHome = lazy(() => import("@/pages/Home"));
const RegisterSuccess = lazy(() => import("@/pages/RegisterSuccess"));
const ShopOpenStatus = lazy(() => import("@/pages/ShopOpenStatus"));
const ShopOpenStatusRotateRequest = lazy(() => import("@/pages/ShopOpenStatusRotateRequest"));
const ShopOpenStatusRotateConfirm = lazy(() => import("@/pages/ShopOpenStatusRotateConfirm"));
const BarberGrowthLanding = lazy(() => import("@/pages/BarberGrowthLanding"));
const InternalPartnerPathPrintCard = lazy(() => import("@/pages/InternalPartnerPathPrintCard"));
const FounderDeskLandingPage = lazy(() => import("@/pages/FounderDeskLandingPage"));
const FounderDeskVisitorChatPage = lazy(() => import("@/pages/FounderDeskVisitorChatPage"));
const InvoicePreviewSamples = lazy(() => import("@/pages/InvoicePreviewSamples"));
const GrowthPitchDeckPage = lazy(() => import("@/pages/GrowthPitchDeckPage"));
const PlatformDiscoverLandingPage = lazy(() => import("@/pages/PlatformDiscoverLandingPage"));
const PartnerInterestLanding = lazy(() => import("@/pages/PartnerInterestLanding"));
const CoverageSalonNominatePage = lazy(() => import("@/pages/CoverageSalonNominatePage"));
const MapContactCardPage = lazy(() => import("@/pages/MapContactCardPage"));
const BronzeTrialApplyLanding = lazy(() => import("@/pages/BronzeTrialApplyLanding"));
const BronzeTrialConfirmLanding = lazy(() => import("@/pages/BronzeTrialConfirmLanding"));
const PartnerWhyPage = lazy(() => import("@/pages/PartnerWhyPage"));
const PartnerMarketingCommitmentsPage = lazy(() => import("@/pages/PartnerMarketingCommitmentsPage"));
const CoiffeurLanding = lazy(() => import("@/pages/coiffeur/CoiffeurLanding"));
const CoiffeurInquiryPage = lazy(() => import("@/pages/coiffeur/CoiffeurInquiryPage"));
const CoiffeurPartnersLanding = lazy(() => import("@/pages/coiffeur/CoiffeurPartnersLanding"));
const CoiffeurMarketingPage = lazy(() => import("@/pages/coiffeur/CoiffeurMarketingPage"));
const CoiffeurAmbassadorEnter = lazy(() => import("@/pages/coiffeur/CoiffeurAmbassadorEnter"));
const CoiffeurAmbassadorRulesPage = lazy(() => import("@/pages/coiffeur/CoiffeurAmbassadorRulesPage"));
const CoiffeurInterestLanding = lazy(() => import("@/pages/coiffeur/CoiffeurInterestLanding"));
const CoiffeurCardStudioPage = lazy(() => import("@/pages/coiffeur/CoiffeurCardStudioPage"));
const CoiffeurCardViewPage = lazy(() => import("@/pages/coiffeur/CoiffeurCardViewPage"));
const StoreLanding = lazy(() => import("@/pages/store/StoreLanding"));
const StoreRequestPage = lazy(() => import("@/pages/store/StoreRequestPage"));
const StoreCardStudioPage = lazy(() => import("@/pages/store/StoreCardStudioPage"));
const StoreIntroCardStudioPage = lazy(() => import("@/pages/store/StoreIntroCardStudioPage"));
const StoreIntroCardViewPage = lazy(() => import("@/pages/store/StoreIntroCardViewPage"));
const StoreMeetQrPage = lazy(() => import("@/pages/store/StoreMeetQrPage"));
const StoreAboutPage = lazy(() => import("@/pages/store/StoreAboutPage"));
const StoreTrustPage = lazy(() => import("@/pages/store/StoreTrustPage"));
const StoreIssuedCardsLegalHub = lazy(() => import("@/pages/store/StoreIssuedCardsLegalHub"));
const StorePaidInviteStudioPage = lazy(() => import("@/pages/store/StorePaidInviteStudioPage"));
const StorePaidInviteViewPage = lazy(() => import("@/pages/store/StorePaidInviteViewPage"));
const StorePaidInvitePayPage = lazy(() => import("@/pages/store/StorePaidInvitePayPage"));
const StoreOccasionCardLabPage = lazy(() => import("@/pages/store/StoreOccasionCardLabPage"));
const StoreWeddingLandingPage = lazy(() => import("@/pages/store/StoreWeddingLandingPage"));
const StoreWeddingLabPage = lazy(() => import("@/pages/store/StoreWeddingLabPage"));
const StoreWeddingHallPage = lazy(() => import("@/pages/store/StoreWeddingHallPage"));
const StoreWeddingPayPage = lazy(() => import("@/pages/store/StoreWeddingPayPage"));
const StoreEventHubPage = lazy(() => import("@/pages/store/StoreEventHubPage"));
const StoreEventLandingPage = lazy(() => import("@/pages/store/StoreEventLandingPage"));
const StoreEventHallPage = lazy(() => import("@/pages/store/StoreEventHallPage"));
const StoreEventPayPage = lazy(() => import("@/pages/store/StoreEventPayPage"));
const StoreLoungeLandingPage = lazy(() => import("@/pages/store/StoreLoungeLandingPage"));
const StoreLoungeHallPage = lazy(() => import("@/pages/store/StoreLoungeHallPage"));
const StoreLoungePayPage = lazy(() => import("@/pages/store/StoreLoungePayPage"));
const StoreGrocersLandingPage = lazy(() => import("@/pages/store/StoreGrocersLandingPage"));
const StoreGrocersShopPage = lazy(() => import("@/pages/store/StoreGrocersShopPage"));
const StoreGrocersPayPage = lazy(() => import("@/pages/store/StoreGrocersPayPage"));
const StoreRestaurantLandingPage = lazy(() => import("@/pages/store/StoreRestaurantLandingPage"));
const StoreRestaurantShopPage = lazy(() => import("@/pages/store/StoreRestaurantShopPage"));
const StoreRestaurantPayPage = lazy(() => import("@/pages/store/StoreRestaurantPayPage"));
const StoreCafeLandingPage = lazy(() => import("@/pages/store/StoreCafeLandingPage"));
const StoreCafeShopPage = lazy(() => import("@/pages/store/StoreCafeShopPage"));
const StoreCafePayPage = lazy(() => import("@/pages/store/StoreCafePayPage"));
const StoreAffiliatesHomePage = lazy(() => import("@/pages/store/StoreAffiliatesHomePage"));
const StoreAffiliatesEnterPage = lazy(() => import("@/pages/store/StoreAffiliatesEnterPage"));
const StoreAffiliatesDeskPage = lazy(() => import("@/pages/store/StoreAffiliatesDeskPage"));
const StoreAffiliatesRulesPage = lazy(() => import("@/pages/store/StoreAffiliatesRulesPage"));
const StoreOpsDeskPage = lazyPage(() => import("@/pages/store/StoreOpsDeskPage"), "StoreOpsDeskPage");
const StoreBereavementCreatePage = lazy(() => import("@/pages/store/StoreBereavementCreatePage"));
const StoreBereavementViewPage = lazy(() => import("@/pages/store/StoreBereavementViewPage"));
const PartnerStoryPage = lazy(() => import("@/pages/PartnerStoryPage"));
const BarberPortalEnter = lazy(() => import("@/pages/BarberPortalEnter"));
const BarberLogin = lazy(() => import("@/pages/BarberLogin"));
const PartnerAppInstall = lazy(() => import("@/pages/PartnerAppInstall"));
const BarberAccountDeletionRequest = lazy(() => import("@/pages/BarberAccountDeletionRequest"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const Payment = lazy(() => import("@/pages/Payment"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const PartnerSubscriptionTutorials = lazy(() => import("@/pages/PartnerSubscriptionTutorials"));
const MapCommunity = lazy(() => import("@/pages/MapCommunity"));
const PartnerBannersPreviewLanding = lazy(() => import("@/pages/PartnerBannersPreviewLanding"));
const RateBarber = lazy(() => import("@/pages/RateBarber"));
const BookBarber = lazy(() => import("@/pages/BookBarber"));
const StaffTeamBookingsPage = lazy(() => import("@/pages/StaffTeamBookingsPage"));
const AdminSentinelPage = lazy(() => import("@/pages/AdminSentinelPage"));
const CosmicShowcase = lazy(() => import("@/pages/CosmicShowcase"));
const DigitalShiftFeaturePage = lazy(() => import("@/pages/DigitalShiftFeaturePage"));
const PrivateOfficeGuide = lazy(() => import("@/pages/PrivateOfficeGuide"));
const SematLegalHub = lazy(() => import("@/pages/semat/SematLegalHub"));
const SematCardSetup = lazy(() => import("@/pages/semat/SematCardSetup"));
const SematScanPage = lazy(() => import("@/pages/semat/SematScanPage"));
const InquirerPreferenceCardLanding = lazy(() => import("@/pages/semat/InquirerPreferenceCardLanding"));
const AmbassadorRulesHub = lazy(() => import("@/pages/ambassador/AmbassadorRulesHub"));
const AmbassadorEnter = lazy(() => import("@/pages/ambassador/AmbassadorEnter"));
const AmbassadorDashboard = lazy(() => import("@/pages/ambassador/AmbassadorDashboard"));
const AmbassadorTrainingDeck = lazy(() => import("@/pages/ambassador/AmbassadorTrainingDeck"));

const queryClient = new QueryClient();

const RouteBusy = () => (
  <div
    dir="rtl"
    className="flex min-h-[100svh] items-center justify-center bg-[#020912] text-sm text-slate-300"
  >
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

const OccasionCardShareRedirect = () => {
  const { token = '' } = useParams<{ token: string }>();
  if (!token) return <Navigate to={STORE_INVITES_PATH} replace />;
  return <Navigate to={`/store/invites/v/${encodeURIComponent(token)}`} replace />;
};

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

/** بعد الدخول: مكتب المتجر العامل، لا مسار جديد قد يسقط الحزمة. */
function StoreOpsPortalRedirect() {
  const dest = `${getAdminPortalBasePath()}${ROUTE_PATHS.ADMIN_STORE_DESK}`;
  const login = `${getAdminLoginPath()}?next=${encodeURIComponent(dest)}`;
  if (typeof window !== 'undefined' && isHalaqmapStoreHost(window.location.hostname)) {
    window.location.replace(`https://www.halaqmap.com/#${login}`);
    return null;
  }
  return <Navigate to={login} replace />;
}

const LegacyAdminStoreSalesLedgerRedirect = () => {
  const { product = '' } = useParams<{ product: string }>();
  const location = useLocation();
  const safe = /^[a-z0-9-]+$/.test(product) ? product : '';
  const suffix = safe ? `/store-sales/${safe}` : '/store-sales';
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

/** من نطاق الرجال: سمي ومسار كوافير يذهبان إلى النطاق الفرعي. */
function HalaqmapToCoiffeurSurfaceRedirect() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  const pathOnly = (hash.split('?')[0] || '/').trim() || '/';
  const search = hash.includes('?') ? hash.slice(hash.indexOf('?')) : '';
  const target = resolveMensHostCoiffeurRedirect({
    host: window.location.hostname,
    hashPath: pathOnly,
    hashSearch: search,
  });
  if (target) {
    window.location.replace(target);
  }
  return null;
}

function HalaqmapToStoreSurfaceRedirect() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  const pathOnly = (hash.split('?')[0] || '/').trim() || '/';
  const search = hash.includes('?') ? hash.slice(hash.indexOf('?')) : '';
  const target = resolveMensHostStoreRedirect({
    host: window.location.hostname,
    hashPath: pathOnly,
    hashSearch: search,
  });
  if (target) {
    window.location.replace(target);
  }
  return null;
}

/** متجر halaqmap — واجهة البيع على النطاق الفرعي. الدفع يُعاد إلى النطاق الأم. */
function StoreDomainRedirect() {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname.toLowerCase();
  if (!isHalaqmapStoreHost(host)) return null;

  const hash = window.location.hash.replace(/^#/, '');
  const pathOnly = (hash.split('?')[0] || '/').trim();

  if (isStoreHostPaymentPath(pathOnly)) {
    window.location.replace(`https://www.halaqmap.com/${window.location.hash}`);
    return null;
  }

  if (pathOnly === '/oc' || pathOnly.startsWith('/oc/')) {
    const token = pathOnly.replace(/^\/oc\/?/, '').split('/')[0];
    window.location.replace(
      token
        ? `/#/store/invites/v/${encodeURIComponent(token)}`
        : `/#${STORE_LANDING_PATH}`,
    );
    return null;
  }

  if (!window.location.hash || pathOnly === '/' || pathOnly === '') {
    window.location.replace(`/#${STORE_LANDING_PATH}`);
  }

  return null;
}

/** كوافير ماب — قمر صناعي تحت مظلة halaqmap.com. الدفع يُعاد إلى النطاق الأم. */
function CoiffeurDomainRedirect() {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname.toLowerCase();
  if (host !== 'coiffeur.halaqmap.com') return null;

  const hash = window.location.hash.replace(/^#/, '');
  const pathOnly = (hash.split('?')[0] || '/').trim();
  const isPaymentPath =
    pathOnly === ROUTE_PATHS.PAYMENT ||
    pathOnly === ROUTE_PATHS.PAYMENT_SUCCESS ||
    pathOnly.startsWith(`${ROUTE_PATHS.PAYMENT}/`);

  if (isPaymentPath) {
    window.location.replace(`https://www.halaqmap.com/${window.location.hash}`);
    return null;
  }

  if (!window.location.hash || pathOnly === '/' || pathOnly === '') {
    window.location.replace(`/#${ROUTE_PATHS.COIFFEUR_LANDING}`);
  }

  return null;
}

function CoiffeurRegisterRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  if (!params.get('surface')) {
    const fromHash = readHashQueryParam('surface');
    if (fromHash) params.set('surface', fromHash);
  }
  params.set('surface', 'coiffeur');
  return <Navigate to={`${ROUTE_PATHS.REGISTER}?${params.toString()}`} replace />;
}

function RegisterRoute() {
  const location = useLocation();
  const surface = (
    new URLSearchParams(location.search).get('surface') ||
    readHashQueryParam('surface') ||
    ''
  )
    .trim()
    .toLowerCase();
  const page = (
    <LazyRoute>
      <Register />
    </LazyRoute>
  );
  if (surface === 'coiffeur') return page;
  return <WithPartnerLayout>{page}</WithPartnerLayout>;
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
        <HalaqmapToCoiffeurSurfaceRedirect />
        <HalaqmapToStoreSurfaceRedirect />
        <CoiffeurDomainRedirect />
        <StoreDomainRedirect />
        <PartnersDomainRedirect />
        <AdminAuthHashGate>
        <ScrollToTop />
        <AnalyticsRouteTracker />
        <PolicySectionHashRedirect />
        <MoyasarPaymentReturnGate />
        <ConsumerNativeShellGate />
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
          <Route path={FOUNDER_DESK_LANDING_PATH} element={<LazyRoute><FounderDeskLandingPage /></LazyRoute>} />
          <Route path={FOUNDER_DESK_VISITOR_CHAT_PATH} element={<LazyRoute><FounderDeskVisitorChatPage /></LazyRoute>} />
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
          <Route
            path={ROUTE_PATHS.COVERAGE_SALON_NOMINATE}
            element={<LazyRoute><CoverageSalonNominatePage /></LazyRoute>}
          />
          <Route
            path={ROUTE_PATHS.MAP_CONTACT_CARD}
            element={<LazyRoute><MapContactCardPage /></LazyRoute>}
          />
          <Route path={ROUTE_PATHS.ABOUT} element={<LazyRoute><StaticSeoRedirect path="/about" /></LazyRoute>} />
          {/**
           * مركز نسك الحج — نسخة React داخل الهاش؛ والفهرسة على `/nusuk` الثابت.
           */}
          <Route path={ROUTE_PATHS.HAJJ_NUSUK} element={<LazyRoute><HajjNusukLanding /></LazyRoute>} />
          {/**
           * صفحات فزعة الثابتة — إن فُتحت عبر HashRouter (`/#/need`) نُحوّل للرابط النظيف.
           */}
          <Route
            path={ROUTE_PATHS.FILTER_INTENT_HUB}
            element={<LazyRoute><StaticSeoRedirect path="/need" /></LazyRoute>}
          />
          <Route
            path={`${ROUTE_PATHS.FILTER_INTENT_HUB}/:slug`}
            element={<LazyRoute><StaticSeoRedirect path="/need/:slug" /></LazyRoute>}
          />
          <Route
            path={ROUTE_PATHS.SUMMI_HUB}
            element={<LazyRoute><StaticSeoRedirect path="/summi" /></LazyRoute>}
          />
          <Route
            path={`${ROUTE_PATHS.SUMMI_HUB}/:slug`}
            element={<LazyRoute><StaticSeoRedirect path="/summi/:slug" /></LazyRoute>}
          />
          <Route
            path={ROUTE_PATHS.OCCASIONS_HUB}
            element={<LazyRoute><StaticSeoRedirect path="/occasions" /></LazyRoute>}
          />
          <Route
            path={ROUTE_PATHS.EID_ADHA_SHAVING}
            element={<LazyRoute><StaticSeoRedirect path="/occasions/eid-adha-shaving" /></LazyRoute>}
          />
          <Route
            path={ROUTE_PATHS.RAMADAN_BARBER}
            element={<LazyRoute><StaticSeoRedirect path="/occasions/ramadan" /></LazyRoute>}
          />
          <Route
            path={ROUTE_PATHS.FRIDAY_PREP}
            element={<LazyRoute><StaticSeoRedirect path="/occasions/friday-prep" /></LazyRoute>}
          />
          <Route
            path={`${ROUTE_PATHS.OCCASIONS_HUB}/:slug`}
            element={<LazyRoute><StaticSeoRedirect path="/occasions/:slug" /></LazyRoute>}
          />
          <Route
            path={`${GEO_NEAR_HUB_PATH}/:city/:slug`}
            element={<LazyRoute><StaticSeoRedirect path="/near/:city/:slug" /></LazyRoute>}
          />
          <Route
            path={`${GEO_NEAR_HUB_PATH}/:city`}
            element={<LazyRoute><StaticSeoRedirect path="/near/:city" /></LazyRoute>}
          />
          <Route
            path={GEO_NEAR_HUB_PATH}
            element={<LazyRoute><StaticSeoRedirect path="/near" /></LazyRoute>}
          />
          <Route path={ROUTE_PATHS.TERMS_OF_SERVICE} element={<LazyRoute><StaticSeoRedirect path="/terms" /></LazyRoute>} />
          <Route path={ROUTE_PATHS.USER_PRIVACY_POLICY} element={<LazyRoute><StaticSeoRedirect path="/privacy-policy" /></LazyRoute>} />
          <Route path={ROUTE_PATHS.EPHEMERAL_PROCESSING_GOVERNANCE} element={<WithPublicLayout><LazyRoute><EphemeralProcessingGovernance /></LazyRoute></WithPublicLayout>} />
          <Route path={ROUTE_PATHS.PRIVACY_DETAILED} element={<WithPublicLayout><LazyRoute><Privacy /></LazyRoute></WithPublicLayout>} />
          <Route path={ROUTE_PATHS.PRIVACY} element={<Navigate to={ROUTE_PATHS.PRIVACY_DETAILED} replace />} />

          {/* ????? ????????? ??? ??????? ????????? */}
          <Route path={ROUTE_PATHS.PARTNERS_B2B_LANDING} element={<LazyRoute><PartnersB2BLanding /></LazyRoute>} />
          <Route path={ROUTE_PATHS.BARBERS_LANDING} element={<LazyRoute><PartnerMarketingPreview /></LazyRoute>} />
          <Route path={STORE_LANDING_PATH} element={<LazyRoute><StoreLanding /></LazyRoute>} />
          <Route path={STORE_REQUEST_PATH} element={<LazyRoute><StoreRequestPage /></LazyRoute>} />
          <Route path={STORE_CARDS_PATH} element={<LazyRoute><StoreCardStudioPage /></LazyRoute>} />
          <Route path={STORE_INTRO_CARDS_PATH} element={<LazyRoute><StoreIntroCardStudioPage /></LazyRoute>} />
          <Route path={STORE_INTRO_CARD_VIEW_PATH} element={<LazyRoute><StoreIntroCardViewPage /></LazyRoute>} />
          <Route path={STORE_MEET_QR_PATH} element={<LazyRoute><StoreMeetQrPage /></LazyRoute>} />
          <Route path={STORE_ABOUT_PATH} element={<LazyRoute><StoreAboutPage /></LazyRoute>} />
          <Route path={STORE_TRUST_PATH} element={<LazyRoute><StoreTrustPage /></LazyRoute>} />
          <Route path={STORE_ISSUED_CARDS_LEGAL_PATH} element={<LazyRoute><StoreIssuedCardsLegalHub /></LazyRoute>} />
          <Route path={STORE_INVITES_PATH} element={<LazyRoute><StorePaidInviteStudioPage /></LazyRoute>} />
          <Route path={STORE_INVITES_LAB_PATH} element={<LazyRoute><StoreOccasionCardLabPage /></LazyRoute>} />
          <Route path={STORE_WEDDING_LAB_PATH} element={<LazyRoute><StoreWeddingLabPage /></LazyRoute>} />
          <Route path={STORE_WEDDING_WOMEN_PATH} element={<LazyRoute><StoreWeddingLandingPage /></LazyRoute>} />
          <Route path={STORE_WEDDING_PATH} element={<LazyRoute><StoreWeddingLandingPage /></LazyRoute>} />
          <Route path={STORE_WEDDING_GUEST_PATH} element={<LazyRoute><StoreWeddingHallPage /></LazyRoute>} />
          <Route path={STORE_WEDDING_HOST_PATH} element={<LazyRoute><StoreWeddingHallPage /></LazyRoute>} />
          <Route path={STORE_WEDDING_VIEW_PATH} element={<LazyRoute><StoreWeddingHallPage /></LazyRoute>} />
          <Route path={STORE_WEDDING_PAY_PATH} element={<LazyRoute><StoreWeddingPayPage /></LazyRoute>} />
          <Route path={STORE_EVENT_WOMEN_PATH} element={<LazyRoute><StoreEventLandingPage /></LazyRoute>} />
          <Route path={STORE_EVENT_MEN_PATH} element={<LazyRoute><StoreEventLandingPage /></LazyRoute>} />
          <Route path={STORE_EVENT_PATH} element={<LazyRoute><StoreEventHubPage /></LazyRoute>} />
          <Route path={STORE_EVENT_GUEST_PATH} element={<LazyRoute><StoreEventHallPage /></LazyRoute>} />
          <Route path={STORE_EVENT_HOST_PATH} element={<LazyRoute><StoreEventHallPage /></LazyRoute>} />
          <Route path={STORE_EVENT_VIEW_PATH} element={<LazyRoute><StoreEventHallPage /></LazyRoute>} />
          <Route path={STORE_EVENT_PAY_PATH} element={<LazyRoute><StoreEventPayPage /></LazyRoute>} />
          <Route path={STORE_LOUNGE_PATH} element={<LazyRoute><StoreLoungeLandingPage /></LazyRoute>} />
          <Route path={STORE_LOUNGE_GUEST_PATH} element={<LazyRoute><StoreLoungeHallPage /></LazyRoute>} />
          <Route path={STORE_LOUNGE_HOST_PATH} element={<LazyRoute><StoreLoungeHallPage /></LazyRoute>} />
          <Route path={STORE_LOUNGE_VIEW_PATH} element={<LazyRoute><StoreLoungeHallPage /></LazyRoute>} />
          <Route path={STORE_LOUNGE_PAY_PATH} element={<LazyRoute><StoreLoungePayPage /></LazyRoute>} />
          <Route path={STORE_GROCERS_PAY_PATH} element={<LazyRoute><StoreGrocersPayPage /></LazyRoute>} />
          <Route path={STORE_GROCERS_PATH} element={<LazyRoute><StoreGrocersLandingPage /></LazyRoute>} />
          <Route path={STORE_GROCERS_DESK_PATH} element={<LazyRoute><StoreGrocersShopPage /></LazyRoute>} />
          <Route path={STORE_GROCERS_VIEW_PATH} element={<LazyRoute><StoreGrocersShopPage /></LazyRoute>} />
          <Route path={STORE_RESTAURANT_PAY_PATH} element={<LazyRoute><StoreRestaurantPayPage /></LazyRoute>} />
          <Route path={STORE_RESTAURANT_PATH} element={<LazyRoute><StoreRestaurantLandingPage /></LazyRoute>} />
          <Route path={STORE_RESTAURANT_DESK_PATH} element={<LazyRoute><StoreRestaurantShopPage /></LazyRoute>} />
          <Route path={STORE_RESTAURANT_VIEW_PATH} element={<LazyRoute><StoreRestaurantShopPage /></LazyRoute>} />
          <Route path={STORE_CAFE_PAY_PATH} element={<LazyRoute><StoreCafePayPage /></LazyRoute>} />
          <Route path={STORE_CAFE_PATH} element={<LazyRoute><StoreCafeLandingPage /></LazyRoute>} />
          <Route path={STORE_CAFE_DESK_PATH} element={<LazyRoute><StoreCafeShopPage /></LazyRoute>} />
          <Route path={STORE_CAFE_HOST_PATH} element={<LazyRoute><StoreCafeShopPage /></LazyRoute>} />
          <Route path={STORE_CAFE_GUEST_PATH} element={<LazyRoute><StoreCafeShopPage /></LazyRoute>} />
          <Route path={STORE_CAFE_QUIET_PATH} element={<LazyRoute><StoreCafeShopPage /></LazyRoute>} />
          <Route path={STORE_CAFE_MENU_PATH} element={<LazyRoute><StoreCafeShopPage /></LazyRoute>} />
          <Route path={STORE_CAFE_VIEW_PATH} element={<LazyRoute><StoreCafeShopPage /></LazyRoute>} />
          <Route path={STORE_AFFILIATES_ENTER_PATH} element={<LazyRoute><StoreAffiliatesEnterPage /></LazyRoute>} />
          <Route path={STORE_AFFILIATES_DESK_PATH} element={<LazyRoute><StoreAffiliatesDeskPage /></LazyRoute>} />
          <Route path={STORE_AFFILIATES_RULES_PATH} element={<LazyRoute><StoreAffiliatesRulesPage /></LazyRoute>} />
          <Route path={STORE_AFFILIATES_PATH} element={<LazyRoute><StoreAffiliatesHomePage /></LazyRoute>} />
          <Route path={STORE_OPS_PATH} element={<StoreOpsPortalRedirect />} />
          <Route path="/oc/:token" element={<OccasionCardShareRedirect />} />
          <Route path={STORE_INVITES_VIEW_PATH} element={<LazyRoute><StorePaidInviteViewPage /></LazyRoute>} />
          <Route path={STORE_OCCASION_CARD_PAY_PATH} element={<LazyRoute><StorePaidInvitePayPage /></LazyRoute>} />
          <Route path={STORE_BEREAVEMENT_PATH} element={<LazyRoute><StoreBereavementCreatePage /></LazyRoute>} />
          <Route path={STORE_BEREAVEMENT_CREATE_PATH} element={<LazyRoute><StoreBereavementCreatePage /></LazyRoute>} />
          <Route path={STORE_BEREAVEMENT_MANAGE_PATH} element={<LazyRoute><StoreBereavementViewPage /></LazyRoute>} />
          <Route path={STORE_BEREAVEMENT_VIEW_PATH} element={<LazyRoute><StoreBereavementViewPage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_LANDING} element={<LazyRoute><CoiffeurLanding /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_INQUIRE} element={<LazyRoute><CoiffeurInquiryPage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_PARTNERS} element={<LazyRoute><CoiffeurPartnersLanding /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_MARKETING} element={<LazyRoute><CoiffeurMarketingPage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_AMBASSADORS} element={<LazyRoute><CoiffeurAmbassadorEnter /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_AMBASSADOR_RULES} element={<LazyRoute><CoiffeurAmbassadorRulesPage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_INTEREST} element={<LazyRoute><CoiffeurInterestLanding /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_CARD_STUDIO} element={<LazyRoute><CoiffeurCardStudioPage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_CARD_VIEW} element={<LazyRoute><CoiffeurCardViewPage /></LazyRoute>} />
          <Route path={`${ROUTE_PATHS.COIFFEUR_CARD_SHARE}/:token`} element={<LazyRoute><CoiffeurCardViewPage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.COIFFEUR_REGISTER} element={<CoiffeurRegisterRedirect />} />
          <Route
            path={ROUTE_PATHS.PARTNER_INTEREST}
            element={
              <WithPartnerLayout>
                <LazyRoute><PartnerInterestLanding /></LazyRoute>
              </WithPartnerLayout>
            }
          />
          <Route path={ROUTE_PATHS.MAP_CONTACT_JOIN_SHORT} element={<MapContactShortJoinRedirect />} />
          <Route
            path={`${ROUTE_PATHS.MAP_CONTACT_JOIN_SHORT}/:cityId`}
            element={<MapContactShortJoinRedirect />}
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
          <Route
            path={ROUTE_PATHS.FAZAA_LISTING_CONSENT}
            element={
              <WithPartnerLayout>
                <LazyRoute><FazaaListingConsentLanding /></LazyRoute>
              </WithPartnerLayout>
            }
          />
          <Route path={ROUTE_PATHS.PARTNER_WHY} element={<WithPartnerLayout><LazyRoute><PartnerWhyPage /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_MARKETING} element={<WithPartnerLayout><LazyRoute><PartnerMarketingCommitmentsPage /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_STORY} element={<WithPartnerLayout><LazyRoute><PartnerStoryPage /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER} element={<RegisterRoute />} />
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
          <Route path={ROUTE_PATHS.PAYMENT_SUCCESS} element={<WithPartnerLayout><LazyRoute><PaymentSuccess /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PAYMENT} element={<WithPartnerLayout><LazyRoute><Payment /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_TUTORIALS} element={<WithPartnerLayout><LazyRoute><PartnerSubscriptionTutorials /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.MAP_COMMUNITY} element={<WithPartnerLayout><LazyRoute><MapCommunity /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_SUPPORT} element={<WithPartnerLayout><LazyRoute><PartnerSupportChat /></LazyRoute></WithPartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_SALES_OFFICE} element={<LazyRoute><PartnerSalesOfficePage /></LazyRoute>} />
          <Route
            path={ROUTE_PATHS.PARTNER_MERCHANT_SETTLEMENT}
            element={
              <WithPartnerLayout>
                <LazyRoute><MerchantSettlementLanding /></LazyRoute>
              </WithPartnerLayout>
            }
          />
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
              <Route path={`${adminBase}/coiffeur-hub`} element={<LazyRoute><CoiffeurHubPage /></LazyRoute>} />
              <Route path={`${adminBase}/store-desk`} element={<LazyRoute><StoreDeskPage /></LazyRoute>} />
              <Route path={`${adminBase}/store-sales`} element={<LazyRoute><StoreSalesHubPage /></LazyRoute>} />
              <Route path={`${adminBase}/store-sales/:product`} element={<LazyRoute><StoreSalesLedgerPage /></LazyRoute>} />
              <Route path={`${adminBase}${ADMIN_STORE_OPS_PATH}`} element={<LazyRoute><StoreOpsDeskPage /></LazyRoute>} />
              <Route path={`${adminBase}/fazaa-listing`} element={<LazyRoute><FazaaListingAdminPage /></LazyRoute>} />
            </Fragment>
          ))}
          {/* Safety net for legacy invitation links built before VITE_ADMIN_PORTAL_BASE alignment. */}
          <Route path="/admin/in" element={<LegacyAdminRedirect suffix="/in" />} />
          <Route path="/admin/ctrl" element={<LegacyAdminRedirect suffix="/ctrl" />} />
          <Route path="/admin/sentinel" element={<LegacyAdminRedirect suffix="/sentinel" />} />
          <Route path="/admin/radar/full-screen" element={<LegacyAdminRedirect suffix="/radar/full-screen" />} />
          <Route path="/admin/cyber" element={<LegacyAdminRedirect suffix="/cyber" />} />
          <Route path="/admin/staff-hub" element={<LegacyAdminRedirect suffix="/staff-hub" />} />
          <Route path="/admin/coiffeur-hub" element={<LegacyAdminRedirect suffix="/coiffeur-hub" />} />
          <Route path="/admin/store-desk" element={<LegacyAdminRedirect suffix="/store-desk" />} />
          <Route path="/admin/store-sales" element={<LegacyAdminRedirect suffix="/store-sales" />} />
          <Route path="/admin/store-sales/:product" element={<LegacyAdminStoreSalesLedgerRedirect />} />
          <Route path="/admin/store-ops" element={<LegacyAdminRedirect suffix={ADMIN_STORE_OPS_PATH} />} />
          <Route path="/admin/fazaa-listing" element={<LegacyAdminRedirect suffix="/fazaa-listing" />} />
          <Route path="/admin" element={<LegacyAdminRedirect suffix="/in" />} />
          <Route path={ROUTE_PATHS.RATE_BARBER} element={<LazyRoute><RateBarber /></LazyRoute>} />
          <Route path={ROUTE_PATHS.BOOK_BARBER} element={<LazyRoute><BookBarber /></LazyRoute>} />
          <Route path={ROUTE_PATHS.STAFF_BOOKINGS} element={<LazyRoute><StaffTeamBookingsPage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.SEMAT_LEGAL} element={<LazyRoute><SematLegalHub /></LazyRoute>} />
          <Route path={ROUTE_PATHS.SEMAT_SETUP} element={<LazyRoute><SematCardSetup /></LazyRoute>} />
          <Route path={ROUTE_PATHS.SEMAT_SCAN} element={<LazyRoute><SematScanPage /></LazyRoute>} />
          <Route path={ROUTE_PATHS.INQUIRER_PREFERENCE_CARD} element={<LazyRoute><InquirerPreferenceCardLanding /></LazyRoute>} />
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