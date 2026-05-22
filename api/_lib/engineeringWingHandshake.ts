import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './supabaseUrl.js';

export type HandshakeServiceId = 'supabase' | 'vercel' | 'github';

/**
 * Service classes:
 *  - `critical`: failure flips System Status → FAIL. Currently only Supabase
 *    (without it, RLS / auth / data layer collapse).
 *  - `advisory`: failure is surfaced but doesn't gate System Status. Vercel
 *    and GitHub tokens enable deployment introspection and the
 *    Self-Development Protocol — they don't block live operations because
 *    the platform is already deployed and running regardless of whether
 *    those tokens are valid.
 */
export type HandshakeServiceClass = 'critical' | 'advisory';

export type HandshakeServicePing = {
  id: HandshakeServiceId;
  label: string;
  ok: boolean;
  latencyMs: number;
  message: string;
  serviceClass: HandshakeServiceClass;
  /** True when the token was never configured (advisory services only). */
  notConfigured?: boolean;
  detail?: Record<string, unknown>;
};

export type EngineeringWingSecrets = {
  supabaseUrl: string;
  supabaseServiceKey: string;
  vercelToken: string;
  vercelProjectId: string;
  githubToken: string;
  source: 'process_env' | 'agent_secrets_env' | 'mixed';
};

export type EngineeringWingHandshakeResult = {
  status: 'ok' | 'fail';
  checkedAt: string;
  secretsValid: boolean;
  secretIssues: string[];
  services: HandshakeServicePing[];
  /** Advisory services that are configured but failing — surfaced as warnings. */
  advisoryDegradations: string[];
  vercelDeploymentUrl: string | null;
  vercelDeploymentId: string | null;
  opsControllerEnabled: boolean;
};

const AGENT_SECRETS_FILENAME = '.agent_secrets.env';

function parseEnvFile(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function readAgentSecretsFile(): Record<string, string> {
  try {
    const filePath = resolve(process.cwd(), AGENT_SECRETS_FILENAME);
    const raw = readFileSync(filePath, 'utf8');
    return parseEnvFile(raw);
  } catch {
    return {};
  }
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = (value || '').trim();
    if (trimmed) return trimmed;
  }
  return '';
}

export function loadEngineeringWingSecrets(): EngineeringWingSecrets {
  const fileSecrets = readAgentSecretsFile();
  const fromFile = Object.keys(fileSecrets).length > 0;

  const supabaseUrl = firstNonEmpty(
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    fileSecrets.SUPABASE_URL,
  );
  const supabaseServiceKey = firstNonEmpty(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_KEY,
    fileSecrets.SUPABASE_SERVICE_ROLE_KEY,
    fileSecrets.SUPABASE_SERVICE_KEY,
  );
  const vercelToken = firstNonEmpty(process.env.VERCEL_TOKEN, fileSecrets.VERCEL_TOKEN);
  const vercelProjectId = firstNonEmpty(
    process.env.VERCEL_PROJECT_ID,
    fileSecrets.VERCEL_PROJECT_ID,
  );
  const githubToken = firstNonEmpty(process.env.GITHUB_TOKEN, fileSecrets.GITHUB_TOKEN);

  const processHasAny = Boolean(
    process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.VERCEL_TOKEN ||
      process.env.VERCEL_PROJECT_ID ||
      process.env.GITHUB_TOKEN,
  );

  return {
    supabaseUrl: normalizeSupabaseUrl(supabaseUrl) || supabaseUrl,
    supabaseServiceKey,
    vercelToken,
    vercelProjectId,
    githubToken,
    source: processHasAny && fromFile ? 'mixed' : fromFile ? 'agent_secrets_env' : 'process_env',
  };
}

/**
 * Surfaces likely misconfigurations to the founder UI. Critical issues
 * (Supabase) genuinely break the platform; advisory issues (Vercel/GitHub)
 * only disable optional features (deployment introspection,
 * Self-Development Protocol) and are tagged as such so the founder UI can
 * render them in a softer tone. Authoritative System Status comes from the
 * live ping outcome — this function never gates the handshake by itself.
 */
export function validateEngineeringWingSecrets(secrets: EngineeringWingSecrets): string[] {
  const issues: string[] = [];
  if (!secrets.supabaseUrl || !isLikelyHttpUrl(secrets.supabaseUrl)) {
    issues.push('SUPABASE_URL missing or invalid');
  }
  if (!secrets.supabaseServiceKey || secrets.supabaseServiceKey.length < 20) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY missing or too short');
  }
  if (!secrets.vercelToken || secrets.vercelToken.length < 16) {
    issues.push('VERCEL_TOKEN missing — استشاري فقط (لا يحجب تفعيل النظام).');
  }
  if (!secrets.vercelProjectId || secrets.vercelProjectId.length < 6) {
    issues.push('VERCEL_PROJECT_ID missing — استشاري فقط.');
  }
  if (!secrets.githubToken || secrets.githubToken.length < 16) {
    issues.push('GITHUB_TOKEN missing — استشاري فقط (Self-Development Protocol معطّل).');
  }
  return issues;
}

