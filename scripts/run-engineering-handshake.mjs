import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseEnvFile(raw) {
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

const fileSecrets = parseEnvFile(readFileSync(resolve(process.cwd(), '.agent_secrets.env'), 'utf8'));
const secrets = {
  supabaseUrl: fileSecrets.SUPABASE_URL,
  supabaseServiceKey: fileSecrets.SUPABASE_SERVICE_KEY || fileSecrets.SUPABASE_SERVICE_ROLE_KEY,
  vercelToken: fileSecrets.VERCEL_TOKEN,
  vercelProjectId: fileSecrets.VERCEL_PROJECT_ID,
  githubToken: fileSecrets.GITHUB_TOKEN,
};

const issues = [];
if (!secrets.supabaseUrl) issues.push('SUPABASE_URL missing');
if (!secrets.supabaseServiceKey) issues.push('SUPABASE_SERVICE_KEY missing');
if (!secrets.vercelToken?.startsWith('vcp_')) issues.push('VERCEL_TOKEN invalid');
if (!secrets.vercelProjectId?.startsWith('prj_')) issues.push('VERCEL_PROJECT_ID invalid');
if (!/^(ghp_|github_pat_)/.test(secrets.githubToken || '')) issues.push('GITHUB_TOKEN invalid');

console.log('secrets_valid:', issues.length === 0);
if (issues.length) console.log('secret_issues:', issues.join(' | '));

async function pingSupabase() {
  const started = Date.now();
  const res = await fetch(`${secrets.supabaseUrl}/rest/v1/platform_admin_roles?select=id&limit=1`, {
    headers: {
      apikey: secrets.supabaseServiceKey,
      Authorization: `Bearer ${secrets.supabaseServiceKey}`,
    },
  });
  return { ok: res.ok, ms: Date.now() - started, message: res.ok ? 'REST ping OK' : `HTTP ${res.status}` };
}

async function pingVercel() {
  const started = Date.now();
  const res = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(secrets.vercelProjectId)}`, {
    headers: { Authorization: `Bearer ${secrets.vercelToken}` },
  });
  const body = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    ms: Date.now() - started,
    message: res.ok ? `Project API OK (${body.name || 'project'})` : body.error?.message || `HTTP ${res.status}`,
  };
}

async function pingGitHub() {
  const started = Date.now();
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${secrets.githubToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'HalaqMap-Engineering-Wing',
    },
  });
  const body = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    ms: Date.now() - started,
    message: res.ok ? `User API OK (${body.login || 'user'})` : body.message || `HTTP ${res.status}`,
  };
}

async function latestDeployment() {
  const res = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(secrets.vercelProjectId)}&limit=1`,
    { headers: { Authorization: `Bearer ${secrets.vercelToken}` } },
  );
  const body = await res.json().catch(() => ({}));
  const latest = body.deployments?.[0];
  if (!latest?.url) return null;
  return latest.url.startsWith('http') ? latest.url : `https://${latest.url}`;
}

async function ping(name, fn) {
  try {
    return await fn();
  } catch (err) {
    return {
      ok: false,
      ms: 0,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

const [supabase, vercel, github, deploymentUrl] = await Promise.all([
  ping('supabase', pingSupabase),
  ping('vercel', pingVercel),
  ping('github', pingGitHub),
  latestDeployment().catch(() => null),
]);

for (const [name, result] of [
  ['supabase', supabase],
  ['vercel', vercel],
  ['github', github],
]) {
  console.log(`${name}: ${result.ok ? 'OK' : 'FAIL'} (${result.ms}ms) — ${result.message}`);
}

const allOk = issues.length === 0 && supabase.ok && vercel.ok && github.ok;
console.log('system_status:', allOk ? 'OK' : 'FAIL');
console.log('vercel_deployment_url:', deploymentUrl ?? 'none');
console.log('ops_controller_enabled:', allOk);
