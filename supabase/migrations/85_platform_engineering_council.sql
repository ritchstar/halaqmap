-- Engineering Council — agent-to-agent messaging + pending execution queue (Founder approval gate).

CREATE TABLE IF NOT EXISTS public.platform_agent_council_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  thread_id text NOT NULL,
  from_agent text NOT NULL,
  to_agent text NOT NULL,
  message_type text NOT NULL DEFAULT 'consultation',
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS platform_agent_council_messages_thread_idx
  ON public.platform_agent_council_messages (thread_id, created_at DESC);

CREATE INDEX IF NOT EXISTS platform_agent_council_messages_to_agent_idx
  ON public.platform_agent_council_messages (to_agent, created_at DESC);

CREATE TABLE IF NOT EXISTS public.platform_engineering_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'planning',
  initiator_agent text NOT NULL DEFAULT 'technical_consultant_engineering',
  title text NOT NULL,
  task_description text NOT NULL,
  plan_markdown text,
  prosecutor_verdict jsonb,
  draft_branch text,
  unit_tests_plan text,
  cursor_job_ref text,
  approved_by text,
  approved_at timestamptz,
  rejected_by text,
  rejected_at timestamptz,
  reporter_email text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS platform_engineering_executions_status_idx
  ON public.platform_engineering_executions (status, updated_at DESC);

COMMENT ON TABLE public.platform_agent_council_messages IS
  'Agent-to-agent council bus — consultations, compliance verdicts, refactor proposals.';

COMMENT ON TABLE public.platform_engineering_executions IS
  'Self-development protocol executions — held pending Founder approval before Cursor/CLI commit.';

ALTER TABLE public.platform_agent_council_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_engineering_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_agent_council_messages_no_client" ON public.platform_agent_council_messages;
CREATE POLICY "platform_agent_council_messages_no_client"
  ON public.platform_agent_council_messages FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "platform_engineering_executions_no_client" ON public.platform_engineering_executions;
CREATE POLICY "platform_engineering_executions_no_client"
  ON public.platform_engineering_executions FOR ALL USING (false) WITH CHECK (false);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_agent_council_messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_engineering_executions TO service_role;
REVOKE ALL ON TABLE public.platform_agent_council_messages FROM anon, authenticated;
REVOKE ALL ON TABLE public.platform_engineering_executions FROM anon, authenticated;
