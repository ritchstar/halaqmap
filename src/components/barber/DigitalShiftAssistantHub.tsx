import { useCallback, useEffect, useState } from 'react';
import { Loader2, Moon, RefreshCw, Send, Sparkles, Wallet } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
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
  DIGITAL_SHIFT_PRODUCT_SUBTITLE_AR,
  DIGITAL_SHIFT_PRODUCT_TITLE,
  DIGITAL_SHIFT_REPLY_DELAY_MINUTES,
  DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR,
} from '@/config/digitalShiftAssistant';
import { WALLET_TOPUP_PACKAGES, repliesFromHalalas } from '@/config/digitalShiftWalletTopup';
import { usePlatformVatConfigRemote } from '@/hooks/usePlatformVatConfigRemote';
import { openHashRouteInNewTab } from '@/components/barber/BarberDashboardOutboundLink';
import { consumeDigitalShiftScrollTarget } from '@/components/barber/DigitalShiftQuickAccessStrip';
import { DigitalShiftFeatureBullets } from '@/components/billing/DigitalShiftFeatureBullets';
import { DigitalShiftRecommendationsTable } from '@/components/barber/DigitalShiftRecommendationsTable';
import { DigitalShiftPrivateOffice } from '@/components/barber/DigitalShiftPrivateOffice';
import type { BarberPlatformBannerState } from '@/lib/barberDashboardLocalState';
import type { Post } from '@/lib';
import { buildSalonSnapshotPayload } from '@/lib/digitalShiftSalonSnapshot';
import {
  digitalShiftBarberChatRemote,
  dismissDigitalShiftRecommendationRemote,
  fetchDigitalShiftSummaryRemote,
  refreshDigitalShiftRecommendationsRemote,
  updateDigitalShiftSettingsRemote,
  type DigitalShiftRecommendation,
  type DigitalShiftSummary,
} from '@/lib/digitalShiftAssistantRemote';

function formatWalletTxLabel(reason: string): string {
  const r = reason.trim();
  if (r.startsWith('wallet_topup_clawback:')) return 'سحب شحن بعد استرجاع ميسر';
  if (r.startsWith('wallet_topup:')) return 'شحن محفظة';
  if (r.startsWith('wallet_drain_recovery:')) return 'استرداد خصم يتيم';
  if (r.endsWith(':refund')) return 'استرداد رد فاشل';
  if (r.startsWith('shift_reply:')) return 'رد مناوب على عميل';
  return 'حركة محفظة';
}

