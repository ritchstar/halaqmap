import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ENTERPRISE_ANCHOR_UI,
  adminActivateEnterpriseSeatRemote,
  adminAssignEnterpriseSeatRemote,
  adminLoadEnterpriseCohortRemote,
  adminRevokeEnterpriseSeatRemote,
  enterpriseCohortAdminErrorAr,
  type EnterpriseCohortSummary,
  type EnterpriseSeatSummary,
  type HqSeatReport,
} from '@/lib/enterpriseCohortAdminRemote';

type Props = {
  accessToken: string;
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    reserved: 'bg-slate-500/15 text-slate-700 border-slate-300',
    assigned: 'bg-sky-500/15 text-sky-800 border-sky-300',
    activated: 'bg-emerald-500/15 text-emerald-800 border-emerald-300',
    expired: 'bg-amber-500/15 text-amber-900 border-amber-300',
    revoked: 'bg-rose-500/15 text-rose-800 border-rose-300',
  };
  const labels: Record<string, string> = {
    reserved: 'محجوز',
    assigned: 'مربوط',
    activated: 'مفعّل',
    expired: 'منتهٍ',
    revoked: 'ملغى',
  };
  return (
    <Badge variant="outline" className={map[status] || ''}>
      {labels[status] || status}
    </Badge>
  );
}

