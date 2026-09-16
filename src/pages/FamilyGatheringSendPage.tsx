/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إرسال تهنئة — تجمع عائلي sa1. بلا شعار منصة.
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  FAMILY_GATHERING,
  GREETING_MESSAGE_MAX,
  GREETING_NAME_MAX,
  QUICK_GREETINGS_AR,
} from '@/config/familyGathering';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { addFamilyGreeting, fetchFamilyGatheringPublic } from '@/lib/familyGatheringRemote';
import '@/styles/familyGathering.css';

export default function FamilyGatheringSendPage() {
  useDocumentTitle(FAMILY_GATHERING.documentTitleSend);
  const [titleAr, setTitleAr] = useState(FAMILY_GATHERING.titleAr);
  const [welcomeAr, setWelcomeAr] = useState(FAMILY_GATHERING.welcomeAr);
  const [familyNameAr, setFamilyNameAr] = useState(FAMILY_GATHERING.familyNameAr);
  const [nameAr, setNameAr] = useState('');
  const [messageAr, setMessageAr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState('');

  useEffect(() => {
    void fetchFamilyGatheringPublic().then((data) => {
      if (!data.ok) return;
      if (data.titleAr) setTitleAr(data.titleAr);
      if (data.welcomeAr) setWelcomeAr(data.welcomeAr);
      if (data.familyNameAr) setFamilyNameAr(data.familyNameAr);
    });
  }, []);

  const canSubmit = useMemo(
    () => nameAr.trim().length > 0 && messageAr.trim().length > 0 && !busy,
    [nameAr, messageAr, busy],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setHint('');
    const result = await addFamilyGreeting({ nameAr, messageAr });
    setBusy(false);
    if (!result.ok) {
      setHint(result.error || 'تعذّر الإرسال');
      return;
    }
    setDone(true);
    setMessageAr('');
  }

  return (
    <div className="fg-root" dir="rtl">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">
        <p className="fg-kicker">{FAMILY_GATHERING.kickerAr}</p>
        <h1 className="fg-display mt-3 text-3xl font-bold leading-tight text-[var(--fg-green-deep)] md:text-4xl">
          {titleAr}
        </h1>
        <p className="mt-2 text-sm font-bold text-[var(--fg-green)]">{familyNameAr}</p>
        <p className="mt-4 text-base leading-8 text-[var(--fg-muted)]">{welcomeAr}</p>

        <form className="fg-card mt-8 space-y-4 p-5" onSubmit={onSubmit}>
          {done ? (
            <p className="text-center text-base font-extrabold text-[var(--fg-green)]">{FAMILY_GATHERING.sentAr}</p>
          ) : null}
          <label className="block text-sm font-bold text-[var(--fg-green-deep)]">
            {FAMILY_GATHERING.nameLabelAr}
            <input
              className="fg-input mt-2"
              value={nameAr}
              maxLength={GREETING_NAME_MAX}
              onChange={(e) => setNameAr(e.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <div>
            <p className="text-sm font-bold text-[var(--fg-green-deep)]">تهانٍ جاهزة</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_GREETINGS_AR.map((line) => (
                <button
                  key={line}
                  type="button"
                  className={`fg-chip ${messageAr === line ? 'is-active' : ''}`}
                  onClick={() => setMessageAr(line)}
                >
                  {line}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-bold text-[var(--fg-green-deep)]">
            {FAMILY_GATHERING.messageLabelAr}
            <textarea
              className="fg-textarea mt-2 min-h-28"
              value={messageAr}
              maxLength={GREETING_MESSAGE_MAX}
              onChange={(e) => setMessageAr(e.target.value)}
              required
            />
          </label>
          {hint ? <p className="text-sm font-bold text-red-700">{hint}</p> : null}
          <button type="submit" className="fg-btn w-full" disabled={!canSubmit}>
            {busy ? 'جاري الإرسال…' : FAMILY_GATHERING.submitAr}
          </button>
        </form>
      </main>
    </div>
  );
}
