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
import { isSupabaseConfigured } from '@/integrations/supabase/client';

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminData, setAdminData] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [storedSubscriptionRequests, setStoredSubscriptionRequests] = useState<SubscriptionRequest[]>([]);

  const refreshStoredRequests = () => {
    void loadMergedSubscriptionRequests().then(setStoredSubscriptionRequests);
  };

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
      navigate(ROUTE_PATHS.ADMIN_LOGIN);
      return;
    }
    setAdminData(JSON.parse(auth));
  }, [navigate]);

  useEffect(() => {
    refreshStoredRequests();
    const onChange = () => refreshStoredRequests();
    window.addEventListener('halaqmap-subscription-requests-changed', onChange);
    return () => window.removeEventListener('halaqmap-subscription-requests-changed', onChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate(ROUTE_PATHS.HOME);
  };

  const subscriptionRequests = useMemo(
    () => [...storedSubscriptionRequests, ...MOCK_SUBSCRIPTION_REQUESTS],
    [storedSubscriptionRequests]
  );

  const livePendingCount = useMemo(
    () => storedSubscriptionRequests.filter((r) => r.status === 'pending').length,
    [storedSubscriptionRequests]
  );

  const stats: AdminStats = useMemo(
    () => ({
      ...BASE_ADMIN_STATS,
      pendingRequests: BASE_ADMIN_STATS.pendingRequests + livePendingCount,
    }),
    [livePendingCount]
  );

  // مدفوعات وهمية
  const payments: Payment[] = [
    {
      id: 'pay1',
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
      id: 'pay2',
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
                  👑 مدير المنصة
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
            <BarbersSection stats={stats} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentsSection
              payments={payments}
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
          onClose={() => setSelectedRequest(null)}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
        />
      )}

      {/* Payment Review Dialog */}
      {selectedPayment && (
        <PaymentReviewDialog
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
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
          الطلبات تُحفظ في السحابة (جدول registration_submissions). لعرضها هنا من أي جهاز، أضف لاحقاً سياسة
          SELECT آمنة أو واجهة خادم؛ حتى ذلك الحين قد تظهر فقط ما في المتصفح الحالي (localStorage) أو في
          محرر جداول Supabase.
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
  onClose,
  rejectionReason,
  setRejectionReason,
}: {
  request: SubscriptionRequest;
  onClose: () => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = () => {
    alert('تم قبول الطلب بنجاح!');
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }
    alert('تم رفض الطلب');
    onClose();
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
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          {!showRejectForm ? (
            <>
              <Button variant="destructive" onClick={() => setShowRejectForm(true)}>
                <XCircle className="w-4 h-4 ml-2" />
                رفض الطلب
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 ml-2" />
                قبول الطلب
              </Button>
            </>
          ) : (
            <Button variant="destructive" onClick={handleReject}>
              تأكيد الرفض
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Barbers Section
function BarbersSection({ stats }: { stats: AdminStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">إدارة الحلاقين</h2>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center py-8">
            قريباً: جدول شامل لجميع الحلاقين مع إمكانية التعديل والتعطيل
          </p>
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
}: {
  payment: Payment;
  onClose: () => void;
}) {
  const handleConfirm = () => {
    alert('تم تأكيد الدفع بنجاح!');
    onClose();
  };

  const handleReject = () => {
    alert('تم رفض الدفع');
    onClose();
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
              <div className="aspect-video rounded-lg overflow-hidden border border-border">
                <img src={payment.receipt} alt="إيصال" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="destructive" onClick={handleReject}>
            <XCircle className="w-4 h-4 ml-2" />
            رفض الدفع
          </Button>
          <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-4 h-4 ml-2" />
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">إعدادات المنصة</h2>
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
    </motion.div>
  );
}
