# Professional Commitment & Registration Compliance

> Export group `GROUP-05-COMPLIANCE-REGISTRATION` · Commit `b0e9e73`

### `api/_lib/registrationCompliance.ts`

```typescript
export type RegistrationCompliancePayload = Record<string, unknown>;

export type RegistrationComplianceAudit = {
  ok: boolean;
  gaps: string[];
  repairable: boolean;
};

function collectComplianceGaps(payload: RegistrationCompliancePayload): string[] {
  const gaps: string[] = [];
  if (payload.legalDisclaimerAccepted !== true) gaps.push('التعهد القانوني غير مُؤشَّر');
  if (payload.registrationTermsAccepted !== true) gaps.push('شروط التسجيل غير مُؤشَّرة');
  if (payload.professionalCommitmentAccepted !== true) gaps.push('الالتزام المهني غير مُؤشَّر');
  if (!payload.legalDisclaimerAcceptedAtIso) gaps.push('طابع زمني للتعهد القانوني مفقود');
  if (!payload.registrationTermsAcceptedAtIso) gaps.push('طابع زمني لشروط التسجيل مفقود');
  if (!payload.professionalCommitmentAcceptedAtIso) gaps.push('طابع زمني للالتزام المهني مفقود');
  return gaps;
}

function documentsMentionProfessionalCommitment(payload: RegistrationCompliancePayload): boolean {
  const docs = payload.documents;
  if (!Array.isArray(docs)) return false;
  return docs.some(
    (entry) => typeof entry === 'string' && entry.includes('الالتزام المهني'),
  );
}

function pickComplianceTimestamp(payload: RegistrationCompliancePayload): string | null {
  const terms = payload.registrationTermsAcceptedAtIso;
  if (typeof terms === 'string' && terms.trim()) return terms.trim();
  const legal = payload.legalDisclaimerAcceptedAtIso;
  if (typeof legal === 'string' && legal.trim()) return legal.trim();
  return null;
}

/** Infer professional commitment for payloads submitted before structured fields were persisted. */
export function canInferProfessionalCommitment(payload: RegistrationCompliancePayload): boolean {
  if (payload.professionalCommitmentAccepted === true) {
    return typeof payload.professionalCommitmentAcceptedAtIso === 'string'
      ? Boolean(payload.professionalCommitmentAcceptedAtIso.trim())
      : pickComplianceTimestamp(payload) !== null;
  }

  if (payload.legalDisclaimerAccepted !== true || payload.registrationTermsAccepted !== true) {
    return false;
  }

  return pickComplianceTimestamp(payload) !== null || documentsMentionProfessionalCommitment(payload);
}

export function buildRegistrationComplianceBackfill(
  payload: RegistrationCompliancePayload,
): RegistrationCompliancePayload | null {
  const patch: RegistrationCompliancePayload = {};
  const timestamp = pickComplianceTimestamp(payload);

  if (payload.professionalCommitmentAccepted !== true) {
    if (!canInferProfessionalCommitment(payload)) return null;
    patch.professionalCommitmentAccepted = true;
  }

  if (
    typeof payload.professionalCommitmentAcceptedAtIso !== 'string' ||
    !payload.professionalCommitmentAcceptedAtIso.trim()
  ) {
    if (!timestamp) return null;
    patch.professionalCommitmentAcceptedAtIso = timestamp;
  }

  if (Object.keys(patch).length === 0) return null;

  return {
    ...payload,
    ...patch,
    complianceBackfillAtIso: new Date().toISOString(),
    complianceBackfillSource: 'registration_compliance_repair',
  };
}

export function auditRegistrationPayload(
  payload: RegistrationCompliancePayload,
): RegistrationComplianceAudit {
  const gaps = collectComplianceGaps(payload);
  if (gaps.length === 0) {
    return { ok: true, gaps: [], repairable: false };
  }

  const patched = buildRegistrationComplianceBackfill(payload);
  const repairable = patched ? collectComplianceGaps(patched).length === 0 : false;

  return { ok: false, gaps, repairable };
}

/** Strict validation for new registration submissions. */
export function validateRegistrationCompliancePayload(payload: RegistrationCompliancePayload): {
  ok: boolean;
  error?: string;
} {
  if (
    payload.professionalCommitmentAccepted !== true ||
    typeof payload.professionalCommitmentAcceptedAtIso !== 'string' ||
    !payload.professionalCommitmentAcceptedAtIso.trim()
  ) {
    return { ok: false, error: 'professional_commitment_required' };
  }

  if (
    payload.legalDisclaimerAccepted !== true ||
    payload.registrationTermsAccepted !== true ||
    !payload.legalDisclaimerAcceptedAtIso ||
    !payload.registrationTermsAcceptedAtIso
  ) {
    return { ok: false, error: 'registration_compliance_incomplete' };
  }

  return { ok: true };
}

export async function repairRegistrationSubmissionsCompliance(
  supabase: import('@supabase/supabase-js').SupabaseClient,
): Promise<{ repaired: number; skipped: number; samples: string[] }> {
  let repaired = 0;
  let skipped = 0;
  const samples: string[] = [];

  const { data } = await supabase
    .from('registration_submissions')
    .select('id, payload')
    .order('created_at', { ascending: false })
    .limit(120);

  for (const row of data ?? []) {
    const payload = (row.payload ?? {}) as RegistrationCompliancePayload;
    const before = auditRegistrationPayload(payload);
    if (before.ok) {
      skipped += 1;
      continue;
    }

    const patched = buildRegistrationComplianceBackfill(payload);
    if (!patched) {
      skipped += 1;
      if (samples.length < 8) {
        samples.push(`${String(row.id)}: ${before.gaps.join('؛ ')}`.slice(0, 160));
      }
      continue;
    }

    const after = auditRegistrationPayload(patched);
    if (!after.ok) {
      skipped += 1;
      continue;
    }

    const { error } = await supabase
      .from('registration_submissions')
      .update({ payload: patched })
      .eq('id', row.id);

    if (error) {
      skipped += 1;
      continue;
    }

    repaired += 1;
    if (samples.length < 8) {
      samples.push(`${String(row.id)}: تم إصلاح الالتزام المهني`);
    }
  }

  return { repaired, skipped, samples };
}

```

