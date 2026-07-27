/**
 * اختبارات وحدة لمسار استئناف مسودة التسجيل (حملة الشركاء).
 * تشغيل: npx --yes tsx scripts/test-registration-draft-resume.mts
 */
import assert from 'node:assert/strict';
import {
  buildRegistrationEntryFingerprint,
  shouldResumeRegistrationStep,
} from '../src/lib/registrationFormDraft.ts';

assert.equal(
  buildRegistrationEntryFingerprint('?tier=gold&purpose=new&qty=1'),
  buildRegistrationEntryFingerprint('tier=gold&purpose=new&qty=1'),
);

assert.notEqual(
  buildRegistrationEntryFingerprint('?tier=gold&purpose=new'),
  buildRegistrationEntryFingerprint('?tier=bronze&purpose=new'),
);

assert.equal(
  shouldResumeRegistrationStep({
    resumeFlag: false,
    currentFingerprint: 'gold|||new||',
    draftFingerprint: 'gold|||new||',
    isPageReload: false,
  }),
  false,
  'دخول حملة جديد يجب ألا يستأنف الخطوة',
);

assert.equal(
  shouldResumeRegistrationStep({
    resumeFlag: true,
    currentFingerprint: 'gold|||new||',
    draftFingerprint: 'gold|||new||',
    isPageReload: false,
  }),
  true,
  'العودة من دليل التعليمات تستأنف',
);

assert.equal(
  shouldResumeRegistrationStep({
    resumeFlag: false,
    currentFingerprint: 'gold|||new||',
    draftFingerprint: 'gold|||new||',
    isPageReload: true,
  }),
  true,
  'إعادة تحميل الصفحة تستأنف',
);

assert.equal(
  shouldResumeRegistrationStep({
    resumeFlag: true,
    currentFingerprint: 'bronze|||new||',
    draftFingerprint: 'gold|||new||',
    isPageReload: false,
  }),
  false,
  'تغيّر بصمة الحملة يمنع الاستئناف حتى مع علم الدليل',
);

console.log('ok: registration draft resume gates');
