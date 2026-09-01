/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أدلة تشغيل وتسويق منتجات المتجر. لا يُستورد من App.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export const STORE_PRODUCT_SUPPORT_TAB_IDS = ['activate', 'identity', 'orders', 'qr', 'neighborhood'] as const;
export type StoreProductSupportTabId = (typeof STORE_PRODUCT_SUPPORT_TAB_IDS)[number];

export type StoreProductSupportSection = {
  headingAr: string;
  bodyAr: string[];
  itemsAr?: string[];
};

export type StoreProductSupportTab = {
  id: StoreProductSupportTabId;
  titleAr: string;
  sections: StoreProductSupportSection[];
};

export type StoreProductSupportGuide = {
  id: 'kitchen' | 'grocers' | 'produce' | 'restaurant' | 'cafe' | 'lounge' | 'halls';
  productAr: string;
  accent: string;
  documentTitle: string;
  kickerAr: string;
  titleAr: string;
  leadAr: string;
  landingPath: string;
  landingCtaAr: string;
  deskLeadAr: string;
  deskCtaAr: string;
  tabs: StoreProductSupportTab[];
};

export const STORE_PRODUCT_SUPPORT_SHELL = {
  backAr: 'رجوع لصفحة المنتج',
  tabsLabelAr: 'أقسام الدليل',
} as const;

function tabs(rows: StoreProductSupportTab[]): StoreProductSupportTab[] {
  return rows;
}