### `api/register-submission.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { isRegistrationIntentMode } from './_lib/registrationIntentCrypto.js';
import { assertRegistrationServerAuth } from './_lib/registrationServerAuth.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { validateRegistrationCompliancePayload } from './_lib/registrationCompliance.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 30,
};

const TABLE = 'registration_submissions';
const ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;
const MAX_PAYLOAD_TEXT_BYTES = 5 * 1024 * 1024;

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url, x-registration-intent',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

/** تشخيص بلا أسرار — افتح في المتصفح: /api/register-submission */
export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim());
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const anon = Boolean(
    (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim()
  );
  return Response.json(
    {
      ok: true,
      route: 'register-submission',
      supabaseUrlSet: url,
      serviceRoleKeySet: serviceRole,
      anonKeySetForVerification: anon,
      registrationIntentMode: isRegistrationIntentMode(),
      ready: url && serviceRole && (isRegistrationIntentMode() || anon),
      registrationGuard: registrationGuardDiagnostics(),
      note: 'Server-side insert for registration_submissions (avoids anon RLS pitfalls).',
    },
    { headers }
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'register-submission');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const expectedAnon = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const rowId = String((body as { id?: unknown })?.id ?? '').trim();
  const payload = (body as { payload?: unknown })?.payload;
  if (!rowId || !ORDER_ID_RE.test(rowId)) {
    return Response.json({ error: 'Invalid order id' }, { status: 400, headers });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return Response.json({ error: 'Invalid payload object' }, { status: 400, headers });
  }

  const compliance = validateRegistrationCompliancePayload(payload as Record<string, unknown>);
  if (!compliance.ok) {
    return Response.json(
      {
        error:
          compliance.error === 'professional_commitment_required'
            ? 'يجب تأشير الالتزام المهني وحفظ طابعه الزمني قبل إرسال الطلب.'
            : 'بيانات الامتثال القانوني غير مكتملة — أعد تأشير خانات الموافقة.',
        code: compliance.error,
      },
      { status: 400, headers },
    );
  }

  const auth = assertRegistrationServerAuth(request, rowId, expectedAnon);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const payloadText = JSON.stringify(payload);
  if (new TextEncoder().encode(payloadText).byteLength > MAX_PAYLOAD_TEXT_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from(TABLE).insert({
    id: rowId,
    payload,
  });

  if (error) {
    const duplicate = String(error.message || '').toLowerCase().includes('duplicate');
    return Response.json(
      { error: error.message, code: duplicate ? 'duplicate' : 'insert_failed' },
      { status: duplicate ? 409 : 500, headers }
    );
  }

  return Response.json({ ok: true }, { status: 200, headers });
}

```

### `src/components/b2b/ComplianceCheckbox.tsx`

```tsx
import { useState, type ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ComplianceCheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  modalTitle: string;
  modalContent: ReactNode;
  disabled?: boolean;
};

export function ComplianceCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  modalTitle,
  modalContent,
  disabled = false,
}: ComplianceCheckboxProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-3 rounded-lg border border-slate-600/80 bg-slate-800/40 px-4 py-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          disabled={disabled}
          className="mt-0.5 border-slate-500 data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900"
        />
        <div className="min-w-0 flex-1 text-right">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-sm leading-relaxed text-slate-200 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {label}
          </button>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          dir="rtl"
          className="max-h-[85vh] overflow-y-auto border-slate-600 bg-slate-900 text-slate-100 sm:max-w-lg"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-white">{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-slate-300">{modalContent}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}

