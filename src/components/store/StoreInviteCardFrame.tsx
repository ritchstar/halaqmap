/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إطار الكرت بحدّين حقيقيين. لا ظل داخلي حتى لا يلتوي عند التحميل.
 */
export function StoreInviteCardFrame({ accent }: { accent: string }) {
  return (
    <>
      <div
        data-invite-frame="outer"
        className="pointer-events-none absolute inset-3 rounded-[22px] border-[3px]"
        style={{ borderColor: accent }}
      />
      <div
        data-invite-frame="inner"
        className="pointer-events-none absolute inset-[18px] rounded-[16px] border"
        style={{ borderColor: 'rgba(8, 6, 4, 0.45)' }}
      />
    </>
  );
}
