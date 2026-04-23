import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import { partnerSalonDisplayName } from '@/config/partnerDashboardBrand';
import type { BarberPortalInclusiveCareSnapshot } from '@/lib/barberInclusiveCareRemote';
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

export default function BarberPortalEnter() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ran = useRef(false);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('m')?.trim();
    if (!token) {
      setBusy(false);
      toast.error('رابط الدخول غير صالح (ناقص الرمز).');
      navigate(ROUTE_PATHS.BARBER_LOGIN, { replace: true });
      return;
    }

    void (async () => {
      try {
        const response = await fetch(MAGIC_ENDPOINT, {
          method: 'POST',
          headers: baseHeaders(),
          body: JSON.stringify({ token }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
          barber_session_token?: string | null;
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
          toast.error(payload.error || 'تعذر تسجيل الدخول عبر الرابط.');
          navigate(ROUTE_PATHS.BARBER_LOGIN, { replace: true });
          return;
        }

        const b = payload.barber;
        if (!b?.id) {
          setBusy(false);
          toast.error('استجابة غير صالحة من الخادم.');
          navigate(ROUTE_PATHS.BARBER_LOGIN, { replace: true });
          return;
        }

        const mn = b.member_number;
        const memberNumber =
          mn != null && Number.isFinite(Number(mn)) ? Math.floor(Number(mn)) : null;
        const barberSessionToken = String(payload.barber_session_token ?? '').trim();

        localStorage.setItem(
          'barberAuth',
          JSON.stringify({
            id: b.id,
            name: b.name,
            email: b.email,
            phone: b.phone || '',
            subscription: tierFromDb(b.tier),
            ratingInviteToken: String(b.rating_invite_token ?? ''),
            memberNumber,
            inclusiveCare: b.inclusiveCare,
            barberSessionToken,
            loggedIn: true,
          }),
        );
        toast.success(`مرحباً ${partnerSalonDisplayName({ name: b.name, email: b.email })}`);
        navigate(ROUTE_PATHS.BARBER_DASHBOARD, { replace: true });
      } catch {
        setBusy(false);
        toast.error('تعذر الاتصال بالخادم.');
        navigate(ROUTE_PATHS.BARBER_LOGIN, { replace: true });
      }
    })();
  }, [navigate, params]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background p-6" dir="rtl">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">جاري تسجيل الدخول عبر الرابط الآمن…</p>
      {!busy ? (
        <Link to={ROUTE_PATHS.BARBER_LOGIN} className="text-sm text-primary underline">
          الانتقال لتسجيل الدخول اليدوي
        </Link>
      ) : null}
    </div>
  );
}