function formatWalletTxWhen(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
}

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
  const [enabled, setEnabled] = useState(false);
  const [replyDelayMinutes, setReplyDelayMinutes] = useState(DIGITAL_SHIFT_REPLY_DELAY_MINUTES);
  const [recommendations, setRecommendations] = useState<DigitalShiftRecommendation[]>([]);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [chatSending, setChatSending] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const vatSettings = usePlatformVatConfigRemote();

  const goWalletTopup = useCallback(
    (walletSku: string) => {
      const q = new URLSearchParams();
      q.set('purpose', 'wallet_topup');
      q.set('walletSku', walletSku);
      if (barberId) q.set('linkedBarberId', barberId);
      if (barberEmail) q.set('buyerEmail', barberEmail);
      const name = summary?.context.barberName?.trim();
      if (name) q.set('barberName', name);
      const relative = `${ROUTE_PATHS.PAYMENT}?${q.toString()}`;
      if (!openHashRouteInNewTab(relative)) {
        toast.info('لم يُفتح تبويب الدفع — اسمح بالنوافذ المنبثقة للموقع ثم أعد المحاولة.');
      }
    },
    [barberId, barberEmail, summary],
  );

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
      setEnabled(r.data.config.enabled === true);
      setReplyDelayMinutes(r.data.config.reply_delay_minutes ?? DIGITAL_SHIFT_REPLY_DELAY_MINUTES);
    }
  }, [barberId, barberEmail]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (loading) return;
    const target = consumeDigitalShiftScrollTarget();
    if (!target) return;
    const elementId =
      target === 'private-office' ? 'digital-shift-private-office' : 'digital-shift-settings';
    window.requestAnimationFrame(() => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [loading]);

  const refreshInsights = async () => {
    setRefreshing(true);
    const r = await refreshDigitalShiftRecommendationsRemote({
      barberId,
      email: barberEmail,
      ...buildSalonSnapshotPayload(bannerState, posts),
      forceBannerVision: true,
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
      ...buildSalonSnapshotPayload(bannerState, posts),
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
  const walletReplies = summary?.wallet ? repliesFromHalalas(summary.wallet.balance_halalas) : null;
  const walletLowBalance =
    summary?.wallet != null &&
    summary.wallet.balance_halalas < (summary.wallet.low_balance_threshold_halalas || 0);

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
          <p className="mt-1 text-xs font-medium text-indigo-600/90">{DIGITAL_SHIFT_PRODUCT_SUBTITLE_AR}</p>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            مناوب ذكي من <strong>حلاق ماب</strong> — يراقب الرصيد، يدقق البنرات والمعرض، ويتولى المحادثات عند الإغلاق أو
            التأخير ({replyDelayMinutes} دقائق). {DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" disabled={refreshing} onClick={() => void refreshInsights()}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          تحديث طاولة التوصيات
        </Button>
      </div>

      <Card className="border-indigo-500/15 bg-indigo-500/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            مزايا الإضافة البرمجية — الشات متعدد اللغات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DigitalShiftFeatureBullets />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={walletLowBalance ? 'border-amber-500/40' : 'border-indigo-500/20'}>
          <CardHeader className="pb-2">
            <CardDescription>رصيد محفظة المناوب</CardDescription>
            <CardTitle className="text-2xl">
              {walletReplies != null ? `${walletReplies} رد` : '—'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              الرصيد: {walletSar} ر.س · المصروف: {spentSar} ر.س
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {walletLowBalance ? (
              <p className="text-xs font-medium text-amber-600">
                الرصيد منخفض — اشحن لتفادي توقّف المناوب.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {WALLET_TOPUP_PACKAGES.map((pkg) => (
                <Button
                  key={pkg.sku}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 px-2 text-xs"
                  onClick={() => goWalletTopup(pkg.sku)}
                >
                  <Wallet className="h-3.5 w-3.5" />
                  {pkg.baseSar} ر.س
                </Button>
              ))}
            </div>
            <p className="text-[0.65rem] text-muted-foreground">
              {vatSettings.enabled
                ? `الأسعار قبل الضريبة · تُضاف ضريبة القيمة المضافة ${vatSettings.ratePercent}% عند الدفع · كل رد ≈ 1.50 ر.س`
                : 'الأسعار نهائية بلا ضريبة حالياً · كل رد ≈ 1.50 ر.س'}
            </p>
            {(summary?.walletTransactions?.length ?? 0) > 0 ? (
              <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
                <p className="text-[0.65rem] font-semibold text-muted-foreground">آخر الحركات</p>
                <ul className="max-h-36 space-y-1 overflow-y-auto text-[0.65rem]">
                  {summary!.walletTransactions!.slice(0, 12).map((tx) => {
                    const sar = (tx.amount_halalas / 100).toFixed(2);
                    const sign = tx.direction === 'debit' ? '−' : '+';
                    return (
                      <li key={tx.id} className="flex items-start justify-between gap-2">
                        <span className="text-muted-foreground">{formatWalletTxWhen(tx.created_at)}</span>
                        <span className="text-start">
                          <span className={tx.direction === 'debit' ? 'text-rose-600' : 'text-emerald-600'}>
                            {sign}
                            {sar} ر.س
                          </span>
                          <span className="block text-muted-foreground">{formatWalletTxLabel(tx.reason)}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
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

      <Card id="digital-shift-settings">
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

      {/* ══ المكتب الخاص — الصندوق الفاخر ══ */}
      <DigitalShiftPrivateOffice
        barberId={barberId}
        barberEmail={barberEmail}
        barberName={summary?.context.barberName ?? 'الصالون'}
        assistantName={assistantName}
        listingDaysRemaining={summary?.context.listingDaysRemaining ?? 0}
        bannerState={bannerState}
        posts={posts}
      />
    </div>
  );
}
