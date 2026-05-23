import { useCallback, useEffect, useRef, useState } from 'react';
import { Gavel, Loader2, Mic, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  chatWithMediaSpokesperson,
  fetchMediaSpokespersonDiagnostics,
  type MediaLabChatTurn,
  type MediaLabReplyContext,
} from '@/lib/mediaSpokespersonLabRemote';
import { CollapsibleLabHeader, CopyableMessage } from '@/components/admin/lab-chat-shared';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const LOADING_STEPS = [
  'يقرأ المتحدث طلبك الإعلامي…',
  'يستشير زملاءه في غرفة القيادة…',
  'يدمج الأرقام الحية ويرسم زاوية القصة…',
  'يصوغ المسودّة برسائل مفتاحية محكمة…',
] as const;

const SHORT_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: 'بيان إطلاق ميزة الماسي',
    prompt:
      'اكتب بياناً صحفياً رسمياً لإطلاق ميزة "المناوب الرقمي" ضمن الباقة الماسية، يبرز التموضع كمزوّد حلول تقنية لا وسيط تجاري.',
  },
  {
    label: 'Holding Statement لحادث تقني',
    prompt:
      'صُغ بياناً مؤقتاً (Holding Statement) خلال الساعة الأولى من حادث تقني افتراضي يؤثر على بحث المستخدمين في الرياض، مع رسائل مفتاحية تحفظ الثقة.',
  },
  {
    label: 'ردّ على سؤال صحفي عن العمولات',
    prompt:
      'صحفي سأل: "هل تأخذ المنصة عمولة من كل قصة شعر؟" — اكتب ردّاً إعلامياً مهنياً يوضّح أن النموذج رخصة برمجية للتواجد الجغرافي، لا عمولة.',
  },
  {
    label: 'قصة نجاح شريك بالأرقام',
    prompt:
      'استخرج قصة نجاح شريك حلاق في أعلى مدينة طلباً حسب اللقطة الحية، وصُغها كمادة Earned Media لمنصات الأعمال السعودية.',
  },
];

function LoadingIndicator({ stepIndex }: { stepIndex: number }) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div className="ml-4 mr-0 rounded-lg border border-purple-500/30 bg-purple-500/5 p-4 space-y-2 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-purple-300 animate-pulse" />
        <p className="text-sm text-foreground">{label}</p>
      </div>
    </div>
  );
}

type Props = {
  permitted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  onSummonProsecutor?: () => void;
  onSummonCrisisAdvisor?: () => void;
  onSummonB2cMarketing?: () => void;
  onSummonB2bMarketing?: () => void;
};

const GREETING =
  'مرحباً يا قيادة منصة حلاق ماب — أنا **المتحدث الإعلامي الرسمي 🎙️** في غرفة القيادة.\n\n' +
  'أمتلك حقن كامل لـ:\n' +
  '- علوم الإعلام والعلاقات العامة (Press · PESO · SCCT · Framing · KPIs).\n' +
  '- السجل الزمني للمنصة من نشأتها كمزوّد حلول تقنية وحتى مراحلها البرمجية المتقدمة.\n' +
  '- المشهد الإعلامي السعودي والجهات التنظيمية ذات العلاقة.\n' +
  '- صلاحية استدعاء كل زملائي: المدعي العام، خازن، مستشار الأزمات، الجناح الهندسي، المجلس التسويقي، مساعد الشركاء، المناوب الرقمي.\n\n' +
  '⚖️ **المدعي العام دائم الحضور** — اطلب استدعاءه قبل أي بيان حساس قانونياً.\n\n' +
  'ابدأ بأمر مثل: «اكتب بياناً صحفياً عن…» أو «صُغ ردّاً إعلامياً على…» أو «جهّز Holding Statement لحالة…».';

