"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { parseVideoUrl, VideoProviderType } from "@/lib/videoUtils";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Minimize2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface UniversalVideoPlayerProps {
  url?: string;
  provider?: VideoProviderType;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function UniversalVideoPlayer({
  url = "",
  provider,
  title = "Course Lesson Video",
  poster = "",
  autoPlay = false,
  className = "",
  onEnded,
}: UniversalVideoPlayerProps) {
  const parsed = parseVideoUrl(url, provider);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Providers where EduCore can control playback via API (YouTube or direct HTML5 video).
  // Google Drive and Vimeo provide their own full native player UI inside iframe.
  const hasCustomControls = parsed.provider === "youtube" || !parsed.isIframe;

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [slowLoadWarning, setSlowLoadWarning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(85); // 0 to 100
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset loading state and timeout whenever the video URL or parsed embed URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setSlowLoadWarning(false);

    const timer = setTimeout(() => {
      setSlowLoadWarning(true);
    }, 7000); // After 7 seconds, display helpful direct link option

    return () => clearTimeout(timer);
  }, [url, parsed.embedUrl]);

  // Network Preconnect & DNS prefetch to drastically cut down initial DNS/SSL latency for Drive/video origins
  useEffect(() => {
    if (parsed.provider === "gdrive") {
      const origins = [
        "https://drive.google.com",
        "https://googleusercontent.com",
        "https://video.google.com",
      ];
      origins.forEach((href) => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const preconnect = document.createElement("link");
          preconnect.rel = "preconnect";
          preconnect.href = href;
          preconnect.crossOrigin = "anonymous";
          document.head.appendChild(preconnect);

          const dnsPrefetch = document.createElement("link");
          dnsPrefetch.rel = "dns-prefetch";
          dnsPrefetch.href = href;
          document.head.appendChild(dnsPrefetch);
        }
      });
    }
  }, [parsed.provider]);

  // Send command to YouTube Iframe API
  const sendYoutubeCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: func,
          args: args,
        }),
        "*"
      );
    }
  }, []);

  // Listen for YouTube Iframe events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }
        if (data && data.event === "infoDelivery" && data.info) {
          if (data.info.currentTime !== undefined) {
            setCurrentTime(Math.floor(data.info.currentTime));
          }
          if (data.info.duration !== undefined && data.info.duration > 0) {
            setDuration(Math.floor(data.info.duration));
          }
          if (data.info.playerState !== undefined) {
            if (data.info.playerState === 1) setIsPlaying(true);
            if (data.info.playerState === 2) setIsPlaying(false);
            if (data.info.playerState === 0) {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }
          }
        } else if (data && data.event === "onStateChange") {
          if (data.info === 1) setIsPlaying(true);
          if (data.info === 2) setIsPlaying(false);
          if (data.info === 0) {
            setIsPlaying(false);
            if (onEnded) onEnded();
          }
        }
      } catch (e) {}
    };

    window.addEventListener("message", handleMessage);

    // Initial handshake with YouTube iframe
    const handshakeTimer = setTimeout(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "listening" }),
          "*"
        );
      }
    }, 1000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(handshakeTimer);
    };
  }, [onEnded]);

  // Track Fullscreen state across standard & vendor-prefixed browser APIs
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isNativeFs = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      if (!isNativeFs && isFullscreen) {
        // If native fullscreen was exited via browser gesture/ESC, update state
        setIsFullscreen(false);
      } else if (isNativeFs) {
        setIsFullscreen(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  // Lock body scroll during fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullscreen]);

  // Auto-hide controls in Fullscreen on inactivity
  const handleUserActivity = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isFullscreen) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (parsed.isIframe) {
      if (isPlaying) {
        sendYoutubeCommand("pauseVideo");
        setIsPlaying(false);
      } else {
        sendYoutubeCommand("playVideo");
        setIsPlaying(true);
      }
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Sound Controller: Volume Change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }

    if (parsed.isIframe) {
      sendYoutubeCommand("setVolume", [newVolume]);
      if (newVolume === 0) {
        sendYoutubeCommand("mute");
      } else {
        sendYoutubeCommand("unMute");
      }
    } else if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      videoRef.current.muted = newVolume === 0;
    }
  };

  // Sound Controller: Mute Toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (parsed.isIframe) {
      if (nextMuted) {
        sendYoutubeCommand("mute");
      } else {
        sendYoutubeCommand("unMute");
        sendYoutubeCommand("setVolume", [volume > 0 ? volume : 80]);
      }
    } else if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  // Seek +/- 10s
  const handleSeekOffset = (seconds: number) => {
    const target = Math.max(0, Math.min(duration || 9999, currentTime + seconds));
    handleSeek(target);
  };

  // Direct Seek to time
  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (parsed.isIframe) {
      sendYoutubeCommand("seekTo", [newTime, true]);
    } else if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Playback Rate
  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (parsed.isIframe) {
      sendYoutubeCommand("setPlaybackRate", [speed]);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Toggle Fullscreen with cross-browser and iOS Mobile Fallback
  const toggleFullscreen = () => {
    const doc = document as any;
    const container = containerRef.current as any;
    const isCurrentlyFullscreen = Boolean(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement ||
      isFullscreen
    );

    if (!isCurrentlyFullscreen) {
      // Enter Fullscreen
      const requestFs =
        container?.requestFullscreen ||
        container?.webkitRequestFullscreen ||
        container?.mozRequestFullScreen ||
        container?.msRequestFullscreen;

      if (requestFs) {
        try {
          const promise = requestFs.call(container);
          if (promise && typeof promise.then === "function") {
            promise.then(() => setIsFullscreen(true)).catch(() => {
              // Fallback for devices where requestFullscreen is blocked
              setIsFullscreen(true);
            });
          } else {
            setIsFullscreen(true);
          }
        } catch {
          setIsFullscreen(true);
        }
      } else {
        // iOS Safari on iPhone fallback (pseudo-fullscreen)
        setIsFullscreen(true);
      }
    } else {
      // Exit Fullscreen
      const exitFs =
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;

      if (exitFs && (doc.fullscreenElement || doc.webkitFullscreenElement)) {
        try {
          const promise = exitFs.call(doc);
          if (promise && typeof promise.then === "function") {
            promise.catch(() => {});
          }
        } catch {}
      }
      setIsFullscreen(false);
    }
  };

  // Format mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      className={`bg-black select-none flex flex-col transition-all duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-[999999] w-screen h-[100dvh] h-screen m-0 p-0 rounded-none border-none justify-between overflow-hidden"
          : `relative w-full overflow-hidden rounded-2xl shadow-2xl border border-slate-900 ${className}`
      }`}
    >
      {/* Top Overlay Bar in Fullscreen (Title + Exit Fullscreen) */}
      {isFullscreen && (
        <div
          className={`absolute top-0 inset-x-0 z-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-3.5 sm:p-5 flex items-center justify-between transition-opacity duration-300 ${
            showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}
        >
          <div className="flex items-center gap-2 max-w-[70%]">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">{title}</h3>
          </div>

          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-purple-600 border border-slate-700 hover:border-purple-400 text-white text-xs font-bold transition-all shadow-xl flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            title="Exit Fullscreen"
          >
            <Minimize2 className="w-4 h-4 text-purple-300" />
            <span className="text-[11px] sm:text-xs">Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* 1. MAIN VIDEO VIEWPORT (Expands to full height & width in portrait/landscape fullscreen) */}
      <div
        className={`relative w-full bg-black overflow-hidden flex-1 flex items-center justify-center min-h-0 ${
          isFullscreen ? "h-full max-h-full" : "aspect-video"
        }`}
      >
        {/* Loading Spinner & Status Screen Overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center select-none transition-all duration-300">
            {/* Animated glowing rings & spinner */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute w-24 h-24 rounded-full bg-purple-600/20 blur-xl animate-pulse" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/40 relative">
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              </div>
            </div>

            {/* Status badge & title */}
            <div className="space-y-1.5 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-semibold text-purple-300">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                {parsed.provider === "gdrive"
                  ? "Connecting Google Drive Stream..."
                  : parsed.provider === "youtube"
                  ? "Buffering YouTube Video..."
                  : parsed.provider === "vimeo"
                  ? "Buffering Vimeo Stream..."
                  : parsed.provider === "bunny"
                  ? "Connecting Bunny Stream CDN..."
                  : "Buffering Video Lecture..."}
              </div>

              <h4 className="text-sm font-bold text-white tracking-wide">
                {title || "Loading Lesson Video"}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {parsed.provider === "gdrive"
                  ? "Establishing secure stream with Google Drive servers. Initializing adaptive player..."
                  : "Optimizing connection bandwidth and preparing high-definition playback..."}
              </p>
            </div>

            {/* Indeterminate pulsing gradient progress bar */}
            <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-5">
              <div className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-pulse rounded-full" />
            </div>

            {/* Slow connection helper button if Drive takes more than 7s */}
            {slowLoadWarning && parsed.provider === "gdrive" && (
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <p className="text-[10px] text-amber-300/80">Google Drive stream buffering slower than usual?</p>
                <a
                  href={parsed.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-purple-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  Watch Directly on Google Drive <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Video Load Error</h4>
            <p className="text-xs text-slate-400 max-w-md">
              {parsed.provider === "gdrive"
                ? "Unable to stream Google Drive video. Please ensure the file permission is set to 'Anyone with the link can view'."
                : "The video stream could not be loaded. Please verify the URL."}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
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
        ) : parsed.isIframe ? (
          <div className={`w-full h-full relative overflow-hidden bg-black flex items-center justify-center ${isFullscreen ? "max-h-full aspect-video sm:aspect-auto" : ""}`}>
            <iframe
              ref={iframeRef}
              src={parsed.embedUrl}
              title={title}
              loading="eager"
              className={`w-full h-full border-0 absolute inset-0 bg-black transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
            {/* Google Drive Pop-Out Blocker Shield: Completely covers and disables the pop-out button */}
            {parsed.provider === "gdrive" && !isLoading && !hasError && (
              <div
                className="absolute top-0 right-0 w-20 h-16 z-30 bg-black select-none pointer-events-auto cursor-default transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                title=""
                aria-hidden="true"
              />
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            src={parsed.embedUrl}
            poster={poster}
            autoPlay={autoPlay}
            playsInline
            webkit-playsinline="true"
            preload="auto"
            className={`w-full h-full object-contain bg-black max-h-full transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoadedData={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(Math.floor(videoRef.current.currentTime));
                setDuration(Math.floor(videoRef.current.duration) || 0);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {/* Center Big Play Button when paused (Only for providers with EduCore custom control) */}
        {hasCustomControls && !isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-purple-600/90 hover:bg-purple-600 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 transition-transform hover:scale-110 z-20 cursor-pointer backdrop-blur-sm border border-white/20"
            title="Play Video"
          >
            <Play className="w-7 h-7 ml-1 fill-white" />
          </button>
        )}

        {/* Floating Quick Fullscreen Button on Top-Right Corner (when not in fullscreen) */}
        {hasCustomControls && !isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-purple-600 border border-slate-700 hover:border-purple-400 text-white text-xs font-bold transition-all shadow-xl flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-purple-300" />
            <span>Fullscreen</span>
          </button>
        )}
      </div>

      {/* 2. ALWAYS-VISIBLE / AUTO-HIDING EDUCORE CONTROLLER BAR (Only for YouTube and Direct Video) */}
      {hasCustomControls && (
        <div
          className={`w-full bg-slate-950/95 border-t border-slate-800/90 px-3 sm:px-5 py-2.5 space-y-2 z-30 relative transition-all duration-300 ${
            isFullscreen && !showControls ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 pointer-events-auto translate-y-0"
          }`}
        style={{
          paddingBottom: isFullscreen ? "max(env(safe-area-inset-bottom, 12px), 12px)" : undefined,
          paddingLeft: isFullscreen ? "max(env(safe-area-inset-left, 12px), 12px)" : undefined,
          paddingRight: isFullscreen ? "max(env(safe-area-inset-right, 12px), 12px)" : undefined,
        }}
      >
        {/* Progress / Seek Slider */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full h-1.5 accent-purple-500 bg-slate-800 rounded-lg cursor-pointer transition-all hover:h-2"
          />
        </div>

        {/* Control Bar Actions Row */}
        <div className="flex items-center justify-between gap-3 text-white flex-wrap sm:flex-nowrap">
          {/* Left: Play/Pause, Rewind, Forward, Sound Controller, Timestamp */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
            </button>

            {/* -10s */}
            <button
              onClick={() => handleSeekOffset(-10)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* +10s */}
            <button
              onClick={() => handleSeekOffset(10)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* 🔊 SOUND CONTROLLER (Volume Slider + Mute Button) */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 50 ? (
                  <Volume1 className="w-4 h-4 text-purple-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-purple-400" />
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-16 sm:w-24 h-1.5 accent-purple-500 bg-slate-800 rounded-lg cursor-pointer"
                  title={`Volume: ${isMuted ? 0 : volume}%`}
                />
                <span className="text-[10px] font-mono text-slate-400 w-7 hidden sm:inline">
                  {isMuted ? "0%" : `${volume}%`}
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-[11px] font-mono text-slate-300 hidden md:block">
              <span>{formatTime(currentTime)}</span>
              {duration > 0 && <span className="text-slate-500"> / {formatTime(duration)}</span>}
            </div>
          </div>

          {/* Right: Speed & Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Speed Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-1.5 py-0.5">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    playbackRate === rate
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* ⛶ FULLSCREEN BUTTON */}
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer hover:scale-105"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
