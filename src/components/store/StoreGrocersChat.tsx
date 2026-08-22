/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صندوق محادثة تمويناتا1 — إضافة اختيارية، ليست غرفة عامة.
 */
import { useState } from 'react';
import { STORE_GROCERS_LIVE } from '@/config/storeGrocersLive';
import type { GrocersChatMsg, GrocersLabState } from '@/lib/storeGrocersLiveLab';

export function StoreGrocersBuyerChat({
  state,
  onChange,
}: {
  state: GrocersLabState;
  onChange: (next: GrocersLabState) => void;
}) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  if (!state.chatAddon) return null;

  function send() {
    const body = text.trim();
    if (body.length < 2) return;
    const msg: GrocersChatMsg = {
      id: `${Date.now()}`,
      from: 'buyer',
      name: name.trim().slice(0, 40) || 'جار الحي',
      text: body.slice(0, 240),
      at: new Date().toISOString(),
    };
    onChange({ ...state, chats: [msg, ...state.chats].slice(0, 200) });
    setText('');
  }

  return (
    <section className="mt-6 rounded-2xl border border-[#8fbf7a]/25 bg-[#07140e]/80 p-4">
      <h3 className="font-extrabold">{STORE_GROCERS_LIVE.chatBuyerTitleAr}</h3>
      <p className="mt-1 text-xs leading-6 text-white/60">{STORE_GROCERS_LIVE.chatBuyerHintAr}</p>
      <label className="mt-3 block text-sm">
        الاسم
        <input className="grocers-field" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="mt-3 block text-sm">
        ملاحظتك
        <textarea
          className="grocers-field min-h-24 py-2"
          value={text}
          maxLength={240}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={send}
        className="mt-3 rounded-full bg-[#8fbf7a] px-4 py-2 text-sm font-bold text-[#061018]"
      >
        {STORE_GROCERS_LIVE.chatBuyerSendAr}
      </button>
    </section>
  );
}

export function StoreGrocersDeskChat({
  state,
  onChange,
}: {
  state: GrocersLabState;
  onChange: (next: GrocersLabState) => void;
}) {
  const [reply, setReply] = useState('');
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
    <section className="rounded-2xl border border-[#8fbf7a]/25 bg-[#07140e]/80 p-4">
      <h3 className="font-extrabold">{STORE_GROCERS_LIVE.chatDeskTitleAr}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {visible.map((item) => (
          <li key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs text-white/50">{item.from === 'desk' ? 'الكاشير' : 'جار الحي'} · {item.name}</p>
            <p className="mt-1 leading-7">{item.text}</p>
            <button type="button" className="mt-2 text-xs text-white/45 underline" onClick={() => hide(item.id)}>
              إخفاء
            </button>
          </li>
        ))}
      </ul>
      <label className="mt-3 block text-sm">
        {STORE_GROCERS_LIVE.chatDeskReplyAr}
        <textarea className="grocers-field min-h-20 py-2" value={reply} onChange={(e) => setReply(e.target.value)} />
      </label>
      <button
        type="button"
        onClick={sendReply}
        className="mt-3 rounded-full bg-[#8fbf7a] px-4 py-2 text-sm font-bold text-[#061018]"
      >
        إرسال الرد
      </button>
    </section>
  );
}
