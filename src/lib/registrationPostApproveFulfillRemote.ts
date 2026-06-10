import { getSupabaseClient } from '@/integrations/supabase/client';

const POST_APPROVE_FULFILL_API = '/api/registration-post-approve-fulfill';

export async function registrationPostApproveFulfillRemote(input: {
  registrationRequestId: string;
  barberId: string;
}): Promise<
  | {
      ok: true;
      redeemedCount: number;
      skippedAlreadyRedeemed: number;
      listingActivated: boolean;
      validUntil: string | null;
    }
  | { ok: false; error: string }
> {
  const endpoint = String(import.meta.env.VITE_REGISTRATION_POST_APPROVE_FULFILL_URL || POST_APPROVE_FULFILL_API).trim();
  const client = getSupabaseClient();
  const accessToken = (await client?.auth.getSession())?.data.session?.access_token?.trim() || '';
  if (!accessToken) {
    return { ok: false, error: 'missing_admin_session' };
  }

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(getClientSupabaseUrl() ? { 'x-client-supabase-url': getClientSupabaseUrl() } : {}),
      },
      body: JSON.stringify({
        registrationRequestId: input.registrationRequestId,
        barberId: input.barberId,
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as Record<string, unknown>;
    if (!resp.ok) {
      return { ok: false, error: String(json.error ?? json.detail ?? resp.statusText) };
    }
    return {
      ok: true,
      redeemedCount: Number(json.redeemedCount ?? 0),
      skippedAlreadyRedeemed: Number(json.skippedAlreadyRedeemed ?? 0),
      listingActivated: json.listingActivated === true,
      validUntil: typeof json.validUntil === 'string' ? json.validUntil : null,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network_error' };
  }
}

function getClientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}
