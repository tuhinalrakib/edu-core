"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Radio,
  Clock,
  Users,
  BookOpen,
  ArrowLeft,
  Share2,
  Download,
  CheckCircle,
  Shield,
  MessageSquare,
  FileText,
  AlertCircle,
  Play,
  Sparkles,
  Send,
  Loader2,
  Calendar,
  Hand,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LiveClassroomPlayer } from "@/components/live/LiveClassroomPlayer";
import { EduCoreLoader } from "@/components/EduCoreLoader";
import { useWebRTC } from "@/hooks/useWebRTC";
import Swal from "sweetalert2";

export default function LiveClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const classId = params.classId as string;

  const [liveClass, setLiveClass] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSideTab, setActiveSideTab] = useState<"chat" | "attendees" | "info" | "notes">("chat");
  const [studentNotes, setStudentNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [chatInputText, setChatInputText] = useState("");
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const isTeacherHost = Boolean(
    user &&
    liveClass &&
    (user.role === "admin" ||
      user.id === liveClass.teacher?._id?.toString() ||
      user.id === liveClass.teacher?.id?.toString() ||
      user.id === liveClass.teacher?.toString())
  );

  const userPayload = React.useMemo(() => {
    if (!user) return null;
    return {
      id: user.id || (user as any)._id,
      name: user.name || "Student",
      role: user.role || "student",
      avatar: user.avatar,
    };
  }, [user?.id, (user as any)?._id, user?.name, user?.role, user?.avatar]);

  // Native WebRTC & Socket.io Live Streaming Engine
  const {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isHandRaised,
    participants,
    chatMessages,
    connectionStatus,
    micVolume,
    activeSpeaker,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleRaiseHand,
    sendMessage,
    broadcastStreamStatus,
  } = useWebRTC({
    classId,
    user: userPayload,
    isHost: isTeacherHost,
    onStreamStatusChange: (status) => {
      setLiveClass((prev: any) => (prev ? { ...prev, status } : prev));
    },
  });

  const currentUserId = user?.id || (user as any)?._id;
  const remotePeers = React.useMemo(() => {
    return participants.filter((p) => p.userId && p.userId !== currentUserId);
  }, [participants, currentUserId]);
  const totalLiveUsers = 1 + remotePeers.length;

  // Fetch Live Class details with real-time polling
  useEffect(() => {
    let timer: any = null;

    const fetchClassDetails = async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      const activeToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("educore_token") || localStorage.getItem("token")
          : null);

      try {
        let res = await fetch(`${API_BASE_URL}/live-classes/session/${classId}?t=${Date.now()}`, {
          headers: {
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
        });
        let data = await res.json();

        if (!data.success) {
          res = await fetch(`${API_BASE_URL}/live-classes/${classId}?t=${Date.now()}`, {
            headers: {
              ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
            },
          });
          data = await res.json();
        }

        if (data.success && data.liveClass) {
          setLiveClass(data.liveClass);

          // If student, register attendance
          if (activeToken && user && user.role === "student") {
            fetch(`${API_BASE_URL}/live-classes/${classId}/join`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${activeToken}`,
              },
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error("Failed to load live class:", err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    };

    if (classId) {
      fetchClassDetails(true);
      timer = setInterval(() => {
        fetchClassDetails(false);
      }, 5000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [classId, user]);

  // Load saved student notes from localStorage
  useEffect(() => {
    if (classId) {
      const savedNotes = localStorage.getItem(`educore_notes_${classId}`);
      if (savedNotes) setStudentNotes(savedNotes);
    }
  }, [classId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeSideTab === "chat") {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeSideTab]);

  const handleSaveNotes = (val: string) => {
    setStudentNotes(val);
    localStorage.setItem(`educore_notes_${classId}`, val);
  };

  const handleDownloadNotes = () => {
    const blob = new Blob(
      [
        `EduCore Live Class Notes\nSession: ${liveClass?.title}\nDate: ${new Date().toLocaleString()}\n\n${studentNotes}`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${liveClass?.title || "class"}.txt`;
    a.click();
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    sendMessage(chatInputText);
    setChatInputText("");
  };

  const handleStatusChange = async (newStatus: "scheduled" | "live" | "completed") => {
    const token = localStorage.getItem("token") || localStorage.getItem("educore_token");
    if (!token) return;

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/${classId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.liveClass) {
        setLiveClass(data.liveClass);
        broadcastStreamStatus(newStatus);
        Swal.fire({
          icon: "success",
          title: `Status: ${newStatus.toUpperCase()}`,
          text:
            newStatus === "live"
              ? "Class is now LIVE! Broadcasted to all students."
              : "Class status updated successfully.",
          timer: 2000,
          showConfirmButton: false,
          background: "#0f172a",
          color: "#ffffff",
        });
      }
    } catch (e) {
      console.error("Status update error:", e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070a12] flex items-center justify-center">
        <EduCoreLoader message="Connecting to EduCore Native WebRTC Live Classroom" />
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-10 rounded-3xl border border-slate-800 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Live Session Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">
            This live class session could not be located or has expired.
          </p>
          <Link
            href="/student/dashboard?tab=liveClasses"
            className="px-6 py-3 rounded-xl text-xs font-bold text-white gradient-button inline-flex items-center gap-2"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const courseTitle = liveClass.course?.title || "Enrolled Course";
  const teacherName = liveClass.teacherName || liveClass.teacher?.name || "Senior Instructor";

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 flex flex-col">
      {/* 1. TOP CLASSROOM NAV BAR */}
      <header className="h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (user?.role === "teacher") router.push("/teacher/dashboard");
              else router.push("/student/dashboard?tab=liveClasses");
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 truncate max-w-xs">
                {courseTitle}
              </span>
              {liveClass.status === "live" ? (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Live</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {liveClass.status.toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
              {liveClass.title}
            </h1>
          </div>
        </div>

        {/* Host Control / Session Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isTeacherHost ? (
            <div className="flex items-center gap-2">
              {liveClass.status !== "live" ? (
                <button
                  onClick={() => handleStatusChange("live")}
                  disabled={isUpdatingStatus}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isUpdatingStatus ? "Starting..." : "Start Live Stream"}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange("completed")}
                  disabled={isUpdatingStatus}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-xs font-bold text-white flex items-center gap-1.5 border border-rose-500/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>End Session</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Instructor:</span>
              <span className="text-xs font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2.5 py-1 rounded-xl">
                {teacherName}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Active Speaker / Hand Raised Alert Banner */}
      {activeSpeaker && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-black flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <Hand className="w-4 h-4 animate-bounce" />
          <span>{activeSpeaker} raised their hand with a question!</span>
        </div>
      )}

      {/* 2. MAIN CLASSROOM LAYOUT */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden p-3 sm:p-4 gap-4">
        {/* Main Native Video Stream Container (75% width on desktop) */}
        <div className="lg:col-span-3 h-[60vh] lg:h-[calc(100vh-6rem)]">
          {liveClass.status === "live" ? (
            <LiveClassroomPlayer
              localStream={localStream}
              remoteStream={remoteStream}
              isHost={isTeacherHost}
              userName={user?.name || "Participant"}
              userRole={user?.role || "student"}
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isScreenSharing={isScreenSharing}
              isHandRaised={isHandRaised}
              micVolume={micVolume}
              participants={remotePeers}
              connectionStatus={connectionStatus}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onToggleScreenShare={toggleScreenShare}
              onToggleRaiseHand={toggleRaiseHand}
              onLeaveClass={() => {
                if (user?.role === "teacher") router.push("/teacher/dashboard");
                else router.push("/student/dashboard?tab=liveClasses");
              }}
              onEndClass={() => handleStatusChange("completed")}
            />
          ) : liveClass.status === "completed" ? (
            <div className="w-full h-full bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Live Class Ended</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  This live interactive lecture has concluded. Thank you for participating!
                </p>
              </div>
              <Link
                href={
                  user?.role === "teacher"
                    ? "/teacher/dashboard"
                    : "/student/dashboard?tab=liveClasses"
                }
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white gradient-button inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          ) : isTeacherHost ? (
            /* Teacher Studio Launchpad */
            <div className="w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl space-y-5">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-20 h-20 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center shadow-xl shadow-emerald-900/40 relative z-10">
                <Radio className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>

              <div className="relative z-10 space-y-2 max-w-lg">
                {/* <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Native WebRTC Studio Control</span>
                </div> */}
                <h2 className="text-xl sm:text-2xl font-black text-white">{liveClass.title}</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  You are the Instructor. Click below to start broadcasting live via WebRTC to all
                  enrolled students without third-party plugins.
                </p>
              </div>

              <div className="relative z-10 pt-2">
                <button
                  onClick={() => handleStatusChange("live")}
                  disabled={isUpdatingStatus}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm flex items-center gap-3 shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Radio className="w-5 h-5 animate-ping" />
                  <span>{isUpdatingStatus ? "Starting Live Stream..." : "🔴 Start Live Stream Now"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Student Waiting Room */
            <div className="w-full h-full bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 rounded-2xl border border-purple-500/30 flex flex-col items-center justify-center p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center relative shadow-2xl shadow-purple-900/50">
                  <div className="w-20 h-20 rounded-full bg-purple-900/30 animate-ping absolute" />
                  <Radio className="w-10 h-10 text-purple-400 animate-pulse relative z-10" />
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-slate-950" />
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Waiting Room • Instructor Has Not Started Yet</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white max-w-lg mb-2">
                {liveClass.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                Instructor <strong className="text-purple-300">{teacherName}</strong> has not
                started the live video broadcast yet. Please hold on — this screen is live and
                watching for the stream!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 mb-6 text-left text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Scheduled Time
                    </span>
                    <span className="font-bold text-white text-xs">
                      {new Date(liveClass.scheduledStartTime).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Duration
                    </span>
                    <span className="font-bold text-white text-xs">
                      {liveClass.durationMinutes} Minutes
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-purple-300 bg-purple-950/40 border border-purple-500/30 px-4 py-2 rounded-xl mb-6">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>
                  ⚡ Auto-Connecting: You will automatically join the WebRTC video stream the second
                  the teacher goes live!
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/student/dashboard?tab=liveClasses"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Dashboard</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Interactive Sidebar (25% width on desktop) */}
        <div className="lg:col-span-1 h-full flex flex-col bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          {/* Sidebar Tabs Header */}
          <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-950/60 p-1">
            <button
              onClick={() => setActiveSideTab("chat")}
              className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeSideTab === "chat"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveSideTab("attendees")}
              className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeSideTab === "attendees"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Peers ({totalLiveUsers})</span>
            </button>
            <button
              onClick={() => setActiveSideTab("info")}
              className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeSideTab === "info"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Info</span>
            </button>
            <button
              onClick={() => setActiveSideTab("notes")}
              className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeSideTab === "notes"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>
          </div>

          {/* Sidebar Tab Contents */}
          <div className="flex-1 p-3 overflow-y-auto space-y-4 flex flex-col justify-between">
            {/* TAB 1: REAL-TIME GROUP CHAT */}
            {activeSideTab === "chat" && (
              <div className="flex-1 flex flex-col justify-between h-full space-y-3">
                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[calc(100vh-14rem)] pr-1">
                  {chatMessages.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs space-y-1">
                      <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-bold text-slate-400">Classroom Live Chat</p>
                      <p className="text-[11px]">Send a message to interact with everyone live.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderId === user?.id || msg.senderId === (user as any)?._id;
                      const isTeacher = msg.senderRole === "teacher" || msg.senderRole === "admin";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`text-[10px] font-bold ${
                                isTeacher ? "text-purple-400" : isMe ? "text-emerald-400" : "text-slate-400"
                              }`}
                            >
                              {msg.senderName} {isTeacher && "★"}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div
                            className={`p-2.5 rounded-2xl text-xs max-w-[85%] break-words leading-relaxed ${
                              isMe
                                ? "bg-purple-600 text-white rounded-br-none"
                                : isTeacher
                                ? "bg-purple-950/80 border border-purple-500/40 text-purple-100 rounded-bl-none"
                                : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="Type in live chat..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer"
                    title="Send"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: LIVE WEBRTC PEERS */}
            {activeSideTab === "attendees" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span>Connected Members</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{totalLiveUsers} Active</span>
                  </span>
                </div>

                {/* Current User Card */}
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      {(user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-white block truncate max-w-[120px]">
                        {user?.name || "You"} (You)
                      </span>
                      <span className="text-[10px] text-purple-300 capitalize">
                        {isTeacherHost ? "Host Instructor" : user?.role || "Student"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    {isAudioMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                    {isVideoOff ? <VideoOff className="w-3.5 h-3.5 text-slate-500" /> : <Video className="w-3.5 h-3.5 text-purple-400" />}
                    {isHandRaised && <Hand className="w-3.5 h-3.5 text-amber-400 animate-bounce" />}
                  </div>
                </div>

                {/* Remote Participants */}
                <div className="space-y-2">
                  {remotePeers.length > 0 ? (
                    remotePeers.map((p) => (
                      <div
                        key={p.userId || p.socketId}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs">
                            {(p.name || "P")[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block truncate max-w-[120px]">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-500 capitalize">{p.role}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {p.isHandRaised && <Hand className="w-3.5 h-3.5 text-amber-400 animate-bounce" />}
                          {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                          {p.isVideoOff ? <VideoOff className="w-3.5 h-3.5 text-slate-600" /> : <Video className="w-3.5 h-3.5 text-purple-400" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">
                      No other participants connected yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: AGENDA & CLASS INFO */}
            {activeSideTab === "info" && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-purple-400">
                    Class Information
                  </span>
                  <h4 className="font-bold text-white text-sm">{liveClass.title}</h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {liveClass.description ||
                      "Interactive live session covering modern web technologies and project QA."}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Duration</span>
                    </span>
                    <span className="font-bold text-white">{liveClass.durationMinutes} mins</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hosted By</span>
                    </span>
                    <span className="font-bold text-white">{teacherName}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-300 space-y-1.5">
                  <span className="font-bold block text-white">💡 Live Interaction Tips:</span>
                  <p>• Use the "Raise Hand" button in the dock to notify the instructor.</p>
                  <p>• Use "Share Screen" when presenting code or projects.</p>
                  <p>• Low-latency native WebRTC P2P encryption is active.</p>
                </div>
              </div>
            )}

            {/* TAB 4: STUDENT NOTEPAD */}
            {activeSideTab === "notes" && (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-bold text-purple-400">Class Notes (Auto-Saved)</span>
                  <button
                    onClick={handleDownloadNotes}
                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Export Notes as TXT"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={studentNotes}
                  onChange={(e) => handleSaveNotes(e.target.value)}
                  placeholder="Type notes, code snippets, or questions here during the live lecture..."
                  className="w-full flex-1 min-h-[220px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none font-mono"
                />

                <p className="text-[10px] text-slate-500 text-center">
                  Notes are saved in your browser storage automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
