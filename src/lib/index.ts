import { isDemoShowcaseBarberId } from '@/config/demoCatalog';
import { compareBarbersByListingScore } from '@/lib/barberListingRank';
import { barberMatchesCategoryFilter } from '@/lib/barberCategoryLexicon';

export const ROUTE_PATHS = {
  HOME: '/',
  BARBERS_LANDING: '/partners',
  /** صفحة هبوط B2B (Skywork) — partners.halaqmap.com */
  PARTNERS_B2B_LANDING: '/partners/b2b',
  /** إقناع عميق: لماذا حلاق ماب وليس مجرد «حجز» */
  PARTNER_WHY: '/partners/why',
  /** قصة المنصة ومنطق المسار */
  PARTNER_STORY: '/partners/story',
  /** فيديوهات تعليم الاشتراك للشركاء */
  PARTNER_TUTORIALS: '/partners/tutorials',
  /** مجتمع ماب — مساحة تواصل مهنية للشركاء */
  MAP_COMMUNITY: '/partners/community',
  REGISTER: '/partners/register',
  /** تسجيل اهتمام مسبق (بريد + موافقة) — ما قبل الإطلاق الرسمي */
  PARTNER_INTEREST: '/partners/interest',
  REGISTER_SUCCESS: '/partners/register/success',
  ABOUT: '/about',
  /** سياسة خصوصية المستخدم (موجزة — الموقع الجغرافي وعدم المشاركة الخارجية) */
  USER_PRIVACY_POLICY: '/privacy-policy',
  /** شروط الاستخدام العامة للمنصّة */
  TERMS_OF_SERVICE: '/terms',
  /** صفحة مرجعية تأسيسية: حوكمة المعالجة اللحظية وإتلاف الأثر البرمجي */
  EPHEMERAL_PROCESSING_GOVERNANCE: '/privacy/ephemeral-governance',
  /** سياسة خصوصية المستخدم — النسخة التفصيلية (PDPL والأقسام الكاملة) */
  PRIVACY_DETAILED: '/privacy/detailed',
  /** إبقاء المسار القديم؛ يُعاد توجيهه إلى PRIVACY_DETAILED في التوجيه */
  PRIVACY: '/privacy',
  PARTNER_PRIVACY: '/partners/privacy',
  SUBSCRIPTION_POLICY: '/partners/subscription-policy',
  BARBER_LOGIN: '/partners/login',
  /** دخول سريع من بريد الترحيب: ?m=رمز موقّع (مرة واحدة) */
  BARBER_PORTAL_ENTER: '/barber/enter',
  BARBER_DASHBOARD: '/barber/dashboard',
  /** طلب حذف الحساب (باقة برونزية — نموذج يُحال للإدارة) */
  BARBER_ACCOUNT_DELETE_REQUEST: '/barber/request-account-deletion',
  PAYMENT: '/partners/payment',
  /** دعم فني للشركاء — محادثة خاصة بجلسة ساعة (?t=رمز_فريد) */
  PARTNER_SUPPORT: '/partners/support',
  /** مكتب مدير المبيعات B2B — صفحة مستقلة للتفاوض والشرح والانضمام */
  PARTNER_SALES_OFFICE: '/partners/sales-office',
  /** تبديل «مفتوح/مغلق» للعملاء عبر نظام الرصد الذكي برابط سري (?t=رمز) — مفيد للبرونزي */
  SHOP_OPEN_STATUS: '/partners/shop-open',
  /**
   * بطاقة QR لمسار الخدمات البرمجية للمنصة (طباعة/حملات) — للإدارة والتسويق فقط.
   * لا تُضاف روابط لها في الرئيسية أو مسار الخدمات البرمجية للمنصة أو القوائم.
   */
  INTERNAL_PARTNER_PATH_PRINT_CARD: '/m/hm-partner-path-card-q7',
  /** معاينة فواتير اشتراك (PDF) — داخلي، بدون ربط من القوائم */
  INVOICE_PREVIEW_SAMPLES: '/m/invoice-preview-samples',
  /**
   * عرض النمو التقديمي — شرائح مقارنة تسويقية + جذب الزبائن (Pitch Deck).
   * للعروض والاجتماعات — noindex، بدون رابط من القوائم العامة.
   */
  GROWTH_PITCH_DECK: '/m/growth-pitch-deck',
  /**
   * معاينة البنرات والواجهات — للعملاء التجاريين فقط.
   * لا تُضاف روابط لها من الرئيسية أو مسار المستهلك.
   */
  PARTNERS_BANNERS_PREVIEW: '/partners/banners-preview',
  /** طلب B2B للمنشآت الفندقية: بنرات QR مجانية مع الشحن */
  HOSPITALITY_B2B_REQUEST: '/partners/hospitality-request',
  /** صفحة تقييم عبر دعوة QR: /rate/:barberId?t=token */
  RATE_BARBER: '/rate/:barberId',
  /** صفحة الهبوط التصميمية التجريبية — معاينة فقط */
  LANDING_PREVIEW: '/preview',
  /** صفحة هبوط مسار الخدمات التسويقية للشركاء — معاينة تصميمية */
  LANDING_PARTNERS_PREVIEW: '/preview-partners',
  /** استعراض تقني كوني — HALAQ MAP Cosmic Showcase */
  COSMIC_SHOWCASE: '/cosmic',
  /** صفحة آراء وتعليقات المستخدمين الحرة */
  PLATFORM_REVIEWS: '/reviews',
  /** مركز الوكلاء — صفحة مستقلة لبقية الوكلاء */
  ADMIN_STAFF_HUB: '/staff-hub',
  /** شرح مفصّل للمناوب الرقمي الذكي */
  DIGITAL_SHIFT_FEATURE: '/partners/digital-shift',
  /** دليل إضافة المكتب الخاص — تعليمات الاستخدام المفصّلة */
  PRIVATE_OFFICE_GUIDE: '/partners/private-office-guide',
  /** وكيل سعودي — الصفحة الرئيسية */
  SAUDI_AGENT: '/saudi',
  /** معاينة نظام الرصد الذكي — Showcase Radar */
  RADAR_SHOWCASE: '/radar',
  /** صفحة هبوط تجريبية — Roo Landing Lab Experiment */
  ROO_LANDING_LAB: '/lab/roo-landing',
  /** مخيم النجوم الصامت — معمل تصميم مستقل (فلك صحراوي) */
  SILENT_STAR_CAMP: '/lab/silent-star-camp',
  /** قفل الإضاءة الصحراوي — ليل/نجوم + تحكم إضاءة */
  DESERT_LIGHT_LOCK: '/lab/desert-light-lock',
} as const;

