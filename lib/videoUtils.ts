/**
 * Utility functions for parsing and rendering video URLs (YouTube, Google Drive, Vimeo, MP4/Cloudinary)
 * cleanly inside embedded web players without taking users away to third-party sites.
 */

export type VideoProviderType = "youtube" | "gdrive" | "googledrive" | "vimeo" | "cloudinary" | "mp4" | string;

export interface ParsedVideo {
  provider: "youtube" | "gdrive" | "vimeo" | "mp4" | "cloudinary" | "unknown";
  embedUrl: string;
  originalUrl: string;
  isIframe: boolean;
  isValid: boolean;
}

/**
 * Extracts Youtube Video ID from various link formats
 */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Extracts Google Drive File ID from various drive link formats
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  // Patterns:
  // https://drive.google.com/file/d/1ABC123xyz.../view?usp=sharing
  // https://drive.google.com/open?id=1ABC123xyz...
  // https://drive.google.com/uc?id=1ABC123xyz...
  // https://drive.google.com/file/d/1ABC123xyz.../preview
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch && openIdMatch[1]) return openIdMatch[1];

  return null;
}

/**
 * Extracts Vimeo Video ID
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Main parser function to get embeddable video stream details
 */
export function parseVideoUrl(url: string = "", specifiedProvider?: string): ParsedVideo {
  const cleanUrl = (url || "").trim();

  if (!cleanUrl) {
    return {
      provider: "unknown",
      embedUrl: "",
      originalUrl: "",
      isIframe: false,
      isValid: false,
    };
  }

  // 1. Check Google Drive
  const driveId = extractGoogleDriveId(cleanUrl);
  if (driveId || cleanUrl.includes("drive.google.com") || specifiedProvider === "gdrive" || specifiedProvider === "googledrive") {
    const finalDriveId = driveId || extractGoogleDriveId(cleanUrl);
    if (finalDriveId) {
      return {
        provider: "gdrive",
        embedUrl: `https://drive.google.com/file/d/${finalDriveId}/preview`,
        originalUrl: cleanUrl,
        isIframe: true,
        isValid: true,
      };
    }
  }

  // 2. Check YouTube
  const youtubeId = extractYoutubeId(cleanUrl);
  if (youtubeId || cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be") || specifiedProvider === "youtube") {
    const finalYtId = youtubeId || extractYoutubeId(cleanUrl);
    if (finalYtId) {
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${finalYtId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`,
        originalUrl: cleanUrl,
        isIframe: true,
        isValid: true,
      };
    }
  }

  // 3. Check Vimeo
  const vimeoId = extractVimeoId(cleanUrl);
  if (vimeoId || cleanUrl.includes("vimeo.com") || specifiedProvider === "vimeo") {
    const finalVimeoId = vimeoId || extractVimeoId(cleanUrl);
    if (finalVimeoId) {
      return {
        provider: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${finalVimeoId}`,
        originalUrl: cleanUrl,
        isIframe: true,
        isValid: true,
      };
    }
  }

  // 4. Direct Video Link (Cloudinary, MP4, WebM, etc.)
  if (
    specifiedProvider === "cloudinary" ||
    specifiedProvider === "mp4" ||
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.includes("cloudinary.com")
  ) {
    return {
      provider: cleanUrl.includes("cloudinary.com") ? "cloudinary" : "mp4",
      embedUrl: cleanUrl,
      originalUrl: cleanUrl,
      isIframe: false,
      isValid: true,
    };
  }

  // Fallback for general URLs (tries iframe if valid URL structure, else raw video)
  return {
    provider: "unknown",
    embedUrl: cleanUrl,
    originalUrl: cleanUrl,
    isIframe: !cleanUrl.match(/\.(mp4|webm|ogg)$/i),
    isValid: Boolean(cleanUrl),
  };
}
