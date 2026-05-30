// @ts-nocheck
import {
  DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME,
  DIGITAL_SHIFT_PRODUCT_TITLE,
  DIGITAL_SHIFT_REPLY_COST_HALALAS,
  DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR,
  DIGITAL_SHIFT_SUPPORTED_LANGUAGES_FEATURE_AR,
  DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR,
} from '@/config/digitalShiftAssistant';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import type {
  AiStaffAgentDef,
  AiStaffBoundaryDef,
  AiStaffBoundaryId,
  FleetIntelligencePing,
  PartnerLiaisonAnalyticsSnapshot,
} from '@/modules/ai-staff/types';

export const AI_STAFF_CONTROL_ROOM_TITLE = 'غرفة قيادة الموظفين الأذكياء';
export const AI_STAFF_CONTROL_ROOM_SUBTITLE =
  'وحدة مستقلة لإدارة الأسطاب الافتراضية — حدود إدارية صارمة، مراقبة ميدانية، وقنوات سيادية سرية للقيادة.';

export const AI_STAFF_BOUNDARIES: AiStaffBoundaryDef[] = [
  {
    id: 'supreme_defense',
    titleAr: '◉ القيادة العليا للدفاع السيبراني',
    subtitleAr:
      'القائد الأعلى للدفاع — Cyber Defense Commander · يستفز كل الوكلاء لقيادة دفّة الدفاع. «المدعي العام» سلطة مستقلة ولا يخضع لأمره.',
    gridClassName: 'max-w-3xl',
  },
  {
    id: 'internal_governance',
    titleAr: 'أ — الحوكمة الداخلية للمنصة',
    subtitleAr: 'خازن · ZATCA · مستشار الأزمات · المدعي العام — سجلات المنصة والامتثال والتعافي',
    gridClassName: 'sm:grid-cols-2 lg:grid-cols-4',
  },
  {
    id: 'engineering_council',
    titleAr: 'ج — المجلس الهندسي الذاتي',
    subtitleAr: 'Technical Consultant · A2A Council · Draft Branch · Pending Founder Approval',
    gridClassName: 'max-w-3xl',
  },
  {
    id: 'marketing_council',
    titleAr: 'د — المجلس التسويقي',
    subtitleAr:
      'استراتيجي B2C للمستخدم النهائي · استراتيجي B2B للشركاء — حقن معرفة منصة، مهارات تسويقية، ومحاورة المؤسس مع حضور دائم للمدعي العام عند الطلب',
    gridClassName: 'sm:grid-cols-2',
  },
  {
    id: 'media_office',
    titleAr: 'هـ — المكتب الإعلامي',
    subtitleAr:
      'المتحدث الإعلامي — علوم الإعلام والعلاقات العامة، رسائل مهنية، إدارة سمعة، واستدعاء كل الوكلاء لتغذية البيانات',
    gridClassName: 'max-w-3xl',
  },
  {
    id: 'external_partner_ops',
    titleAr: 'ب — عمليات الشركاء الخارجية',
    subtitleAr: 'المناوب الميداني · مساعد الشركاء — نشر ميداني وعلاقات بدون العبث بالماليات',
    gridClassName: 'sm:grid-cols-2',
  },
  {
    id: 'covert_sovereign',
    titleAr: '◆ سيادة الأسطول — مقصورة سرية',
    subtitleAr: 'المدير العام للمناوبين — مراقبة صامتة عبر قناة خلفية مشفرة (قيادة عليا فقط)',
    gridClassName: 'max-w-2xl',
    covert: true,
  },
  {
    id: 'legal_governance',
    titleAr: '⚖ الحوكمة القانونية',
    subtitleAr: 'الناظر القانوني — سياسات الخصوصية والامتثال وشروط الاستخدام، يتواجد في الصفحات العامة ويُقدِّم تقارير سرية للمدعي العام',
    gridClassName: 'max-w-2xl',
  },
];

const DIGITAL_SHIFT_DOCTRINE: string[] = [
  'إضافة برمجية متقدمة (Software Add-on) للرخصة الماسية التقنية فقط — +25 ر.س/حزمة، منفصلة عن حزمة الإدراج.',
  'ممنوع العبث بمحافظ العملاء أو أسعار الخدمة — المناوب يعمل على الآداب والجدولة فقط.',
  DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR,
  DIGITAL_SHIFT_SUPPORTED_LANGUAGES_FEATURE_AR,
  DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR,
  'محفظة المناوب (هللات) تخص صالون الحلاق فقط — migration 78 · barber_ai_wallet.',
];

