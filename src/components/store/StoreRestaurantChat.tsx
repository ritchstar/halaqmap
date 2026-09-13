/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صندوق محادثة مطعمنا1 — مدرج، ليس غرفة عامة.
 * يدعم مظهرين: dark (الواجهة القديمة المظلمة) و light (واجهة Chatly الورقية الفاتحة).
 */
import { useState } from 'react';
import { STORE_RESTAURANT_LIVE } from '@/config/storeRestaurantLive';
import type { RestaurantChatMsg, RestaurantLabState } from '@/lib/storeRestaurantLiveLab';
import { cn } from '@/lib/utils';

type ChatTheme = 'dark' | 'light';

const themeClasses = {
  dark: {
    section: 'border-[#e08a3c]/25 bg-[#1a1008]/80',
    hint: 'text-white/60',
    replyHint: 'text-white/50',
    field: 'restaurant-field',
    button: 'bg-[#e08a3c] text-[#061018]',
    bubble: 'border-white/10 bg-black/25',
    bubbleMeta: 'text-white/50',
    bubbleHide: 'text-white/45',
    heading: '',
    body: '',
  },
  light: {
    section: 'border-[#dfe4d6] bg-[#fffdf5]',
    hint: 'text-[#8a7360]',
    replyHint: 'text-[#8a7360]',
    field: 'border border-[#dfe4d6] bg-white text-[#2a1810] placeholder:text-[#b0a094] rounded-xl px-3 h-12 w-full mt-1',
    button: 'bg-[#e08a3c] text-white',
    bubble: 'border-[#dfe4d6] bg-white',
    bubbleMeta: 'text-[#8a7360]',
    bubbleHide: 'text-[#b0a094]',
    heading: 'text-[#2a1810]',
    body: 'text-[#2a1810]',
  },
} as const satisfies Record<ChatTheme, Record<string, string>>;

export function StoreRestaurantBuyerChat({
  state,
  onChange,
  isLab = false,
  theme = 'dark',
}: {
  state: RestaurantLabState;
  onChange: (next: RestaurantLabState) => void;
  isLab?: boolean;
  theme?: ChatTheme;
}) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const t = themeClasses[theme];
  const deskReplies = state.chats.filter((item) => item.from === 'desk' && !item.hidden).slice(0, 3);

  function send() {
    const body = text.trim();
    if (body.length < 2) return;
    const msg: RestaurantChatMsg = {
      id: `${Date.now()}`,
      from: 'buyer',
      name: isLab ? STORE_RESTAURANT_LIVE.labDemoNameAr : name.trim().slice(0, 40) || 'ضيف الحي',
      text: body.slice(0, 240),
      at: new Date().toISOString(),
    };
    onChange({ ...state, chats: [msg, ...state.chats].slice(0, 200) });
    setText('');
  }

  return (
    <section className={cn('mt-6 rounded-2xl border p-4', t.section)}>
      <h3 className={cn('font-extrabold', t.heading)}>{STORE_RESTAURANT_LIVE.chatBuyerTitleAr}</h3>
      <p className={cn('mt-1 text-xs leading-6', t.hint)}>{STORE_RESTAURANT_LIVE.chatBuyerHintAr}</p>
      <p className={cn('mt-1 text-xs leading-6', t.replyHint)}>{STORE_RESTAURANT_LIVE.chatBuyerReplyHintAr}</p>
      {!isLab ? (
        <label className={cn('mt-3 block text-sm', t.body)}>
          الاسم
          <input className={t.field} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      ) : null}
      <label className={cn('mt-3 block text-sm', t.body)}>
        استفسارك
        <textarea
          className={cn(t.field, 'min-h-24 py-2')}
          value={text}
          maxLength={240}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button type="button" onClick={send} className={cn('mt-3 rounded-full px-4 py-2 text-sm font-bold', t.button)}>
        {STORE_RESTAURANT_LIVE.chatBuyerSendAr}
      </button>
      {deskReplies.length ? (
        <ul className={cn('mt-4 space-y-2 border-t pt-3 text-sm', theme === 'light' ? 'border-[#dfe4d6]' : 'border-white/10')}>
          {deskReplies.map((item) => (
            <li key={item.id} className={cn('rounded-xl border px-3 py-2', t.bubble)}>
              <p className={cn('text-xs', t.bubbleMeta)}>رد المطبخ</p>
              <p className={cn('mt-1 leading-7', t.body)}>{item.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function StoreRestaurantDeskChat({
  state,
  onChange,
  theme = 'dark',
}: {
  state: RestaurantLabState;
  onChange: (next: RestaurantLabState) => void;
  theme?: ChatTheme;
}) {
  const [reply, setReply] = useState('');
  const t = themeClasses[theme];
  const visible = state.chats.filter((item) => !item.hidden).slice(0, 30);

  function sendReply() {
    const body = reply.trim();
    if (body.length < 2) return;
    const msg: RestaurantChatMsg = {
      id: `${Date.now()}`,
      from: 'desk',
      name: state.host.hostName || 'المطبخ',
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
    <section className={cn('rounded-2xl border p-4', t.section)}>
      <h3 className={cn('font-extrabold', t.heading)}>{STORE_RESTAURANT_LIVE.chatDeskTitleAr}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {visible.map((item) => (
          <li key={item.id} className={cn('rounded-xl border p-3', t.bubble)}>
            <p className={cn('text-xs', t.bubbleMeta)}>{item.from === 'desk' ? 'المطبخ' : 'ضيف الحي'} · {item.name}</p>
            <p className={cn('mt-1 leading-7', t.body)}>{item.text}</p>
            <button type="button" className={cn('mt-2 text-xs underline', t.bubbleHide)} onClick={() => hide(item.id)}>
              إخفاء
            </button>
          </li>
        ))}
      </ul>
      <label className={cn('mt-3 block text-sm', t.body)}>
        {STORE_RESTAURANT_LIVE.chatDeskReplyAr}
        <textarea className={cn(t.field, 'min-h-20 py-2')} value={reply} onChange={(e) => setReply(e.target.value)} />
      </label>
      <button type="button" onClick={sendReply} className={cn('mt-3 rounded-full px-4 py-2 text-sm font-bold', t.button)}>
        إرسال الرد
      </button>
    </section>
  );
}
