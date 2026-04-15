# Security Triage Automation

هذا الإعداد يفرز ضجيج تنبيهات الأمان تلقائياً ويركز على الحالات الحرجة.

## What this adds

- Workflow: `.github/workflows/security-triage.yml`
- Script: `scripts/security-triage.mjs`
- Daily run + manual run
- Slack summary (اختياري عبر Webhook secret)
- Artifact report (`security-triage-report.md`)

## One-time setup

1. GitHub -> Repository -> Settings -> Secrets and variables -> Actions.
2. Add secret:
   - `SECURITY_TRIAGE_SLACK_WEBHOOK` = Slack Incoming Webhook URL.
3. Push to target branch (عادة `main`).

## Run manually

1. GitHub -> Actions -> **Security Triage**.
2. Click **Run workflow**.
3. اختر الفرع المستهدف.
4. (اختياري) `fail_on_critical=true` إذا أردت كسر التنفيذ عند وجود Critical.

## Output

- Slack message with counts + top critical/high packages.
- Downloadable artifacts:
  - `npm-audit.json`
  - `security-triage-report.md`

## Notes

- هذا يركز على `npm audit` (Node ecosystem).
- إذا تريد دمج GitHub Dependabot/CodeQL alerts بنفس التقرير، يمكن إضافة خطوة GitHub API لاحقاً.
