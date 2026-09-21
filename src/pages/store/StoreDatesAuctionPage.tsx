/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة مزاد تمرتنا1 العامة — رابط منفصل يشاركه المشغّل.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  STORE_DATES_LIVE_ACCENT,
  STORE_DATES_LIVE_LAB_TOKEN,
  STORE_DATES_LIVE_PUBLIC_ENABLED,
} from '@/config/storeDatesLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { POLL_MS, scheduleVisiblePoll } from '@/lib/pollingPolicy';
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  labAddBid,
  readDatesAuctionLabLots,
} from '@/lib/storeDatesAuctionLab';
import { addDatesAuctionBid, fetchDatesAuctionPublic } from '@/lib/storeDatesAuctionRemote';
import { readSavedDatesBuyer, writeSavedDatesBuyer } from '@/lib/storeDatesLiveLab';
import {
  auctionMinNextBid,
  publicAuctionLotView,
  SHOP_AUCTION_DISCLAIMER_AR,
} from '@/lib/storeShopAuction';
import { DatesTamratnaMark } from '@/components/store/dates/DatesTamratnaMark';

type PublicLot = ReturnType<typeof publicAuctionLotView>;

export default function StoreDatesAuctionPage() {
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim() || STORE_DATES_LIVE_LAB_TOKEN;
  const isLab = safeToken === STORE_DATES_LIVE_LAB_TOKEN;
  const saved = readSavedDatesBuyer();
  const [shopName, setShopName] = useState('تمرتنا1');
  const [lots, setLots] = useState<PublicLot[]>([]);
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [hint, setHint] = useState('');
  const [gate, setGate] = useState<'loading' | 'ok' | 'missing'>('loading');

  useDocumentTitle(`مزاد · ${shopName}`);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (isLab) {
        const labLots = readDatesAuctionLabLots(safeToken)
          .filter((lot) => lot.status === 'open' || lot.status === 'closed')
          .map((lot) => publicAuctionLotView(lot, phone));
        if (!cancelled) {
          setLots(labLots);
          setGate('ok');
        }
        return;
      }
      void fetchDatesAuctionPublic(safeToken, phone).then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setGate((current) => (current === 'ok' ? current : 'missing'));
          return;
        }
        setShopName(String(result.shopName || shopName));
        setLots(Array.isArray(result.lots) ? (result.lots as PublicLot[]) : []);
        setGate('ok');
      });
    };
    load();
    const stop = scheduleVisiblePoll(load, POLL_MS.STORE_LIVE_AUCTION);
    return () => {
      cancelled = true;
      stop();
    };
    // shopName يُقرأ فقط كقيمة احتياطية عند غياب اسم من الـAPI، وهو نفسه ما
    // يُحدَّثه هذا الأثر (setShopName) — إدراجه في الاعتماديات كان يُعيد
    // تشغيل الأثر بالكامل (إلغاء الاستطلاع الحالي وجدولته من الصفر + طلب
    // فوري إضافي) في كل مرة يصل فيها اسم المتجر من الخادم.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeToken, isLab, phone]);

  const openLots = useMemo(() => lots.filter((lot) => lot.status === 'open'), [lots]);
  const closedLots = useMemo(() => lots.filter((lot) => lot.status === 'closed'), [lots]);

  async function submitBid(lot: PublicLot) {
    const amount = Math.floor(Number(amounts[String(lot.id)] || 0));
    const minNext = auctionMinNextBid({
      currentBid: Number(lot.currentBid) || 0,
      startingPrice: Number(lot.startingPrice) || 0,
      minIncrement: Number(lot.minIncrement) || 1,
    });
    if (name.trim().length < 2 || phone.trim().length < 9) {
      setHint('أدخل الاسم والجوال قبل المزايدة');
      return;
    }
    if (amount < minNext) {
      setHint(`أقل مزايدة مقبولة: ${minNext} ر.س`);
      return;
    }
    writeSavedDatesBuyer({ name: name.trim(), phone: phone.trim(), place: saved?.place || '' });
    if (isLab) {
      const result = labAddBid(safeToken, String(lot.id), {
        name: name.trim(),
        phone: phone.trim(),
        amount,
      });
      if (!result.ok) {
        setHint(result.error);
        return;
      }
      setLots(
        readDatesAuctionLabLots(safeToken)
          .filter((item) => item.status === 'open' || item.status === 'closed')
          .map((item) => publicAuctionLotView(item, phone.trim())),
      );
      setHint('وُضعت مزايدتك');
      return;
    }
    const result = await addDatesAuctionBid(safeToken, {
      lotId: String(lot.id),
      name: name.trim(),
      phone: phone.trim(),
      amount,
    });
    if (!result.ok) {
      setHint(String(result.error || 'تعذّرت المزايدة'));
      return;
    }
    setHint('وُضعت مزايدتك');
    const refreshed = await fetchDatesAuctionPublic(safeToken, phone.trim());
    if (refreshed.ok && Array.isArray(refreshed.lots)) {
      setLots(refreshed.lots as PublicLot[]);
    }
  }

  if (!STORE_DATES_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (gate === 'missing') {
    return <Navigate to={ROUTE_PATHS.STORE_DATES} replace />;
  }

  return (
    <main dir="rtl" className="min-h-dvh bg-[#eee2ce] text-[#2e2418]">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-3 border-b border-[#e2d2b4] pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <DatesTamratnaMark size="sm" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#8a6239]">مزاد علني حي</p>
              <h1 className="truncate text-lg font-black">{shopName}</h1>
            </div>
          </div>
          <Link to={`/t/${encodeURIComponent(safeToken)}`} className="text-sm font-bold text-[#8a6239] underline">
            المتجر
          </Link>
        </header>

        <p className="mt-4 text-sm leading-7 text-[#6f6250]">
          ضع مزايدتك فوق السعر الحالي. المشغّل يغلق المزاد يدوياً ويتواصل مع الفائز مباشرة خارج المنصة.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold text-[#6f6250]">
            الاسم
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-11 border-[#dac8aa] bg-white" maxLength={40} />
          </label>
          <label className="block text-xs font-bold text-[#6f6250]">
            الجوال
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 h-11 border-[#dac8aa] bg-white"
              inputMode="tel"
              maxLength={20}
            />
          </label>
        </div>
        {hint ? <p className="mt-3 text-sm font-bold text-[#8a6239]">{hint}</p> : null}

        <section className="mt-8 space-y-6">
          {gate === 'loading' ? <p className="text-sm text-[#79674f]">جاري التحميل…</p> : null}
          {!openLots.length && !closedLots.length && gate === 'ok' ? (
            <p className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5 text-sm leading-7 text-[#79674f]">
              لا صناديق مفتوحة الآن. من لوحة التشغيل: اضغط «حفظ ونشر الآن» أو «نشر الصندوق» على المسودة، ثم حدّث هذه الصفحة.
            </p>
          ) : null}
          {openLots.map((lot) => (
            <LotCard
              key={String(lot.id)}
              lot={lot}
              amount={amounts[String(lot.id)] || ''}
              onAmountChange={(value) => setAmounts((current) => ({ ...current, [String(lot.id)]: value }))}
              onBid={() => void submitBid(lot)}
              accent={STORE_DATES_LIVE_ACCENT}
            />
          ))}
          {closedLots.map((lot) => (
            <LotCard key={String(lot.id)} lot={lot} closed accent={STORE_DATES_LIVE_ACCENT} />
          ))}
        </section>

        <p role="note" className="mt-8 rounded-2xl border border-[#dac8aa] bg-[#f3e6cf] p-4 text-sm leading-7 text-[#6f4a26]">
          {SHOP_AUCTION_DISCLAIMER_AR}
        </p>
      </div>
    </main>
  );
}

function LotCard({
  lot,
  amount = '',
  onAmountChange,
  onBid,
  closed = false,
  accent,
}: {
  lot: PublicLot;
  amount?: string;
  onAmountChange?: (value: string) => void;
  onBid?: () => void;
  closed?: boolean;
  accent: string;
}) {
  const minNext = auctionMinNextBid({
    currentBid: Number(lot.currentBid) || 0,
    startingPrice: Number(lot.startingPrice) || 0,
    minIncrement: Number(lot.minIncrement) || 1,
  });
  const photos = Array.isArray(lot.photoSrcs) ? (lot.photoSrcs as string[]) : [];
  const bids = Array.isArray(lot.bids) ? lot.bids : [];

  return (
    <article className="rounded-2xl border border-[#dac8aa] bg-[#fbf6ec] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#2e2418]">{String(lot.titleAr || 'صندوق')}</h2>
          {lot.descriptionAr ? <p className="mt-2 text-sm leading-7 text-[#6f6250]">{String(lot.descriptionAr)}</p> : null}
        </div>
        <div className="rounded-xl bg-[#f3e6cf] px-4 py-3 text-center">
          <p className="text-[10px] font-bold text-[#8a6239]">{closed ? 'السعر الختامي' : 'السعر الحالي'}</p>
          <p className="text-2xl font-black" style={{ color: accent }}>
            {Number(lot.currentBid) || Number(lot.startingPrice) || 0} ر.س
          </p>
        </div>
      </div>

      {photos.length ? (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {photos.map((src) => (
            <img key={src.slice(0, 40)} src={src} alt="" className="h-28 w-28 shrink-0 rounded-xl object-cover" />
          ))}
        </div>
      ) : null}

      {lot.videoUrl ? (
        <a
          href={String(lot.videoUrl)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-bold text-[#8a6239] underline"
        >
          مشاهدة الفيديو
        </a>
      ) : null}

      <ul className="mt-4 space-y-1.5">
        {bids.slice(0, 8).map((bid) => {
          const row = bid as { id?: string; name?: string; amount?: number; at?: string };
          return (
            <li key={String(row.id)} className="flex justify-between gap-3 text-sm text-[#5c4f3d]">
              <span>{row.name}</span>
              <span className="font-bold">{row.amount} ر.س</span>
            </li>
          );
        })}
      </ul>

      {closed ? (
        <div className="mt-4 rounded-xl border border-[#dac8aa] bg-white p-4 text-sm leading-7">
          <p className="font-black text-[#2e2418]">أُقفل المزاد</p>
          {lot.winnerName ? <p className="mt-1 text-[#6f6250]">أعلى مزايدة: {String(lot.winnerName)}</p> : null}
          {lot.isViewerWinner ? (
            <p className="mt-2 font-bold text-[#8a6239]">
              أنت الفائز. سيتواصل معك المشغّل مباشرة لإتمام البيع والتسليم خارج المنصة.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="min-w-[10rem] flex-1 text-xs font-bold text-[#6f6250]">
            زايد الآن (≥ {minNext})
            <Input
              value={amount}
              onChange={(e) => onAmountChange?.(e.target.value)}
              className="mt-2 h-11 border-[#dac8aa] bg-white"
              inputMode="numeric"
              placeholder={String(minNext)}
            />
          </label>
          <Button type="button" onClick={onBid} className="h-11 rounded-xl px-5 text-sm font-black text-white" style={{ background: accent }}>
            تأكيد المزايدة
          </Button>
        </div>
      )}
    </article>
  );
}
