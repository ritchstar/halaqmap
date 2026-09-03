/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مساعدات تعليمات تحويل حلانا1. بلا ميسر على العميلة. لا تُستورد من App.
 */
export function normalizeHalanaIban(raw: unknown): string {
  return String(raw ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
    .slice(0, 34);
}

export function isHalanaIban(raw: unknown): boolean {
  return /^SA\d{22}$/.test(normalizeHalanaIban(raw));
}

export function maskHalanaIban(raw: unknown): string {
  const iban = normalizeHalanaIban(raw);
  if (!isHalanaIban(iban)) return '';
  return `${iban.slice(0, 4)}••••${iban.slice(-4)}`;
}

export function halanaPayCopyText(input: {
  bankName: string;
  beneficiaryName: string;
  iban: string;
  amountSar?: string;
  requestRef?: string;
}): string {
  return [
    input.beneficiaryName ? `المستفيد: ${input.beneficiaryName}` : '',
    input.bankName ? `البنك: ${input.bankName}` : '',
    input.iban ? `الآيبان: ${normalizeHalanaIban(input.iban)}` : '',
    input.amountSar ? `المبلغ: ${input.amountSar} ر.س` : '',
    input.requestRef ? `مرجع الطلب: ${input.requestRef}` : '',
    'خريطة الحل لا تستلم المبلغ ولا تؤكد وصوله نيابة عن المتخصصة.',
  ]
    .filter(Boolean)
    .join('\n');
}

export const HALANA_PAY_REQUEST_KEY = 'halana-pay-request';