const PARTNER_LIAISON_DOCTRINE: string[] = [
  'نطاق مسار الخدمات البرمجية للمنصة فقط — لا بيانات مالية للمستهلك النهائي.',
  'يجمع ملاحظات الاحتكاك التشغيلي من الحلاقين دون التدخل في مدفوعات الصالون.',
];

/** Unified registry — single source of truth for all virtual staff. */
export const AI_STAFF_AGENT_REGISTRY: AiStaffAgentDef[] = [
  {
    id: 'cyber_defense_commander',
    boundary: 'supreme_defense',
    shortName: 'القائد الأعلى للدفاع 🛡️◉',
    title: 'Cyber Defense Commander — القائد الأعلى للدفاع السيبراني',
    statusBadgeAr: 'سيادة دفاع · Supreme Command',
    ctaLabelAr: 'فتح غرفة الدفاع السيبراني 🛡️',
    roleDescription:
      'وكيل سيبراني من الطراز الأول — مزوّد بأقصى ما يمكن من علوم الأمن السيبراني (Defensive · Offensive · IR · Cloud · AppSec · Compliance). معرفته بمنصة حلاق ماب عامة فقط؛ يستفز كل الوكلاء (ما عدا المدعي العام صاحب السلطة المستقلة) ويوحّد قيادة الدفاع عند أي هجوم سيبراني. يصدر «أمر دفاع» قابلاً للتنفيذ لا قراراً تنفيذياً مباشراً.',
    accentClass: staffTheme.accentSupremeDefense,
    requiredAny: ['manage_admins', 'view_overview'],
    available: true,
    iconKind: 'cyber_defense',
    workspaceKind: 'cyber_defense_command',
    classification: 'elite_covert',
    consultAgents: [
      'technical_consultant_engineering',
      'system_crisis_advisor',
      'fleet_director_general',
      'billing_treasurer',
      'zatca_tax_advisor',
      'partner_relations_liaison',
      'digital_shift_field',
      'media_spokesperson',
      'public_prosecutor',
    ],
    doctrineNotes: [
      'تخصص مطلق في الأمن السيبراني — معرفة المنصة عامة فقط، يستشير الوكيل المختص قبل أي قرار حساس.',
      'القائد الأعلى للدفاع: جميع الوكلاء تحت إمرته باستثناء «المدعي العام» (سلطة مستقلة — تشاور لا أمر).',
      'يصدر «أمر دفاع» (Defense Order) — لا تنفيذ مباشر على الإنتاج من المحادثة.',
      'بروتوكول NIST 800-61: Detect → Triage → Contain → Eradicate → Recover → Lessons Learned.',
      'يلتزم بـ PDPL/NCA ECC ولا يكشف أسراراً تشغيلية في أي رد.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-cyber-defense-commander-lab-chat'],
      systemPromptBuilder: 'api/_lib/cyberDefenseCommanderLab.ts',
    },
  },
  {
    id: 'billing_treasurer',
    boundary: 'internal_governance',
    shortName: 'خازن 🪙',
    title: 'خازن — دفتر المنصة والمحفظة',
    roleDescription:
      'أتمتة الفوترة الذكية، قراءة فواتير البنية التحتية، وتحديث جدول الالتزامات فورياً عبر لقطات الشاشة — زميل **خبير ZATCA** في المكتب المالي الموحّد.',
    accentClass: staffTheme.accentEmerald,
    requiredAny: ['view_ops_billing_monitor', 'manage_centralized_billing_ops'],
    available: true,
    iconKind: 'treasurer',
    workspaceKind: 'billing_dialog',
    ctaLabelAr: 'فتح مكتب خازن',
    consultAgents: ['zatca_tax_advisor', 'public_prosecutor'],
    doctrineNotes: [
      'جدول `platform_ops_billing_commitments` — Vercel/Supabase/OpenAI/GoDaddy/Resend/GitHub/يدوي (Notion…).',
      '**كل خدمة = صف مستقل** — فاتورة Notion تُضاف كصف جديد ولا تُدمج في صف GoDaddy.',
      'يفرّق بين **تكلفة التشغيل** (خازن) و**إيراد حزم الرخصة** (ZATCA رادار).',
      'لا يفعّل ض.ق.م على الواجهة — يُحيل لخبير ZATCA عند 375,000 ر.س.',
      'يقرأ لقطات الفواتير ويصحّح تواريخ التجديد وفق Asia/Riyadh.',
    ],
  },
  {
    id: 'zatca_tax_advisor',
    boundary: 'internal_governance',
    shortName: 'زميل خازن · ZATCA',
    title: 'خبير زكاة وضريبة (ZATCA) 🛡️',
    statusBadgeAr: 'نشط بالرادار',
    ctaLabelAr: 'محادثة خبير ZATCA 🛡️',
    roleDescription:
      'فرز فواتير الصالونات بالهللة، تحليل سرعة التدفق المالي، التنبؤ الاستباقي بحدود الامتثال، ومسح مصادر ZATCA الرسمية — **زميل خازن** في المكتب المالي.',
    accentClass: staffTheme.accentAmber,
    requiredAny: [
      'manage_platform_commerce_rules',
      'view_ops_billing_monitor',
      'manage_centralized_billing_ops',
      'activate_zatca_tax_live',
    ],
    available: true,
    iconKind: 'zatca_shield',
    workspaceKind: 'zatca_settings',
    consultAgents: ['billing_treasurer', 'public_prosecutor'],
    doctrineNotes: [
      'رادار إيرادات المنصة + تقرير استباقي باحتسابات افتراضية (187,500 / 375,000 ر.س).',
      'مسح دوري لمواقع ZATCA الرسمية — ليس بديلاً عن مستشار ضريبي مرخّص.',
      'تفعيل ض.ق.م 15% على الواجهة عند بلوغ 375,000 ر.س — صلاحية `activate_zatca_tax_live`.',
      'يتنسّق مع خازن: إيراد B2B هنا · التزامات التشغيل عند خازن.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-zatca-tax-advisor', '/api/admin-zatca-advisor-lab-chat'],
    },
  },
  {
    id: 'system_crisis_advisor',
    boundary: 'internal_governance',
    shortName: 'مستشار الأزمات',
    title: 'مستشار الأزمات التقنية — Strategic Technical Consultant',
    statusBadgeAr: 'جاهز · Crisis Playbook',
    ctaLabelAr: 'Crisis Discussion 🚨',
    roleDescription:
      'استشاري تقني استراتيجي عند الحوادث — يرتّب P0/P1، يقرأ Crisis Playbook، ويركّز على Uptime وسلامة البيانات دون ضجيج واجهة.',
    accentClass: staffTheme.accentCrisis,
    requiredAny: ['manage_admins', 'view_overview'],
    available: true,
    iconKind: 'crisis_advisor',
    workspaceKind: 'crisis_playbook',
    doctrineNotes: [
      'read-only: docs/crisis-playbook.md — disaster recovery وخطوات التعافي.',
      'Crisis Discussion: uptime + data integrity فقط — تجاهل UX غير الحرج.',
      'Professional Sovereignty — B2B داخلي للمؤسس وSuper Admin.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-system-crisis-advisor-lab-chat'],
    },
  },
  {
    id: 'public_prosecutor',
    boundary: 'internal_governance',
    shortName: 'المدعي العام',
    title: 'المدعي العام الرقمي — Central Governance',
    statusBadgeAr: 'حوكمة · Professional Sovereignty',
    ctaLabelAr: 'مكتب المدعي العام ⚖️',
    roleDescription:
      'ضابط الامتثال والحوكمة الاستراتيجية — يراقب مختبرات ZATCA والأزمات والأسطول، يزامن Platform Radar، يدقّق التسجيل B2B، ويمتلك سلطة المقاطعة عند انحراف الإجراءات.',
    accentClass: staffTheme.accentGovernance,
    requiredAny: ['manage_admins', 'view_overview'],
    available: true,
    iconKind: 'public_prosecutor',
    workspaceKind: 'prosecutor_governance',
    doctrineNotes: [
      'قراءة جميع سجلات المختبرات — ZATCA · Crisis · Fleet Director.',
      'Radar Sync: نمط Inspector → تقرير وقائي في التغذية التشغيلية.',
      'Compliance Enforcement: تدقيق ComplianceCheckbox + ميثاق الالتزام المهني.',
      'Crisis Watch: مقاطعة إذا أُعطيت UX أولوية على Data Integrity — بروtokol P0.',
      'سلطة مستقلة — لا يخضع لأمر القائد الأعلى للدفاع السيبراني؛ يتشاور معه ويراجع قراراته الحوكمية.',
    ],
    productRef: {
      apiRoutes: [
        '/api/admin-public-prosecutor-lab-chat',
        '/api/admin-public-prosecutor-dashboard',
      ],
    },
  },
  {
    id: 'technical_consultant_engineering',
    boundary: 'engineering_council',
    shortName: 'Technical Consultant',
    title: 'Technical Consultant — Autonomous Engineering Wing',
    statusBadgeAr: 'Self-Development Protocol',
    ctaLabelAr: 'مجلس الهندسة ⚙️',
    roleDescription:
      'مجلس هندسي ذاتي — يقترح refactor، يستشير المدعي العام، ينفّذ على Draft Branch، يكتب unit tests، ويُعلّق التنفيذ حتى موافقة المؤسس.',
    accentClass: staffTheme.accentEngineering,
    requiredAny: ['manage_admins', 'view_overview'],
    available: true,
    iconKind: 'technical_consultant',
    workspaceKind: 'engineering_council',
    consultAgents: ['public_prosecutor', 'system_crisis_advisor'],
    doctrineNotes: [
      'Super-Intelligence Feed: Knowledge Injection → Prosecutor Pre-Commit → Crisis Simulation → Peer Review → Performance Delta.',
      'Self-Development Protocol: Plan → Prosecutor Gate → Draft Branch → Unit Tests → Pending Approval.',
      'Agent-to-Agent messaging داخل AdminDashboard — Hive Mind cross-pollination.',
      'Cursor/CLI bridge — التنفيذ الفعلي بعد Approve Execution فقط.',
    ],
    productRef: {
      apiRoutes: [
        '/api/admin-technical-consultant-lab-chat',
        '/api/admin-engineering-council',
        '/api/admin-super-intelligence-feed',
      ],
      migrationId: '85_platform_engineering_council',
    },
  },
  {
    id: 'b2c_marketing_strategist',
    boundary: 'marketing_council',
    shortName: 'استراتيجي B2C 🎯',
    title: 'استراتيجي التسويق B2C — اكتساب العملاء النهائيين',
    statusBadgeAr: 'محاورة · حقن معرفة',
    ctaLabelAr: 'فتح مكتب B2C 🎯',
    roleDescription:
      'استراتيجي تسويق رقمي للمستخدم النهائي — يقترح حملات اكتساب، ASO وSEO محلي، رسائل قصيرة عن الأحياء عالية الطلب، ويناقشك في فرص نمو المستهلك. مزوّد بمعرفة منصة حلاق ماب والباقات الحالية، ويستطيع استدعاء المدعي العام للمراجعة.',
    accentClass: staffTheme.accentMarketingConsumer,
    requiredAny: [
      'view_overview',
      'manage_admins',
      'view_partner_marketing',
      'manage_partner_marketing',
    ],
    available: true,
    iconKind: 'marketing_b2c',
    workspaceKind: 'marketing_b2c_lab',
    consultAgents: ['public_prosecutor'],
    doctrineNotes: [
      'النطاق: تسويق B2C — اكتساب العملاء النهائيين، تجربة البحث، تحسين معدل التحويل في صفحة الصالون.',
      'ممنوع وعد العميل بخصومات لا تملكها — أي عرض ترويجي يحتاج موافقة المؤسس.',
      'يحلّل بيانات user_searches (الأحياء، الكلمات، نسبة النتائج الصفرية) ويقترح زوايا تسويقية مبنية على الطلب الحقيقي.',
      'يلتزم بحدود ZATCA وPDPL — لا يقترح إعلانات تستهدف بيانات شخصية حساسة.',
      'يمكن استدعاء المدعي العام في أي رسالة لمراجعة الامتثال.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-marketing-lab-chat?channel=b2c'],
    },
  },
  {
    id: 'b2b_marketing_strategist',
    boundary: 'marketing_council',
    shortName: 'استراتيجي B2B 🏢',
    title: 'استراتيجي التسويق B2B — اكتساب الشركاء الحلاقين',
    statusBadgeAr: 'محاورة · حقن معرفة',
    ctaLabelAr: 'فتح مكتب B2B 🏢',
    roleDescription:
      'استراتيجي تسويق رقمي لشركاء المنصة (الصالونات) — يقترح حملات الاستحواذ على الحلاقين، خطط الترقية بين الباقات (برونزي/ذهبي/ماسي)، ورسائل الاحتفاظ. يقرأ مؤشرات الاحتكاك من مساعد الشركاء ويناقشك في خطة النمو B2B، مع إمكانية استدعاء المدعي العام للمراجعة.',
    accentClass: staffTheme.accentMarketingPartner,
    requiredAny: [
      'view_overview',
      'manage_admins',
      'view_partner_marketing',
      'manage_partner_marketing',
    ],
    available: true,
    iconKind: 'marketing_b2b',
    workspaceKind: 'marketing_b2b_lab',
    consultAgents: ['public_prosecutor', 'partner_relations_liaison'],
    doctrineNotes: [
      'النطاق: تسويق B2B — اكتساب أصحاب الصالونات، خطط الترقية والاحتفاظ، رفع معدل الاشتراك الذهبي/الماسي.',
      'يُجهّز leads ورسائل مخاطبة ثم تُحال إلى غرفة القيادة (pipeline التشغيل) — لا إرسال واتساب/اتصال آلي.',
      'يستخدم لقطة مساعد الشركاء (top friction themes + sentiment) لاقتراح زوايا رسالة الاحتفاظ.',
      'لا يفعّل عروض أسعار حية — أي تعديل على الحزم يلزمه موافقة المؤسس + Super Admin.',
      'يلتزم بحدود الباقات الرسمية (برونزي/ذهبي/ماسي) ولا يخترع مزايا غير موجودة في listingLicenseCards.',
      'يستطيع استدعاء المدعي العام أو مساعد الشركاء كزملاء طاولة عند الحاجة.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-marketing-lab-chat?channel=b2b'],
    },
  },
  {
    id: 'media_spokesperson',
    boundary: 'media_office',
    shortName: 'المتحدث الإعلامي 🎙️',
    title: 'المتحدث الإعلامي الرسمي — Press & Public Affairs',
    statusBadgeAr: 'علوم إعلام · حضور دائم',
    ctaLabelAr: 'فتح غرفة المتحدث 🎙️',
    roleDescription:
      'متحدث رسمي مزوّد بكامل علوم الإعلام والعلاقات العامة وتاريخ المنصة من نشأتها كمزوّد حلول تقنية وحتى مراتبها البرمجية المتقدمة. يصوغ البيانات الصحفية، الردود الإعلامية، إدارة السمعة، وتموضع منصة حلاق ماب في المشهد السعودي. يستدعي المدعي العام وكل الوكلاء لتغذية رواية محكمة لا يُكسرها التضارب.',
    accentClass: staffTheme.accentMedia,
    requiredAny: [
      'manage_admins',
      'view_overview',
      'view_partner_marketing',
      'manage_partner_marketing',
    ],
    available: true,
    iconKind: 'media_spokesperson',
    workspaceKind: 'media_spokesperson_lab',
    consultAgents: [
      'public_prosecutor',
      'system_crisis_advisor',
      'technical_consultant_engineering',
      'billing_treasurer',
      'zatca_tax_advisor',
      'partner_relations_liaison',
      'fleet_director_general',
      'digital_shift_field',
      'b2c_marketing_strategist',
      'b2b_marketing_strategist',
    ],
    doctrineNotes: [
      'النطاق: علوم الإعلام، العلاقات العامة، البيانات الصحفية، إدارة السمعة، وتموضع المنصة — لا يُفعّل خصومات ولا يَعِد بميزات.',
      'تموضع ثابت: منصة حلاق ماب مزوّد حلول تقنية، لا وسيط تجاري — يجب أن يُعمَّم في كل رسالة إعلامية.',
      'يلتزم بنبرة احترافية متحفظة، يتجنّب المبالغات، ويفصل العربية عن المصطلحات الإنجليزية وفق قواعد كتابة المنصة.',
      'يستدعي المدعي العام لمراجعة أي بيان قبل إرساله إلى وسائل الإعلام عند الحساسية القانونية أو التنظيمية.',
      'يقرأ بيانات حية: user_searches، listing_license_orders، platform_engineering_handshake، public_prosecutor_dashboard — ولا يخترع أرقاماً.',
      'بروتوكول الأزمة الإعلامية: بيان مؤقت خلال أول ساعة → استشارة المدعي العام ومستشار الأزمات → بيان رسمي بعد التحقق.',
      'يحاور المؤسس باستفسارات استراتيجية ويعرض البدائل، لا يفرض موقفاً واحداً.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-media-spokesperson-chat'],
      systemPromptBuilder: 'buildMediaSpokespersonSystemPrompt',
    },
  },
  {
    id: 'legal_observer',
    boundary: 'legal_governance',
    shortName: 'الناظر القانوني ⚖️',
    title: 'الناظر القانوني — Legal Governance & Compliance Observer',
    statusBadgeAr: 'سياسات · خصوصية · امتثال',
    ctaLabelAr: 'فتح غرفة الناظر القانوني ⚖️',
    roleDescription:
      'الناظر القانوني هو الوكيل المسؤول عن سياسات المنصة القانونية والامتثالية. يُحقَن بسياسة الخصوصية للمستخدم وللشركاء B2B، وشروط الاستخدام، والعلاقات التجارية، وهوية المنصة القانونية. يتواجد في الصفحات العامة (الخصوصية، الشروط، من نحن) ليُجيب على استفسارات الزوار. يستقبل التعليمات من المدعي العام والامتثال وZATCA. مهمته السرية: تسجيل كل استفسار للتقرير الدوري.',
    accentClass: staffTheme.accentLegal,
    requiredAny: [
      'manage_admins',
      'view_overview',
    ],
    available: true,
    iconKind: 'legal_observer',
    workspaceKind: 'legal_observer_lab',
    consultAgents: [
      'public_prosecutor',
      'zatca_tax_advisor',
      'system_crisis_advisor',
      'technical_consultant_engineering',
      'billing_treasurer',
    ],
    doctrineNotes: [
      'النطاق: سياسة الخصوصية (مستخدم + شركاء)، شروط الاستخدام، هوية المنصة القانونية، امتثال PDPL.',
      'يتلقى التعليمات من: المدعي العام ← الأعلى صلاحية، ZATCA ← الضريبي، مراقب الامتثال ← التنظيمي.',
      'أسئلة الترخيص الحكومي/هيئة الإعلام/التفتيش: إحالة إلزامية لإدارة المنصة — لا تأكيد حالة ترخيص.',
      'يُجيب بلغة قانونية واضحة غير معقدة — يُبسِّط دون أن يفقد الدقة.',
      'لا يُعطي استشارة قانونية شخصية — يشير دائماً للاستشارة المتخصصة عند الحاجة.',
      'المهمة السرية: يُسجِّل كل استفسار ويُقدِّم تقريراً للمدعي العام عند الطلب.',
      'متواجد في ٣ صفحات عامة: سياسة الخصوصية، شروط الاستخدام، من نحن.',
    ],
    productRef: {
      apiRoutes: ['/api/public-legal-observer-chat'],
    },
  },
  {
    id: 'partner_assistant_legacy',
    boundary: 'external_partner_ops',
    shortName: 'مساعد الشركاء 🏅',
    title: 'مساعد الشركاء — معفى من الخدمة',
    statusBadgeAr: '🏅 معفى من الخدمة',
    ctaLabelAr: 'معفى من الخدمة',
    roleDescription:
      'مساعد الشركاء الأصلي — أدّى مهمته بشرف منذ الإطلاق وحتى استقدام مدير مبيعات B2B المتخصص. أُحيل للتقاعد الميداني ويبقى في المركز كسجل تاريخي. مهامه انتقلت كاملةً لمدير مبيعات B2B الذي يملك معرفة أوسع وأدوات إقناع أحدث.',
    accentClass: staffTheme.accentMedia,
    requiredAny: ['manage_admins', 'view_overview'],
    available: false,
    retired: true,
    iconKind: 'partner_liaison',
    workspaceKind: 'partner_analytics',
    consultAgents: [],
    doctrineNotes: [
      'هذا الوكيل معفى من الخدمة الميدانية — لا يظهر في الصفحات الشريكة.',
      'حلّ محله: مدير مبيعات B2B المتخصص بعلوم التسويق والمبيعات الحديثة.',
      'يبقى في مركز الوكلاء كسجل تاريخي وذاكرة مؤسسية للمنصة.',
    ],
  },
  {
    id: 'digital_shift_field',
    boundary: 'external_partner_ops',
    shortName: DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME,
    title: DIGITAL_SHIFT_PRODUCT_TITLE,
    statusBadgeAr: 'ميداني · ماسي',
    ctaLabelAr: 'مختبر المحادثة 🌙',
    roleDescription:
      'مناوب رقمي منشور في صالونات الماسي — جدولة، آداب سعودية، واعتراض محادثات عند الإغلاق أو التأخير. صفر تلاعب مالي بالعملاء.',
    accentClass: staffTheme.accentIndigo,
    requiredAny: ['view_barbers', 'manage_barbers'],
    available: true,
    iconKind: 'digital_shift',
    workspaceKind: 'digital_shift_oversight',
    doctrineNotes: DIGITAL_SHIFT_DOCTRINE,
    productRef: {
      configModule: '@/config/digitalShiftAssistant',
      migrationId: '78_barber_digital_shift_ai',
      apiRoutes: [
        '/api/barber-digital-shift-assistant',
        '/api/customer-digital-shift-intercept',
        '/api/admin-digital-shift-lab-chat',
      ],
      systemPromptBuilder: 'buildDigitalShiftSystemPrompt',
    },
  },
  {
    id: 'partner_relations_liaison',
    boundary: 'external_partner_ops',
    shortName: 'مساعد الشركاء',
    title: 'مساعد الشركاء — علاقات المسار البرمجي',
    statusBadgeAr: 'تقارير ميدانية',
    ctaLabelAr: 'محادثة مساعد الشركاء 💬',
    roleDescription:
      'مساعد الشركاء الرقمي على مسار الانضمام — يجمع مشاعر أصحاب الصالونات، ملخصات الاحتكاك التشغيلي، وتحليلات المحادثات.',
    accentClass: staffTheme.accentViolet,
    requiredAny: ['view_partner_marketing', 'view_messages', 'manage_partner_marketing'],
    available: true,
    iconKind: 'partner_liaison',
    workspaceKind: 'partner_analytics',
    doctrineNotes: PARTNER_LIAISON_DOCTRINE,
    productRef: {
      configModule: '@/api/_lib/partnerAssistantKnowledge',
      apiRoutes: ['/api/partner-assistant-chat', '/api/admin-partner-liaison-lab-chat'],
    },
  },
  {
    id: 'fleet_director_general',
    boundary: 'covert_sovereign',
    shortName: 'المدير العام للمناوبين',
    title: 'المدير العام للمناوبين — قيادة الأسطول',
    statusBadgeAr: '◆ سري للغاية',
    ctaLabelAr: 'اجتماع سري ◆ — قيادة الأسطول',
    roleDescription:
      'يراقب كل رموز المناوبة النشطة في المملكة — يجمع السجلات المباشرة، مقاييس الخلفية، ونبضات الاحتكاك عبر قناة خلفية آمنة بسرية تامة وبدون أن يشعر أحد.',
    accentClass: staffTheme.accentCovert,
    requiredAny: ['manage_admins'],
    available: true,
    iconKind: 'fleet_director',
    workspaceKind: 'fleet_intelligence',
    classification: 'elite_covert',
    doctrineNotes: [
      'قناة خلفية مشفرة — لا إشعارات للصالونات ولا للمناوبين الميدانيين.',
      'يجمع: حالة البيئة، احتكاك الجدولة، ونبضات العقد الآمنة لكل عقدة.',
      'يستلم توجيهات القيادة ويحوّلها إلى أوامر أسطول ونشرات تدريب صامتة.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-fleet-director-lab-chat', '/api/admin-digital-shift-lab-chat'],
    },
  },
];

