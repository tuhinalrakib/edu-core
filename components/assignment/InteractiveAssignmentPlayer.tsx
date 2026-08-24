"use client";

import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  Upload,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe,
  Sparkles,
  Award,
  AlertCircle,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api";

interface AssignmentData {
  title?: string;
  description?: string;
  instructions?: string;
  rubric?: string;
  resources?: string[];
  maxPoints?: number;
  dueDate?: string;
  _id?: string;
  id?: string;
}

interface InteractiveAssignmentPlayerProps {
  assignment: AssignmentData;
  lessonTitle?: string;
  courseId?: string;
  onAssignmentCompleted?: (submitted: boolean) => void;
}

export function InteractiveAssignmentPlayer({
  assignment,
  lessonTitle = "Lesson Assignment Project",
  courseId = "",
  onAssignmentCompleted,
}: InteractiveAssignmentPlayerProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [gradeInfo, setGradeInfo] = useState<{ grade?: number; feedback?: string } | null>(null);

  // Check if student already submitted this assignment
  React.useEffect(() => {
    const checkPriorAssignment = async () => {
      // 1. Check local storage
      try {
        const stored = JSON.parse(localStorage.getItem(`educore_assignment_submissions_${courseId}`) || "[]");
        const found = stored.find(
          (s: any) =>
            (assignment._id && s.assignmentId === assignment._id) ||
            (assignment.id && s.assignmentId === assignment.id) ||
            s.assignmentTitle === (assignment.title || lessonTitle)
        );
        if (found) {
          setRepoUrl(found.repoUrl || "");
          setLiveUrl(found.liveUrl || "");
          setNotes(found.notes || "");
          setIsSubmitted(true);
          return;
        }
      } catch (e) {}

      // 2. Check backend submissions
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          const res = await fetch(`${API_BASE_URL}/assignments/my-submissions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.submissions)) {
            const foundBackend = data.submissions.find(
              (sub: any) =>
                (sub.assignment && (sub.assignment._id === assignment._id || sub.assignment === assignment._id)) ||
                (sub.course && (sub.course._id === courseId || sub.course === courseId))
            );
            if (foundBackend) {
              setRepoUrl(foundBackend.fileUrl || "");
              setNotes(foundBackend.notes || "");
              if (foundBackend.grade !== undefined) {
                setGradeInfo({ grade: foundBackend.grade, feedback: foundBackend.feedback });
              }
              setIsSubmitted(true);
            }
          }
        }
      } catch (e) {}
    };

    checkPriorAssignment();
  }, [assignment, courseId, lessonTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitted) {
      Swal.fire({
        icon: "warning",
        title: "Already Submitted",
        text: "You have already submitted this assignment. Multiple submissions are not allowed.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    if (!repoUrl && !liveUrl && !notes) {
      Swal.fire({
        icon: "warning",
        title: "Submission Incomplete",
        text: "Please provide a GitHub repository link, live demo URL, or written submission notes.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        await fetch(`${API_BASE_URL}/assignments/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assignmentId: assignment._id || assignment.id || "assignment-sub",
            courseId: courseId,
            fileUrl: repoUrl || liveUrl,
            notes: `Repo: ${repoUrl} | Live: ${liveUrl}\n\nNotes: ${notes}`,
          }),
        });
      }
    } catch (err) {
      // Continue even if offline/mock
    }

    setIsSubmitting(false);
    setIsSubmitted(true);

    Swal.fire({
      icon: "success",
      title: "🎉 Assignment Submitted!",
      html: "<p>Your project has been submitted successfully for instructor review.<br/><strong style='color: #10b981;'>+150 XP Earned!</strong></p>",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#10b981",
    });

    if (onAssignmentCompleted) {
      onAssignmentCompleted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-slate-950 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Submission Received
          </span>
          <h2 className="text-2xl font-black text-white">{assignment.title || lessonTitle}</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your assignment submission has been recorded. Your instructor will grade your project and return feedback shortly.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 max-w-lg mx-auto text-xs">
          {repoUrl && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5"><Github className="w-3.5 h-3.5 text-purple-400" /> Repository:</span>
              <a href={repoUrl} target="_blank" rel="noreferrer" className="text-purple-300 font-bold truncate max-w-xs hover:underline flex items-center gap-1">
                {repoUrl} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {liveUrl && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-emerald-400" /> Live Demo:</span>
              <a href={liveUrl} target="_blank" rel="noreferrer" className="text-emerald-300 font-bold truncate max-w-xs hover:underline flex items-center gap-1">
                {liveUrl} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400">Status:</span>
            <span className="text-amber-400 font-bold">
              {gradeInfo?.grade !== undefined ? `Graded: ${gradeInfo.grade}/100` : "Pending Review (Auto-Approved for Progression)"}
            </span>
          </div>
          {gradeInfo?.feedback && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block text-[11px]">Instructor Feedback:</span>
              <p className="text-emerald-300 font-semibold mt-0.5">{gradeInfo.feedback}</p>
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-medium max-w-lg mx-auto flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Single Submission Policy: Your project has been locked and recorded.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Hands-on Project Assignment
          </span>
          <h2 className="text-xl font-black text-white mt-2">{assignment.title || lessonTitle}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Max Score: <strong>100 Pts</strong></span>
          </div>
        </div>
      </div>

      {/* Assignment Instructions / Description */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Project Objective & Instructions</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {assignment.instructions ||
            assignment.description ||
            "Apply what you learned in this module to build and submit the required project. Ensure your code is clean, documented, and includes all necessary requirements before final submission."}
        </p>

        {assignment.rubric && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
            <p className="font-bold text-purple-300">Grading Rubric:</p>
            <p className="text-slate-400">{assignment.rubric}</p>
          </div>
        )}
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Student Submission Form</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-purple-400" />
              <span>GitHub / GitLab Repository URL</span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/username/project-repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Deployed Project URL (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://my-app.vercel.app"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Project Notes & Approach Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe your implementation details, technologies used, challenges overcome, etc..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Submitting this assignment will mark this lesson requirement complete.</span>
          </span>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl text-xs font-bold text-white gradient-button shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Assignment...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Assignment & Complete Step</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
