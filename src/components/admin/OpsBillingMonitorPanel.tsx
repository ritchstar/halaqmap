import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createManualOpsBillingCommitment,
  fetchOpsBillingMonitor,
  triggerOpsBillingSync,
  type OpsBillingCommitmentRow,
} from '@/lib/opsBillingMonitorRemote';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ExternalLink, Landmark, Loader2, RefreshCw } from 'lucide-react';
import { OpsBillingAiAssistant } from '@/components/admin/OpsBillingAiAssistant';
import {
  consolidateOpsBillingGaps,
  consolidateOpsBillingRows,
  formatLastSyncDisplay,
  formatMonthlyDisplay,
  formatRenewalDisplay,
  formatStatusBadge,
  portalUrlFromRow,
  summarizeDisplayRows,
} from '@/lib/opsBillingDisplay';
import { Badge } from '@/components/ui/badge';

const GODADDY_SUBSCRIPTIONS_DEFAULT =
  'https://account.godaddy.com/subscriptions?plid=1';

/** إعدادات النطاق في محفظة GoDaddy (halaqmap.com) — يُستبدل بـ VITE_OPS_GODADDY_DOMAIN_SETTINGS_URL */
const GODADDY_DOMAIN_PORTFOLIO_DEFAULT =
  'https://dcc.godaddy.com/control/portfolio/halaqmap.com/settings?ventureId=890d73b2-7783-4597-9e73-6f20a36c9968&ua_placement=shared_header';

const OPENAI_BILLING_DEFAULT =
  'https://platform.openai.com/settings/organization/billing/overview';

const RESEND_BILLING_DEFAULT = 'https://resend.com/settings/billing';

/** لوحة مشروع Supabase — يُستبدل بـ VITE_OPS_SUPABASE_DASHBOARD_URL عند الحاجة */
const SUPABASE_PROJECT_DASHBOARD_DEFAULT =
  'https://supabase.com/dashboard/project/lqzuhkzfhdhaosstduas';

/** فوترة فريق Vercel — يُستبدل بـ VITE_OPS_VERCEL_BILLING_URL عند الحاجة */
const VERCEL_TEAM_BILLING_DEFAULT = 'https://vercel.com/halaqmap/~/settings/billing';

function opsSupabaseDashboardUrl(): string {
  const u = (import.meta.env.VITE_OPS_SUPABASE_DASHBOARD_URL as string | undefined)?.trim();
  return u || SUPABASE_PROJECT_DASHBOARD_DEFAULT;
}

function opsVercelBillingUrl(): string {
  const u = (import.meta.env.VITE_OPS_VERCEL_BILLING_URL as string | undefined)?.trim();
  return u || VERCEL_TEAM_BILLING_DEFAULT;
}

function opsGodaddyDomainSettingsUrl(): string {
  const u = (import.meta.env.VITE_OPS_GODADDY_DOMAIN_SETTINGS_URL as string | undefined)?.trim();
  return u || GODADDY_DOMAIN_PORTFOLIO_DEFAULT;
}

function portalLinkLabelForVendor(vendor: string): string {
  const v = vendor.toLowerCase();
  if (v === 'godaddy') return 'لوحة GoDaddy';
  if (v === 'openai') return 'لوحة OpenAI';
  if (v === 'vercel') return 'لوحة Vercel';
  if (v === 'supabase_mgmt' || v === 'supabase') return 'لوحة Supabase';
  if (v === 'resend') return 'لوحة Resend';
  return 'فتح الرابط';
}

