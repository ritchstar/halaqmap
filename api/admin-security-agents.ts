/**
 * admin-security-agents â€” ظˆظƒظ„ط§ط، ط§ظ„ط£ظ…ظ† ط§ظ„ط³ظٹط¨ط±ط§ظ†ظٹ ط§ظ„ط­ظ‚ظٹظ‚ظٹظˆظ†
 *
 * Actions:
 *  proactive_scout    â€” ظٹط³طھط¹ظ„ظ… security_events ظˆظٹط±طµط¯ IPs ط°ط§طھ ظ…ط¹ط¯ظ„ ظ…طھطµط§ط¹ط¯
 *  forensic_analysis  â€” ظٹظƒط´ظپ ط£ظ†ظ…ط§ط· ط§ظ„ظ‡ط¬ظˆظ… ط§ظ„ظ…ظˆط²ظ‘ط¹ ظˆط§ظ„ط¨ط·ظٹط،
 *  threat_neutralize  â€” ظٹظڈظ†ظپظ‘ط° ط­ط¸ط±ط§ظ‹ ط´ط§ظ…ظ„ط§ظ‹ (DB + Cloudflare) ظپظٹ ط¢ظ†ظچ ظˆط§ط­ط¯
 */

import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { blockIpCloudflare, cfConfigured } from './_lib/cloudflareGuard.js';

