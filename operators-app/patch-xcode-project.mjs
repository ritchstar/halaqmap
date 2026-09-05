/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يُثبّت إعدادات التوقيع والاستحقاقات في مشروع Xcode بعد كل `cap add ios`.
 * التشغيل من هذا المجلد: `node patch-xcode-project.mjs`.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const PBXPROJ = 'ios/App/App.xcodeproj/project.pbxproj';
const TEAM_ID = '682KF3CDQM';
const ENTITLEMENTS = 'App/App.entitlements';

const source = readFileSync(PBXPROJ, 'utf8');
let patched = source;

if (!patched.includes('CODE_SIGN_ENTITLEMENTS')) {
  patched = patched.replace(
    /(\n(\t+)CODE_SIGN_STYLE = Automatic;)/g,
    `\n$2CODE_SIGN_ENTITLEMENTS = ${ENTITLEMENTS};$1`,
  );
}

if (!patched.includes('DEVELOPMENT_TEAM')) {
  patched = patched.replace(
    /(\n(\t+)CURRENT_PROJECT_VERSION = 1;)/g,
    `$1\n$2DEVELOPMENT_TEAM = ${TEAM_ID};`,
  );
}

if (patched === source) {
  console.log('لا تغيير: المشروع مضبوط مسبقاً.');
  process.exit(0);
}

writeFileSync(PBXPROJ, patched);
console.log('تم ضبط فريق التوقيع وملف الاستحقاقات في مشروع Xcode.');
