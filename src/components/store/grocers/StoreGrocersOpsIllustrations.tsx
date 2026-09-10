/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { ReactNode } from 'react';
import type { GrocersOpsVisualId } from '@/config/storeGrocersOpsPlanCopy';

const accent = '#8fbf7a';

function SvgFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="grocers-ops-visual" aria-label={label}>
      <svg viewBox="0 0 320 200" role="img" aria-hidden className="h-auto w-full max-w-sm">
        {children}
      </svg>
    </figure>
  );
}

function ActivationVisual() {
  return (
    <SvgFrame label="رسالة تفعيل وروابط النشاط">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="108" y="16" width="104" height="168" rx="14" fill="#061018" stroke="#ffffff22" />
      <rect x="118" y="36" width="84" height="12" rx="6" fill={accent} opacity="0.7" />
      <rect x="118" y="58" width="64" height="8" rx="4" fill="#ffffff33" />
    </SvgFrame>
  );
}

function PathVisual() {
  return (
    <SvgFrame label="محل ثابت أو عربة">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="48" y="72" width="96" height="72" rx="10" fill={accent} opacity="0.22" />
      <rect x="176" y="64" width="96" height="88" rx="10" fill={accent} opacity="0.16" />
      <path d="M144 108h32" stroke={accent} strokeWidth="2" strokeDasharray="4 3" />
    </SvgFrame>
  );
}

function ShelfVisual() {
  return (
    <SvgFrame label="رف سلع">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="40" y="56" width="240" height="16" rx="4" fill="#ffffff18" />
      <rect x="40" y="84" width="240" height="16" rx="4" fill="#ffffff14" />
      <rect x="40" y="112" width="240" height="16" rx="4" fill="#ffffff10" />
      <rect x="48" y="144" width="72" height="24" rx="12" fill={accent} opacity="0.35" />
    </SvgFrame>
  );
}

function DailyVisual() {
  return (
    <SvgFrame label="توفر وعروض">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="32" y="56" width="256" height="28" rx="14" fill={accent} opacity="0.35" />
      <rect x="48" y="104" width="88" height="56" rx="8" fill="#ffffff12" />
      <rect x="152" y="104" width="88" height="56" rx="8" fill="#ffffff10" />
    </SvgFrame>
  );
}

function TestVisual() {
  return (
    <SvgFrame label="اختبار الطلب">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="48" y="48" width="88" height="136" rx="12" fill="#061018" stroke="#ffffff18" />
      <path d="M136 116h48" stroke={accent} strokeWidth="2" strokeDasharray="4 3" />
      <rect x="184" y="72" width="88" height="88" rx="10" fill="#061018" stroke="#ffffff18" />
    </SvgFrame>
  );
}

function QrVisual() {
  return (
    <SvgFrame label="رمز QR">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="56" y="72" width="120" height="72" rx="10" fill={accent} opacity="0.2" />
      <rect x="200" y="48" width="64" height="64" rx="6" fill="#ffffff" fillOpacity="0.92" />
    </SvgFrame>
  );
}

function SocialVisual() {
  return (
    <SvgFrame label="نشر الصفحة">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="40" y="48" width="240" height="104" rx="12" fill="#061018" stroke="#ffffff18" />
      <rect x="56" y="64" width="120" height="56" rx="6" fill="#ffffff12" />
    </SvgFrame>
  );
}

function NeighborhoodVisual() {
  return (
    <SvgFrame label="حضور في الحي">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <circle cx="160" cy="100" r="56" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="1.5" />
      <rect x="128" y="88" width="64" height="24" rx="8" fill={accent} opacity="0.3" />
    </SvgFrame>
  );
}

function OrderReviewVisual() {
  return (
    <SvgFrame label="مراجعة السلة">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="32" y="48" width="256" height="104" rx="12" fill="#061018" stroke="#ffffff18" />
      <rect x="48" y="64" width="96" height="10" rx="5" fill={accent} opacity="0.5" />
    </SvgFrame>
  );
}

function CartPrepVisual() {
  return (
    <SvgFrame label="تجهيز السلة">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="56" y="88" width="88" height="56" rx="8" fill={accent} opacity="0.22" />
      <rect x="176" y="88" width="88" height="56" rx="8" fill={accent} opacity="0.18" />
    </SvgFrame>
  );
}

function WhatsappVisual() {
  return (
    <SvgFrame label="ملخص واتساب يدوي">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="48" y="56" width="112" height="88" rx="10" fill="#061018" stroke="#ffffff18" />
      <path d="M160 108h32" stroke={accent} strokeWidth="2" strokeLinecap="round" />
    </SvgFrame>
  );
}

function ReturnVisual() {
  return (
    <SvgFrame label="بطاقة QR في الكيس">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <rect x="56" y="72" width="120" height="72" rx="10" fill={accent} opacity="0.2" />
      <rect x="200" y="96" width="48" height="48" rx="4" fill="#ffffff" fillOpacity="0.9" />
    </SvgFrame>
  );
}

function ReviewVisual() {
  return (
    <SvgFrame label="مراجعة أسبوعية">
      <rect width="320" height="200" rx="16" fill="#0f1a0c" stroke={accent} strokeOpacity="0.35" />
      <circle cx="160" cy="100" r="56" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="160" cy="100" r="6" fill={accent} />
    </SvgFrame>
  );
}

export function StoreGrocersOpsIllustration({ visual }: { visual: GrocersOpsVisualId }) {
  switch (visual) {
    case 'activation':
      return <ActivationVisual />;
    case 'path':
      return <PathVisual />;
    case 'shelf':
      return <ShelfVisual />;
    case 'daily':
      return <DailyVisual />;
    case 'test':
      return <TestVisual />;
    case 'qr':
      return <QrVisual />;
    case 'social':
      return <SocialVisual />;
    case 'neighborhood':
      return <NeighborhoodVisual />;
    case 'order-review':
      return <OrderReviewVisual />;
    case 'cart-prep':
      return <CartPrepVisual />;
    case 'whatsapp':
      return <WhatsappVisual />;
    case 'return':
      return <ReturnVisual />;
    case 'review':
      return <ReviewVisual />;
    default:
      return null;
  }
}
