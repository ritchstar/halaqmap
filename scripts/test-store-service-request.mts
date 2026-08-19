/**
 * تحقق طلب خدمات متجر halaqmap.
 */
import assert from 'node:assert/strict';
import { parseStoreServiceRequestBody } from '../api/_lib/storeServiceRequest.ts';

const base = {
  applicantName: 'أحمد العتيبي',
  entityName: 'مؤسسة تجربة',
  freelanceWorkDoc: '',
  email: 'ahmad@example.com',
  phone: '0559602685',
  whatsapp: '0559602685',
  requestBody: 'طلب دراسة خدمة برمجية مخصصة للمنشأة خلال أسبوعين.',
  consentStudyReply: true,
  website: '',
  source: 'store-landing',
};

const ok = parseStoreServiceRequestBody(base);
assert.equal(ok.ok, true);
if (ok.ok) {
  assert.equal(ok.row.email_normalized, 'ahmad@example.com');
  assert.equal(ok.row.entity_name, 'مؤسسة تجربة');
  assert.equal(ok.row.consent_study_reply, true);
}

const honeypot = parseStoreServiceRequestBody({ ...base, website: 'https://spam.test' });
assert.equal(honeypot.ok, false);
if (!honeypot.ok) assert.equal(honeypot.error, 'honeypot');

const noConsent = parseStoreServiceRequestBody({ ...base, consentStudyReply: false });
assert.equal(noConsent.ok, false);

const shortBody = parseStoreServiceRequestBody({ ...base, requestBody: 'قصير' });
assert.equal(shortBody.ok, false);

const badEmail = parseStoreServiceRequestBody({ ...base, email: 'not-an-email' });
assert.equal(badEmail.ok, false);

console.log('store service request parse ok');
