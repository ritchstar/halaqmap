/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  STORE_WEDDING_LIVE_AUDIO,
  STORE_WEDDING_VENUE_KINDS,
  weddingLiveCopy,
  weddingLiveFillClass,
  weddingLiveHostRoles,
  weddingLiveStyles,
} from '@/config/storeWeddingLive';
import {
  nextWeddingWelcomeSetIndex,
  weddingWelcomeSetAt,
  weddingWelcomeSetCount,
} from '@/config/storeWeddingWelcomeSets';
import { downloadInviteCardAsPng } from '@/lib/downloadInviteCardAsPng';
import {
  compressImageFile,
  normalizeOffspringKind,
  normalizeVenueKind,
  normalizeWeddingHostRole,
  playWeddingLiveChime,
  weddingCoupleLine,
  weddingHostInviteLine,
  weddingInvitationText,
  weddingKickerText,
  weddingLiveArchiveBlob,
  weddingWelcomeLines,
  type WeddingLiveAudioId,
  type WeddingLiveLabState,
  type WeddingLiveStyleId,
  type WeddingOffspringKind,
  type WeddingVenueKind,
} from '@/lib/storeWeddingLiveLab';
import { StoreWeddingInviteCard } from '@/components/store/StoreWeddingInviteCard';
import { StoreGuestResentLinkPreview } from '@/components/store/StoreGuestResentLinkPreview';
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { STORE_HALLS_SUPPORT } from '@/config/storeProductSupport';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { StoreHostGuestInviteIssuance } from '@/components/store/StoreHostGuestInviteIssuance';
import { StoreTrialOpsNote } from '@/components/store/StoreTrialOpsNote';
import { cn } from '@/lib/utils';

const fieldClass = 'mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]';

