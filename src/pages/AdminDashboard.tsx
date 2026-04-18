import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import {
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  BarChart3,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ROUTE_PATHS, SubscriptionRequest, Payment, AdminStats, SubscriptionTier } from '@/lib';
import { IMAGES } from '@/assets/images';
import {
  loadMergedSubscriptionRequests,
  removeStoredSubscriptionRequest,
} from '@/lib/subscriptionRequestStorage';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { getAdminLoginPath } from '@/config/adminAuth';
import { shouldShowAdminMocks } from '@/config/adminDashboardEnv';
import { fetchAdminStats } from '@/lib/adminStatsRemote';
import { fetchPaymentsForAdmin, updatePaymentStatusRemote } from '@/lib/adminPaymentsRemote';
import {
  listBarbersForAdmin,
  setBarberActiveRemote,
  deleteBarberRemote,
  updateBarberRecordRemote,
  upsertBarberFromApprovedRequest,
  type AdminBarberRow,
} from '@/lib/adminBarbersRemote';
import {
  deleteRegistrationSubmissionRemote,
  patchRegistrationSubmissionPayloadRemote,
} from '@/lib/registrationSubmissionsRemote';
import {
  sendBarberOnboardingEmailRemote,
  sendOnboardingEmailsForActiveBarbersRemote,
} from '@/lib/barberOnboardingEmailRemote';
import { getOrderedWeekHoursForDisplay } from '@/lib/saudiWorkingWeek';
import {
  calcVatBreakdown,
  getPlatformVatSettings,
  savePlatformVatSettings,
} from '@/lib/platformVatSettings';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  COMMAND_CENTER_LEADS,
  buildWaDeepLink,
  type CommandCenterLead,
  type CommandLeadChannel,
  type CommandLeadStatus,
} from '@/lib/adminCommandCenter';
import {
  ADMIN_PERMISSION_LABELS,
  ADMIN_PERMISSION_KEYS,
  FULL_ADMIN_PERMISSIONS,
  type AdminPermissionKey,
  type AdminPermissions,
} from '@/lib/adminPermissions';
import {
  deleteAdminRoleByEmail,
  listAdminRoles,
  resolveAdminAccess,
  upsertAdminRole,
  type AdminRoleRow,
} from '@/lib/adminAccessRemote';

const EMPTY_ADMIN_STATS: AdminStats = {
  totalBarbers: 0,
  bronzeBarbers: 0,
  goldBarbers: 0,
  diamondBarbers: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  activeSubscriptions: 0,
  expiredSubscriptions: 0,
  pendingRequests: 0,
  pendingPayments: 0,
  totalAppointments: 0,
  totalUsers: 0,
};

const BASE_ADMIN_STATS: AdminStats = {
  totalBarbers: 156,
  bronzeBarbers: 89,
  goldBarbers: 45,
  diamondBarbers: 22,
  totalRevenue: 456800,
  monthlyRevenue: 38900,
  activeSubscriptions: 142,
  expiredSubscriptions: 14,
  pendingRequests: 8,
  pendingPayments: 12,
  totalAppointments: 3456,
  totalUsers: 12890,
};

const ADMIN_REQUESTS_MARKETING_FILTERS_KEY = 'halaqmap.admin.requestsMarketingFilters.v1';

const MOCK_SUBSCRIPTION_REQUESTS: SubscriptionRequest[] = [
  {
    id: 'req1',
    barberName: 'صالون الفخامة',
    email: 'luxury@example.com',
    phone: '+966501234567',
    whatsapp: '+966501234567',
    location: {
      lat: 24.7136,
      lng: 46.6753,
      address: 'حي العليا، الرياض',
    },
    tier: SubscriptionTier.DIAMOND,
    documents: [IMAGES.BARBER_SHOP_1, IMAGES.BARBER_SHOP_2],
    shopImages: [IMAGES.BARBER_INTERIOR_1, IMAGES.BARBER_INTERIOR_2, IMAGES.BARBER_INTERIOR_3],
    status: 'pending',
    submittedAt: '2026-04-07 10:30',
  },
  {
    id: 'req2',
    barberName: 'حلاق الأناقة',
    email: 'elegance@example.com',
    phone: '+966502345678',
    whatsapp: '+966502345678',
    location: {
      lat: 24.6877,
      lng: 46.7219,
      address: 'حي النسيم، الرياض',
    },
    tier: SubscriptionTier.GOLD,
    documents: [IMAGES.BARBER_SHOP_3],
    shopImages: [IMAGES.BARBER_INTERIOR_4, IMAGES.BARBER_INTERIOR_5],
    status: 'pending',
    submittedAt: '2026-04-07 14:15',
  },
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-mock-1',
    barberId: '1',
    barberName: 'صالون النخبة الماسي',
    amount: 200,
    tier: SubscriptionTier.DIAMOND,
    method: 'bank_transfer',
    receipt: IMAGES.DASHBOARD_BG_1,
    status: 'pending',
    period: 'أبريل 2026',
    submittedAt: '2026-04-08 09:00',
  },
  {
    id: 'pay-mock-2',
    barberId: '3',
    barberName: 'حلاق الملوك الذهبي',
    amount: 150,
    tier: SubscriptionTier.GOLD,
    method: 'bank_transfer',
    receipt: IMAGES.DASHBOARD_BG_2,
    status: 'pending',
    period: 'أبريل 2026',
    submittedAt: '2026-04-08 11:30',
  },
];

type LeadRuntimeState = {
  status: CommandLeadStatus;
  assignedTo?: string;
  notes?: string;
  lastContactAt?: string;
  followUpDate?: string;
};

const COMMAND_CENTER_STATE_KEY = 'halaqmap_command_center_lead_state_v1';
const COMMAND_CENTER_SOP_CHECK_KEY = 'halaqmap_command_center_sop_check_v1';

const WEEKLY_SOP_PLAN = [
  { day: 'الأحد', focus: 'استهداف صالونات ماسية', target: 12, note: 'ابدأ بالرياض وجدة للحالات عالية العائد.' },
  { day: 'الإثنين', focus: 'استهداف ذهبي سريع الإغلاق', target: 18, note: 'ركز على الصالونات الصغيرة والمتوسطة.' },
  { day: 'الثلاثاء', focus: 'متابعة بانتظار الرد', target: 20, note: 'رفع التحويل عبر متابعة اليوم + المتأخرة.' },
  { day: 'الأربعاء', focus: 'إغلاق مدفوعات وطلبات', target: 10, note: 'تصفية المعلّق وتحويله إلى اشتراك فعلي.' },
  { day: 'الخميس', focus: 'توسّع مناطق جديدة', target: 15, note: 'الدمام/الخبر/المدينة + تحديث قاعدة الأهداف.' },
  { day: 'الجمعة', focus: 'تشغيل خفيف + دعم', target: 8, note: 'التركيز على الدعم والمتابعة السريعة فقط.' },
  { day: 'السبت', focus: 'مراجعة أسبوعية', target: 0, note: 'تقييم الأداء وتحديث خطة الأسبوع القادم.' },
] as const;

type AdminSessionInfo = {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  permissions: AdminPermissions;
  bootstrap: boolean;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminData, setAdminData] = useState<AdminSessionInfo | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [storedSubscriptionRequests, setStoredSubscriptionRequests] = useState<SubscriptionRequest[]>([]);
  const [remoteStats, setRemoteStats] = useState<AdminStats | null>(null);
  const [remotePayments, setRemotePayments] = useState<Payment[]>([]);
  const [dataRefreshNonce, setDataRefreshNonce] = useState(0);

  const bumpRemoteData = () => setDataRefreshNonce((n) => n + 1);

  const refreshStoredRequests = () => {
    void loadMergedSubscriptionRequests().then(setStoredSubscriptionRequests);
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      navigate(getAdminLoginPath(), { replace: true });
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      navigate(getAdminLoginPath(), { replace: true });
      return;
    }

    let cancelled = false;

    const applySession = (session: { user: { id: string; email?: string | null } } | null) => {
      if (cancelled) return;
      if (!session?.user?.email) {
        navigate(getAdminLoginPath(), { replace: true });
        return;
      }
      void resolveAdminAccess(session.user.email).then((access) => {
        if (cancelled) return;
        if (!access.allowed) {
          navigate(getAdminLoginPath(), { replace: true });
          return;
        }
        setAdminData({
          id: session.user.id,
          name: access.displayName || 'لوحة الإدارة',
          email: access.email,
          role: 'admin',
          permissions: access.permissions,
          bootstrap: access.bootstrap,
        });
      });
    };

    void client.auth.getSession().then(({ data: { session } }) => applySession(session));

    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!adminData) return;
    let cancelled = false;
    void fetchAdminStats().then((s) => {
      if (!cancelled) setRemoteStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, [adminData, dataRefreshNonce]);

  useEffect(() => {
    if (!adminData) return;
    let cancelled = false;
    void fetchPaymentsForAdmin().then((list) => {
      if (!cancelled) setRemotePayments(list);
    });
    return () => {
      cancelled = true;
    };
  }, [adminData, dataRefreshNonce]);

  useEffect(() => {
    refreshStoredRequests();
    const onChange = () => refreshStoredRequests();
    window.addEventListener('halaqmap-subscription-requests-changed', onChange);
    return () => window.removeEventListener('halaqmap-subscription-requests-changed', onChange);
  }, []);

  const handleLogout = async () => {
    const client = getSupabaseClient();
    await client?.auth.signOut();
    navigate(ROUTE_PATHS.HOME);
  };

  const subscriptionRequests = useMemo(() => {
    const base = [...storedSubscriptionRequests];
    if (shouldShowAdminMocks()) return [...base, ...MOCK_SUBSCRIPTION_REQUESTS];
    return base;
  }, [storedSubscriptionRequests]);

  const pendingRequestCount = useMemo(
    () => subscriptionRequests.filter((r) => r.status === 'pending').length,
    [subscriptionRequests]
  );

  const displayPayments = useMemo(() => {
    if (shouldShowAdminMocks()) return [...remotePayments, ...MOCK_PAYMENTS];
    return remotePayments;
  }, [remotePayments]);

  const pendingPaymentCount = useMemo(
    () => displayPayments.filter((p) => p.status === 'pending').length,
    [displayPayments]
  );

  const stats: AdminStats = useMemo(() => {
    const base =
      shouldShowAdminMocks() && remoteStats === null
        ? BASE_ADMIN_STATS
        : (remoteStats ?? EMPTY_ADMIN_STATS);
    return {
      ...base,
      pendingRequests: pendingRequestCount,
      pendingPayments: pendingPaymentCount,
    };
  }, [remoteStats, pendingRequestCount, pendingPaymentCount]);

  const can = (perm: AdminPermissionKey) => Boolean(adminData?.permissions?.[perm]);
  const allowedTabs = useMemo(() => {
    const out: string[] = [];
    if (can('view_overview')) out.push('overview');
    if (can('view_requests')) out.push('requests');
    if (can('view_barbers')) out.push('barbers');
    if (can('view_payments')) out.push('payments');
    if (can('view_command_center')) out.push('command-center');
    if (can('view_messages')) out.push('messages');
    if (can('view_settings')) out.push('settings');
    return out;
  }, [adminData]);

  useEffect(() => {
    if (!adminData) return;
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] ?? 'overview');
    }
  }, [adminData, activeTab, allowedTabs]);

  if (!adminData) {
    return null;
  }

  const canRootHardEdit = Boolean(adminData.bootstrap || can('manage_admins'));

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{adminData.name}</h1>
                <Badge variant="secondary" className="bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-600 border-red-500/30">
                  لوحة الإدارة
                </Badge>
              </div>
            </div>

            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            {can('view_overview') && (
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            )}
            {can('view_requests') && (
            <TabsTrigger value="requests" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">الطلبات</span>
              {stats.pendingRequests > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
            )}
            {can('view_barbers') && (
            <TabsTrigger value="barbers" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">الحلاقين</span>
            </TabsTrigger>
            )}
            {can('view_payments') && (
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">المدفوعات</span>
              {stats.pendingPayments > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {stats.pendingPayments}
                </Badge>
              )}
            </TabsTrigger>
            )}
            {can('view_command_center') && (
            <TabsTrigger value="command-center" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">غرفة القيادة</span>
            </TabsTrigger>
            )}
            {can('view_messages') && (
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">الرسائل</span>
            </TabsTrigger>
            )}
            {can('view_settings') && (
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          {can('view_overview') && <TabsContent value="overview" className="space-y-6">
            <OverviewSection stats={stats} />
          </TabsContent>}

          {/* Requests Tab */}
          {can('view_requests') && <TabsContent value="requests" className="space-y-6">
            <RequestsSection
              requests={subscriptionRequests}
              onViewRequest={setSelectedRequest}
              canReview={can('review_requests')}
              canManage={can('manage_barbers')}
            />
          </TabsContent>}

          {/* Barbers Tab */}
          {can('view_barbers') && <TabsContent value="barbers" className="space-y-6">
            <BarbersSection
              refreshNonce={dataRefreshNonce}
              onStatsNeedRefresh={bumpRemoteData}
              canManage={can('manage_barbers')}
              canRootHardEdit={canRootHardEdit}
            />
          </TabsContent>}

          {/* Payments Tab */}
          {can('view_payments') && <TabsContent value="payments" className="space-y-6">
            <PaymentsSection
              payments={displayPayments}
              onViewPayment={setSelectedPayment}
              canReview={can('review_payments')}
            />
          </TabsContent>}

          {can('view_command_center') && <TabsContent value="command-center" className="space-y-6">
            <CommandCenterSection
              leads={COMMAND_CENTER_LEADS}
              stats={stats}
              requests={subscriptionRequests}
              payments={displayPayments}
              canManage={can('manage_command_center')}
            />
          </TabsContent>}

          {/* Messages Tab */}
          {can('view_messages') && <TabsContent value="messages" className="space-y-6">
            <MessagesSection />
          </TabsContent>}

          {/* Settings Tab */}
          {can('view_settings') && <TabsContent value="settings" className="space-y-6">
            <SettingsSection
              adminEmail={adminData.email}
              canManageAdmins={can('manage_admins')}
              bootstrapAdmin={adminData.bootstrap}
            />
          </TabsContent>}
        </Tabs>
      </div>

      {/* Request Review Dialog */}
      {selectedRequest && can('review_requests') && (
        <RequestReviewDialog
          request={selectedRequest}
          reviewerEmail={adminData.email}
          onClose={() => {
            setSelectedRequest(null);
            setRejectionReason('');
          }}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onAfterDecision={() => {
            refreshStoredRequests();
            bumpRemoteData();
          }}
          canManageBarbers={can('manage_barbers')}
        />
      )}

      {/* Payment Review Dialog */}
      {selectedPayment && can('review_payments') && (
        <PaymentReviewDialog
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onAfterDecision={() => {
            bumpRemoteData();
          }}
        />
      )}
    </div>
  );
}

