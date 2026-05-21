import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { fetchCouncilMessages } from './_lib/agentCouncilMessaging.js';
import { cursorBridgeDiagnostics } from './_lib/cursorExecutionBridge.js';
import {
  approveEngineeringExecution,
  listEngineeringExecutions,
  rejectEngineeringExecution,
  runSelfDevelopmentProtocol,
  suggestRefactorFromProsecutorFeedback,
} from './_lib/engineeringCouncilProtocol.js';

export const config = { maxDuration: 60 };

const COUNCIL_PERMS = ['manage_admins', 'view_overview'] as const;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...COUNCIL_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  const urlObj = new URL(request.url);
  const threadId = urlObj.searchParams.get('threadId')?.trim();
  const pendingOnly = urlObj.searchParams.get('pending') === '1';

  const [messages, executions, pending] = await Promise.all([
    fetchCouncilMessages(auth.supabase, { threadId: threadId || undefined, limit: 50 }),
    listEngineeringExecutions(auth.supabase),
    listEngineeringExecutions(auth.supabase, 'pending_approval'),
  ]);

  return json({
    ok: true,
    messages,
    executions: pendingOnly ? pending : executions,
    pendingApprovals: pending,
    cursor: cursorBridgeDiagnostics(),
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...COUNCIL_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const action = String(body.action || '').trim();

  if (action === 'propose_task') {
    const title = String(body.title || '').trim();
    const taskDescription = String(body.taskDescription || body.description || '').trim();
    if (title.length < 4 || taskDescription.length < 12) {
      return json({ error: 'title and taskDescription required' }, 400);
    }
    const result = await runSelfDevelopmentProtocol(auth.supabase, {
      title,
      taskDescription,
      reporterEmail: auth.actorEmail,
    });
    return json({ ok: true, action, ...result });
  }

  if (action === 'prosecutor_refactor') {
    const result = await suggestRefactorFromProsecutorFeedback(auth.supabase, auth.actorEmail);
    return json({ ok: true, action, ...result });
  }

  if (action === 'approve_execution') {
    const executionId = String(body.executionId || '').trim();
    if (!executionId) return json({ error: 'executionId required' }, 400);
    const result = await approveEngineeringExecution(auth.supabase, executionId, auth.actorEmail);
    return json({ ok: true, action, ...result });
  }

  if (action === 'reject_execution') {
    const executionId = String(body.executionId || '').trim();
    const reason = String(body.reason || '').trim() || undefined;
    if (!executionId) return json({ error: 'executionId required' }, 400);
    const execution = await rejectEngineeringExecution(
      auth.supabase,
      executionId,
      auth.actorEmail,
      reason,
    );
    return json({ ok: true, action, execution });
  }

  return json(
    {
      error: 'Unknown action',
      allowed: ['propose_task', 'prosecutor_refactor', 'approve_execution', 'reject_execution'],
    },
    400,
  );
}
