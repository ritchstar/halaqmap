/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مركز موافقات إبراز فزعة — دعوة بريد رسمي ومتابعة الحالة.
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { getAdminDashboardPathFor } from '@/config/adminAuth';
import { PLATFORM_COVERED_CITIES } from '@/config/platformCoveredCities';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import {
  fetchAdminFazaaListing,
  postAdminFazaaListing,
  type FazaaListingAdminPayload,
  type FazaaListingCandidate,
} from '@/lib/adminFazaaListingRemote';
import { inferFazaaInviteScope } from '@/lib/fazaaListingInvitePrefill';

type AuthPhase = 'loading' | 'ok' | 'denied';

const STATUS_AR: Record<string, string> = {
  pending: 'بانتظار الموافقة',
  accepted: 'موافق',
  declined: 'مرفوض',
  revoked: 'مسحوب',
  expired: 'منتهٍ',
};

const INVITE_ERROR_AR: Record<string, string> = {
  invalid_city: 'اختر المدينة من القائمة. رمز المدينة الإنجليزي مطلوب، والعنوان لا يُعد مدينة.',
  invalid_city_name: 'اسم المدينة يجب أن يكون مثل الرياض أو جدة، لا عنوان الحي أو الشارع.',
  invalid_area: 'اكتب وصف النطاق مثل حي المونسية وقرطبة.',
  invalid_neighborhoods: 'أدخل رموز الأحياء بالإنجليزي مثل munsiyah,qurtubah.',
  invalid_barber: 'اختر صالوناً من نتائج البحث أولاً.',
  barber_not_eligible: 'هذا الصالون غير مؤهل للإبراز (ذهبي أو ماسي ونشط).',
  barber_email_missing: 'لا يوجد بريد مسجّل لهذا الصالون، لذلك لا يمكن إرسال الدعوة.',
  already_accepted: 'هذا الصالون وافق مسبقاً.',
  resend_not_configured: 'بريد الإرسال غير مُعد على الخادم. لم تُرسل رسالة ولم يُحفظ سجل.',
  insert_failed: 'تعذّر حفظ الدعوة في القاعدة.',
  not_signed_in: 'انتهت الجلسة. ادخل مرة أخرى.',
  network_error: 'تعذّر الاتصال بالخادم.',
};

function explainInviteError(code: string): string {
  return INVITE_ERROR_AR[code] || `تعذّر الإرسال: ${code}`;
}

