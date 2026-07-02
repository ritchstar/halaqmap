import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { MessageCircle, Languages, User, Store, Hourglass, RotateCcw, Send, Loader2, CircleHelp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SubscriptionTier } from '@/lib/index';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import {
  appendPrivateMessage,
  clearExpiredPrivateConversations,
  getOrCreatePrivateChatSession,
  getPrivateChatRemainingMs,
  isPrivateChatExpired,
  loadPrivateConversation,
  restartPrivateChatSession,
  type PrivateChatMessage,
} from '@/lib/customerPrivateChat';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { useCustomerBarberPrivateRealtimeChat } from '@/hooks/useCustomerBarberPrivateRealtimeChat';
import {
  CUSTOMER_CHAT_PREVIEW_TITLE,
  CUSTOMER_CHAT_PREVIEW_COMPACT_TITLE,
  CUSTOMER_CHAT_PREVIEW_INTRO,
  CUSTOMER_CHAT_THREAD_PREFIX,
  CUSTOMER_CHAT_SESSION_LABEL,
  CUSTOMER_CHAT_STATUS_LIVE,
  CUSTOMER_CHAT_STATUS_LOCAL,
  CUSTOMER_CHAT_TIER_DIAMOND,
  CUSTOMER_CHAT_TIER_GOLD,
  CUSTOMER_CHAT_GOLD_STEPS,
  CUSTOMER_CHAT_DIAMOND_STEPS,
  CUSTOMER_CHAT_PRIVACY_GOLD,
  CUSTOMER_CHAT_PRIVACY_DIAMOND,
  CUSTOMER_CHAT_LIVE_UNAVAILABLE_TITLE,
  CUSTOMER_CHAT_LIVE_UNAVAILABLE_HINT,
  CUSTOMER_CHAT_EMPTY_LIVE,
  CUSTOMER_CHAT_EMPTY_LOCAL,
  CUSTOMER_CHAT_FOOTER_LIVE,
  CUSTOMER_CHAT_FOOTER_LOCAL,
  CUSTOMER_CHAT_DIAMOND_BADGE,
  CUSTOMER_CHAT_GOLD_BADGE,
  CUSTOMER_CHAT_STEPS_HEADING,
  CUSTOMER_CHAT_TRANSLATION_DEMO_CUSTOMER,
  CUSTOMER_CHAT_TRANSLATION_DEMO_BARBER,
} from '@/config/customerBarberChatPreviewCopy';

type Tier = SubscriptionTier.GOLD | SubscriptionTier.DIAMOND;

function Bubble({
  side,
  label,
  children,
  compact,
}: {
  side: 'customer' | 'barber';
  label: ReactNode;
  children: ReactNode;
  compact?: boolean;
}) {
  const isCustomer = side === 'customer';
  return (
    <div
      className={cn(
        'flex min-w-0 w-full max-w-[92%] flex-col gap-1',
        isCustomer ? 'items-end mr-0 ml-auto' : 'items-start mr-auto ml-0'
      )}
    >
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
        {isCustomer ? <User className="w-3 h-3 shrink-0" /> : <Store className="w-3 h-3 shrink-0" />}
        <span className="break-words">{label}</span>
      </div>
      <div
        className={cn(
          'min-w-0 max-w-full break-words rounded-2xl px-3 py-2 text-sm leading-relaxed text-right',
          isCustomer ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md',
          compact && 'text-xs py-1.5 px-2.5'
        )}
      >
        {children}
      </div>
    </div>
  );
}

function TranslationHint({
  detectedLabel,
  translationLabel,
  translationText,
  compact,
}: {
  detectedLabel: string;
  translationLabel: string;
  translationText: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'barber-contact-inner min-w-0 w-full max-w-[92%] rounded-lg border border-accent/40 bg-accent/5 px-2.5 py-2 space-y-1',
        compact ? 'text-[10px]' : 'text-xs'
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Languages className="w-3.5 h-3.5 text-accent shrink-0" />
        <Badge variant="outline" className="text-[10px] h-5 border-accent/50 text-accent">
          {detectedLabel}
        </Badge>
      </div>
      <p className="break-words text-muted-foreground">
        <span className="font-semibold text-foreground/80">{translationLabel}</span> {translationText}
      </p>
    </div>
  );
}

