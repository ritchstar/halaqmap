/**
 * Unified agent conversation logging — all deployed & fixed agents.
 * Persists user/assistant turns with Saudi persona metadata (سعودي / سعودية).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './supabaseUrl.js';
import {
  AGENT_PERSONAS,
  type AgentPersonaId,
  getAgentPersona,
} from './agentPersonas.js';
import { resolveRegulatoryReferral } from './platformManagementReferral.js';

export type AgentConversationLogInput = {
  agentId: AgentPersonaId;
  userMessage: string;
  assistantReply: string;
  channel?: string | null;
  referredToManagement?: boolean;
  actorEmail?: string | null;
  sessionMeta?: Record<string, unknown>;
};

export function createAgentLogSupabase(): SupabaseClient<any> | null {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function logAgentConversation(
  supabase: SupabaseClient<any> | null,
  input: AgentConversationLogInput,
): Promise<void> {
  if (!supabase) return;
  const persona = getAgentPersona(input.agentId);
  try {
    await supabase.from('agent_conversations').insert({
      agent_id: persona.id,
      agent_title_ar: persona.titleAr,
      persona_gender: persona.gender,
      deployment: persona.deployment,
      channel: input.channel?.slice(0, 200) ?? null,
      user_message: input.userMessage.slice(0, 4000),
      assistant_reply: input.assistantReply.slice(0, 8000),
      referred_to_management: Boolean(input.referredToManagement),
      actor_email: input.actorEmail?.slice(0, 320) ?? null,
      session_meta: input.sessionMeta ?? {},
      asked_at: new Date().toISOString(),
    });
  } catch {
    // Table may not exist until migration — silent fail
  }
}

export async function finalizeAgentReply(
  supabase: SupabaseClient<any> | null,
  agentId: AgentPersonaId,
  userMessage: string,
  channel: string,
  generateReply: () => Promise<string>,
  opts?: { actorEmail?: string | null; sessionMeta?: Record<string, unknown> },
): Promise<{ reply: string; referredToManagement: boolean }> {
  const referral = resolveRegulatoryReferral(userMessage);
  const reply = referral ?? (await generateReply());
  void logAgentConversation(supabase, {
    agentId,
    channel,
    userMessage,
    assistantReply: reply,
    referredToManagement: Boolean(referral),
    actorEmail: opts?.actorEmail,
    sessionMeta: opts?.sessionMeta,
  });
  return { reply, referredToManagement: Boolean(referral) };
}

export { AGENT_PERSONAS, type AgentPersonaId };
