import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles, Search, MessageCircle, Shield } from 'lucide-react';
import { LocationStatusBar } from '@/components/LocationStatusBar';
import { Barber, FilterState, filterBarbersByDistance } from '@/lib/index';
import { LocationButton } from '@/components/LocationButton';
import { FilterBar } from '@/components/FilterBar';
import { BarberCard } from '@/components/BarberCards';
import { BarberDetailModal } from '@/components/BarberDetailModal';
import { IMAGES } from '@/assets/images';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { BarberMap } from '@/components/BarberMap';
import { fetchNearbyPublicBarbersFromSupabase } from '@/lib/publicBarbersFromSupabase';
import { toast } from '@/components/ui/sonner';
import { getSiteOrigin } from '@/config/siteOrigin';
import {
  PLATFORM_HERO_H1,
  PLATFORM_HERO_LEAD,
  PLATFORM_HERO_TRUST_LINE,
  PLATFORM_HOME_WELCOME_FEATURES,
  PLATFORM_META_DESCRIPTION,
} from '@/config/platformGrowthNarrative';
import {
  PLATFORM_HERO_BADGE,
  PLATFORM_HOW_IT_WORKS_STEPS,
  PLATFORM_SEARCH_EMPTY_HINT,
  PLATFORM_SEARCH_EMPTY_LOADING,
  PLATFORM_SEARCH_EMPTY_TITLE,
} from '@/config/platformSmartTracking';
import { PlatformVoluntaryEngagementStrip } from '@/components/platformEngagement/PlatformVoluntaryEngagementStrip';

