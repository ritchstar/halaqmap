import type { Post } from '@/lib';
import { collectGalleryUrlsFromPosts } from '@/lib/barberGalleryRemote';

export function galleryUrlsFromPosts(postList: Post[]): string[] {
  return collectGalleryUrlsFromPosts(postList);
}

/** يحدّث أو ينشئ بوست معرض واحد ليتوافق مع قائمة الصور العامة. */
export function applyGalleryUrlsToPosts(
  postList: Post[],
  barberId: string,
  urls: string[],
  createId: () => string,
): Post[] {
  const galleryIdx = postList.findIndex((p) => p.type === 'gallery');
  if (urls.length === 0) {
    if (galleryIdx === -1) return postList;
    return postList.filter((p) => p.type !== 'gallery');
  }
  if (galleryIdx >= 0) {
    return postList.map((p, i) => (i === galleryIdx ? { ...p, images: [...urls] } : p));
  }
  const post: Post = {
    id: createId(),
    barberId,
    title: 'معرض الأعمال',
    content: '',
    images: [...urls],
    type: 'gallery',
    createdAt: new Date().toISOString().slice(0, 10),
    likes: 0,
    views: 0,
  };
  return [post, ...postList];
}
