import { getSupabaseClient } from '@/integrations/supabase/client';

function issueEndpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-listing-license-issue-voucher`;
  return '/api/admin-listing-license-issue-voucher';
}

export async function adminIssueListingLicenseVoucherRemote(input: {
  accessToken: string;
  skuCode: string;
  barberId?: string;
  buyerEmail?: string;
  barberName?: string;
  autoRedeem?: boolean;
  sendEmail?: boolean;
  adminNotes?: string;
}): Promise<
  | {
      ok: true;
      voucherCode: string | null;
      validUntil: string;
      listingDaysGranted: number;
      emailSent: boolean;
    }
  | { ok: false; error: string }
> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'supabase_not_configured' };

  const { data: sessionData } = await client.auth.getSession();
  const token = input.accessToken || sessionData.session?.access_token || '';
  if (!token) return { ok: false, error: 'not_authenticated' };

  try {
    const resp = await fetch(issueEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        skuCode: input.skuCode,
        barberId: input.barberId,
        buyerEmail: input.buyerEmail,
        barberName: input.barberName,
        autoRedeem: input.autoRedeem,
        sendEmail: input.sendEmail,
        adminNotes: input.adminNotes,
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      voucherCode?: string | null;
      validUntil?: string;
      listingDaysGranted?: number;
      emailSent?: boolean;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      voucherCode: json.voucherCode ?? null,
      validUntil: String(json.validUntil ?? ''),
      listingDaysGranted: Number(json.listingDaysGranted ?? 0),
      emailSent: json.emailSent === true,
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