const JSON_LD_SCRIPT_ID = 'halaqmap-home-jsonld';
export default function Home() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [remoteBarbers, setRemoteBarbers] = useState<Barber[]>([]);
  const [remoteStatus, setRemoteStatus] = useState<'unused' | 'loading' | 'ready' | 'error'>('unused');
  const [filters, setFilters] = useState<FilterState>({
    maxDistance: 1,
    tiers: [],
    openNow: true,
    minRating: 0,
    categories: [],
  });

  useEffect(() => {
    const origin = getSiteOrigin();
    const orgId = `${origin}/#organization`;
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          name: 'حلاق ماب',
          alternateName: 'HALAQ MAP',
          url: `${origin}/`,
          description: PLATFORM_META_DESCRIPTION,
          inLanguage: 'ar',
          publisher: { '@id': orgId },
        },
        {
          '@type': 'Organization',
          '@id': orgId,
          name: 'حلاق ماب',
          url: origin,
          logo: `${origin}/favicon.svg`,
        },
      ],
    };

    let script = document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = JSON_LD_SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(graph);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setRemoteBarbers([]);
      setRemoteStatus('unused');
      return;
    }
    if (!userLocation) {
      setRemoteBarbers([]);
      setRemoteStatus('unused');
      return;
    }

    let cancelled = false;
    setRemoteStatus('loading');

    (async () => {
      try {
        const list = await fetchNearbyPublicBarbersFromSupabase({
          userLocation,
          radiusKm: Math.max(1, filters.maxDistance),
          limit: 120,
          minRating: filters.minRating,
          tiers: filters.tiers,
        });
        if (cancelled) return;
        setRemoteBarbers(list);
        setRemoteStatus('ready');
      } catch {
        if (cancelled) return;
        setRemoteStatus('error');
        toast.error('تعذر تحميل نتائج القرب حالياً. تحقّق من الاتصال وأعد المحاولة.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userLocation, filters.maxDistance, filters.minRating, filters.tiers]);

  const catalogBarbers = useMemo(() => remoteBarbers, [remoteBarbers]);

  const filteredBarbers = useMemo(() => {
    if (!userLocation) return [];
    return filterBarbersByDistance(catalogBarbers, userLocation, filters);
  }, [userLocation, filters, catalogBarbers]);

  const onBarberRealtimePatch = useCallback((patch: { id: string; isOpen: boolean; lat?: number; lng?: number }) => {
    setRemoteBarbers((prev) => {
      const idx = prev.findIndex((b) => b.id === patch.id);
      if (idx < 0) return prev;
      const cur = prev[idx];
      const next = [...prev];
      const loc =
        patch.lat != null && patch.lng != null
          ? { ...cur.location, lat: patch.lat, lng: patch.lng }
          : cur.location;
      next[idx] = { ...cur, location: loc, isOpen: patch.isOpen };
      return next;
    });
    setSelectedBarber((sel) => {
      if (!sel || sel.id !== patch.id) return sel;
      const loc =
        patch.lat != null && patch.lng != null
          ? { ...sel.location, lat: patch.lat, lng: patch.lng }
          : sel.location;
      return { ...sel, location: loc, isOpen: patch.isOpen };
    });
  }, []);

  const handleLocationDetected = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
  };

  // عرض شريط الموقع عند الموافقة
  const showLocationBar = !!userLocation;

  return (
    <div className="min-h-screen bg-[#020912]" style={{ fontFamily: 'Tajawal, IBM Plex Sans Arabic, system-ui' }}>
      {/* شريط الموقع الجغرافي — يظهر بعد منح الإذن */}
      {showLocationBar && userLocation && (
        <LocationStatusBar lat={userLocation.lat} lng={userLocation.lng} />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          الهيرو — التصميم التكتيكي الداكن الجديد
          ══════════════════════════════════════════════════════════════════ */}
      <div className="relative min-h-[100dvh] overflow-hidden">
        {/* خلفية الليلة الساعرة — صورة + تدرجات */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGES.HALAQMAP_HERO_JPG_50})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* طبقات اللون الداكن */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020912]/80 via-[#030d1a]/60 to-[#020912]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020912]/40 via-transparent to-[#020912]/30" />
          {/* توهج تيل مركزي */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(20,184,166,0.18),transparent_70%)]"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* ألوان جانبية */}
          <motion.div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_25%,rgba(20,184,166,0.12),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(212,175,55,0.1),transparent_45%)]"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* شبكة نقطية خفية */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(rgba(20,184,166,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
          />
          {/* نقاط ذهبية عائمة */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 3 === 0 ? 'rgba(20,184,166,0.8)' : 'rgba(212,175,55,0.6)',
                boxShadow: i % 3 === 0 ? '0 0 8px rgba(20,184,166,0.6)' : '0 0 8px rgba(212,175,55,0.4)',
                left: `${(i * 19 + 7) % 94}%`,
                top: `${(i * 27 + 5) % 90}%`,
              }}
              animate={{ scale: [0.5, 1.3, 0.5], opacity: [0.2, 0.9, 0.2], y: [0, -20, 0] }}
              transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
            />
          ))}
          {/* تلاشي سفلي */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#020912]" />
        </div>

        {/* المحتوى */}
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-28">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* شارة النظام */}
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-teal-400/35 bg-teal-500/10 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: [1, 1.02, 1], boxShadow: ['0 0 0 0 rgba(20,184,166,0.3)', '0 0 0 12px rgba(20,184,166,0)', '0 0 0 0 rgba(20,184,166,0.3)'] }}
              transition={{ delay: 0.2, duration: 0.5, boxShadow: { duration: 2.5, repeat: Infinity }, scale: { duration: 3, repeat: Infinity } }}
            >
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                <Sparkles className="w-4 h-4 text-teal-300" />
              </motion.span>
              <span className="text-sm font-semibold text-teal-200 tracking-wide">{PLATFORM_HERO_BADGE}</span>
            </motion.div>

            {/* البطاقة الرئيسية الزجاجية الداكنة */}
            <div className="rounded-3xl border border-teal-400/20 bg-[#020912]/70 backdrop-blur-2xl shadow-[0_0_80px_rgba(20,184,166,0.08),0_32px_64px_-16px_rgba(0,0,0,0.6)] ring-1 ring-white/5 px-6 py-10 md:px-12 md:py-12">
              
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 text-white leading-[1.1]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                {PLATFORM_HERO_H1.line1}
                <br />
                <span className="bg-gradient-to-l from-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  {PLATFORM_HERO_H1.line2}
                </span>
              </motion.h1>

              <motion.div
                className="mb-5 max-w-2xl mx-auto rounded-2xl border border-teal-400/15 bg-white/5 px-5 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.7 }}
              >
                <p className="text-base md:text-lg font-semibold leading-relaxed text-slate-200 text-pretty">
                  {PLATFORM_HERO_LEAD}
                </p>
              </motion.div>

              <motion.p
                className="text-sm mb-7 max-w-xl mx-auto flex items-center justify-center gap-2 flex-wrap font-medium text-teal-400/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.6 }}
              >
                <Shield className="w-4 h-4 shrink-0" aria-hidden />
                <span>{PLATFORM_HERO_TRUST_LINE}</span>
              </motion.p>

              <motion.div
                className="flex w-full justify-center mb-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62, duration: 0.65 }}
              >
                <LocationButton onLocationDetected={handleLocationDetected} />
              </motion.div>

              {/* كيف يعمل */}
              <motion.div
                className="mt-10 pt-8 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.82, duration: 0.6 }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400/60 mb-5">
                  كيف تعمل الاستجابة الذكية؟
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
                  {[
                    { icon: MapPin, ...PLATFORM_HOW_IT_WORKS_STEPS[0], color: 'from-teal-500 to-cyan-500' },
                    { icon: Search, ...PLATFORM_HOW_IT_WORKS_STEPS[1], color: 'from-amber-500 to-yellow-500' },
                    { icon: MessageCircle, ...PLATFORM_HOW_IT_WORKS_STEPS[2], color: 'from-violet-500 to-purple-500' },
                  ].map((item, index) => {
                    const StepIcon = item.icon;
                    return (
                      <motion.div
                        key={item.step}
                        className="rounded-2xl border border-white/8 bg-white/5 p-4 text-right hover:border-teal-400/30 transition-all group"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.08, duration: 0.45 }}
                      >
                        <div className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                          <StepIcon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-sm text-white mb-1">{item.title}</h3>
                        <p className="text-[0.72rem] text-slate-400 leading-relaxed">{item.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          المحتوى الديناميكي (قبل/بعد البحث)
          ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {!userLocation ? (
          /* قبل البحث — بطاقات الترحيب */
          <motion.div
            key="welcome"
            className="bg-[#020912] border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* إحصاءات حية */}
            <div className="border-b border-white/5 bg-white/[0.02] py-8">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {[
                    { emoji: '🏙️', value: '47+', label: 'مدينة سعودية' },
                    { emoji: '✂️', value: '2,300+', label: 'صالون مسجّل' },
                    { emoji: '🔍', value: '18,000+', label: 'بحث شهرياً' },
                    { emoji: '⭐', value: '4.8', label: 'متوسط التقييم' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex flex-col items-center rounded-2xl border border-white/8 bg-white/5 p-4 text-center"
                    >
                      <span className="text-2xl mb-1">{stat.emoji}</span>
                      <span className="text-xl font-black text-teal-300">{stat.value}</span>
                      <span className="text-[0.65rem] text-slate-500">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* بطاقات الميزات */}
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs font-bold uppercase tracking-widest text-teal-400/50 mb-8"
                >
                  ابدأ الاستعلام لعرض الخدمات المناسبة
                </motion.p>
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { icon: MapPin, ...PLATFORM_HOME_WELCOME_FEATURES[0], color: 'from-teal-500 to-cyan-500' },
                    { icon: Sparkles, ...PLATFORM_HOME_WELCOME_FEATURES[1], color: 'from-amber-500 to-yellow-500' },
                    { icon: MessageCircle, ...PLATFORM_HOME_WELCOME_FEATURES[2], color: 'from-violet-500 to-purple-500' },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1b2e]/80 to-[#060d1a]/80 p-6 hover:border-white/20 transition-all"
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.12, duration: 0.6 }}
                    >
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                      <div className={`absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-gradient-to-br ${feature.color} opacity-0 blur-3xl transition-opacity group-hover:opacity-10`} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
              <div className="mx-auto max-w-4xl">
                <PlatformVoluntaryEngagementStrip />
              </div>
            </div>
          </motion.div>
        ) : (
          /* بعد البحث — نتائج الصالونات */
          <motion.div
            key="results"
            className="bg-[#020912] border-t border-teal-400/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* شريط الفلاتر */}
            <div className="container mx-auto px-4 py-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                <FilterBar filters={filters} onFilterChange={setFilters} />
              </div>
            </div>

            {/* الخريطة */}
            {userLocation && (
              <div className="container mx-auto px-4 pb-6">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-teal-500/5">
                  <BarberMap
                    barbers={filteredBarbers}
                    userLocation={userLocation}
                    onBarberPatch={onBarberRealtimePatch}
                    realtimeEnabled={isSupabaseConfigured()}
                  />
                </div>
              </div>
            )}

            {/* النتائج */}
            {filteredBarbers.length === 0 ? (
              <motion.div
                className="text-center py-16 max-w-2xl mx-auto container px-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/15 to-teal-800/15 border border-teal-400/20 flex items-center justify-center mx-auto mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MapPin className="w-12 h-12 text-teal-400" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-white">{PLATFORM_SEARCH_EMPTY_TITLE} 🔍</h3>
                {remoteStatus === 'loading' && (
                  <p className="text-sm text-teal-400 font-semibold mb-3">{PLATFORM_SEARCH_EMPTY_LOADING}</p>
                )}
                <p className="text-slate-400 text-lg mb-6">{PLATFORM_SEARCH_EMPTY_HINT}</p>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2 text-right">
                  <p className="text-sm text-teal-300 font-semibold mb-3">💡 نصيحة:</p>
                  {['تأكد من أن الاستعلام بدأ بشكل صحيح', 'قم بزيادة نطاق البحث من شريط الفلاتر', 'ألغِ فلتر «مفتوح الآن» إذا كان مفعّلاً', 'جرّب إلغاء فلتر الباقة لرؤية المزيد'].map((tip) => (
                    <p key={tip} className="text-sm text-slate-400">• {tip}</p>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="container mx-auto px-4 pb-12">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-slate-400">
                    <span className="font-bold text-teal-300">{filteredBarbers.length}</span> خدمة متاحة لك
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[0.65rem] text-teal-400/70">نبض لحظي</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredBarbers.map((barber, index) => (
                    <motion.div
                      key={barber.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.45 }}
                      onClick={() => setSelectedBarber(barber)}
                      className="cursor-pointer"
                    >
                      <BarberCard barber={barber} userLocation={userLocation} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="container mx-auto px-4 pb-10">
              <div className="mx-auto max-w-4xl">
                <PlatformVoluntaryEngagementStrip variant="compact" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedBarber && (
        <BarberDetailModal
          barber={selectedBarber}
          isOpen={!!selectedBarber}
          onClose={() => setSelectedBarber(null)}
        />
      )}
    </div>
  );
}