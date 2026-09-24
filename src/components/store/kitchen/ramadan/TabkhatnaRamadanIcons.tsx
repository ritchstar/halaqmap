/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أيقونات مجردة (خطوط بسيطة) لبطاقات القسم B — بلا كلمات أو حروف داخل
 * الرسم، فقط `fill="currentColor"` لتلتزم بلون البطاقة.
 */
export type TabkhatnaRamadanIconName = 'bubbles' | 'plate' | 'clock';

export function TabkhatnaRamadanIcon({ name, className }: { name: TabkhatnaRamadanIconName; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      {name === 'bubbles' && (
        <>
          <rect x="6" y="9" width="22" height="15" rx="6" />
          <path d="M14 24l-2 6 7-6" />
          <rect x="22" y="27" width="18" height="12" rx="5" opacity="0.6" />
        </>
      )}
      {name === 'plate' && (
        <>
          <circle cx="24" cy="24" r="16" />
          <circle cx="24" cy="24" r="8" opacity="0.6" />
        </>
      )}
      {name === 'clock' && (
        <>
          <circle cx="24" cy="24" r="16" />
          <path d="M24 15v9l7 4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}
