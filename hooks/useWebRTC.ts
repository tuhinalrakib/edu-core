"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api";

const SOCKET_SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

export interface Participant {
  socketId: string;
  userId: string;
  name: string;
  role: string;
  avatar?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
}

interface UseWebRTCOptions {
  classId: string;
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  } | null;
  isHost?: boolean;
  onStreamStatusChange?: (status: "live" | "completed" | "scheduled") => void;
}

export function useWebRTC({
  classId,
  user,
  isHost = false,
  onStreamStatusChange,
}: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "failed"
  >("disconnected");
  const [micVolume, setMicVolume] = useState<number>(0);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  const userRef = useRef(user);
  userRef.current = user;
  const onStreamStatusChangeRef = useRef(onStreamStatusChange);
  onStreamStatusChangeRef.current = onStreamStatusChange;

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Helper to deduplicate participants list by userId and exclude self
  const dedupeParticipants = useCallback((list: Participant[]) => {
    const currentUserId = userRef.current?.id;
    const map = new Map<string, Participant>();
    for (const p of list) {
      if (p.userId && (!currentUserId || p.userId !== currentUserId)) {
        map.set(p.userId, p);
      }
    }
    return Array.from(map.values());
  }, []);

  // 1. Throttled Audio Visualizer Meter
  const setupAudioMeter = useCallback((stream: MediaStream) => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }

      const audioContext = new AudioCtx();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastVol = 0;
      let lastCheckTime = Date.now();

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const now = Date.now();

        if (now - lastCheckTime > 350) {
          const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
          const currentVol = Math.min(100, Math.round((avg / 128) * 100));
          if (Math.abs(currentVol - lastVol) > 15 || (currentVol > 10 !== lastVol > 10)) {
            lastVol = currentVol;
            lastCheckTime = now;
            setMicVolume(currentVol);
          }
        }
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      console.warn("Audio meter init error:", e);
    }
  }, []);

  // 2. Capture Local Camera & Mic Stream (With Smart Hardware Detection)
  const initLocalMedia = useCallback(async () => {
    try {
      if (localStreamRef.current) return localStreamRef.current;
      if (typeof window === "undefined" || !navigator.mediaDevices) return null;

      let hasCamera = true;
      try {
        if (navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          hasCamera = devices.some((d) => d.kind === "videoinput");
        }
      } catch (e) {}

      let stream: MediaStream;
      if (hasCamera) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
          });
        } catch (vErr) {
          // Camera in use by another tab or blocked -> fallback to microphone smoothly
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          setIsVideoOff(true);
        }
      } else {
        // No physical webcam present -> microphone audio stream
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setIsVideoOff(true);
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      cameraVideoTrackRef.current = stream.getVideoTracks()[0] || null;
      setupAudioMeter(stream);
      return stream;
    } catch (err: any) {
      console.warn("Audio/Video device acquisition skipped or unavailable:", err?.message || err);
      return null;
    }
  }, [setupAudioMeter]);

  // 3. Create or Get Peer Connection with complete Transceiver negotiation
  const createPeerConnection = useCallback(
    (remoteSocketId: string) => {
      if (peerConnectionsRef.current.has(remoteSocketId)) {
        return peerConnectionsRef.current.get(remoteSocketId)!;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Ensure transceivers exist for both audio and video so SDP exchange is always ready
      try {
        pc.addTransceiver("audio", { direction: "sendrecv" });
        pc.addTransceiver("video", { direction: "sendrecv" });
      } catch (e) {}

      // Attach active tracks (Screen Share or Webcam/Mic)
      const currentActiveStream = screenStreamRef.current || localStreamRef.current;
      if (currentActiveStream) {
        currentActiveStream.getTracks().forEach((track) => {
          const senders = pc.getSenders();
          const existingSender = senders.find((s) => s.track && s.track.kind === track.kind);
          if (existingSender) {
            existingSender.replaceTrack(track).catch(() => {});
          } else {
            pc.addTrack(track, currentActiveStream);
          }
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("live-class:ice-candidate", {
            to: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];
          setRemoteStream(stream);
          setConnectionStatus("connected");

          event.track.onunmute = () => {
            setRemoteStream(new MediaStream(stream.getTracks()));
          };
          event.track.onended = () => {
            setRemoteStream(new MediaStream(stream.getTracks()));
          };
        } else if (event.track) {
          setRemoteStream((prev) => {
            const tracks = prev
              ? [...prev.getTracks().filter((t) => t.id !== event.track.id), event.track]
              : [event.track];
            return new MediaStream(tracks);
          });
          setConnectionStatus("connected");
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setConnectionStatus("connected");
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          setConnectionStatus("failed");
        }
      };

      peerConnectionsRef.current.set(remoteSocketId, pc);
      return pc;
    },
    []
  );

  // 4. Socket.io Connection & Signaling
  const userId = user?.id;

  useEffect(() => {
    if (!classId || !userId) return;

    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });
    socketRef.current = socket;

    socket.on("connect", async () => {
      setConnectionStatus("connecting");
      await initLocalMedia();

      const currentUser = userRef.current;
      if (currentUser) {
        socket.emit("live-class:join-room", {
          classId,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            avatar: currentUser.avatar,
          },
        });
      }
    });

    socket.on("live-class:existing-participants", async (data: { participants: Participant[] }) => {
      setParticipants(dedupeParticipants(data.participants || []));

      if (isHost && Array.isArray(data.participants)) {
        for (const peer of data.participants) {
          const pc = createPeerConnection(peer.socketId);
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);
            socket.emit("live-class:signal-offer", {
              to: peer.socketId,
              offer,
            });
          } catch (err) {
            console.error("Error creating WebRTC offer:", err);
          }
        }
      }
    });

    socket.on("live-class:user-joined", async (data: { participant: Participant; participants: Participant[] }) => {
      setParticipants(dedupeParticipants(data.participants || []));
      const pc = createPeerConnection(data.participant.socketId);

      if (isHost) {
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          socket.emit("live-class:signal-offer", {
            to: data.participant.socketId,
            offer,
          });
        } catch (err) {
          console.error("Error creating offer for new user:", err);
        }
      }
    });

    socket.on("live-class:signal-offer", async (data: { from: string; offer: any }) => {
      const pc = createPeerConnection(data.from);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("live-class:signal-answer", {
          to: data.from,
          answer,
        });
      } catch (err) {
        console.error("Error handling SDP offer:", err);
      }
    });

    socket.on("live-class:signal-answer", async (data: { from: string; answer: any }) => {
      const pc = peerConnectionsRef.current.get(data.from);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
          console.error("Error setting remote description from answer:", err);
        }
      }
    });

    socket.on("live-class:ice-candidate", async (data: { from: string; candidate: any }) => {
      const pc = peerConnectionsRef.current.get(data.from);
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    socket.on("live-class:participant-media-changed", (data: any) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === data.socketId ? { ...p, ...data } : p))
      );
    });

    socket.on("live-class:hand-raised-update", (data: { socketId: string; userId: string; userName: string; isRaised: boolean }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.socketId === data.socketId ? { ...p, isHandRaised: data.isRaised } : p
        )
      );
      if (data.isRaised && isHost) {
        setActiveSpeaker(data.userName);
        setTimeout(() => setActiveSpeaker(null), 5000);
      }
    });

    socket.on("live-class:new-chat-message", (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on("live-class:status-updated", (data: { classId: string; status: "live" | "completed" | "scheduled" }) => {
      if (data.classId === classId && onStreamStatusChangeRef.current) {
        onStreamStatusChangeRef.current(data.status);
      }
    });

    socket.on("live-class:user-left", (data: { socketId: string; participants: Participant[] }) => {
      if (data.participants) {
        setParticipants(dedupeParticipants(data.participants));
      }
      const pc = peerConnectionsRef.current.get(data.socketId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(data.socketId);
      }
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      if (socketRef.current) {
        socketRef.current.emit("live-class:leave-room");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [classId, userId, isHost, initLocalMedia, createPeerConnection, dedupeParticipants]);

  // 5. Microphone Toggle
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const nextEnabled = !audioTrack.enabled;
        audioTrack.enabled = nextEnabled;
        setIsAudioMuted(!nextEnabled);

        if (socketRef.current) {
          socketRef.current.emit("live-class:media-state-change", {
            classId,
            isMuted: !nextEnabled,
          });
        }
      }
    }
  }, [classId]);

  // 6. Camera Toggle
  const toggleVideo = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const nextEnabled = !videoTrack.enabled;
        videoTrack.enabled = nextEnabled;
        setIsVideoOff(!nextEnabled);

        // Update senders
        for (const pc of peerConnectionsRef.current.values()) {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === "video");
          if (videoSender && videoSender.track) {
            videoSender.track.enabled = nextEnabled;
          }
        }

        if (socketRef.current) {
          socketRef.current.emit("live-class:media-state-change", {
            classId,
            isVideoOff: !nextEnabled,
          });
        }
      }
    }
  }, [classId]);

  // 7. Screen Sharing Toggle with Full WebRTC Renegotiation to all peers
  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            frameRate: { ideal: 30 },
          } as any,
          audio: true,
        });
        screenStreamRef.current = screenStream;
        const screenVideoTrack = screenStream.getVideoTracks()[0];

        // Replace track on all active peer connections AND trigger renegotiation
        for (const [remoteSocketId, pc] of peerConnectionsRef.current.entries()) {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === "video");
          if (videoSender) {
            await videoSender.replaceTrack(screenVideoTrack);
          } else {
            pc.addTrack(screenVideoTrack, screenStream);
          }

          // Trigger renegotiation offer so viewers immediately receive the screen stream
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);
            if (socketRef.current) {
              socketRef.current.emit("live-class:signal-offer", {
                to: remoteSocketId,
                offer,
              });
            }
          } catch (offerErr) {
            console.warn("Screen share renegotiation error:", offerErr);
          }
        }

        setLocalStream(screenStream);
        setIsScreenSharing(true);
        setIsVideoOff(false);

        if (socketRef.current) {
          socketRef.current.emit("live-class:media-state-change", {
            classId,
            isScreenSharing: true,
            isVideoOff: false,
          });
        }

        screenVideoTrack.onended = async () => {
          if (cameraVideoTrackRef.current && localStreamRef.current) {
            for (const [remoteSocketId, pc] of peerConnectionsRef.current.entries()) {
              const senders = pc.getSenders();
              const videoSender = senders.find((s) => s.track && s.track.kind === "video");
              if (videoSender) {
                await videoSender.replaceTrack(cameraVideoTrackRef.current);
              }
              try {
                const offer = await pc.createOffer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: true,
                });
                await pc.setLocalDescription(offer);
                if (socketRef.current) {
                  socketRef.current.emit("live-class:signal-offer", {
                    to: remoteSocketId,
                    offer,
                  });
                }
              } catch (e) {}
            }
            setLocalStream(localStreamRef.current);
          }
          setIsScreenSharing(false);
          if (socketRef.current) {
            socketRef.current.emit("live-class:media-state-change", {
              classId,
              isScreenSharing: false,
            });
          }
        };
      } catch (err) {
        console.warn("Screen share cancelled:", err);
      }
    } else {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (cameraVideoTrackRef.current && localStreamRef.current) {
        for (const [remoteSocketId, pc] of peerConnectionsRef.current.entries()) {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === "video");
          if (videoSender) {
            await videoSender.replaceTrack(cameraVideoTrackRef.current);
          }
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);
            if (socketRef.current) {
              socketRef.current.emit("live-class:signal-offer", {
                to: remoteSocketId,
                offer,
              });
            }
          } catch (e) {}
        }
        setLocalStream(localStreamRef.current);
      }
      setIsScreenSharing(false);
      if (socketRef.current) {
        socketRef.current.emit("live-class:media-state-change", {
          classId,
          isScreenSharing: false,
        });
      }
    }
  }, [classId, isScreenSharing]);

  // 8. Raise Hand
  const toggleRaiseHand = useCallback(() => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    if (socketRef.current) {
      socketRef.current.emit("live-class:raise-hand", {
        classId,
        isRaised: nextState,
      });
    }
  }, [classId, isHandRaised]);

  // 9. Send Chat Message
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !socketRef.current) return;
      socketRef.current.emit("live-class:chat-message", {
        classId,
        text: text.trim(),
      });
    },
    [classId]
  );

  // 10. Broadcast Stream Status
  const broadcastStreamStatus = useCallback(
    (status: "live" | "completed" | "scheduled") => {
      if (socketRef.current) {
        socketRef.current.emit("live-class:stream-status", {
          classId,
          status,
        });
      }
    },
    [classId]
  );

  return {
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
  };
}