```

### `src/components/b2b/ComplianceManifestoContent.tsx`

```tsx
import {
  HONOR_BOARD_CORE_VALUES,
  HONOR_BOARD_MANIFESTO_PARAGRAPHS,
  HONOR_BOARD_MANIFESTO_TITLE,
  HONOR_BOARD_PROFESSIONAL_COMMITMENT_LEAD,
  REGISTRATION_LEGAL_DISCLAIMER_AR,
} from '@/config/honorBoardManifesto';

function CoreValuesList({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? 'divide-y divide-slate-700/60 rounded-lg border border-slate-600/40 bg-slate-950/50'
          : 'divide-y divide-slate-700/60 rounded-lg border border-slate-600/40 bg-slate-950/50'
      }
    >
      {HONOR_BOARD_CORE_VALUES.map((section) => (
        <div key={section.id} className="px-4 py-3">
          <p className="mb-1 text-xs font-semibold tracking-wide text-slate-400">{section.label}</p>
          <p className="text-sm leading-relaxed text-slate-300">{section.body}</p>
        </div>
      ))}
    </div>
  );
}

export function LegalPledgeModalContent() {
  return (
    <>
      <p className="text-pretty font-medium text-slate-200">{REGISTRATION_LEGAL_DISCLAIMER_AR}</p>
      <p className="text-pretty text-slate-400">
        بموجب هذا التعهد تُقرّ منشأتك ممتثلة لاشتراطات الجهات المذكورة، وتتحمّل أنت المسؤولية القانونية
        كاملة دون المطالبة بمنصة حلاق ماب عن التبعات الناشئة عن صحة ذلك الامتثال أو غيابه.
      </p>
      <CoreValuesList compact />
    </>
  );
}

export function ProfessionalCommitmentModalContent() {
  return (
    <>
      <p className="text-pretty font-medium text-slate-200">{HONOR_BOARD_PROFESSIONAL_COMMITMENT_LEAD}</p>
      <p className="text-pretty text-slate-400">{HONOR_BOARD_MANIFESTO_TITLE}</p>
      <div className="space-y-3">
        {HONOR_BOARD_MANIFESTO_PARAGRAPHS.map((paragraph, index) => (
          <p key={index} className="text-pretty">
            {paragraph}
          </p>
        ))}
      </div>
      <CoreValuesList />
    </>
  );
}

