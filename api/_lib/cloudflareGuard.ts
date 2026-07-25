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

/** نقطة ساعة واحدة من Cloudflare GraphQL Analytics (مجمّع — ليس سجل طلب). */
export type CfThreatHourPoint = {
  datetime: string;
  threats: number;
  requests: number;
  cachedRequests: number;
};

export type CfThreatAnalyticsResult = {
  ok: boolean;
  threats: number;
  cachedRequests: number;
  totalRequests: number;
  /** سلسلة زمنية ساعة بساعة — للأوب بأوب في لوحة Cyber */
  series: CfThreatHourPoint[];
  /** آخر ساعة فقط — لعتبات التنبيه */
  lastHourThreats: number;
  lastHourRequests: number;
  fetchedAt: string;
  fromCache?: boolean;
  error?: string;
};

const emptyAnalytics = (error?: string): CfThreatAnalyticsResult => ({
  ok: false,
  threats: 0,
  cachedRequests: 0,
  totalRequests: 0,
  series: [],
  lastHourThreats: 0,
  lastHourRequests: 0,
  fetchedAt: new Date().toISOString(),
  error,
});

/** كاش قصير لتقليل حصص GraphQL (افتراضي 90 ثانية). */
const CF_ANALYTICS_CACHE_MS = Math.max(
  30_000,
  Number(process.env.CF_ANALYTICS_CACHE_MS || 90_000) || 90_000,
);
const analyticsCache = new Map<number, { at: number; value: CfThreatAnalyticsResult }>();

/**
 * بيانات التهديد من Cloudflare Analytics (GraphQL).
 * مسار غير-Enterprise: مجمّعات ساعة — بدون Logpush / سجلات خام.
 */
export async function getCfThreatAnalytics(hours = 24): Promise<CfThreatAnalyticsResult> {
  const h = Math.min(72, Math.max(1, Math.round(Number(hours) || 24)));
  if (!cfConfigured()) return emptyAnalytics('not configured');

  const cached = analyticsCache.get(h);
  if (cached && Date.now() - cached.at < CF_ANALYTICS_CACHE_MS) {
    return { ...cached.value, fromCache: true };
  }

  const since = new Date(Date.now() - h * 3_600_000).toISOString().split('.')[0] + 'Z';
  const until = new Date().toISOString().split('.')[0] + 'Z';

  const query = `{
    viewer {
      zones(filter: { zoneTag: "${zoneId()}" }) {
        httpRequests1hGroups(
          limit: ${h}
          filter: { datetime_geq: "${since}", datetime_leq: "${until}" }
          orderBy: [datetime_ASC]
        ) {
          dimensions { datetime }
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
      errors?: { message?: string }[];
      data?: {
        viewer?: {
          zones?: {
            httpRequests1hGroups?: {
              dimensions?: { datetime?: string };
              sum: { threats: number; cachedRequests: number; requests: number };
            }[];
          }[];
        };
      };
    };

    let groups = data.data?.viewer?.zones?.[0]?.httpRequests1hGroups ?? [];

    // إن رفض الـ API حقل dimensions — أعد المحاولة بالمجاميع فقط
    if (data.errors?.length && groups.length === 0) {
      const fallbackQuery = `{
        viewer {
          zones(filter: { zoneTag: "${zoneId()}" }) {
            httpRequests1hGroups(
              limit: ${h}
              filter: { datetime_geq: "${since}", datetime_leq: "${until}" }
              orderBy: [datetime_ASC]
            ) {
              sum { threats cachedRequests requests }
            }
          }
        }
      }`;
      const res2 = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: { ...cfHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fallbackQuery }),
      });
      const data2 = (await res2.json()) as typeof data;
      groups = data2.data?.viewer?.zones?.[0]?.httpRequests1hGroups ?? [];
      if (data2.errors?.length && groups.length === 0) {
        return emptyAnalytics(data2.errors[0]?.message || data.errors[0]?.message || 'graphql_error');
      }
    }

    const series: CfThreatHourPoint[] = groups.map((g, idx) => ({
      datetime: String(g.dimensions?.datetime || `h${idx + 1}`),
      threats: Number(g.sum?.threats ?? 0),
      requests: Number(g.sum?.requests ?? 0),
      cachedRequests: Number(g.sum?.cachedRequests ?? 0),
    }));

    const totals = series.reduce(
      (acc, g) => ({
        threats: acc.threats + g.threats,
        cachedRequests: acc.cachedRequests + g.cachedRequests,
        totalRequests: acc.totalRequests + g.requests,
      }),
      { threats: 0, cachedRequests: 0, totalRequests: 0 },
    );

    const last = series.length > 0 ? series[series.length - 1] : null;
    const result: CfThreatAnalyticsResult = {
      ok: true,
      ...totals,
      series,
      lastHourThreats: last?.threats ?? 0,
      lastHourRequests: last?.requests ?? 0,
      fetchedAt: new Date().toISOString(),
    };
    analyticsCache.set(h, { at: Date.now(), value: result });
    return result;
  } catch (e) {
    return emptyAnalytics(e instanceof Error ? e.message : 'network error');
  }
}

/** عتبة تنبيه تهديدات آخر ساعة — قابلة للضبط عبر env */
export function cfThreatAlertHourThreshold(): number {
  const n = Number(process.env.CF_THREAT_ALERT_HOUR_THRESHOLD || 80);
  return Number.isFinite(n) && n > 0 ? n : 80;
}
