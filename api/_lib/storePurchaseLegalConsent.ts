/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** يُحدَّث مع `STORE_ISSUED_CARDS_POLICY_VERSION` في `src/config/storeIssuedCardsLegal.ts` */
export const STORE_ISSUED_CARDS_POLICY_VERSION = '2026-09-05' as const;

export type StorePurchaseLegalConsentRecord = {
  store_legal_version: string;
  accepted_at: string;
  summary: string;
  direct_pay_ack?: boolean;
};

function clip(value: unknown, max: number): string {
  return String(value ?? '')
    .trim()
    .slice(0, max);
}

export function parseStorePurchaseLegalConsent(
  body: Record<string, unknown>,
): { ok: true; record: StorePurchaseLegalConsentRecord } | { ok: false; error: string } {
  const version = clip(body.legalConsentVersion, 32);
  const at = clip(body.legalConsentAt, 40);
  const summary = clip(body.legalConsentSummary, 500);
  if (!version || version !== STORE_ISSUED_CARDS_POLICY_VERSION) {
    return { ok: false, error: 'نسخة الشروط غير محدثة. حدّث الصفحة ثم أعد المحاولة.' };
  }
  if (!at || Number.isNaN(Date.parse(at))) {
    return { ok: false, error: 'موافقة الشراء غير مكتملة. أعد تأشير الموافقة.' };
  }
  if (summary.length < 24) {
    return { ok: false, error: 'نص الموافقة مطلوب قبل إتمام الطلب.' };
  }
  return {
    ok: true,
    record: {
      store_legal_version: version,
      accepted_at: at,
      summary,
      ...(body.legalConsentDirectPay === true ? { direct_pay_ack: true } : {}),
    },
  };
}

export function attachLegalConsentToPayload<T extends Record<string, unknown>>(
  payload: T,
  record: StorePurchaseLegalConsentRecord,
): T & { legal_consent: StorePurchaseLegalConsentRecord } {
  return { ...payload, legal_consent: record };
}

/** يدمج موافقة الشراء في payload الطلب — يُستدعى من createPending */
export function mergePurchaseLegalConsentIntoOrder<
  T extends { payload: Record<string, unknown> },
>(parsed: T, body: Record<string, unknown>): T | { ok: false; error: string } {
  const consent = parseStorePurchaseLegalConsent(body);
  if (!consent.ok) return consent;
  return {
    ...parsed,
    payload: attachLegalConsentToPayload(parsed.payload, consent.record),
  };
}
