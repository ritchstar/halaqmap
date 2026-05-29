import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, Gavel, Loader2, Megaphone, Send, Sparkles } from 'lucide-react';
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
  chatWithMarketingLab,
  fetchMarketingLabDiagnostics,
  type MarketingLabChannel,
  type MarketingLabChatTurn,
  type MarketingLabReplyContext,
} from '@/lib/marketingCouncilLabRemote';
import { CollapsibleLabHeader, CopyableMessage } from '@/components/admin/lab-chat-shared';
import { useAgentChatInputFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';
import { PartnerProspectHandoffPanel } from '@/components/admin/PartnerProspectHandoffPanel';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const LOADING_STEPS = [
  'يقرأ الاستراتيجي طلبك…',
  'يفحص لقطة الطلب الحية…',
  'يربط التوصيات بالأحياء/الباقات…',
  'يجهّز الرد ويصنّف الأولويات…',
] as const;

const CHANNEL_META: Record<
  MarketingLabChannel,
  {
    icon: typeof Megaphone;
    accentText: string;
    accentBg: string;
    accentBorder: string;
    accentButton: string;
    sheetTitle: string;
    description: string;
    placeholder: string;
    greeting: string;
    sendLabel: string;
  }
> = {
  b2c: {
    icon: Megaphone,
    accentText: 'text-rose-300',
    accentBg: 'bg-rose-500/5',
    accentBorder: 'border-rose-500/30',
    accentButton: 'bg-rose-600 hover:bg-rose-700',
    sheetTitle: 'استراتيجي B2C — جذب المستخدم الباحث عن حلاق',
    description:
      'بعد ألف+ حلاق: جذب المستخدم الباحث جغرافياً بشعار «فيه حلاق قريب؟ حلاق ماب يجيب» + لقطة بحث حية.',
    placeholder:
      'مثال: «اقترح حملة جذب باحثين عن حلاق في الرياض» أو «كيف ننشّط فرص الحلاقين في حي النزهة؟»',
    greeting:
      'مرحباً — أنا **استراتيجي التسويق B2C 🎯** في المجلس التسويقي.\n\n' +
      'مهمتي: نشر المنصة على **المستخدم الباحث عن حلاق قريب** — بعد اكتمال مرحلة اكتساب الشركاء.\n' +
      'الشعار: **«فيه حلاق قريب؟ حلاق ماب يجيب»** · الفعل: **اسمح بموقعك**\n\n' +
      'ناقشني بحرية:\n' +
      '- «ما أعلى 3 أحياء طلباً وكيف نجذب باحثين عن حلاق فيها؟»\n' +
      '- «اقترح حملة قصيرة بشعار فيه حلاق قريب لمدينة محددة»\n' +
      '- «كيف ننشّط فرص الحلاقين في حي عالي الطلب؟»\n\n' +
      '⚖️ **المدعي العام دائم الحضور** — اطلب استدعاءه أو استخدم الزر أعلى الشاشة لمراجعة أي توصية حساسة قبل التنفيذ.',
    sendLabel: 'إرسال لاستراتيجي B2C',
  },
  b2b: {
    icon: Briefcase,
    accentText: 'text-sky-300',
    accentBg: 'bg-sky-500/5',
    accentBorder: 'border-sky-500/30',
    accentButton: 'bg-sky-600 hover:bg-sky-700',
    sheetTitle: 'استراتيجي B2B — اكتساب الشركاء الحلاقين',
    description:
      'حقن معرفة منصة + مهارات تسويق B2B + لقطة قمع الشركاء (الطلبات، الباقات، الاحتكاك).',
    placeholder:
      'مثال: «اقترح حملة ترقية برونزي → ذهبي» أو «صمّم رسالة احتفاظ للماسي»',
    greeting:
      'مرحباً — أنا **استراتيجي التسويق B2B 🏢** في المجلس التسويقي.\n\n' +
      'ناقشني بحرية:\n' +
      '- «أين تسرّب القمع 30ي وما الحلول؟»\n' +
      '- «خطة ABM لـ 50 صالون VIP في جدة»\n' +
      '- «رسائل ترقية برونزي → ذهبي مع KPIs»\n\n' +
      'بعد تجهيز lead، استخدم **إحالة إلى غرفة القيادة** أسفل المحادثة — الإرسال يبقى يدوياً من pipeline التشغيل.\n\n' +
      '⚖️ **المدعي العام دائم الحضور** + 🤝 **مساعد الشركاء** زميل على نفس الطاولة — اطلب استدعاء أيهما عند الحاجة.',
    sendLabel: 'إرسال لاستراتيجي B2B',
  },
};

function LoadingIndicator({ stepIndex, accentBorder, accentBg, accentText }: {
  stepIndex: number;
  accentBorder: string;
  accentBg: string;
  accentText: string;
}) {
  const label = LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
  return (
    <div
      className={`ml-4 mr-0 rounded-lg border ${accentBorder} ${accentBg} p-4 space-y-2 animate-in fade-in`}
    >
      <div className="flex items-center gap-3">
        <Sparkles className={`h-4 w-4 ${accentText} animate-pulse`} />
        <p className="text-sm text-foreground">{label}</p>
      </div>
    </div>
  );
}

type Props = {
  channel: MarketingLabChannel;
  permitted: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  onSummonProsecutor?: () => void;
  canManageCommandCenter?: boolean;
  onOpenCommandCenter?: () => void;
};

export function MarketingCouncilLabChat({
  channel,
  permitted,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
  onSummonProsecutor,
  canManageCommandCenter = false,
  onOpenCommandCenter,
}: Props) {
  const meta = CHANNEL_META[channel];
  const Icon = meta.icon;

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: meta.greeting },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [modelLabel, setModelLabel] = useState<string | null>(null);
  const [lastContext, setLastContext] = useState<MarketingLabReplyContext | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open || !permitted) return;
    void fetchMarketingLabDiagnostics(channel).then((r) => {
      if (r.ok && r.model) setModelLabel(r.model);
      if (r.ok === false && r.error) toast({ title: r.error, variant: 'destructive' });
    });
  }, [open, permitted, channel]);

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

  useAgentChatScroll(messagesScrollRef, [messages, busy]);
  useAgentChatInputFocus(busy, inputRef, open && permitted);

  const send = useCallback(async () => {
    if (!permitted || busy) return;
    const text = input.trim();
    if (!text) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const historyForApi: MarketingLabChatTurn[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setBusy(true);

    try {
      const r = await chatWithMarketingLab(
        channel,
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
  }, [busy, channel, input, messages, permitted]);

  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === 'assistant') return messages[i].content;
    }
    return '';
  }, [messages]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger ? (
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`gap-2 ${meta.accentBorder}`}
          >
            <Icon className="h-4 w-4" />
            {meta.sheetTitle}
          </Button>
        </SheetTrigger>
      ) : null}
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <CollapsibleLabHeader
          autoCollapseSignal={messages.length}
          title={
            <span className="flex items-center justify-end gap-2">
              <Icon className={`h-4 w-4 ${meta.accentText}`} aria-hidden />
              {meta.sheetTitle}
            </span>
          }
          badge={
            modelLabel ? (
              <Badge variant="outline" className={`text-[10px] ${meta.accentBorder} ${meta.accentText}`}>
                {modelLabel}
              </Badge>
            ) : null
          }
        >
          <p className="leading-relaxed">{meta.description}</p>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
            {onSummonProsecutor ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-[11px]"
                onClick={() => onSummonProsecutor()}
              >
                <Gavel className="h-3 w-3" />
                استدعاء المدعي العام
              </Button>
            ) : null}
            {lastContext ? <ContextChips channel={channel} context={lastContext} /> : null}
          </div>
        </CollapsibleLabHeader>

        <ScrollArea ref={messagesScrollRef} className="flex-1 min-h-0 px-3 py-3">
          <div className="space-y-2.5 pb-2">
            {messages.map((msg, i) => (
              <CopyableMessage
                key={i}
                role={msg.role}
                content={msg.content}
                assistantClass={`${meta.accentBorder} ${meta.accentBg}`}
              />
            ))}
            {busy ? (
              <LoadingIndicator
                stepIndex={loadingStep}
                accentBorder={meta.accentBorder}
                accentBg={meta.accentBg}
                accentText={meta.accentText}
              />
            ) : null}
          </div>
        </ScrollArea>

        <div className="border-t p-3 space-y-2 shrink-0 bg-background">
          {channel === 'b2b' ? (
            <PartnerProspectHandoffPanel
              permitted={permitted}
              canManage={canManageCommandCenter}
              lastAssistantText={lastAssistantText}
              onOpenCommandCenter={
                onOpenCommandCenter
                  ? () => {
                      onOpenCommandCenter();
                      setOpen(false);
                    }
                  : undefined
              }
            />
          ) : null}

          {!permitted ? (
            <p className="text-[11px] text-destructive text-right">
              يتطلب صلاحية manage_admins أو view_overview أو view_partner_marketing.
            </p>
          ) : null}

          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={meta.placeholder}
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
            className={`w-full gap-2 ${meta.accentButton}`}
            disabled={busy || !permitted}
            onClick={() => void send()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {meta.sendLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ContextChips({
  channel,
  context,
}: {
  channel: MarketingLabChannel;
  context: MarketingLabReplyContext;
}) {
  if (channel === 'b2c') {
    const total = context.totalSearches7d ?? 0;
    const last24h = context.totalSearches24h ?? 0;
    const zero = context.zeroResultRatioOverall;
    const topCity = context.topCities?.[0]?.city ?? null;
    return (
      <span className="flex flex-wrap items-center justify-end gap-1.5 pt-1 text-[10px] text-slate-300">
        <Badge variant="outline" className="border-rose-500/30 text-rose-200">
          7ي: {total}
        </Badge>
        <Badge variant="outline" className="border-rose-500/30 text-rose-200">
          24س: {last24h}
        </Badge>
        {typeof zero === 'number' ? (
          <Badge variant="outline" className="border-rose-500/30 text-rose-200">
            فراغ نتائج: {(zero * 100).toFixed(0)}%
          </Badge>
        ) : null}
        {topCity ? (
          <Badge variant="outline" className="border-rose-500/30 text-rose-200">
            أعلى: {topCity}
          </Badge>
        ) : null}
      </span>
    );
  }

  const total = context.totalPartnerOrders30d ?? 0;
  const paid = context.paidPartnerOrders30d ?? 0;
  const conv = context.conversionRatio30d;
  const topTier = context.tierBreakdown?.[0]?.tier ?? null;
  return (
    <span className="flex flex-wrap items-center justify-end gap-1.5 pt-1 text-[10px] text-slate-300">
      <Badge variant="outline" className="border-sky-500/30 text-sky-200">
        طلبات 30ي: {total}
      </Badge>
      <Badge variant="outline" className="border-sky-500/30 text-sky-200">
        مدفوعة: {paid}
      </Badge>
      {typeof conv === 'number' ? (
        <Badge variant="outline" className="border-sky-500/30 text-sky-200">
          تحويل: {(conv * 100).toFixed(1)}%
        </Badge>
      ) : null}
      {topTier ? (
        <Badge variant="outline" className="border-sky-500/30 text-sky-200">
          أعلى باقة: {topTier}
        </Badge>
      ) : null}
    </span>
  );
}
