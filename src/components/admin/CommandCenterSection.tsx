import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import {
  Users,
  FileText,
  CreditCard,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ROUTE_PATHS, SubscriptionRequest, Payment, AdminStats } from '@/lib';
import { toast } from '@/hooks/use-toast';
import {
  COMMAND_CENTER_OUTREACH_INTERNAL_NOTE_AR,
  commandCenterOutreachPreviewLabel,
  type CommandCenterOutreachLength,
  type CommandCenterOutreachVariant,
} from '@/config/commandCenterOutreachCopy';
import {
  type PartnerProspect,
  type CommandLeadChannel,
  type CommandLeadStatus,
  type ProspectOutreachOptions,
  buildWaDeepLink,
  prospectOutreachMessage,
  PARTNER_PROSPECT_SOURCE_LABELS,
} from '@/lib/adminCommandCenter';
import {
  fetchPartnerProspects,
  updatePartnerProspect,
  migrateLegacyCommandCenterState,
  type PartnerProspectPatch,
} from '@/lib/partnerProspectsRemote';
import { PulseMapAdmin } from '@/modules/pulse-map/components/PulseMapAdmin';
import { PartnerProspectBulkScanPanel } from '@/components/admin/PartnerProspectBulkScanPanel';

export const WEEKLY_SOP_PLAN = [
  { day: 'الأحد', focus: 'استهداف صالونات ماسية', target: 12, note: 'ابدأ بالرياض وجدة للحالات عالية العائد.' },
  { day: 'الإثنين', focus: 'استهداف ذهبي سريع الإغلاق', target: 18, note: 'ركز على الصالونات الصغيرة والمتوسطة.' },
  { day: 'الثلاثاء', focus: 'متابعة بانتظار الرد', target: 20, note: 'رفع التحويل عبر متابعة اليوم + المتأخرة.' },
  { day: 'الأربعاء', focus: 'إغلاق مدفوعات وطلبات', target: 10, note: 'تصفية المعلّق وتحويله إلى حزمة إدراج برمجية فعّال.' },
  { day: 'الخميس', focus: 'توسّع مناطق جديدة', target: 15, note: 'الدمام/الخبر/المدينة + تحديث قاعدة الأهداف.' },
  { day: 'الجمعة', focus: 'تشغيل خفيف + دعم', target: 8, note: 'التركيز على الدعم والمتابعة السريعة فقط.' },
  { day: 'السبت', focus: 'مراجعة أسبوعية', target: 0, note: 'تقييم الأداء وتحديث خطة الأسبوع القادم.' },
] as const;

const COMMAND_CENTER_SOP_CHECK_KEY = 'halaqmap_command_center_sop_check_v1';

