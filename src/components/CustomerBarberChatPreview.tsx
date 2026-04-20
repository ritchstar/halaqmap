import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { MessageCircle, Languages, Sparkles, User, Store, Hourglass, RotateCcw, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SubscriptionTier } from '@/lib/index';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const [session, setSession] = useState(() => getOrCreatePrivateChatSession(barberId));
  const [messages, setMessages] = useState<PrivateChatMessage[]>(() =>
    loadPrivateConversation(barberId, session.sessionId)
  );
  const [draft, setDraft] = useState('');
  const [remainingMs, setRemainingMs] = useState(() => getPrivateChatRemainingMs(session));

  useEffect(() => {
    clearExpiredPrivateConversations();
    const next = getOrCreatePrivateChatSession(barberId);
    setSession(next);
    setMessages(loadPrivateConversation(barberId, next.sessionId));
  }, [barberId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingMs(getPrivateChatRemainingMs(session));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session]);

  const expired = isPrivateChatExpired(session);

  function sendMessage() {
    const text = draft.trim();
    if (!text || expired) return;
    const afterCustomer = appendPrivateMessage(barberId, session, 'customer', text);
    setMessages(afterCustomer);
    setDraft('');

    window.setTimeout(() => {
      if (isPrivateChatExpired(session)) return;
      const reply = isDiamond
        ? 'تم استلام رسالتك. يسعدنا خدمتك، هل ترغب بتأكيد موعد خلال ساعة؟'
        : 'تم استلام رسالتك. يسعدنا خدمتك، ما الوقت المناسب لك؟';
      const afterReply = appendPrivateMessage(barberId, session, 'barber', reply);
      setMessages(afterReply);
    }, 900);
  }

  function startNewSession() {
    const next = restartPrivateChatSession(barberId);
    setSession(next);
    setMessages([]);
    setDraft('');
    setRemainingMs(getPrivateChatRemainingMs(next));
  }

  const remainingLabel = useMemo(() => {
    const totalSec = Math.floor(Math.max(0, remainingMs) / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [remainingMs]);

  const body = (
    <>
      <ul className={cn('space-y-1.5 text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
        {perks.map((line) => (
          <li key={line} className="flex gap-2 items-start">
            <Sparkles className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', isDiamond ? 'text-accent' : 'text-amber-600')} />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <p
        className={cn(
          'text-muted-foreground rounded-lg border border-border/70 bg-muted/25 p-2.5 leading-relaxed',
          compact ? 'text-[10px]' : 'text-[11px]',
        )}
      >
        {isDiamond ? (
          <>
            <strong className="text-foreground">الترجمة والخصوصية:</strong> طبقة الترجمة الآلية في الباقة الماسية
            تعمل بينك كمستخدم وبين الصالون ك<strong className="text-foreground">مزوّد خدمة</strong> ضمن المنصة؛
            الهدف تسهيل الفهم فقط. تُعالَج محتويات المحادثة وفق سياسة الخصوصية (المستخدم والشركاء) وبحد أدنى
            للاحتفاظ اللازم للتشغيل والأمان. لا تُعدّ الترجمة وثيقة رسمية أو استشارة.
          </>
        ) : (
          <>
            <strong className="text-foreground">الشات والخصوصية:</strong> المحادثة الكتابية تربطك بالصالون كمزوّد
            خدمة؛ تُعالَج الرسائل وفق سياسة الخصوصية. في الباقة الماسية تُضاف ترجمة آلية بين الطرفين مع تنبيهات
            إضافية كما في سياسة المستخدم.
          </>
        )}
      </p>

      <div className={cn('rounded-xl border bg-background/80 overflow-hidden', compact ? 'mt-2' : 'mt-4')}>
        <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <MessageCircle className="w-4 h-4 text-primary shrink-0" />
            <span className={cn('font-semibold truncate', compact ? 'text-xs' : 'text-sm')}>
              محادثة مع {barberName}
            </span>
          </div>
          <Badge variant="secondary" className={cn('shrink-0', compact && 'text-[10px] px-1.5 py-0')}>
            {isDiamond ? 'ماسي + ترجمة' : 'ذهبي'}
          </Badge>
        </div>
        <div className="border-b bg-background px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5" />
            <span>جلسة خاصة لكل عميل (تنتهي بعد ساعة)</span>
          </div>
          <span className={cn('font-semibold', expired ? 'text-destructive' : 'text-primary')} dir="ltr">
            {remainingLabel}
          </span>
        </div>
        <ScrollArea className={cn(compact ? 'h-[168px]' : 'h-[220px]')}>
          <div className={cn('space-y-3 p-3', compact && 'space-y-2 p-2')}>
            {messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground text-center">
                ابدأ محادثة خاصة — هذه الجلسة مرئية لهذا العميل فقط وتنتهي تلقائياً خلال ساعة.
              </div>
            ) : (
              messages.map((m) => (
                <Bubble
                  key={m.id}
                  side={m.sender === 'customer' ? 'customer' : 'barber'}
                  label={m.sender === 'customer' ? 'أنت (العميل)' : barberName}
                  compact={compact}
                >
                  {m.sender === 'customer' && /[A-Za-z]/.test(m.text) ? (
                    <span dir="ltr" className="inline-block text-left w-full">
                      {m.text}
                    </span>
                  ) : (
                    m.text
                  )}
                </Bubble>
              ))
            )}

            {isDiamond && messages.length > 0 && (
              <>
                <div className="flex flex-col items-end gap-1 w-full">
                  <TranslationHint
                    compact={compact}
                    detectedLabel="النظام يكتشف: الإنجليزية"
                    translationLabel="يظهر للصالون:"
                    translationText="تُترجم الرسالة تلقائياً حسب لغة الكتابة."
                  />
                </div>
                <div className="flex flex-col items-start gap-1 w-full">
                  <TranslationHint
                    compact={compact}
                    detectedLabel="النظام يكتشف: العربية"
                    translationLabel="يظهر للعميل:"
                    translationText="Message is auto-translated for each side."
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>
        <div className="border-t px-3 py-2 bg-muted/10">
          {expired ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-destructive">انتهت الجلسة بعد 60 دقيقة. ابدأ جلسة جديدة للمتابعة.</p>
              <Button size="sm" variant="outline" onClick={startNewSession} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                جلسة جديدة
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button size="icon" className="h-9 w-9" onClick={sendMessage} disabled={!draft.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="border-t px-3 py-2 text-[10px] text-muted-foreground text-center bg-muted/20">
          محادثة خاصة لكل عميل، مع إغلاق تلقائي للجلسة بعد ساعة من بدايتها
        </div>
      </div>
    </>
  );

  if (compact) {
    return (
      <div className={cn('rounded-lg border border-primary/25 bg-gradient-to-br from-primary/5 to-muted/30', className)}>
        <div className="p-2.5 space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-bold">معاينة الشات المباشر</span>
            {isDiamond ? (
              <Badge className="text-[10px] h-5 bg-accent text-accent-foreground mr-auto">ماسي + ترجمة</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] h-5 mr-auto">
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
        'border-primary/20 bg-gradient-to-br from-primary/5 via-card to-muted/20 overflow-hidden',
        isDiamond && 'border-accent/30 from-accent/10',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-primary" />
          معاينة الشات المباشر مع الصالون
          {isDiamond ? (
            <Badge className="bg-accent text-accent-foreground gap-1">
              <Languages className="w-3 h-3" />
              باقة ماسية — ترجمة ذكية
            </Badge>
          ) : (
            <Badge variant="secondary">باقة ذهبية</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          منظور العميل داخل حلاق ماب: محادثة كتابية مع الحلاق. في الباقة الماسية تُترجم الرسائل تلقائياً بحسب لغة
          الكتابة (مثل العربية أو الإنجليزية) ليصل الطرف الآخر نصاً مفهوماً له.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">{body}</CardContent>
    </Card>
  );
}
