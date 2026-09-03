/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مساعدات نظام تمرير تعليمات الدفع. لا تُستورد من App.
 */
import {
  STORE_DIRECT_PAY_PRODUCTS,
  STORE_DIRECT_PAY_SARIE_KINDS,
  STORE_DIRECT_PAY_TRUSTED_HOSTS,
  type StoreDirectPayProduct,
  type StoreDirectPaySarieKind,
} from '@/config/storeDirectPay';

export function isStoreDirectPayProduct(raw: unknown): raw is StoreDirectPayProduct {
  return STORE_DIRECT_PAY_PRODUCTS.includes(String(raw || '') as StoreDirectPayProduct);
}

export function normalizeDirectIban(raw: unknown): string {
  return String(raw ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
    .slice(0, 34);
}

export function isDirectIban(raw: unknown): boolean {
  return /^SA\d{22}$/.test(normalizeDirectIban(raw));
}

export function maskDirectIban(raw: unknown): string {
  const iban = normalizeDirectIban(raw);
  if (!isDirectIban(iban)) return '';
  return `${iban.slice(0, 4)}••••${iban.slice(-4)}`;
}

export function normalizeDirectMobile(raw: unknown): string {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('966') && digits.length === 12) return `0${digits.slice(3)}`;
  return digits.slice(0, 15);
}

export function isDirectMobile(raw: unknown): boolean {
  return /^05\d{8}$/.test(normalizeDirectMobile(raw));
}

export function isDirectEmail(raw: unknown): boolean {
  const email = String(raw ?? '')
    .trim()
    .toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 180;
}

export function isDirectEntityNumber(raw: unknown): boolean {
  return /^7\d{9}$/.test(String(raw ?? '').replace(/\D/g, ''));
}

export function isDirectSarieKind(raw: unknown): raw is StoreDirectPaySarieKind {
  return STORE_DIRECT_PAY_SARIE_KINDS.includes(String(raw || '') as StoreDirectPaySarieKind);
}

export function normalizeDirectSarieAlias(kind: StoreDirectPaySarieKind, raw: unknown): string {
  if (kind === 'mobile') return normalizeDirectMobile(raw);
  if (kind === 'email') {
    return String(raw ?? '')
      .trim()
      .toLowerCase()
      .slice(0, 180);
  }
  return String(raw ?? '')
    .replace(/\D/g, '')
    .slice(0, 10);
}

export function isDirectSarieAlias(kind: StoreDirectPaySarieKind, raw: unknown): boolean {
  const value = normalizeDirectSarieAlias(kind, raw);
  if (kind === 'mobile') return isDirectMobile(value);
  if (kind === 'email') return isDirectEmail(value);
  return isDirectEntityNumber(value);
}

function hostOf(url: URL): string {
  return url.hostname.replace(/^www\./i, '').toLowerCase();
}

export function isTrustedDirectPayHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./i, '').toLowerCase();
  return STORE_DIRECT_PAY_TRUSTED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

export function normalizeDirectExternalUrl(raw: unknown): string {
  const value = String(raw ?? '')
    .trim()
    .slice(0, 400);
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return '';
    if (url.username || url.password) return '';
    if (!isTrustedDirectPayHost(hostOf(url))) return '';
    return url.toString();
  } catch {
    return '';
  }
}

export function isDirectExternalUrl(raw: unknown): boolean {
  return Boolean(normalizeDirectExternalUrl(raw));
}

export function directPayCopyText(input: {
  bankName?: string;
  beneficiaryName?: string;
  iban?: string;
  stcMobile?: string;
  sarieKind?: string;
  sarieAlias?: string;
  externalUrl?: string;
  amountSar?: string;
  requestRef?: string;
}): string {
  const sarieLabel =
    input.sarieKind === 'email' ? 'بريد سريع' : input.sarieKind === 'entity' ? 'الرقم الموحّد لسريع' : 'جوال سريع';
  return [
    input.beneficiaryName ? `المستفيد: ${input.beneficiaryName}` : '',
    input.bankName ? `البنك: ${input.bankName}` : '',
    input.iban ? `الآيبان: ${normalizeDirectIban(input.iban)}` : '',
    input.stcMobile ? `STC Bank: ${normalizeDirectMobile(input.stcMobile)}` : '',
    input.sarieAlias ? `${sarieLabel}: ${input.sarieAlias}` : '',
    input.externalUrl ? `رابط الدفع: ${input.externalUrl}` : '',
    input.amountSar ? `المبلغ: ${input.amountSar} ر.س` : '',
    input.requestRef ? `مرجع الطلب: ${input.requestRef}` : '',
    'خريطة الحل لا تستلم المبلغ ولا تؤكد وصوله ولا تأخذ عمولة على الحرفة.',
  ]
    .filter(Boolean)
    .join('\n');
}

export const DIRECT_PAY_REQUEST_KEY = 'store-direct-pay-request';
