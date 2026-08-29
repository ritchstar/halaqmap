/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحتا مشاهدة متصلتان. التشغيل داخل الصندوق.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { YoutubeGalleryGrid } from '@/components/youtube/YoutubeGalleryGrid';
import { PLATFORM_YOUTUBE_GALLERY_COPY, type PlatformYoutubePageId } from '@/config/platformYoutubeGallery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchPublicYoutubeGallery, type PublicYoutubeBox } from '@/lib/platformYoutubeGalleryRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

function pageFromPath(pathname: string): PlatformYoutubePageId {
  return pathname.includes('/store/videos') ? 'store' : 'halaq';
}

export default function YoutubeGalleryPage() {
  const location = useLocation();
  const pageId = pageFromPath(location.pathname);
  const copy = PLATFORM_YOUTUBE_GALLERY_COPY[pageId];
  const [boxes, setBoxes] = useState<PublicYoutubeBox[]>([]);
  const [loading, setLoading] = useState(true);
  useDocumentTitle(copy.documentTitle);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchPublicYoutubeGallery(pageId).then((result) => {
      if (cancelled) return;
      setBoxes(result.ok ? result.boxes : []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#050308] px-4 py-8 text-[#f7edd8]">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs tracking-[0.3em] text-[#e8c547]">{copy.kickerAr}</p>
          <h1 className="text-3xl font-black">{copy.titleAr}</h1>
          <p className="max-w-2xl text-sm leading-7 text-white/70">{copy.leadAr}</p>
          <nav className="flex flex-wrap gap-2" aria-label="صفحات المشاهدة">
            <Link
              to={ROUTE_PATHS.YOUTUBE_HALAQ}
              className={cn(
                'rounded-full px-4 py-2 text-sm',
                pageId === 'halaq' ? 'bg-[#e8c547] font-bold text-[#061018]' : 'border border-white/20',
              )}
            >
              {PLATFORM_YOUTUBE_GALLERY_COPY.switchHalaqAr}
            </Link>
            <Link
              to={ROUTE_PATHS.YOUTUBE_STORE}
              className={cn(
                'rounded-full px-4 py-2 text-sm',
                pageId === 'store' ? 'bg-[#e8c547] font-bold text-[#061018]' : 'border border-white/20',
              )}
            >
              {PLATFORM_YOUTUBE_GALLERY_COPY.switchStoreAr}
            </Link>
          </nav>
        </header>
        {loading ? <p className="text-sm text-white/60">{PLATFORM_YOUTUBE_GALLERY_COPY.loadingAr}</p> : null}
        {!loading && !boxes.length ? <p className="text-sm text-white/60">{PLATFORM_YOUTUBE_GALLERY_COPY.emptyAr}</p> : null}
        {!loading && boxes.length ? <YoutubeGalleryGrid boxes={boxes} /> : null}
      </div>
    </div>
  );
}
