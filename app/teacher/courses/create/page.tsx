"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { EduCoreLoader } from "@/components/EduCoreLoader";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api";

type LessonType = "video" | "pdf" | "audio" | "attachment" | "quiz" | "assignment";
type VideoProvider = "cloudinary" | "youtube" | "vimeo" | "mp4";
type QuestionType = "mcq" | "true_false" | "fill_blank" | "coding";

export default function CourseBuilderPage() {
  const router = useRouter();

  const [title, setTitle] = useState("React 19 & Next.js 15 Full-Stack SaaS Masterclass");
  const [category, setCategory] = useState("Web Development");
  const [level, setLevel] = useState("All Levels");
  const [price, setPrice] = useState("49.99");
  const [description, setDescription] = useState(
    "Learn to build full-stack web applications with React 19, Next.js 15 App Router, TypeScript, and Express."
  );
  const [thumbnail, setThumbnail] = useState("");
  const [courseStatus, setCourseStatus] = useState<"Draft" | "Published" | "Archived">("Published");

  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Web Development",
    "DevOps & Cloud",
    "UI/UX Design",
    "Data Science & AI",
    "Programming",
    "Business & SaaS",
  ]);

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

    fetchCategories();
  }, []);

  // Sections & Lessons Curriculum Tree State
  const [sections, setSections] = useState([
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
          description: "Overview of React 19 features and project goals.",
          contentUrl: "https://www.youtube.com/watch?v=wm5gMKCOB4U",
          resources: ["Roadmap.pdf", "Starter-Code.zip"],
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
          resources: ["Package.json", "Env-Setup.txt"],
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
          resources: ["Hooks-CheatSheet.pdf"],
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

  // Lesson Edit Modal State
  const [activeModalLesson, setActiveModalLesson] = useState<{
    sIdx: number;
    lIdx: number;
    lesson: any;
  } | null>(null);

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const handleLessonVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeModalLesson) return;

    setIsUploadingVideo(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "educore/course_videos");

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        setActiveModalLesson({
          ...activeModalLesson,
          lesson: {
            ...activeModalLesson.lesson,
            contentUrl: data.url,
            videoProvider: "cloudinary",
          },
        });

        Swal.fire({
          icon: "success",
          title: "Video Uploaded to Cloudinary! 🎥",
          text: "Lesson video file uploaded and attached successfully.",
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

  // Add Lesson Handler
  const handleAddLesson = (sIdx: number, type: LessonType = "video") => {
    const updated = [...sections];
    const newLesson = {
      id: `les-${Date.now()}`,
      title: `Lesson ${updated[sIdx].lessons.length + 1}: New ${type.toUpperCase()} Lesson`,
      type,
      videoProvider: "youtube" as VideoProvider,
      durationMinutes: 10,
      description: "",
      contentUrl: "",
      resources: [],
      quiz: type === "quiz" ? {
        title: "Section Quiz Assessment",
        timeLimitMins: 15,
        passMarkPercent: 75,
        randomize: true,
        questions: [],
      } : null,
      assignment: type === "assignment" ? {
        title: "Hands-on Practical Assignment",
        description: "Complete the project tasks and upload your submission file.",
        deadline: "2026-08-30",
        allowedFormats: "PDF, ZIP, Word, Google Drive Link",
        maxMarks: 100,
        rubric: "Completeness, Code Quality, UI/UX Presentation",
      } : null,
    };
    updated[sIdx].lessons.push(newLesson);
    setSections(updated);

    // Open editor modal for newly added lesson
    setActiveModalLesson({
      sIdx,
      lIdx: updated[sIdx].lessons.length - 1,
      lesson: newLesson,
    });
  };

  // Save Lesson Changes from Modal
  const handleSaveLessonModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalLesson) return;

    const { sIdx, lIdx, lesson } = activeModalLesson;
    const updated = [...sections];
    updated[sIdx].lessons[lIdx] = lesson;
    setSections(updated);
    setActiveModalLesson(null);

    Swal.fire({
      icon: "success",
      title: "Lesson Saved!",
      text: "Lesson content and settings updated.",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
      timer: 1500,
    });
  };

  // Add Quiz Question inside Modal
  const handleAddQuestionToQuiz = () => {
    if (!activeModalLesson || !activeModalLesson.lesson.quiz) return;
    const currentQuiz = activeModalLesson.lesson.quiz;
    const newQ = {
      id: `q-${Date.now()}`,
      questionText: "New Question Text",
      type: "mcq" as QuestionType,
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "Option 1",
      explanation: "",
    };
    const updatedLesson = {
      ...activeModalLesson.lesson,
      quiz: {
        ...currentQuiz,
        questions: [...currentQuiz.questions, newQ],
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
        setThumbnail(data.url);
        Swal.fire({
          icon: "success",
          title: "Thumbnail Uploaded! 🖼️",
          text: "Course thumbnail uploaded to Cloudinary successfully.",
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
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const newCourseObj = {
      _id: `course-${Date.now()}`,
      title,
      category,
      level,
      price: Number(price) || 0,
      description,
      thumbnail: thumbnail || "",
      status: courseStatus,
      totalStudents: 0,
      rating: 5.0,
      sections,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to LocalStorage list for immediate Teacher Dashboard sync
    const existingCourses = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
    const updatedCoursesList = [newCourseObj, ...existingCourses];
    localStorage.setItem("educore_created_courses", JSON.stringify(updatedCoursesList));

    // 2. Attempt POST to backend /api/courses
    try {
      await fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourseObj),
      });
    } catch (err: any) {
      console.warn("Backend save course fallback:", err.message);
    }

    Swal.fire({
      icon: "success",
      title: "Course Saved & Published! 🎉",
      text: `Course "${title}" has been saved and added to your instructor dashboard with status: ${courseStatus}.`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    }).then(() => {
      router.push("/teacher/dashboard");
    });
  };

  return (
    <>
      {(isUploadingVideo || isUploadingThumbnail) && (
        <EduCoreLoader
          message={
            isUploadingThumbnail
              ? "Uploading Course Thumbnail to Cloudinary..."
              : "Uploading Lesson Video to Cloudinary Server..."
          }
          fullScreen={true}
        />
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Instructor Course Studio
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">Full-Featured Course Builder</h1>
          <p className="text-xs text-slate-400 mt-1">
            Design sections, video lessons (Cloudinary/YouTube/Vimeo), downloadable resources, interactive quizzes, and assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveCourse}
          className="px-6 py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 shrink-0"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Save & Publish Course</span>
        </button>
      </div>

      <form onSubmit={handleSaveCourse} className="space-y-8">
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Status</label>
              <select
                value={courseStatus}
                onChange={(e) => setCourseStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Published">Published (Live on Catalog)</option>
                <option value="Draft">Draft (Private)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Course Cover Image / Thumbnail
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt="Course Thumbnail"
                    className="w-36 h-20 rounded-xl object-cover border border-purple-500/40 shrink-0 shadow-md"
                  />
                ) : (
                  <div className="w-36 h-20 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-[10px] gap-1 shrink-0">
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                    <span>No Image Added</span>
                  </div>
                )}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL or upload image file below..."
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <label
                      htmlFor="course-thumbnail-upload-input"
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shadow-md transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image</span>
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
                  key={section.id}
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
                        <div className="space-y-2.5">
                          {section.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-purple-500/40 transition-colors"
                            >
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
                                      <span className="uppercase text-slate-400">{lesson.videoProvider} ({lesson.durationMinutes}m)</span>
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
        <button
          type="submit"
          className="w-full py-4 rounded-2xl text-sm font-black text-white gradient-button shadow-2xl shadow-purple-600/30 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Save & Publish Complete Course</span>
        </button>
      </form>

      {/* ========================================================================= */}
      {/* MODAL: LESSON / QUIZ / ASSIGNMENT CONFIGURATION EDITOR */}
      {/* ========================================================================= */}
      {activeModalLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
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
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLessonModal} className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
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
                    onClick={() =>
                      setActiveModalLesson({
                        ...activeModalLesson,
                        lesson: { ...activeModalLesson.lesson, type: t },
                      })
                    }
                    className={`py-2 text-xs font-bold rounded-xl capitalize transition-all border ${
                      activeModalLesson.lesson.type === t
                        ? "bg-purple-900/50 border-purple-500 text-purple-200"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* VIDEO SETTINGS */}
              {activeModalLesson.lesson.type === "video" && (
                <div className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Video Provider & Media File
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Video Provider</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["cloudinary", "youtube", "vimeo", "mp4"] as VideoProvider[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            setActiveModalLesson({
                              ...activeModalLesson,
                              lesson: { ...activeModalLesson.lesson, videoProvider: p },
                            })
                          }
                          className={`py-2 text-[11px] font-bold rounded-xl uppercase transition-all border ${
                            activeModalLesson.lesson.videoProvider === p
                              ? "bg-purple-900/50 border-purple-500 text-purple-200"
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Video URL / Cloudinary Media Link
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. https://res.cloudinary.com/dxkmkskvy/video/upload/sample.mp4"
                        value={activeModalLesson.lesson.contentUrl || ""}
                        onChange={(e) =>
                          setActiveModalLesson({
                            ...activeModalLesson,
                            lesson: { ...activeModalLesson.lesson, contentUrl: e.target.value },
                          })
                        }
                        className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      <label
                        htmlFor="lesson-video-file-input"
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-900/60 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Video File</span>
                      </label>
                      <input
                        id="lesson-video-file-input"
                        type="file"
                        accept="video/*"
                        onChange={handleLessonVideoFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={activeModalLesson.lesson.durationMinutes}
                      onChange={(e) =>
                        setActiveModalLesson({
                          ...activeModalLesson,
                          lesson: { ...activeModalLesson.lesson, durationMinutes: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* QUIZ SETTINGS BUILDER */}
              {activeModalLesson.lesson.type === "quiz" && (
                <div className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Quiz Parameters & Questions
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Time Limit (Minutes)</label>
                      <input
                        type="number"
                        value={activeModalLesson.lesson.quiz?.timeLimitMins || 15}
                        onChange={(e) =>
                          setActiveModalLesson({
                            ...activeModalLesson,
                            lesson: {
                              ...activeModalLesson.lesson,
                              quiz: {
                                ...activeModalLesson.lesson.quiz,
                                timeLimitMins: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Pass Mark (%)</label>
                      <input
                        type="number"
                        value={activeModalLesson.lesson.quiz?.passMarkPercent || 80}
                        onChange={(e) =>
                          setActiveModalLesson({
                            ...activeModalLesson,
                            lesson: {
                              ...activeModalLesson.lesson,
                              quiz: {
                                ...activeModalLesson.lesson.quiz,
                                passMarkPercent: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Questions List</span>
                      <button
                        type="button"
                        onClick={handleAddQuestionToQuiz}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold"
                      >
                        + Add Question
                      </button>
                    </div>

                    {activeModalLesson.lesson.quiz?.questions?.map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-purple-300">Q{qIdx + 1}: {q.type.toUpperCase()}</span>
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
                            className="text-rose-400 hover:underline text-[11px]"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={q.questionText}
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
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ASSIGNMENT SETTINGS BUILDER */}
              {activeModalLesson.lesson.type === "assignment" && (
                <div className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Assignment Rubric & Submissions Settings
                  </h4>

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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Allowed File Upload Formats</label>
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Grading Rubric</label>
                    <textarea
                      rows={2}
                      value={activeModalLesson.lesson.assignment?.rubric || ""}
                      onChange={(e) =>
                        setActiveModalLesson({
                          ...activeModalLesson,
                          lesson: {
                            ...activeModalLesson.lesson,
                            assignment: {
                              ...activeModalLesson.lesson.assignment,
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

              {/* Save / Close Modal Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModalLesson(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white gradient-button shadow-md"
                >
                  Save Lesson Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </>
);
}
