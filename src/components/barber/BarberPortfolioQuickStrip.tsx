import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionTier, type Post } from '@/lib';
import { portfolioMaxImagesForSubscriptionTier } from '@/lib/barberPortfolioPolicy';
import {
  collectGalleryUrlsFromPosts,
  fetchBarberGalleryRemote,
  syncBarberGalleryRemote,
} from '@/lib/barberGalleryRemote';
import { applyGalleryUrlsToPosts } from '@/lib/barberGalleryPosts';
import {
  deleteBarberPortfolioObjectRemote,
  objectPathFromBarberPortfolioPublicUrl,
  uploadBarberPortfolioImageRemote,
} from '@/lib/barberPortfolioRemote';
import {
  optimizeImageFileForBarberPortfolio,
  portfolioRawFileTooLargeMessage,
} from '@/lib/portfolioImageOptimization';
import { isSupabaseConfigured } from '@/integrations/supabase/client';

function newLocalId(): string {
  return `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type Props = {
  barberId: string;
  barberEmail: string;
  subscriptionTier: SubscriptionTier;
  posts: Post[];
  onPostsChange: (next: Post[]) => void;
};

export function BarberPortfolioQuickStrip({
  barberId,
  barberEmail,
  subscriptionTier,
  posts,
  onPostsChange,
}: Props) {
  const maxImages = portfolioMaxImagesForSubscriptionTier(subscriptionTier);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const refreshUrls = useCallback(async () => {
    if (!barberId || !barberEmail.trim()) {
      setUrls([]);
      setLoading(false);
      return;
    }
    const fromPosts = collectGalleryUrlsFromPosts(posts);
    if (!isSupabaseConfigured()) {
      setUrls(fromPosts);
      setLoading(false);
      return;
    }
    const remote = await fetchBarberGalleryRemote({ barberId, email: barberEmail.trim() });
    if (remote.ok && remote.publicUrls.length > 0) {
      setUrls(remote.publicUrls);
    } else {
      setUrls(fromPosts);
    }
    setLoading(false);
  }, [barberId, barberEmail, posts]);

  useEffect(() => {
    setLoading(true);
    void refreshUrls();
  }, [refreshUrls]);

  useEffect(() => {
    if (selectedIdx != null && selectedIdx >= urls.length) {
      setSelectedIdx(urls.length > 0 ? urls.length - 1 : null);
    }
  }, [selectedIdx, urls.length]);

  const syncGallery = async (nextUrls: string[], nextPosts: Post[]) => {
    onPostsChange(nextPosts);
    if (!barberEmail.trim() || !isSupabaseConfigured()) {
      setUrls(nextUrls);
      return;
    }
    const synced = await syncBarberGalleryRemote({
      barberId,
      email: barberEmail.trim(),
      galleryUrls: nextUrls,
    });
    if (!synced.ok) {
      toast.error(`تعذرت مزامنة المعرض: ${synced.error}`);
      return;
    }
    setUrls(synced.data.publicUrls.length > 0 ? synced.data.publicUrls : nextUrls);
  };

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const rawMsg = portfolioRawFileTooLargeMessage(file);
    if (rawMsg) {
      toast.error(rawMsg);
      return;
    }
    if (maxImages <= 0) {
      toast.error('معرض الصور غير متاح لباقتك.');
      return;
    }
    if (urls.length >= maxImages) {
      toast.error(`بلغت الحد (${maxImages} صورة). احذف صورة لإضافة أخرى.`);
      return;
    }
    if (!barberEmail.trim()) {
      toast.error('بريد الحساب غير متاح للرفع.');
      return;
    }
    if (!isSupabaseConfigured()) {
      toast.error('لم يُضبط Supabase — تعذر رفع الصور.');
      return;
    }

    setUploading(true);
    const isFirstGalleryImage = urls.length === 0;
    const opt = await optimizeImageFileForBarberPortfolio(
      file,
      isFirstGalleryImage ? 'featured_banner' : 'gallery',
    );
    if (!opt.ok) {
      setUploading(false);
      toast.error(opt.error);
      return;
    }
    const up = await uploadBarberPortfolioImageRemote({
      barberId,
      email: barberEmail.trim(),
      imageBase64: opt.imageBase64,
    });
    setUploading(false);
    if (!up.ok) {
      toast.error(up.error);
      return;
    }

    const nextUrls = [...urls, up.publicUrl];
    const nextPosts = applyGalleryUrlsToPosts(posts, barberId, nextUrls, newLocalId);
    await syncGallery(nextUrls, nextPosts);
    setSelectedIdx(nextUrls.length - 1);
    toast.success('تم رفع الصورة.');
  };

  const deleteSelected = async () => {
    if (selectedIdx == null || selectedIdx < 0 || selectedIdx >= urls.length) {
      toast.error('اختر صورة من الشريط أولاً.');
      return;
    }
    const target = urls[selectedIdx];
    if (!target) return;

    setDeleting(true);
    if (barberEmail.trim() && isSupabaseConfigured()) {
      const pth = objectPathFromBarberPortfolioPublicUrl(target, barberId);
      if (pth) {
        const r = await deleteBarberPortfolioObjectRemote({
          barberId,
          email: barberEmail.trim(),
          objectPath: pth,
        });
        if (!r.ok) {
          setDeleting(false);
          toast.error(r.error);
          return;
        }
      }
    }

    const nextUrls = urls.filter((_, i) => i !== selectedIdx);
    const nextPosts = applyGalleryUrlsToPosts(posts, barberId, nextUrls, newLocalId);
    await syncGallery(nextUrls, nextPosts);
    setDeleting(false);
    setSelectedIdx(nextUrls.length > 0 ? Math.min(selectedIdx, nextUrls.length - 1) : null);
    toast.message('تم حذف الصورة من المعرض.');
  };

  if (maxImages <= 0) return null;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-bold text-foreground">معرض صور الصالون</CardTitle>
        <span className="text-sm font-semibold text-foreground" dir="ltr">
          {urls.length}/{maxImages}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {loading ? (
            <div className="flex h-[5.5rem] w-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري التحميل…
            </div>
          ) : urls.length === 0 ? (
            <p className="py-4 text-sm font-medium text-muted-foreground">لا صور بعد — ارفع أول صورة لمعرضك.</p>
          ) : (
            urls.map((url, idx) => (
              <button
                key={`${url}-${idx}`}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-24 sm:w-24 ${
                  selectedIdx === idx
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border/60 hover:border-primary/40'
                }`}
                aria-label={`صورة ${idx + 1}`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={(e) => void onFileChange(e)}
          />
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            disabled={uploading || urls.length >= maxImages}
            onClick={onPickFile}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            رفع صورة
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={deleting || selectedIdx == null || urls.length === 0}
            onClick={() => void deleteSelected()}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            حذف المحددة
          </Button>
          <span className="text-xs text-muted-foreground">
            مرّر لعرض كل الصور · الحد {maxImages} صورة
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