async function pingSupabase(secrets: EngineeringWingSecrets): Promise<HandshakeServicePing> {
  const started = Date.now();
  if (!secrets.supabaseUrl || !secrets.supabaseServiceKey) {
    return {
      id: 'supabase',
      label: 'Supabase',
      ok: false,
      latencyMs: 0,
      message: 'Missing Supabase credentials',
      serviceClass: 'critical',
    };
  }

  try {
    const client = createClient(secrets.supabaseUrl, secrets.supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.from('platform_admin_roles').select('id').limit(1);
    if (error) {
      return {
        id: 'supabase',
        label: 'Supabase',
        ok: false,
        latencyMs: Date.now() - started,
        message: error.message,
        serviceClass: 'critical',
      };
    }
    return {
      id: 'supabase',
      label: 'Supabase',
      ok: true,
      latencyMs: Date.now() - started,
      message: 'REST ping OK',
      serviceClass: 'critical',
      detail: { host: new URL(secrets.supabaseUrl).host },
    };
  } catch (err) {
    return {
      id: 'supabase',
      label: 'Supabase',
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : 'Supabase ping failed',
      serviceClass: 'critical',
    };
  }
}

async function pingVercel(secrets: EngineeringWingSecrets): Promise<HandshakeServicePing> {
  const started = Date.now();
  // Advisory: a missing Vercel token does NOT mean the platform is offline —
  // the deployment is already live on Vercel and serving traffic. The token
  // is only needed for deployment introspection from the founder console.
  if (!secrets.vercelToken || !secrets.vercelProjectId) {
    return {
      id: 'vercel',
      label: 'Vercel (advisory)',
      ok: true,
      latencyMs: 0,
      message: 'لم يُهيَّأ توكن Vercel — استشاري فقط (لا يؤثّر على حالة النظام).',
      serviceClass: 'advisory',
      notConfigured: true,
    };
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${encodeURIComponent(secrets.vercelProjectId)}`,
      {
        headers: { Authorization: `Bearer ${secrets.vercelToken}` },
      },
    );
    const body = (await res.json().catch(() => ({}))) as {
      name?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      return {
        id: 'vercel',
        label: 'Vercel',
        ok: false,
        latencyMs: Date.now() - started,
        message: body.error?.message || `HTTP ${res.status}`,
        serviceClass: 'advisory',
      };
    }
    return {
      id: 'vercel',
      label: 'Vercel',
      ok: true,
      latencyMs: Date.now() - started,
      message: 'Project API OK',
      serviceClass: 'advisory',
      detail: { projectName: body.name ?? null },
    };
  } catch (err) {
    return {
      id: 'vercel',
      label: 'Vercel',
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : 'Vercel ping failed',
      serviceClass: 'advisory',
    };
  }
}

async function pingGitHub(secrets: EngineeringWingSecrets): Promise<HandshakeServicePing> {
  const started = Date.now();
  // Advisory: GitHub token only enables the Self-Development Protocol (branch
  // proposals, automated PRs). Its absence doesn't break live operations.
  if (!secrets.githubToken) {
    return {
      id: 'github',
      label: 'GitHub (advisory)',
      ok: true,
      latencyMs: 0,
      message: 'لم يُهيَّأ توكن GitHub — استشاري فقط (لا يؤثّر على حالة النظام).',
      serviceClass: 'advisory',
      notConfigured: true,
    };
  }

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${secrets.githubToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'HalaqMap-Engineering-Wing',
      },
    });
    const body = (await res.json().catch(() => ({}))) as { login?: string; message?: string };
    if (!res.ok) {
      return {
        id: 'github',
        label: 'GitHub',
        ok: false,
        latencyMs: Date.now() - started,
        message: body.message || `HTTP ${res.status}`,
        serviceClass: 'advisory',
      };
    }
    return {
      id: 'github',
      label: 'GitHub',
      ok: true,
      latencyMs: Date.now() - started,
      message: 'User API OK',
      serviceClass: 'advisory',
      detail: { login: body.login ?? null },
    };
  } catch (err) {
    return {
      id: 'github',
      label: 'GitHub',
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : 'GitHub ping failed',
      serviceClass: 'advisory',
    };
  }
}

export async function fetchLatestVercelDeployment(secrets: EngineeringWingSecrets): Promise<{
  url: string | null;
  id: string | null;
}> {
  if (!secrets.vercelToken || !secrets.vercelProjectId) {
    return { url: null, id: null };
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(secrets.vercelProjectId)}&limit=1`,
      { headers: { Authorization: `Bearer ${secrets.vercelToken}` } },
    );
    const body = (await res.json().catch(() => ({}))) as {
      deployments?: Array<{ uid?: string; url?: string; state?: string; readyState?: string }>;
    };
    const latest = body.deployments?.[0];
    if (!latest?.url) return { url: null, id: latest?.uid ?? null };
    const host = latest.url.startsWith('http') ? latest.url : `https://${latest.url}`;
    return { url: host, id: latest.uid ?? null };
  } catch {
    return { url: null, id: null };
  }
}