/** إبقاء توافق مع روابط قديمة تم تداولها سابقاً */
export const LEGACY_PARTNER_ROUTE_PATHS = {
  BARBERS_LANDING: '/for-barbers',
  REGISTER: '/register',
  REGISTER_SUCCESS: '/register/success',
  SUBSCRIPTION_POLICY: '/subscription-policy',
  BARBER_LOGIN: '/barber/login',
  PAYMENT: '/payment',
} as const;

export enum SubscriptionTier {
  BRONZE = 'bronze',
  GOLD = 'gold',
  DIAMOND = 'diamond',
}

export interface Subscription {
  tier: SubscriptionTier;
  price: number;
  features: string[];
  priority: number;
}

/**
 * تسهيلات داخل المحل و/أو زيارة منزلية لكبار السن والمرضى وذوي الاحتياجات الخاصة بحسب ظروف العميل.
 * إذا لم يُفعّل الحلاق الخيار لا يُعرَض التزام على المنصة.
 */
export interface InclusiveAccessibleCareOffer {
  offered: boolean;
  /** مطلوب عند offered === true (سعر معروض بالريال) */
  displayedPriceSar?: number;
  /** للذهبي/الماسي: إخفاء الخدمة عن العملاء دون حذف الإعدادات */
  publicVisible?: boolean;
  /** تقييد الإعلان بأيام محددة (انظر activeDayFlags) */
  restrictToDays?: boolean;
  /** أيام نشطة عند restrictToDays — مفاتيح بأسماء الأيام العربية (السبت …) */
  activeDayFlags?: Record<string, boolean>;
  /** ملاحظة للعميل (ظروف، حجز مسبق، نطاق زيارة منزلية، …) */
  customerNote?: string;
}

