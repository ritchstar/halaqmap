/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مكتب تشغيل كوافير ماب — صفحة مستقلة متفرعة من لوحة المؤسس.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Mail,
  RefreshCw,
  Sparkles,
  Store,
  ClipboardList,
} from 'lucide-react';
import { CoiffeurBrandMark } from '@/components/coiffeur/CoiffeurBrandMark';
import { getAdminDashboardPathFor } from '@/config/adminAuth';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_INQUIRY_INTENTS,
  COIFFEUR_SATELLITE_HOST,
} from '@/config/coiffeurMapUmbrella';
import { COIFFEUR_INTEREST_ROLES } from '@/config/coiffeurInterestCopy';
import { COIFFEUR_LISTING_SECTOR } from '@/config/coiffeurPartnerSector';
import {
  COIFFEUR_OPS_DESK_INTERNAL_NAME_AR,
  COIFFEUR_OPS_DESK_PARENT_AR,
  COIFFEUR_OPS_TRIAL_STEPS_AR,
  COIFFEUR_TRIAL_SALON,
  coiffeurInquiryPublicUrl,
  coiffeurPartnersPublicUrl,
  coiffeurRegisterTrialUrl,
} from '@/config/coiffeurOpsDesk';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import {
  fetchAdminCoiffeurHub,
  postAdminCoiffeurHub,
  type CoiffeurHubPayload,
  type CoiffeurInterestSignupRow,
  type CoiffeurOpsListingRow,
} from '@/lib/adminCoiffeurHubRemote';
import { upsertBarberFromApprovedRequest } from '@/lib/adminBarbersRemote';
import { loadMergedSubscriptionRequests } from '@/lib/subscriptionRequestStorage';
import { patchRegistrationSubmissionPayloadRemote } from '@/lib/registrationSubmissionsRemote';
import { registrationPostApproveFulfillRemote } from '@/lib/registrationPostApproveFulfillRemote';
import type { SubscriptionRequest } from '@/lib/index';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type AuthPhase = 'loading' | 'ok' | 'denied';
type OpsTab = 'ops' | 'requests' | 'listings' | 'interest';

const SURFACES = [
  {
    id: 'register',
    title: 'نموذج الاشتراك',
    body: 'رخصة برمجية كوافير ماب على www.halaqmap.com. نفس الفورم، سطح نسائي.',
    href: coiffeurRegisterTrialUrl(),
  },
  {
    id: 'partners',
    title: 'مسار المنشآت',
    body: 'هبوط الشركاء ثم التحويل لنموذج الاشتراك.',
    href: coiffeurPartnersPublicUrl(),
  },
  {
    id: 'inquire',
    title: 'الاستعلام النسائي',
    body: 'قطاع معزول عن بحث الرجال. يظهر بعد اعتماد إدراج نشط.',
    href: coiffeurInquiryPublicUrl(),
  },
  {
    id: 'landing',
    title: 'صفحة الهبوط',
    body: 'الاستعلام المجاني للمستعلمة. ليست عقداً ولا تسجيلاً.',
    href: `https://${COIFFEUR_SATELLITE_HOST}/#${ROUTE_PATHS.COIFFEUR_LANDING}`,
  },
] as const;

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

function statusLabel(status: SubscriptionRequest['status']): string {
  if (status === 'approved') return 'معتمد';
  if (status === 'rejected') return 'مرفوض';
  return 'بانتظار الاعتماد';
}

function isCoiffeurRequest(row: SubscriptionRequest): boolean {
  return row.listingSector === COIFFEUR_LISTING_SECTOR;
}

