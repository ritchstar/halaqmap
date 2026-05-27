/**
 * admin-security-agents — وكلاء الأمن السيبراني الحقيقيون
 *
 * Actions:
 *  proactive_scout    — يستعلم security_events ويرصد IPs ذات معدل متصاعد
 *  forensic_analysis  — يكشف أنماط الهجوم الموزّع والبطيء
 *  threat_neutralize  — يُنفّذ حظراً شاملاً (DB + Cloudflare) في آنٍ واحد
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

  // ══════════════════════════════════════════════════════════════════
  // ◆ عميل الاستطلاع الاستباقي — يكشف التهديدات قبل وقوعها
  // ══════════════════════════════════════════════════════════════════
  if (action === 'proactive_scout') {
    const windowMin = Number(body.windowMinutes ?? 10);
    const since = new Date(Date.now() - windowMin * 60_000).toISOString();

    // ١. IPs ذات معدل متصاعد خلال الـ N دقائق الأخيرة
    const { data: recentEvents } = await supabase
      .from('security_events')
      .select('ip, event_type, severity, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200);

    // تحليل معدل الطلبات لكل IP
    const ipStats: Record<string, { count: number; critical: number; warning: number; endpoints: Set<string> }> = {};
    for (const ev of recentEvents ?? []) {
      if (!ipStats[ev.ip]) ipStats[ev.ip] = { count: 0, critical: 0, warning: 0, endpoints: new Set() };
      ipStats[ev.ip].count++;
      if (ev.severity === 'critical') ipStats[ev.ip].critical++;
      if (ev.severity === 'warning') ipStats[ev.ip].warning++;
    }

    // الـ IPs المشبوهة (أكثر من 5 أحداث في الفترة)
    const suspicious = Object.entries(ipStats)
      .filter(([, s]) => s.count >= 5)
      .sort(([, a], [, b]) => b.critical - a.critical || b.count - a.count)
      .slice(0, 10)
      .map(([ip, s]) => ({ ip, count: s.count, critical: s.critical, warning: s.warning }));

    // ٢. تحليل معدل التسارع (هل يتصاعد؟)
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

    // تقرير الوكيل
    const reportLines: string[] = [];
    reportLines.push(`عميل الاستطلاع الاستباقي — تقرير ${windowMin} دقيقة الأخيرة`);
    reportLines.push(`مستوى التهديد: ${threatLevel === 'critical' ? '🚨 حرج' : threatLevel === 'elevated' ? '⚠️ مرتفع' : '✅ طبيعي'}`);
    reportLines.push(`معدل التسارع: ×${acceleration.toFixed(1)} (النصف الثاني vs الأول)`);
    if (suspicious.length > 0) {
      reportLines.push(`IPs مشبوهة: ${suspicious.length}`);
      suspicious.slice(0, 3).forEach(s =>
        reportLines.push(`  · ${s.ip} — ${s.count} حدث (${s.critical} حرج)`));
    } else {
      reportLines.push('لا مصادر مشبوهة بارزة في الفترة المراقَبة');
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
        agentLabelAr: 'عميل الاستطلاع الاستباقي',
        actionLabelAr: threatLevel === 'critical' ? '🚨 تحذير مبكر' : '🔍 مسح استباقي',
        explanationAr: reportLines.join(' · '),
        severity: threatLevel === 'critical' ? 'critical' : threatLevel === 'elevated' ? 'elevated' : 'info',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ◆ محلل الجنائيات الرقمية — يكشف الأنماط الخفية
  // ══════════════════════════════════════════════════════════════════
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

    // ١. كشف الهجوم الموزّع (نفس الـ endpoint، IPs مختلفة)
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

    // ٢. كشف الهجوم البطيء (IP واحد، فترة طويلة)
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
        return span > 30 && rate < 2; // بطيء جداً — يتجنب rate limiting
      })
      .map(([ip, times]) => ({
        ip,
        events: times.length,
        spanMinutes: Math.round((times[times.length - 1] - times[0]) / 60_000),
      }))
      .slice(0, 5);

    // ٣. تحليل جغرافي
    const countries: Record<string, number> = {};
    for (const e of evs) {
      if (e.ip_country) countries[e.ip_country] = (countries[e.ip_country] ?? 0) + 1;
    }
    const topCountries = Object.entries(countries).sort(([,a],[,b])=>b-a).slice(0, 5).map(([c,n])=>({country:c,count:n}));

    const findings: string[] = [];
    findings.push(`محلل الجنائيات الرقمية — تحليل ${hours} ساعة الأخيرة`);
    if (distributedAttacks.length > 0) {
      findings.push(`🔴 هجوم موزّع على ${distributedAttacks[0].endpoint} من ${distributedAttacks[0].uniqueIps} مصادر`);
    }
    if (slowAttackers.length > 0) {
      findings.push(`🐢 هجوم بطيء مكتشف: ${slowAttackers[0].ip} — ${slowAttackers[0].events} حدث خلال ${slowAttackers[0].spanMinutes} دقيقة`);
    }
    if (topCountries.length > 0) {
      findings.push(`🌍 أكثر مصدر جغرافي: ${topCountries[0].country} (${topCountries[0].count} حدث)`);
    }
    if (findings.length === 1) findings.push('لا أنماط هجوم خفية مكتشفة في الفترة المحللة');

    return json({
      ok: true,
      agent: 'forensic_analyst',
      distributedAttacks,
      slowAttackers,
      topCountries,
      report: findings.join('\n'),
      agentResponse: {
        agentId: 'forensic_analyst',
        agentLabelAr: 'محلل الجنائيات الرقمية',
        actionLabelAr: distributedAttacks.length > 0 ? '🔴 هجوم موزّع مكتشف' : slowAttackers.length > 0 ? '🐢 هجوم بطيء مكتشف' : '✅ لا أنماط خفية',
        explanationAr: findings.join(' · '),
        severity: distributedAttacks.length > 0 ? 'critical' : slowAttackers.length > 0 ? 'elevated' : 'info',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ◆ محيّد التهديدات — تحييد شامل DB + Cloudflare
  // ══════════════════════════════════════════════════════════════════
  if (action === 'threat_neutralize') {
    const targets = Array.isArray(body.ips)
      ? (body.ips as unknown[]).map(String).filter(Boolean).slice(0, 20)
      : [String(body.ip || '').trim()].filter(Boolean);

    if (targets.length === 0) return json({ error: 'No IPs provided' }, 400);

    const reason = String(body.reason || 'Threat Neutralizer — coordinated neutralization').trim();
    const results: { ip: string; db: boolean; cf: boolean; cfRuleId?: string }[] = [];

    for (const ip of targets) {
      // ١. حظر في Supabase
      const { error: dbErr } = await supabase.from('security_block_list').upsert({
        ip, reason: `[NEUTRALIZER] ${reason}`, blocked_by: auth.actorEmail, active: true,
        metadata: { source: 'threat_neutralizer', timestamp: new Date().toISOString() },
      }, { onConflict: 'ip' });

      // ٢. حظر على Cloudflare Edge
      const cfResult = cfConfigured() ? await blockIpCloudflare(ip, reason, 'block') : { ok: false };

      // ٣. تسجيل الحدث
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
        agentLabelAr: 'محيّد التهديدات',
        actionLabelAr: allNeutralized ? '⚡ تحييد شامل — DB + CF' : partialNeutralized ? '⚡ تحييد جزئي' : '❌ فشل التحييد',
        explanationAr: `تمّ تحييد ${targets.length} مصدر تهديد. ${results.filter(r=>r.db).length} محجوب في DB و${results.filter(r=>r.cf).length} محجوب على Cloudflare Edge. التأثير: فوري على جميع المسارات.`,
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
