/**
 * FilterBar — لوحة فلاتر الاستعلام والتوفر
 * تصميم تكتيكي داكن يتناسق مع نظام الاستجابة الذكية
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Star, SlidersHorizontal, ChevronDown, MapPin, Clock, Crown } from 'lucide-react';
import { FilterState, SubscriptionTier } from '@/lib/index';
import { DEFAULT_VISITOR_SEARCH_RADIUS_KM } from '@/lib/visitorServiceIntents';
import { SaudiBishtIcon } from '@/components/icons/SaudiBishtIcon';
import { ChildrenSpecialistIcon } from '@/components/icons/ChildrenSpecialistIcon';
import { CHILDREN_SPECIALIST_FILTER_LABEL_AR } from '@/lib/childrenSpecialistDisplay';
import { MENS_GROOMING_CENTER_FILTER_LABEL_AR } from '@/lib/mensGroomingCenterDisplay';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  /** على الجوال: افتح الفلاتر الفرعية (المسافة والباقات) مباشرة */
  defaultExpanded?: boolean;
}

// ── Tier config ────────────────────────────────────────────────────────────────
const TIERS = [
  { id: SubscriptionTier.BRONZE, label: 'برونزي', emoji: '🥉', color: 'border-amber-700/50 text-amber-700 data-active:border-amber-600/70 data-active:bg-amber-700/15 data-active:text-amber-500' },
  { id: SubscriptionTier.GOLD,   label: 'ذهبي',   emoji: '🥇', color: 'border-amber-400/40 text-amber-400 data-active:border-amber-400/70 data-active:bg-amber-500/15 data-active:text-amber-300' },
  { id: SubscriptionTier.DIAMOND,label: 'ماسي',   emoji: '💎', color: 'border-cyan-400/40 text-cyan-400 data-active:border-cyan-400/70 data-active:bg-cyan-500/15 data-active:text-cyan-300' },
] as const;

const CATEGORIES: Array<
  | { id: string; label: string; emoji: string; Icon?: undefined }
  | { id: string; label: string; emoji?: undefined; Icon: typeof SaudiBishtIcon }
> = [
  { id: 'رجالي',           label: 'رجالي',           emoji: '✂️' },
  { id: 'أطفال',           label: 'أطفال',           emoji: '👦' },
  { id: 'تقليدي',          label: 'تقليدي',          emoji: '🪒' },
  { id: 'احتياجات خاصة',  label: 'كبار سن واحتياجات',  emoji: '♿' },
  { id: 'زيارة منزلية',   label: 'خدمة منزلية',   emoji: '🏠' },
  { id: 'تجهيز عريس',     label: 'تجهيز عريس',     Icon: SaudiBishtIcon },
];

const RATINGS = [
  { value: 0,   label: 'الكل' },
  { value: 3,   label: '3+' },
  { value: 4,   label: '4+' },
  { value: 4.5, label: '4.5+' },
];

