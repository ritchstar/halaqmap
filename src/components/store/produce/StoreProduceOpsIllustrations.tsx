/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رسوم توضيحية SVG بسيطة — بلا نص مولّد داخل الصورة.
 */
import type { ReactNode } from 'react';
import type { ProduceOpsVisualId } from '@/config/storeProduceOpsPlanCopy';

const accent = '#3d8b4a';

function SvgFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="produce-ops-visual" aria-label={label}>
      <svg viewBox="0 0 320 200" role="img" aria-hidden className="h-auto w-full max-w-sm">
        {children}
      </svg>
    </figure>
  );
}

function ActivationVisual() {
  return (
    <SvgFrame label="رسالة تفعيل على الجوال">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <rect x="108" y="16" width="104" height="168" rx="14" fill="#061018" stroke="#ffffff22" />
      <rect x="118" y="36" width="84" height="12" rx="6" fill={accent} opacity="0.7" />
      <rect x="118" y="58" width="64" height="8" rx="4" fill="#ffffff33" />
      <rect x="118" y="74" width="72" height="8" rx="4" fill="#ffffff22" />
      <circle cx="160" cy="118" r="22" fill={accent} opacity="0.25" />
      <path d="M152 118h16M160 110v16" stroke={accent} strokeWidth="3" strokeLinecap="round" />
    </SvgFrame>
  );
}

function DeskPageVisual() {
  return (
    <SvgFrame label="لوحة تشغيل وصفحة زبائن">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <rect x="24" y="28" width="120" height="144" rx="10" fill="#061018" stroke="#ffffff18" />
      <rect x="36" y="44" width="72" height="10" rx="5" fill={accent} opacity="0.55" />
      <rect x="36" y="64" width="96" height="8" rx="4" fill="#ffffff22" />
      <rect x="36" y="80" width="88" height="8" rx="4" fill="#ffffff18" />
      <rect x="176" y="40" width="120" height="132" rx="12" fill="#061018" stroke="#ffffff18" />
      <rect x="188" y="56" width="96" height="10" rx="5" fill={accent} opacity="0.45" />
      <rect x="188" y="76" width="72" height="48" rx="6" fill="#ffffff12" />
      <rect x="188" y="132" width="56" height="10" rx="5" fill={accent} opacity="0.35" />
    </SvgFrame>
  );
}

function QrVisual() {
  return (
    <SvgFrame label="مسح رمز QR">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <rect x="196" y="32" width="88" height="136" rx="12" fill="#061018" stroke="#ffffff18" />
      <rect x="36" y="52" width="88" height="88" rx="8" fill="#ffffff" fillOpacity="0.92" />
      <rect x="44" y="60" width="16" height="16" fill="#061018" />
      <rect x="68" y="60" width="8" height="8" fill="#061018" />
      <rect x="84" y="68" width="12" height="12" fill="#061018" />
      <rect x="44" y="84" width="10" height="10" fill="#061018" />
      <rect x="100" y="60" width="16" height="16" fill="#061018" />
      <rect x="44" y="108" width="16" height="16" fill="#061018" />
      <rect x="100" y="108" width="16" height="16" fill="#061018" />
      <path d="M212 88h56M240 60v56" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </SvgFrame>
  );
}

function RadiusVisual() {
  return (
    <SvgFrame label="نطاق كيلومتر حول نقطة الانطلاق">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <circle cx="160" cy="100" r="72" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="6 4" opacity="0.75" />
      <circle cx="160" cy="100" r="4" fill={accent} />
      <path d="M160 28v144M28 100h264" stroke="#ffffff18" strokeWidth="1" />
      <path d="M160 32v8M160 160v8M32 100h8M280 100h8" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <rect x="132" y="148" width="24" height="14" rx="4" fill={accent} opacity="0.35" />
      <rect x="88" y="72" width="12" height="12" rx="2" fill="#ffffff33" />
      <rect x="200" y="88" width="12" height="12" rx="2" fill="#ffffff33" />
      <rect x="120" y="112" width="12" height="12" rx="2" fill="#ffffff33" />
    </SvgFrame>
  );
}

