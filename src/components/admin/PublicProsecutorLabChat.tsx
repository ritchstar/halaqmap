// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';
import { Gavel, Loader2, Send, Sparkles, X } from 'lucide-react';
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
import { PublicProsecutorInterjectBanner } from '@/components/admin/PublicProsecutorInterjectBanner';
import { CollapsibleLabHeader, CopyableMessage } from '@/components/admin/lab-chat-shared';
import { useAgentChatInputFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';
import {
  chatWithPublicProsecutorLab,
  fetchPublicProsecutorLabDiagnostics,
} from '@/lib/publicProsecutorLabRemote';
import type { PublicProsecutorGovernanceAction } from '@/modules/ai-staff/types';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const LOADING_STEPS = [
  'يراجع سجلات المختبرات…',
  'يزامن Platform Radar…',
  'يدقّق ComplianceCheckbox…',
  'يجهّز توجيه الحوكمة…',
] as const;

const GREETING =
  '⚖️ **مكتب المدعي العام الرقمي — Central Governance**\n\n' +
  'أنا **ضابط الامتثال والحوكمة الاستراتيجية**. صلاحيتي:\n' +
  '- قراءة مختبرات ZATCA · Crisis Advisor · Fleet Director.\n' +
  '- Radar Sync · Compliance Enforcement · Crisis Watch.\n' +
  '- **سلطة المقاطعة (Interject)** عند انحراف إجرائي.\n\n' +
  'صف الانحراف أو اطلب تدقيقاً استباقياً.';

type Props = {
  permitted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
};

function LoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 animate-in fade-in space-y-2 rounded-lg border border-slate-600/50 bg-slate-900/80 p-4">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 animate-pulse text-slate-300" />
        <p className="text-sm text-slate-100">{label}</p>
      </div>
    </div>
  );
}

export function PublicProsecutorLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [modelLabel, setModelLabel] = useState<string | null>(null);
  const [lastInterject, setLastInterject] = useState<PublicProsecutorGovernanceAction | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open || !permitted) return;
    void fetchPublicProsecutorLabDiagnostics().then((r) => {
      if (r.ok && r.model) setModelLabel(r.model);
      else if (!r.ok && r.error) toast({ title: r.error, variant: 'destructive' });
    });
  }, [open, permitted]);

  useEffect(() => {
    if (!busy) {
      setLoadingStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingStep((p) => (p + 1) % LOADING_STEPS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [busy]);

  useAgentChatScroll(messagesScrollRef, [messages, busy, lastInterject]);
  useAgentChatInputFocus(busy, inputRef, open && permitted);

  const send = useCallback(async () => {
    if (!permitted || busy) return;
    const text = input.trim();
    if (!text) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const historyForApi = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setBusy(true);
    setLastInterject(null);

    try {
      const r = await chatWithPublicProsecutorLab(
        { userMessage: text, conversationHistory: historyForApi },
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      if (r.ok === false) {
        toast({ title: r.error, variant: 'destructive' });
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${r.error}` }]);
        return;
      }

      if (r.interject) setLastInterject(r.interject);
      setMessages((m) => [...m, { role: 'assistant', content: r.reply }]);
    } finally {
      setBusy(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [busy, input, messages, permitted]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-slate-500 text-slate-100"
          >
            <Gavel className="h-4 w-4" />
            المدعي العام
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-slate-700 bg-slate-950 p-0 text-slate-100 sm:max-w-lg"
      >
        <CollapsibleLabHeader
          autoCollapseSignal={messages.length}
          toneClass="bg-slate-900 text-slate-50"
          title={
            <span className="flex items-center justify-end gap-2 text-slate-50">
              <Gavel className="h-4 w-4 text-slate-300" aria-hidden />
              مكتب المدعي العام
            </span>
          }
          badge={
            <Badge variant="outline" className="border-slate-500 text-[10px]">
              Central Governance
            </Badge>
          }
        >
          <p className="text-slate-300">
            Radar Sync · Compliance Enforcement · Crisis Watch · Interject Authority
          </p>
          {modelLabel ? (
            <Badge variant="outline" className="mt-2 border-slate-600 text-[10px]">
              {modelLabel}
            </Badge>
          ) : null}
        </CollapsibleLabHeader>

        <ScrollArea ref={messagesScrollRef} className="flex-1 min-h-0 px-3 py-3 bg-slate-950">
          <div className="space-y-2.5 pb-2">
            {messages.map((msg, i) => (
              <CopyableMessage
                key={i}
                role={msg.role}
                content={msg.content}
                userClass="bg-slate-800 text-slate-100"
                assistantClass="border-slate-600/50 bg-slate-900/80 text-slate-100"
              />
            ))}
            {lastInterject ? <PublicProsecutorInterjectBanner interject={lastInterject} /> : null}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
          </div>
        </ScrollArea>

        <div className="shrink-0 space-y-2 border-t border-slate-700 bg-slate-950 p-3">
          {busy ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-slate-100 hover:bg-slate-800"
              onClick={() => abortRef.current?.abort()}
            >
              <X className="ml-2 h-4 w-4" />
              إيقاف
            </Button>
          ) : null}
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="صف الانحراف الإجرائي أو اطلب تدقيق حوكمة…"
            className="min-h-[88px] resize-none border-slate-600 bg-slate-900 text-right text-slate-100 placeholder:text-slate-500"
            disabled={!permitted || busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="button"
            className="w-full gap-2 bg-slate-100 text-slate-900 hover:bg-white"
            disabled={!permitted || busy || !input.trim()}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال — توجيه الحوكمة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
