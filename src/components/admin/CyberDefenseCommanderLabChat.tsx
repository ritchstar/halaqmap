import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Radar, Send, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  chatWithCyberDefenseCommander,
  fetchCyberDefenseDiagnostics,
  type CyberDefensePostureLevel,
  type CyberDefenseSnapshot,
} from '@/lib/cyberDefenseCommanderRemote';
import {
  CollapsibleLabHeader,
  CompactAttachmentControl,
  CopyableMessage,
} from '@/components/admin/lab-chat-shared';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

const LOADING_STEPS = [
  '◉ يستلم القائد الأعلى للدفاع التهديد…',
  '◉ يفحص لقطة الـ posture الحالية…',
  '◉ يستفز الوكلاء المختصين للاستفسار…',
  '◉ يصيغ Defense Order قابل للتنفيذ…',
  '◉ يربط بسلطة المدعي العام للمراجعة…',
] as const;

const GREETING =
  '◉ **القيادة العليا للدفاع السيبراني** — Cyber Defense Commander\n\n' +
  'أنا **القائد الأعلى للدفاع** عن منصة `Halaq Map`. تخصصي مطلق في:\n' +
  '`Defensive Security` · `Offensive (للدفاع)` · `Incident Response (NIST 800-61)` · `Cloud/SaaS Security` · `AppSec` · `PDPL/NCA ECC`.\n\n' +
  '**سلسلة القيادة:**\n' +
  '- جميع الوكلاء **تحت إمرتي** للدفاع — أستفزّهم لتغذية القرار.\n' +
  '- **«المدعي العام»** سلطة مستقلة — أتشاور معه ولا آمره.\n' +
  '- **لا تنفيذ مباشر** على الإنتاج من المحادثة — أصدر **Defense Order** فقط.\n\n' +
  'جرّب:\n' +
  '- «قدّم إحاطة Posture الآن»\n' +
  '- «هناك ارتفاع في Webhook errors — حلّل واتّصل بالمعنيين»\n' +
  '- «اشتباه `prompt injection` على المناوب — استدعِ القوة»\n' +
  '- «اكتب Defense Order لاختبار اختراق ربعي»';

const POSTURE_THEME: Record<
  CyberDefensePostureLevel,
  { label: string; badgeClass: string }
> = {
  green: {
    label: '🟢 GREEN — فحص دوري',
    badgeClass: 'border-emerald-700/50 text-emerald-300',
  },
  amber: {
    label: '🟡 AMBER — تأهب',
    badgeClass: 'border-amber-700/50 text-amber-300',
  },
  red: {
    label: '🔴 RED — استجابة حادثة',
    badgeClass: 'border-red-600/60 text-red-300',
  },
};

function LoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 rounded-lg border border-red-600/40 bg-red-950/30 p-4 space-y-2 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-red-300 animate-pulse" />
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
  /** Lets the commander cross-summon other lab chats (Force Mobilization). */
  onSummonProsecutor?: () => void;
  onSummonCrisisAdvisor?: () => void;
  onSummonTechnicalConsultant?: () => void;
  onSummonFleetDirector?: () => void;
};