export const STORE_KITCHEN_SUPPORT: StoreProductSupportGuide = {
  id: 'kitchen',
  productAr: 'طبختنا1',
  accent: '#b45a3c',
  documentTitle: 'halaqmap — دليل تشغيل وتسويق طبختنا1',
  kickerAr: 'من الشراء إلى أول انتشار في الحي',
  titleAr: 'دليل تشغيل وتسويق طبختنا1',
  leadAr:
    'يُرشدك هذا الدليل من رسالة التفعيل حتى إدارة الطلب من الجوال، ثم ملصق الرمز وانتشار المطبخ في دائرة الحي. الطلب يصل للوحة النشاط، والدفع من الزبون نقداً أو شبكة عند التسليم.',
  landingPath: ROUTE_PATHS.STORE_KITCHEN,
  landingCtaAr: 'دليل التشغيل والتسويق',
  deskLeadAr: 'تعليمات تشغيل وتسويق طبختنا1 من التفعيل حتى أول انتشار في الحي.',
  deskCtaAr: 'افتح دليل التشغيل والتسويق',
  tabs: tabs([
    {
      id: 'activate',
      titleAr: 'بعد الشراء',
      sections: [
        {
          headingAr: 'رسالة التفعيل',
          bodyAr: [
            'بعد سداد الاشتراك تصلك رسالة من الإدارة على البريد فيها رابط صفحة الزبون ورابط لوحة النشاط.',
            'صفحة الزبون على مسار `/k/` ثم الرمز. لوحة النشاط على المسار نفسه ثم `/desk`.',
          ],
        },
        {
          headingAr: 'أول إجراء',
          bodyAr: [
            'افتح لوحة النشاط واحفظها في المفضلة أو على الشاشة الرئيسية للجوال لتصل إليها في ساعة الذروة بلا بحث.',
          ],
        },
      ],
    },
    {
      id: 'identity',
      titleAr: 'الهوية والقائمة',
      sections: [
        {
          headingAr: 'اسم النشاط وشعاره',
          bodyAr: [
            'اكتب اسم المطبخ كما يظهر للزبون، وعبارة قصيرة تصف التخصص.',
            'ارفع شعاراً مربعاً واضحاً من اللوحة ليظهر دائرة صغيرة بجوار الاسم في صفحة الزبون.',
          ],
        },
        {
          headingAr: 'ساعات العمل والاستقبال',
          bodyAr: [
            'حدد ساعات الاستقبال من اللوحة. عند اكتمال الطاقة اضغط إيقاف استقبال الطلبات حتى لا يصل طلب بعد الإغلاق.',
          ],
        },
        {
          headingAr: 'الأصناف',
          bodyAr: [
            'سمّ الصنف بوضوح: كبسة لحم لشخصين خير من كلمة عامة.',
            'ضع السعر النهائي شاملاً التغليف. إن نفد الصنف اضغط نفد ليختفي زر الطلب فوراً.',
            'صوّر بجانب نافذة نهارية، بزاوية مائدة أو من الأعلى، وعلى خلفية بسيطة.',
          ],
        },
      ],
    },
    {
      id: 'orders',
      titleAr: 'الطلب الحي',
      sections: [
        {
          headingAr: 'التنبيه والتذكرة',
          bodyAr: [
            'فعّل تنبيه الطلبات أعلى اللوحة. عند ورود طلب يظهر الصوت والوميض وتفاصيل الاسم والجوال والكميات والملاحظات.',
          ],
        },
        {
          headingAr: 'الموقع',
          bodyAr: [
            'إن اختار الزبون التوصيل يحدد موقعه بزر حدد موقعي ثم يتأكد بزر تأكد من موقعي على الخريطة.',
            'لا تطلب موقعاً برسائل صوتية. افتح رابط الخريطة من التذكرة عند التسليم.',
          ],
        },
        {
          headingAr: 'حالات التذكرة',
          bodyAr: [
            'اضغط تم الاستلام ثم أرشفة وإنهاء. عند الاستلام من الباب استخدم طلبك جاهز لإرسال موقع النشاط من جهازك عبر واتساب.',
            'لا يُحصَّل طلب الزبون عبر بوابة الدفع من هذه اللوحة.',
          ],
        },
      ],
    },
    {
      id: 'qr',
      titleAr: 'الملصق والبايو',
      sections: [
        {
          headingAr: 'ملصق الرمز',
          bodyAr: [
            'اطبع ملصق الصفحة من اللوحة وضعه على أكياس التغليف وعلب الوجبات.',
            'اكتب تحت الرمز: أعجبك الأكل؟ امسح للطلب المباشر في المرة القادمة.',
          ],
        },
        {
          headingAr: 'الرابط في الحسابات',
          bodyAr: [
            'ضع رابط صفحة الزبون في بايو سناب وتيك توك وإنستغرام، وانشر حالة واتساب في الضحى والظهر والمساء بصورة طبخة اليوم والرابط.',
          ],
        },
      ],
    },
    {
      id: 'neighborhood',
      titleAr: 'احتل حيك',
      sections: [
        {
          headingAr: 'دائرة الجيران',
          bodyAr: [
            'ابدأ بالجيران والمعارف في نطاق قريب. وزّع كروت الرمز واجمع زبائن أسبوعيّين قبل التوسع.',
          ],
        },
        {
          headingAr: 'التجمعات القريبة',
          bodyAr: [
            'بعد ثبات السرعة والطازجية، قدّم كروتاً للمدارس والمكاتب القريبة لوجبات الغداء.',
            'العروض تُكتب في اسم الصنف أو شريط طبق اليوم، وليست زراً برمجياً منفصلاً.',
          ],
        },
      ],
    },
  ]),
};

