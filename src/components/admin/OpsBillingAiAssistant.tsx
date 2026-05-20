import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot,
  Check,
  FileImage,
  Loader2,
  Send,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  analyzeOpsBillingWithAi,
  applyOpsBillingAiUpdate,
  fetchOpsBillingAiDiagnostics,
} from '@/lib/opsBillingAiRemote';
import type { OpsBillingAiProposal } from '@/types/opsBillingAi';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

const ANALYSIS_LOADING_STEPS = [
  'يتم الآن قراءة الفاتورة…',
  'يتم مطابقة البيانات مع جدول الالتزامات…',
  'جاري إعداد المعاينة…',
] as const;

function AnalysisLoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = ANALYSIS_LOADING_STEPS[stepIndex] ?? ANALYSIS_LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 rounded-lg border border-primary/25 bg-primary/5 p-4 space-y-3 animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <Sparkles className="relative h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <p className="text-sm font-medium text-foreground transition-opacity duration-300">{label}</p>
          <div className="flex items-center gap-1.5">
            {ANALYSIS_LOADING_STEPS.map((step, i) => (
              <span
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === stepIndex ? 'w-8 bg-primary' : i < stepIndex ? 'w-3 bg-primary/40' : 'w-3 bg-muted-foreground/25'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">قد يستغرق التحليل حتى 30 ثانية للصور المعقدة</p>
        </div>
      </div>
    </div>
  );
}

function isRenewalInPast(iso: unknown): boolean {
  if (typeof iso !== 'string' || !iso.trim()) return false;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return true;
  const renewalYmd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(new Date(t));
  const todayYmd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(new Date());
  return renewalYmd < todayYmd;
}

function formatFieldLabel(key: string): string {
  const map: Record<string, string> = {
    display_label: 'الخدمة',
    vendor: 'المزوّد',
    next_renewal_at: 'موعد التجديد',
    monthly_estimate_sar: 'التقدير الشهري (ر.س)',
    amount_expected: 'المبلغ المتوقع',
    amount_currency: 'العملة',
    billing_cycle: 'دورة الفوترة',
    last_sync_status: 'حالة المزامنة',
    data_gap_kind: 'نوع النقص',
  };
  return map[key] || key;
}

function formatValue(key: string, v: unknown): string {
  if (v == null || v === '') return '—';
  if (key === 'next_renewal_at' && typeof v === 'string') {
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d.toLocaleString('ar-SA') : v;
  }
  if (typeof v === 'number') return v.toFixed(2);
  return String(v);
}

function DiffPreview({ proposal }: { proposal: OpsBillingAiProposal }) {
  const keys = new Set([...Object.keys(proposal.before), ...Object.keys(proposal.after)]);
  const changed = [...keys].filter((k) => proposal.before[k] !== proposal.after[k]);
  if (changed.length === 0) {
    return <p className="text-sm text-muted-foreground">لا تغييرات مرئية في المعاينة.</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {changed.map((k) => (
        <li key={k} className="rounded-md border bg-muted/30 px-3 py-2">
          <div className="font-medium text-foreground">{formatFieldLabel(k)}</div>
          <div className="text-muted-foreground line-through">{formatValue(k, proposal.before[k])}</div>
          <div className="text-primary font-medium">→ {formatValue(k, proposal.after[k])}</div>
        </li>
      ))}
    </ul>
  );
}

async function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return { base64: btoa(binary), mime: file.type || 'image/jpeg' };
}

type Props = {
  canMutate: boolean;
  onApplied?: () => void;
  /** Controlled sheet — used when opening from مكتب الشركاء الأذكياء */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide the default toolbar trigger button */
  hideTrigger?: boolean;
};

