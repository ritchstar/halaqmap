/**
 * صفحة الرئيسية الجديدة — حلاق ماب
 * المسار: / (الرئيسية)
 *
 * الرادار الجغرافي الحيّ + البحث الحقيقي عن الصالونات
 * تصميم تكتيكي داكن · فخامة خليجية · حضور جغرافي
 */

import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MapPin, Scissors, Star, Shield, Search, Zap,
  CheckCircle2, Clock, ArrowLeft, Sparkles,
  Navigation2, ChevronDown, Globe2, Lock,
  Users, Award, Wifi, TrendingUp, Play, X,
  Phone, MessageCircle, Heart, BarChart3, Crown, Menu,
  Building2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTE_PATHS, Barber, FilterState, filterBarbersByDistance } from '@/lib/index';
import { GeoRadarButton } from '@/components/GeoRadarButton';
import { LocationStatusBar } from '@/components/LocationStatusBar';
import { KSACityClocksBar } from '@/components/KSACityClocksBar';
import { RadarShowcaseLink } from '@/components/RadarShowcaseLink';
import { PlatformTlsTrustBadge } from '@/components/PlatformTlsTrustBadge';
import { PlatformAmbientToggle } from '@/components/PlatformAmbientToggle';
import { usePlatformAmbient } from '@/context/PlatformAmbientContext';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { fetchNearbyPublicBarbersFromSupabase } from '@/lib/publicBarbersFromSupabase';
import { toast } from '@/components/ui/sonner';
import { FloatingPlatformActions } from '@/components/FloatingPlatformActions';
import { PlatformAmbientBackground } from '@/components/PlatformAmbientBackground';
import { PlatformVoluntaryEngagementStrip } from '@/components/platformEngagement/PlatformVoluntaryEngagementStrip';
import { LandingAgentPanelBody } from '@/pages/landing/LandingAgentPanelBody';
import { LandingSearchResults } from '@/pages/landing/LandingSearchResults';
import { BarberDetailModal } from '@/components/BarberDetailModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { CyberRadarCanvas } from '@/modules/cyber-radar/components/CyberRadarCanvas';
import type { CyberEvent } from '@/modules/cyber-radar/types';
import { CITY_BEACONS, KSA_VIEWBOX, RIYADH_VIEW } from '@/modules/platform-radar/lib/saudiKingdomGeo';

type LandingAgentPanel = 'media' | 'legal' | null;

