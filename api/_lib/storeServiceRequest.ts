/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق طلب خدمات متجر halaqmap — بلا أسرار وبلا استيراد واجهة.
 */

export const STORE_SERVICE_REQUEST_TABLE = 'store_service_requests' as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type StoreServiceRequestFields = {
  applicantName: string;
  entityName: string;
  freelanceWorkDoc: string;
  email: string;
  phone: string;
  whatsapp: string;
  requestBody: string;
  consentStudyReply: boolean;
  website: string;
  source: string;
};

export type StoreServiceRequestParseOk = {
  ok: true;
  row: {
    applicant_name: string;
    entity_name: string | null;
    freelance_work_doc: string | null;
    email_normalized: string;
    phone: string;
    whatsapp: string;
    request_body: string;
    consent_study_reply: true;
    source: string | null;
  };
};

export type StoreServiceRequestParseFail = { ok: false; error: string; status: number };

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').trim().slice(0, max);
}

function digitsPlus(raw: string, max = 20): string {
  return raw.replace(/[^\d+]/g, '').slice(0, max);
}

export function parseStoreServiceRequestBody(
  body: Record<string, unknown>,
): StoreServiceRequestParseOk | StoreServiceRequestParseFail {
  const website = clip(body.website, 200);
  if (website.length > 0) {
    return { ok: false, error: 'honeypot', status: 200 };
  }

  const applicantName = clip(body.applicantName, 80);
  if (applicantName.length < 2) {
    return { ok: false, error: 'اسم صاحب الطلب مطلوب', status: 400 };
  }

  const email = clip(body.email, 254).toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'البريد غير صالح', status: 400 };
  }

  const phone = digitsPlus(clip(body.phone, 24));
  if (phone.replace(/\D/g, '').length < 8) {
    return { ok: false, error: 'رقم التواصل غير صالح', status: 400 };
  }

  const whatsapp = digitsPlus(clip(body.whatsapp, 24));
  if (whatsapp.replace(/\D/g, '').length < 8) {
    return { ok: false, error: 'رقم واتساب غير صالح', status: 400 };
  }

  const requestBody = clip(body.requestBody, 4000);
  if (requestBody.length < 12) {
    return { ok: false, error: 'اشرح الطلب في مربع الكتابة (١٢ حرفاً على الأقل)', status: 400 };
  }

  if (body.consentStudyReply !== true) {
    return { ok: false, error: 'الموافقة على الدراسة والرد مطلوبة', status: 400 };
  }

  const entityName = clip(body.entityName, 120) || null;
  const freelanceWorkDoc = clip(body.freelanceWorkDoc, 80) || null;
  const source = clip(body.source, 40).replace(/[^\w.-]/g, '').slice(0, 40) || null;

  return {
    ok: true,
    row: {
      applicant_name: applicantName,
      entity_name: entityName,
      freelance_work_doc: freelanceWorkDoc,
      email_normalized: email,
      phone,
      whatsapp,
      request_body: requestBody,
      consent_study_reply: true,
      source,
    },
  };
}
