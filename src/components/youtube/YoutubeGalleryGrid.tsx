/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { YoutubeGalleryPlayer } from '@/components/youtube/YoutubeGalleryPlayer';
import type { PlatformYoutubePageId } from '@/config/platformYoutubeGallery';
import type { PublicYoutubeBox } from '@/lib/platformYoutubeGalleryRemote';
import { cn } from '@/lib/utils';

export function YoutubeGalleryGrid({
  boxes,
  pageId,
}: {
  boxes: PublicYoutubeBox[];
  /** يحدد كانفاس حلاق ماب الداكن الافتراضي مقابل كانفاس المتجر الفاتح. */
  pageId?: PlatformYoutubePageId;
}) {
  const isStore = pageId === 'store';
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {boxes.map((box) => (
        <article key={box.id} className="space-y-3">
          <YoutubeGalleryPlayer videoId={box.videoId} title={box.titleAr} light={isStore} />
          <h2 className={cn('text-lg font-extrabold', isStore ? 'text-[#2e2418]' : 'text-[#f7edd8]')}>
            {box.titleAr}
          </h2>
        </article>
      ))}
    </div>
  );
}
