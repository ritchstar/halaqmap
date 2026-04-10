import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import SubscriptionPolicy from "@/pages/SubscriptionPolicy";
import BarberLogin from "@/pages/BarberLogin";
import BarberDashboard from "@/pages/BarberDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Payment from "@/pages/Payment";
import { ROUTE_PATHS } from "@/lib/index";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path={ROUTE_PATHS.HOME} element={<Layout><Home /></Layout>} />
          <Route path={ROUTE_PATHS.REGISTER} element={<Layout><Register /></Layout>} />
          <Route path={ROUTE_PATHS.ABOUT} element={<Layout><About /></Layout>} />
          <Route path={ROUTE_PATHS.PRIVACY} element={<Layout><Privacy /></Layout>} />
          <Route path={ROUTE_PATHS.SUBSCRIPTION_POLICY} element={<Layout><SubscriptionPolicy /></Layout>} />
          <Route path={ROUTE_PATHS.BARBER_LOGIN} element={<BarberLogin />} />
          <Route path={ROUTE_PATHS.BARBER_DASHBOARD} element={<BarberDashboard />} />
          <Route path={ROUTE_PATHS.ADMIN_LOGIN} element={<AdminLogin />} />
          <Route path={ROUTE_PATHS.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          <Route path={ROUTE_PATHS.PAYMENT} element={<Payment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;