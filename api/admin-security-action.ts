/**
 * admin-security-action â€” ظ‚ظٹط§ط¯ط© ط§ظ„ط¯ظپط§ط¹ ط§ظ„ط­ظ‚ظٹظ‚ظٹط© ظ…ظ† ط؛ط±ظپط© ط§ظ„ط¹ظ…ظ„ظٹط§طھ
 *
 * Actions:
 *  آ· block_ip      â€” ط­ط¸ط± IP ظپظٹ ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ (ظٹط³ط±ظٹ ظپظˆط±ط§ظ‹)
 *  آ· unblock_ip    â€” ط±ظپط¹ ط§ظ„ط­ط¸ط±
 *  آ· get_threat_data â€” ط¨ظٹط§ظ†ط§طھ ط§ظ„طھظ‡ط¯ظٹط¯ ط§ظ„ط­ظ‚ظٹظ‚ظٹط© ظ„ظ„ظ…ط¯ط¹ظٹ ط§ظ„ط¹ط§ظ…
 *  آ· get_block_list  â€” ظ‚ط§ط¦ظ…ط© ط§ظ„ط­ط¸ط± ط§ظ„ظ†ط´ط·ط©
 */

import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  blockIpCloudflare,
  unblockIpCloudflare,
  setUnderAttackMode,
  getCfSecurityStatus,
  getCfFirewallRules,
  getCfThreatAnalytics,
  cfConfigured,
} from './_lib/cloudflareGuard.js';

