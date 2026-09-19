/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تشغيل المقطع داخل الصندوق. بلا رابط خروج وبلا إعلان من المنصة.
 */
import { youtubeInPageEmbedUrl } from '@/lib/youtubeUrl';
import { cn } from '@/lib/utils';

export function YoutubeGalleryPlayer({
  videoId,
  title,
  light,
}: {
  videoId: string;
  title: string;
  /** كانفاس فاتح (صفحة متجر خريطة الحل) بدل الديكور الداكن الافتراضي (حلاق ماب). */
  light?: boolean;
}) {
  if (!videoId) return null;
  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-2xl bg-black',
        light ? 'border border-[#dac8aa]' : 'border border-white/12',
      )}
    >
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
