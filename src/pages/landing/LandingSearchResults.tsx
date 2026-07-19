import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { Barber, FilterState } from '@/lib/index';
import { FilterBar } from '@/components/FilterBar';
import { BarberMap } from '@/components/BarberMap';
import { BarberCard } from '@/components/BarberCards';
import { ShowcaseEducationBanner } from '@/components/ShowcaseEducationBanner';
import { VisitorMobileQueryLens } from '@/components/landing/VisitorMobileQueryLens';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type Props = {
  userLocation: { lat: number; lng: number };
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  filteredBarbers: Barber[];
  mapBarbers: (Barber & { distance?: number })[];
  showcaseActive: boolean;
  showcaseFallback: { barber: Barber; intro: string } | null;
  remoteStatus: 'unused' | 'loading' | 'ready' | 'error';
  onBarberPatch: (patch: { id: string; isOpen: boolean; lat?: number; lng?: number }) => void;
  onSelectBarber: (barber: Barber) => void;
};

export function LandingSearchResults({
  userLocation,
  filters,
  onFilterChange,
  filteredBarbers,
  mapBarbers,
  showcaseActive,
  showcaseFallback,
  remoteStatus,
  onBarberPatch,
  onSelectBarber,
}: Props) {
  const isMobile = useIsMobile();

  return (
    <>
      <div className={cn('mx-auto max-w-7xl px-4 py-3 md:px-5 md:py-4', isMobile ? 'space-y-3' : undefined)}>
        {isMobile ? (
          <VisitorMobileQueryLens
            filters={filters}
            hasLocation
            onIntentChange={(next) => onFilterChange(next)}
          />
        ) : null}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4">
          <FilterBar filters={filters} onFilterChange={onFilterChange} defaultExpanded={isMobile} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-4">
        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-teal-500/5">
          <BarberMap
            barbers={mapBarbers}
            userLocation={userLocation}
            onBarberPatch={onBarberPatch}
            realtimeEnabled={isSupabaseConfigured()}
          />
        </div>
      </div>

      {showcaseActive && showcaseFallback ? (
        <>
          <ShowcaseEducationBanner intro={showcaseFallback.intro} />
          <div className="mx-auto max-w-lg px-5 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => onSelectBarber(showcaseFallback.barber)}
              className="cursor-pointer"
            >
              <BarberCard
                barber={showcaseFallback.barber}
                userLocation={userLocation}
                imagePriority
              />
            </motion.div>
          </div>
        </>
      ) : (
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
                {remoteStatus === 'loading' ? 'جارٍ عرض الخدمات المتاحة…' : 'لا نتائج متاحة في هذا النطاق'}
              </h3>
              <p className="text-sm text-slate-400">جرّب توسيع نطاق البحث من شريط الفلاتر أعلاه</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  <span className="font-bold text-teal-300">{filteredBarbers.length}</span> نتيجة متاحة
                </p>
                <div className="flex items-center gap-1.5 text-[0.65rem] text-teal-400/70">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                  مستخدم يستعلم · حلاق متوفر
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredBarbers.map((barber, i) => (
                  <motion.div
                    key={barber.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    onClick={() => onSelectBarber(barber)}
                    className="cursor-pointer"
                  >
                    <BarberCard
                      barber={barber}
                      userLocation={userLocation}
                      imagePriority={i === 0}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
