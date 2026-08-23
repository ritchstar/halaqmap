/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { STORE_AFFILIATE_COPY } from '@/config/storeAffiliateLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { applyStoreAffiliate } from '@/lib/storeAffiliateRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { StoreAffiliatesChrome } from '@/pages/store/StoreAffiliatesChrome';

export default function StoreAffiliatesEnterPage() {
  useDocumentTitle(STORE_AFFILIATE_COPY.applyTitleAr);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [channelPlan, setChannelPlan] = useState('');
  const [experience, setExperience] = useState('');
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (displayName.trim().length < 2) {
      toast.error('الاسم الظاهر مطلوب.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('أدخل إيميلاً صالحاً.');
      return;
    }
    if (phone.trim().length < 9) {
      toast.error('أدخل رقم جوال صالحاً.');
      return;
    }
    if (city.trim().length < 3) {
      toast.error('اكتب المدينة أو النطاق الذي ستسوّق فيه.');
      return;
    }
    if (channelPlan.trim().length < 12) {
      toast.error('اشرح كيف ستسوّق منتجات المتجر.');
      return;
    }
    if (experience.trim().length < 20) {
      toast.error('اشرح خبرتك أو استعدادك بجملة أوضح.');
      return;
    }
    if (!acceptedRules) {
      toast.error('يجب الموافقة على وثيقة القواعد.');
      return;
    }
    setBusy(true);
    const result = await applyStoreAffiliate({
      displayName,
      email,
      phone,
      city,
      channelPlan,
      experience,
      acceptedRules,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(typeof result.error === 'string' ? result.error : 'تعذر حفظ الطلب.');
      return;
    }
    if (result.status === 'approved') {
      toast.message(STORE_AFFILIATE_COPY.alreadyApprovedAr);
      navigate(ROUTE_PATHS.STORE_AFFILIATES_DESK);
      return;
    }
    toast.success(STORE_AFFILIATE_COPY.applySentAr);
    navigate(ROUTE_PATHS.STORE_AFFILIATES);
  }

  return (
    <StoreAffiliatesChrome>
      <div className="text-center">
        <h1 className="text-3xl font-black text-white">{STORE_AFFILIATE_COPY.applyTitleAr}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">{STORE_AFFILIATE_COPY.reviewLeadAr}</p>
      </div>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-5 rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-6">
        <label className="block text-sm text-slate-200">
          {STORE_AFFILIATE_COPY.nameLabelAr}
          <input
            className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={80}
          />
        </label>
        <label className="block text-sm text-slate-200">
          {STORE_AFFILIATE_COPY.emailLabelAr}
          <input
            className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]"
            dir="ltr"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={180}
          />
        </label>
        <label className="block text-sm text-slate-200">
          {STORE_AFFILIATE_COPY.phoneLabelAr}
          <input
            className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]"
            dir="ltr"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            maxLength={20}
          />
        </label>
        <label className="block text-sm text-slate-200">
          {STORE_AFFILIATE_COPY.cityLabelAr}
          <input
            className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            maxLength={120}
          />
        </label>
        <label className="block text-sm text-slate-200">
          {STORE_AFFILIATE_COPY.channelLabelAr}
          <textarea
            className="mt-1 min-h-[5rem] w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-base text-[#f4efe4]"
            value={channelPlan}
            onChange={(event) => setChannelPlan(event.target.value)}
            maxLength={400}
          />
        </label>
        <label className="block text-sm text-slate-200">
          {STORE_AFFILIATE_COPY.experienceLabelAr}
          <textarea
            className="mt-1 min-h-[6rem] w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-base text-[#f4efe4]"
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            maxLength={600}
          />
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-teal-400/25 bg-teal-500/5 p-4 text-sm leading-relaxed text-slate-200">
          <input
            type="checkbox"
            className="mt-1"
            checked={acceptedRules}
            onChange={(event) => setAcceptedRules(event.target.checked)}
          />
          <span>
            {STORE_AFFILIATE_COPY.rulesAcceptAr}{' '}
            <Link to={ROUTE_PATHS.STORE_AFFILIATES_RULES} className="font-semibold text-teal-300 underline">
              {STORE_AFFILIATE_COPY.homeRulesCtaAr}
            </Link>
          </span>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-black hover:bg-teal-400 disabled:opacity-60"
        >
          {busy ? 'جاري الإرسال…' : STORE_AFFILIATE_COPY.applyCtaAr}
        </button>
      </form>
    </StoreAffiliatesChrome>
  );
}