export const STORE_GROCERS_SUPPORT: StoreProductSupportGuide = {
  id: 'grocers',
  productAr: 'تمويناتا1',
  accent: '#8fbf7a',
  documentTitle: 'halaqmap — دليل تشغيل وتسويق تمويناتا1',
  kickerAr: 'من التفعيل حتى طلب جار الحي',
  titleAr: 'دليل تشغيل وتسويق تمويناتا1',
  leadAr:
    'صفحة تموينات للحي ولوحة كاشير. جار الحي يطلب من الجوال، والمذكرة تُفتح من جهازك عبر واتساب. لا تحصيل لسلّته عبر بوابة الدفع.',
  landingPath: ROUTE_PATHS.STORE_GROCERS,
  landingCtaAr: 'دليل التشغيل والتسويق',
  deskLeadAr: 'تعليمات تشغيل وتسويق تمويناتا1 من التفعيل حتى ملصق الباب.',
  deskCtaAr: 'افتح دليل التشغيل والتسويق',
  tabs: tabs([
    {
      id: 'activate',
      titleAr: 'بعد الشراء',
      sections: [
        {
          headingAr: 'الروابط',
          bodyAr: [
            'بعد السداد تصلك رسالة فيها رابط صفحة جار الحي `/g/` ثم الرمز، ورابط لوحة الكاشير ثم `/desk`.',
            'احفظ اللوحة في المفضلة أو على الشاشة الرئيسية.',
          ],
        },
      ],
    },
    {
      id: 'identity',
      titleAr: 'الهوية والرف',
      sections: [
        {
          headingAr: 'الاسم والشعار',
          bodyAr: [
            'اكتب اسم التموينات وارفع شعاراً يظهر دائرة صغيرة بجوار الاسم في صفحة جار الحي.',
            'حدد ساعات العمل وموقع المحل أو العربة من اللوحة ثم أبرزه إن رغبت.',
          ],
        },
        {
          headingAr: 'السلع',
          bodyAr: [
            'فعّل السلع من البنك الجاهز أو راجع قائمة مكتوبة. حدّث التوفر بضغطة حتى لا يُطلب صنف نافد.',
          ],
        },
      ],
    },
    {
      id: 'orders',
      titleAr: 'الطلب الحي',
      sections: [
        {
          headingAr: 'الكاشير',
          bodyAr: [
            'فعّل تنبيه الطلبات. تظهر السلة والجوال وموقع التسليم بعد حدد موقعي وتأكد من موقعي.',
            'اضغط تم الاستلام ثم أرشفة وإنهاء، وافتح مذكرة واتساب من جهازك لعامل التوصيل.',
            'صندوق المحادثة إضافة مدفوعة إن كانت مفعّلة، بين جار الحي والكاشير فقط.',
          ],
        },
      ],
    },
    {
      id: 'qr',
      titleAr: 'الملصق والبايو',
      sections: [
        {
          headingAr: 'على الباب',
          bodyAr: [
            'اطبع ملصق الصفحة وضعه على الباب والأكياس. اكتب: امسح واطلب مقاضيك للبيت.',
            'ضع الرابط في بايو الحسابات وانشر حالة واتساب بعروض الرف اليوم.',
          ],
        },
      ],
    },
    {
      id: 'neighborhood',
      titleAr: 'احتل حيك',
      sections: [
        {
          headingAr: 'دائرة الحي',
          bodyAr: [
            'ابدأ بسكان العمائر المجاورة ثم توسّع للشوارع التالية. لا تخلط صفحة التموينات بمنتجات أخرى في المتجر.',
          ],
        },
      ],
    },
  ]),
};

export const STORE_PRODUCE_SUPPORT: StoreProductSupportGuide = {
  id: 'produce',
  productAr: 'خضارنا1',
  accent: '#3d8b4a',
  documentTitle: 'halaqmap — دليل تشغيل وتسويق خضارنا1',
  kickerAr: 'من الصندوق حتى جار الحي',
  titleAr: 'دليل تشغيل وتسويق خضارنا1',
  leadAr:
    'صفحة صندوق خضار وفواكه ولوحة صندوق. جار الحي يطلب بالحبة أو الكيلو، وصندوق الملاحظة مدرج. لا تحصيل لسلّته عبر بوابة الدفع.',
  landingPath: ROUTE_PATHS.STORE_PRODUCE,
  landingCtaAr: 'دليل التشغيل والتسويق',
  deskLeadAr: 'تعليمات تشغيل وتسويق خضارنا1 من التفعيل حتى شريط وصل اليوم.',
  deskCtaAr: 'افتح دليل التشغيل والتسويق',
  tabs: tabs([
    {
      id: 'activate',
      titleAr: 'بعد الشراء',
      sections: [
        {
          headingAr: 'الروابط',
          bodyAr: [
            'بعد السداد تصلك رسالة فيها رابط الصفحة `/v/` ثم الرمز، ورابط لوحة الصندوق ثم `/desk`.',
            'احفظ اللوحة في المفضلة.',
          ],
        },
      ],
    },
    {
      id: 'identity',
      titleAr: 'الهوية والرف',
      sections: [
        {
          headingAr: 'الاسم والشعار',
          bodyAr: [
            'اكتب اسم الصندوق وارفع شعاراً يظهر بجوار الاسم في صفحة جار الحي.',
            'حدّث شريط وصل اليوم كل صباح، وحدد ساعات الصندوق أو العربة.',
          ],
        },
        {
          headingAr: 'الأصناف',
          bodyAr: [
            'فعّل الخضار والفواكه من البنك بالحبة أو الكيلو أو الحزمة أو الصندوق. أخفِ ما نفد فوراً.',
          ],
        },
      ],
    },
    {
      id: 'orders',
      titleAr: 'الطلب الحي',
      sections: [
        {
          headingAr: 'لوحة الصندوق',
          bodyAr: [
            'فعّل التنبيه. يظهر الطلب مع موقع التسليم بعد حدد موقعي وتأكد من موقعي إن اختار التوصيل.',
            'صندوق الملاحظة مدرج بين جار الحي والصندوق فقط. أرسل المذكرة من جهازك عبر واتساب.',
          ],
        },
      ],
    },
    {
      id: 'qr',
      titleAr: 'الملصق والبايو',
      sections: [
        {
          headingAr: 'عند الصندوق',
          bodyAr: [
            'اطبع الملصق على الصندوق والأكياس. اكتب: امسح واطلب صندوق اليوم.',
            'ضع الرابط في بايو الحسابات وانشر ما وصل هذا الصباح على حالة واتساب.',
          ],
        },
      ],
    },
    {
      id: 'neighborhood',
      titleAr: 'احتل حيك',
      sections: [
        {
          headingAr: 'دائرة الحي',
          bodyAr: [
            'ابدأ بجيران الشارع ثم العمائر التالية. لا تذكر منتجات أخرى في نصوص جار الحي.',
          ],
        },
      ],
    },
  ]),
};

