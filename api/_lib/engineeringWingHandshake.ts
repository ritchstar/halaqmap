import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './supabaseUrl.js';

export type HandshakeServiceId = 'supabase' | 'vercel' | 'github';

export type HandshakeServicePing = {
  id: HandshakeServiceId;
  label: string;
  ok: boolean;
  latencyMs: number;
  message: string;
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

export function validateEngineeringWingSecrets(secrets: EngineeringWingSecrets): string[] {
  const issues: string[] = [];
  if (!secrets.supabaseUrl || !isLikelyHttpUrl(secrets.supabaseUrl)) {
    issues.push('SUPABASE_URL missing or invalid');
  }
  if (!secrets.supabaseServiceKey || secrets.supabaseServiceKey.length < 20) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY missing or too short');
  }
  if (!secrets.vercelToken || !secrets.vercelToken.startsWith('vcp_')) {
    issues.push('VERCEL_TOKEN missing or invalid prefix');
  }
  if (!secrets.vercelProjectId || !secrets.vercelProjectId.startsWith('prj_')) {
    issues.push('VERCEL_PROJECT_ID missing or invalid prefix');
  }
  if (!secrets.githubToken || !/^(ghp_|github_pat_)/.test(secrets.githubToken)) {
    issues.push('GITHUB_TOKEN missing or invalid prefix');
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
      };
    }
    return {
      id: 'supabase',
      label: 'Supabase',
      ok: true,
      latencyMs: Date.now() - started,
      message: 'REST ping OK',
      detail: { host: new URL(secrets.supabaseUrl).host },
    };
  } catch (err) {
    return {
      id: 'supabase',
      label: 'Supabase',
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : 'Supabase ping failed',
    };
  }
}

async function pingVercel(secrets: EngineeringWingSecrets): Promise<HandshakeServicePing> {
  const started = Date.now();
  if (!secrets.vercelToken || !secrets.vercelProjectId) {
    return {
      id: 'vercel',
      label: 'Vercel',
      ok: false,
      latencyMs: 0,
      message: 'Missing Vercel credentials',
    };
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${encodeURIComponent(secrets.vercelProjectId)}`,
      {
        headers: { Authorization: `Bearer ${secrets.vercelToken}` },
      },
    );
    const body = (await res.json().catch(() => ({}))) as { name?: string; error?: { message?: string } };
    if (!res.ok) {
      return {
        id: 'vercel',
        label: 'Vercel',
        ok: false,
        latencyMs: Date.now() - started,
        message: body.error?.message || `HTTP ${res.status}`,
      };
    }
    return {
      id: 'vercel',
      label: 'Vercel',
      ok: true,
      latencyMs: Date.now() - started,
      message: 'Project API OK',
      detail: { projectName: body.name ?? null },
    };
  } catch (err) {
    return {
      id: 'vercel',
      label: 'Vercel',
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : 'Vercel ping failed',
    };
  }
}

async function pingGitHub(secrets: EngineeringWingSecrets): Promise<HandshakeServicePing> {
  const started = Date.now();
  if (!secrets.githubToken) {
    return {
      id: 'github',
      label: 'GitHub',
      ok: false,
      latencyMs: 0,
      message: 'Missing GitHub token',
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
      };
    }
    return {
      id: 'github',
      label: 'GitHub',
      ok: true,
      latencyMs: Date.now() - started,
      message: 'User API OK',
      detail: { login: body.login ?? null },
    };
  } catch (err) {
    return {
      id: 'github',
      label: 'GitHub',
      ok: false,
      latencyMs: Date.now() - started,
      message: err instanceof Error ? err.message : 'GitHub ping failed',
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
  const allServicesOk = services.every((s) => s.ok);
  const status = secretsValid && allServicesOk ? 'ok' : 'fail';

  return {
    status,
    checkedAt: new Date().toISOString(),
    secretsValid,
    secretIssues,
    services,
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
