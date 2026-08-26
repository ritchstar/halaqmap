/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import QRCode from 'react-qr-code';
import {
  STORE_CAFE_LIVE,
  STORE_CAFE_LIVE_EVENTS,
  type StoreCafeLiveEventId,
} from '@/config/storeCafeLive';
import { applyCafeEvent, compressImageFile, type CafeLabState } from '@/lib/storeCafeLiveLab';
import { cn } from '@/lib/utils';
import { StoreTrialOpsNote } from '@/components/store/StoreTrialOpsNote';

export function StoreCafeHostPanel({
  state,
  onChange,
  guestUrl,
  displayUrl,
  quietUrl,
  menuUrl,
}: {
  state: CafeLabState;
  onChange: (next: CafeLabState) => void;
  guestUrl?: string;
  displayUrl?: string;
  quietUrl?: string;
  menuUrl?: string;
}) {
  const [uploadError, setUploadError] = useState('');
  const [customTitle, setCustomTitle] = useState(state.host.customEventTitle);
  const host = state.host;

  function patchHost(partial: Partial<typeof host>) {
    onChange({ ...state, host: { ...host, ...partial } });
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await compressImageFile(file, 1600);
      patchHost({ panoramaSrc: dataUrl, photoSrc: dataUrl, youtubeHidden: true });
    } catch {
      setUploadError('تعذر رفع الصورة. جرّب ملفاً أصغر.');
    }
  }

  function patchBlessing(id: string, partial: { hidden?: boolean; pending?: boolean }) {
    onChange({
      ...state,
      blessings: state.blessings.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    });
  }

  const pending = state.blessings.filter((item) => item.pending === true && item.hidden !== true);
  const visible = state.blessings.filter((item) => item.hidden !== true && item.pending !== true);

  return (
    <div className="space-y-4 rounded-2xl border border-white/12 bg-[#1a1008]/90 p-5">
      <StoreTrialOpsNote productKey="cafe" />
      <h2 className="text-lg font-extrabold">{STORE_CAFE_LIVE.hostLinkAr}</h2>
      <label className="block text-sm">
        {STORE_CAFE_LIVE.cafeNameLabelAr}
        <input className="cafe-field" value={host.shopName} onChange={(e) => patchHost({ shopName: e.target.value })} />
      </label>
      <label className="block text-sm">
        {STORE_CAFE_LIVE.hostNameLabelAr}
        <input className="cafe-field" value={host.hostName} onChange={(e) => patchHost({ hostName: e.target.value })} />
      </label>
      <label className="block text-sm">
        {STORE_CAFE_LIVE.hostWelcomeLabelAr}
        <textarea className="cafe-field min-h-20 py-2" value={host.welcomeAr} onChange={(e) => patchHost({ welcomeAr: e.target.value })} />
      </label>
      <label className="block text-sm">
        {STORE_CAFE_LIVE.hostAnnouncementLabelAr}
        <input className="cafe-field" value={host.announcement} onChange={(e) => patchHost({ announcement: e.target.value })} />
      </label>
      <label className="block text-sm">
        {STORE_CAFE_LIVE.hostYoutubeLabelAr}
        <input className="cafe-field" value={host.youtubeUrl} onChange={(e) => patchHost({ youtubeUrl: e.target.value })} />
      </label>
      <button
        type="button"
        className="rounded-full border border-white/20 px-4 py-2 text-sm"
        onClick={() => patchHost({ youtubeHidden: !host.youtubeHidden })}
      >
        {host.youtubeHidden ? STORE_CAFE_LIVE.hostYoutubeShowAr : STORE_CAFE_LIVE.hostYoutubeHideAr}
      </button>
      <label className="block text-sm">
        {STORE_CAFE_LIVE.hostUploadPhotoAr}
        <input className="mt-1" type="file" accept="image/*" onChange={(e) => void onUpload(e.target.files?.[0])} />
      </label>
      {uploadError ? <p className="text-sm text-red-300">{uploadError}</p> : null}
      <div className="flex flex-wrap gap-2">
        {STORE_CAFE_LIVE_EVENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange({ ...state, host: applyCafeEvent(host, item.id as StoreCafeLiveEventId) })}
            className={cn(
              'rounded-full border px-3 py-2 text-xs',
              host.activeEventId === item.id ? 'border-[#c48a4a] bg-[#c48a4a]/15' : 'border-white/15',
            )}
          >
            {item.titleAr}
          </button>
        ))}
      </div>
      <label className="block text-sm">
        فعالية يسميها المقهى
        <input className="cafe-field" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
      </label>
      <button
        type="button"
        className="rounded-full bg-[#c48a4a] px-4 py-2 text-sm font-bold text-[#061018]"
        onClick={() => {
          const title = customTitle.trim();
          if (title.length < 2) return;
          onChange({
            ...state,
            host: { ...applyCafeEvent({ ...host, customEventTitle: title }, 'custom'), customEventTitle: title },
          });
        }}
      >
        اعرض هذه الفعالية
      </button>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={host.guestPaused} onChange={(e) => patchHost({ guestPaused: e.target.checked })} />
        {STORE_CAFE_LIVE.hostPauseAr}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={host.reviewBeforeShow} onChange={(e) => patchHost({ reviewBeforeShow: e.target.checked })} />
        {STORE_CAFE_LIVE.hostReviewAr}
      </label>
      {pending.length ? (
        <ul className="space-y-2">
          {pending.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/10 p-3 text-sm">
              <p className="font-extrabold">{item.name}</p>
              <p>{item.cannedText} {item.extra}</p>
              <button type="button" className="mt-2 text-[#c48a4a]" onClick={() => patchBlessing(item.id, { pending: false })}>
                {STORE_CAFE_LIVE.hostApproveAr}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {visible.slice(-8).reverse().map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
          <span>{item.name}: {item.cannedText}</span>
          <button type="button" onClick={() => patchBlessing(item.id, { hidden: true })}>
            {STORE_CAFE_LIVE.hostHideAr}
          </button>
        </div>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { url: displayUrl, label: STORE_CAFE_LIVE.displayLinkAr },
          { url: quietUrl, label: STORE_CAFE_LIVE.quietLinkAr },
          { url: menuUrl, label: STORE_CAFE_LIVE.menuLinkAr },
          { url: guestUrl, label: STORE_CAFE_LIVE.guestLinkAr },
        ].map((item) =>
          item.url ? (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center">
              <p className="text-xs font-bold text-white/70">{item.label}</p>
              <div className="mx-auto mt-2 w-fit rounded-xl bg-white p-2">
                <QRCode value={item.url} size={96} />
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
