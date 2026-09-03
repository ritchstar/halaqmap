/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تعليمات التحويل للعميل بعد الطلب أو عرض السعر. إثبات مربوط بالطلب، لا تأكيد آلي.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { STORE_HALANA_IMAGE_MAX_CHARS } from '@/config/storeHalanaLive';
import { STORE_DIRECT_PAY_COPY } from '@/config/storeDirectPay';
import { STORE_DIRECT_PAY_POLICY_PATH } from '@/config/storeDirectPayLegal';
import { DIRECT_PAY_REQUEST_KEY, directPayCopyText } from '@/lib/storeDirectPay';
import { fetchDirectPay, postDirectPay } from '@/lib/storeDirectPayRemote';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';

export type DirectPayPublic = {
  bankTransfer: boolean;
  stcBank: boolean;
  sarie: boolean;
  externalLink: boolean;
  cashOnPickup: boolean;
  networkOnPickup: boolean;
};

export const EMPTY_DIRECT_PAY_PUBLIC: DirectPayPublic = {
  bankTransfer: false,
  stcBank: false,
  sarie: false,
  externalLink: false,
  cashOnPickup: false,
  networkOnPickup: false,
};

type PayReady = {
  bankName: string;
  beneficiaryName: string;
  iban: string;
  stcMobile: string;
  sarieKind: string;
  sarieAlias: string;
  externalUrl: string;
  cashRemainder: boolean;
  networkRemainder: boolean;
  enabledIban: boolean;
  enabledStc: boolean;
  enabledSarie: boolean;
  enabledExternal: boolean;
  proofUploaded: boolean;
};

