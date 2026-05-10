#!/usr/bin/env node
/**
 * فحص MX و SPF و DMARC عبر وحدة dns المدمجة في Node (بدون تبعيات).
 * يميّز بين: السجل غير موجود (NODATA/NXDOMAIN) وبين فشل الاتصال بالمحلل (timeout، SERVFAIL، …).
 *
 * الاستخدام:
 *   node scripts/check-dns-mx-spf-dmarc.mjs
 *   node scripts/check-dns-mx-spf-dmarc.mjs example.com
 */

import dns from 'node:dns/promises';
import { argv, exit } from 'node:process';

const DEFAULT_DOMAIN = 'halaqmap.com';

const domain = (argv[2] || DEFAULT_DOMAIN)
  .trim()
  .toLowerCase()
  .replace(/^@/, '');

if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
  console.error('الاستخدام: node scripts/check-dns-mx-spf-dmarc.mjs [domain]');
  exit(1);
}

/** أخطاء تعني غالباً أن الاستعلام وصل للـ DNS لكن لا توجد بيانات من النوع المطلوب */
function isNoRecordError(err) {
  const c = err?.code;
  return c === 'ENODATA' || c === 'ENOTFOUND';
}

/** أخطاء شبكة / محلل / خادم DNS */
function isResolverOrNetworkError(err) {
  const c = err?.code || '';
  return (
    c === 'ETIMEOUT' ||
    c === 'ECONNREFUSED' ||
    c === 'ESERVFAIL' ||
    c === 'EREFUSED' ||
    c === 'EAI_AGAIN' ||
    c === 'EBUSY'
  );
}

function formatErr(err) {
  return `${err?.code || 'UNKNOWN'}: ${err?.message || err}`;
}

async function queryMx(name) {
  try {
    const rows = await dns.resolveMx(name);
    return { status: 'ok', kind: 'mx', records: rows, error: null };
  } catch (e) {
    if (isNoRecordError(e)) return { status: 'no_record', kind: 'mx', records: [], error: e };
    if (isResolverOrNetworkError(e))
      return { status: 'query_failed', kind: 'mx', records: [], error: e };
    return { status: 'query_failed', kind: 'mx', records: [], error: e };
  }
}

async function queryTxt(name) {
  try {
    const rows = await dns.resolveTxt(name);
    const strings = rows.map((chunks) => chunks.join(''));
    return { status: 'ok', kind: 'txt', records: strings, error: null };
  } catch (e) {
    if (isNoRecordError(e)) return { status: 'no_record', kind: 'txt', records: [], error: e };
    if (isResolverOrNetworkError(e))
      return { status: 'query_failed', kind: 'txt', records: [], error: e };
    return { status: 'query_failed', kind: 'txt', records: [], error: e };
  }
}

function labelStatus(s) {
  if (s === 'ok') return 'موجود (استعلام ناجح)';
  if (s === 'no_record') return 'لا يوجد سجل من هذا النوع (الخادم أجاب: لا بيانات / النطاق غير معروف حسب المحلل)';
  if (s === 'query_failed') return 'فشل الاستعلام (شبكة أو محلل DNS أو SERVFAIL)';
  return s;
}

function printBlock(title, result, extraLines = []) {
  console.log(`\n=== ${title} ===`);
  console.log(`الحالة: ${labelStatus(result.status)}`);
  if (result.error && result.status !== 'ok') console.log(`التفاصيل: ${formatErr(result.error)}`);
  if (result.status === 'ok' && result.records?.length) {
    for (const r of result.records) {
      if (typeof r === 'object' && r.exchange != null) {
        console.log(`  MX  priority=${r.priority}  exchange=${r.exchange}`);
      } else {
        const line = String(r);
        console.log(`  TXT ${line.length > 400 ? `${line.slice(0, 400)}…` : line}`);
      }
    }
  } else if (result.status === 'ok' && (!result.records || result.records.length === 0)) {
    console.log('  (قائمة فارغة — نادر لكن ممكن)');
  }
  for (const L of extraLines) console.log(L);
}

async function main() {
  console.log(`النطاق: ${domain}`);
  console.log('ملاحظة: SPF يُقرأ من سجلات TXT على جذر النطاق؛ DMARC من _dmarc.<domain>');

  const mx = await queryMx(domain);
  printBlock('MX', mx);

  const rootTxt = await queryTxt(domain);
  const spf = rootTxt.records?.find((t) => t.toLowerCase().startsWith('v=spf1'));
  const spfExtra = [];
  if (rootTxt.status === 'ok' && !spf) spfExtra.push('تنبيه: وُجدت سجلات TXT على الجذر لكن لا يوجد سطر يبدأ بـ v=spf1 (لا يوجد SPF صريح).');
  if (rootTxt.status === 'ok' && spf) spfExtra.push('SPF: وُجد سجل v=spf1 على الجذر.');
  printBlock('TXT على الجذر (للبحث عن SPF)', rootTxt, spfExtra);

  const dmarcHost = `_dmarc.${domain}`;
  const dmarcTxt = await queryTxt(dmarcHost);
  const dmarc = dmarcTxt.records?.find((t) => t.toLowerCase().startsWith('v=dmarc1'));
  const dmarcExtra = [];
  if (dmarcTxt.status === 'ok' && !dmarc)
    dmarcExtra.push(`تنبيه: لا يوجد سجل DMARC (v=dmarc1) على ${dmarcHost}.`);
  if (dmarcTxt.status === 'ok' && dmarc) dmarcExtra.push('DMARC: وُجد سجل v=dmarc1.');
  printBlock(`TXT على ${dmarcHost} (DMARC)`, dmarcTxt, dmarcExtra);

  const anyQueryFailed = [mx, rootTxt, dmarcTxt].some((r) => r.status === 'query_failed');
  const summary = anyQueryFailed
    ? '\nالخلاصة: وُجد فشل في أحد الاستعلامات — قد تكون المشكلة من الشبكة أو من محلل DNS (وليس بالضرورة غياب السجلات). جرّب من جهاز/شبكة أخرى أو حدّد DNS صريحاً في النظام.'
    : '\nالخلاصة: جميع الاستعلامات اكتملت من جهة المحلل — إن ظهر «لا يوجد سجل» فهذا يعني غالباً أن السجل غير منشور أو النطاق مختلف.';

  console.log(summary);
  console.log(
    '\nللتوسعة (DKIM + BIMI + TLS): node scripts/check-email-dns-security.mjs ' + domain,
  );

  exit(anyQueryFailed ? 2 : 0);
}

main().catch((e) => {
  console.error('خطأ غير متوقع:', e.message || e);
  exit(1);
});