/**
 * زيارة منزلية عامة (ذهبي/ماسي) — منفصلة عن الرعاية المُيسَّرة.
 * التنسيق والتنفيذ مباشرة بين العميل والحلاق.
 */
export interface HomeVisitOffer {
  offered: boolean;
  displayedPriceSar?: number;
  radiusKm?: number;
  publicVisible?: boolean;
  customerNote?: string;
}

/**
 * تجهيز عريس (ماسي) — منفصل عن الزيارة المنزلية.
 * التنسيق والتنفيذ مباشرة بين العميل والحلاق.
 */
export interface GroomPrepOffer {
  offered: boolean;
  displayedPriceSar?: number;
  publicVisible?: boolean;
  customerNote?: string;
}

export interface Barber {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    saudi?: {
      regionId?: string;
      cityId?: string;
      districtId?: string;
      districtOther?: string;
    };
  };
  subscription: SubscriptionTier;
  rating: number;
  reviewCount: number;
  images: string[];
  /** إن وُجدت: يعلن الحلاق عن خدمة موحّدة للفئات الحسّاسة بسعر معروض */
  inclusiveAccessibleCare?: InclusiveAccessibleCareOffer;
  /** زيارة منزلية (ذهبي/ماسي) — إعلان + تواصل مباشر */
  homeVisitOffer?: HomeVisitOffer;
  /** تجهيز عريس (ماسي) — إعلان + تواصل مباشر */
  groomPrepOffer?: GroomPrepOffer;
  services: {
    name: string;
    price: number;
  }[];
  workingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  isOpen: boolean;
  verified: boolean;
  categories: string[];
  /** متخصص حلاقة أطفال — بطاقة مميزة؛ ماسي فقط */
  childrenSpecialist?: boolean;
  /** يقبل حلاقة أطفال (من specialties) */
  acceptsChildren?: boolean;
  /** مركز العناية بالرجل — ماسي + مكتب خاص */
  mensGroomingCenter?: boolean;
  /** خدمات يعرضها الشريك على بنر البطاقة */
  groomingCenterBannerLines?: string[];
  /**
   * إدراج معاينة عبر نظام الرصد الذكي (مثلاً قبل اكتمال ربط حساب الصالون).
   * يُعرض للفريق علامة سرّية `*` في الواجهة — لا تُستخدم كمصدر حقيقي للاشتراك.
   */
  previewListing?: boolean;
  /** سرّي لبناء رابط دعوة التقييم عبر QR — لا يُجلب في قوائم الخريطة العامة */
  ratingInviteToken?: string;
  /** بطاقة ببنر علوي (عرض تصميم للباقة البرونزية مثل الذهبي/الماسي) */
  showcaseTopBanner?: boolean;
  /**
   * باقة ماسية فقط: إظهار كتلة جدولة المواعيد للعملاء على البطاقة والتفاصيل.
   * إذا وُضعت `false` تُخفى من البيانات؛ يمكن أيضاً الإخفاء من لوحة الحلاق (محلي في المتصفح للمعاينة).
   */
  diamondAppointmentSchedulingEnabled?: boolean;
  /** من بحث RPC: اشتراك شهري نشط في subscriptions */
  hasActiveSubscription?: boolean;
  /** ISO — آخر تحديث لملف الصالون (لعامل النشاط في الترتيب) */
  profileUpdatedAt?: string;
  /** صور مميزة على البنر (حتى 4) — ذهبي/ماسي */
  featuredImages?: string[];
  /** إجمالي صور المعرض المنشور */
  galleryCount?: number;
  /**
   * حلاق معاينة ماسي — يظهر للمستخدم عند غياب نتائج حقيقية فقط.
   * شارة تعليمية واضحة؛ ليس شريكاً تجارياً في المنطقة.
   */
  showcasePreview?: boolean;
}

