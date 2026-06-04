import { lazy, Suspense, type ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation, useRoutes, type RouteObject } from 'react-router-dom';
import { getAdminPortalBasePaths } from '@/config/adminAuth';
import { Layout } from '@/components/Layout';
import { PartnerLayout } from '@/components/PartnerLayout';
import { AdminSentinelSecurityGate } from '@/components/AdminAuthHashGate';
import { LEGACY_PARTNER_ROUTE_PATHS, ROUTE_PATHS } from '@/lib';
import { LabCloneProvider } from '@/lab/LabCloneProvider';
import { toCanonicalFromLabPath } from '@/lab/labCloneRouting';

const LandingPreview = lazy(() => import('@/pages/LandingPreview'));
const PartnerMarketingPreview = lazy(() => import('@/pages/PartnerMarketingPreview'));
const PulseMapPage = lazy(() => import('@/pages/PulseMapPage'));
const AdminRadarFullScreenPage = lazy(() => import('@/app/admin/radar/full-screen/page'));
const AdminCyberOperationsPage = lazy(() => import('@/app/admin/cyber/page'));
const StaffHubPage = lazy(() => import('@/app/admin/staff-hub/page'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const SaudiAgentLanding = lazy(() => import('@/pages/SaudiAgentLanding'));
const About = lazy(() => import('@/pages/About'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const UserPrivacyPolicy = lazy(() => import('@/pages/UserPrivacyPolicy'));
const PlatformReviews = lazy(() => import('@/pages/PlatformReviews'));
const Register = lazy(() => import('@/pages/Register'));
const PartnerPrivacy = lazy(() => import('@/pages/PartnerPrivacy'));
const SubscriptionPolicy = lazy(() => import('@/pages/SubscriptionPolicy'));
const PartnerSupportChat = lazy(() => import('@/pages/PartnerSupportChat'));
const RegisterSuccess = lazy(() => import('@/pages/RegisterSuccess'));
const ShopOpenStatus = lazy(() => import('@/pages/ShopOpenStatus'));
const PartnerInterestLanding = lazy(() => import('@/pages/PartnerInterestLanding'));
const PartnerWhyPage = lazy(() => import('@/pages/PartnerWhyPage'));
const PartnerStoryPage = lazy(() => import('@/pages/PartnerStoryPage'));
const BarberPortalEnter = lazy(() => import('@/pages/BarberPortalEnter'));
const BarberDashboard = lazy(() => import('@/pages/BarberDashboard'));
const BarberAccountDeletionRequest = lazy(() => import('@/pages/BarberAccountDeletionRequest'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const Payment = lazy(() => import('@/pages/Payment'));
const PartnerSubscriptionTutorials = lazy(() => import('@/pages/PartnerSubscriptionTutorials'));
const MapCommunity = lazy(() => import('@/pages/MapCommunity'));
const AdminSentinelPage = lazy(() => import('@/pages/AdminSentinelPage'));
const CosmicShowcase = lazy(() => import('@/pages/CosmicShowcase'));
const DigitalShiftFeaturePage = lazy(() => import('@/pages/DigitalShiftFeaturePage'));
const PrivateOfficeGuide = lazy(() => import('@/pages/PrivateOfficeGuide'));
const HospitalityB2BRequestLanding = lazy(() => import('@/pages/HospitalityB2BRequestLanding'));
const RooLandingLightClone = lazy(() => import('@/pages/RooLandingLightClone'));

function LabBusy() {
  return (
    <div dir="rtl" className="flex min-h-[48vh] items-center justify-center text-sm text-muted-foreground">
      جاري التحميل...
    </div>
  );
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LabBusy />}>{children}</Suspense>;
}

function withLayout(node: ReactNode) {
  return <Layout><LazyRoute>{node}</LazyRoute></Layout>;
}

function withPartnerLayout(node: ReactNode) {
  return <PartnerLayout><LazyRoute>{node}</LazyRoute></PartnerLayout>;
}

function LabLightShell() {
  return (
    <div dir="rtl" className="roo-light-clone roo-lab-v1 min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

function LabRouteUnavailable() {
  const location = useLocation();
  const requestedPath = location.search ? new URLSearchParams(location.search).get('target') : null;
  const safeTarget = requestedPath && requestedPath.startsWith('/') ? requestedPath : null;

  return (
    <div dir="rtl" className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-sky-200 bg-white/90 p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">هذه الصفحة غير متاحة داخل مختبر النسخ حالياً.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          الروابط الأساسية تعمل داخل المختبر. بعض المسارات الحساسة أو المعتمدة على بيانات خاصة تظل خارج نطاق النسخ حتى لا تتأثر تجربة الإنتاج.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={ROUTE_PATHS.ROO_LANDING_LAB}
            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            العودة إلى مختبر الهبوط
          </Link>
          {safeTarget ? (
            <a
              href={`#${safeTarget}`}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              فتح الصفحة الأصلية
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LabCatchAllFallback() {
  const location = useLocation();
  const canonicalPath = toCanonicalFromLabPath(location.pathname);
  return <Navigate to={`${ROUTE_PATHS.ROO_LANDING_LAB}/unavailable?target=${encodeURIComponent(canonicalPath)}`} replace />;
}

function buildLabRoutes(): RouteObject[] {
  const adminAliasRoutes: RouteObject[] = getAdminPortalBasePaths().flatMap((adminBase) => ([
    { path: `${adminBase.slice(1)}/in`, element: <LazyRoute><AdminLogin /></LazyRoute> },
    { path: `${adminBase.slice(1)}/ctrl`, element: <LazyRoute><AdminDashboard /></LazyRoute> },
    {
      path: `${adminBase.slice(1)}/sentinel`,
      element: (
        <AdminSentinelSecurityGate>
          <LazyRoute><AdminSentinelPage /></LazyRoute>
        </AdminSentinelSecurityGate>
      ),
    },
    { path: `${adminBase.slice(1)}/radar/full-screen`, element: <LazyRoute><AdminRadarFullScreenPage /></LazyRoute> },
    { path: `${adminBase.slice(1)}/cyber`, element: <LazyRoute><AdminCyberOperationsPage /></LazyRoute> },
    { path: `${adminBase.slice(1)}/staff-hub`, element: <LazyRoute><StaffHubPage /></LazyRoute> },
  ]));

  return [
    {
      element: <LabLightShell />,
      children: [
        { index: true, element: <LazyRoute><RooLandingLightClone /></LazyRoute> },
        { path: 'unavailable', element: <LabRouteUnavailable /> },

        { path: 'about', element: withLayout(<About />) },
        { path: 'terms', element: withLayout(<TermsOfService />) },
        { path: 'privacy-policy', element: withLayout(<UserPrivacyPolicy />) },
        { path: 'privacy/detailed', element: withLayout(<Privacy />) },
        { path: 'privacy', element: <Navigate to={ROUTE_PATHS.PRIVACY_DETAILED} replace /> },
        { path: 'reviews', element: <LazyRoute><PlatformReviews /></LazyRoute> },
        { path: 'preview', element: <LazyRoute><LandingPreview /></LazyRoute> },
        { path: 'preview-partners', element: <LazyRoute><PartnerMarketingPreview /></LazyRoute> },
        { path: 'cosmic', element: <LazyRoute><CosmicShowcase /></LazyRoute> },
        { path: 'saudi', element: <LazyRoute><SaudiAgentLanding /></LazyRoute> },
        { path: 'radar', element: <LazyRoute><PulseMapPage /></LazyRoute> },

        { path: 'partners', element: <LazyRoute><PartnerMarketingPreview /></LazyRoute> },
        { path: 'partners/interest', element: withPartnerLayout(<PartnerInterestLanding />) },
        { path: 'partners/why', element: withPartnerLayout(<PartnerWhyPage />) },
        { path: 'partners/story', element: withPartnerLayout(<PartnerStoryPage />) },
        { path: 'partners/register', element: withPartnerLayout(<Register />) },
        { path: 'partners/register/success', element: withPartnerLayout(<RegisterSuccess />) },
        { path: 'partners/shop-open', element: withPartnerLayout(<ShopOpenStatus />) },
        { path: 'partners/privacy', element: withPartnerLayout(<PartnerPrivacy />) },
        { path: 'partners/subscription-policy', element: withPartnerLayout(<SubscriptionPolicy />) },
        { path: 'partners/login', element: <Navigate to={ROUTE_PATHS.BARBERS_LANDING} replace /> },
        { path: 'barber/enter', element: withPartnerLayout(<BarberPortalEnter />) },
        { path: 'partners/payment', element: withPartnerLayout(<Payment />) },
        { path: 'partners/tutorials', element: withPartnerLayout(<PartnerSubscriptionTutorials />) },
        { path: 'partners/community', element: withPartnerLayout(<MapCommunity />) },
        { path: 'partners/support', element: withPartnerLayout(<PartnerSupportChat />) },
        { path: 'partners/hospitality-request', element: withLayout(<HospitalityB2BRequestLanding />) },
        { path: 'partners/digital-shift', element: <LazyRoute><DigitalShiftFeaturePage /></LazyRoute> },
        { path: 'partners/private-office-guide', element: <LazyRoute><PrivateOfficeGuide /></LazyRoute> },

        { path: 'barber/dashboard', element: <LazyRoute><BarberDashboard /></LazyRoute> },
        { path: 'barber/request-account-deletion', element: withPartnerLayout(<BarberAccountDeletionRequest />) },

        { path: 'admin/in', element: <LazyRoute><AdminLogin /></LazyRoute> },
        { path: 'admin/ctrl', element: <LazyRoute><AdminDashboard /></LazyRoute> },
        {
          path: 'admin/sentinel',
          element: (
            <AdminSentinelSecurityGate>
              <LazyRoute><AdminSentinelPage /></LazyRoute>
            </AdminSentinelSecurityGate>
          ),
        },
        { path: 'admin/radar/full-screen', element: <LazyRoute><AdminRadarFullScreenPage /></LazyRoute> },
        { path: 'admin/cyber', element: <LazyRoute><AdminCyberOperationsPage /></LazyRoute> },
        { path: 'admin/staff-hub', element: <LazyRoute><StaffHubPage /></LazyRoute> },
        { path: 'admin', element: <Navigate to="/admin/in" replace /> },

        ...adminAliasRoutes,

        { path: LEGACY_PARTNER_ROUTE_PATHS.BARBERS_LANDING.slice(1), element: <Navigate to={ROUTE_PATHS.BARBERS_LANDING} replace /> },
        { path: LEGACY_PARTNER_ROUTE_PATHS.REGISTER.slice(1), element: <Navigate to={ROUTE_PATHS.REGISTER} replace /> },
        { path: LEGACY_PARTNER_ROUTE_PATHS.REGISTER_SUCCESS.slice(1), element: <Navigate to={ROUTE_PATHS.REGISTER_SUCCESS} replace /> },
        { path: LEGACY_PARTNER_ROUTE_PATHS.SUBSCRIPTION_POLICY.slice(1), element: <Navigate to={ROUTE_PATHS.SUBSCRIPTION_POLICY} replace /> },
        { path: LEGACY_PARTNER_ROUTE_PATHS.BARBER_LOGIN.slice(1), element: <Navigate to={ROUTE_PATHS.BARBERS_LANDING} replace /> },
        { path: LEGACY_PARTNER_ROUTE_PATHS.PAYMENT.slice(1), element: <Navigate to={ROUTE_PATHS.PAYMENT} replace /> },

        { path: '*', element: <LabCatchAllFallback /> },
      ],
    },
  ];
}

export default function LabCloneSandbox() {
  const element = useRoutes(buildLabRoutes());
  return <LabCloneProvider>{element}</LabCloneProvider>;
}
