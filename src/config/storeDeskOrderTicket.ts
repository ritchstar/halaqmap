/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مراحل تذكرة الطلب وأرشيف الكاشير. لا يُستورد من App.
 */
export const STORE_DESK_ORDER_ARCHIVE_CAP = 1000 as const;
export const STORE_DESK_ORDER_LIVE_CAP = 80 as const;

export const STORE_DESK_ORDER_TICKET_PHASES = ['new', 'received', 'done'] as const;
export type StoreDeskOrderTicketPhase = (typeof STORE_DESK_ORDER_TICKET_PHASES)[number];

export const STORE_DESK_ORDER_TICKET_COPY = {
  deskTitleAr: 'صفحة الكاشير والتحكم لإدارة العرض والطلبات',
  kitchenTitleAr: 'صفحة النشاط والتحكم لإدارة العرض والطلبات',
  newLaneAr: 'طلب جديد',
  receivedLaneAr: 'قيد التنفيذ',
  receivedAr: 'تم الاستلام',
  finishAr: 'أرشفة وإنهاء',
  archiveTitleAr: 'أرشيف التذاكر المنفّذة',
  archiveCountAr: 'تذاكر مؤرشفة',
  archiveDownloadAr: 'تحميل الأرشيف',
  archiveEmptyAr: 'لا تذاكر مؤرشفة بعد.',
  archiveFullAr: 'بلغ الأرشيف ألف تذكرة. حمّله قبل تفريغ الأقدم عند إنهاء تذكرة جديدة.',
  archiveHintAr: 'يُحفظ أصل التذكرة المنفّذة على الخادم حتى ألف نسخة، وتُنزَّل نسخة إلى جهازك عند الإنهاء.',
  phaseNewAr: 'طلب جديد',
  phaseReceivedAr: 'تم الاستلام',
  phaseDoneAr: 'منفَّذة',
} as const;
