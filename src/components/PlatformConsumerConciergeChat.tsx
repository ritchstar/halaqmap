/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleHelp, Loader2, MessageCircle, Send, Sparkles, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  PLATFORM_CONCIERGE_AGENT_LABEL,
  PLATFORM_CONCIERGE_BADGE,
  PLATFORM_CONCIERGE_COMPACT_TITLE,
  PLATFORM_CONCIERGE_EMPTY,
  PLATFORM_CONCIERGE_ERROR,
  PLATFORM_CONCIERGE_FOOTER,
  PLATFORM_CONCIERGE_INTRO,
  PLATFORM_CONCIERGE_MAX_TURNS,
  PLATFORM_CONCIERGE_PRIVACY,
  PLATFORM_CONCIERGE_SENDING,
  PLATFORM_CONCIERGE_SESSION_LIMIT,
  PLATFORM_CONCIERGE_STATUS,
  PLATFORM_CONCIERGE_STEPS,
  PLATFORM_CONCIERGE_STEPS_HEADING,
  PLATFORM_CONCIERGE_THREAD_LABEL,
  PLATFORM_CONCIERGE_TITLE,
  PLATFORM_CONCIERGE_WELCOME,
  PLATFORM_CONCIERGE_YOU_LABEL,
} from '@/config/platformConsumerConciergeCopy';
import {
  platformConsumerConciergeRemote,
  type PlatformConciergeTurn,
} from '@/lib/platformConsumerConciergeRemote';

type UiMsg = { id: string; role: 'user' | 'assistant'; text: string };

function newId(): string {
  return `pc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PlatformConsumerConciergeChat({
  compact,
  className,
  cityAr,
  coverageHint,
}: {
  compact?: boolean;
  className?: string;
  cityAr?: string | null;
  coverageHint?: string | null;
}) {
  const [messages, setMessages] = useState<UiMsg[]>(() => [
    { id: 'welcome', role: 'assistant', text: PLATFORM_CONCIERGE_WELCOME },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userTurns = messages.filter((m) => m.role === 'user').length;
  const atLimit = userTurns >= PLATFORM_CONCIERGE_MAX_TURNS;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending || atLimit) return;
    setDraft('');
    const userMsg: UiMsg = { id: newId(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    const history: PlatformConciergeTurn[] = [...messages, userMsg]
      .filter((m) => m.id !== 'welcome' || m.role === 'user')
      .map((m) => ({ role: m.role, content: m.text }));

    try {
      const res = await platformConsumerConciergeRemote({
        message: text,
        history: history.slice(0, -1),
        cityAr,
        coverageHint:
          coverageHint ||
          'عرض تعليمي عند فراغ نتائج البحث — لا صالونات كافية في النطاق الحالي.',
      });
      const reply = res.ok ? res.reply : PLATFORM_CONCIERGE_ERROR;
      setMessages((prev) => [...prev, { id: newId(), role: 'assistant', text: reply }]);
    } finally {
      setSending(false);
    }
  }, [atLimit, cityAr, coverageHint, draft, messages, sending]);

  const chatBody = (
    <div
      className={cn(
        'barber-contact-inner min-w-0 max-w-full overflow-hidden rounded-xl border bg-background/80',
        compact && 'mt-1',
      )}
    >
      <div className="flex flex-col gap-1.5 border-b bg-muted/40 px-3 py-2">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] leading-none text-muted-foreground">{PLATFORM_CONCIERGE_THREAD_LABEL}</p>
              <p className={cn('truncate font-semibold leading-snug', compact ? 'text-xs' : 'text-sm')}>
                {PLATFORM_CONCIERGE_AGENT_LABEL}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant="secondary" className="whitespace-nowrap text-[10px] leading-none">
              {PLATFORM_CONCIERGE_STATUS}
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap text-[10px] leading-none text-teal-700">
              <Sparkles className="ml-0.5 h-2.5 w-2.5" />
              {PLATFORM_CONCIERGE_BADGE}
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className={cn('min-w-0 max-w-full', compact ? 'h-[168px]' : 'h-[220px]')}>
        <div className={cn('min-w-0 max-w-full space-y-3 p-3', compact && 'space-y-2 p-2')}>
          {messages.length === 0 ? (
            <div className="barber-contact-prose rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              {PLATFORM_CONCIERGE_EMPTY}
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={cn(
                    'flex min-w-0 w-full max-w-[92%] flex-col gap-1',
                    isUser ? 'items-end mr-0 ml-auto' : 'items-start mr-auto ml-0',
                  )}
                >
                  <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                    {isUser ? <User className="h-3 w-3 shrink-0" /> : <Sparkles className="h-3 w-3 shrink-0" />}
                    <span className="break-words">
                      {isUser ? PLATFORM_CONCIERGE_YOU_LABEL : PLATFORM_CONCIERGE_AGENT_LABEL}
                    </span>
                  </div>
                  <div
                    dir="rtl"
                    className={cn(
                      'chat-arabic-text min-w-0 max-w-full break-words rounded-2xl px-3 py-2 text-sm leading-relaxed text-right whitespace-pre-wrap',
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md',
                      compact && 'text-xs py-1.5 px-2.5',
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
          {sending ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {PLATFORM_CONCIERGE_SENDING}
            </div>
          ) : null}
          {atLimit ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">{PLATFORM_CONCIERGE_SESSION_LIMIT}</p>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex gap-2 border-t p-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="اكتب رسالتك…"
          disabled={sending || atLimit}
          className="text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0 rounded-full"
          disabled={sending || atLimit || !draft.trim()}
          onClick={() => void send()}
          aria-label="إرسال"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <p className="px-3 pb-2 text-[10px] text-muted-foreground">{PLATFORM_CONCIERGE_FOOTER}</p>
    </div>
  );

  if (compact) {
    return <div className={cn('barber-contact-inner min-w-0 space-y-2', className)}>{chatBody}</div>;
  }

  return (
    <Card className={cn('barber-contact-inner min-w-0 overflow-hidden border-teal-500/25', className)}>
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CircleHelp className="h-4 w-4 text-teal-600" />
            {PLATFORM_CONCIERGE_TITLE}
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {PLATFORM_CONCIERGE_COMPACT_TITLE}
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">{PLATFORM_CONCIERGE_INTRO}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {chatBody}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1.5">
          <p className="text-xs font-semibold">{PLATFORM_CONCIERGE_STEPS_HEADING}</p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-muted-foreground">
            {PLATFORM_CONCIERGE_STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="text-[10px] text-muted-foreground pt-1">{PLATFORM_CONCIERGE_PRIVACY}</p>
        </div>
      </CardContent>
    </Card>
  );
}
