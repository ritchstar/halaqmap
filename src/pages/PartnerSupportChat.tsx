import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Clock,
  Copy,
  Headphones,
  MessageCircle,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { ROUTE_PATHS } from '@/lib';
import { getSiteOrigin } from '@/config/siteOrigin';
import { cn } from '@/lib/utils';
import {
  appendPartnerSupportMessage,
  clearExpiredPartnerSupportConversations,
  generatePartnerSupportThreadToken,
  getOrCreatePartnerSupportSession,
  getPartnerSupportRemainingMs,
  isPartnerSupportExpired,
  loadPartnerSupportConversation,
  restartPartnerSupportSession,
  type PartnerSupportMessage,
} from '@/lib/partnerSupportChat';

const QUERY_KEY = 't';
const PARTNER_SUPPORT_WA_E164 = '966559602685';

function Bubble({
  side,
  label,
  children,
}: {
  side: 'visitor' | 'support';
  label: string;
  children: React.ReactNode;
}) {
  const isVisitor = side === 'visitor';
  return (
    <div
      className={cn(
        'flex max-w-[92%] flex-col gap-1',
        isVisitor ? 'mr-0 ml-auto items-end' : 'mr-auto ml-0 items-start'
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {isVisitor ? <User className="h-3 w-3" /> : <Headphones className="h-3 w-3" />}
        <span>{label}</span>
      </div>
      <div
        className={cn(
          'rounded-2xl px-3 py-2 text-right text-sm leading-relaxed',
          isVisitor
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md bg-muted text-foreground'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function PartnerSupportChat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const threadToken = searchParams.get(QUERY_KEY)?.trim() || '';

  const [session, setSession] = useState<ReturnType<typeof getOrCreatePartnerSupportSession> | null>(null);
  const [messages, setMessages] = useState<PartnerSupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const t = searchParams.get(QUERY_KEY)?.trim();
    if (t) return;
    const next = generatePartnerSupportThreadToken();
    setSearchParams({ [QUERY_KEY]: next }, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!threadToken) return;
    clearExpiredPartnerSupportConversations();
    const next = getOrCreatePartnerSupportSession(threadToken);
    setSession(next);
    setMessages(loadPartnerSupportConversation(threadToken, next.sessionId));
    setRemainingMs(getPartnerSupportRemainingMs(next));
  }, [threadToken]);

  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => {
      setRemainingMs(getPartnerSupportRemainingMs(session));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session]);

  const expired = session ? isPartnerSupportExpired(session) : true;

  const privateChatUrl = useMemo(() => {
    if (!threadToken) return '';
    return `${getSiteOrigin()}/#${ROUTE_PATHS.PARTNER_SUPPORT}?${QUERY_KEY}=${encodeURIComponent(threadToken)}`;
  }, [threadToken]);

  const copyPrivateLink = useCallback(() => {
    if (!privateChatUrl) return;
    void navigator.clipboard.writeText(privateChatUrl).then(
      () => {
        toast({ title: 'تم نسخ الرابط', description: 'احتفظ به لنفسك؛ مشاركته تعني مشاركة المحادثة.' });
      },
      () => {
        toast({ title: 'تعذر النسخ', description: 'انسخ الرابط يدوياً من شريط العنوان.', variant: 'destructive' });
      }
    );
  }, [privateChatUrl]);

  const sendMessage = useCallback(() => {
    if (!threadToken || !session) return;
    const text = draft.trim();
    if (!text || isPartnerSupportExpired(session)) return;
    const afterVisitor = appendPartnerSupportMessage(threadToken, session, 'visitor', text);
    setMessages(afterVisitor);
    setDraft('');

    const waText = [
      'مرحباً فريق حلاق ماب — رسالة من «استوديو دعم الشركاء» (شريك محتمل):',
      '',
      text,
      '',
      `رابط الجلسة: ${privateChatUrl}`,
    ].join('\n');
    const waUrl = `https://wa.me/${PARTNER_SUPPORT_WA_E164}?text=${encodeURIComponent(waText)}`;
    const opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = waUrl;
  }, [draft, privateChatUrl, session, threadToken]);

  const startNewSession = useCallback(() => {
    if (!threadToken) return;
    const next = restartPartnerSupportSession(threadToken);
    setSession(next);
    setMessages([]);
    setDraft('');
    setRemainingMs(getPartnerSupportRemainingMs(next));
  }, [threadToken]);

  const remainingLabel = useMemo(() => {
    const totalSec = Math.floor(Math.max(0, remainingMs) / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [remainingMs]);

  if (!threadToken) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">
        جاري تجهيز رابط المحادثة الخاص…
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-background py-10" dir="rtl">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Link to={ROUTE_PATHS.BARBERS_LANDING}>
              <Sparkles className="h-4 w-4" />
              العودة للصفحة التسويقية
            </Link>
          </Button>
          <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">
            مسار الشركاء
          </Badge>
        </div>

        <Card className="overflow-hidden border-primary/20 shadow-lg">
          <CardHeader className="space-y-2 border-b bg-gradient-to-l from-primary/10 via-card to-muted/30">
            <CardTitle className="flex flex-wrap items-center gap-2 text-xl md:text-2xl">
              <MessageCircle className="h-6 w-6 text-primary" />
              استوديو دعم شركاء حلاق ماب
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              محادثة كتابية خاصة بنفس أسلوب الشات في الباقات الذهبية والماسية: جلسة واحدة لمدة ساعة، ثم تُغلق
              تلقائياً. يُنشأ لك رابط فريد يفصل محادثتك عن غيرك على هذا الجهاز.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="flex flex-wrap items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="space-y-2">
                <p>
                  <span className="font-semibold text-foreground">الخصوصية:</span> عند الضغط على «إرسال» نفتح لك
                  واتساب الرسمي مع نص جاهز يتضمن رابط جلستك. تبقى نسخة مختصرة من رسالتك محلياً في متصفحك ضمن
                  مفتاح يربط رابطك فقط بهذه الجلسة (للعرض هنا فقط). للمعاملات الحساسة استخدم قنوات رسمية
                  مشفّرة.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={copyPrivateLink}>
                    <Copy className="h-3.5 w-3.5" />
                    نسخ رابط المحادثة الخاص
                  </Button>
                </div>
                <p className="break-all font-mono text-[10px] opacity-90" dir="ltr">
                  {privateChatUrl}
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-background">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Headphones className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-sm font-semibold">الدعم الفني — حلاق ماب</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>الجلسة</span>
                  <span className={cn('font-semibold tabular-nums', expired ? 'text-destructive' : 'text-primary')} dir="ltr">
                    {remainingLabel}
                  </span>
                </div>
              </div>

              <ScrollArea className="h-[min(52vh,420px)]">
                <div className="space-y-3 p-3">
                  {messages.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                      اكتب استفسارك أدناه. تنتهي الجلسة بعد 60 دقيقة من بدئها؛ يمكنك بعدها فتح جلسة جديدة من نفس
                      الرابط أو إنشاء رابط جديد من الصفحة التسويقية.
                    </div>
                  ) : (
                    messages.map((m) => (
                      <Bubble
                        key={m.id}
                        side={m.sender === 'visitor' ? 'visitor' : 'support'}
                        label={m.sender === 'visitor' ? 'أنت (شريك محتمل)' : 'دعم حلاق ماب'}
                      >
                        {m.text}
                      </Bubble>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="border-t bg-muted/10 px-3 py-2">
                {expired ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-destructive">انتهت الجلسة بعد ساعة. يمكنك بدء جلسة جديدة للمتابعة.</p>
                    <Button size="sm" variant="outline" onClick={startNewSession} className="gap-1.5 shrink-0">
                      <RotateCcw className="h-3.5 w-3.5" />
                      جلسة جديدة
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="اكتب استفسارك للدعم الفني…"
                      className="h-10 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={sendMessage}
                      disabled={!draft.trim()}
                      title="إرسال عبر واتساب"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="border-t bg-muted/20 px-3 py-2 text-center text-[10px] text-muted-foreground">
                جلسة خاصة لكل رابط — إغلاق تلقائي بعد ساعة من بداية الجلسة
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              للتواصل المباشر مع الفريق:{' '}
              <a href="https://wa.me/966559602685" className="font-semibold text-primary underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
                واتساب
              </a>
              {' · '}
              <a href="mailto:admin@halaqmap.com" className="font-semibold text-primary underline-offset-2 hover:underline">
                admin@halaqmap.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
