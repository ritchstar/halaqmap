/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رسوم توضيحية SVG بسيطة — بلا نص مولّد داخل الصورة.
 */
import type { ReactNode } from 'react';
import type { KitchenOpsVisualId } from '@/config/storeKitchenOpsPlanCopy';

const accent = '#b45a3c';

function SvgFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="kitchen-ops-visual" aria-label={label}>
      <svg viewBox="0 0 320 200" role="img" aria-hidden className="h-auto w-full max-w-sm">
        {children}
      </svg>
    </figure>
  );
}

function ActivationVisual() {
  return (
    <SvgFrame label="رسالة تفعيل وروابط النشاط">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="108" y="16" width="104" height="168" rx="14" fill="#061018" stroke="#ffffff22" />
      <rect x="118" y="36" width="84" height="12" rx="6" fill={accent} opacity="0.7" />
      <rect x="118" y="58" width="64" height="8" rx="4" fill="#ffffff33" />
      <rect x="118" y="74" width="72" height="8" rx="4" fill="#ffffff22" />
      <circle cx="160" cy="118" r="22" fill={accent} opacity="0.25" />
      <path d="M152 118h16M160 110v16" stroke={accent} strokeWidth="3" strokeLinecap="round" />
    </SvgFrame>
  );
}

function RulesVisual() {
  return (
    <SvgFrame label="تنظيم يوم المطبخ">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="40" y="40" width="240" height="24" rx="8" fill={accent} opacity="0.25" />
      <rect x="40" y="76" width="180" height="12" rx="6" fill="#ffffff22" />
      <rect x="40" y="96" width="200" height="12" rx="6" fill="#ffffff18" />
      <rect x="40" y="116" width="160" height="12" rx="6" fill="#ffffff14" />
      <rect x="40" y="148" width="96" height="28" rx="14" fill={accent} opacity="0.35" />
    </SvgFrame>
  );
}

function MenuVisual() {
  return (
    <SvgFrame label="صفحة أصناف">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="176" y="32" width="112" height="136" rx="12" fill="#061018" stroke="#ffffff18" />
      <rect x="188" y="48" width="88" height="48" rx="6" fill="#ffffff12" />
      <rect x="188" y="104" width="72" height="10" rx="5" fill={accent} opacity="0.45" />
      <rect x="188" y="122" width="56" height="10" rx="5" fill="#ffffff22" />
      <circle cx="88" cy="100" r="36" fill={accent} opacity="0.22" />
      <ellipse cx="88" cy="100" rx="28" ry="20" fill={accent} opacity="0.35" />
    </SvgFrame>
  );
}

function CapacityVisual() {
  return (
    <SvgFrame label="طبق اليوم والطاقة">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="32" y="56" width="256" height="28" rx="14" fill={accent} opacity="0.35" />
      <rect x="48" y="104" width="96" height="64" rx="8" fill="#ffffff12" />
      <rect x="160" y="104" width="96" height="64" rx="8" fill="#ffffff10" />
      <rect x="176" y="120" width="64" height="8" rx="4" fill={accent} opacity="0.4" />
    </SvgFrame>
  );
}

function TestVisual() {
  return (
    <SvgFrame label="اختبار الطلب">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="48" y="48" width="88" height="136" rx="12" fill="#061018" stroke="#ffffff18" />
      <path d="M136 116h48" stroke={accent} strokeWidth="2" strokeDasharray="4 3" />
      <rect x="184" y="72" width="88" height="88" rx="10" fill="#061018" stroke="#ffffff18" />
      <rect x="196" y="88" width="64" height="8" rx="4" fill={accent} opacity="0.5" />
      <rect x="196" y="104" width="48" height="8" rx="4" fill="#ffffff22" />
    </SvgFrame>
  );
}

function QrVisual() {
  return (
    <SvgFrame label="رمز QR على العبوة">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="56" y="72" width="120" height="72" rx="10" fill={accent} opacity="0.2" />
      <rect x="200" y="48" width="64" height="64" rx="6" fill="#ffffff" fillOpacity="0.92" />
      <rect x="208" y="56" width="12" height="12" fill="#061018" />
      <rect x="236" y="56" width="12" height="12" fill="#061018" />
      <rect x="208" y="84" width="12" height="12" fill="#061018" />
    </SvgFrame>
  );
}

