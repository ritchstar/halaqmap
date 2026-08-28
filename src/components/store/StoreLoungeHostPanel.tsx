/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import QRCode from 'react-qr-code';
import {
  STORE_LOUNGE_LIVE,
  STORE_LOUNGE_LIVE_EVENTS,
  type StoreLoungeLiveEventId,
} from '@/config/storeLoungeLive';
import {
  applyLoungeEvent,
  compressImageFile,
  type LoungeLiveLabState,
} from '@/lib/storeLoungeLiveLab';
import { cn } from '@/lib/utils';
import { StoreTrialOpsNote } from '@/components/store/StoreTrialOpsNote';
import { StoreProductPassDeskButton } from '@/components/store/StoreProductPassDeskButton';

const fieldClass = 'mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-[#f4efe4]';

export function StoreLoungeHostPanel({
  state,
  onChange,
  guestUrl,
  displayUrl,
  expiresAt,
  showTrialNote = false,
  token,
}: {
  state: LoungeLiveLabState;
  onChange: (next: LoungeLiveLabState) => void;
  guestUrl?: string;
  displayUrl?: string;
  expiresAt?: string;
  showTrialNote?: boolean;
  token: string;
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

  function pickEvent(id: StoreLoungeLiveEventId) {
    onChange({ ...state, host: applyLoungeEvent(host, id) });
  }

  function applyCustom() {
    const title = customTitle.trim();
    if (title.length < 2) return;
    onChange({
      ...state,
      host: {
        ...applyLoungeEvent({ ...host, customEventTitle: title, welcomeAr: host.welcomeAr }, 'custom'),
        customEventTitle: title,
      },
    });
  }

  const pending = state.blessings.filter((item) => item.pending === true && item.hidden !== true);
  const visible = state.blessings.filter((item) => item.hidden !== true && item.pending !== true);

  return (
    <div className="rounded-2xl border border-white/12 bg-[#0b1a24]/90 p-5">
      <h2 className="text-lg font-extrabold">{STORE_LOUNGE_LIVE.hostPanelTitleAr}</h2>
      {showTrialNote ? (
        <div className="mt-3">
          <StoreTrialOpsNote productKey="lounge" />
        </div>
      ) : null}
      {expiresAt ? (
        <p className="mt-2 text-xs text-white/55">تنتهي مدة التشغيل في {expiresAt.slice(0, 10)}.</p>
      ) : null}

      <p className="mt-5 text-sm font-bold text-[#d4a574]">{STORE_LOUNGE_LIVE.hostScreenAr}</p>
      {displayUrl || guestUrl ? (
        <div className="mt-3 flex flex-wrap items-start gap-4">
          {guestUrl ? (
            <div className="rounded-xl bg-white p-2">
              <QRCode value={guestUrl} size={96} />
            </div>
          ) : null}
          <div className="min-w-0 space-y-2 text-xs">
            {displayUrl ? (
              <p>
                {STORE_LOUNGE_LIVE.displayLinkAr}:{' '}
                <a className="text-[#d4a574] underline" href={displayUrl}>
                  {displayUrl}
                </a>
              </p>
            ) : null}
            {guestUrl ? (
              <p>
                {STORE_LOUNGE_LIVE.guestLinkAr}:{' '}
                <a className="text-[#d4a574] underline" href={guestUrl}>
                  {guestUrl}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      {token ? (
        <StoreProductPassDeskButton kind="lounge" token={token} shopName={host.loungeName} />
      ) : null}
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={host.guestPaused === true}
          onChange={(e) => patchHost({ guestPaused: e.target.checked })}
        />
        {STORE_LOUNGE_LIVE.hostPauseAr}
      </label>
      <label className="mt-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={host.reviewBeforeShow === true}
          onChange={(e) => patchHost({ reviewBeforeShow: e.target.checked })}
        />
        {STORE_LOUNGE_LIVE.hostReviewAr}
      </label>

      <p className="mt-6 text-sm font-bold text-[#d4a574]">{STORE_LOUNGE_LIVE.hostContentAr}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          {STORE_LOUNGE_LIVE.loungeNameLabelAr}
          <input className={fieldClass} value={host.loungeName} onChange={(e) => patchHost({ loungeName: e.target.value })} />
        </label>
        <label className="block text-sm">
          {STORE_LOUNGE_LIVE.hostNameLabelAr}
          <input className={fieldClass} value={host.hostName} onChange={(e) => patchHost({ hostName: e.target.value })} />
        </label>
      </div>
      <p className="mt-4 text-sm font-bold text-[#d4a574]">{STORE_LOUNGE_LIVE.eventPackTitleAr}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {STORE_LOUNGE_LIVE_EVENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pickEvent(item.id)}
            className={cn(
              'rounded-full px-3 py-1 text-xs',
              host.activeEventId === item.id ? 'bg-[#d4a574] font-bold text-[#12090c]' : 'border border-white/20',
            )}
          >
            {item.titleAr}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-sm">
        {STORE_LOUNGE_LIVE.customEventLabelAr}
        <div className="mt-1 flex gap-2">
          <input className={fieldClass} value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
          <button
            type="button"
            onClick={applyCustom}
            className="mt-1 shrink-0 rounded-md border border-[#d4a574]/40 px-3 text-xs font-bold text-[#d4a574]"
          >
            {STORE_LOUNGE_LIVE.customEventCtaAr}
          </button>
        </div>
      </label>
      <label className="mt-3 block text-sm">
        {STORE_LOUNGE_LIVE.hostWelcomeLabelAr}
        <textarea
          className="mt-1 h-24 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-[#f4efe4]"
          value={host.welcomeAr}
          onChange={(e) => patchHost({ welcomeAr: e.target.value })}
        />
      </label>
      <label className="mt-3 block text-sm">
        {STORE_LOUNGE_LIVE.hostAnnouncementLabelAr}
        <input className={fieldClass} value={host.announcement} onChange={(e) => patchHost({ announcement: e.target.value })} />
      </label>
      <label className="mt-3 block text-sm">
        {STORE_LOUNGE_LIVE.hostYoutubeLabelAr}
        <input
          className={fieldClass}
          dir="ltr"
          value={host.youtubeUrl}
          onChange={(e) => patchHost({ youtubeUrl: e.target.value, youtubeHidden: !e.target.value.trim() })}
        />
      </label>
      <button
        type="button"
        className="mt-3 text-xs text-white/60 underline"
        onClick={() => patchHost({ youtubeHidden: !host.youtubeHidden })}
      >
        {host.youtubeHidden ? STORE_LOUNGE_LIVE.hostYoutubeShowAr : STORE_LOUNGE_LIVE.hostYoutubeHideAr}
      </button>
      <label className="mt-4 block text-sm">
        {STORE_LOUNGE_LIVE.hostUploadPhotoAr}
        <input
          className="mt-1 block w-full text-xs"
          type="file"
          accept="image/*"
          onChange={(e) => void onUpload(e.target.files?.[0])}
        />
      </label>
      {uploadError ? <p className="mt-2 text-sm text-red-300">{uploadError}</p> : null}

      <p className="mt-6 text-sm font-bold text-[#d4a574]">{STORE_LOUNGE_LIVE.hostInteractAr}</p>
      {pending.length ? (
        <ul className="mt-3 space-y-2">
          {pending.slice(-12).reverse().map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-[#d4a574]/35 px-3 py-2 text-sm">
              <span>
                <strong className="text-[#d4a574]">{item.name}</strong> — {item.cannedText}
              </span>
              <span className="flex shrink-0 gap-2">
                <button type="button" className="text-xs text-[#d4a574] underline" onClick={() => patchBlessing(item.id, { pending: false })}>
                  {STORE_LOUNGE_LIVE.hostApproveAr}
                </button>
                <button type="button" className="text-xs text-white/45 underline" onClick={() => patchBlessing(item.id, { hidden: true, pending: false })}>
                  {STORE_LOUNGE_LIVE.hostHideAr}
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-white/45">لا ترحيبات بانتظار الاعتماد.</p>
      )}
      {visible.length ? (
        <ul className="mt-3 space-y-2">
          {visible.slice(-12).reverse().map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
              <span>
                <strong className="text-[#d4a574]">{item.name}</strong> — {item.cannedText}
              </span>
              <button type="button" className="shrink-0 text-xs text-white/45 underline" onClick={() => patchBlessing(item.id, { hidden: true })}>
                {STORE_LOUNGE_LIVE.hostHideAr}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