```

### `src/components/admin/CorporateProductComplianceCard.tsx`

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronDown, FileBadge, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  CORPORATE_PRODUCT_COMPLIANCE_BADGE,
  CORPORATE_PRODUCT_COMPLIANCE_SECTIONS,
  CORPORATE_PRODUCT_COMPLIANCE_TITLE,
} from '@/config/corporateProductCompliance';
import { cn } from '@/lib/utils';

type CorporateProductComplianceCardProps = {
  variant?: 'admin' | 'public';
};

export function CorporateProductComplianceCard({ variant = 'admin' }: CorporateProductComplianceCardProps) {
  const isPublic = variant === 'public';
  const [expanded, setExpanded] = useState(true);

  const card = (
    <Card className="h-full overflow-hidden border-emerald-600/25 bg-gradient-to-br from-emerald-500/[0.06] via-amber-500/[0.04] to-background shadow-sm ring-1 ring-amber-500/10">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2 text-right flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge className="gap-1.5 border-0 bg-gradient-to-r from-emerald-700 to-emerald-600 text-emerald-50 hover:from-emerald-700 hover:to-emerald-600 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                {CORPORATE_PRODUCT_COMPLIANCE_BADGE}
              </Badge>
              <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                مرجع تدقيق
              </Badge>
            </div>
            <CardTitle
              id={isPublic ? 'corporate-product-compliance-title' : undefined}
              className="flex items-center gap-2 text-xl justify-end leading-snug"
            >
              <FileBadge className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              {CORPORATE_PRODUCT_COMPLIANCE_TITLE}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed mr-0 ml-auto max-w-2xl">
              {isPublic
                ? 'مرجع رسمي للتعريف المؤسسي بالمنتج — متاح للمراجعين والتدقيق التجاري على الصفحة العامة.'
                : 'مرجع رسمي للتعريف المؤسسي بالمنتج — جاهز للعرض في مراجعات الأعمال والامتثال الرقمي.'}
            </CardDescription>
          </div>
          {!isPublic ? (
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="gap-1 shrink-0">
                {expanded ? 'طي الوثيقة' : 'عرض الوثيقة'}
                <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
          ) : null}
        </div>
      </CardHeader>

      {isPublic ? (
        <CardContent className="pt-0 pb-6">
          <ComplianceSectionsTable />
        </CardContent>
      ) : (
        <CollapsibleContent>
          <CardContent className="pt-0 pb-6">
            <ComplianceSectionsTable />
          </CardContent>
        </CollapsibleContent>
      )}
    </Card>
  );

  const motionProps = isPublic
    ? {
        initial: { opacity: 0, y: 20 } as const,
        whileInView: { opacity: 1, y: 0 } as const,
        viewport: { once: true, margin: '-40px' } as const,
        transition: { duration: 0.55, ease: 'easeOut' } as const,
      }
    : {
        initial: { opacity: 0, y: 16 } as const,
        animate: { opacity: 1, y: 0 } as const,
        transition: { duration: 0.45, delay: 0.05 } as const,
      };

  if (isPublic) {
    return (
      <motion.div {...motionProps} className="h-full">
        {card}
      </motion.div>
    );
  }

  return (
    <motion.div {...motionProps} className="h-full">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        {card}
      </Collapsible>
    </motion.div>
  );
}

function ComplianceSectionsTable() {
  return (
    <div className="rounded-xl border border-emerald-600/15 bg-background/70 backdrop-blur-sm divide-y divide-border/60">
      {CORPORATE_PRODUCT_COMPLIANCE_SECTIONS.map((section) => (
        <div key={section.id} className="px-4 py-4 sm:px-5 sm:py-4 text-right">
          <p className="text-xs font-semibold tracking-wide text-emerald-800/80 dark:text-emerald-300/90 mb-1.5">
            {section.label}
          </p>
          <p className="text-sm sm:text-[0.9375rem] leading-relaxed text-foreground/90">{section.body}</p>
        </div>
      ))}
    </div>
  );
}

```
