/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كرت الدعوة الحرة — اسم المناسبة والداعي ورابط الخرائط.
 */
import { STORE_EVENT_LIVE, STORE_EVENT_LIVE_STYLES, eventLiveStyles } from '@/config/storeEventLive';
import { StoreWeddingMapsPin } from '@/components/store/StoreWeddingMapsPin';
import { cn } from '@/lib/utils';
import {
  eventHostInviteLine,
  safeMapsHref,
  type EventLiveHostState,
  type EventLiveStyleId,
} from '@/lib/storeEventLiveLab';

export function StoreEventInviteCard({
  host,
  styleId,
  className,
}: {
  host: EventLiveHostState;
  styleId: EventLiveStyleId;
  className?: string;
}) {
  const voice = host.voice === 'women' ? 'women' : 'men';
  const style =
    STORE_EVENT_LIVE_STYLES.find((item) => item.id === styleId) ||
    eventLiveStyles(voice)[0] ||
    STORE_EVENT_LIVE_STYLES[0];
  const maps = safeMapsHref(host.venueMapsUrl);
  const bg = host.photoSrc || style.image;
  return (
    <article
      data-event-card={styleId}
      className={cn('relative aspect-[3/4] w-full overflow-hidden rounded-[28px] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.75)]', className)}
    >
      <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div
        className="pointer-events-none absolute inset-3 rounded-[22px]"
        style={{ boxShadow: `inset 0 0 0 1px ${style.accent}, inset 0 0 0 7px rgba(0,0,0,0.35)` }}
      />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div
          className="rounded-2xl border bg-black/40 p-5 text-[#f7edd8] backdrop-blur-md"
          style={{ borderColor: `${style.accent}73` }}
        >
          <p className="text-[11px] tracking-wide opacity-70">مناسبة خاصة</p>
          <p className="mt-1 text-xs opacity-75">{eventHostInviteLine(host)}</p>
          <h2 className="mt-2 text-2xl font-black">{host.occasionTitle || STORE_EVENT_LIVE.titleAr}</h2>
          <div className="mt-4 h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${style.accent}, transparent)` }} />
          <p className="mt-4 text-sm leading-7 opacity-90">{host.welcomeAr}</p>
          <dl className="mt-5 space-y-2 text-sm">
            <div>
              <dt className="text-[11px] opacity-55">التاريخ</dt>
              <dd>{host.eventDate}</dd>
            </div>
            <div>
              <dt className="text-[11px] opacity-55">الاستقبال</dt>
              <dd>{host.eventTime}</dd>
            </div>
            <div>
              <dt className="text-[11px] opacity-55">المكان</dt>
              <dd>{host.venueName}</dd>
            </div>
          </dl>
          {maps ? (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold"
            >
              <StoreWeddingMapsPin className="h-5 w-5" />
              {STORE_EVENT_LIVE.mapsLabelAr}
            </a>
          ) : null}
          <p className="mt-4 text-center text-[10px] opacity-50">{STORE_EVENT_LIVE.hallStampAr}</p>
        </div>
      </div>
    </article>
  );
}
