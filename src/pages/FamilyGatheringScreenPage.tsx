/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شاشة المجلس — تهانٍ حية لتجمع sa1. بلا شعار منصة.
 */
import { useEffect, useState } from 'react';
import { FAMILY_GATHERING } from '@/config/familyGathering';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchFamilyGatheringPublic, type FamilyGreeting } from '@/lib/familyGatheringRemote';
import { POLL_MS, scheduleVisiblePoll } from '@/lib/pollingPolicy';
import '@/styles/familyGathering.css';

export default function FamilyGatheringScreenPage() {
  useDocumentTitle(FAMILY_GATHERING.documentTitleScreen);
  const [titleAr, setTitleAr] = useState(FAMILY_GATHERING.titleAr);
  const [familyNameAr, setFamilyNameAr] = useState(FAMILY_GATHERING.familyNameAr);
  const [meta, setMeta] = useState(`${FAMILY_GATHERING.eventDateAr} · ${FAMILY_GATHERING.eventTimeAr} · ${FAMILY_GATHERING.placeAr}`);
  const [greetings, setGreetings] = useState<FamilyGreeting[]>([]);

  useEffect(() => {
    const load = () => {
      void fetchFamilyGatheringPublic().then((data) => {
        if (!data.ok) return;
        if (data.titleAr) setTitleAr(data.titleAr);
        if (data.familyNameAr) setFamilyNameAr(data.familyNameAr);
        const dateAr = data.eventDateAr || FAMILY_GATHERING.eventDateAr;
        const timeAr = data.eventTimeAr || FAMILY_GATHERING.eventTimeAr;
        const placeAr = data.placeAr || FAMILY_GATHERING.placeAr;
        setMeta(`${dateAr} · ${timeAr} · ${placeAr}`);
        setGreetings(Array.isArray(data.greetings) ? data.greetings : []);
      });
    };
    load();
    return scheduleVisiblePoll(load, POLL_MS.FAMILY_GATHERING);
  }, []);

  const ticker = greetings
    .slice(0, 20)
    .map((g) => `${g.nameAr}: ${g.messageAr}`)
    .join('   ❋   ');

  return (
    <div className="fg-root" dir="rtl">
      <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-8 md:py-10">
        <header className="text-center">
          <p className="fg-kicker">{FAMILY_GATHERING.kickerAr}</p>
          <h1 className="fg-display mt-3 text-4xl font-bold leading-tight text-[var(--fg-green-deep)] md:text-5xl">
            {titleAr}
          </h1>
          <p className="mt-2 text-lg font-extrabold text-[var(--fg-green)]">{familyNameAr}</p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">{meta}</p>
        </header>

        {ticker ? (
          <div className="fg-ticker mt-8">
            <div className="fg-ticker-track text-sm font-bold text-[var(--fg-green-deep)]">{ticker}</div>
          </div>
        ) : null}

        <section className="mt-8 flex-1">
          {greetings.length === 0 ? (
            <p className="py-20 text-center text-lg font-bold text-[var(--fg-muted)]">{FAMILY_GATHERING.emptyStageAr}</p>
          ) : (
            <div className="fg-stage-grid">
              {greetings.map((g) => (
                <article key={g.id} className="fg-card p-4">
                  <p className="text-sm font-black text-[var(--fg-green)]">{g.nameAr}</p>
                  <p className="mt-2 text-base leading-7 text-[var(--fg-text)]">{g.messageAr}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
