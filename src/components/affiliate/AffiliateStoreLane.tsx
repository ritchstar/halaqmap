/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كتالوج عمولة منتجات المتجر وطلب رابط الدخول.
 */
import { useState, type FormEvent } from 'react';
import { toast } from '@/components/ui/sonner';
import {
  STORE_AFFILIATE_COPY,
  STORE_AFFILIATE_LINES,
  affiliateNetSar,
} from '@/config/storeAffiliateLive';

export function AffiliateStoreLane() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('أدخل إيميلاً صالحاً لإرسال رابط الدخول.');
      return;
    }
    setBusy(true);
    setBusy(false);
    toast.message(STORE_AFFILIATE_COPY.storeLoginHintAr);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-8 text-slate-300">{STORE_AFFILIATE_COPY.storeLeadAr}</p>
      <ul className="space-y-3">
        {STORE_AFFILIATE_LINES.map((line) => (
          <li
            key={line.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
          >
            <p className="text-base font-extrabold text-white">
              {line.titleAr}
              <span className="mr-2 text-sm font-bold text-teal-200/80">{line.packAr}</span>
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {STORE_AFFILIATE_COPY.priceLabelAr}: {line.priceSar} ر.س
              {' · '}
              {STORE_AFFILIATE_COPY.commissionLabelAr}: {line.commissionSar} ر.س
              {' · '}
              {STORE_AFFILIATE_COPY.netLabelAr}: {affiliateNetSar(line.priceSar, line.commissionSar)} ر.س
            </p>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="space-y-3 rounded-2xl border border-teal-400/25 bg-teal-500/5 p-5"
      >
        <p className="text-base font-extrabold text-white">{STORE_AFFILIATE_COPY.storeLoginTitleAr}</p>
        <p className="text-sm leading-7 text-slate-300">{STORE_AFFILIATE_COPY.storeLoginLeadAr}</p>
        <label className="block text-sm text-slate-200">
          الإيميل
          <input
            className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]"
            dir="ltr"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={STORE_AFFILIATE_COPY.storeLoginPlaceholderAr}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-black hover:bg-teal-400 disabled:opacity-60"
        >
          {STORE_AFFILIATE_COPY.storeLoginCtaAr}
        </button>
        <p className="text-xs leading-6 text-slate-500">{STORE_AFFILIATE_COPY.storeLoginHintAr}</p>
      </form>
    </div>
  );
}
