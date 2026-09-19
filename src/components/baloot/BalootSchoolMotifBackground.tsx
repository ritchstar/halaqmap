/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * زخرفة خلفية خفيفة أنيقة بطابع البلوت — نقشة رقعة شبه شفافة + رموز
 * البذلات الأربع يونيكود باهتة بزوايا الصفحة (♠♥♦♣، نفس رموز `BalootCardFace.tsx`
 * المستخدمة فعلياً في ساحة اللعب، لا صور خارجية). خفيفة بما يكفي لتبقى صفحات
 * المدرسة (التسجيل/التأكيد/الدفع/الطالب) واضحة القراءة وبنفس ثيم shadcn
 * الفاتح الحالي — زخرفة، لا تغيير في الثيم العام. مطابقة بنيوياً لـ
 * `ChessMotifBackground.tsx`.
 *
 * الاستخدام: أول طفل داخل حاوية بها `relative overflow-hidden`، ويُلَف
 * محتوى الصفحة بعدها بـ`relative z-10` ليبقى فوقها دائماً.
 */
import { useId } from 'react';

const CORNER_SUITS = [
  { glyph: '♠', className: 'absolute -right-6 -top-10 text-[9rem] md:-top-14 md:text-[13rem] text-primary/[0.055]' },
  { glyph: '♥', className: 'absolute -left-10 top-1/4 text-[7rem] md:text-[10rem] text-primary/[0.045]' },
  { glyph: '♦', className: 'absolute -bottom-12 right-[12%] text-[8rem] md:text-[11rem] text-primary/[0.05]' },
  { glyph: '♣', className: 'absolute -left-8 bottom-0 text-[6rem] md:text-[9rem] text-primary/[0.04]' },
] as const;

export function BalootSchoolMotifBackground() {
  const patternId = useId();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      {/* نقشة خفيفة جداً على كامل الخلفية */}
      <svg className="absolute inset-0 h-full w-full text-primary opacity-[0.03]">
        <defs>
          <pattern id={patternId} width="64" height="64" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" x="0" y="0" fill="currentColor" />
            <rect width="32" height="32" x="32" y="32" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* رموز بذلات ورق زخرفية كبيرة باهتة بزوايا الصفحة */}
      {CORNER_SUITS.map((suit) => (
        <span key={suit.glyph} className={`${suit.className} leading-none`}>
          {suit.glyph}
        </span>
      ))}
    </div>
  );
}
