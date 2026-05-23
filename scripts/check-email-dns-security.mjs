#!/usr/bin/env node
/**
 * فحص سجلات DNS للبريد — توافق أولي مع ممارسات الأمان الحديثة
 * (SPF / DKIM / DMARC / MX) كما تُنصح بها الهيئات والجهات لأتمتة المصداقية ومنع التزييف.
 *
 * الاستخدام:
 *   node scripts/check-email-dns-security.mjs example.com
 *   node scripts/check-email-dns-security.mjs halaqmap.com --dkim google
 *   node scripts/check-email-dns-security.mjs halaqmap.com --dkim selector1 --dkim-domain mail.halaqmap.com
 *
 * ملاحظات:
 * - «معايير حكومية» تختلف حسب الجهة؛ هذا السكربت يطبّق قائمة تحقق تقنية معترف بها دولياً (RFC + BCP).
 * - DKIM يتطلب معرفة selector (مثل google، selector1، resend، …) من مزوّد البريد.
 * - للتحقق من TLS على خادم البريد يلزم فحص SMTP منفصل (openssl s_client) — اختياري أسفل المخرجات.
 */

import dns from 'node:dns/promises';
import { argv, exit } from 'node:process';

const args = argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(
  argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.includes('=') ? a.slice(2).split('=') : [a.slice(2), true];
      return [k, v === true ? true : v];
    }),
);

const domain = (args[0] || '').trim().toLowerCase().replace(/^@/, '');
if (!domain || domain.includes('/') || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
  console.error('الاستخدام: node scripts/check-email-dns-security.mjs <domain> [--dkim <selector>] [--dkim-domain <domain>]');
  exit(1);
}

const dkimSelectors = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--dkim' && argv[i + 1]) dkimSelectors.push(String(argv[++i]));
}
const dkimDomain = String(flags['dkim-domain'] || domain);

const results = { pass: [], warn: [], fail: [], info: [] };

function add(cat, msg) {
  results[cat].push(msg);
}

async function resolveTxt(name) {
  try {
    const rows = await dns.resolveTxt(name);
    return rows.map((chunks) => chunks.join(''));
  } catch (e) {
    if (e?.code === 'ENOTFOUND' || e?.code === 'ENODATA') return [];
    throw e;
  }
}

async function resolveMx(name) {
  try {
    return await dns.resolveMx(name);
  } catch (e) {
    if (e?.code === 'ENOTFOUND' || e?.code === 'ENODATA') return [];
    throw e;
  }
}

/** تقدير عدد عمليات DNS داخل سجل SPF (تقريبي — BCP تجنب >10 lookups) */
function countSpfDnsLookups(spf) {
  const parts = spf.split(/\s+/).filter(Boolean);
  let n = 0;
  for (const p of parts) {
    const u = p.toLowerCase();
    if (u === 'a' || u === 'mx' || u === 'ptr') n += 1;
    if (u.startsWith('include:')) n += 1;
    if (u.startsWith('redirect=')) n += 1;
  }
  return n;
}

function parseDmarc(txt) {
  const o = {};
  for (const part of txt.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    o[k.trim().toLowerCase()] = rest.join('=').trim();
  }
  return o;
}