export default function CoiffeurHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [tab, setTab] = useState<OpsTab>('ops');
  const [payload, setPayload] = useState<CoiffeurHubPayload | null>(null);
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeOk, setNoticeOk] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewerEmail, setReviewerEmail] = useState('');

  useDocumentTitle(`${COIFFEUR_OPS_DESK_INTERNAL_NAME_AR} — داخلي`);

  const loadAll = async () => {
    setLoadingRows(true);
    const [hub, allRequests] = await Promise.all([
      fetchAdminCoiffeurHub(),
      loadMergedSubscriptionRequests(),
    ]);
    setPayload(hub);
    setRequests(allRequests.filter(isCoiffeurRequest));
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
        (access.bootstrap ||
          access.permissions.view_overview ||
          access.permissions.view_partner_marketing ||
          access.permissions.view_requests ||
          access.permissions.view_barbers);
      if (!cancelled) {
        setPhase(allowed ? 'ok' : 'denied');
        setCanReview(access.bootstrap || access.permissions.review_requests || access.permissions.manage_barbers);
        setReviewerEmail(access.email);
      }
      if (allowed && !cancelled) await loadAll();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows: CoiffeurInterestSignupRow[] = payload && payload.ok ? payload.rows : [];
  const listings: CoiffeurOpsListingRow[] = payload && payload.ok ? payload.listings ?? [] : [];
  const total = payload && payload.ok ? payload.total : 0;
  const listingTotal = payload && payload.ok ? payload.listingTotal : 0;
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const lastAt = rows[0]?.createdAt ?? '';

  const summary = useMemo(() => {
    if (!payload || payload.ok === false) return 'تعذّر جلب القائمة.';
    if (payload.tableMissing) return 'جدول المهتمات غير مطبّق بعد.';
    if (total === 0) return 'لا تسجيلات اهتمام حتى الآن.';
    return `${total.toLocaleString('ar-SA')} مهتمة مسجّلة.`;
  }, [payload, total]);

  const setFlash = (ok: boolean, text: string) => {
    setNoticeOk(ok);
    setNotice(text);
  };

  const seedTrial = async () => {
    if (!canReview) {
      setFlash(false, 'لا تملك صلاحية زرع إدراج تجريبي.');
      return;
    }
    setBusyId('seed');
    const next = await postAdminCoiffeurHub({ action: 'seed_trial' });
    setBusyId('');
    if (next.ok === false) {
      setFlash(false, next.hint || next.error || 'تعذّر زرع المشغل التجريبي.');
      return;
    }
    setPayload(next);
    const seeded = next.seeded;
    if (seeded?.listingError) {
      setFlash(false, `زُرع المشغل لكن الإدراج لم يُفعَّل: ${seeded.listingError}`);
      return;
    }
    setFlash(
      true,
      seeded
        ? `تم تجهيز المشغل التجريبي. يظهر في استعلام كوافير ماب بعد نجاح الإدراج.`
        : 'تم تحديث المشغل التجريبي.',
    );
  };

  const patchListing = async (
    listing: CoiffeurOpsListingRow,
    patch: { isActive?: boolean; openForCustomers?: boolean },
  ) => {
    if (!canReview) {
      setFlash(false, 'لا تملك صلاحية تعديل الإدراج.');
      return;
    }
    setBusyId(listing.id);
    const next = await postAdminCoiffeurHub({
      action: 'patch_listing',
      barberId: listing.id,
      ...patch,
    });
    setBusyId('');
    if (next.ok === false) {
      setFlash(false, next.error || 'تعذّر تحديث الإدراج.');
      return;
    }
    setPayload(next);
    setFlash(true, 'تم تحديث الإدراج.');
  };

  const approveRequest = async (request: SubscriptionRequest) => {
    if (!canReview) {
      setFlash(false, 'لا تملك صلاحية اعتماد الطلبات.');
      return;
    }
    setBusyId(request.id);
    const upsert = await upsertBarberFromApprovedRequest(request);
    if (!upsert.ok) {
      setBusyId('');
      setFlash(false, upsert.error || 'تعذّر إنشاء الإدراج.');
      return;
    }
    const reviewedAt = new Date().toISOString();
    const patched = await patchRegistrationSubmissionPayloadRemote(request.id, {
      status: 'approved',
      adminAccountState: 'active',
      reviewedAt,
      reviewedBy: reviewerEmail,
      linkedBarberId: upsert.barberId,
      barberMemberNumber: upsert.memberNumber ?? undefined,
    });
    if (!patched.ok) {
      setBusyId('');
      setFlash(false, patched.error || 'تم إنشاء الإدراج وتعذّر تحديث حالة الطلب.');
      return;
    }
    const fulfill = await registrationPostApproveFulfillRemote({
      registrationRequestId: request.id,
      barberId: upsert.barberId,
    });
    setBusyId('');
    await loadAll();
    if (!fulfill.ok) {
      setFlash(false, `اعتُمد الطلب. تعذّر تفعيل الإدراج تلقائياً: ${fulfill.error}`);
      return;
    }
    setFlash(true, `اعتُمد ${request.barberName} في قطاع كوافير ماب.`);
  };

  const rejectRequest = async (request: SubscriptionRequest) => {
    if (!canReview) {
      setFlash(false, 'لا تملك صلاحية رفض الطلبات.');
      return;
    }
    setBusyId(request.id);
    const patched = await patchRegistrationSubmissionPayloadRemote(request.id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerEmail,
      rejectionReason: 'رفض من مكتب تشغيل كوافير ماب',
    });
    setBusyId('');
    if (!patched.ok) {
      setFlash(false, patched.error || 'تعذّر رفض الطلب.');
      return;
    }
    await loadAll();
    setFlash(true, `رُفض طلب ${request.barberName}.`);
  };

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
        <p>يلزم دخول الإدارة لمكتب تشغيل كوافير ماب.</p>
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

  const tabs: { id: OpsTab; label: string }[] = [
    { id: 'ops', label: 'التشغيل' },
    { id: 'requests', label: `الطلبات (${pendingRequests.length})` },
    { id: 'listings', label: `الإدراجات (${listingTotal})` },
    { id: 'interest', label: `المهتمات (${payload?.ok && !payload.tableMissing ? total : 0})` },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#14080e] text-[#f7efe8]" style={{ fontFamily: 'Tajawal, system-ui' }}>
      <header className="sticky top-0 z-30 border-b border-[#f4d4c0]/15 bg-[#14080e]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <CoiffeurBrandMark className="h-12 w-12" sizes="48px" showWordmark={false} />
            <div>
              <h1 className="text-base font-black">{COIFFEUR_OPS_DESK_INTERNAL_NAME_AR}</h1>
              <p className="text-[11px] text-[#f4d4c0]/80">
                اسم داخلي · متفرع من {COIFFEUR_OPS_DESK_PARENT_AR} · {COIFFEUR_BRAND_AR}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#f4d4c0]/25 bg-[#2a1218] px-4 py-2 text-xs font-bold text-[#f4d4c0]"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            لوحة المؤسس
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 pb-3">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                tab === item.id
                  ? 'bg-[#f4d4c0] text-[#2a1218]'
                  : 'border border-[#f4d4c0]/25 text-[#f4d4c0]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8">
        {notice ? (
          <p className={`rounded-xl border px-4 py-3 text-sm ${noticeOk ? 'border-emerald-400/30 text-emerald-100' : 'border-amber-300/30 text-amber-100'}`}>
            {notice}
          </p>
        ) : null}

        {tab === 'ops' ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218] p-4">
                <p className="text-[11px] text-[#f4d4c0]/70">طلبات بانتظار الاعتماد</p>
                <p className="mt-1 text-2xl font-black">{pendingRequests.length.toLocaleString('ar-SA')}</p>
              </div>
              <div className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218] p-4">
                <p className="text-[11px] text-[#f4d4c0]/70">إدراجات كوافير ماب</p>
                <p className="mt-1 text-2xl font-black">
                  {payload?.ok && !payload.listingsMissing ? listingTotal.toLocaleString('ar-SA') : '—'}
                </p>
                {payload?.ok && payload.listingsMissing ? (
                  <p className="mt-1 text-xs text-amber-200">{payload.listingsHint}</p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218] p-4">
                <p className="text-[11px] text-[#f4d4c0]/70">المهتمات</p>
                <p className="mt-1 text-2xl font-black">{payload?.ok && !payload.tableMissing ? total.toLocaleString('ar-SA') : '—'}</p>
                <p className="mt-1 text-xs leading-6 text-[#f7efe8]/80">{summary}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218]/80 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Store className="h-4 w-4 text-[#f4d4c0]" />
                <h2 className="text-sm font-black text-[#f4d4c0]">تجربة تسجيل مشغل نسائي</h2>
              </div>
              <ol className="mb-4 list-decimal space-y-2 pr-5 text-sm leading-7 text-[#f7efe8]/90">
                {COIFFEUR_OPS_TRIAL_STEPS_AR.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2">
                <a
                  href={coiffeurRegisterTrialUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#f4d4c0] px-4 py-2 text-xs font-black text-[#2a1218] no-underline"
                >
                  فتح نموذج الاشتراك
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href={coiffeurInquiryPublicUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#f4d4c0]/30 px-4 py-2 text-xs font-bold text-[#f4d4c0] no-underline"
                >
                  فتح الاستعلام
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => void seedTrial()}
                  disabled={busyId === 'seed'}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/35 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-100 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {busyId === 'seed' ? 'جارٍ الزرع…' : 'زرع مشغل تجريبي جاهز'}
                </button>
              </div>
              <p className="mt-3 text-xs leading-6 text-[#f4d4c0]/70">
                المشغل الجاهز: {COIFFEUR_TRIAL_SALON.name} · الرياض · قطاع `coiffeur_women` · رخصة برمجية برونزي تجريبية.
                لا يدخل بحث الرجال.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-black text-[#f4d4c0]">صفحات السطح</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {SURFACES.map((surface) => (
                  <a
                    key={surface.id}
                    href={surface.href}
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
                      {surface.href}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {tab === 'requests' ? (
          <section className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218]/70 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-[#f4d4c0]">طلبات رخصة برمجية كوافير ماب</h2>
                <p className="mt-1 text-xs leading-6 text-[#f7efe8]/75">
                  طلبات `listingSector = coiffeur_women` فقط. الاعتماد يحفظ القطاع ويمنع ظهور المشغل في بحث الرجال.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadAll()}
                disabled={loadingRows}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#f4d4c0]/30 px-3 py-1.5 text-xs font-bold text-[#f4d4c0] disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingRows ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>
            {requests.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-[#f7efe8]/80">
                <ClipboardList className="h-4 w-4" />
                لا طلبات كوافير بعد. ابدئي من نموذج الاشتراك أعلاه.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[56rem] text-right text-sm">
                  <thead className="text-[11px] text-[#f4d4c0]/70">
                    <tr>
                      <th className="px-2 py-2 font-semibold">الحالة</th>
                      <th className="px-2 py-2 font-semibold">المشغل</th>
                      <th className="px-2 py-2 font-semibold">البريد</th>
                      <th className="px-2 py-2 font-semibold">التصنيفات</th>
                      <th className="px-2 py-2 font-semibold">الوقت</th>
                      <th className="px-2 py-2 font-semibold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((row) => (
                      <tr key={row.id} className="border-t border-[#f4d4c0]/10">
                        <td className="px-2 py-2 align-top">{statusLabel(row.status)}</td>
                        <td className="px-2 py-2 align-top">{row.barberName || '—'}</td>
                        <td className="px-2 py-2 align-top" dir="ltr">
                          {row.email}
                        </td>
                        <td className="px-2 py-2 align-top">{(row.categories ?? []).join(' · ') || '—'}</td>
                        <td className="px-2 py-2 align-top">{formatWhen(row.submittedAt)}</td>
                        <td className="px-2 py-2 align-top">
                          {row.status === 'pending' && canReview ? (
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                disabled={busyId === row.id}
                                onClick={() => void approveRequest(row)}
                                className="rounded-lg bg-emerald-500/20 px-2 py-1 text-[11px] font-bold text-emerald-100 disabled:opacity-50"
                              >
                                اعتماد
                              </button>
                              <button
                                type="button"
                                disabled={busyId === row.id}
                                onClick={() => void rejectRequest(row)}
                                className="rounded-lg bg-rose-500/15 px-2 py-1 text-[11px] font-bold text-rose-100 disabled:opacity-50"
                              >
                                رفض
                              </button>
                            </div>
                          ) : row.linkedBarberId ? (
                            <span className="text-[11px] text-[#f4d4c0]/70" dir="ltr">
                              {row.linkedBarberId.slice(0, 8)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {tab === 'listings' ? (
          <section className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218]/70 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-[#f4d4c0]">إدراجات كوافير ماب</h2>
                <p className="mt-1 text-xs leading-6 text-[#f7efe8]/75">
                  صفوف `barbers.listing_sector = coiffeur_women`. لا تظهر في بحث حلاق ماب للرجال.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadAll()}
                disabled={loadingRows}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#f4d4c0]/30 px-3 py-1.5 text-xs font-bold text-[#f4d4c0] disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingRows ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>
            {payload?.ok && payload.listingsMissing ? (
              <p className="text-sm text-amber-200">{payload.listingsHint}</p>
            ) : listings.length === 0 ? (
              <p className="text-sm text-[#f7efe8]/80">لا إدراجات نسائية بعد. ازرعي مشغلاً تجريبياً أو اعتمدي طلباً.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[56rem] text-right text-sm">
                  <thead className="text-[11px] text-[#f4d4c0]/70">
                    <tr>
                      <th className="px-2 py-2 font-semibold">المشغل</th>
                      <th className="px-2 py-2 font-semibold">البريد</th>
                      <th className="px-2 py-2 font-semibold">الحالة</th>
                      <th className="px-2 py-2 font-semibold">مفتوح</th>
                      <th className="px-2 py-2 font-semibold">المدينة</th>
                      <th className="px-2 py-2 font-semibold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((row) => (
                      <tr key={row.id} className="border-t border-[#f4d4c0]/10">
                        <td className="px-2 py-2 align-top">
                          {row.name}
                          {row.isTrial ? (
                            <span className="ms-2 rounded-md bg-[#f4d4c0]/15 px-1.5 py-0.5 text-[10px] text-[#f4d4c0]">
                              تجريبي
                            </span>
                          ) : null}
                        </td>
                        <td className="px-2 py-2 align-top" dir="ltr">
                          {row.email}
                        </td>
                        <td className="px-2 py-2 align-top">{row.isActive ? 'نشط' : 'موقوف'}</td>
                        <td className="px-2 py-2 align-top">{row.openForCustomers ? 'نعم' : 'لا'}</td>
                        <td className="px-2 py-2 align-top">{row.city || '—'}</td>
                        <td className="px-2 py-2 align-top">
                          {canReview ? (
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                disabled={busyId === row.id}
                                onClick={() => void patchListing(row, { isActive: !row.isActive })}
                                className="rounded-lg border border-[#f4d4c0]/25 px-2 py-1 text-[11px] font-bold text-[#f4d4c0] disabled:opacity-50"
                              >
                                {row.isActive ? 'إيقاف' : 'تفعيل'}
                              </button>
                              <button
                                type="button"
                                disabled={busyId === row.id}
                                onClick={() => void patchListing(row, { openForCustomers: !row.openForCustomers })}
                                className="rounded-lg border border-[#f4d4c0]/25 px-2 py-1 text-[11px] font-bold text-[#f4d4c0] disabled:opacity-50"
                              >
                                {row.openForCustomers ? 'إغلاق للزبائن' : 'فتح للزبائن'}
                              </button>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {tab === 'interest' ? (
          <section className="rounded-2xl border border-[#f4d4c0]/20 bg-[#2a1218]/70 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-[#f4d4c0]">بيانات المهتمات</h2>
                <p className="mt-1 text-xs leading-6 text-[#f7efe8]/75">
                  من جدول <code className="text-[#f4d4c0]">coiffeur_interest_signups</code> عبر مسار الإدارة فقط.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadAll()}
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
            {lastAt ? <p className="mt-3 text-[11px] text-[#f4d4c0]/60">آخر تسجيل: {formatWhen(lastAt)}</p> : null}
          </section>
        ) : null}

        <p className="flex items-center gap-2 text-xs leading-6 text-[#f4d4c0]/70">
          <Sparkles className="h-3.5 w-3.5" />
          التعريف القانوني للرخصة يبقى في السياسات: رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية). على النماذج: رخصة برمجية كوافير ماب.
        </p>
      </main>
    </div>
  );
}
