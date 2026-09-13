/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صندوق ملاحظة خضارنا1 — مدرج، ليست غرفة عامة.
 * يدعم مظهرين: dark (الواجهة القديمة المظلمة) و light (واجهة Chatly الورقية الفاتحة).
 */
import { useState } from 'react';
import { STORE_PRODUCE_LIVE } from '@/config/storeProduceLive';
import type { ProduceChatMsg, ProduceLabState } from '@/lib/storeProduceLiveLab';
import { cn } from '@/lib/utils';

type ChatTheme = 'dark' | 'light';

const themeClasses = {
  dark: {
    section: 'border-[#3d8b4a]/25 bg-[#0b1a10]/80',
    hint: 'text-white/60',
    field: 'produce-field',
    button: 'bg-[#3d8b4a] text-[#061018]',
    bubble: 'border-white/10 bg-black/30',
    bubbleMeta: 'text-white/50',
    bubbleHide: 'text-white/45',
    heading: '',
    body: '',
  },
  light: {
    section: 'border-[#dfe4d6] bg-[#fffdf5]',
    hint: 'text-[#758374]',
    field: 'border border-[#dfe4d6] bg-white text-[#22332b] placeholder:text-[#a0aca0] rounded-xl px-3 h-12 w-full mt-1',
    button: 'bg-[#3d8b4a] text-white',
    bubble: 'border-[#dfe4d6] bg-white',
    bubbleMeta: 'text-[#758374]',
    bubbleHide: 'text-[#98a396]',
    heading: 'text-[#20352b]',
    body: 'text-[#20352b]',
  },
} as const satisfies Record<ChatTheme, Record<string, string>>;

export function StoreProduceBuyerChat({
  state,
  onChange,
  theme = 'dark',
}: {
  state: ProduceLabState;
  onChange: (next: ProduceLabState) => void;
  theme?: ChatTheme;
}) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const t = themeClasses[theme];
  if (state.chatIncluded === false) return null;

  function send() {
    const body = text.trim();
    if (body.length < 2) return;
    const msg: ProduceChatMsg = {
      id: `${Date.now()}`,
      from: 'buyer',
      name: name.trim().slice(0, 40) || 'عميل',
      text: body.slice(0, 240),
      at: new Date().toISOString(),
    };
    onChange({ ...state, chats: [msg, ...state.chats].slice(0, 200) });
    setText('');
  }

  return (
    <section className={cn('mt-6 rounded-2xl border p-4', t.section)}>
      <h3 className={cn('font-extrabold', t.heading)}>{STORE_PRODUCE_LIVE.chatBuyerTitleAr}</h3>
      <p className={cn('mt-1 text-xs leading-6', t.hint)}>{STORE_PRODUCE_LIVE.chatBuyerHintAr}</p>
      <label className={cn('mt-3 block text-sm', t.body)}>
        {STORE_PRODUCE_LIVE.chatBuyerNameLabelAr}
        <input className={t.field} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={cn('mt-3 block text-sm', t.body)}>
        {STORE_PRODUCE_LIVE.chatBuyerFieldLabelAr}
        <textarea
          className={cn(t.field, 'min-h-24 py-2')}
          value={text}
          maxLength={240}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button type="button" onClick={send} className={cn('mt-3 rounded-full px-4 py-2 text-sm font-bold', t.button)}>
        {STORE_PRODUCE_LIVE.chatBuyerSendAr}
      </button>
    </section>
  );
}

export function StoreProduceDeskChat({
  state,
  onChange,
  theme = 'dark',
}: {
  state: ProduceLabState;
  onChange: (next: ProduceLabState) => void;
  theme?: ChatTheme;
}) {
  const [reply, setReply] = useState('');
  const t = themeClasses[theme];
  if (state.chatIncluded === false) return null;
  const visible = state.chats.filter((item) => !item.hidden).slice(0, 30);

  function sendReply() {
    const body = reply.trim();
    if (body.length < 2) return;
    const msg: ProduceChatMsg = {
      id: `${Date.now()}`,
      from: 'desk',
      name: state.host.hostName || 'الصندوق',
      text: body.slice(0, 240),
      at: new Date().toISOString(),
    };
    onChange({ ...state, chats: [msg, ...state.chats].slice(0, 200) });
    setReply('');
  }

  function hide(id: string) {
    onChange({
      ...state,
      chats: state.chats.map((item) => (item.id === id ? { ...item, hidden: true } : item)),
    });
  }

  return (
    <section
      className={cn(
        theme === 'light' ? 'rounded-2xl border p-4' : 'store-desk-panel store-desk-accent-border rounded-2xl border p-4',
        theme === 'light' && t.section,
      )}
    >
      <h3 className={cn('font-extrabold', t.heading)}>{STORE_PRODUCE_LIVE.chatDeskTitleAr}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {visible.map((item) => (
          <li
            key={item.id}
            className={cn(theme === 'light' ? 'rounded-xl border p-3' : 'store-desk-ticket-card rounded-xl border p-3', theme === 'light' && t.bubble)}
          >
            <p className={cn('text-xs', theme === 'light' ? t.bubbleMeta : 'text-white/50')}>
              {item.from === 'desk' ? 'المشغّل' : 'العميل'} · {item.name}
            </p>
            <p className={cn('mt-1 leading-7', t.body)}>{item.text}</p>
            <button
              type="button"
              className={cn('mt-2 text-xs underline', theme === 'light' ? t.bubbleHide : 'text-white/45')}
              onClick={() => hide(item.id)}
            >
              إخفاء
            </button>
          </li>
        ))}
      </ul>
      <label className={cn('mt-3 block text-sm', t.body)}>
        {STORE_PRODUCE_LIVE.chatDeskReplyAr}
        <textarea className={cn(t.field, 'min-h-20 py-2')} value={reply} onChange={(e) => setReply(e.target.value)} />
      </label>
      <button
        type="button"
        onClick={sendReply}
        className={cn(
          'mt-3 rounded-full px-4 py-2 text-sm font-bold',
          theme === 'light' ? t.button : 'store-desk-accent-bg',
        )}
      >
        إرسال الرد
      </button>
    </section>
  );
}
