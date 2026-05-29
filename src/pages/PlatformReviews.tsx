/**
 * PlatformReviews — صفحة آراء وتعليقات المستخدمين الحرة
 * المسار: /reviews
 *
 * تصميم داكن تكتيكي متوافق مع هوية المنصة.
 * يخزّن التعليقات في localStorage (ويمكن لاحقاً ربطها بـ Supabase).
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Star, MessageSquare, Send, Scissors, ChevronDown,
  Heart, ThumbsUp, Share2, ArrowLeft
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PLATFORM_VOLUNTARY_ENGAGEMENT } from '@/config/platformVoluntaryEngagement';
import { ROUTE_PATHS } from '@/lib/index';

// ─── Types ────────────────────────────────────────────────────────────────
interface Review {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

// ─── Seed reviews ─────────────────────────────────────────────────────────
const SEED_REVIEWS: Review[] = [
  {
    id: 'seed-1',
    name: 'أحمد الشهراني',
    city: 'الرياض',
    rating: 5,
    comment: 'تطبيق رائع جداً! وجدت حلاقاً قريباً مني خلال ثوانٍ ودون الحاجة لأي تسجيل. الرادار يعمل بدقة مذهلة. أنصح به بشدة لكل مقيم في الرياض.',
    date: '٢٠ مايو ٢٠٢٦',
    likes: 24,
  },
  {
    id: 'seed-2',
    name: 'محمد العتيبي',
    city: 'جدة',
    rating: 5,
    comment: 'أخيراً منصة سعودية متخصصة تعمل بكفاءة. الصالونات المعروضة لها بيانات كاملة وحقيقية، والنظام يُظهرها فقط حين تكون متاحة. ممتاز.',
    date: '١٨ مايو ٢٠٢٦',
    likes: 18,
  },
  {
    id: 'seed-3',
    name: 'عبدالرحمن القحطاني',
    city: 'الدمام',
    rating: 4,
    comment: 'تجربة سلسة جداً — الخريطة سريعة الاستجابة والمعلومات محدّثة. أتمنى فقط إضافة خاصية تحديد موعد مسبق.',
    date: '١٥ مايو ٢٠٢٦',
    likes: 12,
  },
  {
    id: 'seed-4',
    name: 'فهد المالكي',
    city: 'مكة المكرمة',
    rating: 5,
    comment: 'المنصة تحترم الخصوصية ولا تطلب أي تسجيل للبحث. هذا بالضبط ما يحتاجه المستخدم — بساطة وسرعة وبدون إزعاج.',
    date: '١٢ مايو ٢٠٢٦',
    likes: 31,
  },
  {
    id: 'seed-5',
    name: 'خالد السهلي',
    city: 'أبها',
    rating: 4,
    comment: 'وجدت صالوناً قريباً مني في وقت قياسي. النظام يعمل بشكل جيد والمعلومات دقيقة. تطبيق مفيد للغاية.',
    date: '١٠ مايو ٢٠٢٦',
    likes: 8,
  },
];

const CITY_OPTIONS = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة',
  'الدمام', 'الخبر', 'أبها', 'تبوك', 'بريدة', 'حائل',
  'نجران', 'جازان', 'الطائف', 'خميس مشيط', 'أخرى',
];

// ─── Star rating input ────────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={`h-9 w-9 transition-colors duration-150 ${
                s <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
              }`}
            />
          </button>
        ))}
      </div>
      <span className="h-4 text-[0.7rem] font-semibold text-amber-300">
        {labels[hover || value] ?? ''}
      </span>
    </div>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────
function ReviewCard({ review, delay }: { review: Review; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(review.likes);

  const like = () => {
    if (liked) return;
    setLiked(true);
    setLocalLikes((l) => l + 1);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.45 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1b2e]/80 to-[#060d1a]/80 p-5 backdrop-blur-sm transition-all hover:border-white/20"
      dir="rtl"
    >
      <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-teal-500/5 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-800/30 text-lg font-black text-teal-300">
            {review.name[0]}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{review.name}</div>
            <div className="flex items-center gap-1.5 text-[0.62rem] text-slate-500">
              <span>📍 {review.city}</span>
              <span>·</span>
              <span>{review.date}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <p className="mb-4 text-sm leading-relaxed text-slate-300" style={{ unicodeBidi: 'plaintext' }}>
        {review.comment}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3">
        <button
          onClick={like}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.65rem] font-semibold transition-all ${
            liked
              ? 'border-rose-400/40 bg-rose-500/10 text-rose-300'
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
          }`}
        >
          <Heart className={`h-3 w-3 ${liked ? 'fill-rose-400' : ''}`} />
          {localLikes}
        </button>
        <span className="text-[0.6rem] text-slate-600">مفيد؟</span>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────
export default function PlatformReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'top'>('recent');

  // Form
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(() => searchParams.get('write') === '1');

  useEffect(() => {
    if (searchParams.get('write') === '1') setFormOpen(true);
  }, [searchParams]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('hm_reviews') ?? '[]') as Review[];
      setReviews([...SEED_REVIEWS, ...stored].reverse());
    } catch {
      setReviews(SEED_REVIEWS);
    }
  }, []);

  const ratedReviews = reviews.filter((r) => r.rating > 0);
  const avgRating = ratedReviews.length
    ? ratedReviews.reduce((s, r) => s + r.rating, 0) / ratedReviews.length
    : 0;

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const newReview: Review = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        city: city || 'المملكة',
        rating,
        comment: comment.trim(),
        date: new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }),
        likes: 0,
      };
      try {
        const stored = JSON.parse(localStorage.getItem('hm_reviews') ?? '[]') as Review[];
        stored.push(newReview);
        localStorage.setItem('hm_reviews', JSON.stringify(stored));
      } catch { /* silent */ }
      setReviews((prev) => [newReview, ...prev]);
      setSubmitting(false);
      setSubmitted(true);
      setName('');
      setCity('');
      setRating(0);
      setComment('');
      setTimeout(() => { setSubmitted(false); setFormOpen(false); }, 3000);
    }, 900);
  };

  const sortedReviews = [...reviews].sort((a, b) =>
    sortBy === 'top' ? b.likes - a.likes : 0
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#020912]"
      style={{ fontFamily: 'Tajawal, system-ui' }}
    >
      {/* Grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,1) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }}
      />

      {/* Glow blobs */}
      <div className="pointer-events-none fixed -right-60 top-20 h-96 w-96 rounded-full bg-teal-500/6 blur-[130px]" />
      <div className="pointer-events-none fixed -left-60 bottom-20 h-80 w-80 rounded-full bg-violet-500/5 blur-[110px]" />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#020912]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-700">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-black text-white">حلاق ماب</div>
              <div className="text-[0.5rem] tracking-widest text-teal-400/60">HALAQ MAP</div>
            </div>
          </div>
          <button
            onClick={() => navigate(ROUTE_PATHS.HOME)}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-teal-400/40 hover:text-teal-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> الرئيسية
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 text-5xl">💬</div>
          <h1 className="mb-3 text-3xl font-black text-white md:text-4xl">آراء المستخدمين</h1>
          <p className="mx-auto max-w-xl text-slate-400 leading-relaxed">{PLATFORM_VOLUNTARY_ENGAGEMENT.lead}</p>
          <p className="mt-2 text-[0.72rem] text-teal-400/70">{PLATFORM_VOLUNTARY_ENGAGEMENT.badge}</p>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
              <div className="text-center">
                <div className="text-4xl font-black text-amber-400">
                  {avgRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-0.5 justify-center mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                  ))}
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-black text-teal-300">{reviews.length}</div>
                <div className="text-xs text-slate-500">تقييم</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Submit form toggle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
          <button
            onClick={() => setFormOpen((o) => !o)}
            className="w-full rounded-2xl border border-teal-400/30 bg-teal-500/10 px-5 py-4 text-right transition-all hover:border-teal-400/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">ترك تعليق (اختياري)</div>
                  <div className="text-[0.65rem] text-slate-500">لست مُلزَماً — شارك فقط إن رغبت</div>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-teal-400 transition-transform ${formOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <AnimatePresence>
            {formOpen && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={submitReview}
                className="overflow-hidden rounded-b-2xl border border-t-0 border-teal-400/20 bg-[#060d1a]"
              >
                <div className="p-5 space-y-4">
                  {submitted ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                      <div className="text-5xl">🎉</div>
                      <div className="text-base font-bold text-emerald-300">شكراً! تم نشر تعليقك</div>
                      <div className="text-sm text-slate-400">رأيك يساعد المجتمع على اختيار الأفضل</div>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[0.7rem] font-semibold text-slate-400">الاسم *</label>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="اسمك"
                            required
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/30"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[0.7rem] font-semibold text-slate-400">المدينة</label>
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#0a1628] px-4 py-2.5 text-sm text-white outline-none focus:border-teal-400/50"
                          >
                            <option value="">اختر مدينتك</option>
                            {CITY_OPTIONS.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-[0.7rem] font-semibold text-slate-400">تقييمك (اختياري)</label>
                        <StarInput value={rating} onChange={setRating} />
                        <p className="mt-1 text-center text-[0.62rem] text-slate-500">يمكنك إرسال التعليق دون نجوم</p>
                      </div>

                      <div>
                        <label className="mb-1 block text-[0.7rem] font-semibold text-slate-400">تعليقك *</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="شارك تجربتك مع منصة حلاق ماب..."
                          required
                          rows={4}
                          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/30"
                          style={{ unicodeBidi: 'plaintext' }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !name.trim() || !comment.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:from-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                            جاري الإرسال…
                          </span>
                        ) : (
                          <><Send className="h-4 w-4" /> نشر التعليق</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sort bar */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            جميع التعليقات
            <span className="ms-2 rounded-full bg-teal-500/15 px-2 py-0.5 text-xs text-teal-300">
              {reviews.length}
            </span>
          </h2>
          <div className="flex gap-2">
            {[
              { key: 'recent', label: 'الأحدث' },
              { key: 'top', label: 'الأكثر إفادة' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key as typeof sortBy)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  sortBy === opt.key
                    ? 'bg-teal-500/20 text-teal-200 ring-1 ring-teal-400/40'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {sortedReviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} delay={i * 0.05} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 rounded-2xl border border-teal-400/20 bg-teal-500/5 p-8 text-center"
        >
          <p className="mb-4 text-sm text-slate-400">
            جرّب المنصة الآن وابحث عن أقرب حلاق إليك
          </p>
          <button
            onClick={() => navigate(ROUTE_PATHS.HOME)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 px-8 py-3 font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:from-teal-400"
          >
            ابحث عن حلاق الآن
          </button>
        </motion.div>
      </div>
    </div>
  );
}
