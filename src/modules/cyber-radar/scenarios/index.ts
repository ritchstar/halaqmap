/**
 * Pre-recorded cyber radar scenarios — each is a timeline of events and
 * scripted agent narrations that play out over a fixed duration. Used
 * for preview / demo only; live operation never spawns these.
 *
 * Authoring style: keep each step short (1–3 events + 1 narration) so
 * the radar canvas reads like a story rather than a firehose. Timestamps
 * are in milliseconds from scenario start.
 */

import { CITY_BEACONS } from '@/modules/platform-radar/lib/saudiKingdomGeo';
import { projectExternalSource } from '../lib/cyberGeo';
import type { CyberScenario } from '../types';

const CENTER = CITY_BEACONS.find((c) => c.tier === 'capital')?.view ?? {
  x: 500,
  y: 380,
};

const cityPoint = (nameAr: string) =>
  CITY_BEACONS.find((c) => c.nameAr === nameAr)?.view ?? CENTER;

// ---------------------------------------------------------------------------
// Scenario 1 — Mass enrollment storm (25,000 sign-ups / hour)
// ---------------------------------------------------------------------------
const massEnrollmentStorm: CyberScenario = {
  id: 'mass_enrollment',
  titleAr: 'عاصفة التَّسجيل — 25,000 طلب اشتراك / ساعة',
  subtitleAr: 'ضغط طبيعي ضخم من شركاء حلاقين على بوابة الانضمام',
  totalDurationMs: 60_000,
  steps: [
    {
      atMs: 0,
      narratorAr: '00:00 — تَيّار مُعتاد من زيارات الموقع. كل شيء طبيعي.',
      events: [
        {
          kind: 'visit_internal',
          severity: 'info',
          source: cityPoint('جدة'),
          description: 'زيارة لِبوابة الشركاء — جدة',
          originLabelAr: 'جدة',
          protocolTag: 'TLS 1.3',
          lifetimeMs: 4_500,
        },
        {
          kind: 'visit_internal',
          severity: 'info',
          source: cityPoint('الرياض'),
          description: 'زيارة لِصفحة الباقات — الرياض',
          originLabelAr: 'الرياض',
          protocolTag: 'TLS 1.3',
          lifetimeMs: 4_500,
        },
      ],
    },
    {
      atMs: 3_500,
      narratorAr: '00:03 — حملة على وسائل التواصل تُطلق الزخم.',
      events: [
        {
          kind: 'registration',
          severity: 'normal',
          source: cityPoint('الدمام'),
          description: 'طلب اشتراك جديد — الدمام',
          originLabelAr: 'الدمام',
          protocolTag: 'POST /api/register-submission',
          lifetimeMs: 5_000,
        },
        {
          kind: 'registration',
          severity: 'normal',
          source: cityPoint('مكة'),
          description: 'طلب اشتراك جديد — مكة',
          originLabelAr: 'مكة',
          protocolTag: 'POST /api/register-submission',
          lifetimeMs: 5_000,
        },
        {
          kind: 'registration',
          severity: 'normal',
          source: cityPoint('المدينة'),
          description: 'طلب اشتراك جديد — المدينة',
          originLabelAr: 'المدينة',
          lifetimeMs: 5_000,
        },
      ],
    },
    {
      atMs: 7_000,
      narratorAr: '00:07 — المعدّل يتجاوز 6,000 طلب/ساعة. الواجهة تستجيب طبيعياً.',
      agentResponses: [
        {
          agentId: 'ops_controller',
          agentLabelAr: 'مراقب العمليات',
          actionLabelAr: 'رفع حصص Edge Cache',
          explanationAr:
            'لاحظت ارتفاع معدل الزيارات إلى صفحة الباقات. زِدتُ مدّة الـ cache في Vercel Edge لِتخفيف الحمل عن قاعدة البيانات. لا حاجة لإجراء بشري.',
          severity: 'normal',
        },
      ],
      events: Array.from({ length: 6 }, (_, i) => ({
        kind: 'registration' as const,
        severity: 'normal' as const,
        source: CITY_BEACONS[(i * 3) % CITY_BEACONS.length].view,
        description: `طلب اشتراك جديد — ${CITY_BEACONS[(i * 3) % CITY_BEACONS.length].nameAr}`,
        originLabelAr: CITY_BEACONS[(i * 3) % CITY_BEACONS.length].nameAr,
        lifetimeMs: 4_500,
      })),
    },
    {
      atMs: 14_000,
      narratorAr: '00:14 — المعدّل يقفز إلى 18,000/ساعة. عاصفة حقيقية.',
      events: Array.from({ length: 12 }, (_, i) => ({
        kind: 'registration' as const,
        severity: 'elevated' as const,
        source: CITY_BEACONS[(i * 5) % CITY_BEACONS.length].view,
        description: `طلب اشتراك جديد — ${CITY_BEACONS[(i * 5) % CITY_BEACONS.length].nameAr}`,
        originLabelAr: CITY_BEACONS[(i * 5) % CITY_BEACONS.length].nameAr,
        lifetimeMs: 4_500,
        volume: 1,
      })),
      agentResponses: [
        {
          agentId: 'engineering',
          agentLabelAr: 'الجناح الهندسي',
          actionLabelAr: 'توسيع طبقة الـ Realtime',
          explanationAr:
            'فعّلت Connection Pool إضافي على Supabase + زِدت Lambda Concurrency في Vercel من 100 إلى 250. الكلفة الإضافية: ~$3/ساعة. الأَولى من فقدان شريك واحد.',
          severity: 'elevated',
        },
      ],
    },
    {
      atMs: 22_000,
      narratorAr: '00:22 — 25,000/ساعة. شريك واحد كل 144 مللي ثانية.',
      events: Array.from({ length: 18 }, (_, i) => ({
        kind: 'registration' as const,
        severity: 'elevated' as const,
        source: CITY_BEACONS[(i * 7) % CITY_BEACONS.length].view,
        description: 'طلب اشتراك',
        originLabelAr: CITY_BEACONS[(i * 7) % CITY_BEACONS.length].nameAr,
        lifetimeMs: 3_500,
        volume: 1,
      })),
      agentResponses: [
        {
          agentId: 'compliance',
          agentLabelAr: 'مسؤول الامتثال',
          actionLabelAr: 'تفعيل CAPTCHA الذكي',
          explanationAr:
            'في هذا الحجم لا بد من فلتر للبوتات. فعّلت Cloudflare Turnstile على نموذج التسجيل — البشر يَمرّون شفّافياً، البوتات تُحجَب. لا أَطلب رمز هاتف بَعد لأن الحملة قانونية.',
          severity: 'elevated',
        },
      ],
    },
    {
      atMs: 35_000,
      narratorAr: '00:35 — قمة العاصفة. كل النظام يتحمّل بدون أَخطاء.',
      events: Array.from({ length: 22 }, (_, i) => ({
        kind: 'registration' as const,
        severity: 'elevated' as const,
        source: CITY_BEACONS[(i * 11) % CITY_BEACONS.length].view,
        description: 'طلب اشتراك',
        originLabelAr: CITY_BEACONS[(i * 11) % CITY_BEACONS.length].nameAr,
        lifetimeMs: 3_000,
        volume: 1,
      })),
      agentResponses: [
        {
          agentId: 'partner_liaison',
          agentLabelAr: 'مساعد الشركاء',
          actionLabelAr: 'تنشيط طابور المراجعة',
          explanationAr:
            'أضفت 6 أَدمنين تَلقائياً إلى طابور موافقة الشركاء (RLS-safe). متوسط الانتظار سَيَنخفض من 14 دقيقة إلى 3 دقائق رغم الحجم.',
          severity: 'normal',
        },
      ],
    },
    {
      atMs: 48_000,
      narratorAr: '00:48 — العاصفة تَهدأ. تَم استيعاب 19,847 طلب بدون فقدان واحد.',
      agentResponses: [
        {
          agentId: 'ops_controller',
          agentLabelAr: 'مراقب العمليات',
          actionLabelAr: 'تَوليد تَقرير ما بعد الحدث',
          explanationAr:
            'الأَداء: 99.97% نَجاح | المتوسط: 142 مللي ثانية/طلب | لا أَخطاء 5xx. سَأَرسل التَّقرير للمؤسس + سَأُخَفّض Concurrency إلى الوضع الطبيعي.',
          severity: 'info',
        },
      ],
    },
    {
      atMs: 58_000,
      narratorAr: '01:00 — انتهت العاصفة. النظام مُستقر. حالة Ops Controller: 🟢 OK.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Scenario 2 — Cyber attack (DDoS + intrusion attempts)
// ---------------------------------------------------------------------------
const ddosAttack: CyberScenario = {
  id: 'cyber_attack',
  titleAr: 'هَجوم سيبراني — DDoS + اختراق',
  subtitleAr: 'محاولة إغراق + اختراق متعدد المصادر على بنية المنصة',
  totalDurationMs: 65_000,
  steps: [
    {
      atMs: 0,
      narratorAr: '00:00 — حالة طبيعية. زيارات هادئة من داخل المملكة.',
      events: [
        {
          kind: 'visit_internal',
          severity: 'info',
          source: cityPoint('الرياض'),
          description: 'زيارة عادية',
          originLabelAr: 'الرياض',
          lifetimeMs: 4_000,
        },
      ],
    },
    {
      atMs: 4_000,
      narratorAr: '00:04 — رصدنا فحوصات ports من مصادر مجهولة. مرحلة الاستطلاع.',
      events: [
        {
          kind: 'threat_probe',
          severity: 'elevated',
          source: projectExternalSource('east_europe'),
          target: CENTER,
          description: 'Port scan على /api/admin-*',
          originLabelAr: 'شرق أوروبا',
          protocolTag: 'TCP SYN scan',
          lifetimeMs: 6_000,
        },
        {
          kind: 'threat_probe',
          severity: 'elevated',
          source: projectExternalSource('east_asia'),
          target: CENTER,
          description: 'محاولة قراءة /.env',
          originLabelAr: 'شرق آسيا',
          protocolTag: 'GET /.env (404)',
          lifetimeMs: 6_000,
        },
      ],
      agentResponses: [
        {
          agentId: 'engineering',
          agentLabelAr: 'الجناح الهندسي',
          actionLabelAr: 'تَتبُّع IPs المُشتبهة',
          explanationAr:
            'كل ما طَلَبه هذا الـ scan إمّا غير موجود (.env) أَو محمي بـ RLS. لكنّي وَضعتُ الـ IPs في watchlist للمراقبة. لا تَصعيد بَعد.',
          severity: 'elevated',
        },
      ],
    },
    {
      atMs: 10_000,
      narratorAr: '00:10 — موجة DDoS أولى: 12,000 طلب/ثانية من أكثر من 1,000 IP.',
      events: Array.from({ length: 8 }, (_, i) => ({
        kind: 'threat_attack' as const,
        severity: 'critical' as const,
        source: projectExternalSource(
          (
            ['east_europe', 'east_asia', 'central_asia', 'horn_of_africa', 'south_asia'] as const
          )[i % 5],
        ),
        target: CENTER,
        description: 'موجة DDoS — Volumetric',
        originLabelAr: 'مَصادر مُتَعدّدة',
        protocolTag: 'HTTP flood',
        lifetimeMs: 5_000,
        volume: 1500,
      })),
      agentResponses: [
        {
          agentId: 'compliance',
          agentLabelAr: 'مسؤول الامتثال',
          actionLabelAr: 'تَفعيل Cloudflare Under-Attack',
          explanationAr:
            'هذا حجم لا تَتحمّله Lambda بمفردها. فعّلت "Under Attack Mode" في Cloudflare — كل طَلَب يَمرّ بـ challenge قبل الوصول للتطبيق. المُستخدمون الحَقيقيون يَرون شاشة "Checking..." لـ 5 ثوانٍ.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 17_000,
      narratorAr: '00:17 — مُحاولة SQL Injection على بَوّابة الحلاقين.',
      events: [
        {
          kind: 'threat_attack',
          severity: 'critical',
          source: projectExternalSource('americas'),
          target: cityPoint('الرياض'),
          description: "محاولة SQLi: ' OR '1'='1",
          originLabelAr: 'الأَمريكيتان',
          protocolTag: 'POST /api/barber-portal-login',
          lifetimeMs: 5_000,
        },
      ],
      agentResponses: [
        {
          agentId: 'public_prosecutor',
          agentLabelAr: 'المُدّعي العام الرقمي',
          actionLabelAr: 'حَجب IP + تَسجيل دَليل',
          explanationAr:
            'هذه محاولة جنائية صَريحة (CFAA equivalent / نظام مكافحة جرائم المعلوماتية المادة 3). حَجَبتُ الـ IP فَوراً على CDN + حَفظتُ Headers الكاملة + Request Body المُشَفّر للملف القانوني. كل ما يَحتاجه المُحامي عند الحاجة جاهز.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 24_000,
      narratorAr: '00:24 — مُحاولة Brute-force على حساب أَدمن.',
      events: Array.from({ length: 6 }, (_, i) => ({
        kind: 'threat_attack' as const,
        severity: 'critical' as const,
        source: projectExternalSource('horn_of_africa'),
        target: CENTER,
        description: `محاولة دخول #${i + 1} — كلمات مرور شائعة`,
        originLabelAr: 'القرن الأفريقي',
        protocolTag: 'POST /api/admin-login',
        lifetimeMs: 4_500,
      })),
      agentResponses: [
        {
          agentId: 'engineering',
          agentLabelAr: 'الجناح الهندسي',
          actionLabelAr: 'تَفعيل Lockout + TOTP إجباري',
          explanationAr:
            'بَعد 5 محاولات فاشلة من نَفس الـ IP، النظام يُعلِّق الحساب 15 دقيقة. كل أَدمن لَدَيه TOTP أَصلاً — حَتّى لَو خَمّن كلمة المرور لن يَدخل بدون التَّطبيق.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 32_000,
      narratorAr: '00:32 — كل الدفاعات تَعمل. النظام يَستجيب طبيعياً للحركة الشَّرعية.',
      events: [
        {
          kind: 'visit_internal',
          severity: 'info',
          source: cityPoint('جدة'),
          description: 'زيارة شرعية مَرّت رغم الهجوم',
          originLabelAr: 'جدة',
          lifetimeMs: 4_000,
        },
        {
          kind: 'defence_action',
          severity: 'normal',
          source: CENTER,
          description: 'Cloudflare يَحجب 11,800 طلب/ثانية تَلقائياً',
          originLabelAr: 'WAF',
          lifetimeMs: 5_000,
        },
      ],
    },
    {
      atMs: 42_000,
      narratorAr: '00:42 — المهاجم يُغير تكتيكه: XSS داخل حقل ملاحظات الحلاق.',
      events: [
        {
          kind: 'threat_attack',
          severity: 'critical',
          source: projectExternalSource('east_europe'),
          target: cityPoint('بريدة'),
          description: 'حقن <script> داخل حقل bio',
          originLabelAr: 'شرق أوروبا',
          protocolTag: 'PATCH /api/barber-portfolio',
          lifetimeMs: 5_000,
        },
      ],
      agentResponses: [
        {
          agentId: 'public_prosecutor',
          agentLabelAr: 'المُدّعي العام الرقمي',
          actionLabelAr: 'إِيداع الحَدَث + Sanitize تَلقائي',
          explanationAr:
            'كل النَّصّ الذي يَدخل قاعدة البيانات يَمرّ بـ DOMPurify قَبل التَّخزين. حَتّى لَو نَجَح في الحقن، عند العَرض الـ HTML مُجَرَّد. سَجَّلت الحَدَث في public_prosecutor_dashboard.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 52_000,
      narratorAr: '00:52 — الهَجوم يَخفّ بَعد فَشل كل المُحاولات. نَتَنَفَّس.',
      agentResponses: [
        {
          agentId: 'ops_controller',
          agentLabelAr: 'مراقب العمليات',
          actionLabelAr: 'تَقرير الحَدَث للمؤسس',
          explanationAr:
            'مَلَفّ كامل: 14,392 طَلَب خَبيث حُجِب · 3 IPs على blacklist دائمة · 0 بَيانات مُسَرَّبة · 0 وَقت تَوَقُّف · المُستخدمون الحقيقيون رأوا تَأخيراً ~3 ثوانٍ في الذُّروة.',
          severity: 'info',
        },
      ],
    },
    {
      atMs: 62_000,
      narratorAr: '01:02 — انتهى الهجوم. كل الأنظمة 🟢 خَضراء. الدِّفاع نَجَح.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Scenario 3 — Combined crisis (enrollment storm + cyber attack at once)
// ---------------------------------------------------------------------------
const combinedCrisis: CyberScenario = {
  id: 'combined_crisis',
  titleAr: 'أَزمة مُرَكَّبة — عاصفة تَسجيل + هجوم سيبراني مَعاً',
  subtitleAr: 'سيناريو "اليوم الأَسود": أَسوأ ما يَمكن أن يَحدث في نَفس الدقيقة',
  totalDurationMs: 75_000,
  steps: [
    {
      atMs: 0,
      narratorAr: '00:00 — حملة تسويقية ضَخمة تَبدأ. زيارات + طلبات اشتراك تَتَدَفَّق.',
      events: Array.from({ length: 6 }, (_, i) => ({
        kind: 'registration' as const,
        severity: 'normal' as const,
        source: CITY_BEACONS[(i * 4) % CITY_BEACONS.length].view,
        description: 'طلب اشتراك',
        originLabelAr: CITY_BEACONS[(i * 4) % CITY_BEACONS.length].nameAr,
        lifetimeMs: 4_500,
      })),
    },
    {
      atMs: 6_000,
      narratorAr: '00:06 — في خِضَم الحملة، مهاجمون يَستغلون الازدحام لإِخفاء طلباتهم.',
      events: [
        ...Array.from({ length: 4 }, (_, i) => ({
          kind: 'registration' as const,
          severity: 'normal' as const,
          source: CITY_BEACONS[(i * 5) % CITY_BEACONS.length].view,
          description: 'طلب اشتراك',
          originLabelAr: CITY_BEACONS[(i * 5) % CITY_BEACONS.length].nameAr,
          lifetimeMs: 4_000,
        })),
        {
          kind: 'threat_probe',
          severity: 'elevated',
          source: projectExternalSource('central_asia'),
          target: CENTER,
          description: 'Recon ضِمن ضَوضاء التَّسجيل',
          originLabelAr: 'آسيا الوسطى',
          protocolTag: 'OPTIONS /api/admin-*',
          lifetimeMs: 5_500,
        },
      ],
      agentResponses: [
        {
          agentId: 'ops_controller',
          agentLabelAr: 'مراقب العمليات',
          actionLabelAr: 'تَشغيل وَضع الأزمة',
          explanationAr:
            'إِشارَتان متَزامنتان: حِمل تَسجيل عالٍ + Recon خَبيث. فَعّلت "Crisis Mode" — كل الوَكلاء في حالة تَأَهُّب، الـ Logs تُسَجَّل بِدِقَّة عالية، التَّقارير تَسير للمؤسّس مُباشَرَةً.',
          severity: 'elevated',
        },
      ],
    },
    {
      atMs: 13_000,
      narratorAr: '00:13 — DDoS يَبدأ مَع 8,000 طلب/ثانية + 14,000 تَسجيل/ساعة في نَفس الوَقت.',
      events: [
        ...Array.from({ length: 10 }, (_, i) => ({
          kind: 'registration' as const,
          severity: 'elevated' as const,
          source: CITY_BEACONS[(i * 7) % CITY_BEACONS.length].view,
          description: 'طلب اشتراك (في ذُروة الازدحام)',
          originLabelAr: CITY_BEACONS[(i * 7) % CITY_BEACONS.length].nameAr,
          lifetimeMs: 3_500,
        })),
        ...Array.from({ length: 6 }, (_, i) => ({
          kind: 'threat_attack' as const,
          severity: 'critical' as const,
          source: projectExternalSource(
            (['east_europe', 'east_asia', 'horn_of_africa'] as const)[i % 3],
          ),
          target: CENTER,
          description: 'DDoS flood',
          originLabelAr: 'مَصادر مُتَعَدّدة',
          protocolTag: 'HTTP flood',
          lifetimeMs: 4_500,
          volume: 2000,
        })),
      ],
      agentResponses: [
        {
          agentId: 'engineering',
          agentLabelAr: 'الجناح الهندسي',
          actionLabelAr: 'فَصل DDoS عن التَّسجيل الشَّرعي',
          explanationAr:
            'الـ DDoS لا يَأتي بـ User-Agents حقيقية + يَفتقد JS execution. وَضَعتُ challenge مُتَدَرّج: الطلب الأَوّل من IP غريب يَمرّ بـ JS challenge، الثاني بـ CAPTCHA، الثالث يُحجَب. التَّسجيل الشَّرعي يَمر شَفّافاً.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 24_000,
      narratorAr: '00:24 — مُحاولة اختراق ذَكية: محاولة تَسجيل أَدمن بكتابة "admin" في الحقل.',
      events: [
        {
          kind: 'threat_attack',
          severity: 'critical',
          source: projectExternalSource('americas'),
          target: cityPoint('الرياض'),
          description: "محاولة Privilege Escalation عبر role='admin'",
          originLabelAr: 'الأَمريكيتان',
          protocolTag: 'POST /api/register-submission',
          lifetimeMs: 5_500,
        },
      ],
      agentResponses: [
        {
          agentId: 'public_prosecutor',
          agentLabelAr: 'المُدّعي العام الرقمي',
          actionLabelAr: 'إِيداع جنائي + قَفل الـ IP',
          explanationAr:
            'الـ role في قاعدة البيانات لا يُقبل من client أَبَداً (تَجاهَله RLS Policy). لكنّ مُجَرَّد المحاولة دَليل قَصد إِجرامي. حَفظت الـ payload الكامل + Geo + ASN في الملف الجنائي. القَضائي يُمكنه فَتح دعوى عند الحاجة.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 35_000,
      narratorAr: '00:35 — قمّة الأَزمة: 25K تَسجيل/ساعة + 15K هَجَمات/ثانية. كل الدِّفاعات تَعمل.',
      events: [
        ...Array.from({ length: 14 }, (_, i) => ({
          kind: 'registration' as const,
          severity: 'elevated' as const,
          source: CITY_BEACONS[(i * 9) % CITY_BEACONS.length].view,
          description: 'طلب اشتراك',
          originLabelAr: CITY_BEACONS[(i * 9) % CITY_BEACONS.length].nameAr,
          lifetimeMs: 3_000,
        })),
        ...Array.from({ length: 8 }, (_, i) => ({
          kind: 'threat_attack' as const,
          severity: 'critical' as const,
          source: projectExternalSource(
            (['east_europe', 'east_asia', 'horn_of_africa', 'central_asia'] as const)[i % 4],
          ),
          target: CENTER,
          description: 'DDoS flood',
          originLabelAr: 'مَصادر مُتَعَدّدة',
          protocolTag: 'HTTP flood',
          lifetimeMs: 3_500,
          volume: 2500,
        })),
      ],
      agentResponses: [
        {
          agentId: 'compliance',
          agentLabelAr: 'مسؤول الامتثال',
          actionLabelAr: 'إِشعار PDPL + ZATCA احتياطي',
          explanationAr:
            'لِأَن هَجَمة قَد تَكون أَكبر من المتَوَقَّع، أَعَدَّت إِشعارَين جاهزين: PDPL في حال أيّ تَسريب (لَم يَحدث)، وZATCA لِتأكيد سَلامة فَواتير اليَوم. كلاهما لَم يُرسَل — احتياط فقط.',
          severity: 'elevated',
        },
      ],
    },
    {
      atMs: 48_000,
      narratorAr: '00:48 — الهَجمَة تَخفت بَعد فَشل كل مَحاولاتها. التَّسجيل يَستَمِرّ بِسلاسة.',
      events: Array.from({ length: 8 }, (_, i) => ({
        kind: 'registration' as const,
        severity: 'normal' as const,
        source: CITY_BEACONS[(i * 6) % CITY_BEACONS.length].view,
        description: 'طلب اشتراك',
        originLabelAr: CITY_BEACONS[(i * 6) % CITY_BEACONS.length].nameAr,
        lifetimeMs: 4_000,
      })),
      agentResponses: [
        {
          agentId: 'partner_liaison',
          agentLabelAr: 'مساعد الشركاء',
          actionLabelAr: 'إِرسال رسالة طَمأَنة للشركاء',
          explanationAr:
            'الشركاء الذين سَجَّلوا اليَوم سَيَتلَقَّون رسالة قَصيرة: "شُكراً لِصبركم — تَجاوُز الحَمل اليَوم كان استثنائياً، طَلَبكم آمِن في الطابور."',
          severity: 'info',
        },
      ],
    },
    {
      atMs: 60_000,
      narratorAr: '01:00 — تَقرير الأَزمة جاهز.',
      agentResponses: [
        {
          agentId: 'ops_controller',
          agentLabelAr: 'مراقب العمليات',
          actionLabelAr: 'تَقرير "اليَوم الأَسود"',
          explanationAr:
            '21,438 شَريك جَديد سُجِّلوا · 47,891 طَلَب خَبيث حُجِب · 0 تَسَرُّب بَيانات · 0 وَقت تَوَقُّف · 99.94% نَجاح · المُستخدم رأى تَأخير ~5 ثوانٍ في 8 دَقائق من إِجمالي 75 دَقيقة. المنصّة عَبَرَت أَسوَأ يَوم تقني مُمكن.',
          severity: 'info',
        },
      ],
    },
    {
      atMs: 72_000,
      narratorAr: '01:12 — العَودة إلى الحالة الطبيعية. كل الأَنظمة 🟢 خَضراء.',
    },
  ],
};

export const CYBER_SCENARIOS: ReadonlyArray<CyberScenario> = [
  massEnrollmentStorm,
  ddosAttack,
  combinedCrisis,
];

export function getScenarioById(id: string): CyberScenario | undefined {
  return CYBER_SCENARIOS.find((s) => s.id === id);
}
