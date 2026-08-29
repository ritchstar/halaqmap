/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تشغيل المقطع داخل الصندوق. بلا رابط خروج وبلا إعلان من المنصة.
 */
import { youtubeInPageEmbedUrl } from '@/lib/youtubeUrl';

export function YoutubeGalleryPlayer({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  if (!videoId) return null;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/12 bg-black">
      <iframe
        src={youtubeInPageEmbedUrl(videoId)}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
