/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صندوق ملاحظة تمرتنا1 — مدرج، ليست غرفة عامة.
 * يدعم مظهرين: dark (الواجهة القديمة المظلمة) و light (واجهة Chatly الورقية الفاتحة).
 */
import { useState } from 'react';
import { STORE_DATES_LIVE } from '@/config/storeDatesLive';
import type { DatesChatMsg, DatesLabState } from '@/lib/storeDatesLiveLab';
import { cn } from '@/lib/utils';

type ChatTheme = 'dark' | 'light';

const themeClasses = {
  dark: {
    section: 'border-[#8A6239]/25 bg-[#1a140c]/80',
    hint: 'text-white/60',
    field: 'dates-field',
    button: 'bg-[#8A6239] text-[#061018]',
    bubble: 'border-white/10 bg-black/30',
    bubbleMeta: 'text-white/50',
    bubbleHide: 'text-white/45',
    heading: '',
    body: '',
  },
  light: {
    section: 'border-[#dac8aa] bg-[#fdf9f0]',
    hint: 'text-[#8a7c66]',
    field: 'border border-[#dac8aa] bg-white text-[#2a2016] placeholder:text-[#a2937b] rounded-xl px-3 h-12 w-full mt-1',
    button: 'bg-[#8a6239] text-white',
    bubble: 'border-[#e2d2b4] bg-white',
    bubbleMeta: 'text-[#8a7c66]',
    bubbleHide: 'text-[#a2937b]',
    heading: 'text-[#2a2016]',
    body: 'text-[#2a2016]',
  },
} as const satisfies Record<ChatTheme, Record<string, string>>;

export function StoreDatesBuyerChat({
  state,
  onChange,
  theme = 'dark',
}: {
  state: DatesLabState;
  onChange: (next: DatesLabState) => void;
  theme?: ChatTheme;
}) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  if (state.chatIncluded === false) return null;
  const t = themeClasses[theme];
  const fieldClass = theme === 'light' ? t.field : 'dates-field';

  function send() {
    const body = text.trim();
    if (body.length < 2) return;
    const msg: DatesChatMsg = {
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
      <h3 className={cn('font-extrabold', t.heading)}>{STORE_DATES_LIVE.chatBuyerTitleAr}</h3>
      <p className={cn('mt-1 text-xs leading-6', t.hint)}>{STORE_DATES_LIVE.chatBuyerHintAr}</p>
      <label className={cn('mt-3 block text-sm', t.body)}>
        {STORE_DATES_LIVE.chatBuyerNameLabelAr}
        <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={cn('mt-3 block text-sm', t.body)}>
        {STORE_DATES_LIVE.chatBuyerFieldLabelAr}
        <textarea
          className={cn(fieldClass, 'min-h-24 py-2')}
          value={text}
          maxLength={240}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button type="button" onClick={send} className={cn('mt-3 rounded-full px-4 py-2 text-sm font-bold', t.button)}>
        {STORE_DATES_LIVE.chatBuyerSendAr}
      </button>
    </section>
  );
}

export function StoreDatesDeskChat({
  state,
  onChange,
  theme = 'dark',
}: {
  state: DatesLabState;
  onChange: (next: DatesLabState) => void;
  theme?: ChatTheme;
}) {
  const [reply, setReply] = useState('');
  if (state.chatIncluded === false) return null;
  const visible = state.chats.filter((item) => !item.hidden).slice(0, 30);
  const t = themeClasses[theme];
  const fieldClass = theme === 'light' ? t.field : 'dates-field';

  function sendReply() {
    const body = reply.trim();
    if (body.length < 2) return;
    const msg: DatesChatMsg = {
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
    <section className={cn('rounded-2xl border p-4', t.section)}>
      <h3 className={cn('font-extrabold', t.heading)}>{STORE_DATES_LIVE.chatDeskTitleAr}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {visible.map((item) => (
          <li key={item.id} className={cn('rounded-xl border p-3', t.bubble)}>
            <p className={cn('text-xs', t.bubbleMeta)}>
              {item.from === 'desk' ? 'المشغّل' : 'العميل'} · {item.name}
            </p>
            <p className={cn('mt-1 leading-7', t.body)}>{item.text}</p>
            <button type="button" className={cn('mt-2 text-xs underline', t.bubbleHide)} onClick={() => hide(item.id)}>
              إخفاء
            </button>
          </li>
        ))}
      </ul>
      <label className={cn('mt-3 block text-sm', t.body)}>
        {STORE_DATES_LIVE.chatDeskReplyAr}
        <textarea className={cn(fieldClass, 'min-h-20 py-2')} value={reply} onChange={(e) => setReply(e.target.value)} />
      </label>
      <button
        type="button"
        onClick={sendReply}
        className={cn('mt-3 rounded-full px-4 py-2 text-sm font-bold', t.button)}
      >
        إرسال الرد
      </button>
    </section>
  );
}
