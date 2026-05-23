/**
 * صفحة الرئيسية الجديدة — حلاق ماب
 * المسار: / (الرئيسية)
 *
 * الرادار الجغرافي الحيّ + البحث الحقيقي عن الصالونات
 * تصميم تكتيكي داكن · فخامة خليجية · حضور جغرافي
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  MapPin, Scissors, Star, Shield, Search, Zap,
  CheckCircle2, Clock, ArrowLeft, Sparkles,
  Navigation2, ChevronDown, Globe2, Lock,
  Users, Award, Wifi, TrendingUp, Play, X,
  Phone, MessageCircle, Heart, BarChart3, Crown, Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS, Barber, FilterState, filterBarbersByDistance } from '@/lib/index';
import { GeoRadarButton } from '@/components/GeoRadarButton';
import { ListingLicensePricingMatrix } from '@/components/billing/ListingLicensePricingMatrix';
import { FilterBar } from '@/components/FilterBar';
import { BarberCard } from '@/components/BarberCards';
import { BarberMap } from '@/components/BarberMap';
import { BarberDetailModal } from '@/components/BarberDetailModal';
import { LocationStatusBar } from '@/components/LocationStatusBar';
import { KSACityClocksBar } from '@/components/KSACityClocksBar';
import { FloatingPlatformActions } from '@/components/FloatingPlatformActions';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { fetchNearbyPublicBarbersFromSupabase } from '@/lib/publicBarbersFromSupabase';
import { toast } from '@/components/ui/sonner';

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

// ─── Radar canvas ───────────────────────────────────────────────────────────
function RadarHero({ onBeaconClick }: { onBeaconClick: (id: number) => void }) {
  const [sweep, setSweep] = useState(0);
  const [activeBeacons, setActiveBeacons] = useState<Set<number>>(new Set());

  useEffect(() => {
    const id = setInterval(() => {
      setSweep((s) => (s + 1.2) % 360);
    }, 16);
    return () => clearInterval(id);
  }, []);

  // Beacon "lights up" as the sweep passes over it
  useEffect(() => {
    DEMO_BEACONS.forEach((b) => {
      const beaconAngle = Math.atan2(b.y - 50, b.x - 50) * (180 / Math.PI) + 180;
      const diff = ((sweep - beaconAngle) % 360 + 360) % 360;
      if (diff < 4) {
        setActiveBeacons((prev) => new Set([...prev, b.id]));
        setTimeout(() => {
          setActiveBeacons((prev) => {
            const next = new Set(prev);
            next.delete(b.id);
            return next;
          });
        }, 1800);
      }
    });
  }, [sweep]);

  const rad = (deg: number) => (deg * Math.PI) / 180;
  const sweepX = 50 + 42 * Math.cos(rad(sweep - 90));
  const sweepY = 50 + 42 * Math.sin(rad(sweep - 90));

  return (
    <div className="relative h-full w-full select-none" style={{ fontFamily: 'system-ui' }}>
      <svg viewBox="0 0 100 100" className="h-full w-full" style={{ filter: 'drop-shadow(0 0 20px rgba(20,184,166,0.3))' }}>
        {/* Background rings */}
        {[10, 20, 30, 42].map((r) => (
          <circle key={r} cx="50" cy="50" r={r} fill="none"
            stroke="rgba(20,184,166,0.12)" strokeWidth="0.3" />
        ))}
        {/* Cross hairs */}
        <line x1="8" y1="50" x2="92" y2="50" stroke="rgba(20,184,166,0.08)" strokeWidth="0.2" />
        <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(20,184,166,0.08)" strokeWidth="0.2" />

        {/* Sweep sector */}
        <path
          d={`M 50 50 L ${sweepX.toFixed(2)} ${sweepY.toFixed(2)} A 42 42 0 0 0 ${(50 + 42 * Math.cos(rad(sweep - 90 - 40))).toFixed(2)} ${(50 + 42 * Math.sin(rad(sweep - 90 - 40))).toFixed(2)} Z`}
          fill="url(#sweepGrad)"
          opacity="0.55"
        />
        {/* Sweep line */}
        <line x1="50" y1="50" x2={sweepX.toFixed(2)} y2={sweepY.toFixed(2)}
          stroke="#2dd4bf" strokeWidth="0.6" />

        <defs>
          <radialGradient id="sweepGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* User position */}
        <circle cx="50" cy="50" r="2" fill="#14b8a6">
          <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="5" fill="none" stroke="#14b8a6" strokeWidth="0.4" opacity="0.6">
          <animate attributeName="r" values="3;8;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Beacons */}
        {DEMO_BEACONS.map((b) => {
          const lit = activeBeacons.has(b.id);
          const color = TIER_COLOR[b.tier];
          return (
            <g key={b.id} style={{ cursor: 'pointer' }} onClick={() => onBeaconClick(b.id)}>
              {lit && (
                <circle cx={b.x} cy={b.y} r="4" fill={color} opacity="0.25">
                  <animate attributeName="r" values="3;7;3" dur="1.2s" repeatCount="2" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.2s" repeatCount="2" />
                </circle>
              )}
              <circle cx={b.x} cy={b.y} r="2.2" fill={color} opacity={lit ? 1 : 0.45} />
              <circle cx={b.x} cy={b.y} r="1.1" fill="white" opacity={lit ? 1 : 0.6} />
              {!b.open && (
                <circle cx={b.x + 1.5} cy={b.y - 1.5} r="0.8" fill="#ef4444" />
              )}
            </g>
          );
        })}
      </svg>
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
      <button onClick={onClose} className="absolute left-2 top-2 rounded-full bg-white/10 p-1 text-white/60 hover:text-white">
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
          <div className="text-center text-xs text-slate-400">{s.label}</div>
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
      <h3 className="mb-1.5 text-base font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
      <div className={`absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />
    </motion.div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function LandingPreview() {
  const navigate = useNavigate();
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
  const resultsRef = useRef<HTMLDivElement>(null);

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
    setUserLocation(loc);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }, []);

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
    <div dir="rtl" className="relative min-h-screen overflow-x-hidden bg-[#020912] font-[Tajawal,system-ui] text-slate-100">

      {/* شريط مدن المملكة */}
      <div className="relative z-[60]"><KSACityClocksBar /></div>

      {/* شريط موقع المستخدم */}
      {userLocation && <LocationStatusBar lat={userLocation.lat} lng={userLocation.lng} />}

      {/* أزرار عائمة */}
      <FloatingPlatformActions />

      {/* ── Grid background texture ──────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          الهيدر الموحّد — شريط المدن + التنقل الرئيسي
          ══════════════════════════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">

        {/* ── طبقة الخلفية الزجاجية ──────────────────────── */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          scrolled
            ? 'bg-[#020912]/96 backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.6)]'
            : 'bg-[#020912]/85 backdrop-blur-xl'
        }`} />

        {/* ── شريط مدن المملكة ───────────────────────────── */}
        <div className="relative border-b border-teal-400/10">
          <KSACityClocksBar />
        </div>

        {/* ── التنقل الرئيسي ─────────────────────────────── */}
        <div className="relative">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3">

            {/* ── الشعار (يمين في RTL) ────────── */}
            <a href={`/#${ROUTE_PATHS.HOME}`} className="flex items-center gap-3 no-underline">
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
                  <span className="text-[0.95rem] font-black tracking-wide text-white">حلاق ماب</span>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-teal-400"
                  />
                </div>
                <div className="text-[0.48rem] font-bold tracking-[0.3em] text-teal-400/55">HALAQ MAP · LIVE</div>
              </div>

              {/* عدد الصالونات النشطة */}
              <div className="hidden items-center gap-1 rounded-full border border-teal-400/20 bg-teal-500/8 px-2.5 py-1 sm:flex">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                />
                <span className="text-[0.55rem] font-bold text-emerald-300/80">رادار نشط</span>
              </div>
            </a>

            {/* ── روابط التنقل ────────────────── */}
            <nav className="hidden items-center gap-1 md:flex" dir="rtl">
              {[
                { label: 'كيف يعمل', icon: Navigation2, href: '#كيف يعمل' },
                { label: 'المميزات',  icon: Sparkles,   href: '#المميزات' },
                { label: 'الأسعار',  icon: Crown,      href: '#الأسعار' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[0.78rem] font-semibold text-slate-400 transition-all duration-200 hover:bg-teal-500/8 hover:text-teal-200"
                >
                  <item.icon className="h-3.5 w-3.5 text-teal-500/50 transition-colors group-hover:text-teal-400" />
                  {item.label}
                </a>
              ))}

              {/* خط فاصل أنيق */}
              <div className="mx-1 h-5 w-px bg-white/10" />

              {/* رابط الشركاء */}
              <a
                href={`/#${ROUTE_PATHS.BARBERS_LANDING}`}
                className="group flex items-center gap-1.5 rounded-xl border border-amber-400/15 bg-amber-500/5 px-3.5 py-2 text-[0.78rem] font-semibold text-amber-400/65 transition-all hover:border-amber-400/35 hover:bg-amber-500/10 hover:text-amber-300"
              >
                <Globe2 className="h-3.5 w-3.5" />
                للمنشآت
                <span className="rounded-sm bg-amber-400/15 px-1 py-0.5 text-[0.5rem] font-black tracking-wider text-amber-400/70">B2B</span>
              </a>
            </nav>

            {/* ── زر البحث الرئيسي ────────────── */}
            <div className="flex items-center gap-2">
              {/* زر البحث */}
              <motion.button
                onClick={() => {
                  const el = document.getElementById('search-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 px-4 py-2.5 text-xs font-black text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]"
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
                {[
                  { label: 'كيف يعمل', href: '#كيف يعمل' },
                  { label: 'المميزات', href: '#المميزات' },
                  { label: 'الأسعار', href: '#الأسعار' },
                  { label: 'للمنشآت B2B', href: `/#${ROUTE_PATHS.BARBERS_LANDING}` },
                  { label: 'آراء المستخدمين', href: `/#${ROUTE_PATHS.PLATFORM_REVIEWS}` },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-teal-300 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileNavOpen(false); document.getElementById('search-anchor')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="mt-2 w-full rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 py-3 text-sm font-bold text-white"
                >
                  ابحث عن حلاق الآن
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] overflow-hidden pt-24">
        {/* Anchor للبحث */}
        <div id="search-anchor" className="absolute top-32" />
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -right-64 top-10 h-[600px] w-[600px] rounded-full bg-teal-500/8 blur-[140px]" />
        <div className="pointer-events-none absolute -left-48 bottom-20 h-[400px] w-[400px] rounded-full bg-amber-500/6 blur-[120px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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

            <p className="mb-8 max-w-lg text-base leading-relaxed text-slate-400">
              رادار جغرافي ذكي يكشف لك أقرب الصالونات المتاحة فور بحثك —
              بيانات حقيقية، تقييمات موثوقة، وتواصل مباشر بدون وسيط.
            </p>

            {/* الرادار الجغرافي — أيقونة تحديد الموقع الرئيسية */}
            <div className="mb-8 flex w-full flex-col items-center gap-4">
              <GeoRadarButton onLocationDetected={handleLocationDetected} />
              {userLocation && filteredBarbers.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 rounded-2xl border border-teal-400/30 bg-teal-500/10 px-5 py-2.5 text-sm font-semibold text-teal-200 hover:bg-teal-500/20 transition-all"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                  {filteredBarbers.length} صالون في محيطك — اعرض النتائج ↓
                </motion.button>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 text-[0.75rem] text-slate-400">
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
                    <div className="text-[0.6rem] tabular-nums text-slate-500">
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
                <div className="flex items-center justify-around px-3 py-3 text-[0.65rem] text-slate-400">
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
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 top-10 rounded-xl border border-amber-400/30 bg-[#0a1628]/90 px-3 py-2 shadow-lg shadow-amber-500/10 backdrop-blur-md"
              >
                <div className="text-[0.6rem] text-slate-400">أقرب صالون</div>
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
      <AnimatePresence>
        {userLocation && (
          <motion.div
            ref={resultsRef}
            key="search-results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 border-y border-teal-400/15 bg-[#020912]"
          >
            {/* شريط الفلاتر */}
            <div className="mx-auto max-w-7xl px-5 py-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <FilterBar filters={filters} onFilterChange={setFilters} />
              </div>
            </div>

            {/* الخريطة */}
            <div className="mx-auto max-w-7xl px-5 pb-4">
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-teal-500/5">
                <BarberMap
                  barbers={filteredBarbers}
                  userLocation={userLocation}
                  onBarberPatch={onBarberPatch}
                  realtimeEnabled={isSupabaseConfigured()}
                />
              </div>
            </div>

            {/* بطاقات الصالونات */}
            <div className="mx-auto max-w-7xl px-5 pb-12">
              {filteredBarbers.length === 0 ? (
                <div className="py-16 text-center">
                  <motion.div
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-teal-400/20 bg-teal-500/10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <MapPin className="h-10 w-10 text-teal-400" />
                  </motion.div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    {remoteStatus === 'loading' ? 'الرادار يبحث…' : 'لا نتائج في هذا النطاق'}
                  </h3>
                  <p className="text-sm text-slate-400">جرّب توسيع نطاق البحث من شريط الفلاتر أعلاه</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      <span className="font-bold text-teal-300">{filteredBarbers.length}</span> صالون في محيطك
                    </p>
                    <div className="flex items-center gap-1.5 text-[0.65rem] text-teal-400/70">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                      رصد حيّ
                    </div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBarbers.map((barber, i) => (
                      <motion.div
                        key={barber.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.4 }}
                        onClick={() => setSelectedBarber(barber)}
                        className="cursor-pointer"
                      >
                        <BarberCard barber={barber} userLocation={userLocation} />
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نافذة تفاصيل الصالون */}
      {selectedBarber && (
        <BarberDetailModal
          barber={selectedBarber}
          isOpen
          onClose={() => setSelectedBarber(null)}
        />
      )}

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-14">
        <div className="mx-auto max-w-4xl px-5">
          <StatsStrip />
        </div>
      </section>

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
                <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
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
              <span className="block text-lg font-normal text-slate-400 mt-2">
                مُصمَّمة خصيصاً لسوق الحلاقة السعودي
              </span>
            </motion.h2>
          </div>

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
              desc="بياناتك محمية بأعلى معايير PDPL السعودية. لا مشاركة دون إذن."
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

      {/* ── B2B info strip — discreet, for regulatory impression only ──── */}
      <section className="relative z-10 border-y border-white/5 bg-black/30 py-8">
        <div className="mx-auto max-w-5xl px-5">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-right"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10">
                <Crown className="h-4 w-4 text-amber-400" />
              </div>
              <div dir="rtl">
                <div className="text-xs font-bold text-amber-300">مزوّد حلول تقنية · ISIC4 474151</div>
                <div className="text-[0.65rem] text-slate-500">حزم رخصة نفاذ رقمية للمنشآت · B2B · لا عمولة على الخدمة</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:justify-end">
              {[
                { name: 'برونزي 🥉', price: '١٠٠ ر.س', color: 'border-amber-800/40 text-amber-700/80' },
                { name: 'ذهبي 🥇', price: '١٥٠ ر.س', color: 'border-amber-400/40 text-amber-300' },
                { name: 'ماسي 💎', price: '٢٠٠ ر.س', color: 'border-cyan-400/40 text-cyan-300' },
              ].map((t) => (
                <a
                  key={t.name}
                  href={`/#${ROUTE_PATHS.LANDING_PARTNERS_PREVIEW}`}
                  className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold transition-opacity hover:opacity-100 opacity-70 ${t.color}`}
                >
                  {t.name} · {t.price}/حزمة
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── الباقات والتسعير ─────────────────────────────────────────────── */}
      <section id="الأسعار" className="relative z-10 py-20 border-y border-white/5 bg-white/[0.015]">
        <div className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-amber-500/6 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300"
            >
              <Crown className="h-3 w-3" /> للمنشآت B2B · حزم رخصة النفاذ الرقمية
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-3 text-2xl font-black text-white md:text-3xl"
            >
              رخصة نفاذ رقمية للصالونات — سعر واضح لا مفاجآت
            </motion.h2>
            <p className="text-sm text-slate-400">
              مسبقة الدفع · لا تجديد تلقائي · لا عمولة على الخدمة · ISIC4 474151
            </p>
          </div>

          {/* مصفوفة التسعير الحقيقية */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ListingLicensePricingMatrix variant="standalone-dark" />
          </motion.div>

          {/* رابط مسار الشركاء */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <a
              href={`/#${ROUTE_PATHS.BARBERS_LANDING}`}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/8 px-6 py-3 text-sm font-semibold text-amber-300 transition-all hover:border-amber-400/60 hover:bg-amber-500/15"
            >
              اكتشف المزيد عن مسار انضمام الصالونات ←
            </a>
          </motion.div>
        </div>
      </section>

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
                a: 'الرادار يرصد الصالونات المسجّلة في محيطك الجغرافي ويعرضها لك فور طلبك — كلما قلّت المسافة زادت الأولوية. لا تسجيل مسبق للبحث.',
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
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="border-t border-white/8 px-5 py-4 text-sm leading-relaxed text-slate-400">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
              <p className="mb-4 text-xs leading-relaxed text-slate-500">
                منصة بحث جغرافي تقنية تربط العملاء بأقرب الصالونات — مجانية للمستخدمين.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={`/#${ROUTE_PATHS.BARBERS_LANDING}`}
                  className="rounded-full border border-amber-400/25 bg-amber-500/8 px-3 py-1 text-[0.6rem] font-semibold text-amber-400/60 hover:text-amber-300"
                >
                  للمنشآت · B2B ↗
                </a>
              </div>
            </div>

            {/* For users */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">روابط</h4>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'ابحث عن حلاق الآن', href: '#search-anchor' },
                  { label: 'آراء المستخدمين ⭐', href: `/#${ROUTE_PATHS.PLATFORM_REVIEWS}` },
                  { label: 'من نحن', href: `/#${ROUTE_PATHS.ABOUT}` },
                  { label: 'سياسة الخصوصية', href: `/#${ROUTE_PATHS.USER_PRIVACY_POLICY}` },
                  { label: 'شروط الاستخدام', href: `/#${ROUTE_PATHS.TERMS_OF_SERVICE}` },
                ].map((link) => (
                  <a key={link.label} href={link.href} className="text-sm text-slate-500 hover:text-teal-400">{link.label}</a>
                ))}
              </div>
            </div>

            {/* Social/Contact placeholder */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">تواصل</h4>
              <div className="flex flex-col gap-2.5 text-sm text-slate-500">
                <span>📍 الرياض، المملكة العربية السعودية</span>
                <span>🌐 halaqmap.com</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/8 pt-8 text-center text-[0.7rem] text-slate-600 md:flex-row md:justify-between md:text-right">
            <span>© ٢٠٢٦ حلاق ماب — جميع الحقوق محفوظة</span>
            <span className="text-slate-700">نشاط تقني رقم ISIC4 474151 · المملكة العربية السعودية</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
