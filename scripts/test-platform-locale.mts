/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import {
  PLATFORM_AR_LOCALE,
  formatPlatformDate,
  formatPlatformNumber,
  toWesternDigits,
} from '../src/lib/platformLocale.ts';

assert.equal(PLATFORM_AR_LOCALE, 'ar-SA-u-ca-gregory-nu-latn');
assert.equal(toWesternDigits('٠٨/٠٣/٢٠٢٦'), '08/03/2026');
assert.equal(toWesternDigits('۱۲۳'), '123');
assert.equal(toWesternDigits('2026-08-03'), '2026-08-03');

const n = formatPlatformNumber(1234.5);
assert.ok(!/[٠-٩۰-۹]/.test(n), `expected western digits, got ${n}`);
assert.ok(/1/.test(n) && /2/.test(n), `expected latin digits in ${n}`);

const d = formatPlatformDate('2026-08-03T12:00:00', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
assert.ok(!/[٠-٩۰-۹]/.test(d), `expected western digits in date, got ${d}`);
assert.ok(/2026/.test(d), `expected year 2026 in ${d}`);

console.log('platform-locale ok');
