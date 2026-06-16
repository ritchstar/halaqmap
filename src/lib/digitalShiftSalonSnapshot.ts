import type { BarberPlatformBannerState } from '@/lib/barberDashboardLocalState';
import type { Post } from '@/lib';

export type SalonSnapshotPayload = {
  bannerImageUrls: string[];
  showDiscountBadge: boolean;
  discountPercent: number | null;
  galleryItems: { id: string; createdAt?: string; imageUrl?: string }[];
};

export function buildSalonSnapshotPayload(
  bannerState: BarberPlatformBannerState,
  posts: Post[],
): SalonSnapshotPayload {
  return {
    bannerImageUrls: bannerState.bannerImageUrls,
    showDiscountBadge: bannerState.showDiscountBadge,
    discountPercent: bannerState.discountPercent,
    galleryItems: posts.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      imageUrl: p.images?.[0],
    })),
  };
}
