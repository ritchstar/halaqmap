/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة مضيف تجمع sa1 — حيازة host_token. بلا شعار منصة.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FAMILY_GATHERING } from '@/config/familyGathering';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  fetchFamilyGatheringHost,
  hideFamilyGreeting,
  saveFamilyGatheringHost,
  type FamilyGreeting,
} from '@/lib/familyGatheringRemote';
import { POLL_MS, scheduleVisiblePoll } from '@/lib/pollingPolicy';
import { ROUTE_PATHS } from '@/lib/routePaths';
import '@/styles/familyGathering.css';

export default function FamilyGatheringHostPage() {
  useDocumentTitle(FAMILY_GATHERING.documentTitleHost);
  const { token = '' } = useParams();
  const hostToken = token.trim();

  const [titleAr, setTitleAr] = useState(FAMILY_GATHERING.titleAr);
  const [welcomeAr, setWelcomeAr] = useState(FAMILY_GATHERING.welcomeAr);
  const [familyNameAr, setFamilyNameAr] = useState(FAMILY_GATHERING.familyNameAr);
  const [eventDateAr, setEventDateAr] = useState(FAMILY_GATHERING.eventDateAr);
  const [eventTimeAr, setEventTimeAr] = useState(FAMILY_GATHERING.eventTimeAr);
  const [placeAr, setPlaceAr] = useState(FAMILY_GATHERING.placeAr);
  const [greetings, setGreetings] = useState<FamilyGreeting[]>([]);
  const [sendUrl, setSendUrl] = useState('');
  const [screenUrl, setScreenUrl] = useState('');
  const [hint, setHint] = useState('');
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hostToken) {
      setMissing(true);
      return;
    }
    const load = () => {
      void fetchFamilyGatheringHost(hostToken).then((result) => {
        if (!result.ok) {
          setMissing(true);
          return;
        }
        setMissing(false);
        const d = result.data;
        if (typeof d.titleAr === 'string') setTitleAr(d.titleAr);
        if (typeof d.welcomeAr === 'string') setWelcomeAr(d.welcomeAr);
        if (typeof d.familyNameAr === 'string') setFamilyNameAr(d.familyNameAr);
        if (typeof d.eventDateAr === 'string') setEventDateAr(d.eventDateAr);
        if (typeof d.eventTimeAr === 'string') setEventTimeAr(d.eventTimeAr);
        if (typeof d.placeAr === 'string') setPlaceAr(d.placeAr);
        if (typeof d.sendUrl === 'string') setSendUrl(d.sendUrl);
        if (typeof d.screenUrl === 'string') setScreenUrl(d.screenUrl);
        const all = Array.isArray(d.allGreetings) ? (d.allGreetings as FamilyGreeting[]) : [];
        setGreetings(all);
      });
    };
    load();
    return scheduleVisiblePoll(load, POLL_MS.FAMILY_GATHERING);
  }, [hostToken]);

  async function onSave() {
    setBusy(true);
    setHint('');
    const result = await saveFamilyGatheringHost(hostToken, {
      titleAr,
      welcomeAr,
      familyNameAr,
      eventDateAr,
      eventTimeAr,
      placeAr,
    });
    setBusy(false);
    setHint(result.ok ? FAMILY_GATHERING.hostSavedAr : String(result.data.error || 'تعذّر الحفظ'));
  }

  async function onToggle(greeting: FamilyGreeting) {
    await hideFamilyGreeting(hostToken, greeting.id, !greeting.isHidden);
    setGreetings((prev) =>
      prev.map((g) => (g.id === greeting.id ? { ...g, isHidden: !g.isHidden } : g)),
    );
  }

  if (missing) {
    return (
      <div className="fg-root flex min-h-dvh items-center justify-center px-4" dir="rtl">
        <p className="text-center text-base font-bold text-[var(--fg-muted)]">رابط الإدارة غير صالح.</p>
      </div>
    );
  }

  return (
    <div className="fg-root" dir="rtl">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="fg-kicker">لوحة إدارة التجمع</p>
        <h1 className="fg-display mt-2 text-3xl font-bold text-[var(--fg-green-deep)]">{familyNameAr}</h1>

        <section className="fg-card mt-6 space-y-3 p-5">
          <label className="block text-sm font-bold">
            العنوان
            <input className="fg-input mt-2" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
          </label>
          <label className="block text-sm font-bold">
            الترحيب
            <textarea className="fg-textarea mt-2 min-h-28" value={welcomeAr} onChange={(e) => setWelcomeAr(e.target.value)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-bold">
              التاريخ
              <input className="fg-input mt-2" value={eventDateAr} onChange={(e) => setEventDateAr(e.target.value)} />
            </label>
            <label className="block text-sm font-bold">
              الوقت
              <input className="fg-input mt-2" value={eventTimeAr} onChange={(e) => setEventTimeAr(e.target.value)} />
            </label>
          </div>
          <label className="block text-sm font-bold">
            المكان
            <input className="fg-input mt-2" value={placeAr} onChange={(e) => setPlaceAr(e.target.value)} />
          </label>
          <button type="button" className="fg-btn" disabled={busy} onClick={() => void onSave()}>
            {FAMILY_GATHERING.hostSaveAr}
          </button>
          {hint ? <p className="text-sm font-bold text-[var(--fg-green)]">{hint}</p> : null}
        </section>

        <section className="fg-card mt-5 space-y-2 p-5 text-sm">
          <p className="font-extrabold text-[var(--fg-green-deep)]">روابط العائلة</p>
          {sendUrl ? (
            <p>
              إرسال:{' '}
              <a className="break-all font-bold text-[var(--fg-green)] underline" href={sendUrl} target="_blank" rel="noreferrer">
                {sendUrl}
              </a>
            </p>
          ) : null}
          {screenUrl ? (
            <p>
              الشاشة:{' '}
              <a className="break-all font-bold text-[var(--fg-green)] underline" href={screenUrl} target="_blank" rel="noreferrer">
                {screenUrl}
              </a>
            </p>
          ) : (
            <p>
              الشاشة:{' '}
              <Link className="font-bold text-[var(--fg-green)] underline" to={ROUTE_PATHS.FAMILY_GATHERING_SA1_SCREEN}>
                فتح الشاشة
              </Link>
            </p>
          )}
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-lg font-extrabold text-[var(--fg-green-deep)]">التهاني</h2>
          {greetings.length === 0 ? (
            <p className="text-sm text-[var(--fg-muted)]">لا تهانٍ بعد.</p>
          ) : (
            greetings.map((g) => (
              <article key={g.id} className={`fg-card p-4 ${g.isHidden ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[var(--fg-green)]">{g.nameAr}</p>
                    <p className="mt-1 text-sm leading-7">{g.messageAr}</p>
                  </div>
                  <button type="button" className="fg-btn fg-btn-ghost shrink-0 px-3 py-1.5 text-xs" onClick={() => void onToggle(g)}>
                    {g.isHidden ? FAMILY_GATHERING.hostShowAr : FAMILY_GATHERING.hostHideAr}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
