/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * القسم A — Hero. الصورة أعلى والنص أسفلها في الجوال؛ الصورة يسار
 * والنص في مساحة فارغة على اليمين من `lg` فصاعداً (نتحكم بالترتيب عبر
 * `order-*` بدل ترتيب DOM حتى يصح الاتجاهان معاً تحت RTL).
 */
import { Link } from 'react-router-dom';
import { StoreShot } from '@/components/store/StoreShot';

export interface TabkhatnaRamadanHeroProps {
  titleAr: string;
  bodyAr: string;
  primaryCtaAr: string;
  primaryTo: string;
  secondaryCtaAr: string;
  onSecondaryClick?: () => void;
  trustLineAr: string;
  imageSrc: string;
  imageAltAr: string;
}

export function TabkhatnaRamadanHero({
  titleAr,
  bodyAr,
  primaryCtaAr,
  primaryTo,
  secondaryCtaAr,
  onSecondaryClick,
  trustLineAr,
  imageSrc,
  imageAltAr,
}: TabkhatnaRamadanHeroProps) {
  return (
    <header className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
      <figure className="order-1 overflow-hidden rounded-2xl border border-[#3d8b4a]/20 bg-[#faf6ec] lg:order-2">
        <StoreShot
          src={imageSrc}
          alt={imageAltAr}
          className="aspect-[16/9] w-full lg:aspect-[4/3]"
          imgClassName="object-left"
          eager
        />
      </figure>
      <div className="order-2 lg:order-1">
        <h1 className="text-3xl font-extrabold leading-tight text-[#234226] md:text-4xl lg:text-5xl">{titleAr}</h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-[#3f3527]/85 md:text-lg">{bodyAr}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={primaryTo}
            className="rounded-full bg-[#3d8b4a] px-5 py-2.5 text-sm font-bold text-[#fdfaf1]"
          >
            {primaryCtaAr}
          </Link>
          <a
            href="#learn-before-season"
            className="rounded-full border border-[#3d8b4a]/50 px-5 py-2.5 text-sm font-bold text-[#3d8b4a]"
            onClick={(event) => {
              event.preventDefault();
              onSecondaryClick?.();
              document.getElementById('learn-before-season')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {secondaryCtaAr}
          </a>
        </div>
        <p className="mt-4 max-w-md text-sm leading-7 text-[#3f3527]/70">{trustLineAr}</p>
      </div>
    </header>
  );
}
