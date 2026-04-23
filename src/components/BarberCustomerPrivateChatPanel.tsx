import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Hourglass, Loader2, MessageCircle, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SubscriptionTier } from '@/lib/index';
import {
  barberListPrivateConversationsRemote,
  barberListPrivateMessagesRemote,
  barberSendPrivateMessageRemote,
  type BarberPrivateConversationRow,
  type BarberPrivateMessageRow,
} from '@/lib/barberCustomerPrivateChatRemote';
import { guessTranslateTarget, translateChatLineRemote } from '@/lib/diamondChatTranslateRemote';

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
}: {
  barberId: string;
  barberEmail: string;
  subscriptionTier: SubscriptionTier;
}) {
  const isDiamond = subscriptionTier === SubscriptionTier.DIAMOND;
  const [conversations, setConversations] = useState<BarberPrivateConversationRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<BarberPrivateMessageRow[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [tick, setTick] = useState(0);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const translationAttemptedRef = useRef(new Set<string>());

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const pollConversations = useCallback(async () => {
    const res = await barberListPrivateConversationsRemote({ barberId, email: barberEmail });
    if (!res.ok) return;
    setConversations(res.conversations);
    setSelectedId((prev) => {
      if (prev && res.conversations.some((c) => c.id === prev)) return prev;
      return res.conversations[0]?.id ?? null;
    });
  }, [barberId, barberEmail]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setLoadingMsgs(true);
      try {
        const res = await barberListPrivateMessagesRemote({
          barberId,
          email: barberEmail,
          conversationId,
        });
        if (!res.ok) {
          toast.error(res.error);
          setMessages([]);
          return;
        }
        if (res.expired) {
          setMessages([]);
          void pollConversations();
          return;
        }
        setMessages(res.messages);
      } finally {
        setLoadingMsgs(false);
      }
    },
    [barberId, barberEmail, pollConversations]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      await pollConversations();
      if (!cancelled) setLoadingList(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pollConversations]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const iv = window.setInterval(() => {
      void pollConversations();
    }, 4000);
    return () => window.clearInterval(iv);
  }, [pollConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedId);
    const iv = window.setInterval(() => {
      void loadMessages(selectedId);
    }, 2500);
    return () => window.clearInterval(iv);
  }, [selectedId, loadMessages]);

  const msLeft = useMemo(() => (selected ? remainingMs(selected.expires_at) : 0), [selected, tick]);

  useEffect(() => {
    translationAttemptedRef.current.clear();
  }, [selectedId]);

  useEffect(() => {
    if (!isDiamond || messages.length === 0) return;
    let cancelled = false;
    (async () => {
      const updates: Record<string, string> = {};
      for (const m of messages) {
        if (translationAttemptedRef.current.has(m.id)) continue;
        translationAttemptedRef.current.add(m.id);
        const target = guessTranslateTarget(m.body);
        const tr = await translateChatLineRemote({ text: m.body, target });
        if (cancelled) return;
        if (tr.ok && tr.text && tr.text !== m.body) updates[m.id] = tr.text;
      }
      if (Object.keys(updates).length > 0) {
        setTranslations((prev) => ({ ...prev, ...updates }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [messages, isDiamond]);

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
      await loadMessages(selectedId);
      await pollConversations();
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          شات العملاء (حي عبر Supabase)
          {isDiamond ? (
            <Badge className="bg-accent text-accent-foreground">ماسي — ترجمة تلقائية</Badge>
          ) : (
            <Badge variant="secondary">ذهبي</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          تظهر هنا الجلسات النشطة فقط (ساعة واحدة لكل جلسة). يبدأ العميل المحادثة من التطبيق؛ تُحدَّث الرسائل
          تلقائياً كل بضع ثوانٍ.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingList ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري تحميل المحادثات…
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            لا توجد جلسات شات نشطة حالياً. عندما يفتح عميل محادثة من خريطة حلاق ماب ستظهر الجلسة هنا.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">المحادثة</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
              <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
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

            <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-border/60 p-3">
              {loadingMsgs ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  جاري تحميل الرسائل…
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground">لا رسائل بعد في هذه الجلسة.</p>
              ) : !selected ? null : (
                messages.map((m) => {
                  const isBarber = m.sender_id !== selected.customer_id;
                  return (
                    <div key={m.id} className={`flex ${isBarber ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[88%] rounded-lg p-2.5 text-sm ${
                          isBarber ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        {isDiamond && translations[m.id] ? (
                          <p className="mt-1 border-t border-white/20 pt-1 text-[11px] opacity-90">
                            ترجمة: {translations[m.id]}
                          </p>
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
                placeholder={msLeft > 0 ? 'ردك للعميل…' : 'انتهت الجلسة'}
                value={draft}
                disabled={msLeft <= 0}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <Button type="button" size="icon" disabled={!draft.trim() || msLeft <= 0 || sending} onClick={() => void send()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