export function StoreDirectPayPublicMount({
  product,
  token,
  accent = '#c45c7a',
}: {
  product: string;
  token: string;
  accent?: string;
}) {
  const [payPublic, setPayPublic] = useState<DirectPayPublic>(EMPTY_DIRECT_PAY_PUBLIC);
  useEffect(() => {
    let cancelled = false;
    void fetchDirectPay({ product, token, role: 'shop' }).then((res) => {
      if (cancelled || !res.ok || !res.data.payPublic || typeof res.data.payPublic !== 'object') return;
      const row = res.data.payPublic as Record<string, unknown>;
      setPayPublic({
        bankTransfer: Boolean(row.bankTransfer),
        stcBank: Boolean(row.stcBank),
        sarie: Boolean(row.sarie),
        externalLink: Boolean(row.externalLink),
        cashOnPickup: Boolean(row.cashOnPickup),
        networkOnPickup: Boolean(row.networkOnPickup),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [product, token]);
  return <StoreDirectPayChips payPublic={payPublic} accent={accent} />;
}

export function StoreDirectPayChips({
  payPublic,
  accent = '#c45c7a',
}: {
  payPublic: DirectPayPublic;
  accent?: string;
}) {
  const copy = STORE_DIRECT_PAY_COPY;
  const chips = [
    payPublic.bankTransfer ? copy.publicBankAr : '',
    payPublic.stcBank ? copy.publicStcAr : '',
    payPublic.sarie ? copy.publicSarieAr : '',
    payPublic.externalLink ? copy.publicExternalAr : '',
    payPublic.cashOnPickup ? copy.publicCashAr : '',
    payPublic.networkOnPickup ? copy.publicNetworkAr : '',
  ].filter(Boolean);
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((label) => (
        <span
          key={label}
          className="rounded-full border px-3 py-1.5 text-xs font-bold"
          style={{ borderColor: `${accent}66`, color: accent }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function StoreDirectPayGuest({
  product,
  token,
  requestRef,
  accent = '#c45c7a',
  amountSar = '',
}: {
  product: string;
  token: string;
  requestRef?: string;
  accent?: string;
  amountSar?: string;
}) {
  const copy = STORE_DIRECT_PAY_COPY;
  const [ref, setRef] = useState(requestRef || '');
  const [pay, setPay] = useState<PayReady | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payPublic, setPayPublic] = useState<DirectPayPublic>(EMPTY_DIRECT_PAY_PUBLIC);

  useEffect(() => {
    if (requestRef) {
      setRef(requestRef);
      return;
    }
    setRef(sessionStorage.getItem(`${DIRECT_PAY_REQUEST_KEY}:${product}:${token}`) || '');
  }, [product, token, requestRef]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetchDirectPay({ product, token, role: 'shop', requestRef: ref || undefined });
      if (cancelled || !res.ok) {
        setWaiting(Boolean(ref));
        setPay(null);
        return;
      }
      const publicRaw = res.data.payPublic;
      if (publicRaw && typeof publicRaw === 'object') {
        const row = publicRaw as Record<string, unknown>;
        setPayPublic({
          bankTransfer: Boolean(row.bankTransfer),
          stcBank: Boolean(row.stcBank),
          sarie: Boolean(row.sarie),
          externalLink: Boolean(row.externalLink),
          cashOnPickup: Boolean(row.cashOnPickup),
          networkOnPickup: Boolean(row.networkOnPickup),
        });
      }
      if (res.data.ready === true && res.data.pay && typeof res.data.pay === 'object') {
        const raw = res.data.pay as Record<string, unknown>;
        setWaiting(false);
        setPay({
          bankName: String(raw.bankName || ''),
          beneficiaryName: String(raw.beneficiaryName || ''),
          iban: String(raw.iban || ''),
          stcMobile: String(raw.stcMobile || ''),
          sarieKind: String(raw.sarieKind || ''),
          sarieAlias: String(raw.sarieAlias || ''),
          externalUrl: String(raw.externalUrl || ''),
          cashRemainder: Boolean(raw.cashRemainder),
          networkRemainder: Boolean(raw.networkRemainder),
          enabledIban: Boolean(raw.enabledIban),
          enabledStc: Boolean(raw.enabledStc),
          enabledSarie: Boolean(raw.enabledSarie),
          enabledExternal: Boolean(raw.enabledExternal),
          proofUploaded: Boolean(res.data.proofUploaded),
        });
        return;
      }
      setPay(null);
      setWaiting(Boolean(ref));
    })();
    return () => {
      cancelled = true;
    };
  }, [product, token, ref]);

  async function copyPay() {
    if (!pay) return;
    try {
      await navigator.clipboard.writeText(
        directPayCopyText({
          bankName: pay.bankName,
          beneficiaryName: pay.beneficiaryName,
          iban: pay.enabledIban ? pay.iban : '',
          stcMobile: pay.enabledStc ? pay.stcMobile : '',
          sarieKind: pay.enabledSarie ? pay.sarieKind : '',
          sarieAlias: pay.enabledSarie ? pay.sarieAlias : '',
          externalUrl: pay.enabledExternal ? pay.externalUrl : '',
          amountSar,
          requestRef: ref.slice(0, 8),
        }),
      );
      toast.success('نُسخت تعليمات التحويل.');
    } catch {
      toast.error('تعذر النسخ.');
    }
  }

  async function onProof(file: File | undefined) {
    if (!file || !ref || busy) return;
    setBusy(true);
    try {
      let imageSrc = await compressImageFile(file, 900);
      if (imageSrc.length > STORE_HALANA_IMAGE_MAX_CHARS) {
        imageSrc = await compressImageFile(file, 640);
      }
      const res = await postDirectPay({
        action: 'add_proof',
        product,
        token,
        requestRef: ref,
        imageSrc,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(copy.proofSavedAr);
      setPay((prev) => (prev ? { ...prev, proofUploaded: true } : prev));
    } catch {
      toast.error('تعذر رفع الإثبات. جرّب ملفاً أصغر.');
    } finally {
      setBusy(false);
    }
  }

  if (!ref) {
    return (
      <section className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-lg font-extrabold" style={{ color: accent }}>
          {copy.titleAr}
        </h2>
        <StoreDirectPayChips payPublic={payPublic} accent={accent} />
        <p className="text-sm leading-7 text-white/75">{copy.waitAr}</p>
        <Link to={STORE_DIRECT_PAY_POLICY_PATH} className="inline-block text-sm underline" style={{ color: accent }}>
          {copy.policyCtaAr}
        </Link>
      </section>
    );
  }

  if (!pay) {
    return (
      <section className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-lg font-extrabold" style={{ color: accent }}>
          {copy.titleAr}
        </h2>
        <StoreDirectPayChips payPublic={payPublic} accent={accent} />
        <p className="text-sm leading-7 text-white/75">{waiting ? copy.waitAr : copy.leadAr}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
      <h2 className="text-lg font-extrabold" style={{ color: accent }}>
        {copy.titleAr}
      </h2>
      <p className="text-sm leading-7 text-white/80">{copy.leadAr}</p>
      {amountSar ? <p className="text-base font-extrabold">المبلغ: {amountSar} ر.س</p> : null}
      {pay.beneficiaryName ? (
        <p className="text-sm leading-7">
          {copy.beneficiaryAr}: {pay.beneficiaryName}
        </p>
      ) : null}
      {pay.enabledIban && pay.bankName ? (
        <p className="text-sm leading-7">
          {copy.bankAr}: {pay.bankName}
        </p>
      ) : null}
      {pay.enabledIban && pay.iban ? (
        <p className="text-sm leading-7" dir="ltr">
          {pay.iban}
        </p>
      ) : null}
      {pay.enabledStc && pay.stcMobile ? (
        <p className="text-sm leading-7" dir="ltr">
          {copy.stcAr}: {pay.stcMobile}
        </p>
      ) : null}
      {pay.enabledSarie && pay.sarieAlias ? (
        <p className="text-sm leading-7" dir="ltr">
          {copy.sarieAr}: {pay.sarieAlias}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copyPay()}
          className="rounded-full px-5 py-2.5 text-sm font-extrabold"
          style={{ background: accent, color: '#061018' }}
        >
          {copy.copyAr}
        </button>
        {pay.enabledExternal && pay.externalUrl ? (
          <a
            href={pay.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border px-5 py-2.5 text-sm font-extrabold"
            style={{ borderColor: accent, color: accent }}
          >
            {copy.openLinkAr}
          </a>
        ) : null}
      </div>
      {pay.cashRemainder ? <p className="text-sm font-bold">{copy.cashAr}</p> : null}
      {pay.networkRemainder ? <p className="text-sm font-bold">{copy.networkAr}</p> : null}
      <p className="text-sm leading-7 text-amber-100/85">{copy.proofHintAr}</p>
      <label className="inline-flex cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold" style={{ background: accent, color: '#061018' }}>
        {copy.proofCtaAr}
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
      {pay.proofUploaded ? <p className="text-sm leading-7 text-white/85">{copy.proofSavedAr}</p> : null}
      <Link to={STORE_DIRECT_PAY_POLICY_PATH} className="block text-sm underline" style={{ color: accent }}>
        {copy.policyCtaAr}
      </Link>
    </section>
  );
}