export const STORE_RESTAURANT_SUPPORT: StoreProductSupportGuide = {
  id: 'restaurant',
  productAr: 'مطعمنا1',
  accent: '#e08a3c',
  documentTitle: 'halaqmap — دليل تشغيل وتسويق مطعمنا1',
  kickerAr: 'من المطبخ حتى ضيف الحي',
  titleAr: 'دليل تشغيل وتسويق مطعمنا1',
  leadAr:
    'صفحة مطعم الحي ولوحة مطبخ وصندوق محادثة مدرج. ضيف الحي يطلب توصيلاً أو استلاماً، والدفع نقداً أو شبكة عند التسليم.',
  landingPath: ROUTE_PATHS.STORE_RESTAURANT,
  landingCtaAr: 'دليل التشغيل والتسويق',
  deskLeadAr: 'تعليمات تشغيل وتسويق مطعمنا1 من التفعيل حتى طبق اليوم.',
  deskCtaAr: 'افتح دليل التشغيل والتسويق',
  tabs: tabs([
    {
      id: 'activate',
      titleAr: 'بعد الشراء',
      sections: [
        {
          headingAr: 'الروابط',
          bodyAr: [
            'بعد السداد تصلك رسالة فيها رابط الصفحة `/r/` ثم الرمز، ورابط لوحة المطبخ ثم `/desk`.',
            'احفظ اللوحة في المفضلة.',
          ],
        },
      ],
    },
    {
      id: 'identity',
      titleAr: 'الهوية والقائمة',
      sections: [
        {
          headingAr: 'الاسم والشعار',
          bodyAr: [
            'اكتب اسم المطعم وارفع شعاراً يظهر بجوار الاسم في صفحة ضيف الحي.',
            'حدّث طبق اليوم وساعات العمل، وأبرز موقع الباب إن رغبت.',
          ],
        },
        {
          headingAr: 'الأطباق',
          bodyAr: [
            'فعّل الأطباق من البنك أو ارفع صوراً. أخفِ ما نفد. صوّر الإضاءة النهارية بزاوية المائدة.',
          ],
        },
      ],
    },
    {
      id: 'orders',
      titleAr: 'الطلب الحي',
      sections: [
        {
          headingAr: 'المطبخ',
          bodyAr: [
            'فعّل التنبيه. عند التوصيل يحدد الضيف موقعه بزر حدد موقعي ثم تأكد من موقعي.',
            'صندوق المحادثة مدرج بين ضيف الحي والمطبخ فقط. أرسل المذكرة من جهازك عبر واتساب.',
          ],
        },
      ],
    },
    {
      id: 'qr',
      titleAr: 'الملصق والبايو',
      sections: [
        {
          headingAr: 'على الطاولة',
          bodyAr: [
            'اطبع الملصق للباب والطاولات. اكتب: امسح واطلب من الجوال.',
            'ضع الرابط في بايو الحسابات وانشر طبق اليوم على حالة واتساب.',
          ],
        },
      ],
    },
    {
      id: 'neighborhood',
      titleAr: 'احتل حيك',
      sections: [
        {
          headingAr: 'دائرة الحي',
          bodyAr: [
            'ابدأ بجيران المطعم ثم المكاتب القريبة. لا تخلط صفحة المطعم بمنتجات أخرى في نصوص الضيف.',
          ],
        },
      ],
    },
  ]),
};

