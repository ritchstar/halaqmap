import { useEffect, useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { MessageCircle, Languages, Sparkles, User, Store, Hourglass, RotateCcw, Send, Loader2 } from 'lucide-react';
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

type Tier = SubscriptionTier.GOLD | SubscriptionTier.DIAMOND;

const GOLD_PERKS = [
  'شات كتابي مباشر مع الصالون من داخل حلاق ماب',
  'الاستفسار عن المواعيد والخدمات دون مغادرة التطبيق',
];

const DIAMOND_PERKS = [
  'كل مزايا الشات في الباقة الذهبية',
  'ترجمة تلقائية للرسائل بحسب لغة الكتابة (يُكتشف من أحرف النص) للعميل والحلاق معاً',
];

function Bubble({
  side,
  label,
  children,
  compact,
}: {
  side: 'customer' | 'barber';
  label: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const isCustomer = side === 'customer';
  return (
    <div
      className={cn(
        'flex flex-col gap-1 max-w-[92%]',
        isCustomer ? 'items-end mr-0 ml-auto' : 'items-start mr-auto ml-0'
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {isCustomer ? <User className="w-3 h-3" /> : <Store className="w-3 h-3" />}
        <span>{label}</span>
      </div>
      <div
        className={cn(
          'rounded-2xl px-3 py-2 text-sm leading-relaxed text-right',
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
        'w-full max-w-[92%] rounded-lg border border-accent/40 bg-accent/5 px-2.5 py-2 space-y-1',
        compact ? 'text-[10px]' : 'text-xs'
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Languages className="w-3.5 h-3.5 text-accent shrink-0" />
        <Badge variant="outline" className="text-[10px] h-5 border-accent/50 text-accent">
          {detectedLabel}
        </Badge>
      </div>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground/80">{translationLabel}</span> {translationText}
      </p>
    </div>
  );
}

export function CustomerBarberChatPreview({
  tier,
  barberId,
  barberName,
  compact,
  className,
}: {
  tier: Tier;
  barberId: string;
  barberName: string;
  compact?: boolean;
  className?: string;
}) {
  const isDiamond = tier === SubscriptionTier.DIAMOND;
  const perks = isDiamond ? DIAMOND_PERKS : GOLD_PERKS;
  const useLive = isSupabaseConfigured();
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

  const liveErrorBanner =
    useLive && (live.status === 'auth_failed' || live.status === 'start_failed') ? (
      <Alert variant="destructive" className="text-right">
        <AlertTitle>تعذّر تشغيل الشات الحي عبر Supabase</AlertTitle>
        <AlertDescription className="text-xs leading-relaxed">
          {live.errorHint || 'تحقق من إعدادات المشروع والمهاجرات (migration 42) وتفعيل تسجيل الدخول المجهول للعملاء إن لزم.'}
        </AlertDescription>
      </Alert>
    ) : null;

  const chatBody = (
    <div className={cn('rounded-xl border bg-background/80 overflow-hidden', compact ? 'mt-2' : 'mt-4')}>
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <MessageCircle className="w-4 h-4 text-primary shrink-0" />
          <span className={cn('font-semibold truncate', compact ? 'text-xs' : 'text-sm')}>
            محادثة مع {barberName}
          </span>
        </div>
        <Badge variant="secondary" className={cn('shrink-0', compact && 'text-[10px] px-1.5 py-0')}>
          {liveMode ? 'Supabase Realtime' : 'معاينة محلية'}
          {isDiamond ? ' · ماسي' : ' · ذهبي'}
        </Badge>
      </div>
      <div className="border-b bg-background px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Hourglass className="w-3.5 h-3.5" />
          <span>جلسة خاصة (تنتهي بعد 60 دقيقة)</span>
        </div>
        <span className={cn('font-semibold', expired ? 'text-destructive' : 'text-primary')} dir="ltr">
          {remainingLabel}
        </span>
      </div>
      <ScrollArea className={cn(compact ? 'h-[168px]' : 'h-[220px]')}>
        <div className={cn('space-y-3 p-3', compact && 'space-y-2 p-2')}>
          {liveMode && live.status === 'loading' ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري تهيئة الشات الحي…
            </div>
          ) : liveMode && live.messages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground text-center">
              اكتب أول رسالة — الجلسة مؤمنة بسياسات RLS وتُحدَّث لحظياً عبر Supabase.
            </div>
          ) : liveMode ? (
            live.messages.map((m) => (
              <div key={m.id} className="space-y-1">
                <Bubble
                  side={m.role === 'customer' ? 'customer' : 'barber'}
                  label={m.role === 'customer' ? 'أنت (العميل)' : barberName}
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
          ) : localMessages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground text-center">
              ابدأ محادثة خاصة — معاينة محلية عندما لا يتوفر Supabase أو عند تعذّر الجلسة الحية.
            </div>
          ) : (
            localMessages.map((m) => (
              <Bubble
                key={m.id}
                side={m.sender === 'customer' ? 'customer' : 'barber'}
                label={m.sender === 'customer' ? 'أنت (العميل)' : barberName}
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
          )}

          {!liveMode && isDiamond && localMessages.length > 0 && (
            <>
              <div className="flex w-full flex-col items-end gap-1">
                <TranslationHint
                  compact={compact}
                  detectedLabel="مثال: الإنجليزية"
                  translationLabel="يظهر للصالون:"
                  translationText="في الوضع الحي تُستدعى خدمة ترجمة آمنة من السيرفر (مفتاح اختياري)."
                />
              </div>
              <div className="flex w-full flex-col items-start gap-1">
                <TranslationHint
                  compact={compact}
                  detectedLabel="مثال: العربية"
                  translationLabel="يظهر للعميل:"
                  translationText="نفس آلية الترجمة للباقة الماسية عبر واجهة برمجة التطبيقات."
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      <div className="border-t bg-muted/10 px-3 py-2">
        {expired ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-destructive">انتهت الجلسة. يمكنك بدء جلسة جديدة.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={liveMode ? startNewLiveSession : startNewLocalSession}
              className="gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              جلسة جديدة
            </Button>
          </div>
        ) : liveMode && live.status === 'loading' ? (
          <p className="text-center text-xs text-muted-foreground">جاري الربط…</p>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="اكتب رسالتك…"
              className="h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (liveMode) void sendLiveMessage();
                  else sendLocalMessage();
                }
              }}
            />
            <Button
              size="icon"
              className="h-9 w-9"
              onClick={() => (liveMode ? void sendLiveMessage() : sendLocalMessage())}
              disabled={!draft.trim() || (liveMode && live.status === 'loading')}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="border-t bg-muted/20 px-3 py-2 text-center text-[10px] text-muted-foreground">
        {liveMode
          ? 'الشات الحي: ساعة واحدة ثم تُقفل القراءة تلقائياً على العميل وفق سياسات قاعدة البيانات.'
          : 'معاينة محلية — لا تُرسل إلى الخادم حتى يُضبط Supabase وتُطبَّق المهاجرات.'}
      </div>
    </div>
  );

  const body = (
    <>
      {liveErrorBanner}
      <ul className={cn('space-y-1.5 text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
        {perks.map((line) => (
          <li key={line} className="flex items-start gap-2">
            <Sparkles className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', isDiamond ? 'text-accent' : 'text-amber-600')} />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <p
        className={cn(
          'rounded-lg border border-border/70 bg-muted/25 p-2.5 leading-relaxed text-muted-foreground',
          compact ? 'text-[10px]' : 'text-[11px]'
        )}
      >
        {isDiamond ? (
          <>
            <strong className="text-foreground">الترجمة والخصوصية:</strong> طبقة الترجمة الآلية في الباقة الماسية
            تعمل بينك كمستخدم وبين الصالون ك<strong className="text-foreground">مزوّد خدمة</strong> ضمن المنصة؛ الهدف
            تسهيل الفهم فقط. تُعالَج محتويات المحادثة وفق سياسة الخصوصية وبحد أدنى للاحتفاظ اللازم للتشغيل
            والأمان. لا تُعدّ الترجمة وثيقة رسمية أو استشارة.
          </>
        ) : (
          <>
            <strong className="text-foreground">الشات والخصوصية:</strong> المحادثة الكتابية تربطك بالصالون كمزوّد
            خدمة؛ تُعالَج الرسائل وفق سياسة الخصوصية. في الباقة الماسية تُضاف ترجمة آلية بين الطرفين.
          </>
        )}
      </p>

      {chatBody}
    </>
  );

  if (compact) {
    return (
      <div className={cn('rounded-lg border border-primary/25 bg-gradient-to-br from-primary/5 to-muted/30', className)}>
        <div className="space-y-2 p-2.5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-xs font-bold">معاينة الشات المباشر</span>
            {isDiamond ? (
              <Badge className="mr-auto h-5 bg-accent text-[10px] text-accent-foreground">ماسي + ترجمة</Badge>
            ) : (
              <Badge variant="secondary" className="mr-auto h-5 text-[10px]">
                ذهبي
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
        'overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-muted/20',
        isDiamond && 'border-accent/30 from-accent/10',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          معاينة الشات المباشر مع الصالون
          {isDiamond ? (
            <Badge className="gap-1 bg-accent text-accent-foreground">
              <Languages className="h-3 w-3" />
              باقة ماسية — ترجمة ذكية
            </Badge>
          ) : (
            <Badge variant="secondary">باقة ذهبية</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          منظور العميل داخل حلاق ماب: محادثة كتابية مع الحلاق. عند ضبط Supabase تُستخدم جداول{' '}
          <code className="rounded bg-muted px-1">private_conversations</code> مع تحديثات لحظية؛ في الباقة الماسية
          تُترجم رسائل الطرف الآخر عبر واجهة ترجمة اختيارية على السيرفر.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">{body}</CardContent>
    </Card>
  );
}
