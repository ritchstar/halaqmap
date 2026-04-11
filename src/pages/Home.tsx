import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import { Barber, FilterState, SubscriptionTier, filterBarbersByDistance } from '@/lib/index';
import { mockBarbers } from '@/data/index';
import { LocationButton } from '@/components/LocationButton';
import { FilterBar } from '@/components/FilterBar';
import { BarberCard } from '@/components/BarberCards';
import { BarberDetailModal } from '@/components/BarberDetailModal';
import { IMAGES } from '@/assets/images';

export default function Home() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [filters, setFilters] = useState<FilterState>({
<<<<<<< HEAD
    maxDistance: 5,
=======
    maxDistance: 50,
>>>>>>> a1ca71944eb7ea0da8228012067b818dd84e32ed
    tiers: [],
    openNow: false,
    minRating: 0,
    categories: [],
  });

  const filteredBarbers = useMemo(() => {
    if (!userLocation) return [];
    return filterBarbersByDistance(mockBarbers, userLocation, filters);
  }, [userLocation, filters]);

  const handleLocationDetected = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Hero Background Image with Pulse Animation */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGES.HALAQMAP_HERO_JPG_50})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Overlay Gradient for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          
          {/* Animated Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,148,136,0.15),transparent_70%)]"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Floating Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-ring/60 rounded-full blur-[1px]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary">منصة حلاق ماب الذكية</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              أول منصة عربية ذكية
              <br />
              <span className="text-foreground">تربط الحلاقين المحترفين بالعملاء</span>
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              اكتشف أقرب الحلاقين المحترفين إليك بضغطة زر واحدة. نظام خرائط متقدم، حجز فوري، وتقييمات موثوقة.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              {!userLocation ? (
                <LocationButton onLocationDetected={handleLocationDetected} />
              ) : (
                <LocationButton onLocationDetected={handleLocationDetected} />
              )}
            </motion.div>
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
                  {
                    icon: MapPin,
                    title: 'تحديد دقيق',
                    description: 'نظام GPS متقدم لإيجاد أقرب الحلاقين',
                  },
                  {
                    icon: Sparkles,
                    title: 'جودة مضمونة',
                    description: 'حلاقون محترفون مع تقييمات موثوقة',
                  },
                  {
                    icon: MapPin,
                    title: 'حجز سريع',
                    description: 'احجز موعدك بضغطة زر واحدة',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
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
            <div className="mb-8">
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
                <p className="text-muted-foreground text-lg mb-6">
<<<<<<< HEAD
                  جرّب زيادة نطاق البحث إلى <span className="font-bold text-primary">5 كم</span> (الحد الأقصى في الشريط) أو إلغاء الفلاتر
=======
                  جرب زيادة نطاق البحث إلى <span className="font-bold text-primary">50 كم</span> أو إلغاء الفلاتر
>>>>>>> a1ca71944eb7ea0da8228012067b818dd84e32ed
                </p>
                <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                  <p className="text-sm text-muted-foreground">💡 <strong>نصيحة:</strong></p>
                  <ul className="text-sm text-muted-foreground space-y-2 text-right">
                    <li>• تأكد من أن موقعك محدد بشكل صحيح</li>
                    <li>• قم بزيادة نطاق البحث من شريط الفلاتر أعلاه</li>
                    <li>• ألغِ فلتر "مفتوح الآن" إذا كان مفعّلاً</li>
<<<<<<< HEAD
                    <li>• جرّب إلغاء فلتر الباقة أو نوع الخدمة لرؤية المزيد من النتائج</li>
=======
                    <li>• جرّب إلغاء فلتر الباقة لرؤية جميع الحلاقين</li>
>>>>>>> a1ca71944eb7ea0da8228012067b818dd84e32ed
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