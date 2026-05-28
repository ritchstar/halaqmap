import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Send, Shield, Sparkles } from 'lucide-react';
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
  chatWithZatcaAdvisorLab,
  fetchZatcaAdvisorLabDiagnostics,
} from '@/lib/zatcaAdvisorLabRemote';
import {
  CollapsibleLabHeader,
  CompactAttachmentControl,
  CopyableMessage,
} from '@/components/admin/lab-chat-shared';
import { useAgentChatInputFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

const LOADING_STEPS = [
  'يقرأ خبير ZATCA سؤالك…',
  'يراجع لقطة الرادار والامتثال…',
  'يحلّل الصورة إن وُجدت…',
  'يجهّز الرد…',
] as const;

const GREETING =
  'مرحباً — أنا **خبير زكاة وضريبة (ZATCA) 🛡️**، زميل **خازن** في وضع **محادثة إدارية**.\n\n' +
  'ناقشني بحرية — ارفع لقطة فاتورة/شهادة أو اسأل مثل:\n' +
  '- «ما الفرق بين الحد الاختياري (187,500 ر.س) والإلزامي (375,000)؟»\n' +
  '- «احسب ض.ق.م 15% على حزمة ماسية 225 ر.س»\n' +
  '- «لخّص آخر مسح ZATCA الخارجي»\n' +
  '- «حلّل هذه الفاتورة المرفقة»\n\n' +
  '⚠️ **تنبيه:** إرشاد تشغيلي وتخطيطي — ليس بديلاً عن مستشار ضريبي مرخّص. **لا أفعّل ض.ق.م حياً** من المحادثة؛ التفعيل من المكتب المالي بموافقة Super Admin.';

function LoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
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
  onOpenFinancialOffice?: () => void;
};

export function ZatcaAdvisorLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
  onOpenFinancialOffice,
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
    void fetchZatcaAdvisorLabDiagnostics().then((r) => {
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

      const r = await chatWithZatcaAdvisorLab(
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
          <Button type="button" variant="outline" size="sm" className="gap-2 border-amber-500/40">
            <Shield className="h-4 w-4" />
            محادثة ZATCA
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <CollapsibleLabHeader
          autoCollapseSignal={messages.length}
          title={
            <span className="flex items-center justify-end gap-2">
              <Shield className="h-4 w-4 text-amber-400" aria-hidden />
              خبير ZATCA — محادثة إدارية
            </span>
          }
          badge={
            modelLabel ? (
              <Badge variant="outline" className="border-amber-500/30 text-[10px]">
                {modelLabel}
              </Badge>
            ) : null
          }
        >
          <p>ناقش الامتثال، الحدود، ض.ق.م 15%، وفواتير الحزم — مع دعم الصور.</p>
          {onOpenFinancialOffice ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-7 gap-1.5 px-2 text-[11px] text-amber-200/90 hover:text-amber-100"
              onClick={() => {
                setOpen(false);
                onOpenFinancialOffice();
              }}
            >
              <ExternalLink className="h-3 w-3" />
              فتح المكتب المالي
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
                assistantClass="border-amber-500/20 bg-amber-500/5"
              />
            ))}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
          </div>
        </ScrollArea>

        <div className="border-t p-3 space-y-2 shrink-0 bg-background">
          {!permitted ? (
            <p className="text-[11px] text-destructive text-right">
              يتطلب صلاحية `view_ops_billing_monitor` أو `activate_zatca_tax_live` للمكتب المالي.
            </p>
          ) : null}

          <CompactAttachmentControl
            accept={ACCEPT}
            previewUrl={filePreview}
            onChange={onPickFile}
            disabled={busy}
            hint="إرفاق صورة (فاتورة/شهادة)"
          />

          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: احسب ض.ق.م 15% على 225 ر.س — أو اشرح الحد الإلزامي"
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
            className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
            disabled={busy || !permitted}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال لخبير ZATCA
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
