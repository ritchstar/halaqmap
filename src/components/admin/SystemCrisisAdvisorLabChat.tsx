import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send, ShieldAlert, Siren, Sparkles, X } from 'lucide-react';
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
  chatWithSystemCrisisAdvisorLab,
  fetchSystemCrisisAdvisorLabDiagnostics,
} from '@/lib/systemCrisisAdvisorLabRemote';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const LOADING_STEPS = [
  'يقرأ Crisis Playbook…',
  'يُقيّم Uptime وسلامة البيانات…',
  'يرتّب الأولويات P0/P1…',
  'يجهّز خطة التعافي…',
] as const;

const GREETING =
  '🚨 **Crisis Discussion — مستشار الأزمات التقنية**\n\n' +
  'أنا **Strategic Technical Consultant** لمنصة **حلاق ماب**. في هذا الخيط:\n' +
  '- **Uptime** و**Data integrity** فقط — لا UX ولا تحسينات غير حرجة.\n' +
  '- أرتّب مهامك P0→P2 وفق **Crisis Playbook**.\n' +
  '- أعرف بنية: Vercel API · Supabase RLS · Moyasar · ops-controller · AI staff.\n\n' +
  'صف الأعراض: ماذا توقف؟ متى بدأ؟ من المتأثر (مستهلك / شريك / دفع / إدارة)؟';

const PANIC_SEED =
  'تفعيل بروtokol الأزمة — قدّم تقييماً فورياً P0/P1: Uptime، سلامة البيانات، وخطوات الـ 5 دقائق الأولى.';

type Props = {
  permitted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  /** Opens with crisis protocol — used by founder panic button */
  crisisMode?: boolean;
};

function LoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 rounded-lg border border-orange-500/35 bg-orange-950/25 p-4 space-y-2 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-orange-400 animate-pulse" />
        <p className="text-sm text-slate-100">{label}</p>
      </div>
    </div>
  );
}

export function SystemCrisisAdvisorLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
  crisisMode = false,
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
  const [playbookOk, setPlaybookOk] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const panicBootstrappedRef = useRef(false);

  useEffect(() => {
    if (!open || !permitted) return;
    void fetchSystemCrisisAdvisorLabDiagnostics().then((r) => {
      if (r.ok) {
        if (r.model) setModelLabel(r.model);
        setPlaybookOk(r.playbookLoaded);
      } else if (r.error) {
        toast({ title: r.error, variant: 'destructive' });
      }
    });
  }, [open, permitted]);

  useEffect(() => {
    if (!open) {
      panicBootstrappedRef.current = false;
      return;
    }
    if (!crisisMode || panicBootstrappedRef.current || !permitted) return;
    panicBootstrappedRef.current = true;
    setMessages([{ role: 'assistant', content: GREETING }]);
    setInput(PANIC_SEED);
  }, [open, crisisMode, permitted]);

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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = useCallback(async () => {
    if (!permitted || busy) return;
    const text = input.trim();
    if (!text) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const historyForApi = messages.map((m) => ({ role: m.role, content: m.content }));
    const isFirstUserInCrisis =
      crisisMode && historyForApi.filter((m) => m.role === 'user').length === 0;

    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setBusy(true);

    try {
      const r = await chatWithSystemCrisisAdvisorLab(
        {
          userMessage: text,
          crisisMode: isFirstUserInCrisis,
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
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [busy, crisisMode, input, messages, permitted]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2 border-orange-500/40 text-slate-100">
            <ShieldAlert className="h-4 w-4" />
            مستشار الأزمات
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-orange-900/50 bg-slate-950 p-0 text-slate-100 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-orange-900/40 bg-orange-950/20 px-4 py-4 text-right shrink-0">
          <SheetTitle className="flex items-center justify-end gap-2 text-slate-50">
            <Siren className="h-5 w-5 text-orange-400" aria-hidden />
            Crisis Discussion
          </SheetTitle>
          <SheetDescription className="text-right space-y-2 text-slate-100">
            <Badge
              variant="outline"
              className="mr-auto border-orange-500/50 text-[10px] text-slate-50"
            >
              Strategic Technical Consultant · B2B Internal
            </Badge>
            <span className="block text-xs text-slate-100">
              Uptime · Data integrity · Crisis Playbook — تجاهل الملاحظات غير الحرجة.
            </span>
            {playbookOk === false ? (
              <Badge variant="destructive" className="mr-auto text-[10px] text-white">
                Crisis Playbook غير محمّل على الخادم
              </Badge>
            ) : null}
            {modelLabel ? (
              <Badge
                variant="outline"
                className="mr-auto block w-fit border-orange-500/30 text-[10px] text-slate-100"
              >
                {modelLabel}
              </Badge>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-3 pb-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-100 ${
                  msg.role === 'user'
                    ? 'mr-8 ml-0 bg-orange-500/10'
                    : 'ml-8 mr-0 border border-orange-500/25 bg-orange-950/20'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t border-orange-900/40 bg-slate-950 p-4 space-y-2">
          {busy ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-slate-100 hover:text-white hover:bg-orange-950/40"
              onClick={() => abortRef.current?.abort()}
            >
              <X className="h-4 w-4 ml-2" />
              إيقاف
            </Button>
          ) : null}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="صف الحادث — الأعراض، التوقيت، النطاق المتأثر…"
            className="min-h-[88px] resize-none border-orange-900/40 bg-slate-900 text-right text-slate-100 placeholder:text-slate-400"
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
            className="w-full gap-2 bg-orange-700 hover:bg-orange-600 text-white"
            disabled={!permitted || busy || !input.trim()}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال — أولوية الأزمة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
