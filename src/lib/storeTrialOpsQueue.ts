/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تجميع طابور التجربة العامة كما تراه لوحة التحكم.
 * طلب المتصفح يظهر فور الحفظ (بانتظار البريد)، ثم ينتقل إلى قيد التشاور بعد التأكيد.
 */
export type StoreTrialOpsQueueRow = { status: string };

export function groupStoreTrialOpsRows<T extends StoreTrialOpsQueueRow>(rows: T[]) {
  const awaitingConfirm: T[] = [];
  const inbox: T[] = [];
  const issued: T[] = [];
  const paid: T[] = [];
  let declinedCount = 0;
  for (const row of rows) {
    if (row.status === 'pending_confirm') awaitingConfirm.push(row);
    else if (row.status === 'pending_review') inbox.push(row);
    else if (row.status === 'issued' || row.status === 'activated' || row.status === 'expired') issued.push(row);
    else if (row.status === 'converted') paid.push(row);
    else if (row.status === 'declined') declinedCount += 1;
  }
  return { awaitingConfirm, inbox, issued, paid, declinedCount };
}

/** بعد تأكيد البريد يصبح الطلب مرئياً لإتمام الإدارة. طلب المسوّق يصل هنا مباشرة. */
export function trialRowReachesAdminInbox(status: string): boolean {
  return status === 'pending_review';
}

/** طلب المتصفح يُحفظ قبل البريد ويظهر في اللوحة دون إتمام. */
export function trialRowReachesAdminDesk(status: string): boolean {
  return status === 'pending_confirm' || status === 'pending_review';
}
