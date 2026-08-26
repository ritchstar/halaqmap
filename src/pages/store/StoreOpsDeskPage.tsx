/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة إصدار التجارب — مسار داخل بوابة الإدارة.
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StoreTrialOpsBoard } from '@/components/admin/StoreTrialOpsBoard';
import { getAdminDashboardPathFor, getAdminLoginPathFor } from '@/config/adminAuth';
import { STORE_PRODUCT_TRIAL_COPY } from '@/config/storeProductTrial';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getSupabaseClient } from '@/integrations/supabase/client';

export default function StoreOpsDeskPage() {
  useDocumentTitle(STORE_PRODUCT_TRIAL_COPY.opsTitleAr);
  const navigate = useNavigate();
  const location = useLocation();
  const [accessToken, setAccessToken] = useState('');
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const client = getSupabaseClient();
      if (!client) {
        setAuthReady(true);
        return;
      }
      const { data } = await client.auth.getSession();
      if (cancelled) return;
      setAccessToken(data.session?.access_token || '');
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <header className="border-b border-white/8 bg-black/40">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
            className="mb-3 text-sm font-bold text-teal-200"
          >
            لوحة التحكم
          </button>
          <p className="text-xs font-bold tracking-wide text-teal-300">{STORE_PRODUCT_TRIAL_COPY.opsKickerAr}</p>
          <h1 className="mt-1 text-2xl font-black">{STORE_PRODUCT_TRIAL_COPY.opsTitleAr}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-400">{STORE_PRODUCT_TRIAL_COPY.opsLeadAr}</p>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl space-y-8 px-4 py-8 pb-16">
        {!authReady ? <p className="text-sm text-slate-400">جاري التحقق من الجلسة…</p> : null}
        {authReady && !accessToken ? (
          <section className="rounded-2xl border border-amber-300/25 bg-amber-400/5 p-5 text-sm leading-8">
            <p>سجّل الدخول بصفة الإدارة ثم افتح مكتب المتجر.</p>
            <a
              className="mt-3 inline-block font-bold text-teal-200 underline"
              href={`/#${getAdminLoginPathFor(location.pathname)}?next=${encodeURIComponent(location.pathname)}`}
            >
              دخول الإدارة
            </a>
          </section>
        ) : null}
        {accessToken ? <StoreTrialOpsBoard accessToken={accessToken} /> : null}
      </main>
    </div>
  );
}