export function MediaSpokespersonLabChat({
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
  onSummonProsecutor,
  onSummonCrisisAdvisor,
  onSummonB2cMarketing,
  onSummonB2bMarketing,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [modelLabel, setModelLabel] = useState<string | null>(null);
  const [lastContext, setLastContext] = useState<MediaLabReplyContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open || !permitted) return;
    void fetchMediaSpokespersonDiagnostics().then((r) => {
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
    }, 3000);
    return () => window.clearInterval(id);
  }, [busy]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = useCallback(
    async (overrideText?: string) => {
      if (!permitted || busy) return;
      const text = (overrideText ?? input).trim();
      if (!text) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const historyForApi: MediaLabChatTurn[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((m) => [...m, { role: 'user', content: text }]);
      setInput('');
      setBusy(true);

      try {
        const r = await chatWithMediaSpokesperson(
          { userMessage: text, conversationHistory: historyForApi },
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        if (r.ok === false) {
          toast({ title: r.error, variant: 'destructive' });
          setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${r.error}` }]);
          return;
        }
        if (r.context) setLastContext(r.context);
        setMessages((m) => [...m, { role: 'assistant', content: r.reply }]);
      } finally {
        setBusy(false);
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [busy, input, messages, permitted],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2 border-purple-500/40">
            <Mic className="h-4 w-4" />
            المتحدث الإعلامي 🎙️
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <CollapsibleLabHeader
          autoCollapseSignal={messages.length}
          title={
            <span className="flex items-center justify-end gap-2">
              <Mic className="h-4 w-4 text-purple-300" aria-hidden />
              المتحدث الإعلامي — Press & Public Affairs
            </span>
          }
          badge={
            modelLabel ? (
              <Badge variant="outline" className="text-[10px] border-purple-500/40 text-purple-200">
                {modelLabel}
              </Badge>
            ) : null
          }
        >
          <p className="leading-relaxed">
            علوم الإعلام + السجل الزمني للمنصة + مشهد المملكة + استدعاء جميع الزملاء. كل ادعاء مربوط ببيانات حية.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
            {onSummonProsecutor ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-[11px]"
                onClick={() => onSummonProsecutor()}
              >
                <Gavel className="h-3 w-3" />
                استدعاء المدعي العام
              </Button>
            ) : null}
            {onSummonCrisisAdvisor ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => onSummonCrisisAdvisor()}
              >
                🚨 مستشار الأزمات
              </Button>
            ) : null}
            {onSummonB2cMarketing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => onSummonB2cMarketing()}
              >
                🎯 B2C
              </Button>
            ) : null}
            {onSummonB2bMarketing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => onSummonB2bMarketing()}
              >
                🏢 B2B
              </Button>
            ) : null}
            {lastContext ? <ContextChips context={lastContext} /> : null}
          </div>
        </CollapsibleLabHeader>

        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-2.5 pb-2">
            {messages.map((msg, i) => (
              <CopyableMessage
                key={i}
                role={msg.role}
                content={msg.content}
                assistantClass="border-purple-500/30 bg-purple-500/5"
              />
            ))}
            {busy ? <LoadingIndicator stepIndex={loadingStep} /> : null}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-3 space-y-2 shrink-0 bg-background">
          {!permitted ? (
            <p className="text-[11px] text-destructive text-right">
              يتطلب صلاحية manage_admins أو view_overview أو view_partner_marketing.
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-1.5">
            {SHORT_PROMPTS.map((s) => (
              <Button
                key={s.label}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 border-purple-500/30 px-2 text-[10px] text-purple-100"
                disabled={busy || !permitted}
                onClick={() => void send(s.prompt)}
              >
                {s.label}
              </Button>
            ))}
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: «اكتب بياناً صحفياً للإعلان عن وصولنا إلى N مدينة سعودية»"
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
            className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
            disabled={busy || !permitted}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال للمتحدث الإعلامي
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ContextChips({ context }: { context: MediaLabReplyContext }) {
  const chip = 'border-purple-500/30 text-purple-200';
  return (
    <span className="flex flex-wrap items-center justify-end gap-1.5 pt-1 text-[10px] text-slate-300">
      {typeof context.activeBarbers === 'number' ? (
        <Badge variant="outline" className={chip}>
          أسطول: {context.activeBarbers}
        </Badge>
      ) : null}
      {typeof context.citiesCovered === 'number' ? (
        <Badge variant="outline" className={chip}>
          مدن: {context.citiesCovered}
        </Badge>
      ) : null}
      {typeof context.totalSearches7d === 'number' ? (
        <Badge variant="outline" className={chip}>
          بحث 7ي: {context.totalSearches7d}
        </Badge>
      ) : null}
      {typeof context.totalPartnerOrders30d === 'number' ? (
        <Badge variant="outline" className={chip}>
          شركاء 30ي: {context.totalPartnerOrders30d}
        </Badge>
      ) : null}
      {context.engineeringStatus ? (
        <Badge
          variant="outline"
          className={
            context.engineeringStatus === 'OK'
              ? 'border-emerald-500/30 text-emerald-200'
              : context.engineeringStatus === 'FAIL'
                ? 'border-rose-500/30 text-rose-200'
                : chip
          }
        >
          هندسة: {context.engineeringStatus}
        </Badge>
      ) : null}
    </span>
  );
}