// Overview Section
function OverviewSection({ stats }: { stats: AdminStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">الإحصائيات العامة</h2>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="إجمالي الحلاقين"
          value={stats.totalBarbers}
          subtitle={`${stats.activeSubscriptions} نشط`}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="الإيرادات الكلية"
          value={`${stats.totalRevenue.toLocaleString()} ر.س`}
          subtitle={`${stats.monthlyRevenue.toLocaleString()} ر.س هذا الشهر`}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="طلبات قيد المراجعة"
          value={stats.pendingRequests}
          icon={FileText}
          color="yellow"
        />
        <StatsCard
          title="مدفوعات قيد التأكيد"
          value={stats.pendingPayments}
          icon={CreditCard}
          color="purple"
        />
      </div>

      {/* Subscription Breakdown */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">باقة برونزية</p>
                <p className="text-2xl font-bold">{stats.bronzeBarbers}</p>
                <p className="text-xs text-muted-foreground mt-1">100 ر.س/شهر</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 flex items-center justify-center">
                <span className="text-2xl">🥉</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">باقة ذهبية</p>
                <p className="text-2xl font-bold">{stats.goldBarbers}</p>
                <p className="text-xs text-muted-foreground mt-1">150 ر.س/شهر</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center">
                <span className="text-2xl">🥇</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">باقة ماسية</p>
                <p className="text-2xl font-bold">{stats.diamondBarbers}</p>
                <p className="text-xs text-muted-foreground mt-1">200 ر.س/شهر</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات المنصة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إجمالي المواعيد</span>
              <span className="font-semibold">{stats.totalAppointments.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إجمالي المستخدمين</span>
              <span className="font-semibold">{stats.totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">اشتراكات منتهية</span>
              <span className="font-semibold text-red-600">{stats.expiredSubscriptions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">برونزي</span>
                <span className="font-semibold">{(stats.bronzeBarbers * 100).toLocaleString()} ر.س</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ذهبي</span>
                <span className="font-semibold">{(stats.goldBarbers * 150).toLocaleString()} ر.س</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ماسي</span>
                <span className="font-semibold">{(stats.diamondBarbers * 200).toLocaleString()} ر.س</span>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">الإجمالي</span>
                  <span className="text-lg font-bold text-green-600">
                    {stats.monthlyRevenue.toLocaleString()} ر.س
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/30 text-blue-600',
    green: 'from-green-500/10 to-green-600/10 border-green-500/30 text-green-600',
    yellow: 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/30 text-yellow-600',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/30 text-purple-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} border flex items-center justify-center`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Requests Section
function isVisualAssetUrl(ref: string): boolean {
  return (
    /^https?:\/\//i.test(ref) ||
    ref.startsWith('/') ||
    ref.startsWith('data:image/')
  );
}

function attachmentLooksLikePdf(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url);
}

/** صورة يمكن عرضها في وسم img (يستثني روابط PDF) */
function isRenderableImageAssetUrl(ref: string): boolean {
  return isVisualAssetUrl(ref) && !attachmentLooksLikePdf(ref);
}

function hasPartnerAttributionSignal(request: SubscriptionRequest): boolean {
  const a = request.partnerAttribution;
  if (!a) return false;
  return Boolean(
    a.utmSource ||
      a.utmMedium ||
      a.utmCampaign ||
      a.utmTerm ||
      a.utmContent ||
      a.gclid ||
      a.fbclid ||
      a.ttclid ||
      a.msclkid
  );
}

function inferMarketingMedium(request: SubscriptionRequest): string {
  const a = request.partnerAttribution;
  if (!a) return 'غير معروف';
  if (a.utmMedium) return a.utmMedium;
  if (a.gclid) return 'google_ads';
  if (a.fbclid) return 'meta_ads';
  if (a.ttclid) return 'tiktok_ads';
  if (a.msclkid) return 'microsoft_ads';
  return 'غير معروف';
}

function csvCell(value: unknown): string {
  const raw = value == null ? '' : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function errorText(result: unknown, fallback = 'حدث خطأ غير متوقع'): string {
  if (result && typeof result === 'object' && 'error' in result) {
    const value = (result as { error?: unknown }).error;
    if (typeof value === 'string' && value.trim()) return value;
  }
  return fallback;
}

function RequestsSection({
  requests,
  onViewRequest,
  canReview,
  canManage,
}: {
  requests: SubscriptionRequest[];
  onViewRequest: (request: SubscriptionRequest) => void;
  canReview: boolean;
  canManage: boolean;
}) {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [mediumFilter, setMediumFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(ADMIN_REQUESTS_MARKETING_FILTERS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        query?: string;
        sourceFilter?: string;
        mediumFilter?: string;
        campaignFilter?: string;
      };
      if (typeof parsed.query === 'string') setQuery(parsed.query);
      if (typeof parsed.sourceFilter === 'string') setSourceFilter(parsed.sourceFilter || 'all');
      if (typeof parsed.mediumFilter === 'string') setMediumFilter(parsed.mediumFilter || 'all');
      if (typeof parsed.campaignFilter === 'string') setCampaignFilter(parsed.campaignFilter || 'all');
    } catch {
      // ignore parse/storage errors and keep defaults
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = JSON.stringify({
      query,
      sourceFilter,
      mediumFilter,
      campaignFilter,
    });
    localStorage.setItem(ADMIN_REQUESTS_MARKETING_FILTERS_KEY, payload);
  }, [query, sourceFilter, mediumFilter, campaignFilter]);

  const marketingAnalytics = useMemo(() => {
    const registrationRequests = requests.filter((r) => r.source === 'registration');
    const attributed = registrationRequests.filter((r) => hasPartnerAttributionSignal(r));

    const sourceCounter = new Map<string, number>();
    const mediumCounter = new Map<string, number>();
    const campaignCounter = new Map<string, number>();

    for (const req of attributed) {
      const source = req.partnerAttribution?.utmSource || 'direct_or_unknown';
      const medium = inferMarketingMedium(req);
      const campaign = req.partnerAttribution?.utmCampaign || 'بدون_حملة';

      sourceCounter.set(source, (sourceCounter.get(source) || 0) + 1);
      mediumCounter.set(medium, (mediumCounter.get(medium) || 0) + 1);
      campaignCounter.set(campaign, (campaignCounter.get(campaign) || 0) + 1);
    }

    const sortCounter = (counter: Map<string, number>) =>
      Array.from(counter.entries())
        .sort((a, b) => b[1] - a[1]);

    const attributedRate =
      registrationRequests.length > 0
        ? Math.round((attributed.length / registrationRequests.length) * 100)
        : 0;

    const allSources = sortCounter(sourceCounter);
    const allMediums = sortCounter(mediumCounter);
    const allCampaigns = sortCounter(campaignCounter);

    return {
      total: registrationRequests.length,
      attributedCount: attributed.length,
      unattributedCount: Math.max(0, registrationRequests.length - attributed.length),
      attributedRate,
      topSources: allSources.slice(0, 5),
      topMediums: allMediums.slice(0, 5),
      topCampaigns: allCampaigns.slice(0, 5),
      allSources,
      allMediums,
      allCampaigns,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const q = query.trim().toLowerCase();

    return requests.filter((request) => {
      if (q) {
        const searchable = [
          request.id,
          request.barberName,
          request.email,
          request.phone,
          request.location.address,
        ]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      const source = request.partnerAttribution?.utmSource || 'direct_or_unknown';
      const medium = inferMarketingMedium(request);
      const campaign = request.partnerAttribution?.utmCampaign || 'بدون_حملة';

      if (sourceFilter !== 'all' && source !== sourceFilter) return false;
      if (mediumFilter !== 'all' && medium !== mediumFilter) return false;
      if (campaignFilter !== 'all' && campaign !== campaignFilter) return false;

      return true;
    });
  }, [requests, query, sourceFilter, mediumFilter, campaignFilter]);

  const resetMarketingFilters = () => {
    setSourceFilter('all');
    setMediumFilter('all');
    setCampaignFilter('all');
    setQuery('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_REQUESTS_MARKETING_FILTERS_KEY);
    }
  };

  const exportFilteredRequestsCsv = () => {
    if (filteredRequests.length === 0) {
      toast({ title: 'لا توجد بيانات للتصدير', description: 'لا توجد نتائج حالية ضمن الفلاتر.' });
      return;
    }

    const headers = [
      'request_id',
      'submitted_at',
      'status',
      'tier',
      'barber_name',
      'email',
      'phone',
      'address',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
      'ttclid',
      'msclkid',
      'referrer',
      'page_path',
      'captured_at_iso',
    ];

    const rows = filteredRequests.map((request) => {
      const attr = request.partnerAttribution;
      return [
        request.id,
        request.submittedAt,
        request.status,
        request.tier,
        request.barberName,
        request.email,
        request.phone,
        request.location.address,
        attr?.utmSource || 'direct_or_unknown',
        inferMarketingMedium(request),
        attr?.utmCampaign || 'بدون_حملة',
        attr?.utmTerm || '',
        attr?.utmContent || '',
        attr?.gclid || '',
        attr?.fbclid || '',
        attr?.ttclid || '',
        attr?.msclkid || '',
        attr?.referrer || '',
        attr?.pagePath || '',
        attr?.capturedAtIso || '',
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => csvCell(cell)).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    link.href = url;
    link.download = `partners_requests_filtered_${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast({
      title: 'تم تصدير CSV',
      description: `تم تنزيل ${filteredRequests.length} طلب/طلبات حسب الفلاتر الحالية.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isSupabaseConfigured() ? (
        <p className="text-sm text-muted-foreground mb-4 rounded-lg border border-border bg-muted/40 px-4 py-3 leading-relaxed">
          الطلبات من جدول <code className="text-xs">registration_submissions</code> بعد تسجيل دخول الإدارة وتطبيق
          سياسات RLS (راجع <code className="text-xs">15_admin_jwt_platform_rls.sql</code> في المستودع).
        </p>
      ) : null}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">طلبات الاشتراك</h2>
        <div className="flex gap-2">
          <Input
            placeholder="بحث بالاسم/الإيميل/الجوال/المدينة/رقم الطلب..."
            className="w-72"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="outline" size="icon" onClick={resetMarketingFilters} title="إعادة ضبط الفلاتر">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={exportFilteredRequestsCsv} disabled={filteredRequests.length === 0}>
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      <Card className="mb-6 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            أداء القنوات التسويقية (Partners Funnel)
          </CardTitle>
          <CardDescription>
            قراءة مباشرة لبيانات UTM/Click IDs المرسلة من صفحة الشركاء مع طلبات التسجيل.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">إجمالي طلبات التسجيل</p>
              <p className="text-xl font-bold">{marketingAnalytics.total}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">طلبات منسوبة تسويقياً</p>
              <p className="text-xl font-bold text-primary">{marketingAnalytics.attributedCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">نسبة الإسناد</p>
              <p className="text-xl font-bold">{marketingAnalytics.attributedRate}%</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">طلبات بلا مصدر واضح</p>
              <p className="text-xl font-bold">{marketingAnalytics.unattributedCount}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-sm font-semibold">أعلى المصادر</p>
              {marketingAnalytics.topSources.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {marketingAnalytics.topSources.map(([label, count]) => (
                    <Badge key={label} variant="outline">
                      {label}: {count}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">لا توجد بيانات مصادر بعد.</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-sm font-semibold">أعلى الوسائط</p>
              {marketingAnalytics.topMediums.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {marketingAnalytics.topMediums.map(([label, count]) => (
                    <Badge key={label} variant="outline">
                      {label}: {count}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">لا توجد بيانات وسائط بعد.</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-sm font-semibold">أعلى الحملات</p>
              {marketingAnalytics.topCampaigns.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {marketingAnalytics.topCampaigns.map(([label, count]) => (
                    <Badge key={label} variant="outline">
                      {label}: {count}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">لا توجد بيانات حملات بعد.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">فلترة الطلبات التسويقية</CardTitle>
          <CardDescription>
            فلترة مباشرة بحسب مصدر الاستقطاب والوسيط والحملة لمعرفة أداء كل قناة.
          </CardDescription>
          <p className="text-xs text-muted-foreground">
            يتم حفظ آخر إعدادات الفلترة تلقائياً لهذا المتصفح.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <Label className="text-xs text-muted-foreground">المصدر (source)</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="كل المصادر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المصادر</SelectItem>
                  {marketingAnalytics.allSources.map(([label, count]) => (
                    <SelectItem key={label} value={label}>
                      {label} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">الوسيط (medium)</Label>
              <Select value={mediumFilter} onValueChange={setMediumFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="كل الوسائط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الوسائط</SelectItem>
                  {marketingAnalytics.allMediums.map(([label, count]) => (
                    <SelectItem key={label} value={label}>
                      {label} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">الحملة (campaign)</Label>
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="كل الحملات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحملات</SelectItem>
                  {marketingAnalytics.allCampaigns.map(([label, count]) => (
                    <SelectItem key={label} value={label}>
                      {label} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 self-end">
              <p className="text-xs text-muted-foreground">نتائج الفلترة الحالية</p>
              <p className="text-xl font-bold">{filteredRequests.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              لا توجد طلبات تطابق الفلاتر الحالية.
            </CardContent>
          </Card>
        ) : null}
        {filteredRequests.map((request) => {
          const thumb =
            request.registrationAttachmentUrls?.shopExterior &&
            isRenderableImageAssetUrl(request.registrationAttachmentUrls.shopExterior)
              ? request.registrationAttachmentUrls.shopExterior
              : request.shopImages[0] && isRenderableImageAssetUrl(request.shopImages[0])
                ? request.shopImages[0]
                : null;
          return (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={request.barberName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-1 text-center">
                        بدون صورة
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold">{request.barberName}</h3>
                      {request.source === 'registration' && (
                        <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                          من نموذج التسجيل
                        </Badge>
                      )}
                      <Badge
                        variant={
                          request.tier === SubscriptionTier.DIAMOND
                            ? 'default'
                            : request.tier === SubscriptionTier.GOLD
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {request.tier === SubscriptionTier.DIAMOND && '💎 ماسي'}
                        {request.tier === SubscriptionTier.GOLD && '🥇 ذهبي'}
                        {request.tier === SubscriptionTier.BRONZE && '🥉 برونزي'}
                      </Badge>
                      <Badge
                        variant={
                          request.status === 'approved'
                            ? 'default'
                            : request.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {request.status === 'approved'
                          ? 'مقبول'
                          : request.status === 'rejected'
                            ? 'مرفوض'
                            : 'قيد المراجعة'}
                      </Badge>
                      {request.adminAccountState === 'suspended' ? (
                        <Badge variant="destructive" className="bg-amber-500 text-white">
                          الحساب معلّق
                        </Badge>
                      ) : null}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground shrink-0">رقم الطلب (مرجع الدعم)</span>
                        <code
                          className="text-xs bg-muted px-2 py-0.5 rounded font-mono"
                          dir="ltr"
                          title="نفس المعرّف المحفوظ في قاعدة البيانات للطلب"
                        >
                          {request.id}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{request.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span dir="ltr">{request.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{request.location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>تم التقديم: {request.submittedAt}</span>
                      </div>
                      {hasPartnerAttributionSignal(request) ? (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Badge variant="outline" className="text-[11px]">
                            source: {request.partnerAttribution?.utmSource || 'direct_or_unknown'}
                          </Badge>
                          <Badge variant="outline" className="text-[11px]">
                            medium: {inferMarketingMedium(request)}
                          </Badge>
                          <Badge variant="outline" className="text-[11px]">
                            campaign: {request.partnerAttribution?.utmCampaign || 'بدون_حملة'}
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <Button onClick={() => onViewRequest(request)} disabled={!canReview && !canManage}>
                  <Eye className="w-4 h-4 ml-2" />
                  {canReview || canManage ? 'إدارة الطلب' : 'عرض فقط'}
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

// Request Review Dialog
function RequestReviewDialog({
  request,
  reviewerEmail,
  onClose,
  rejectionReason,
  setRejectionReason,
  onAfterDecision,
  canManageBarbers,
}: {
  request: SubscriptionRequest;
  reviewerEmail: string;
  onClose: () => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onAfterDecision: () => void;
  canManageBarbers: boolean;
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isMockRow =
    shouldShowAdminMocks() && MOCK_SUBSCRIPTION_REQUESTS.some((m) => m.id === request.id);

  useEffect(() => {
    setShowRejectForm(false);
    setSaving(false);
  }, [request.id]);

  const handleApprove = async () => {
    setSaving(true);
    const reviewedAt = new Date().toISOString();
    if (isMockRow) {
      toast({ title: 'تم القبول (تجريبي)', description: 'هذا الطلب من العرض التجريبي المحلي فقط.' });
      setSaving(false);
      onClose();
      onAfterDecision();
      return;
    }
    const upsert = await upsertBarberFromApprovedRequest(request);
    if (!upsert.ok) {
      setSaving(false);
      toast({
        title: 'تعذر مزامنة الحلاق',
        description: errorText(upsert, 'تعذر مزامنة الحلاق.'),
        variant: 'destructive',
      });
      return;
    }
    const res = await patchRegistrationSubmissionPayloadRemote(request.id, {
      status: 'approved',
      adminAccountState: 'active',
      reviewedAt,
      reviewedBy: reviewerEmail,
      rejectionReason: undefined,
      suspensionReason: undefined,
      linkedBarberId: upsert.barberId,
    });
    setSaving(false);
    if (!res.ok) {
      toast({ title: 'فشل الحفظ', description: errorText(res, 'تعذر تحديث الطلب.'), variant: 'destructive' });
      return;
    }
    // تحقق صارم: تأكد أن الحلاق موجود فعلياً في نفس مشروع Supabase الحالي.
    const verifyRows = await listBarbersForAdmin();
    const emailNorm = request.email.trim().toLowerCase();
    const found = verifyRows.some(
      (r) => r.id === upsert.barberId || r.email.trim().toLowerCase() === emailNorm
    );
    const visibilityWarning = !found;
    const mail = await sendBarberOnboardingEmailRemote({
      barberName: request.barberName,
      barberEmail: request.email,
      tier: request.tier,
      barberId: upsert.barberId,
      registrationOrderId: request.id,
    });
    if (visibilityWarning) {
      toast({
        title: 'تنبيه مزامنة',
        description:
          'تم اعتماد الطلب، وأُرسلت رسالة الدخول. لكن الحساب غير ظاهر فوراً في القائمة (قد يكون اختلاف مشروع Supabase بين الواجهة والسيرفر).',
        variant: 'destructive',
      });
    }
    if (!mail.ok) {
      toast({
        title: 'تم قبول الطلب لكن فشل الإرسال البريدي',
        description: `تعذر إرسال بريد التعليمات إلى ${request.email}: ${errorText(mail, 'تعذر الإرسال')}`,
        variant: 'destructive',
      });
    }
    toast({
      title: 'تم قبول الطلب',
      description: mail.ok
        ? 'تمت مزامنة الحلاق وإرسال بريد التعليمات وروابط لوحة التحكم.'
        : 'تمت مزامنة الحلاق وسيظهر في تبويب الحلاقين.',
    });
    onClose();
    onAfterDecision();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: 'سبب الرفض', description: 'يرجى إدخال سبب الرفض.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const reviewedAt = new Date().toISOString();
    if (isMockRow) {
      toast({ title: 'تم الرفض (تجريبي)', description: 'هذا الطلب من العرض التجريبي المحلي فقط.' });
      setSaving(false);
      onClose();
      onAfterDecision();
      return;
    }
    const res = await patchRegistrationSubmissionPayloadRemote(request.id, {
      status: 'rejected',
      adminAccountState: 'suspended',
      reviewedAt,
      reviewedBy: reviewerEmail,
      rejectionReason: rejectionReason.trim(),
      suspensionReason: rejectionReason.trim(),
    });
    setSaving(false);
    if (!res.ok) {
      toast({ title: 'فشل الحفظ', description: errorText(res, 'تعذر تحديث الطلب.'), variant: 'destructive' });
      return;
    }
    toast({ title: 'تم رفض الطلب', description: 'تم تحديث السجل في Supabase.' });
    onClose();
    onAfterDecision();
  };

  const handleSuspendAccount = async () => {
    if (!canManageBarbers) {
      toast({ title: 'لا تملك صلاحية الإدارة', variant: 'destructive' });
      return;
    }
    if (!request.linkedBarberId) {
      toast({
        title: 'لا يوجد حساب مرتبط',
        description: 'اقبل الطلب أولاً أو أعد قبوله لإنشاء/ربط حساب الحلاق.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    const toggle = await setBarberActiveRemote(request.linkedBarberId, false);
    if (!toggle.ok) {
      setSaving(false);
      toast({ title: 'تعذر تعليق الحساب', description: errorText(toggle, 'تعذر تعليق الحساب.'), variant: 'destructive' });
      return;
    }
    const reviewedAt = new Date().toISOString();
    const res = await patchRegistrationSubmissionPayloadRemote(request.id, {
      adminAccountState: 'suspended',
      reviewedAt,
      reviewedBy: reviewerEmail,
      suspensionReason: rejectionReason.trim() || 'تعليق إداري',
    });
    setSaving(false);
    if (!res.ok) {
      toast({ title: 'تعذر حفظ حالة الطلب', description: errorText(res, 'تعذر تحديث حالة الطلب.'), variant: 'destructive' });
      return;
    }
    toast({ title: 'تم تعليق الحساب' });
    onClose();
    onAfterDecision();
  };

  const handleDeleteRequest = async () => {
    if (!canManageBarbers) {
      toast({ title: 'لا تملك صلاحية الإدارة', variant: 'destructive' });
      return;
    }
    if (!window.confirm('تأكيد حذف الطلب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    setSaving(true);
    if (isMockRow) {
      removeStoredSubscriptionRequest(request.id);
      setSaving(false);
      toast({ title: 'تم حذف الطلب (تجريبي)' });
      onClose();
      onAfterDecision();
      return;
    }
    const res = await deleteRegistrationSubmissionRemote(request.id);
    setSaving(false);
    if (!res.ok) {
      toast({ title: 'تعذر حذف الطلب', description: errorText(res, 'تعذر حذف الطلب.'), variant: 'destructive' });
      return;
    }
    removeStoredSubscriptionRequest(request.id);
    toast({ title: 'تم حذف الطلب نهائياً' });
    onClose();
    onAfterDecision();
  };

  const handleResendOnboarding = async () => {
    const recipient = request.email.trim();
    if (!recipient) {
      toast({ title: 'لا يوجد بريد إلكتروني', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const mail = await sendBarberOnboardingEmailRemote({
      barberName: request.barberName,
      barberEmail: recipient,
      tier: request.tier,
      barberId: request.linkedBarberId ?? undefined,
      registrationOrderId: request.id,
    });
    setSaving(false);
    if (!mail.ok) {
      toast({
        title: 'تعذر إعادة إرسال الرسالة الأساسية',
        description: errorText(mail, 'تعذر الإرسال البريدي.'),
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'تمت إعادة إرسال رسالة الروابط بنجاح', description: recipient });
  };

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl">مراجعة طلب الاشتراك</DialogTitle>
          <DialogDescription>
            قم بمراجعة المعلومات والمستندات قبل الموافقة أو الرفض
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">معلومات الصالون</h3>
            <div className="rounded-md border border-primary/25 bg-primary/5 px-3 py-2 mb-4">
              <Label>رقم الطلب (مرجع الدعم)</Label>
              <p className="text-sm font-mono font-semibold mt-1 break-all" dir="ltr">
                {request.id}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                يطابق الرقم الذي يظهر للعميل بعد التقديم؛ اطلبه عند المتابعة مع الدعم.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>اسم الصالون</Label>
                <p className="text-sm font-medium mt-1">{request.barberName}</p>
              </div>
              <div>
                <Label>الباقة المطلوبة</Label>
                <Badge className="mt-1">
                  {request.tier === SubscriptionTier.DIAMOND && '💎 ماسي'}
                  {request.tier === SubscriptionTier.GOLD && '🥇 ذهبي'}
                  {request.tier === SubscriptionTier.BRONZE && '🥉 برونزي'}
                </Badge>
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <p className="text-sm font-medium mt-1">{request.email}</p>
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <p className="text-sm font-medium mt-1" dir="ltr">
                  {request.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">حالة الطلب:</span>
              <Badge
                variant={
                  request.status === 'approved'
                    ? 'default'
                    : request.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {request.status === 'approved'
                  ? 'مقبول'
                  : request.status === 'rejected'
                    ? 'مرفوض'
                    : 'قيد المراجعة'}
              </Badge>
              <span className="text-muted-foreground">حالة الحساب:</span>
              <Badge
                variant={
                  request.adminAccountState === 'suspended'
                    ? 'destructive'
                    : request.adminAccountState === 'deleted'
                      ? 'secondary'
                      : 'default'
                }
              >
                {request.adminAccountState === 'suspended'
                  ? 'معلّق'
                  : request.adminAccountState === 'deleted'
                    ? 'محذوف'
                    : 'نشط/غير محدد'}
              </Badge>
            </div>
            {request.linkedBarberId ? (
              <p className="text-xs text-muted-foreground mt-2" dir="ltr">
                Barber ID: {request.linkedBarberId}
              </p>
            ) : null}
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold mb-3">الموقع</h3>
            <div className="space-y-2">
              <p className="text-sm">{request.location.address}</p>
              <p className="text-xs text-muted-foreground">
                الإحداثيات: {request.location.lat}, {request.location.lng}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${request.location.lat},${request.location.lng}`,
                    '_blank'
                  )
                }
              >
                <MapPin className="w-4 h-4 ml-2" />
                عرض على الخريطة
              </Button>
            </div>
          </div>

          {request.weeklyWorkingHours && request.weeklyWorkingHours.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">أوقات العمل (من الطلب)</h3>
              <p className="text-xs text-muted-foreground mb-2">أسبوع كامل كما سجّل مقدّم الطلب</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 rounded-lg border border-border p-2 bg-muted/20">
                {getOrderedWeekHoursForDisplay(request.weeklyWorkingHours).map(({ day, line, closed }) => (
                  <div
                    key={day}
                    className={`rounded-md border px-2 py-1.5 text-center sm:text-right ${
                      closed ? 'bg-muted/40 border-border/60' : 'bg-background border-border'
                    }`}
                  >
                    <div className="text-[10px] sm:text-xs font-semibold leading-tight">{day}</div>
                    <div
                      className={`text-[10px] sm:text-xs font-mono leading-tight ${closed ? 'text-muted-foreground' : ''}`}
                      dir="ltr"
                    >
                      {line}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3">المستندات النظامية</h3>
            {request.registrationAttachmentUrls ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {request.registrationAttachmentUrls.commercialRegistry && (
                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <Label className="text-primary">السجل التجاري</Label>
                    {isRenderableImageAssetUrl(request.registrationAttachmentUrls.commercialRegistry) ? (
                      <div className="aspect-video rounded-md overflow-hidden border border-border">
                        <img
                          src={request.registrationAttachmentUrls.commercialRegistry}
                          alt="سجل تجاري"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : null}
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a
                        href={request.registrationAttachmentUrls.commercialRegistry}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        فتح الملف
                      </a>
                    </Button>
                  </div>
                )}
                {request.registrationAttachmentUrls.municipalLicense && (
                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <Label className="text-primary">رخصة البلدية</Label>
                    {isRenderableImageAssetUrl(request.registrationAttachmentUrls.municipalLicense) ? (
                      <div className="aspect-video rounded-md overflow-hidden border border-border">
                        <img
                          src={request.registrationAttachmentUrls.municipalLicense}
                          alt="رخصة بلدية"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : null}
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a
                        href={request.registrationAttachmentUrls.municipalLicense}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        فتح الملف
                      </a>
                    </Button>
                  </div>
                )}
                {(request.registrationAttachmentUrls.healthCertificates ?? []).map((url, idx) => (
                  <div key={`${idx}-${url}`} className="rounded-lg border border-border p-4 space-y-2">
                    <Label className="text-primary">شهادة صحية ({idx + 1})</Label>
                    {isRenderableImageAssetUrl(url) ? (
                      <div className="aspect-video rounded-md overflow-hidden border border-border">
                        <img src={url} alt={`شهادة ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <ExternalLink className="w-4 h-4 ml-2" />
                        فتح الملف
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground mb-2">وصف الملفات كما أُرسل مع الطلب:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {request.documents.map((doc, index) =>
                isRenderableImageAssetUrl(doc) ? (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={doc} alt={`مستند ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-4 flex items-start gap-3 text-sm min-h-[5rem]"
                  >
                    <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="break-all text-muted-foreground">{doc}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {(request.paymentMethod ||
            request.receiptFileName ||
            request.registrationAttachmentUrls?.receipt ||
            request.servicesSummary) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">الدفع والخدمات (من نموذج التسجيل)</h3>
              <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
                {request.paymentMethod && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">طريقة الدفع: </span>
                    <span className="font-medium">
                      {request.paymentMethod === 'bank_transfer'
                        ? 'تحويل بنكي (6 أشهر)'
                        : 'اشتراك شهري'}
                    </span>
                  </p>
                )}
                {request.receiptFileName && (
                  <p className="text-sm break-all">
                    <span className="text-muted-foreground">ملف الإيصال: </span>
                    <span dir="ltr" className="font-medium inline-block">
                      {request.receiptFileName}
                    </span>
                  </p>
                )}
                {request.registrationAttachmentUrls?.receipt && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">إيصال التحويل (مرفوع)</p>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={request.registrationAttachmentUrls.receipt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                        فتح إيصال التحويل
                      </a>
                    </Button>
                  </div>
                )}
                {request.receiptDataUrl && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">معاينة الإيصال</p>
                    {request.receiptDataUrl.startsWith('data:image/') ? (
                      <img
                        src={request.receiptDataUrl}
                        alt="إيصال"
                        className="max-h-64 rounded-lg border border-border object-contain"
                      />
                    ) : (
                      <Button variant="outline" size="sm" asChild>
                        <a href={request.receiptDataUrl} target="_blank" rel="noopener noreferrer">
                          فتح ملف الإيصال في نافذة جديدة
                        </a>
                      </Button>
                    )}
                  </div>
                )}
                {request.servicesSummary && (
                  <div>
                    <p className="text-sm font-medium mb-1">الخدمات والأسعار</p>
                    <pre className="text-xs whitespace-pre-wrap bg-background rounded-md p-3 border border-border">
                      {request.servicesSummary}
                    </pre>
                  </div>
                )}
                {request.categories && request.categories.length > 0 && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">التصنيفات: </span>
                    {request.categories.join('، ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Shop Images */}
          <div>
            <h3 className="text-lg font-semibold mb-3">صور المحل</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {request.shopImages.map((image, index) =>
                isRenderableImageAssetUrl(image) ? (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={image} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ) : isVisualAssetUrl(image) ? (
                  <div
                    key={index}
                    className="aspect-video rounded-lg border border-border p-3 flex flex-col justify-center gap-2"
                  >
                    <span className="text-xs text-muted-foreground">ملف / رابط</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href={image} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <ExternalLink className="w-4 h-4 ml-2" />
                        فتح
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-3 text-xs text-muted-foreground break-all"
                  >
                    {image}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <Label className="text-red-600 mb-2 block">سبب الرفض</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="اكتب سبب رفض الطلب..."
                rows={4}
                className="border-red-500/30"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          {!showRejectForm ? (
            <>
              <Button variant="destructive" onClick={() => setShowRejectForm(true)} disabled={saving}>
                <XCircle className="w-4 h-4 ml-2" />
                {request.status === 'pending' ? 'رفض الطلب' : 'إعادة رفض'}
              </Button>
              <Button
                onClick={() => void handleApprove()}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 ml-2" />}
                اعتماد/إعادة اعتماد
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleSuspendAccount()}
                disabled={saving || !canManageBarbers}
              >
                تعليق الحساب
              </Button>
              <Button variant="outline" onClick={() => void handleResendOnboarding()} disabled={saving}>
                إعادة إرسال رسالة الروابط
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleDeleteRequest()}
                disabled={saving || !canManageBarbers}
                className="text-red-600 border-red-500/40 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف الطلب
              </Button>
            </>
          ) : (
            <Button variant="destructive" onClick={() => void handleReject()} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
              تأكيد الرفض
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BarberHardEditDialog({
  barber,
  open,
  onOpenChange,
  onSaved,
}: {
  barber: AdminBarberRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (next: AdminBarberRow) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [latText, setLatText] = useState('');
  const [lngText, setLngText] = useState('');
  const [tier, setTier] = useState<SubscriptionTier>(SubscriptionTier.BRONZE);
  const [isVerified, setIsVerified] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!barber) return;
    setName(barber.name);
    setEmail(barber.email);
    setPhone(barber.phone);
    setCity(barber.city ?? '');
    setAddress(barber.address ?? '');
    setLatText(barber.latitude != null && Number.isFinite(barber.latitude) ? String(barber.latitude) : '');
    setLngText(barber.longitude != null && Number.isFinite(barber.longitude) ? String(barber.longitude) : '');
    setTier(barber.tier);
    setIsVerified(barber.is_verified);
    setIsActive(barber.is_active);
    setProfileImage(barber.profile_image ?? '');
    setCoverImage(barber.cover_image ?? '');
    setSaving(false);
  }, [barber?.id]);

  const handleSave = async () => {
    if (!barber) return;
    const nameTrim = name.trim();
    const emailTrim = email.trim().toLowerCase();
    const phoneTrim = phone.trim();
    const cityTrim = city.trim() || null;
    const addressTrim = address.trim() || 'غير محدد';

    if (!nameTrim) {
      toast({ title: 'الاسم مطلوب', variant: 'destructive' });
      return;
    }
    if (!emailTrim || !emailTrim.includes('@')) {
      toast({ title: 'بريد غير صالح', variant: 'destructive' });
      return;
    }
    if (!phoneTrim) {
      toast({ title: 'رقم الجوال مطلوب', variant: 'destructive' });
      return;
    }

    const latTrim = latText.trim();
    const lngTrim = lngText.trim();
    let latitude: number | null = null;
    let longitude: number | null = null;
    if (latTrim || lngTrim) {
      if (!latTrim || !lngTrim) {
        toast({
          title: 'إحداثيات غير مكتملة',
          description: 'أدخل خط العرض والطول معاً، أو اتركهما فارغين لإزالة الإحداثيات.',
          variant: 'destructive',
        });
        return;
      }
      const latN = Number(latTrim);
      const lngN = Number(lngTrim);
      if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
        toast({ title: 'إحداثيات غير صالحة', variant: 'destructive' });
        return;
      }
      latitude = latN;
      longitude = lngN;
    }

    const profileTrim = profileImage.trim();
    const coverTrim = coverImage.trim();

    setSaving(true);
    const res = await updateBarberRecordRemote(barber.id, {
      name: nameTrim,
      email: emailTrim,
      phone: phoneTrim,
      city: cityTrim,
      address: addressTrim,
      latitude,
      longitude,
      tier,
      is_verified: isVerified,
      is_active: isActive,
      profile_image: profileTrim ? profileTrim : null,
      cover_image: coverTrim ? coverTrim : null,
    });
    setSaving(false);
    if (!res.ok) {
      toast({
        title: 'تعذر حفظ التعديلات',
        description: errorText(res, 'تعذر تحديث بيانات الحلاق.'),
        variant: 'destructive',
      });
      return;
    }

    const next: AdminBarberRow = {
      ...barber,
      name: nameTrim,
      email: emailTrim,
      phone: phoneTrim,
      city: cityTrim,
      address: addressTrim,
      latitude,
      longitude,
      tier,
      is_verified: isVerified,
      is_active: isActive,
      profile_image: profileTrim ? profileTrim : null,
      cover_image: coverTrim ? coverTrim : null,
    };
    toast({ title: 'تم حفظ التعديلات', description: nameTrim });
    onSaved(next);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الحلاق (صلاحية رئيسية)</DialogTitle>
          <DialogDescription>
            يُستخدم للدعم الفني عند تعذّر الحلاق على تعديل بياناته أو صوره. اترك حقول الصور فارغة لإزالة الرابط.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hard-edit-name">اسم الصالون</Label>
              <Input id="hard-edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hard-edit-email">البريد</Label>
              <Input id="hard-edit-email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hard-edit-phone">الجوال</Label>
              <Input id="hard-edit-phone" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hard-edit-city">المدينة (اختياري)</Label>
              <Input id="hard-edit-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hard-edit-address">العنوان</Label>
              <Textarea id="hard-edit-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hard-edit-lat">خط العرض</Label>
              <Input id="hard-edit-lat" dir="ltr" value={latText} onChange={(e) => setLatText(e.target.value)} placeholder="مثال: 24.7136" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hard-edit-lng">خط الطول</Label>
              <Input id="hard-edit-lng" dir="ltr" value={lngText} onChange={(e) => setLngText(e.target.value)} placeholder="مثال: 46.6753" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>الباقة</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as SubscriptionTier)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الباقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SubscriptionTier.BRONZE}>🥉 برونزي</SelectItem>
                  <SelectItem value={SubscriptionTier.GOLD}>🥇 ذهبي</SelectItem>
                  <SelectItem value={SubscriptionTier.DIAMOND}>💎 ماسي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 sm:col-span-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">موثّق</p>
                <p className="text-xs text-muted-foreground">يظهر للمستخدمين كحساب موثّق عند تفعيله في الواجهة.</p>
              </div>
              <Switch checked={isVerified} onCheckedChange={setIsVerified} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 sm:col-span-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">ظهور للعامة</p>
                <p className="text-xs text-muted-foreground">يتحكم في ظهور الصالون في الخريطة/القوائم حسب منطق التطبيق.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hard-edit-profile">رابط صورة الملف الشخصي</Label>
              <Input id="hard-edit-profile" dir="ltr" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hard-edit-cover">رابط صورة الغلاف</Label>
              <Input id="hard-edit-cover" dir="ltr" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            إلغاء
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving || !barber}>
            {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Barbers Section
function BarbersSection({
  refreshNonce,
  onStatsNeedRefresh,
  canManage,
  canRootHardEdit,
}: {
  refreshNonce: number;
  onStatsNeedRefresh: () => void;
  canManage: boolean;
  canRootHardEdit: boolean;
}) {
  const [rows, setRows] = useState<AdminBarberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mergingId, setMergingId] = useState<string | null>(null);
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [broadcastingEmails, setBroadcastingEmails] = useState(false);
  const [hardEditRow, setHardEditRow] = useState<AdminBarberRow | null>(null);

  const effectiveCanManage = canManage || canRootHardEdit;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listBarbersForAdmin().then((list) => {
      if (!cancelled) {
        setRows(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [refreshNonce]);

  const onToggleActive = async (row: AdminBarberRow, next: boolean) => {
    setUpdatingId(row.id);
    const res = await setBarberActiveRemote(row.id, next);
    setUpdatingId(null);
    if (!res.ok) {
      toast({ title: 'تعذر التحديث', description: errorText(res, 'تعذر تحديث الحالة.'), variant: 'destructive' });
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: next } : r)));
    toast({ title: next ? 'تم التفعيل' : 'تم التعطيل', description: row.name });
    onStatsNeedRefresh();
  };

  const onDeleteBarber = async (row: AdminBarberRow) => {
    if (!effectiveCanManage) return;
    if (!window.confirm(`تأكيد حذف حساب الحلاق "${row.name}"؟`)) return;
    setDeletingId(row.id);
    const res = await deleteBarberRemote(row.id);
    setDeletingId(null);
    if (!res.ok) {
      toast({ title: 'تعذر حذف الحلاق', description: errorText(res, 'تعذر حذف الحلاق.'), variant: 'destructive' });
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    toast({ title: 'تم حذف الحلاق', description: row.name });
    onStatsNeedRefresh();
  };

  const duplicateContactMap = useMemo(() => {
    const keyMap = new Map<string, number>();
    for (const r of rows) {
      const emailKey = r.email.trim().toLowerCase();
      const phoneKey = r.phone.trim();
      if (emailKey) keyMap.set(`e:${emailKey}`, (keyMap.get(`e:${emailKey}`) ?? 0) + 1);
      if (phoneKey) keyMap.set(`p:${phoneKey}`, (keyMap.get(`p:${phoneKey}`) ?? 0) + 1);
    }
    return keyMap;
  }, [rows]);

  const isDuplicateRow = (row: AdminBarberRow): boolean =>
    (duplicateContactMap.get(`e:${row.email.trim().toLowerCase()}`) ?? 0) > 1 ||
    (duplicateContactMap.get(`p:${row.phone.trim()}`) ?? 0) > 1;

  const visibleRows = useMemo(
    () => (duplicatesOnly ? rows.filter((r) => isDuplicateRow(r)) : rows),
    [rows, duplicatesOnly, duplicateContactMap]
  );

  const keepRowAndDeleteDuplicates = async (keeper: AdminBarberRow) => {
    if (!effectiveCanManage) return;
    const emailKey = keeper.email.trim().toLowerCase();
    const phoneKey = keeper.phone.trim();
    const dupes = rows.filter(
      (r) =>
        r.id !== keeper.id &&
        ((emailKey && r.email.trim().toLowerCase() === emailKey) ||
          (phoneKey && r.phone.trim() === phoneKey))
    );
    if (dupes.length === 0) return;
    if (
      !window.confirm(
        `سيتم الإبقاء على "${keeper.name}" وحذف ${dupes.length} حساب/حسابات مكررة. هل أنت متأكد؟`
      )
    ) {
      return;
    }
    setMergingId(keeper.id);
    for (const dupe of dupes) {
      const res = await deleteBarberRemote(dupe.id);
      if (!res.ok) {
        setMergingId(null);
        toast({
          title: 'تعذر حذف بعض المكررات',
          description: `${dupe.name}: ${errorText(res, 'تعذر حذف الحساب المكرر.')}`,
          variant: 'destructive',
        });
        return;
      }
    }
    setRows((prev) => prev.filter((r) => !dupes.some((d) => d.id === r.id)));
    setMergingId(null);
    toast({
      title: 'تم تنظيف التكرار',
      description: `أُبقي على ${keeper.name} وحُذف ${dupes.length} حساب مكرر.`,
    });
    onStatsNeedRefresh();
  };

  const onBroadcastOnboardingEmails = async () => {
    if (!canManage) return;
    if (
      !window.confirm(
        'سيتم إرسال بريد تعليمات وروابط لوحة التحكم إلى جميع الحلاقين النشطين. هل تريد المتابعة؟'
      )
    ) {
      return;
    }
    setBroadcastingEmails(true);
    const res = await sendOnboardingEmailsForActiveBarbersRemote(300);
    setBroadcastingEmails(false);
    if (!res.ok) {
      toast({
        title: 'تعذر إرسال البريد الجماعي',
        description: errorText(res, 'تعذر إرسال البريد الجماعي.'),
        variant: 'destructive',
      });
      return;
    }
    const failLines =
      res.failed > 0 && res.failedDetails?.length
        ? ` · أخطاء: ${res.failedDetails
            .slice(0, 3)
            .map((f) => `${f.email}: ${f.error}`)
            .join(' | ')}`
        : '';
    const invalidLine =
      res.skippedInvalid > 0
        ? ` · بريد غير صالح في قاعدة البيانات: ${res.skippedInvalid}${res.invalidSamples?.length ? ` (مثال: ${res.invalidSamples.slice(0, 2).join(', ')})` : ''}`
        : '';
    const dupLine = res.skippedDuplicate > 0 ? ` · تخطّي مكرر: ${res.skippedDuplicate}` : '';
    toast({
      title: 'تم إرسال التعليمات البريدية',
      description: `صفوف: ${res.attempted} · مستلمون فريدون: ${res.uniqueRecipients} · أُرسل: ${res.sent} · فشل API: ${res.failed}${dupLine}${invalidLine}${failLines}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">إدارة الحلاقين</h2>
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <div className="text-sm text-muted-foreground">
              إجمالي الحسابات: <span className="font-semibold text-foreground">{rows.length}</span>
              {' · '}
              المكررة: <span className="font-semibold text-red-600">{rows.filter((r) => isDuplicateRow(r)).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!canManage || broadcastingEmails}
                onClick={() => void onBroadcastOnboardingEmails()}
              >
                {broadcastingEmails ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                إرسال تعليمات لجميع الحلاقين
              </Button>
              <span className="text-xs text-muted-foreground">عرض المكررات فقط</span>
              <Switch checked={duplicatesOnly} onCheckedChange={setDuplicatesOnly} />
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري التحميل…
            </div>
          ) : visibleRows.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">لا توجد صفوف في جدول الحلاقين أو RLS يمنع القراءة.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>المدينة</TableHead>
                  <TableHead>الباقة</TableHead>
                  <TableHead>موثّق</TableHead>
                  <TableHead className="text-center">ظهور للعامة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="max-w-[140px] truncate" title={row.email}>
                      {row.email}
                    </TableCell>
                    <TableCell>{row.city ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {row.tier === SubscriptionTier.DIAMOND && '💎 ماسي'}
                        {row.tier === SubscriptionTier.GOLD && '🥇 ذهبي'}
                        {row.tier === SubscriptionTier.BRONZE && '🥉 برونزي'}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.is_verified ? 'نعم' : 'لا'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={row.is_active}
                          disabled={!effectiveCanManage || updatingId === row.id}
                          onCheckedChange={(v) => void onToggleActive(row, v)}
                          aria-label={row.is_active ? 'تعطيل الظهور' : 'تفعيل الظهور'}
                        />
                        {updatingId === row.id ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isDuplicateRow(row) ? (
                          <Badge variant="destructive">مكرر</Badge>
                        ) : null}
                        {isDuplicateRow(row) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!effectiveCanManage || mergingId === row.id || deletingId === row.id}
                            onClick={() => void keepRowAndDeleteDuplicates(row)}
                          >
                            {mergingId === row.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'الإبقاء على هذا'
                            )}
                          </Button>
                        ) : null}
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={!effectiveCanManage || deletingId === row.id || mergingId === row.id}
                          onClick={() => void onDeleteBarber(row)}
                        >
                          {deletingId === row.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        {canRootHardEdit ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={mergingId === row.id || deletingId === row.id}
                            onClick={() => setHardEditRow(row)}
                            title="تعديل بيانات وصور الحلاق"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <BarberHardEditDialog
        barber={hardEditRow}
        open={Boolean(hardEditRow)}
        onOpenChange={(open) => {
          if (!open) setHardEditRow(null);
        }}
        onSaved={(next) => {
          setRows((prev) => prev.map((r) => (r.id === next.id ? next : r)));
          onStatsNeedRefresh();
        }}
      />
    </motion.div>
  );
}

// Payments Section
function PaymentsSection({
  payments,
  onViewPayment,
  canReview,
}: {
  payments: Payment[];
  onViewPayment: (payment: Payment) => void;
  canReview: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">إدارة المدفوعات</h2>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              لا توجد مدفوعات للعرض. عند تعطيل البيانات التجريبية يظهر هنا ما في جدول payments بعد ضبط RLS.
            </CardContent>
          </Card>
        ) : null}
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{payment.barberName}</h3>
                    <Badge>
                      {payment.tier === SubscriptionTier.DIAMOND && '💎 ماسي'}
                      {payment.tier === SubscriptionTier.GOLD && '🥇 ذهبي'}
                      {payment.tier === SubscriptionTier.BRONZE && '🥉 برونزي'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>المبلغ: <span className="font-semibold text-foreground">{payment.amount} ر.س</span></p>
                    <p>الفترة: {payment.period}</p>
                    <p>طريقة الدفع: {payment.method === 'bank_transfer' ? 'تحويل بنكي' : 'بطاقة'}</p>
                    <p>تاريخ التقديم: {payment.submittedAt}</p>
                  </div>
                </div>
                <Button onClick={() => onViewPayment(payment)} disabled={!canReview}>
                  <Eye className="w-4 h-4 ml-2" />
                  {canReview ? 'مراجعة الإيصال' : 'عرض فقط'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// Payment Review Dialog
function PaymentReviewDialog({
  payment,
  onClose,
  onAfterDecision,
}: {
  payment: Payment;
  onClose: () => void;
  onAfterDecision: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const isMockRow = shouldShowAdminMocks() && MOCK_PAYMENTS.some((p) => p.id === payment.id);

  const handleConfirm = async () => {
    if (payment.status !== 'pending') {
      toast({ title: 'لا يمكن المعالجة', description: 'هذه العملية ليست قيد الانتظار.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    if (isMockRow) {
      toast({ title: 'تأكيد تجريبي', description: 'هذه دفعة من العرض التجريبي فقط.' });
      setSaving(false);
      onClose();
      onAfterDecision();
      return;
    }
    const res = await updatePaymentStatusRemote(payment.id, 'confirmed');
    setSaving(false);
    if (!res.ok) {
      toast({ title: 'فشل التحديث', description: errorText(res, 'تعذر تحديث حالة الدفع.'), variant: 'destructive' });
      return;
    }
    toast({ title: 'تم تأكيد الدفع' });
    onClose();
    onAfterDecision();
  };

  const handleReject = async () => {
    if (payment.status !== 'pending') {
      toast({ title: 'لا يمكن المعالجة', description: 'هذه العملية ليست قيد الانتظار.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    if (isMockRow) {
      toast({ title: 'رفض تجريبي', description: 'هذه دفعة من العرض التجريبي فقط.' });
      setSaving(false);
      onClose();
      onAfterDecision();
      return;
    }
    const res = await updatePaymentStatusRemote(payment.id, 'rejected');
    setSaving(false);
    if (!res.ok) {
      toast({ title: 'فشل التحديث', description: errorText(res, 'تعذر تحديث حالة الدفع.'), variant: 'destructive' });
      return;
    }
    toast({ title: 'تم رفض الدفع' });
    onClose();
    onAfterDecision();
  };

  return (
    <Dialog open={!!payment} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>مراجعة إيصال الدفع</DialogTitle>
          <DialogDescription>
            قم بمراجعة الإيصال قبل تأكيد أو رفض الدفع
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>اسم الحلاق</Label>
              <p className="text-sm font-medium mt-1">{payment.barberName}</p>
            </div>
            <div>
              <Label>المبلغ</Label>
              <p className="text-sm font-medium mt-1">{payment.amount} ر.س</p>
            </div>
            <div>
              <Label>الباقة</Label>
              <Badge className="mt-1">
                {payment.tier === SubscriptionTier.DIAMOND && '💎 ماسي'}
                {payment.tier === SubscriptionTier.GOLD && '🥇 ذهبي'}
                {payment.tier === SubscriptionTier.BRONZE && '🥉 برونزي'}
              </Badge>
            </div>
            <div>
              <Label>الفترة</Label>
              <p className="text-sm font-medium mt-1">{payment.period}</p>
            </div>
          </div>

          {payment.receipt && (
            <div>
              <Label className="mb-2 block">إيصال التحويل البنكي</Label>
              {isVisualAssetUrl(payment.receipt) ? (
                <div className="aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={payment.receipt} alt="إيصال" className="w-full h-full object-cover" />
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <a href={payment.receipt} target="_blank" rel="noopener noreferrer">
                    فتح الإيصال في نافذة جديدة
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          <Button variant="destructive" onClick={() => void handleReject()} disabled={saving || payment.status !== 'pending'}>
            {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <XCircle className="w-4 h-4 ml-2" />}
            رفض الدفع
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            disabled={saving || payment.status !== 'pending'}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 ml-2" />}
            تأكيد الدفع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommandCenterSection({
  leads,
  stats,
  requests,
  payments,
  canManage,
}: {
  leads: CommandCenterLead[];
  stats: AdminStats;
  requests: SubscriptionRequest[];
  payments: Payment[];
  canManage: boolean;
}) {
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.halaqmap.com';
  const partnersLandingUrl = `${siteOrigin}/#/partners`;
  const partnersRegisterUrl = `${siteOrigin}/#/partners/register`;
  const privatePartnerFaq = [
    {
      q: 'هل الصفحة مناسبة للإرسال عبر واتساب والإيميل؟',
      a: 'نعم، بصيغة تحويل مباشرة ورسائل تسويقية واضحة وروابط انضمام جاهزة.',
    },
    {
      q: 'هل يمكن توسيعها لاحقاً لحملات مناطق جديدة؟',
      a: 'نعم، الهيكل مرن لتحديث الرسائل والتوسع بدون إعادة البناء من الصفر.',
    },
    {
      q: 'كيف نقنع الحلاق بسرعة الحجز؟',
      a: 'نركز على العائد العملي: ظهور أمام عميل قريب + تواصل مباشر + سرعة البدء.',
    },
    {
      q: 'هل يحتاج الشريك لفريق تسويق داخلي؟',
      a: 'لا، مسار الشركاء مبني لقرار سريع وتسجيل مباشر بأقل احتكاك.',
    },
  ] as const;

  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<'all' | string>('all');
  const [channel, setChannel] = useState<'all' | CommandLeadChannel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CommandLeadStatus>('all');
  const [tierFilter, setTierFilter] = useState<'all' | CommandCenterLead['tierFit']>('all');
  const [onlyDue, setOnlyDue] = useState(false);
  const [leadState, setLeadState] = useState<Record<string, LeadRuntimeState>>({});
  const [sopChecks, setSopChecks] = useState<Record<string, boolean>>({});
  const todayIso = new Date().toISOString().slice(0, 10);
  const jsDay = new Date().getDay();
  const sundayFirstToSaturday = [0, 1, 2, 3, 4, 5, 6];
  const dayPlan = WEEKLY_SOP_PLAN[sundayFirstToSaturday.indexOf(jsDay)];
  const sopKeyToday = `${todayIso}-${dayPlan.day}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMMAND_CENTER_STATE_KEY);
      if (!raw) return;
      setLeadState(JSON.parse(raw) as Record<string, LeadRuntimeState>);
    } catch {
      /* ignore invalid persisted state */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(COMMAND_CENTER_STATE_KEY, JSON.stringify(leadState));
  }, [leadState]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMMAND_CENTER_SOP_CHECK_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, Record<string, boolean>>;
      setSopChecks(parsed[sopKeyToday] ?? {});
    } catch {
      /* ignore invalid stored checklist */
    }
  }, [sopKeyToday]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMMAND_CENTER_SOP_CHECK_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, Record<string, boolean>>) : {};
      parsed[sopKeyToday] = sopChecks;
      localStorage.setItem(COMMAND_CENTER_SOP_CHECK_KEY, JSON.stringify(parsed));
    } catch {
      /* ignore storage failure */
    }
  }, [sopChecks, sopKeyToday]);

  const regionOptions = useMemo(
    () => Array.from(new Set(leads.map((l) => l.region))).sort((a, b) => a.localeCompare(b, 'ar')),
    [leads]
  );

  const pipelineCounts = useMemo(() => {
    const init: Record<CommandLeadStatus, number> = {
      new: 0,
      contacted: 0,
      waiting: 0,
      won: 0,
      lost: 0,
    };
    leads.forEach((lead) => {
      const st = leadState[lead.id]?.status ?? 'new';
      init[st] += 1;
    });
    return init;
  }, [leads, leadState]);

  const dueSummary = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;
    leads.forEach((lead) => {
      const d = leadState[lead.id]?.followUpDate;
      if (!d) return;
      if (d === todayIso) dueToday += 1;
      if (d < todayIso) overdue += 1;
    });
    return { dueToday, overdue };
  }, [leads, leadState, todayIso]);

  const contactBase = pipelineCounts.contacted + pipelineCounts.waiting + pipelineCounts.won + pipelineCounts.lost;
  const winRate = contactBase > 0 ? Math.round((pipelineCounts.won / contactBase) * 100) : 0;
  const pendingTouch = pipelineCounts.new + pipelineCounts.waiting + dueSummary.overdue;

  const sopChecklistItems = [
    { id: 'open-due', label: 'مراجعة الحالات المستحقة (اليوم + المتأخرة)' },
    { id: 'execute-outreach', label: `تنفيذ هدف اليوم: ${dayPlan.target} تواصل` },
    { id: 'close-loop', label: 'تحديث الحالات والتواريخ وتصدير CSV بنهاية الجلسة' },
  ];

  const csvEscape = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const state = leadState[lead.id];
      const st = state?.status ?? 'new';
      const matchesRegion = region === 'all' || lead.region === region;
      const matchesChannel = channel === 'all' || lead.channel === channel;
      const matchesStatus = statusFilter === 'all' || st === statusFilter;
      const matchesTier = tierFilter === 'all' || lead.tierFit === tierFilter;
      const followUpDate = state?.followUpDate;
      const matchesDue = !onlyDue || (!!followUpDate && followUpDate <= todayIso);
      const matchesQuery =
        q.length === 0 ||
        lead.name.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        (lead.instagram ?? '').toLowerCase().includes(q) ||
        (lead.phone ?? '').includes(q) ||
        (state?.notes ?? '').toLowerCase().includes(q);
      return matchesRegion && matchesChannel && matchesStatus && matchesTier && matchesDue && matchesQuery;
    });
  }, [leads, leadState, query, region, channel, statusFilter, tierFilter, onlyDue, todayIso]);

  const setLeadPatch = (id: string, patch: Partial<LeadRuntimeState>) => {
    setLeadState((prev) => ({
      ...prev,
      [id]: {
        status: prev[id]?.status ?? 'new',
        ...prev[id],
        ...patch,
      },
    }));
  };

  const outreachMessage =
    'السلام عليكم، معكم فريق منصة حلاق ماب. نرغب بدعوتكم للانضمام للمنصة وزيادة الظهور المحلي للعملاء القريبين. هل يمكن إرسال التفاصيل؟';

  const copyLeadPitch = async (lead: CommandCenterLead) => {
    const text = `مرحباً ${lead.name}،\n${outreachMessage}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'تم نسخ الرسالة', description: `جاهزة للإرسال إلى ${lead.name}` });
    } catch {
      toast({ title: 'تعذر النسخ', description: 'انسخ الرسالة يدوياً.', variant: 'destructive' });
    }
  };

  const openLeadChannel = (lead: CommandCenterLead) => {
    if (lead.phone) {
      window.open(buildWaDeepLink(lead.phone, outreachMessage), '_blank');
      return;
    }
    if (lead.instagram) {
      window.open(`https://instagram.com/${lead.instagram.replace('@', '')}`, '_blank');
      return;
    }
    if (lead.email) {
      window.open(
        `mailto:${lead.email}?subject=${encodeURIComponent('دعوة انضمام إلى منصة حلاق ماب')}&body=${encodeURIComponent(outreachMessage)}`,
        '_blank'
      );
      return;
    }
    if (lead.website) {
      window.open(lead.website, '_blank');
    }
  };

  const downloadCsv = () => {
    const headers = [
      'name',
      'city',
      'region',
      'tier_fit',
      'channel',
      'status',
      'phone',
      'email',
      'instagram',
      'website',
      'assigned_to',
      'follow_up_date',
      'last_contact_at',
      'notes',
    ];

    const rows = filteredLeads.map((lead) => {
      const state = leadState[lead.id];
      const status = state?.status ?? 'new';
      return [
        lead.name,
        lead.city,
        lead.region,
        lead.tierFit,
        lead.channel,
        status,
        lead.phone ?? '',
        lead.email ?? '',
        lead.instagram ?? '',
        lead.website ?? '',
        state?.assignedTo ?? '',
        state?.followUpDate ?? '',
        state?.lastContactAt ?? '',
        state?.notes ?? '',
      ].map((v) => csvEscape(v));
    });

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `command-center-${todayIso}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'تم تصدير CSV', description: `${filteredLeads.length} جهة اتصال` });
  };

  const statusMeta: Record<CommandLeadStatus, { label: string; className: string }> = {
    new: { label: 'جديد', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    contacted: { label: 'تم التواصل', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    waiting: { label: 'بانتظار الرد', className: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
    won: { label: 'تم الاشتراك', className: 'bg-green-500/10 text-green-600 border-green-500/30' },
    lost: { label: 'تعذر الإغلاق', className: 'bg-red-500/10 text-red-600 border-red-500/30' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">غرفة القيادة</h2>
          <p className="text-sm text-muted-foreground mt-1">
            متابعة حملة التواصل، التحويل، والقرارات التشغيلية اليومية من مكان واحد.
          </p>
        </div>
      </div>

      <Card className="mb-6 border-primary/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">SOP التشغيل الأسبوعي</CardTitle>
          <CardDescription>
            خطة اليوم: <span className="font-semibold text-foreground">{dayPlan.day}</span> — {dayPlan.focus}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">هدف تواصل اليوم</p>
              <p className="text-2xl font-bold">{dayPlan.target}</p>
              <p className="text-xs text-muted-foreground mt-1">{dayPlan.note}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">معدل الإغلاق الحالي</p>
              <p className="text-2xl font-bold text-green-600">{winRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">اعتمادًا على الحالات المتابعة</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">أولوية العمل الآن</p>
              <p className="text-2xl font-bold text-amber-600">{pendingTouch}</p>
              <p className="text-xs text-muted-foreground mt-1">جديد + بانتظار الرد + متأخر</p>
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-sm font-semibold">Checklist اليوم</p>
            {sopChecklistItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                <span className="text-sm">{item.label}</span>
                <Switch
                  checked={!!sopChecks[item.id]}
                  onCheckedChange={(checked) => setSopChecks((prev) => ({ ...prev, [item.id]: checked }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-red-600">بطاقة طوارئ لوحة التحكم (5 دقائق)</CardTitle>
          <CardDescription>
            مرجع سريع وقت الأزمات — الهدف استعادة الوصول أولًا ثم التحليل.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-border p-3 space-y-1">
            <p className="text-sm font-semibold">1) احتواء فوري (دقيقة)</p>
            <p className="text-xs text-muted-foreground">
              أوقف أي نشر/تعديل جديد وحدد نوع العطل: 404 / شاشة بيضاء / فشل دخول / صلاحيات.
            </p>
          </div>
          <div className="rounded-md border border-border p-3 space-y-1">
            <p className="text-sm font-semibold">2) استعادة سريعة (2-3 دقائق)</p>
            <p className="text-xs text-muted-foreground">
              نفّذ Rollback لآخر نسخة مستقرة، ثم تحقق من رابط الأدمن بالـ hash ومتغيرات البيئة.
            </p>
          </div>
          <div className="rounded-md border border-border p-3 space-y-1">
            <p className="text-sm font-semibold">3) دخول طوارئ</p>
            <p className="text-xs text-muted-foreground">
              جرّب حساب Bootstrap Admin. عند النجاح: ثبّت الوضع ولا تنفّذ تغييرات إضافية فورًا.
            </p>
          </div>
          <div className="rounded-md border border-border p-3 space-y-1">
            <p className="text-sm font-semibold">4) توثيق ومنع تكرار</p>
            <p className="text-xs text-muted-foreground">
              سجل السبب الجذري والإجراء الوقائي في سجل الاستقرار بنفس اليوم.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-primary/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            مواد تشغيل تسويقي (داخلي فقط)
            <Badge variant="destructive" className="text-xs">غير ظاهر للشركاء</Badge>
          </CardTitle>
          <CardDescription>
            هذه المواد تخص فريق التسويق وغرفة القيادة فقط، وتُمنع من الظهور في صفحة الشركاء العامة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <p className="font-semibold">روابط الحملة المعتمدة</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  صفحة الشركاء:{' '}
                  <a className="underline" href={partnersLandingUrl} target="_blank" rel="noopener noreferrer">
                    {partnersLandingUrl}
                  </a>
                </p>
                <p>
                  التسجيل المباشر:{' '}
                  <a className="underline" href={partnersRegisterUrl} target="_blank" rel="noopener noreferrer">
                    {partnersRegisterUrl}
                  </a>
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-semibold mb-1">نص واتساب داخلي مقترح</p>
                <p className="text-xs text-muted-foreground leading-6">
                  انضم الآن إلى منصة حلاق ماب واحجز بنرك التسويقي قبل موجة التوسع القادمة. تفاصيل الانضمام:
                  {' '}
                  {partnersLandingUrl}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="font-semibold mb-3">QR تشغيل الحملات الميدانية</p>
              <div className="mx-auto w-fit rounded-lg bg-white p-3">
                <QRCode value={partnersLandingUrl} size={148} />
              </div>
              <p className="text-xs text-muted-foreground mt-3 break-all">{partnersLandingUrl}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="font-semibold mb-3">أسئلة تشغيلية داخلية (مرجع الفريق)</p>
            <div className="grid gap-3 md:grid-cols-2">
              {privatePartnerFaq.map((item) => (
                <div key={item.q} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm font-semibold mb-1">{item.q}</p>
                  <p className="text-xs text-muted-foreground leading-6">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatsCard title="طلبات بانتظار المراجعة" value={stats.pendingRequests} icon={FileText} color="yellow" />
        <StatsCard title="مدفوعات بانتظار التأكيد" value={stats.pendingPayments} icon={CreditCard} color="purple" />
        <StatsCard title="أهداف التواصل" value={leads.length} subtitle="قائمة قابلة للتوسع" icon={Users} color="blue" />
        <StatsCard
          title="إشغال اليوم"
          value={requests.filter((r) => r.status === 'pending').length + payments.filter((p) => p.status === 'pending').length}
          subtitle="طلبات + مدفوعات تحتاج قرار"
          icon={AlertCircle}
          color="green"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7 mb-6">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">جديد</p><p className="text-2xl font-bold">{pipelineCounts.new}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">تم التواصل</p><p className="text-2xl font-bold">{pipelineCounts.contacted}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">بانتظار الرد</p><p className="text-2xl font-bold">{pipelineCounts.waiting}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">تم الاشتراك</p><p className="text-2xl font-bold text-green-600">{pipelineCounts.won}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">تعذر الإغلاق</p><p className="text-2xl font-bold text-red-600">{pipelineCounts.lost}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">متابعة اليوم</p><p className="text-2xl font-bold text-amber-600">{dueSummary.dueToday}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">متأخرة</p><p className="text-2xl font-bold text-red-600">{dueSummary.overdue}</p></CardContent></Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث بالاسم/المدينة/الانستقرام..." />
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue placeholder="المنطقة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المناطق</SelectItem>
                {regionOptions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={channel} onValueChange={(value) => setChannel(value as 'all' | CommandLeadChannel)}>
              <SelectTrigger><SelectValue placeholder="قناة التواصل" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل القنوات</SelectItem>
                <SelectItem value="whatsapp">واتساب</SelectItem>
                <SelectItem value="instagram">انستقرام</SelectItem>
                <SelectItem value="email">بريد</SelectItem>
                <SelectItem value="website">موقع</SelectItem>
                <SelectItem value="phone">اتصال</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | CommandLeadStatus)}>
              <SelectTrigger><SelectValue placeholder="حالة المتابعة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="contacted">تم التواصل</SelectItem>
                <SelectItem value="waiting">بانتظار الرد</SelectItem>
                <SelectItem value="won">تم الاشتراك</SelectItem>
                <SelectItem value="lost">تعذر الإغلاق</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={(value) => setTierFilter(value as 'all' | CommandCenterLead['tierFit'])}>
              <SelectTrigger><SelectValue placeholder="ملاءمة الباقة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الباقات</SelectItem>
                <SelectItem value="gold">ذهبي</SelectItem>
                <SelectItem value="diamond">ماسي</SelectItem>
                <SelectItem value="mixed">ذهبي/ماسي</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={async () => {
                const lines = filteredLeads.map((lead) => `${lead.name} | ${lead.city} | ${lead.phone ?? lead.instagram ?? lead.email ?? lead.website ?? '—'}`);
                try {
                  await navigator.clipboard.writeText(lines.join('\n'));
                  toast({ title: 'تم نسخ القائمة', description: `${filteredLeads.length} جهة اتصال` });
                } catch {
                  toast({ title: 'تعذر النسخ', variant: 'destructive' });
                }
              }}
            >
              <Copy className="w-4 h-4 ml-2" />
              نسخ القائمة الحالية
            </Button>
            <div className="flex items-center justify-between rounded-md border px-3">
              <span className="text-sm text-muted-foreground">فقط مستحقات المتابعة</span>
                <Switch checked={onlyDue} onCheckedChange={setOnlyDue} disabled={!canManage} />
            </div>
            <Button variant="outline" onClick={downloadCsv} disabled={!canManage}>
              <Download className="w-4 h-4 ml-2" />
              تصدير CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredLeads.map((lead) => {
          const state = leadState[lead.id];
          const status = state?.status ?? 'new';
          const followUp = state?.followUpDate;
          const isOverdue = !!followUp && followUp < todayIso;
          const isDueToday = !!followUp && followUp === todayIso;
          return (
            <Card
              key={lead.id}
              className={isOverdue ? 'border-red-500/40' : isDueToday ? 'border-amber-500/40' : undefined}
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{lead.name}</h3>
                      <Badge variant="outline">{lead.region} — {lead.city}</Badge>
                      <Badge className={statusMeta[status].className}>{statusMeta[status].label}</Badge>
                      <Badge variant="secondary">
                        {lead.tierFit === 'diamond' ? 'ملائم للماسي' : lead.tierFit === 'gold' ? 'ملائم للذهبي' : 'ذهبي/ماسي'}
                      </Badge>
                      {isOverdue ? <Badge variant="destructive">متابعة متأخرة</Badge> : null}
                      {!isOverdue && isDueToday ? <Badge className="bg-amber-500 text-white">متابعة اليوم</Badge> : null}
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-3 flex-wrap">
                      {lead.phone ? <span dir="ltr">📞 {lead.phone}</span> : null}
                      {lead.email ? <span dir="ltr">✉️ {lead.email}</span> : null}
                      {lead.instagram ? <span dir="ltr">{lead.instagram}</span> : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      آخر تواصل: {state?.lastContactAt ?? 'لم يتم بعد'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      متابعة قادمة: {state?.followUpDate ?? 'غير محددة'}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:w-56">
                    <Button onClick={() => openLeadChannel(lead)} disabled={!canManage}>
                      <ExternalLink className="w-4 h-4 ml-2" />
                      فتح قناة التواصل
                    </Button>
                    <Button variant="outline" onClick={() => void copyLeadPitch(lead)} disabled={!canManage}>
                      <Copy className="w-4 h-4 ml-2" />
                      نسخ رسالة جاهزة
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 mt-4 md:grid-cols-4">
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setLeadPatch(lead.id, { status: value as CommandLeadStatus, lastContactAt: new Date().toLocaleString('ar-SA') })
                    }
                    disabled={!canManage}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">جديد</SelectItem>
                      <SelectItem value="contacted">تم التواصل</SelectItem>
                      <SelectItem value="waiting">بانتظار الرد</SelectItem>
                      <SelectItem value="won">تم الاشتراك</SelectItem>
                      <SelectItem value="lost">تعذر الإغلاق</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={state?.assignedTo ?? ''}
                    onChange={(e) => setLeadPatch(lead.id, { assignedTo: e.target.value })}
                    placeholder="المسؤول (اختياري)"
                    disabled={!canManage}
                  />
                  <Input
                    value={state?.notes ?? ''}
                    onChange={(e) => setLeadPatch(lead.id, { notes: e.target.value })}
                    placeholder="ملاحظة مختصرة"
                    disabled={!canManage}
                  />
                  <Input
                    type="date"
                    value={state?.followUpDate ?? ''}
                    onChange={(e) => setLeadPatch(lead.id, { followUpDate: e.target.value })}
                    disabled={!canManage}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

// Messages Section
function MessagesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">الرسائل والدعم الفني</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center py-8">
            قريباً: شات مباشر مع الحلاقين للدعم الفني والاستفسارات
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Settings Section
function SettingsSection({
  adminEmail,
  canManageAdmins,
  bootstrapAdmin,
}: {
  adminEmail: string;
  canManageAdmins: boolean;
  bootstrapAdmin: boolean;
}) {
  const [vatEnabled, setVatEnabled] = useState(() => getPlatformVatSettings().enabled);
  const [vatRateInput, setVatRateInput] = useState(() => String(getPlatformVatSettings().ratePercent));
  const [adminRows, setAdminRows] = useState<AdminRoleRow[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermissions>(FULL_ADMIN_PERMISSIONS);

  useEffect(() => {
    const sync = () => {
      const s = getPlatformVatSettings();
      setVatEnabled(s.enabled);
      setVatRateInput(String(s.ratePercent));
    };
    window.addEventListener('halaqmap-vat-settings', sync);
    return () => window.removeEventListener('halaqmap-vat-settings', sync);
  }, []);

  const parsedRate = parseFloat(String(vatRateInput).replace(',', '.'));
  const rateForPreview = Number.isFinite(parsedRate) ? parsedRate : 15;
  const preview = calcVatBreakdown(100, { enabled: vatEnabled, ratePercent: rateForPreview });

  const refreshAdmins = useCallback(async () => {
    if (!canManageAdmins && !bootstrapAdmin) return;
    setAdminLoading(true);
    try {
      const rows = await listAdminRoles();
      setAdminRows(rows);
    } finally {
      setAdminLoading(false);
    }
  }, [canManageAdmins, bootstrapAdmin]);

  useEffect(() => {
    void refreshAdmins();
  }, [refreshAdmins]);

  const handleSaveVat = () => {
    savePlatformVatSettings({
      enabled: vatEnabled,
      ratePercent: rateForPreview,
    });
    toast({
      title: 'تم حفظ إعدادات الضريبة',
      description: vatEnabled
        ? `مفعّلة — النسبة المعروضة ${rateForPreview}% (تُحسب تلقائياً في صفحات الدفع).`
        : 'معطّلة — تُعرض أتعاب الاشتراك فقط دون ضريبة في الواجهة.',
    });
  };

  const createOrUpdateAdmin = async () => {
    if (!canManageAdmins) return;
    if (!newAdminEmail.trim()) {
      toast({ title: 'أدخل بريد الأدمن', variant: 'destructive' });
      return;
    }
    const res = await upsertAdminRole({
      email: newAdminEmail,
      displayName: newAdminName,
      isActive: true,
      permissions: newAdminPermissions,
      createdByEmail: adminEmail,
    });
    if (!res.ok) {
      toast({ title: 'تعذر حفظ الأدمن', description: errorText(res, 'تعذر حفظ بيانات الأدمن.'), variant: 'destructive' });
      return;
    }
    toast({ title: 'تم حفظ الأدمن وصلاحياته' });
    setNewAdminEmail('');
    setNewAdminName('');
    setNewAdminPermissions(FULL_ADMIN_PERMISSIONS);
    await refreshAdmins();
  };

  const toggleAdminPermission = async (row: AdminRoleRow, permission: AdminPermissionKey, checked: boolean) => {
    const nextPermissions: AdminPermissions = { ...row.permissions, [permission]: checked };
    const res = await upsertAdminRole({
      email: row.email,
      displayName: row.display_name ?? undefined,
      isActive: row.is_active,
      permissions: nextPermissions,
      createdByEmail: adminEmail,
    });
    if (!res.ok) {
      toast({ title: 'تعذر تحديث الصلاحية', description: errorText(res, 'تعذر تحديث الصلاحية.'), variant: 'destructive' });
      return;
    }
    setAdminRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, permissions: nextPermissions } : r)));
  };

  const toggleAdminActive = async (row: AdminRoleRow, checked: boolean) => {
    const res = await upsertAdminRole({
      email: row.email,
      displayName: row.display_name ?? undefined,
      isActive: checked,
      permissions: row.permissions,
      createdByEmail: adminEmail,
    });
    if (!res.ok) {
      toast({ title: 'تعذر تحديث حالة الأدمن', description: errorText(res, 'تعذر تحديث حالة الأدمن.'), variant: 'destructive' });
      return;
    }
    setAdminRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: checked } : r)));
  };

  const removeAdmin = async (emailToDelete: string) => {
    if (emailToDelete.toLowerCase() === adminEmail.toLowerCase()) {
      toast({ title: 'لا يمكنك حذف حسابك الحالي', variant: 'destructive' });
      return;
    }
    const res = await deleteAdminRoleByEmail(emailToDelete);
    if (!res.ok) {
      toast({ title: 'تعذر حذف الأدمن', description: errorText(res, 'تعذر حذف الأدمن.'), variant: 'destructive' });
      return;
    }
    toast({ title: 'تم حذف الأدمن' });
    await refreshAdmins();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold mb-2">إعدادات المنصة</h2>

      <Card className="border-primary/25">
        <CardHeader>
          <CardTitle>إدارة المدراء والصلاحيات</CardTitle>
          <CardDescription>
            تعيين أدمن جديد مع صلاحيات دقيقة. {bootstrapAdmin ? 'أنت في وضع Bootstrap بصلاحية كاملة.' : 'تحتاج صلاحية إدارة المدراء للتعديل.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canManageAdmins ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
              لا تملك صلاحية <strong>إدارة المدراء</strong>. يمكنك طلبها من Admin Root.
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  type="email"
                  dir="ltr"
                  placeholder="admin2@halaqmap.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
                <Input
                  placeholder="اسم عرض الأدمن (اختياري)"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                />
                <Button type="button" onClick={() => void createOrUpdateAdmin()}>
                  إضافة/تحديث أدمن
                </Button>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-medium text-sm mb-3">صلاحيات الأدمن الجديد</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {ADMIN_PERMISSION_KEYS.map((key) => (
                    <div key={key} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                      <span className="text-sm">{ADMIN_PERMISSION_LABELS[key]}</span>
                      <Switch
                        checked={newAdminPermissions[key]}
                        onCheckedChange={(checked) =>
                          setNewAdminPermissions((prev) => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-sm">الأدمن الحاليون</p>
                  <Button variant="outline" size="sm" onClick={() => void refreshAdmins()}>
                    تحديث
                  </Button>
                </div>
                {adminLoading ? (
                  <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                ) : adminRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد صفوف في جدول الصلاحيات بعد.</p>
                ) : (
                  <div className="space-y-3">
                    {adminRows.map((row) => (
                      <div key={row.id} className="rounded-md border p-3 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold" dir="ltr">{row.email}</p>
                            <p className="text-xs text-muted-foreground">{row.display_name || 'بدون اسم عرض'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">نشط</span>
                            <Switch
                              checked={row.is_active}
                              onCheckedChange={(checked) => void toggleAdminActive(row, checked)}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => void removeAdmin(row.email)}
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          {ADMIN_PERMISSION_KEYS.map((key) => (
                            <div key={key} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                              <span className="text-xs">{ADMIN_PERMISSION_LABELS[key]}</span>
                              <Switch
                                checked={row.permissions[key]}
                                onCheckedChange={(checked) =>
                                  void toggleAdminPermission(row, key, checked)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الإعدادات العامة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>اسم المنصة</Label>
            <Input defaultValue="حلاق ماب" />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" defaultValue="admin@halaqmap.com" />
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input type="tel" defaultValue="+966559602685" dir="ltr" />
          </div>
          <Button className="w-full">حفظ التغييرات</Button>
        </CardContent>
      </Card>

      <Card className="border-primary/25">
        <CardHeader>
          <CardTitle>ضريبة القيمة المضافة (عرض الدفع)</CardTitle>
          <CardDescription>
            في وضع العمل الحر أو عدم الخضوع للضريبة تُبقى المعطّلة؛ تُعرض الأسعار كأتعاب اشتراك فقط (مناسب
            لتقديم بوابات مثل ميسر). عند التوسع بسجل تجاري ورقم ضريبي فعّل الاحتسب هنا وحدّث النسبة عند تغيير
            الأنظمة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">تفعيل احتساب الضريبة في الواجهة</p>
              <p className="text-sm text-muted-foreground mt-1">
                عند التفعيل تظهر أسطر الضريبة والإجمالي في التسجيل وصفحة الدفع وسياسة الاشتراك.
              </p>
            </div>
            <Switch checked={vatEnabled} onCheckedChange={setVatEnabled} />
          </div>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="vat-rate">نسبة ضريبة القيمة المضافة (%)</Label>
            <Input
              id="vat-rate"
              type="number"
              min={0}
              max={50}
              step={0.5}
              dir="ltr"
              value={vatRateInput}
              onChange={(e) => setVatRateInput(e.target.value)}
              disabled={!vatEnabled}
            />
            <p className="text-xs text-muted-foreground">مثال شائع: 15 — يُقرب المبلغ إلى أقرب ريال صحيح.</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p className="font-medium mb-2">معاينة على 100 ر.س (أتعاب اشتراك)</p>
            <p className="text-muted-foreground">
              {!vatEnabled || preview.vat === 0 ? (
                <>الإجمالي المعروض: <strong>{preview.total} ر.س</strong> (بدون ضريبة)</>
              ) : (
                <>
                  الأتعاب: {preview.subtotal} ر.س + الضريبة ({rateForPreview}%): {preview.vat} ر.س ={' '}
                  <strong>{preview.total} ر.س</strong>
                </>
              )}
            </p>
          </div>
          <Button type="button" className="w-full" onClick={handleSaveVat}>
            حفظ إعدادات الضريبة
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
