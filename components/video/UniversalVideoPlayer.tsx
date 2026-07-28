"use client";

import React, { useState } from "react";
import { parseVideoUrl, VideoProviderType } from "@/lib/videoUtils";
import { Play, AlertCircle, ExternalLink, RefreshCw, Video } from "lucide-react";

interface UniversalVideoPlayerProps {
  url?: string;
  provider?: VideoProviderType;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

export function UniversalVideoPlayer({
  url = "",
  provider,
  title = "Course Lesson Video",
  poster = "",
  autoPlay = false,
  className = "",
}: UniversalVideoPlayerProps) {
  const parsed = parseVideoUrl(url, provider);
  const [hasError, setHasError] = useState(false);

  if (!url || !parsed.isValid) {
    return (
      <div className={`relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-slate-800 rounded-xl ${className}`}>
        <div className="w-14 h-14 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mb-3 text-purple-400 shadow-inner">
          <Play className="w-7 h-7 ml-0.5" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
        <p className="text-xs text-slate-400 max-w-md">
          No video URL configured. Please add a valid YouTube, Google Drive, or MP4 video link.
        </p>
      </div>
    );
  }

  // 1. Render Google Drive / YouTube / Vimeo IFrame
  if (parsed.isIframe) {
    return (
      <div className={`relative aspect-video w-full bg-slate-950 overflow-hidden shadow-2xl ${className}`}>
        {hasError ? (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Video Load Error</h4>
            <p className="text-xs text-slate-400 max-w-md">
              {parsed.provider === "gdrive"
                ? "Unable to stream Google Drive video. Please ensure the Google Drive file permission is set to 'Anyone with the link can view'."
                : "The video stream could not be embedded. Please check the video link permissions."}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setHasError(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-purple-300 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
              <a
                href={parsed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-1 font-semibold hover:bg-purple-900"
              >
                Open Source Link <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={parsed.embedUrl}
            title={title}
            className="w-full h-full border-0 absolute inset-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setHasError(true)}
          />
        )}

        {/* Small Provider Badge in Player Overlay */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none opacity-0 hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-300 flex items-center gap-1.5 shadow-lg">
          <Video className="w-3 h-3 text-purple-400" />
          <span className="capitalize">{parsed.provider === "gdrive" ? "Google Drive" : parsed.provider} Player</span>
        </div>
      </div>
    );
  }

  // 2. Render Direct HTML5 Video Player (MP4 / Cloudinary)
  return (
    <div className={`relative aspect-video w-full bg-slate-950 overflow-hidden shadow-2xl ${className}`}>
      <video
        src={parsed.embedUrl}
        poster={poster}
        controls
        autoPlay={autoPlay}
        className="w-full h-full object-contain bg-black"
        onError={() => setHasError(true)}
      >
        Your browser does not support HTML5 embedded video playback.
      </video>
    </div>
  );
}
