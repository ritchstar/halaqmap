const FEATURED_GALLERY_IMAGES_MAX = 4;

export function resolveBarberPublicCoverAndFeatured(input: {
  bannerUrls: string[];
  shopExterior?: string;
  shopInterior?: string;
  shopImages: string[];
}): {
  cover_image: string | null;
  profile_image: string | null;
  featured_images: string[];
} {
  const shop = input.shopImages
    .map((x) => String(x ?? '').trim())
    .filter((url) => url.length > 0);
  const banners =
    input.bannerUrls.length > 0 ? input.bannerUrls : shop.length > 2 ? shop.slice(2) : [];

  return {
    cover_image: banners[0] || input.shopExterior?.trim() || shop[0] || null,
    profile_image: input.shopInterior?.trim() || shop[1] || shop[0] || null,
    featured_images: banners.slice(0, FEATURED_GALLERY_IMAGES_MAX),
  };
}

/** غلاف البطاقة العامة — يفضّل أول بنر مميز على صورة الواجهة القديمة */
export function resolvePublicBarberCardCoverImage(
  cover: string | null | undefined,
  featured: string[],
): string | null {
  const banner = featured[0]?.trim();
  if (banner) return banner;
  const legacy = cover?.trim();
  return legacy || null;
}
