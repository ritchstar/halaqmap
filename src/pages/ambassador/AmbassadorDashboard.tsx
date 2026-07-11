import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Copy,
  LogOut,
  MapPin,
  Plus,
  Scissors,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AmbassadorMarketingKitPanel } from '@/components/ambassador/AmbassadorMarketingKitPanel';
import {
  AMBASSADOR_COMMISSION_TABLE,
  AMBASSADOR_GEO_MATCH_MAX_METERS,
  AMBASSADOR_HOSPITALITY_REWARD_SAR,
  AMBASSADOR_PAYOUT_BUSINESS_DAYS_MAX,
  AMBASSADOR_PAYOUT_BUSINESS_DAYS_MIN,
  AMBASSADOR_PAYOUT_MIN_SAR,
  AMBASSADOR_TARGET_EXPIRY_DAYS,
  AMBASSADOR_TARGET_REMINDER_DAYS,
  type AmbassadorDurationMonths,
  type AmbassadorPackageKey,
} from '@/config/ambassadorFieldRulesPolicy';
import { buildAbsoluteHashRoute } from '@/config/siteOrigin';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib';
import {
  acknowledgePayoutReceipt,
  attachTransferDocument,
  buildAmbassadorReferralPath,
  clearAmbassadorPortal,
  createTargetRequest,
  lookupCommissionSar,
  readAmbassadorPortal,
  refreshTargetStatuses,
  requestPayout,
  simulateRewardForTarget,
  targetWindowLabel,
  updateAmbassadorIban,
  type AmbassadorPortalState,
  type AmbassadorTargetKind,
} from '@/lib/ambassadorPortalStore';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

type TabId = 'home' | 'target' | 'list' | 'wallet';