export const STORE_CAFE_SUPPORT: StoreProductSupportGuide = {
  id: 'cafe',
  productAr: 'كافينا1',
  accent: '#c48a4a',
  documentTitle: 'halaqmap — دليل تشغيل وتسويق كافينا1',
  kickerAr: 'من الكاشير حتى شاشات المقهى',
  titleAr: 'دليل تشغيل وتسويق كافينا1',
  leadAr:
    'صفحة مقهى الحي ولوحة كاشير وثلاث شاشات ورابط ضيف مشترك للشاشة الرئيسية. صندوق المحادثة مدرج. لا تحصيل لسلّة جار الحي عبر بوابة الدفع.',
  landingPath: ROUTE_PATHS.STORE_CAFE,
  landingCtaAr: 'دليل التشغيل والتسويق',
  deskLeadAr: 'تعليمات تشغيل وتسويق كافينا1 من التفعيل حتى الشاشات.',
  deskCtaAr: 'افتح دليل التشغيل والتسويق',
  tabs: tabs([
    {
      id: 'activate',
      titleAr: 'بعد الشراء',
      sections: [
        {
          headingAr: 'الروابط',
          bodyAr: [
            'بعد السداد تصلك رسالة فيها رابط صفحة الحي `/c/` ثم الرمز، ولوحة الكاشير `/desk`، والشاشات على رمز العرض.',
            'احفظ لوحة الكاشير في المفضلة.',
          ],
        },
      ],
    },
    {
      id: 'identity',
      titleAr: 'الهوية والقائمة',
      sections: [
        {
          headingAr: 'الاسم والشعار',
          bodyAr: [
            'اكتب اسم المقهى وارفع شعاراً يظهر بجوار الاسم في صفحة جار الحي.',
            'حدّث المشروبات وعرض اليوم وساعات العمل.',
          ],
        },
      ],
    },
    {
      id: 'orders',
      titleAr: 'الطلب الحي',
      sections: [
        {
          headingAr: 'الكاشير والشاشات',
          bodyAr: [
            'فعّل تنبيه الطلبات. عند التوصيل في الحي يحدد الجار موقعه بزر حدد موقعي ثم تأكد من موقعي.',
            'الشاشات داخل المقهى لها مسارها. مشاركات الشاشة من رابط ضيف مشترك بلا دفتر حضور.',
            'أرسل المذكرة من جهازك عبر واتساب. صندوق المحادثة بين جار الحي والكاشير فقط.',
          ],
        },
      ],
    },
    {
      id: 'qr',
      titleAr: 'الملصق والبايو',
      sections: [
        {
          headingAr: 'على الطاولة',
          bodyAr: [
            'اطبع ملصق الصفحة وملصق الشاشات حسب اللوحة. ضع رابط الصفحة في البايو وانشر عرض اليوم على حالة واتساب.',
          ],
        },
      ],
    },
    {
      id: 'neighborhood',
      titleAr: 'احتل حيك',
      sections: [
        {
          headingAr: 'دائرة الحي',
          bodyAr: [
            'ابدأ بجيران المقهى ثم المكاتب القريبة. لا تذكر منتجات أخرى في نصوص جار الحي.',
          ],
        },
      ],
    },
  ]),
};

