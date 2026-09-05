/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صندوق محادثة مطعمنا1 — مدرج، ليس غرفة عامة.
 */
import { useState } from 'react';
import { STORE_RESTAURANT_LIVE } from '@/config/storeRestaurantLive';
import type { RestaurantChatMsg, RestaurantLabState } from '@/lib/storeRestaurantLiveLab';

export function StoreRestaurantBuyerChat({
  state,
  onChange,
  isLab = false,
}: {
  state: RestaurantLabState;
  onChange: (next: RestaurantLabState) => void;
  isLab?: boolean;
}) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
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
    <section className="mt-6 rounded-2xl border border-[#e08a3c]/25 bg-[#1a1008]/80 p-4">
      <h3 className="font-extrabold">{STORE_RESTAURANT_LIVE.chatBuyerTitleAr}</h3>
      <p className="mt-1 text-xs leading-6 text-white/60">{STORE_RESTAURANT_LIVE.chatBuyerHintAr}</p>
      <p className="mt-1 text-xs leading-6 text-white/50">{STORE_RESTAURANT_LIVE.chatBuyerReplyHintAr}</p>
      {!isLab ? (
        <label className="mt-3 block text-sm">
          الاسم
          <input className="restaurant-field" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      ) : null}
      <label className="mt-3 block text-sm">
        استفسارك
        <textarea
          className="restaurant-field min-h-24 py-2"
          value={text}
          maxLength={240}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={send}
        className="mt-3 rounded-full bg-[#e08a3c] px-4 py-2 text-sm font-bold text-[#061018]"
      >
        {STORE_RESTAURANT_LIVE.chatBuyerSendAr}
      </button>
      {deskReplies.length ? (
        <ul className="mt-4 space-y-2 border-t border-white/10 pt-3 text-sm">
          {deskReplies.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              <p className="text-xs text-white/50">رد المطبخ</p>
              <p className="mt-1 leading-7">{item.text}</p>
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
}: {
  state: RestaurantLabState;
  onChange: (next: RestaurantLabState) => void;
}) {
  const [reply, setReply] = useState('');
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
    <section className="rounded-2xl border border-[#e08a3c]/25 bg-[#1a1008]/80 p-4">
      <h3 className="font-extrabold">{STORE_RESTAURANT_LIVE.chatDeskTitleAr}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {visible.map((item) => (
          <li key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs text-white/50">{item.from === 'desk' ? 'المطبخ' : 'ضيف الحي'} · {item.name}</p>
            <p className="mt-1 leading-7">{item.text}</p>
            <button type="button" className="mt-2 text-xs text-white/45 underline" onClick={() => hide(item.id)}>
              إخفاء
            </button>
          </li>
        ))}
      </ul>
      <label className="mt-3 block text-sm">
        {STORE_RESTAURANT_LIVE.chatDeskReplyAr}
        <textarea className="restaurant-field min-h-20 py-2" value={reply} onChange={(e) => setReply(e.target.value)} />
      </label>
      <button
        type="button"
        onClick={sendReply}
        className="mt-3 rounded-full bg-[#e08a3c] px-4 py-2 text-sm font-bold text-[#061018]"
      >
        إرسال الرد
      </button>
    </section>
  );
}
