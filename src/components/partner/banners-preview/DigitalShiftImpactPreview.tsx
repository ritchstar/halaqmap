import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, RotateCcw, Sparkles, User } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT } from '@/config/partnerFeaturePreviewsCopy';
import { IMAGES } from '@/assets/images';
import { cn } from '@/lib/utils';

type SimPhase = 'idle' | 'client_sent' | 'processing' | 'banner_live' | 'typing' | 'done';

const PHASE_MS: Record<Exclude<SimPhase, 'idle' | 'done'>, number> = {
  client_sent: 900,
  processing: 1400,
  banner_live: 1200,
  typing: 55,
};

export function DigitalShiftImpactPreview() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<SimPhase>('idle');
  const [typedLen, setTypedLen] = useState(0);
  const runIdRef = useRef(0);
  const reply = PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT.assistantReply;

  const runSimulation = useCallback(() => {
    const runId = ++runIdRef.current;
    setPhase('client_sent');
    setTypedLen(0);

    const schedule = (next: SimPhase, delay: number) => {
      window.setTimeout(() => {
        if (runIdRef.current !== runId) return;
        setPhase(next);
      }, delay);
    };

    let t = PHASE_MS.client_sent;
    schedule('processing', t);
    t += PHASE_MS.processing;
    schedule('banner_live', t);
    t += PHASE_MS.banner_live;
    schedule('typing', t);
  }, []);

  useEffect(() => {
    if (phase !== 'typing') return;
    if (reduceMotion) {
      setTypedLen(reply.length);
      setPhase('done');
      return;
    }
    if (typedLen >= reply.length) {
      setPhase('done');
      return;
    }
    const id = window.setTimeout(() => setTypedLen((n) => n + 1), PHASE_MS.typing);
    return () => window.clearTimeout(id);
  }, [phase, typedLen, reply.length, reduceMotion]);

  useEffect(() => {
    const id = window.setTimeout(runSimulation, 600);
    return () => {
      runIdRef.current += 1;
      window.clearTimeout(id);
    };
  }, [runSimulation]);

  const bannerActive = phase === 'banner_live' || phase === 'typing' || phase === 'done';
  const showAssistant = phase === 'typing' || phase === 'done';
  const processing = phase === 'processing';

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="feature-preview-glass relative w-full overflow-hidden rounded-2xl border border-white/10 p-4 md:p-5"
      dir="rtl"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-violet-200/80">محاكاة تفاعلية · المناوب الذكي</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 border border-white/10 text-[11px] text-slate-300 hover:bg-white/5 hover:text-white"
          onClick={runSimulation}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          إعادة التشغيل
        </Button>
      </div>

      <motion.div
        className={cn(
          'banner-sim-light-surface relative mb-4 overflow-hidden rounded-xl border shadow-lg transition-all duration-500',
          bannerActive
            ? 'feature-preview-banner-purple-wave border-violet-400/40'
            : 'border-border/80',
        )}
      >
        <motion.div className="relative h-28 overflow-hidden">
          <img src={IMAGES.HALAQMAP_BARBER_BANNER_1_41} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          {processing && (
            <motion.div
              aria-hidden
              className="feature-preview-purple-sweep absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          <Badge className="absolute top-2 left-2 border-violet-300/40 bg-violet-600/90 text-[10px] text-white">
            <Sparkles className="ml-1 h-3 w-3" />
            ماسي
          </Badge>
        </motion.div>
        <div className="space-y-2 p-3">
          <h4 className="text-sm font-bold text-foreground">صالون العرض · المناوب الذكي</h4>
          <motion.div
            key={bannerActive ? 'active' : 'idle'}
            initial={reduceMotion ? false : { opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'rounded-lg border px-2.5 py-2 text-center text-[11px] font-semibold leading-relaxed transition-colors duration-500',
              bannerActive
                ? 'border-violet-400/50 bg-violet-950/50 text-violet-100 shadow-[0_0_24px_-4px_rgba(167,139,250,0.55)]'
                : 'border-border/60 bg-muted/40 text-muted-foreground',
            )}
          >
            {bannerActive
              ? PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT.bannerActiveStatus
              : PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT.bannerIdleStatus}
          </motion.div>
          <p className="text-[10px] text-muted-foreground">حالة الضيافة والتوفر — بلا أي بيانات مالية</p>
        </div>
      </motion.div>

      <div className="space-y-3 rounded-xl border border-white/10 bg-black/25 p-3">
        {(phase === 'client_sent' ||
          phase === 'processing' ||
          phase === 'banner_live' ||
          phase === 'typing' ||
          phase === 'done') && (
          <div className="flex flex-col items-end gap-1 max-w-[92%] mr-0 ml-auto">
            <motion.div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <User className="h-3 w-3" />
              <span>العميل</span>
            </motion.div>
            <motion.div className="rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">
              {PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT.clientMessage}
            </motion.div>
          </div>
        )}

        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 rounded-lg border border-violet-400/25 bg-violet-950/30 px-3 py-2 text-[11px] text-violet-100"
          >
            <span className="feature-preview-ai-dots inline-flex gap-1" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            المناوب يعالج الطلب ويحدّث حالة الضيافة على البنر…
          </motion.div>
        )}

        {showAssistant && (
          <div className="flex flex-col items-start gap-1 max-w-[95%]">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <MessageCircle className="h-3 w-3 text-violet-300" />
              <span>المناوب · رد ضيافة</span>
            </div>
            <motion.div className="rounded-2xl rounded-bl-md border border-violet-400/20 bg-violet-950/40 px-3 py-2 text-sm leading-relaxed text-violet-50">
              {reply.slice(0, typedLen)}
              {phase === 'typing' && (
                <span className="mr-0.5 inline-block h-4 w-0.5 animate-pulse bg-violet-300 align-middle" />
              )}
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
