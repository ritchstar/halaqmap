import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import { partnerSalonDisplayName } from '@/config/partnerDashboardBrand';
import type { BarberPortalInclusiveCareSnapshot } from '@/lib/barberInclusiveCareRemote';
import type { SalonMemberRole } from '@/lib/barberPortalLoginRemote';
import {
  buildBarberLoginUrl,
  persistBarberAuthSession,
  resolveSafePartnerRedirect,
} from '@/lib/barberPortalSession';
import { barberOwnerWatchHashPath } from '@/lib/ownerSalonWatchLinks';
import { toast } from 'sonner';

const MAGIC_ENDPOINT = String(import.meta.env.VITE_BARBER_PORTAL_MAGIC_CONSUME_URL || '/api/barber-portal-magic-consume').trim();

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

function tierFromDb(t: string | null | undefined): SubscriptionTier {
  const v = String(t || '').toLowerCase();
  if (v === 'gold') return SubscriptionTier.GOLD;
  if (v === 'diamond') return SubscriptionTier.DIAMOND;
  return SubscriptionTier.BRONZE;
}

function loginFallbackPath(params: URLSearchParams): string {
  return params.get('next')?.trim() === 'watch'
    ? barberOwnerWatchHashPath()
    : ROUTE_PATHS.BARBER_DASHBOARD;
}

function readMagicToken(params: URLSearchParams): string {
  const direct = params.get('m')?.trim();
  if (direct) return direct;
  if (typeof window === 'undefined') return '';
  try {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const q = hash.indexOf('?');
    if (q >= 0) {
      return new URLSearchParams(hash.slice(q + 1)).get('m')?.trim() || '';
    }
  } catch {
    /* ignore */
  }
  return '';
}

export default function BarberPortalEnter() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ran = useRef(false);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = readMagicToken(params);
    const loginFallback = buildBarberLoginUrl(loginFallbackPath(params));
    if (!token) {
      setBusy(false);
      toast.error('رابط الدخول غير صالح (ناقص الرمز).');
      navigate(loginFallback, { replace: true });
      return;
    }

    void (async () => {
      try {
        const response = await fetch(MAGIC_ENDPOINT, {
          method: 'POST',
          credentials: 'same-origin',
          headers: baseHeaders(),
          body: JSON.stringify({ token }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
          barber_session_token?: string | null;
          salon_role?: SalonMemberRole | null;
          barber?: {
            id: string;
            name: string;
            email: string;
            phone: string;
            tier: string;
            rating_invite_token?: string;
            member_number?: number | null;
            inclusiveCare?: BarberPortalInclusiveCareSnapshot;
          };
        };

        if (!response.ok) {
          setBusy(false);
          const code = String(payload.code ?? '').trim();
          if (code === 'magic_already_used' || code === 'expired') {
            toast.error(
              payload.error ||
                'انتهت صلاحية الرابط أو استُخدم مسبقاً. افتح أحدث بريد تفعيل أو سجّل الدخول يدوياً.',
            );
          } else {
            toast.error(payload.error || 'تعذر تسجيل الدخول عبر الرابط.');
          }
          navigate(loginFallback, { replace: true });
          return;
        }

        const b = payload.barber;
        if (!b?.id) {
          setBusy(false);
          toast.error('استجابة غير صالحة من الخادم.');
          navigate(loginFallback, { replace: true });
          return;
        }

        const mn = b.member_number;
        const memberNumber =
          mn != null && Number.isFinite(Number(mn)) ? Math.floor(Number(mn)) : null;
        const barberSessionToken = String(payload.barber_session_token ?? '').trim();

        persistBarberAuthSession({
          id: b.id,
          name: b.name,
          email: b.email,
          phone: b.phone || '',
          subscription: tierFromDb(b.tier),
          ratingInviteToken: String(b.rating_invite_token ?? ''),
          memberNumber,
          inclusiveCare: b.inclusiveCare,
          barberSessionToken,
          salonRole:
            payload.salon_role === 'owner' || payload.salon_role === 'operator'
              ? payload.salon_role
              : null,
        });
        toast.success(`مرحباً ${partnerSalonDisplayName({ name: b.name, email: b.email })}`);
        const nextRaw = params.get('next')?.trim();
        const destination =
          nextRaw === 'watch'
            ? barberOwnerWatchHashPath()
            : resolveSafePartnerRedirect(nextRaw);
        navigate(destination, { replace: true });
      } catch {
        setBusy(false);
        toast.error('تعذر الاتصال بالخادم. جرّب فتح الرابط في متصفح خارج تطبيق البريد.');
        navigate(loginFallback, { replace: true });
      }
    })();
  }, [navigate, params]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 overflow-x-hidden bg-background p-6" dir="rtl">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">جاري تسجيل الدخول عبر الرابط الآمن…</p>
      {!busy ? (
        <Link to={ROUTE_PATHS.BARBER_LOGIN} className="text-sm text-primary underline">
          تسجيل الدخول اليدوي للوحة التحكم
        </Link>
      ) : null}
    </div>
  );
}
