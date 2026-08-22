/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مختبر ثلاثة نماذج تفاعلية للبطاقة الحيّة — بلا دفع.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  LAB_PALETTES,
  LAB_SUBSTYLES,
  STORE_OCCASION_CARD_LAB,
  STORE_OCCASION_CARD_LAB_ENABLED,
  type LabLifecycle,
  type LabTier,
} from '@/config/storeOccasionCardLab';
import { StoreShot } from '@/components/store/StoreShot';
import { STORE_PAID_INVITE_PRICES_SAR } from '@/config/storeIssuedCardsCatalog';
import { arabicInitials, eventSignatureSeed, fitArabicNameClass, fnv1a } from '@/lib/storeEventSignature';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type Palette = (typeof LAB_PALETTES.quick)[number];

function SignatureMark({ seed, accent, ink }: { seed: string; accent: string; ink: string }) {
  const h = fnv1a(seed);
  const a1 = (h % 50) + 20;
  const a2 = ((h >> 6) % 40) + 30;
  const a3 = ((h >> 12) % 35) + 25;
  return (
    <svg viewBox="0 0 88 88" className="h-16 w-16" aria-hidden>
      <circle cx="44" cy="44" r="41" fill="none" stroke={accent} strokeWidth="1.4" />
      <circle cx="44" cy="44" r="34" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.7" />
      <path d={`M44 10 A34 34 0 0 1 ${44 + a1} ${20 + (a2 % 18)}`} fill="none" stroke={accent} strokeWidth="2" />
      <path d={`M18 ${28 + (a3 % 10)} Q44 ${12 + (a1 % 16)} 70 ${30 + (a2 % 12)}`} fill="none" stroke={ink} strokeWidth="1.2" opacity="0.85" />
      <path d={`M22 64 Q44 ${48 + (a3 % 14)} 66 62`} fill="none" stroke={accent} strokeWidth="1.1" />
    </svg>
  );
}

function qualityNotes(name: string, whenText: string, placeText: string): string[] {
  const notes: string[] = [];
  if (Array.from(name.trim()).length > 28) notes.push('الاسم طويل — سيُصغَّر تلقائياً.');
  if (!whenText.trim()) notes.push('أضف التاريخ أو الوقت.');
  if (!placeText.trim()) notes.push('أضف مكان المناسبة.');
  return notes;
}

