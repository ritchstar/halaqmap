import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { loadMergedSubscriptionRequests } from '@/lib/subscriptionRequestStorage';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { getAdminLoginPath, isAllowedAdminEmail } from '@/config/adminAuth';
import { shouldShowAdminMocks } from '@/config/adminDashboardEnv';
import { fetchAdminStats } from '@/lib/adminStatsRemote';
import { fetchPaymentsForAdmin, updatePaymentStatusRemote } from '@/lib/adminPaymentsRemote';
import {
  listBarbersForAdmin,
  setBarberActiveRemote,
  type AdminBarberRow,
} from '@/lib/adminBarbersRemote';
import { patchRegistrationSubmissionPayloadRemote } from '@/lib/registrationSubmissionsRemote';
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminData, setAdminData] = useState<any>(null);
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
      if (!session?.user?.email || !isAllowedAdminEmail(session.user.email)) {
        navigate(getAdminLoginPath(), { replace: true });
        return;
      }
      setAdminData({
        id: session.user.id,
        name: 'لوحة الإدارة',
        email: session.user.email,
        role: 'admin',
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

  if (!adminData) {
    return null;
  }

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
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">الطلبات</span>
              {stats.pendingRequests > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="barbers" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">الحلاقين</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">المدفوعات</span>
              {stats.pendingPayments > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {stats.pendingPayments}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">الرسائل</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection stats={stats} />
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <RequestsSection
              requests={subscriptionRequests}
              onViewRequest={setSelectedRequest}
            />
          </TabsContent>

          {/* Barbers Tab */}
          <TabsContent value="barbers" className="space-y-6">
            <BarbersSection refreshNonce={dataRefreshNonce} onStatsNeedRefresh={bumpRemoteData} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentsSection
              payments={displayPayments}
              onViewPayment={setSelectedPayment}
            />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <MessagesSection />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Review Dialog */}
      {selectedRequest && (
        <RequestReviewDialog
          request={selectedRequest}
          reviewerEmail={adminData.email as string}
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
        />
      )}

      {/* Payment Review Dialog */}
      {selectedPayment && (
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

function RequestsSection({
  requests,
  onViewRequest,
}: {
  requests: SubscriptionRequest[];
  onViewRequest: (request: SubscriptionRequest) => void;
}) {
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
          <Input placeholder="بحث..." className="w-64" />
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    {request.shopImages[0] && isVisualAssetUrl(request.shopImages[0]) ? (
                      <img
                        src={request.shopImages[0]}
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
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
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
                    </div>
                  </div>
                </div>
                <Button onClick={() => onViewRequest(request)}>
                  <Eye className="w-4 h-4 ml-2" />
                  مراجعة الطلب
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
}: {
  request: SubscriptionRequest;
  reviewerEmail: string;
  onClose: () => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onAfterDecision: () => void;
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
    if (request.status !== 'pending') {
      toast({ title: 'لا يمكن المعالجة', description: 'هذا الطلب ليس قيد الانتظار.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const reviewedAt = new Date().toISOString();
    if (isMockRow) {
      toast({ title: 'تم القبول (تجريبي)', description: 'هذا الطلب من العرض التجريبي المحلي فقط.' });
      setSaving(false);
      onClose();
      onAfterDecision();
      return;
    }
    const res = await patchRegistrationSubmissionPayloadRemote(request.id, {
      status: 'approved',
      reviewedAt,
      reviewedBy: reviewerEmail,
      rejectionReason: undefined,
    });
    setSaving(false);
    if (!res.ok) {
      toast({ title: 'فشل الحفظ', description: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم قبول الطلب', description: 'تم تحديث السجل في Supabase.' });
    onClose();
    onAfterDecision();
  };

  const handleReject = async () => {
    if (request.status !== 'pending') {
      toast({ title: 'لا يمكن المعالجة', description: 'هذا الطلب ليس قيد الانتظار.', variant: 'destructive' });
      return;
    }
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
      reviewedAt,
      reviewedBy: reviewerEmail,
      rejectionReason: rejectionReason.trim(),
    });
    setSaving(false);
    if (!res.ok) {
      toast({ title: 'فشل الحفظ', description: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم رفض الطلب', description: 'تم تحديث السجل في Supabase.' });
    onClose();
    onAfterDecision();
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

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3">المستندات النظامية</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {request.documents.map((doc, index) =>
                isVisualAssetUrl(doc) ? (
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

          {(request.paymentMethod || request.receiptFileName || request.servicesSummary) && (
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
            <div className="grid grid-cols-3 gap-4">
              {request.shopImages.map((image, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={image} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
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
              <Button variant="destructive" onClick={() => setShowRejectForm(true)} disabled={saving || request.status !== 'pending'}>
                <XCircle className="w-4 h-4 ml-2" />
                رفض الطلب
              </Button>
              <Button
                onClick={() => void handleApprove()}
                disabled={saving || request.status !== 'pending'}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 ml-2" />}
                قبول الطلب
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

// Barbers Section
function BarbersSection({
  refreshNonce,
  onStatsNeedRefresh,
}: {
  refreshNonce: number;
  onStatsNeedRefresh: () => void;
}) {
  const [rows, setRows] = useState<AdminBarberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      toast({ title: 'تعذر التحديث', description: res.error, variant: 'destructive' });
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: next } : r)));
    toast({ title: next ? 'تم التفعيل' : 'تم التعطيل', description: row.name });
    onStatsNeedRefresh();
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
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري التحميل…
            </div>
          ) : rows.length === 0 ? (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
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
                          disabled={updatingId === row.id}
                          onCheckedChange={(v) => void onToggleActive(row, v)}
                          aria-label={row.is_active ? 'تعطيل الظهور' : 'تفعيل الظهور'}
                        />
                        {updatingId === row.id ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Payments Section
function PaymentsSection({
  payments,
  onViewPayment,
}: {
  payments: Payment[];
  onViewPayment: (payment: Payment) => void;
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
                <Button onClick={() => onViewPayment(payment)}>
                  <Eye className="w-4 h-4 ml-2" />
                  مراجعة الإيصال
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
      toast({ title: 'فشل التحديث', description: res.error, variant: 'destructive' });
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
      toast({ title: 'فشل التحديث', description: res.error, variant: 'destructive' });
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
function SettingsSection() {
  const [vatEnabled, setVatEnabled] = useState(() => getPlatformVatSettings().enabled);
  const [vatRateInput, setVatRateInput] = useState(() => String(getPlatformVatSettings().ratePercent));

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold mb-2">إعدادات المنصة</h2>
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
