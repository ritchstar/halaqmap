/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مركز كوافير ماب — مرتكز المؤسس لمراقبة الهبوط والاهتمام وبيانات المهتمات.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Mail, RefreshCw, Sparkles } from 'lucide-react';
import { CoiffeurBrandMark } from '@/components/coiffeur/CoiffeurBrandMark';
import { getAdminDashboardPathFor } from '@/config/adminAuth';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_INQUIRY_INTENTS,
  COIFFEUR_SATELLITE_HOST,
} from '@/config/coiffeurMapUmbrella';
import { COIFFEUR_INTEREST_ROLES } from '@/config/coiffeurInterestCopy';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import {
  fetchAdminCoiffeurHub,
  type CoiffeurHubPayload,
  type CoiffeurInterestSignupRow,
} from '@/lib/adminCoiffeurHubRemote';

type AuthPhase = 'loading' | 'ok' | 'denied';

const SURFACES = [
  {
    id: 'landing',
    title: 'صفحة الهبوط',
    body: 'الاستعلام المجاني للمستعلمة. ليست عقداً ولا تسجيلاً.',
    path: ROUTE_PATHS.COIFFEUR_LANDING,
  },
  {
    id: 'interest',
    title: 'تسجيل الاهتمام',
    body: 'بريد وتحديثات وكروت. هنا مكتب ود للشرح فقط.',
    path: ROUTE_PATHS.COIFFEUR_INTEREST,
  },
  {
    id: 'cards',
    title: 'استوديو الكروت',
    body: 'بطاقات اسم وصفة للمشاركة. الضغط يدخل المنصة.',
    path: ROUTE_PATHS.COIFFEUR_CARD_STUDIO,
  },
  {
    id: 'inquire',
    title: 'الاستعلام',
    body: 'قطاع نسائي معزول عن بحث الرجال. قد يكون فارغاً حتى أول تسكين.',
    path: ROUTE_PATHS.COIFFEUR_INQUIRE,
  },
  {
    id: 'partners',
    title: 'مسار المنشآت',
    body: 'تحويل لاحق. لا عقود مفتوحة من ود.',
    path: ROUTE_PATHS.COIFFEUR_PARTNERS,
  },
] as const;

function publicPageUrl(path: string): string {
  return `https://${COIFFEUR_SATELLITE_HOST}/#${path}`;
}

function roleLabel(id: string): string {
  return COIFFEUR_INTEREST_ROLES.find((r) => r.id === id)?.label || id || '—';
}

function intentLabel(id: string): string {
  return COIFFEUR_INQUIRY_INTENTS.find((i) => i.id === id)?.label || id || '—';
}

