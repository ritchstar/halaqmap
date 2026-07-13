import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  adminIssueBronzeTrialCodesRemote,
  adminListBronzeTrialCodesRemote,
  type BronzeTrialCodeRow,
} from '@/lib/bronzeTrialRemote';

type Props = {
  accessToken: string;
};

export function BronzeTrialCodesPanel({ accessToken }: Props) {
  const [count, setCount] = useState(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastCodes, setLastCodes] = useState<string[]>([]);
  const [rows, setRows] = useState<BronzeTrialCodeRow[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const refreshList = useCallback(async () => {
    setListLoading(true);
    const res = await adminListBronzeTrialCodesRemote({ accessToken });
    setListLoading(false);
    if (res.ok) setRows(res.rows);
  }, [accessToken]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const onGenerate = async () => {
    setLoading(true);
    const res = await adminIssueBronzeTrialCodesRemote({
      accessToken,
      count,
      note: note.trim() || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setLastCodes(res.codes);
    toast.success(`تم توليد ${res.count} كود تجربة — انسخها الآن`);
    void refreshList();
  };

  const copyAll = async () => {
    if (!lastCodes.length) return;
    try {
      await navigator.clipboard.writeText(lastCodes.join('\n'));
      toast.success('نُسخت الأكواد');
    } catch {
      toast.error('تعذّر النسخ');
    }
  };

  return (
    <Card className="border-amber-500/30">
      <CardHeader>
        <CardTitle>مولّد أكواد تجربة برونزي (30 يوماً)</CardTitle>
        <CardDescription>
          كل كود لمرة واحدة فقط (`HM-TRY-…`). يُدخل في صفحة الدفع بعد اختيار البرونزي — لا يمس مسار ميسر.
          انسخ الأكواد فور توليدها؛ القاعدة تخزّن بصمة فقط.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="trial-count">عدد الأكواد (1–50)</Label>
            <Input
              id="trial-count"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trial-note">ملاحظة داخلية (اختياري)</Label>
            <Input
              id="trial-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="حملة إكس — دفعة أبريل"
            />
          </div>
        </div>
        <Button type="button" onClick={() => void onGenerate()} disabled={loading}>
          {loading ? 'جاري التوليد…' : 'توليد أكواد'}
        </Button>

        {lastCodes.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">آخر دفعة مولَّدة</p>
              <Button type="button" size="sm" variant="outline" onClick={() => void copyAll()}>
                نسخ الكل
              </Button>
            </div>
            <Textarea value={lastCodes.join('\n')} readOnly rows={Math.min(12, lastCodes.length + 1)} dir="ltr" className="font-mono text-xs" />
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">آخر 40 سجلاً</p>
            <Button type="button" size="sm" variant="ghost" onClick={() => void refreshList()} disabled={listLoading}>
              تحديث
            </Button>
          </div>
          <div className="max-h-56 overflow-auto rounded-md border border-border text-xs">
            <table className="w-full text-right">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="p-2">الحالة</th>
                  <th className="p-2">أُنشئ</th>
                  <th className="p-2">استُهلك</th>
                  <th className="p-2">طلب</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="p-2">{r.status}</td>
                    <td className="p-2" dir="ltr">
                      {r.created_at?.slice(0, 16) ?? '—'}
                    </td>
                    <td className="p-2" dir="ltr">
                      {r.redeemed_at?.slice(0, 16) ?? '—'}
                    </td>
                    <td className="p-2 font-mono" dir="ltr">
                      {r.redeemed_registration_request_id ?? '—'}
                    </td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td colSpan={4} className="p-3 text-muted-foreground">
                      لا سجلات بعد.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
