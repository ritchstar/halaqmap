/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صندوق محادثة تمويناتا1 — إضافة اختيارية، ليست غرفة عامة.
 * يدعم مظهرين: dark (الواجهة القديمة المظلمة) و light (واجهة Chatly الورقية الفاتحة).
 */
import { useState } from 'react';
import { STORE_GROCERS_LIVE } from '@/config/storeGrocersLive';
import type { GrocersChatMsg, GrocersLabState } from '@/lib/storeGrocersLiveLab';
import { cn } from '@/lib/utils';

type ChatTheme = 'dark' | 'light';

const themeClasses = {
  dark: {
    section: 'border-[#8fbf7a]/25 bg-[#07140e]/80',
    hint: 'text-white/60',
    field: 'grocers-field',
    button: 'bg-[#8fbf7a] text-[#061018]',
    bubble: 'border-white/10 bg-black/30',
    bubbleMeta: 'text-white/50',
    bubbleHide: 'text-white/45',
    heading: '',
    body: '',
  },
  light: {
    section: 'border-[#dfe4d6] bg-[#fffdf5]',
    hint: 'text-[#758374]',
    field: 'border border-[#dfe4d6] bg-white text-[#20352b] placeholder:text-[#a0aca0] rounded-xl px-3 h-12 w-full mt-1',
    button: 'bg-[#8fbf7a] text-white',
    bubble: 'border-[#dfe4d6] bg-white',
    bubbleMeta: 'text-[#758374]',
    bubbleHide: 'text-[#98a396]',
    heading: 'text-[#20352b]',
    body: 'text-[#20352b]',
  },
} as const satisfies Record<ChatTheme, Record<string, string>>;

export function StoreGrocersBuyerChat({
  state,
  onChange,
  isLab = false,
  theme = 'dark',
}: {
  state: GrocersLabState;
  onChange: (next: GrocersLabState) => void;
  isLab?: boolean;
  theme?: ChatTheme;
}) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const t = themeClasses[theme];
  if (!state.chatAddon) return null;

  function send() {
    const body = text.trim();
    if (body.length < 2) return;
    const msg: GrocersChatMsg = {
      id: `${Date.now()}`,
      from: 'buyer',
      name: isLab ? STORE_GROCERS_LIVE.labDemoNameAr : name.trim().slice(0, 40) || 'عميل',
      text: body.slice(0, 240),
      at: new Date().toISOString(),
    };
    onChange({ ...state, chats: [msg, ...state.chats].slice(0, 200) });
    setText('');
  }

  return (
    <section className={cn('mt-6 rounded-2xl border p-4', t.section)}>
      <h3 className={cn('font-extrabold', t.heading)}>{STORE_GROCERS_LIVE.chatBuyerTitleAr}</h3>
      <p className={cn('mt-1 text-xs leading-6', t.hint)}>{STORE_GROCERS_LIVE.chatBuyerHintAr}</p>
      <label className={cn('mt-3 block text-sm', t.body)}>
        الاسم
        <input className={t.field} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={cn('mt-3 block text-sm', t.body)}>
        ملاحظتك
        <textarea
          className={cn(t.field, 'min-h-24 py-2')}
          value={text}
          maxLength={240}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button type="button" onClick={send} className={cn('mt-3 rounded-full px-4 py-2 text-sm font-bold', t.button)}>
        {STORE_GROCERS_LIVE.chatBuyerSendAr}
      </button>
    </section>
  );
}

export function StoreGrocersDeskChat({
  state,
  onChange,
  theme = 'dark',
}: {
  state: GrocersLabState;
  onChange: (next: GrocersLabState) => void;
  theme?: ChatTheme;
}) {
  const [reply, setReply] = useState('');
  const t = themeClasses[theme];
  if (!state.chatAddon) return null;
  const visible = state.chats.filter((item) => !item.hidden).slice(0, 30);

  function sendReply() {
    const body = reply.trim();
    if (body.length < 2) return;
    const msg: GrocersChatMsg = {
      id: `${Date.now()}`,
      from: 'desk',
      name: state.host.hostName || 'الكاشير',
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
      <h3 className={cn('font-extrabold', t.heading)}>{STORE_GROCERS_LIVE.chatDeskTitleAr}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {visible.map((item) => (
          <li
            key={item.id}
            className={cn(theme === 'light' ? 'rounded-xl border p-3' : 'store-desk-ticket-card rounded-xl border p-3', theme === 'light' && t.bubble)}
          >
            <p className={cn('text-xs', theme === 'light' ? t.bubbleMeta : 'text-white/50')}>
              {item.from === 'desk' ? 'الكاشير' : 'جار الحي'} · {item.name}
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
        {STORE_GROCERS_LIVE.chatDeskReplyAr}
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
