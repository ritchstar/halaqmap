/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * نتائج استعلام كوافير ماب — مشاغل مفعّلة فقط، بلا دليل رجالي.
 */
import { MapPin, Phone } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { CoiffeurInquiryListing } from '@/lib/coiffeurInquiryIsolation';
import { buildWhatsAppChatHref } from '@/lib/saudiWhatsAppPhone';
import { cn } from '@/lib/utils';

type Props = {
  listings: CoiffeurInquiryListing[];
};

function openMaps(listing: CoiffeurInquiryListing) {
  if (listing.latitude == null || listing.longitude == null) return;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function CoiffeurInquiryResults({ listings }: Props) {
  if (listings.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-8 md:pb-16">
      <p className="mb-4 text-center text-sm font-black tracking-[0.12em] text-[#f4d4c0]">
        المشاغل المفعّلة في نطاقك
      </p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => {
          const whatsappHref = listing.phone ? buildWhatsAppChatHref(listing.phone) : null;
          return (
            <article
              key={listing.id}
              className="overflow-hidden rounded-[1.5rem] border border-[#f4d4c0]/30 bg-gradient-to-b from-[#2a1614] to-[#1c100e] text-right"
            >
              <div className="relative aspect-[5/3] overflow-hidden">
                {listing.coverImage ? (
                  <img src={listing.coverImage} alt={listing.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#3d221c] text-[#f4d4c0]">
                    {listing.name}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-black text-[#f4d4c0]">{listing.name}</h3>
                {listing.specialties.length ? (
                  <p className="mt-1 text-xs leading-6 text-rose-50/70">{listing.specialties.join(' · ')}</p>
                ) : null}
                {listing.address ? (
                  <p className="mt-1 text-xs leading-6 text-rose-50/60">{listing.address}</p>
                ) : null}
                {listing.distanceKm != null ? (
                  <p className="mt-1 text-[11px] text-rose-100/45">{listing.distanceKm} كم</p>
                ) : null}
                {listing.phone ? (
                  <p className="mt-1 font-mono text-sm text-[#f7efe8]" dir="ltr">
                    {listing.phone}
                  </p>
                ) : null}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openMaps(listing)}
                    disabled={listing.latitude == null || listing.longitude == null}
                    className={cn(
                      'inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-black',
                      listing.latitude == null
                        ? 'cursor-not-allowed bg-white/10 text-rose-100/40'
                        : 'bg-gradient-to-l from-[#e8b4a2] to-[#c98b96] text-[#2a1218]',
                    )}
                  >
                    <MapPin className="h-4 w-4" aria-hidden />
                    الموقع
                  </button>
                  {listing.phone ? (
                    <a
                      href={`tel:${listing.phone}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#f4d4c0]/35 bg-white/5 text-[#f4d4c0] no-underline"
                      aria-label="اتصال"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  ) : null}
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-white no-underline"
                      aria-label="واتساب"
                    >
                      <SiWhatsapp className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
