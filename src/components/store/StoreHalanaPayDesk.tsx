/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * وسائل تحويل حلانا1 من اللوحة. تمرير تعليمات، لا تحصيل عبر المنصة.
 */
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { STORE_HALANA_LIVE_COPY } from '@/config/storeHalanaLive';
import { isHalanaIban, normalizeHalanaIban } from '@/lib/storeHalanaPay';
import { postHalanaAction } from '@/lib/storeHalanaLiveRemote';

export type HalanaPayDesk = {
  bankName: string;
  beneficiaryName: string;
  iban: string;
  cashRemainder: boolean;
  networkRemainder: boolean;
};

export function StoreHalanaPayDesk({
  token,
  initial,
  onSaved,
}: {
  token: string;
  initial: HalanaPayDesk;
  onSaved: () => void;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const [bankName, setBankName] = useState(initial.bankName);
  const [beneficiaryName, setBeneficiaryName] = useState(initial.beneficiaryName);
  const [iban, setIban] = useState(initial.iban);
  const [cashRemainder, setCashRemainder] = useState(initial.cashRemainder);
  const [networkRemainder, setNetworkRemainder] = useState(initial.networkRemainder);
  const [busy, setBusy] = useState(false);

  async function save() {
    const nextIban = normalizeHalanaIban(iban);
    if (nextIban && !isHalanaIban(nextIban)) {
      toast.error('أدخلي آيباناً سعودياً صالحاً.');
      return;
    }
    setBusy(true);
    const res = await postHalanaAction({
      action: 'save_pay',
      token,
      bankName,
      beneficiaryName,
      iban: nextIban,
      cashRemainder,
      networkRemainder,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(copy.paySavedAr);
    onSaved();
  }

  return (
    <section className="halana-form-card space-y-4 rounded-2xl p-5">
      <h2 className="halana-title-sm">{copy.payDeskTitleAr}</h2>
      <p className="text-base leading-8 text-[#ffe8c4]/80">{copy.payDeskLeadAr}</p>
      <p className="text-sm leading-7 text-[#ffe8c4]/75">{copy.payLeadAr}</p>
      <label className="halana-field-shell block">
        {copy.payBankAr}
        <input className="halana-field" value={bankName} onChange={(event) => setBankName(event.target.value)} />
      </label>
      <label className="halana-field-shell block">
        {copy.payBeneficiaryAr}
        <input
          className="halana-field"
          value={beneficiaryName}
          onChange={(event) => setBeneficiaryName(event.target.value)}
        />
      </label>
      <label className="halana-field-shell block">
        {copy.payIbanAr}
        <input
          className="halana-field"
          dir="ltr"
          value={iban}
          onChange={(event) => setIban(event.target.value)}
          autoComplete="off"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-[#ffe8c4]">
        <input type="checkbox" checked={cashRemainder} onChange={(event) => setCashRemainder(event.target.checked)} />
        {copy.payCashAr}
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-[#ffe8c4]">
        <input
          type="checkbox"
          checked={networkRemainder}
          onChange={(event) => setNetworkRemainder(event.target.checked)}
        />
        {copy.payNetworkAr}
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="halana-action rounded-full px-5 py-2.5 text-sm font-extrabold disabled:opacity-60"
      >
        {copy.paySaveAr}
      </button>
    </section>
  );
}
