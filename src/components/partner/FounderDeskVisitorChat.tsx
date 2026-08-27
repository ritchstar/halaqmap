/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hourglass, Loader2, Lock, Send } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { FOUNDER_DESK_COPY, FOUNDER_DESK_MAX_BODY, FOUNDER_DESK_WHATSAPP_E164 } from '@/config/founderDeskCopy';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';
import {
  listFounderDeskMessages,
  sendFounderDeskMessage,
  startFounderDeskChat,
  type FounderDeskConversation,
  type FounderDeskMessage,
} from '@/lib/founderDeskChatRemote';
import { buildWhatsAppChatHref } from '@/lib/saudiWhatsAppPhone';
import { cn } from '@/lib/utils';

function formatMmSs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function remainingMs(expiresAt: string): number {
  const t = new Date(expiresAt).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, t - Date.now());
}

const PRIVACY_PATH =
  (ROUTE_PATHS as { USER_PRIVACY_POLICY?: string }).USER_PRIVACY_POLICY || '/privacy-policy';

type Props = {
  className?: string;
  compact?: boolean;
  /** صفحة مستقلة — مساحة أطول للتركيز */
  expanded?: boolean;
  origin?: 'partners' | 'store';
};

export function FounderDeskVisitorChat({ className, compact, expanded, origin = 'partners' }: Props) {
  const deskOrigin = origin === 'store' ? 'store' : 'partners';
  const [conversation, setConversation] = useState<FounderDeskConversation | null>(null);
  const [messages, setMessages] = useState<FounderDeskMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [expired, setExpired] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [notice, setNotice] = useState('');
  const [tick, setTick] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const whatsappHref = buildWhatsAppChatHref(
    FOUNDER_DESK_WHATSAPP_E164,
    deskOrigin === 'store' ? FOUNDER_DESK_COPY.whatsappPrefillStoreAr : FOUNDER_DESK_COPY.whatsappPrefillAr,
  );

  const boot = useCallback(async () => {
    setLoading(true);
    const started = await startFounderDeskChat(deskOrigin);
    if (!started.ok) {
      setUnavailable(started.tableMissing === true || started.error === FOUNDER_DESK_COPY.unavailableAr);
      setNotice(started.error);
      setLoading(false);
      return;
    }
    setConversation(started.conversation);
    setExpired(new Date(started.conversation.expires_at).getTime() <= Date.now());
    const listed = await listFounderDeskMessages(started.conversation.id, deskOrigin);
    if (listed.ok) {
      setMessages(listed.messages);
      setExpired(listed.expired);
    } else if (listed.tableMissing) {
      setUnavailable(true);
      setNotice(listed.error);
    }
    setLoading(false);
  }, [deskOrigin]);

  useEffect(() => {
    void boot();
  }, [boot]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!conversation?.id || expired || unavailable) return;
    const timer = window.setInterval(() => {
      if (!isPollingTabActive()) return;
      void listFounderDeskMessages(conversation.id, deskOrigin).then((listed) => {
        if (!listed.ok) return;
        setMessages(listed.messages);
        setExpired(listed.expired);
      });
    }, POLL_MS.PRIVATE_CHAT_MESSAGES);
    return () => window.clearInterval(timer);
  }, [conversation?.id, deskOrigin, expired, unavailable]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const leftMs = conversation ? remainingMs(conversation.expires_at) : 0;
  void tick;
  const isStore = deskOrigin === 'store';

  const send = async () => {
    const text = draft.trim();
    if (!text || !conversation || sending || expired || unavailable) return;
    setSending(true);
    const result = await sendFounderDeskMessage(conversation.id, text, deskOrigin);
    setSending(false);
    if (!result.ok) {
      setNotice(result.error);
      if (result.tableMissing) setUnavailable(true);
      return;
    }
    setDraft('');
    setNotice('');
    setMessages((prev) => (prev.some((m) => m.id === result.message.id) ? prev : [...prev, result.message]));
  };

  return (
    <div
      dir="rtl"
      className={cn(
        'overflow-hidden rounded-[1.35rem]',
        isStore
          ? 'border border-[#e8c547]/25 bg-[#061018]/85'
          : 'border border-[#cfe6ee] bg-[#fbfeff] shadow-[0_10px_22px_rgba(148,163,184,0.08)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-b px-3 py-2.5',
          isStore ? 'border-[#e8c547]/20' : 'border-[#deeff4]',
        )}
      >
        <p className={cn('text-[0.72rem] font-black', isStore ? 'text-[#f4efe4]' : 'text-[#215d6a]')}>
          {FOUNDER_DESK_COPY.chatTitleAr}
        </p>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.58rem] font-bold',
            isStore ? 'bg-[#e8c547]/15 text-[#e8c547]' : 'bg-[#18687a]/10 text-[#18687a]',
          )}
        >
          <Hourglass className="h-3 w-3" />
          {FOUNDER_DESK_COPY.remainingAr} {formatMmSs(leftMs)}
        </span>
      </div>
      <p className={cn('px-3 pt-2 text-[0.68rem] leading-6', isStore ? 'text-white/70' : 'text-slate-600')}>
        {FOUNDER_DESK_COPY.chatIntroAr}
      </p>
      <p
        className={cn(
          'flex items-start gap-1.5 px-3 pt-1 text-[0.62rem] leading-5',
          isStore ? 'text-white/50' : 'text-slate-500',
        )}
      >
        <Lock className={cn('mt-0.5 h-3 w-3 shrink-0', isStore ? 'text-[#e8c547]' : 'text-[#18687a]')} aria-hidden />
        <span>
          {FOUNDER_DESK_COPY.privacyNoticeAr}{' '}
          <Link
            to={PRIVACY_PATH}
            className={cn(
              'font-bold underline underline-offset-2',
              isStore ? 'text-[#e8c547]' : 'text-[#18687a]',
            )}
          >
            {FOUNDER_DESK_COPY.privacyPolicyLinkAr}
          </Link>
          .
        </span>
      </p>

      <div
        className={cn(
          'space-y-2 overflow-y-auto px-3 py-2',
          expanded ? 'min-h-[42dvh] max-h-[58dvh]' : compact ? 'max-h-48' : 'max-h-64',
        )}
      >
        {loading ? (
          <div className={cn('flex items-center justify-center py-6', isStore ? 'text-[#e8c547]' : 'text-[#18687a]')}>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : unavailable ? (
          <p
            className={cn(
              'rounded-2xl border border-dashed p-3 text-center text-xs',
              isStore ? 'border-[#e8c547]/25 text-white/55' : 'border-slate-200 text-slate-500',
            )}
          >
            {FOUNDER_DESK_COPY.unavailableAr}
          </p>
        ) : messages.length === 0 ? (
          <p
            className={cn(
              'rounded-2xl border border-dashed p-3 text-center text-xs',
              isStore ? 'border-[#e8c547]/25 text-white/55' : 'border-slate-200 text-slate-500',
            )}
          >
            {FOUNDER_DESK_COPY.emptyAr}
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.sender === 'visitor';
            return (
              <div key={message.id} className={cn('flex', mine ? 'justify-start' : 'justify-end')}>
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    mine
                      ? isStore
                        ? 'rounded-br-md bg-[#e8c547] text-[#061018]'
                        : 'rounded-br-md bg-[#18687a] text-white'
                      : isStore
                        ? 'rounded-bl-md bg-[#0b1a24] text-[#f4efe4] ring-1 ring-[#e8c547]/25'
                        : 'rounded-bl-md bg-white text-slate-800 ring-1 ring-[#d5e9f0]',
                  )}
                >
                  <p className="mb-1 text-[10px] opacity-80">
                    {mine ? FOUNDER_DESK_COPY.youAr : FOUNDER_DESK_COPY.deskReplyAr}
                  </p>
                  <p dir="rtl" className="chat-arabic-text whitespace-pre-wrap break-words">
                    {message.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {notice ? (
        <p className={cn('px-3 pb-1 text-[0.65rem]', isStore ? 'text-rose-300' : 'text-rose-700')}>{notice}</p>
      ) : null}
      {expired && !unavailable ? (
        <p className={cn('px-3 pb-2 text-[0.65rem]', isStore ? 'text-white/50' : 'text-slate-500')}>
          {FOUNDER_DESK_COPY.expiredAr}
        </p>
      ) : null}

      <div
        className={cn(
          'flex items-center gap-2 border-t p-2.5',
          isStore ? 'border-[#e8c547]/20' : 'border-[#deeff4]',
        )}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, FOUNDER_DESK_MAX_BODY))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          disabled={loading || sending || expired || unavailable}
          maxLength={FOUNDER_DESK_MAX_BODY}
          placeholder={FOUNDER_DESK_COPY.emptyAr}
          className={cn(
            'h-10 flex-1 rounded-full border px-3 text-sm outline-none',
            isStore
              ? 'border-[#e8c547]/25 bg-[#0b1a24] text-[#f4efe4] placeholder:text-white/40 focus:border-[#e8c547]'
              : 'border-[#cfe6ee] bg-white text-slate-800 focus:border-[#18687a]',
          )}
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || sending || expired || unavailable || !draft.trim()}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40',
            isStore ? 'bg-[#e8c547] text-[#061018]' : 'bg-[#18687a] text-white',
          )}
          aria-label={FOUNDER_DESK_COPY.sendAr}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, #2bbd6a, #1c7d6a)' }}
            aria-label={FOUNDER_DESK_COPY.whatsappAriaAr}
          >
            <SiWhatsapp className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
