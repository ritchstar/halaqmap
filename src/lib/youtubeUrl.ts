/** Parse a YouTube watch/share URL into an 11-char video id. */
export function parseYoutubeVideoId(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  try {
    const url = input.startsWith('http') ? new URL(input) : new URL(`https://${input}`);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = url.searchParams.get('v');
      if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;
      const parts = url.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx >= 0 && parts[embedIdx + 1] && /^[\w-]{11}$/.test(parts[embedIdx + 1]!)) {
        return parts[embedIdx + 1]!;
      }
      const shortsIdx = parts.indexOf('shorts');
      if (shortsIdx >= 0 && parts[shortsIdx + 1] && /^[\w-]{11}$/.test(parts[shortsIdx + 1]!)) {
        return parts[shortsIdx + 1]!;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
