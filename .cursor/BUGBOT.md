# Bugbot Security Rules — HalaqMap

Apply these checks on every PR update. Security regressions first, then reliability.
Treat auth/permission bypass and secret leakage as **blockers**.

## Priority paths (highest scrutiny)

- `api/**` — especially registration, onboarding mail, payments, webhooks, admin actions
- `supabase/migrations/**` — RLS, grants, RPCs (`create_booking_safe`, etc.)
- `src/pages/**Register**`, `src/lib/**Remote*`, booking/payment clients
- Partner / ambassador / staff portal auth and session handling

## Access control & RLS (IDOR)

- Flag any DB read/write that trusts client-supplied IDs without ownership/role checks
  (barber_id, user_id, order id, registration id, ambassador code, staff token).
- Partner/admin APIs must verify session + permission server-side before mutations.
- New `public` tables/views must enable RLS (or be service-role only with grants revoked from `anon`/`authenticated`).
- Flag changes that weaken RLS, broaden grants to `anon`/`authenticated`, or bypass guard helpers.
- Flag admin-only actions that skip explicit role/permission validation.

## Bookings — race conditions

- Booking create/update paths must keep advisory locks / transactional overlap checks
  (e.g. `create_booking_safe` pattern). Flag removal of locks or “check-then-insert” without serialization.
- Flag concurrent slot claims that can double-book the same barber/time.

## Payments (Moyasar) & webhooks

- Webhooks and payment confirmations must verify signature / authenticity and payment status
  before activating packages, entitlements, or certificates.
- Flag trusting client-reported “paid” without server-side verification.
- Flag idempotency gaps that can double-fulfill the same payment.

## Secrets & auth bypass

- No hardcoded API keys, Supabase service role, Moyasar secrets, or DB credentials in source.
- Use env vars only; never suggest committing `.env` or key material.
- Forbid production auth bypass, “skip auth for tests”, or temporary headers that disable guards.
- Flag service-role usage in client/browser bundles.
- Flag logs that may leak tokens, keys, PII, or internal secrets.

## API surface hygiene

- New/changed endpoints must enforce auth/guards before DB mutations.
- Flag CORS broadenings without clear need.
- Keep rate limits and registration/origin guards intact on public routes.
- Flag `eval`, `new Function`, or unsafe shell/command execution.

## Dependency / runtime

- Flag newly introduced high/critical vulnerabilities in lockfile diffs.
- Flag unbounded retries/timeouts on external network calls (Resend, Moyasar, Supabase).

## Review output (required)

For each finding report:

1. severity (blocker / high / medium / low)
2. exact file and location
3. exploit or failure path
4. concrete fix suggestion
