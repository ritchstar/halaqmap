/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * طبقة إشارات تفاعلية — خلفية كتالوج خريطة الحل.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDownLeft, ArrowUpLeft, Check, Radio, Send } from 'lucide-react';

const signals = [
  {
    id: 'request',
    label: 'طلب',
    detail: 'إشارة بداية تصل من عميل يبحث عن حل واضح.',
    x: '12%',
    y: '24%',
    tone: 'brick',
    icon: Send,
  },
  {
    id: 'review',
    label: 'مراجعة',
    detail: 'يُرتّب الطلب حسب النشاط والمسار المناسب.',
    x: '84%',
    y: '30%',
    tone: 'blue',
    icon: Radio,
  },
  {
    id: 'operate',
    label: 'تشغيل',
    detail: 'ينتقل المنتج من بطاقة الفهرس إلى العمل اليومي.',
    x: '22%',
    y: '78%',
    tone: 'yellow',
    icon: ArrowDownLeft,
  },
  {
    id: 'reach',
    label: 'وصول',
    detail: 'يصل الرابط أو الطلب إلى جوال العميل في اللحظة المناسبة.',
    x: '88%',
    y: '78%',
    tone: 'blue',
    icon: Check,
  },
] as const;

const toneClasses = {
  brick: 'border-[#b84c3a] bg-[#fffaf4] text-[#b84c3a]',
  blue: 'border-[#1d4f69] bg-[#f5f8f8] text-[#1d4f69]',
  yellow: 'border-[#d1a728] bg-[#fffdf2] text-[#8b6a13]',
};

export function CatalogSignalLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [activeSignal, setActiveSignal] = useState<(typeof signals)[number] | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    let animationFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const updateLayer = () => {
      animationFrame = 0;
      const horizontal = pointerX * 6;
      const vertical = pointerY * 4;
      const scrollDepth = Math.min(window.scrollY * 0.035, 28);
      layer.style.setProperty('--signal-x', `${horizontal.toFixed(2)}px`);
      layer.style.setProperty('--signal-y', `${vertical.toFixed(2)}px`);
      layer.style.setProperty('--signal-scroll', `${scrollDepth.toFixed(2)}px`);
    };

    const requestUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateLayer);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
      requestUpdate();
    };

    const handleScroll = () => requestUpdate();

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    requestUpdate();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const layerStyle = {
    '--signal-x': '0px',
    '--signal-y': '0px',
    '--signal-scroll': '0px',
  } as CSSProperties;

  return (
    <div
      ref={layerRef}
      style={layerStyle}
      className="catalog-signal-layer pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-label="مخطط إشارات الطلب الرقمي"
    >
      <svg
        className="catalog-signal-drawing absolute inset-0 h-full w-full opacity-[0.12]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern id="catalog-signal-grid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M120 0H0V120" fill="none" stroke="#1d4f69" strokeWidth="1" strokeOpacity="0.24" />
            <circle cx="0" cy="0" r="3" fill="#b84c3a" fillOpacity="0.3" />
          </pattern>
          <filter id="signal-soften" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.35" />
          </filter>
        </defs>
        <rect width="1440" height="900" fill="url(#catalog-signal-grid)" />
        <g
          fill="none"
          stroke="#1d4f69"
          strokeWidth="2"
          strokeDasharray="7 14"
          strokeOpacity="0.42"
          filter="url(#signal-soften)"
        >
          <path d="M132 214C340 120 520 180 682 322S1010 395 1206 272" />
          <path d="M194 696C406 572 512 588 706 678S1030 800 1258 694" />
          <path d="M1190 150C1082 230 1096 390 1188 516S1206 758 1036 834" />
        </g>
        <g fill="#b84c3a" fillOpacity="0.68">
          <circle cx="132" cy="214" r="5" />
          <circle cx="682" cy="322" r="5" />
          <circle cx="1206" cy="272" r="5" />
          <circle cx="194" cy="696" r="5" />
          <circle cx="706" cy="678" r="5" />
          <circle cx="1258" cy="694" r="5" />
        </g>
        <g fill="none" stroke="#b84c3a" strokeWidth="1" strokeOpacity="0.3">
          <circle cx="132" cy="214" r="22" />
          <circle cx="1206" cy="272" r="30" />
          <circle cx="1258" cy="694" r="20" />
        </g>
      </svg>

      {signals.map((signal) => {
        const Icon = signal.icon;
        const isActive = activeSignal?.id === signal.id;
        return (
          <button
            key={signal.id}
            type="button"
            className={`pointer-events-auto absolute hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 border px-3 py-2 text-[10px] font-bold tracking-[0.12em] shadow-[0_12px_30px_rgba(31,41,51,0.08)] transition-[opacity,transform,background-color] duration-300 ease-out md:flex ${
              toneClasses[signal.tone]
            } ${isActive ? 'scale-105 opacity-100' : 'opacity-70 hover:scale-105 hover:opacity-100'}`}
            style={{ left: signal.x, top: signal.y }}
            onClick={() => setActiveSignal(isActive ? null : signal)}
            aria-label={`عرض تفاصيل إشارة ${signal.label}`}
            aria-pressed={isActive}
          >
            <Icon size={14} strokeWidth={1.6} />
            <span>{signal.label}</span>
            {isActive ? <ArrowUpLeft size={12} strokeWidth={1.6} /> : null}
          </button>
        );
      })}

      {activeSignal ? (
        <div className="pointer-events-auto absolute bottom-7 left-1/2 hidden w-[min(360px,calc(100vw-40px))] -translate-x-1/2 border-[#1d4f69]/20 bg-[#fffaf4]/95 px-4 py-3 text-center text-xs leading-6 text-[#1f2933] shadow-[0_18px_46px_rgba(31,41,51,0.12)] backdrop-blur-sm md:block">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#b84c3a]">
            signal / {activeSignal.label}
          </span>
          <p className="mt-1">{activeSignal.detail}</p>
        </div>
      ) : null}
    </div>
  );
}
