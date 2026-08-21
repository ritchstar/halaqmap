/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useRef, useState } from 'react';
import {
  STORE_WEDDING_LIVE_AUDIO,
  weddingLiveCopy,
  weddingLiveFillClass,
  weddingLiveHostRoles,
  weddingLiveStyles,
} from '@/config/storeWeddingLive';
import {
  nextWeddingWelcomeSetIndex,
  weddingWelcomeHeroText,
  weddingWelcomeSetAt,
  weddingWelcomeSetCount,
} from '@/config/storeWeddingWelcomeSets';
import { downloadElementAsPngCard } from '@/lib/downloadElementAsPngCard';
import {
  compressImageFile,
  normalizeWeddingHostRole,
  playWeddingLiveChime,
  weddingLiveArchiveBlob,
  type WeddingLiveAudioId,
  type WeddingLiveLabState,
  type WeddingLiveStyleId,
} from '@/lib/storeWeddingLiveLab';
import { StoreWeddingInviteCard } from '@/components/store/StoreWeddingInviteCard';
import { cn } from '@/lib/utils';

const fieldClass = 'mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-[#f4efe4]';

export function StoreWeddingHostPanel({
  state,
  onChange,
  showCards = true,
}: {
  state: WeddingLiveLabState;
  onChange: (next: WeddingLiveLabState) => void;
  showCards?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [uploadError, setUploadError] = useState('');
  const host = state.host;
  const voice = host.voice === 'women' ? 'women' : 'men';
  const copy = weddingLiveCopy(voice);
  const roles = weddingLiveHostRoles(voice);
  const styles = weddingLiveStyles(voice);
  const fill = weddingLiveFillClass(voice);
  const text = voice === 'women' ? 'text-[#e4b7c5]' : 'text-[#e8c547]';
  const borderAccent = voice === 'women' ? 'border-[#e4b7c5]/40' : 'border-[#e8c547]/40';

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

  function playAudio(id: WeddingLiveAudioId) {
    patchHost({ audioClipId: id });
    if (id !== 'none') playWeddingLiveChime(id);
  }

  async function downloadCard(styleId: WeddingLiveStyleId) {
    const node = cardRef.current?.querySelector(`[data-wedding-card="${styleId}"]`);
    if (!(node instanceof HTMLElement)) return;
    await downloadElementAsPngCard(node, `wedding-invite-${styleId}.png`);
  }

  function downloadArchive() {
    const blob = weddingLiveArchiveBlob(state);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-live-archive.json';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return (
    <div className={showCards ? 'grid gap-5 lg:grid-cols-[1fr_0.85fr]' : ''}>
      <div className="rounded-2xl border border-white/12 bg-[#0b1a24]/90 p-5">
        <h2 className="text-lg font-extrabold">{copy.hostPanelTitleAr}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            {copy.hostRoleLabelAr}
            <select
              className={fieldClass}
              value={host.hostRole}
              onChange={(e) => patchHost({ hostRole: normalizeWeddingHostRole(e.target.value, voice) })}
            >
              {roles.map((role) => (
                <option key={`${role.voice}-${role.id}`} value={role.id}>
                  {role.labelAr}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            {copy.hostNameLabelAr}
            <input className={fieldClass} value={host.hostName} onChange={(e) => patchHost({ hostName: e.target.value })} />
          </label>
          <label className="block text-sm">
            {copy.groomNameLabelAr}
            <input className={fieldClass} value={host.groomName} onChange={(e) => patchHost({ groomName: e.target.value })} />
          </label>
          <label className="block text-sm sm:col-span-2">
            {copy.brideNameLabelAr}
            <input className={fieldClass} value={host.brideName} onChange={(e) => patchHost({ brideName: e.target.value })} />
          </label>
          <label className="block text-sm">
            {copy.eventDateLabelAr}
            <input className={fieldClass} value={host.eventDate} onChange={(e) => patchHost({ eventDate: e.target.value })} />
          </label>
          <label className="block text-sm">
            {copy.eventTimeLabelAr}
            <input className={fieldClass} value={host.eventTime} onChange={(e) => patchHost({ eventTime: e.target.value })} />
          </label>
          <label className="block text-sm">
            {copy.venueNameLabelAr}
            <input className={fieldClass} value={host.venueName} onChange={(e) => patchHost({ venueName: e.target.value })} />
          </label>
          <label className="block text-sm">
            {copy.venueMapsLabelAr}
            <input
              className={fieldClass}
              dir="ltr"
              value={host.venueMapsUrl}
              onChange={(e) => patchHost({ venueMapsUrl: e.target.value })}
            />
          </label>
        </div>
        <label className="mt-4 block text-sm">
          {copy.hostAnnouncementLabelAr}
          <input
            className={fieldClass}
            value={host.announcement}
            onChange={(e) => patchHost({ announcement: e.target.value })}
            placeholder="العشاء جاهز"
          />
        </label>
        <div className="mt-4 rounded-2xl border border-white/12 bg-[#061018]/80 p-4">
          <p className="text-sm font-extrabold">{copy.hostWelcomeSetsTitleAr}</p>
          <p className="mt-1 text-xs leading-6 text-white/65">{copy.hostWelcomeSetsLeadAr}</p>
          <p className={cn('mt-2 text-xs font-bold', text)}>
            {copy.hostWelcomeSetStatusAr} {((host.welcomeSetIndex || 0) % weddingWelcomeSetCount()) + 1}
            {' / '}
            {weddingWelcomeSetCount()}
            {' · '}
            {weddingWelcomeSetAt(host.welcomeSetIndex).toneAr}
          </p>
          <ul className="mt-3 space-y-2">
            {weddingWelcomeSetAt(host.welcomeSetIndex).lines.map((line) => (
              <li
                key={line.id}
                className={cn(
                  'rounded-xl border border-white/10 px-3 py-2 leading-7 text-white/85',
                  line.weight === 'hero' ? 'text-sm font-black' : line.weight === 'support' ? 'text-sm font-bold' : 'text-xs',
                )}
              >
                {line.textAr}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              const next = nextWeddingWelcomeSetIndex(host.welcomeSetIndex);
              patchHost({
                welcomeSetIndex: next,
                welcomeAr: weddingWelcomeHeroText(next).slice(0, 400),
              });
            }}
            className={cn('mt-4 w-full rounded-full py-2 text-sm font-bold', fill)}
          >
            {copy.hostWelcomeNextAr}
          </button>
        </div>
        <label className="mt-4 block text-sm">
          {copy.hostWelcomeLabelAr}
          <textarea
            value={host.welcomeAr}
            onChange={(e) => patchHost({ welcomeAr: e.target.value })}
            className="mt-1 h-24 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-[#f4efe4]"
          />
        </label>
        <label className="mt-4 block text-sm">
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
            className={cn(
              'rounded-full px-3 py-1.5 text-xs',
              host.youtubeHidden ? cn('font-bold', fill) : 'border border-white/20',
            )}
          >
            {copy.hostYoutubeHideAr}
          </button>
          <button
            type="button"
            onClick={() => patchHost({ youtubeHidden: false })}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs',
              !host.youtubeHidden ? cn('font-bold', fill) : 'border border-white/20',
            )}
          >
            {copy.hostYoutubeShowAr}
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            {copy.hostUploadPhotoAr}
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-xs"
              onChange={(e) => void onUpload(e.target.files?.[0], 'photo')}
            />
          </label>
          <label className="block text-sm">
            {copy.hostUploadPanoramaAr}
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-xs"
              onChange={(e) => void onUpload(e.target.files?.[0], 'panorama')}
            />
          </label>
        </div>
        {uploadError ? <p className={cn('mt-2 text-sm', text)}>{uploadError}</p> : null}
        <p className="mt-4 text-sm">{copy.hostAudioLabelAr}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STORE_WEDDING_LIVE_AUDIO.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => playAudio(item.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs',
                host.audioClipId === item.id ? cn('font-bold', fill) : 'border border-white/20',
              )}
            >
              {item.labelAr}
            </button>
          ))}
        </div>
        <p className="mt-5 text-sm">تهاني الشاشة</p>
        <ul className="mt-2 space-y-2">
          {state.blessings.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
              <span className={item.hidden ? 'text-white/35 line-through' : ''}>{item.name}</span>
              {!item.hidden ? (
                <button type="button" className="text-xs text-white/50" onClick={() => hideBlessing(item.id)}>
                  إخفاء
                </button>
              ) : (
                <span className="text-xs text-white/35">مخفية</span>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={downloadArchive}
          className={cn('mt-5 w-full rounded-full border py-2 text-sm font-bold', borderAccent, text)}
        >
          {copy.archiveCtaAr}
        </button>
      </div>
      {showCards ? (
        <div>
          <div ref={cardRef} className="space-y-3">
            {styles.map((item) => (
              <StoreWeddingInviteCard key={item.id} host={host} styleId={item.id} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {styles.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void downloadCard(item.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-xs font-bold',
                  index === 0 ? fill : 'border border-white/20',
                )}
              >
                {index === 0 ? copy.downloadGoldAr : copy.downloadIvoryAr}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
