/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحتا مشاهدة متصلتان. التشغيل داخل الصندوق.
 */
import { ChevronRight, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { YoutubeGalleryGrid } from '@/components/youtube/YoutubeGalleryGrid';
import { PLATFORM_YOUTUBE_GALLERY_COPY, type PlatformYoutubePageId } from '@/config/platformYoutubeGallery';
import { STORE_HMTUBE } from '@/config/storeHmTube';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchPublicYoutubeGallery, type PublicYoutubeBox } from '@/lib/platformYoutubeGalleryRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

function pageFromPath(pathname: string): PlatformYoutubePageId {
  return pathname.includes('/store/videos') ? 'store' : 'halaq';
}

function galleryHomePath(pageId: PlatformYoutubePageId): string {
  return pageId === 'store' ? ROUTE_PATHS.STORE_LANDING : ROUTE_PATHS.HOME;
}

function GalleryExitBar({ pageId }: { pageId: PlatformYoutubePageId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const homeTo = galleryHomePath(pageId);
  const homeLabel = pageId === 'store'
    ? PLATFORM_YOUTUBE_GALLERY_COPY.backStoreAr
    : PLATFORM_YOUTUBE_GALLERY_COPY.backHalaqAr;

  return (
    <nav
      aria-label="الخروج من المشاهدة"
      className="sticky top-0 z-30 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#050308]/95 px-4 py-3 backdrop-blur"
    >
      <button
        type="button"
        onClick={() => {
          if (location.key !== 'default') navigate(-1);
          else navigate(homeTo);
        }}
        className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-2 text-sm font-bold text-[#f7edd8] hover:border-[#e8c547]/60 hover:text-[#e8c547]"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
        {PLATFORM_YOUTUBE_GALLERY_COPY.backAr}
      </button>
      <Link
        to={homeTo}
        className="inline-flex items-center gap-2 rounded-full bg-[#e8c547] px-3 py-2 text-sm font-extrabold text-[#061018] hover:bg-[#f0d36a]"
      >
        {pageId === 'store' ? (
          <img src={STORE_HMTUBE.markSrc} alt="" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
        ) : (
          <Home className="h-4 w-4" aria-hidden />
        )}
        {homeLabel}
      </Link>
    </nav>
  );
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
    <div dir="rtl" className="min-h-[100svh] bg-[#050308] px-4 pb-8 pt-0 text-[#f7edd8]">
      <div className="mx-auto max-w-5xl space-y-8">
        <GalleryExitBar pageId={pageId} />
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
