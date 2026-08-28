/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  COIFFEUR_SITE_NAME_AR,
  COIFFEUR_SITE_ORIGIN,
  COIFFEUR_WEBSITE_JSON_LD,
  applyCoiffeurSiteIdentity,
  isCoiffeurIdentityPath,
  isCoiffeurSatelliteHost,
} from './coiffeurSiteIdentity.mjs';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'lib');

test('هوية كوافير ماب لا تُخلط بنطاق حلاق ماب', () => {
  assert.equal(COIFFEUR_SITE_NAME_AR, 'كوافير ماب');
  assert.equal(COIFFEUR_SITE_ORIGIN, 'https://coiffeur.halaqmap.com');
  assert.equal(COIFFEUR_WEBSITE_JSON_LD['@graph'][0]['@type'], 'WebSite');
  assert.equal(COIFFEUR_WEBSITE_JSON_LD['@graph'][0].name, 'كوافير ماب');
  assert.equal(COIFFEUR_WEBSITE_JSON_LD['@graph'][0].url, 'https://coiffeur.halaqmap.com');
  assert.equal(isCoiffeurSatelliteHost('coiffeur.halaqmap.com'), true);
  assert.equal(isCoiffeurSatelliteHost('www.halaqmap.com'), false);
  assert.equal(isCoiffeurSatelliteHost('store.halaqmap.com'), false);
  assert.equal(isCoiffeurIdentityPath('/'), true);
  assert.equal(isCoiffeurIdentityPath('/index.html'), true);
  assert.equal(isCoiffeurIdentityPath('/summi'), false);
});

test('تحويل HTML يضع og:site_name وWebSite باسم كوافير ماب', () => {
  const html = `<!doctype html><html><head>
    <title>اقرب حلاق · حلاق قريب | حلاق ماب</title>
    <meta name="application-name" content="حلاق ماب | HALAQ MAP" />
    <meta name="apple-mobile-web-app-title" content="حلاق ماب" />
    <link rel="canonical" href="https://www.halaqmap.com/" />
    <meta property="og:url" content="https://www.halaqmap.com/" />
    <meta property="og:site_name" content="حلاق ماب | HALAQ MAP" />
    <script type="application/ld+json">{"@graph":[{"@type":"WebSite","name":"حلاق ماب","url":"https://www.halaqmap.com/"}]}</script>
  </head><body></body></html>`;
  const next = applyCoiffeurSiteIdentity(html);
  assert.match(next, /og:site_name" content="كوافير ماب"/);
  assert.match(next, /application-name" content="كوافير ماب"/);
  assert.match(next, /apple-mobile-web-app-title" content="كوافير ماب"/);
  assert.match(next, /canonical" href="https:\/\/coiffeur\.halaqmap\.com\//);
  assert.match(next, /"@type":"WebSite"/);
  assert.match(next, /"name":"كوافير ماب"/);
  assert.match(next, /"url":"https:\/\/coiffeur\.halaqmap\.com"/);
  assert.equal(next.includes('og:site_name" content="حلاق ماب'), false);
  assert.equal(/"name":"حلاق ماب"/.test(next), false);
});

test('هوية كوافير في الإقلاع لا تسحب المظلة القانونية', () => {
  const src = readFileSync(join(srcDir, 'coiffeurSiteIdentity.ts'), 'utf8');
  assert.equal(/from ['"]@\/config\/coiffeurMapUmbrella['"]/.test(src), false);
  assert.equal(/from ['"]@\/config\/partnerLegal['"]/.test(src), false);
  assert.match(src, /كوافير ماب/);
  assert.match(src, /coiffeur\.halaqmap\.com/);
});
