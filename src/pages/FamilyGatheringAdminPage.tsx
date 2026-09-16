/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تفويض إدارة تجمع sa1 — أدمن فقط.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAdminDashboardPathFor, getAdminPortalBasePath } from '@/config/adminAuth';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { adminEnsureFamilyGathering, adminMintFamilyHost } from '@/lib/familyGatheringRemote';

type HostRow = {
  id: string;
  email: string;
  labelAr: string;
  hostUrl: string;
  createdAt: string;
};

export default function FamilyGatheringAdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<'loading' | 'ok' | 'denied'>('loading');
  const [bearer, setBearer] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');
  const [sendUrl, setSendUrl] = useState('');
  const [screenUrl, setScreenUrl] = useState('');
  const [ownerHostUrl, setOwnerHostUrl] = useState('');
  const [hosts, setHosts] = useState<HostRow[]>([]);

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
      const sessionEmail = data.session?.user?.email;
      const token = data.session?.access_token || '';
      if (!sessionEmail || !token) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const access = await resolveAdminAccess(sessionEmail);
      if (!access.allowed) {
        if (!cancelled) setPhase('denied');
        return;
      }
      if (cancelled) return;
      setBearer(token);
      setPhase('ok');
      const ensured = await adminEnsureFamilyGathering(token);
      if (ensured.ok) {
        const d = ensured.data;
        setSendUrl(String(d.sendUrl || ''));
        setScreenUrl(String(d.screenUrl || ''));
        setOwnerHostUrl(String(d.ownerHostUrl || ''));
        setHosts(Array.isArray(d.hosts) ? (d.hosts as HostRow[]) : []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onMint() {
    if (!bearer || !email.trim()) return;
    setBusy(true);
    setHint('');
    const result = await adminMintFamilyHost(bearer, email.trim());
    setBusy(false);
    if (!result.ok) {
      setHint(String(result.data.error || 'تعذّر الإرسال'));
      return;
    }
    setHint(result.data.mailed === true ? 'أُرسل رابط الإدارة إلى البريد.' : 'أُنشئ الرابط لكن تعذّر إرسال البريد — انسخ الرابط يدوياً.');
    setEmail('');
    const ensured = await adminEnsureFamilyGathering(bearer);
    if (ensured.ok && Array.isArray(ensured.data.hosts)) {
      setHosts(ensured.data.hosts as HostRow[]);
      setOwnerHostUrl(String(ensured.data.ownerHostUrl || ownerHostUrl));
    } else if (result.data.host && typeof result.data.host === 'object') {
      const host = result.data.host as HostRow;
      setHosts((prev) => [...prev, host]);
    }
  }

  if (phase === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020912] text-slate-300" dir="rtl">
        جاري التحقق…
      </div>
    );
  }

  if (phase !== 'ok') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020912] text-white" dir="rtl">
        <p>يلزم دخول إداري.</p>
        <button
          type="button"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
        >
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020912] px-4 py-8 text-white" dir="rtl" style={{ fontFamily: 'Tajawal, system-ui' }}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-teal-300/80">تجمع عائلي</p>
            <h1 className="mt-1 text-2xl font-black">إدارة sa1 — عائلة السراء</h1>
          </div>
          <Link to={`${getAdminPortalBasePath()}/staff-hub`} className="text-sm text-teal-200 underline">
            مركز الوكلاء
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2 text-sm leading-7">
          <p className="font-extrabold text-teal-200">روابط العائلة (بلا لوحة المنصة)</p>
          <p className="break-all">إرسال: {sendUrl || '/#/sa1'}</p>
          <p className="break-all">الشاشة: {screenUrl || '/#/sa1/screen'}</p>
          <p className="break-all">مضيف صاحب المنصة: {ownerHostUrl || 'يُنشأ عند التفعيل'}</p>
        </section>

        <section className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 space-y-3">
          <h2 className="text-lg font-black text-amber-100">تفويض منظم عبر البريد</h2>
          <p className="text-sm leading-7 text-white/70">
            أدخل بريد المسؤول عن تنظيم التجمع. يُنشأ له رابط إدارة مستقل بالتوازي مع رابطك، ويُرسل على البريد.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            className="h-11 w-full rounded-xl border border-white/15 bg-[#061018] px-3 text-sm"
          />
          <button
            type="button"
            disabled={busy || !email.trim()}
            onClick={() => void onMint()}
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-black text-[#061018] disabled:opacity-50"
          >
            {busy ? 'جاري الإرسال…' : 'إنشاء رابط وإرسال البريد'}
          </button>
          {hint ? <p className="text-sm font-bold text-amber-100">{hint}</p> : null}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black">رموز الإدارة الحالية</h2>
          {hosts.length === 0 ? (
            <p className="text-sm text-white/60">لا مضيفين بعد — افتح الصفحة مجدداً بعد تطبيق ترحيل القاعدة.</p>
          ) : (
            hosts.map((h) => (
              <article key={h.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                <p className="font-extrabold text-teal-100">{h.labelAr || 'مضيف'}</p>
                {h.email ? <p className="mt-1 text-white/70">{h.email}</p> : null}
                <a className="mt-2 inline-block break-all text-amber-200 underline" href={h.hostUrl} target="_blank" rel="noreferrer">
                  {h.hostUrl}
                </a>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
