import { isDemoShowcaseBarberId } from '@/config/demoCatalog';
import { compareBarbersByListingScore } from '@/lib/barberListingRank';

export const ROUTE_PATHS = {
  HOME: '/',
  BARBERS_LANDING: '/partners',
  /** إقناع عميق: لماذا حلاق ماب وليس مجرد «حجز» */
  PARTNER_WHY: '/partners/why',
  /** قصة المنصة ومنطق المسار */
  PARTNER_STORY: '/partners/story',
  REGISTER: '/partners/register',
  REGISTER_SUCCESS: '/partners/register/success',
  ABOUT: '/about',
  PRIVACY: '/privacy',
  PARTNER_PRIVACY: '/partners/privacy',
  SUBSCRIPTION_POLICY: '/partners/subscription-policy',
  BARBER_LOGIN: '/partners/login',
  BARBER_DASHBOARD: '/barber/dashboard',
  /** طلب حذف الحساب (باقة برونزية — نموذج يُحال للإدارة) */
  BARBER_ACCOUNT_DELETE_REQUEST: '/barber/request-account-deletion',
  PAYMENT: '/partners/payment',
  /** دعم فني للشركاء — محادثة خاصة بجلسة ساعة (?t=رمز_فريد) */
  PARTNER_SUPPORT: '/partners/support',
  /** صفحة تقييم عبر دعوة QR: /rate/:barberId?t=token */
  RATE_BARBER: '/rate/:barberId',
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

export interface Barber {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  subscription: SubscriptionTier;
  rating: number;
  reviewCount: number;
  images: string[];
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
  /** سرّي لبناء رابط دعوة التقييم عبر QR — لا يُجلب في قوائم الخريطة العامة */
  ratingInviteToken?: string;
  /** بطاقة ببنر علوي (عرض تصميم للباقة البرونزية مثل الذهبي/الماسي) */
  showcaseTopBanner?: boolean;
  /**
   * باقة ماسية فقط: إظهار كتلة جدولة المواعيد للعملاء على البطاقة والتفاصيل.
   * إذا وُضعت `false` تُخفى من البيانات؛ يمكن أيضاً الإخفاء من لوحة الحلاق (محلي في المتصفح للمعاينة).
   */
  diamondAppointmentSchedulingEnabled?: boolean;
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

/** روابط ملفات مرفوعة إلى Storage بعد إتمام migration 17 وتهيئة الحاوية registration-uploads */
export interface RegistrationAttachmentUrls {
  commercialRegistry?: string;
  municipalLicense?: string;
  healthCertificates?: string[];
  shopExterior?: string;
  shopInterior?: string;
  banners?: string[];
  receipt?: string;
}

/** تتبّع مصدر استقطاب الحلاق (UTM / مرجع الحملة) لمسار الشركاء. */
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
  location: {
    lat: number;
    lng: number;
    address: string;
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
  /** أسبوع كامل (سبعة أيام) كما أُرسل مع طلب التسجيل */
  weeklyWorkingHours?: { day: string; open: string; close: string }[];
  servicesSummary?: string;
  categories?: string[];
  /** موافقة صريحة على شروط التسجيل وسياسة الشركاء (إلزامية عند الإرسال) */
  registrationTermsAccepted?: boolean;
  /** وقت الموافقة ISO 8601 (UTC) */
  registrationTermsAcceptedAtIso?: string;
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
      const skipDistance = isDemoShowcaseBarberId(barber.id);
      if (!skipDistance && barber.distance > filters.maxDistance) return false;
      if (filters.tiers.length > 0 && !filters.tiers.includes(barber.subscription)) return false;
      if (filters.openNow && !barber.isOpen) return false;
      if (barber.rating < filters.minRating) return false;
      if (filters.categories.length > 0) {
        const hasCategory = filters.categories.some((cat) =>
          barber.categories.includes(cat)
        );
        if (!hasCategory) return false;
      }
      return true;
    })
    .sort((a, b) =>
      compareBarbersByListingScore(
        {
          id: a.id,
          subscription: a.subscription as 'bronze' | 'gold' | 'diamond',
          distance: a.distance,
          rating: a.rating,
          reviewCount: a.reviewCount,
        },
        {
          id: b.id,
          subscription: b.subscription as 'bronze' | 'gold' | 'diamond',
          distance: b.distance,
          rating: b.rating,
          reviewCount: b.reviewCount,
        }
      )
    );
}