export function CyberDefenseCommanderLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
  onSummonProsecutor,
  onSummonCrisisAdvisor,
  onSummonTechnicalConsultant,
  onSummonFleetDirector,
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
  const [defenseSnapshot, setDefenseSnapshot] = useState<CyberDefenseSnapshot | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open || !permitted) return;
    void fetchCyberDefenseDiagnostics().then((r) => {
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

    const userLine = text || '📷 [لقطة استخباراتية]';
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

      const r = await chatWithCyberDefenseCommander(
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

      if (r.defenseContext) setDefenseSnapshot(r.defenseContext);
      setMessages((m) => [...m, { role: 'assistant', content: r.reply }]);
    } finally {
      setBusy(false);
      clearAttachment();
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const postureBadge = defenseSnapshot ? POSTURE_THEME[defenseSnapshot.posture] : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2 border-red-700/50">
            <ShieldAlert className="h-4 w-4" />
            القيادة العليا للدفاع ◉
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-red-900/50 p-0 sm:max-w-lg"
      >
        <CollapsibleLabHeader
          autoCollapseSignal={messages.length}
          toneClass="bg-red-950/15"
          title={
            <span className="flex items-center justify-end gap-2 text-red-100">
              <ShieldAlert className="h-4 w-4 text-red-400" aria-hidden />
              القائد الأعلى للدفاع السيبراني ◉
            </span>
          }
          badge={
            <Badge variant="outline" className="border-red-600/60 text-[10px] text-red-300">
              Supreme Command · سيادة دفاع
            </Badge>
          }
        >
          <p className="leading-relaxed">
            وكيل سيبراني من الطراز الأول · يستفز كل الوكلاء للدفاع · يصدر «Defense Order» — لا تنفيذ
            مباشر. «المدعي العام» سلطة مستقلة لا تخضع لأمره.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
            {postureBadge ? (
              <Badge variant="outline" className={`text-[10px] ${postureBadge.badgeClass}`}>
                <Radar className="ml-1 h-3 w-3" />
                {postureBadge.label}
              </Badge>
            ) : null}
            {modelLabel ? (
              <Badge variant="outline" className="border-red-600/40 text-[10px]">
                {modelLabel}
              </Badge>
            ) : null}
            <Badge variant="outline" className="border-red-600/40 text-[10px]">
              <Users className="ml-1 h-3 w-3" />
              {(defenseSnapshot?.subordinateAgents.length ?? 9)} وكيل تحت الإمرة
            </Badge>
          </div>
        </CollapsibleLabHeader>

        <ScrollArea
          className="flex-1 px-3 py-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="space-y-2.5 pb-2">
            {messages.map((msg, i) => (
              <CopyableMessage
                key={i}
                role={msg.role}
                content={msg.content}
                assistantClass="border-red-600/30 bg-red-950/20"
              />
            ))}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-red-900/40 p-3 space-y-2 shrink-0 bg-background">
          {!permitted ? (
            <p className="text-[11px] text-destructive text-right">
              يتطلب صلاحية manage_admins — قيادة عليا فقط.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {onSummonProsecutor ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-[11px] text-slate-300 hover:text-slate-100"
                onClick={() => {
                  setOpen(false);
                  onSummonProsecutor();
                }}
                title="استشارة سلطة مستقلة"
              >
                ⚖️ المدعي العام
              </Button>
            ) : null}
            {onSummonCrisisAdvisor ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-[11px] text-orange-300 hover:text-orange-200"
                onClick={() => {
                  setOpen(false);
                  onSummonCrisisAdvisor();
                }}
              >
                🚨 الأزمات
              </Button>
            ) : null}
            {onSummonTechnicalConsultant ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-[11px] text-cyan-300 hover:text-cyan-200"
                onClick={() => {
                  setOpen(false);
                  onSummonTechnicalConsultant();
                }}
              >
                ⚙️ الهندسة
              </Button>
            ) : null}
            {onSummonFleetDirector ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-[11px] text-red-300 hover:text-red-200"
                onClick={() => {
                  setOpen(false);
                  onSummonFleetDirector();
                }}
              >
                ◆ الأسطول
              </Button>
            ) : null}
          </div>

          <CompactAttachmentControl
            accept={ACCEPT}
            previewUrl={filePreview}
            onChange={onPickFile}
            disabled={busy}
            hint="إرفاق لقطة استخباراتية (لوحة, سجل, IOC)"
          />

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: قدّم إحاطة Posture · أو: اشتباه ATO على لوحة الأدمن — حلّل واستدعِ القوة"
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
            className="w-full gap-2 bg-red-800 hover:bg-red-700"
            disabled={busy || !permitted}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إصدار Defense Order ◉
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