export interface Appointment {
  id: string;
  barberId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  qrCode?: string;
}

export interface Review {
  id: string;
  barberId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  /** سجّل عبر رابط دعوة QR */
  viaQrInvite?: boolean;
  /** false = مخفي عن الملف العام (يتحكم الحلاق) */
  isPublished?: boolean;
  /** يُعرَض في أعلى القائمة عند التفعيل */
  isHighlighted?: boolean;
}

export interface ChatMessage {
  id: string;
  barberId: string;
  customerId: string;
  sender: 'customer' | 'barber';
  message: string;
  messageType: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  timestamp: string;
  read: boolean;
  translated?: string;
}

export interface Post {
  id: string;
  barberId: string;
  title: string;
  content: string;
  images: string[];
  type: 'offer' | 'announcement' | 'gallery';
  discount?: number;
  validUntil?: string;
  createdAt: string;
  likes: number;
  views: number;
}

export interface BarberStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  totalViews: number;
  totalChats: number;
}

/** روابط ملفات مرفوعة إلى Storage (صور المحل والبنر وإيصال التحويل فقط — بروتوكول الخصوصية: لا تخزين لوثائق حكومية). */
export interface RegistrationAttachmentUrls {
  shopExterior?: string;
  shopInterior?: string;
  banners?: string[];
  receipt?: string;
}

/** تتبّع مصدر استقطاب الحلاق (UTM / مرجع الحملة) لمسار الخدمات البرمجية للمنصة. */
export interface PartnerAttribution {
  capturedAtIso: string;
  pagePath: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
}

export interface SubscriptionRequest {
  id: string;
  barberName: string;
  email: string;
  phone: string;
  whatsapp: string;
  /** الرقم الضريبي للمنشأة المشترية للحزمة البرمجية (إن وُجد/إن كانت مسجلة ضريبياً). */
  taxNumber?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    /** من بيانات العنوان الوطني (ملفات lite) */
    saudi?: {
      regionId: string;
      cityId: string;
      districtId: string;
      districtOther?: string;
    };
  };
  tier: SubscriptionTier;
  documents: string[];
  shopImages: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  /** حالة الحساب بعد قرار الإدارة (مستقلة عن حالة الطلب الأساسية) */
  adminAccountState?: 'active' | 'suspended' | 'deleted';
  suspensionReason?: string;
  linkedBarberId?: string;
  /** رقم عضوية ثابت على المنصة (يُخزَّن بعد الموافقة — للدعم والأرشفة) */
  barberMemberNumber?: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  /** طلبات نموذج التسجيل */
  source?: 'registration';
  partnerAttribution?: PartnerAttribution;
  paymentMethod?: 'monthly' | 'bank_transfer';
  receiptFileName?: string;
  /** معاينة إيصال (صورة صغيرة أو PDF كـ data URL — قد يُحذف لاحقاً لتوفير المساحة) */
  receiptDataUrl?: string;
  /** روابط المرفقات على Supabase Storage عند الرفع الناجح */
  registrationAttachmentUrls?: RegistrationAttachmentUrls;
  /** تعهد قانوني إلزامي: امتثال المنشأة لاشتراطات وزارة التجارة والبلدية وتحمّل المسؤولية وإخلاء مسؤولية المنصة */
  legalDisclaimerAccepted?: boolean;
  /** وقت الموافقة على التعهد ISO 8601 (UTC) */
  legalDisclaimerAcceptedAtIso?: string;
  /** أسبوع كامل (سبعة أيام) كما أُرسل مع طلب التسجيل */
  weeklyWorkingHours?: { day: string; open: string; close: string }[];
  servicesSummary?: string;
  /** تسهيلات بالمحل و/أو زيارة منزلية للفئات الحسّاسة — اختياري؛ عند التفعيل يلزم سعر معروض */
  inclusiveAccessibleCare?: InclusiveAccessibleCareOffer;
  categories?: string[];
  /** مسار التخصص عند التسجيل */
  specialtyTrack?: 'general' | 'children' | 'mens_grooming_center';
  mensGroomingCenter?: boolean;
  groomingCenterBannerLines?: string[];
  /** متخصص أطفال — ماسي فقط */
  childrenSpecialist?: boolean;
  /** موافقة صريحة على شروط التسجيل وسياسة الشركاء (إلزامية عند الإرسال) */
  registrationTermsAccepted?: boolean;
  /** وقت الموافقة ISO 8601 (UTC) */
  registrationTermsAcceptedAtIso?: string;
  /** التزام مهني إلزامي — ميثاق Honor Board B2B */
  professionalCommitmentAccepted?: boolean;
  professionalCommitmentAcceptedAtIso?: string;
  /** إقرار شراء منتج برمجي رقمي وفق ISIC4 474151 */
  softwareProductAcknowledged?: boolean;
  softwareProductAcknowledgedAtIso?: string;
  /** إضافة برمجية متقدمة (Software Add-on): المناوب الرقمي — ماسي فقط (+25 ر.س/حزمة) */
  digitalShiftAddonSelected?: boolean;
  /** عدد حزم/أشهر النفاذ المطلوب شراؤها ضمن نفس الطلب */
  listingLicenseQuantity?: number;
}