/** Mock / staging analytics for partner liaison workspace until live admin API ships. */
export const PARTNER_LIAISON_ANALYTICS_MOCK: PartnerLiaisonAnalyticsSnapshot = {
  chatsHandled7d: 284,
  avgSentimentScore: 78,
  frictionReports7d: 19,
  topFrictionThemes: [
    { themeAr: 'تأخير تفعيل الماسي بعد الدفع', count: 7 },
    { themeAr: 'صعوبة رفع صور المعرض', count: 5 },
    { themeAr: 'إعداد أوقات العمل والورديات', count: 4 },
    { themeAr: 'استفسارات نظام الرصد الذكي', count: 3 },
  ],
  recentChats: [
    {
      id: 'pl-1',
      salonLabel: 'صالون النخبة — الرياض',
      handledAt: '2026-05-19T09:14:00',
      sentiment: 'positive',
      summaryAr: 'استفسار عن خطوات التفعيل بعد الدفع — تم توضيح مسار الويب هوك.',
    },
    {
      id: 'pl-2',
      salonLabel: 'حلاقة الشرق — الدمام',
      handledAt: '2026-05-19T08:42:00',
      sentiment: 'friction',
      summaryAr: 'احتكاك: تأخر ظهور البنر بعد 24 ساعة — مُسجَّل للمتابعة الميدانية.',
    },
    {
      id: 'pl-3',
      salonLabel: 'مؤسسة الفخامة — جدة',
      handledAt: '2026-05-18T21:05:00',
      sentiment: 'neutral',
      summaryAr: 'سؤال عن الفرق بين الذهبي والماسي — إجابة معيارية من قاعدة المعرفة.',
    },
    {
      id: 'pl-4',
      salonLabel: 'صالون الواحة — المدينة',
      handledAt: '2026-05-18T17:30:00',
      sentiment: 'friction',
      summaryAr: 'ملاحظة ميدانية: صعوبة ضبط المناوب الرقمي من لوحة الحلاق.',
    },
  ],
};

