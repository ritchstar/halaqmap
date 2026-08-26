/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة رمز المقابلة بستايل المتجر — للعرض من الآيفون.
 */
import QRCode from 'react-qr-code';
import { STORE_VISUALS } from '@/config/storeFront';
import {
  STORE_BRAND_LATIN,
  STORE_MEET_QR_COPY as COPY,
  STORE_MEET_QR_SECTORS,
  STORE_MEET_QR_TARGET_URL,
  STORE_PUBLIC_NAME_AR,
} from '@/config/storeMeetQr';
import { StoreGoldFrame } from '@/components/store/StoreGoldFrame';
import { cn } from '@/lib/utils';

export function StoreMeetQrBoard({ present = false }: { present?: boolean }) {
  const size = present ? 280 : 232;
  return (
    <StoreGoldFrame className={cn('mx-auto w-full', present ? 'max-w-[26rem]' : 'max-w-[22rem]')}>
      <div
        className={cn(
          'relative flex flex-col items-center px-5 pb-5 pt-6 text-[#f4efe4]',
          present ? 'min-h-[min(86svh,40rem)] justify-center' : '',
        )}
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 42% at 72% 8%, rgba(232,197,71,0.22), transparent 55%), linear-gradient(165deg, #061018 0%, #0c1a2e 48%, #12243a 100%)',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: 'linear-gradient(90deg, #b8860b 0%, #e8c547 48%, #f4efe4 100%)' }}
          aria-hidden
        />
        <img
          src={STORE_VISUALS.logo}
          alt=""
          width={present ? 88 : 72}
          height={present ? 88 : 72}
          className={cn(
            'rounded-full object-cover ring-[3px] ring-[#e8c547]/80 shadow-[0_0_28px_rgba(232,197,71,0.4)]',
            present ? 'h-[5.5rem] w-[5.5rem]' : 'h-[4.5rem] w-[4.5rem]',
          )}
          decoding="async"
        />
        <p dir="ltr" className="mt-2 text-[0.72rem] font-black tracking-[0.08em] text-[#f4efe4]">
          {STORE_BRAND_LATIN}
        </p>
        <p className="text-xl font-extrabold text-[#e8c547]">{STORE_PUBLIC_NAME_AR}</p>
        <p className="mt-1 text-center text-[0.78rem] font-bold leading-6 text-[#f4efe4]/85">
          {COPY.kickerAr}
        </p>

        <div className="mt-4 rounded-[1.35rem] bg-gradient-to-br from-[#f4efe4] via-[#e8c547] to-[#b8860b] p-[3px] shadow-[0_0_28px_rgba(232,197,71,0.35)]">
          <div className="rounded-[1.2rem] bg-white p-3">
            <QRCode
              value={STORE_MEET_QR_TARGET_URL}
              size={size}
              bgColor="#ffffff"
              fgColor="#061018"
              className={cn(present ? 'h-[min(58vw,17.5rem)] w-[min(58vw,17.5rem)]' : 'h-[14.5rem] w-[14.5rem]')}
            />
          </div>
        </div>

        <p dir="ltr" className="mt-3 text-sm font-black tracking-wide text-[#f4efe4]">
          {COPY.hostLine}
        </p>
        <p className="mt-1 text-center text-sm font-extrabold text-[#e8c547]">{COPY.scanHintAr}</p>

        <ul className="mt-3 flex flex-wrap justify-center gap-1.5" data-bidi="off">
          {STORE_MEET_QR_SECTORS.map((item) => (
            <li
              key={item}
              dir="rtl"
              className="rounded-full border border-[#e8c547]/45 bg-[#061018]/90 px-2.5 py-0.5 text-[0.65rem] font-extrabold text-[#e8c547] [unicode-bidi:isolate]"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </StoreGoldFrame>
  );
}