function calendarHref(title: string, whenText: string, placeText: string): string {
  const text = encodeURIComponent(`${title} — ${whenText} — ${placeText}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}`;
}

function mapsHref(placeText: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(placeText || 'الرياض')}`;
}

export default function StoreOccasionCardLabPage() {
  useDocumentTitle(STORE_OCCASION_CARD_LAB.documentTitle);
  const [tier, setTier] = useState<LabTier>('featured');
  const [life, setLife] = useState<LabLifecycle>('before');
  const [hostName, setHostName] = useState('عبدالله وفهدة');
  const [opened, setOpened] = useState(false);
  const [privacyOk, setPrivacyOk] = useState(false);
  const [privacyCode, setPrivacyCode] = useState('');
  const [paletteId, setPaletteId] = useState('navy');
  const [substyle, setSubstyle] = useState<(typeof LAB_SUBSTYLES)[number]['id']>('classic');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setOpened(true);
  }, [tier]);

  const palettes = LAB_PALETTES[tier];
  const palette: Palette = (palettes.find((item) => item.id === paletteId) || palettes[0]) as Palette;
  const occasion = tier === 'luxury' ? 'عقد قران' : tier === 'featured' ? 'تخرج' : 'تهنئة عيد';
  const whenText = 'الجمعة 4 سبتمبر 2026 · بعد العشاء';
  const placeText = 'قاعة النخيل، الرياض';
  const seed = eventSignatureSeed({
    occasion,
    initials: arabicInitials(hostName),
    dateIso: '2026-09-04',
    paletteId: palette.id,
    templateId: `${tier}-${substyle}`,
  });
  const notes = qualityNotes(hostName, whenText, placeText);
  const nameClass = fitArabicNameClass(hostName);
  const hidePlace = life === 'after';
  const compact = life === 'day';
  const price = STORE_PAID_INVITE_PRICES_SAR[tier === 'quick' ? 'quick' : tier === 'featured' ? 'featured' : 'luxury'];

  const ogLine = useMemo(() => `${occasion} · ${hostName}`, [occasion, hostName]);

  if (!STORE_OCCASION_CARD_LAB_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_INVITES} replace />;
  }

  const showLuxuryGate = tier === 'luxury' && life !== 'after' && !privacyOk;

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link to={ROUTE_PATHS.STORE_INVITES} className="text-sm text-white/60">
            استوديو البطاقة
          </Link>
          <span className="text-xs text-[#e8c547]">{STORE_OCCASION_CARD_LAB.kickerAr}</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section>
          <p className="text-sm font-bold text-[#e8c547]">{STORE_OCCASION_CARD_LAB.kickerAr}</p>
          <h1 className="mt-2 text-3xl font-extrabold">{STORE_OCCASION_CARD_LAB.titleAr}</h1>
          <p className="mt-3 text-sm leading-7 text-white/70">{STORE_OCCASION_CARD_LAB.leadAr}</p>
          <figure className="mt-5 overflow-hidden rounded-2xl border border-white/12">
            <StoreShot reel="occasion" alt={STORE_OCCASION_CARD_LAB.titleAr} className="aspect-[16/7]" />
          </figure>

          <label className="mt-6 block text-sm">
            الاسم كما سيظهر
            <input
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#0b1a24] px-3 text-[16px]"
              maxLength={48}
            />
          </label>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {(['quick', 'featured', 'luxury'] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTier(id);
                  setOpened(false);
                  setPrivacyOk(false);
                  setPaletteId(LAB_PALETTES[id][0].id);
                }}
                className={cn(
                  'rounded-xl border px-2 py-3 text-sm font-bold',
                  tier === id ? 'border-[#e8c547] bg-[#e8c547]/15 text-[#e8c547]' : 'border-white/12 text-white/70',
                )}
              >
                {id === 'quick' ? `سريعة ${STORE_PAID_INVITE_PRICES_SAR.quick}` : null}
                {id === 'featured' ? `مميزة ${STORE_PAID_INVITE_PRICES_SAR.featured}` : null}
                {id === 'luxury' ? `فاخرة ${STORE_PAID_INVITE_PRICES_SAR.luxury}` : null}
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs text-white/50">حياة البطاقة — الرابط نفسه</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([
              ['before', 'قبل المناسبة'],
              ['day', 'يوم المناسبة'],
              ['after', 'بعد المناسبة'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setLife(id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs',
                  life === id ? 'bg-white text-[#061018]' : 'border border-white/20 text-white/70',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs text-white/50">لوحة الألوان</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {palettes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPaletteId(item.id)}
                className={cn(
                  'overflow-hidden rounded-full border text-xs',
                  palette.id === item.id ? 'border-[#e8c547] ring-1 ring-[#e8c547]' : 'border-white/20',
                )}
              >
                <span className="flex items-center gap-2 pe-3">
                  <img src={item.image} alt="" className="h-8 w-8 object-cover" />
                  {item.labelAr}
                </span>
              </button>
            ))}
          </div>

          {tier !== 'quick' ? (
            <>
              <p className="mt-4 text-xs text-white/50">نمط فرعي داخل القالب</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {LAB_SUBSTYLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSubstyle(item.id)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs',
                      substyle === item.id ? 'bg-white/90 text-[#061018]' : 'border border-white/20',
                    )}
                  >
                    {item.labelAr}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {tier !== 'quick' ? (
            <div className="mt-6 rounded-2xl border border-white/12 p-4 text-sm leading-7">
              <p className="font-bold">فحص الجودة قبل الدفع</p>
              {notes.length ? (
                notes.map((note) => (
                  <p key={note} className="text-amber-100/85">
                    {note}
                  </p>
                ))
              ) : (
                <p className="text-emerald-100/85">بطاقتك جاهزة للنشر</p>
              )}
            </div>
          ) : null}

          {tier !== 'quick' ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/12 p-3">
                <p className="text-[11px] text-white/45">معاينة واتساب مربعة</p>
                <div className="relative mt-2 aspect-square overflow-hidden rounded-lg">
                  <img src={palette.image} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-[#f8f1e6]">
                    <p className="text-xs">{occasion}</p>
                    <p className="mt-1 font-extrabold">{hostName}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/12 p-3">
                <p className="text-[11px] text-white/45">قصة عمودية</p>
                <div className="relative mt-2 aspect-[9/16] max-h-48 overflow-hidden rounded-lg">
                  <img src={palette.image} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <p className="absolute inset-x-3 bottom-3 text-xs text-white">{ogLine}</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="flex flex-col items-center">
          <div
            className={cn(
              'relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[28px] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.75)]',
              tier === 'luxury' && 'ring-2 ring-[#d4af67]/70',
              tier === 'featured' && 'ring-1 ring-white/20',
            )}
          >
            <img src={palette.image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div
              className={cn(
                'pointer-events-none absolute inset-0',
                tier === 'quick' && 'bg-gradient-to-t from-[#fffaf2]/92 via-[#fffaf2]/35 to-transparent',
                tier === 'featured' && 'bg-gradient-to-t from-black/85 via-black/35 to-black/10',
                tier === 'luxury' && 'bg-gradient-to-t from-black/80 via-black/25 to-transparent',
              )}
            />
            {tier === 'luxury' ? (
              <div
                className="pointer-events-none absolute inset-3 rounded-[22px]"
                style={{ boxShadow: `inset 0 0 0 1px ${palette.accent}, inset 0 0 0 7px rgba(0,0,0,0.35)` }}
              />
            ) : null}
            {tier === 'featured' ? (
              <div className="pointer-events-none absolute inset-2 rounded-[22px] border border-white/20" />
            ) : null}

            {tier !== 'quick' && !opened && !compact ? (
              <button
                type="button"
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
                onClick={() => setOpened(true)}
              >
                <img src={palette.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/55" />
                <span className="relative flex flex-col items-center gap-3 text-[#f8f1e6]">
                  <SignatureMark seed={seed} accent={palette.accent} ink="#f8f1e6" />
                  <span className="text-sm font-bold">{tier === 'luxury' ? 'افتح الظرف الذهبي' : 'اكشف الغلاف'}</span>
                  <span className="text-[11px] opacity-70">{STORE_OCCASION_CARD_LAB.skipMotionAr}</span>
                </span>
              </button>
            ) : null}

            {showLuxuryGate ? (
              <div className="absolute inset-0 z-10 flex flex-col items-end justify-end p-6">
                <div className="w-full rounded-2xl border border-[#d4af67]/50 bg-black/55 p-5 backdrop-blur-md">
                  <p className="text-center text-sm text-[#f4e6c8]">بطاقة خاصة — أدخل الرمز</p>
                  <input
                    value={privacyCode}
                    onChange={(e) => setPrivacyCode(e.target.value)}
                    className="mt-4 h-12 w-full rounded-md border border-[#d4af67]/40 bg-black/40 px-3 text-center text-[#f4e6c8]"
                    placeholder="1448"
                  />
                  <button
                    type="button"
                    className="mt-3 w-full rounded-full bg-[#d4af67] py-2 text-sm font-bold text-[#16120c]"
                    onClick={() => setPrivacyOk(privacyCode.trim() === '1448')}
                  >
                    فتح البطاقة
                  </button>
                </div>
              </div>
            ) : (
              <article
                className={cn(
                  'absolute inset-x-0 bottom-0 z-10 p-5 transition-opacity duration-700',
                  tier !== 'quick' && !opened && !compact ? 'opacity-0' : 'opacity-100',
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl p-5',
                    tier === 'quick' && 'border border-black/5 bg-[#fffaf2]/92 shadow-lg backdrop-blur-[2px]',
                    tier === 'featured' && 'border border-white/15 bg-black/45 backdrop-blur-md',
                    tier === 'luxury' && 'border border-[#d4af67]/45 bg-black/40 shadow-[0_0_40px_rgba(212,175,103,0.18)] backdrop-blur-md',
                  )}
                  style={{ color: tier === 'quick' ? palette.ink : '#f7edd8' }}
                >
                  {tier === 'luxury' ? (
                    <div className="mb-3 flex justify-end">
                      <button
                        type="button"
                        className="rounded-full border border-[#d4af67]/50 px-2 py-0.5 text-[11px]"
                        onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
                      >
                        {lang === 'ar' ? 'EN' : 'عربي'}
                      </button>
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] tracking-wide opacity-70">
                        {life === 'after' ? 'نسخة تذكارية' : compact ? 'يوم المناسبة' : occasion}
                      </p>
                      <h2 className={cn('mt-2 font-black', nameClass)}>{hostName}</h2>
                    </div>
                    {tier !== 'quick' ? <SignatureMark seed={seed} accent={palette.accent} ink="#f7edd8" /> : null}
                  </div>

                  <div
                    className="mt-4 h-px w-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` }}
                  />

                  {life !== 'after' ? (
                    <p className="mt-4 text-sm leading-7 opacity-90">
                      {lang === 'en' && tier === 'luxury'
                        ? 'With joy we invite you to celebrate with us.'
                        : compact
                          ? 'التفاصيل العملية لليوم.'
                          : 'يسعدنا دعوتكم لمشاركتنا هذه المناسبة.'}
                    </p>
                  ) : (
                    <p className="mt-4 text-sm leading-7 opacity-90">ذُكرت المناسبة، وبقيت البطاقة أثراً جميلاً.</p>
                  )}

                  <dl className="mt-5 space-y-2 text-sm">
                    <div>
                      <dt className="text-[11px] opacity-55">{compact ? 'الوقت' : 'الموعد'}</dt>
                      <dd>{whenText}</dd>
                    </div>
                    {!hidePlace ? (
                      <div>
                        <dt className="text-[11px] opacity-55">المكان</dt>
                        <dd>{placeText}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {tier === 'luxury' && !compact && life === 'before' ? (
                    <p className="mt-4 text-center text-xs tracking-[0.35em]" style={{ color: palette.accent }}>
                      {arabicInitials(hostName)}
                    </p>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {!hidePlace ? (
                      <a
                        href={mapsHref(placeText)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full px-3 py-1.5 text-xs font-bold"
                        style={{ background: palette.accent, color: tier === 'quick' ? '#fffaf2' : palette.bg }}
                      >
                        {STORE_OCCASION_CARD_LAB.mapsLabelAr}
                      </a>
                    ) : null}
                    {life !== 'after' ? (
                      <a
                        href={calendarHref(occasion, whenText, placeText)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border px-3 py-1.5 text-xs"
                        style={{ borderColor: palette.accent }}
                      >
                        {STORE_OCCASION_CARD_LAB.calendarLabelAr}
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-4 text-center text-[10px] opacity-50">halaqmap · خريطة الحل · {price} ر.س</p>
                </div>
              </article>
            )}
          </div>

          <div className="mt-4 w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-[#111b22]">
            <p className="px-3 pt-3 text-[11px] text-white/45">غلاف المشاركة في المحادثة</p>
            <div className="mt-2">
              <img src={palette.image} alt="" className="h-28 w-full object-cover" />
              <div className="p-3 text-sm">
                <p className="font-bold text-white">{ogLine}</p>
                <p className="mt-1 text-xs text-white/55">store.halaqmap.com</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
