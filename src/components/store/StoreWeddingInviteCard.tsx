/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كرت الدعوة — نص الزفاف وأسماء ابننا أو ابنتنا ورابط الموقع.
 */
import { STORE_WEDDING_LIVE, STORE_WEDDING_LIVE_STYLES, weddingLiveStyles } from '@/config/storeWeddingLive';
import { StoreHallAtmosphere } from '@/components/store/StoreHallAtmosphere';
import { StoreInviteCardFrame } from '@/components/store/StoreInviteCardFrame';
import { StoreWeddingMapsPin } from '@/components/store/StoreWeddingMapsPin';
import { inviteCardPhotoSrc } from '@/lib/downloadInviteCardAsPng';
import { cn } from '@/lib/utils';
import {
  safeMapsHref,
  weddingCoupleLine,
  weddingHostInviteLine,
  weddingInvitationText,
  weddingKickerText,
  type WeddingLiveHostState,
  type WeddingLiveStyleId,
} from '@/lib/storeWeddingLiveLab';

export function StoreWeddingInviteCard({
  host,
  styleId,
  className,
  still = false,
}: {
  host: WeddingLiveHostState;
  styleId: WeddingLiveStyleId;
  className?: string;
  still?: boolean;
}) {
  const voice = host.voice === 'women' ? 'women' : 'men';
  const style =
    STORE_WEDDING_LIVE_STYLES.find((item) => item.id === styleId) ||
    weddingLiveStyles(voice)[0] ||
    STORE_WEDDING_LIVE_STYLES[0];
  const maps = safeMapsHref(host.venueMapsUrl);
  const bg = inviteCardPhotoSrc(host.photoSrc, style.image);
  const invitation = weddingInvitationText(host);
  const kicker = weddingKickerText(host);
  return (
    <article
      data-wedding-card={styleId}
      data-still={still ? '1' : undefined}
      data-voice={voice}
      className={cn(
        'relative aspect-[3/4] w-full overflow-hidden rounded-[28px]',
        still ? 'shadow-none' : 'shadow-[0_28px_70px_-24px_rgba(0,0,0,0.75)]',
        className,
      )}
    >
      <img
        src={bg}
        alt=""
        className={cn('absolute inset-0 h-full w-full object-cover object-center', !still && 'hall-card-drift')}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      {still ? null : <StoreHallAtmosphere voice={voice} />}
      <StoreInviteCardFrame accent={style.accent} />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div
          className={cn(
            'rounded-2xl border p-5 text-[#f7edd8]',
            still ? 'bg-black/72' : 'bg-black/40 backdrop-blur-md',
          )}
          style={{ borderColor: `${style.accent}73` }}
        >
          <p className="invite-luminous text-base tracking-wide opacity-80">{kicker}</p>
          <p className="mt-1 text-base opacity-80">{weddingHostInviteLine(host)}</p>
          <h2 className="invite-luminous mt-2 text-2xl font-black">{weddingCoupleLine(host)}</h2>
          <p className="invite-luminous mt-3 text-base leading-8 opacity-95">{invitation}</p>
          {host.welcomeAr.trim() ? (
            <p className="mt-3 text-base leading-7 opacity-80">{host.welcomeAr.trim()}</p>
          ) : null}
          <div className="mt-4 h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${style.accent}, transparent)` }} />
          <dl className="mt-5 space-y-2 text-base">
            <div>
              <dt className="text-base opacity-60">التاريخ</dt>
              <dd className="text-base font-semibold leading-7">
                {host.eventDate}
                {String(host.eventDateEn || '').trim() ? ` · ${String(host.eventDateEn).trim()}` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-base opacity-60">الاستقبال</dt>
              <dd className="text-base font-semibold">{host.eventTime}</dd>
            </div>
            <div>
              <dt className="text-base opacity-60">المكان</dt>
              <dd className="text-base font-semibold leading-7">{host.venueName}</dd>
            </div>
          </dl>
          {maps ? (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold"
            >
              <StoreWeddingMapsPin className="h-5 w-5" />
              {STORE_WEDDING_LIVE.mapsLabelAr}
            </a>
          ) : null}
          <p className="invite-luminous mt-4 text-center text-sm opacity-70">{STORE_WEDDING_LIVE.hallStampAr}</p>
        </div>
      </div>
    </article>
  );
}