function formatWhen(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function CoiffeurHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [payload, setPayload] = useState<CoiffeurHubPayload | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);

  const loadRows = async () => {
    setLoadingRows(true);
    const next = await fetchAdminCoiffeurHub();
    setPayload(next);
    setLoadingRows(false);
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
      if (allowed && !cancelled) await loadRows();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows: CoiffeurInterestSignupRow[] = payload && payload.ok ? payload.rows : [];
  const total = payload && payload.ok ? payload.total : 0;
  const lastAt = rows[0]?.createdAt ?? '';

  const summary = useMemo(() => {
    if (!payload || payload.ok === false) return 'تعذّر جلب القائمة.';
    if (payload.tableMissing) return 'الجدول غير مطبّق بعد في القاعدة.';
    if (total === 0) return 'لا تسجيلات اهتمام حتى الآن.';
    return `${total.toLocaleString('ar-SA')} مهتمة مسجّلة.`;
  }, [payload, total]);

  if (phase === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#14080e] text-[#f4d4c0]">
        جاري التحقق من الصلاحيات…
      </div>
    );
  }

  if (phase !== 'ok') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#14080e] text-[#f7efe8]" dir="rtl">
        <p>يلزم دخول الإدارة لمركز كوافير ماب.</p>
        <button
          type="button"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
          className="rounded-xl border border-[#f4d4c0]/30 px-5 py-2 text-sm"
        >
          العودة
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#14080e] text-[#f7efe8]" style={{ fontFamily: 'Tajawal, system-ui' }}>
      <header className="sticky top-0 z-30 border-b border-[#f4d4c0]/15 bg-[#14080e]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <CoiffeurBrandMark className="h-12 w-12" sizes="48px" showWordmark={false} />
            <div>
              <h1 className="text-base font-black">{COIFFEUR_BRAND_AR}</h1>
              <p className="text-[11px] text-[#f4d4c0]/80">مركز المراقبة — هبوط · اهتمام · مهتمات</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#f4d4c0]/25 bg-[#2a1218] px-4 py-2 text-xs font-bold text-[#f4d4c0]"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            لوحة التحكم
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218] p-4">
            <p className="text-[11px] text-[#f4d4c0]/70">المهتمات</p>
            <p className="mt-1 text-2xl font-black">{payload?.ok && !payload.tableMissing ? total.toLocaleString('ar-SA') : '—'}</p>
            <p className="mt-1 text-xs leading-6 text-[#f7efe8]/80">{summary}</p>
          </div>
          <div className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218] p-4">
            <p className="text-[11px] text-[#f4d4c0]/70">آخر تسجيل</p>
            <p className="mt-1 text-sm font-bold">{lastAt ? formatWhen(lastAt) : 'لا يوجد بعد'}</p>
          </div>
          <div className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218] p-4">
            <p className="text-[11px] text-[#f4d4c0]/70">ود</p>
            <p className="mt-1 text-sm leading-7">وكيلة استعلام على صفحة الاهتمام فقط. لا عقود.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-black text-[#f4d4c0]">صفحات السطح</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {SURFACES.map((surface) => (
              <a
                key={surface.id}
                href={publicPageUrl(surface.path)}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218]/80 p-4 no-underline transition hover:border-[#f4d4c0]/45"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-black text-[#f7efe8]">{surface.title}</p>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[#f4d4c0]" />
                </div>
                <p className="mt-2 text-sm leading-7 text-[#f7efe8]/85">{surface.body}</p>
                <p className="mt-2 text-[11px] text-[#f4d4c0]/70" dir="ltr">
                  {publicPageUrl(surface.path)}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218]/70 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-[#f4d4c0]">بيانات المهتمات</h2>
              <p className="mt-1 text-xs leading-6 text-[#f7efe8]/75">
                من جدول <code className="text-[#f4d4c0]">coiffeur_interest_signups</code> عبر مسار الإدارة فقط. لا تُعرض في الواجهة العامة.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadRows()}
              disabled={loadingRows}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#f4d4c0]/30 px-3 py-1.5 text-xs font-bold text-[#f4d4c0] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingRows ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>

          {payload && payload.ok === false ? (
            <p className="text-sm text-amber-200">تعذّر التحميل. أعيدي الدخول إن لزم.</p>
          ) : payload && payload.ok && payload.tableMissing ? (
            <p className="text-sm text-amber-200">{payload.hint || 'طبّقي هجرة المهتمات على القاعدة.'}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-[#f7efe8]/80">لا صفوف بعد. العدد الحقيقي صفر.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] text-right text-sm">
                <thead className="text-[11px] text-[#f4d4c0]/70">
                  <tr>
                    <th className="px-2 py-2 font-semibold">الوقت</th>
                    <th className="px-2 py-2 font-semibold">البريد</th>
                    <th className="px-2 py-2 font-semibold">الاسم</th>
                    <th className="px-2 py-2 font-semibold">الصفة</th>
                    <th className="px-2 py-2 font-semibold">الفئة</th>
                    <th className="px-2 py-2 font-semibold">المصدر</th>
                    <th className="px-2 py-2 font-semibold">الجوال</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-[#f4d4c0]/10">
                      <td className="px-2 py-2 align-top text-[#f7efe8]/85">{formatWhen(row.createdAt)}</td>
                      <td className="px-2 py-2 align-top">
                        <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1 text-[#f4d4c0] no-underline">
                          <Mail className="h-3.5 w-3.5" />
                          <span dir="ltr">{row.email}</span>
                        </a>
                      </td>
                      <td className="px-2 py-2 align-top">{row.displayName || '—'}</td>
                      <td className="px-2 py-2 align-top">{roleLabel(row.role)}</td>
                      <td className="px-2 py-2 align-top">{intentLabel(row.intentId)}</td>
                      <td className="px-2 py-2 align-top" dir="ltr">
                        {row.source || '—'}
                      </td>
                      <td className="px-2 py-2 align-top" dir="ltr">
                        {row.phone || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="flex items-center gap-2 text-xs leading-6 text-[#f4d4c0]/70">
          <Sparkles className="h-3.5 w-3.5" />
          لا تُختلق أعداد زيارات للهبوط هنا. المصدر الوحيد للمهتمات هو الجدول أعلاه.
        </p>
      </main>
    </div>
  );
}
