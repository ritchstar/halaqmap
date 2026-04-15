#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

function nowIso() {
  return new Date().toISOString();
}

function toTitle(text) {
  if (!text) return '';
  return String(text).replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function takeTop(items, limit = 8) {
  return items.slice(0, limit);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeVulnerabilityEntry(name, entry) {
  const severity = String(entry?.severity || 'unknown');
  const via = asArray(entry?.via);
  const fixAvailable = entry?.fixAvailable;
  const range = String(entry?.range || '');
  const nodes = asArray(entry?.nodes).slice(0, 3);

  const details = via
    .map((v) => {
      if (typeof v === 'string') return { title: v, url: '' };
      return {
        title: String(v?.title || v?.name || 'Unknown advisory'),
        url: String(v?.url || ''),
      };
    })
    .filter((v) => v.title);

  return {
    package: name,
    severity,
    range,
    nodes,
    details,
    fixAvailable,
  };
}

function severityRank(level) {
  if (level === 'critical') return 5;
  if (level === 'high') return 4;
  if (level === 'moderate') return 3;
  if (level === 'low') return 2;
  return 1;
}

function extractVulnerabilities(auditJson) {
  const entries = Object.entries(auditJson?.vulnerabilities || {});
  return entries
    .map(([name, entry]) => normalizeVulnerabilityEntry(name, entry))
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function markdownReport(counts, vulnerabilities) {
  const topCriticalHigh = takeTop(
    vulnerabilities.filter((v) => v.severity === 'critical' || v.severity === 'high'),
    12
  );

  const lines = [
    `# Security Triage Report`,
    ``,
    `Generated: ${nowIso()}`,
    ``,
    `## Summary`,
    `- Critical: ${counts.critical ?? 0}`,
    `- High: ${counts.high ?? 0}`,
    `- Moderate: ${counts.moderate ?? 0}`,
    `- Low: ${counts.low ?? 0}`,
    ``,
    `## Priority Queue (Critical + High)`,
  ];

  if (topCriticalHigh.length === 0) {
    lines.push(`- No critical/high vulnerabilities detected.`);
  } else {
    for (const v of topCriticalHigh) {
      const fix =
        v.fixAvailable === true
          ? 'Fix available: yes'
          : typeof v.fixAvailable === 'object'
            ? `Fix available: ${String(v.fixAvailable.name || 'yes')}`
            : 'Fix available: no';
      const detail = v.details[0]?.title || 'No advisory title';
      lines.push(
        `- [${v.severity.toUpperCase()}] \`${v.package}\` ${v.range ? `(${v.range})` : ''} — ${detail}. ${fix}`
      );
    }
  }

  lines.push('', '## Root Fix Suggestions');
  lines.push('- Upgrade direct dependencies first (`npm outdated`, then bump and test).');
  lines.push('- For transitive issues, use package updates or lockfile refresh (`npm update`).');
  lines.push('- If no fix exists, isolate exposure (feature flags, input validation, sandboxing).');
  lines.push('- Re-run this workflow after each dependency update to verify closure.');
  lines.push('');

  return lines.join('\n');
}

async function postToSlack(webhookUrl, counts, vulnerabilities, reportPath) {
  if (!webhookUrl) return;
  const criticalHigh = vulnerabilities.filter(
    (v) => v.severity === 'critical' || v.severity === 'high'
  );
  const preview = takeTop(criticalHigh, 5)
    .map((v) => `• ${v.severity.toUpperCase()} ${v.package}`)
    .join('\n');
  const text =
    `Security triage completed for this run.\n` +
    `Critical: ${counts.critical ?? 0}, High: ${counts.high ?? 0}, Moderate: ${counts.moderate ?? 0}, Low: ${counts.low ?? 0}\n` +
    (preview ? `Top priority:\n${preview}\n` : 'No critical/high findings.\n') +
    `Artifact report: ${reportPath}`;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

async function main() {
  const auditPath = process.argv[2] || 'npm-audit.json';
  const reportPath = process.env.SECURITY_TRIAGE_REPORT || 'security-triage-report.md';
  const failOnCritical = String(process.env.FAIL_ON_CRITICAL || '').toLowerCase() === 'true';

  const raw = await readFile(auditPath, 'utf8');
  const auditJson = JSON.parse(raw);
  const counts = auditJson?.metadata?.vulnerabilities || {};
  const vulnerabilities = extractVulnerabilities(auditJson);

  const report = markdownReport(counts, vulnerabilities);
  await writeFile(reportPath, report, 'utf8');
  console.log(report);

  await postToSlack(process.env.SLACK_WEBHOOK_URL || '', counts, vulnerabilities, reportPath);

  if (failOnCritical && (counts.critical ?? 0) > 0) {
    console.error('Failing job because critical vulnerabilities were found.');
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('security-triage failed:', err?.message || err);
  process.exit(1);
});
