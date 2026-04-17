import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles, Search, MessageCircle, Shield } from 'lucide-react';
import { Barber, FilterState, filterBarbersByDistance } from '@/lib/index';
import { LocationButton } from '@/components/LocationButton';
import { FilterBar } from '@/components/FilterBar';
import { BarberCard } from '@/components/BarberCards';
import { BarberDetailModal } from '@/components/BarberDetailModal';
import { IMAGES } from '@/assets/images';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { fetchNearbyPublicBarbersFromSupabase } from '@/lib/publicBarbersFromSupabase';
import { toast } from '@/components/ui/sonner';
import { getSiteOrigin } from '@/config/siteOrigin';
import {
  PLATFORM_HERO_H1,
  PLATFORM_HERO_LEAD,
  PLATFORM_HOME_WELCOME_FEATURES,
  PLATFORM_META_DESCRIPTION,
} from '@/config/platformGrowthNarrative';
const USER_TRUST_LINE = 'حدد موقعك بدقة · قارن حسب التقييم · تواصل مباشرة مع الصالون';

const JSON_LD_SCRIPT_ID = 'halaqmap-home-jsonld';

export default function Home() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [remoteBarbers, setRemoteBarbers] = useState<Barber[]>([]);
  const [remoteStatus, setRemoteStatus] = useState<'unused' | 'loading' | 'ready' | 'error'>('unused');
  const [filters, setFilters] = useState<FilterState>({
    maxDistance: 5,
    tiers: [],
    openNow: false,
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
          radiusKm: Math.max(5, filters.maxDistance),
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

  const handleLocationDetected = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGES.HALAQMAP_HERO_JPG_50})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            animate={{ scale: [1, 1.025, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ضبط الخلفية فقط: ليل أوضح + انتقال ناعم باتجاه الخلفية البيضاء أسفل الهيدر */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030913]/52 via-[#071321]/24 to-[#050b13]/46" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020711]/34 via-transparent to-[#071423]/32" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_88%_66%_at_50%_30%,rgba(0,0,0,0.08),transparent_64%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-background/35 to-background/70" />

          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(13,148,136,0.2),transparent_56%)]"
            animate={{ opacity: [0.3, 0.58, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_16%_24%,rgba(34,197,94,0.2),transparent_42%),radial-gradient(circle_at_84%_34%,rgba(59,130,246,0.18),transparent_46%),radial-gradient(circle_at_52%_82%,rgba(234,179,8,0.14),transparent_44%)]"
            animate={{ opacity: [0.22, 0.48, 0.22] }}
            transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_26%_62%,rgba(56,189,248,0.14),transparent_38%),radial-gradient(circle_at_74%_60%,rgba(16,185,129,0.14),transparent_40%)]"
            animate={{ opacity: [0.08, 0.24, 0.08], x: [0, 10, 0] }}
            transition={{ duration: 8.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-accent/50 shadow-[0_0_8px_rgba(212,175,55,0.5)]"
              style={{
                left: `${(i * 17 + 13) % 92}%`,
                top: `${(i * 23 + 7) % 88}%`,
              }}
              animate={{
                scale: [0.6, 1.2, 0.6],
                opacity: [0.2, 0.85, 0.2],
                y: [0, -18, 0],
              }}
              transition={{
                duration: 3.5 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-12 sm:py-20 md:py-28">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 border border-primary/30 mb-8 relative"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{
                opacity: 1,
                scale: [1, 1.02, 1],
                boxShadow: [
                  '0 0 0 0 color-mix(in srgb, var(--primary) 35%, transparent)',
                  '0 0 0 10px color-mix(in srgb, var(--primary) 0%, transparent)',
                  '0 0 0 0 color-mix(in srgb, var(--primary) 35%, transparent)',
                ],
              }}
              transition={{
                delay: 0.15,
                duration: 0.6,
                boxShadow: { duration: 2.2, repeat: Infinity, ease: 'easeOut' },
                scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <motion.span
                animate={{ rotate: [0, 12, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.span>
              <span className="text-sm font-semibold text-primary tracking-wide">
                منصة حلاق ماب الذكية
              </span>
            </motion.div>

            <div className="rounded-3xl border border-border bg-card/95 text-card-foreground backdrop-blur-xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)] dark:bg-card/95 dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] px-6 py-10 md:px-12 md:py-12">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 text-card-foreground leading-[1.15]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7 }}
              >
                {PLATFORM_HERO_H1.line1}
                <br />
                <span className="text-primary">{PLATFORM_HERO_H1.line2}</span>
              </motion.h1>

              <motion.div
                className="mb-4 max-w-2xl mx-auto rounded-2xl border border-border bg-secondary px-5 py-4 text-secondary-foreground shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                <p className="text-base md:text-lg font-semibold leading-relaxed text-pretty">{PLATFORM_HERO_LEAD}</p>
              </motion.div>

              <motion.p
                className="text-sm mb-8 max-w-xl mx-auto flex items-center justify-center gap-2 flex-wrap font-medium text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.48, duration: 0.6 }}
              >
                <Shield className="w-4 h-4 text-accent shrink-0" aria-hidden />
                <span>{USER_TRUST_LINE}</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.65 }}
              >
                <LocationButton onLocationDetected={handleLocationDetected} />
              </motion.div>

              <motion.div
                className="mt-10 pt-8 border-t border-border/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75, duration: 0.6 }}
              >
                <p className="text-sm font-semibold text-primary mb-4 tracking-wide">
                  كيف تعمل المنصة؟
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right text-card-foreground">
                  {[
                    {
                      step: '١',
                      icon: MapPin,
                      title: 'حدّد موقعك',
                      desc: 'نستخدم موقعك لإظهار الحلاقين الأقرب إليك فعلياً.',
                    },
                    {
                      step: '٢',
                      icon: Search,
                      title: 'قارن وتصفّح',
                      desc: 'فلترة بالمسافة، الباقة، التقييم، ونوع الخدمة.',
                    },
                    {
                      step: '٣',
                      icon: MessageCircle,
                      title: 'تواصل أو احجز',
                      desc: 'اتصال، واتساب، وخرائط — حسب ما يوفره الصالون.',
                    },
                  ].map((item, index) => {
                    const StepIcon = item.icon;
                    return (
                    <motion.div
                      key={item.step}
                      className="rounded-2xl bg-secondary/80 border border-border p-4 text-center sm:text-right text-secondary-foreground hover:border-primary/40 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.82 + index * 0.08, duration: 0.45 }}
                    >
                      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary font-bold text-sm border border-primary/20">
                          {item.step}
                        </div>
                        <StepIcon className="w-5 h-5 text-accent sm:hidden" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <StepIcon className="hidden sm:block w-4 h-4 text-accent shrink-0" />
                            <h3 className="font-semibold text-secondary-foreground text-sm md:text-base">{item.title}</h3>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!userLocation ? (
          <motion.div
            key="welcome"
            className="container mx-auto px-4 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: MapPin, ...PLATFORM_HOME_WELCOME_FEATURES[0] },
                  { icon: Sparkles, ...PLATFORM_HOME_WELCOME_FEATURES[1] },
                  { icon: MessageCircle, ...PLATFORM_HOME_WELCOME_FEATURES[2] },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="p-6 rounded-2xl bg-card border border-border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            className="container mx-auto px-4 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 space-y-4">
              <FilterBar filters={filters} onFilterChange={setFilters} />
            </div>

            {filteredBarbers.length === 0 ? (
              <motion.div
                className="text-center py-16 max-w-2xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-6"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <MapPin className="w-12 h-12 text-primary" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3">لا توجد حلاقين في هذا النطاق 🔍</h3>
                {remoteStatus === 'loading' && (
                  <p className="text-sm text-primary font-semibold mb-3">جاري تحديث النتائج الأقرب لموقعك...</p>
                )}
                <p className="text-muted-foreground text-lg mb-6">
                  جرّب زيادة نطاق البحث من شريط المسافة (حتى 25 كم) أو إلغاء الفلاتر
                </p>
                <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                  <p className="text-sm text-muted-foreground">💡 <strong>نصيحة:</strong></p>
                  <ul className="text-sm text-muted-foreground space-y-2 text-right">
                    <li>• تأكد من أن موقعك محدد بشكل صحيح</li>
                    <li>• قم بزيادة نطاق البحث من شريط الفلاتر أعلاه</li>
                    <li>• ألغِ فلتر "مفتوح الآن" إذا كان مفعّلاً</li>
                    <li>• جرّب إلغاء فلتر الباقة أو نوع الخدمة لرؤية المزيد من النتائج</li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBarbers.map((barber, index) => (
                  <motion.div
                    key={barber.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    onClick={() => setSelectedBarber(barber)}
                  >
                    <BarberCard barber={barber} userLocation={userLocation} />
                  </motion.div>
                ))}
              </div>
            )}
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