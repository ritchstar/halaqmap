/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة وسائل التحويل الموحّدة. تمرير تعليمات، لا تحصيل عبر المنصة.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { STORE_DIRECT_PAY_COPY } from '@/config/storeDirectPay';
import { STORE_DIRECT_PAY_POLICY_PATH } from '@/config/storeDirectPayLegal';
import {
  isDirectEmail,
  isDirectEntityNumber,
  isDirectExternalUrl,
  isDirectIban,
  isDirectMobile,
  normalizeDirectExternalUrl,
  normalizeDirectIban,
  normalizeDirectMobile,
} from '@/lib/storeDirectPay';
import { fetchDirectPay, postDirectPay } from '@/lib/storeDirectPayRemote';

export type DirectPayDesk = {
  bankName: string;
  beneficiaryName: string;
  iban: string;
  stcMobile: string;
  sarieKind: '' | 'mobile' | 'email' | 'entity';
  sarieAlias: string;
  externalUrl: string;
  cashRemainder: boolean;
  networkRemainder: boolean;
  enabledIban: boolean;
  enabledStc: boolean;
  enabledSarie: boolean;
  enabledExternal: boolean;
};

export const EMPTY_DIRECT_PAY_DESK: DirectPayDesk = {
  bankName: '',
  beneficiaryName: '',
  iban: '',
  stcMobile: '',
  sarieKind: '',
  sarieAlias: '',
  externalUrl: '',
  cashRemainder: false,
  networkRemainder: false,
  enabledIban: false,
  enabledStc: false,
  enabledSarie: false,
  enabledExternal: false,
};

function fieldClass(accent: string) {
  return `mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-[#f4efe4] focus:border-[${accent}]`;
}