export const STORE_LOUNGE_SUPPORT: StoreProductSupportGuide = {
  id: 'lounge',
  productAr: 'لاونجا1',
  accent: '#d4a574',
  documentTitle: 'halaqmap — دليل تشغيل وتسويق لاونجا1',
  kickerAr: 'من الشراء حتى شاشة اللاونج',
  titleAr: 'دليل تشغيل وتسويق لاونجا1',
  leadAr:
    'حزمة فعاليات للعرض على شاشات اللاونج ولوحة مضيف ورابط ضيف مشترك للترحيب باسم الزائر. لا قائمة ضيوف ولا تتبع حضور ولا بيع داخل الشاشة.',
  landingPath: ROUTE_PATHS.STORE_LOUNGE,
  landingCtaAr: 'دليل التشغيل والتسويق',
  deskLeadAr: 'تعليمات تشغيل وتسويق لاونجا1 من التفعيل حتى الشاشة.',
  deskCtaAr: 'افتح دليل التشغيل والتسويق',
  tabs: tabs([
    {
      id: 'activate',
      titleAr: 'بعد الشراء',
      sections: [
        {
          headingAr: 'الروابط',
          bodyAr: [
            'بعد السداد تصلك رسالة فيها رابط الشاشة `/l/` ثم الرمز، ومسارا الضيف والمضيف.',
            'احفظ لوحة المضيف في المفضلة. عند انتهاء المدة تبقى الروابط وتحيل لإعادة الشراء على الصفحة نفسها.',
          ],
        },
      ],
    },
    {
      id: 'identity',
      titleAr: 'الهوية والفعاليات',
      sections: [
        {
          headingAr: 'الاسم والحزمة',
          bodyAr: [
            'اكتب اسم اللاونج واختر حزمة الفعاليات من اللوحة، ثم أضف وسائط الشاشة والتنويه.',
            'الباقات المعتمدة ثلاثة أشهر أو ستة أو اثنا عشر شهراً على وسم هذا المنتج فقط.',
          ],
        },
      ],
    },
    {
      id: 'orders',
      titleAr: 'الترحيب على الشاشة',
      sections: [
        {
          headingAr: 'رابط الضيف',
          bodyAr: [
            'وزّع رابط الضيف المشترك: اسم وثلاث جمل جاهزة وسطر مختصر يظهر على جدار الترحيب.',
            'لا دفتر حضور ولا إرسال جماعي نيابة عنك. أخفِ الإساءة من لوحة المضيف.',
          ],
        },
      ],
    },
    {
      id: 'qr',
      titleAr: 'الملصق والبايو',
      sections: [
        {
          headingAr: 'عند المدخل',
          bodyAr: [
            'اطبع رمز الشاشة أو رابط الضيف حسب اللوحة وضعه عند المدخل. ضع الرابط في بايو الحسابات.',
          ],
        },
      ],
    },
    {
      id: 'neighborhood',
      titleAr: 'الانتشار',
      sections: [
        {
          headingAr: 'زوار اللاونج',
          bodyAr: [
            'ابدأ بزوار الصالة الحاليين ثم المنشورات المحلية. لا تخلط شاشة اللاونج بقاعات المناسبة ولا بصفحات الحي.',
          ],
        },
      ],
    },
  ]),
};

