import { cn } from '@/lib/utils';
import { youtubeEmbedUrl } from '@/lib/youtubeUrl';

type Props = {
  videoId: string;
  title: string;
  className?: string;
};

export function MapCommunityYoutubeEmbed({ videoId, title, className }: Props) {
  return (
    <iframe
      src={youtubeEmbedUrl(videoId)}
      title={title}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className={cn('absolute inset-0 h-full w-full border-0', className)}
    />
  );
}