function formatWhen(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function FazaaListingAdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [payload, setPayload] = useState<FazaaListingAdminPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeOk, setNoticeOk] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FazaaListingCandidate | null>(null);
  const [citySlug, setCitySlug] = useState('');
  const [cityNameAr, setCityNameAr] = useState('');
  const [neighborhoods, setNeighborhoods] = useState('');
  const [areaLabelAr, setAreaLabelAr] = useState('');

  const load = async (q = query) => {
    setBusy(true);
    const next = await fetchAdminFazaaListing(q);
    setPayload(next);
    setBusy(false);
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const client = getSupabaseClient();
      if (!client) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const { data } = await client.auth.getSession();
      const email = data.session?.user?.email;
      if (!email) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const access = await resolveAdminAccess(email);
      const allowed =
        access.allowed &&
        (access.bootstrap || access.permissions.view_overview || access.permissions.view_partner_marketing);
      if (!cancelled) setPhase(allowed ? 'ok' : 'denied');
      if (allowed && !cancelled) await load('');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCity = (slug: string) => {
    const city = PLATFORM_COVERED_CITIES.find((item) => item.id === slug);
    setCitySlug(slug);
    setCityNameAr(city?.nameAr || '');
  };

  const selectCandidate = (candidate: FazaaListingCandidate) => {
    setSelected(candidate);
    const hint = inferFazaaInviteScope(candidate.city);
    applyCity(hint.citySlug);
    if (hint.neighborhoodSlugs.length) setNeighborhoods(hint.neighborhoodSlugs.join(','));
    if (hint.areaLabelAr) setAreaLabelAr(hint.areaLabelAr);
  };

  const invite = async () => {
    if (!selected) {
      setNoticeOk(false);
      setNotice('اختر صالوناً أولاً.');
      return;
    }
    if (!selected.email || !selected.email.includes('@')) {
      setNoticeOk(false);
      setNotice(explainInviteError('barber_email_missing'));
      return;
    }
    if (!citySlug) {
      setNoticeOk(false);
      setNotice(explainInviteError('invalid_city'));
      return;
    }
    setBusy(true);
    const res = await postAdminFazaaListing({
      action: 'invite',
      barberId: selected.id,
      citySlug,
      cityNameAr,
      neighborhoodSlugs: neighborhoods,
      areaLabelAr,
    });
    setBusy(false);
    setNoticeOk(res.ok);
    setNotice(
      res.ok
        ? `أُرسلت الرسالة الرسمية إلى ${selected.email}. تظهر في السجل أدناه بحالة بانتظار الموافقة.`
        : `${explainInviteError(res.error)} لم تُرسل رسالة ولم يُحفظ شيء في السجل.`,
    );
    if (res.ok) await load();
  };

  const act = async (action: 'resend' | 'revoke', id: string) => {
    setBusy(true);
    const res = await postAdminFazaaListing({ action, id });
    setBusy(false);
    setNoticeOk(res.ok);
    setNotice(res.ok ? 'تم التحديث.' : explainInviteError(res.error));
    if (res.ok) await load();
  };

  if (phase === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#061223] text-teal-100">
        جاري التحقق من الصلاحيات…
      </div>
    );
  }

  if (phase !== 'ok') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#061223] text-slate-100" dir="rtl">
        <p>يلزم دخول الإدارة لمركز موافقات فزعة.</p>
        <button
          type="button"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
          className="rounded-xl border border-teal-400/30 px-5 py-2 text-sm"
        >
          العودة
        </button>
      </div>
    );
  }

  const consents = payload && payload.ok ? payload.consents : [];
  const candidates = payload && payload.ok ? payload.candidates : [];
  const tableMissing = payload && payload.ok ? payload.tableMissing : false;

  return (
    <div dir="rtl" className="min-h-screen bg-[#061223] text-slate-100" style={{ fontFamily: 'Tajawal, system-ui' }}>
      <header className="border-b border-teal-400/20 px-5 py-4">
        <button
          type="button"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
          className="mb-3 inline-flex items-center gap-1 text-sm text-teal-200"
        >
          <ArrowRight className="h-4 w-4" />
          لوحة التحكم
        </button>
        <h1 className="flex items-center gap-2 text-2xl font-black">
          <ShieldCheck className="h-6 w-6 text-teal-300" />
          موافقات إبراز فزعة
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
          لا يُنشر اسم صالون ولا بنره على صفحات فزعة العامة إلا بعد رسالة رسمية وموافقة صريحة من الرابط.
          بعد الموافقة يظهر الإبراز في التوليد التالي للصفحات الثابتة.
        </p>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-5 py-8">
        {tableMissing ? (
          <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm">
            طبّق الهجرة `160_fazaa_seo_listing_consents.sql` على القاعدة أولاً.
          </p>
        ) : null}
        {payload && !payload.ok ? (
          <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            تعذّر تحميل السجل: {explainInviteError(payload.error)}
          </p>
        ) : null}
        {notice ? (
          <p
            className={`rounded-xl border px-4 py-3 text-sm ${
              noticeOk
                ? 'border-teal-400/40 bg-teal-500/10 text-teal-50'
                : 'border-amber-400/40 bg-amber-500/10 text-amber-50'
            }`}
          >
            {notice}
          </p>
        ) : null}

        <section className="rounded-2xl border border-teal-400/25 bg-[#0c1a2e] p-5">
          <h2 className="text-lg font-black">إرسال دعوة رسمية</h2>
          <div className="mt-4 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالاسم أو البريد"
              className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#061223] px-3 text-sm"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void load(query)}
              className="rounded-xl border border-teal-400/40 px-4 text-sm"
            >
              بحث
            </button>
          </div>
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm">
            {candidates.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => selectCandidate(c)}
                  className={`w-full rounded-lg px-3 py-2 text-right ${selected?.id === c.id ? 'bg-teal-500/20' : 'hover:bg-white/5'}`}
                >
                  {c.name} · {c.tier} · {c.city || 'بدون مدينة'} {c.hasBanner ? '· بنر جاهز' : '· بلا بنر'}
                </button>
              </li>
            ))}
          </ul>
          {selected ? (
            <p className="mt-3 text-sm text-slate-300">
              الوجهة: <span className="font-bold text-teal-100">{selected.name}</span>
              {' · '}
              <span dir="ltr">{selected.email || 'لا يوجد بريد'}</span>
            </p>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              المدينة
              <select
                value={citySlug}
                onChange={(e) => applyCity(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#061223] px-3"
              >
                <option value="">اختر المدينة</option>
                {PLATFORM_COVERED_CITIES.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.nameAr}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              اسم المدينة في الرسالة
              <input value={cityNameAr} readOnly className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#061223] px-3 text-slate-300" />
            </label>
            <label className="text-sm">
              رموز الأحياء
              <input value={neighborhoods} onChange={(e) => setNeighborhoods(e.target.value)} placeholder="munsiyah,qurtubah" className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#061223] px-3" dir="ltr" />
            </label>
            <label className="text-sm">
              وصف النطاق
              <input value={areaLabelAr} onChange={(e) => setAreaLabelAr(e.target.value)} placeholder="حي المونسية وقرطبة" className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#061223] px-3" />
            </label>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void invite()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-black text-[#041016]"
          >
            <Mail className="h-4 w-4" />
            إرسال الرسالة الرسمية
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0c1a2e] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black">سجل الدعوات</h2>
            <button type="button" disabled={busy} onClick={() => void load()} className="inline-flex items-center gap-1 text-sm text-teal-200">
              <RefreshCw className="h-4 w-4" />
              تحديث
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="text-teal-100">
                <tr>
                  <th className="px-2 py-2 text-start">الصالون</th>
                  <th className="px-2 py-2 text-start">الحالة</th>
                  <th className="px-2 py-2 text-start">النطاق</th>
                  <th className="px-2 py-2 text-start">التاريخ</th>
                  <th className="px-2 py-2 text-start">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {consents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-8 text-center text-slate-400">
                      لا توجد دعوات مسجّلة. الإرسال الفاشل لا يصل للصالون ولا يظهر هنا.
                    </td>
                  </tr>
                ) : null}
                {consents.map((row) => (
                  <tr key={row.id} className="border-t border-white/10">
                    <td className="px-2 py-2">
                      <p className="font-bold">{row.salonName}</p>
                      <p className="text-xs text-slate-400" dir="ltr">{row.emailTo}</p>
                    </td>
                    <td className="px-2 py-2">{STATUS_AR[row.status] || row.status}</td>
                    <td className="px-2 py-2">{row.areaLabelAr} · {row.cityNameAr}</td>
                    <td className="px-2 py-2 text-xs">{formatWhen(row.acceptedAt || row.emailSentAt || row.createdAt)}</td>
                    <td className="px-2 py-2">
                      {row.status === 'pending' ? (
                        <button type="button" className="text-teal-200 underline" onClick={() => void act('resend', row.id)}>
                          إعادة إرسال
                        </button>
                      ) : null}
                      {row.status === 'pending' || row.status === 'accepted' ? (
                        <button type="button" className="ms-3 text-amber-200 underline" onClick={() => void act('revoke', row.id)}>
                          سحب
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
