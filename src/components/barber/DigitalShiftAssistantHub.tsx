import { useCallback, useEffect, useState } from 'react';
import { Loader2, Moon, RefreshCw, Send, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import {
  DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME,
  DIGITAL_SHIFT_GREETING_PROMPT,
  DIGITAL_SHIFT_PRODUCT_TITLE,
  DIGITAL_SHIFT_REPLY_DELAY_MINUTES,
} from '@/config/digitalShiftAssistant';
import { DigitalShiftRecommendationsTable } from '@/components/barber/DigitalShiftRecommendationsTable';
import type { BarberPlatformBannerState } from '@/lib/barberDashboardLocalState';
import type { Post } from '@/lib';
import {
  digitalShiftBarberChatRemote,
  dismissDigitalShiftRecommendationRemote,
  fetchDigitalShiftSummaryRemote,
  refreshDigitalShiftRecommendationsRemote,
  updateDigitalShiftSettingsRemote,
  type DigitalShiftRecommendation,
  type DigitalShiftSummary,
} from '@/lib/digitalShiftAssistantRemote';

type ChatTurn = { role: 'user' | 'assistant'; content: string };

export function DigitalShiftAssistantHub({
  barberId,
  barberEmail,
  bannerState,
  posts,
}: {
  barberId: string;
  barberEmail: string;
  bannerState: BarberPlatformBannerState;
  posts: Post[];
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<DigitalShiftSummary | null>(null);
  const [assistantName, setAssistantName] = useState(DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME);
  const [enabled, setEnabled] = useState(true);
  const [replyDelayMinutes, setReplyDelayMinutes] = useState(DIGITAL_SHIFT_REPLY_DELAY_MINUTES);
  const [recommendations, setRecommendations] = useState<DigitalShiftRecommendation[]>([]);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [chatSending, setChatSending] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    const r = await fetchDigitalShiftSummaryRemote({ barberId, email: barberEmail });
    setLoading(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setSummary(r.data);
    setRecommendations(r.data.recommendations ?? []);
    if (r.data.config) {
      setAssistantName(r.data.config.assistant_display_name || DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME);
      setEnabled(r.data.config.enabled !== false);
      setReplyDelayMinutes(r.data.config.reply_delay_minutes ?? DIGITAL_SHIFT_REPLY_DELAY_MINUTES);
    }
  }, [barberId, barberEmail]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const refreshInsights = async () => {
    setRefreshing(true);
    const galleryItems = posts.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      imageUrl: p.images?.[0],
    }));
    const r = await refreshDigitalShiftRecommendationsRemote({
      barberId,
      email: barberEmail,
      bannerImageUrls: bannerState.bannerImageUrls,
      showDiscountBadge: bannerState.showDiscountBadge,
      discountPercent: bannerState.discountPercent,
      galleryItems,
    });
    setRefreshing(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setRecommendations(r.recommendations);
    toast.success('تم تحديث طاولة التوصيات');
    void loadSummary();
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const r = await updateDigitalShiftSettingsRemote({
      barberId,
      email: barberEmail,
      assistantDisplayName: assistantName.trim() || DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME,
      enabled,
      replyDelayMinutes,
    });
    setSavingSettings(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success('تم حفظ إعدادات المناوب');
    void loadSummary();
  };

  const dismissRecommendation = async (recommendationId: string) => {
    setDismissingId(recommendationId);
    const r = await dismissDigitalShiftRecommendationRemote({ barberId, email: barberEmail, recommendationId });
    setDismissingId(null);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setRecommendations((prev) => prev.filter((x) => x.id !== recommendationId));
  };

  const sendBarberChat = async () => {
    const text = chatDraft.trim();
    if (!text) return;
    setChatSending(true);
    const nextHistory: ChatTurn[] = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(nextHistory);
    setChatDraft('');
    const r = await digitalShiftBarberChatRemote({
      barberId,
      email: barberEmail,
      message: text,
      history: nextHistory.slice(0, -1),
    });
    setChatSending(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setChatHistory([...nextHistory, { role: 'assistant', content: r.reply }]);
  };

  const walletSar = summary?.wallet ? (summary.wallet.balance_halalas / 100).toFixed(2) : '—';
  const spentSar = summary?.wallet ? (summary.wallet.total_spent_halalas / 100).toFixed(2) : '—';

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        جاري تحميل المناوب الرقمي…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Moon className="h-6 w-6 text-indigo-600" />
            {DIGITAL_SHIFT_PRODUCT_TITLE}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            مناوب ذكي من <strong>حلاق ماب</strong> — يراقب الرصيد، يدقق البنرات والمعرض، ويتولى المحادثات عند الإغلاق أو
            التأخير ({replyDelayMinutes} دقائق).
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" disabled={refreshing} onClick={() => void refreshInsights()}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          تحديث طاولة التوصيات
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardDescription>رصيد محفظة المناوب</CardDescription>
            <CardTitle className="text-2xl">{walletSar} ر.س</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            إجمالي المصروف: {spentSar} ر.س · أيام الإدراج: {summary?.context.listingDaysRemaining ?? '—'}
          </CardContent>
        </Card>
        <Card className="border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardDescription>حالة المحل</CardDescription>
            <CardTitle className="text-lg">{summary?.context.shopOpen ? 'مفتوح 🟢' : 'مغلق 🌙'}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {summary?.context.shopOpen
              ? 'المناوب يتدخل بعد مهلة التأخير فقط.'
              : 'المناوب يتولى 100% من الردود الآن.'}
          </CardContent>
        </Card>
        <Card className="border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardDescription>اسم المناوب أمام العملاء</CardDescription>
            <CardTitle className="text-lg truncate">{assistantName}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'مفعّل' : 'موقوف'}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">إعدادات المناوب</CardTitle>
          <CardDescription>خصّص الاسم وفعّل/أوقف المناوبة الذكية.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shift-name">اسم المناوب (يظهر للعملاء)</Label>
              <Input
                id="shift-name"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder={DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME}
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-delay">مهلة التأخير (دقائق)</Label>
              <Input
                id="shift-delay"
                type="number"
                min={1}
                max={30}
                value={replyDelayMinutes}
                onChange={(e) => setReplyDelayMinutes(Number(e.target.value) || DIGITAL_SHIFT_REPLY_DELAY_MINUTES)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <div>
              <p className="text-sm font-medium">تفعيل المناوب الرقمي</p>
              <p className="text-xs text-muted-foreground">إيقافه يوقف الردود الآلية فوراً.</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <Button type="button" disabled={savingSettings} onClick={() => void saveSettings()}>
            {savingSettings ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
            حفظ الإعدادات
          </Button>
        </CardContent>
      </Card>

      <DigitalShiftRecommendationsTable
        recommendations={recommendations}
        onDismiss={(id) => void dismissRecommendation(id)}
        dismissingId={dismissingId}
      />

      <Card className="border-violet-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-violet-600" />
            محادثة مع المناوب (لوحة الحلاق)
          </CardTitle>
          <CardDescription>{DIGITAL_SHIFT_GREETING_PROMPT}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
            {chatHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                يا عمنا تفضل — اكتب مهام اليوم أو اسأل عن الرصيد والبنرات.
              </p>
            ) : (
              chatHistory.map((turn, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    turn.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-background border border-border/50 mr-8'
                  }`}
                >
                  {turn.content}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              placeholder="وش مهام اليوم يا عمنا؟"
              rows={2}
              className="resize-none"
            />
            <Button type="button" size="icon" className="shrink-0 self-end" disabled={chatSending} onClick={() => void sendBarberChat()}>
              {chatSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
