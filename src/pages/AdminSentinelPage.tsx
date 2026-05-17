import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, Bot, Loader2, Send, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAdminDashboardPathFor } from '@/config/adminAuth';
import { toast } from '@/components/ui/sonner';
import {
  fetchAdminSentinelBrief,
  fetchAdminSentinelOpenAiDiagnostics,
  postAdminSentinelChat,
  postAdminSentinelSovereignAction,
  type ChatTurn,
  type SentinelOpenAiDiagnostics,
} from '@/lib/adminSentinelRemote';

const TXT = 'text-[#FFFFFF]';
const BRIEF_LOADING_ASSISTANT =
  '⏳ **جاري تحميل الملخص التنفيذي** من `GET /api/admin-sentinel-brief` …\n\nسيُعرض ملخص المبيعات والأمن والتوصية هنا فور جاهزية البيانات، دون الحاجة لإرسال سؤالك أولاً.';

type SubscriptionHealthShape = {
  paymentFailureRadar?: {
    windowDays?: number;
    queryError?: string | null;
    failedPaymentsTotal?: number;
    distinctBarbersWithFailure?: number;
    recurringFailureBarbers?: { barberId: string; failedCount: number; barberName: string }[];
    recurringThreshold?: number;
    description?: string;
  };
  stuckFormsRadar?: {
    windowHours?: number;
    registrationQueryError?: string | null;
    interestSignups24h?: number | null;
    interestQueryError?: string | null;
    pendingPartnerSubmissions?: number;
    totalSubmissionsScanned24h?: number;
    samplePending?: { id: string; createdAt: string; label: string }[];
    description?: string;
  };
  supabaseLatency?: {
    roundTripMs?: number;
    ok?: boolean;
    pingError?: string | null;
    measuredAt?: string;
    description?: string;
  };
};

type RecruitmentAlertItem = {
  districtName: string;
  cityName: string | null;
  searchCount24h: number;
  approximateBarbers: number;
  label: string;
};

type BriefShape = {
  executiveSummary?: {
    salesLine?: string;
    securityLine?: string;
    revenueRecommendation?: string;
    searchDemandLine?: string;
    recruitmentAlertsLine?: string;
  };
  searchDemand?: {
    windowHours?: number;
    logsScanned24h?: number;
    queryError?: string | null;
    topDistricts24h?: { districtName: string; searchCount: number; topCity: string | null }[];
    topCitiesNoDistrict24h?: { cityName: string; searchCount: number }[];
    recruitmentAlerts?: RecruitmentAlertItem[];
    barberMatchNote?: string;
  };
  dataSources?: Record<string, string>;
  sales?: Record<string, unknown>;
  security?: Record<string, unknown>;
  chatCompliance?: Record<string, unknown>;
  salesAuditor?: { missedUpgradeOpportunities?: { barberId: string; name: string; totalReviews: number }[] };
  geo?: { hotspotsByBarberCount?: { city: string; barberCount: number }[] };
  subscriptionHealth?: SubscriptionHealthShape;
};

