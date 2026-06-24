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
  titleAr: 'عاصفة التَّسجيل — 25,000 طلب تفعيل رخصة / ساعة',
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
          description: 'طلب تفعيل رخصة جديد — الدمام',
          originLabelAr: 'الدمام',
          protocolTag: 'POST /api/register-submission',
          lifetimeMs: 5_000,
        },
        {
          kind: 'registration',
          severity: 'normal',
          source: cityPoint('مكة'),
          description: 'طلب تفعيل رخصة جديد — مكة',
          originLabelAr: 'مكة',
          protocolTag: 'POST /api/register-submission',
          lifetimeMs: 5_000,
        },
        {
          kind: 'registration',
          severity: 'normal',
          source: cityPoint('المدينة'),
          description: 'طلب تفعيل رخصة جديد — المدينة',
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
        description: `طلب تفعيل رخصة جديد — ${CITY_BEACONS[(i * 3) % CITY_BEACONS.length].nameAr}`,
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
        description: `طلب تفعيل رخصة جديد — ${CITY_BEACONS[(i * 5) % CITY_BEACONS.length].nameAr}`,
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
        description: 'طلب تفعيل رخصة',
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
        description: 'طلب تفعيل رخصة',
        originLabelAr: CITY_BEACONS[(i * 11) % CITY_BEACONS.length].nameAr,
        lifetimeMs: 3_000,
        volume: 1,
      })),
      agentResponses: [
        {
          agentId: 'covert_sovereign',
          agentLabelAr: 'السيادة الخفية',
          actionLabelAr: '◆ مراقبة طابور التَّسجيل عَبر القناة الخَلفية',
          explanationAr:
            'أَرصُد مُعدَّل التَّسجيل عَبر القناة المُشَفَّرة — الإيقاع لا يُشير إلى نَشاط مُزيَّف (bot). تَوزيع المَناطق الجُغرافية طَبيعي. أُعطي إشارة خضراء لاستمرار المعالجة.',
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
          agentId: 'proactive_scout',
          agentLabelAr: 'عميل الاستطلاع الاستباقي',
          actionLabelAr: '⚠️ إنذار مبكر — معدل متصاعد',
          explanationAr: 'رَصَدتُ ارتفاعاً حاداً في معدل الطلبات قبل 47 ثانية — كان بإمكاني إطلاق التنبيه مبكراً. الدرس: حدّ الإنذار المبكر سيُخفَّض من 5 إلى 3 أحداث/دقيقة بعد هذه الجلسة.',
          severity: 'elevated',
        },
        {
          agentId: 'cyber_defense',
          agentLabelAr: 'قائد الدفاع السيبراني',
          actionLabelAr: '🚨 إنذار DDoS — تَفعيل درع الطَّوارئ',
          explanationAr:
            '12,000 طلب/ثانية من +1,000 IP — هذا هجوم منسَّق. فعّلت Anycast Routing لتوزيع الحِمل فَوراً. حَجَبتُ نطاقات ASN المَعروفة بشراء حركة مُزيَّفة. الشَّبكة في وَضع الحِصن — كل IP يَحتاج PoW قبل العُبور.',
          severity: 'critical',
        },
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
          agentId: 'cyber_defense',
          agentLabelAr: 'قائد الدفاع السيبراني',
          actionLabelAr: '⚡ عَزل مَصدر الاختراق',
          explanationAr:
            'رَصَدتُ حَمولة SQL مُشوَّشة (obfuscated) داخل User-Agent غير الاعتيادي. عَزَلتُ المَصدر وأَضَفتُه لقائمة الحَظر الدائم. WAF rule جديد يَصفّي حَمولات مُشابهة تلقائياً.',
          severity: 'critical',
        },
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
          agentId: 'forensic_analyst',
          agentLabelAr: 'محلل الجنائيات الرقمية',
          actionLabelAr: '🔬 تحليل جنائي ما بعد الهجوم',
          explanationAr: 'الهجوم كان موزّعاً من +1,000 IP — نمط botnet كلاسيكي مستأجر. المصادر من 5 نطاقات ASN معروفة بيع حركة مزيّفة. أوصي بإضافتها لقائمة الحظر الدائمة. الملفات الجنائية جاهزة.',
          severity: 'critical',
        },
        {
          agentId: 'cyber_defense',
          agentLabelAr: 'قائد الدفاع السيبراني',
          actionLabelAr: '✅ الدِّرع صَمَد — تَقرير الجَولة',
          explanationAr:
            'الهجوم فَشِل على جميع المَراحل: L3 Volumetric ← أَوقَفَه Anycast · L7 SQL/XSS ← أَوقَفَه WAF · Brute-force ← أَوقَفَه Lockout+TOTP. البنية الأمنية تَعمَل كما صُمِّمت. أُوصي بمُراجعة القواعد الجديدة وتثبيتها دائمة.',
          severity: 'info',
        },
        {
          agentId: 'threat_neutralizer',
          agentLabelAr: 'محيّد التهديدات',
          actionLabelAr: '⚡ تحييد شامل منتهٍ',
          explanationAr: 'تمّ تحييد 14,392 طلب خبيث عبر المنظومة الثلاثية: Rate Limiter (التصفية الأولى) → Supabase Block List → Cloudflare Edge Block. كل الطبقات عملت بتناسق. 0 بيانات مُسرَّبة.',
          severity: 'info',
        },
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
      narratorAr: '00:00 — حملة تسويقية ضَخمة تَبدأ. زيارات + طلبات تفعيل الرخصة تَتَدَفَّق.',
      events: Array.from({ length: 6 }, (_, i) => ({
        kind: 'registration' as const,
        severity: 'normal' as const,
        source: CITY_BEACONS[(i * 4) % CITY_BEACONS.length].view,
        description: 'طلب تفعيل رخصة',
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
          description: 'طلب تفعيل رخصة',
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
          description: 'طلب تفعيل رخصة (في ذُروة الازدحام)',
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
          description: 'طلب تفعيل رخصة',
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
        description: 'طلب تفعيل رخصة',
        originLabelAr: CITY_BEACONS[(i * 6) % CITY_BEACONS.length].nameAr,
        lifetimeMs: 4_000,
      })),
      agentResponses: [
        {
          agentId: 'covert_sovereign',
          agentLabelAr: 'السيادة الخفية',
          actionLabelAr: '◆ تَحليل نَمَط الأَزمة المُرَكَّبة',
          explanationAr:
            'التَّزامن بين عاصفة التَّسجيل والهجوم السيبراني يُشير إلى هُجوم ذَكي — احتمال أن الهجوم خُطِّط لِيُغطّي على تَسرُّب داخلي. أَرفَع تَقرير الاستخبارات للمؤسس عَبر القناة السرية.',
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

// ---------------------------------------------------------------------------
// Scenario 4 — Account Takeover Storm (هجوم سرقة حسابات الصالونات)
// Credential stuffing على بوابة دخول الحلاقين
// ---------------------------------------------------------------------------
const accountTakeoverStorm: CyberScenario = {
  id: 'account_takeover',
  titleAr: 'عاصفة سرقة الحسابات — Credential Stuffing',
  subtitleAr: 'هجوم منظَّم يستهدف بوابة دخول الحلاقين بقوائم بيانات مسرَّبة',
  totalDurationMs: 55_000,
  steps: [
    {
      atMs: 0,
      narratorAr: '00:00 — نشاط طبيعي على بوابة دخول الصالونات.',
      events: [
        { kind: 'login_success', severity: 'info', source: cityPoint('الرياض'), description: 'دخول صالون — الرياض' },
        { kind: 'login_success', severity: 'info', source: cityPoint('جدة'), description: 'دخول صالون — جدة' },
      ],
      agentResponses: [{
        agentId: 'proactive_scout', agentLabelAr: 'عميل الاستطلاع الاستباقي',
        actionLabelAr: '🔍 رصد بوابة الدخول',
        explanationAr: 'معدل المحاولات الطبيعي: 3-5 دخول/دقيقة. لا شيء مريب حتى الآن — مراقبة مستمرة.',
        severity: 'info',
      }],
    },
    {
      atMs: 8_000,
      narratorAr: '00:08 — ارتفاع مفاجئ في محاولات الدخول الفاشلة من IPs متعددة.',
      events: Array.from({ length: 6 }, (_, i) => ({
        kind: 'threat_probe' as const,
        severity: 'elevated' as const,
        source: projectExternalSource((['americas', 'east_europe', 'east_asia', 'central_asia', 'horn_of_africa', 'south_asia'] as const)[i]),
        target: cityPoint('الرياض'),
        description: `محاولة دخول فاشلة #${i + 1} — بيانات مسرَّبة`,
        originLabelAr: ['أمريكا', 'أوروبا الشرقية', 'آسيا', 'آسيا الوسطى', 'أفريقيا', 'جنوب آسيا'][i],
        protocolTag: 'POST /api/barber-portal-login',
        lifetimeMs: 5_000,
      })),
      agentResponses: [
        {
          agentId: 'proactive_scout', agentLabelAr: 'عميل الاستطلاع الاستباقي',
          actionLabelAr: '🚨 إنذار مبكر — Credential Stuffing',
          explanationAr: 'رَصَدتُ نمط Credential Stuffing: IPs متعددة، نفس الـ endpoint، معدل متصاعد بشكل تصاعدي. هذا ليس مستخدمين حقيقيين — هذا bot يجرّب قائمة بيانات مسرَّبة. أُوصي بالتدخل الفوري.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 16_000,
      narratorAr: '00:16 — الهجوم يتصاعد: 800 محاولة/دقيقة من 40+ مصدر.',
      events: Array.from({ length: 8 }, (_, i) => ({
        kind: 'threat_attack' as const,
        severity: 'critical' as const,
        source: projectExternalSource((['americas', 'east_europe', 'east_asia', 'central_asia', 'horn_of_africa', 'south_asia', 'east_europe', 'americas'] as const)[i]),
        target: cityPoint('الرياض'),
        description: `Credential Stuffing — محاولة #${(i + 1) * 100}`,
        originLabelAr: 'مصادر موزّعة',
        protocolTag: 'POST /login — known leaked credentials',
        lifetimeMs: 6_000,
        volume: 100,
      })),
      agentResponses: [
        {
          agentId: 'forensic_analyst', agentLabelAr: 'محلل الجنائيات الرقمية',
          actionLabelAr: '🔬 تحديد البيانات المسرَّبة',
          explanationAr: 'الحمولة تحتوي بيانات بصيغة "email:password" مع نمط هاش MD5 — مصدرها تسريب 2023 لقاعدة بيانات خدمة خليجية. هذه قائمة معروفة تباع في منتديات Dark Web. أرفع ملف التعريف للمدعي العام.',
          severity: 'critical',
        },
        {
          agentId: 'cyber_defense', agentLabelAr: 'قائد الدفاع السيبراني',
          actionLabelAr: '⚡ تفعيل CAPTCHA + Account Lockout',
          explanationAr: 'فعّلت إجبارية CAPTCHA على بوابة الدخول + قفل تلقائي بعد 5 محاولات فاشلة من نفس IP. المصادر الخارجية الـ 40+ باتت ترى تحدياً رياضياً قبل كل محاولة.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 28_000,
      narratorAr: '00:28 — محيّد التهديدات يُنفّذ الحظر الشامل.',
      events: Array.from({ length: 5 }, () => ({
        kind: 'defence_action' as const,
        severity: 'critical' as const,
        source: CENTER,
        description: 'تحييد شامل — حظر IP على DB + Cloudflare',
        originLabelAr: 'محيّد التهديدات',
        protocolTag: 'BLOCK: credential-stuffing-ips',
        lifetimeMs: 5_000,
      })),
      agentResponses: [
        {
          agentId: 'threat_neutralizer', agentLabelAr: 'محيّد التهديدات',
          actionLabelAr: '⚡ تحييد شامل — 40 IP في ثانية',
          explanationAr: 'نفّذت الحظر الثنائي: 40 IP في Supabase Block List + Cloudflare Edge Block في نفس اللحظة. معدل المحاولات انخفض من 800 إلى 12 في الدقيقة. آخر 12 يتحدّون CAPTCHA.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 40_000,
      narratorAr: '00:40 — الهجوم فشل. 0 حسابات مُخترَقة.',
      agentResponses: [
        {
          agentId: 'public_prosecutor', agentLabelAr: 'المُدّعي العام الرقمي',
          actionLabelAr: '📋 تقرير جنائي — Credential Stuffing',
          explanationAr: '11,429 محاولة دخول فاشلة مُسجَّلة. 0 حسابات مُخترَقة. البيانات المستخدمة مُعرَّفة ومحفوظة كدليل رقمي. البروتوكول: إشعار الحسابات المستهدفة بتغيير كلمة المرور احترازياً.',
          severity: 'info',
        },
      ],
    },
    { atMs: 55_000, narratorAr: '00:55 — الحماية صمدت. الحسابات سليمة 🟢' },
  ],
};

// ---------------------------------------------------------------------------
// Scenario 5 — Intelligence Scraping Raid (غارة كشط بيانات الصالونات)
// بوت يستهدف رصد الصالونات والمواقع لصالح منافس
// ---------------------------------------------------------------------------
const dataScrapingRaid: CyberScenario = {
  id: 'data_scraping',
  titleAr: 'غارة كشط البيانات الاستخباراتية',
  subtitleAr: 'بوت منظَّم يستخرج مواقع وأسعار الصالونات لصالح جهة منافسة',
  totalDurationMs: 50_000,
  steps: [
    {
      atMs: 0,
      narratorAr: '00:00 — زيارات طبيعية لبحث الصالونات من مختلف المدن.',
      events: [
        { kind: 'visit_internal', severity: 'info', source: cityPoint('الرياض'), description: 'بحث صالونات — الرياض' },
        { kind: 'visit_internal', severity: 'info', source: cityPoint('جدة'), description: 'بحث صالونات — جدة' },
        { kind: 'visit_internal', severity: 'info', source: cityPoint('الدمام'), description: 'بحث صالونات — الدمام' },
      ],
    },
    {
      atMs: 7_000,
      narratorAr: '00:07 — نمط غير طبيعي: نفس الـ IP يطلب كل الصالونات في منطقة بالكامل.',
      events: Array.from({ length: 6 }, (_, i) => ({
        kind: 'threat_probe' as const,
        severity: 'elevated' as const,
        source: projectExternalSource('east_asia'),
        target: [cityPoint('الرياض'), cityPoint('جدة'), cityPoint('الدمام'), cityPoint('مكة المكرمة'), cityPoint('المدينة المنورة'), cityPoint('الطائف')][i],
        description: `كشط منهجي — صالون ${i + 1}/200`,
        originLabelAr: 'آسيا (IP Proxy)',
        protocolTag: 'GET /api/public-barbers?region=all',
        lifetimeMs: 4_000,
        volume: 50,
      })),
      agentResponses: [
        {
          agentId: 'forensic_analyst', agentLabelAr: 'محلل الجنائيات الرقمية',
          actionLabelAr: '🔬 كشف بوت كشط منظَّم',
          explanationAr: 'نمط الطلبات يكشف بوتاً منهجياً: طلب كل 1.3 ثانية بالضبط، User-Agent ثابت، تسلسل جغرافي منطقي (يمسح المناطق بالترتيب). الهدف: استخراج كامل قاعدة بيانات الصالونات لصالح طرف منافس.',
          severity: 'elevated',
        },
        {
          agentId: 'covert_sovereign', agentLabelAr: 'السيادة الخفية',
          actionLabelAr: '◆ تحليل استخباراتي',
          explanationAr: 'الـ IP يعود لخادم Virtual Private Server مؤجَّر في سنغافورة — نمط معتاد لشركات الاستخبارات التنافسية. يرجّح أن وراء هذا منصة تحاول نسخ قاعدة بياناتنا قبل الإطلاق الرسمي.',
          severity: 'elevated',
        },
      ],
    },
    {
      atMs: 18_000,
      narratorAr: '00:18 — البوت يتكيّف ويوزّع الطلبات على IPs مختلفة.',
      events: Array.from({ length: 8 }, (_, i) => ({
        kind: 'threat_attack' as const,
        severity: 'critical' as const,
        source: projectExternalSource((['east_asia', 'americas', 'east_europe', 'south_asia', 'east_asia', 'americas', 'central_asia', 'horn_of_africa'] as const)[i]),
        target: [cityPoint('الرياض'), cityPoint('جدة'), cityPoint('الدمام'), cityPoint('الطائف'), cityPoint('المدينة المنورة'), cityPoint('أبها'), cityPoint('تبوك'), cityPoint('حائل')][i],
        description: 'كشط موزّع — botnet منظَّم',
        protocolTag: 'GET /api/public-barbers — distributed scraping',
        lifetimeMs: 5_000,
        volume: 200,
      })),
      agentResponses: [
        {
          agentId: 'cyber_defense', agentLabelAr: 'قائد الدفاع السيبراني',
          actionLabelAr: '🛡 تفعيل Rate Limit + Honeypot',
          explanationAr: 'ضيّقتُ نافذة الـ API لـ 10 طلبات/دقيقة/IP وأضفت Honeypot fields في البيانات — أي من يقرأها بوت وليس إنساناً. البوت الذي يصطادها يُضاف تلقائياً لقائمة الحظر.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 32_000,
      narratorAr: '00:32 — الـ Honeypot يصطاد البوتات. بدء التحييد الشامل.',
      events: Array.from({ length: 6 }, () => ({
        kind: 'defence_action' as const,
        severity: 'elevated' as const,
        source: CENTER,
        description: 'Honeypot triggered — IP في قائمة الحظر',
        originLabelAr: 'منظومة الدفاع',
        protocolTag: 'HONEYPOT → BLOCK',
        lifetimeMs: 4_000,
      })),
      agentResponses: [
        {
          agentId: 'threat_neutralizer', agentLabelAr: 'محيّد التهديدات',
          actionLabelAr: '⚡ صيد الـ Honeypot — 8 IPs مُحيَّدة',
          explanationAr: '8 IPs اصطادها الـ Honeypot — محجوبة فوراً على DB + Cloudflare. البيانات التي سرقوها مُلوَّثة ببيانات مزيّفة. أي منافس يبني عليها قاعدة بياناته سيحصل على معلومات خاطئة.',
          severity: 'elevated',
        },
        {
          agentId: 'public_prosecutor', agentLabelAr: 'المُدّعي العام الرقمي',
          actionLabelAr: '📋 توثيق انتهاك تنافسي',
          explanationAr: 'هذه عملية تجسس تجاري — تُشكّل انتهاكاً لنظام مكافحة الجرائم المعلوماتية المادة 13 (الحصول غير المشروع على بيانات). تمّ توثيق الأدلة الجنائية: IPs، timestamps، حجم البيانات المُسرَّبة.',
          severity: 'critical',
        },
      ],
    },
    { atMs: 50_000, narratorAr: '00:50 — الغارة فُشلت. البيانات المسرَّبة: مُلوَّثة بالـ Honeypot 🟢' },
  ],
};

// ---------------------------------------------------------------------------
// Scenario 6 — Fake Pioneers Flood (إغراق مقاعد الألف الرواد بتسجيلات وهمية)
// هجوم يستهدف حجز مقاعد العرض التأسيسي بهويات مزيّفة
// ---------------------------------------------------------------------------
const fakePioneersFlood: CyberScenario = {
  id: 'fake_pioneers',
  titleAr: 'إغراق مقاعد الألف الرواد — تسجيلات وهمية',
  subtitleAr: 'هجوم منظَّم يحاول سرقة مقاعد العرض التأسيسي وشارة الرائد بهويات مزيّفة',
  totalDurationMs: 60_000,
  steps: [
    {
      atMs: 0,
      narratorAr: '00:00 — تدفق طلبات تسجيل عادي من صالونات حقيقية.',
      events: [
        { kind: 'registration', severity: 'info', source: cityPoint('الرياض'), description: 'تسجيل صالون جديد — الرياض' },
        { kind: 'registration', severity: 'info', source: cityPoint('جدة'), description: 'تسجيل صالون — جدة' },
      ],
    },
    {
      atMs: 6_000,
      narratorAr: '00:06 — ارتفاع مفاجئ في التسجيلات من IPs متكررة.',
      events: Array.from({ length: 8 }, (_, i) => ({
        kind: 'registration' as const,
        severity: 'elevated' as const,
        source: projectExternalSource((['east_europe', 'central_asia', 'south_asia', 'americas', 'east_asia', 'horn_of_africa', 'east_europe', 'central_asia'] as const)[i]),
        description: `تسجيل مشبوه #${i + 1} — بيانات مولَّدة`,
        originLabelAr: 'مصادر خارجية',
        protocolTag: 'POST /api/register-submission — bot',
        lifetimeMs: 5_000,
        volume: 10,
      })),
      agentResponses: [
        {
          agentId: 'proactive_scout', agentLabelAr: 'عميل الاستطلاع الاستباقي',
          actionLabelAr: '🚨 كشف تسجيلات وهمية',
          explanationAr: 'رصدت تدفق تسجيلات بمعدل ×12 فوق الطبيعي. التحليل: User-Agent متطابق، أرقام هواتف تبدأ بـ +966 مع تسلسل رياضي واضح (0501234567، 0501234568...)، أسماء صالونات مُولَّدة بـ AI.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 15_000,
      narratorAr: '00:15 — الهجوم يتصاعد: محاولة حجز 500 مقعد من الألف.',
      events: Array.from({ length: 10 }, (_, i) => ({
        kind: 'threat_attack' as const,
        severity: 'critical' as const,
        source: projectExternalSource((['east_europe', 'central_asia', 'south_asia', 'americas', 'east_asia', 'horn_of_africa', 'east_europe', 'central_asia', 'east_asia', 'americas'] as const)[i]),
        target: CENTER,
        description: 'إغراق مقاعد الرواد — تسجيل وهمي',
        originLabelAr: 'شبكة بوت منظّمة',
        protocolTag: 'POST /api/register-submission — fake pioneers attack',
        lifetimeMs: 6_000,
        volume: 50,
      })),
      agentResponses: [
        {
          agentId: 'forensic_analyst', agentLabelAr: 'محلل الجنائيات الرقمية',
          actionLabelAr: '🔬 تحليل هوية البوت',
          explanationAr: 'فحص 200 تسجيل: 98% منها بأسماء صالونات لا تتطابق مع أي محل حلاقة في خرائط Google. بيانات الموقع الجغرافي كلها تشير لنفس الإحداثيات مع إزاحة عشوائية. هذا هجوم منظَّم يستهدف سرقة مقاعد العرض التأسيسي.',
          severity: 'critical',
        },
        {
          agentId: 'cyber_defense', agentLabelAr: 'قائد الدفاع السيبراني',
          actionLabelAr: '🛡 تفعيل فلتر التحقق المتقدّم',
          explanationAr: 'فعّلتُ طبقة تحقق إضافية: رقم هاتف يجب تأكيده بـ OTP، صورة الصالون تُفحص بـ AI للتحقق من وجودها فعلاً، حد 1 تسجيل/IP/24 ساعة. البوتات الآن عالقة عند OTP.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 30_000,
      narratorAr: '00:30 — محيّد التهديدات يُعدم الهجوم على المستويين.',
      events: Array.from({ length: 5 }, () => ({
        kind: 'defence_action' as const,
        severity: 'critical' as const,
        source: CENTER,
        description: 'تصفية تسجيلات وهمية — إلغاء جماعي',
        originLabelAr: 'محيّد التهديدات',
        protocolTag: 'BLOCK + INVALIDATE',
        lifetimeMs: 5_000,
      })),
      agentResponses: [
        {
          agentId: 'threat_neutralizer', agentLabelAr: 'محيّد التهديدات',
          actionLabelAr: '⚡ إلغاء 487 تسجيل وهمي + حظر شامل',
          explanationAr: '487 تسجيلاً وهمياً مُلغى — المقاعد أُعيدت لقائمة الألف الرواد. 23 IP مصدر الهجوم محجوبة على DB + Cloudflare. شارة رائد لم تُسلَّم لأي من البوتات. المقاعد الحقيقية محفوظة.',
          severity: 'critical',
        },
        {
          agentId: 'public_prosecutor', agentLabelAr: 'المُدّعي العام الرقمي',
          actionLabelAr: '📋 توثيق الاحتيال التجاري',
          explanationAr: 'محاولة تزوير للحصول على عرض تجاري بطريق الاحتيال — نظام مكافحة الجرائم المعلوماتية المادة 3. الأدلة: IPs، أنماط البيانات المولَّدة، timestamps. ملف جاهز للإحالة عند الحاجة.',
          severity: 'critical',
        },
      ],
    },
    { atMs: 60_000, narratorAr: '01:00 — الهجوم مُوقَف. مقاعد الألف الرواد محمية 🟢' },
  ],
};

// ---------------------------------------------------------------------------
// Scenario 7 — Advanced Persistent Threat (تهديد متقدم ومتواصل — APT)
// هجوم بطيء ومتعدد المراحل يستهدف البنية التحتية
// ---------------------------------------------------------------------------
const advancedPersistentThreat: CyberScenario = {
  id: 'advanced_apt',
  titleAr: 'تهديد متقدم ومتواصل — APT',
  subtitleAr: 'هجوم صبور متعدد المراحل: استطلاع → تسلل → تصعيد → نفّذ قائد الدفاع',
  totalDurationMs: 70_000,
  steps: [
    {
      atMs: 0,
      narratorAr: '00:00 — استطلاع خفيف جداً — يشبه الزيارات العادية.',
      events: Array.from({ length: 4 }, (_, i) => ({
        kind: 'visit_external' as const,
        severity: 'info' as const,
        source: projectExternalSource('east_europe'),
        description: `استطلاع خفيف — نقطة ${i + 1}`,
        protocolTag: 'GET — low & slow recon',
        lifetimeMs: 3_000,
      })),
      agentResponses: [{
        agentId: 'forensic_analyst', agentLabelAr: 'محلل الجنائيات الرقمية',
        actionLabelAr: '🔬 رصد استطلاع خفيف',
        explanationAr: 'رصدتُ نمطاً خفياً: 4 زيارات من نفس الـ subnet بفاصل 45 ثانية بالضبط. التوقيت الحسابي يشير لأوتوماتيكية. هذا استطلاع مبرمَج يحاول تجنب Rate Limiting. أُضيفه لقائمة المراقبة.',
        severity: 'info',
      }],
    },
    {
      atMs: 12_000,
      narratorAr: '00:12 — المهاجم يجرّب نقاط ضعف في الـ API.',
      events: Array.from({ length: 5 }, (_, i) => ({
        kind: 'threat_probe' as const,
        severity: 'elevated' as const,
        source: projectExternalSource('east_europe'),
        target: CENTER,
        description: `فحص نقطة ${['register', 'login', 'admin', 'payment', 'barbers'][i]} API`,
        originLabelAr: 'أوروبا الشرقية',
        protocolTag: [`OPTIONS /api/register`, `HEAD /api/admin-login`, `GET /api/admin`, `POST /api/payment`, `GET /api/barbers?admin=true`][i],
        lifetimeMs: 4_000,
      })),
      agentResponses: [
        {
          agentId: 'proactive_scout', agentLabelAr: 'عميل الاستطلاع الاستباقي',
          actionLabelAr: '🚨 تصعيد — مسح نقاط الـ API',
          explanationAr: 'المهاجم ينتقل للمرحلة الثانية: يفحص نقاط الـ API بطلبات OPTIONS/HEAD غير مألوفة — يبحث عن نقاط غير محمية. طلب واحد استهدف /api/admin — هذا مؤشر خطير على نية التصعيد.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 24_000,
      narratorAr: '00:24 — محاولة تصعيد صلاحيات على مسار الأدمن.',
      events: Array.from({ length: 6 }, (_, i) => ({
        kind: 'threat_attack' as const,
        severity: 'critical' as const,
        source: projectExternalSource('east_europe'),
        target: CENTER,
        description: `محاولة اختراق أدمن #${i + 1}`,
        originLabelAr: 'أوروبا الشرقية',
        protocolTag: 'POST /api/admin-login — privilege escalation',
        lifetimeMs: 5_000,
      })),
      agentResponses: [
        {
          agentId: 'cyber_defense', agentLabelAr: 'قائد الدفاع السيبراني',
          actionLabelAr: '⚡ حماية المسارات الحساسة',
          explanationAr: 'جميع مسارات /api/admin محمية بـ MFA + JWT signature. المهاجم يحاول حقن JWT مزيّف — مستحيل بدون المفتاح السري. فعّلتُ تسجيل كل طلب لهذا الـ IP في سجل الجنائيات.',
          severity: 'critical',
        },
        {
          agentId: 'covert_sovereign', agentLabelAr: 'السيادة الخفية',
          actionLabelAr: '◆ تتبع مجموعة APT',
          explanationAr: 'بناءً على التكتيكات والأدوات (TTP): هذا يشبه مجموعة APT28 "Fancy Bear" المتخصصة بالاستطلاع الممنهج. أُوصي بحظر كامل الـ ASN المصدر — ليس IP واحداً فقط.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 42_000,
      narratorAr: '00:42 — قائد الدفاع يُنهي الهجوم بتحييد كامل للمصدر.',
      events: Array.from({ length: 4 }, () => ({
        kind: 'defence_action' as const,
        severity: 'critical' as const,
        source: CENTER,
        description: 'حظر ASN كامل — تحييد مجموعة APT',
        originLabelAr: 'منظومة الدفاع المتكاملة',
        protocolTag: 'CF: BLOCK ASN + DB: BLOCK IP-RANGE',
        lifetimeMs: 5_000,
      })),
      agentResponses: [
        {
          agentId: 'threat_neutralizer', agentLabelAr: 'محيّد التهديدات',
          actionLabelAr: '⚡ تحييد نطاق ASN كامل',
          explanationAr: 'بناءً على توصية السيادة الخفية: حجبتُ كامل نطاق ASN (لا IP واحد). Cloudflare rule يُحجب 4,096 عنوان IP من نفس المصدر. هذا يُنهي أي محاولة انتقال داخل نفس الشبكة.',
          severity: 'critical',
        },
      ],
    },
    {
      atMs: 55_000,
      narratorAr: '00:55 — الهجوم مُوقَف عند محاولة التصعيد. 0 اختراقات.',
      agentResponses: [
        {
          agentId: 'public_prosecutor', agentLabelAr: 'المُدّعي العام الرقمي',
          actionLabelAr: '📋 تقرير APT — ملف جنائي كامل',
          explanationAr: 'موثَّق: 4 مراحل هجوم APT — استطلاع، مسح، محاولة تصعيد، انسحاب. 0 اختراقات. الملف الجنائي يحتوي على TTP كاملة للمجموعة. أوصي بإشعار الجهات الأمنية السعودية (CITC/NCA) بنمط الهجوم.',
          severity: 'info',
        },
      ],
    },
    { atMs: 70_000, narratorAr: '01:10 — المنصة صمدت أمام APT كامل المراحل 🟢' },
  ],
};

export const CYBER_SCENARIOS: ReadonlyArray<CyberScenario> = [
  massEnrollmentStorm,
  ddosAttack,
  combinedCrisis,
  accountTakeoverStorm,
  dataScrapingRaid,
  fakePioneersFlood,
  advancedPersistentThreat,
];

export function getScenarioById(id: string): CyberScenario | undefined {
  return CYBER_SCENARIOS.find((s) => s.id === id);
}
