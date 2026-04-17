import type { Post, ChatMessage } from '@/lib';

/** عنصر في جدول المواعيد: حجز عميل أو نافذة أوقات متاحة للحجز */
export type BarberDashboardScheduleItem = {
  id: string;
  barberId: string;
  kind: 'customer_booking' | 'availability_slot';
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  service: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  /** يخصّ نوع «أوقات متاحة»: إظهارها للعملاء على المنصة */
  visibleOnProfile: boolean;
};

export type BarberChatThread = {
  customerId: string;
  customerLabel: string;
  messages: ChatMessage[];
};

export type BarberPlatformBannerState = {
  bannerImageUrls: string[];
  showDiscountBadge: boolean;
  discountPercent: number | null;
};

function scheduleKey(barberId: string) {
  return `halaqmap_barber_schedule_${barberId}`;
}
function postsKey(barberId: string) {
  return `halaqmap_barber_posts_${barberId}`;
}
function threadsKey(barberId: string) {
  return `halaqmap_barber_chat_threads_${barberId}`;
}
function bannerKey(barberId: string) {
  return `halaqmap_barber_platform_banner_${barberId}`;
}

export function readSchedule(barberId: string): BarberDashboardScheduleItem[] {
  try {
    const raw = localStorage.getItem(scheduleKey(barberId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as BarberDashboardScheduleItem[];
  } catch {
    return [];
  }
}

export function writeSchedule(barberId: string, rows: BarberDashboardScheduleItem[]) {
  localStorage.setItem(scheduleKey(barberId), JSON.stringify(rows));
}

export function readPosts(barberId: string): Post[] {
  try {
    const raw = localStorage.getItem(postsKey(barberId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Post[];
  } catch {
    return [];
  }
}

export function writePosts(barberId: string, posts: Post[]) {
  localStorage.setItem(postsKey(barberId), JSON.stringify(posts));
}

export function readThreads(barberId: string): BarberChatThread[] {
  try {
    const raw = localStorage.getItem(threadsKey(barberId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as BarberChatThread[];
  } catch {
    return [];
  }
}

export function writeThreads(barberId: string, threads: BarberChatThread[]) {
  localStorage.setItem(threadsKey(barberId), JSON.stringify(threads));
}

const defaultBanner = (): BarberPlatformBannerState => ({
  bannerImageUrls: [],
  showDiscountBadge: false,
  discountPercent: null,
});

export function readBannerState(barberId: string): BarberPlatformBannerState {
  try {
    const raw = localStorage.getItem(bannerKey(barberId));
    if (!raw) return defaultBanner();
    const parsed = JSON.parse(raw) as Partial<BarberPlatformBannerState>;
    return {
      bannerImageUrls: Array.isArray(parsed.bannerImageUrls) ? parsed.bannerImageUrls : [],
      showDiscountBadge: Boolean(parsed.showDiscountBadge),
      discountPercent:
        typeof parsed.discountPercent === 'number' && !Number.isNaN(parsed.discountPercent)
          ? parsed.discountPercent
          : null,
    };
  } catch {
    return defaultBanner();
  }
}

export function writeBannerState(barberId: string, state: BarberPlatformBannerState) {
  localStorage.setItem(bannerKey(barberId), JSON.stringify(state));
}
