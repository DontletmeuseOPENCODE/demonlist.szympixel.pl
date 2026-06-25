export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      if (urlObj.hostname.includes('youtu.be')) {
        const pathPart = urlObj.pathname.substring(1);
        // Sometimes path is longer if there are search params, take the first 11 chars
        const id = pathPart.split('/')[0];
        if (id && id.length === 11) {
          return id;
        }
      }
      const v = urlObj.searchParams.get('v');
      if (v && v.length === 11) return v;
    }
  } catch (e) {
    // ignore and fallback to regex
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Wyciąga ID utworu Newgrounds z URL typu:
 *   https://www.newgrounds.com/audio/listen/48911
 *   https://newgrounds.com/audio/listen/48911/...
 * Zwraca string z ID albo null.
 */
export function getNewgroundsSongId(url: string): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('newgrounds.com')) {
      // Ostatni segment ścieżki z cyframi
      const segments = urlObj.pathname.split('/').filter(Boolean);
      for (let i = segments.length - 1; i >= 0; i--) {
        if (/^\d+$/.test(segments[i])) return segments[i];
      }
    }
  } catch {
    // ignore
  }
  // Fallback regex: ostatnia grupa cyfr w URL
  const m = url.match(/(\d+)\/?$/);
  return m ? m[1] : null;
}

/**
 * Zwraca kanoniczny URL do odsłuchu na Newgrounds na podstawie ID.
 */
export function getNewgroundsSongUrl(songId: number | string): string | null {
  if (!songId) return null;
  return `https://www.newgrounds.com/audio/listen/${songId}`;
}