export const STORE_HALLS_SUPPORT: StoreProductSupportGuide = {
  id: 'halls',
  productAr: 'افراحي1 واجواء1',
  accent: '#e8c547',
  documentTitle: 'halaqmap — دليل تشغيل افراحي1 واجواء1',
  kickerAr: 'كرت وقاعة ولوحة مضيف',
  titleAr: 'دليل تشغيل وتسويق افراحي1 واجواء1',
  leadAr:
    'افراحي1 للزواج بشقّين رجالي ونسائي، واجواء1 لمناسبة يسميها المشتري. لكل مناسبة كرت وقاعة وروابط ضيف يصدرها المضيف من جهازه. السعر الافتتاحي ثمانمائة وتسعة وتسعون ر.س على وسم كل منتج. هذه صفحة دعم واحدة للمنتجين.',
  landingPath: ROUTE_PATHS.STORE_WEDDING,
  landingCtaAr: 'دليل التشغيل والتسويق',
  deskLeadAr: 'تعليمات تشغيل وتسويق افراحي1 واجواء1 من الكرت حتى جدار التهاني.',
  deskCtaAr: 'افتح دليل التشغيل والتسويق',
  tabs: tabs([
    {
      id: 'activate',
      titleAr: 'بعد الشراء',
      sections: [
        {
          headingAr: 'الروابط',
          bodyAr: [
            'بعد السداد تصلك رسالة فيها روابط الكرت والقاعة ولوحة المضيف. افراحي1 على مسار `/w/` ثم الرمز، واجواء1 على `/e/` ثم الرمز.',
            'احفظ لوحة المضيف في المفضلة. الشق الرجالي أو النسائي يُختار من البداية ويسري على الكرت والقاعة.',
          ],
        },
      ],
    },
    {
      id: 'identity',
      titleAr: 'الكرت والقاعة',
      sections: [
        {
          headingAr: 'المحتوى',
          bodyAr: [
            'أدخل النصوص والصور واليوتيوب المضمّن من لوحة المضيف. نزّل الكرت بستايل الشق المختار.',
            'لا قائمة ضيوف ولا تتبع حضور داخل المنتج.',
          ],
        },
      ],
    },
    {
      id: 'orders',
      titleAr: 'روابط الضيف',
      sections: [
        {
          headingAr: 'من جهاز المشتري',
          bodyAr: [
            'يولّد المضيف روابط الضيف على دفعات. كل رابط لمدعو واحد يُربط بجهازه. الإرسال من واتساب جهازك بلا حفظ أرقام وبلا إرسال جماعي نيابة عنك.',
            'إعادة إرسال الرابط من مدعو تُحظر. جدار التهاني يظهر على شاشة العرض.',
          ],
        },
      ],
    },
    {
      id: 'qr',
      titleAr: 'المشاركة',
      sections: [
        {
          headingAr: 'الكرت والقاعة',
          bodyAr: [
            'شارك الكرت في البايو وحالات واتساب، وافتح شاشة العرض في القاعة. لا تخلط هذا المنتج ببطاقة المناسبة ذات الأسعار الاثني عشر والتسعة والعشرين والتسعة والخمسين.',
          ],
        },
      ],
    },
    {
      id: 'neighborhood',
      titleAr: 'الانتشار',
      sections: [
        {
          headingAr: 'المدعوون',
          bodyAr: [
            'ابدأ بأهل البيت ثم الأقارب ثم بقية المدعوين على دفعات. لا تخلط قاعة افراحي1 بقاعة اجواء1 ولا بشاشات اللاونج.',
          ],
        },
      ],
    },
  ]),
};

export const STORE_PRODUCT_SUPPORT_GUIDES = {
  kitchen: STORE_KITCHEN_SUPPORT,
  grocers: STORE_GROCERS_SUPPORT,
  produce: STORE_PRODUCE_SUPPORT,
  restaurant: STORE_RESTAURANT_SUPPORT,
  cafe: STORE_CAFE_SUPPORT,
  lounge: STORE_LOUNGE_SUPPORT,
  halls: STORE_HALLS_SUPPORT,
} as const;

export type StoreProductSupportId = keyof typeof STORE_PRODUCT_SUPPORT_GUIDES;

export function storeProductSupportByPath(pathname: string): StoreProductSupportGuide | null {
  const path = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  if (path === ROUTE_PATHS.STORE_KITCHEN_SUPPORT) return STORE_KITCHEN_SUPPORT;
  if (path === ROUTE_PATHS.STORE_GROCERS_SUPPORT) return STORE_GROCERS_SUPPORT;
  if (path === ROUTE_PATHS.STORE_PRODUCE_SUPPORT) return STORE_PRODUCE_SUPPORT;
  if (path === ROUTE_PATHS.STORE_RESTAURANT_SUPPORT) return STORE_RESTAURANT_SUPPORT;
  if (path === ROUTE_PATHS.STORE_CAFE_SUPPORT) return STORE_CAFE_SUPPORT;
  if (path === ROUTE_PATHS.STORE_LOUNGE_SUPPORT) return STORE_LOUNGE_SUPPORT;
  if (path === ROUTE_PATHS.STORE_HALLS_SUPPORT) return STORE_HALLS_SUPPORT;
  return null;
}
