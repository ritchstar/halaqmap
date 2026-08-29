/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { YoutubeGalleryPlayer } from '@/components/youtube/YoutubeGalleryPlayer';
import type { PublicYoutubeBox } from '@/lib/platformYoutubeGalleryRemote';

export function YoutubeGalleryGrid({ boxes }: { boxes: PublicYoutubeBox[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {boxes.map((box) => (
        <article key={box.id} className="space-y-3">
          <YoutubeGalleryPlayer videoId={box.videoId} title={box.titleAr} />
          <h2 className="text-lg font-extrabold text-[#f7edd8]">{box.titleAr}</h2>
        </article>
      ))}
    </div>
  );
}
