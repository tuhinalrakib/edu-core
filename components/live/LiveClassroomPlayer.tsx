"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Hand,
  Maximize2,
  Minimize2,
  Radio,
  Shield,
  Users,
  Sparkles,
  Volume2,
  VolumeX,
  PhoneOff,
  Settings,
  Flame,
  CheckCircle,
} from "lucide-react";
import { Participant } from "@/hooks/useWebRTC";

interface LiveClassroomPlayerProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isHost?: boolean;
  userName: string;
  userRole?: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  micVolume: number;
  participants: Participant[];
  connectionStatus: "disconnected" | "connecting" | "connected" | "failed";
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRaiseHand: () => void;
  onLeaveClass?: () => void;
  onEndClass?: () => void;
}

export const LiveClassroomPlayer: React.FC<LiveClassroomPlayerProps> = ({
  localStream,
  remoteStream,
  isHost = false,
  userName,
  userRole = "student",
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  micVolume,
  participants,
  connectionStatus,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRaiseHand,
  onLeaveClass,
  onEndClass,
}) => {
  const primaryVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [trackRevision, setTrackRevision] = useState(0);

  // Primary stream: For Host -> localStream; For Viewer -> remoteStream
  const primaryStream = isHost ? localStream : (remoteStream || localStream);
  const pipStream = isHost ? remoteStream : localStream;

  // Track event listeners to re-evaluate when screen share or camera starts/stops
  useEffect(() => {
    if (!primaryStream) return;
    const handleTrackUpdate = () => setTrackRevision((r) => r + 1);

    primaryStream.addEventListener("addtrack", handleTrackUpdate);
    primaryStream.addEventListener("removetrack", handleTrackUpdate);

    primaryStream.getTracks().forEach((track) => {
      track.addEventListener("unmute", handleTrackUpdate);
      track.addEventListener("mute", handleTrackUpdate);
      track.addEventListener("ended", handleTrackUpdate);
    });

    if (primaryVideoRef.current) {
      primaryVideoRef.current.srcObject = primaryStream;
      primaryVideoRef.current.play().catch(() => {});
    }

    return () => {
      primaryStream.removeEventListener("addtrack", handleTrackUpdate);
      primaryStream.removeEventListener("removetrack", handleTrackUpdate);
      primaryStream.getTracks().forEach((track) => {
        track.removeEventListener("unmute", handleTrackUpdate);
        track.removeEventListener("mute", handleTrackUpdate);
        track.removeEventListener("ended", handleTrackUpdate);
      });
    };
  }, [primaryStream, trackRevision]);

  // Bind PiP video stream
  useEffect(() => {
    if (pipVideoRef.current && pipStream) {
      pipVideoRef.current.srcObject = pipStream;
      pipVideoRef.current.play().catch(() => {});
    }
  }, [pipStream]);

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

  // Handle Fullscreen Toggle with cross-browser and iOS Mobile Fallback
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
              setIsFullscreen(true);
            });
          } else {
            setIsFullscreen(true);
          }
        } catch {
          setIsFullscreen(true);
        }
      } else {
        setIsFullscreen(true);
      }
    } else {
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

  // Auto-hide controls on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => setShowControls(false), 4000);
    setControlsTimeout(timeout);
  };

  // Detect whether active video tracks exist
  const liveVideoTracks = primaryStream
    ? primaryStream.getVideoTracks().filter((t) => t.readyState === "live" && t.enabled)
    : [];

  const isPrimaryVideoTrackActive = isHost
    ? (!isVideoOff || isScreenSharing) && liveVideoTracks.length > 0
    : liveVideoTracks.length > 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      id="live-classroom-container"
      className={`select-none flex flex-col justify-between transition-all duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-[999999] w-screen h-[100dvh] h-screen m-0 p-0 rounded-none border-none bg-[#05070e] overflow-hidden"
          : "relative w-full h-full bg-[#05070e] rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl group"
      }`}
    >
      {/* 1. TOP STATUS BAR OVERLAY */}
      <div
        className={`absolute top-3 left-3 right-3 z-30 flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        style={{ paddingTop: isFullscreen ? "max(env(safe-area-inset-top, 0px), 0px)" : undefined }}
      >
        {/* Live Broadcast Badge */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-rose-500/40 shadow-xl shadow-rose-950/30">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute" />
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 pl-1.5 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>WEBRTC LIVE STREAM</span>
          </span>
        </div>

        {/* Network & Mode Status Info */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isHost ? (
            <span className="bg-purple-900/80 backdrop-blur-md text-purple-200 border border-purple-500/40 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Host Broadcaster</span>
            </span>
          ) : (
            <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/60 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Interactive Viewer</span>
            </span>
          )}

          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-slate-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>{participants.length + 1} Connected</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs shadow-lg cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. PRIMARY MAIN VIDEO STAGE */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-[#070a14] overflow-hidden">
        {/* Native Video element */}
        <video
          ref={primaryVideoRef}
          autoPlay
          playsInline
          muted={isHost}
          className={`w-full h-full object-contain ${
            !isPrimaryVideoTrackActive ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />

        {/* Video Off Placeholder */}
        {!isPrimaryVideoTrackActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-900 to-indigo-900 border-2 border-purple-500/40 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-purple-900/60">
                {isHost ? (userName ? userName[0].toUpperCase() : "I") : "🎙️"}
              </div>
              {isScreenSharing && (
                <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 border-2 border-slate-950 flex items-center justify-center text-white shadow-lg">
                  <Monitor className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-white">
                {isHost ? userName : "Instructor Live Audio Stream"}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                {isScreenSharing
                  ? "Screen sharing is active"
                  : isHost
                  ? "Your camera is currently turned off. Microphone is active."
                  : "Camera is off. Audio and interactive tools are broadcasting live."}
              </p>
            </div>

            {/* Audio Volume Wave Indicator */}
            {micVolume > 5 && (
              <div className="flex items-center gap-1 bg-slate-950/80 px-4 py-2 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Speaking ({micVolume}%)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Floating PiP (Student/Self Preview) */}
        {!isHost && pipStream && (
          <div className="absolute bottom-20 right-4 w-36 sm:w-44 h-24 sm:h-30 rounded-2xl overflow-hidden bg-slate-950 border border-purple-500/40 shadow-2xl z-20 transition-all hover:scale-105">
            <video
              ref={pipVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-slate-950/80 px-1.5 py-0.5 rounded-md">
              You ({userName.split(" ")[0]})
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM FLOATING CONTROLS DOCK */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 w-auto max-w-[95%] ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ bottom: isFullscreen ? "max(env(safe-area-inset-bottom, 12px), 12px)" : undefined }}
      >
        <div className="bg-slate-950/85 backdrop-blur-xl border border-purple-500/30 rounded-2xl sm:rounded-full px-4 py-2.5 flex items-center justify-center gap-2 sm:gap-3 shadow-2xl shadow-black/80">
          {/* Microphone Toggle with Volume Bar */}
          <div className="relative group">
            <button
              onClick={onToggleAudio}
              className={`p-3 rounded-xl sm:rounded-full transition-all flex items-center justify-center cursor-pointer ${
                isAudioMuted
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40"
                  : "bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700"
              }`}
              title={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            {!isAudioMuted && micVolume > 5 && (
              <span
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping"
                title={`Mic Active: ${micVolume}%`}
              />
            )}
          </div>

          {/* Camera Toggle */}
          <button
            onClick={onToggleVideo}
            className={`p-3 rounded-xl sm:rounded-full transition-all flex items-center justify-center cursor-pointer ${
              isVideoOff
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40"
                : "bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700"
            }`}
            title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          {/* Screen Sharing Toggle */}
          <button
            onClick={onToggleScreenShare}
            className={`p-3 rounded-xl sm:rounded-full transition-all flex items-center justify-center cursor-pointer ${
              isScreenSharing
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40"
                : "bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700"
            }`}
            title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
          >
            {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </button>

          {/* Raise Hand Toggle (Student & Viewer) */}
          {!isHost && (
            <button
              onClick={onToggleRaiseHand}
              className={`p-3 rounded-xl sm:rounded-full transition-all flex items-center justify-center cursor-pointer ${
                isHandRaised
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/40 animate-pulse"
                  : "bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700"
              }`}
              title={isHandRaised ? "Lower Hand" : "Raise Hand to Ask Question"}
            >
              <Hand className="w-4 h-4" />
            </button>
          )}

          <div className="w-[1px] h-6 bg-slate-800 mx-1 hidden sm:block" />

          {/* Host / Participant Action */}
          {isHost ? (
            <button
              onClick={onEndClass}
              className="px-4 py-2.5 rounded-xl sm:rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
              title="End Live Stream for Everyone"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">End Stream</span>
            </button>
          ) : (
            <button
              onClick={onLeaveClass}
              className="px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Leave Live Classroom"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
