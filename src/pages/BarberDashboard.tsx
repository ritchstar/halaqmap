import { useState, useEffect, useMemo, useCallback, useRef, type ComponentType } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  Star,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Send,
  Mic,
  Paperclip,
  QrCode,
  Copy,
  UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import QRCode from 'react-qr-code';
import { ROUTE_PATHS, Post, ChatMessage, Review, SubscriptionTier } from '@/lib';
import { IMAGES } from '@/assets/images';
import {
  createInitialWorkingWeekForm,
  type WorkingWeekFormRow,
} from '@/lib/saudiWorkingWeek';
import { buildRatingInviteUrl } from '@/lib/ratingInvite';
import { getAllMergedReviewsForBarberManage, updateStoredQrReview } from '@/lib/qrReviewsStorage';
import {
  readDiamondSchedulingPublicLocal,
  setDiamondSchedulingPublicLocal,
} from '@/lib/diamondSchedulingVisibility';
import {
  RATING_QR_BARBER_GUIDE,
  RATING_QR_CARD_DESCRIPTION,
  RATING_QR_DASHBOARD_LEDE,
  RATING_QR_FEATURE_SHORT,
  RATING_QR_FEATURE_TITLE,
} from '@/config/ratingQrInvite';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { refreshBarberPortalSessionRemote, type BarberPortalSession } from '@/lib/barberPortalLoginRemote';
import { formatBarberMemberNumber } from '@/lib/barberMemberNumber';
import {
  readSchedule,
  writeSchedule,
  readPosts,
  writePosts,
  readThreads,
  writeThreads,
  readBannerState,
  writeBannerState,
  type BarberDashboardScheduleItem,
  type BarberChatThread,
  type BarberPlatformBannerState,
} from '@/lib/barberDashboardLocalState';

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function subscriptionTierLabelAr(tier: SubscriptionTier): string {
  if (tier === SubscriptionTier.DIAMOND) return 'ماسي';
  if (tier === SubscriptionTier.GOLD) return 'ذهبي';
  return 'برونزي';
}

