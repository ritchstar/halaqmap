import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Loader2, Send, Shield, Sparkles, ArrowRight } from 'lucide-react';
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

const BRIEF_LOADING_ASSISTANT =
  '⏳ **جاري تحميل الملخص التنفيذي** من `GET /api/admin-sentinel-brief` …\n\nسيُعرض ملخص المبيعات والأمن والتوصية هنا فور جاهزية البيانات، دون الحاجة لإرسال سؤالك أولاً.';

type BriefShape = {
  executiveSummary?: { salesLine?: string; securityLine?: string; revenueRecommendation?: string };
  dataSources?: Record<string, string>;
  sales?: Record<string, unknown>;
  security?: Record<string, unknown>;
  chatCompliance?: Record<string, unknown>;
  salesAuditor?: { missedUpgradeOpportunities?: { barberId: string; name: string; totalReviews: number }[] };
  geo?: { hotspotsByBarberCount?: { city: string; barberCount: number }[] };
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100" dir="rtl">
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">الوكيل المراقب العام</h1>
              <p className="text-xs text-slate-400">
                منظومة تحليل وبيع وأمن — بوابة IP + MFA عبر الخادم
                {openAiDiag != null && (
                  <span className="mr-2 inline-block">
                    {' · '}
                    {openAiDiag.openaiConfigured ? (
                      <span className="text-emerald-400">OpenAI: جاهز ({openAiDiag.model ?? 'gpt-4o'})</span>
                    ) : (
                      <span className="text-amber-400">
                        OpenAI: غير جاهز — أضف OPENAI_API_KEY على Vercel أو راجع صلاحية الوصول لـ GET /api/admin-sentinel-chat
                      </span>
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-slate-700 text-slate-200" asChild>
            <Link to={getAdminDashboardPathFor(location.pathname)}>
              لوحة التحكم
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4" /> مصادر البيانات
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">ربط المخطط المنطقي بالجداول</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-1 max-h-40 overflow-auto">
              {brief?.dataSources
                ? Object.entries(brief.dataSources).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-300">{k}</span>: {v}
                    </div>
                  ))
                : briefLoading
                  ? '…'
                  : '—'}
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-800 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" /> الرقابة المالية والمبيعات
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">
                تتبع الريال (مكتمل / معلق / مسترد) + فرص ترقية باقات
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              {briefLoading ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري تحميل الملخص…
                </div>
              ) : (
                <>
                  <p>{brief?.executiveSummary?.salesLine}</p>
                  <p className="text-xs text-slate-500">
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
          <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800 flex flex-col min-h-[420px]">
            <CardHeader>
              <CardTitle>محادثة الوكيل (GPT-4o)</CardTitle>
              <CardDescription className="text-slate-500">
                يُرسل للنموذج ملخص JSON من الخادم — لا تُرسل روابط أو أرقام في رسائلك لتجاوز الفحص الآلي.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
              <ScrollArea className="flex-1 min-h-[240px] rounded-md border border-slate-800 p-3 bg-slate-950/50">
                <div className="space-y-4 pr-2">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                        m.role === 'user' ? 'bg-primary/15 mr-8' : 'bg-slate-800/80 ml-8'
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  {chatting && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> جاري الرد…
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="سؤالك للوكيل…"
                  className="min-h-[72px] bg-slate-950 border-slate-800"
                  disabled={chatting || briefLoading}
                />
                <Button
                  type="button"
                  className="self-end shrink-0"
                  onClick={() => void sendChat()}
                  disabled={chatting || briefLoading || !input.trim()}
                >
                  <Send className="h-4 w-4 ml-2" />
                  إرسال
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">التحليل المكاني</CardTitle>
                <CardDescription className="text-slate-500 text-xs">كثافة الحلاقين حسب المدينة</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-1">
                {(brief?.geo?.hotspotsByBarberCount ?? []).slice(0, 8).map((h) => (
                  <div key={h.city} className="flex justify-between gap-2">
                    <span>{h.city}</span>
                    <span className="text-slate-300">{h.barberCount}</span>
                  </div>
                ))}
                {!briefLoading && !(brief?.geo?.hotspotsByBarberCount ?? []).length ? 'لا بيانات مدن.' : null}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-amber-900/40">
              <CardHeader>
                <CardTitle className="text-base text-amber-100">عمليات موثقة</CardTitle>
                <CardDescription className="text-amber-200/70 text-xs">
                  تتطلب صلاحية manage_command_center + كلمة مرور الخادم ADMIN_SENTINEL_OPS_PASSWORD. تُسجّل في
                  admin_actions_log.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">نوع العملية</Label>
                  <Select value={opsType} onValueChange={setOpsType}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
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
                <div className="space-y-1">
                  <Label className="text-xs">تفاصيل (JSON)</Label>
                  <Textarea
                    value={opsDetail}
                    onChange={(e) => setOpsDetail(e.target.value)}
                    className="font-mono text-xs min-h-[100px] bg-slate-950 border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">كلمة مرور العمليات</Label>
                  <Input
                    type="password"
                    value={opsPassword}
                    onChange={(e) => setOpsPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800"
                    autoComplete="off"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
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