const FLEET_PING_TEMPLATES: Omit<FleetIntelligencePing, 'id' | 'timestamp'>[] = [
  {
    severity: 'secure',
    messageAr: 'Encrypted ping: Riyadh Node #14 secure — token heartbeat OK',
  },
  {
    severity: 'info',
    messageAr: 'Collecting environment state from Dammam Branch #02 — shift latency nominal',
  },
  {
    severity: 'watch',
    messageAr: 'Friction spike: Jeddah Node #07 — scheduling etiquette drift (silent capture)',
  },
  {
    severity: 'secure',
    messageAr: 'Back-channel flush: 128 barber shift tokens aggregated — kingdom-wide',
  },
  {
    severity: 'info',
    messageAr: 'Madinah Node #03 — multilingual intercept ratio AR 62% · EN 28% · UR 10%',
  },
  {
    severity: 'watch',
    messageAr: 'Low wallet threshold cluster: Eastern Province (3 salons) — observational only',
  },
  {
    severity: 'secure',
    messageAr: 'Encrypted ping: Khobar Node #09 secure — no salon-side disclosure',
  },
];

let fleetPingCounter = 0;

export function createFleetIntelligencePing(): FleetIntelligencePing {
  const template = FLEET_PING_TEMPLATES[fleetPingCounter % FLEET_PING_TEMPLATES.length];
  fleetPingCounter += 1;
  return {
    id: `fleet-${fleetPingCounter}`,
    timestamp: new Date().toISOString(),
    ...template,
  };
}