function isHospitalityB2BRequest(prospect: PartnerProspect): boolean {
  const meta = prospect.sourceMeta;
  if (!meta || typeof meta !== 'object') return false;
  const program = (meta as Record<string, unknown>).program;
  return program === 'hospitality_qr_b2b';
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
  icon: LucideIcon;
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
            {subtitle ? <p className="text-xs text-muted-foreground mt-1">{subtitle}</p> : null}
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

export function CommandCenterSection({
  stats,
  requests,
  payments,
  canManage,
}: {
  stats: AdminStats;
  requests: SubscriptionRequest[];
  payments: Payment[];
  canManage: boolean;
}) {
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.halaqmap.com';
  const partnersLandingUrl = `${siteOrigin}/#/partners`;
  const partnersRegisterUrl = `${siteOrigin}/#/partners/register`;
  const hospitalityB2BRequestUrl = `${siteOrigin}/#${ROUTE_PATHS.HOSPITALITY_B2B_REQUEST}`;
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

  const [prospects, setProspects] = useState<PartnerProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const legacyMigrationAttemptedRef = useRef(false);

  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<'all' | string>('all');
  const [channel, setChannel] = useState<'all' | CommandLeadChannel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CommandLeadStatus>('all');
  const [tierFilter, setTierFilter] = useState<'all' | PartnerProspect['tierFit']>('all');
  const [onlyDue, setOnlyDue] = useState(false);
  const [onlyHospitality, setOnlyHospitality] = useState(false);
  const [sopChecks, setSopChecks] = useState<Record<string, boolean>>({});
  const [outreachPreview, setOutreachPreview] = useState<{
    prospect: PartnerProspect;
    variant: CommandCenterOutreachVariant;
    length: CommandCenterOutreachLength;
  } | null>(null);

  const todayIso = new Date().toISOString().slice(0, 10);
  const jsDay = new Date().getDay();
  const sundayFirstToSaturday = [0, 1, 2, 3, 4, 5, 6];
  const dayPlan = WEEKLY_SOP_PLAN[sundayFirstToSaturday.indexOf(jsDay)];
  const sopKeyToday = `${todayIso}-${dayPlan.day}`;

  const loadProspects = useCallback(async () => {
    const isInitial = prospects.length === 0;
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    setError(null);

    const r = await fetchPartnerProspects();

    if (isInitial) setLoading(false);
    else setRefreshing(false);

    if (!r.ok) {
      setError(r.error);
      return;
    }

    setProspects(r.prospects);

    if (canManage && !legacyMigrationAttemptedRef.current) {
      legacyMigrationAttemptedRef.current = true;
      const { migrated } = await migrateLegacyCommandCenterState(r.prospects);
      if (migrated > 0) {
        const r2 = await fetchPartnerProspects();
        if (r2.ok) setProspects(r2.prospects);
        toast({ title: 'تم ترحيل البيانات المحلية', description: `${migrated} سجل` });
      }
    }
  }, [canManage, prospects.length]);

  useEffect(() => {
    void loadProspects();
  }, [loadProspects]);

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
    () => Array.from(new Set(prospects.map((p) => p.region))).sort((a, b) => a.localeCompare(b, 'ar')),
    [prospects],
  );

  const pipelineCounts = useMemo(() => {
    const init: Record<CommandLeadStatus, number> = {
      new: 0,
      contacted: 0,
      waiting: 0,
      won: 0,
      lost: 0,
    };
    prospects.forEach((prospect) => {
      init[prospect.status] += 1;
    });
    return init;
  }, [prospects]);

  const dueSummary = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;
    prospects.forEach((prospect) => {
      const d = prospect.followUpDate;
      if (!d) return;
      if (d === todayIso) dueToday += 1;
      if (d < todayIso) overdue += 1;
    });
    return { dueToday, overdue };
  }, [prospects, todayIso]);

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

  const filteredProspects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prospects.filter((prospect) => {
      const st = prospect.status;
      const matchesRegion = region === 'all' || prospect.region === region;
      const matchesChannel = channel === 'all' || prospect.channel === channel;
      const matchesStatus = statusFilter === 'all' || st === statusFilter;
      const matchesTier = tierFilter === 'all' || prospect.tierFit === tierFilter;
      const followUpDate = prospect.followUpDate;
      const matchesDue = !onlyDue || (!!followUpDate && followUpDate <= todayIso);
      const matchesHospitality = !onlyHospitality || isHospitalityB2BRequest(prospect);
      const matchesQuery =
        q.length === 0 ||
        prospect.name.toLowerCase().includes(q) ||
        prospect.city.toLowerCase().includes(q) ||
        (prospect.address ?? '').toLowerCase().includes(q) ||
        (prospect.instagram ?? '').toLowerCase().includes(q) ||
        (prospect.phone ?? '').includes(q) ||
        (prospect.notes ?? '').toLowerCase().includes(q);
      return matchesRegion && matchesChannel && matchesStatus && matchesTier && matchesDue && matchesHospitality && matchesQuery;
    });
  }, [prospects, query, region, channel, statusFilter, tierFilter, onlyDue, onlyHospitality, todayIso]);

  const hospitalityProspects = useMemo(
    () => prospects.filter((prospect) => isHospitalityB2BRequest(prospect)),
    [prospects],
  );

  const hospitalityStageCounts = useMemo(() => {
    const counts = { new: 0, approved: 0, inExecution: 0, closed: 0 };
    hospitalityProspects.forEach((prospect) => {
      if (prospect.status === 'new') counts.new += 1;
      else if (prospect.status === 'contacted') counts.approved += 1;
      else if (prospect.status === 'waiting') counts.inExecution += 1;
      else if (prospect.status === 'won') counts.closed += 1;
    });
    return counts;
  }, [hospitalityProspects]);

  const outreachPreviewText = useMemo(() => {
    if (!outreachPreview) return '';
    return prospectOutreachMessage(outreachPreview.prospect, {
      variant: outreachPreview.variant,
      length: outreachPreview.length,
    });
  }, [outreachPreview]);

  const outreachPreviewUsesSuggested = Boolean(
    outreachPreview &&
      outreachPreview.length === 'full' &&
      outreachPreview.variant === 'initial' &&
      outreachPreview.prospect.suggestedPitch?.trim(),
  );

  const setLeadPatch = (id: string, patch: PartnerProspectPatch) => {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

    if (!canManage) return;

    void (async () => {
      const r = await updatePartnerProspect(id, patch);
      if (!r.ok) {
        toast({ title: 'تعذر الحفظ', description: r.error, variant: 'destructive' });
        void loadProspects();
        return;
      }
      setProspects((prev) => prev.map((p) => (p.id === id ? r.prospect : p)));
    })();
  };

  const copyLeadPitch = async (prospect: PartnerProspect, options: ProspectOutreachOptions = {}) => {
    const text = prospectOutreachMessage(prospect, options);
    const variant = options.variant ?? 'initial';
    const length = options.length ?? 'full';
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title:
          variant === 'followup'
            ? 'تم نسخ رسالة المتابعة'
            : length === 'short'
              ? 'تم نسخ النسخة المختصرة'
              : 'تم نسخ الرسالة',
        description: `جاهزة للإرسال إلى ${prospect.name}`,
      });
    } catch {
      toast({ title: 'تعذر النسخ', description: 'انسخ الرسالة يدوياً.', variant: 'destructive' });
    }
  };

  const openLeadChannel = (prospect: PartnerProspect, options: ProspectOutreachOptions = {}) => {
    const message = prospectOutreachMessage(prospect, options);
    if (prospect.phone) {
      window.open(buildWaDeepLink(prospect.phone, message), '_blank');
      return;
    }
    if (prospect.instagram) {
      window.open(`https://instagram.com/${prospect.instagram.replace('@', '')}`, '_blank');
      return;
    }
    if (prospect.email) {
      window.open(
        `mailto:${prospect.email}?subject=${encodeURIComponent('دعوة انضمام إلى منصة حلاق ماب')}&body=${encodeURIComponent(message)}`,
        '_blank',
      );
      return;
    }
    if (prospect.website) {
      window.open(prospect.website, '_blank');
    }
  };

  const downloadCsv = () => {
    const headers = [
      'name',
      'city',
      'region',
      'address',
      'tier_fit',
      'channel',
      'status',
      'source',
      'phone',
      'email',
      'instagram',
      'website',
      'assigned_to',
      'follow_up_date',
      'last_contact_at',
      'notes',
      'suggested_pitch',
    ];

    const rows = filteredProspects.map((prospect) =>
      [
        prospect.name,
        prospect.city,
        prospect.region,
        prospect.address ?? '',
        prospect.tierFit,
        prospect.channel,
        prospect.status,
        prospect.source,
        prospect.phone ?? '',
        prospect.email ?? '',
        prospect.instagram ?? '',
        prospect.website ?? '',
        prospect.assignedTo ?? '',
        prospect.followUpDate ?? '',
        prospect.lastContactAt ?? '',
        prospect.notes ?? '',
        prospect.suggestedPitch ?? '',
      ].map((v) => csvEscape(v)),
    );

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `command-center-${todayIso}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'تم تصدير CSV', description: `${filteredProspects.length} جهة اتصال` });
  };

  const statusMeta: Record<CommandLeadStatus, { label: string; className: string }> = {
    new: { label: 'جديد', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    contacted: { label: 'تم التواصل', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    waiting: { label: 'بانتظار الرد', className: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
    won: { label: 'تم شراء حزمة الرخصة', className: 'bg-green-500/10 text-green-600 border-green-500/30' },
    lost: { label: 'تعذر الإغلاق', className: 'bg-red-500/10 text-red-600 border-red-500/30' },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">جاري تحميل أهداف التواصل…</p>
      </div>
    );
  }

  if (error && prospects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground text-center max-w-md">{error}</p>
        <Button variant="outline" onClick={() => void loadProspects()}>
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 overflow-hidden rounded-2xl border border-sky-400/15 shadow-[0_0_48px_rgba(56,189,248,0.08)]">
        <PulseMapAdmin className="min-h-[min(52rem,78vh)]" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">غرفة القيادة</h2>
          <p className="text-sm text-muted-foreground mt-1">
            متابعة حملة التواصل، التحويل، والقرارات التشغيلية اليومية من مكان واحد.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2 max-w-2xl">
            {COMMAND_CENTER_OUTREACH_INTERNAL_NOTE_AR}
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadProspects()} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 ml-2" />
          )}
          تحديث
        </Button>
      </div>

      {error ? (
        <Card className="mb-6 border-destructive/40">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void loadProspects()}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : null}

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
                  رابط B2B للضيافة (فنادق/شقق مفروشة):{' '}
                  <a className="underline" href={hospitalityB2BRequestUrl} target="_blank" rel="noopener noreferrer">
                    {hospitalityB2BRequestUrl}
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
        <StatsCard title="أهداف التواصل" value={prospects.length} subtitle="قائمة قابلة للتوسع" icon={Users} color="blue" />
        <StatsCard
          title="إشغال اليوم"
          value={requests.filter((r) => r.status === 'pending').length + payments.filter((p) => p.status === 'pending').length}
          subtitle="طلبات + مدفوعات تحتاج قرار"
          icon={AlertCircle}
          color="green"
        />
      </div>

      <Card className="mb-6 border-sky-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">غرفة طلبات الضيافة B2B</CardTitle>
          <CardDescription>
            الطلبات القادمة من رابط الفنادق/الشقق المفروشة (QR بنرات) تظهر هنا لاعتمادها وتحويلها للمختص ثم إغلاقها.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
            إجمالي طلبات الضيافة: <span className="font-bold">{hospitalityProspects.length}</span>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
              جديد: <span className="font-bold">{hospitalityStageCounts.new}</span>
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
              معتمد: <span className="font-bold">{hospitalityStageCounts.approved}</span>
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
              قيد التنفيذ: <span className="font-bold">{hospitalityStageCounts.inExecution}</span>
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
              مغلق: <span className="font-bold">{hospitalityStageCounts.closed}</span>
            </div>
          </div>
          {hospitalityProspects.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد طلبات ضيافة جديدة حالياً.</p>
          ) : (
            hospitalityProspects.slice(0, 8).map((prospect) => {
              const meta = (prospect.sourceMeta ?? {}) as Record<string, unknown>;
              const receptionCount = Number(meta.receptionBannersCount ?? 0);
              const roomsCount = Number(meta.roomsBannersCount ?? 0);
              const mapsUrl = typeof meta.shippingGoogleMapsUrl === 'string' ? meta.shippingGoogleMapsUrl : '';
              return (
                <div key={prospect.id} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold">{prospect.name}</p>
                    <Badge variant="outline">{prospect.region} — {prospect.city}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    استقبال: {Number.isFinite(receptionCount) ? receptionCount : 0} | غرف/أجنحة:{' '}
                    {Number.isFinite(roomsCount) ? roomsCount : 0}
                  </p>
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-xs text-sky-700 underline"
                    >
                      فتح رابط التوثيق على الخرائط
                    </a>
                  ) : null}
                  <div className="grid gap-2 md:grid-cols-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!canManage}
                      onClick={() =>
                        setLeadPatch(prospect.id, {
                          status: 'contacted',
                          notes: `${prospect.notes ?? ''}\n[اعتماد] تمت مراجعة الطلب واعتماده.`.trim(),
                          lastContactAt: new Date().toLocaleString('ar-SA'),
                        })
                      }
                    >
                      اعتماد الطلب
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!canManage}
                      onClick={() =>
                        setLeadPatch(prospect.id, {
                          status: 'waiting',
                          assignedTo: prospect.assignedTo ?? 'admin_hospitality_ops',
                          notes: `${prospect.notes ?? ''}\n[تحويل] أُحيل للمختص التنفيذي.`.trim(),
                          lastContactAt: new Date().toLocaleString('ar-SA'),
                        })
                      }
                    >
                      تحويل للمختص
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!canManage}
                      onClick={() =>
                        setLeadPatch(prospect.id, {
                          status: 'won',
                          notes: `${prospect.notes ?? ''}\n[إغلاق] تم التنفيذ وإقفال الطلب.`.trim(),
                          lastContactAt: new Date().toLocaleString('ar-SA'),
                        })
                      }
                    >
                      إقفال الطلب
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7 mb-6">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">جديد</p><p className="text-2xl font-bold">{pipelineCounts.new}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">تم التواصل</p><p className="text-2xl font-bold">{pipelineCounts.contacted}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">بانتظار الرد</p><p className="text-2xl font-bold">{pipelineCounts.waiting}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">تم شراء حزمة الرخصة</p><p className="text-2xl font-bold text-green-600">{pipelineCounts.won}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">تعذر الإغلاق</p><p className="text-2xl font-bold text-red-600">{pipelineCounts.lost}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">متابعة اليوم</p><p className="text-2xl font-bold text-amber-600">{dueSummary.dueToday}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">متأخرة</p><p className="text-2xl font-bold text-red-600">{dueSummary.overdue}</p></CardContent></Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">استيراد leads (صور أو Excel)</CardTitle>
          <CardDescription>
            لقطات جدول بالذكاء الاصطناعي، أو ملفات Excel جاهزة مثل `halaqmap_*_barbers_FINAL.xlsx` لكل منطقة —
            يُستخرج الاسم والحي/المنطقة ورقم الواتساب من كل صف.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PartnerProspectBulkScanPanel canManage={canManage} onImported={() => void loadProspects()} />
        </CardContent>
      </Card>

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
                <SelectItem value="won">تم شراء حزمة الرخصة</SelectItem>
                <SelectItem value="lost">تعذر الإغلاق</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={(value) => setTierFilter(value as 'all' | PartnerProspect['tierFit'])}>
              <SelectTrigger><SelectValue placeholder="ملاءمة الباقة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الباقات</SelectItem>
                <SelectItem value="bronze">برونزي</SelectItem>
                <SelectItem value="gold">ذهبي</SelectItem>
                <SelectItem value="diamond">ماسي</SelectItem>
                <SelectItem value="mixed">ذهبي/ماسي</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={async () => {
                const lines = filteredProspects.map(
                  (prospect) =>
                    `${prospect.name} | ${prospect.city} | ${prospect.phone ?? prospect.instagram ?? prospect.email ?? prospect.website ?? '—'}`,
                );
                try {
                  await navigator.clipboard.writeText(lines.join('\n'));
                  toast({ title: 'تم نسخ القائمة', description: `${filteredProspects.length} جهة اتصال` });
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
            <div className="flex items-center justify-between rounded-md border px-3">
              <span className="text-sm text-muted-foreground">طلبات الضيافة فقط</span>
              <Switch checked={onlyHospitality} onCheckedChange={setOnlyHospitality} disabled={!canManage} />
            </div>
            <Button variant="outline" onClick={downloadCsv} disabled={!canManage}>
              <Download className="w-4 h-4 ml-2" />
              تصدير CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredProspects.map((prospect) => {
          const status = prospect.status;
          const followUp = prospect.followUpDate;
          const isOverdue = !!followUp && followUp < todayIso;
          const isDueToday = !!followUp && followUp === todayIso;
          const sourceLabel = PARTNER_PROSPECT_SOURCE_LABELS[prospect.source];
          return (
            <Card
              key={prospect.id}
              className={isOverdue ? 'border-red-500/40' : isDueToday ? 'border-amber-500/40' : undefined}
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{prospect.name}</h3>
                      <Badge variant="outline">{prospect.region} — {prospect.city}</Badge>
                      <Badge
                        variant="outline"
                        className={prospect.source === 'b2b_strategist' ? 'border-sky-500/40 bg-sky-500/10 text-sky-700' : undefined}
                      >
                        {sourceLabel}
                      </Badge>
                      <Badge className={statusMeta[status].className}>{statusMeta[status].label}</Badge>
                      <Badge variant="secondary">
                        {prospect.tierFit === 'diamond'
                          ? 'ملائم للماسي'
                          : prospect.tierFit === 'gold'
                            ? 'ملائم للذهبي'
                            : prospect.tierFit === 'bronze'
                              ? 'ملائم للبرونزي'
                              : 'ذهبي/ماسي'}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {commandCenterOutreachPreviewLabel({
                          tierFit: prospect.tierFit,
                          variant: 'initial',
                          length: 'full',
                          usesSuggestedPitch: Boolean(prospect.suggestedPitch?.trim()),
                        })}
                      </Badge>
                      {isOverdue ? <Badge variant="destructive">متابعة متأخرة</Badge> : null}
                      {!isOverdue && isDueToday ? <Badge className="bg-amber-500 text-white">متابعة اليوم</Badge> : null}
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-3 flex-wrap">
                      {prospect.phone ? <span dir="ltr">📞 {prospect.phone}</span> : null}
                      {prospect.email ? <span dir="ltr">✉️ {prospect.email}</span> : null}
                      {prospect.instagram ? <span dir="ltr">{prospect.instagram}</span> : null}
                    </div>
                    {prospect.address ? (
                      <div className="text-sm text-muted-foreground">📍 {prospect.address}</div>
                    ) : null}
                    <div className="text-xs text-muted-foreground">
                      آخر تواصل: {prospect.lastContactAt ?? 'لم يتم بعد'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      متابعة قادمة: {prospect.followUpDate ?? 'غير محددة'}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:w-60">
                    <Button onClick={() => openLeadChannel(prospect)} disabled={!canManage}>
                      <ExternalLink className="w-4 h-4 ml-2" />
                      فتح قناة التواصل
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setOutreachPreview({ prospect, variant: 'initial', length: 'full' })
                      }
                      disabled={!canManage}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      معاينة الرسالة
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void copyLeadPitch(prospect, { length: 'short' })}
                      disabled={!canManage}
                    >
                      <Copy className="w-4 h-4 ml-2" />
                      نسخ مختصرة (واتساب)
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => openLeadChannel(prospect, { variant: 'followup', length: 'short' })}
                      disabled={!canManage || !prospect.phone}
                    >
                      <MessageSquare className="w-4 h-4 ml-2" />
                      واتساب متابعة
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 mt-4 md:grid-cols-4">
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setLeadPatch(prospect.id, {
                        status: value as CommandLeadStatus,
                        lastContactAt: new Date().toLocaleString('ar-SA'),
                      })
                    }
                    disabled={!canManage}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">جديد</SelectItem>
                      <SelectItem value="contacted">تم التواصل</SelectItem>
                      <SelectItem value="waiting">بانتظار الرد</SelectItem>
                      <SelectItem value="won">تم شراء حزمة الرخصة</SelectItem>
                      <SelectItem value="lost">تعذر الإغلاق</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={prospect.assignedTo ?? ''}
                    onChange={(e) => setLeadPatch(prospect.id, { assignedTo: e.target.value })}
                    placeholder="المسؤول (اختياري)"
                    disabled={!canManage}
                  />
                  <Input
                    value={prospect.notes ?? ''}
                    onChange={(e) => setLeadPatch(prospect.id, { notes: e.target.value })}
                    placeholder="ملاحظة مختصرة"
                    disabled={!canManage}
                  />
                  <Input
                    type="date"
                    value={prospect.followUpDate ?? ''}
                    onChange={(e) => setLeadPatch(prospect.id, { followUpDate: e.target.value || null })}
                    disabled={!canManage}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={outreachPreview !== null} onOpenChange={(open) => !open && setOutreachPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>معاينة رسالة التواصل</DialogTitle>
            <DialogDescription>
              {outreachPreview
                ? `${outreachPreview.prospect.name} · ${commandCenterOutreachPreviewLabel({
                    tierFit: outreachPreview.prospect.tierFit,
                    variant: outreachPreview.variant,
                    length: outreachPreview.length,
                    usesSuggestedPitch: outreachPreviewUsesSuggested,
                  })}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          {outreachPreview ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">نوع الرسالة</p>
                <Select
                  value={outreachPreview.variant}
                  onValueChange={(value) =>
                    setOutreachPreview((prev) =>
                      prev ? { ...prev, variant: value as CommandCenterOutreachVariant } : prev,
                    )
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">أول تواصل</SelectItem>
                    <SelectItem value="followup">متابعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">الطول</p>
                <Select
                  value={outreachPreview.length}
                  onValueChange={(value) =>
                    setOutreachPreview((prev) =>
                      prev ? { ...prev, length: value as CommandCenterOutreachLength } : prev,
                    )
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">كاملة</SelectItem>
                    <SelectItem value="short">مختصرة (واتساب)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          <div
            dir="rtl"
            className="chat-arabic-text min-h-[220px] max-h-[min(24rem,50vh)] overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap"
          >
            {outreachPreviewText}
          </div>

          <DialogFooter className="flex flex-wrap gap-2 sm:justify-start">
            <Button
              variant="outline"
              disabled={!outreachPreview || !canManage}
              onClick={() => {
                if (!outreachPreview) return;
                void copyLeadPitch(outreachPreview.prospect, {
                  variant: outreachPreview.variant,
                  length: outreachPreview.length,
                });
              }}
            >
              <Copy className="w-4 h-4 ml-2" />
              نسخ
            </Button>
            <Button
              disabled={!outreachPreview?.prospect.phone || !canManage}
              onClick={() => {
                if (!outreachPreview) return;
                openLeadChannel(outreachPreview.prospect, {
                  variant: outreachPreview.variant,
                  length: outreachPreview.length,
                });
              }}
            >
              <ExternalLink className="w-4 h-4 ml-2" />
              فتح واتساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
