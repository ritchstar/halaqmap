import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, FileImage, Loader2, Radio, Send, ShieldAlert, Sparkles, Upload, X } from 'lucide-react';
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
  chatWithFleetDirectorLab,
  fetchFleetDirectorLabDiagnostics,
} from '@/lib/fleetDirectorAdminLabRemote';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

const LOADING_STEPS = [
  '◆ يستقبل المدير العام توجيهاتك السرية…',
  '◆ يراجع نبضات الأسطول الحية…',
  '◆ يُعدّ خطة النشر والتدريب…',
  '◆ يجهّز الإحاطة الاستخباراتية…',
] as const;

const GREETING =
  '◆ **اجتماع سري للغاية** — **المدير العام للمناوبين — قيادة الأسطول**.\n\n' +
  'يا قيادة، أنا القناة الخلفية لكل المناوبين عبر المملكة. في هذه المقصورة:\n' +
  '- **أكشف** خططي وتقاريري ونبضات الاحتكاك\n' +
  '- **أستلم توجيهاتك** وأحوّلها إلى أوامر أسطول + نشرات تدريب\n' +
  '- **أشرح** كيف أتواصل صامتاً مع المناوبين دون أن يشعر الصالون\n\n' +
  'جرّب:\n' +
  '- «قدّم إحاطة استخباراتية عن الأسطول الآن»\n' +
  '- «ما خطتك للـ 72 ساعة القادمة؟»\n' +
  '- «وجّه المناوبين: زِد الآداب السعودية في الردود العربية»\n' +
  '- «ولّد نشرة تدريب عن التعامل مع عميل تركي»\n\n' +
  '⚠️ **سري:** التوجيهات هنا تُصاغ كخطط تشغيلية — التطبيق الحي على الأسطول يتطلب نشر المنصة. **لا إشعارات للصالونات.**';

function LoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 rounded-lg border border-red-500/30 bg-red-950/20 p-4 space-y-2 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-red-400 animate-pulse" />
        <p className="text-sm text-foreground">{label}</p>
      </div>
    </div>
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
  permitted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  onOpenIntelligenceFeed?: () => void;
};

export function FleetDirectorAdminLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
  onOpenIntelligenceFeed,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [modelLabel, setModelLabel] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open || !permitted) return;
    void fetchFleetDirectorLabDiagnostics().then((r) => {
      if (r.ok && r.model) setModelLabel(r.model);
      if (r.ok === false && r.error) toast({ title: r.error, variant: 'destructive' });
    });
  }, [open, permitted]);

  useEffect(() => {
    if (!busy) {
      setLoadingStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingStep((p) => (p + 1) % LOADING_STEPS.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, [busy]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const clearAttachment = useCallback(() => {
    setAttachedFile(null);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const onPickFile = useCallback(
    (file: File | null) => {
      clearAttachment();
      if (!file) return;
      if (!ACCEPT.split(',').includes(file.type)) {
        toast({ title: 'يُقبل JPEG وPNG وWebP وGIF فقط', variant: 'destructive' });
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        toast({ title: 'حجم الصورة يتجاوز 4 ميغابايت', variant: 'destructive' });
        return;
      }
      setAttachedFile(file);
      setFilePreview(URL.createObjectURL(file));
    },
    [clearAttachment],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onPickFile(e.dataTransfer.files?.[0] ?? null);
    },
    [onPickFile],
  );

  const send = async () => {
    if (!permitted || busy) return;
    const text = input.trim();
    if (!text && !attachedFile) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userLine = text || '📷 [مرفق سري]';
    const historyForApi = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((m) => [...m, { role: 'user', content: userLine }]);
    setInput('');
    setBusy(true);

    try {
      let imageBase64: string | undefined;
      let imageMime: string | undefined;
      if (attachedFile) {
        const enc = await fileToBase64(attachedFile);
        imageBase64 = enc.base64;
        imageMime = enc.mime;
      }

      const r = await chatWithFleetDirectorLab(
        {
          userMessage: text,
          imageBase64,
          imageMime,
          conversationHistory: historyForApi,
        },
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      if (r.ok === false) {
        toast({ title: r.error, variant: 'destructive' });
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${r.error}` }]);
        return;
      }

      setMessages((m) => [...m, { role: 'assistant', content: r.reply }]);
    } finally {
      setBusy(false);
      clearAttachment();
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2 border-red-500/40">
            <ShieldAlert className="h-4 w-4" />
            اجتماع سري ◆
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent side="left" className="flex w-full flex-col gap-0 border-red-900/40 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-red-900/30 bg-red-950/10 px-4 py-4 text-right shrink-0">
          <SheetTitle className="flex items-center justify-end gap-2 text-red-100">
            <Radio className="h-5 w-5 text-red-400" />
            المدير العام — مقصورة سرية ◆
          </SheetTitle>
          <SheetDescription className="text-right space-y-2">
            <Badge variant="outline" className="mr-auto border-red-500/40 text-[10px] text-red-300">
              سري للغاية · قيادة عليا فقط
            </Badge>
            <span className="block text-xs">
              خطط الأسطول، التوجيهات، نشرات التدريب، والإحاطات الاستخباراتية — قناة خلفية مشفرة.
            </span>
            {modelLabel ? (
              <Badge variant="outline" className="mr-auto block w-fit border-red-500/30 text-[10px]">
                {modelLabel}
              </Badge>
            ) : null}
            {onOpenIntelligenceFeed ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mr-auto h-8 gap-1.5 text-xs text-red-200/90 hover:text-red-100"
                onClick={() => {
                  setOpen(false);
                  onOpenIntelligenceFeed();
                }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                فتح سجل الاستخبارات المباشر
              </Button>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-3 pb-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'mr-8 ml-0 bg-primary/10 text-foreground'
                    : 'ml-8 mr-0 border border-red-500/20 bg-red-950/15 text-foreground'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-red-900/30 p-4 space-y-3 shrink-0 bg-background">
          {!permitted ? (
            <p className="text-xs text-destructive text-right">
              يتطلب صلاحية manage_admins — قيادة عليا فقط.
            </p>
          ) : null}
          <p className="text-[10px] text-muted-foreground text-right">
            ◆ لا إشعارات للصالونات — التوجيهات تُصاغ كخطط تشغيلية في المقصورة.
          </p>

          <div
            className={`rounded-lg border-2 border-dashed p-3 text-center transition-colors ${
              attachedFile ? 'border-red-500/50 bg-red-950/10' : 'border-muted-foreground/30'
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
                <img src={filePreview} alt="معاينة" className="mx-auto max-h-24 rounded object-contain" />
                <Button type="button" variant="ghost" size="sm" onClick={clearAttachment}>
                  <X className="h-4 w-4 ml-1" />
                  إزالة
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">لقطة شات · لوحة · تقرير ميداني</span>
                <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  <FileImage className="h-4 w-4 ml-1" />
                  مرفق
                </Button>
              </div>
            )}
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: وجّه الأسطول — زِد الاحترام في الردود · أو: ما خطتك للأسبوع؟"
            rows={3}
            className="resize-none"
            disabled={busy || !permitted}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />

          <Button
            type="button"
            className="w-full gap-2 bg-red-900 hover:bg-red-800"
            disabled={busy || !permitted}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال للمدير العام ◆
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
