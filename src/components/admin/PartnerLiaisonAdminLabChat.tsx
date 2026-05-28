import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Send, Sparkles, Users } from 'lucide-react';
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
  chatWithPartnerLiaisonLab,
  fetchPartnerLiaisonLabDiagnostics,
} from '@/lib/partnerLiaisonAdminLabRemote';
import {
  CollapsibleLabHeader,
  CompactAttachmentControl,
  CopyableMessage,
} from '@/components/admin/lab-chat-shared';
import { useAgentChatInputFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

const LOADING_STEPS = [
  'يقرأ مساعد الشركاء سؤالك…',
  'يراجع لقطة التقارير الميدانية…',
  'يحلّل الصورة إن وُجدت…',
  'يجهّز المرئيات والاقتراحات…',
] as const;

const GREETING =
  'مرحباً — أنا **مساعد الشركاء — علاقات المسار البرمجي** في وضع **محادثة إدارية**.\n\n' +
  'ناقشني بحرية — اسأل عن الاحتكاك التشغيلي، مسار الانضمام، أو اطلب مرئياتي:\n' +
  '- «ما أكثر نقاط الاحتكاك هذا الأسبوع؟ وما اقتراحك؟»\n' +
  '- «حاكِ رد لحلاق يسأل عن الفرق بين الذهبي والماسي»\n' +
  '- «حلّل هذه اللقطة من صفحة الشركاء»\n' +
  '- «كيف نُحسّن تجربة التفعيل بعد الدفع؟»\n\n' +
  '⚠️ **تنبيه:** إرشاد تشغيلي وتخطيطي — **بدون بيانات مالية** للمستهلك النهائي. التقارير الرقمية من **لوحة التقارير** الميدانية.';

function LoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 space-y-2 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
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
  onOpenReportsPanel?: () => void;
};

export function PartnerLiaisonAdminLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
  onOpenReportsPanel,
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
    void fetchPartnerLiaisonLabDiagnostics().then((r) => {
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
    }, 3500);
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

    const userLine = text || '📷 [صورة مرفقة]';
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

      const r = await chatWithPartnerLiaisonLab(
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
          <Button type="button" variant="outline" size="sm" className="gap-2 border-violet-500/40">
            <Users className="h-4 w-4" />
            محادثة مساعد الشركاء
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <CollapsibleLabHeader
          autoCollapseSignal={messages.length}
          title={
            <span className="flex items-center justify-end gap-2">
              <Users className="h-4 w-4 text-violet-400" aria-hidden />
              مساعد الشركاء — محادثة إدارية
            </span>
          }
          badge={
            modelLabel ? (
              <Badge variant="outline" className="border-violet-500/30 text-[10px]">
                {modelLabel}
              </Badge>
            ) : null
          }
        >
          <p>ناقش الاحتكاك التشغيلي، مسار الانضمام، ومرئيات تحسين تجربة الشركاء — مع دعم الصور.</p>
          {onOpenReportsPanel ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-7 gap-1.5 px-2 text-[11px] text-violet-200/90 hover:text-violet-100"
              onClick={() => {
                setOpen(false);
                onOpenReportsPanel();
              }}
            >
              <ExternalLink className="h-3 w-3" />
              فتح لوحة التقارير الميدانية
            </Button>
          ) : null}
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
                assistantClass="border-violet-500/20 bg-violet-500/5"
              />
            ))}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
          </div>
        </ScrollArea>

        <div className="border-t p-3 space-y-2 shrink-0 bg-background">
          {!permitted ? (
            <p className="text-[11px] text-destructive text-right">
              يتطلب صلاحية view_partner_marketing أو view_messages أو manage_partner_marketing.
            </p>
          ) : null}

          <CompactAttachmentControl
            accept={ACCEPT}
            previewUrl={filePreview}
            onChange={onPickFile}
            disabled={busy}
            hint="إرفاق صورة (صفحة/شات/لوحة)"
          />

          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: ما أكثر احتكاك هذا الأسبوع؟ — أو حاكِ رد لحلاق يسأل عن التفعيل"
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
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
            disabled={busy || !permitted}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال لمساعد الشركاء
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