export default function AdminSentinelPage() {
  const location = useLocation();
  const [brief, setBrief] = useState<BriefShape | null>(null);
  const [briefRaw, setBriefRaw] = useState<Record<string, unknown> | null>(null);
  const [briefLoading, setBriefLoading] = useState(true);
  const [openAiDiag, setOpenAiDiag] = useState<SentinelOpenAiDiagnostics | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>(() => [
    { role: 'assistant', content: BRIEF_LOADING_ASSISTANT },
  ]);
  const [input, setInput] = useState('');
  const [chatting, setChatting] = useState(false);

  const [opsType, setOpsType] = useState('flag_tier_review');
  const [opsDetail, setOpsDetail] = useState('{\n  "barberId": "",\n  "note": ""\n}');
  const [opsPassword, setOpsPassword] = useState('');
  const [opsBusy, setOpsBusy] = useState(false);

  const loadBrief = useCallback(async () => {
    setBriefLoading(true);
    const [r, diag] = await Promise.all([fetchAdminSentinelBrief(), fetchAdminSentinelOpenAiDiagnostics()]);
    setBriefLoading(false);
    if (diag.ok) setOpenAiDiag(diag.body);
    else setOpenAiDiag({ openaiConfigured: false, model: undefined });
    if (!r.ok) {
      toast.error(r.error);
      setMessages([
        {
          role: 'assistant',
          content: `**تعذر تحميل الملخص التنفيذي.**\n\n${r.error}\n\nتحقق من الجلسة وصلاحية \`view_command_center\` ورأس واجهة Sentinel.`,
        },
      ]);
      return;
    }
    const j = r.json as BriefShape & Record<string, unknown>;
    setBrief(j);
    setBriefRaw(r.json);
  }, []);

  useEffect(() => {
    void loadBrief();
  }, [loadBrief]);

  const openingAssistant = useMemo(() => {
    if (!brief?.executiveSummary) return '';
    const es = brief.executiveSummary;
    const lines = [
      '## ملخص تنفيذي — الوكيل المراقب العام',
      '',
      `**المبيعات:** ${es.salesLine ?? '—'}`,
      '',
      `**الحالة الأمنية:** ${es.securityLine ?? '—'}`,
      '',
      `**البحث والطلب (24س):** ${es.searchDemandLine ?? '—'}`,
      '',
      ...(es.recruitmentAlertsLine
        ? [`**تنبيهات استقطاب عاجلة:** ${es.recruitmentAlertsLine}`, '']
        : []),
      `**توصية إدارية:** ${es.revenueRecommendation ?? '—'}`,
      '',
      'يمكنك طرح أسئلة تحليلية أو طلب تفسير للأرقام أعلاه. العمليات الحساسة تتم عبر قسم «عمليات موثقة» مع كلمة مرور العمليات.',
    ];
    return lines.join('\n');
  }, [brief]);

  useEffect(() => {
    if (!openingAssistant || !brief?.executiveSummary) return;
    setMessages((prev) => {
      const placeholder =
        prev.length === 1 &&
        prev[0].role === 'assistant' &&
        prev[0].content.includes('admin-sentinel-brief');
      if (placeholder) return [{ role: 'assistant', content: openingAssistant }];
      return prev;
    });
  }, [brief, openingAssistant]);

  const sendChat = async () => {
    const t = input.trim();
    if (!t || chatting) return;
    const prev = messages;
    const next: ChatTurn[] = [...prev, { role: 'user', content: t }];
    setInput('');
    setMessages(next);
    setChatting(true);
    const r = await postAdminSentinelChat(next, briefRaw);
    setChatting(false);
    if (!r.ok) {
      toast.error(r.error);
      setMessages(prev);
      return;
    }
    setMessages([...next, { role: 'assistant', content: r.reply }]);
  };

  const runSovereign = async () => {
    let detail: Record<string, unknown> = {};
    try {
      detail = JSON.parse(opsDetail || '{}') as Record<string, unknown>;
    } catch {
      toast.error('تفاصيل JSON غير صالحة.');
      return;
    }
    if (!opsPassword.trim()) {
      toast.error('أدخل كلمة مرور العمليات.');
      return;
    }
    setOpsBusy(true);
    const r = await postAdminSentinelSovereignAction({
      actionType: opsType,
      detail,
      opsPassword,
    });
    setOpsBusy(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success('تم تسجيل العملية في سجل الإدارة.');
    setOpsPassword('');
  };

  const sh = brief?.subscriptionHealth;

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 font-sans ${TXT} antialiased [text-rendering:optimizeLegibility]`}
      dir="rtl"
    >
      <div className="border-b border-slate-700/80 bg-slate-950/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/25 flex items-center justify-center ring-1 ring-white/20">
              <Sparkles className={`h-5 w-5 ${TXT}`} />
            </div>
            <div className="min-w-0">
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${TXT}`}>الوكيل المراقب العام</h1>
              <p className={`mt-1 text-sm sm:text-[15px] leading-relaxed font-medium ${TXT}`}>
                منظومة تحليل وبيع وأمن — بوابة IP + MFA عبر الخادم
                {openAiDiag != null && (
                  <span className="mr-2 inline-block">
                    {' · '}
                    <span className={`font-bold ${TXT}`}>
                      {openAiDiag.openaiConfigured
                        ? `OpenAI: جاهز (${openAiDiag.model ?? 'gpt-4o'})`
                        : 'OpenAI: غير جاهز — أضف OPENAI_API_KEY على Vercel أو راجع صلاحية الوصول لـ GET /api/admin-sentinel-chat'}
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className={`shrink-0 border-white/40 bg-slate-900/90 ${TXT} hover:bg-slate-800 text-sm sm:text-[15px] min-h-11 px-4 font-bold`}
            asChild
          >
            <Link to={getAdminDashboardPathFor(location.pathname)}>
              لوحة التحكم
              <ArrowRight className={`h-4 w-4 mr-2 rotate-180 ${TXT}`} />
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {(brief?.searchDemand?.recruitmentAlerts ?? []).length > 0 ? (
          <Card className="bg-amber-950/50 border-amber-500/60 shadow-xl shadow-black/30">
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${TXT}`}>
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-amber-400" />
                تنبيهات استقطاب عاجلة
              </CardTitle>
              <CardDescription className={`text-sm sm:text-[15px] leading-relaxed font-medium text-amber-100/95`}>
                {brief?.searchDemand?.barberMatchNote ??
                  'بحث مرتفع في حي مع تطابق ضعيف للحلاقين في بيانات العنوان — راجع الملخص وراء الكواليس.'}
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-2 text-sm sm:text-[15px] font-bold ${TXT}`}>
              {(brief?.searchDemand?.recruitmentAlerts ?? []).map((a, i) => (
                <div
                  key={`${a.districtName}-${i}`}
                  className="rounded-lg border border-amber-500/40 bg-slate-950/50 px-3 py-2.5 flex flex-wrap gap-x-3 gap-y-1 justify-between items-baseline"
                >
                  <span>
                    {a.label}: {a.districtName}
                    {a.cityName ? ` — ${a.cityName}` : ''}
                  </span>
                  <span className="tabular-nums text-amber-200/95">
                    بحث {a.searchCount24h} / حلاق ≈{a.approximateBarbers}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {/* Subscription Health — بيانات حية من admin-sentinel-brief */}
        <Card className="bg-slate-900/80 border-white/20 shadow-xl shadow-black/30">
          <CardHeader>
            <CardTitle className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${TXT}`}>
              <Activity className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 ${TXT}`} />
              Subscription Health (صحة تراخيص الإدراج والمسارات)
            </CardTitle>
            <CardDescription className={`text-sm sm:text-[15px] leading-relaxed font-medium ${TXT}`}>
              رادار فشل الدفع، النماذج العالقة خلال 24 ساعة، وزمن استجابة Supabase — يُحدَّث عند كل تحميل للصفحة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {briefLoading ? (
              <div className={`flex items-center gap-2 text-base font-bold ${TXT}`}>
                <Loader2 className="h-5 w-5 animate-spin shrink-0" /> جاري تحميل مؤشرات الصحة…
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
                <div className={`rounded-xl border border-white/15 bg-slate-950/60 p-4 space-y-2 ${TXT}`}>
                  <p className="text-base sm:text-lg font-bold">رادار فشل الدفع</p>
                  <p className={`text-sm sm:text-[15px] leading-relaxed font-medium ${TXT}`}>
                    {sh?.paymentFailureRadar?.description ?? '—'}
                  </p>
                  {sh?.paymentFailureRadar?.queryError ? (
                    <p className={`text-sm font-bold ${TXT}`}>خطأ استعلام: {sh.paymentFailureRadar.queryError}</p>
                  ) : null}
                  <ul className={`text-sm sm:text-[15px] space-y-1.5 font-bold ${TXT} list-disc list-inside`}>
                    <li>فشل خلال {sh?.paymentFailureRadar?.windowDays ?? 30} يوماً: {sh?.paymentFailureRadar?.failedPaymentsTotal ?? 0}</li>
                    <li>حلاقون واجهوا فشلاً: {sh?.paymentFailureRadar?.distinctBarbersWithFailure ?? 0}</li>
                    <li>
                      متكرر (≥{sh?.paymentFailureRadar?.recurringThreshold ?? 2}):{' '}
                      {(sh?.paymentFailureRadar?.recurringFailureBarbers ?? []).length}
                    </li>
                  </ul>
                  {(sh?.paymentFailureRadar?.recurringFailureBarbers ?? []).length > 0 ? (
                    <div className={`mt-2 text-xs sm:text-sm space-y-1 font-bold ${TXT} max-h-32 overflow-auto`}>
                      {(sh?.paymentFailureRadar?.recurringFailureBarbers ?? []).slice(0, 6).map((r) => (
                        <div key={r.barberId}>
                          {r.barberName} — {r.failedCount} فشل
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className={`rounded-xl border border-white/15 bg-slate-950/60 p-4 space-y-2 ${TXT}`}>
                  <p className="text-base sm:text-lg font-bold">رادار النماذج العالقة</p>
                  <p className={`text-sm sm:text-[15px] leading-relaxed font-medium ${TXT}`}>
                    {sh?.stuckFormsRadar?.description ?? '—'}
                  </p>
                  {sh?.stuckFormsRadar?.registrationQueryError ? (
                    <p className={`text-sm font-bold ${TXT}`}>خطأ استعلام: {sh.stuckFormsRadar.registrationQueryError}</p>
                  ) : null}
                  <ul className={`text-sm sm:text-[15px] space-y-1.5 font-bold ${TXT} list-disc list-inside`}>
                    <li>
                      طلبات معلّقة (آخر {sh?.stuckFormsRadar?.windowHours ?? 24} ساعة):{' '}
                      {sh?.stuckFormsRadar?.pendingPartnerSubmissions ?? 0}
                    </li>
                    <li>إجمالي مسح الطلبات: {sh?.stuckFormsRadar?.totalSubmissionsScanned24h ?? 0}</li>
                    <li>
                      اهتمام شركاء (24س):{' '}
                      {sh?.stuckFormsRadar?.interestSignups24h == null ? '—' : sh.stuckFormsRadar.interestSignups24h}
                    </li>
                  </ul>
                  {(sh?.stuckFormsRadar?.samplePending ?? []).length > 0 ? (
                    <div className={`mt-2 text-xs sm:text-sm space-y-1 font-bold ${TXT} max-h-28 overflow-auto`}>
                      {(sh?.stuckFormsRadar?.samplePending ?? []).map((s) => (
                        <div key={s.id} className="truncate" title={s.label}>
                          {s.label}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className={`rounded-xl border border-white/15 bg-slate-950/60 p-4 space-y-2 ${TXT}`}>
                  <p className="text-base sm:text-lg font-bold">سرعة الاستجابة (Supabase)</p>
                  <p className={`text-sm sm:text-[15px] leading-relaxed font-medium ${TXT}`}>
                    {sh?.supabaseLatency?.description ?? '—'}
                  </p>
                  <ul className={`text-sm sm:text-[15px] space-y-1.5 font-bold ${TXT} list-disc list-inside`}>
                    <li>زمن الذهاب والإياب: {sh?.supabaseLatency?.roundTripMs ?? '—'} ms</li>
                    <li>الحالة: {sh?.supabaseLatency?.ok === false ? 'خطأ' : 'نجاح'}</li>
                    <li className="break-all text-xs sm:text-sm opacity-95">
                      {sh?.supabaseLatency?.measuredAt ? `قياس: ${sh.supabaseLatency.measuredAt}` : ''}
                    </li>
                  </ul>
                  {sh?.supabaseLatency?.pingError ? (
                    <p className={`text-sm font-bold ${TXT}`}>خطأ ping: {sh.supabaseLatency.pingError}</p>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-900/80 border-white/15 shadow-lg shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className={`text-base sm:text-lg font-bold flex items-center gap-2 ${TXT}`}>
                <Bot className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${TXT}`} /> مصادر البيانات
              </CardTitle>
              <CardDescription className={`text-sm leading-relaxed font-bold ${TXT}`}>ربط المخطط المنطقي بالجداول</CardDescription>
            </CardHeader>
            <CardContent className={`text-sm sm:text-[15px] leading-relaxed space-y-2 max-h-44 overflow-auto font-bold ${TXT}`}>
              {brief?.dataSources
                ? Object.entries(brief.dataSources).map(([k, v]) => (
                    <div key={k}>
                      <span className={TXT}>{k}</span>
                      <span className={TXT}>: {v}</span>
                    </div>
                  ))
                : briefLoading
                  ? '…'
                  : '—'}
            </CardContent>
          </Card>
          <Card className="bg-slate-900/80 border-white/15 md:col-span-2 shadow-lg shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className={`text-base sm:text-lg font-bold flex items-center gap-2 ${TXT}`}>
                <Shield className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${TXT}`} /> الرقابة المالية والمبيعات
              </CardTitle>
              <CardDescription className={`text-sm leading-relaxed font-bold ${TXT}`}>
                تتبع الريال (مكتمل / معلق / مسترد) + فرص ترقية باقات
              </CardDescription>
            </CardHeader>
            <CardContent className={`text-base sm:text-[17px] leading-relaxed space-y-3 font-bold ${TXT}`}>
              {briefLoading ? (
                <div className={`flex items-center gap-2 text-base ${TXT}`}>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" /> جاري تحميل الملخص…
                </div>
              ) : (
                <>
                  <p className={TXT}>{brief?.executiveSummary?.salesLine}</p>
                  <p className={`text-sm sm:text-[15px] leading-relaxed font-bold ${TXT}`}>
                    فرص بيع ضائعة (عيّنة):{' '}
                    {(brief?.salesAuditor?.missedUpgradeOpportunities ?? []).slice(0, 5).map((b) => b.name).join('، ') ||
                      'لا شيء في العيّنة الحالية'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-slate-900/80 border-white/15 flex flex-col min-h-[min(420px,70dvh)] shadow-lg shadow-black/20">
            <CardHeader>
              <CardTitle className={`text-lg sm:text-xl font-bold ${TXT}`}>محادثة الوكيل (GPT-4o)</CardTitle>
              <CardDescription className={`text-sm sm:text-[15px] leading-relaxed font-bold ${TXT}`}>
                يُرسل للنموذج ملخص JSON من الخادم — لا تُرسل روابط أو أرقام في رسائلك لتجاوز الفحص الآلي.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
              <ScrollArea className="flex-1 min-h-[min(240px,45dvh)] sm:min-h-[280px] rounded-md border border-white/15 p-3 sm:p-4 bg-slate-950/70">
                <div className="space-y-4 sm:space-y-5 pr-1 sm:pr-2">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 text-[15px] sm:text-base leading-[1.85] sm:leading-[1.9] whitespace-pre-wrap font-bold ${TXT} ${
                        m.role === 'user'
                          ? 'bg-teal-950/60 border border-white/20 mr-4 sm:mr-8 shadow-sm'
                          : 'bg-slate-800/95 border border-white/20 ml-4 sm:ml-8 shadow-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  {chatting && (
                    <div className={`flex items-center gap-2 text-[15px] sm:text-base font-bold ${TXT}`}>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" /> جاري الرد…
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="سؤالك للوكيل…"
                  className={`min-h-[80px] sm:min-h-[88px] bg-slate-950 border-white/25 text-[16px] sm:text-[15px] leading-relaxed font-bold ${TXT} placeholder:text-white/55`}
                  disabled={chatting || briefLoading}
                />
                <Button
                  type="button"
                  className="self-stretch sm:self-end shrink-0 min-h-11 text-[15px] sm:text-base font-bold"
                  onClick={() => void sendChat()}
                  disabled={chatting || briefLoading || !input.trim()}
                >
                  <Send className="h-4 w-4 ml-2" />
                  إرسال
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 sm:space-y-5">
            <Card className="bg-slate-900/80 border-white/15 shadow-lg shadow-black/20">
              <CardHeader>
                <CardTitle className={`text-lg sm:text-xl font-bold ${TXT}`}>التحليل المكاني</CardTitle>
                <CardDescription className={`text-sm leading-relaxed font-bold ${TXT}`}>كثافة الحلاقين حسب المدينة</CardDescription>
              </CardHeader>
              <CardContent className={`text-sm sm:text-[15px] leading-relaxed space-y-2.5 font-bold ${TXT}`}>
                {(brief?.geo?.hotspotsByBarberCount ?? []).slice(0, 8).map((h) => (
                  <div
                    key={h.city}
                    className="flex justify-between gap-3 items-baseline border-b border-white/15 pb-2 last:border-0 last:pb-0"
                  >
                    <span className={TXT}>{h.city}</span>
                    <span className={`tabular-nums ${TXT}`}>{h.barberCount}</span>
                  </div>
                ))}
                {!briefLoading && !(brief?.geo?.hotspotsByBarberCount ?? []).length ? (
                  <p className={`font-bold ${TXT}`}>لا بيانات مدن.</p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-white/25 shadow-lg shadow-black/20">
              <CardHeader>
                <CardTitle className={`text-lg sm:text-xl font-bold ${TXT}`}>عمليات موثقة</CardTitle>
                <CardDescription className={`text-sm leading-relaxed font-bold ${TXT}`}>
                  تتطلب صلاحية manage_command_center + كلمة مرور الخادم ADMIN_SENTINEL_OPS_PASSWORD. تُسجّل في
                  admin_actions_log.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={`text-sm sm:text-[15px] font-bold ${TXT}`}>نوع العملية</Label>
                  <Select value={opsType} onValueChange={setOpsType}>
                    <SelectTrigger className={`bg-slate-950 border-white/25 text-[15px] sm:text-base min-h-11 font-bold ${TXT}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flag_tier_review">مراجعة ترقية باقة</SelectItem>
                      <SelectItem value="alert_barber">تنبيه حلاق (سجل فقط)</SelectItem>
                      <SelectItem value="security_note">ملاحظة أمنية</SelectItem>
                      <SelectItem value="noop">اختبار السجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={`text-sm sm:text-[15px] font-bold ${TXT}`}>تفاصيل (JSON)</Label>
                  <Textarea
                    value={opsDetail}
                    onChange={(e) => setOpsDetail(e.target.value)}
                    className={`font-mono text-[14px] sm:text-sm min-h-[120px] bg-slate-950 border-white/25 leading-relaxed font-bold ${TXT}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={`text-sm sm:text-[15px] font-bold ${TXT}`}>كلمة مرور العمليات</Label>
                  <Input
                    type="password"
                    value={opsPassword}
                    onChange={(e) => setOpsPassword(e.target.value)}
                    className={`bg-slate-950 border-white/25 min-h-11 text-[16px] sm:text-[15px] font-bold ${TXT}`}
                    autoComplete="off"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full min-h-11 text-[15px] sm:text-base font-bold"
                  disabled={opsBusy}
                  onClick={() => void runSovereign()}
                >
                  {opsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تنفيذ وتسجيل'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
