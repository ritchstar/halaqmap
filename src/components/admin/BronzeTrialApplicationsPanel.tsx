import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  adminBronzeTrialApplicationActionRemote,
  adminListBronzeTrialApplicationsRemote,
  type BronzeTrialApplicationRow,
} from '@/lib/bronzeTrialApplicationsAdminRemote';

type Props = { accessToken: string };

const STATUS_AR: Record<string, string> = {
  pending_email: 'بانتظار تأكيد البريد',
  pending_review: 'قيد المراجعة',
  approved: 'موافق عليه',
  rejected: 'مرفوض',
  cancelled: 'ملغى',
};

export function BronzeTrialApplicationsPanel({ accessToken }: Props) {
  const [rows, setRows] = useState<BronzeTrialApplicationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending_review');
  const [selected, setSelected] = useState<BronzeTrialApplicationRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await adminListBronzeTrialApplicationsRemote({
      accessToken,
      status: filter || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRows(res.rows);
  }, [accessToken, filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const act = async (
    action: 'approve' | 'reject' | 'resend_code' | 'resend_confirm',
    row: BronzeTrialApplicationRow,
  ) => {
    setBusyId(row.id);
    const res = await adminBronzeTrialApplicationActionRemote({
      accessToken,
      action,
      applicationId: row.id,
      reason: rejectReason,
    });
    setBusyId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (res.plaintextCode) {
      setLastCode(res.plaintextCode);
      toast.success('تم — انسخ الكود إن ظهر أدناه');
    } else {
      toast.success('تم تنفيذ الإجراء');
    }
    void refresh();
  };

  return (
    <Card className="border-sky-500/30">
      <CardHeader>
        <CardTitle>طابور طلبات التجربة البرونزية</CardTitle>
        <CardDescription>
          طلبات التقييم فقط — لا تسجّل حساباً. عند الموافقة يُرسل كود مربوط بنفس الإيميل.
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
              <option value="pending_email">بانتظار تأكيد البريد</option>
              <option value="approved">موافق</option>
              <option value="rejected">مرفوض</option>
              <option value="">الكل</option>
            </select>
          </div>
          <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
            تحديث
          </Button>
        </div>

        {lastCode ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
            <p className="text-sm font-semibold">آخر كود صادر — انسخه الآن</p>
            <Textarea value={lastCode} readOnly dir="ltr" className="font-mono text-sm" rows={2} />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void navigator.clipboard.writeText(lastCode)}
            >
              نسخ
            </Button>
          </div>
        ) : null}

        <div className="max-h-[28rem] overflow-auto rounded-md border text-sm">
          <table className="w-full text-right">
            <thead className="sticky top-0 bg-muted/60">
              <tr>
                <th className="p-2">الحالة</th>
                <th className="p-2">الصالون</th>
                <th className="p-2">البريد</th>
                <th className="p-2">المدينة</th>
                <th className="p-2">تاريخ</th>
                <th className="p-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/50 align-top">
                  <td className="p-2">
                    <Badge variant="secondary">{STATUS_AR[r.status] || r.status}</Badge>
                  </td>
                  <td className="p-2">
                    <button type="button" className="text-primary underline" onClick={() => setSelected(r)}>
                      {r.salon_name}
                    </button>
                  </td>
                  <td className="p-2 font-mono text-xs" dir="ltr">
                    {r.email}
                  </td>
                  <td className="p-2">
                    {r.city_ar} / {r.district_ar}
                  </td>
                  <td className="p-2 text-xs" dir="ltr">
                    {r.created_at?.slice(0, 16)}
                  </td>
                  <td className="p-2 space-y-1">
                    {r.status === 'pending_review' ? (
                      <>
                        <Button
                          size="sm"
                          disabled={busyId === r.id}
                          onClick={() => void act('approve', r)}
                        >
                          موافقة + إرسال كود
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === r.id}
                          onClick={() => void act('reject', r)}
                        >
                          رفض
                        </Button>
                      </>
                    ) : null}
                    {r.status === 'pending_email' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.id}
                        onClick={() => void act('resend_confirm', r)}
                      >
                        إعادة تأكيد البريد
                      </Button>
                    ) : null}
                    {r.status === 'approved' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === r.id}
                        onClick={() => void act('resend_code', r)}
                      >
                        إعادة إرسال الكود
                      </Button>
                    ) : null}
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

        {selected ? (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex justify-between gap-2">
              <h3 className="font-semibold">{selected.salon_name}</h3>
              <Button type="button" size="sm" variant="ghost" onClick={() => setSelected(null)}>
                إغلاق
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{selected.establishment_name}</p>
            <p className="text-sm" dir="ltr">
              {selected.phone} · WA {selected.whatsapp}
            </p>
            <p className="text-sm" dir="ltr">
              {selected.latitude}, {selected.longitude}
            </p>
            <a
              className="text-sm text-primary underline"
              href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              فتح الموقع تجريبياً على الخريطة
            </a>
            {selected.notes ? <p className="text-sm whitespace-pre-wrap">{selected.notes}</p> : null}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                selected.photo_exterior_sign_url,
                selected.photo_exterior_2_url,
                selected.photo_interior_1_url,
                selected.photo_interior_2_url,
              ].map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="" className="h-24 w-full rounded object-cover border" />
                </a>
              ))}
            </div>
            <div className="space-y-1">
              <Label>سبب الرفض (عند الرفض)</Label>
              <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
