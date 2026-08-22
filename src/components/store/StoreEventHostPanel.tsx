/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useRef, useState } from 'react';
import {
  STORE_EVENT_LIVE_AUDIO,
  STORE_EVENT_LIVE_OCCASIONS,
  STORE_EVENT_VENUE_KINDS,
  eventLiveCopy,
  eventLiveFillClass,
  eventLiveHostRoles,
  eventLiveStyles,
  type StoreEventVenueKind,
} from '@/config/storeEventLive';
import { downloadInviteCardAsPng } from '@/lib/downloadInviteCardAsPng';
import {
  compressImageFile,
  eventLiveArchiveBlob,
  eventPlaceLine,
  normalizeEventHostRole,
  normalizeEventVenueKind,
  playWeddingLiveChime,
  type EventLiveAudioId,
  type EventLiveLabState,
  type EventLiveStyleId,
} from '@/lib/storeEventLiveLab';
import { StoreEventInviteCard } from '@/components/store/StoreEventInviteCard';
import { StoreHostGuestInviteIssuance } from '@/components/store/StoreHostGuestInviteIssuance';
import { cn } from '@/lib/utils';

const fieldClass = 'mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]';

export function StoreEventHostPanel({
  state,
  onChange,
  showCards = true,
  hostToken = '',
  isLab = false,
}: {
  state: EventLiveLabState;
  onChange: (next: EventLiveLabState) => void;
  showCards?: boolean;
  hostToken?: string;
  isLab?: boolean;
}) {
  const stillRef = useRef<HTMLDivElement>(null);
  const [uploadError, setUploadError] = useState('');
  const [downloadBusy, setDownloadBusy] = useState<EventLiveStyleId | ''>('');
  const [downloadError, setDownloadError] = useState('');
  const host = state.host;
  const voice = host.voice === 'women' ? 'women' : 'men';
  const copy = eventLiveCopy(voice);
  const roles = eventLiveHostRoles(voice);
  const styles = eventLiveStyles(voice);
  const fill = eventLiveFillClass(voice);
  const text = voice === 'women' ? 'text-[#e4b7c5]' : 'text-[#e8c547]';
  const borderAccent = voice === 'women' ? 'border-[#e4b7c5]/40' : 'border-[#e8c547]/40';
  const occasions = voice === 'women' ? STORE_EVENT_LIVE_OCCASIONS.women : STORE_EVENT_LIVE_OCCASIONS.men;

  function patchHost(partial: Partial<typeof host>) {
    onChange({ ...state, host: { ...host, ...partial } });
  }

  async function onUpload(file: File | undefined, kind: 'photo' | 'panorama') {
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await compressImageFile(file, kind === 'panorama' ? 1600 : 1400);
      if (kind === 'panorama') patchHost({ panoramaSrc: dataUrl, youtubeHidden: true });
      else patchHost({ photoSrc: dataUrl });
    } catch {
      setUploadError('تعذر رفع الصورة. جرّب ملفاً أصغر.');
    }
  }

  function hideBlessing(id: string) {
    onChange({
      ...state,
      blessings: state.blessings.map((item) => (item.id === id ? { ...item, hidden: true } : item)),
    });
  }

  function playAudio(id: EventLiveAudioId) {
    patchHost({ audioClipId: id });
    if (id !== 'none') playWeddingLiveChime(id);
  }

  async function downloadCard(styleId: EventLiveStyleId) {
    const node = stillRef.current?.querySelector(`[data-event-card="${styleId}"][data-still="1"]`);
    if (!(node instanceof HTMLElement)) {
      setDownloadError('تعذر تجهيز الكرت. حدّث الصفحة ثم أعد المحاولة.');
      return;
    }
    setDownloadBusy(styleId);
    setDownloadError('');
    const style = styles.find((item) => item.id === styleId);
    try {
      await downloadInviteCardAsPng(node, `ajwa-${styleId}.png`, {
        titleAr: host.occasionTitle || copy.titleAr,
        leadAr: host.welcomeAr,
        dateAr: host.eventDate,
        timeAr: host.eventTime,
        placeAr: eventPlaceLine(host),
        stampAr: 'خريطة الحل - halaqmap',
        accent: style?.accent || (voice === 'women' ? '#e4b7c5' : '#e8c547'),
        photoSrc: host.photoSrc || style?.image,
        voice,
      });
    } catch {
      setDownloadError('تعذر تحميل الكرت. أعد المحاولة.');
    } finally {
      setDownloadBusy('');
    }
  }

  function downloadArchive() {
    const blob = eventLiveArchiveBlob(state);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ajwa-archive.json';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return (
    <div className={showCards ? 'grid gap-5 lg:grid-cols-[1fr_0.85fr]' : ''} data-voice={voice}>
      <div className="invite-host-panel rounded-[28px] border border-white/12 bg-[#0b1a24]/92 p-5">
        <h2 className="invite-luminous text-xl font-extrabold">{copy.hostPanelTitleAr}</h2>
        {hostToken ? (
          <StoreHostGuestInviteIssuance
            kind="event"
            hostToken={hostToken}
            isLab={isLab}
            titleAr={copy.hostInviteTitleAr}
            leadAr={copy.hostInviteLeadAr}
            ctaAr={copy.hostInviteCtaAr}
          />
        ) : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-base">
            {copy.hostRoleLabelAr}
            <select
              className={fieldClass}
              value={host.hostRole}
              onChange={(e) => patchHost({ hostRole: normalizeEventHostRole(e.target.value, voice) })}
            >
              {roles.map((role) => (
                <option key={`${role.voice}-${role.id}`} value={role.id}>
                  {role.labelAr}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-base">
            {copy.hostNameLabelAr}
            <input className={fieldClass} value={host.hostName} onChange={(e) => patchHost({ hostName: e.target.value })} />
          </label>
          <label className="block text-base sm:col-span-2">
            {copy.occasionLabelAr}
            <input
              className={fieldClass}
              value={host.occasionTitle}
              onChange={(e) => patchHost({ occasionTitle: e.target.value })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {occasions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => patchHost({ occasionTitle: item })}
                  className={cn(
                    'rounded-full px-3 py-1 text-sm',
                    host.occasionTitle === item ? cn('font-bold', fill) : 'border border-white/20',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </label>
          <label className="block text-base">
            {copy.eventDateLabelAr}
            <input className={fieldClass} value={host.eventDate} onChange={(e) => patchHost({ eventDate: e.target.value })} />
          </label>
          <label className="block text-base">
            {copy.eventTimeLabelAr}
            <input className={fieldClass} value={host.eventTime} onChange={(e) => patchHost({ eventTime: e.target.value })} />
          </label>
          <label className="block text-base">
            {copy.venueKindLabelAr}
            <select
              className={fieldClass}
              value={normalizeEventVenueKind(host.venueKind)}
              onChange={(e) => patchHost({ venueKind: e.target.value as StoreEventVenueKind })}
            >
              {STORE_EVENT_VENUE_KINDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.labelAr}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-base">
            {copy.venueNameLabelAr}
            <input className={fieldClass} value={host.venueName} onChange={(e) => patchHost({ venueName: e.target.value })} />
          </label>
          <label className="block text-base sm:col-span-2">
            {copy.venueMapsLabelAr}
            <input
              className={fieldClass}
              dir="ltr"
              value={host.venueMapsUrl}
              onChange={(e) => patchHost({ venueMapsUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
            <span className="mt-1 block text-sm text-white/55">{copy.venueMapsHintAr}</span>
          </label>
        </div>
        <label className="mt-4 block text-base">
          {copy.hostAnnouncementLabelAr}
          <input
            className={`${fieldClass} text-lg font-extrabold`}
            value={host.announcement}
            onChange={(e) => patchHost({ announcement: e.target.value })}
            placeholder="حياكم الله على العشاء"
          />
        </label>
        <label className="mt-4 block text-base">
          {copy.hostWelcomeLabelAr}
          <textarea
            value={host.welcomeAr}
            onChange={(e) => patchHost({ welcomeAr: e.target.value })}
            className="mt-1 h-24 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-base text-[#f4efe4]"
          />
        </label>
        <label className="mt-4 block text-base">
          {copy.hostYoutubeLabelAr}
          <input
            className={fieldClass}
            dir="ltr"
            value={host.youtubeUrl}
            onChange={(e) => patchHost({ youtubeUrl: e.target.value, youtubeHidden: false })}
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => patchHost({ youtubeHidden: true })}
            className={cn('rounded-full px-3 py-1.5 text-sm', host.youtubeHidden ? cn('font-bold', fill) : 'border border-white/20')}
          >
            {copy.hostYoutubeHideAr}
          </button>
          <button
            type="button"
            onClick={() => patchHost({ youtubeHidden: false })}
            className={cn('rounded-full px-3 py-1.5 text-sm', !host.youtubeHidden ? cn('font-bold', fill) : 'border border-white/20')}
          >
            {copy.hostYoutubeShowAr}
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-base">
            {copy.hostUploadPhotoAr}
            <input type="file" accept="image/*" className="mt-2 block w-full text-sm" onChange={(e) => void onUpload(e.target.files?.[0], 'photo')} />
          </label>
          <label className="block text-base">
            {copy.hostUploadPanoramaAr}
            <input type="file" accept="image/*" className="mt-2 block w-full text-sm" onChange={(e) => void onUpload(e.target.files?.[0], 'panorama')} />
          </label>
        </div>
        {uploadError ? <p className={cn('mt-2 text-base', text)}>{uploadError}</p> : null}
        <p className="mt-4 text-base">{copy.hostAudioLabelAr}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STORE_EVENT_LIVE_AUDIO.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => playAudio(item.id)}
              className={cn('rounded-full px-3 py-1.5 text-sm', host.audioClipId === item.id ? cn('font-bold', fill) : 'border border-white/20')}
            >
              {item.labelAr}
            </button>
          ))}
        </div>
        <p className="mt-5 text-base">تهاني الشاشة</p>
        <ul className="mt-2 space-y-2">
          {state.blessings.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-base">
              <span className={item.hidden ? 'text-white/35 line-through' : ''}>{item.name}</span>
              {!item.hidden ? (
                <button type="button" className="text-sm text-white/50" onClick={() => hideBlessing(item.id)}>
                  إخفاء
                </button>
              ) : (
                <span className="text-sm text-white/35">مخفية</span>
              )}
            </li>
          ))}
        </ul>
        <button type="button" onClick={downloadArchive} className={cn('mt-5 w-full rounded-full border py-2 text-base font-bold', borderAccent, text)}>
          {copy.archiveCtaAr}
        </button>
      </div>
      {showCards ? (
        <div>
          <div className="space-y-3">
            {styles.map((item) => (
              <StoreEventInviteCard key={item.id} host={host} styleId={item.id} />
            ))}
          </div>
          <div ref={stillRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[-1] w-[360px] opacity-0">
            {styles.map((item) => (
              <StoreEventInviteCard key={`still-${item.id}`} host={host} styleId={item.id} still />
            ))}
          </div>
          <div className="mt-3 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {styles.map((item, index) => (
              <button
                key={item.id}
                type="button"
                disabled={Boolean(downloadBusy)}
                onClick={() => void downloadCard(item.id)}
                className={cn('w-full rounded-full px-4 py-2.5 text-sm font-bold disabled:opacity-60', index === 0 ? fill : 'border border-white/20')}
              >
                {downloadBusy === item.id
                  ? 'جاري التحميل…'
                  : index === 0
                    ? copy.downloadGoldAr
                    : copy.downloadIvoryAr}
              </button>
            ))}
          </div>
          {downloadError ? <p className={cn('mt-2 text-sm', text)}>{downloadError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
