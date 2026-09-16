/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إدارة مزاد تمرتنا1 من لوحة التشغيل.
 */
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { STORE_DATES_LIVE_ACCENT, STORE_DATES_LIVE_LAB_TOKEN } from '@/config/storeDatesLive';
import { POLL_MS, scheduleVisiblePoll } from '@/lib/pollingPolicy';
import {
  labCloseLot,
  labCreateLot,
  labOpenLot,
  readDatesAuctionLabLots,
} from '@/lib/storeDatesAuctionLab';
import {
  closeDatesAuctionLot,
  createDatesAuctionLot,
  fetchDatesAuctionDesk,
  openDatesAuctionLot,
} from '@/lib/storeDatesAuctionRemote';
import { compressImageFile } from '@/lib/storeDatesLiveLab';
import {
  SHOP_AUCTION_DISCLAIMER_AR,
  type AuctionLot,
} from '@/lib/storeShopAuction';
import { storeLiveShopShareHref } from '@/lib/storeHostRedirect';

export function DatesAuctionDesk({
  deskToken,
  shopToken,
}: {
  deskToken: string;
  shopToken: string;
}) {
  const isLab = deskToken === STORE_DATES_LIVE_LAB_TOKEN || shopToken === STORE_DATES_LIVE_LAB_TOKEN;
  const [lots, setLots] = useState<AuctionLot[]>([]);
  const [shareToken, setShareToken] = useState(shopToken || deskToken);
  const [titleAr, setTitleAr] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [startingPrice, setStartingPrice] = useState('100');
  const [minIncrement, setMinIncrement] = useState('10');
  const [photoSrcs, setPhotoSrcs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');
  const publicShopToken = shareToken || shopToken || deskToken;
  const auctionUrl = `${storeLiveShopShareHref('dates', publicShopToken)}/auction`;

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (isLab) {
        if (!cancelled) {
          setShareToken(deskToken);
          setLots(readDatesAuctionLabLots(deskToken));
        }
        return;
      }
      void fetchDatesAuctionDesk(deskToken).then((result) => {
        if (cancelled || !result.ok) return;
        if (typeof result.shopToken === 'string' && result.shopToken) setShareToken(result.shopToken);
        setLots(Array.isArray(result.lots) ? (result.lots as AuctionLot[]) : []);
      });
    };
    load();
    const stop = scheduleVisiblePoll(load, POLL_MS.STORE_LIVE_AUCTION);
    return () => {
      cancelled = true;
      stop();
    };
  }, [deskToken, isLab]);

  async function onPickPhotos(files: FileList | null) {
    if (!files?.length) return;
    const next = [...photoSrcs];
    for (const file of Array.from(files).slice(0, 6 - next.length)) {
      const src = await compressImageFile(file, 900);
      if (src) next.push(src);
    }
    setPhotoSrcs(next.slice(0, 6));
  }

  async function createLot() {
    setBusy(true);
    setHint('');
    const payload = {
      titleAr: titleAr.trim(),
      descriptionAr: descriptionAr.trim(),
      videoUrl: videoUrl.trim(),
      startingPrice: Math.floor(Number(startingPrice) || 0),
      minIncrement: Math.floor(Number(minIncrement) || 10),
      photoSrcs,
    };
    if (payload.titleAr.length < 2 || payload.startingPrice < 1) {
      setBusy(false);
      setHint('العنوان والسعر الابتدائي مطلوبان');
      return;
    }
    if (isLab) {
      labCreateLot(deskToken, payload);
      setLots(readDatesAuctionLabLots(deskToken));
      setTitleAr('');
      setDescriptionAr('');
      setVideoUrl('');
      setPhotoSrcs([]);
      setHint('أُنشئ الصندوق كمسودة');
      setBusy(false);
      return;
    }
    const result = await createDatesAuctionLot(deskToken, payload);
    setBusy(false);
    if (!result.ok) {
      setHint(String(result.error || 'تعذّر الإنشاء'));
      return;
    }
    setTitleAr('');
    setDescriptionAr('');
    setVideoUrl('');
    setPhotoSrcs([]);
    setHint('أُنشئ الصندوق كمسودة');
    const desk = await fetchDatesAuctionDesk(deskToken);
    if (desk.ok && Array.isArray(desk.lots)) setLots(desk.lots as AuctionLot[]);
  }

  async function openLot(lotId: string) {
    if (isLab) {
      labOpenLot(deskToken, lotId);
      setLots(readDatesAuctionLabLots(deskToken));
      return;
    }
    const result = await openDatesAuctionLot(deskToken, lotId);
    if (!result.ok) {
      setHint(String(result.error || 'تعذّر النشر'));
      return;
    }
    const desk = await fetchDatesAuctionDesk(deskToken);
    if (desk.ok && Array.isArray(desk.lots)) setLots(desk.lots as AuctionLot[]);
  }

  async function closeLot(lotId: string) {
    if (isLab) {
      labCloseLot(deskToken, lotId);
      setLots(readDatesAuctionLabLots(deskToken));
      return;
    }
    const result = await closeDatesAuctionLot(deskToken, lotId);
    if (!result.ok) {
      setHint(String(result.error || 'تعذّر الإغلاق'));
      return;
    }
    const desk = await fetchDatesAuctionDesk(deskToken);
    if (desk.ok && Array.isArray(desk.lots)) setLots(desk.lots as AuctionLot[]);
  }

  const draft = lots.filter((lot) => lot.status === 'draft');
  const open = lots.filter((lot) => lot.status === 'open');
  const closed = lots.filter((lot) => lot.status === 'closed');

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
        <h3 className="font-black text-[#2e2418]">رابط المزاد العام</h3>
        <p className="mt-2 text-sm leading-7 text-[#79674f]">
          أرسل هذا الرابط لمن تعتمدهم للمزاودة فقط. لا يظهر في فهرس عام.
        </p>
        <a href={auctionUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex break-all text-sm font-bold text-[#8a6239] underline">
          {auctionUrl}
        </a>
        <Button
          type="button"
          className="mt-3 h-10 rounded-xl border border-[#dac8aa] bg-white px-4 text-xs font-bold text-[#8a6239] shadow-none"
          onClick={() => {
            void navigator.clipboard?.writeText(auctionUrl).then(() => setHint('نُسخ رابط المزاد'));
          }}
        >
          نسخ الرابط
        </Button>
      </section>

      <section className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
        <h3 className="font-black text-[#2e2418]">صندوق مزاد جديد</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-bold text-[#6f6250]">
            العنوان
            <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className="mt-2 h-11 border-[#dac8aa] bg-white" maxLength={80} />
          </label>
          <label className="block text-xs font-bold text-[#6f6250]">
            الوصف
            <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} className="mt-2 min-h-24 border-[#dac8aa] bg-white" maxLength={600} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold text-[#6f6250]">
              السعر الابتدائي (ر.س)
              <Input value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} className="mt-2 h-11 border-[#dac8aa] bg-white" inputMode="numeric" />
            </label>
            <label className="block text-xs font-bold text-[#6f6250]">
              الحد الأدنى للزيادة
              <Input value={minIncrement} onChange={(e) => setMinIncrement(e.target.value)} className="mt-2 h-11 border-[#dac8aa] bg-white" inputMode="numeric" />
            </label>
          </div>
          <label className="block text-xs font-bold text-[#6f6250]">
            رابط فيديو خارجي (اختياري — HTTPS فقط)
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="mt-2 h-11 border-[#dac8aa] bg-white" maxLength={500} placeholder="https://..." />
          </label>
          <label className="block text-xs font-bold text-[#6f6250]">
            صور الصندوق
            <Input type="file" accept="image/*" multiple className="mt-2 border-[#dac8aa] bg-white" onChange={(e) => void onPickPhotos(e.target.files)} />
          </label>
          {photoSrcs.length ? (
            <div className="flex gap-2 overflow-x-auto">
              {photoSrcs.map((src) => (
                <img key={src.slice(0, 32)} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          ) : null}
          <Button
            type="button"
            disabled={busy}
            onClick={() => void createLot()}
            className="h-11 rounded-xl px-5 text-sm font-black text-white"
            style={{ background: STORE_DATES_LIVE_ACCENT }}
          >
            حفظ كمسودة
          </Button>
        </div>
      </section>

      {hint ? <p className="text-sm font-bold text-[#8a6239]">{hint}</p> : null}

      <LotGroup title="مفتوحة الآن" lots={open} onOpen={openLot} onClose={closeLot} showClose />
      <LotGroup title="مسودات" lots={draft} onOpen={openLot} onClose={closeLot} showOpen />
      <LotGroup title="مغلقة" lots={closed} onOpen={openLot} onClose={closeLot} archive />

      <p role="note" className="rounded-2xl border border-[#dac8aa] bg-[#f3e6cf] p-4 text-sm leading-7 text-[#6f4a26]">
        {SHOP_AUCTION_DISCLAIMER_AR}
      </p>
    </div>
  );
}

function LotGroup({
  title,
  lots,
  onOpen,
  onClose,
  showOpen = false,
  showClose = false,
  archive = false,
}: {
  title: string;
  lots: AuctionLot[];
  onOpen: (id: string) => void | Promise<void>;
  onClose: (id: string) => void | Promise<void>;
  showOpen?: boolean;
  showClose?: boolean;
  archive?: boolean;
}) {
  if (!lots.length) return null;
  return (
    <section className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
      <h3 className="font-black text-[#2e2418]">{title}</h3>
      <div className="mt-4 space-y-4">
        {lots.map((lot) => (
          <article key={lot.id} className="rounded-xl border border-[#e2d2b4] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-[#2e2418]">{lot.titleAr}</p>
                <p className="mt-1 text-sm text-[#79674f]">
                  ابتدائي {lot.startingPrice} · زيادة {lot.minIncrement} · الحالي {lot.currentBid || lot.startingPrice} ر.س
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {showOpen ? (
                  <Button type="button" onClick={() => void onOpen(lot.id)} className="h-9 rounded-lg bg-[#8a6239] px-3 text-xs font-bold text-white">
                    نشر الصندوق
                  </Button>
                ) : null}
                {showClose ? (
                  <Button type="button" onClick={() => void onClose(lot.id)} className="h-9 rounded-lg border border-[#dac8aa] bg-[#f3e6cf] px-3 text-xs font-bold text-[#6f4a26] shadow-none">
                    إغلاق المزاد وإعلان الفائز
                  </Button>
                ) : null}
              </div>
            </div>
            {lot.bids.length ? (
              <ul className="mt-3 space-y-1 text-sm text-[#5c4f3d]">
                {lot.bids.slice(0, archive ? 5 : 12).map((bid) => (
                  <li key={bid.id} className="flex flex-wrap justify-between gap-2">
                    <span>
                      {bid.name} · {bid.phone}
                    </span>
                    <span className="font-bold">{bid.amount} ر.س</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#8a7c66]">لا مزايدات بعد.</p>
            )}
            {lot.status === 'closed' && lot.winnerPhone ? (
              <p className="mt-3 rounded-lg bg-[#f3e6cf] px-3 py-2 text-sm font-bold text-[#6f4a26]">
                الفائز: {lot.winnerName} · {lot.winnerPhone} · {lot.currentBid} ر.س
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