export function StoreDirectPayDesk({
  product,
  token,
  accent = '#c45c7a',
  onSaved,
}: {
  product: string;
  token: string;
  accent?: string;
  onSaved?: () => void;
}) {
  const copy = STORE_DIRECT_PAY_COPY;
  const [form, setForm] = useState<DirectPayDesk>(EMPTY_DIRECT_PAY_DESK);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchDirectPay({ product, token, role: 'desk' }).then((res) => {
      if (cancelled || !res.ok) return;
      const raw = res.data.payDesk;
      if (!raw || typeof raw !== 'object') return;
      const row = raw as Record<string, unknown>;
      setForm({
        bankName: String(row.bankName || ''),
        beneficiaryName: String(row.beneficiaryName || ''),
        iban: String(row.iban || ''),
        stcMobile: String(row.stcMobile || ''),
        sarieKind:
          row.sarieKind === 'email' || row.sarieKind === 'entity' || row.sarieKind === 'mobile'
            ? row.sarieKind
            : '',
        sarieAlias: String(row.sarieAlias || ''),
        externalUrl: String(row.externalUrl || ''),
        cashRemainder: Boolean(row.cashRemainder),
        networkRemainder: Boolean(row.networkRemainder),
        enabledIban: Boolean(row.enabledIban),
        enabledStc: Boolean(row.enabledStc),
        enabledSarie: Boolean(row.enabledSarie),
        enabledExternal: Boolean(row.enabledExternal),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [product, token]);

  async function save() {
    const iban = normalizeDirectIban(form.iban);
    if (form.enabledIban && iban && !isDirectIban(iban)) {
      toast.error('أدخل آيباناً سعودياً صالحاً.');
      return;
    }
    const stc = normalizeDirectMobile(form.stcMobile);
    if (form.enabledStc && stc && !isDirectMobile(stc)) {
      toast.error('أدخل جوالاً صالحاً لـ STC Bank.');
      return;
    }
    if (form.enabledSarie && form.sarieKind === 'mobile' && !isDirectMobile(form.sarieAlias)) {
      toast.error('معرّف سريع بالجوال غير صالح.');
      return;
    }
    if (form.enabledSarie && form.sarieKind === 'email' && !isDirectEmail(form.sarieAlias)) {
      toast.error('معرّف سريع بالبريد غير صالح.');
      return;
    }
    if (form.enabledSarie && form.sarieKind === 'entity' && !isDirectEntityNumber(form.sarieAlias)) {
      toast.error('أدخل الرقم الموحّد للمنشأة. لا تُستخدم الهوية أو الإقامة.');
      return;
    }
    const externalUrl = normalizeDirectExternalUrl(form.externalUrl);
    if (form.enabledExternal && form.externalUrl.trim() && !isDirectExternalUrl(form.externalUrl)) {
      toast.error('الرابط يجب أن يكون HTTPS على نطاق مزوّد مرخّص.');
      return;
    }
    setBusy(true);
    const res = await postDirectPay({
      action: 'save_pay',
      product,
      token,
      ...form,
      iban,
      stcMobile: stc,
      externalUrl,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(copy.savedAr);
    onSaved?.();
  }

  function toggle<K extends keyof DirectPayDesk>(key: K, value: DirectPayDesk[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
      <h2 className="text-lg font-extrabold" style={{ color: accent }}>
        {copy.titleAr}
      </h2>
      <p className="text-sm leading-7 text-white/75">{copy.leadAr}</p>
      <p className="text-sm leading-7 text-white/70">{copy.deskLeadAr}</p>
      <Link to={STORE_DIRECT_PAY_POLICY_PATH} className="inline-block text-sm underline" style={{ color: accent }}>
        {copy.policyCtaAr}
      </Link>
      <label className="block text-sm">
        {copy.beneficiaryAr}
        <input className={fieldClass(accent)} value={form.beneficiaryName} onChange={(e) => toggle('beneficiaryName', e.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={form.enabledIban} onChange={(e) => toggle('enabledIban', e.target.checked)} />
        {copy.enableIbanAr}
      </label>
      {form.enabledIban ? (
        <>
          <label className="block text-sm">
            {copy.bankAr}
            <input className={fieldClass(accent)} value={form.bankName} onChange={(e) => toggle('bankName', e.target.value)} />
          </label>
          <label className="block text-sm">
            {copy.ibanAr}
            <input className={fieldClass(accent)} dir="ltr" value={form.iban} onChange={(e) => toggle('iban', e.target.value)} autoComplete="off" />
          </label>
        </>
      ) : null}
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={form.enabledStc} onChange={(e) => toggle('enabledStc', e.target.checked)} />
        {copy.enableStcAr}
      </label>
      {form.enabledStc ? (
        <label className="block text-sm">
          {copy.stcMobileAr}
          <input className={fieldClass(accent)} dir="ltr" value={form.stcMobile} onChange={(e) => toggle('stcMobile', e.target.value)} autoComplete="off" />
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={form.enabledSarie} onChange={(e) => toggle('enabledSarie', e.target.checked)} />
        {copy.enableSarieAr}
      </label>
      {form.enabledSarie ? (
        <>
          <label className="block text-sm">
            {copy.sarieKindAr}
            <select
              className={fieldClass(accent)}
              value={form.sarieKind}
              onChange={(e) => toggle('sarieKind', e.target.value as DirectPayDesk['sarieKind'])}
            >
              <option value="">—</option>
              <option value="mobile">{copy.sarieMobileAr}</option>
              <option value="email">{copy.sarieEmailAr}</option>
              <option value="entity">{copy.sarieEntityAr}</option>
            </select>
          </label>
          <label className="block text-sm">
            {copy.sarieAr}
            <input className={fieldClass(accent)} dir="ltr" value={form.sarieAlias} onChange={(e) => toggle('sarieAlias', e.target.value)} autoComplete="off" />
          </label>
        </>
      ) : null}
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={form.enabledExternal} onChange={(e) => toggle('enabledExternal', e.target.checked)} />
        {copy.enableExternalAr}
      </label>
      {form.enabledExternal ? (
        <label className="block text-sm">
          {copy.externalAr}
          <input className={fieldClass(accent)} dir="ltr" value={form.externalUrl} onChange={(e) => toggle('externalUrl', e.target.value)} />
          <span className="mt-1 block text-xs leading-6 text-white/55">{copy.externalHintAr}</span>
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={form.cashRemainder} onChange={(e) => toggle('cashRemainder', e.target.checked)} />
        {copy.cashAr}
      </label>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={form.networkRemainder} onChange={(e) => toggle('networkRemainder', e.target.checked)} />
        {copy.networkAr}
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="rounded-full px-5 py-2.5 text-sm font-extrabold disabled:opacity-60"
        style={{ background: accent, color: '#061018' }}
      >
        {copy.saveAr}
      </button>
    </section>
  );
}