function buildTierAccountDeletionMailto(session: BarberPortalSession): string {
  const subject = encodeURIComponent(`طلب حذف حساب شريك — ${subscriptionTierLabelAr(session.subscription)}`);
  const mn = formatBarberMemberNumber(session.memberNumber);
  const bodyLines = [
    'السلام عليكم ورحمة الله وبركاته،',
    '',
    'أطلب حذف حسابي كشريك في منصة حلاق ماب من لوحة التحكم:',
    '',
    `— اسم الصالون: ${session.name}`,
    `— البريد المعتمد: ${session.email}`,
    `— رقم الهاتف: ${session.phone || '—'}`,
    `— رقم العضوية: ${mn || '—'}`,
    `— معرف الحساب: ${session.id}`,
    `— الباقة الحالية: ${subscriptionTierLabelAr(session.subscription)}`,
    '',
    'أفهم أن الحذف يُعالَج بعد مراجعة الإدارة ولن يكون فورياً من هذه الرسالة.',
    '',
    'وتفضلوا بقبول فائق الاحترام،',
  ];
  return `mailto:admin@halaqmap.com?subject=${subject}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
}

export default function BarberDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [barberData, setBarberData] = useState<BarberPortalSession | null>(null);
  const [scheduleItems, setScheduleItems] = useState<BarberDashboardScheduleItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chatThreads, setChatThreads] = useState<BarberChatThread[]>([]);
  const [bannerState, setBannerState] = useState<BarberPlatformBannerState>({
    bannerImageUrls: [],
    showDiscountBadge: false,
    discountPercent: null,
  });

  useEffect(() => {
    const auth = localStorage.getItem('barberAuth');
    if (!auth) {
      navigate(ROUTE_PATHS.BARBER_LOGIN);
      return;
    }
    try {
      const parsed = JSON.parse(auth) as Partial<BarberPortalSession> & { loggedIn?: boolean };
      if (!parsed?.id || !parsed?.email || !parsed?.name) {
        localStorage.removeItem('barberAuth');
        navigate(ROUTE_PATHS.BARBER_LOGIN);
        return;
      }
      const tier = Object.values(SubscriptionTier).includes(parsed.subscription as SubscriptionTier)
        ? (parsed.subscription as SubscriptionTier)
        : SubscriptionTier.BRONZE;
      const mn = (parsed as { memberNumber?: number | null }).memberNumber;
      const memberNumber =
        mn != null && Number.isFinite(Number(mn)) ? Math.floor(Number(mn)) : null;
      setBarberData({
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone ?? '',
        subscription: tier,
        ratingInviteToken: parsed.ratingInviteToken ?? '',
        memberNumber,
      });
    } catch {
      localStorage.removeItem('barberAuth');
      navigate(ROUTE_PATHS.BARBER_LOGIN);
    }
  }, [navigate]);

  const portalIdRef = useRef<string | undefined>(undefined);
  const portalEmailRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    portalIdRef.current = barberData?.id;
    portalEmailRef.current = barberData?.email;
  }, [barberData?.id, barberData?.email]);

  /** مزامنة اسم الصالون والباقة من Supabase (بعد تعديل الإدارة أو فتح التبويب من جديد — مهم للجوال حيث تبقى الجلسة في localStorage). */
  const applyPortalSession = useCallback((next: BarberPortalSession) => {
    setBarberData((prev) => {
      if (!prev) return prev;
      if (
        prev.name === next.name &&
        prev.phone === next.phone &&
        prev.subscription === next.subscription &&
        prev.ratingInviteToken === next.ratingInviteToken &&
        prev.memberNumber === next.memberNumber
      ) {
        return prev;
      }
      return next;
    });
    try {
      localStorage.setItem('barberAuth', JSON.stringify({ ...next, loggedIn: true }));
    } catch {
      /* ignore */
    }
  }, []);

  const syncPortalSessionFromServer = useCallback(async () => {
    const id = portalIdRef.current?.trim();
    const email = portalEmailRef.current?.trim();
    if (!id || !email) return;
    const r = await refreshBarberPortalSessionRemote({ barberId: id, email });
    if (!r.ok) return;
    applyPortalSession(r.session);
  }, [applyPortalSession]);

  useEffect(() => {
    if (!barberData?.id || !barberData?.email) return;
    let cancelled = false;
    void syncPortalSessionFromServer().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [barberData?.id, barberData?.email, syncPortalSessionFromServer]);

  useEffect(() => {
    if (!barberData?.id || !barberData?.email) return;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const scheduleSync = () => {
      if (document.visibilityState !== 'visible') return;
      clearTimeout(debounce);
      debounce = setTimeout(() => void syncPortalSessionFromServer(), 350);
    };
    document.addEventListener('visibilitychange', scheduleSync);
    window.addEventListener('focus', scheduleSync);
    window.addEventListener('pageshow', scheduleSync);
    return () => {
      clearTimeout(debounce);
      document.removeEventListener('visibilitychange', scheduleSync);
      window.removeEventListener('focus', scheduleSync);
      window.removeEventListener('pageshow', scheduleSync);
    };
  }, [barberData?.id, barberData?.email, syncPortalSessionFromServer]);

  const barberId = barberData?.id;

  useEffect(() => {
    if (!barberId) return;
    setScheduleItems(readSchedule(barberId));
    setPosts(readPosts(barberId));
    setChatThreads(readThreads(barberId));
    setBannerState(readBannerState(barberId));
  }, [barberId]);

  const persistSchedule = useCallback(
    (next: BarberDashboardScheduleItem[]) => {
      if (!barberId) return;
      writeSchedule(barberId, next);
      setScheduleItems(next);
    },
    [barberId],
  );

  const persistPosts = useCallback(
    (next: Post[]) => {
      if (!barberId) return;
      writePosts(barberId, next);
      setPosts(next);
    },
    [barberId],
  );

  const persistThreads = useCallback(
    (next: BarberChatThread[]) => {
      if (!barberId) return;
      writeThreads(barberId, next);
      setChatThreads(next);
    },
    [barberId],
  );

  const persistBanner = useCallback(
    (next: BarberPlatformBannerState) => {
      if (!barberId) return;
      writeBannerState(barberId, next);
      setBannerState(next);
    },
    [barberId],
  );

  const handleLogout = () => {
    localStorage.removeItem('barberAuth');
    navigate(ROUTE_PATHS.HOME);
  };

  const statsZeros = useMemo(
    () => ({
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      averageRating: 0,
      totalReviews: 0,
      totalViews: 0,
      totalChats: 0,
    }),
    [],
  );

  const unreadCustomerMessages = useMemo(
    () =>
      chatThreads.reduce(
        (acc, t) => acc + t.messages.filter((m) => m.sender === 'customer' && !m.read).length,
        0,
      ),
    [chatThreads],
  );

  const upcomingPreview = useMemo(() => {
    const sorted = [...scheduleItems].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return sorted.slice(0, 5);
  }, [scheduleItems]);

  if (!barberData) {
    return null;
  }

  return (
    <>
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-[4.25rem] items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <img
                src={IMAGES.HALAQMAP_LOGO_20260409_073322_83}
                alt="حلاق ماب"
                className="h-10 w-auto shrink-0 object-contain"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  لوحة تحكم حلاق ماب
                </p>
                <h1 className="truncate text-lg font-bold sm:text-xl">{barberData.name}</h1>
                {formatBarberMemberNumber(barberData.memberNumber) ? (
                  <p className="truncate text-xs text-muted-foreground" dir="ltr">
                    رقم العضوية: {formatBarberMemberNumber(barberData.memberNumber)}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {(barberData.subscription === SubscriptionTier.GOLD ||
                barberData.subscription === SubscriptionTier.DIAMOND) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteAccountDialogOpen(true)}
                  title="طلب حذف الحساب"
                  aria-label="طلب حذف الحساب"
                >
                  <UserX className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout} className="shrink-0 gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1.5 bg-muted/40 p-1.5 sm:gap-2">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">المواعيد</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">الرسائل</span>
              {unreadCustomerMessages > 0 && (
                <Badge variant="destructive" className="flex h-5 w-5 items-center justify-center p-0 text-xs">
                  {unreadCustomerMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">البوستات</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
            <TabsTrigger value="qr-ratings" className="gap-2">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">QR والتقييمات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-6 text-2xl font-bold">الإحصائيات</h2>
              <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
                تبدأ العدادات من الصفر. عند ربط التحليلات والحجوزات الحقيقية على المنصة ستنعكس هنا تلقائياً. لا
                تُعرض إيرادات المحل — المنصة لا تتدخل في مالية صالونك.
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="إجمالي المواعيد" value={statsZeros.totalAppointments} icon={Calendar} color="blue" />
                <StatsCard
                  title="مواعيد مكتملة"
                  value={statsZeros.completedAppointments}
                  icon={CheckCircle2}
                  color="green"
                />
                <StatsCard
                  title="التقييم"
                  value={statsZeros.averageRating}
                  subtitle={`${statsZeros.totalReviews} تقييم`}
                  icon={Star}
                  color="yellow"
                />
                <StatsCard title="المشاهدات" value={statsZeros.totalViews} icon={Eye} color="purple" />
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>أحدث الجدول</CardTitle>
                  <CardDescription>حجوزات العملاء أو الأوقات المتاحة التي أضفتها من تبويب المواعيد</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingPreview.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لا توجد عناصر بعد. أضف «أوقات متاحة للحجز» من تبويب المواعيد.</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingPreview.map((row) => (
                        <ScheduleRow key={row.id} item={row} compact />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <AppointmentsSection
              barberId={barberData.id}
              items={scheduleItems}
              onChange={persistSchedule}
            />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <MessagesSection
              barberId={barberData.id}
              threads={chatThreads}
              onThreadsChange={persistThreads}
              promoHint={
                bannerState.showDiscountBadge && bannerState.discountPercent != null
                  ? `عرض المنصة: خصم ${bannerState.discountPercent}% (يُدار من الإعدادات → البنر والعروض)`
                  : null
              }
            />
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <PostsSection posts={posts} barberId={barberData.id} onChange={persistPosts} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsSection
              barberId={barberData.id}
              barberData={barberData}
              subscriptionTier={barberData.subscription}
              bannerState={bannerState}
              onBannerChange={persistBanner}
            />
          </TabsContent>

          <TabsContent value="qr-ratings" className="space-y-6">
            <QrRatingsSection barberId={barberData.id} ratingInviteToken={barberData.ratingInviteToken} />
          </TabsContent>
        </Tabs>
      </div>
    </div>

    <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>طلب حذف الحساب</DialogTitle>
          <DialogDescription className="text-right leading-relaxed">
            سيتم تجهيز رسالة بريد إلى الإدارة تتضمن معرف حسابك وبيانات التعريف. أرسلها من بريدك المعتمد لدينا
            لتسريع التحقق. الحذف النهائي يتم بعد مراجعة الإدارة.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start sm:space-x-reverse">
          <Button variant="outline" type="button" onClick={() => setDeleteAccountDialogOpen(false)}>
            إلغاء
          </Button>
          <Button variant="destructive" type="button" asChild>
            <a href={buildTierAccountDeletionMailto(barberData)} onClick={() => setDeleteAccountDialogOpen(false)}>
              متابعة عبر البريد
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function QrRatingsSection({
  barberId,
  ratingInviteToken,
}: {
  barberId: string;
  ratingInviteToken: string;
}) {
  const ratingUrl = useMemo(
    () => (ratingInviteToken ? buildRatingInviteUrl(barberId, ratingInviteToken) : ''),
    [barberId, ratingInviteToken],
  );

  const [reviews, setReviews] = useState<Review[]>(() => getAllMergedReviewsForBarberManage(barberId));

  const refresh = useCallback(() => {
    setReviews(getAllMergedReviewsForBarberManage(barberId));
  }, [barberId]);

  useEffect(() => {
    refresh();
    window.addEventListener('halaqmap-qr-reviews', refresh);
    return () => window.removeEventListener('halaqmap-qr-reviews', refresh);
  }, [refresh]);

  const copyLink = () => {
    if (!ratingUrl) return;
    void navigator.clipboard.writeText(ratingUrl).then(() => toast.success('تم نسخ رابط التقييم'));
  };

  const isStoredQr = (r: Review) => r.id.startsWith('qr-');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold">{RATING_QR_FEATURE_TITLE}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{RATING_QR_DASHBOARD_LEDE}</p>
        <p className="mt-2 max-w-2xl text-xs text-muted-foreground/90">{RATING_QR_FEATURE_SHORT}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            رمزك ورابط التقييم
          </CardTitle>
          <CardDescription>{RATING_QR_CARD_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ratingUrl ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="rounded-2xl bg-white p-3 shadow-inner ring-1 ring-border sm:p-5">
                <div className="hidden sm:block">
                  <QRCode value={ratingUrl} size={280} />
                </div>
                <div className="sm:hidden">
                  <QRCode value={ratingUrl} size={220} />
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">حجم أكبر على الشاشات العريضة — مناسب لعرض آيباد</p>
              </div>
              <div className="max-w-xl flex-1 space-y-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">كيف تستخدمه؟</p>
                <ul className="list-disc space-y-2 pr-5">
                  {RATING_QR_BARBER_GUIDE.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="button" variant="outline" className="gap-2" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                    نسخ الرابط
                  </Button>
                </div>
                <p className="break-all text-xs opacity-80" dir="ltr">
                  {ratingUrl}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>تعذر بناء رابط التقييم: لا يوجد رمز دعوة مرتبط بحسابك في قاعدة البيانات.</p>
              <p className="text-xs">
                جرّب تسجيل الخروج ثم الدخول من جديد بعد التأكد من أن الإدارة فعّلت حسابك. إن استمر الأمر، راجع
                الإدارة لضبط حقل التقييم للحلاق في Supabase.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إدارة ظهور التقييمات</CardTitle>
          <CardDescription>
            التقييمات القادمة عبر QR تظهر هنا. يمكنك إخفاء تقييم عن الملف العام أو إبرازه في الأعلى. التقييمات
            التجريبية الثابتة في العرض التجريبي لا تُعدّل من هنا.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد.</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{review.customerName}</span>
                    {review.viaQrInvite && (
                      <Badge variant="secondary" className="text-xs">
                        QR
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex gap-0.5" dir="ltr">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= review.rating ? 'fill-amber-400 text-amber-500' : 'text-muted/40'}`}
                      />
                    ))}
                  </div>
                  {review.comment ? <p className="line-clamp-2 text-sm text-muted-foreground">{review.comment}</p> : null}
                </div>
                {isStoredQr(review) ? (
                  <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`pub-${review.id}`} className="cursor-pointer whitespace-nowrap text-sm">
                        إظهار للجمهور
                      </Label>
                      <Switch
                        id={`pub-${review.id}`}
                        checked={review.isPublished !== false}
                        onCheckedChange={(checked) => {
                          updateStoredQrReview(review.id, { isPublished: checked });
                          refresh();
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`hi-${review.id}`} className="cursor-pointer whitespace-nowrap text-sm">
                        إبراز في الأعلى
                      </Label>
                      <Switch
                        id={`hi-${review.id}`}
                        checked={!!review.isHighlighted}
                        onCheckedChange={(checked) => {
                          updateStoredQrReview(review.id, { isHighlighted: checked });
                          refresh();
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="w-fit text-xs">
                    تجريبي ثابت
                  </Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
  icon: ComponentType<{ className?: string }>;
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
            <p className="mb-1 text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg border bg-gradient-to-br ${colorClasses[color]}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScheduleRow({ item, compact }: { item: BarberDashboardScheduleItem; compact?: boolean }) {
  const statusConfig = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: Clock },
    confirmed: { label: 'مؤكد', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: CheckCircle2 },
    completed: { label: 'مكتمل', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: CheckCircle2 },
    cancelled: { label: 'ملغي', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: XCircle },
  };
  const config = statusConfig[item.status];
  const StatusIcon = config.icon;
  const kindLabel = item.kind === 'availability_slot' ? 'أوقات متاحة' : 'حجز عميل';

  return (
    <div
      className={`flex flex-col gap-3 border border-border rounded-lg transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {kindLabel}
            </Badge>
            {item.kind === 'availability_slot' ? (
              <Badge variant={item.visibleOnProfile ? 'default' : 'secondary'} className="text-[10px]">
                {item.visibleOnProfile ? 'ظاهر للعملاء' : 'مخفي'}
              </Badge>
            ) : null}
          </div>
          <p className="font-semibold">{item.customerName || '—'}</p>
          <p className="text-sm text-muted-foreground">{item.service}</p>
          {item.customerPhone ? (
            <p className="text-xs text-muted-foreground" dir="ltr">
              {item.customerPhone}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {item.date} · {item.time}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-left sm:pr-2">
        <Badge className={config.color}>
          <StatusIcon className="ml-1 h-3 w-3" />
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

function AppointmentsSection({
  barberId,
  items,
  onChange,
}: {
  barberId: string;
  items: BarberDashboardScheduleItem[];
  onChange: (next: BarberDashboardScheduleItem[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formService, setFormService] = useState('نافذة حجز متاحة');
  const [formVisible, setFormVisible] = useState(true);

  const addSlot = () => {
    if (!formDate.trim() || !formTime.trim()) {
      toast.error('أدخل التاريخ والوقت');
      return;
    }
    const row: BarberDashboardScheduleItem = {
      id: newId(),
      barberId,
      kind: 'availability_slot',
      date: formDate,
      time: formTime,
      customerName: 'أوقات متاحة للحجز',
      customerPhone: '',
      service: formService.trim() || 'نافذة حجز متاحة',
      status: 'confirmed',
      visibleOnProfile: formVisible,
    };
    onChange([...items, row]);
    toast.success('تمت إضافة وقت متاح للحجز');
    setOpen(false);
    setFormDate('');
    setFormTime('');
    setFormService('نافذة حجز متاحة');
    setFormVisible(true);
  };

  const toggleVisible = (id: string, checked: boolean) => {
    onChange(items.map((r) => (r.id === id ? { ...r, visibleOnProfile: checked } : r)));
  };

  const remove = (id: string) => {
    onChange(items.filter((r) => r.id !== id));
    toast.message('تم الحذف');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">المواعيد والحجز</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            أنشئ «أوقات متاحة للحجز» ليظهر للعميل أن لديك نافذة زمنية مفتوحة؛ حجوزات العملاء الفعلية ستصل لاحقاً من
            التطبيق. استخدم التبديل لإظهار نافذة الحجز أو إخفائها عن بطاقتك في هذا الجهاز (معاينة محلية).
          </p>
        </div>
        <Button type="button" className="gap-2 self-start" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          إضافة أوقات متاحة
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد مواعيد أو أوقات بعد.</p>
          ) : (
            items.map((row) => (
              <div key={row.id} className="space-y-3 rounded-lg border border-border p-4">
                <ScheduleRow item={row} />
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                  {row.kind === 'availability_slot' ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`vis-${row.id}`}
                        checked={row.visibleOnProfile}
                        onCheckedChange={(c) => toggleVisible(row.id, c)}
                      />
                      <Label htmlFor={`vis-${row.id}`} className="cursor-pointer text-sm">
                        إظهار للعملاء (معاينة هذا الجهاز)
                      </Label>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">حجز عميل — التعديل من التطبيق لاحقاً</span>
                  )}
                  <Button type="button" size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => remove(row.id)}>
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء أوقات متاحة للحجز</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>الوقت أو النطاق</Label>
              <Input placeholder="مثال: 10:00 أو 10:00–12:00" value={formTime} onChange={(e) => setFormTime(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>وصف قصير</Label>
              <Input value={formService} onChange={(e) => setFormService(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="slot-vis" checked={formVisible} onCheckedChange={setFormVisible} />
              <Label htmlFor="slot-vis" className="cursor-pointer text-sm">
                إظهار للعملاء فور الإضافة
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" onClick={addSlot}>
              حفظ
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function MessagesSection({
  barberId,
  threads,
  onThreadsChange,
  promoHint,
}: {
  barberId: string;
  threads: BarberChatThread[];
  onThreadsChange: (next: BarberChatThread[]) => void;
  promoHint: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (threads.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !threads.some((t) => t.customerId === selectedId)) {
      setSelectedId(threads[0].customerId);
    }
  }, [threads, selectedId]);

  const active = threads.find((t) => t.customerId === selectedId) ?? null;

  const customerStarted = useMemo(
    () => !!active?.messages.some((m) => m.sender === 'customer'),
    [active],
  );

  const selectThread = (id: string) => {
    setSelectedId(id);
    const next = threads.map((t) => {
      if (t.customerId !== id) return t;
      return {
        ...t,
        messages: t.messages.map((m) => (m.sender === 'customer' ? { ...m, read: true } : m)),
      };
    });
    onThreadsChange(next);
  };

  const send = () => {
    if (!active || !draft.trim()) return;
    if (!customerStarted) {
      toast.error('لا يمكن الإرسال قبل أن يبدأ العميل المحادثة من تطبيق حلاق ماب.');
      return;
    }
    const msg: ChatMessage = {
      id: newId(),
      barberId,
      customerId: active.customerId,
      sender: 'barber',
      message: draft.trim(),
      messageType: 'text',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: true,
    };
    const next = threads.map((t) =>
      t.customerId === active.customerId ? { ...t, messages: [...t.messages, msg] } : t,
    );
    onThreadsChange(next);
    setDraft('');
    toast.success('تم إرسال الرسالة (محلياً — المزامنة مع السيرفر لاحقاً)');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h2 className="mb-2 text-2xl font-bold">المحادثات</h2>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        يبدأ الحوار من العميل عبر حلاق ماب؛ تصلك رسالته كتنبيه، وبعدها يمكنك الرد من هنا. حتى يُفعّل الربط الكامل
        بالخادم، تُعرض المحادثات التجريبية من هذا الجهاز فقط.
      </p>
      {promoHint ? (
        <p className="mb-4 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">{promoHint}</p>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-6">
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لا توجد محادثات بعد. عندما يرسل عميل أول رسالة من التطبيق ستظهر هنا — المنصة تُشعِرك ثم يمكنك
              الرد.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">اختر المحادثة</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedId ?? ''}
                  onChange={(e) => selectThread(e.target.value)}
                >
                  {threads.map((t) => (
                    <option key={t.customerId} value={t.customerId}>
                      {t.customerLabel}
                    </option>
                  ))}
                </select>
              </div>
              <div className="max-h-80 space-y-3 overflow-y-auto rounded-md border border-border/60 p-3">
                {active?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'barber' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 text-sm ${
                        message.sender === 'barber' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className="mt-1 text-xs opacity-70">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              {!customerStarted ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  بانتظار أول رسالة من العميل — خانة الإرسال معطّلة حتى يبدأ هو الحوار.
                </p>
              ) : null}
              <div className="flex gap-2">
                <Input
                  placeholder={customerStarted ? 'اكتب ردك...' : 'بانتظار رسالة العميل...'}
                  value={draft}
                  disabled={!customerStarted}
                  onChange={(e) => setDraft(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" size="icon" variant="outline" disabled title="قريباً">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="outline" disabled title="قريباً">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" onClick={send} disabled={!customerStarted}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PostsSection({
  posts,
  barberId,
  onChange,
}: {
  posts: Post[];
  barberId: string;
  onChange: (next: Post[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<Post['type']>('gallery');
  const [discount, setDiscount] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setContent('');
    setType('offer');
    setDiscount('');
    setImageUrl(IMAGES.BARBER_SHOP_1);
    setOpen(true);
  };

  const openEdit = (p: Post) => {
    setEditing(p);
    setTitle(p.title);
    setContent(p.content);
    setType(p.type);
    setDiscount(p.discount != null ? String(p.discount) : '');
    setImageUrl(p.images[0] ?? IMAGES.BARBER_SHOP_1);
    setOpen(true);
  };

  const savePost = () => {
    if (!title.trim()) {
      toast.error('أدخل عنواناً');
      return;
    }
    let disc: number | undefined;
    if (discount.trim()) {
      const n = Number(discount);
      if (Number.isNaN(n) || n < 0 || n > 100) {
        toast.error('نسبة الخصم غير صالحة');
        return;
      }
      disc = n;
    }
    const img = imageUrl.trim() || IMAGES.BARBER_SHOP_1;
    if (editing) {
      onChange(
        posts.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                title: title.trim(),
                content: content.trim(),
                type,
                images: [img],
                discount: type === 'offer' ? disc : undefined,
                validUntil: p.validUntil,
              }
            : p,
        ),
      );
      toast.success('تم تحديث البوست');
    } else {
      const post: Post = {
        id: newId(),
        barberId,
        title: title.trim(),
        content: content.trim(),
        images: [img],
        type,
        discount: type === 'offer' ? disc : undefined,
        validUntil: undefined,
        createdAt: new Date().toISOString().slice(0, 10),
        likes: 0,
        views: 0,
      };
      onChange([post, ...posts]);
      toast.success('تم إنشاء البوست');
    }
    setOpen(false);
  };

  const del = (id: string) => {
    onChange(posts.filter((p) => p.id !== id));
    toast.message('تم حذف البوست');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">البوستات والعروض</h2>
        <Button type="button" className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" />
          بوست جديد
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">لا توجد بوستات بعد. اضغط «بوست جديد».</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                  <img src={post.images[0]} alt={post.title} className="h-full w-full object-cover" />
                </div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={post.type === 'offer' ? 'default' : 'secondary'}>
                    {post.type === 'offer' ? 'عرض' : post.type === 'gallery' ? 'معرض' : 'إعلان'}
                  </Badge>
                  {post.discount != null ? <Badge variant="destructive">خصم {post.discount}%</Badge> : null}
                </div>
                <h3 className="mb-2 text-lg font-bold">{post.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{post.content}</p>
                <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    <span>مشاهدات {post.views}</span>
                    <span>إعجاب {post.likes}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => openEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => del(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل البوست' : 'بوست جديد'}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-3 overflow-y-auto py-2">
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>المحتوى</Label>
              <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as Post['type'])}
              >
                <option value="offer">عرض / خصم</option>
                <option value="gallery">معرض صور</option>
                <option value="announcement">إعلان</option>
              </select>
            </div>
            {type === 'offer' ? (
              <div className="space-y-2">
                <Label>نسبة الخصم %</Label>
                <Input
                  inputMode="numeric"
                  placeholder="مثال: 15"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  dir="ltr"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>رابط صورة الغلاف</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} dir="ltr" className="text-left" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" onClick={savePost}>
              {editing ? 'حفظ التعديل' : 'نشر'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function SettingsSection({
  barberId,
  barberData,
  subscriptionTier,
  bannerState,
  onBannerChange,
}: {
  barberId: string;
  barberData: BarberPortalSession;
  subscriptionTier: SubscriptionTier;
  bannerState: BarberPlatformBannerState;
  onBannerChange: (s: BarberPlatformBannerState) => void;
}) {
  const storageKey = `halaqmap_barber_dashboard_hours_${barberId}`;

  const [workingRows, setWorkingRows] = useState<WorkingWeekFormRow[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as WorkingWeekFormRow[];
    } catch {
      /* ignore */
    }
    return createInitialWorkingWeekForm();
  });

  const patchRow = (index: number, patch: Partial<WorkingWeekFormRow>) => {
    setWorkingRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const saveWorkingHours = () => {
    localStorage.setItem(storageKey, JSON.stringify(workingRows));
    toast.success('تم حفظ جدول أوقات العمل في هذا الجهاز');
  };

  const showWeeklyEditor =
    subscriptionTier === SubscriptionTier.GOLD || subscriptionTier === SubscriptionTier.DIAMOND;

  const [diamondSchedulePublic, setDiamondSchedulePublic] = useState(() => {
    const fromLs = readDiamondSchedulingPublicLocal(barberId);
    return fromLs !== null ? fromLs : true;
  });

  const [bannerUrlInput, setBannerUrlInput] = useState('');

  const addBannerUrl = () => {
    const u = bannerUrlInput.trim();
    if (!u) return;
    onBannerChange({ ...bannerState, bannerImageUrls: [...bannerState.bannerImageUrls, u] });
    setBannerUrlInput('');
    toast.success('أُضيف رابط البنر');
  };

  const removeBannerUrl = (idx: number) => {
    const next = [...bannerState.bannerImageUrls];
    next.splice(idx, 1);
    onBannerChange({ ...bannerState, bannerImageUrls: next });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h2 className="mb-6 text-2xl font-bold">الإعدادات</h2>

      <Card className="mb-6 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">البنر والعروض على حلاق ماب</CardTitle>
          <CardDescription>
            يظهر اسم صالونك في أعلى لوحة التحكم من قاعدة البيانات كهوية المتحكم فيما يُعرض للجمهور. روابط البنرات
            هنا تُحفظ على هذا الجهاز كمعاينة حتى يكتمل الربط بالتخزين السحابي للصور.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">إظهار شارة الخصم مع العروض</p>
              <p className="text-xs text-muted-foreground">يُذكَر في تبويب الرسائل كتذكير للمحتوى الظاهر للعميل.</p>
            </div>
            <Switch
              checked={bannerState.showDiscountBadge}
              onCheckedChange={(c) => onBannerChange({ ...bannerState, showDiscountBadge: c })}
            />
          </div>
          <div className="space-y-2">
            <Label>نسبة الخصم المعروضة %</Label>
            <Input
              inputMode="numeric"
              className="max-w-[12rem]"
              dir="ltr"
              placeholder="مثال: 10"
              value={bannerState.discountPercent === null ? '' : String(bannerState.discountPercent)}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (v === '') {
                  onBannerChange({ ...bannerState, discountPercent: null });
                  return;
                }
                const n = Number(v);
                if (Number.isNaN(n)) return;
                onBannerChange({
                  ...bannerState,
                  discountPercent: Math.min(100, Math.max(0, n)),
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>إضافة رابط صورة بنر</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={bannerUrlInput} onChange={(e) => setBannerUrlInput(e.target.value)} dir="ltr" className="flex-1 text-left" />
              <Button type="button" variant="secondary" onClick={addBannerUrl}>
                إضافة
              </Button>
            </div>
          </div>
          {bannerState.bannerImageUrls.length === 0 ? (
            <p className="text-xs text-muted-foreground">لا توجد بنرات بعد.</p>
          ) : (
            <ul className="space-y-2">
              {bannerState.bannerImageUrls.map((url, i) => (
                <li key={`${url}-${i}`} className="flex flex-col gap-2 rounded-md border border-border p-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="break-all text-xs" dir="ltr">
                    {url}
                  </span>
                  <Button type="button" size="sm" variant="outline" className="shrink-0 text-destructive" onClick={() => removeBannerUrl(i)}>
                    حذف
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {showWeeklyEditor && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              جدول أوقات العمل الأسبوعي
            </CardTitle>
            <CardDescription>
              حدّد ساعات العمل لكل يوم. تُحفظ في هذا المتصفح كمعاينة إلى أن يُربط التعديل بقاعدة البيانات من
              الإدارة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {workingRows.map((row, index) => (
                <div
                  key={row.day}
                  className="flex flex-col gap-2 bg-muted/20 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <div className="flex min-w-[7rem] items-center gap-3">
                    <span className="text-sm font-semibold">{row.day}</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`dash-closed-${index}`}
                        checked={row.closed}
                        onCheckedChange={(checked) => patchRow(index, { closed: checked })}
                      />
                      <Label htmlFor={`dash-closed-${index}`} className="cursor-pointer text-xs text-muted-foreground">
                        مغلق
                      </Label>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Input
                      type="time"
                      value={row.open}
                      disabled={row.closed}
                      onChange={(e) => patchRow(index, { open: e.target.value })}
                      className="h-9 w-[7.5rem] text-sm"
                    />
                    <span className="hidden text-xs text-muted-foreground sm:inline">—</span>
                    <Input
                      type="time"
                      value={row.close}
                      disabled={row.closed}
                      onChange={(e) => patchRow(index, { close: e.target.value })}
                      className="h-9 w-[7.5rem] text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" className="w-full" onClick={saveWorkingHours}>
              حفظ أوقات العمل
            </Button>
          </CardContent>
        </Card>
      )}

      {subscriptionTier === SubscriptionTier.DIAMOND && (
        <Card className="mb-6 border-accent/40 bg-gradient-to-br from-accent/5 to-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-5 w-5 text-accent" />
              جدولة المواعيد (ماسي)
            </CardTitle>
            <CardDescription>
              تحكم بإظهار أو إخفاء كتلة الحجز على بطاقة صالونك في خريطة حلاق ماب. يُحفظ الإعداد في هذا المتصفح
              كمعاينة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">إظهار جدولة المواعيد للعملاء</p>
                <p className="text-xs text-muted-foreground">عند الإيقاف تختفي الكتلة من الخريطة على هذا الجهاز.</p>
              </div>
              <Switch
                id="diamond-schedule-public"
                checked={diamondSchedulePublic}
                onCheckedChange={(checked) => {
                  setDiamondSchedulePublic(checked);
                  setDiamondSchedulingPublicLocal(barberId, checked);
                  toast.success(checked ? 'ظهرت جدولة المواعيد للعملاء على الخريطة' : 'أُخفيت جدولة المواعيد عن العملاء');
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!showWeeklyEditor && (
        <Card className="mb-6 border-dashed">
          <CardHeader>
            <CardTitle className="text-base">أوقات العمل</CardTitle>
            <CardDescription>
              في الباقة البرونزية تُحدَّد أوقات العمل عند التسجيل. للتعديل لاحقاً يمكن الترقية إلى باقة ذهبية أو
              ماسية.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {subscriptionTier === SubscriptionTier.BRONZE && (
        <Card className="mb-6 border-destructive/25 bg-destructive/[0.04]">
          <CardHeader>
            <CardTitle className="text-base">حذف الحساب وحقوقك</CardTitle>
            <CardDescription className="leading-relaxed">
              يحق لك طلب إيقاف ظهورك وحذف بياناتك كشريك. في الباقة البرونزية يُقدَّم الطلب عبر نموذج يُحال إلى
              الإدارة للتحقق ومعالجة الطلب يدوياً.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to={ROUTE_PATHS.BARBER_ACCOUNT_DELETE_REQUEST}>فتح نموذج طلب حذف الحساب</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>معلومات الصالون</CardTitle>
          <CardDescription>بياناتك المعتمدة من التسجيل — تعديل الحقول هنا معطّل حتى يُفعّل المزامنة مع الخادم.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>اسم الصالون</Label>
            <Input readOnly value={barberData.name} />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input readOnly type="email" value={barberData.email} dir="ltr" className="text-left" />
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input readOnly type="tel" value={barberData.phone || '—'} dir="ltr" className="text-left" />
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea readOnly rows={4} placeholder="سيُتاح التعديل عبر مزامنة قاعدة البيانات." />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