function SocialVisual() {
  return (
    <SvgFrame label="نشر القائمة على السوشال">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="40" y="48" width="240" height="104" rx="12" fill="#061018" stroke="#ffffff18" />
      <rect x="56" y="64" width="120" height="56" rx="6" fill="#ffffff12" />
      <rect x="188" y="72" width="72" height="40" rx="6" fill={accent} opacity="0.3" />
      <rect x="56" y="132" width="160" height="8" rx="4" fill="#ffffff22" />
    </SvgFrame>
  );
}

function OrderReviewVisual() {
  return (
    <SvgFrame label="مراجعة الطلب في اللوحة">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="32" y="48" width="256" height="104" rx="12" fill="#061018" stroke="#ffffff18" />
      <rect x="48" y="64" width="96" height="10" rx="5" fill={accent} opacity="0.5" />
      <rect x="48" y="84" width="128" height="8" rx="4" fill="#ffffff22" />
      <rect x="48" y="100" width="112" height="8" rx="4" fill="#ffffff18" />
      <rect x="200" y="72" width="72" height="24" rx="12" fill={accent} opacity="0.35" />
    </SvgFrame>
  );
}

function WhatsappVisual() {
  return (
    <SvgFrame label="مذكرة واتساب يدوية">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="48" y="56" width="112" height="88" rx="10" fill="#061018" stroke="#ffffff18" />
      <rect x="160" y="72" width="112" height="72" rx="10" fill={accent} opacity="0.18" />
      <path d="M160 108h32" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <circle cx="200" cy="108" r="8" fill={accent} opacity="0.45" />
    </SvgFrame>
  );
}

function DeliveryVisual() {
  return (
    <SvgFrame label="استلام أو توصيل">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="48" y="88" width="88" height="56" rx="8" fill={accent} opacity="0.22" />
      <rect x="184" y="88" width="88" height="56" rx="8" fill={accent} opacity="0.18" />
      <path d="M136 116h48" stroke={accent} strokeWidth="2" strokeDasharray="5 4" opacity="0.6" />
    </SvgFrame>
  );
}

function ReturnVisual() {
  return (
    <SvgFrame label="بطاقة QR داخل الطلب">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <rect x="56" y="72" width="120" height="72" rx="10" fill={accent} opacity="0.2" />
      <rect x="200" y="96" width="48" height="48" rx="4" fill="#ffffff" fillOpacity="0.9" />
      <path d="M176 116 C200 80, 220 80, 244 116" fill="none" stroke={accent} strokeWidth="2" opacity="0.5" />
    </SvgFrame>
  );
}

function ReviewVisual() {
  return (
    <SvgFrame label="مراجعة أسبوعية">
      <rect width="320" height="200" rx="16" fill="#1a0c08" stroke={accent} strokeOpacity="0.35" />
      <circle cx="160" cy="100" r="56" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="160" cy="100" r="36" fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="1.5" />
      <circle cx="160" cy="100" r="6" fill={accent} />
    </SvgFrame>
  );
}

export function StoreKitchenOpsIllustration({ visual }: { visual: KitchenOpsVisualId }) {
  switch (visual) {
    case 'activation':
      return <ActivationVisual />;
    case 'rules':
      return <RulesVisual />;
    case 'menu':
      return <MenuVisual />;
    case 'capacity':
      return <CapacityVisual />;
    case 'test':
      return <TestVisual />;
    case 'qr':
      return <QrVisual />;
    case 'social':
      return <SocialVisual />;
    case 'order-review':
      return <OrderReviewVisual />;
    case 'whatsapp':
      return <WhatsappVisual />;
    case 'delivery':
      return <DeliveryVisual />;
    case 'return':
      return <ReturnVisual />;
    case 'review':
      return <ReviewVisual />;
    default:
      return null;
  }
}