export function StoreWeddingHostPanel({
  state,
  onChange,
  showCards = true,
  hostToken = '',
  isLab = false,
}: {
  state: WeddingLiveLabState;
  onChange: (next: WeddingLiveLabState) => void;
  showCards?: boolean;
  hostToken?: string;
  isLab?: boolean;
}) {
  const [uploadError, setUploadError] = useState('');
  const [downloadBusy, setDownloadBusy] = useState<WeddingLiveStyleId | ''>('');
  const [downloadError, setDownloadError] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const host = state.host;
  const voice = host.voice === 'women' ? 'women' : 'men';
  const copy = weddingLiveCopy(voice);
  const roles = weddingLiveHostRoles(voice);
  const styles = weddingLiveStyles(voice);
  const fill = weddingLiveFillClass(voice);
  const text = voice === 'women' ? 'text-[#e4b7c5]' : 'text-[#e8c547]';
  const borderAccent = voice === 'women' ? 'border-[#e4b7c5]/40' : 'border-[#e8c547]/40';
  const offspringKind = normalizeOffspringKind(host.offspringKind);
  const invitation = weddingInvitationText(host);
  const kicker = weddingKickerText(host);
  const welcomeLines = weddingWelcomeLines(host);

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
    const style = styles.find((item) => item.id === styleId);
    if (!style?.image) {
      setDownloadError('تعذر تجهيز الكرت. حدّث الصفحة ثم أعد المحاولة.');
      return;
    }
    setDownloadBusy(styleId);
    setDownloadError('');
    try {
      await downloadInviteCardAsPng(`afrahi-${styleId}.png`, {
        kickerAr: kicker,
        hostLineAr: weddingHostInviteLine(host),
        titleAr: weddingCoupleLine(host) || copy.titleAr,
        leadAr: invitation,
        dateAr: [host.eventDate, host.eventDateEn].filter(Boolean).join(' · '),
        timeAr: host.eventTime,
        placeAr: host.venueName,
        stampAr: 'خريطة الحل - halaqmap',
        accent: style.accent || (voice === 'women' ? '#e4b7c5' : '#e8c547'),
        photoSrc: style.image,
        voice,
      });
    } catch {
      setDownloadError('تعذر تحميل الكرت. أعد المحاولة.');
    } finally {
      setDownloadBusy('');
    }
  }

  function downloadArchive() {
    const blob = weddingLiveArchiveBlob(state);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'afrahi-archive.json';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  const issuance = hostToken ? (
    <StoreHostGuestInviteIssuance
      kind="wedding"
      hostToken={hostToken}
      isLab={isLab}
      titleAr={copy.hostInviteTitleAr}
      leadAr={copy.hostInviteLeadAr}
      ctaAr={copy.hostInviteCtaAr}
    />
  ) : null;

  const mapsField = (
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
  );

  const hallTools = (
    <>
      <div className="mt-4 rounded-2xl border border-white/12 bg-[#061018]/80 p-4">
        <p className="text-base font-extrabold">{copy.hostWelcomeSetsTitleAr}</p>
        <p className="mt-1 text-sm leading-7 text-white/70">{copy.hostWelcomeSetsLeadAr}</p>
        <p className={cn('mt-2 text-sm font-bold', text)}>
          {copy.hostWelcomeSetStatusAr} {((host.welcomeSetIndex || 0) % weddingWelcomeSetCount()) + 1}
          {' / '}
          {weddingWelcomeSetCount()}
          {' · '}
          {weddingWelcomeSetAt(host.welcomeSetIndex).toneAr}
        </p>
        <ul className="mt-3 space-y-2">
          {welcomeLines.map((line, index) => (
            <li key={line.id}>
              <textarea
                value={line.textAr}
                onChange={(e) => {
                  const nextLines = welcomeLines.map((item) => item.textAr);
                  nextLines[index] = e.target.value;
                  patchHost({ welcomeLinesAr: nextLines });
                }}
                className={cn(
                  'w-full rounded-xl border border-white/10 bg-[#061018] px-3 py-2 leading-7 text-[#f4efe4]',
                  line.weight === 'hero' ? 'min-h-[5.5rem] text-base font-black' : 'min-h-[4.5rem] text-base font-bold',
                )}
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            const next = nextWeddingWelcomeSetIndex(host.welcomeSetIndex);
            patchHost({ welcomeSetIndex: next, welcomeLinesAr: [] });
          }}
          className={cn('mt-4 w-full rounded-full py-2 text-base font-bold', fill)}
        >
          {copy.hostWelcomeNextAr}
        </button>
      </div>
      <label className="mt-4 block text-base">
        {copy.hostWelcomeLabelAr}
        <textarea
          value={host.welcomeAr}
          onChange={(e) => patchHost({ welcomeAr: e.target.value })}
          className="mt-1 h-24 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-base text-[#f4efe4]"
        />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-base">
          {copy.hostUploadPhotoAr}
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm"
            onChange={(e) => void onUpload(e.target.files?.[0], 'photo')}
          />
        </label>
        <label className="block text-base">
          {copy.hostUploadPanoramaAr}
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm"
            onChange={(e) => void onUpload(e.target.files?.[0], 'panorama')}
          />
        </label>
      </div>
      {uploadError ? <p className={cn('mt-2 text-base', text)}>{uploadError}</p> : null}
      <p className="mt-4 text-base">{copy.hostAudioLabelAr}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {STORE_WEDDING_LIVE_AUDIO.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => playAudio(item.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm',
              host.audioClipId === item.id ? cn('font-bold', fill) : 'border border-white/20',
            )}
          >
            {item.labelAr}
          </button>
        ))}
      </div>
    </>
  );

  const blessingList = (
    <>
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
    </>
  );

  const archiveButton = (
    <button
      type="button"
      onClick={downloadArchive}
      className={cn('mt-5 w-full rounded-full border py-2 text-base font-bold', borderAccent, text)}
    >
      {copy.archiveCtaAr}
    </button>
  );

  const cardsColumn = showCards ? (
    <div>
      <div className="space-y-3">
        {styles.map((item) => (
          <StoreWeddingInviteCard key={item.id} host={host} styleId={item.id} />
        ))}
      </div>
      <div className="mt-3 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {styles.map((item, index) => (
          <button
            key={item.id}
            type="button"
            disabled={Boolean(downloadBusy)}
            onClick={() => void downloadCard(item.id)}
            className={cn(
              'w-full rounded-full px-4 py-2.5 text-sm font-bold disabled:opacity-60',
              index === 0 ? fill : 'border border-white/20',
            )}
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
      <StoreGuestResentLinkPreview
        productAr={copy.titleAr}
        hostAr={voice === 'women' ? 'المضيفة' : 'المضيف'}
        kickerAr={copy.resentPreviewKickerAr}
        captionAr={copy.resentPreviewCaptionAr}
      />
    </div>
  ) : null;

  return (
    <div className={showCards && !isLab ? 'grid gap-5 lg:grid-cols-[1fr_0.85fr]' : ''} data-voice={voice}>
      <div className="invite-host-panel rounded-[28px] border border-white/12 bg-[#0b1a24]/92 p-5">
        <h2 className="invite-luminous text-xl font-extrabold">{copy.hostPanelTitleAr}</h2>
        {isLab ? null : <div className="mt-3"><StoreTrialOpsNote productKey="wedding" /></div>}
        <div className="mt-4">
          <StoreDeskGuideLink
            to={ROUTE_PATHS.STORE_HALLS_SUPPORT}
            leadAr={STORE_HALLS_SUPPORT.deskLeadAr}
            ctaAr={STORE_HALLS_SUPPORT.deskCtaAr}
            accent={STORE_HALLS_SUPPORT.accent}
          />
        </div>
        {isLab ? <p className="mt-2 text-sm leading-7 text-white/70">{copy.hostLabCoreLeadAr}</p> : null}
        {!isLab ? issuance : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-base">
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
          <label className="block text-base">
            {copy.hostNameLabelAr}
            <input className={fieldClass} value={host.hostName} onChange={(e) => patchHost({ hostName: e.target.value })} />
          </label>
          <label className="block text-base sm:col-span-2">
            {copy.offspringKindLabelAr}
            <select
              className={fieldClass}
              value={offspringKind}
              onChange={(e) => patchHost({ offspringKind: normalizeOffspringKind(e.target.value) as WeddingOffspringKind })}
            >
              <option value="son">{copy.offspringSonAr}</option>
              <option value="daughter">{copy.offspringDaughterAr}</option>
            </select>
          </label>
          {offspringKind === 'daughter' ? (
            <>
              <label className="block text-base">
                {copy.offspringNameDaughterAr}
                <input className={fieldClass} value={host.brideName} onChange={(e) => patchHost({ brideName: e.target.value })} />
              </label>
              <label className="block text-base">
                {copy.spouseNameDaughterAr}
                <input className={fieldClass} value={host.groomName} onChange={(e) => patchHost({ groomName: e.target.value })} />
              </label>
            </>
          ) : (
            <>
              <label className="block text-base">
                {copy.offspringNameSonAr}
                <input className={fieldClass} value={host.groomName} onChange={(e) => patchHost({ groomName: e.target.value })} />
              </label>
              <label className="block text-base">
                {copy.spouseNameSonAr}
                <input className={fieldClass} value={host.brideName} onChange={(e) => patchHost({ brideName: e.target.value })} />
              </label>
            </>
          )}
          <label className="block text-base">
            {copy.eventDateLabelAr}
            <input className={fieldClass} value={host.eventDate} onChange={(e) => patchHost({ eventDate: e.target.value })} />
          </label>
          <label className="block text-base">
            {copy.eventDateEnLabelAr}
            <input
              className={fieldClass}
              dir="ltr"
              value={host.eventDateEn}
              onChange={(e) => patchHost({ eventDateEn: e.target.value })}
            />
          </label>
          <label className="block text-base">
            {copy.eventTimeLabelAr}
            <input className={fieldClass} value={host.eventTime} onChange={(e) => patchHost({ eventTime: e.target.value })} />
          </label>
          <label className="block text-base">
            {copy.venueKindLabelAr}
            <select
              className={fieldClass}
              value={normalizeVenueKind(host.venueKind)}
              onChange={(e) => patchHost({ venueKind: e.target.value as WeddingVenueKind })}
            >
              {STORE_WEDDING_VENUE_KINDS.map((item) => (
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
          {!isLab ? mapsField : null}
        </div>
        <label className="mt-4 block text-base">
          {copy.invitationKickerLabelAr}
          <input
            className={fieldClass}
            value={host.kickerAr}
            onChange={(e) => patchHost({ kickerAr: e.target.value })}
            placeholder="عقد قران"
          />
          <span className="mt-1 block text-sm text-white/55">{copy.invitationKickerHintAr}</span>
        </label>
        <div className="mt-4 rounded-2xl border border-white/12 bg-[#061018]/80 p-4">
          <label className="block text-base font-extrabold">
            {copy.invitationPreviewAr}
            <textarea
              value={invitation}
              onChange={(e) => patchHost({ invitationAr: e.target.value })}
              className="mt-2 h-32 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-base font-normal leading-8 text-[#f7edd8]"
            />
          </label>
          <p className="mt-2 text-sm leading-7 text-white/55">{copy.invitationEditHintAr}</p>
          <button
            type="button"
            onClick={() => patchHost({ invitationAr: '' })}
            className="mt-3 rounded-full border border-white/20 px-4 py-1.5 text-sm font-bold"
          >
            {copy.invitationRegenAr}
          </button>
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
        <div className="mt-4 rounded-2xl border border-white/12 bg-[#061018]/80 p-4">
          <label className="block text-base">
            {copy.hostYoutubeLabelAr}
            <input
              className={fieldClass}
              dir="ltr"
              value={host.youtubeUrl}
              onChange={(e) => patchHost({ youtubeUrl: e.target.value, youtubeHidden: false })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>
          <p className="mt-1 text-sm leading-7 text-white/55">{copy.hostYoutubeHintAr}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => patchHost({ youtubeHidden: true })}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm',
                host.youtubeHidden ? cn('font-bold', fill) : 'border border-white/20',
              )}
            >
              {copy.hostYoutubeHideAr}
            </button>
            <button
              type="button"
              onClick={() => patchHost({ youtubeHidden: false })}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm',
                !host.youtubeHidden ? cn('font-bold', fill) : 'border border-white/20',
              )}
            >
              {copy.hostYoutubeShowAr}
            </button>
          </div>
        </div>
        {isLab ? (
          <>
            {blessingList}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="mt-5">
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold"
              >
                <span>{copy.hostLabAdvancedAr}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', text, advancedOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                {issuance}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">{mapsField}</div>
                {hallTools}
                {archiveButton}
                {cardsColumn}
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          <>
            {hallTools}
            {blessingList}
            {archiveButton}
          </>
        )}
      </div>
      {!isLab ? cardsColumn : null}
    </div>
  );
}
