/**
 * B2BAmbientGlowField — إضاءة سديمية بصرية بحتة لصفحات الشركاء.
 *
 * بقع توهج radial متمددة على ارتفاعات متعددة من تدفق الصفحة
 * (الأعلى، الوسط، أواخر الوسط، آخر الصفحة) لكسر المناطق الداكنة
 * وإعطاء عمق فلكي ناعم.
 *
 * مكوّن CSS/Tailwind فقط: لا يقرأ محتوى الصفحة ولا يستدعي أي خدمة.
 */

import { motion } from 'framer-motion';

const nebulaSpots = [
  {
    className: 'right-[4%] top-[10rem] h-[38rem] w-[38rem] bg-white/[0.085]',
    delay: 0,
  },
  {
    className: 'left-[3%] top-[46rem] h-[44rem] w-[44rem] bg-cyan-200/[0.11]',
    delay: 0.8,
  },
  {
    className: 'right-[15%] top-[92rem] h-[52rem] w-[52rem] bg-emerald-100/[0.095]',
    delay: 1.6,
  },
  {
    className: 'left-[18%] top-[138rem] h-[50rem] w-[50rem] bg-amber-50/[0.075]',
    delay: 2.4,
  },
  {
    className: 'right-[0%] bottom-[18rem] h-[56rem] w-[56rem] bg-white/[0.075]',
    delay: 3.2,
  },
] as const;

export function B2BAmbientGlowField() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {/* بقع بيضاء/ملونة ناعمة متمددة */}
      {nebulaSpots.map((spot, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-[120px] ${spot.className}`}
          animate={{
            opacity: [0.45, 0.82, 0.45],
            scale: [0.96, 1.08, 0.96],
          }}
          transition={{
            duration: 12 + index * 1.5,
            delay: spot.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* أضواء جانبية ممتدة تظهر خلف البنرات من الأطراف */}
      <motion.div
        className="absolute left-[-18rem] top-[22rem] h-[90rem] w-[28rem] rounded-full bg-white/[0.055] blur-[95px]"
        animate={{ opacity: [0.35, 0.72, 0.35], scaleY: [0.96, 1.08, 0.96] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-18rem] top-[58rem] h-[100rem] w-[30rem] rounded-full bg-cyan-100/[0.06] blur-[105px]"
        animate={{ opacity: [0.3, 0.66, 0.3], scaleY: [1.04, 0.98, 1.04] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-[116rem] h-[22rem] w-[82vw] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[70px]"
        animate={{ opacity: [0.25, 0.55, 0.25], scaleX: [0.9, 1.08, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* أبعاد رادارية خافتة في منتصف التدفق */}
      <motion.div
        className="absolute left-1/2 top-[70rem] h-[52rem] w-[52rem] -translate-x-1/2 rounded-full border border-white/[0.035]"
        animate={{ opacity: [0.12, 0.28, 0.12], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-[75rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full border border-cyan-200/[0.04]"
        animate={{ opacity: [0.08, 0.22, 0.08], scale: [1.05, 0.98, 1.05] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-[80rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-emerald-200/[0.045]"
        animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.98, 1.06, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* مسح قطري رقيق يعطي عمقاً تقنياً لا يطغى على المحتوى */}
      <motion.div
        className="absolute inset-y-0 -left-1/4 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent blur-2xl"
        animate={{ x: ['0%', '420%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear', repeatDelay: 8 }}
      />

      {/* فينييت خفيف حتى لا تفقد الصفحات تباين النص */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_55%,rgba(2,8,18,0.45)_100%)]" />
    </div>
  );
}