export function OpsBillingAiAssistant({
  canMutate,
  onApplied,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'مرحباً — أنا **خازن 🪙**، خزّان العمليات المالي. ارفع لقطة فاتورة (JPEG/PNG) أو اكتب سؤالاً عن تجديد GoDaddy أو Supabase أو OpenAI، وسأقترح تحديث صف في جدول الالتزامات للمراجعة قبل الحفظ. أستخدم تاريخ اليوم في الرياض كمرجع زمني ولا أقبل تواريخ تجديد في الماضي.',
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [pending, setPending] = useState<OpsBillingAiProposal | null>(null);
  const [applying, setApplying] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const analyzeAbortRef = useRef<AbortController | null>(null);
  const analyzeRequestGenRef = useRef(0);

  useEffect(() => {
    if (!busy) {
      setLoadingStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % ANALYSIS_LOADING_STEPS.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [busy]);

  useEffect(() => {
    return () => {
      analyzeAbortRef.current?.abort();
    };
  }, []);

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChangeProp!(next);
      else setInternalOpen(next);
      if (next) {
        void fetchOpsBillingAiDiagnostics().then((d) => {
          if (d.ok && !d.openaiConfigured) {
            toast({ title: 'OPENAI_API_KEY غير مضبوط على الخادم', variant: 'destructive' });
          }
        });
      }
    },
    [isControlled, onOpenChangeProp],
  );

  const clearAttachment = () => {
    setAttachedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onPickFile = (file: File | null) => {
    clearAttachment();
    if (!file) return;
    if (file.type === 'application/pdf') {
      toast({ title: 'حوّل PDF إلى صورة PNG أو JPEG للتحليل حالياً', variant: 'destructive' });
      return;
    }
    if (!ACCEPT.split(',').includes(file.type)) {
      toast({ title: 'صيغة غير مدعومة — استخدم JPEG أو PNG أو WebP', variant: 'destructive' });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: 'الحد الأقصى 4 ميجابايت', variant: 'destructive' });
      return;
    }
    setAttachedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onPickFile(e.dataTransfer.files?.[0] ?? null);
  };

  const send = async () => {
    const text = input.trim();
    if (!text && !attachedFile) {
      toast({ title: 'أدخل رسالة أو ارفع صورة', variant: 'destructive' });
      return;
    }

    analyzeAbortRef.current?.abort();
    const abortController = new AbortController();
    analyzeAbortRef.current = abortController;
    const requestGen = ++analyzeRequestGenRef.current;

    setBusy(true);
    setLoadingStep(0);
    setPending(null);
    const userLine = text || '(مرفق فاتورة)';
    const historyForApi = messages.slice(-8);
    setMessages((m) => [...m, { role: 'user', content: userLine }]);
    setInput('');

    try {
      let imageBase64: string | undefined;
      let imageMime: string | undefined;
      if (attachedFile) {
        const enc = await fileToBase64(attachedFile);
        imageBase64 = enc.base64;
        imageMime = enc.mime;
      }

      const r = await analyzeOpsBillingWithAi(
        {
          userMessage: text,
          imageBase64,
          imageMime,
          conversationHistory: historyForApi,
        },
        { signal: abortController.signal },
      );

      if (r.ok === false) {
        if (analyzeRequestGenRef.current !== requestGen) return;
        toast({ title: r.error, variant: 'destructive' });
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${r.error}` }]);
        return;
      }

      if (analyzeRequestGenRef.current !== requestGen) return;

      const { assistant_message, proposals, needs_clarification } = r.body;
      setMessages((m) => [...m, { role: 'assistant', content: assistant_message }]);

      if (needs_clarification || proposals.length === 0) {
        setPending(null);
        return;
      }

      const best =
        proposals.find((p) => p.match_confidence === 'high') ||
        proposals.find((p) => p.match_confidence === 'medium') ||
        proposals[0];
      if (best) setPending(best);
    } finally {
      if (analyzeRequestGenRef.current === requestGen) {
        if (analyzeAbortRef.current === abortController) {
          analyzeAbortRef.current = null;
        }
        setBusy(false);
        clearAttachment();
      }
    }
  };

  const confirmApply = async () => {
    if (!pending || !canMutate) return;
    const renewAt = pending.patch.next_renewal_at ?? pending.after.next_renewal_at;
    if (isRenewalInPast(renewAt)) {
      toast({
        title: 'تاريخ التجديد في الماضي — صحّح التاريخ أو أعد التحليل',
        variant: 'destructive',
      });
      return;
    }
    setApplying(true);
    const r = await applyOpsBillingAiUpdate({
      proposal_token: pending.proposal_token,
      commitment_id: pending.commitment_id,
      patch: pending.patch,
    });
    setApplying(false);
    if (r.ok === false) {
      toast({ title: r.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم تحديث صف الالتزام في قاعدة البيانات' });
    setMessages((m) => [
      ...m,
      {
        role: 'assistant',
        content: `✅ تم التطبيق على **${String(pending.before.display_label || pending.detected_provider_label || 'الصف')}**.`,
      },
    ]);
    setPending(null);
    onApplied?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <SheetTrigger asChild>
          <Button type="button" variant="outline" className="gap-2 border-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
            خازن 🪙
          </Button>
        </SheetTrigger>
      )}
      <SheetContent side="left" className="w-full sm:max-w-xl flex flex-col p-0 gap-0" dir="rtl">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0 text-right">
          <SheetTitle className="flex items-center gap-2 justify-end">
            <Bot className="h-5 w-5 text-primary" />
            خازن 🪙 — خزّان العمليات
          </SheetTitle>
          <SheetDescription className="text-right">
            تحليل فواتير وتحديث جدول الالتزامات — معاينة التغييرات قبل الحفظ، مع مرجع زمني بتوقيت الرياض.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 py-4 min-h-[200px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary/10 mr-4 ml-0 border border-primary/20'
                    : 'bg-muted/50 ml-4 mr-0'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {busy && <AnalysisLoadingIndicator stepIndex={loadingStep} />}
          </div>
        </ScrollArea>

        {pending && (
          <div className="mx-4 mb-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 space-y-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <span className="font-medium text-sm">معاينة التحديث المقترح</span>
              <Badge variant="outline">{pending.detected_provider_label || pending.detected_vendor}</Badge>
              <Badge
                variant={
                  pending.match_confidence === 'high'
                    ? 'default'
                    : pending.match_confidence === 'low'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                ثقة: {pending.match_confidence}
              </Badge>
            </div>
            {pending.warnings && pending.warnings.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 space-y-1">
                {pending.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-800 dark:text-amber-200">
                    🛠 {w}
                  </p>
                ))}
              </div>
            )}
            <DiffPreview proposal={pending} />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" disabled={applying} onClick={() => setPending(null)}>
                <X className="h-4 w-4 ml-1" />
                إلغاء
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={
                  !canMutate ||
                  applying ||
                  isRenewalInPast(pending.patch.next_renewal_at ?? pending.after.next_renewal_at)
                }
                onClick={() => void confirmApply()}
              >
                {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 ml-1" />}
                تأكيد التحديث
              </Button>
            </div>
            {!canMutate && (
              <p className="text-xs text-destructive">يتطلب صلاحية manage_centralized_billing_ops للتطبيق.</p>
            )}
            {isRenewalInPast(pending.patch.next_renewal_at ?? pending.after.next_renewal_at) && (
              <p className="text-xs text-destructive">
                تاريخ التجديد المقترح في الماضي — أعد التحليل أو صحّح التاريخ قبل التطبيق.
              </p>
            )}
          </div>
        )}

        <div className="border-t p-4 space-y-3 shrink-0 bg-background">
          <div
            className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
              attachedFile ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/40'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            {filePreview ? (
              <div className="space-y-2">
                <img src={filePreview} alt="معاينة" className="mx-auto max-h-28 rounded object-contain" />
                <Button type="button" variant="ghost" size="sm" onClick={clearAttachment}>
                  إزالة المرفق
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">اسحب فاتورة أو لقطة شاشة (JPEG/PNG)</p>
                <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  <FileImage className="h-4 w-4 ml-1" />
                  اختيار ملف
                </Button>
              </div>
            )}
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: تجديد GoDaddy حتى مايو 2027 — أو ارفع صورة الفاتورة"
            rows={3}
            className="resize-none"
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />

          <Button type="button" className="w-full gap-2" disabled={busy} onClick={() => void send()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال للتحليل
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
