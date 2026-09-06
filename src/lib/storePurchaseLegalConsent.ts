/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import {
  STORE_ISSUED_CARDS_POLICY_VERSION,
  STORE_PURCHASE_CONSENT_SUMMARY_AR,
  STORE_PURCHASE_DIRECT_PAY_CONSENT_AR,
} from '@/config/storeIssuedCardsLegal';

export type StorePurchaseLegalConsentPayload = {
  legalConsentVersion: string;
  legalConsentAt: string;
  legalConsentSummary: string;
  legalConsentDirectPay?: boolean;
};

export function buildStorePurchaseLegalConsentFields(options?: {
  includeDirectPay?: boolean;
}): StorePurchaseLegalConsentPayload {
  const summary = options?.includeDirectPay
    ? `${STORE_PURCHASE_CONSENT_SUMMARY_AR} ${STORE_PURCHASE_DIRECT_PAY_CONSENT_AR}`
    : STORE_PURCHASE_CONSENT_SUMMARY_AR;
  return {
    legalConsentVersion: STORE_ISSUED_CARDS_POLICY_VERSION,
    legalConsentAt: new Date().toISOString(),
    legalConsentSummary: summary.slice(0, 500),
    ...(options?.includeDirectPay ? { legalConsentDirectPay: true } : {}),
  };
}

export function storeCheckoutConsentLabelAr(options?: { includeDirectPay?: boolean }): string {
  if (options?.includeDirectPay) {
    return `${STORE_PURCHASE_CONSENT_SUMMARY_AR} ${STORE_PURCHASE_DIRECT_PAY_CONSENT_AR}`;
  }
  return STORE_PURCHASE_CONSENT_SUMMARY_AR;
}
