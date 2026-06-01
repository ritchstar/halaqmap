import { z } from 'zod'

const prohibitedClientKeys = new Set([
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'VITE_OPENAI_API_KEY',
  'VITE_MOYSAR_SECRET_API_KEY',
  'VITE_REGISTRATION_INTENT_SECRET',
  'VITE_OPS_BILLING_CRON_SECRET',
  'VITE_SIMULATE_BOOKING_OVERLAP_SECRET',
])

const prohibitedClientPatterns = [
  /SERVICE_ROLE/i,
  /OPENAI_API_KEY/i,
  /SECRET_API_KEY/i,
  /_PRIVATE_KEY/i,
  /INTENT_SECRET/i,
]

const runtimeClientEnvSchema = z
  .object({
    VITE_SUPABASE_URL: z.string().trim().url().optional(),
    VITE_SUPABASE_ANON_KEY: z.string().trim().min(1).optional(),
    VITE_PAYMENT_GATEWAY: z.enum(['MOYASAR', 'SAB']).optional(),
    VITE_PLATFORM_VAT_DEFAULT_PERCENT: z.string().trim().optional(),
  })
  .passthrough()

function findDangerousClientEnvKeys(): string[] {
  return Object.keys(import.meta.env)
    .filter((key) => key.startsWith('VITE_'))
    .filter((key) => {
      if (prohibitedClientKeys.has(key)) return true
      if (key.startsWith('VITE_MOYSAR_PUBLISHABLE_')) return false
      return prohibitedClientPatterns.some((pattern) => pattern.test(key))
    })
}

function assertVatPercent(raw: string | undefined): void {
  if (!raw) return
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new Error(
      `[env] VITE_PLATFORM_VAT_DEFAULT_PERCENT must be a number between 0 and 100 (received: "${raw}")`,
    )
  }
}

export function assertRuntimeEnvSafety(): void {
  const dangerous = findDangerousClientEnvKeys()
  if (dangerous.length > 0) {
    throw new Error(
      `[env] Sensitive variables are exposed to the client bundle: ${dangerous.join(', ')}`,
    )
  }

  const parsed = runtimeClientEnvSchema.safeParse(import.meta.env)
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join(' | ')
    throw new Error(`[env] Invalid runtime env configuration: ${details}`)
  }

  const data = parsed.data
  if (Boolean(data.VITE_SUPABASE_URL) !== Boolean(data.VITE_SUPABASE_ANON_KEY)) {
    throw new Error('[env] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set together.')
  }

  assertVatPercent(data.VITE_PLATFORM_VAT_DEFAULT_PERCENT)
}
