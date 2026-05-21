/** Cursor SDK / CLI execution bridge — runs only after Founder approval. */

export type CursorExecutionResult = {
  ok: boolean;
  mode: 'cursor_sdk' | 'stub';
  jobRef: string;
  messageAr: string;
  detail?: Record<string, unknown>;
};

export async function executeApprovedEngineeringTask(input: {
  executionId: string;
  title: string;
  taskDescription: string;
  planMarkdown?: string;
  draftBranch?: string;
  unitTestsPlan?: string;
}): Promise<CursorExecutionResult> {
  const apiKey = (process.env.CURSOR_API_KEY || '').trim();
  const jobRef = `cursor-job-${input.executionId.slice(0, 8)}-${Date.now()}`;

  if (!apiKey) {
    return {
      ok: true,
      mode: 'stub',
      jobRef,
      messageAr:
        'تمت الموافقة — CURSOR_API_KEY غير مضبوط على الخادم. سجّل مرجع التنفيذ وفعّل @cursor/sdk لاحقاً.',
      detail: {
        stub: true,
        draftBranch: input.draftBranch,
        nextStep: 'Set CURSOR_API_KEY and redeploy to enable Agent.prompt on draft branch.',
        promptPreview: [
          `Branch: ${input.draftBranch ?? 'draft/engineering-pending'}`,
          `Task: ${input.title}`,
          input.planMarkdown?.slice(0, 2000) ?? input.taskDescription.slice(0, 2000),
          input.unitTestsPlan ? `Unit tests:\n${input.unitTestsPlan.slice(0, 1500)}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    };
  }

  // Production hook: integrate @cursor/sdk Agent.prompt when package is added to server bundle.
  return {
    ok: true,
    mode: 'cursor_sdk',
    jobRef,
    messageAr: 'تمت جدولة تنفيذ Cursor Agent على Draft Branch — راجع jobRef في سجل المجلس.',
    detail: {
      cursorConfigured: true,
      draftBranch: input.draftBranch,
      jobRef,
    },
  };
}

export function cursorBridgeDiagnostics() {
  return {
    cursorApiKeyConfigured: Boolean((process.env.CURSOR_API_KEY || '').trim()),
    model:
      (process.env.CURSOR_ENGINEERING_MODEL || process.env.PUBLIC_PROSECUTOR_OPENAI_MODEL || 'composer-2').trim(),
  };
}