export const config = { maxDuration: 30 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, ['view_command_center', 'manage_admins']);
  if (!auth.ok) return json(auth.json, auth.status);

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const action = String(body.action || '').trim();
  const supabase = createClient(serverUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
  // â—† ط¹ظ…ظٹظ„ ط§ظ„ط§ط³طھط·ظ„ط§ط¹ ط§ظ„ط§ط³طھط¨ط§ظ‚ظٹ â€” ظٹظƒط´ظپ ط§ظ„طھظ‡ط¯ظٹط¯ط§طھ ظ‚ط¨ظ„ ظˆظ‚ظˆط¹ظ‡ط§
  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
  if (action === 'proactive_scout') {
    const windowMin = Number(body.windowMinutes ?? 10);
    const since = new Date(Date.now() - windowMin * 60_000).toISOString();

    // ظ،. IPs ط°ط§طھ ظ…ط¹ط¯ظ„ ظ…طھطµط§ط¹ط¯ ط®ظ„ط§ظ„ ط§ظ„ظ€ N ط¯ظ‚ط§ط¦ظ‚ ط§ظ„ط£ط®ظٹط±ط©
    const { data: recentEvents } = await supabase
      .from('security_events')
      .select('ip, event_type, severity, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200);

    // طھط­ظ„ظٹظ„ ظ…ط¹ط¯ظ„ ط§ظ„ط·ظ„ط¨ط§طھ ظ„ظƒظ„ IP
    const ipStats: Record<string, { count: number; critical: number; warning: number; endpoints: Set<string> }> = {};
    for (const ev of recentEvents ?? []) {
      if (!ipStats[ev.ip]) ipStats[ev.ip] = { count: 0, critical: 0, warning: 0, endpoints: new Set() };
      ipStats[ev.ip].count++;
      if (ev.severity === 'critical') ipStats[ev.ip].critical++;
      if (ev.severity === 'warning') ipStats[ev.ip].warning++;
    }

    // ط§ظ„ظ€ IPs ط§ظ„ظ…ط´ط¨ظˆظ‡ط© (ط£ظƒط«ط± ظ…ظ† 5 ط£ط­ط¯ط§ط« ظپظٹ ط§ظ„ظپطھط±ط©)
    const suspicious = Object.entries(ipStats)
      .filter(([, s]) => s.count >= 5)
      .sort(([, a], [, b]) => b.critical - a.critical || b.count - a.count)
      .slice(0, 10)
      .map(([ip, s]) => ({ ip, count: s.count, critical: s.critical, warning: s.warning }));

    // ظ¢. طھط­ظ„ظٹظ„ ظ…ط¹ط¯ظ„ ط§ظ„طھط³ط§ط±ط¹ (ظ‡ظ„ ظٹطھطµط§ط¹ط¯طں)
    const halfWindow = new Date(Date.now() - (windowMin / 2) * 60_000).toISOString();
    const { count: recentHalf } = await supabase
      .from('security_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', halfWindow);
    const { count: olderHalf } = await supabase
      .from('security_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)
      .lt('created_at', halfWindow);

    const acceleration = (olderHalf ?? 0) > 0 ? ((recentHalf ?? 0) / (olderHalf ?? 1)) : 1;
    const threatLevel = acceleration > 3 ? 'critical' : acceleration > 1.5 ? 'elevated' : 'normal';

    // طھظ‚ط±ظٹط± ط§ظ„ظˆظƒظٹظ„
    const reportLines: string[] = [];
    reportLines.push(`ط¹ظ…ظٹظ„ ط§ظ„ط§ط³طھط·ظ„ط§ط¹ ط§ظ„ط§ط³طھط¨ط§ظ‚ظٹ â€” طھظ‚ط±ظٹط± ${windowMin} ط¯ظ‚ظٹظ‚ط© ط§ظ„ط£ط®ظٹط±ط©`);
    reportLines.push(`ظ…ط³طھظˆظ‰ ط§ظ„طھظ‡ط¯ظٹط¯: ${threatLevel === 'critical' ? 'ًںڑ¨ ط­ط±ط¬' : threatLevel === 'elevated' ? 'âڑ ï¸ڈ ظ…ط±طھظپط¹' : 'âœ… ط·ط¨ظٹط¹ظٹ'}`);
    reportLines.push(`ظ…ط¹ط¯ظ„ ط§ظ„طھط³ط§ط±ط¹: أ—${acceleration.toFixed(1)} (ط§ظ„ظ†طµظپ ط§ظ„ط«ط§ظ†ظٹ vs ط§ظ„ط£ظˆظ„)`);
    if (suspicious.length > 0) {
      reportLines.push(`IPs ظ…ط´ط¨ظˆظ‡ط©: ${suspicious.length}`);
      suspicious.slice(0, 3).forEach(s =>
        reportLines.push(`  آ· ${s.ip} â€” ${s.count} ط­ط¯ط« (${s.critical} ط­ط±ط¬)`));
    } else {
      reportLines.push('ظ„ط§ ظ…طµط§ط¯ط± ظ…ط´ط¨ظˆظ‡ط© ط¨ط§ط±ط²ط© ظپظٹ ط§ظ„ظپطھط±ط© ط§ظ„ظ…ط±ط§ظ‚ظژط¨ط©');
    }

    return json({
      ok: true,
      agent: 'proactive_scout',
      threatLevel,
      acceleration: Number(acceleration.toFixed(2)),
      suspiciousIps: suspicious,
      report: reportLines.join('\n'),
      agentResponse: {
        agentId: 'proactive_scout',
        agentLabelAr: 'ط¹ظ…ظٹظ„ ط§ظ„ط§ط³طھط·ظ„ط§ط¹ ط§ظ„ط§ط³طھط¨ط§ظ‚ظٹ',
        actionLabelAr: threatLevel === 'critical' ? 'ًںڑ¨ طھط­ط°ظٹط± ظ…ط¨ظƒط±' : 'ًں”چ ظ…ط³ط­ ط§ط³طھط¨ط§ظ‚ظٹ',
        explanationAr: reportLines.join(' آ· '),
        severity: threatLevel === 'critical' ? 'critical' : threatLevel === 'elevated' ? 'elevated' : 'info',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
  // â—† ظ…ط­ظ„ظ„ ط§ظ„ط¬ظ†ط§ط¦ظٹط§طھ ط§ظ„ط±ظ‚ظ…ظٹط© â€” ظٹظƒط´ظپ ط§ظ„ط£ظ†ظ…ط§ط· ط§ظ„ط®ظپظٹط©
  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
  if (action === 'forensic_analysis') {
    const hours = Number(body.hours ?? 24);
    const since = new Date(Date.now() - hours * 3_600_000).toISOString();

    const { data: events } = await supabase
      .from('security_events')
      .select('ip, event_type, endpoint, severity, created_at, ip_country, ip_city')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(500);

    const evs = events ?? [];

    // ظ،. ظƒط´ظپ ط§ظ„ظ‡ط¬ظˆظ… ط§ظ„ظ…ظˆط²ظ‘ط¹ (ظ†ظپط³ ط§ظ„ظ€ endpointطŒ IPs ظ…ط®طھظ„ظپط©)
    const endpointTargets: Record<string, Set<string>> = {};
    for (const e of evs) {
      if (e.endpoint) {
        if (!endpointTargets[e.endpoint]) endpointTargets[e.endpoint] = new Set();
        endpointTargets[e.endpoint].add(e.ip);
      }
    }
    const distributedAttacks = Object.entries(endpointTargets)
      .filter(([, ips]) => ips.size >= 3)
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 5)
      .map(([endpoint, ips]) => ({ endpoint, uniqueIps: ips.size }));

    // ظ¢. ظƒط´ظپ ط§ظ„ظ‡ط¬ظˆظ… ط§ظ„ط¨ط·ظٹط، (IP ظˆط§ط­ط¯طŒ ظپطھط±ط© ط·ظˆظٹظ„ط©)
    const ipTimeline: Record<string, number[]> = {};
    for (const e of evs) {
      if (!ipTimeline[e.ip]) ipTimeline[e.ip] = [];
      ipTimeline[e.ip].push(new Date(e.created_at).getTime());
    }
    const slowAttackers = Object.entries(ipTimeline)
      .filter(([, times]) => {
        if (times.length < 5) return false;
        const span = (times[times.length - 1] - times[0]) / 60_000; // minutes
        const rate = times.length / span;
        return span > 30 && rate < 2; // ط¨ط·ظٹط، ط¬ط¯ط§ظ‹ â€” ظٹطھط¬ظ†ط¨ rate limiting
      })
      .map(([ip, times]) => ({
        ip,
        events: times.length,
        spanMinutes: Math.round((times[times.length - 1] - times[0]) / 60_000),
      }))
      .slice(0, 5);

    // ظ£. طھط­ظ„ظٹظ„ ط¬ط؛ط±ط§ظپظٹ
    const countries: Record<string, number> = {};
    for (const e of evs) {
      if (e.ip_country) countries[e.ip_country] = (countries[e.ip_country] ?? 0) + 1;
    }
    const topCountries = Object.entries(countries).sort(([,a],[,b])=>b-a).slice(0, 5).map(([c,n])=>({country:c,count:n}));

    const findings: string[] = [];
    findings.push(`ظ…ط­ظ„ظ„ ط§ظ„ط¬ظ†ط§ط¦ظٹط§طھ ط§ظ„ط±ظ‚ظ…ظٹط© â€” طھط­ظ„ظٹظ„ ${hours} ط³ط§ط¹ط© ط§ظ„ط£ط®ظٹط±ط©`);
    if (distributedAttacks.length > 0) {
      findings.push(`ًں”´ ظ‡ط¬ظˆظ… ظ…ظˆط²ظ‘ط¹ ط¹ظ„ظ‰ ${distributedAttacks[0].endpoint} ظ…ظ† ${distributedAttacks[0].uniqueIps} ظ…طµط§ط¯ط±`);
    }
    if (slowAttackers.length > 0) {
      findings.push(`ًںگ¢ ظ‡ط¬ظˆظ… ط¨ط·ظٹط، ظ…ظƒطھط´ظپ: ${slowAttackers[0].ip} â€” ${slowAttackers[0].events} ط­ط¯ط« ط®ظ„ط§ظ„ ${slowAttackers[0].spanMinutes} ط¯ظ‚ظٹظ‚ط©`);
    }
    if (topCountries.length > 0) {
      findings.push(`ًںŒچ ط£ظƒط«ط± ظ…طµط¯ط± ط¬ط؛ط±ط§ظپظٹ: ${topCountries[0].country} (${topCountries[0].count} ط­ط¯ط«)`);
    }
    if (findings.length === 1) findings.push('ظ„ط§ ط£ظ†ظ…ط§ط· ظ‡ط¬ظˆظ… ط®ظپظٹط© ظ…ظƒطھط´ظپط© ظپظٹ ط§ظ„ظپطھط±ط© ط§ظ„ظ…ط­ظ„ظ„ط©');

    return json({
      ok: true,
      agent: 'forensic_analyst',
      distributedAttacks,
      slowAttackers,
      topCountries,
      report: findings.join('\n'),
      agentResponse: {
        agentId: 'forensic_analyst',
        agentLabelAr: 'ظ…ط­ظ„ظ„ ط§ظ„ط¬ظ†ط§ط¦ظٹط§طھ ط§ظ„ط±ظ‚ظ…ظٹط©',
        actionLabelAr: distributedAttacks.length > 0 ? 'ًں”´ ظ‡ط¬ظˆظ… ظ…ظˆط²ظ‘ط¹ ظ…ظƒطھط´ظپ' : slowAttackers.length > 0 ? 'ًںگ¢ ظ‡ط¬ظˆظ… ط¨ط·ظٹط، ظ…ظƒطھط´ظپ' : 'âœ… ظ„ط§ ط£ظ†ظ…ط§ط· ط®ظپظٹط©',
        explanationAr: findings.join(' آ· '),
        severity: distributedAttacks.length > 0 ? 'critical' : slowAttackers.length > 0 ? 'elevated' : 'info',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
  // â—† ظ…ط­ظٹظ‘ط¯ ط§ظ„طھظ‡ط¯ظٹط¯ط§طھ â€” طھط­ظٹظٹط¯ ط´ط§ظ…ظ„ DB + Cloudflare
  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
  if (action === 'threat_neutralize') {
    const targets = Array.isArray(body.ips)
      ? (body.ips as unknown[]).map(String).filter(Boolean).slice(0, 20)
      : [String(body.ip || '').trim()].filter(Boolean);

    if (targets.length === 0) return json({ error: 'No IPs provided' }, 400);

    const reason = String(body.reason || 'Threat Neutralizer â€” coordinated neutralization').trim();
    const results: { ip: string; db: boolean; cf: boolean; cfRuleId?: string }[] = [];

    for (const ip of targets) {
      // ظ،. ط­ط¸ط± ظپظٹ Supabase
      const { error: dbErr } = await supabase.from('security_block_list').upsert({
        ip, reason: `[NEUTRALIZER] ${reason}`, blocked_by: auth.actorEmail, active: true,
        metadata: { source: 'threat_neutralizer', timestamp: new Date().toISOString() },
      }, { onConflict: 'ip' });

      // ظ¢. ط­ط¸ط± ط¹ظ„ظ‰ Cloudflare Edge
      const cfResult = cfConfigured() ? await blockIpCloudflare(ip, reason, 'block') : { ok: false };

      // ظ£. طھط³ط¬ظٹظ„ ط§ظ„ط­ط¯ط«
      await supabase.from('security_events').insert({
        ip, event_type: 'blocked_ip_attempt', severity: 'critical',
        endpoint: '/security/neutralize',
        detail: { db_ok: !dbErr, cf_ok: cfResult.ok, reason, neutralized_by: auth.actorEmail },
      });

      results.push({ ip, db: !dbErr, cf: cfResult.ok, cfRuleId: 'ruleId' in cfResult ? cfResult.ruleId : undefined });
    }

    const allNeutralized = results.every(r => r.db && r.cf);
    const partialNeutralized = results.some(r => r.db || r.cf);

    return json({
      ok: true,
      agent: 'threat_neutralizer',
      results,
      agentResponse: {
        agentId: 'threat_neutralizer',
        agentLabelAr: 'ظ…ط­ظٹظ‘ط¯ ط§ظ„طھظ‡ط¯ظٹط¯ط§طھ',
        actionLabelAr: allNeutralized ? 'âڑ، طھط­ظٹظٹط¯ ط´ط§ظ…ظ„ â€” DB + CF' : partialNeutralized ? 'âڑ، طھط­ظٹظٹط¯ ط¬ط²ط¦ظٹ' : 'â‌Œ ظپط´ظ„ ط§ظ„طھط­ظٹظٹط¯',
        explanationAr: `طھظ…ظ‘ طھط­ظٹظٹط¯ ${targets.length} ظ…طµط¯ط± طھظ‡ط¯ظٹط¯. ${results.filter(r=>r.db).length} ظ…ط­ط¬ظˆط¨ ظپظٹ DB ظˆ${results.filter(r=>r.cf).length} ظ…ط­ط¬ظˆط¨ ط¹ظ„ظ‰ Cloudflare Edge. ط§ظ„طھط£ط«ظٹط±: ظپظˆط±ظٹ ط¹ظ„ظ‰ ط¬ظ…ظٹط¹ ط§ظ„ظ…ط³ط§ط±ط§طھ.`,
        severity: 'critical',
        timestamp: new Date().toISOString(),
      },
    });
  }

  return json({ error: 'Unknown action' }, 400);
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  });
}