export interface Payment {
  id: string;
  barberId: string;
  barberName: string;
  amount: number;
  tier: SubscriptionTier;
  method: 'bank_transfer' | 'card';
  receipt?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  period: string;
  submittedAt: string;
  confirmedAt?: string;
}

export interface AdminStats {
  totalBarbers: number;
  bronzeBarbers: number;
  goldBarbers: number;
  diamondBarbers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  pendingRequests: number;
  pendingPayments: number;
  totalAppointments: number;
  totalUsers: number;
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface FilterState {
  maxDistance: number;
  tiers: SubscriptionTier[];
  openNow: boolean;
  minRating: number;
  categories: string[];
  /** عند true: إظهار متخصصي الأطفال فقط (childrenSpecialist) */
  childrenSpecialistOnly?: boolean;
  /** عند true: إظهار مراكز العناية بالرجل فقط */
  mensGroomingCenterOnly?: boolean;
}

export function filterBarbersByDistance(
  barbers: Barber[],
  userLocation: { lat: number; lng: number },
  filters: FilterState
): (Barber & { distance: number })[] {
  return barbers
    .map((barber) => ({
      ...barber,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        barber.location.lat,
        barber.location.lng
      ),
    }))
    .filter((barber) => {
      if (barber.hasActiveSubscription !== true && barber.showcasePreview !== true) return false;
      const skipDistance = isDemoShowcaseBarberId(barber.id) || barber.showcasePreview === true;
      if (!skipDistance && barber.distance > filters.maxDistance) return false;
      if (filters.tiers.length > 0 && !filters.tiers.includes(barber.subscription)) return false;
      if (filters.openNow && !barber.isOpen) return false;
      if (barber.rating < filters.minRating) return false;
      if (filters.categories.length > 0) {
        const hasCategory = filters.categories.some((cat) => {
          if (
            cat === 'زيارة منزلية' &&
            barber.homeVisitOffer?.offered &&
            barber.homeVisitOffer.publicVisible !== false
          ) {
            return true;
          }
          if (
            cat === 'تجهيز عريس' &&
            barber.groomPrepOffer?.offered &&
            barber.groomPrepOffer.publicVisible !== false &&
            barber.subscription === SubscriptionTier.DIAMOND
          ) {
            return true;
          }
          return barberMatchesCategoryFilter(barber.categories, cat);
        });
        if (!hasCategory) return false;
      }
      if (filters.childrenSpecialistOnly && (!barber.childrenSpecialist || barber.subscription !== SubscriptionTier.DIAMOND)) return false;
      if (
        filters.mensGroomingCenterOnly &&
        (!barber.mensGroomingCenter || barber.subscription !== SubscriptionTier.DIAMOND)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) =>
      compareBarbersByListingScore(
        { id: a.id, distance: a.distance, isOpen: a.isOpen },
        { id: b.id, distance: b.distance, isOpen: b.isOpen }
      )
    );
}