function DayPrepVisual() {
  return (
    <SvgFrame label="تجهيز جولة اليوم">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <rect x="40" y="120" width="96" height="36" rx="6" fill={accent} opacity="0.25" />
      <circle cx="88" cy="108" r="18" fill={accent} opacity="0.35" />
      <rect x="160" y="48" width="120" height="104" rx="10" fill="#061018" stroke="#ffffff18" />
      <rect x="172" y="64" width="72" height="8" rx="4" fill={accent} opacity="0.5" />
      <rect x="172" y="80" width="96" height="8" rx="4" fill="#ffffff22" />
      <rect x="172" y="96" width="88" height="8" rx="4" fill="#ffffff18" />
      <path d="M148 138h40" stroke={accent} strokeWidth="2" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={accent} />
        </marker>
      </defs>
    </SvgFrame>
  );
}

function FieldSaleVisual() {
  return (
    <SvgFrame label="بيع ميداني وتعريف بالصفحة">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <rect x="48" y="108" width="112" height="48" rx="8" fill={accent} opacity="0.22" />
      <rect x="200" y="56" width="72" height="120" rx="10" fill="#061018" stroke="#ffffff18" />
      <rect x="212" y="120" width="48" height="48" rx="4" fill="#ffffff" fillOpacity="0.9" />
      <path d="M128 132h56" stroke={accent} strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="176" cy="132" r="6" fill={accent} opacity="0.5" />
    </SvgFrame>
  );
}

function CommunityVisual() {
  return (
    <SvgFrame label="نقطة بيع نظامية قرب الحي">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <rect x="56" y="56" width="64" height="48" rx="6" fill="#ffffff14" />
      <rect x="200" y="72" width="64" height="48" rx="6" fill="#ffffff14" />
      <rect x="128" y="128" width="64" height="32" rx="6" fill={accent} opacity="0.3" />
      <circle cx="160" cy="100" r="28" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 3" />
    </SvgFrame>
  );
}

function ReturnCustomerVisual() {
  return (
    <SvgFrame label="عودة الزبون إلى الصفحة">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <path d="M48 140 C96 60, 224 60, 272 140" fill="none" stroke={accent} strokeWidth="2" opacity="0.55" />
      <rect x="36" y="132" width="48" height="32" rx="6" fill={accent} opacity="0.25" />
      <rect x="236" y="132" width="48" height="56" rx="8" fill="#061018" stroke="#ffffff18" />
      <rect x="246" y="148" width="28" height="28" rx="4" fill="#ffffff" fillOpacity="0.88" />
    </SvgFrame>
  );
}

function OrderFlowVisual() {
  return (
    <SvgFrame label="استقبال الطلب وتحديث التوفر">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <rect x="32" y="48" width="256" height="104" rx="12" fill="#061018" stroke="#ffffff18" />
      <rect x="48" y="64" width="96" height="10" rx="5" fill={accent} opacity="0.5" />
      <rect x="48" y="84" width="128" height="8" rx="4" fill="#ffffff22" />
      <rect x="48" y="100" width="112" height="8" rx="4" fill="#ffffff18" />
      <rect x="200" y="72" width="72" height="24" rx="12" fill={accent} opacity="0.35" />
      <path d="M160 168 l16-12 16 12" fill="none" stroke={accent} strokeWidth="2" />
    </SvgFrame>
  );
}

function ReviewVisual() {
  return (
    <SvgFrame label="مراجعة الأداء والتوسع">
      <rect width="320" height="200" rx="16" fill="#0b1a10" stroke={accent} strokeOpacity="0.35" />
      <circle cx="160" cy="100" r="56" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="160" cy="100" r="36" fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M160 44v20M160 136v20M104 100h-20M236 100h-20" stroke="#ffffff22" />
      <circle cx="160" cy="100" r="6" fill={accent} />
    </SvgFrame>
  );
}

export function StoreProduceOpsIllustration({ visual }: { visual: ProduceOpsVisualId }) {
  switch (visual) {
    case 'activation':
      return <ActivationVisual />;
    case 'desk-page':
      return <DeskPageVisual />;
    case 'qr':
      return <QrVisual />;
    case 'radius':
      return <RadiusVisual />;
    case 'day-prep':
      return <DayPrepVisual />;
    case 'field-sale':
      return <FieldSaleVisual />;
    case 'community':
      return <CommunityVisual />;
    case 'return-customer':
      return <ReturnCustomerVisual />;
    case 'order-flow':
      return <OrderFlowVisual />;
    case 'review':
      return <ReviewVisual />;
    default:
      return null;
  }
}
