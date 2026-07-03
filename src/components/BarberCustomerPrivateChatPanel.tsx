import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Hourglass, Loader2, Send, Languages, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SubscriptionTier } from '@/lib/index';
import { cn } from '@/lib/utils';
import {
  barberListPrivateConversationsRemote,
  barberListPrivateMessagesRemote,
  barberResumeDigitalShiftRemote,
  barberSendPrivateMessageRemote,
  type BarberPrivateConversationRow,
  type BarberPrivateMessageRow,
} from '@/lib/barberCustomerPrivateChatRemote';
import { barberDashboardTranslateTarget } from '@/lib/chatTranslationPolicy';
import { translateChatLineRemote } from '@/lib/diamondChatTranslateRemote';
import { customerDigitalShiftInterceptRemote } from '@/lib/customerDigitalShiftInterceptRemote';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';
import { useBarberCommunicationAlerts } from '@/hooks/useBarberCommunicationAlerts';
import { BarberChatAlertSettingsCard } from '@/components/barber/BarberChatAlertSettingsCard';

function remainingMs(expiresAtIso: string): number {
  const t = new Date(expiresAtIso).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, t - Date.now());
}

function formatMmSs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function BarberCustomerPrivateChatPanel({
  barberId,
  barberEmail,
  subscriptionTier,
  layout = 'default',
  pollingEnabled = true,
}: {
  barberId: string;
  barberEmail: string;
  subscriptionTier: SubscriptionTier;
  layout?: 'default' | 'workbench';
  /** يُوقف كل polling عندما يكون تبويب الشات غير نشط — يقلّل حمل Edge */
  pollingEnabled?: boolean;
}) {
  const isDiamond = subscriptionTier === SubscriptionTier.DIAMOND;
  const isWorkbench = layout === 'workbench';
  const [conversations, setConversations] = useState<BarberPrivateConversationRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<BarberPrivateMessageRow[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [refreshingMsgs, setRefreshingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [resumingShift, setResumingShift] = useState(false);
  const [tick, setTick] = useState(0);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  type TranslationUiStatus = 'loading' | 'ready' | 'failed' | 'unavailable' | 'noop';
  const [translationStatus, setTranslationStatus] = useState<Record<string, TranslationUiStatus>>({});
  const translationStatusRef = useRef<Record<string, TranslationUiStatus>>({});
  const translationInFlightRef = useRef(new Set<string>());
  const shiftInterceptInFlightRef = useRef(false);

  const setMessageTranslationStatus = useCallback((messageId: string, status: TranslationUiStatus) => {
    translationStatusRef.current[messageId] = status;
    setTranslationStatus((prev) => ({ ...prev, [messageId]: status }));
  }, []);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const pollConversations = useCallback(async (force = false) => {
    if (!pollingEnabled) return;
    if (!force && !isPollingTabActive()) return;
    const res = await barberListPrivateConversationsRemote({ barberId, email: barberEmail });
    if (!res.ok) return;
    setConversations(res.conversations);
    setSelectedId((prev) => {
      if (prev && res.conversations.some((c) => c.id === prev)) return prev;
      return res.conversations[0]?.id ?? null;
    });
  }, [barberId, barberEmail, pollingEnabled]);

  const handleRealtimeInbound = useCallback(
    (message: BarberPrivateMessageRow, conversationId: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, last_message_at: message.created_at } : c,
        ),
      );
      if (selectedId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          );
        });
      }
    },
    [selectedId],
  );

  const alertState = useBarberCommunicationAlerts(
    barberId,
    barberEmail,
    conversations,
    selectedId,
    handleRealtimeInbound,
    () => void pollConversations(true),
    pollingEnabled,
  );

  const realtimeConnected = alertState.realtimeStatus === 'connected';
  const pollListMs = realtimeConnected
    ? POLL_MS.PRIVATE_CHAT_LIST * POLL_MS.REALTIME_CONNECTED_MULTIPLIER
    : POLL_MS.PRIVATE_CHAT_LIST;
  const pollMessagesMs = realtimeConnected
    ? POLL_MS.PRIVATE_CHAT_MESSAGES * POLL_MS.REALTIME_CONNECTED_MULTIPLIER
    : POLL_MS.PRIVATE_CHAT_MESSAGES;

  const loadMessages = useCallback(
    async (conversationId: string, opts?: { bootstrap?: boolean }) => {
      if (!pollingEnabled && !opts?.bootstrap) return;
      if (!opts?.bootstrap && !isPollingTabActive()) return;
      if (opts?.bootstrap) {
        setLoadingMsgs(true);
      } else {
        setRefreshingMsgs(true);
      }
      try {
        const res = await barberListPrivateMessagesRemote({
          barberId,
          email: barberEmail,
          conversationId,
        });
        if (!res.ok) {
          if (opts?.bootstrap) {
            toast.error(res.error);
            setMessages([]);
          }
          return;
        }
        if (res.expired) {
          setMessages([]);
          void pollConversations(true);
          return;
        }
        setMessages(res.messages);
      } finally {
        if (opts?.bootstrap) setLoadingMsgs(false);
        else setRefreshingMsgs(false);
      }
    },
    [barberId, barberEmail, pollConversations, pollingEnabled],
  );

  useEffect(() => {
    if (!pollingEnabled) return;
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      await pollConversations(true);
      if (!cancelled) setLoadingList(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pollConversations, pollingEnabled]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!pollingEnabled) return;
    const iv = window.setInterval(() => {
      void pollConversations();
    }, pollListMs);
    return () => window.clearInterval(iv);
  }, [pollConversations, pollListMs, pollingEnabled]);

  useEffect(() => {
    if (!pollingEnabled) return;
    if (!selectedId) {
      setMessages([]);
      setLoadingMsgs(false);
      setRefreshingMsgs(false);
      return;
    }
    void loadMessages(selectedId, { bootstrap: true });
    const iv = window.setInterval(() => {
      void loadMessages(selectedId);
    }, pollMessagesMs);
    return () => window.clearInterval(iv);
  }, [selectedId, loadMessages, pollMessagesMs, pollingEnabled]);

  const msLeft = useMemo(() => (selected ? remainingMs(selected.expires_at) : 0), [selected, tick]);

  useEffect(() => {
    if (!isDiamond || !selectedId || !pollingEnabled || msLeft <= 0) return;

    const runShiftIntercept = async () => {
      if (shiftInterceptInFlightRef.current || !isPollingTabActive()) return;
      shiftInterceptInFlightRef.current = true;
      try {
        const r = await customerDigitalShiftInterceptRemote(selectedId);
        if (r.ok && r.replied) {
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedId ? { ...c, shift_manual_takeover: false } : c)),
          );
          await loadMessages(selectedId);
          await pollConversations(true);
        }
      } finally {
        shiftInterceptInFlightRef.current = false;
      }
    };

    void runShiftIntercept();
    const iv = window.setInterval(() => void runShiftIntercept(), POLL_MS.BARBER_SHIFT_INTERCEPT);
    return () => window.clearInterval(iv);
  }, [isDiamond, selectedId, pollingEnabled, msLeft, loadMessages, pollConversations]);

  useEffect(() => {
    translationInFlightRef.current.clear();
    translationStatusRef.current = {};
    setTranslations({});
    setTranslationStatus({});
  }, [selectedId]);

  useEffect(() => {
    if (!isDiamond || messages.length === 0 || !selected) return;

    for (const m of messages) {
      const isInbound =
        m.sender_id === selected.customer_id || Boolean(m.is_digital_shift_reply);
      if (!isInbound) continue;
      if (!barberDashboardTranslateTarget(m.body)) continue;

      const status = translationStatusRef.current[m.id];
      if (status && status !== 'loading') continue;
      if (status === 'loading' || translationInFlightRef.current.has(m.id)) continue;

      translationInFlightRef.current.add(m.id);
      setMessageTranslationStatus(m.id, 'loading');

      void (async (messageId: string, body: string) => {
        try {
          const tr = await translateChatLineRemote({ text: body, target: 'ar', messageId });
          if (!tr.ok) {
            setMessageTranslationStatus(messageId, 'failed');
            return;
          }
          if (!tr.configured) {
            setMessageTranslationStatus(messageId, 'unavailable');
            return;
          }
          if (tr.text && tr.text !== body) {
            setTranslations((prev) => ({ ...prev, [messageId]: tr.text }));
            setMessageTranslationStatus(messageId, 'ready');
          } else {
            setMessageTranslationStatus(messageId, 'noop');
          }
        } finally {
          translationInFlightRef.current.delete(messageId);
        }
      })(m.id, m.body);
    }
  }, [messages, isDiamond, selected, setMessageTranslationStatus]);

  const send = async () => {
    if (!selectedId || !draft.trim() || msLeft <= 0) return;
    setSending(true);
    try {
      const res = await barberSendPrivateMessageRemote({
        barberId,
        email: barberEmail,
        conversationId: selectedId,
        body: draft,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setDraft('');
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, shift_manual_takeover: true } : c)),
      );
      await loadMessages(selectedId);
      await pollConversations(true);
    } finally {
      setSending(false);
    }
  };

  const resumeShift = async () => {
    if (!selectedId || !isDiamond) return;
    setResumingShift(true);
    try {
      const res = await barberResumeDigitalShiftRemote({
        barberId,
        email: barberEmail,
        conversationId: selectedId,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, shift_manual_takeover: false } : c)),
      );
      toast.success('عاد المناوب للرد على هذا العميل.');
      await loadMessages(selectedId);
    } finally {
      setResumingShift(false);
    }
  };

  return (
    <>
      {!isWorkbench ? (
        <BarberChatAlertSettingsCard
          barberId={barberId}
          barberEmail={barberEmail}
          alertState={alertState}
        />
      ) : null}
      <Card
        className={
          isWorkbench
            ? 'overflow-hidden border-slate-300/70 shadow-md dark:border-slate-600/50'
            : 'border-primary/20'
        }
      >
      <CardHeader
        className={
          isWorkbench
            ? 'border-b border-slate-800/20 bg-slate-900 px-4 py-3 text-white dark:bg-slate-950'
            : 'pb-2'
        }
      >
        <CardTitle
          className={`flex flex-wrap items-center gap-2 ${isWorkbench ? 'text-lg font-bold text-white' : 'text-lg'}`}
        >
          <MessageCircle className={`h-5 w-5 ${isWorkbench ? 'text-emerald-300' : 'text-primary'}`} />
          شات العملاء المباشر
          {isDiamond ? (
            <Badge className={isWorkbench ? 'bg-violet-500/90 text-white' : 'bg-accent text-accent-foreground'}>
              ماسي — ترجمة تلقائية
            </Badge>
          ) : (
            <Badge variant={isWorkbench ? 'secondary' : 'secondary'} className={isWorkbench ? 'bg-white/15 text-white' : ''}>
              ذهبي
            </Badge>
          )}
        </CardTitle>
        <CardDescription
          className={
            isWorkbench
              ? 'text-sm leading-relaxed text-slate-300'
              : 'text-sm leading-relaxed'
          }
        >
          {isWorkbench
            ? 'إدارة المحادثات النشطة — ردّ سريع وواضح. الجلسة ساعة واحدة لكل عميل.'
            : 'تظهر هنا الجلسات النشطة فقط (ساعة واحدة لكل جلسة). يبدأ العميل المحادثة من التطبيق؛'}
          {isDiamond && !isWorkbench ? (
            <span className="mt-1 block text-amber-700 dark:text-amber-300">
              المناوب يردّ بلغة العميل — تظهر ترجمة عربية تحت رسائل العميل والمناوب الأجنبية.
            </span>
          ) : isDiamond && isWorkbench ? (
            <span className="mt-1 block text-amber-200/90">
              ترجمة عربية تلقائية تحت رسائل العميل وردود المناوب الأجنبية.
            </span>
          ) : null}
          {!isWorkbench &&
            (realtimeConnected
              ? ' تُحدَّث الرسائل فوراً عبر `Supabase Realtime`.'
              : ' تُحدَّث الرسائل تلقائياً كل بضع ثوانٍ.')}
        </CardDescription>
      </CardHeader>
      <CardContent className={`space-y-4 ${isWorkbench ? 'bg-slate-50/80 p-4 dark:bg-slate-950/40' : ''}`}>
        {loadingList ? (
          <div className={`flex items-center gap-2 ${isWorkbench ? 'text-base font-medium text-slate-700 dark:text-slate-200' : 'text-sm text-muted-foreground'}`}>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري تحميل المحادثات…
          </div>
        ) : conversations.length === 0 ? (
          <p className={isWorkbench ? 'text-base font-medium text-slate-700 dark:text-slate-200' : 'text-sm text-muted-foreground'}>
            لا توجد جلسات شات نشطة حالياً. عندما يفتح عميل محادثة من التطبيق ستظهر هنا.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label className={isWorkbench ? 'text-sm font-semibold text-slate-800 dark:text-slate-100' : 'text-xs text-muted-foreground'}>
                المحادثة
              </Label>
              <select
                className={`flex w-full rounded-md border border-input bg-background px-3 ${
                  isWorkbench ? 'h-11 text-base font-medium text-foreground' : 'h-10 text-sm'
                }`}
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value || null)}
              >
                {conversations.map((c) => (
                  <option key={c.id} value={c.id}>
                    عميل {c.customer_id.slice(0, 8)}… — حتى{' '}
                    {new Date(c.expires_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </option>
                ))}
              </select>
            </div>

            {selected ? (
              <div
                className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                  isWorkbench
                    ? 'border-slate-300/80 bg-white text-sm font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
                    : 'border-border/70 bg-muted/30 text-xs text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Hourglass className="h-3.5 w-3.5" />
                  <span>الوقت المتبقي للجلسة</span>
                </div>
                <span
                  className={msLeft <= 0 ? 'font-semibold text-destructive' : 'font-semibold text-primary'}
                  dir="ltr"
                >
                  {formatMmSs(msLeft)}
                </span>
              </div>
            ) : null}

            {selected && isDiamond && selected.shift_manual_takeover ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300/70 bg-amber-50/80 px-3 py-2 dark:border-amber-700/50 dark:bg-amber-950/30">
                <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-100">
                  أنت تتابع هذه المحادثة يدوياً — المناوب متوقف مؤقتاً.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-amber-400/60"
                  disabled={resumingShift}
                  onClick={() => void resumeShift()}
                >
                  {resumingShift ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                  <span className="mr-1">أعِد المناوب للرد</span>
                </Button>
              </div>
            ) : null}

            <div
              className={`relative space-y-2 overflow-y-auto rounded-md border p-3 ${
                isWorkbench
                  ? 'max-h-96 border-slate-300/80 bg-white dark:border-slate-600 dark:bg-slate-900/60'
                  : 'max-h-72 border-border/60'
              }`}
            >
              {refreshingMsgs ? (
                <p className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-background/90 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm">
                  يُحدَّث…
                </p>
              ) : null}
              {loadingMsgs && messages.length === 0 ? (
                <div className={`flex items-center gap-2 ${isWorkbench ? 'text-sm font-medium text-slate-600' : 'text-xs text-muted-foreground'}`}>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  جاري تحميل الرسائل…
                </div>
              ) : messages.length === 0 ? (
                <p className={`text-center ${isWorkbench ? 'text-sm font-medium text-slate-600' : 'text-xs text-muted-foreground'}`}>
                  لا رسائل بعد في هذه الجلسة.
                </p>
              ) : !selected ? null : (
                messages.map((m) => {
                  const isBarber = m.sender_id !== selected.customer_id;
                  return (
                    <div key={m.id} className={`flex ${isBarber ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[88%] rounded-lg p-3 ${
                          isBarber
                            ? 'bg-primary text-base text-primary-foreground'
                            : isWorkbench
                              ? 'bg-slate-200 text-base font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                              : 'bg-muted text-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        {isBarber && m.is_digital_shift_reply ? (
                          <Badge variant="secondary" className="mt-1 text-[10px]">
                            🌙 المناوب الرقمي
                          </Badge>
                        ) : null}
                        {isDiamond && translations[m.id] ? (
                          <div
                            className={cn(
                              'mt-2 rounded-md border px-2 py-1.5 text-[11px] leading-relaxed',
                              isBarber
                                ? 'border-white/25 bg-black/10'
                                : 'border-amber-400/35 bg-amber-500/10 text-foreground',
                            )}
                          >
                            <div className="mb-0.5 flex items-center gap-1 font-semibold opacity-95">
                              <Languages className="h-3 w-3 shrink-0" />
                              <span>بالعربية للمتابعة</span>
                            </div>
                            <p className="whitespace-pre-wrap break-words">{translations[m.id]}</p>
                          </div>
                        ) : isDiamond && translationStatus[m.id] === 'loading' ? (
                          <p className="mt-1.5 flex items-center gap-1 text-[10px] opacity-80">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            جاري الترجمة…
                          </p>
                        ) : isDiamond && translationStatus[m.id] === 'unavailable' ? (
                          <p className="mt-1.5 text-[10px] opacity-75">
                            الترجمة غير متاحة حالياً من المنصة — تواصل مع الدعم إن استمرّ الأمر.
                          </p>
                        ) : isDiamond && translationStatus[m.id] === 'failed' ? (
                          <p className="mt-1.5 text-[10px] opacity-75">تعذّرت الترجمة — أعد تحميل الصفحة.</p>
                        ) : null}
                        <p className="mt-1 text-[10px] opacity-75">
                          {new Date(m.created_at).toLocaleString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={msLeft > 0 ? 'اكتب ردك للعميل…' : 'انتهت الجلسة'}
                value={draft}
                disabled={msLeft <= 0}
                onChange={(e) => setDraft(e.target.value)}
                className={`flex-1 ${isWorkbench ? 'h-11 text-base font-medium' : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <Button
                type="button"
                size={isWorkbench ? 'default' : 'icon'}
                className={isWorkbench ? 'h-11 px-4' : ''}
                disabled={!draft.trim() || msLeft <= 0 || sending}
                onClick={() => void send()}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isWorkbench ? <span className="mr-1">إرسال</span> : null}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
      {isWorkbench ? (
        <BarberChatAlertSettingsCard
          barberId={barberId}
          barberEmail={barberEmail}
          alertState={alertState}
        />
      ) : null}
    </>
  );
}