async function main() {
  console.log(`\n=== فحص DNS للبريد: ${domain} ===\n`);

  // --- MX ---
  let mx;
  try {
    mx = await resolveMx(domain);
  } catch (e) {
    const code = e?.code || '';
    if (code === 'ECONNREFUSED' || code === 'ETIMEOUT' || code === 'ESERVFAIL')
      add('fail', `MX: تعذّر الاتصال بمزوّد DNS (${code}) — تحقق من الشبكة أو جرّب من جهازك المحلي.`);
    else add('fail', `MX: فشل الاستعلام — ${e.message}`);
    mx = [];
  }
  if (mx.length === 0) {
    add('fail', 'MX: لا توجد سجلات MX — لا يمكن استقبال البريد على النطاق.');
  } else {
    mx.sort((a, b) => a.priority - b.priority);
    add('pass', `MX: ${mx.length} سجل(ات) — الأسبقية: ${mx.map((m) => `${m.priority} ${m.exchange}`).join(' | ')}`);
    for (const m of mx) {
      if (!m.exchange?.endsWith('.')) add('warn', `MX: ${m.exchange} بدون نقطة نهائية (FQDN) — غالباً مقبول لكن يُفضّل التوحيد.`);
    }
  }

  // --- SPF (root domain) ---
  let spfRecords = [];
  try {
    spfRecords = await resolveTxt(domain);
  } catch (e) {
    add('fail', `SPF/TXT: ${e.message || e} (${e?.code || ''})`);
  }
  const spf = spfRecords.find((t) => t.toLowerCase().startsWith('v=spf1'));
  if (!spf) {
    add('fail', 'SPF: لا يوجد سجل TXT يبدأ بـ v=spf1 على جذر النطاق — يُنصح بإضافته لمنع انتحال المرسل.');
  } else {
    if (spf.includes('+all')) add('fail', 'SPF: يحتوي +all — خطر أمني عالٍ (يسمح لأي مرسل).');
    else if (spf.includes('?all')) add('warn', 'SPF: ?all — محايد؛ يُفضّل -all أو ~all حسب سياسة المرسل.');
    else if (spf.includes('-all')) add('pass', 'SPF: -all — سياسة صارمة للمرسلين غير المصرّح بهم.');
    else if (spf.includes('~all')) add('pass', 'SPF: ~all — سياسة ناعمة شائعة.');
    else add('warn', 'SPF: لا يوجد all صريح في النهاية — راجع الوثائق.');

    const lookups = countSpfDnsLookups(spf);
    if (lookups > 10) add('warn', `SPF: عدد include/a/mx/redirect التقريبي ${lookups} — قد يتجاوز حد الـ 10 عمليات DNS (RFC7208).`);
    else add('pass', `SPF: تعقيد DNS تقديري معقول (~${lookups}).`);
    add('info', `SPF: ${spf.slice(0, 200)}${spf.length > 200 ? '…' : ''}`);
  }

  // --- DMARC ---
  const dmarcName = `_dmarc.${domain}`;
  let dmarcTxts = [];
  try {
    dmarcTxts = await resolveTxt(dmarcName);
  } catch (e) {
    add('fail', `DMARC: ${e.message || e}`);
  }
  const dmarc = dmarcTxts.find((t) => t.toLowerCase().startsWith('v=dmarc1'));
  if (!dmarc) {
    add('warn', `DMARC: لا يوجد سجل على ${dmarcName} — يُنصح بإضافته لربط SPF/DKIM وتقارير الانتحال.`);
  } else {
    const p = parseDmarc(dmarc);
    const pol = (p.p || 'none').toLowerCase();
    if (pol === 'reject') add('pass', 'DMARC: p=reject — أقوى حماية للنطاق (مراسلة قد تُرفض عند سوء الإعداد).');
    else if (pol === 'quarantine') add('pass', 'DMARC: p=quarantine — قوي؛ رسائل مشبوهة للعزل.');
    else if (pol === 'none') add('warn', 'DMARC: p=none — مرحلة مراقبة فقط؛ يُفضّل التصعيد لـ quarantine ثم reject.');
    else add('info', `DMARC: p=${pol}`);
    if (!p.rua) add('warn', 'DMARC: لا يوجد rua (عنوان تقارير تجميعية) — يُنصح بإضافته للمراقبة.');
    else add('pass', `DMARC: rua=${p.rua}`);
    add('info', `DMARC: ${dmarc.slice(0, 220)}${dmarc.length > 220 ? '…' : ''}`);
  }

  // --- DKIM ---
  if (dkimSelectors.length === 0) {
    add('warn', 'DKIM: لم يُمرَّر --dkim <selector> — تخطّي الفحص (اسأل مزوّد البريد عن اسم المحدد).');
  } else {
    for (const sel of dkimSelectors) {
      const name = `${sel}._domainkey.${dkimDomain}`;
      let txts = [];
      try {
        txts = await resolveTxt(name);
      } catch (e) {
        add('fail', `DKIM ${name}: ${e.message || e}`);
        continue;
      }
      const dkim = txts.find((t) => t.toLowerCase().includes('v=dkim1'));
      if (!dkim) {
        add('fail', `DKIM: لا سجل صالح على ${name}`);
      } else {
        const pm = dkim.match(/p=([^;]*)/i);
        const pval = pm ? String(pm[1]).trim() : '';
        if (!pval || pval.toLowerCase() === 'null')
          add('fail', `DKIM: مفتاح عام فارغ أو معطّل على ${name} — إبطال التوقيع.`);
        else add('pass', `DKIM: سجل صالح على ${name}`);
        add('info', `DKIM (${name}): ${dkim.slice(0, 120)}…`);
      }
    }
  }

  // --- BIMI (اختياري — بعض الجهات تطلبه للعلامة في العميل) ---
  let bimi = [];
  try {
    bimi = await resolveTxt(`default._bimi.${domain}`);
  } catch {
    bimi = [];
  }
  if (bimi.length) add('info', `BIMI: وُجد سجل default._bimi — ${bimi[0].slice(0, 100)}…`);
  else add('info', 'BIMI: لا يوجد default._bimi (اختياري).');

  // --- طباعة الملخص ---
  const order = [
    ['نجاح', 'pass'],
    ['تنبيه', 'warn'],
    ['فشل / يحتاج إجراء', 'fail'],
    ['تفاصيل', 'info'],
  ];
  for (const [label, key] of order) {
    if (results[key].length) {
      console.log(`--- ${label} ---`);
      for (const line of results[key]) console.log(`  • ${line}`);
      console.log('');
    }
  }

  console.log('--- اقتراح فحص TLS على خادم الاستلام (يدوي) ---');
  const firstMx = mx[0]?.exchange;
  if (firstMx) {
    const host = firstMx.replace(/\.$/, '');
    console.log(`  openssl s_client -connect ${host}:25 -starttls smtp -crlf -quiet < NUL`);
    console.log('  (أو المنفذ 587 إن كان المزوّد يستخدم الإرسال/الاستلام على submission)\n');
  } else console.log('  (يتطلب وجود سجل MX صالح)\n');

  const bad = results.fail.length > 0;
  exit(bad ? 2 : 0);
}

main().catch((e) => {
  console.error('خطأ:', e.message || e);
  exit(1);
});
