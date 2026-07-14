import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  adminAmbassadorApplicationActionRemote,
  adminListAmbassadorApplicationsRemote,
  ambassadorAdminErrorAr,
  type AmbassadorApplicationAdminRow,
} from '@/lib/ambassadorApplicationsRemote';

type Props = { accessToken: string };

const STATUS_AR: Record<string, string> = {
  pending_review: 'قيد المراجعة',
  provisional: 'تفعيل مؤقت',
  active: 'معتمد',
  rejected: 'مرفوض',
  suspended: 'موقوف',
  closed: 'مغلق',
};

export function AmbassadorApplicationsPanel({ accessToken }: Props) {
  const [rows, setRows] = useState<AmbassadorApplicationAdminRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending_review');
  const [selected, setSelected] = useState<AmbassadorApplicationAdminRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await adminListAmbassadorApplicationsRemote({
      accessToken,
      status: filter || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(ambassadorAdminErrorAr(res.error));
      return;
    }
    setRows(res.rows);
    setSelected((prev) => {
      if (!prev) return null;
      return res.rows.find((r) => r.id === prev.id) ?? null;
    });
  }, [accessToken, filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openRow = (row: AmbassadorApplicationAdminRow) => {
    setRejectReason(row.reject_reason || '');
    setSelected(row);
  };

  const act = async (action: 'approve' | 'reject', row: AmbassadorApplicationAdminRow) => {
    if (action === 'reject' && rejectReason.trim().length < 4) {
      toast.error('اكتب سبب الرفض قبل التنفيذ');
      return;
    }
    setBusyId(row.id);
    const res = await adminAmbassadorApplicationActionRemote({
      accessToken,
      action,
      applicationId: row.id,
      reason: rejectReason,
    });
    setBusyId(null);
    if (!res.ok) {
      toast.error(ambassadorAdminErrorAr(res.error));
      return;
    }
    toast.success(action === 'approve' ? 'تم القبول → تفعيل مؤقت' : 'تم رفض الطلب');
    setSelected(null);
    void refresh();
  };

  return (
    <Card className="border-teal-500/35">
      <CardHeader>
        <CardTitle>طابور طلبات السفراء الميدانيين</CardTitle>
        <CardDescription>
          قبول المراجعة يحوّل الحساب إلى «تفعيل مؤقت» (استهداف صالونات فقط). مسار فنادق/أكريليك يُفتح بعد أول
          إغلاق صالون — وطلب البنرات الأكريليك تملؤه المنشأة بنفسها.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label>تصفية الحالة</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="pending_review">قيد المراجعة</option>
              <option value="provisional">تفعيل مؤقت</option>
              <option value="active">معتمد</option>
              <option value="rejected">مرفوض</option>
              <option value="">الكل</option>
            </select>
          </div>
          <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
            تحديث
          </Button>
        </div>

        <div className="max-h-[28rem] overflow-auto rounded-md border text-sm">
          <table className="w-full text-right">
            <thead className="sticky top-0 bg-muted/60">
              <tr>
                <th className="p-2">الحالة</th>
                <th className="p-2">الاسم</th>
                <th className="p-2">الجوال</th>
                <th className="p-2">النطاق</th>
                <th className="p-2">تاريخ</th>
                <th className="p-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/50 align-top">
                  <td className="p-2">
                    <Badge variant="secondary">{STATUS_AR[r.account_status] || r.account_status}</Badge>
                  </td>
                  <td className="p-2 font-medium">{r.display_name}</td>
                  <td className="p-2 font-mono text-xs" dir="ltr">
                    {r.phone}
                  </td>
                  <td className="p-2 max-w-[12rem] truncate" title={r.coverage_area || ''}>
                    {r.coverage_area || '—'}
                  </td>
                  <td className="p-2 text-xs" dir="ltr">
                    {(r.application_submitted_at || r.created_at)?.slice(0, 16)}
                  </td>
                  <td className="p-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => openRow(r)}>
                      معاينة
                    </Button>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={6} className="p-4 text-muted-foreground">
                    لا طلبات في هذا التصفية.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Dialog
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          <DialogContent
            className="max-h-[92vh] max-w-3xl overflow-y-auto border-teal-500/30 bg-background p-0 sm:rounded-xl"
            dir="rtl"
          >
            {selected ? (
              <>
                <DialogHeader className="space-y-2 border-b border-border px-6 py-5 text-right">
                  <div className="flex flex-wrap items-center justify-between gap-2 pe-8">
                    <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
                      <Handshake className="h-5 w-5 text-teal-600" />
                      {selected.display_name}
                    </DialogTitle>
                    <Badge variant="secondary">
                      {STATUS_AR[selected.account_status] || selected.account_status}
                    </Badge>
                  </div>
                  <DialogDescription className="text-base text-foreground/80">
                    كود السفير:{' '}
                    <span className="font-mono font-semibold" dir="ltr">
                      {selected.code}
                    </span>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 px-6 py-5 text-sm">
                  <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">الجوال</p>
                      <p className="text-base font-mono" dir="ltr">
                        {selected.phone}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">البريد</p>
                      <p className="text-base" dir="ltr">
                        {selected.email || '—'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">النطاق الجغرافي</p>
                      <p className="text-base leading-relaxed">{selected.coverage_area || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">خبرة / جدية المبيعات</p>
                      <p className="whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-base leading-relaxed">
                        {selected.sales_experience || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">تاريخ التقديم</p>
                      <p dir="ltr">
                        {(selected.application_submitted_at || selected.created_at)
                          ?.slice(0, 19)
                          .replace('T', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">نسخة القواعد</p>
                      <p dir="ltr">{selected.rules_version_accepted || '—'}</p>
                    </div>
                    {selected.social_proof_url ? (
                      <div className="sm:col-span-2">
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">إثبات اجتماعي (رابط)</p>
                        <a
                          className="inline-flex items-center gap-1 break-all text-primary underline"
                          href={selected.social_proof_url}
                          target="_blank"
                          rel="noreferrer"
                          dir="ltr"
                        >
                          {selected.social_proof_url}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      </div>
                    ) : null}
                    {selected.social_proof_path ? (
                      <div className="sm:col-span-2">
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">ملف إثبات (اسم)</p>
                        <p className="font-mono text-xs" dir="ltr">
                          {selected.social_proof_path}
                        </p>
                      </div>
                    ) : null}
                    {selected.reject_reason ? (
                      <div className="sm:col-span-2">
                        <p className="mb-1 text-xs font-semibold text-rose-700">سبب الرفض</p>
                        <p className="text-base text-rose-800">{selected.reject_reason}</p>
                      </div>
                    ) : null}
                    {selected.reviewed_by_admin_email ? (
                      <div className="sm:col-span-2 text-xs text-muted-foreground">
                        راجعه {selected.reviewed_by_admin_email}
                        {selected.reviewed_at
                          ? ` · ${selected.reviewed_at.slice(0, 19).replace('T', ' ')}`
                          : ''}
                      </div>
                    ) : null}
                  </div>

                  {selected.account_status === 'pending_review' ? (
                    <div className="space-y-2">
                      <Label htmlFor="amb-reject-reason">سبب الرفض (إلزامي عند الرفض)</Label>
                      <Textarea
                        id="amb-reject-reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="مثال: النطاق غير واضح / لا تظهر جدية ميدانية…"
                      />
                    </div>
                  ) : null}
                </div>

                <DialogFooter className="flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-start">
                  {selected.account_status === 'pending_review' ? (
                    <>
                      <Button
                        disabled={busyId === selected.id}
                        onClick={() => void act('approve', selected)}
                      >
                        قبول → تفعيل مؤقت
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={busyId === selected.id}
                        onClick={() => void act('reject', selected)}
                      >
                        رفض الطلب
                      </Button>
                    </>
                  ) : null}
                  <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                    إغلاق
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
