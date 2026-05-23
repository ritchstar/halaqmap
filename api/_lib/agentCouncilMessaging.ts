import type { SupabaseClient } from '@supabase/supabase-js';

export type CouncilMessageRow = {
  id: string;
  created_at: string;
  thread_id: string;
  from_agent: string;
  to_agent: string;
  message_type: string;
  severity: string;
  title: string;
  body: string;
  detail: Record<string, unknown>;
};

export function mapCouncilMessage(row: CouncilMessageRow) {
  return {
    id: row.id,
    createdAt: row.created_at,
    threadId: row.thread_id,
    fromAgent: row.from_agent,
    toAgent: row.to_agent,
    messageType: row.message_type as 'consultation' | 'compliance_verdict' | 'refactor_proposal' | 'status',
    severity: row.severity as 'info' | 'watch' | 'urgent',
    title: row.title,
    body: row.body,
    detail: row.detail,
  };
}

export async function postCouncilMessage(
  supabase: SupabaseClient,
  input: {
    threadId: string;
    fromAgent: string;
    toAgent: string;
    messageType: string;
    severity?: string;
    title: string;
    body: string;
    detail?: Record<string, unknown>;
  },
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('platform_agent_council_messages')
    .insert({
      thread_id: input.threadId,
      from_agent: input.fromAgent,
      to_agent: input.toAgent,
      message_type: input.messageType,
      severity: input.severity ?? 'info',
      title: input.title.slice(0, 240),
      body: input.body.slice(0, 12_000),
      detail: input.detail ?? {},
    })
    .select('id')
    .single();

  if (error || !data) return null;
  return { id: String(data.id) };
}

export async function fetchCouncilMessages(
  supabase: SupabaseClient,
  options?: { threadId?: string; toAgent?: string; limit?: number },
) {
  let query = supabase
    .from('platform_agent_council_messages')
    .select('id, created_at, thread_id, from_agent, to_agent, message_type, severity, title, body, detail')
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 40);

  if (options?.threadId) query = query.eq('thread_id', options.threadId);
  if (options?.toAgent) query = query.eq('to_agent', options.toAgent);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map((row) => mapCouncilMessage(row as CouncilMessageRow));
}

export function buildCouncilThreadId(executionId: string): string {
  return `engineering-exec-${executionId}`;
}
