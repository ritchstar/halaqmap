import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteAdminFinancialArchiveDocument,
  fetchAdminFinancialArchive,
  requestAdminFinancialArchiveDownloadUrl,
  uploadAdminFinancialArchiveDocument,
  type AdminFinancialDocumentRow,
} from '@/lib/adminFinancialArchiveRemote';
import { fetchOpsBillingMonitor, type OpsBillingCommitmentRow } from '@/lib/opsBillingMonitorRemote';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Archive, Download, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';

const VENDOR_OPTIONS = [
  { value: 'vercel', label: 'Vercel' },
  { value: 'supabase_mgmt', label: 'Supabase (إدارة)' },
  { value: 'github', label: 'GitHub' },
  { value: 'godaddy', label: 'GoDaddy' },
  { value: 'manual', label: 'يدوي / أخرى مسجّلة' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'resend', label: 'Resend' },
  { value: 'other', label: 'أخرى' },
] as const;

type Props = {
  canManage: boolean;
  /** جلب قائمة التزامات للربط — يتطلب صلاحية مراقبة الفوترة التشغيلية */
  canFetchCommitments: boolean;
};

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—';
  if (n < 1024) return `${n} بايت`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} ك.ب`;
  return `${(n / (1024 * 1024)).toFixed(1)} م.ب`;
}

function shortSha(s: string | null): string {
  if (!s) return '—';
  return s.length > 14 ? `${s.slice(0, 8)}…` : s;
}

export function AdminFinancialArchivePanel({ canManage, canFetchCommitments }: Props) {
  const mounted = useRef(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rows, setRows] = useState<AdminFinancialDocumentRow[]>([]);
  const [commitments, setCommitments] = useState<OpsBillingCommitmentRow[]>([]);

  const [archiveLabel, setArchiveLabel] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendor, setVendor] = useState<string>('vercel');
  const [serviceStart, setServiceStart] = useState('');
  const [serviceEnd, setServiceEnd] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [notes, setNotes] = useState('');
  const [commitmentSelect, setCommitmentSelect] = useState('');
  const [commitmentManualId, setCommitmentManualId] = useState('');
  const [syncCommitment, setSyncCommitment] = useState(false);
  const [nextRenewalLocal, setNextRenewalLocal] = useState('');
  const [monthlyEstimateSar, setMonthlyEstimateSar] = useState('');

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await fetchAdminFinancialArchive();
    if (!mounted.current) return;
    setLoading(false);
    if (!r.ok) {
      toast({ title: 'تعذّر تحميل الأرشيف', description: r.error, variant: 'destructive' });
      return;
    }
    setRows(r.documents);
  }, []);

  const loadCommitments = useCallback(async () => {
    if (!canFetchCommitments) {
      setCommitments([]);
      return;
    }
    const r = await fetchOpsBillingMonitor();
    if (!mounted.current) return;
    if (!r.ok) {
      setCommitments([]);
      return;
    }
    setCommitments(r.commitments);
  }, [canFetchCommitments]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void loadCommitments();
  }, [loadCommitments]);

  const commitmentIdForSubmit = useMemo(() => {
    const manual = commitmentManualId.trim();
    if (manual) return manual;
    return commitmentSelect.trim() || '';
  }, [commitmentManualId, commitmentSelect]);

  const onUpload = async () => {
    const input = fileRef.current;
    const file = input?.files?.[0];
    if (!file) {
      toast({ title: 'اختر ملفاً', description: 'PDF أو صورة (PNG/JPEG/WebP) حتى 15 م.ب.', variant: 'destructive' });
      return;
    }
    const label = archiveLabel.trim();
    if (!label) {
      toast({ title: 'التسمية الأرشيفية مطلوبة', variant: 'destructive' });
      return;
    }
    if (syncCommitment && !commitmentIdForSubmit) {
      toast({ title: 'مزامنة التزام', description: 'اختر التزاماً أو أدخل معرّف UUID.', variant: 'destructive' });
      return;
    }

    const amountNum = amount.trim() === '' ? null : Number(amount.replace(',', '.'));
    if (amount.trim() !== '' && !Number.isFinite(amountNum as number)) {
      toast({ title: 'مبلغ غير صالح', variant: 'destructive' });
      return;
    }

    const monthlyNum =
      monthlyEstimateSar.trim() === '' ? null : Number(monthlyEstimateSar.replace(',', '.'));
    if (monthlyEstimateSar.trim() !== '' && !Number.isFinite(monthlyNum as number)) {
      toast({ title: 'تقدير شهري غير صالح', variant: 'destructive' });
      return;
    }

    let nextRenewalIso: string | null = null;
    if (nextRenewalLocal.trim()) {
      const d = new Date(nextRenewalLocal);
      if (Number.isNaN(d.getTime())) {
        toast({ title: 'تاريخ التجديد غير صالح', variant: 'destructive' });
        return;
      }
      nextRenewalIso = d.toISOString();
    }

    setUploading(true);
    const r = await uploadAdminFinancialArchiveDocument(file, {
      archive_label: label,
      invoice_number: invoiceNumber.trim() || null,
      vendor,
      service_period_start: serviceStart.trim() || null,
      service_period_end: serviceEnd.trim() || null,
      invoice_date: invoiceDate.trim() || null,
      amount: amountNum,
      currency: currency.trim() || 'USD',
      notes: notes.trim() || null,
      commitment_id: commitmentIdForSubmit || null,
      sync_commitment: syncCommitment && Boolean(commitmentIdForSubmit),
      commitment_next_renewal_at: nextRenewalIso,
      commitment_monthly_estimate_sar: monthlyNum,
    });
    setUploading(false);
    if (!r.ok) {
      toast({ title: 'فشل الرفع', description: r.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم الأرشفة', description: 'تم حفظ المستند.' });
    if (input) input.value = '';
    void refresh();
    void loadCommitments();
  };

  const onDownload = async (id: string) => {
    const r = await requestAdminFinancialArchiveDownloadUrl(id);
    if (!r.ok) {
      toast({ title: 'تعذّر التحميل', description: r.error, variant: 'destructive' });
      return;
    }
    window.open(r.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('حذف هذا المستند نهائياً من الأرشيف والتخزين؟')) return;
    const r = await deleteAdminFinancialArchiveDocument(id);
    if (!r.ok) {
      toast({ title: 'تعذّر الحذف', description: r.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم الحذف' });
    void refresh();
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Archive className="h-5 w-5" />
            أرشيف الفواتير والوثائق المالية
          </CardTitle>
          <CardDescription>
            مستندات إدارية في حاوية خاصة؛ التحميل بروابط موقّعة قصيرة العمر. عند التفعيل، يمكن مزامنة حقول التزام
            التشغيل (التجديد التالي، التقدير الشهري) مع الفاتورة.
          </CardDescription>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={() => void refresh()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="mr-2">تحديث القائمة</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        {!canFetchCommitments ? (
          <Alert>
            <AlertTitle>ربط التزامات</AlertTitle>
            <AlertDescription>
              لعرض قائمة التزامات من القائمة المنسدلة تحتاج صلاحية مراقبة فوترة التشغيل. يمكنك إدخال معرّف التزام
              (UUID) يدوياً عند الحاجة.
            </AlertDescription>
          </Alert>
        ) : null}

        {canManage ? (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              رفع مستند
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fin-archive-file">ملف (PDF أو صورة)</Label>
                <Input id="fin-archive-file" ref={fileRef} type="file" accept=".pdf,image/png,image/jpeg,image/webp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-archive-label">التسمية الأرشيفية</Label>
                <Input
                  id="fin-archive-label"
                  value={archiveLabel}
                  onChange={(e) => setArchiveLabel(e.target.value)}
                  placeholder="مثال: فاتورة Vercel — يناير 2026"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-invoice-no">رقم الفاتورة (اختياري)</Label>
                <Input
                  id="fin-invoice-no"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>المزوّد</Label>
                <Select value={vendor} onValueChange={setVendor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-invoice-date">تاريخ الفاتورة</Label>
                <Input id="fin-invoice-date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-amount">المبلغ</Label>
                <Input id="fin-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="مثال: 249.00" />
              </div>
              <div className="space-y-2">
                <Label>العملة</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-period-start">بداية الفترة</Label>
                <Input id="fin-period-start" type="date" value={serviceStart} onChange={(e) => setServiceStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-period-end">نهاية الفترة</Label>
                <Input id="fin-period-end" type="date" value={serviceEnd} onChange={(e) => setServiceEnd(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fin-notes">ملاحظات</Label>
                <Input id="fin-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t border-border/40 pt-4">
              {canFetchCommitments ? (
                <div className="space-y-2">
                  <Label>ربط بتزام تشغيلي (اختياري)</Label>
                  <Select value={commitmentSelect || '__none__'} onValueChange={(v) => setCommitmentSelect(v === '__none__' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="بدون ربط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— بدون —</SelectItem>
                      {commitments.map((c) => (
                        <SelectItem key={String(c.id)} value={String(c.id)}>
                          {String(c.display_label || c.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="fin-commit-manual">أو معرّف التزام (UUID)</Label>
                <Input
                  id="fin-commit-manual"
                  dir="ltr"
                  className="font-mono text-sm"
                  value={commitmentManualId}
                  onChange={(e) => setCommitmentManualId(e.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-md border border-dashed border-border/60 p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="fin-sync"
                  checked={syncCommitment}
                  onCheckedChange={(v) => setSyncCommitment(v === true)}
                  disabled={!commitmentIdForSubmit}
                />
                <Label htmlFor="fin-sync" className="cursor-pointer font-normal">
                  تحديث التزام التشغيل من بيانات هذه الفاتورة (يتطلب معرّف التزام)
                </Label>
              </div>
              {syncCommitment && commitmentIdForSubmit ? (
                <div className="grid gap-3 sm:grid-cols-2 mr-6">
                  <div className="space-y-2">
                    <Label htmlFor="fin-next-renewal">التجديد التالي للتزام</Label>
                    <Input
                      id="fin-next-renewal"
                      type="datetime-local"
                      value={nextRenewalLocal}
                      onChange={(e) => setNextRenewalLocal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fin-monthly-sar">تقدير شهري (ر.س.) للتزام</Label>
                    <Input
                      id="fin-monthly-sar"
                      inputMode="decimal"
                      value={monthlyEstimateSar}
                      onChange={(e) => setMonthlyEstimateSar(e.target.value)}
                      placeholder="يُستبدل تلقائياً بمبلغ الفاتورة إن العملة SAR"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    عند المزامنة: يُحدَّث <code className="text-xs">last_synced_at</code> ويُصفَّر تعارض البيانات. إن
                    لم تُدخل قيمة للتجديد ووُجدت نهاية فترة خدمة، يُشتق تاريخ تجديد من نهاية الفترة في الخادم.
                  </p>
                </div>
              ) : null}
            </div>

            <Button type="button" onClick={() => void onUpload()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span className="mr-2">رفع وأرشفة</span>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">صلاحيتك: عرض الأرشيف فقط — لا يمكن الرفع أو الحذف.</p>
        )}

        <div className="overflow-x-auto rounded-md border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التسمية</TableHead>
                <TableHead>المزوّد</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الفترة</TableHead>
                <TableHead>رفع بواسطة</TableHead>
                <TableHead>مزامنة</TableHead>
                <TableHead className="text-left w-[1%] whitespace-nowrap">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="inline h-5 w-5 animate-spin align-middle ml-2" />
                    جاري التحميل…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد مستندات بعد.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="max-w-[200px]">
                      <div className="font-medium truncate" title={d.archive_label}>
                        {d.archive_label}
                      </div>
                      <div className="text-xs text-muted-foreground truncate" title={d.original_filename}>
                        {d.original_filename} · {formatBytes(d.file_size_bytes)} · {shortSha(d.file_sha256)}
                      </div>
                    </TableCell>
                    <TableCell>{d.vendor}</TableCell>
                    <TableCell>
                      {d.amount != null ? `${d.amount} ${d.currency}` : '—'}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {d.service_period_start || '—'} → {d.service_period_end || '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{d.uploaded_by_email}</div>
                      <div className="text-muted-foreground">{new Date(d.uploaded_at).toLocaleString('ar-SA')}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {d.sync_applied_at ? new Date(d.sync_applied_at).toLocaleString('ar-SA') : '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button type="button" variant="ghost" size="icon" title="تحميل" onClick={() => void onDownload(d.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {canManage ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          title="حذف"
                          onClick={() => void onDelete(d.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
