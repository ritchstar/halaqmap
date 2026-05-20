import { useCallback, useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StaffProfessionalCard } from '@/components/admin/staff/StaffProfessionalCard';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import { toast } from '@/components/ui/sonner';
import { submitOpsControllerReport } from '@/lib/opsControllerRemote';
import {
  OPS_REPORT_CATEGORY_OPTIONS,
  OPS_REPORT_SEVERITY_OPTIONS,
} from '@/modules/ops-controller/registry';
import type { OpsControllerReportInput, OpsReportCategory, OpsReportSeverity } from '@/modules/ops-controller/types';

type Props = {
  disabled?: boolean;
  onSubmitted?: () => void;
};

const INITIAL: OpsControllerReportInput = {
  clientId: '',
  clientLabel: '',
  category: 'field_issue',
  severity: 'info',
  title: '',
  summary: '',
};

export function OpsReportSubmissionForm({ disabled, onSubmitted }: Props) {
  const [form, setForm] = useState<OpsControllerReportInput>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof OpsControllerReportInput>(key: K, value: OpsControllerReportInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (disabled || submitting) return;

      const clientId = form.clientId.trim();
      const title = form.title.trim();
      const summary = form.summary.trim();
      if (!clientId) {
        toast.error('أدخل معرّف العميل (client_id) — مثال: رقم العضو أو UUID الشريك.');
        return;
      }
      if (title.length < 4) {
        toast.error('عنوان التقرير قصير جداً (4 أحرف على الأقل).');
        return;
      }
      if (summary.length < 12) {
        toast.error('الملخص التشغيلي قصير — اكتب سياقاً كافياً للمالك (12 حرفاً على الأقل).');
        return;
      }

      setSubmitting(true);
      const result = await submitOpsControllerReport({
        clientId,
        clientLabel: form.clientLabel?.trim() || undefined,
        category: form.category,
        severity: form.severity,
        title,
        summary,
      });
      setSubmitting(false);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success('تم إرسال التقرير — يظهر فوراً في تغذية المؤسس.');
      setForm(INITIAL);
      onSubmitted?.();
    },
    [disabled, form, onSubmitted, submitting],
  );

  return (
    <StaffProfessionalCard className="p-5 md:p-6">
      <form onSubmit={handleSubmit} className="space-y-5 text-right">
        <header className="space-y-1">
          <h3 className={staffTheme.sectionTitle}>نموذج تقرير تشغيلي</h3>
          <p className={staffTheme.muted}>
            كل تقرير يُختم تلقائياً بالوقت ومعرّف العميل لظهور فوري لدى المؤسس.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ops-client-id" className="text-slate-200">
              معرّف العميل (client_id) *
            </Label>
            <Input
              id="ops-client-id"
              value={form.clientId}
              onChange={(e) => update('clientId', e.target.value)}
              placeholder="مثال: BM-1024 أو UUID الشريك"
              className="border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              disabled={disabled || submitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-client-label" className="text-slate-200">
              اسم المحل (اختياري)
            </Label>
            <Input
              id="ops-client-label"
              value={form.clientLabel ?? ''}
              onChange={(e) => update('clientLabel', e.target.value)}
              placeholder="مثال: صالون الأناقة — الرياض"
              className="border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              disabled={disabled || submitting}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-200">تصنيف التقرير</Label>
            <Select
              value={form.category}
              onValueChange={(v) => update('category', v as OpsReportCategory)}
              disabled={disabled || submitting}
            >
              <SelectTrigger className="border-slate-600 bg-slate-900 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPS_REPORT_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">الأولوية</Label>
            <Select
              value={form.severity}
              onValueChange={(v) => update('severity', v as OpsReportSeverity)}
              disabled={disabled || submitting}
            >
              <SelectTrigger className="border-slate-600 bg-slate-900 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPS_REPORT_SEVERITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ops-title" className="text-slate-200">
            عنوان مختصر *
          </Label>
          <Input
            id="ops-title"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="مثال: تأخر تفعيل الحزمة البرمجية"
            className="border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500"
            disabled={disabled || submitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ops-summary" className="text-slate-200">
            الملخص التشغيلي *
          </Label>
          <Textarea
            id="ops-summary"
            value={form.summary}
            onChange={(e) => update('summary', e.target.value)}
            placeholder="صف ما حدث، الإجراء المتخذ، وما يحتاج قرار المؤسس..."
            rows={5}
            className="border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 resize-y min-h-[120px]"
            disabled={disabled || submitting}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={disabled || submitting}
          className="w-full border border-slate-600 bg-slate-700 text-white hover:bg-slate-600 sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="ml-2 h-4 w-4" />
              إرسال للتغذية التشغيلية
            </>
          )}
        </Button>
      </form>
    </StaffProfessionalCard>
  );
}
