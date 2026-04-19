import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PartnerLayout } from "@/components/PartnerLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import RegisterSuccess from "@/pages/RegisterSuccess";
import About from "@/pages/About";
import BarberGrowthLanding from "@/pages/BarberGrowthLanding";
import PartnerWhyPage from "@/pages/PartnerWhyPage";
import PartnerStoryPage from "@/pages/PartnerStoryPage";
import Privacy from "@/pages/Privacy";
import PartnerPrivacy from "@/pages/PartnerPrivacy";
import SubscriptionPolicy from "@/pages/SubscriptionPolicy";
import BarberLogin from "@/pages/BarberLogin";
import BarberDashboard from "@/pages/BarberDashboard";
import BarberAccountDeletionRequest from "@/pages/BarberAccountDeletionRequest";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Payment from "@/pages/Payment";
import PartnerSupportChat from "@/pages/PartnerSupportChat";
import RateBarber from "@/pages/RateBarber";
import { LEGACY_PARTNER_ROUTE_PATHS, ROUTE_PATHS } from "@/lib/index";
import { getAdminLoginPath, getAdminDashboardPath } from "@/config/adminAuth";
import { AdminAuthHashGate } from "@/components/AdminAuthHashGate";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AdminAuthHashGate>
        <ScrollToTop />
        <Routes>
          <Route path={ROUTE_PATHS.HOME} element={<Layout><Home /></Layout>} />
          <Route path={ROUTE_PATHS.ABOUT} element={<Layout><About /></Layout>} />
          <Route path={ROUTE_PATHS.PRIVACY} element={<Layout><Privacy /></Layout>} />

          <Route path={ROUTE_PATHS.BARBERS_LANDING} element={<PartnerLayout><BarberGrowthLanding /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_WHY} element={<PartnerLayout><PartnerWhyPage /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_STORY} element={<PartnerLayout><PartnerStoryPage /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER} element={<PartnerLayout><Register /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.REGISTER_SUCCESS} element={<PartnerLayout><RegisterSuccess /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PARTNER_PRIVACY} element={<PartnerLayout><PartnerPrivacy /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.SUBSCRIPTION_POLICY} element={<PartnerLayout><SubscriptionPolicy /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.BARBER_LOGIN} element={<PartnerLayout><BarberLogin /></PartnerLayout>} />
          <Route path={ROUTE_PATHS.PAYMENT} element={<PartnerLayout><Payment /></PartnerLayout>} />
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
          <Route path={getAdminLoginPath()} element={<AdminLogin />} />
          <Route path={getAdminDashboardPath()} element={<AdminDashboard />} />
          <Route path={ROUTE_PATHS.RATE_BARBER} element={<RateBarber />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AdminAuthHashGate>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;