/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  STORE_BEREAVEMENT_COPY,
  bereavementPlainText,
  bereavementShareText,
  condolenceLabelsAr,
  kinRelationLabelAr,
} from '@/config/storeBereavementCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchIssuedCardPublic, reportIssuedCard, revokeIssuedCard } from '@/lib/storeIssuedCardsRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { toast } from '@/components/ui/sonner';

type NoticeCard = {
  gender?: 'male' | 'female';
  fullName?: string;
  nickname?: string;
  deathDate?: string;
  deathDateHijri?: string;
  city?: string;
  prayerAt?: string;
  mosqueName?: string;
  mosqueMapUrl?: string;
  cemeteryName?: string;
  cemeteryMapUrl?: string;
  burial?: string;
  condolenceMode?: string;
  condolenceModes?: string[];
  kin?: Array<{ name?: string; relation?: string; phoneMasked?: string; phoneHref?: string }>;
  prayerText?: string;
  familyNote?: string;
  lastUpdatedAt?: string;
};

export default function StoreBereavementViewPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [params] = useSearchParams();
  const adminKey = params.get('k') || '';
  const isManage = Boolean(adminKey);
  const [status, setStatus] = useState('loading');
  const [card, setCard] = useState<NoticeCard>({});
  const [reportNote, setReportNote] = useState('');

  const title = card.fullName
    ? `${card.fullName} — ${STORE_BEREAVEMENT_COPY.titleAr}`
    : STORE_BEREAVEMENT_COPY.titleAr;
  useDocumentTitle(title);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchIssuedCardPublic(token).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setStatus('missing');
        return;
      }
      setStatus(result.status);
      if (result.card) setCard(result.card as NoticeCard);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const shareUrl = useMemo(
    () => `https://store.halaqmap.com/#/n/${token}`,
    [token],
  );
  const shareBody = bereavementShareText(card.fullName || '', shareUrl);
  const plainBody = bereavementPlainText({
    fullName: card.fullName || '',
    gender: card.gender === 'female' ? 'female' : 'male',
    prayerAt: card.prayerAt,
    mosqueName: card.mosqueName,
    cemeteryName: card.cemeteryName,
  });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم النسخ.');
    } catch {
      toast.error('تعذر النسخ.');
    }
  };

  const condolenceLabel = condolenceLabelsAr(card.condolenceModes?.length ? card.condolenceModes : card.condolenceMode);

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#0e1412] text-[#e8eee6]">
      <main className="mx-auto max-w-lg px-4 py-12">
        {status === 'loading' ? <p className="text-center text-white/60">جاري فتح البلاغ…</p> : null}
        {status === 'missing' || status === 'revoked' ? (
          <p className="text-center leading-7 text-white/70">هذا البلاغ غير متاح.</p>
        ) : null}
        {status === 'expired' ? (
          <p className="text-center leading-7 text-white/80">{STORE_BEREAVEMENT_COPY.expiredAr}</p>
        ) : null}
        {status === 'live' ? (
          <article className="rounded-3xl border border-white/12 bg-[#141c18] p-7">
            <p className="text-center text-sm text-white/60">{STORE_BEREAVEMENT_COPY.shareIntroAr}</p>
            <h1 className="mt-4 text-center text-3xl font-black">{card.fullName}</h1>
            {card.nickname ? <p className="mt-1 text-center text-white/55">{card.nickname}</p> : null}
            {card.prayerText ? <p className="mt-6 text-center text-sm leading-7 text-white/80">{card.prayerText}</p> : null}
            <dl className="mt-8 space-y-2 text-sm leading-7">
              {card.city ? (
                <div>
                  <dt className="text-white/45">المدينة</dt>
                  <dd>{card.city}</dd>
                </div>
              ) : null}
              {card.deathDate || card.deathDateHijri ? (
                <div>
                  <dt className="text-white/45">تاريخ الوفاة</dt>
                  <dd>
                    {card.deathDate}
                    {card.deathDateHijri ? ` · ${card.deathDateHijri}` : ''}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-white/45">الصلاة</dt>
                <dd>{card.prayerAt}</dd>
              </div>
              <div>
                <dt className="text-white/45">المسجد</dt>
                <dd>
                  {card.mosqueName}
                  {card.mosqueMapUrl ? (
                    <>
                      {' '}
                      <a href={card.mosqueMapUrl} className="text-emerald-200/90 underline" target="_blank" rel="noreferrer">
                        الموقع
                      </a>
                    </>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-white/45">المقبرة</dt>
                <dd>
                  {card.cemeteryName}
                  {card.cemeteryMapUrl ? (
                    <>
                      {' '}
                      <a href={card.cemeteryMapUrl} className="text-emerald-200/90 underline" target="_blank" rel="noreferrer">
                        الموقع
                      </a>
                    </>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-white/45">العزاء</dt>
                <dd>
                  {condolenceLabel}
                  {(card.condolenceModes?.length ? card.condolenceModes : [card.condolenceMode]).includes('at_home') ? (
                    <span className="mt-1 block text-white/50">{STORE_BEREAVEMENT_COPY.condolenceAtHomePublicHintAr}</span>
                  ) : null}
                </dd>
              </div>
              {card.familyNote ? (
                <div>
                  <dt className="text-white/45">ملاحظة</dt>
                  <dd>{card.familyNote}</dd>
                </div>
              ) : null}
              {card.kin?.length ? (
                <div>
                  <dt className="text-white/45">ذوو المتوفى</dt>
                  <dd>
                    <ul className="mt-1 space-y-2">
                      {card.kin.map((row, index) => (
                        <li key={`${row.name}-${index}`}>
                          {row.name}
                          {row.relation ? ` · ${kinRelationLabelAr(row.relation)}` : ''}
                          {row.phoneHref ? (
                            <>
                              {' · '}
                              <a href={row.phoneHref} className="text-emerald-200/90 underline" dir="ltr">
                                {row.phoneMasked || 'اتصال'}
                              </a>
                            </>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
            {card.lastUpdatedAt ? (
              <p className="mt-6 text-center text-[11px] text-white/40">
                {STORE_BEREAVEMENT_COPY.lastUpdatedAr}: {new Date(card.lastUpdatedAt).toLocaleString('ar-SA')}
              </p>
            ) : null}
            <p className="mt-8 text-center text-[11px] text-white/40">{STORE_BEREAVEMENT_COPY.stampAr}</p>
          </article>
        ) : null}

        {status === 'live' ? (
          <div className="mt-6 space-y-2">
            <Button type="button" className="w-full bg-white text-[#0e1412]" onClick={() => void copy(shareBody)}>
              نسخ رسالة واتساب
            </Button>
            <Button type="button" variant="outline" className="w-full border-white/20" onClick={() => void copy(plainBody)}>
              نسخ النص المختصر دون الرابط
            </Button>
          </div>
        ) : null}

        {isManage && (status === 'live' || status === 'expired') ? (
          <div className="mt-8 rounded-2xl border border-white/15 p-4">
            <p className="text-sm font-bold">إدارة البلاغ</p>
            <Button
              type="button"
              className="mt-3 w-full bg-red-900 text-white"
              onClick={async () => {
                const result = await revokeIssuedCard(token, adminKey);
                if (!result.ok) {
                  toast.error(typeof result.error === 'string' ? result.error : 'تعذر الإيقاف');
                  return;
                }
                setStatus('revoked');
                toast.success('أُوقف البلاغ.');
              }}
            >
              إيقاف فوري للبلاغ
            </Button>
          </div>
        ) : null}

        {status === 'live' || status === 'expired' ? (
          <div className="mt-8 space-y-2">
            <p className="text-xs text-white/50">بلاغ عاجل عن انتحال أو معلومات غير صحيحة</p>
            <Textarea value={reportNote} onChange={(e) => setReportNote(e.target.value)} className="min-h-20 border-white/15 bg-[#141c18]" />
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/20"
              onClick={async () => {
                const result = await reportIssuedCard(token, reportNote);
                if (!result.ok) {
                  toast.error(typeof result.error === 'string' ? result.error : 'تعذر إرسال البلاغ');
                  return;
                }
                setReportNote('');
                toast.success('وصل البلاغ إلى الإدارة.');
              }}
            >
              إرسال بلاغ عاجل
            </Button>
          </div>
        ) : null}

        <p className="mt-10 text-center text-xs text-white/35">
          <Link to={ROUTE_PATHS.STORE_LANDING}>خريطة الحل</Link>
        </p>
      </main>
    </div>
  );
}