// ── Pill button ────────────────────────────────────────────────────────────────
function Pill({
  active, onClick, children, className = '',
}: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold transition-all duration-200 cursor-pointer
        ${active
          ? 'border-teal-400/60 bg-teal-500/15 text-teal-200'
          : 'border-white/12 bg-white/5 text-slate-400 hover:border-white/25 hover:text-slate-200'}
        ${className}`}
    >
      {children}
    </motion.button>
  );
}

// ── Main FilterBar ─────────────────────────────────────────────────────────────
export function FilterBar({ filters, onFilterChange, defaultExpanded = false }: FilterBarProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (defaultExpanded) setExpanded(true);
  }, [defaultExpanded]);

  const handleReset = () => {
    onFilterChange({
      maxDistance: DEFAULT_VISITOR_SEARCH_RADIUS_KM,
      tiers: [],
      openNow: true,
      minRating: 0,
      categories: [],
      childrenSpecialistOnly: false,
      mensGroomingCenterOnly: false,
    });
  };

  const activeCount = [
    filters.openNow ? 1 : 0,
    filters.tiers.length,
    filters.minRating > 0 ? 1 : 0,
    filters.categories.length,
    filters.childrenSpecialistOnly ? 1 : 0,
    filters.mensGroomingCenterOnly ? 1 : 0,
    filters.maxDistance !== DEFAULT_VISITOR_SEARCH_RADIUS_KM ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628]/85 backdrop-blur-md"
      dir="rtl"
    >
      {/* ── Header bar ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-teal-400" />
          <span className="text-sm font-bold text-white">فلاتر التوفر</span>
          {activeCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/25 text-[0.6rem] font-black text-teal-300 ring-1 ring-teal-400/40"
            >
              {activeCount}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="flex items-center gap-1 rounded-full border border-rose-400/25 bg-rose-500/10 px-2.5 py-1 text-[0.62rem] font-semibold text-rose-300 hover:border-rose-400/50 transition-colors"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              إعادة
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* ── Quick summary chips (always visible) ──────── */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/6 px-4 py-2.5">
        {/* Open now */}
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, openNow: !filters.openNow })}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold transition-all ${
            filters.openNow
              ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
          }`}
        >
          <motion.div
            animate={filters.openNow ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`h-1.5 w-1.5 rounded-full ${filters.openNow ? 'bg-emerald-400' : 'bg-slate-600'}`}
          />
          مفتوح الآن
        </button>

        {/* Active tiers */}
        {TIERS.filter((t) => filters.tiers.includes(t.id)).map((t) => (
          <button key={t.id} type="button"
            onClick={() => onFilterChange({ ...filters, tiers: filters.tiers.filter((x) => x !== t.id) })}
            className="flex items-center gap-1 rounded-full border border-teal-400/40 bg-teal-500/12 px-2.5 py-1.5 text-[0.7rem] font-semibold text-teal-200 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-300 transition-all">
            {t.emoji} {t.label} ×
          </button>
        ))}

        {/* Active rating */}
        {filters.minRating > 0 && (
          <button type="button"
            onClick={() => onFilterChange({ ...filters, minRating: 0 })}
            className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/12 px-2.5 py-1.5 text-[0.7rem] font-semibold text-amber-200 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-300 transition-all">
            <Star className="h-2.5 w-2.5 fill-current" />
            {filters.minRating}+ ×
          </button>
        )}

        {/* Active categories */}
        {filters.categories.map((c) => (
          <button key={c} type="button"
            onClick={() => onFilterChange({ ...filters, categories: filters.categories.filter((x) => x !== c) })}
            className="flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-500/12 px-2.5 py-1.5 text-[0.7rem] font-semibold text-violet-200 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-300 transition-all">
            {c} ×
          </button>
        ))}

        {/* مسافة سريعة — ظاهرة دائماً على الجوال */}
        {defaultExpanded ? (
          <label className="flex items-center gap-1.5 rounded-full border border-teal-400/35 bg-teal-500/10 px-2.5 py-1.5 text-[0.7rem] font-semibold text-teal-100">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="text-slate-400">حتى</span>
            <select
              value={filters.maxDistance}
              onChange={(e) => onFilterChange({ ...filters, maxDistance: Number(e.target.value) })}
              className="max-w-[4.5rem] rounded-full bg-transparent text-teal-200 outline-none"
              aria-label="نطاق البحث بالكيلومتر"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((km) => (
                <option key={km} value={km} className="bg-[#0a1628] text-white">
                  {km} كم
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {/* ── Expanded filters ────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-white/8 px-4 pb-4 pt-3">

              {/* Tiers */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-slate-500">
                  <Crown className="h-3 w-3" />
                  الباقة:
                </div>
                {TIERS.map((t) => (
                  <Pill key={t.id}
                    active={filters.tiers.includes(t.id)}
                    onClick={() => {
                      const next = filters.tiers.includes(t.id)
                        ? filters.tiers.filter((x) => x !== t.id)
                        : [...filters.tiers, t.id];
                      onFilterChange({ ...filters, tiers: next });
                    }}
                  >
                    {t.emoji} {t.label}
                  </Pill>
                ))}
              </div>

              {/* Open now */}
              <div className="flex items-center gap-3">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[0.68rem] font-semibold text-slate-500">الحالة:</span>
                <Pill
                  active={filters.openNow}
                  onClick={() => onFilterChange({ ...filters, openNow: !filters.openNow })}
                >
                  <motion.div
                    animate={filters.openNow ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`h-1.5 w-1.5 rounded-full ${filters.openNow ? 'bg-emerald-400' : 'bg-slate-500'}`}
                  />
                  مفتوح الآن فقط
                </Pill>
              </div>

              {/* Ratings */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-slate-500">
                  <Star className="h-3 w-3" />
                  التقييم:
                </div>
                {RATINGS.map((r) => (
                  <Pill key={r.value}
                    active={filters.minRating === r.value}
                    onClick={() => onFilterChange({ ...filters, minRating: r.value })}
                  >
                    {r.value > 0 && <Star className="h-2.5 w-2.5 fill-current text-amber-400" />}
                    {r.label}
                  </Pill>
                ))}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[0.68rem] font-semibold text-slate-500 w-full mb-0.5">نوع الخدمة:</div>
                {CATEGORIES.map((cat) => (
                  <Pill key={cat.id}
                    active={filters.categories.includes(cat.id)}
                    onClick={() => {
                      const next = filters.categories.includes(cat.id)
                        ? filters.categories.filter((x) => x !== cat.id)
                        : [...filters.categories, cat.id];
                      onFilterChange({ ...filters, categories: next });
                    }}
                  >
                    {cat.Icon ? <cat.Icon className="h-3 w-3 shrink-0" title={cat.label} /> : cat.emoji}{' '}
                    {cat.label}
                  </Pill>
                ))}
                <Pill
                  active={Boolean(filters.childrenSpecialistOnly)}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      childrenSpecialistOnly: !filters.childrenSpecialistOnly,
                    })
                  }
                >
                  <ChildrenSpecialistIcon className="h-3 w-3 shrink-0" title={CHILDREN_SPECIALIST_FILTER_LABEL_AR} />{' '}
                  {CHILDREN_SPECIALIST_FILTER_LABEL_AR} (ماسي)
                </Pill>
                <Pill
                  active={Boolean(filters.mensGroomingCenterOnly)}
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      mensGroomingCenterOnly: !filters.mensGroomingCenterOnly,
                    })
                  }
                >
                  <span className="text-amber-300">✦</span> {MENS_GROOMING_CENTER_FILTER_LABEL_AR}
                </Pill>
              </div>

              {/* Location */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-slate-500">
                  <MapPin className="h-3 w-3" />
                  الموقع:
                </div>
                <label className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[0.72rem]">
                  <span className="text-slate-300">حتى</span>
                  <select
                    value={filters.maxDistance}
                    onChange={(e) => onFilterChange({ ...filters, maxDistance: Number(e.target.value) })}
                    className="rounded-full bg-transparent text-teal-300 outline-none"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((km) => (
                      <option key={km} value={km} className="bg-[#0a1628] text-white">
                        {km} كم
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="text-[0.65rem] text-slate-500">
                فلتر الموقع يعتمد على بيان الموقع الذي يضيفه الحلاق ضمن بيانات حسابه.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