export default function AmbassadorDashboard() {
  useDocumentTitle('لوحة السفير · حلاق ماب');

  const [bootstrapped, setBootstrapped] = useState(false);
  const [state, setState] = useState<AmbassadorPortalState | null>(null);
  const [tab, setTab] = useState<TabId>('home');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    const portal = readAmbassadorPortal();
    if (portal) setState(refreshTargetStatuses(portal));
    setBootstrapped(true);
  }, []);

  const referralUrl = useMemo(() => {
    if (!state) return '';
    return buildAbsoluteHashRoute(buildAmbassadorReferralPath(state.profile.code));
  }, [state]);

  const openCount = state?.targets.filter((t) => t.status === 'open').length ?? 0;

  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070a] text-sm text-slate-400" dir="rtl">
        جاري التحميل…
      </div>
    );
  }

  if (!state) {
    return <Navigate to={ROUTE_PATHS.AMBASSADOR_ENTER} replace />;
  }

  const logout = () => {
    clearAmbassadorPortal();
    setState(null);
  };

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success('تم نسخ رابط الإسناد');
    } catch {
      toast.error('تعذّر النسخ');
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(20,184,166,0.12),transparent_50%)]" />

      <header className="relative z-10 border-b border-white/8 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">سفير ميداني</p>
            <p className="font-bold text-white">{state.profile.displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-teal-400/30 bg-teal-500/10 px-2.5 py-1 font-mono text-xs text-teal-200">
              {state.profile.code}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-slate-400 hover:text-white"
              aria-label="خروج"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {state.profile.marketingLocked ? (
          <div className="border-t border-amber-400/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100">
            التسويق مقفل — أقرّ باستلام التحويل في تبويب المحفظة لإعادة الفتح.
          </div>
        ) : null}
      </header>

      <main className="relative z-10 container mx-auto max-w-3xl px-4 pb-28 pt-6">
        {tab === 'home' ? (
          <HomeTab
            state={state}
            referralUrl={referralUrl}
            openCount={openCount}
            onCopy={copyReferral}
            onGoTarget={() => setTab('target')}
            onGoWallet={() => setTab('wallet')}
          />
        ) : null}
        {tab === 'target' ? (
          <TargetTab
            state={state}
            onState={setState}
            onDone={() => setTab('list')}
          />
        ) : null}
        {tab === 'list' ? <ListTab state={state} onState={setState} /> : null}
        {tab === 'wallet' ? <WalletTab state={state} onState={setState} /> : null}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#07070a]/95 backdrop-blur-md">
        <div className="container mx-auto grid max-w-3xl grid-cols-4 gap-1 px-2 py-2">
          {(
            [
              { id: 'home' as const, label: 'الرئيسية', icon: Building2 },
              { id: 'target' as const, label: 'استهداف', icon: Plus },
              { id: 'list' as const, label: 'طلباتي', icon: Scissors },
              { id: 'wallet' as const, label: 'المحفظة', icon: Wallet },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors',
                tab === item.id ? 'bg-teal-500/15 text-teal-200' : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function HomeTab({
  state,
  referralUrl,
  openCount,
  onCopy,
  onGoTarget,
  onGoWallet,
}: {
  state: AmbassadorPortalState;
  referralUrl: string;
  openCount: number;
  onCopy: () => void;
  onGoTarget: () => void;
  onGoWallet: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="رصيد المحفظة" value={`${state.balanceSar} ر.س`} />
        <StatCard label="طلبات مفتوحة" value={String(openCount)} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0f0f14] p-5">
        <h2 className="mb-2 text-sm font-bold text-teal-200">رابط الإسناد</h2>
        <p className="mb-3 break-all text-xs text-slate-400" dir="ltr">
          {referralUrl}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onCopy} className="border-white/15">
          <Copy className="ml-2 h-4 w-4" aria-hidden />
          نسخ الرابط
        </Button>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          طلب الاستهداف الميداني (GPS + صور) هو الإثبات الأقوى. الرابط يكمّل الربط عند تسجيل الصالون.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0f0f14] p-5">
        <h2 className="mb-3 text-sm font-bold text-white">قواعد سريعة</h2>
        <ul className="space-y-2 text-xs leading-relaxed text-slate-400">
          <li>• أول تفعيل فقط — لا عمولة على التجديد</li>
          <li>• تطابق جغرافي ≤ {AMBASSADOR_GEO_MATCH_MAX_METERS}م</li>
          <li>
            • نافذة الطلب: تنبيه يوم {AMBASSADOR_TARGET_REMINDER_DAYS} · انتهاء يوم{' '}
            {AMBASSADOR_TARGET_EXPIRY_DAYS}
          </li>
          <li>
            • صرف من {AMBASSADOR_PAYOUT_MIN_SAR} ر.س · تحويل{' '}
            {AMBASSADOR_PAYOUT_BUSINESS_DAYS_MIN}–{AMBASSADOR_PAYOUT_BUSINESS_DAYS_MAX} أيام عمل
          </li>
          <li>• مفروشات: {AMBASSADOR_HOSPITALITY_REWARD_SAR} ر.س بعد الاستلام بلا شكوى</li>
        </ul>
        <Link
          to={ROUTE_PATHS.AMBASSADOR_RULES}
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-teal-300 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          وثيقة القواعد كاملة
        </Link>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0f0f14] p-5">
        <h2 className="mb-3 text-sm font-bold text-white">جدول العمولات</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-right text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-500">
                <th className="py-2 font-medium">الباقة</th>
                <th className="py-2 font-medium">3 أشهر</th>
                <th className="py-2 font-medium">6 أشهر</th>
                <th className="py-2 font-medium">سنة</th>
              </tr>
            </thead>
            <tbody>
              {AMBASSADOR_COMMISSION_TABLE.map((row) => (
                <tr key={row.packageKey} className="border-b border-white/5 text-slate-200">
                  <td className="py-2">{row.labelAr}</td>
                  <td className="py-2">{row.commissionByMonths[3]}</td>
                  <td className="py-2">{row.commissionByMonths[6]}</td>
                  <td className="py-2">{row.commissionByMonths[12]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          onClick={onGoTarget}
          disabled={state.profile.marketingLocked}
          className="rounded-xl bg-teal-500 font-bold text-black hover:bg-teal-400"
        >
          فتح طلب استهداف
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onGoWallet}
          className="rounded-xl border-white/15"
        >
          المحفظة والتحويل
        </Button>
      </div>

      <AmbassadorMarketingKitPanel compact />
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f0f14] p-4">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function TargetTab({
  state,
  onState,
  onDone,
}: {
  state: AmbassadorPortalState;
  onState: (s: AmbassadorPortalState) => void;
  onDone: () => void;
}) {
  const [kind, setKind] = useState<AmbassadorTargetKind>('barber');
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [streetLabel, setStreetLabel] = useState('');
  const [interiorLabels, setInteriorLabels] = useState<string[]>([]);

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم تحديد الموقع.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy ?? null);
        setLocating(false);
        toast.success('تم تسجيل الإحداثيات.');
      },
      () => {
        setLocating(false);
        toast.error('تعذّر الحصول على الموقع — فعّل إذن الموقع وكن عند المحل.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }, []);

  const onStreetFile = (file: File | null) => {
    setStreetLabel(file?.name ?? '');
  };

  const onInteriorFiles = (files: FileList | null) => {
    if (!files) {
      setInteriorLabels([]);
      return;
    }
    setInteriorLabels(Array.from(files).map((f) => f.name));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      toast.error('أدخل اسم المحل / المنشأة.');
      return;
    }
    if (lat == null || lng == null) {
      toast.error('حدّد موقعك عند المحل أولاً.');
      return;
    }
    const result = createTargetRequest(state, {
      kind,
      shopName,
      shopPhone,
      city,
      district,
      notes,
      latitude: lat,
      longitude: lng,
      accuracyMeters: accuracy,
      streetSignLabel: streetLabel,
      interiorLabels,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onState(result.state);
    toast.success('تم فتح طلب الاستهداف — نافذة 30 يوماً.');
    onDone();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="mb-2 text-2xl font-black text-white">طلب استهداف جديد</h1>
      <p className="mb-6 text-sm text-slate-400">
        إثبات أولي: كن عند الموقع، سجّل GPS، ارفع اللوحة والصور الداخلية.
      </p>

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-[#0f0f14] p-5">
        <div className="space-y-2">
          <Label className="text-slate-200">نوع الطلب</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as AmbassadorTargetKind)}>
            <SelectTrigger className="border-white/15 bg-black/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="barber">حلاق / صالون</SelectItem>
              <SelectItem value="hospitality">شقق مفروشة / ضيافة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">اسم المحل / المنشأة</Label>
          <Input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="border-white/15 bg-black/30 text-white"
            maxLength={200}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-200">جوال المحل (اختياري)</Label>
            <Input
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
              className="border-white/15 bg-black/30 text-white"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">المدينة</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border-white/15 bg-black/30 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">الحي</Label>
          <Input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border-white/15 bg-black/30 text-white"
          />
        </div>

        <div className="rounded-xl border border-teal-400/25 bg-teal-500/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-teal-100">الإحداثيات (إلزامي)</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={captureLocation}
              disabled={locating}
              className="border-teal-400/30 text-teal-100"
            >
              <MapPin className="ml-1 h-4 w-4" aria-hidden />
              {locating ? 'جاري التحديد…' : 'تسجيل موقعي الآن'}
            </Button>
          </div>
          {lat != null && lng != null ? (
            <p className="text-xs text-slate-300" dir="ltr">
              {lat.toFixed(6)}, {lng.toFixed(6)}
              {accuracy != null ? ` · ±${Math.round(accuracy)}م` : ''}
            </p>
          ) : (
            <p className="text-xs text-slate-500">لم يُسجَّل موقع بعد — قف أمام المحل ثم اضغط الزر.</p>
          )}
          <p className="mt-2 text-[11px] text-slate-500">
            عند التفعيل يجب أن يطابق موقع تسجيل الحلاق ضمن {AMBASSADOR_GEO_MATCH_MAX_METERS}م.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">صورة لوحة المحل من الشارع</Label>
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onStreetFile(e.target.files?.[0] ?? null)}
            className="border-white/15 bg-black/30 text-slate-300 file:bg-teal-500/20 file:text-teal-100"
          />
          {streetLabel ? <p className="text-xs text-slate-500">{streetLabel}</p> : null}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">
            {kind === 'barber'
              ? 'صور داخلية (4 على الأقل — منها مع الحلاقين)'
              : 'صور المنشأة (صورتان على الأقل)'}
          </Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onInteriorFiles(e.target.files)}
            className="border-white/15 bg-black/30 text-slate-300 file:bg-teal-500/20 file:text-teal-100"
          />
          {interiorLabels.length > 0 ? (
            <p className="text-xs text-slate-500">{interiorLabels.length} ملف: {interiorLabels.join(' · ')}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">ملاحظات (اختياري)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="border-white/15 bg-black/30 text-white"
            maxLength={500}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={state.profile.marketingLocked}
          className="w-full rounded-xl bg-teal-500 font-bold text-black hover:bg-teal-400"
        >
          حفظ طلب الاستهداف
        </Button>
      </form>
    </motion.div>
  );
}

function ListTab({
  state,
  onState,
}: {
  state: AmbassadorPortalState;
  onState: (s: AmbassadorPortalState) => void;
}) {
  const [simPackage, setSimPackage] = useState<AmbassadorPackageKey>('bronze');
  const [simMonths, setSimMonths] = useState<AmbassadorDurationMonths>(3);

  const simulate = (targetId: string, kind: AmbassadorTargetKind) => {
    const amount =
      kind === 'hospitality'
        ? AMBASSADOR_HOSPITALITY_REWARD_SAR
        : lookupCommissionSar(simPackage, simMonths);
    const result = simulateRewardForTarget(
      state,
      targetId,
      amount,
      kind === 'hospitality'
        ? `مكافأة مفروشات ${amount} ر.س (محاكاة حتى ربط الاستلام)`
        : `عمولة ${simPackage} × ${simMonths} شهر = ${amount} ر.س (محاكاة حتى ربط التفعيل)`,
    );
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onState(result.state);
    toast.success(`أُضيفت ${amount} ر.س للمحفظة (محاكاة).`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h1 className="text-2xl font-black text-white">طلباتي</h1>
      <p className="text-sm text-slate-400">
        الاستحقاق النهائي سيكون آلياً عند التفعيل. زر المحاكاة أدناه للاختبار قبل ربط الخادم.
      </p>

      {state.targets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">
          لا طلبات بعد. افتح تبويب «استهداف».
        </p>
      ) : (
        state.targets.map((t) => (
          <article key={t.id} className="rounded-2xl border border-white/10 bg-[#0f0f14] p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-white">{t.shopName}</p>
                <p className="text-xs text-slate-500">
                  {t.kind === 'barber' ? 'حلاق' : 'مفروشات'}
                  {t.city ? ` · ${t.city}` : ''}
                  {t.district ? ` · ${t.district}` : ''}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold',
                  t.status === 'open' && 'bg-teal-500/15 text-teal-200',
                  t.status === 'rewarded' && 'bg-emerald-500/15 text-emerald-200',
                  t.status === 'expired' && 'bg-slate-500/20 text-slate-300',
                  t.status === 'rejected' && 'bg-red-500/15 text-red-200',
                )}
              >
                {targetWindowLabel(t)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500" dir="ltr">
              {t.latitude.toFixed(5)}, {t.longitude.toFixed(5)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              لوحة: {t.streetSignLabel} · داخل: {t.interiorLabels.length} صور
            </p>
            {t.status === 'open' ? (
              <div className="mt-3 space-y-2 border-t border-white/8 pt-3">
                {t.kind === 'barber' ? (
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={simPackage}
                      onValueChange={(v) => setSimPackage(v as AmbassadorPackageKey)}
                    >
                      <SelectTrigger className="h-8 w-[140px] border-white/15 bg-black/30 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AMBASSADOR_COMMISSION_TABLE.map((r) => (
                          <SelectItem key={r.packageKey} value={r.packageKey}>
                            {r.labelAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={String(simMonths)}
                      onValueChange={(v) => setSimMonths(Number(v) as AmbassadorDurationMonths)}
                    >
                      <SelectTrigger className="h-8 w-[100px] border-white/15 bg-black/30 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 أشهر</SelectItem>
                        <SelectItem value="6">6 أشهر</SelectItem>
                        <SelectItem value="12">12 شهر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-amber-400/30 text-amber-100"
                  onClick={() => simulate(t.id, t.kind)}
                >
                  محاكاة استحقاق العمولة
                </Button>
              </div>
            ) : null}
            {t.rewardSar != null ? (
              <p className="mt-2 text-xs font-semibold text-emerald-300">+{t.rewardSar} ر.س</p>
            ) : null}
          </article>
        ))
      )}
    </motion.div>
  );
}

function WalletTab({
  state,
  onState,
}: {
  state: AmbassadorPortalState;
  onState: (s: AmbassadorPortalState) => void;
}) {
  const [iban, setIban] = useState(state.profile.iban);

  const saveIban = () => {
    onState(updateAmbassadorIban(state, iban));
    toast.success('تم حفظ الآيبان.');
  };

  const onPayout = () => {
    const withIban = updateAmbassadorIban(state, iban);
    const result = requestPayout(withIban);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onState(result.state);
    toast.success(
      `طُلب التحويل — خلال ${AMBASSADOR_PAYOUT_BUSINESS_DAYS_MIN}–${AMBASSADOR_PAYOUT_BUSINESS_DAYS_MAX} أيام عمل. ارفع المستند ثم أقرّ بالاستلام.`,
    );
  };

  const pendingAck = state.payouts.find(
    (p) => p.status === 'awaiting_receipt_ack' || (p.status === 'pending' && !p.receiptAcknowledgedAt),
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-2xl border border-teal-400/25 bg-gradient-to-b from-teal-500/15 to-[#0f0f14] p-6 text-center">
        <p className="text-xs text-teal-200/80">الرصيد المتاح</p>
        <p className="mt-1 text-4xl font-black text-white">{state.balanceSar}</p>
        <p className="text-sm text-slate-400">ريال سعودي</p>
        <p className="mt-3 text-[11px] text-slate-500">
          حد فتح التحويل: {AMBASSADOR_PAYOUT_MIN_SAR} ر.س
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-[#0f0f14] p-5">
        <Label className="text-slate-200">الآيبان (باسمك)</Label>
        <Input
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          placeholder="SAxxxxxxxxxxxxxxxxxxxxxxxx"
          className="border-white/15 bg-black/30 font-mono text-white"
          dir="ltr"
        />
        <Button type="button" variant="outline" size="sm" onClick={saveIban} className="border-white/15">
          حفظ الآيبان
        </Button>
        <Button
          type="button"
          className="w-full rounded-xl bg-teal-500 font-bold text-black hover:bg-teal-400"
          onClick={onPayout}
          disabled={state.profile.marketingLocked || state.balanceSar < AMBASSADOR_PAYOUT_MIN_SAR}
        >
          طلب تحويل الأرباح
        </Button>
      </section>

      {pendingAck ? (
        <section className="space-y-3 rounded-2xl border border-amber-400/30 bg-amber-500/5 p-5">
          <h2 className="font-bold text-amber-100">تحويل بانتظار إقرارك</h2>
          <p className="text-sm text-slate-300">{pendingAck.amountSar} ر.س → {pendingAck.iban}</p>
          <div className="space-y-2">
            <Label className="text-slate-200">مستند التحويل</Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                onState(attachTransferDocument(state, pendingAck.id, file.name));
                toast.success('تم ربط مستند التحويل.');
              }}
              className="border-white/15 bg-black/30 text-slate-300"
            />
            {pendingAck.transferDocumentLabel ? (
              <p className="text-xs text-slate-500">{pendingAck.transferDocumentLabel}</p>
            ) : null}
          </div>
          <Button
            type="button"
            className="w-full rounded-xl bg-amber-500 font-bold text-black hover:bg-amber-400"
            onClick={() => {
              const result = acknowledgePayoutReceipt(state, pendingAck.id);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              onState(result.state);
              toast.success('تم إقرار الاستلام — أُعيد فتح التسويق.');
            }}
          >
            أقرّ بأنني استلمت المبلغ
          </Button>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-[#0f0f14] p-5">
        <h2 className="mb-3 text-sm font-bold text-white">سجل المحفظة</h2>
        {state.ledger.length === 0 ? (
          <p className="text-xs text-slate-500">لا حركات بعد.</p>
        ) : (
          <ul className="space-y-2">
            {state.ledger.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 border-b border-white/5 py-2 text-xs"
              >
                <div>
                  <p className="text-slate-200">{e.note}</p>
                  <p className="text-slate-500">{new Date(e.createdAt).toLocaleString('ar-SA')}</p>
                </div>
                <span className={e.amountSar >= 0 ? 'text-emerald-300' : 'text-amber-200'}>
                  {e.amountSar >= 0 ? '+' : ''}
                  {e.amountSar}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
}
