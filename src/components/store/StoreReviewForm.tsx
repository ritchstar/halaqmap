/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { STORE_REVIEWS_COPY } from '@/config/storeReviews';
import { submitStoreReview } from '@/lib/storeReviewsRemote';
import { cn } from '@/lib/utils';

const STAR_LABELS = ['', 'سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'] as const;

const fieldClass =
  'mt-1 w-full rounded-xl border border-white/15 bg-[#061018] px-3 py-2.5 text-sm text-[#f4efe4] outline-none focus:border-[#e8c547]/50';

export function StoreReviewForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const copy = STORE_REVIEWS_COPY;
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (stars < 1) {
      toast.error(copy.needStarsAr);
      return;
    }
    if (comment.trim().length < 8) {
      toast.error(copy.needCommentAr);
      return;
    }
    setBusy(true);
    const result = await submitStoreReview({
      stars,
      comment,
      displayName,
      company_url_hp: honeypot,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error || 'تعذر حفظ التقييم.');
      return;
    }
    toast.success(copy.thanksAr);
    setStars(0);
    setComment('');
    setDisplayName('');
    onSubmitted?.();
  }

  return (
    <form
      id="store-review-write"
      onSubmit={onSubmit}
      className="relative rounded-2xl border border-[#e8c547]/35 bg-[#0b1a24]/80 p-5 md:p-6"
    >
      <h2 className="text-2xl font-extrabold text-[#f4efe4]">{copy.formTitleAr}</h2>
      <p className="mt-4 text-sm font-bold text-white/80">{copy.starsLabelAr}</p>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} من 5`}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(value)}
            className="p-0.5"
          >
            <Star
              className={cn(
                'h-8 w-8',
                value <= (hover || stars) ? 'fill-[#e8c547] text-[#e8c547]' : 'text-white/25',
              )}
            />
          </button>
        ))}
      </div>
      {(hover || stars) > 0 ? (
        <p className="mt-2 text-center text-xs font-bold text-[#e8c547]">{STAR_LABELS[hover || stars]}</p>
      ) : null}
      <label className="mt-4 block text-sm font-bold text-white/80">
        {copy.commentLabelAr}
        <textarea
          className={fieldClass}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <span className="mt-1 block text-xs font-normal leading-6 text-white/55">{copy.commentHintAr}</span>
      </label>
      <label className="mt-4 block text-sm font-bold text-white/80">
        {copy.nameLabelAr}
        <span className="mr-2 text-xs font-normal text-white/45">{copy.optionalAr}</span>
        <input className={fieldClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
      </label>
      <input
        type="text"
        name="company_url_hp"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      />
      <button
        type="submit"
        disabled={busy}
        className="mt-5 w-full rounded-full bg-[#e8c547] px-5 py-3 text-sm font-extrabold text-[#061018] disabled:opacity-60"
      >
        {copy.submitAr}
      </button>
    </form>
  );
}