export function EnterpriseAnchorCohortPanel({ accessToken }: Props) {
  const [cohort, setCohort] = useState<EnterpriseCohortSummary | null>(null);
  const [seats, setSeats] = useState<EnterpriseSeatSummary[]>([]);
  const [hqSeats, setHqSeats] = useState<HqSeatReport[]>([]);
  const [hqSummary, setHqSummary] = useState<{
    reserved: number;
    assigned: number;
    activated: number;
    expired: number;
    revoked: number;
    expiringSoon: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [editSeatId, setEditSeatId] = useState<string | null>(null);
  const [branchLabel, setBranchLabel] = useState('');
  const [boundEmail, setBoundEmail] = useState('');
  const [barberId, setBarberId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setPanelError(null);
    const [overview, hq] = await Promise.all([
      adminLoadEnterpriseCohortRemote({ accessToken, view: 'overview' }),
      adminLoadEnterpriseCohortRemote({ accessToken, view: 'hq' }),
    ]);
    setLoading(false);

    if (!overview.ok) {
      setPanelError(enterpriseCohortAdminErrorAr(overview.error));
      return;
    }
    setCohort(overview.cohort);
    setSeats(overview.seats ?? []);

    if (hq.ok) {
      setHqSeats(hq.hqSeats ?? []);
      setHqSummary(hq.summary ?? null);
    }
  }, [accessToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const beginEdit = (seat: EnterpriseSeatSummary) => {
    setEditSeatId(seat.id);
    setBranchLabel(seat.branch_label || `فرع ${seat.seat_index}`);
    setBoundEmail(seat.bound_email || '');
    setBarberId(seat.barber_id || '');
  };

  const onAssign = async () => {
    if (!editSeatId) return;
    setActionLoading(true);
    const res = await adminAssignEnterpriseSeatRemote({
      accessToken,
      seatId: editSeatId,
      boundEmail: boundEmail.trim() || undefined,
      branchLabel: branchLabel.trim() || undefined,
    });
    setActionLoading(false);
    if (!res.ok) {
      toast.error(enterpriseCohortAdminErrorAr(res.error));
      return;
    }
    toast.success('تم ربط المقعد');
    void refresh();
  };

  const onActivate = async () => {
    if (!editSeatId || !barberId.trim()) {
      toast.error('أدخل معرّف الحلاق (UUID) للتفعيل');
      return;
    }
    setActionLoading(true);
    const res = await adminActivateEnterpriseSeatRemote({
      accessToken,
      seatId: editSeatId,
      barberId: barberId.trim(),
      requireEmailMatch: Boolean(boundEmail.trim()),
    });
    setActionLoading(false);
    if (!res.ok) {
      toast.error(enterpriseCohortAdminErrorAr(res.error));
      return;
    }
    toast.success(
      `تم تفعيل المقعد — ماسي ${res.listingDaysGranted ?? ENTERPRISE_ANCHOR_UI.days} يوماً حتى ${res.validUntil ? new Date(res.validUntil).toLocaleDateString('ar-SA') : '—'}`,
    );
    void refresh();
  };

  const onRevoke = async (seatId: string) => {
    if (!window.confirm('إلغاء المقعد يسحب صلاحية الإدراج ويوقف المناوب لهذا الفرع. متابعة؟')) return;
    setActionLoading(true);
    const res = await adminRevokeEnterpriseSeatRemote({
      accessToken,
      seatId,
      reason: 'admin_revoke',
    });
    setActionLoading(false);
    if (!res.ok) {
      toast.error(enterpriseCohortAdminErrorAr(res.error));
      return;
    }
    toast.success('تم إلغاء المقعد');
    if (editSeatId === seatId) setEditSeatId(null);
    void refresh();
  };

  return (
    <Card className="border-violet-500/35">
      <CardHeader>
        <CardTitle>الشريك المرجعي — {ENTERPRISE_ANCHOR_UI.nameAr}</CardTitle>
        <CardDescription className="space-y-2 leading-relaxed">
          <p>
            {ENTERPRISE_ANCHOR_UI.seats} مقعداً مستقلاً × ماسي + مكتب خاص × {ENTERPRISE_ANCHOR_UI.days}{' '}
            يوماً من تفعيل كل فرع. ائتمان محفظة تشغيلي{' '}
            {ENTERPRISE_ANCHOR_UI.walletSeedSar} ر.س لكل مقعد عند التفعيل. لا حساب مشترك ولا محفظة مشتركة.
          </p>
          <p className="text-xs text-muted-foreground">
            التحويل بعد التجربة: عرض فردي أو مجمع قبل الانتهاء — بلا تمديد صامت. قصة النجاح التسويقية
            مغلقة افتراضياً حتى موافقة مكتوبة.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {panelError ? (
          <Alert variant="destructive">
            <AlertDescription className="text-sm leading-relaxed">{panelError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm md:grid-cols-3">
          <div>
            <p className="font-bold text-foreground">طبقة A (تشغيل)</p>
            <ul className="mt-1 list-disc space-y-1 pe-4 text-muted-foreground">
              {ENTERPRISE_ANCHOR_UI.perksA.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-foreground">طبقة B (منتج)</p>
            <ul className="mt-1 list-disc space-y-1 pe-4 text-muted-foreground">
              {ENTERPRISE_ANCHOR_UI.perksB.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-foreground">طبقة C (مؤجّلة)</p>
            <ul className="mt-1 list-disc space-y-1 pe-4 text-muted-foreground">
              {ENTERPRISE_ANCHOR_UI.perksC.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {hqSummary ? (
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">محجوز {hqSummary.reserved}</Badge>
            <Badge variant="outline">مربوط {hqSummary.assigned}</Badge>
            <Badge variant="outline" className="border-emerald-400 text-emerald-800">
              مفعّل {hqSummary.activated}
            </Badge>
            <Badge variant="outline" className="border-amber-400 text-amber-900">
              ينتهي قريباً {hqSummary.expiringSoon}
            </Badge>
            <Badge variant="outline">منتهٍ {hqSummary.expired}</Badge>
            <Badge variant="outline" className="border-rose-400 text-rose-800">
              ملغى {hqSummary.revoked}
            </Badge>
            <Button type="button" variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
              {loading ? 'جاري التحديث…' : 'تحديث'}
            </Button>
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">المقعد</th>
                <th className="px-3 py-2 text-start font-semibold">الفرع</th>
                <th className="px-3 py-2 text-start font-semibold">البريد</th>
                <th className="px-3 py-2 text-start font-semibold">الحالة</th>
                <th className="px-3 py-2 text-start font-semibold">الانتهاء</th>
                <th className="px-3 py-2 text-start font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {seats.map((seat) => {
                const hq = hqSeats.find((h) => h.seatId === seat.id);
                return (
                  <tr key={seat.id} className="border-t border-border/80">
                    <td className="px-3 py-2 font-mono text-xs">#{seat.seat_index}</td>
                    <td className="px-3 py-2">{seat.branch_label || '—'}</td>
                    <td className="px-3 py-2 text-xs" dir="ltr">{seat.bound_email || '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        {statusBadge(hq?.status || seat.status)}
                        {hq?.expiryWarning ? (
                          <Badge variant="outline" className="border-amber-500 text-amber-800">
                            تنبيه ≤30 يوماً
                          </Badge>
                        ) : null}
                        {hq?.anchorBadge ? (
                          <Badge variant="outline" className="border-violet-400 text-violet-800">
                            شارة
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {hq?.daysRemaining != null
                        ? `${hq.daysRemaining} يوم`
                        : seat.expires_at
                          ? new Date(seat.expires_at).toLocaleDateString('ar-SA')
                          : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <Button type="button" size="sm" variant="secondary" onClick={() => beginEdit(seat)}>
                          إدارة
                        </Button>
                        {seat.status === 'activated' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={actionLoading}
                            onClick={() => void onRevoke(seat.id)}
                          >
                            إلغاء
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!seats.length && !loading && !panelError ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    لا مقاعد — تأكد من تطبيق الهجرة{' '}
                    <code className="rounded bg-muted px-1">143_enterprise_anchor_cohort</code>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {editSeatId ? (
          <div className="space-y-3 rounded-xl border border-violet-400/30 bg-violet-500/5 p-4">
            <p className="text-sm font-bold">إدارة المقعد المحدد</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>اسم الفرع</Label>
                <Input value={branchLabel} onChange={(e) => setBranchLabel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>بريد مربوط (اختياري — إن وُجد يُطابق عند التفعيل)</Label>
                <Input
                  dir="ltr"
                  type="email"
                  value={boundEmail}
                  onChange={(e) => setBoundEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>معرّف الحلاق UUID للتفعيل</Label>
                <Input
                  dir="ltr"
                  value={barberId}
                  onChange={(e) => setBarberId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={actionLoading} onClick={() => void onAssign()}>
                حفظ الربط
              </Button>
              <Button type="button" disabled={actionLoading} onClick={() => void onActivate()}>
                تفعيل المنحة (ماسي + مناوب + بذرة محفظة)
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditSeatId(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-sm font-bold">تقرير HQ (قراءة فقط — بلا محادثات زبائن)</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start">الفرع</th>
                  <th className="px-3 py-2 text-start">الحلاق</th>
                  <th className="px-3 py-2 text-start">المناوب</th>
                  <th className="px-3 py-2 text-start">رصيد المحفظة</th>
                  <th className="px-3 py-2 text-start">تعليمات</th>
                  <th className="px-3 py-2 text-start">أيام متبقية</th>
                </tr>
              </thead>
              <tbody>
                {hqSeats.map((row) => (
                  <tr key={row.seatId} className="border-t border-border/80">
                    <td className="px-3 py-2">
                      #{row.seatIndex} {row.branchLabel || ''}
                    </td>
                    <td className="px-3 py-2">
                      <div>{row.barberName || '—'}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{row.barberEmail || ''}</div>
                    </td>
                    <td className="px-3 py-2">
                      {row.shiftEnabled == null ? '—' : row.shiftEnabled ? 'مفعّل' : 'متوقف'}
                    </td>
                    <td className="px-3 py-2">
                      {row.walletBalanceHalalas == null
                        ? '—'
                        : `${(row.walletBalanceHalalas / 100).toFixed(2)} ر.س`}
                    </td>
                    <td className="px-3 py-2">{row.activeInstructions ?? '—'}</td>
                    <td className="px-3 py-2">
                      {row.daysRemaining == null ? '—' : row.daysRemaining}
                      {row.expiryWarning ? ' ⚠' : ''}
                    </td>
                  </tr>
                ))}
                {!hqSeats.length ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                      لا بيانات تقرير بعد
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {cohort ? (
            <p className="text-xs text-muted-foreground">
              المجموعة: <code>{cohort.slug}</code> · تمويل:{' '}
              {cohort.wallet_funding_policy || ENTERPRISE_ANCHOR_UI.commercial.walletFunding} · تحويل:{' '}
              {cohort.conversion_policy || ENTERPRISE_ANCHOR_UI.commercial.conversion}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