export function CustomerBarberChatPreview({
  tier,
  barberId,
  barberName,
  previewListing,
  compact,
  className,
  injectMessage,
  onInjectMessageSent,
}: {
  tier: Tier;
  barberId: string;
  barberName: string;
  /** إدراج معاينة عبر نظام الرصد الذكي — تظهر علامة سرّية للفريق */
  previewListing?: boolean;
  compact?: boolean;
  className?: string;
  /** رسالة تُرسل تلقائياً عند جاهزية الشات (مثلاً من نموذج الزيارة المنزلية) */
  injectMessage?: string | null;
  onInjectMessageSent?: () => void;
}) {
  const isDiamond = tier === SubscriptionTier.DIAMOND;
  const usageSteps = isDiamond ? CUSTOMER_CHAT_DIAMOND_STEPS : CUSTOMER_CHAT_GOLD_STEPS;
  const useLive = isSupabaseConfigured();
  const previewSecretMarker = previewListing ? (
    <span className="text-muted-foreground font-normal" title="إدراج معاينة">
      {' '}
      *
    </span>
  ) : null;
  const [liveRestart, setLiveRestart] = useState(0);
  const live = useCustomerBarberPrivateRealtimeChat(useLive ? barberId : undefined, {
    enableDiamondTranslation: isDiamond,
    restartSignal: liveRestart,
  });

  const [session, setSession] = useState(() => getOrCreatePrivateChatSession(barberId));
  const [localMessages, setLocalMessages] = useState<PrivateChatMessage[]>(() =>
    loadPrivateConversation(barberId, session.sessionId)
  );
  const [draft, setDraft] = useState('');
  const [remainingMsLocal, setRemainingMsLocal] = useState(() => getPrivateChatRemainingMs(session));

  useEffect(() => {
    clearExpiredPrivateConversations();
    const next = getOrCreatePrivateChatSession(barberId);
    setSession(next);
    setLocalMessages(loadPrivateConversation(barberId, next.sessionId));
  }, [barberId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingMsLocal(getPrivateChatRemainingMs(session));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session]);

  const localExpired = isPrivateChatExpired(session);

  const liveMode =
    useLive &&
    (live.status === 'ready' || live.status === 'loading' || live.status === 'expired_ui');
  const localPreviewOnly = !useLive;

  const sendLocalMessage = useCallback(() => {
    const text = draft.trim();
    if (!text || localExpired) return;
    const afterCustomer = appendPrivateMessage(barberId, session, 'customer', text);
    setLocalMessages(afterCustomer);
    setDraft('');

    window.setTimeout(() => {
      if (isPrivateChatExpired(session)) return;
      const reply = isDiamond
        ? 'تم استلام رسالتك. يسعدنا خدمتك، هل ترغب بتأكيد موعد خلال ساعة؟'
        : 'تم استلام رسالتك. يسعدنا خدمتك، ما الوقت المناسب لك؟';
      const afterReply = appendPrivateMessage(barberId, session, 'barber', reply);
      setLocalMessages(afterReply);
    }, 900);
  }, [barberId, draft, isDiamond, localExpired, session]);

  async function sendLiveMessage() {
    const text = draft.trim();
    if (!text || live.expiredUi || live.remainingMs <= 0) return;
    const res = await live.send(text);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setDraft('');
  }

  function startNewLocalSession() {
    const next = restartPrivateChatSession(barberId);
    setSession(next);
    setLocalMessages([]);
    setDraft('');
    setRemainingMsLocal(getPrivateChatRemainingMs(next));
  }

  function startNewLiveSession() {
    setDraft('');
    setLiveRestart((n) => n + 1);
  }

  const remainingLabel = useMemo(() => {
    const ms = liveMode ? live.remainingMs : remainingMsLocal;
    const totalSec = Math.floor(Math.max(0, ms) / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [liveMode, live.remainingMs, remainingMsLocal]);

  const expired = liveMode ? live.expiredUi : localExpired;

  const injectRef = useRef<string | null>(null);
  useEffect(() => {
    const text = injectMessage?.trim();
    if (!text || injectRef.current === text) return;
    if (expired) return;

    const run = async () => {
      if (liveMode && live.status === 'ready') {
        const res = await live.send(text);
        if (res.ok) {
          injectRef.current = text;
          onInjectMessageSent?.();
          toast.success('تم إرسال طلب التواصل عبر الشات.');
        } else if (res.error) {
          toast.error(res.error);
        }
        return;
      }
      if (localPreviewOnly && !localExpired) {
        const afterCustomer = appendPrivateMessage(barberId, session, 'customer', text);
        setLocalMessages(afterCustomer);
        injectRef.current = text;
        onInjectMessageSent?.();
        toast.success('تم إرسال طلب التواصل (معاينة محلية).');
      }
    };

    void run();
  }, [
    barberId,
    expired,
    injectMessage,
    live,
    liveMode,
    localPreviewOnly,
    localExpired,
    onInjectMessageSent,
    session,
  ]);

  const liveErrorBanner =
    useLive && live.status === 'start_failed' ? (
      <Alert className="barber-contact-inner text-right border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/20">
        <AlertTitle>{CUSTOMER_CHAT_LIVE_UNAVAILABLE_TITLE}</AlertTitle>
        <AlertDescription className="barber-contact-prose text-xs leading-relaxed">
          {live.errorHint || CUSTOMER_CHAT_LIVE_UNAVAILABLE_HINT}
        </AlertDescription>
      </Alert>
    ) : null;

  const chatBody = (
    <div className={cn('barber-contact-inner min-w-0 max-w-full overflow-hidden rounded-xl border bg-background/80', compact && 'mt-1')}>
      <div className="flex flex-col gap-1.5 border-b bg-muted/40 px-3 py-2">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] leading-none text-muted-foreground">{CUSTOMER_CHAT_THREAD_PREFIX}</p>
              <p
                className={cn('truncate font-semibold leading-snug', compact ? 'text-xs' : 'text-sm')}
                title={typeof barberName === 'string' ? barberName : undefined}
              >
                {barberName}
                {previewSecretMarker}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className={cn('whitespace-nowrap text-[10px] leading-none', compact && 'px-1.5 py-0.5')}
            >
              {liveMode ? CUSTOMER_CHAT_STATUS_LIVE : CUSTOMER_CHAT_STATUS_LOCAL}
            </Badge>
            <Badge
              variant="outline"
              className={cn('whitespace-nowrap text-[10px] leading-none', compact && 'px-1.5 py-0.5')}
            >
              {isDiamond ? CUSTOMER_CHAT_TIER_DIAMOND : CUSTOMER_CHAT_TIER_GOLD}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-b bg-background px-3 py-2 text-[11px] text-muted-foreground">
        <div className="flex min-w-0 items-center gap-1.5">
          <Hourglass className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap">{CUSTOMER_CHAT_SESSION_LABEL}</span>
        </div>
        <span className={cn('shrink-0 font-semibold tabular-nums', expired ? 'text-destructive' : 'text-primary')} dir="ltr">
          {remainingLabel}
        </span>
      </div>
      <ScrollArea className={cn('min-w-0 max-w-full', compact ? 'h-[168px]' : 'h-[220px]')}>
        <div className={cn('min-w-0 max-w-full space-y-3 p-3', compact && 'space-y-2 p-2')}>
          {liveMode && live.status === 'loading' ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري تهيئة الشات الحي…
            </div>
          ) : liveMode && live.messages.length === 0 ? (
            <div className="barber-contact-prose rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              {CUSTOMER_CHAT_EMPTY_LIVE}
            </div>
          ) : liveMode ? (
            live.messages.map((m) => (
              <div key={m.id} className="space-y-1">
                <Bubble
                  side={m.role === 'customer' ? 'customer' : 'barber'}
                  label={
                    m.role === 'customer' ? (
                      'أنت (العميل)'
                    ) : (
                      <>
                        {barberName}
                        {previewSecretMarker}
                      </>
                    )
                  }
                  compact={compact}
                >
                  {m.role === 'customer' && /[A-Za-z]/.test(m.body) ? (
                    <span dir="ltr" className="inline-block w-full text-left">
                      {m.body}
                    </span>
                  ) : (
                    m.body
                  )}
                  {isDiamond && m.translated ? (
                    <p
                      className={cn(
                        'mt-1.5 border-t pt-1.5 text-[10px] opacity-90',
                        m.role === 'customer' ? 'border-primary-foreground/25' : 'border-border'
                      )}
                    >
                      ترجمة للطرف الآخر: {m.translated}
                    </p>
                  ) : null}
                </Bubble>
              </div>
            ))
          ) : localPreviewOnly && localMessages.length === 0 ? (
            <div className="barber-contact-prose rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              {CUSTOMER_CHAT_EMPTY_LOCAL}
            </div>
          ) : localPreviewOnly ? (
            localMessages.map((m) => (
              <Bubble
                key={m.id}
                side={m.sender === 'customer' ? 'customer' : 'barber'}
                label={
                  m.sender === 'customer' ? (
                    'أنت (العميل)'
                  ) : (
                    <>
                      {barberName}
                      {previewSecretMarker}
                    </>
                  )
                }
                compact={compact}
              >
                {m.sender === 'customer' && /[A-Za-z]/.test(m.text) ? (
                  <span dir="ltr" className="inline-block w-full text-left">
                    {m.text}
                  </span>
                ) : (
                  m.text
                )}
              </Bubble>
            ))
          ) : (
            <div className="barber-contact-prose rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              {CUSTOMER_CHAT_EMPTY_LIVE}
            </div>
          )}

          {localPreviewOnly && isDiamond && localMessages.length > 0 && (
            <>
              <div className="flex w-full flex-col items-end gap-1">
                <TranslationHint
                  compact={compact}
                  detectedLabel="مثال: الإنجليزية"
                  translationLabel="تعلّم:"
                  translationText={CUSTOMER_CHAT_TRANSLATION_DEMO_CUSTOMER}
                />
              </div>
              <div className="flex w-full flex-col items-start gap-1">
                <TranslationHint
                  compact={compact}
                  detectedLabel="مثال: العربية"
                  translationLabel="تعلّم:"
                  translationText={CUSTOMER_CHAT_TRANSLATION_DEMO_BARBER}
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      <div className="border-t bg-muted/10 px-3 py-2">
        {expired ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 flex-1 break-words text-xs text-destructive">انتهت الجلسة. يمكنك بدء جلسة جديدة.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={liveMode ? startNewLiveSession : startNewLocalSession}
              className="shrink-0 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              جلسة جديدة
            </Button>
          </div>
        ) : liveMode && live.status === 'loading' ? (
          <p className="text-center text-xs text-muted-foreground">جاري الربط…</p>
        ) : useLive && live.status === 'start_failed' ? (
          <p className="text-center text-xs text-destructive">
            تعذّر بدء الشات الحي. جرّب واتساب أو الهاتف من بطاقة الصالون.
          </p>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="اكتب رسالتك…"
              className="min-w-0 flex-1 h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (liveMode) void sendLiveMessage();
                  else if (localPreviewOnly) sendLocalMessage();
                }
              }}
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => {
                if (liveMode) void sendLiveMessage();
                else if (localPreviewOnly) sendLocalMessage();
              }}
              disabled={!draft.trim() || (liveMode && live.status === 'loading')}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="border-t bg-muted/20 px-3 py-2 text-center text-[10px] leading-snug text-muted-foreground">
        <p className="barber-contact-prose">{liveMode ? CUSTOMER_CHAT_FOOTER_LIVE : CUSTOMER_CHAT_FOOTER_LOCAL}</p>
      </div>
    </div>
  );

  const body = (
    <>
      {liveErrorBanner}
      {chatBody}
      <div className="space-y-2">
        <p className={cn('font-semibold text-foreground', compact ? 'text-[10px]' : 'text-xs')}>
          {CUSTOMER_CHAT_STEPS_HEADING}
        </p>
        <ol className={cn('barber-contact-prose list-none space-y-1.5 text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
          {usageSteps.map((line, index) => (
            <li key={line} className="flex items-start gap-2">
              <span
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  isDiamond ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary',
                )}
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="min-w-0 break-words">{line}</span>
            </li>
          ))}
        </ol>
      </div>
      <p
        className={cn(
          'barber-contact-prose break-words rounded-lg border border-border/70 bg-muted/25 p-2.5 leading-relaxed text-muted-foreground',
          compact ? 'text-[10px]' : 'text-[11px]',
        )}
      >
        {isDiamond ? CUSTOMER_CHAT_PRIVACY_DIAMOND : CUSTOMER_CHAT_PRIVACY_GOLD}
      </p>
    </>
  );

  if (compact) {
    return (
      <div className={cn('barber-contact-inner min-w-0 max-w-full overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-br from-primary/5 to-muted/30', className)}>
        <div className="space-y-2 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 text-xs font-bold break-words">{CUSTOMER_CHAT_PREVIEW_COMPACT_TITLE}</span>
            {isDiamond ? (
              <Badge className="mr-auto h-5 bg-accent text-[10px] text-accent-foreground">
                {CUSTOMER_CHAT_DIAMOND_BADGE}
              </Badge>
            ) : (
              <Badge variant="secondary" className="mr-auto h-5 text-[10px]">
                {CUSTOMER_CHAT_GOLD_BADGE}
              </Badge>
            )}
          </div>
          {body}
        </div>
      </div>
    );
  }

  return (
    <Card
      id="customer-barber-chat-preview"
      className={cn(
        'barber-contact-inner min-w-0 max-w-full overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-muted/20',
        isDiamond && 'border-accent/30 from-accent/10',
        className,
      )}
    >
      <CardHeader className="min-w-0 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base leading-snug break-words sm:text-lg">
          <CircleHelp className="h-5 w-5 text-primary shrink-0" />
          {CUSTOMER_CHAT_PREVIEW_TITLE}
          {isDiamond ? (
            <Badge className="gap-1 bg-accent text-accent-foreground">
              <Languages className="h-3 w-3" />
              {CUSTOMER_CHAT_DIAMOND_BADGE}
            </Badge>
          ) : (
            <Badge variant="secondary">{CUSTOMER_CHAT_GOLD_BADGE}</Badge>
          )}
        </CardTitle>
        <CardDescription className="barber-contact-prose text-sm leading-relaxed">
          {CUSTOMER_CHAT_PREVIEW_INTRO}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 overflow-hidden pt-0">{body}</CardContent>
    </Card>
  );
}
