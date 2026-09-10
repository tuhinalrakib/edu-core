"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Trash2,
  Video,
  FileText,
  CheckCircle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  FileCheck,
  Cloud,
  Youtube,
  Upload,
  Loader2,
  Link as LinkIcon,
  Code,
  FileCode,
  Clock,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Check,
  Eye,
  X,
  Image as ImageIcon,
  Calendar,
  Lock,
  Unlock,
  Timer,
  ShieldCheck,
} from "lucide-react";
import { EduCoreLoader } from "@/components/EduCoreLoader";
import { UniversalVideoPlayer } from "@/components/video/UniversalVideoPlayer";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Helpers for Drip Publish Date & Time
const toDateTimeLocalValue = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return "";
  }
};

const getPresetDateTime = (daysFromNow: number, hour24 = 22, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour24, minute, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

type LessonType = "video" | "pdf" | "audio" | "attachment" | "quiz" | "assignment";
type VideoProvider = "cloudinary" | "youtube" | "gdrive" | "googledrive" | "vimeo" | "mp4";
type QuestionType = "mcq" | "true_false" | "fill_blank" | "coding";

function CourseBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCourseId = searchParams.get("id");
  const { user, token } = useAuth();

  const [title, setTitle] = useState(editCourseId ? "" : "React 19 & Next.js 15 Full-Stack SaaS Masterclass");
  const [category, setCategory] = useState("Web Development");
  const [level, setLevel] = useState("All Levels");
  const [price, setPrice] = useState("49.99");
  const [description, setDescription] = useState(
    editCourseId ? "" : "Learn to build full-stack web applications with React 19, Next.js 15 App Router, TypeScript, and Express."
  );
  const [thumbnail, setThumbnail] = useState("");
  const [courseStatus, setCourseStatus] = useState<string>("pending");
  const [hasCertificate, setHasCertificate] = useState<boolean>(false);

  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Web Development",
    "DevOps & Cloud",
    "UI/UX Design",
    "Data Science & AI",
    "Programming",
    "Business & SaaS",
  ]);

  const [allTeacherCourses, setAllTeacherCourses] = useState<any[]>([]);
  const [isFetchingCourse, setIsFetchingCourse] = useState<boolean>(Boolean(editCourseId));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.categories)) {
          const names = data.categories.map((c: any) => c.name);
          if (names.length > 0) {
            setCategoriesList(names);
            setCategory((prev) => (names.includes(prev) ? prev : names[0]));
          }
        }
      } catch (err: any) {
        console.warn("Category fetch fallback:", err.message);
      }
    };

    const fetchAllCourses = async () => {
      let apiCourses: any[] = [];
      try {
        const res = await fetch(`${API_BASE_URL}/courses`);
        const data = await res.json();
        if (data.success && Array.isArray(data.courses)) {
          apiCourses = data.courses;
        }
      } catch (err) { }

      const localCourses = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
      const merged = [...apiCourses];
      localCourses.forEach((lc: any) => {
        if (!merged.some((m) => String(m._id) === String(lc._id))) {
          merged.push(lc);
        }
      });
      setAllTeacherCourses(merged);
    };

    fetchCategories();
    fetchAllCourses();
  }, []);

  // Fetch existing course details if editing (id present in searchParams)
  useEffect(() => {
    if (!editCourseId) {
      setIsFetchingCourse(false);
      return;
    }

    const loadExistingCourse = async () => {
      setIsFetchingCourse(true);
      let targetCourse: any = null;

      try {
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE_URL}/courses/${editCourseId}?t=${Date.now()}`, {
          cache: "no-store",
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.course) {
            targetCourse = data.course;
          }
        }
      } catch (err: any) {
        console.warn("Backend fetch edit course fallback:", err.message);
      }

      if (!targetCourse) {
        try {
          const localCreated = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
          targetCourse = localCreated.find((c: any) => String(c._id) === String(editCourseId) || String(c.id) === String(editCourseId));
        } catch (e) { }
      }

      if (targetCourse) {
        if (targetCourse.title) setTitle(targetCourse.title);
        if (targetCourse.category) setCategory(targetCourse.category);
        if (targetCourse.level) setLevel(targetCourse.level);
        if (targetCourse.price !== undefined) setPrice(String(targetCourse.price));
        if (targetCourse.description) setDescription(targetCourse.description);
        if (targetCourse.thumbnail) {
          const fullUrl = targetCourse.thumbnail.startsWith("/")
            ? `${API_BASE_URL.replace("/api", "")}${targetCourse.thumbnail}`
            : targetCourse.thumbnail;
          setThumbnail(fullUrl);
        }
        if (targetCourse.status) setCourseStatus(targetCourse.status);
        if (targetCourse.hasCertificate !== undefined) setHasCertificate(Boolean(targetCourse.hasCertificate));
        if (Array.isArray(targetCourse.sections) && targetCourse.sections.length > 0) {
          setSections(targetCourse.sections);
        }
      }
      setIsFetchingCourse(false);
    };

    loadExistingCourse();
  }, [editCourseId]);

  // Sections & Lessons Curriculum Tree State
  const [sections, setSections] = useState<any[]>([
    {
      id: "sec-1",
      title: "Section 1: Introduction & Environment Setup",
      lessons: [
        {
          id: "les-1",
          title: "Lesson 1: Welcome & Course Roadmap",
          type: "video" as LessonType,
          videoProvider: "youtube" as VideoProvider,
          durationMinutes: 12,
          description: "Overview of course roadmap and project goals.",
          contentUrl: "https://www.youtube.com/watch?v=wm5gMKCOB4U",
          resources: [],
          quiz: null,
          assignment: null,
        },
        {
          id: "les-2",
          title: "Lesson 2: Setting up Node.js & Next.js 15",
          type: "video" as LessonType,
          videoProvider: "cloudinary" as VideoProvider,
          durationMinutes: 18,
          description: "Full environment installation guide.",
          contentUrl: "https://res.cloudinary.com/dxkmkskvy/video/upload/v1/educore/sample-lesson.mp4",
          resources: [],
          quiz: null,
          assignment: null,
        },
      ],
    },
    {
      id: "sec-2",
      title: "Section 2: Deep Dive into React Hooks & State Management",
      lessons: [
        {
          id: "les-3",
          title: "Lesson 1: useState & useEffect Masterclass",
          type: "video" as LessonType,
          videoProvider: "youtube" as VideoProvider,
          durationMinutes: 25,
          description: "Master component state and lifecycle side effects.",
          contentUrl: "https://www.youtube.com/watch?v=wm5gMKCOB4U",
          resources: [],
          quiz: null,
          assignment: null,
        },
        {
          id: "les-4",
          title: "Quiz 1: React Hooks Knowledge Assessment",
          type: "quiz" as LessonType,
          videoProvider: "youtube" as VideoProvider,
          durationMinutes: 15,
          description: "Test your understanding of React state and hooks.",
          contentUrl: "",
          resources: [],
          quiz: {
            title: "React Hooks Assessment",
            timeLimitMins: 15,
            passMarkPercent: 80,
            randomize: true,
            questions: [
              {
                id: "q1",
                questionText: "What does useEffect return when cleanup is needed?",
                type: "mcq" as QuestionType,
                options: ["A cleanup function", "A boolean true", "A new state object", "Null"],
                correctAnswer: "A cleanup function",
                explanation: "Returning a function inside useEffect schedules it as the cleanup callback.",
              },
              {
                id: "q2",
                questionText: "useState hook triggers a component re-render when state changes.",
                type: "true_false" as QuestionType,
                options: ["True", "False"],
                correctAnswer: "True",
                explanation: "State updates cause React to reconcile and re-render the component tree.",
              },
            ],
          },
          assignment: null,
        },
        {
          id: "les-5",
          title: "Assignment 1: Build a Custom Form Hook with Validation",
          type: "assignment" as LessonType,
          videoProvider: "youtube" as VideoProvider,
          durationMinutes: 45,
          description: "Create a custom React hook `useForm` with validation rules.",
          contentUrl: "",
          resources: ["Starter-Template.zip", "Assignment-Rubric.pdf"],
          quiz: null,
          assignment: {
            title: "Build a Custom Form Hook with Validation",
            description: "Submit a ZIP file or GitHub repository URL containing your custom hook code.",
            deadline: "2026-08-15",
            allowedFormats: "PDF, ZIP, Word, Google Drive Link",
            maxMarks: 100,
            rubric: "1. Code Architecture (40ms) 2. Validation Logic (40ms) 3. Documentation (20ms)",
          },
        },
      ],
    },
  ]);

  // Expanded Accordion Sections State
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(0);

  // Lesson Edit Modal State & Active Tab
  const [activeModalLesson, setActiveModalLesson] = useState<{
    sIdx: number;
    lIdx: number;
    lesson: any;
  } | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"video" | "quiz" | "resources" | "assignment">("video");
  const [newResourceName, setNewResourceName] = useState("");

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  const handleLessonVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeModalLesson) return;

    setIsUploadingVideo(true);
    const provider = activeModalLesson.lesson.videoProvider || "cloudinary";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("provider", provider);
    formData.append("folder", "educore/course_videos");

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        const providerName = data.provider === "vimeo" ? "Vimeo" : "Cloudinary";
        setActiveModalLesson({
          ...activeModalLesson,
          lesson: {
            ...activeModalLesson.lesson,
            contentUrl: data.url,
            videoProvider: data.provider || provider,
          },
        });

        Swal.fire({
          icon: "success",
          title: `Video Uploaded to ${providerName}! 🎥`,
          text: `Lesson video file uploaded and attached successfully.`,
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          timer: 2000,
        });
      } else {
        throw new Error(data.message || "Video upload failed");
      }
    } catch (err: any) {
      console.warn("Video upload error:", err.message);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message || "Could not upload video file.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Add Section Handler
  const handleAddSection = () => {
    const newSec = {
      id: `sec-${Date.now()}`,
      title: `Section ${sections.length + 1}: New Module Section`,
      lessons: [],
    };
    setSections([...sections, newSec]);
    setOpenSectionIdx(sections.length);
  };

  // Delete Section Handler
  const handleDeleteSection = (sIdx: number) => {
    setSections(sections.filter((_, idx) => idx !== sIdx));
  };

  // Add New Top-Level Lesson to Section (e.g. Lesson 1, Lesson 2)
  const handleAddLesson = (sIdx: number, type: LessonType = "video", insertAfterLIdx?: number) => {
    const updated = [...sections];
    const targetIndex =
      insertAfterLIdx !== undefined ? insertAfterLIdx + 1 : updated[sIdx].lessons.length;

    const newLesson = {
      id: `les-${Date.now()}`,
      title: `Lesson ${targetIndex + 1}: ${
        type === "quiz"
          ? "Quiz Assessment"
          : type === "assignment"
          ? "Project Assignment"
          : type === "pdf"
          ? "Resource Document"
          : "Topic Title"
      }`,
      type,
      videoProvider: "youtube" as VideoProvider,
      durationMinutes: 0,
      description: "",
      contentUrl: "",
      resources: [],
      quiz:
        type === "quiz"
          ? {
              title: `Quiz Assessment`,
              timeLimitMins: 15,
              passMarkPercent: 75,
              randomize: true,
              questions: [
                {
                  id: `q-${Date.now()}`,
                  questionText: "",
                  type: "mcq" as QuestionType,
                  options: ["", "", "", ""],
                  correctOptionIndex: 0,
                  correctAnswer: "",
                  explanation: "",
                },
              ],
            }
          : null,
      assignment:
        type === "assignment"
          ? {
              title: "Practical Assignment",
              description: "Complete the project tasks and submit your solution.",
              deadline: "2026-08-30",
              allowedFormats: "PDF, ZIP, Word, Google Drive Link",
              maxMarks: 100,
              rubric: "Completeness, Code Quality, Presentation",
            }
          : null,
    };

    updated[sIdx].lessons.splice(targetIndex, 0, newLesson);
    setSections(updated);

    // Open editor modal for newly added lesson
    setActiveModalTab("video");
    setActiveModalLesson({
      sIdx,
      lIdx: targetIndex,
      lesson: newLesson,
    });
  };

  // Handler for "+ Add next item after this:" on lesson card
  const handleAddNextItemAfter = (sIdx: number, lIdx: number, type: "quiz" | "video" | "pdf" | "assignment") => {
    if (type === "video") {
      handleAddLesson(sIdx, "video", lIdx);
      return;
    }

    const updated = [...sections];
    const lesson = { ...updated[sIdx].lessons[lIdx] };

    if (type === "quiz") {
      if (!lesson.quiz) {
        lesson.quiz = {
          title: `${lesson.title || "Lesson"} Quiz Assessment`,
          timeLimitMins: 15,
          passMarkPercent: 75,
          randomize: true,
          questions: [
            {
              id: `q-${Date.now()}`,
              questionText: "",
              type: "mcq" as QuestionType,
              options: ["", "", "", ""],
              correctOptionIndex: 0,
              correctAnswer: "",
              explanation: "",
            },
          ],
        };
      }
    } else if (type === "pdf") {
      lesson.showResources = true;
      if (!Array.isArray(lesson.resources)) {
        lesson.resources = [];
      }
    } else if (type === "assignment") {
      if (!lesson.assignment) {
        lesson.assignment = {
          title: `${lesson.title || "Lesson"} Practical Assignment`,
          description: "",
          deadline: "2026-08-30",
          allowedFormats: "PDF, ZIP, Word, Google Drive Link",
          maxMarks: 100,
          rubric: "",
        };
      }
    }

    updated[sIdx].lessons[lIdx] = lesson;
    setSections(updated);
    setActiveModalTab(type === "pdf" ? "resources" : type);
    setActiveModalLesson({ sIdx, lIdx, lesson });
  };

  // Attach / Open Quiz for Lesson
  const handleAttachQuiz = (sIdx: number, lIdx: number) => {
    handleAddNextItemAfter(sIdx, lIdx, "quiz");
  };

  // Remove Quiz from Lesson
  const handleRemoveQuiz = (sIdx: number, lIdx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = [...sections];
    updated[sIdx].lessons[lIdx].quiz = null;
    setSections(updated);
    if (activeModalLesson && activeModalLesson.sIdx === sIdx && activeModalLesson.lIdx === lIdx) {
      setActiveModalLesson({
        ...activeModalLesson,
        lesson: { ...activeModalLesson.lesson, quiz: null },
      });
    }
  };

  // Attach / Open Resource for Lesson
  const handleAttachResource = (sIdx: number, lIdx: number) => {
    handleAddNextItemAfter(sIdx, lIdx, "pdf");
  };

  // Remove Resource from Lesson
  const handleRemoveResource = (sIdx: number, lIdx: number, resIdx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = [...sections];
    const resList = [...(updated[sIdx].lessons[lIdx].resources || [])];
    resList.splice(resIdx, 1);
    updated[sIdx].lessons[lIdx].resources = resList;
    setSections(updated);
    if (activeModalLesson && activeModalLesson.sIdx === sIdx && activeModalLesson.lIdx === lIdx) {
      setActiveModalLesson({
        ...activeModalLesson,
        lesson: { ...activeModalLesson.lesson, resources: resList },
      });
    }
  };

  // Attach / Open Assignment for Lesson
  const handleAttachAssignment = (sIdx: number, lIdx: number) => {
    handleAddNextItemAfter(sIdx, lIdx, "assignment");
  };

  // Remove Assignment from Lesson
  const handleRemoveAssignment = (sIdx: number, lIdx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = [...sections];
    updated[sIdx].lessons[lIdx].assignment = null;
    setSections(updated);
    if (activeModalLesson && activeModalLesson.sIdx === sIdx && activeModalLesson.lIdx === lIdx) {
      setActiveModalLesson({
        ...activeModalLesson,
        lesson: { ...activeModalLesson.lesson, assignment: null },
      });
    }
  };

  // Save Lesson Changes from Modal
  const handleSaveLessonModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalLesson) return;

    const { sIdx, lIdx, lesson } = activeModalLesson;
    const updated = sections.map((sec, sI) => {
      if (sI !== sIdx) return sec;
      return {
        ...sec,
        lessons: sec.lessons.map((les: any, lI: number) => {
          if (lI !== lIdx) return les;
          return { ...lesson };
        }),
      };
    });
    setSections(updated);
    setActiveModalLesson(null);

    Swal.fire({
      icon: "success",
      title: "Lesson Changes Applied! ✅",
      html: `
        <div class="text-left space-y-2 text-xs text-slate-200 mt-2">
          <p class="text-emerald-400 font-semibold">✓ Lesson updated in builder preview.</p>
          <div class="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-purple-200 leading-relaxed">
            📢 <strong>Important Next Step:</strong><br />
            To save this Google Drive video permanently to the database, click 
            <span class="text-white font-bold underline decoration-purple-400">"Update Course Details"</span> 
            at the top or bottom of this page!
          </div>
        </div>
      `,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
      confirmButtonText: "Understood",
      timer: 4000,
    });
  };

  // Add Quiz Question inside Modal
  const handleAddQuestionToQuiz = () => {
    if (!activeModalLesson) return;
    const currentQuiz = activeModalLesson.lesson.quiz || {
      title: activeModalLesson.lesson.title || "Lesson Quiz Assessment",
      timeLimitMins: 15,
      passMarkPercent: 75,
      randomize: true,
      questions: [],
    };
    const newQ = {
      id: `q-${Date.now()}`,
      questionText: "",
      type: "mcq" as QuestionType,
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      correctAnswer: "",
      explanation: "",
    };
    const updatedLesson = {
      ...activeModalLesson.lesson,
      quiz: {
        ...currentQuiz,
        questions: [...(currentQuiz.questions || []), newQ],
      },
    };
    setActiveModalLesson({ ...activeModalLesson, lesson: updatedLesson });
  };

  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "educore/course_thumbnails");

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        const fullUrl = data.url.startsWith("/")
          ? `${API_BASE_URL.replace("/api", "")}${data.url}`
          : data.url;
        setThumbnail(fullUrl);
        Swal.fire({
          icon: "success",
          title: "Thumbnail Uploaded! 🖼️",
          text: "Course thumbnail uploaded successfully.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          timer: 1800,
        });
      } else {
        throw new Error(data.message || "Thumbnail upload failed");
      }
    } catch (err: any) {
      console.warn("Thumbnail upload error:", err.message);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message || "Could not upload image.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // Course Publish Form Handler
  const handleSaveCourse = async (e?: React.FormEvent, forcedStatus?: string) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!title.trim()) {
      Swal.fire({
        icon: "error",
        title: "Course Title Required",
        text: "Please enter a valid title for your course.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    const effectiveStatus = forcedStatus || (editCourseId ? courseStatus : "pending");

    const newCourseObj = {
      ...(editCourseId ? { _id: editCourseId } : { _id: `course-${Date.now()}` }),
      title,
      category,
      level,
      price: Number(price) || 0,
      description,
      thumbnail: thumbnail || "",
      status: effectiveStatus,
      hasCertificate: Boolean(hasCertificate),
      teacher: {
        name: user?.name || "Asma Akter",
        email: user?.email || "asmaulhosna77901@gmail.com",
        avatar: user?.avatar || "",
      },
      teacherEmail: user?.email || "asmaulhosna77901@gmail.com",
      totalStudents: 0,
      rating: 5.0,
      sections,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to LocalStorage list for immediate Teacher Dashboard sync
    const existingCourses = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
    let updatedCoursesList: any[];
    if (editCourseId) {
      updatedCoursesList = existingCourses.map((c: any) =>
        String(c._id) === String(editCourseId) ? { ...c, ...newCourseObj } : c
      );
    } else {
      updatedCoursesList = [newCourseObj, ...existingCourses];
    }
    localStorage.setItem("educore_created_courses", JSON.stringify(updatedCoursesList));

    // 2. Attempt POST/PUT to backend /api/courses
    setIsSavingCourse(true);
    try {
      const endpoint = editCourseId ? `${API_BASE_URL}/courses/${editCourseId}` : `${API_BASE_URL}/courses`;
      const method = editCourseId ? "PUT" : "POST";

      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(newCourseObj),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save course on backend server.");
      }

      // Sync backend returned course with real _id in LocalStorage & state
      if (data.course) {
        if (Array.isArray(data.course.sections)) {
          setSections(data.course.sections);
        }
        const currentSaved = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
        const filtered = currentSaved.filter(
          (c: any) => String(c._id) !== String(editCourseId) && String(c._id) !== String(data.course._id)
        );
        localStorage.setItem("educore_created_courses", JSON.stringify([data.course, ...filtered]));
      }

      // Dispatch event to immediately notify navbar and other listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("educore_new_course"));
      }

      const isPending = effectiveStatus.toLowerCase() === "pending";
      const isDraft = effectiveStatus.toLowerCase() === "draft";

      Swal.fire({
        icon: "success",
        title: isPending
          ? "Submitted for Admin Approval! 🚀"
          : isDraft
            ? "Saved as Draft 📝"
            : "Course Updated! 🎉",
        text: isPending
          ? `Course "${title}" has been submitted for Admin Review. Once an admin approves it, it will automatically be published to the catalog.`
          : isDraft
            ? `Course "${title}" is saved as a Draft. You can submit it for approval whenever you are ready.`
            : `Course "${title}" has been updated successfully.`,
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      }).then(() => {
        router.push("/teacher/dashboard");
      });
    } catch (err: any) {
      console.error("Backend save course error:", err.message);
      Swal.fire({
        icon: "error",
        title: "Course Creation Failed ❌",
        text: err.message || "Server error occurred while saving the course.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSavingCourse(false);
    }
  };

  return (
    <>
      {(isFetchingCourse || isUploadingVideo || isUploadingThumbnail || isSavingCourse) && (
        <EduCoreLoader
          message={
            isFetchingCourse
              ? "Loading Course Details & Curriculum..."
              : isSavingCourse
                ? "Submitting Course to Database..."
                : isUploadingThumbnail
                  ? "Uploading Course Thumbnail to Cloudinary..."
                  : "Uploading Lesson Video to Server..."
          }
          fullScreen={true}
        />
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {editCourseId ? "Editing Existing Course" : "Instructor Course Studio"}
              </span>
              {allTeacherCourses.length > 0 && (
                <select
                  value={editCourseId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      router.push(`/teacher/courses/create?id=${val}`);
                    } else {
                      router.push(`/teacher/courses/create`);
                    }
                  }}
                  className="bg-slate-900 border border-slate-700 text-purple-200 text-xs font-bold rounded-xl px-3 py-1 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
                >
                  <option value="">➕ Create New Course</option>
                  {allTeacherCourses.map((c, idx) => (
                    <option key={c._id || c.id || `course-opt-${idx}`} value={c._id || c.id}>
                      ✏️ Edit: {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <h1 className="text-3xl font-black text-white">
              {editCourseId ? "Edit Course Builder" : "Full-Featured Course Builder"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Design sections, video lessons, quizzes, and submit for Admin Approval before publishing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleSaveCourse()}
            className="px-6 py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 shrink-0"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{editCourseId ? "Update Course Details" : "Submit for Admin Approval"}</span>
          </button>
        </div>

        {/* Admin Approval Notice Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 text-sm">
            🛡️
          </div>
          <div>
            <h4 className="font-bold text-amber-300 text-xs">Admin Quality Review & Approval</h4>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
              To maintain course standards, newly created courses are submitted to EduCore Administrators for review. Once an Admin approves the course, it will immediately be published and visible on the public Explore Courses page.
            </p>
          </div>
        </div>

        <form onSubmit={(e) => handleSaveCourse(e, editCourseId ? courseStatus : "pending")} className="space-y-8">
          {/* 1. BASIC COURSE DETAILS */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span>1. Basic Course Details & Pricing</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category <span className="text-[10px] text-purple-400 font-normal">(Backend Dynamic)</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                >
                  {categoriesList.map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="All Levels">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Course Status <span className="text-[10px] text-amber-400 font-normal">(Admin Controlled)</span>
                </label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const st = String(courseStatus || "pending").toLowerCase();
                      const isPub = st === "published" || st === "approved";
                      return (
                        <>
                          <span className={`w-2 h-2 rounded-full ${isPub ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                          <span className={isPub ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
                            {isPub ? "Published (Live on Catalog)" : "Pending Admin Approval"}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {String(courseStatus).toLowerCase() === "published" ? "Approved by Admin" : "By Default Pending"}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Course Cover Image / Thumbnail
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {thumbnail ? (
                    <div className="relative group shrink-0">
                      <img
                        src={thumbnail.startsWith("/") ? `${API_BASE_URL.replace("/api", "")}${thumbnail}` : thumbnail}
                        alt="Course Thumbnail"
                        className="w-36 h-20 rounded-xl object-cover border border-purple-500/40 shrink-0 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setThumbnail("")}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow hover:bg-rose-500 transition-colors"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-36 h-20 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-[10px] gap-1 shrink-0">
                      {isUploadingThumbnail ? (
                        <>
                          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                          <span className="text-purple-300 font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-slate-500" />
                          <span>No Image Added</span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Paste Image URL or upload image file below..."
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                      />
                      <label
                        htmlFor="course-thumbnail-upload-input"
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shadow-md transition-colors ${isUploadingThumbnail ? "opacity-60 pointer-events-none" : ""
                          }`}
                      >
                        {isUploadingThumbnail ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
                          </>
                        )}
                      </label>
                      <input
                        id="course-thumbnail-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Recommended dimensions: 1280x720 (16:9). Upload via Cloudinary or paste direct image URL.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Course Certificate Toggle */}
              <div className="sm:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      hasCertificate
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-900 text-slate-500 border border-slate-800"
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">Course Completion Certificate</h4>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          hasCertificate
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {hasCertificate ? "Enabled (Issued on 100% Completion)" : "Disabled (No Certificate)"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enable this if students who complete 100% of the lessons, quizzes, and assignments should receive an official verifiable certificate.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={hasCertificate}
                    onChange={(e) => setHasCertificate(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. CURRICULUM TREE BUILDER (SECTIONS & LESSONS) */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>2. Curriculum Section & Lesson Builder</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Organize your course into Sections (Modules) and add Lessons, Videos, Quizzes, and Assignments.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSection}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Section</span>
              </button>
            </div>

            <div className="space-y-4">
              {sections.map((section, sIdx) => {
                const isOpen = openSectionIdx === sIdx;
                return (
                  <div
                    key={section.id || section._id || `sec-${sIdx}`}
                    className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg"
                  >
                    {/* Section Accordion Header */}
                    <div
                      className="p-4 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
                      onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                          {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={section.title}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[sIdx].title = e.target.value;
                            setSections(updated);
                          }}
                          className="bg-transparent text-sm font-bold text-white focus:outline-none focus:bg-slate-950 px-2 py-1 rounded border border-transparent focus:border-slate-800 flex-1 max-w-lg"
                        />
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                          ({section.lessons.length} Content Items)
                        </span>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sIdx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)}
                          className="p-1.5 text-slate-400 hover:text-white"
                        >
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Section Content (Lessons List) */}
                    {isOpen && (
                      <div className="p-5 space-y-4">
                        {/* Lessons Tree */}
                        {section.lessons.length === 0 ? (
                          <p className="text-xs text-slate-500 italic text-center py-4">
                            No lessons in this section yet. Click below to add your first lesson, quiz, or assignment!
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {section.lessons.map((lesson: any, lIdx: number) => (
                              <div
                                key={lesson.id || lesson._id || `les-${sIdx}-${lIdx}`}
                                className="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden hover:border-purple-500/40 transition-all shadow-sm"
                              >
                                <div className="p-3.5 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    {lesson.type === "video" && <Video className="w-4 h-4 text-purple-400 shrink-0" />}
                                    {lesson.type === "pdf" && <FileText className="w-4 h-4 text-blue-400 shrink-0" />}
                                    {lesson.type === "quiz" && <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                                    {lesson.type === "assignment" && <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />}

                                    <div>
                                      <h4 className="text-xs font-bold text-white truncate">{lesson.title}</h4>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                        <span className="capitalize font-semibold text-purple-300">{lesson.type}</span>
                                        <span>•</span>
                                        {lesson.type === "video" && (
                                          <>
                                            <span className="uppercase text-slate-400">
                                              {lesson.videoProvider}
                                              {lesson.durationMinutes && Number(lesson.durationMinutes) > 0
                                                ? ` (${lesson.durationMinutes}m)`
                                                : ""}
                                            </span>
                                            {lesson.quiz?.questions?.length > 0 && (
                                              <>
                                                <span>•</span>
                                                <span className="text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                                                  <HelpCircle className="w-2.5 h-2.5" />
                                                  <span>{lesson.quiz.questions.length} Quiz Qs</span>
                                                </span>
                                              </>
                                            )}
                                          </>
                                        )}
                                        {lesson.type === "quiz" && (
                                          <span className="text-amber-400 font-medium">
                                            {lesson.quiz?.questions?.length || 0} Questions ({lesson.quiz?.timeLimitMins}m)
                                          </span>
                                        )}
                                        {lesson.type === "assignment" && (
                                          <span className="text-emerald-400 font-medium">
                                            Max Marks: {lesson.assignment?.maxMarks}
                                          </span>
                                        )}
                                        {lesson.unlockAt && new Date(lesson.unlockAt).getTime() > Date.now() && (
                                          <>
                                            <span>•</span>
                                            <span className="text-cyan-400 font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                                              <Timer className="w-2.5 h-2.5 animate-pulse" />
                                              <span>
                                                Drip: {new Date(lesson.unlockAt).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </span>
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveModalLesson({
                                          sIdx,
                                          lIdx,
                                          lesson: { ...lesson },
                                        })
                                      }
                                      className="px-3 py-1.5 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-900/60"
                                    >
                                      Configure & Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...sections];
                                        updated[sIdx].lessons.splice(lIdx, 1);
                                        setSections(updated);
                                      }}
                                      className="p-1.5 text-slate-500 hover:text-rose-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Quick Add Content Immediately Following this Lesson */}
                                <div className="px-3.5 py-1.5 bg-slate-950/70 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                    <Plus className="w-3 h-3 text-slate-400" />
                                    <span>Add next item after this:</span>
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleAddNextItemAfter(sIdx, lIdx, "quiz")}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border ${
                                        lesson.quiz
                                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                          : "bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border-amber-500/30"
                                      }`}
                                      title="Add / Configure Quiz for this lesson"
                                    >
                                      <HelpCircle className="w-2.5 h-2.5" />
                                      <span>{lesson.quiz ? "✓ Quiz" : "+ Quiz"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddNextItemAfter(sIdx, lIdx, "video")}
                                      className="px-2 py-0.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                                      title="Add next Video Lesson"
                                    >
                                      <Video className="w-2.5 h-2.5" />
                                      <span>+ Video</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddNextItemAfter(sIdx, lIdx, "pdf")}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border ${
                                        Array.isArray(lesson.resources) && lesson.resources.length > 0
                                          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                          : "bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border-blue-500/30"
                                      }`}
                                      title="Add / Configure PDF Resource for this lesson"
                                    >
                                      <FileText className="w-2.5 h-2.5" />
                                      <span>{Array.isArray(lesson.resources) && lesson.resources.length > 0 ? "✓ Resource" : "+ Resource"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddNextItemAfter(sIdx, lIdx, "assignment")}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border ${
                                        lesson.assignment
                                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                          : "bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/30"
                                      }`}
                                      title="Add / Configure Assignment for this lesson"
                                    >
                                      <FileCheck className="w-2.5 h-2.5" />
                                      <span>{lesson.assignment ? "✓ Assignment" : "+ Assignment"}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quick Add Content Bar */}
                        <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 mr-2">+ Add Content to Section:</span>
                          <button
                            type="button"
                            onClick={() => handleAddLesson(sIdx, "video")}
                            className="px-3 py-1.5 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-500/20 text-xs font-semibold hover:bg-purple-900/40 flex items-center gap-1.5"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Video Lesson</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddLesson(sIdx, "pdf")}
                            className="px-3 py-1.5 rounded-xl bg-blue-950/60 text-blue-300 border border-blue-500/20 text-xs font-semibold hover:bg-blue-900/40 flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF / Resource</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddLesson(sIdx, "quiz")}
                            className="px-3 py-1.5 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-500/20 text-xs font-semibold hover:bg-amber-900/40 flex items-center gap-1.5"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Interactive Quiz</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddLesson(sIdx, "assignment")}
                            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-900/40 flex items-center gap-1.5"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Student Assignment</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Form Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-xs font-black text-white gradient-button shadow-2xl shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{editCourseId ? "Update Course Details" : "Submit Course for Admin Approval"}</span>
            </button>
          </div>
        </form>

        {/* ========================================================================= */}
        {/* MODAL: LESSON / QUIZ / ASSIGNMENT CONFIGURATION EDITOR */}
        {/* ========================================================================= */}
        {activeModalLesson && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-3xl p-6 sm:p-7 shadow-2xl my-auto max-h-[90vh] flex flex-col">
              {/* Fixed Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Lesson Content Editor
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    Configure {activeModalLesson.lesson.type.toUpperCase()} Item
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalLesson(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form id="lesson-modal-form" onSubmit={handleSaveLessonModal} className="space-y-5 overflow-y-auto py-4 pr-2 flex-1 min-h-0">
                {/* Item Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Item Title</label>
                  <input
                    type="text"
                    value={activeModalLesson.lesson.title}
                    onChange={(e) =>
                      setActiveModalLesson({
                        ...activeModalLesson,
                        lesson: { ...activeModalLesson.lesson, title: e.target.value },
                      })
                    }
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                {/* Item Type */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["video", "pdf", "quiz", "assignment"] as LessonType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const updatedLesson: any = { ...activeModalLesson.lesson, type: t };
                        if (
                          t === "quiz" &&
                          (!updatedLesson.quiz ||
                            !updatedLesson.quiz.questions ||
                            updatedLesson.quiz.questions.length === 0)
                        ) {
                          updatedLesson.quiz = {
                            title: updatedLesson.title || "Section Quiz Assessment",
                            timeLimitMins: 15,
                            passMarkPercent: 75,
                            randomize: true,
                            questions: [
                              {
                                id: `q-${Date.now()}`,
                                questionText: "",
                                type: "mcq",
                                options: ["", "", "", ""],
                                correctOptionIndex: 0,
                                correctAnswer: "",
                                explanation: "",
                              },
                            ],
                          };
                        }
                        setActiveModalLesson({
                          ...activeModalLesson,
                          lesson: updatedLesson,
                        });
                      }}
                      className={`py-2 text-xs font-bold rounded-xl capitalize transition-all border ${activeModalLesson.lesson.type === t
                          ? "bg-purple-900/50 border-purple-500 text-purple-200"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* 1. VIDEO SETTINGS */}
                {activeModalLesson.lesson.type === "video" && (
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Provider & Media File</span>
                    </h4>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Video Provider</label>
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {[
                          { id: "youtube", label: "YouTube" },
                          { id: "gdrive", label: "Google Drive" },
                          { id: "vimeo", label: "Vimeo" },
                          { id: "mp4", label: "Direct MP4" },
                          { id: "cloudinary", label: "Cloudinary" },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              setActiveModalLesson({
                                ...activeModalLesson,
                                lesson: { ...activeModalLesson.lesson, videoProvider: p.id as VideoProvider },
                              })
                            }
                            className={`py-2 text-[10px] sm:text-[11px] font-bold rounded-xl transition-all border ${activeModalLesson.lesson.videoProvider === p.id ||
                                (p.id === "gdrive" && activeModalLesson.lesson.videoProvider === "googledrive")
                                ? "bg-purple-900/50 border-purple-500 text-purple-200 shadow-md shadow-purple-900/20"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                              }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {activeModalLesson.lesson.videoProvider === "youtube"
                          ? "YouTube Video URL"
                          : activeModalLesson.lesson.videoProvider === "gdrive" || activeModalLesson.lesson.videoProvider === "googledrive"
                            ? "Google Drive Shareable Link"
                            : activeModalLesson.lesson.videoProvider === "vimeo"
                              ? "Vimeo Video URL"
                              : activeModalLesson.lesson.videoProvider === "mp4"
                                ? "Direct Video URL (.mp4)"
                                : "Video URL / Cloudinary Link"}
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="text"
                          placeholder={
                            activeModalLesson.lesson.videoProvider === "youtube"
                              ? "e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                              : activeModalLesson.lesson.videoProvider === "gdrive" || activeModalLesson.lesson.videoProvider === "googledrive"
                                ? "e.g. https://drive.google.com/file/d/1ABC123xyz.../view?usp=sharing"
                                : activeModalLesson.lesson.videoProvider === "vimeo"
                                  ? "e.g. https://vimeo.com/148751763"
                                  : activeModalLesson.lesson.videoProvider === "mp4"
                                    ? "e.g. https://example.com/video.mp4"
                                    : "e.g. https://res.cloudinary.com/dxkmkskvy/video/upload/sample.mp4"
                          }
                          value={activeModalLesson.lesson.contentUrl || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            let detectedProvider = activeModalLesson.lesson.videoProvider;
                            if (val.includes("drive.google.com")) {
                              detectedProvider = "gdrive";
                            } else if (val.includes("youtube.com") || val.includes("youtu.be")) {
                              detectedProvider = "youtube";
                            } else if (val.includes("vimeo.com")) {
                              detectedProvider = "vimeo";
                            }
                            setActiveModalLesson({
                              ...activeModalLesson,
                              lesson: {
                                ...activeModalLesson.lesson,
                                contentUrl: val,
                                videoProvider: detectedProvider,
                              },
                            });
                          }}
                          className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                        {activeModalLesson.lesson.videoProvider !== "youtube" && activeModalLesson.lesson.videoProvider !== "gdrive" && (
                          <>
                            <label
                              htmlFor="lesson-video-file-input"
                              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center justify-center gap-1.5 transition-all ${isUploadingVideo
                                  ? "bg-purple-900/20 text-purple-400 border border-purple-500/20 cursor-not-allowed opacity-70"
                                  : "bg-purple-900/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/60 cursor-pointer"
                                }`}
                            >
                              {isUploadingVideo ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Video File</span>
                                </>
                              )}
                            </label>
                            <input
                              id="lesson-video-file-input"
                              type="file"
                              accept="video/*"
                              disabled={isUploadingVideo}
                              onChange={handleLessonVideoFileUpload}
                              className="hidden"
                            />
                          </>
                        )}
                      </div>

                      {(activeModalLesson.lesson.videoProvider === "gdrive" || activeModalLesson.lesson.videoProvider === "googledrive") && (
                        <p className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-500/20 rounded-lg p-2 mt-2 leading-relaxed">
                          💡 <strong>Google Drive Tip:</strong> Ensure your Drive video access is set to <u>"Anyone with the link can view"</u> so students can play it directly in the app.
                        </p>
                      )}

                      {/* Live Video Preview Box in Modal */}
                      {activeModalLesson.lesson.contentUrl && (
                        <div className="mt-4 border-t border-slate-800/80 pt-3">
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            🎬 Live Player Test Preview:
                          </label>
                          <UniversalVideoPlayer
                            url={activeModalLesson.lesson.contentUrl}
                            provider={activeModalLesson.lesson.videoProvider}
                            title={activeModalLesson.lesson.title || "Lesson Video Preview"}
                            className="rounded-xl overflow-hidden border border-slate-800 shadow-xl"
                          />
                          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/60">
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Preview verified</span>
                            </span>
                            <button
                              type="submit"
                              form="lesson-modal-form"
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/40 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Apply & Save Video Link</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Duration (Minutes) <span className="text-slate-500 font-normal text-[11px]">(Optional)</span>
                        </label>
                        {activeModalLesson.lesson.durationMinutes ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModalLesson({
                                ...activeModalLesson,
                                lesson: { ...activeModalLesson.lesson, durationMinutes: "" as any },
                              });
                            }}
                            className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            Clear Duration
                          </button>
                        ) : null}
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 15 (Optional - leave empty if not needed)"
                        value={activeModalLesson.lesson.durationMinutes ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? "" : Number(e.target.value);
                          setActiveModalLesson({
                            ...activeModalLesson,
                            lesson: { ...activeModalLesson.lesson, durationMinutes: val as any },
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-bold placeholder:font-normal placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}

                {/* 2. ATTACHED / DIRECT QUIZ SETTINGS BUILDER (Shown right after video if quiz is added) */}
                {(activeModalLesson.lesson.type === "quiz" || activeModalLesson.lesson.quiz) && (
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Lesson Quiz Assessment (MCQ Questions)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Add questions with 4 options (A, B, C, D) that students will answer directly under this lecture.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddQuestionToQuiz}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all shadow-sm shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Question</span>
                        </button>
                        {activeModalLesson.lesson.type === "video" && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModalLesson({
                                ...activeModalLesson,
                                lesson: { ...activeModalLesson.lesson, quiz: null },
                              });
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 text-xs"
                            title="Remove Quiz from this lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          ⏱️ Time Limit (Minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={activeModalLesson.lesson.quiz?.timeLimitMins ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Number(e.target.value);
                            setActiveModalLesson({
                              ...activeModalLesson,
                              lesson: {
                                ...activeModalLesson.lesson,
                                quiz: {
                                  ...activeModalLesson.lesson.quiz,
                                  timeLimitMins: val as any,
                                },
                              },
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          🎯 Pass Mark (%)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={activeModalLesson.lesson.quiz?.passMarkPercent ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Number(e.target.value);
                            setActiveModalLesson({
                              ...activeModalLesson,
                              lesson: {
                                ...activeModalLesson.lesson,
                                quiz: {
                                  ...activeModalLesson.lesson.quiz,
                                  passMarkPercent: val as any,
                                },
                              },
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      {(!activeModalLesson.lesson.quiz?.questions || activeModalLesson.lesson.quiz.questions.length === 0) && (
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-2">
                          <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
                          <p className="text-xs text-slate-400 font-medium">No questions added yet to this Quiz.</p>
                          <button
                            type="button"
                            onClick={handleAddQuestionToQuiz}
                            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30"
                          >
                            + Add First MCQ Question
                          </button>
                        </div>
                      )}

                      {activeModalLesson.lesson.quiz?.questions?.map((q: any, qIdx: number) => {
                        const options = Array.isArray(q.options) && q.options.length === 4 ? q.options : ["", "", "", ""];
                        const currentCorrectIdx = q.correctOptionIndex !== undefined ? q.correctOptionIndex : 0;
                        const optLetters = ["a", "b", "c", "d"];

                        return (
                          <div
                            key={q.id || q._id || `q-${qIdx}`}
                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs relative"
                          >
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                                  {qIdx + 1}
                                </span>
                                <span>Question #{qIdx + 1}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const qList = [...activeModalLesson.lesson.quiz.questions];
                                  qList.splice(qIdx, 1);
                                  setActiveModalLesson({
                                    ...activeModalLesson,
                                    lesson: {
                                      ...activeModalLesson.lesson,
                                      quiz: { ...activeModalLesson.lesson.quiz, questions: qList },
                                    },
                                  });
                                }}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>

                            {/* Question Text */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Question Description / Title
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. What is the output of useEffect cleanup function?"
                                value={q.questionText || ""}
                                onChange={(e) => {
                                  const qList = [...activeModalLesson.lesson.quiz.questions];
                                  qList[qIdx].questionText = e.target.value;
                                  setActiveModalLesson({
                                    ...activeModalLesson,
                                    lesson: {
                                      ...activeModalLesson.lesson,
                                      quiz: { ...activeModalLesson.lesson.quiz, questions: qList },
                                    },
                                  });
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            {/* 4 MCQ Options: a, b, c, d */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[11px] font-semibold text-slate-300">
                                  4 Options (Click letter button to select correct answer):
                                </label>
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  Correct Answer: Option {optLetters[currentCorrectIdx]?.toUpperCase()}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {optLetters.map((letter, optIdx) => {
                                  const isCorrect = currentCorrectIdx === optIdx;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${isCorrect
                                          ? "bg-emerald-950/30 border-emerald-500/50"
                                          : "bg-slate-950 border-slate-800"
                                        }`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const qList = [...activeModalLesson.lesson.quiz.questions];
                                          qList[qIdx].correctOptionIndex = optIdx;
                                          qList[qIdx].correctAnswer = options[optIdx] || `Option ${letter.toUpperCase()}`;
                                          setActiveModalLesson({
                                            ...activeModalLesson,
                                            lesson: {
                                              ...activeModalLesson.lesson,
                                              quiz: { ...activeModalLesson.lesson.quiz, questions: qList },
                                            },
                                          });
                                        }}
                                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border transition-all ${isCorrect
                                            ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30"
                                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                                          }`}
                                        title={`Set Option ${letter.toUpperCase()} as correct`}
                                      >
                                        {letter.toUpperCase()}
                                      </button>

                                      <input
                                        type="text"
                                        placeholder={`Option ${letter.toUpperCase()} text`}
                                        value={options[optIdx] || ""}
                                        onChange={(e) => {
                                          const qList = [...activeModalLesson.lesson.quiz.questions];
                                          const newOpts = [...(qList[qIdx].options || ["", "", "", ""])];
                                          newOpts[optIdx] = e.target.value;
                                          qList[qIdx].options = newOpts;
                                          if (qList[qIdx].correctOptionIndex === optIdx) {
                                            qList[qIdx].correctAnswer = e.target.value;
                                          }
                                          setActiveModalLesson({
                                            ...activeModalLesson,
                                            lesson: {
                                              ...activeModalLesson.lesson,
                                              quiz: { ...activeModalLesson.lesson.quiz, questions: qList },
                                            },
                                          });
                                        }}
                                        className="flex-1 bg-transparent border-0 text-xs text-white focus:outline-none placeholder:text-slate-600"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Optional Explanation */}
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                                Explanation / Hint (Shown after quiz submit)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. useEffect returns cleanup function executed before unmount."
                                value={q.explanation || ""}
                                onChange={(e) => {
                                  const qList = [...activeModalLesson.lesson.quiz.questions];
                                  qList[qIdx].explanation = e.target.value;
                                  setActiveModalLesson({
                                    ...activeModalLesson,
                                    lesson: {
                                      ...activeModalLesson.lesson,
                                      quiz: { ...activeModalLesson.lesson.quiz, questions: qList },
                                    },
                                  });
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. ATTACHED / DIRECT RESOURCES & PDF ATTACHMENTS (Shown only when + Resource is clicked or resources exist) */}
                {(activeModalLesson.lesson.type === "pdf" || activeModalLesson.lesson.showResources || (Array.isArray(activeModalLesson.lesson.resources) && activeModalLesson.lesson.resources.length > 0)) && (
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Downloadable Files & PDFs</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Add cheat sheets, slides, ZIP project code, or documentation files for this lesson.
                        </p>
                      </div>
                      {activeModalLesson.lesson.type === "video" && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalLesson({
                              ...activeModalLesson,
                              lesson: { ...activeModalLesson.lesson, resources: [], showResources: false },
                            });
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 text-xs"
                          title="Remove Resources from this lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Add New Resource Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Lesson-1-CheatSheet.pdf or GitHub Repository Link"
                        value={newResourceName}
                        onChange={(e) => setNewResourceName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newResourceName.trim()) {
                              const cur = activeModalLesson.lesson.resources || [];
                              setActiveModalLesson({
                                ...activeModalLesson,
                                lesson: { ...activeModalLesson.lesson, resources: [...cur, newResourceName.trim()] },
                              });
                              setNewResourceName("");
                            }
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newResourceName.trim()) {
                            const cur = activeModalLesson.lesson.resources || [];
                            setActiveModalLesson({
                              ...activeModalLesson,
                              lesson: { ...activeModalLesson.lesson, resources: [...cur, newResourceName.trim()] },
                            });
                            setNewResourceName("");
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0"
                      >
                        + Add File
                      </button>
                    </div>

                    {/* Resource Files List */}
                    <div className="space-y-2">
                      {(!activeModalLesson.lesson.resources || activeModalLesson.lesson.resources.length === 0) ? (
                        <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                          No resources attached yet. Type file name or link above and click Add!
                        </p>
                      ) : (
                        activeModalLesson.lesson.resources.map((res: any, rIdx: number) => {
                          const resTitle = typeof res === "string" ? res : res.name || res.url;
                          return (
                            <div
                              key={rIdx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                            >
                              <div className="flex items-center gap-2 text-slate-200">
                                <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                                <span className="font-semibold">{resTitle}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = [...(activeModalLesson.lesson.resources || [])];
                                  cur.splice(rIdx, 1);
                                  setActiveModalLesson({
                                    ...activeModalLesson,
                                    lesson: { ...activeModalLesson.lesson, resources: cur },
                                  });
                                }}
                                className="text-rose-400 hover:text-rose-300 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 4. ATTACHED / DIRECT ASSIGNMENT SETTINGS (Shown right after video/quiz/resources if added) */}
                {(activeModalLesson.lesson.type === "assignment" || activeModalLesson.lesson.assignment) && (
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Practical Project Assignment</span>
                      </h4>
                      {activeModalLesson.lesson.type === "video" && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalLesson({
                              ...activeModalLesson,
                              lesson: { ...activeModalLesson.lesson, assignment: null },
                            });
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 text-xs"
                          title="Remove Assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Title</label>
                      <input
                        type="text"
                        value={activeModalLesson.lesson.assignment?.title || ""}
                        onChange={(e) =>
                          setActiveModalLesson({
                            ...activeModalLesson,
                            lesson: {
                              ...activeModalLesson.lesson,
                              assignment: {
                                ...activeModalLesson.lesson.assignment,
                                title: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="e.g. Build a Todo Application using React Hooks"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Submission Deadline</label>
                      <input
                        type="date"
                        value={activeModalLesson.lesson.assignment?.deadline || "2026-08-30"}
                        onChange={(e) =>
                          setActiveModalLesson({
                            ...activeModalLesson,
                            lesson: {
                              ...activeModalLesson.lesson,
                              assignment: {
                                ...activeModalLesson.lesson.assignment,
                                deadline: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Allowed File Formats</label>
                      <input
                        type="text"
                        value={activeModalLesson.lesson.assignment?.allowedFormats || "PDF, ZIP, Word, Google Drive Link"}
                        onChange={(e) =>
                          setActiveModalLesson({
                            ...activeModalLesson,
                            lesson: {
                              ...activeModalLesson.lesson,
                              assignment: {
                                ...activeModalLesson.lesson.assignment,
                                allowedFormats: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Grading Rubric / Instructions</label>
                      <textarea
                        rows={2}
                        value={activeModalLesson.lesson.assignment?.rubric || ""}
                        onChange={(e) =>
                          setActiveModalLesson({
                            ...activeModalLesson,
                            lesson: {
                              ...activeModalLesson.lesson,
                              assignment: {
                                ...activeModalLesson.lesson,
                                rubric: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* 5. SCHEDULED DRIP RELEASE / PUBLISH DATE & TIME */}
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20 border border-cyan-500/30 shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span>Publish Date & Time (Drip-Feed Release)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Choose when students can access this lesson. If set to a future date, the video is completely locked with a live countdown timer until that exact moment.
                      </p>
                    </div>
                    {activeModalLesson.lesson.unlockAt && new Date(activeModalLesson.lesson.unlockAt).getTime() > Date.now() ? (
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Timer className="w-3 h-3 animate-pulse" />
                        <span>Scheduled</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Unlock className="w-3 h-3" />
                        <span>Instant Access</span>
                      </span>
                    )}
                  </div>

                  {/* Mode Selector Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalLesson({
                          ...activeModalLesson,
                          lesson: { ...activeModalLesson.lesson, unlockAt: "" },
                        });
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                        !activeModalLesson.lesson.unlockAt
                          ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-950/50"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Publish Immediately</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!activeModalLesson.lesson.unlockAt) {
                          setActiveModalLesson({
                            ...activeModalLesson,
                            lesson: { ...activeModalLesson.lesson, unlockAt: new Date(getPresetDateTime(1, 22, 0)).toISOString() },
                          });
                        }
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                        activeModalLesson.lesson.unlockAt
                          ? "bg-cyan-950/70 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950/50"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Schedule Date & Time</span>
                    </button>
                  </div>

                  {/* Date & Time Picker Controls */}
                  {activeModalLesson.lesson.unlockAt && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                          <span>Set Unlock Date & Exact Time:</span>
                          <span className="text-[10px] text-cyan-400">Local System Timezone</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={toDateTimeLocalValue(activeModalLesson.lesson.unlockAt)}
                          onChange={(e) => {
                            const val = e.target.value;
                            setActiveModalLesson({
                              ...activeModalLesson,
                              lesson: {
                                ...activeModalLesson.lesson,
                                unlockAt: val ? new Date(val).toISOString() : "",
                              },
                            });
                          }}
                          className="w-full bg-slate-900 border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-cyan-200 font-mono font-bold focus:outline-none shadow-inner"
                        />
                      </div>

                      {/* Quick Shortcut Presets */}
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          ⚡ Quick Shortcuts (Preset to 10:00 PM):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {[
                            { label: "Tomorrow 10 PM", days: 1 },
                            { label: "+2 Days 10 PM", days: 2 },
                            { label: "+3 Days 10 PM", days: 3 },
                            { label: "+1 Week 10 PM", days: 7 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                const presetIso = new Date(getPresetDateTime(preset.days, 22, 0)).toISOString();
                                setActiveModalLesson({
                                  ...activeModalLesson,
                                  lesson: { ...activeModalLesson.lesson, unlockAt: presetIso },
                                });
                              }}
                              className="py-1.5 px-2 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-bold text-slate-300 hover:text-cyan-300 transition-colors text-center"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live Unlock Banner Confirmation */}
                      <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="w-4 h-4 text-cyan-400" />
                          <span>
                            🔒 Unlocks on:{" "}
                            {new Date(activeModalLesson.lesson.unlockAt).toLocaleString(undefined, {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 pl-5 leading-relaxed">
                          🛡️ <strong>100% Anti-Hack Protection:</strong> Before this scheduled time, video links & resources are completely stripped on the backend. Students will see a live countdown timer.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </form>

              {/* Sticky Fixed Footer - Always Visible at bottom */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-1 border-t border-slate-800 shrink-0 bg-slate-900">
                <div className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>After saving here, click <strong>"Update Course Details"</strong> on the main page.</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModalLesson(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="lesson-modal-form"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white gradient-button shadow-lg shadow-purple-600/30 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Lesson Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function CourseBuilderPage() {
  return (
    <Suspense fallback={<EduCoreLoader message="Loading course builder..." />}>
      <CourseBuilderContent />
    </Suspense>
  );
}