function formatCountdownAr(ms: number | null): string {
  if (ms === null) return 'غير متاح بعد';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  if (d > 0) return `${d} يوم و ${h} ساعة`;
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h} ساعة و ${m} دقيقة`;
}

type Props = {
  /** مزامنة، إضافة يدوية، تعديلات عبر API — تتطلب manage_centralized_billing_ops */
  canMutate: boolean;
};

export function OpsBillingMonitorPanel({ canMutate }: Props) {
  const mounted = useRef(true);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [rows, setRows] = useState<OpsBillingCommitmentRow[]>([]);
  const [poll, setPoll] = useState<Record<string, unknown> | null>(null);
  const [manualLabel, setManualLabel] = useState('');
  const [manualMonthly, setManualMonthly] = useState('');
  const [manualRenewal, setManualRenewal] = useState('');

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchOpsBillingMonitor();
      if (!mounted.current) return;
      if (r.ok === false) {
        toast({ title: 'تعذر التحميل', description: r.error, variant: 'destructive' });
        return;
      }
      setRows(r.commitments);
      setPoll(r.poll);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSync = async () => {
    if (!canMutate) return;
    setSyncing(true);
    try {
      const r = await triggerOpsBillingSync();
      if (r.ok === false) {
        toast({ title: 'فشلت المزامنة', description: r.error, variant: 'destructive' });
        return;
      }
      toast({
        title: 'تمت المزامنة',
        description:
          'Vercel وSupabase حسب المفاتيح، وGoDaddy وOpenAI وResend كصفوف مرجعية (روابط + لقطات حتى ربط API).',
      });
      await refresh();
    } finally {
      setSyncing(false);
    }
  };

  const onAddManual = async () => {
    if (!canMutate) return;
    const label = manualLabel.trim();
    if (!label) {
      toast({ title: 'أدخل اسم الخدمة', variant: 'destructive' });
      return;
    }
    const m = parseFloat(manualMonthly.replace(',', '.'));
    const r = await createManualOpsBillingCommitment({
      display_label: label,
      monthly_estimate_sar: Number.isFinite(m) ? m : undefined,
      next_renewal_at: manualRenewal.trim() || undefined,
    });
    if (r.ok === false) {
      toast({ title: 'فشل الإضافة', description: r.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تمت إضافة التزام يدوي' });
    setManualLabel('');
    setManualMonthly('');
    setManualRenewal('');
    await refresh();
  };

  const displayRows = useMemo(() => consolidateOpsBillingRows(rows), [rows]);
  const displayGaps = useMemo(() => consolidateOpsBillingGaps(displayRows), [displayRows]);
  const displaySummary = useMemo(() => summarizeDisplayRows(displayRows), [displayRows]);

  const lastPoll = useMemo(() => {
    const f = poll?.last_poll_finished_at;
    return typeof f === 'string' ? f : null;
  }, [poll]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Centralized Billing &amp; Ops Monitor
          </CardTitle>
          <CardDescription>
            مزامنة أولية مع Vercel وSupabase؛ صفوف GoDaddy وOpenAI مرجعية (روابط ولقطات فوترة)؛ تنبيهات النقص — يُنصح
            بصلاحية عرض للفريق وصلاحية مزامنة للسوبر فقط.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">بوابات التشغيل (فوترة ومشروع):</span>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Supabase — لوحة المشروع:</span>
            <a
              href={opsSupabaseDashboardUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline break-all"
            >
              {opsSupabaseDashboardUrl()}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Vercel — فوترة الفريق:</span>
            <a
              href={opsVercelBillingUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline break-all"
            >
              {opsVercelBillingUrl()}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <span className="text-xs text-muted-foreground">(الخطة، الاستخدام، الفواتير، حد الإنفاق)</span>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">GoDaddy — إعدادات النطاق (halaqmap.com):</span>
            <a
              href={opsGodaddyDomainSettingsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline break-all"
            >
              {opsGodaddyDomainSettingsUrl()}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <span className="text-xs text-muted-foreground">(المحفظة — تجديد، DNS، قفل النطاق)</span>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">GoDaddy — تجديد النطاق:</span>
            <a
              href={GODADDY_SUBSCRIPTIONS_DEFAULT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline break-all"
            >
              {GODADDY_SUBSCRIPTIONS_DEFAULT}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <span className="text-xs text-muted-foreground">(يُحدَّث في الصفوف بعد «مزامنة الآن»)</span>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">OpenAI — فوترة المنظّمة:</span>
            <a
              href={OPENAI_BILLING_DEFAULT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline break-all"
            >
              {OPENAI_BILLING_DEFAULT}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <span className="text-xs text-muted-foreground">(Pay as you go — لقطة الرصيد بعد المزامنة)</span>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Resend — الفوترة:</span>
            <a
              href={RESEND_BILLING_DEFAULT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline break-all"
            >
              {RESEND_BILLING_DEFAULT}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <span className="text-xs text-muted-foreground">(خطط مجانية حتى الترقية — يُحدَّث بعد المزامنة)</span>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <OpsBillingAiAssistant canMutate={canMutate} onApplied={() => void refresh()} />
            <Button type="button" variant="secondary" disabled={loading || syncing} onClick={() => void refresh()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="mr-2">تحديث العرض</span>
            </Button>
            <Button type="button" disabled={syncing || loading || !canMutate} onClick={() => void onSync()}>
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span className={syncing ? 'mr-2' : ''}>مزامنة الآن (+ GoDaddy مرجعي)</span>
            </Button>
            {lastPoll && (
              <span className="text-sm text-muted-foreground">آخر استطلاع: {new Date(lastPoll).toLocaleString('ar-SA')}</span>
            )}
          </div>

          {displaySummary && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="text-sm text-muted-foreground">أقرب موعد تجديد (معروف)</div>
                <div className="text-lg font-semibold mt-1">
                  {displaySummary.nearestRenewalAt
                    ? new Date(displaySummary.nearestRenewalAt).toLocaleString('ar-SA')
                    : 'تأكيد يدوي'}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  العد التنازلي: {formatCountdownAr(displaySummary.countdownMs)}
                </div>
              </div>
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="text-sm text-muted-foreground">إجمالي التقدير الشهري (ر.س)</div>
                <div className="text-2xl font-bold mt-1">{displaySummary.monthlyEstimateSarTotal.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-2">يُحسب من الصفوف المُجمَّعة بعد دمج المزوّدين.</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {displayGaps.length > 0 && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>يتطلب إكمال بيانات ({displayGaps.length})</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pr-5 mt-2 space-y-1 text-sm">
              {displayGaps.map((g) => (
                <li key={String(g.displayKey ?? g.id)}>
                  <strong>{String(g.display_label || '')}</strong> — {String(g.data_gap_message || g.data_gap_kind || '')}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card className={!canMutate ? 'border-muted' : ''}>
        <CardHeader>
          <CardTitle className="text-base">إضافة التزام يدوي (بدون API)</CardTitle>
          <CardDescription>مثال: نطاق GoDaddy، ترخيص برمجي، عقد دعم… — يتطلب صلاحية المزامنة (سوبر أدمن).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div className="space-y-2">
            <Label>اسم الخدمة</Label>
            <Input
              value={manualLabel}
              onChange={(e) => setManualLabel(e.target.value)}
              placeholder="مثال: استضافة النطاق"
              disabled={!canMutate}
            />
          </div>
          <div className="space-y-2">
            <Label>تقدير شهري (ر.س)</Label>
            <Input value={manualMonthly} onChange={(e) => setManualMonthly(e.target.value)} placeholder="0" disabled={!canMutate} />
          </div>
          <div className="space-y-2">
            <Label>تاريخ التجديد القادم</Label>
            <Input
              type="datetime-local"
              value={manualRenewal}
              onChange={(e) => setManualRenewal(e.target.value)}
              disabled={!canMutate}
            />
          </div>
          <Button type="button" onClick={() => void onAddManual()} disabled={!canMutate}>
            إضافة
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">جدول التزامات</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : displayRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا صفوف بعد — نفّذ «مزامنة الآن» أو أضف التزامات يدوية.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-right">
                  <th className="p-2">المزوّد</th>
                  <th className="p-2">التسمية</th>
                  <th className="p-2">رابط</th>
                  <th className="p-2">التجديد</th>
                  <th className="p-2">شهري (ر.س / USD)</th>
                  <th className="p-2">آخر مزامنة</th>
                  <th className="p-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r) => {
                  const portal = portalUrlFromRow(r);
                  const vendorStr = String(r.vendor ?? '');
                  const renewal = formatRenewalDisplay(r);
                  const monthly = formatMonthlyDisplay(r);
                  const status = formatStatusBadge(r);
                  const rowKey = String(r.displayKey ?? r.id);
                  return (
                  <tr key={rowKey} className="border-b border-muted/50 align-top">
                    <td className="p-2 font-mono text-xs">{vendorStr}</td>
                    <td className="p-2">
                      <div>{String(r.display_label)}</div>
                      {r.consolidated && r.consolidatedChildCount ? (
                        <span className="text-[10px] text-muted-foreground">
                          {r.consolidatedChildCount} صفوف مدمجة
                        </span>
                      ) : null}
                    </td>
                    <td className="p-2 max-w-[140px]">
                      {portal ? (
                        <a
                          href={portal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-primary text-xs underline-offset-2 hover:underline truncate"
                          title={portal}
                        >
                          {portalLinkLabelForVendor(vendorStr)}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">تأكيد يدوي</span>
                      )}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <span
                        className={
                          renewal.tone === 'amber'
                            ? 'text-amber-700 dark:text-amber-300 text-xs font-medium'
                            : renewal.tone === 'muted'
                              ? 'text-muted-foreground text-xs italic'
                              : ''
                        }
                      >
                        {renewal.text}
                      </span>
                    </td>
                    <td className="p-2">
                      <div
                        className={
                          monthly.tone === 'amber'
                            ? 'text-amber-700 dark:text-amber-300 text-xs font-medium'
                            : monthly.tone === 'muted'
                              ? 'text-muted-foreground text-xs italic'
                              : monthly.tone === 'cached'
                                ? 'text-foreground text-sm'
                                : ''
                        }
                      >
                        {monthly.text}
                      </div>
                      {monthly.hint ? (
                        <div className="text-[10px] text-muted-foreground mt-0.5">{monthly.hint}</div>
                      ) : null}
                    </td>
                    <td className="p-2 whitespace-nowrap text-xs text-muted-foreground">
                      {formatLastSyncDisplay(r)}
                    </td>
                    <td className="p-2">
                      <Badge
                        variant="outline"
                        title={status.title}
                        className={
                          status.tone === 'ok'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 text-[10px]'
                            : status.tone === 'amber'
                              ? 'border-amber-500/45 bg-amber-500/15 text-amber-900 dark:text-amber-100 text-[10px]'
                              : 'text-[10px] text-muted-foreground'
                        }
                      >
                        {status.label}
                      </Badge>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
