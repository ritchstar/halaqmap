import { verifyVercelCronRequest } from './_lib/vercelCronAuth.js';

export const config = {
  maxDuration: 30,
};

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vercel-cron-secret',
    'Access-Control-Max-Age': '86400',
  };
}

function bool(v: string | undefined): boolean {
  return String(v || '').trim().toLowerCase() === 'true';
}

async function postJson(url: string, payload: Record<string, unknown>): Promise<void> {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  return Response.json(
    {
      ok: true,
      route: 'cron-security-triage',
      requiresCronSecret: Boolean((process.env.VERCEL_CRON_SECRET || '').trim()),
      hasSlackWebhook: Boolean((process.env.SECURITY_TRIAGE_SLACK_WEBHOOK || '').trim()),
      mode: 'dispatches-repo-security-triage-workflow',
    },
    { headers },
  );
}

/**
 * يشغل Workflow الأمن على GitHub (security-triage) ليبقى فحص الثغرات
 * متناسقاً بين بيئة Vercel والـ CI، دون إعادة تنفيذ npm audit داخل Function.
 */
export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const auth = verifyVercelCronRequest(request);
  if (!auth.ok) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const ghToken = (process.env.SECURITY_TRIAGE_GH_TOKEN || process.env.GITHUB_TOKEN || '').trim();
  const repo = (process.env.GITHUB_REPOSITORY || '').trim(); // owner/repo
  const ref = (process.env.SECURITY_TRIAGE_REF || process.env.VERCEL_GIT_COMMIT_REF || 'main').trim();
  const runUrl =
    repo && ref
      ? `https://api.github.com/repos/${repo}/actions/workflows/security-triage.yml/dispatches`
      : '';

  if (!ghToken || !repo || !runUrl) {
    return Response.json(
      {
        error: 'Server not configured',
        hint: 'Set SECURITY_TRIAGE_GH_TOKEN (or GITHUB_TOKEN) and GITHUB_REPOSITORY in Vercel env.',
      },
      { status: 503, headers },
    );
  }

  const failOnCritical = bool(process.env.SECURITY_TRIAGE_FAIL_ON_CRITICAL);
  const resp = await fetch(runUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref,
      inputs: {
        fail_on_critical: String(failOnCritical),
      },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    const webhook = (process.env.SECURITY_TRIAGE_SLACK_WEBHOOK || '').trim();
    if (webhook) {
      await postJson(webhook, {
        text: `Vercel cron failed to dispatch security-triage workflow for ${repo}@${ref}. HTTP ${resp.status}.`,
      });
    }
    return Response.json(
      {
        error: 'Failed to dispatch security-triage workflow',
        statusCode: resp.status,
        details: text || null,
      },
      { status: 502, headers },
    );
  }

  return Response.json(
    {
      ok: true,
      dispatched: true,
      repository: repo,
      ref,
      failOnCritical,
      workflow: 'security-triage.yml',
    },
    { headers },
  );
}