export async function runEngineeringWingHandshake(): Promise<EngineeringWingHandshakeResult> {
  const secrets = loadEngineeringWingSecrets();
  const secretIssues = validateEngineeringWingSecrets(secrets);
  const secretsValid = secretIssues.length === 0;

  const [supabase, vercel, github, deployment] = await Promise.all([
    pingSupabase(secrets),
    pingVercel(secrets),
    pingGitHub(secrets),
    fetchLatestVercelDeployment(secrets),
  ]);

  const services = [supabase, vercel, github];

  // Authoritative System Status depends ONLY on critical services. Advisory
  // pings (Vercel/GitHub) surface their results to the founder UI as warnings
  // but never gate Ops Controller activation, because the platform is already
  // deployed and running independently of those introspection tokens.
  const criticalServicesOk = services
    .filter((s) => s.serviceClass === 'critical')
    .every((s) => s.ok);

  const advisoryDegradations = services
    .filter((s) => s.serviceClass === 'advisory' && !s.ok && !s.notConfigured)
    .map((s) => `${s.label}: ${s.message}`);

  const status: EngineeringWingHandshakeResult['status'] = criticalServicesOk ? 'ok' : 'fail';

  return {
    status,
    checkedAt: new Date().toISOString(),
    secretsValid,
    secretIssues,
    services,
    advisoryDegradations,
    vercelDeploymentUrl: deployment.url,
    vercelDeploymentId: deployment.id,
    opsControllerEnabled: status === 'ok',
  };
}

export type StoredHandshakeRow = {
  status: string;
  handshake_at: string | null;
  services: HandshakeServicePing[] | Record<string, unknown>;
  vercel_deployment_url: string | null;
  vercel_deployment_id: string | null;
  ops_controller_enabled: boolean;
  updated_at: string;
};

export async function readStoredHandshake(
  supabase: SupabaseClient,
): Promise<StoredHandshakeRow | null> {
  const { data, error } = await supabase
    .from('platform_engineering_handshake')
    .select(
      'status, handshake_at, services, vercel_deployment_url, vercel_deployment_id, ops_controller_enabled, updated_at',
    )
    .eq('id', 'founder')
    .maybeSingle();

  if (error || !data) return null;
  return data as StoredHandshakeRow;
}

export async function persistHandshake(
  supabase: SupabaseClient,
  result: EngineeringWingHandshakeResult,
  actorEmail: string,
): Promise<void> {
  const now = new Date().toISOString();
  await supabase.from('platform_engineering_handshake').upsert(
    {
      id: 'founder',
      status: result.status,
      handshake_at: result.status === 'ok' ? now : null,
      services: result.services,
      vercel_deployment_url: result.vercelDeploymentUrl,
      vercel_deployment_id: result.vercelDeploymentId,
      ops_controller_enabled: result.opsControllerEnabled,
      updated_at: now,
    },
    { onConflict: 'id' },
  );
}

export function secretsDiagnostics() {
  const secrets = loadEngineeringWingSecrets();
  const issues = validateEngineeringWingSecrets(secrets);
  return {
    secretsSource: secrets.source,
    agentSecretsFileReadable: Object.keys(readAgentSecretsFile()).length > 0,
    secretsValid: issues.length === 0,
    secretIssues: issues,
    configured: {
      supabaseUrl: Boolean(secrets.supabaseUrl),
      supabaseServiceKey: Boolean(secrets.supabaseServiceKey),
      vercelToken: Boolean(secrets.vercelToken),
      vercelProjectId: Boolean(secrets.vercelProjectId),
      githubToken: Boolean(secrets.githubToken),
    },
  };
}
