import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Radio, Send, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  chatWithFleetDirectorLab,
  fetchFleetDirectorLabDiagnostics,
} from '@/lib/fleetDirectorAdminLabRemote';
import {
  CollapsibleLabHeader,
  CompactAttachmentControl,
  CopyableMessage,
} from '@/components/admin/lab-chat-shared';
import { useAgentChatInputFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';

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
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  useAgentChatScroll(messagesScrollRef, [messages, busy]);
  useAgentChatInputFocus(busy, inputRef, open && permitted);

  const clearAttachment = useCallback(() => {
    setAttachedFile(null);
    setFilePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const onPickFile = useCallback((file: File | null) => {
    setAttachedFile(file);
    setFilePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

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
        <CollapsibleLabHeader
          autoCollapseSignal={messages.length}
          toneClass="bg-red-950/10"
          title={
            <span className="flex items-center justify-end gap-2 text-red-100">
              <Radio className="h-4 w-4 text-red-400" aria-hidden />
              المدير العام — مقصورة سرية ◆
            </span>
          }
          badge={
            <Badge variant="outline" className="border-red-500/40 text-[10px] text-red-300">
              سري · قيادة عليا
            </Badge>
          }
        >
          <p className="leading-relaxed">
            خطط الأسطول، التوجيهات، نشرات التدريب، والإحاطات الاستخباراتية — قناة خلفية مشفرة.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
            {modelLabel ? (
              <Badge variant="outline" className="border-red-500/30 text-[10px]">
                {modelLabel}
              </Badge>
            ) : null}
            {onOpenIntelligenceFeed ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-[11px] text-red-200/90 hover:text-red-100"
                onClick={() => {
                  setOpen(false);
                  onOpenIntelligenceFeed();
                }}
              >
                <ExternalLink className="h-3 w-3" />
                سجل الاستخبارات
              </Button>
            ) : null}
          </div>
        </CollapsibleLabHeader>

        <ScrollArea
          ref={messagesScrollRef}
          className="flex-1 min-h-0 px-3 py-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="space-y-2.5 pb-2">
            {messages.map((msg, i) => (
              <CopyableMessage
                key={i}
                role={msg.role}
                content={msg.content}
                assistantClass="border-red-500/20 bg-red-950/15"
              />
            ))}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
          </div>
        </ScrollArea>

        <div className="border-t border-red-900/30 p-3 space-y-2 shrink-0 bg-background">
          {!permitted ? (
            <p className="text-[11px] text-destructive text-right">
              يتطلب صلاحية manage_admins — قيادة عليا فقط.
            </p>
          ) : null}

          <CompactAttachmentControl
            accept={ACCEPT}
            previewUrl={filePreview}
            onChange={onPickFile}
            disabled={busy}
            hint="إرفاق صورة (لقطة/تقرير)"
          />

          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: وجّه الأسطول — زِد الاحترام · أو: ما خطتك للأسبوع؟"
            rows={2}
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
