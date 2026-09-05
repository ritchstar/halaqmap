/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تعليمات تحويل حلانا1 للعميلة بعد عرض السعر. إثبات مربوط بالطلب، لا قفل تلقائي.
 */
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { STORE_HALANA_IMAGE_MAX_CHARS, STORE_HALANA_LIVE_COPY } from '@/config/storeHalanaLive';
import { HALANA_PAY_REQUEST_KEY, halanaPayCopyText } from '@/lib/storeHalanaPay';
import { fetchHalanaPay, postHalanaAction } from '@/lib/storeHalanaLiveRemote';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';

type PayReady = {
  ready: true;
  bankName: string;
  beneficiaryName: string;
  iban: string;
  cashRemainder: boolean;
  networkRemainder: boolean;
  amountSar: string;
  quoteNote: string;
  proofUploaded: boolean;
};

export function StoreHalanaPayGuest({ token }: { token: string }) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [requestId, setRequestId] = useState('');
  const [pay, setPay] = useState<PayReady | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`${HALANA_PAY_REQUEST_KEY}:${token}`) || '';
    setRequestId(stored);
  }, [token]);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;
    void (async () => {
      const res = await fetchHalanaPay(token, requestId);
      if (cancelled) return;
      if (!res.ok) {
        setWaiting(true);
        setPay(null);
        return;
      }
      const raw = res.pay;
      if (raw.ready === true && typeof raw.iban === 'string') {
        setWaiting(false);
        setPay({
          ready: true,
          bankName: String(raw.bankName || ''),
          beneficiaryName: String(raw.beneficiaryName || ''),
          iban: String(raw.iban || ''),
          cashRemainder: Boolean(raw.cashRemainder),
          networkRemainder: Boolean(raw.networkRemainder),
          amountSar: String(raw.amountSar || ''),
          quoteNote: String(raw.quoteNote || ''),
          proofUploaded: Boolean(raw.proofUploaded),
        });
        return;
      }
      setWaiting(true);
      setPay(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, requestId]);

  async function copyPay() {
    if (!pay) return;
    try {
      await navigator.clipboard.writeText(
        halanaPayCopyText({
          bankName: pay.bankName,
          beneficiaryName: pay.beneficiaryName,
          iban: pay.iban,
          amountSar: pay.amountSar,
          requestRef: requestId.slice(0, 8),
        }),
      );
      toast.success(copy.shareCopiedAr);
    } catch {
      toast.error(copy.shareCopyFailAr);
    }
  }

  async function onProof(file: File | undefined) {
    if (!file || !requestId || busy) return;
    setBusy(true);
    try {
      let imageSrc = await compressImageFile(file, 900);
      if (imageSrc.length > STORE_HALANA_IMAGE_MAX_CHARS) {
        imageSrc = await compressImageFile(file, 640);
      }
      const res = await postHalanaAction({
        action: 'add_pay_proof',
        token,
        requestId,
        imageSrc,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(copy.payProofSavedAr);
      setPay((prev) => (prev ? { ...prev, proofUploaded: true } : prev));
    } catch {
      toast.error('تعذر رفع الإثبات. جرّبي ملفاً أصغر.');
    } finally {
      setBusy(false);
    }
  }

  if (!requestId) {
    return <p className="text-base leading-8 text-[#ffe8c4]/80">{copy.payWaitAr}</p>;
  }

  if (!pay) {
    return (
      <section className="halana-form-card space-y-3 rounded-2xl p-5">
        <h2 className="halana-title-sm">{copy.payInstructionsTitleAr}</h2>
        <p className="halana-lead">{waiting ? copy.payWaitAr : copy.payInstructionsLeadAr}</p>
      </section>
    );
  }

  return (
    <section className="halana-form-card space-y-4 rounded-2xl p-5">
      <h2 className="halana-title-sm">{copy.payInstructionsTitleAr}</h2>
      <p className="halana-lead">{copy.payInstructionsLeadAr}</p>
      {pay.amountSar ? <p className="text-base font-extrabold text-[#ffe8c4]">المبلغ: {pay.amountSar} ر.س</p> : null}
      {pay.quoteNote ? <p className="text-sm leading-7 text-[#ffe8c4]/80">{pay.quoteNote}</p> : null}
      {pay.beneficiaryName ? (
        <p className="text-base leading-8">
          {copy.payBeneficiaryAr}: {pay.beneficiaryName}
        </p>
      ) : null}
      {pay.bankName ? (
        <p className="text-base leading-8">
          {copy.payBankAr}: {pay.bankName}
        </p>
      ) : null}
      {pay.iban ? (
        <p className="text-base leading-8" dir="ltr">
          {pay.iban}
        </p>
      ) : null}
      {pay.iban ? (
        <button type="button" onClick={() => void copyPay()} className="halana-action rounded-full px-5 py-2.5 text-sm font-extrabold">
          {copy.payCopyIbanAr}
        </button>
      ) : null}
      {pay.cashRemainder ? <p className="text-sm font-bold text-[#ffe8c4]">{copy.payCashAr}</p> : null}
      {pay.networkRemainder ? <p className="text-sm font-bold text-[#ffe8c4]">{copy.payNetworkAr}</p> : null}
      <p className="text-sm leading-7 text-amber-100/85">{copy.payProofHintAr}</p>
      <label className="halana-action inline-flex cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold">
        {copy.payProofCtaAr}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            void onProof(file);
          }}
        />
      </label>
      {pay.proofUploaded ? <p className="text-sm leading-7 text-[#ffe8c4]/85">{copy.payProofSavedAr}</p> : null}
    </section>
  );
}
