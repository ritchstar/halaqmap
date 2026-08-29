/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة صناديق اليوتيوب: مسودة ثم استعراض ثم نشر.
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { YoutubeGalleryPlayer } from '@/components/youtube/YoutubeGalleryPlayer';
import { getAdminDashboardPathFor } from '@/config/adminAuth';
import { PLATFORM_YOUTUBE_GALLERY_COPY, type PlatformYoutubePageId } from '@/config/platformYoutubeGallery';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import {
  fetchAdminYoutubeGallery,
  publishAdminYoutubeGallery,
  saveAdminYoutubeGallery,
} from '@/lib/adminYoutubeGalleryRemote';
import { emptyYoutubeBox, type PlatformYoutubeBox } from '@/lib/platformYoutubeGallery';
import { parseYoutubeVideoId } from '@/lib/youtubeUrl';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type AuthPhase = 'loading' | 'ok' | 'denied';

function applyGallery(
  setBoxes: (boxes: PlatformYoutubeBox[]) => void,
  setPublishedAt: (iso: string | null) => void,
  payload: Awaited<ReturnType<typeof fetchAdminYoutubeGallery>>,
) {
  if (payload.ok === false) {
    toast.error(payload.error === 'no_session' ? 'انتهت الجلسة.' : payload.error);
    return;
  }
  setBoxes(payload.draftBoxes);
  setPublishedAt(payload.publishedAt);
}

export default function AdminYoutubeGalleryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const copy = PLATFORM_YOUTUBE_GALLERY_COPY;
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [pageId, setPageId] = useState<PlatformYoutubePageId>('halaq');
  const [boxes, setBoxes] = useState<PlatformYoutubeBox[]>([]);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState('');
  const [busy, setBusy] = useState(false);
  useDocumentTitle(copy.deskDocumentTitle);

  const load = async (nextPage: PlatformYoutubePageId) => {
    setBusy(true);
    const payload = await fetchAdminYoutubeGallery(nextPage);
    setBusy(false);
    applyGallery(setBoxes, setPublishedAt, payload);
  };

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const client = getSupabaseClient();
      if (!client) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const { data } = await client.auth.getSession();
      const email = data.session?.user?.email;
      if (!email) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const access = await resolveAdminAccess(email);
      const allowed =
        access.allowed && (access.bootstrap || access.permissions.view_overview || access.permissions.manage_partner_marketing);
      if (!cancelled) setPhase(allowed ? 'ok' : 'denied');
      if (allowed && !cancelled) await load('halaq');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function patchBox(id: string, patch: Partial<PlatformYoutubeBox>) {
    setBoxes((current) =>
      current.map((box) => {
        if (box.id !== id) return box;
        const next = { ...box, ...patch };
        next.videoId = parseYoutubeVideoId(next.youtubeUrl) || '';
        return next;
      }),
    );
  }

  async function saveDraft() {
    setBusy(true);
    const payload = await saveAdminYoutubeGallery(pageId, boxes);
    setBusy(false);
    applyGallery(setBoxes, setPublishedAt, payload);
    if (payload.ok) toast.success(copy.savedAr);
  }

  async function publish() {
    setBusy(true);
    const saved = await saveAdminYoutubeGallery(pageId, boxes);
    if (saved.ok === false) {
      setBusy(false);
      applyGallery(setBoxes, setPublishedAt, saved);
      return;
    }
    const payload = await publishAdminYoutubeGallery(pageId);
    setBusy(false);
    applyGallery(setBoxes, setPublishedAt, payload);
    if (payload.ok) toast.success(copy.publishedOkAr);
  }

  if (phase === 'loading') {
    return <p className="px-4 pt-[30svh] text-center text-sm text-white/60">{copy.loadingAr}</p>;
  }
  if (phase === 'denied') {
    return <p className="px-4 pt-[30svh] text-center text-sm text-white/70">غير مصرّح.</p>;
  }

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#050308] px-4 py-6 text-[#f7edd8]">
      <div className="mx-auto max-w-3xl space-y-6">
        <button
          type="button"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
          className="inline-flex items-center gap-2 text-sm text-[#e8c547]"
        >
          <ArrowRight className="h-4 w-4" />
          لوحة التحكم
        </button>
        <header className="space-y-2">
          <h1 className="text-2xl font-black">{copy.deskTitleAr}</h1>
          <p className="text-sm leading-7 text-white/70">{copy.deskLeadAr}</p>
          <p className="text-xs text-white/50">
            {publishedAt ? copy.publishedAr : copy.unpublishedAr}
            {pageId === 'halaq' ? ` · ${ROUTE_PATHS.YOUTUBE_HALAQ}` : ` · ${ROUTE_PATHS.YOUTUBE_STORE}`}
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          {(['halaq', 'store'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPageId(id);
                setPreviewId('');
                void load(id);
              }}
              className={cn(
                'rounded-full px-4 py-2 text-sm',
                pageId === id ? 'bg-[#e8c547] font-bold text-[#061018]' : 'border border-white/20',
              )}
            >
              {id === 'halaq' ? copy.switchHalaqAr : copy.switchStoreAr}
            </button>
          ))}
        </div>
        <ul className="space-y-4">
          {boxes.map((box, index) => {
            const videoId = parseYoutubeVideoId(box.youtubeUrl) || box.videoId;
            return (
              <li key={box.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-white/45">صندوق {index + 1}</p>
                <label className="block text-sm">
                  {copy.titleFieldAr}
                  <input
                    value={box.titleAr}
                    onChange={(e) => patchBox(box.id, { titleAr: e.target.value })}
                    className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black/40 px-3"
                  />
                </label>
                <label className="block text-sm">
                  {copy.urlFieldAr}
                  <input
                    value={box.youtubeUrl}
                    onChange={(e) => patchBox(box.id, { youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v="
                    dir="ltr"
                    className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black/40 px-3"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!videoId}
                    onClick={() => setPreviewId((current) => (current === box.id ? '' : box.id))}
                    className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    {previewId === box.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {previewId === box.id ? copy.hidePreviewAr : copy.previewAr}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoxes((current) => current.filter((row) => row.id !== box.id))}
                    className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {copy.removeAr}
                  </button>
                </div>
                {previewId === box.id && videoId ? <YoutubeGalleryPlayer videoId={videoId} title={box.titleAr || copy.previewAr} /> : null}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBoxes((current) => [...current, emptyYoutubeBox()])}
            className="inline-flex items-center gap-2 rounded-full border border-[#e8c547]/40 px-4 py-2 text-sm text-[#e8c547]"
          >
            <Plus className="h-4 w-4" />
            {copy.addBoxAr}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveDraft()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm disabled:opacity-40"
          >
            {copy.saveDraftAr}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void publish()}
            className="rounded-full bg-[#e8c547] px-4 py-2 text-sm font-bold text-[#061018] disabled:opacity-40"
          >
            {copy.publishAr}
          </button>
        </div>
      </div>
    </div>
  );
}
