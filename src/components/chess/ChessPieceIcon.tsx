/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أيقونات قطع الشطرنج — SVG أصلية بدل رموز يونيكود (♔♛♞...).
 * سبب الاستبدال: بعض المنصات (تحديداً iOS) تعرض رموز يونيكود معيّنة
 * (خصوصاً حرف الجندي ♟/♙) بخط إيموجي ملوّن ثابت اللون يتجاهل تماماً
 * لون النص عبر CSS، فتظهر القطعة بالأسود بصرف النظر عن الفريق.
 * الأيقونات هنا تُرسم بـ fill="currentColor" فتلتزم بلون الفريق ووهجه
 * على كل منصة ومتصفح دون استثناء.
 */
export type ChessPieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';

export interface ChessPieceIconProps {
  type: ChessPieceType;
  className?: string;
}

const BASE_PATH = 'M20 80h60a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4Z';

export function ChessPieceIcon({ type, className }: ChessPieceIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={BASE_PATH} />
      {type === 'p' && (
        <>
          <circle cx="50" cy="30" r="11" />
          <path d="M42 44 L58 44 L64 80 L36 80 Z" />
        </>
      )}
      {type === 'r' && (
        <>
          <path d="M30 80 L30 46 L70 46 L70 80 Z" />
          <path d="M26 46 L26 34 L34 34 L34 40 L42 40 L42 34 L58 34 L58 40 L66 40 L66 34 L74 34 L74 46 Z" />
        </>
      )}
      {type === 'b' && (
        <>
          <path d="M50 20 C 58 28, 62 38, 58 48 C 68 54, 70 66, 64 80 L36 80 C 30 66, 32 54, 42 48 C 38 38, 42 28, 50 20 Z" />
          <circle cx="50" cy="14" r="5" />
        </>
      )}
      {type === 'q' && (
        <>
          <path d="M34 80 L30 50 L70 50 L66 80 Z" />
          <path d="M26 50 L30 28 L38 44 L42 24 L50 42 L58 24 L62 44 L70 28 L74 50 Z" />
          <circle cx="30" cy="24" r="3" />
          <circle cx="42" cy="20" r="3" />
          <circle cx="50" cy="18" r="3.5" />
          <circle cx="58" cy="20" r="3" />
          <circle cx="70" cy="24" r="3" />
        </>
      )}
      {type === 'k' && (
        <>
          <path d="M34 80 L30 52 L70 52 L66 80 Z" />
          <path d="M28 52 L28 44 L72 44 L72 52 Z" />
          <path d="M44 25 L56 25 L56 33 L64 33 L64 41 L56 41 L56 49 L44 49 L44 41 L36 41 L36 33 L44 33 Z" />
        </>
      )}
      {type === 'n' && (
        <g>
          <path d="M34,80 L40.8,71.4 L29.3,63.4 L23,46 L29.3,28.6 L50,19 L70.7,28.6 L77,46 L70.7,63.4 L59.2,71.4 L66,80 L58,80 L54.8,59.2 L60.7,55 L64,46 L60.7,37 L50,32 L39.3,37 L36,46 L39.3,55 L45.2,59.2 L42,80 Z" />
          <circle cx="36" cy="67" r="2.6" className="text-[#0e262d]" fill="currentColor" />
          <circle cx="64" cy="67" r="2.6" className="text-[#0e262d]" fill="currentColor" />
        </g>
      )}
    </svg>
  );
}
