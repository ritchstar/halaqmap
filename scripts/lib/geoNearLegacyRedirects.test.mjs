/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  expandGeoNearLegacyRedirects,
  GEO_NEAR_LEGACY_REDIRECTS_MANUAL,
} from '../lib/geoNearLegacyRedirects.mjs';

test('توسيع al- يغطي أحياء الرياض دون تكرار التحويلات اليدوية', () => {
  const nodes = [
    {
      kind: 'neighborhood',
      slug: 'badiah',
      parentSlugs: ['riyadh'],
    },
    {
      kind: 'neighborhood',
      slug: 'maather',
      parentSlugs: ['riyadh'],
    },
  ];
  const redirects = expandGeoNearLegacyRedirects(nodes);
  assert.equal(
    redirects.some((row) => row.from === '/near/riyadh/al-badiah' && row.to === '/near/riyadh/badiah'),
    true,
  );
  assert.equal(
    redirects.some((row) => row.from === '/near/riyadh/maathar' && row.to === '/near/riyadh/maather'),
    true,
  );
  assert.equal(
    redirects.some((row) => row.from === '/near/riyadh/manfuha' && row.to === '/near/riyadh/hittin'),
    true,
  );
  const fromSet = new Set(redirects.map((row) => row.from));
  assert.equal(fromSet.size, redirects.length);
  assert.equal(fromSet.size, GEO_NEAR_LEGACY_REDIRECTS_MANUAL.length + 1);
});
