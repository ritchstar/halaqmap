# Bugbot Security Rules (Repository)

Apply these checks on every PR update.

## Priority
- Focus on security regressions first, then reliability regressions.
- Treat auth/permission bypass and secret leakage as blockers.

## Mandatory Security Checks
- Verify all API routes enforce auth/guard checks before DB mutations.
- Flag any new endpoint that accepts `Authorization`-like inputs but skips server-side verification.
- Flag CORS changes that broaden origins/headers without clear need.
- Flag direct use of service-role credentials in client code paths.
- Flag logs that may expose tokens, API keys, personally identifiable data, or internal IDs.
- Flag any use of `eval`, dynamic `Function`, or unsafe command execution patterns.

## Data/Permission Integrity
- Ensure admin-only actions validate role/permission explicitly.
- Ensure public routes keep rate limits and origin guard behavior intact.
- Flag changes that weaken RLS assumptions or bypass guard helpers.

## Dependency/Runtime Hygiene
- Flag newly introduced high/critical vulnerabilities in lockfile diffs.
- Flag unbounded retries/timeouts in external network calls.

## Review Output Requirements
- Report findings with:
  1) severity,
  2) exact file and code location,
  3) exploit/failure path,
  4) concrete fix suggestion.