// ─── Left Agent Stack — ثلاثة ألسنة يسار ──────────────────────────────────
function LeftAgentStack({
  navigate,
  onOpenPanel,
}: {
  navigate: ReturnType<typeof useNavigate>;
  onOpenPanel: (panel: Exclude<LandingAgentPanel, null>) => void;
}) {
  const agents = [
    {
      id: 'spokesperson',
      emoji: '🎙️',
      label: 'المتحدث',
      title: 'المتحدث الإعلامي',
      accentFrom: '#0e1e3a',
      accentTo: '#0ea5e9',
      border: 'rgba(14,165,233,0.42)',
      glow: 'rgba(14,165,233,0.28)',
      dot: '#38bdf8',
      onClick: () => onOpenPanel('media'),
    },
    {
      id: 'legal',
      emoji: '⚖️',
      label: 'الناظر',
      title: 'الناظر القانوني',
      accentFrom: '#1c1408',
      accentTo: '#c9a227',
      border: 'rgba(201,162,39,0.42)',
      glow: 'rgba(201,162,39,0.22)',
      dot: '#fbbf24',
      onClick: () => onOpenPanel('legal'),
    },
    {
      id: 'saudi',
      emoji: '🇸🇦',
      label: 'سعودي',
      title: 'سعودي — الوكيل الذكي',
      accentFrom: '#0b2e14',
      accentTo: '#22913f',
      border: 'rgba(34,145,63,0.42)',
      glow: 'rgba(201,162,39,0.18)',
      dot: '#4ade80',
      onClick: () => navigate(ROUTE_PATHS.SAUDI_AGENT),
    },
  ];

  return (
    <motion.div
      className="pointer-events-none fixed left-0 z-[48] hidden sm:flex flex-col items-start gap-2"
      style={{ top: '36%', transform: 'translateY(-50%)' }}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 280, damping: 26 }}
    >
      {agents.map((agent, i) => (
        <motion.button
          key={agent.id}
          type="button"
          onClick={agent.onClick}
          whileHover={{ x: 5, scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3 + i * 0.12, type: 'spring', stiffness: 300, damping: 28 }}
          className="pointer-events-auto group relative flex flex-col items-center gap-1.5 py-3 px-2.5"
          style={{
            background: `linear-gradient(180deg,${agent.accentFrom} 0%,${agent.accentFrom}ee 50%,${agent.accentFrom} 100%)`,
            border: `1.5px solid ${agent.border}`,
            borderRight: 'none',
            borderRadius: '0 0 0 14px',
            boxShadow: `4px 0 20px ${agent.glow},0 0 10px ${agent.glow}`,
          }}
          title={agent.title}
        >
          {/* توهج نبضي */}
          <motion.span
            className="pointer-events-none absolute inset-0"
            style={{ background: `${agent.accentTo}08`, borderRadius: 'inherit' }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
          />
          {/* الإيموجي */}
          <span
            className="relative z-10 text-lg leading-none"
            style={{ filter: `drop-shadow(0 0 5px ${agent.accentTo}90)` }}
          >
            {agent.emoji}
          </span>
          {/* نقطة حية */}
          <motion.span
            className="relative z-10 h-1.5 w-1.5 rounded-full"
            style={{ background: agent.dot, boxShadow: `0 0 5px ${agent.dot}` }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }}
          />
          {/* تسمية عمودية */}
          <span
            className="relative z-10 text-[0.5rem] font-black tracking-widest transition-colors"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              color: `${agent.accentTo}aa`,
            }}
          >
            {agent.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

function LandingAgentPanel({
  activePanel,
  onClose,
}: {
  activePanel: LandingAgentPanel;
  onClose: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      {activePanel ? (
        <motion.div
          key={activePanel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[56]"
        >
          <button
            type="button"
            aria-label="إغلاق اللوحة"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            dir="rtl"
            initial={{ opacity: 0, x: -24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto fixed left-12 top-1/2 z-[1] w-[min(92vw,560px)] -translate-y-1/2"
          >
            <button
              type="button"
              onClick={onClose}
              className="mb-2 rounded-xl border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-bold text-slate-300 backdrop-blur-md hover:text-white"
            >
              إغلاق
            </button>
            <LandingAgentPanelBody panel={activePanel} />
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

// ─── Animated counter ──────────────────────────────────────────────────────
function useCounter(end: number, duration = 1800, enabled = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let current = 0;
    const step = end / (duration / 16);
    const t = setInterval(() => {
      current += step;
      if (current >= end) { setCount(end); clearInterval(t); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(t);
  }, [end, duration, enabled]);
  return count;
}

// ─── Simulated radar beacons ────────────────────────────────────────────────
const DEMO_BEACONS = [
  { id: 1, x: 52, y: 38, name: 'صالون الرياض الذهبي', rating: 4.9, tier: 'diamond', open: true },
  { id: 2, x: 38, y: 55, name: 'حلاق الحي الراقي', rating: 4.7, tier: 'gold', open: true },
  { id: 3, x: 64, y: 62, name: 'ستايل برو للرجال', rating: 4.8, tier: 'diamond', open: true },
  { id: 4, x: 45, y: 42, name: 'الحلاق الكلاسيكي', rating: 4.5, tier: 'bronze', open: false },
  { id: 5, x: 70, y: 45, name: 'برباشوب العاصمة', rating: 4.6, tier: 'gold', open: true },
  { id: 6, x: 30, y: 70, name: 'صالون الفنان', rating: 4.4, tier: 'bronze', open: true },
];

const TIER_COLOR: Record<string, string> = {
  diamond: '#67e8f9',
  gold: '#fbbf24',
  bronze: '#cd7f32',
};

const HERO_CITY_ROUTE_OVERRIDES: Record<string, { x: number; y: number }> = {
  // Override Najran to the exact visual node used in the hero radar composition.
  'نجران': {
    x: (64 / 100) * KSA_VIEWBOX.width,
    y: (62 / 100) * KSA_VIEWBOX.height,
  },
};

// ─── Radar canvas ───────────────────────────────────────────────────────────
function RadarHero({ onBeaconClick }: { onBeaconClick: (id: number) => void }) {
  const cityFlowEvents = useMemo<CyberEvent[]>(() => {
    const byName = new Map(
      CITY_BEACONS.map((city) => [
        city.nameAr,
        HERO_CITY_ROUTE_OVERRIDES[city.nameAr] ?? city.view,
      ] as const),
    );
    const routes = [
      ['جدة', 'الرياض'],
      ['الدمام', 'الرياض'],
      ['المدينة', 'الدمام'],
      ['تبوك', 'الرياض'],
      ['حائل', 'الدمام'],
      ['جازان', 'مكة'],
      ['أبها', 'جدة'],
      ['أبها', 'الرياض'],
      ['أبها', 'الأحساء'],
      ['الرياض', 'أبها'],
      ['جدة', 'أبها'],
      ['الأحساء', 'أبها'],
      ['خميس مشيط', 'الرياض'],
      ['خميس مشيط', 'جدة'],
      ['الرياض', 'خميس مشيط'],
      ['الباحة', 'الرياض'],
      ['الخبر', 'المدينة'],
      ['ينبع', 'الرياض'],
      ['بريدة', 'جدة'],
      ['نجران', 'الرياض'],
      ['الجبيل', 'أبها'],
      ['الطائف', 'الدمام'],
      ['الأحساء', 'المدينة'],
      ['عرعر', 'الرياض'],
      ['سكاكا', 'الدمام'],
      ['حفر الباطن', 'الرياض'],
      ['تبوك', 'جدة'],
      ['سكاكا', 'المدينة'],
      ['عرعر', 'حائل'],
      ['جازان', 'الرياض'],
      ['نجران', 'جدة'],
      ['الباحة', 'جدة'],
      ['جازان', 'الدمام'],
    ] as const;

    return routes.flatMap(([from, to], idx) => {
        const source = byName.get(from);
        const target = byName.get(to);
        if (!source || !target) return [];
        const isSouthPriority = from === 'أبها' || from === 'خميس مشيط' || from === 'نجران';
        return [{
          id: `hero-flow-${from}-${to}-${idx}`,
          kind: (isSouthPriority
            ? idx % 2 === 0
              ? 'visit_external'
              : 'registration'
            : idx % 4 === 0
              ? 'visit_external'
              : idx % 4 === 1
                ? 'registration'
                : idx % 4 === 2
                  ? 'visit_internal'
                  : 'defence_action') as CyberEvent['kind'],
          severity: isSouthPriority ? 'critical' : idx % 3 === 0 ? 'elevated' : 'info',
          source,
          target,
          description: `نبضة رادارية — ${from} → ${to}`,
          originLabelAr: from,
          timestamp: new Date(Date.now() - idx * 35_000).toISOString(),
          lifetimeMs: 8200,
          volume: isSouthPriority ? 5 : idx % 2 === 0 ? 3 : 2,
        } satisfies CyberEvent];
      });
  }, []);

  const cyberEvents = useMemo<CyberEvent[]>(() => (
    [
      ...DEMO_BEACONS.map((b, idx) => {
      const x = (b.x / 100) * KSA_VIEWBOX.width;
      const y = (b.y / 100) * KSA_VIEWBOX.height;
      return {
        id: `hero-cyber-${b.id}-${idx}`,
        kind: b.open ? 'visit_internal' : 'threat_probe',
        severity: b.open ? 'info' : 'elevated',
        source: { x, y },
        target: b.open ? undefined : RIYADH_VIEW,
        description: b.name,
        originLabelAr: b.name,
        timestamp: new Date().toISOString(),
        lifetimeMs: 6000,
        volume: b.open ? 1 : 2,
      } satisfies CyberEvent;
      }),
      ...cityFlowEvents,
    ]
  ), [cityFlowEvents]);

  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-2xl" style={{ fontFamily: 'system-ui' }}>
      <CyberRadarCanvas pulses={cyberEvents} narrator={null} showOrnaments={false} className="h-full w-full" />

      {/* Interactive barber hotspots on top of cyber radar */}
      {DEMO_BEACONS.map((b) => (
        <button
          key={b.id}
          type="button"
          aria-label={b.name}
          onClick={() => onBeaconClick(b.id)}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/45 transition-transform hover:scale-110"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: '11px',
            height: '11px',
            background: TIER_COLOR[b.tier],
            boxShadow: `0 0 0 3px ${TIER_COLOR[b.tier]}33, 0 0 16px ${TIER_COLOR[b.tier]}77`,
          }}
        >
          {!b.open ? (
            <span
              className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white/70"
              aria-hidden
            />
          ) : null}
        </button>
      ))}
    </div>
  );
}

// ─── Floating barber card ────────────────────────────────────────────────────
function BarberPopup({ beacon, onClose }: { beacon: typeof DEMO_BEACONS[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute left-1/2 top-1/4 z-20 w-56 -translate-x-1/2 rounded-2xl border border-white/15 bg-[#0a1628]/90 p-4 shadow-2xl backdrop-blur-xl"
      dir="rtl"
    >
      <button type="button" onClick={onClose} aria-label="إغلاق" className="absolute left-2 top-2 rounded-full bg-white/10 p-1 text-white/60 hover:text-white">
        <X className="h-3 w-3" />
      </button>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/30 to-teal-800/30 text-xl">
          ✂️
        </div>
        <div>
          <div className="text-[0.75rem] font-bold text-white">{beacon.name}</div>
          <div className="flex items-center gap-1">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[0.65rem] text-amber-300">{beacon.rating}</span>
            <span className={`ms-1 rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold ${beacon.open ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {beacon.open ? 'مفتوح' : 'مغلق'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => document.getElementById('search-anchor')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-teal-500/20 px-2 py-1.5 text-[0.65rem] font-semibold text-teal-200 hover:bg-teal-500/35 transition-colors"
        >
          <Navigation2 className="h-3 w-3" /> ابحث قريبك
        </button>
        <button
          onClick={() => document.getElementById('search-anchor')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1.5 text-[0.65rem] font-semibold text-emerald-200 hover:bg-emerald-500/35 transition-colors"
        >
          <Phone className="h-3 w-3" /> تواصل
        </button>
      </div>
    </motion.div>
  );
}

// ─── Stats counter strip ─────────────────────────────────────────────────────
function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const cities = useCounter(47, 1600, inView);
  const salons = useCounter(2300, 1800, inView);
  const searches = useCounter(18000, 2000, inView);
  const rating = useCounter(97, 1400, inView);

  const stats = [
    { icon: MapPin, value: cities, suffix: '+', label: 'مدينة سعودية', color: 'text-teal-400' },
    { icon: Scissors, value: salons, suffix: '+', label: 'صالون مسجّل', color: 'text-amber-400' },
    { icon: Search, value: searches, suffix: '+', label: 'بحث شهرياً', color: 'text-cyan-400' },
    { icon: Heart, value: rating, suffix: '%', label: 'رضا المستخدمين', color: 'text-rose-400' },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
        >
          <s.icon className={`h-6 w-6 ${s.color}`} />
          <div className={`text-3xl font-black tabular-nums ${s.color}`}>
            {s.value.toLocaleString('ar-SA')}{s.suffix}
          </div>
          <div className="text-center text-xs text-white/88 [text-shadow:0_0_10px_rgba(255,255,255,0.12)]">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Feature card ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay = 0, size = 'normal' }: {
  icon: typeof MapPin; title: string; desc: string;
  color: string; delay?: number; size?: 'normal' | 'wide' | 'tall';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d1b2e] to-[#060d1a] p-5 transition-all duration-300 hover:border-white/20 hover:shadow-xl
        ${size === 'wide' ? 'md:col-span-2' : ''}
        ${size === 'tall' ? 'md:row-span-2' : ''}
      `}
    >
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} p-0.5`}>
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#060d1a]">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <h3 className="mb-1.5 text-base font-bold text-white [text-shadow:0_0_12px_rgba(255,255,255,0.10)]">{title}</h3>
      <p className="text-sm leading-relaxed text-white/88 [text-shadow:0_0_14px_rgba(255,255,255,0.14)]">{desc}</p>
      <div className={`absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />
    </motion.div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function LandingPreview() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const skipHeroMotion = reduceMotion || isMobile;
  const { effectivePhase, control } = usePlatformAmbient();
  const [selectedBeacon, setSelectedBeacon] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ── Real barber search state ────────────────────────────────────────
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [remoteBarbers, setRemoteBarbers] = useState<Barber[]>([]);
  const [remoteStatus, setRemoteStatus] = useState<'unused' | 'loading' | 'ready' | 'error'>('unused');
  const [filters, setFilters] = useState<FilterState>({ maxDistance: 5, tiers: [], openNow: false, minRating: 0, categories: [] });
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [activeAgentPanel, setActiveAgentPanel] = useState<LandingAgentPanel>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [deferMobileExtras, setDeferMobileExtras] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 768,
  );

  useEffect(() => {
    if (!isMobile) {
      setDeferMobileExtras(true);
      return;
    }
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setDeferMobileExtras(true);
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(enable, { timeout: 2200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(enable, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [isMobile]);

  const filteredBarbers = useMemo(() => {
    if (!userLocation) return [];
    return filterBarbersByDistance(remoteBarbers, userLocation, filters);
  }, [userLocation, filters, remoteBarbers]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !userLocation) { setRemoteBarbers([]); setRemoteStatus('unused'); return; }
    let cancelled = false;
    setRemoteStatus('loading');
    void (async () => {
      try {
        const list = await fetchNearbyPublicBarbersFromSupabase({ userLocation, radiusKm: Math.max(5, filters.maxDistance), limit: 120, minRating: filters.minRating, tiers: filters.tiers });
        if (!cancelled) { setRemoteBarbers(list); setRemoteStatus('ready'); }
      } catch {
        if (!cancelled) { setRemoteStatus('error'); toast.error('تعذّر تحميل نتائج القرب — تحقق من الاتصال.'); }
      }
    })();
    return () => { cancelled = true; };
  }, [userLocation, filters.maxDistance, filters.minRating, filters.tiers]);

  const handleLocationDetected = useCallback((loc: { lat: number; lng: number }) => {
    startTransition(() => {
      setUserLocation(loc);
    });
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    const scrollTimer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }, 500);
    return () => window.clearTimeout(scrollTimer);
  }, [userLocation]);

  const onBarberPatch = useCallback((patch: { id: string; isOpen: boolean; lat?: number; lng?: number }) => {
    setRemoteBarbers((prev) => {
      const idx = prev.findIndex((b) => b.id === patch.id);
      if (idx < 0) return prev;
      const next = [...prev];
      const cur = next[idx];
      next[idx] = { ...cur, isOpen: patch.isOpen, location: patch.lat != null ? { ...cur.location, lat: patch.lat!, lng: patch.lng! } : cur.location };
      return next;
    });
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const beacon = selectedBeacon ? DEMO_BEACONS.find((b) => b.id === selectedBeacon) : null;

  return (
    <div
      dir="rtl"
      className="platform-dark platform-ambient relative min-h-screen overflow-x-hidden bg-background font-[Tajawal,system-ui] text-slate-100"
      data-ambient-phase={effectivePhase}
      data-ambient-control={control}
    >

      {/* شريط موقع المستخدم */}
      {userLocation && <LocationStatusBar lat={userLocation.lat} lng={userLocation.lng} />}

      {deferMobileExtras ? <FloatingPlatformActions /> : null}

      {deferMobileExtras ? (
        <>
          <LeftAgentStack navigate={navigate} onOpenPanel={setActiveAgentPanel} />
          <LandingAgentPanel
            activePanel={activeAgentPanel}
            onClose={() => setActiveAgentPanel(null)}
          />
        </>
      ) : null}


      {/* ── Grid background texture ──────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {deferMobileExtras ? <PlatformAmbientBackground variant="default" /> : null}

      {/* ══════════════════════════════════════════════════════════════════
          الهيدر الموحّد — شريط المدن + التنقل الرئيسي
          ══════════════════════════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-500">

        {/* ── طبقة الخلفية الزجاجية ──────────────────────── */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          scrolled
            ? 'bg-[#020912]/96 backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.6)]'
            : 'bg-[#020912]/85 backdrop-blur-xl'
        }`} />

        {/* ── شريط مدن المملكة ───────────────────────────── */}
        <div className="relative border-b border-teal-400/10">
          {!isMobile || deferMobileExtras ? <KSACityClocksBar /> : null}
        </div>

        {/* ── التنقل الرئيسي ─────────────────────────────── */}
        <div className="relative">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3">

            {/* ── الشعار (يمين في RTL) ────────── */}
            <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-3 no-underline">
              {/* أيقونة المقص الدوّارة */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-700/20 blur-sm" />
                <motion.div
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-teal-400/30 bg-gradient-to-br from-[#0d2a28] to-[#020912] shadow-[0_0_20px_rgba(20,184,166,0.25),inset_0_1px_0_rgba(45,212,191,0.15)]"
                  whileHover={{ scale: 1.08, rotate: 15 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Scissors className="h-4 w-4 text-teal-300" />
                </motion.div>
              </div>

              {/* اسم المنصة */}
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[1.19rem] font-black tracking-wide text-white">حلاق ماب</span>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-teal-400"
                  />
                </div>
                <div className="text-[0.6rem] font-bold tracking-[0.3em] text-teal-400/55">HALAQ MAP · LIVE</div>
              </div>

              {/* عدد الصالونات النشطة */}
              <div className="hidden items-center gap-1 rounded-full border border-teal-400/20 bg-teal-500/8 px-2.5 py-1 sm:flex">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                />
                <span className="text-[0.69rem] font-bold text-emerald-300/80">رادار نشط</span>
              </div>
            </Link>

            {/* ── روابط التنقل (للمستخدمين فقط) ── */}
            <nav className="hidden items-center gap-1 md:flex" dir="rtl">
              {[
                { label: 'كيف يعمل', icon: Navigation2, id: 'كيف يعمل' },
                { label: 'المميزات',  icon: Sparkles,   id: 'المميزات' },
                { label: 'الأسعار',  icon: Crown,      id: 'الأسعار' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="group flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[0.98rem] font-semibold text-white/82 [text-shadow:0_0_10px_rgba(255,255,255,0.10)] transition-all duration-200 hover:bg-teal-500/8 hover:text-teal-200 cursor-pointer"
                >
                  <item.icon className="h-3.5 w-3.5 text-teal-500/50 transition-colors group-hover:text-teal-400" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* ── زر البحث + أيقونة B2B مُدمَجة ── */}
            <div className="flex items-center gap-2">
              <PlatformAmbientToggle variant="partner" className="hidden md:inline-flex" />

              {/* زر البحث */}
              <motion.button
                onClick={() => {
                  const el = document.getElementById('search-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 px-4 py-2.5 text-[0.94rem] font-black text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]"
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-l from-transparent via-white/15 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                />
                <span className="relative flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">ابحث عن حلاق</span>
                  <span className="sm:hidden">بحث</span>
                </span>
              </motion.button>

              {/* ── فاصل رفيع ── */}
              <div className="hidden h-6 w-px bg-white/12 md:block" />

              <RadarShowcaseLink variant="showcase" className="hidden shrink-0 md:inline-flex" />

              {/* ── أيقونة B2B — للمنشآت والصالونات ── */}
              <Link
                to={ROUTE_PATHS.BARBERS_LANDING}
                title="مسار الخدمات التسويقية للمنشآت — B2B"
                className="group relative hidden h-9 w-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/8 text-amber-400/70 transition-all hover:border-amber-400/50 hover:bg-amber-500/15 hover:text-amber-300 md:flex"
                aria-label="مسار الشركاء B2B"
              >
                <Building2 className="h-4 w-4" />
                {/* شارة B2B صغيرة */}
                <span className="absolute -bottom-1.5 -left-1 rounded-full bg-amber-500 px-1 py-0 text-[0.53rem] font-black leading-tight tracking-wider text-black">
                  B2B
                </span>
              </Link>

              {/* زر القائمة — موبايل */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 md:hidden"
                aria-label="القائمة"
              >
                {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* ── خط التوهج السفلي ───────────────── */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
        </div>

        {/* ── قائمة الموبايل المنسدلة ─────────────── */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="relative overflow-hidden border-t border-white/8 bg-[#020912]/98 md:hidden"
            >
              <nav className="flex flex-col gap-1 px-5 py-4" dir="rtl">
                <div className="mb-2 flex justify-center">
                  <PlatformAmbientToggle variant="partner" />
                </div>
                <div className="mb-4 flex justify-center">
                  <RadarShowcaseLink variant="showcase" />
                </div>
                {[
                  { label: 'كيف يعمل', sectionId: 'كيف يعمل' },
                  { label: 'المميزات', sectionId: 'المميزات' },
                  { label: 'الأسعار', sectionId: 'الأسعار' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      setTimeout(() => document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
                    }}
                    className="rounded-xl px-4 py-3 text-right text-[1.09rem] font-medium text-slate-300 hover:bg-white/5 hover:text-teal-300 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                {[
                  { label: 'للمنشآت B2B', to: ROUTE_PATHS.BARBERS_LANDING },
                  { label: 'طلب ضيافة B2B (فنادق/شقق)', to: ROUTE_PATHS.HOSPITALITY_B2B_REQUEST },
                  { label: 'آراء المستخدمين', to: ROUTE_PATHS.PLATFORM_REVIEWS },
                  { label: 'معاينة الرصد الذكي', to: ROUTE_PATHS.RADAR_SHOWCASE },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-xl px-4 py-3 text-[1.09rem] font-medium text-slate-300 hover:bg-white/5 hover:text-teal-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => { setMobileNavOpen(false); document.getElementById('search-anchor')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="mt-2 w-full rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 py-3 text-[1.09rem] font-bold text-white"
                >
                  ابحث عن حلاق الآن
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] overflow-hidden pt-24">
        {/* Anchor للبحث */}
        <div id="search-anchor" className="absolute top-32" />

        {/* Glow blobs */}
        <div className="pointer-events-none absolute -right-64 top-10 h-[600px] w-[600px] rounded-full bg-teal-500/8 blur-[140px]" />
        <div className="pointer-events-none absolute -left-48 bottom-20 h-[400px] w-[400px] rounded-full bg-amber-500/6 blur-[120px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* Left — text */}
          <motion.div
            initial={skipHeroMotion ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: skipHeroMotion ? 0 : 0.7, ease: 'easeOut' }}
          >
            <motion.div
              initial={skipHeroMotion ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: skipHeroMotion ? 0 : 0.2 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300"
            >
              <Sparkles className="h-3 w-3" />
              نظام الاستجابة الذكية · On-Demand Visibility
            </motion.div>

            <h1 className="mb-6 text-[clamp(2.4rem,5.5vw,4rem)] font-black leading-[1.1] text-white">
              حلاقك المثالي
              <span className="block bg-gradient-to-l from-teal-300 to-cyan-400 bg-clip-text text-transparent">
                في محيطك الآن
              </span>
            </h1>

            <p className="mb-6 max-w-lg text-base leading-relaxed text-white/88 [text-shadow:0_0_14px_rgba(255,255,255,0.14)]">
              رادار جغرافي ذكي يكشف لك أقرب الصالونات المتاحة فور بحثك —
              بيانات حقيقية، تقييمات موثوقة، وتواصل مباشر بدون وسيط.
            </p>

            <motion.div
              initial={skipHeroMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: skipHeroMotion ? 0 : 0.35 }}
              className="mb-8 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-4"
            >
              <RadarShowcaseLink variant="showcase" />
              <p className="max-w-xs text-[0.78rem] leading-relaxed text-white/82 [text-shadow:0_0_12px_rgba(255,255,255,0.12)]">
                استعرض رادار الرصد الحي — نبض الطلب على{' '}
                <span className="font-semibold text-cyan-400/90">٤٧ مدينة</span>{' '}
                في المملكة
              </p>
            </motion.div>

            {/* الرادار الجغرافي — أيقونة تحديد الموقع الرئيسية */}
            <div className="mb-8 flex w-full flex-col items-center gap-4">
              <GeoRadarButton
                onLocationDetected={handleLocationDetected}
                onLocationReset={() => setUserLocation(null)}
              />
              {userLocation && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 rounded-2xl border border-teal-400/30 bg-teal-500/10 px-5 py-2.5 text-sm font-semibold text-teal-200 hover:bg-teal-500/20 transition-all"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                  {remoteStatus === 'loading'
                    ? 'جاري البحث عن صالونات قريبة…'
                    : filteredBarbers.length > 0
                      ? `${filteredBarbers.length} صالون في محيطك — اعرض النتائج ↓`
                      : 'اعرض نتائج الرادار ↓'}
                </motion.button>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 text-[0.75rem] text-white/84 [text-shadow:0_0_10px_rgba(255,255,255,0.10)]">
              {[
                { icon: Shield, text: 'صالونات موثّقة رسمياً' },
                { icon: MapPin, text: '47+ مدينة سعودية' },
                { icon: Star, text: 'تقييمات حقيقية' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <b.icon className="h-3.5 w-3.5 text-teal-400" />
                  <span>{b.text}</span>
                </div>
              ))}
              <PlatformTlsTrustBadge variant="compact" tone="dark" />
            </div>
          </motion.div>

          {/* Right — Radar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-[440px]">
              {/* Radar frame */}
              <div className="relative overflow-hidden rounded-3xl border border-teal-400/20 bg-[#030d1a] p-1 shadow-2xl shadow-teal-500/10">
                <div className="rounded-2xl bg-[#060d1a] p-3 pb-0">
                  {/* Top bar */}
                  <div className="mb-3 flex items-center justify-between px-2">
                    <div className="flex items-center gap-1.5 text-[0.65rem] text-teal-400">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                      رصد حَيّ
                    </div>
                    <div className="text-[0.6rem] tabular-nums text-white/78 [text-shadow:0_0_8px_rgba(255,255,255,0.10)]">
                      {DEMO_BEACONS.filter((b) => b.open).length} صالون متاح
                    </div>
                  </div>

                  {/* Radar canvas */}
                  <div className="relative aspect-square w-full">
                    <RadarHero onBeaconClick={setSelectedBeacon} />
                    <AnimatePresence>
                      {beacon && (
                        <BarberPopup beacon={beacon} onClose={() => setSelectedBeacon(null)} />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom info strip */}
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <div className="flex flex-1 items-center justify-around text-[0.65rem] text-white/82 [text-shadow:0_0_10px_rgba(255,255,255,0.10)]">
                    {Object.entries(TIER_COLOR).map(([t, c]) => (
                      <div key={t} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                        <span className="capitalize">{t === 'diamond' ? 'ماسي' : t === 'gold' ? 'ذهبي' : 'برونزي'}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span>مغلق</span>
                    </div>
                  </div>
                  <RadarShowcaseLink variant="showcase" className="hidden scale-[0.88] origin-left sm:inline-flex lg:scale-100" />
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 top-10 rounded-xl border border-amber-400/30 bg-[#0a1628]/90 px-3 py-2 shadow-lg shadow-amber-500/10 backdrop-blur-md"
              >
                <div className="text-[0.6rem] text-white/84 [text-shadow:0_0_10px_rgba(255,255,255,0.10)]">أقرب صالون</div>
                <div className="text-[0.75rem] font-bold text-amber-300">٢٠٠م منك 🧭</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute -right-4 bottom-16 rounded-xl border border-emerald-400/30 bg-[#0a1628]/90 px-3 py-2 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-1 text-[0.6rem] text-emerald-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  مفتوح الآن
                </div>
                <div className="flex items-center gap-1 text-[0.75rem] font-bold text-white">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> ٤.٩
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-teal-400/50"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* ── نتائج البحث الحقيقية — تظهر بعد تحديد الموقع ─────────────── */}
      {userLocation ? (
        <div
          ref={resultsRef}
          className="relative z-10 border-y border-teal-400/15 bg-[#020912]"
        >
          <LandingSearchResults
            userLocation={userLocation}
            filters={filters}
            onFilterChange={setFilters}
            filteredBarbers={filteredBarbers}
            remoteStatus={remoteStatus}
            onBarberPatch={onBarberPatch}
            onSelectBarber={setSelectedBarber}
          />
          <div className="mx-auto max-w-4xl px-5 pb-10">
            <PlatformVoluntaryEngagementStrip variant="compact" />
          </div>
        </div>
      ) : null}

      {selectedBarber ? (
        <BarberDetailModal
          barber={selectedBarber}
          isOpen
          onClose={() => setSelectedBarber(null)}
        />
      ) : null}

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-14">
        <div className="mx-auto max-w-4xl px-5">
          <StatsStrip />
        </div>
      </section>

      {!userLocation ? (
        <section className="relative z-10 px-5 py-10">
          <div className="mx-auto max-w-4xl">
            <PlatformVoluntaryEngagementStrip />
          </div>
        </section>
      ) : null}

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="كيف يعمل" className="relative z-10 py-24">
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-14 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300"
            >
              <Zap className="h-3 w-3" /> بسيط وسريع
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-black text-white md:text-4xl"
            >
              ٣ خطوات للوصول لحلاقك
            </motion.h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '١',
                icon: Navigation2,
                title: 'شارك موقعك',
                desc: 'اضغط «ابحث في محيطي» ويرصد الرادار الصالونات المتاحة حولك فوراً — لا تسجيل مسبق مطلوب.',
                color: 'from-teal-500 to-cyan-500',
                delay: 0,
              },
              {
                step: '٢',
                icon: Search,
                title: 'استكشف النتائج',
                desc: 'اطّلع على تفاصيل كل صالون: موقعه، أوقات عمله، صوره، تقييماته، وحالته الآن.',
                color: 'from-amber-500 to-orange-500',
                delay: 0.12,
              },
              {
                step: '٣',
                icon: Phone,
                title: 'تواصل مباشرة',
                desc: 'اتّصل أو واتساب مباشرة بالصالون — العلاقة بينك وبينه، المنصة مجرد وسيلة اكتشاف.',
                color: 'from-violet-500 to-purple-500',
                delay: 0.24,
              },
            ].map((step) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: step.delay, duration: 0.5 }}
                className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} font-black text-white shadow-lg`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className={`absolute left-5 top-5 text-[2.5rem] font-black leading-none opacity-10 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                  {step.step}
                </div>
                <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/86 [text-shadow:0_0_12px_rgba(255,255,255,0.12)]">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <button
              onClick={() => document.getElementById('search-anchor')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 px-8 py-3.5 font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-teal-600"
            >
              <Navigation2 className="h-4 w-4" />
              ابحث عن حلاق الآن
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Features bento ───────────────────────────────────────────────── */}
      <section id="المميزات" className="relative z-10 py-20">
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-black text-white md:text-4xl"
            >
              تقنية لا مثيل لها
              <span className="mt-2 block text-lg font-normal text-white/90 [text-shadow:0_0_14px_rgba(255,255,255,0.16)]">
                مُصمَّمة خصيصاً لسوق الحلاقة السعودي
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <RadarShowcaseLink variant="showcase" />
            <p className="max-w-md text-center text-sm leading-relaxed text-white/85 [text-shadow:0_0_12px_rgba(255,255,255,0.14)] sm:text-right">
              افتح رادار الرصد — خريطة حية لنبض الطلب والربط الجغرافي على مستوى المملكة
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Wifi}
              title="رصد حَيّ لحظي"
              desc="كل اتصال بالمنصة يظهر على الرادار فوراً — سواء كان بحثاً عن صالون أو تصفحاً للموقع."
              color="from-teal-500 to-cyan-500"
              delay={0}
              size="wide"
            />
            <FeatureCard
              icon={MapPin}
              title="دقة الموقع الجغرافي"
              desc="خوارزمية بحث تعتمد على المسافة الفعلية، لا الدوائر العامة."
              color="from-cyan-500 to-blue-500"
              delay={0.08}
            />
            <FeatureCard
              icon={Star}
              title="تقييمات موثّقة"
              desc="لا تقييم دون زيارة مؤكدة — نظام منع التقييم الوهمي مُدمج."
              color="from-amber-500 to-yellow-500"
              delay={0.16}
            />
            <FeatureCard
              icon={Clock}
              title="حالة مفتوح / مغلق"
              desc="الصالون يضبط أوقاته لحظياً — الزبون يعرف قبل ما يتنقل."
              color="from-emerald-500 to-green-500"
              delay={0.08}
            />
            <FeatureCard
              icon={Shield}
              title="الأمان والخصوصية"
              desc="بياناتك محمية بأعلى معايير PDPL السعودية — اتصال HTTPS/TLS بتقييم SSL Labs A+. لا مشاركة دون إذن."
              color="from-violet-500 to-purple-500"
              delay={0.16}
            />
            <FeatureCard
              icon={BarChart3}
              title="تحليلات ذكية"
              desc="الحلاق يرى إحصاءات صالونه: كم بحث عنه، من أي حي، وفي أي وقت."
              color="from-rose-500 to-pink-500"
              delay={0.24}
              size="wide"
            />
          </div>
        </div>
      </section>

      {/* ── بانر الحتمية — وصول المنصة مسألة وقت ────────────────────────── */}
      <section dir="rtl" className="relative z-10 overflow-hidden border-y border-white/5 bg-gradient-to-l from-cyan-950/40 via-[#020c18] to-amber-950/30 py-5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-cyan-400/5 to-transparent" />
          <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-amber-400/5 to-transparent" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto flex max-w-4xl flex-col items-center gap-3 px-5 text-center sm:flex-row sm:justify-between sm:text-right"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-sm font-bold text-white/90 leading-snug">
              وصول حلاق ماب للمستخدمين{' '}
              <span className="bg-gradient-to-l from-amber-300 to-cyan-300 bg-clip-text font-black text-transparent">
                مسألة وقت
              </span>
            </p>
          </div>
          <p className="max-w-sm text-[0.72rem] leading-relaxed text-white/84 [text-shadow:0_0_12px_rgba(255,255,255,0.12)]">
            الحلاقة حاجة متكررة غير قابلة للإلغاء — السؤال الوحيد: هل سيكون صالونك في القائمة حين يبحث عنك الزبون؟
          </p>
        </motion.div>
      </section>

      {/* ── عروض التأسيس السنوية ─────────────────────────────────────────── */}
      <FoundingOffersSection navigate={navigate} />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-5">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 text-center text-2xl font-black text-white"
          >
            أسئلة شائعة
          </motion.h2>
          <div className="flex flex-col gap-3">
            {[
              {
                q: 'كيف يعمل الرادار في حلاق ماب؟',
                a: 'الرادار يرصد الصالونات المسجّلة في محيطك الجغرافي ويعرضها لك فوراً بناءً على موقعك — كلما قلّت المسافة زادت الأولوية. لا تسجيل مسبق للبحث.',
              },
              {
                q: 'هل الخدمة مجانية للمستخدمين؟',
                a: 'نعم — البحث عن الصالونات واستعراض بياناتها وتواصلك معها مباشرة مجاني بالكامل دون أي رسوم.',
              },
              {
                q: 'كيف أعرف أن الصالون موثوق؟',
                a: 'الصالونات المعروضة لها رخصة نفاذ رقمية موثّقة — تجد التقييمات الحقيقية وصور الصالون والحالة الفعلية (مفتوح/مغلق) في وقت بحثك.',
              },
              {
                q: 'هل يمكنني تحديد المسافة التي أبحث فيها؟',
                a: 'نعم — يمكنك ضبط نطاق البحث من 1 كم إلى 20 كم حسب حاجتك، مع فلاتر إضافية للتقييم ونوع الخدمة.',
              },
              {
                q: 'هل الخدمة متاحة خارج الرياض؟',
                a: 'نعم، تغطي المنصة حالياً 47+ مدينة سعودية وتتوسع بشكل مستمر لتشمل كامل المملكة.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-right text-sm font-semibold text-slate-200 hover:text-white"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform text-teal-400 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i ? (
                  <div>
                    <p className="border-t border-white/8 px-5 py-4 text-sm leading-relaxed text-white/86 [text-shadow:0_0_12px_rgba(255,255,255,0.10)]">
                      {item.a}
                    </p>
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/8 bg-black/40 py-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-700">
                  <Scissors className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-black text-white">حلاق ماب</span>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-white/78 [text-shadow:0_0_10px_rgba(255,255,255,0.10)]">
                منصة بحث جغرافي تقنية تربط العملاء بأقرب الصالونات — مجانية للمستخدمين.
              </p>
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTE_PATHS.BARBERS_LANDING}
                  className="rounded-full border border-amber-400/25 bg-amber-500/8 px-3 py-1 text-[0.6rem] font-semibold text-amber-400/60 hover:text-amber-300"
                >
                  للمنشآت · B2B ↗
                </Link>
                <Link
                  to={ROUTE_PATHS.HOSPITALITY_B2B_REQUEST}
                  className="rounded-full border border-sky-400/25 bg-sky-500/8 px-3 py-1 text-[0.6rem] font-semibold text-sky-300/80 hover:text-sky-200"
                >
                  ضيافة فنادق · طلب بنرات QR ↗
                </Link>
              </div>
            </div>

            {/* For users */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/84 [text-shadow:0_0_10px_rgba(255,255,255,0.10)]">روابط</h4>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => document.getElementById('search-anchor')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-right text-sm text-white/76 [text-shadow:0_0_10px_rgba(255,255,255,0.08)] hover:text-teal-300 transition-colors"
                >
                  ابحث عن حلاق الآن
                </button>
                {[
                  { label: 'طلب ضيافة B2B (فنادق/شقق)', to: ROUTE_PATHS.HOSPITALITY_B2B_REQUEST },
                  { label: 'آراء المستخدمين ⭐', to: ROUTE_PATHS.PLATFORM_REVIEWS },
                  { label: 'نظام الرصد الذكي 🛰', to: ROUTE_PATHS.RADAR_SHOWCASE },
                  { label: 'من نحن', to: ROUTE_PATHS.ABOUT },
                  { label: 'سياسة الخصوصية', to: ROUTE_PATHS.USER_PRIVACY_POLICY },
                  { label: 'شروط الاستخدام', to: ROUTE_PATHS.TERMS_OF_SERVICE },
                ].map((link) => (
                  <Link key={link.label} to={link.to} className="text-sm text-white/76 [text-shadow:0_0_10px_rgba(255,255,255,0.08)] hover:text-teal-300">{link.label}</Link>
                ))}
              </div>
            </div>

            {/* Social/Contact placeholder */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/84 [text-shadow:0_0_10px_rgba(255,255,255,0.10)]">تواصل</h4>
              <div className="flex flex-col gap-2.5 text-sm text-white/76 [text-shadow:0_0_10px_rgba(255,255,255,0.08)]">
                <span>📍 الرياض، المملكة العربية السعودية</span>
                <span>🌐 halaqmap.com</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/8 pt-8 text-center text-[0.7rem] text-white/76 [text-shadow:0_0_10px_rgba(255,255,255,0.08)] md:flex-row md:justify-between md:text-right">
            <span>© ٢٠٢٦ حلاق ماب — جميع الحقوق محفوظة</span>
            <span className="text-white/70 [text-shadow:0_0_10px_rgba(255,255,255,0.08)]">نشاط تقني رقم ISIC4 474151 · المملكة العربية السعودية</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// عروض التأسيس السنوية — قسم مستقل فاخر
// ─────────────────────────────────────────────────────────────────────────────
function FoundingOffersSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  type PlanId = 'bronze' | 'gold' | 'diamond' | 'diamond_office';
  const plans: {
    id: PlanId;
    emoji: string;
    name: string;
    nameEn: string;
    price: number;
    addOn: number;
    total: number;
    accentFrom: string;
    accentTo: string;
    borderColor: string;
    glowColor: string;
    badge?: string;
    featured?: boolean;
    features: string[];
    cta: string;
  }[] = [
    {
      id: 'bronze',
      emoji: '🥉',
      name: 'برونزي',
      nameEn: 'Bronze',
      price: 100,
      addOn: 0,
      total: 100,
      accentFrom: '#92400e',
      accentTo: '#b45309',
      borderColor: 'rgba(180,83,9,0.35)',
      glowColor: 'rgba(180,83,9,0.18)',
      features: [
        'ظهور جغرافي على الرادار',
        'بطاقة صالون أساسية',
        'مدة 30 يوم',
        'دون تجديد تلقائي',
      ],
      cta: 'ابدأ بالبرونزي',
    },
    {
      id: 'gold',
      emoji: '🥇',
      name: 'ذهبي',
      nameEn: 'Gold',
      price: 150,
      addOn: 0,
      total: 150,
      accentFrom: '#b45309',
      accentTo: '#d97706',
      borderColor: 'rgba(217,119,6,0.4)',
      glowColor: 'rgba(217,119,6,0.22)',
      features: [
        'ظهور مُميَّز وأولوية أعلى',
        'معرض أعمال 20 صورة',
        'QR تقييم حقيقي',
        'شات مباشر مع العملاء',
      ],
      cta: 'ابدأ بالذهبي',
    },
    {
      id: 'diamond',
      emoji: '💎',
      name: 'ماسي',
      nameEn: 'Diamond',
      price: 200,
      addOn: 0,
      total: 200,
      accentFrom: '#0891b2',
      accentTo: '#06b6d4',
      borderColor: 'rgba(6,182,212,0.45)',
      glowColor: 'rgba(6,182,212,0.25)',
      badge: 'الأكثر اختياراً',
      featured: true,
      features: [
        'أعلى ظهور على الرادار',
        'معرض أعمال 40 صورة',
        'شات مترجم بـ 7 لغات',
        'إدارة مواعيد متكاملة',
      ],
      cta: 'ابدأ بالماسي',
    },
    {
      id: 'diamond_office',
      emoji: '🏛️',
      name: 'ماسي + المكتب الخاص',
      nameEn: 'Diamond + Private Office',
      price: 200,
      addOn: 25,
      total: 225,
      accentFrom: '#4f46e5',
      accentTo: '#7c3aed',
      borderColor: 'rgba(124,58,237,0.45)',
      glowColor: 'rgba(124,58,237,0.28)',
      badge: '✦ الأكمل',
      features: [
        'كل مزايا الماسي',
        'مساعد داخلي يستقبل تعليماتك',
        'مناوب شات ينفّذها أمام الزبائن',
        'تقارير كل محادثة تصلك فوراً',
      ],
      cta: 'ابدأ بالماسي + المكتب',
    },
  ];

  function goRegister(planId: PlanId) {
    const tierMap: Record<PlanId, string> = {
      bronze: 'bronze',
      gold: 'gold',
      diamond: 'diamond',
      diamond_office: 'diamond',
    };
    navigate(`${ROUTE_PATHS.REGISTER}?tier=${tierMap[planId]}${planId === 'diamond_office' ? '&addon=office' : ''}`);
  }

  return (
    <section
      id="الأسعار"
      dir="rtl"
      className="relative z-10 overflow-hidden py-28"
      style={{ background: 'linear-gradient(180deg,#020a14 0%,#010810 55%,#020a14 100%)' }}
    >
      {/* خلفية سديمية */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-cyan-500/8 blur-[160px]" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-[160px]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-[200px]" />
      </div>

      {/* خط علوي */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-5">

        {/* الرأسية */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-gradient-to-l from-amber-500/15 to-transparent px-5 py-2 text-[0.7rem] font-black tracking-[0.15em] text-amber-300/90"
          >
            <Sparkles className="h-3 w-3" />
            عروض التأسيس · رخصة نفاذ رقمية للصالونات
            <Sparkles className="h-3 w-3" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mb-4 text-3xl font-black leading-tight text-white md:text-4xl lg:text-5xl"
          >
            اختر باقتك — انطلق
            <span className="block bg-gradient-to-l from-amber-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
              بدون مفاجآت
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="mx-auto max-w-xl text-sm leading-relaxed text-white/86 [text-shadow:0_0_12px_rgba(255,255,255,0.12)]"
          >
            مسبقة الدفع · لا تجديد تلقائي · لا عمولة على الحلاقة · كل حزمة 30 يوم صلاحية
          </motion.p>
        </div>

        {/* الكروت */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: 'easeOut' }}
              className="group relative flex flex-col overflow-hidden rounded-3xl"
              style={{
                border: `1px solid ${plan.borderColor}`,
                background: `linear-gradient(160deg,${plan.accentFrom}18 0%,#040d1a 55%,${plan.accentTo}0e 100%)`,
                boxShadow: (plan.featured || plan.id === 'bronze' || plan.id === 'gold')
                  ? `0 0 60px ${plan.glowColor},0 0 120px ${plan.glowColor},inset 0 1px 0 ${plan.borderColor}`
                  : `0 0 30px ${plan.glowColor},inset 0 1px 0 ${plan.borderColor}`,
              }}
            >
              {/* شارة مميز */}
              {plan.badge && (
                <div
                  className="absolute left-4 top-4 rounded-full px-3 py-0.5 text-[0.6rem] font-black tracking-wide"
                  style={{
                    background: `linear-gradient(135deg,${plan.accentFrom},${plan.accentTo})`,
                    color: '#fff',
                    boxShadow: `0 0 14px ${plan.glowColor}`,
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* توهج علوي داخلي */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-60"
                style={{
                  background: `radial-gradient(ellipse 100% 100% at 50% 0%,${plan.accentTo}22,transparent)`,
                }}
              />

              {/* نبض على hover */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%,${plan.accentTo}12,transparent)` }}
              />

              <div className="relative flex flex-col gap-5 p-6 flex-1">
                {/* الرأسية */}
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                      style={{
                        background: `linear-gradient(135deg,${plan.accentFrom}30,${plan.accentTo}20)`,
                        border: `1px solid ${plan.borderColor}`,
                        boxShadow: `0 0 20px ${plan.glowColor}`,
                      }}
                    >
                      {plan.emoji}
                    </div>
                    <div>
                      <p className="text-base font-black text-white leading-tight">{plan.name}</p>
                      <p className="text-[0.6rem] font-semibold tracking-wider uppercase" style={{ color: plan.accentTo }}>
                        {plan.nameEn}
                      </p>
                    </div>
                  </div>

                  {/* السعر */}
                  <div className="flex items-end gap-2">
                    <span
                      className="font-mono text-4xl font-black leading-none tabular-nums"
                      style={{ color: plan.accentTo, textShadow: `0 0 30px ${plan.glowColor}` }}
                    >
                      {plan.total}
                    </span>
                    <div className="mb-1 flex flex-col leading-none">
                      <span className="text-xs font-bold text-slate-300">ر.س</span>
                      <span className="text-[0.55rem] text-white/76 [text-shadow:0_0_8px_rgba(255,255,255,0.10)]">/30 يوم</span>
                    </div>
                  </div>
                  {plan.addOn > 0 && (
                    <p className="mt-1 text-[0.58rem] text-white/76 [text-shadow:0_0_8px_rgba(255,255,255,0.10)]">
                      ({plan.price} ماسي + {plan.addOn} المكتب الخاص)
                    </p>
                  )}
                </div>

                {/* الفاصل */}
                <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${plan.borderColor},transparent)` }} />

                {/* المزايا */}
                <ul className="flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: plan.accentTo }}
                      />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* زر التسجيل */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goRegister(plan.id)}
                  className="relative mt-2 w-full overflow-hidden rounded-2xl py-3.5 text-sm font-black text-white transition-all"
                  style={{
                    background: `linear-gradient(135deg,${plan.accentFrom},${plan.accentTo})`,
                    boxShadow: `0 0 28px ${plan.glowColor},0 4px 16px ${plan.glowColor}`,
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ضمانات أسفل */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-[0.7rem] text-white/78 [text-shadow:0_0_10px_rgba(255,255,255,0.08)]"
        >
          {[
            { icon: Shield, text: 'بوابة دفع ميسر المعتمدة' },
            { icon: Lock, text: 'لا تجديد تلقائي' },
            { icon: Zap, text: 'تفعيل فوري بعد الدفع' },
            { icon: Award, text: 'شهادة رخصة نفاذ' },
            { icon: Building2, text: 'ISIC4 474151' },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-white/60" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