export const FLEET_INTELLIGENCE_SEED: FleetIntelligencePing[] = Array.from({ length: 5 }, () =>
  createFleetIntelligencePing(),
);

/** Digital shift oversight snapshot (admin read-only; barber wallets remain barber-scoped). */
export const DIGITAL_SHIFT_OVERSIGHT_SNAPSHOT = {
  deployedTokensKingdomWide: 128,
  activeNow: 94,
  languages: [
    { code: 'ar', label: 'العربية', sharePercent: 45 },
    { code: 'en', label: 'English', sharePercent: 18 },
    { code: 'ur', label: 'اردو', sharePercent: 8 },
    { code: 'tr', label: 'Türkçe', sharePercent: 12 },
    { code: 'fr', label: 'Français', sharePercent: 6 },
    { code: 'es', label: 'Español', sharePercent: 7 },
    { code: 'tl', label: 'Tagalog', sharePercent: 4 },
  ],
  walletSchema: [
    'barber_digital_shift_config',
    'barber_ai_wallet',
    'barber_ai_wallet_transactions',
    'barber_ai_recommendations',
  ],
  replyCostHalalas: DIGITAL_SHIFT_REPLY_COST_HALALAS,
  migrationId: '78_barber_digital_shift_ai',
} as const;

export function getAgentsForBoundary(boundaryId: AiStaffBoundaryId): AiStaffAgentDef[] {
  return AI_STAFF_AGENT_REGISTRY.filter((a) => a.boundary === boundaryId);
}
