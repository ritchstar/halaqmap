/**
 * cloudflareGuard — تكامل Cloudflare API الحقيقي
 *
 * يتيح من غرفة العمليات السيبرانية:
 *  · حظر IP على مستوى Cloudflare Edge (لا يصل للسيرفر أبداً)
 *  · تفعيل/إيقاف وضع "Under Attack Mode"
 *  · استعلام بيانات التهديد الحقيقية من Cloudflare Analytics
 *  · قراءة قواعد الجدار الناري النشطة
 */

const CF_BASE = 'https://api.cloudflare.com/client/v4';

function cfHeaders(): Record<string, string> {
  const token = (process.env.CLOUDFLARE_API_TOKEN || '').trim();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export function cfConfigured(): boolean {
  return Boolean(
    (process.env.CLOUDFLARE_API_TOKEN || '').trim() &&
    (process.env.CLOUDFLARE_ZONE_ID || '').trim(),
  );
}

function zoneId(): string {
  return (process.env.CLOUDFLARE_ZONE_ID || '').trim();
}

// ─── حظر IP على مستوى Cloudflare Edge ───────────────────────────────────────
export async function blockIpCloudflare(
  ip: string,
  reason: string,
  mode: 'block' | 'challenge' | 'js_challenge' = 'block',
): Promise<{ ok: boolean; ruleId?: string; error?: string }> {
  if (!cfConfigured()) return { ok: false, error: 'Cloudflare not configured' };

  try {
    const res = await fetch(`${CF_BASE}/zones/${zoneId()}/firewall/access_rules/rules`, {
      method: 'POST',
      headers: cfHeaders(),
      body: JSON.stringify({
        mode,
        configuration: { target: 'ip', value: ip },
        notes: reason.slice(0, 500),
      }),
    });

    const data = (await res.json()) as { success?: boolean; result?: { id?: string }; errors?: { message: string }[] };

    if (data.success) {
      return { ok: true, ruleId: data.result?.id };
    }
    return { ok: false, error: data.errors?.[0]?.message ?? 'CF error' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network error' };
  }
}

// ─── رفع حظر IP من Cloudflare ────────────────────────────────────────────────
export async function unblockIpCloudflare(ruleId: string): Promise<{ ok: boolean; error?: string }> {
  if (!cfConfigured()) return { ok: false, error: 'Cloudflare not configured' };

  try {
    const res = await fetch(
      `${CF_BASE}/zones/${zoneId()}/firewall/access_rules/rules/${ruleId}`,
      { method: 'DELETE', headers: cfHeaders() },
    );
    const data = (await res.json()) as { success?: boolean };
    return { ok: !!data.success };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network error' };
  }
}

// ─── تفعيل/إيقاف Under Attack Mode ──────────────────────────────────────────
export async function setUnderAttackMode(
  enabled: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (!cfConfigured()) return { ok: false, error: 'Cloudflare not configured' };

  const securityLevel = enabled ? 'under_attack' : 'medium';

  try {
    const res = await fetch(`${CF_BASE}/zones/${zoneId()}/settings/security_level`, {
      method: 'PATCH',
      headers: cfHeaders(),
      body: JSON.stringify({ value: securityLevel }),
    });
    const data = (await res.json()) as { success?: boolean; result?: { value?: string } };
    return { ok: !!data.success };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network error' };
  }
}

// ─── استعلام حالة الأمان الحالية ─────────────────────────────────────────────
export async function getCfSecurityStatus(): Promise<{
  securityLevel: string;
  underAttack: boolean;
  ok: boolean;
  error?: string;
}> {
  if (!cfConfigured()) return { ok: false, securityLevel: 'unknown', underAttack: false, error: 'not configured' };

  try {
    const res = await fetch(`${CF_BASE}/zones/${zoneId()}/settings/security_level`, {
      headers: cfHeaders(),
    });
    const data = (await res.json()) as { success?: boolean; result?: { value?: string } };
    const level = data.result?.value ?? 'unknown';
    return { ok: !!data.success, securityLevel: level, underAttack: level === 'under_attack' };
  } catch (e) {
    return { ok: false, securityLevel: 'unknown', underAttack: false, error: e instanceof Error ? e.message : 'network error' };
  }
}

// ─── قائمة قواعد الجدار الناري النشطة ────────────────────────────────────────
export async function getCfFirewallRules(): Promise<{
  ok: boolean;
  rules: { id: string; mode: string; ip: string; notes: string; created: string }[];
  error?: string;
}> {
  if (!cfConfigured()) return { ok: false, rules: [], error: 'not configured' };

  try {
    const res = await fetch(
      `${CF_BASE}/zones/${zoneId()}/firewall/access_rules/rules?mode=block&per_page=50`,
      { headers: cfHeaders() },
    );
    const data = (await res.json()) as {
      success?: boolean;
      result?: { id: string; mode: string; configuration?: { value?: string }; notes?: string; created_on?: string }[];
    };
    if (!data.success) return { ok: false, rules: [] };

    const rules = (data.result ?? []).map(r => ({
      id: r.id,
      mode: r.mode,
      ip: r.configuration?.value ?? 'unknown',
      notes: r.notes ?? '',
      created: r.created_on ?? '',
    }));

    return { ok: true, rules };
  } catch (e) {
    return { ok: false, rules: [], error: e instanceof Error ? e.message : 'network error' };
  }
}

// ─── بيانات التهديد من Cloudflare Analytics ──────────────────────────────────
export async function getCfThreatAnalytics(hours = 24): Promise<{
  ok: boolean;
  threats: number;
  cachedRequests: number;
  totalRequests: number;
  error?: string;
}> {
  if (!cfConfigured()) return { ok: false, threats: 0, cachedRequests: 0, totalRequests: 0, error: 'not configured' };

  const since = new Date(Date.now() - hours * 3_600_000).toISOString().split('.')[0] + 'Z';
  const until = new Date().toISOString().split('.')[0] + 'Z';

  const query = `{
    viewer {
      zones(filter: { zoneTag: "${zoneId()}" }) {
        httpRequests1hGroups(
          limit: ${hours}
          filter: { datetime_geq: "${since}", datetime_leq: "${until}" }
          orderBy: [datetime_ASC]
        ) {
          sum {
            threats
            cachedRequests
            requests
          }
        }
      }
    }
  }`;

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { ...cfHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = (await res.json()) as {
      data?: {
        viewer?: {
          zones?: {
            httpRequests1hGroups?: { sum: { threats: number; cachedRequests: number; requests: number } }[];
          }[];
        };
      };
    };

    const groups = data.data?.viewer?.zones?.[0]?.httpRequests1hGroups ?? [];
    const totals = groups.reduce(
      (acc, g) => ({
        threats: acc.threats + (g.sum.threats ?? 0),
        cachedRequests: acc.cachedRequests + (g.sum.cachedRequests ?? 0),
        totalRequests: acc.totalRequests + (g.sum.requests ?? 0),
      }),
      { threats: 0, cachedRequests: 0, totalRequests: 0 },
    );

    return { ok: true, ...totals };
  } catch (e) {
    return { ok: false, threats: 0, cachedRequests: 0, totalRequests: 0, error: e instanceof Error ? e.message : 'network error' };
  }
}