export const config = { maxDuration: 20 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  // طھط­ظ‚ظ‚ ظ…ظ† طµظ„ط§ط­ظٹط© ط§ظ„ط£ط¯ظ…ظ†
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, ['manage_admins', 'view_command_center']);
  if (!auth.ok) return json(auth.json, auth.status);

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const action = String(body.action || '').trim();
  const supabase = createClient(serverUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // â”€â”€ ط­ط¸ط± IP ط­ظ‚ظٹظ‚ظٹ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'block_ip') {
    const ip = String(body.ip || '').trim();
    const reason = String(body.reason || 'Blocked from Cyber Ops Theater').trim().slice(0, 500);
    const expiresHours = typeof body.expiresHours === 'number' ? body.expiresHours : null;
    if (!ip) return json({ error: 'IP required' }, 400);

    const expiresAt = expiresHours
      ? new Date(Date.now() + expiresHours * 3_600_000).toISOString()
      : null;

    const { error } = await supabase.from('security_block_list').upsert({
      ip,
      reason,
      blocked_by: auth.actorEmail,
      active: true,
      expires_at: expiresAt,
      metadata: { source: 'cyber_ops_theater', timestamp: new Date().toISOString() },
    }, { onConflict: 'ip' });

    if (error) return json({ error: error.message }, 500);

    // ط³ط¬ظ‘ظ„ ط§ظ„ط­ط¯ط«
    await supabase.from('security_events').insert({
      ip, event_type: 'blocked_ip_attempt', severity: 'critical',
      endpoint: '/admin/security/block',
      detail: { action: 'block', reason, blocked_by: auth.actorEmail, expires_at: expiresAt },
    });

    return json({ ok: true, message: `IP ${ip} ظ…ط­ط¬ظˆط¨ ظپظˆط±ط§ظ‹` });
  }

  // â”€â”€ ط±ظپط¹ ط§ظ„ط­ط¸ط± â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'unblock_ip') {
    const ip = String(body.ip || '').trim();
    if (!ip) return json({ error: 'IP required' }, 400);

    await supabase.from('security_block_list').update({ active: false }).eq('ip', ip);
    return json({ ok: true, message: `طھظ… ط±ظپط¹ ط§ظ„ط­ط¸ط± ط¹ظ† ${ip}` });
  }

  // â”€â”€ ط¨ظٹط§ظ†ط§طھ ط§ظ„طھظ‡ط¯ظٹط¯ ط§ظ„ط­ظ‚ظٹظ‚ظٹط© â€” ظ„ظ„ظ…ط¯ط¹ظٹ ط§ظ„ط¹ط§ظ… â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'get_threat_data') {
    const hours = Number(body.hours ?? 24);
    const since = new Date(Date.now() - hours * 3_600_000).toISOString();

    // ط£ط­ط¯ط§ط« ط£ظ…ظ†ظٹط© ط­ظ‚ظٹظ‚ظٹط©
    const [
      { data: events, count: eventCount },
      { data: critical },
      { data: blockedAttempts },
      { data: topIps },
    ] = await Promise.all([
      supabase.from('security_events')
        .select('*', { count: 'exact' })
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('security_events')
        .select('*')
        .eq('severity', 'critical')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('security_events')
        .select('*')
        .eq('event_type', 'blocked_ip_attempt')
        .gte('created_at', since),
      supabase.from('security_events')
        .select('ip')
        .gte('created_at', since),
    ]);

    // طھط­ظ„ظٹظ„ ط£ظƒط«ط± IPs ظ†ط´ط§ط·ط§ظ‹
    const ipCounts: Record<string, number> = {};
    for (const e of topIps ?? []) {
      ipCounts[e.ip] = (ipCounts[e.ip] ?? 0) + 1;
    }
    const sortedIps = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    // ط£ط­ط¯ط§ط« ط¯ظپط¹ ظ…ط±ظٹط¨ط© (ظ…ظ† ط¬ط¯ظˆظ„ ظ…ظˆط¬ظˆط¯)
    const { count: paymentSecCount } = await supabase
      .from('payment_security_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since);

    // ط³ط¬ظ„ ط·ظ„ط¨ط§طھ ط§ظ„طھط³ط¬ظٹظ„ (ظ‚ط¯ ظٹط´ظٹط± ظ„ط¨ظˆطھ)
    const { count: regCount } = await supabase
      .from('registration_submissions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since);

    return json({
      ok: true,
      period: `ط¢ط®ط± ${hours} ط³ط§ط¹ط©`,
      summary: {
        totalEvents: eventCount ?? 0,
        criticalEvents: critical?.length ?? 0,
        blockedAttempts: blockedAttempts?.length ?? 0,
        paymentSecurityEvents: paymentSecCount ?? 0,
        registrationSubmissions: regCount ?? 0,
        uniqueIps: Object.keys(ipCounts).length,
      },
      topSuspiciousIps: sortedIps,
      recentCritical: critical ?? [],
      recentEvents: events ?? [],
    });
  }

  // â”€â”€ ظ‚ط§ط¦ظ…ط© ط§ظ„ط­ط¸ط± ط§ظ„ظ†ط´ط·ط© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'get_block_list') {
    const { data } = await supabase
      .from('security_block_list')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(100);
    return json({ ok: true, blocked: data ?? [] });
  }

  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
  // â—† Cloudflare â€” ط­ظ…ط§ظٹط© Edge ط­ظ‚ظٹظ‚ظٹط©
  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ

  // â”€â”€ ط­ط¸ط± IP ط¹ظ„ظ‰ Cloudflare Edge (ظ„ط§ ظٹطµظ„ ظ„ظ„ط³ظٹط±ظپط± ط£ط¨ط¯ط§ظ‹) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'cf_block_ip') {
    const ip = String(body.ip || '').trim();
    const reason = String(body.reason || 'Blocked from Cyber Ops Theater').trim().slice(0, 500);
    const mode = (['block', 'challenge', 'js_challenge'].includes(String(body.mode)) ? body.mode : 'block') as 'block' | 'challenge' | 'js_challenge';
    if (!ip) return json({ error: 'IP required' }, 400);

    // ظ،. Cloudflare Edge block
    const cfResult = await blockIpCloudflare(ip, reason, mode);

    // ظ¢. ط³ط¬ظ‘ظ„ ظپظٹ Supabase ط£ظٹط¶ط§ظ‹ (ظ„ظ„طھطھط¨ط¹ ط§ظ„ظ…ط­ظ„ظٹ)
    await supabase.from('security_block_list').upsert({
      ip, reason: `[CF] ${reason}`, blocked_by: auth.actorEmail, active: true,
      metadata: { source: 'cloudflare', cf_rule_id: cfResult.ruleId, mode },
    }, { onConflict: 'ip' });

    await supabase.from('security_events').insert({
      ip, event_type: 'blocked_ip_attempt', severity: 'critical',
      endpoint: '/cf/block',
      detail: { cf_ok: cfResult.ok, rule_id: cfResult.ruleId, mode, blocked_by: auth.actorEmail },
    });

    return json({ ok: cfResult.ok, cfConfigured: true, ruleId: cfResult.ruleId, error: cfResult.error });
  }

  // â”€â”€ ط±ظپط¹ ط­ط¸ط± ظ…ظ† Cloudflare â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'cf_unblock_ip') {
    const ip = String(body.ip || '').trim();
    const ruleId = String(body.ruleId || '').trim();
    if (!ip && !ruleId) return json({ error: 'ip or ruleId required' }, 400);

    let cfOk = true;
    if (ruleId) {
      const res = await unblockIpCloudflare(ruleId);
      cfOk = res.ok;
    }
    await supabase.from('security_block_list').update({ active: false }).eq('ip', ip);
    return json({ ok: cfOk });
  }

  // â”€â”€ طھظپط¹ظٹظ„ Under Attack Mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'cf_under_attack') {
    const enabled = body.enabled !== false;
    const result = await setUnderAttackMode(enabled);
    await supabase.from('security_events').insert({
      ip: 'system', event_type: 'suspicious_pattern', severity: enabled ? 'critical' : 'info',
      endpoint: '/cf/under_attack',
      detail: { action: enabled ? 'enable_under_attack' : 'disable_under_attack', triggered_by: auth.actorEmail },
    });
    return json({ ok: result.ok, mode: enabled ? 'under_attack' : 'medium', error: result.error });
  }

  // â”€â”€ ط­ط§ظ„ط© Cloudflare ط§ظ„ط£ظ…ظ†ظٹط© ط§ظ„ط­ط§ظ„ظٹط© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'cf_status') {
    const [status, rules, analytics] = await Promise.all([
      getCfSecurityStatus(),
      getCfFirewallRules(),
      getCfThreatAnalytics(24),
    ]);
    return json({
      ok: true,
      cfConfigured: cfConfigured(),
      security: status,
      firewallRules: rules.rules,
      analytics24h: analytics,
    });
  }

  // â”€â”€ Cloudflare Analytics ظپظ‚ط· â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (action === 'cf_analytics') {
    const hours = Number(body.hours ?? 24);
    const analytics = await getCfThreatAnalytics(hours);
    return json({ ok: true, cfConfigured: cfConfigured(), analytics });
  }

  return json({ error: 'Unknown action' }, 400);
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  });
}

