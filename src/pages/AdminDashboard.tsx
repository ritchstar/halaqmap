import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Send,
  Activity,
  FlaskConical,
  Landmark,
  HardDrive,
  ClipboardList,
  Radar,
  Cast,
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
import { getAdminLoginPathFor, getAdminPlatformRadarFullScreenPathFor } from '@/config/adminAuth';
import { shouldShowAdminMocks } from '@/config/adminDashboardEnv';
import { fetchAdminStats } from '@/lib/adminStatsRemote';
import {
  PLATFORM_PROFESSIONAL_UPGRADE_STATUS_AR,
  PLATFORM_SUBSCRIPTION_TIER_PUBLIC_LABEL,
} from '@/config/platformPlanStatus';
import { fetchPaymentsForAdmin, updatePaymentStatusRemote } from '@/lib/adminPaymentsRemote';
import {
  fetchBarberSubscriptionsForAdmin,
  type BarberSubscriptionAdminRow,
} from '@/lib/adminBarberSubscriptionsRemote';
import { ListingLicenseIssuePanel } from '@/components/admin/ListingLicenseIssuePanel';
import {
  listBarbersForAdmin,
  setBarberActiveRemote,
  deleteBarberRemote,
  purgeAllBarbersRemote,
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
import { formatBarberMemberNumber } from '@/lib/barberMemberNumber';
import {
  calcVatBreakdown,
  getPlatformVatSettings,
  savePlatformVatSettings,
} from '@/lib/platformVatSettings';
import { ZatcaTaxActivationAlert } from '@/components/admin/ZatcaTaxActivationAlert';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  COMMAND_CENTER_LEADS,
  buildWaDeepLink,
  type CommandCenterLead,
  type CommandLeadChannel,
  type CommandLeadStatus,
} from '@/lib/adminCommandCenter';
import {
  ADMIN_PERMISSION_LABELS,
  ADMIN_PERMISSION_UI_SECTIONS,
  adminPermissionShortRoleLabel,
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
import {
  fetchAdminSupportMessagesRemote,
  fetchAdminSupportThreadsRemote,
  sendAdminSupportMessageRemote,
  type AdminSupportMessageRow,
  type AdminSupportThread,
} from '@/lib/adminSupportChatRemote';
import { PartnerPromoVideoAdminPanel } from '@/components/admin/PartnerPromoVideoAdminPanel';
import { PartnerTutorialVideosAdminPanel } from '@/components/admin/PartnerTutorialVideosAdminPanel';
import { ResourceManagementSection } from '@/components/admin/ResourceManagementSection';
import { PaymentGatewaysAdminPanel } from '@/components/admin/PaymentGatewaysAdminPanel';
import { OpsBillingMonitorPanel } from '@/components/admin/OpsBillingMonitorPanel';
import { VirtualAiStaffOffice } from '@/components/admin/VirtualAiStaffOffice';
import { SystemCrisisPanicButton } from '@/components/admin/SystemCrisisPanicButton';
import { HonorBoard } from '@/components/b2b/HonorBoard';
import { FounderOperationalFeedPanel, OpsControllerWorkspace } from '@/modules/ops-controller';
import { EngineeringPendingApprovalsPanel } from '@/modules/ai-staff/components/EngineeringPendingApprovalsPanel';
import { FounderSystemStatusPanel } from '@/modules/ai-staff/components/FounderSystemStatusPanel';
import { PublicProsecutorDashboard } from '@/modules/ai-staff/components/PublicProsecutorDashboard';
import { fetchEngineeringHandshakeStatus } from '@/lib/engineeringHandshakeRemote';
import {
  FounderCommandShell,
  FounderCrest,
  FounderGlassCard,
  FounderMetricTile,
  FounderPremiumTable,
  FounderPremiumTableBody,
  FounderPremiumTableCell,
  FounderPremiumTableHead,
  FounderPremiumTableHeader,
  FounderPremiumTableRow,
  FounderPremiumTableShell,
  FounderStaggerGrid,
  FounderStaggerItem,
  founderTheme,
} from '@/components/admin/founder';
import {
  StaffMetricTile,
  StaffProfessionalCard,
  StaffWorkspaceShell,
  staffMotion,
  staffTheme,
} from '@/components/admin/staff';
import { AdminFinancialArchivePanel } from '@/components/admin/AdminFinancialArchivePanel';
import { fetchAdminBookingSecurityLogRemote, type BookingSecurityLogRow } from '@/lib/adminBookingSecurityLogRemote';
import { runSimulateBookingOverlapRemote } from '@/lib/simulateBookingOverlapRemote';
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
    legalDisclaimerAccepted: true,
    legalDisclaimerAcceptedAtIso: '2026-04-07T07:30:00.000Z',
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
    legalDisclaimerAccepted: true,
    legalDisclaimerAcceptedAtIso: '2026-04-07T11:15:00.000Z',
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
  { day: 'الأربعاء', focus: 'إغلاق مدفوعات وطلبات', target: 10, note: 'تصفية المعلّق وتحويله إلى حزمة إدراج برمجية فعّال.' },
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [zatcaScrollToken, setZatcaScrollToken] = useState(0);
  const [adminData, setAdminData] = useState<AdminSessionInfo | null>(null);
  const [adminAccessToken, setAdminAccessToken] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [storedSubscriptionRequests, setStoredSubscriptionRequests] = useState<SubscriptionRequest[]>([]);
  const [remoteStats, setRemoteStats] = useState<AdminStats | null>(null);
  const [remotePayments, setRemotePayments] = useState<Payment[]>([]);
  const [moyasarSubRows, setMoyasarSubRows] = useState<BarberSubscriptionAdminRow[]>([]);
  const [dataRefreshNonce, setDataRefreshNonce] = useState(0);
  const [crisisLabOpen, setCrisisLabOpen] = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);
  const [engineeringWingOpsEnabled, setEngineeringWingOpsEnabled] = useState(false);

  const bumpRemoteData = () => setDataRefreshNonce((n) => n + 1);

  const refreshStoredRequests = () => {
    void loadMergedSubscriptionRequests().then(setStoredSubscriptionRequests);
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      navigate(getAdminLoginPathFor(location.pathname), { replace: true });
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      navigate(getAdminLoginPathFor(location.pathname), { replace: true });
      return;
    }

    let cancelled = false;

    const applySession = (session: { user: { id: string; email?: string | null } } | null) => {
      if (cancelled) return;
      if (!session?.user?.email) {
        navigate(getAdminLoginPathFor(location.pathname), { replace: true });
        return;
      }
      void resolveAdminAccess(session.user.email).then((access) => {
        if (cancelled) return;
        if (!access.allowed) {
          navigate(getAdminLoginPathFor(location.pathname), { replace: true });
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
  }, [navigate, location.pathname]);

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
    if (!adminData) return;
    const client = getSupabaseClient();
    void client?.auth.getSession().then(({ data: { session } }) => {
      setAdminAccessToken(session?.access_token ?? '');
    });
  }, [adminData]);

  useEffect(() => {
    if (!adminData) return;
    let cancelled = false;
    void fetchBarberSubscriptionsForAdmin().then((list) => {
      if (!cancelled) setMoyasarSubRows(list);
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
  const canViewSecurityOpsLog = can('view_overview') || can('manage_barbers');
  const canViewPaymentGateways =
    can('view_payment_settings') ||
    can('manage_payment_settings') ||
    can('view_settings') ||
    can('view_payments');
  const canSavePaymentGatewaySettings = can('manage_payment_settings') || can('view_settings');
  const canManageSubscriberLifecycle = can('manage_barbers') || can('manage_subscriber_lifecycle');
  const canManageSubscriberComms = can('manage_barbers') || can('manage_subscriber_comms');
  const canOpenRequestReviewDialog =
    can('review_requests') ||
    can('manage_barbers') ||
    can('manage_subscriber_lifecycle') ||
    can('manage_subscriber_comms');
  const canReviewPartnerBilling = can('review_payments') || can('manage_partner_billing');
  const canViewOpsBilling =
    can('view_ops_billing_monitor') || can('manage_centralized_billing_ops');
  const canAccessFinancialArchive =
    can('view_admin_financial_archive') ||
    can('manage_admin_financial_archive') ||
    can('manage_centralized_billing_ops');
  const canAccessOpsBillingTab = canViewOpsBilling || canAccessFinancialArchive;
  const canAccessOpsControllerTab =
    (can('view_ops_controller') || can('submit_ops_controller')) &&
    (!Boolean(adminData?.bootstrap) || engineeringWingOpsEnabled);
  const canManageFinancialArchive =
    can('manage_admin_financial_archive') || can('manage_centralized_billing_ops');
  const canViewZatcaFinancialOffice =
    Boolean(adminData?.bootstrap) ||
    can('manage_platform_commerce_rules') ||
    can('view_ops_billing_monitor') ||
    can('manage_centralized_billing_ops');
  const allowedTabs = useMemo(() => {
    const out: string[] = [];
    if (can('view_overview')) out.push('overview');
    if (can('view_requests')) out.push('requests');
    if (can('view_barbers')) out.push('barbers');
    if (can('view_payments')) out.push('payments');
    if (can('view_command_center')) out.push('command-center');
    if (can('view_messages')) out.push('messages');
    if (canViewSecurityOpsLog) out.push('security-ops');
    if (canViewPaymentGateways) out.push('payment-gateways');
    if (canAccessOpsBillingTab) out.push('ops-billing');
    if (canAccessOpsControllerTab) out.push('ops-controller');
    if (can('view_settings')) out.push('settings');
    if (Boolean(adminData?.bootstrap)) out.push('resources');
    return out;
  }, [adminData, canViewPaymentGateways, canViewSecurityOpsLog, canAccessOpsBillingTab, canAccessOpsControllerTab]);

  useEffect(() => {
    if (!adminData) return;
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] ?? 'overview');
    }
  }, [adminData, activeTab, allowedTabs]);

  useEffect(() => {
    if (!adminData?.bootstrap) return;
    void fetchEngineeringHandshakeStatus().then((result) => {
      if (result.ok) {
        setEngineeringWingOpsEnabled(result.snapshot.opsControllerEnabled);
      }
    });
  }, [adminData?.bootstrap]);

  useEffect(() => {
    if (activeTab !== 'settings' || zatcaScrollToken <= 0 || !canViewZatcaFinancialOffice) return;

    const scrollToOffice = () => {
      document.getElementById('zatca-financial-office')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };

    const t = window.setTimeout(scrollToOffice, 320);
    return () => window.clearTimeout(t);
  }, [activeTab, zatcaScrollToken, canViewZatcaFinancialOffice]);

  if (!adminData) {
    return null;
  }

  /** تعديل بيانات الحلاق «العميق» — للمالك (bootstrap) فقط؛ من يملك manage_admins يدير الجدول وليس نسخ المالك هنا. */
  const canRootHardEdit = Boolean(adminData.bootstrap);
  const isFounderView = Boolean(adminData.bootstrap);
  const shellTheme = isFounderView ? founderTheme : staffTheme;

  const adminHeader = (
    <header className={shellTheme.header}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {isFounderView ? (
              <FounderCrest>
                <Shield className="h-6 w-6 text-amber-100" />
              </FounderCrest>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-600 bg-slate-800">
                <Shield className="h-5 w-5 text-slate-300" />
              </div>
            )}
            <div className="min-w-0 text-right">
              <p className={shellTheme.pageEyebrow}>
                {isFounderView ? "Founder's Command Center" : 'Professional Workspace'}
              </p>
              <h1 className="truncate text-lg font-bold text-slate-50 md:text-xl">{adminData.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={
                isFounderView
                  ? 'hidden sm:flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 gap-0.5 backdrop-blur-md'
                  : 'hidden sm:flex items-center rounded-lg border border-slate-700 bg-slate-800 p-1 gap-0.5'
              }
              role="toolbar"
              aria-label="اختصارات لوحة الإدارة"
            >
              {canAccessOpsBillingTab ? (
                <Button
                  type="button"
                  variant={activeTab === 'ops-billing' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={
                    isFounderView
                      ? 'h-9 w-9 shrink-0 text-slate-300 hover:text-cyan-100 hover:bg-cyan-500/10'
                      : 'h-9 w-9 shrink-0 text-slate-400 hover:text-slate-100 hover:bg-slate-700'
                  }
                  title="التكاليف والتزامات التشغيل والأرشيف المالي"
                  aria-label="التكاليف والتزامات التشغيل والأرشيف المالي"
                  aria-pressed={activeTab === 'ops-billing'}
                  onClick={() => setActiveTab('ops-billing')}
                >
                  <Landmark className="h-4 w-4" />
                </Button>
              ) : null}
              {Boolean(adminData?.bootstrap) && (
                <Button
                  type="button"
                  variant={activeTab === 'resources' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={
                    isFounderView
                      ? 'h-9 shrink-0 gap-1.5 px-2.5 text-slate-300 hover:text-cyan-100 hover:bg-cyan-500/10'
                      : 'h-9 shrink-0 gap-1.5 px-2.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700'
                  }
                  title="مراقبة الموارد والتخزين"
                  aria-label="مراقبة الموارد"
                  aria-pressed={activeTab === 'resources'}
                  onClick={() => setActiveTab('resources')}
                >
                  <HardDrive className="h-4 w-4" />
                  <span className="hidden md:inline">مراقبة الموارد</span>
                </Button>
              )}
            </div>
            {isFounderView ? (
              <SystemCrisisPanicButton
                onActivate={() => {
                  setCrisisMode(true);
                  setCrisisLabOpen(true);
                }}
              />
            ) : null}
            {isFounderView ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 shrink-0 gap-1.5 border border-cyan-500/30 bg-cyan-500/10 px-2.5 text-cyan-100 hover:bg-cyan-500/20 hover:text-white"
                title="Command Mode — فتح شاشة الرادار للعرض والبث"
                aria-label="Command Mode — Platform Radar full screen"
                onClick={() => {
                  const path = getAdminPlatformRadarFullScreenPathFor(location.pathname);
                  const url = `${window.location.origin}${window.location.pathname}#${path}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                <Cast className="h-4 w-4" />
                <Radar className="h-4 w-4" />
                <span className="hidden lg:inline">Command Mode</span>
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={
                isFounderView
                  ? 'gap-2 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]'
                  : 'gap-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700'
              }
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

  const dashboardBody = (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className={`${shellTheme.navRail} h-auto`}>
            {can('view_overview') && (
            <TabsTrigger value="overview" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            )}
            {can('view_requests') && (
            <TabsTrigger value="requests" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">طلبات الحزم البرمجية</span>
              {stats.pendingRequests > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
            )}
            {can('view_barbers') && (
            <TabsTrigger value="barbers" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">الحلاقين</span>
            </TabsTrigger>
            )}
            {can('view_payments') && (
            <TabsTrigger value="payments" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
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
            <TabsTrigger value="command-center" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">غرفة القيادة</span>
            </TabsTrigger>
            )}
            {can('view_messages') && (
            <TabsTrigger value="messages" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">الرسائل</span>
            </TabsTrigger>
            )}
            {canViewSecurityOpsLog && (
            <TabsTrigger value="security-ops" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">سجل الأمان</span>
            </TabsTrigger>
            )}
            {canViewPaymentGateways && (
            <TabsTrigger value="payment-gateways" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">بوابات الدفع</span>
            </TabsTrigger>
            )}
            {canAccessOpsBillingTab && (
            <TabsTrigger value="ops-billing" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <Landmark className="w-4 h-4" />
              <span className="hidden sm:inline">التزامات التشغيل</span>
            </TabsTrigger>
            )}
            {canAccessOpsControllerTab && (
            <TabsTrigger value="ops-controller" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">مراقب العمليات</span>
            </TabsTrigger>
            )}
            {can('view_settings') && (
            <TabsTrigger value="settings" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
            )}
            {Boolean(adminData?.bootstrap) && (
            <TabsTrigger value="resources" className={`${shellTheme.navItem} ${shellTheme.navItemActive} gap-2`}>
              <HardDrive className="w-4 h-4" />
              <span className="hidden sm:inline">مراقبة الموارد</span>
            </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          {can('view_overview') && <TabsContent value="overview" className="space-y-6">
            <VirtualAiStaffOffice
              can={can}
              canViewZatcaFinancialOffice={canViewZatcaFinancialOffice}
              isBootstrapAdmin={Boolean(adminData.bootstrap)}
              crisisLabOpen={crisisLabOpen}
              onCrisisLabOpenChange={(open) => {
                setCrisisLabOpen(open);
                if (!open) setCrisisMode(false);
              }}
              crisisMode={crisisMode}
              onOpenZatcaFinancialOffice={() => {
                if (!canViewZatcaFinancialOffice) {
                  toast({
                    title: 'المكتب المالي غير متاح',
                    description:
                      'تحتاج صلاحية مراقبة التزامات التشغيل أو إدارة قواعد المنصة التجارية للوصول إلى مكتب ZATCA.',
                    variant: 'destructive',
                  });
                  return;
                }
                if (!can('view_settings')) {
                  toast({
                    title: 'تبويب الإعدادات غير متاح',
                    description:
                      'المكتب المالي داخل الإعدادات — اطلب صلاحية «عرض الإعدادات» من مسؤول المنصة.',
                    variant: 'destructive',
                  });
                  return;
                }
                setActiveTab('settings');
                setZatcaScrollToken((n) => n + 1);
              }}
            />
            <OverviewSection
              stats={stats}
              isFounderView={isFounderView}
              showOperationalFeed={isFounderView}
              onOpsControllerEnabledChange={setEngineeringWingOpsEnabled}
            />
          </TabsContent>}

          {canViewSecurityOpsLog && (
            <TabsContent value="security-ops" className="space-y-6">
              <SecurityOpsLogSection isActive={activeTab === 'security-ops'} bumpNonce={dataRefreshNonce} />
            </TabsContent>
          )}

          {/* Requests Tab */}
          {can('view_requests') && <TabsContent value="requests" className="space-y-6">
            <RequestsSection
              requests={subscriptionRequests}
              onViewRequest={setSelectedRequest}
              canOpenRequestReview={canOpenRequestReviewDialog}
              canExportCsv={can('review_requests')}
            />
          </TabsContent>}

          {/* Barbers Tab */}
          {can('view_barbers') && <TabsContent value="barbers" className="space-y-6">
            <BarbersSection
              refreshNonce={dataRefreshNonce}
              onStatsNeedRefresh={bumpRemoteData}
              canManage={can('manage_barbers')}
              canRootHardEdit={canRootHardEdit}
              registrationRequests={subscriptionRequests}
              onRegistrationPayloadSynced={refreshStoredRequests}
              isFounderView={isFounderView}
            />
          </TabsContent>}

          {/* Payments Tab */}
          {can('view_payments') && <TabsContent value="payments" className="space-y-6">
            {canReviewPartnerBilling && adminAccessToken ? (
              <ListingLicenseIssuePanel accessToken={adminAccessToken} />
            ) : null}
            <MoyasarSubscriptionsArchiveSection rows={moyasarSubRows} />
            <PaymentsSection
              payments={displayPayments}
              onViewPayment={setSelectedPayment}
              canReview={canReviewPartnerBilling}
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
            <MessagesSection canUseChat={can('view_messages')} />
          </TabsContent>}

          {canViewPaymentGateways && (
            <TabsContent value="payment-gateways" className="space-y-6">
              <PaymentGatewaysAdminPanel canSave={canSavePaymentGatewaySettings} />
            </TabsContent>
          )}

          {canAccessOpsBillingTab && (
          <TabsContent value="ops-billing" className="space-y-6">
            {canViewOpsBilling ? (
              <OpsBillingMonitorPanel canMutate={can('manage_centralized_billing_ops')} isFounderView={isFounderView} />
            ) : null}
            {canAccessFinancialArchive ? (
              <AdminFinancialArchivePanel
                canManage={canManageFinancialArchive}
                canFetchCommitments={canViewOpsBilling}
              />
            ) : null}
          </TabsContent>
          )}

          {canAccessOpsControllerTab && (
            <TabsContent value="ops-controller" className="space-y-6">
              <OpsControllerWorkspace can={can} isActive={activeTab === 'ops-controller'} />
            </TabsContent>
          )}

          {/* Settings Tab */}
          {can('view_settings') && <TabsContent value="settings" className="space-y-6">
            <SettingsSection
              adminEmail={adminData.email}
              canManageAdmins={can('manage_admins')}
              bootstrapAdmin={adminData.bootstrap}
              canSavePlatformVat={can('manage_platform_commerce_rules')}
              canViewZatcaFinancialOffice={canViewZatcaFinancialOffice}
              canViewPartnerMarketing={can('view_partner_marketing')}
              canManagePartnerMarketing={can('manage_partner_marketing')}
            />
          </TabsContent>}

          {adminData.bootstrap && (
            <TabsContent value="resources" className="space-y-6">
              <ResourceManagementSection isActive={activeTab === 'resources'} />
            </TabsContent>
          )}
        </Tabs>
  );

  const dashboardDialogs = (
    <>
      {/* Request Review Dialog */}
      {selectedRequest && canOpenRequestReviewDialog && (
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
          canReviewRequests={can('review_requests')}
          canSubscriberLifecycle={canManageSubscriberLifecycle}
          canSubscriberComms={canManageSubscriberComms}
        />
      )}

      {/* Payment Review Dialog */}
      {selectedPayment && canReviewPartnerBilling && (
        <PaymentReviewDialog
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onAfterDecision={() => {
            bumpRemoteData();
          }}
        />
      )}
    </>
  );

  if (isFounderView) {
    return (
      <FounderCommandShell
        header={adminHeader}
        footer={<HonorBoard context="admin" variant="core-values" />}
      >
        {dashboardBody}
        {dashboardDialogs}
      </FounderCommandShell>
    );
  }

  return (
    <StaffWorkspaceShell header={adminHeader}>
      {dashboardBody}
      {dashboardDialogs}
    </StaffWorkspaceShell>
  );
}

// سجل الأمان والعمليات — platform_booking_security_log + Realtime
function SecurityOpsLogSection({ isActive, bumpNonce }: { isActive: boolean; bumpNonce: number }) {
  const [rows, setRows] = useState<BookingSecurityLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const showOverlapSimulator =
    isSupabaseConfigured() &&
    (import.meta.env.DEV || import.meta.env.VITE_ENABLE_BOOKING_OVERLAP_SIMULATOR === 'true');

  const mapRow = useCallback((raw: Record<string, unknown>): BookingSecurityLogRow => ({
    id: String(raw.id),
    created_at: String(raw.created_at),
    severity: String(raw.severity ?? ''),
    event_code: String(raw.event_code ?? ''),
    message: raw.message != null ? String(raw.message) : null,
    barber_id: raw.barber_id != null ? String(raw.barber_id) : null,
    detail:
      raw.detail && typeof raw.detail === 'object' && !Array.isArray(raw.detail)
        ? (raw.detail as Record<string, unknown>)
        : null,
  }), []);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetchAdminBookingSecurityLogRemote();
    setLoading(false);
    if (!r.ok) {
      toast({ title: 'تعذر تحميل السجل', description: r.error, variant: 'destructive' });
      return;
    }
    setRows(r.rows);
    seenIdsRef.current = new Set(r.rows.map((x) => x.id));
  }, []);

  useEffect(() => {
    void load();
  }, [load, bumpNonce]);

  useEffect(() => {
    if (!isActive) return;
    const tick = window.setInterval(() => void load(), 12000);
    return () => window.clearInterval(tick);
  }, [isActive, load]);

  useEffect(() => {
    if (!isActive || !isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel('platform_booking_security_log_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'platform_booking_security_log' },
        (payload) => {
          const raw = payload.new as Record<string, unknown> | null;
          if (!raw?.id) return;
          const row = mapRow(raw);
          setRows((prev) => {
            if (prev.some((p) => p.id === row.id)) return prev;
            return [row, ...prev];
          });
          if (!seenIdsRef.current.has(row.id)) {
            seenIdsRef.current.add(row.id);
            const isOverlap = row.event_code === 'booking_overlap_denied';
            const isCritical = row.severity === 'critical' || row.event_code === 'role_not_allowed';
            if (isOverlap || isCritical) {
              toast(
                isCritical
                  ? {
                      title: 'تنبيه أمان',
                      description: row.message || row.event_code,
                      variant: 'destructive',
                    }
                  : {
                      title: 'تعارض حجز مُبلَّغ',
                      description: row.message || row.event_code,
                    }
              );
            }
          }
        }
      )
      .subscribe((status) => {
        setLiveConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setLiveConnected(false);
        }
      });

    return () => {
      void client.removeChannel(channel);
      setLiveConnected(false);
    };
  }, [isActive, mapRow]);

  const labelForCode = (code: string) => {
    if (code === 'booking_overlap_denied') return 'تعارض موعد (حجز)';
    if (code === 'role_not_allowed') return 'دور غير مصرح';
    if (code === 'barber_not_found') return 'حلاق غير موجود';
    if (code === 'profile_not_found') return 'ملف عميل غير موجود';
    if (code === 'admin_regulatory_qr_preview') return 'معاينة نظامية (رمز تسجيل)';
    return code;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">سجل الأمان والعمليات</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground leading-relaxed">
            بيانات حيّة من جدول <code className="text-xs">platform_booking_security_log</code> (محاولات تعارض حجز، وصول
            غير طبيعي، إلخ). يُفضَّل تفعيل Realtime لهذا الجدول في Supabase حتى تصل الإدراجات فوراً؛ وإلا يعمل التحديث
            التلقائي كل 12 ثانية أثناء بقائك في التبويب.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={liveConnected ? 'default' : 'secondary'} className="gap-1">
            <span className={`inline-block h-2 w-2 rounded-full ${liveConnected ? 'bg-green-400' : 'bg-muted-foreground'}`} />
            {liveConnected ? 'بث مباشر' : 'بث غير متصل'}
          </Badge>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            تحديث الآن
          </Button>
          {showOverlapSimulator ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1 border-amber-500/40"
              disabled={loading || simulating}
              title="ينفّذ حجزاً ثم محاولة متداخلة عبر المفتاح المجهول؛ يُسجّل التعارض ثم يُنظّف بيانات الاختبار"
              onClick={() => {
                setSimulating(true);
                void (async () => {
                  const r = await runSimulateBookingOverlapRemote();
                  setSimulating(false);
                  if (r.ok) {
                    toast({
                      title: 'محاكاة التعارض',
                      description: r.summary,
                    });
                    await load();
                  } else {
                    toast({ title: 'فشل المحاكاة', description: r.error, variant: 'destructive' });
                  }
                })();
              }}
            >
              {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
              محاكاة تعارض
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="border-amber-500/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-amber-600" />
            أحداث الحجز والوصول
          </CardTitle>
          <CardDescription>الأحدث أولاً — يشمل تنبيهات منطقية عند وصول صف جديد عبر البث المباشر</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && rows.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              جاري التحميل…
            </div>
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">لا توجد أحداث مسجّلة بعد.</p>
          ) : (
            <ul className="max-h-[min(70vh,520px)] space-y-3 overflow-y-auto pe-1">
              {rows.map((row) => {
                const overlap = row.event_code === 'booking_overlap_denied';
                const critical = row.severity === 'critical' || row.event_code === 'role_not_allowed';
                return (
                  <li
                    key={row.id}
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      critical
                        ? 'border-destructive/50 bg-destructive/5'
                        : overlap
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : 'border-border bg-muted/20'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={critical ? 'destructive' : overlap ? 'outline' : 'secondary'}>
                          {labelForCode(row.event_code)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleString('ar-SA')}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase text-muted-foreground">{row.severity}</span>
                    </div>
                    {row.message ? <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{row.message}</p> : null}
                    {row.barber_id ? (
                      <p className="mt-1 font-mono text-[11px] opacity-80" dir="ltr">
                        barber_id: {row.barber_id}
                      </p>
                    ) : null}
                    {row.detail && Object.keys(row.detail).length > 0 ? (
                      <pre className="mt-2 max-h-28 overflow-auto rounded-md bg-background/80 p-2 text-[10px] leading-snug" dir="ltr">
                        {JSON.stringify(row.detail)}
                      </pre>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Overview Section
function OverviewSection({
  stats,
  isFounderView,
  showOperationalFeed = false,
  onOpsControllerEnabledChange,
}: {
  stats: AdminStats;
  isFounderView: boolean;
  showOperationalFeed?: boolean;
  onOpsControllerEnabledChange?: (enabled: boolean) => void;
}) {
  if (!isFounderView) {
    return (
      <motion.div {...staffMotion.enter} className="space-y-6">
        <header className="space-y-2 text-right">
          <p className={staffTheme.pageEyebrow}>Operations</p>
          <h2 className={staffTheme.pageTitle}>مؤشرات التشغيل</h2>
          <p className={staffTheme.muted}>أهم الأرقام التشغيلية — وضوح فوري للفريق.</p>
        </header>

        <StaffProfessionalCard className="p-5">
          <p className={staffTheme.pageEyebrow}>{PLATFORM_SUBSCRIPTION_TIER_PUBLIC_LABEL}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{PLATFORM_PROFESSIONAL_UPGRADE_STATUS_AR}</p>
        </StaffProfessionalCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StaffMetricTile
            title="إجمالي الحلاقين"
            value={stats.totalBarbers}
            subtitle={`${stats.activeSubscriptions} حزمة إدراج برمجية نشط`}
            icon={Users}
            accent="emerald"
          />
          <StaffMetricTile
            title="الإيرادات الكلية"
            value={`${stats.totalRevenue.toLocaleString()} ر.س`}
            subtitle={`${stats.monthlyRevenue.toLocaleString()} ر.س هذا الشهر`}
            icon={DollarSign}
            accent="amber"
          />
          <StaffMetricTile
            title="طلبات قيد المراجعة"
            value={stats.pendingRequests}
            icon={FileText}
            accent="amber"
          />
          <StaffMetricTile
            title="مدفوعات قيد التأكيد"
            value={stats.pendingPayments}
            icon={CreditCard}
            accent="violet"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <StaffProfessionalCard className="p-5">
            <h3 className={`${staffTheme.sectionTitle} mb-4`}>إحصائيات المنصة</h3>
            <div className="space-y-0">
              {[
                { label: 'إجمالي المواعيد', value: stats.totalAppointments.toLocaleString() },
                { label: 'إجمالي المستخدمين', value: stats.totalUsers.toLocaleString() },
                { label: 'حزم برمجية إدراج منتهية', value: String(stats.expiredSubscriptions), warn: true },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-slate-700 py-3 last:border-b-0"
                >
                  <span className="text-sm text-slate-400">{row.label}</span>
                  <span className={row.warn ? 'font-semibold text-amber-300' : 'font-semibold text-slate-100'}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </StaffProfessionalCard>

          <StaffProfessionalCard className="p-5">
            <h3 className={`${staffTheme.sectionTitle} mb-4`}>الإيرادات الشهرية</h3>
            <div className="space-y-0">
              {[
                { label: 'برونزي', value: (stats.bronzeBarbers * 100).toLocaleString() },
                { label: 'ذهبي', value: (stats.goldBarbers * 150).toLocaleString() },
                { label: 'ماسي', value: (stats.diamondBarbers * 200).toLocaleString() },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-slate-700 py-3"
                >
                  <span className="text-sm text-slate-400">{row.label}</span>
                  <span className="font-semibold text-slate-100">{row.value} ر.س</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3">
                <span className="text-sm font-semibold text-slate-300">الإجمالي</span>
                <span className="text-xl font-bold text-amber-200">{stats.monthlyRevenue.toLocaleString()} ر.س</span>
              </div>
            </div>
          </StaffProfessionalCard>
        </div>
      </motion.div>
    );
  }

  return (
    <FounderStaggerGrid className="space-y-8">
      <FounderStaggerItem>
        <FounderSystemStatusPanel onOpsControllerEnabledChange={onOpsControllerEnabledChange} />
      </FounderStaggerItem>

      <FounderStaggerItem>
        <header className="space-y-2 text-right">
          <p className={founderTheme.pageEyebrow}>At-a-glance</p>
          <h2 className={founderTheme.pageTitle}>مؤشرات القيادة</h2>
          <p className={founderTheme.muted}>أهم الأرقام التشغيلية — وضوح فوري بلا ازدحام.</p>
        </header>
      </FounderStaggerItem>

      <FounderStaggerItem>
        <FounderGlassCard className="p-6">
          <p className={founderTheme.pageEyebrow}>{PLATFORM_SUBSCRIPTION_TIER_PUBLIC_LABEL}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{PLATFORM_PROFESSIONAL_UPGRADE_STATUS_AR}</p>
        </FounderGlassCard>
      </FounderStaggerItem>

      <FounderStaggerGrid className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <FounderMetricTile
          title="إجمالي الحلاقين"
          value={stats.totalBarbers}
          subtitle={`${stats.activeSubscriptions} حزمة إدراج برمجية نشط`}
          icon={Users}
          accent="cyan"
          staggered
        />
        <FounderMetricTile
          title="الإيرادات الكلية"
          value={`${stats.totalRevenue.toLocaleString()} ر.س`}
          subtitle={`${stats.monthlyRevenue.toLocaleString()} ر.س هذا الشهر`}
          icon={DollarSign}
          accent="gold"
          staggered
        />
        <FounderMetricTile
          title="طلبات قيد المراجعة"
          value={stats.pendingRequests}
          icon={FileText}
          accent="amber"
          staggered
        />
        <FounderMetricTile
          title="مدفوعات قيد التأكيد"
          value={stats.pendingPayments}
          icon={CreditCard}
          accent="violet"
          staggered
        />
      </FounderStaggerGrid>

      <FounderStaggerGrid className="grid gap-5 md:grid-cols-3">
        {[
          { label: 'باقة برونزية', count: stats.bronzeBarbers, hint: '100 ر.س / حزمة برمجية 30 يوم', emoji: '🥉' },
          { label: 'باقة ذهبية', count: stats.goldBarbers, hint: '150 ر.س / حزمة برمجية 30 يوم', emoji: '🥇' },
          { label: 'باقة ماسية', count: stats.diamondBarbers, hint: '200 ر.س / حزمة برمجية 30 يوم', emoji: '💎' },
        ].map((tier) => (
          <FounderGlassCard key={tier.label} className="p-6" interactive staggered>
            <div className="flex items-center justify-between gap-4">
              <div className="text-right">
                <p className={founderTheme.pageEyebrow}>{tier.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-white">{tier.count}</p>
                <p className="mt-1 text-xs text-slate-400">{tier.hint}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-2xl">
                {tier.emoji}
              </span>
            </div>
          </FounderGlassCard>
        ))}
      </FounderStaggerGrid>

      <FounderStaggerGrid className="grid gap-5 lg:grid-cols-2">
        <FounderGlassCard className="p-6 md:p-7" staggered>
          <h3 className={`${founderTheme.sectionTitle} mb-5`}>إحصائيات المنصة</h3>
          <div className="space-y-0">
            {[
              { label: 'إجمالي المواعيد', value: stats.totalAppointments.toLocaleString() },
              { label: 'إجمالي المستخدمين', value: stats.totalUsers.toLocaleString() },
              { label: 'حزم برمجية إدراج منتهية', value: String(stats.expiredSubscriptions), warn: true },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-slate-800 py-4 last:border-b-0"
              >
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className={row.warn ? 'font-semibold text-amber-300' : 'font-semibold text-white'}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </FounderGlassCard>

        <FounderGlassCard className="p-6 md:p-7" staggered>
          <h3 className={`${founderTheme.sectionTitle} mb-5`}>الإيرادات الشهرية</h3>
          <div className="space-y-0">
            {[
              { label: 'برونزي', value: (stats.bronzeBarbers * 100).toLocaleString() },
              { label: 'ذهبي', value: (stats.goldBarbers * 150).toLocaleString() },
              { label: 'ماسي', value: (stats.diamondBarbers * 200).toLocaleString() },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-slate-800 py-4"
              >
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="font-semibold text-white">{row.value} ر.س</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm font-semibold text-slate-300">الإجمالي</span>
              <span className="text-xl font-bold text-amber-200">{stats.monthlyRevenue.toLocaleString()} ر.س</span>
            </div>
          </div>
        </FounderGlassCard>
      </FounderStaggerGrid>

      {showOperationalFeed ? (
        <FounderStaggerItem>
          <FounderOperationalFeedPanel compact titleAr="التغذية التشغيلية — OPS_MANAGER" />
        </FounderStaggerItem>
      ) : null}

      {showOperationalFeed ? (
        <FounderStaggerItem>
          <PublicProsecutorDashboard compact />
        </FounderStaggerItem>
      ) : null}

      {showOperationalFeed ? (
        <FounderStaggerItem>
          <EngineeringPendingApprovalsPanel />
        </FounderStaggerItem>
      ) : null}
    </FounderStaggerGrid>
  );
}

// Stats Card Component — legacy; prefer FounderMetricTile in overview
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
  canOpenRequestReview,
  canExportCsv,
}: {
  requests: SubscriptionRequest[];
  onViewRequest: (request: SubscriptionRequest) => void;
  canOpenRequestReview: boolean;
  canExportCsv: boolean;
}) {
  const [query, setQuery] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
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
        requestStatusFilter?: string;
        sourceFilter?: string;
        mediumFilter?: string;
        campaignFilter?: string;
      };
      if (typeof parsed.query === 'string') setQuery(parsed.query);
      if (parsed.requestStatusFilter === 'pending' || parsed.requestStatusFilter === 'approved' || parsed.requestStatusFilter === 'rejected') {
        setRequestStatusFilter(parsed.requestStatusFilter);
      } else if (parsed.requestStatusFilter === 'all') {
        setRequestStatusFilter('all');
      }
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
      requestStatusFilter,
      sourceFilter,
      mediumFilter,
      campaignFilter,
    });
    localStorage.setItem(ADMIN_REQUESTS_MARKETING_FILTERS_KEY, payload);
  }, [query, requestStatusFilter, sourceFilter, mediumFilter, campaignFilter]);

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
      if (requestStatusFilter !== 'all' && request.status !== requestStatusFilter) return false;

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
  }, [requests, query, requestStatusFilter, sourceFilter, mediumFilter, campaignFilter]);

  const resetMarketingFilters = () => {
    setRequestStatusFilter('all');
    setSourceFilter('all');
    setMediumFilter('all');
    setCampaignFilter('all');
    setQuery('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_REQUESTS_MARKETING_FILTERS_KEY);
    }
  };

  const exportFilteredRequestsCsv = () => {
    if (!canExportCsv) {
      toast({ title: 'لا تملك صلاحية تصدير الطلبات', variant: 'destructive' });
      return;
    }
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
        <h2 className="text-2xl font-bold">طلبات الحزم البرمجية والإدراج</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={requestStatusFilter}
            onValueChange={(v) => setRequestStatusFilter(v as 'all' | 'pending' | 'approved' | 'rejected')}
          >
            <SelectTrigger className="w-[168px]">
              <SelectValue placeholder="حالة الطلب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="pending">بانتظار المراجعة</SelectItem>
              <SelectItem value="approved">مقبول</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="بحث بالاسم/الإيميل/الجوال/المدينة/رقم الطلب..."
            className="w-72 min-w-[200px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="outline" size="icon" onClick={resetMarketingFilters} title="إعادة ضبط الفلاتر">
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={exportFilteredRequestsCsv}
            disabled={!canExportCsv || filteredRequests.length === 0}
            title={!canExportCsv ? 'يتطلب صلاحية اعتماد/رفض الطلبات' : undefined}
          >
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
            قراءة مباشرة لبيانات UTM/Click IDs المرسلة من مسار الخدمات البرمجية للمنصة مع طلبات التسجيل.
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
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start">
                  <Button onClick={() => onViewRequest(request)} disabled={!canOpenRequestReview}>
                    <Eye className="w-4 h-4 ml-2" />
                    {canOpenRequestReview ? 'إدارة الطلب' : 'عرض فقط'}
                  </Button>
                </div>
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
  canReviewRequests,
  canSubscriberLifecycle,
  canSubscriberComms,
}: {
  request: SubscriptionRequest;
  reviewerEmail: string;
  onClose: () => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onAfterDecision: () => void;
  canReviewRequests: boolean;
  canSubscriberLifecycle: boolean;
  canSubscriberComms: boolean;
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
    if (!canReviewRequests) {
      toast({ title: 'لا تملك صلاحية اعتماد الطلبات', variant: 'destructive' });
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
    if (upsert.warning) {
      toast({
        title: 'تنبيه: أعمدة الرعاية الشاملة',
        description: upsert.warning,
      });
    }
    if (upsert.shopOpenQuickHashLink) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      toast({
        title: 'رابط حالة المحل للصالون',
        description: `${origin}${upsert.shopOpenQuickHashLink} — أرسله للحلاق (مفيد للبرونزي دون لوحة تحكم).`,
      });
    }
    const res = await patchRegistrationSubmissionPayloadRemote(request.id, {
      status: 'approved',
      adminAccountState: 'active',
      reviewedAt,
      reviewedBy: reviewerEmail,
      rejectionReason: undefined,
      suspensionReason: undefined,
      linkedBarberId: upsert.barberId,
      barberMemberNumber:
        upsert.memberNumber != null && Number.isFinite(upsert.memberNumber)
          ? upsert.memberNumber
          : undefined,
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
        description: mail.ok
          ? 'تم اعتماد الطلب وأُرسل البريد، لكن الحساب غير ظاهر فوراً في قائمة الحلاقين (قد يكون اختلاف مشروع Supabase بين الواجهة والسيرفر).'
          : 'تم اعتماد الطلب لكن الحساب غير ظاهر فوراً في القائمة، وفشل إرسال البريد أيضاً — راجع تنبيه الإرسال أدناه.',
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
    if (!canReviewRequests) {
      toast({ title: 'لا تملك صلاحية رفض الطلبات', variant: 'destructive' });
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
    if (!canSubscriberLifecycle) {
      toast({ title: 'لا تملك صلاحية تعليق الحساب', variant: 'destructive' });
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
    if (!canSubscriberLifecycle) {
      toast({ title: 'لا تملك صلاحية حذف الطلب', variant: 'destructive' });
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
    if (!canSubscriberComms) {
      toast({ title: 'لا تملك صلاحية إعادة إرسال رسالة الروابط', variant: 'destructive' });
      return;
    }
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
    const resendRef = mail.messageId
      ? `\nمعرّف في Resend: ${mail.messageId}\nافتح resend.com → Emails وابحث بهذا المعرف لمعرفة إن كانت «مُسلَّمة» أو «مرتدة».`
      : '';
    toast({
      title: 'تم تسليم الرسالة إلى Resend',
      description: `المستلم: ${recipient}\nResend قبلت الطلب؛ الوصول لصندوق Gmail قد يتأخر أو يذهب للمزعج/العروض. للتأكيد الفعلي استخدم لوحة Resend وليس واجهتنا فقط.${resendRef}`,
    });
  };

  return (
    <Dialog
      open={!!request}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl">مراجعة طلب الحزمة البرمجية والإدراج</DialogTitle>
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
            {request.barberMemberNumber != null &&
            Number.isFinite(request.barberMemberNumber) ? (
              <div className="rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-2 mb-4">
                <Label>رقم العضوية على المنصة (بعد الاعتماد)</Label>
                <p className="text-sm font-mono font-semibold mt-1" dir="ltr">
                  {formatBarberMemberNumber(request.barberMemberNumber)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  مرجع دائم للأرشفة والدعم — يختلف عن رقم طلب التسجيل أعلاه.
                </p>
              </div>
            ) : null}
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
                الظهور عبر نظام الرصد الذكي
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

          {/* التعهد القانوني من نموذج التسجيل */}
          <div>
            <h3 className="text-lg font-semibold mb-3">التعهد القانوني</h3>
            {request.legalDisclaimerAccepted ? (
              <div className="mb-4 space-y-2 rounded-lg border border-primary/25 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  صاحب المحل أقرّ بامتثال منشأته لاشتراطات وزارة التجارة والبلدية وتحمّل المسؤولية القانونية وإخلاء مسؤولية
                  منصة حلاق ماب — كما في نموذج التسجيل الحالي.
                </p>
                {request.legalDisclaimerAcceptedAtIso ? (
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    وقت التأشير (UTC): {request.legalDisclaimerAcceptedAtIso}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mb-4 text-sm text-amber-800 dark:text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
                لا يظهر في هذا الطلب تعهد قانوني مُسجّل (طلب قديم أو بيانات ناقصة). راجع الطلب يدوياً قبل القبول.
              </p>
            )}
            <p className="text-xs text-muted-foreground mb-2">ملاحظات الطلب كما أُرسلت:</p>
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
            request.servicesSummary ||
            request.inclusiveAccessibleCare?.offered) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">الدفع والخدمات (من نموذج التسجيل)</h3>
              <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
                {request.paymentMethod && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">طريقة الدفع: </span>
                    <span className="font-medium">
                      {request.paymentMethod === 'bank_transfer'
                        ? 'تحويل بنكي (6 أشهر)'
                        : 'حزمة برمجية (ميسر)'}
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
                {request.inclusiveAccessibleCare?.offered && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">خدمة مُيسَّرة / منزلية (كبار السن والمرضى وذوي الاحتياجات): </span>
                    <span className="font-medium">
                      نعم — السعر المعروض:{' '}
                      {request.inclusiveAccessibleCare.displayedPriceSar != null &&
                      request.inclusiveAccessibleCare.displayedPriceSar > 0
                        ? `${request.inclusiveAccessibleCare.displayedPriceSar} ر.س`
                        : '—'}
                    </span>
                  </p>
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
              <Button
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
                disabled={saving || !canReviewRequests}
              >
                <XCircle className="w-4 h-4 ml-2" />
                {request.status === 'pending' ? 'رفض الطلب' : 'إعادة رفض'}
              </Button>
              <Button
                onClick={() => void handleApprove()}
                disabled={saving || !canReviewRequests}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 ml-2" />}
                اعتماد/إعادة اعتماد
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleSuspendAccount()}
                disabled={saving || !canSubscriberLifecycle}
              >
                تعليق الحساب
              </Button>
              <Button variant="outline" onClick={() => void handleResendOnboarding()} disabled={saving || !canSubscriberComms}>
                <Mail className="w-4 h-4 ml-2" />
                إعادة إرسال رسالة الروابط
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleDeleteRequest()}
                disabled={saving || !canSubscriberLifecycle}
                className="text-red-600 border-red-500/40 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف الطلب
              </Button>
            </>
          ) : (
            <Button variant="destructive" onClick={() => void handleReject()} disabled={saving || !canReviewRequests}>
              {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
              تأكيد الرفض
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function isMockSubscriptionRequestRow(id: string): boolean {
  return shouldShowAdminMocks() && MOCK_SUBSCRIPTION_REQUESTS.some((m) => m.id === id);
}

function BarberHardEditDialog({
  barber,
  open,
  onOpenChange,
  onSaved,
  registrationRequests,
  onRegistrationPayloadSynced,
}: {
  barber: AdminBarberRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (next: AdminBarberRow) => void;
  registrationRequests: SubscriptionRequest[];
  onRegistrationPayloadSynced: () => void;
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

    const emailChanged = emailTrim !== barber.email.trim().toLowerCase();
    const phoneChanged = phoneTrim !== barber.phone.trim();
    let submissionSyncHint = '';
    if (emailChanged || phoneChanged) {
      const linked = registrationRequests.filter(
        (r) => r.linkedBarberId === barber.id && !isMockSubscriptionRequestRow(r.id)
      );
      if (linked.length) {
        const payloadPatch: { email?: string; phone?: string } = {};
        if (emailChanged) payloadPatch.email = emailTrim;
        if (phoneChanged) payloadPatch.phone = phoneTrim;
        const failures: string[] = [];
        for (const r of linked) {
          const pr = await patchRegistrationSubmissionPayloadRemote(r.id, payloadPatch);
          if (!pr.ok) failures.push(pr.error);
        }
        onRegistrationPayloadSynced();
        if (failures.length) {
          toast({
            title: 'حُفظ الحلاق لكن تعذر تحديث الطلب المرتبط',
            description: failures[0] ?? 'خطأ غير معروف',
            variant: 'destructive',
          });
        } else if (emailChanged && phoneChanged) {
          submissionSyncHint = ` — وتم تحديث البريد والجوال في ${linked.length} طلب مرتبط (تبويب الطلبات).`;
        } else if (emailChanged) {
          submissionSyncHint = ` — وتم تحديث البريد في ${linked.length} طلب مرتبط (تبويب الطلبات).`;
        } else if (phoneChanged) {
          submissionSyncHint = ` — وتم تحديث الجوال في ${linked.length} طلب مرتبط (تبويب الطلبات).`;
        }
      } else if (emailChanged || phoneChanged) {
        submissionSyncHint =
          ' — لم يُعثر على طلب تسجيل مربوط (linkedBarberId)؛ بريد الطلب في «الطلبات» لم يتغير تلقائياً.';
      }
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
    toast({ title: 'تم حفظ التعديلات', description: `${nameTrim}${submissionSyncHint}` });
    onSaved(next);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الحلاق (صلاحية رئيسية)</DialogTitle>
          <DialogDescription>
            يُستخدم للدعم الفني عند تعذّر الحلاق على تعديل بياناته أو صوره. اترك حقول الصور فارغة لإزالة الرابط. عند
            تغيير البريد أو الجوال يُحدَّث تلقائياً طلب التسجيل المرتبط بنفس الحساب في تبويب الطلبات إن وُجد
            ربط.
          </DialogDescription>
          {barber ? (
            <p className="text-sm text-muted-foreground pt-1">
              رقم العضوية على المنصة:{' '}
              <span className="font-mono font-semibold text-foreground" dir="ltr">
                {formatBarberMemberNumber(barber.memberNumber) ?? '—'}
              </span>
            </p>
          ) : null}
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
                <p className="text-xs text-muted-foreground">يتحكم في ظهور الصالون في نظام الرصد الذكي/القوائم حسب منطق التطبيق.</p>
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

const BARBER_PURGE_CONFIRM_PHRASE = 'حذف كل الحلاقين';

function formatBarberCreatedAtDisplay(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

// Barbers Section
function BarbersSection({
  refreshNonce,
  onStatsNeedRefresh,
  canManage,
  canRootHardEdit,
  registrationRequests,
  onRegistrationPayloadSynced,
  isFounderView,
}: {
  refreshNonce: number;
  onStatsNeedRefresh: () => void;
  canManage: boolean;
  canRootHardEdit: boolean;
  registrationRequests: SubscriptionRequest[];
  onRegistrationPayloadSynced: () => void;
  isFounderView: boolean;
}) {
  const [rows, setRows] = useState<AdminBarberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mergingId, setMergingId] = useState<string | null>(null);
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [broadcastingEmails, setBroadcastingEmails] = useState(false);
  const [hardEditRow, setHardEditRow] = useState<AdminBarberRow | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | SubscriptionTier>('all');
  const [filterVerified, setFilterVerified] = useState<'all' | 'yes' | 'no'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgePhrase, setPurgePhrase] = useState('');
  const [purging, setPurging] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  useEffect(() => {
    setSelectedIds(new Set());
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
    if (!canManage) return;
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

  const filteredRows = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    const cityQ = filterCity.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterTier !== 'all' && r.tier !== filterTier) return false;
      if (filterVerified === 'yes' && !r.is_verified) return false;
      if (filterVerified === 'no' && r.is_verified) return false;
      if (filterActive === 'active' && !r.is_active) return false;
      if (filterActive === 'inactive' && r.is_active) return false;
      if (cityQ && !(r.city ?? '').toLowerCase().includes(cityQ)) return false;
      if (q) {
        const blob = `${r.name} ${r.email} ${r.phone}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filterText, filterCity, filterTier, filterVerified, filterActive]);

  const visibleRows = useMemo(() => {
    if (!duplicatesOnly) return filteredRows;
    return filteredRows.filter(
      (r) =>
        (duplicateContactMap.get(`e:${r.email.trim().toLowerCase()}`) ?? 0) > 1 ||
        (duplicateContactMap.get(`p:${r.phone.trim()}`) ?? 0) > 1
    );
  }, [filteredRows, duplicatesOnly, duplicateContactMap]);

  const visibleIdSet = useMemo(() => new Set(visibleRows.map((r) => r.id)), [visibleRows]);
  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((r) => selectedIds.has(r.id));
  const someVisibleSelected = visibleRows.some((r) => selectedIds.has(r.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const r of visibleRows) next.delete(r.id);
      } else {
        for (const r of visibleRows) next.add(r.id);
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set<string>();
      for (const id of prev) {
        if (visibleIdSet.has(id)) next.add(id);
      }
      return next.size === prev.size ? prev : next;
    });
  }, [visibleIdSet]);

  const keepRowAndDeleteDuplicates = async (keeper: AdminBarberRow) => {
    if (!canManage) return;
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

  const resetBarberFilters = () => {
    setFilterText('');
    setFilterCity('');
    setFilterTier('all');
    setFilterVerified('all');
    setFilterActive('all');
    setDuplicatesOnly(false);
  };

  const onPurgeAllBarbers = async () => {
    if (purgePhrase.trim() !== BARBER_PURGE_CONFIRM_PHRASE) {
      toast({
        title: 'عبارة التأكيد غير صحيحة',
        description: `اكتب بالضبط: ${BARBER_PURGE_CONFIRM_PHRASE}`,
        variant: 'destructive',
      });
      return;
    }
    setPurging(true);
    const res = await purgeAllBarbersRemote();
    setPurging(false);
    if (!res.ok) {
      toast({
        title: 'تعذر مسح جميع الحلاقين',
        description:
          res.deletedPartial != null
            ? `${errorText(res, '')} (تم حذف ${res.deletedPartial} قبل التوقف)`
            : errorText(res, ''),
        variant: 'destructive',
      });
      void listBarbersForAdmin().then(setRows);
      onStatsNeedRefresh();
      return;
    }
    setRows([]);
    setSelectedIds(new Set());
    setPurgeOpen(false);
    setPurgePhrase('');
    toast({
      title: 'تم مسح جميع الحلاقين',
      description: `عدد الصفوف المحذوفة: ${res.deleted}. يمكنك الآن إنشاء حسابات جديدة متوافقة مع مسار شراء الحزم البرمجية والظهور العام.`,
    });
    onStatsNeedRefresh();
  };

  const onDeleteSelectedBarbers = async () => {
    if (!canManage) return;
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (!window.confirm(`تأكيد حذف ${ids.length} حساب/حسابات محددة؟ لا يمكن التراجع.`)) return;
    setBulkDeleting(true);
    let removed = 0;
    for (const id of ids) {
      const res = await deleteBarberRemote(id);
      if (!res.ok) {
        setBulkDeleting(false);
        toast({
          title: 'توقف الحذف الجماعي',
          description: errorText(res, `فشل عند أحد المعرفات بعد حذف ${removed}.`),
          variant: 'destructive',
        });
        void listBarbersForAdmin().then(setRows);
        onStatsNeedRefresh();
        return;
      }
      removed += 1;
    }
    setBulkDeleting(false);
    setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
    toast({ title: 'تم حذف المحدد', description: `عدد الحسابات: ${removed}` });
    onStatsNeedRefresh();
  };

  const sectionTheme = isFounderView ? founderTheme : staffTheme;
  const sectionMotion = isFounderView
    ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }
    : staffMotion.enter;
  const BarberPanel = isFounderView ? FounderGlassCard : StaffProfessionalCard;
  const statsBarClass = isFounderView
    ? 'mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-gray-900/30 px-3 py-2'
    : 'mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2';

  return (
    <motion.div {...sectionMotion}>
      <header className="mb-6 space-y-1 text-right">
        <p className={sectionTheme.pageEyebrow}>Barber registry</p>
        <h2 className={sectionTheme.pageTitle}>إدارة الحلاقين</h2>
      </header>
      <BarberPanel className="p-6 md:p-7">
          <div className={statsBarClass}>
            <div className="text-sm text-slate-400">
              إجمالي الحسابات: <span className="font-semibold text-white">{rows.length}</span>
              {' · '}
              بعد الفلاتر:{' '}
              <span className="font-semibold text-white">{filteredRows.length}</span>
              {' · '}
              المعروض: <span className="font-semibold text-white">{visibleRows.length}</span>
              {' · '}
              المكررة: <span className="font-semibold text-red-400">{rows.filter((r) => isDuplicateRow(r)).length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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

          <div className="mb-4 grid gap-3 rounded-lg border border-border/80 bg-background p-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label className="text-xs text-muted-foreground">بحث (اسم، بريد، جوال)</Label>
              <div className="relative">
                <Search className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pr-9"
                  placeholder="مثال: صالون أو @gmail"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">المدينة</Label>
              <Input placeholder="فلترة جزئية" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">الباقة</Label>
              <Select
                value={filterTier}
                onValueChange={(v) => setFilterTier(v === 'all' ? 'all' : (v as SubscriptionTier))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الباقات</SelectItem>
                  <SelectItem value={SubscriptionTier.BRONZE}>برونزي</SelectItem>
                  <SelectItem value={SubscriptionTier.GOLD}>ذهبي</SelectItem>
                  <SelectItem value={SubscriptionTier.DIAMOND}>ماسي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">التوثيق</Label>
              <Select value={filterVerified} onValueChange={(v) => setFilterVerified(v as 'all' | 'yes' | 'no')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="yes">موثّق فقط</SelectItem>
                  <SelectItem value="no">غير موثّق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">ظهور للعامة (is_active)</Label>
              <Select value={filterActive} onValueChange={(v) => setFilterActive(v as 'all' | 'active' | 'inactive')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="active">مفعّل فقط</SelectItem>
                  <SelectItem value="inactive">معطّل فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={resetBarberFilters}>
                <Filter className="h-4 w-4" />
                مسح الفلاتر
              </Button>
              {canManage && selectedIds.size > 0 ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={bulkDeleting}
                  onClick={() => void onDeleteSelectedBarbers()}
                >
                  {bulkDeleting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                  حذف المحدد ({selectedIds.size})
                </Button>
              ) : null}
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري التحميل…
            </div>
          ) : visibleRows.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              لا توجد صفوف تطابق الفلاتر الحالية، أو جدول الحلاقين فارغ، أو RLS يمنع القراءة.
            </p>
          ) : (
            <FounderPremiumTableShell>
            <FounderPremiumTable>
              <FounderPremiumTableHeader>
                <FounderPremiumTableRow>
                  {canManage ? (
                    <FounderPremiumTableHead className="w-10 text-center">
                      <Checkbox
                        checked={
                          allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false
                        }
                        onCheckedChange={() => toggleSelectAllVisible()}
                        aria-label="تحديد الكل في الصفحة المصفاة"
                      />
                    </FounderPremiumTableHead>
                  ) : null}
                  <FounderPremiumTableHead className="whitespace-nowrap">رقم العضوية</FounderPremiumTableHead>
                  <FounderPremiumTableHead>الاسم</FounderPremiumTableHead>
                  <FounderPremiumTableHead>البريد</FounderPremiumTableHead>
                  <FounderPremiumTableHead>المدينة</FounderPremiumTableHead>
                  <FounderPremiumTableHead>الباقة</FounderPremiumTableHead>
                  <FounderPremiumTableHead>موثّق</FounderPremiumTableHead>
                  <FounderPremiumTableHead className="whitespace-nowrap text-center">تاريخ الإنشاء</FounderPremiumTableHead>
                  <FounderPremiumTableHead className="text-center">ظهور للعامة</FounderPremiumTableHead>
                  <FounderPremiumTableHead className="text-center">إجراءات</FounderPremiumTableHead>
                </FounderPremiumTableRow>
              </FounderPremiumTableHeader>
              <FounderPremiumTableBody>
                {visibleRows.map((row) => (
                  <FounderPremiumTableRow key={row.id}>
                    {canManage ? (
                      <FounderPremiumTableCell className="text-center">
                        <Checkbox
                          checked={selectedIds.has(row.id)}
                          onCheckedChange={() => toggleSelectOne(row.id)}
                          aria-label={`تحديد ${row.name}`}
                        />
                      </FounderPremiumTableCell>
                    ) : null}
                    <FounderPremiumTableCell className="font-mono text-xs" dir="ltr" muted>
                      {formatBarberMemberNumber(row.memberNumber) ?? '—'}
                    </FounderPremiumTableCell>
                    <FounderPremiumTableCell className="font-medium">{row.name}</FounderPremiumTableCell>
                    <FounderPremiumTableCell className="max-w-[140px] truncate" title={row.email} muted>
                      {row.email}
                    </FounderPremiumTableCell>
                    <FounderPremiumTableCell muted>{row.city ?? '—'}</FounderPremiumTableCell>
                    <FounderPremiumTableCell>
                      <Badge variant="outline">
                        {row.tier === SubscriptionTier.DIAMOND && '💎 ماسي'}
                        {row.tier === SubscriptionTier.GOLD && '🥇 ذهبي'}
                        {row.tier === SubscriptionTier.BRONZE && '🥉 برونزي'}
                      </Badge>
                    </FounderPremiumTableCell>
                    <FounderPremiumTableCell muted>{row.is_verified ? 'نعم' : 'لا'}</FounderPremiumTableCell>
                    <FounderPremiumTableCell className="text-center text-xs whitespace-nowrap" muted>
                      {formatBarberCreatedAtDisplay(row.createdAt)}
                    </FounderPremiumTableCell>
                    <FounderPremiumTableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={row.is_active}
                          disabled={!canManage || updatingId === row.id}
                          onCheckedChange={(v) => void onToggleActive(row, v)}
                          aria-label={row.is_active ? 'تعطيل الظهور' : 'تفعيل الظهور'}
                        />
                        {updatingId === row.id ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}
                      </div>
                    </FounderPremiumTableCell>
                    <FounderPremiumTableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isDuplicateRow(row) ? (
                          <Badge variant="destructive">مكرر</Badge>
                        ) : null}
                        {isDuplicateRow(row) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canManage || mergingId === row.id || deletingId === row.id}
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
                          disabled={!canManage || deletingId === row.id || mergingId === row.id}
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
                    </FounderPremiumTableCell>
                  </FounderPremiumTableRow>
                ))}
              </FounderPremiumTableBody>
            </FounderPremiumTable>
            </FounderPremiumTableShell>
          )}

          {canRootHardEdit && canManage ? (
            <div className="mt-8 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive">منطقة خطرة — المالك فقط</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                حذف جميع صفوف الحلاقين من قاعدة البيانات (مع ما يرتبط تلقائياً بحسب CASCADE مثل سجلات الحزم البرمجية القديمة
                والتقييمات والحجوزات المرتبطة بنفس الجدول). لا يُنصح به على بيانات إنتاج حقيقية إلا بعد نسخ احتياطي.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-3"
                disabled={rows.length === 0 || purging}
                onClick={() => {
                  setPurgePhrase('');
                  setPurgeOpen(true);
                }}
              >
                مسح جميع الحلاقين من القاعدة ({rows.length})
              </Button>
            </div>
          ) : null}
      </BarberPanel>

      <Dialog open={purgeOpen} onOpenChange={(open) => {
        setPurgeOpen(open);
        if (!open) setPurgePhrase('');
      }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد مسح جميع الحلاقين</DialogTitle>
            <DialogDescription className="text-right leading-relaxed">
              سيتم حذف <strong>{rows.length}</strong> حساب/حسابات من جدول <code className="text-xs">barbers</code> والبيانات
              المرتبطة بحسب قواعد قاعدة البيانات. للمتابعة اكتب بالضبط:{' '}
              <span className="font-mono text-foreground">{BARBER_PURGE_CONFIRM_PHRASE}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="purge-phrase">عبارة التأكيد</Label>
            <Input
              id="purge-phrase"
              dir="rtl"
              autoComplete="off"
              value={purgePhrase}
              onChange={(e) => setPurgePhrase(e.target.value)}
              placeholder={BARBER_PURGE_CONFIRM_PHRASE}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setPurgeOpen(false)} disabled={purging}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={purging || purgePhrase.trim() !== BARBER_PURGE_CONFIRM_PHRASE}
              onClick={() => void onPurgeAllBarbers()}
            >
              {purging ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              تنفيذ المسح الكامل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        registrationRequests={registrationRequests}
        onRegistrationPayloadSynced={onRegistrationPayloadSynced}
      />
    </motion.div>
  );
}

function formatHalalasSar(amount: number | string | null): string {
  const n =
    typeof amount === 'number'
      ? amount
      : typeof amount === 'string'
        ? Number.parseFloat(amount)
        : NaN;
  if (!Number.isFinite(n)) return '—';
  return `${(n / 100).toFixed(2)} ر.س`;
}

/** أرشيف عرض فقط — إصدار/تفعيل الحزمة البرمجية يتم تلقائياً من Webhook ميسر عند توفر linkedBarberId. */
function MoyasarSubscriptionsArchiveSection({ rows }: { rows: BarberSubscriptionAdminRow[] }) {
  const sorted = useMemo(
    () => [...rows].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))),
    [rows],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">سجل دفعات ميسر (حزم برمجية إدراج)</h2>
        <p className="text-sm text-muted-foreground">
          للعرض والمرجعية فقط. عند نجاح الدفع يُصدَر/يُفعَّل الحزمة البرمجية الرقمية ويُرسل بريد الترحيب أو كود التفعيل تلقائياً من
          الخادم (Edge Webhook + API) دون انتظار خطوة من هذه اللوحة.
        </p>
      </div>
      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لا توجد صفوف دفع حزم برمجية ميسر في الجدول بعد، أو لا تطابق عوامل التصفية الحالية.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">آخر الحركات</CardTitle>
            <CardDescription>حتى 50 صفاً — الحالة كما في قاعدة البيانات</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {sorted.slice(0, 50).map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap justify-between gap-2 border-b border-border/60 py-2 last:border-0"
                dir="ltr"
              >
                <span className="text-muted-foreground">{r.moyasar_payment_id}</span>
                <span className="text-right" dir="rtl">
                  <Badge variant="outline">{r.status}</Badge>
                  <span className="mx-2 text-muted-foreground">{formatHalalasSar(r.amount_halalas)}</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
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
  const partnerPathPrintCardUrl = `${siteOrigin}/#${ROUTE_PATHS.INTERNAL_PARTNER_PATH_PRINT_CARD}`;
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
      a: 'لا، مسار الخدمات البرمجية للمنصة مبني لقرار سريع وتسجيل مباشر بأقل احتكاك.',
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
    won: { label: 'تم شراء الحزمة البرمجية', className: 'bg-green-500/10 text-green-600 border-green-500/30' },
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
            هذه المواد تخص فريق التسويق وغرفة القيادة فقط، وتُمنع من الظهور في مسار الخدمات البرمجية للمنصة العام.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <p className="font-semibold">روابط الحملة المعتمدة</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  مسار الخدمات البرمجية للمنصة:{' '}
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
                <p>
                  بطاقة QR للطباعة والحملات (صفحة داخلية — لا تظهر في القوائم العامة):{' '}
                  <a className="underline" href={partnerPathPrintCardUrl} target="_blank" rel="noopener noreferrer">
                    {partnerPathPrintCardUrl}
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
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">تم شراء الحزمة البرمجية</p><p className="text-2xl font-bold text-green-600">{pipelineCounts.won}</p></CardContent></Card>
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
                <SelectItem value="won">تم شراء الحزمة البرمجية</SelectItem>
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
                      <SelectItem value="won">تم شراء الحزمة البرمجية</SelectItem>
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

// Messages Section — دردشة دعم المنصة (TLS + تحقق خادمي؛ المحتوى في قاعدة البيانات بصلاحيات مقيدة)
function MessagesSection({ canUseChat }: { canUseChat: boolean }) {
  const [threads, setThreads] = useState<AdminSupportThread[]>([]);
  const [barbers, setBarbers] = useState<AdminBarberRow[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [messages, setMessages] = useState<AdminSupportMessageRow[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const pollRef = useRef<number | null>(null);

  const loadThreads = useCallback(async () => {
    if (!canUseChat) return;
    setLoadingThreads(true);
    const r = await fetchAdminSupportThreadsRemote();
    setLoadingThreads(false);
    if (!r.ok) {
      toast({ title: 'تعذر تحميل قائمة المحادثات', description: r.error, variant: 'destructive' });
      return;
    }
    setThreads(r.threads);
  }, [canUseChat]);

  const loadMessages = useCallback(
    async (barberId: string) => {
      if (!barberId || !canUseChat) return;
      setLoadingMessages(true);
      const r = await fetchAdminSupportMessagesRemote(barberId);
      setLoadingMessages(false);
      if (!r.ok) {
        toast({ title: 'تعذر تحميل الرسائل', description: r.error, variant: 'destructive' });
        return;
      }
      setMessages(r.messages);
    },
    [canUseChat]
  );

  useEffect(() => {
    void listBarbersForAdmin().then(setBarbers);
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedBarberId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedBarberId);
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => void loadMessages(selectedBarberId), 8000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [selectedBarberId, loadMessages]);

  const send = async () => {
    if (!canUseChat || !selectedBarberId.trim() || !draft.trim()) return;
    setSending(true);
    const r = await sendAdminSupportMessageRemote({ barberId: selectedBarberId.trim(), body: draft.trim() });
    setSending(false);
    if (!r.ok) {
      toast({ title: 'تعذر الإرسال', description: r.error, variant: 'destructive' });
      return;
    }
    setDraft('');
    await loadMessages(selectedBarberId.trim());
    await loadThreads();
    toast({ title: 'تم إرسال الرسالة' });
  };

  const selectedLabel =
    threads.find((t) => t.barberId === selectedBarberId)?.barberName ||
    barbers.find((b) => b.id === selectedBarberId)?.name ||
    '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">الرسائل والدعم الفني</h2>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          محادثة مباشرة مع الحلاق عبر الخادم (HTTPS). يُتحقق من جلسة Supabase وصلاحية{' '}
          <span className="font-medium text-foreground">عرض الرسائل</span> قبل أي قراءة أو إرسال؛ بيانات الرسائل
          لا تُعرَض إلا لمن يملك المفتاح نفسه في لوحة الإدارة.
        </p>
      </div>

      {!canUseChat ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">لا تملك صلاحية عرض الرسائل.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">المحادثات</CardTitle>
              <CardDescription>حلاقون برسائل سابقة أو اختر حساباً لبدء محادثة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={loadingThreads}
                onClick={() => void loadThreads()}
              >
                {loadingThreads ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                تحديث القائمة
              </Button>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">فتح محادثة / حساب</Label>
                <Select
                  value={selectedBarberId || undefined}
                  onValueChange={(v) => setSelectedBarberId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحلاق…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {threads.map((t) => (
                      <SelectItem key={t.barberId} value={t.barberId}>
                        {t.barberName} — آخر رسالة: {t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleString('ar-SA') : '—'}
                      </SelectItem>
                    ))}
                    {barbers
                      .filter((b) => !threads.some((t) => t.barberId === b.id))
                      .map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} (بدء جديد)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {threads.length === 0 && !loadingThreads ? (
                <p className="text-xs text-muted-foreground">لا توجد رسائل بعد — اختر حلاقاً من القائمة لإرسال أول رسالة.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {selectedBarberId ? `محادثة: ${selectedLabel || selectedBarberId}` : 'اختر حلاقاً'}
              </CardTitle>
              <CardDescription>الرسائل تُحدَّث تلقائياً كل بضع ثوانٍ أثناء بقائك هنا</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedBarberId ? (
                <p className="text-sm text-muted-foreground py-6 text-center">اختر حساباً من العمود الأيمن.</p>
              ) : loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري التحميل…
                </div>
              ) : (
                <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">لا رسائل بعد — اكتب أول رسالة أدناه.</p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.from_admin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[88%] rounded-lg p-3 text-sm ${
                            m.from_admin ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <p className="mt-1 text-[11px] opacity-80">
                            {m.from_admin ? `إدارة: ${m.admin_sender_email ?? '—'}` : 'الحلاق'} ·{' '}
                            {new Date(m.created_at).toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Textarea
                  placeholder="اكتب رسالة الدعم…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  disabled={!selectedBarberId || sending}
                  className="min-h-[80px] sm:flex-1"
                />
                <Button
                  type="button"
                  className="sm:self-end shrink-0 gap-2"
                  disabled={!selectedBarberId || !draft.trim() || sending}
                  onClick={() => void send()}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  إرسال
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}

// Settings Section
function SettingsSection({
  adminEmail,
  canManageAdmins,
  bootstrapAdmin,
  canSavePlatformVat,
  canViewZatcaFinancialOffice,
  canViewPartnerMarketing,
  canManagePartnerMarketing,
}: {
  adminEmail: string;
  canManageAdmins: boolean;
  bootstrapAdmin: boolean;
  /** ضريبة العرض والقواعد التجارية على الواجهات العامة */
  canSavePlatformVat: boolean;
  canViewZatcaFinancialOffice: boolean;
  canViewPartnerMarketing: boolean;
  canManagePartnerMarketing: boolean;
}) {
  const ADMIN_ROLE_TEMPLATES: { key: string; label: string; permissions: AdminPermissions }[] = [
    { key: 'super_admin', label: 'سوبر أدمن (كامل الصلاحيات)', permissions: FULL_ADMIN_PERMISSIONS },
    {
      key: 'finance_admin',
      label: 'مدير مالي',
      permissions: {
        ...FULL_ADMIN_PERMISSIONS,
        view_requests: false,
        review_requests: false,
        manage_barbers: false,
        view_command_center: false,
        manage_command_center: false,
        view_messages: false,
        manage_admins: false,
        manage_payment_settings: false,
        manage_subscriber_comms: false,
        manage_subscriber_lifecycle: false,
        manage_centralized_billing_ops: false,
        view_ops_billing_monitor: true,
        view_partner_marketing: false,
        manage_partner_marketing: false,
        manage_platform_commerce_rules: false,
        view_admin_financial_archive: true,
        manage_admin_financial_archive: true,
      },
    },
    {
      key: 'subscriber_support',
      label: 'دعم المشتركين',
      permissions: {
        ...FULL_ADMIN_PERMISSIONS,
        review_payments: false,
        view_command_center: false,
        manage_command_center: false,
        view_settings: true,
        manage_admins: false,
        view_payment_settings: false,
        manage_payment_settings: false,
        manage_partner_billing: false,
        manage_centralized_billing_ops: false,
        view_ops_billing_monitor: false,
        view_partner_marketing: true,
        manage_partner_marketing: true,
        manage_platform_commerce_rules: false,
        view_admin_financial_archive: true,
        manage_admin_financial_archive: false,
      },
    },
    {
      key: 'payment_ops',
      label: 'مشرف مدفوعات',
      permissions: {
        ...FULL_ADMIN_PERMISSIONS,
        view_requests: false,
        review_requests: false,
        manage_barbers: false,
        view_command_center: false,
        manage_command_center: false,
        view_messages: false,
        view_settings: false,
        manage_admins: false,
        manage_subscriber_comms: false,
        manage_subscriber_lifecycle: false,
        manage_centralized_billing_ops: false,
        view_ops_billing_monitor: true,
        view_partner_marketing: false,
        manage_partner_marketing: false,
        manage_platform_commerce_rules: false,
        view_admin_financial_archive: true,
        manage_admin_financial_archive: true,
      },
    },
    {
      key: 'marketing_content',
      label: 'محتوى وتسويق الشركاء',
      permissions: {
        ...FULL_ADMIN_PERMISSIONS,
        view_requests: false,
        review_requests: false,
        manage_barbers: false,
        view_payments: false,
        review_payments: false,
        view_command_center: false,
        manage_command_center: false,
        manage_admins: false,
        view_payment_settings: false,
        manage_payment_settings: false,
        manage_subscriber_comms: false,
        manage_subscriber_lifecycle: false,
        manage_partner_billing: false,
        manage_centralized_billing_ops: false,
        view_ops_billing_monitor: false,
        view_partner_marketing: true,
        manage_partner_marketing: true,
        manage_platform_commerce_rules: false,
        view_admin_financial_archive: false,
        manage_admin_financial_archive: false,
      },
    },
    {
      key: 'ops_readonly',
      label: 'مراقب تشغيل (قراءة لوحة الفوترة فقط)',
      permissions: {
        ...FULL_ADMIN_PERMISSIONS,
        view_requests: false,
        review_requests: false,
        view_barbers: false,
        manage_barbers: false,
        view_payments: false,
        review_payments: false,
        view_command_center: false,
        manage_command_center: false,
        view_messages: false,
        view_settings: false,
        manage_admins: false,
        view_payment_settings: false,
        manage_payment_settings: false,
        manage_subscriber_comms: false,
        manage_subscriber_lifecycle: false,
        manage_partner_billing: false,
        manage_centralized_billing_ops: false,
        view_ops_billing_monitor: true,
        view_partner_marketing: false,
        manage_partner_marketing: false,
        manage_platform_commerce_rules: false,
        view_admin_financial_archive: true,
        manage_admin_financial_archive: false,
      },
    },
    {
      key: 'ops_manager',
      label: 'مراقب عمليات (OPS_MANAGER)',
      permissions: {
        ...FULL_ADMIN_PERMISSIONS,
        view_requests: false,
        review_requests: false,
        manage_barbers: false,
        view_payments: false,
        review_payments: false,
        view_command_center: false,
        manage_command_center: false,
        view_messages: false,
        view_settings: false,
        manage_admins: false,
        view_payment_settings: false,
        manage_payment_settings: false,
        manage_subscriber_comms: false,
        manage_subscriber_lifecycle: false,
        manage_partner_billing: false,
        manage_centralized_billing_ops: false,
        view_ops_billing_monitor: false,
        view_partner_marketing: false,
        manage_partner_marketing: false,
        manage_platform_commerce_rules: false,
        view_admin_financial_archive: false,
        manage_admin_financial_archive: false,
        view_overview: true,
        view_barbers: true,
        view_ops_controller: true,
        submit_ops_controller: true,
      },
    },
  ];
  const findTemplate = (key: string) => ADMIN_ROLE_TEMPLATES.find((t) => t.key === key);

  const [vatEnabled, setVatEnabled] = useState(() => getPlatformVatSettings().enabled);
  const [vatRateInput, setVatRateInput] = useState(() => String(getPlatformVatSettings().ratePercent));
  const [adminRows, setAdminRows] = useState<AdminRoleRow[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermissions>(FULL_ADMIN_PERMISSIONS);
  const [newAdminTemplateKey, setNewAdminTemplateKey] = useState<string>('super_admin');

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
    if (!canSavePlatformVat) {
      toast({ title: 'لا تملك صلاحية تعديل الإعدادات', variant: 'destructive' });
      return;
    }
    savePlatformVatSettings({
      enabled: vatEnabled,
      ratePercent: rateForPreview,
    });
    toast({
      title: 'تم حفظ إعدادات الضريبة',
      description: vatEnabled
        ? `مفعّلة — النسبة المعروضة ${rateForPreview}% (تُحسب تلقائياً في صفحات الدفع).`
        : 'معطّلة — تُعرض قيمة الحزمة البرمجية الرقمية فقط دون ضريبة في الواجهة.',
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
    setNewAdminTemplateKey('super_admin');
    await refreshAdmins();
  };

  const applyTemplateToExistingAdmin = async (row: AdminRoleRow, templateKey: string) => {
    const tpl = findTemplate(templateKey);
    if (!tpl) return;
    const res = await upsertAdminRole({
      email: row.email,
      displayName: row.display_name ?? undefined,
      isActive: row.is_active,
      permissions: tpl.permissions,
      createdByEmail: adminEmail,
    });
    if (!res.ok) {
      toast({ title: 'تعذر تطبيق القالب', description: errorText(res, 'تعذر تحديث صلاحيات الأدمن.'), variant: 'destructive' });
      return;
    }
    setAdminRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, permissions: tpl.permissions } : r)));
    toast({ title: 'تم تطبيق القالب', description: `${tpl.label} على ${row.email}` });
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-2">إعدادات المنصة</h2>

      <Card className="border-primary/25">
        <CardHeader>
          <CardTitle>إدارة المدراء والصلاحيات</CardTitle>
          <CardDescription>
            تعيين أدمن جديد مع صلاحيات دقيقة مجمّعة حسب المجال (تشغيل، مالية، تسويق، سوبر). المستوى المقترح بجانب كل
            مفتاح إرشاد فقط — يمكنك منح أدمن صلاحية «سوبر» محددة دون باقي المفاتيح. {bootstrapAdmin ? 'أنت في وضع Bootstrap بصلاحية كاملة.' : 'تحتاج صلاحية إدارة المدراء للتعديل.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canManageAdmins ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
              لا تملك صلاحية <strong>إدارة المدراء</strong>. يمكنك طلبها من حساب المؤسّس (المالك).
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
              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label className="mb-2 block">قالب صلاحيات سريع للأدمن الجديد</Label>
                  <Select
                    value={newAdminTemplateKey}
                    onValueChange={(v) => {
                      setNewAdminTemplateKey(v);
                      const tpl = findTemplate(v);
                      if (tpl) setNewAdminPermissions(tpl.permissions);
                    }}
                  >
                    <SelectTrigger dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_ROLE_TEMPLATES.map((tpl) => (
                        <SelectItem key={tpl.key} value={tpl.key}>
                          {tpl.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const tpl = findTemplate(newAdminTemplateKey);
                      if (tpl) setNewAdminPermissions(tpl.permissions);
                    }}
                  >
                    إعادة تطبيق القالب
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-3 space-y-4">
                <p className="font-medium text-sm">صلاحيات الأدمن الجديد</p>
                {ADMIN_PERMISSION_UI_SECTIONS.map((section) => (
                  <div key={section.id} className="rounded-md border border-border/70 bg-muted/10 p-3 space-y-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{section.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{section.subtitle}</p>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {section.keys.map((key) => (
                        <div key={key} className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2">
                          <div className="min-w-0 space-y-1 text-right">
                            <span className="text-sm block">{ADMIN_PERMISSION_LABELS[key]}</span>
                            <Badge variant="secondary" className="text-[10px] font-normal">
                              {adminPermissionShortRoleLabel(key)}
                            </Badge>
                          </div>
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
                ))}
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
                            <Select onValueChange={(v) => void applyTemplateToExistingAdmin(row, v)}>
                              <SelectTrigger className="w-[190px]" dir="rtl">
                                <SelectValue placeholder="تطبيق قالب" />
                              </SelectTrigger>
                              <SelectContent>
                                {ADMIN_ROLE_TEMPLATES.map((tpl) => (
                                  <SelectItem key={tpl.key} value={tpl.key}>
                                    {tpl.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                        <div className="space-y-4">
                          {ADMIN_PERMISSION_UI_SECTIONS.map((section) => (
                            <div key={`${row.id}-${section.id}`} className="rounded-md border border-border/70 bg-muted/10 p-3 space-y-2">
                              <p className="text-xs font-semibold text-foreground">{section.title}</p>
                              <div className="grid gap-2 md:grid-cols-2">
                                {section.keys.map((key) => (
                                  <div key={key} className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-2 py-1.5">
                                    <div className="min-w-0 space-y-0.5 text-right">
                                      <span className="text-xs block leading-snug">{ADMIN_PERMISSION_LABELS[key]}</span>
                                      <Badge variant="outline" className="text-[9px] font-normal h-5">
                                        {adminPermissionShortRoleLabel(key)}
                                      </Badge>
                                    </div>
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {canViewPartnerMarketing || canManagePartnerMarketing ? (
        <>
          <PartnerPromoVideoAdminPanel
            canView={canViewPartnerMarketing || canManagePartnerMarketing}
            canManage={canManagePartnerMarketing}
          />
          <PartnerTutorialVideosAdminPanel
            canView={canViewPartnerMarketing || canManagePartnerMarketing}
            canManage={canManagePartnerMarketing}
          />
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>الإعدادات العامة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>اسم المنصة</Label>
            <Input defaultValue="حلاق ماب" disabled={!canSavePlatformVat} />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" defaultValue="admin@halaqmap.com" disabled={!canSavePlatformVat} />
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input type="tel" defaultValue="+966559602685" dir="ltr" disabled={!canSavePlatformVat} />
          </div>
          <Button type="button" className="w-full" disabled={!canSavePlatformVat}>
            حفظ التغييرات
          </Button>
        </CardContent>
      </Card>

      {canViewZatcaFinancialOffice ? (
        <Card
          id="zatca-financial-office"
          className="scroll-mt-24 border-cyan-500/30 bg-gradient-to-br from-cyan-500/[0.04] via-background to-amber-500/[0.03] shadow-sm"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              المكتب المالي — زميل خازن (ZATCA) 🛡️
            </CardTitle>
            <CardDescription>
              رادار الإيرادات، تقارير استباقية باحتسابات افتراضية، مسح مصادر ZATCA، وتجهيز تفعيل ض.ق.م عند
              بلوغ 375,000 ر.س.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ZatcaTaxActivationAlert
              canRunRadar={canViewZatcaFinancialOffice}
              canActivate={canSavePlatformVat}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-primary/25">
        <CardHeader>
          <CardTitle>ضريبة القيمة المضافة (عرض الدفع)</CardTitle>
          <CardDescription>
            في وضع العمل الحر أو عدم الخضوع للضريبة تُبقى المعطّلة؛ تُعرض الأسعار كقيمة حزمة برمجية فقط (مناسب
            لتقديم بوابات مثل ميسر). عند التوسع بسجل تجاري ورقم ضريبي فعّل الاحتسب هنا وحدّث النسبة عند تغيير
            الأنظمة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">تفعيل احتساب الضريبة في الواجهة</p>
              <p className="text-sm text-muted-foreground mt-1">
                عند التفعيل تظهر أسطر الضريبة والإجمالي في التسجيل وصفحة الدفع وسياسة الحزم البرمجية الرقمية.
              </p>
            </div>
            <Switch checked={vatEnabled} onCheckedChange={setVatEnabled} disabled={!canSavePlatformVat} />
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
              disabled={!canSavePlatformVat || !vatEnabled}
            />
            <p className="text-xs text-muted-foreground">مثال شائع: 15 — يُقرب المبلغ إلى أقرب ريال صحيح.</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p className="font-medium mb-2">معاينة على 100 ر.س (قيمة حزمة برمجية)</p>
            <p className="text-muted-foreground">
              {!vatEnabled || preview.vat === 0 ? (
                <>الإجمالي المعروض: <strong>{preview.total} ر.س</strong> (بدون ضريبة)</>
              ) : (
                <>
                  الرسوم: {preview.subtotal} ر.س + الضريبة ({rateForPreview}%): {preview.vat} ر.س ={' '}
                  <strong>{preview.total} ر.س</strong>
                </>
              )}
            </p>
          </div>
          <Button type="button" className="w-full" onClick={handleSaveVat} disabled={!canSavePlatformVat}>
            حفظ إعدادات الضريبة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
