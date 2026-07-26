"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Video, FileText, CheckCircle, ArrowRight, BookOpen } from "lucide-react";

export default function CourseBuilderPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [level, setLevel] = useState("All Levels");
  const [price, setPrice] = useState("49.99");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800");

  const [sections, setSections] = useState([
    {
      title: "Section 1: Getting Started",
      lessons: [
        { title: "Lesson 1: Introduction & Environment Setup", type: "video", durationMinutes: 15, contentUrl: "https://www.youtube.com/watch?v=wm5gMKCOB4U" },
      ],
    },
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: `Section ${sections.length + 1}: New Section`,
        lessons: [{ title: "Lesson 1: New Lesson", type: "video", durationMinutes: 10, contentUrl: "https://www.youtube.com/watch?v=wm5gMKCOB4U" }],
      },
    ]);
  };

  const addLesson = (sIdx: number) => {
    const updated = [...sections];
    updated[sIdx].lessons.push({
      title: `Lesson ${updated[sIdx].lessons.length + 1}: New Topic`,
      type: "video",
      durationMinutes: 12,
      contentUrl: "https://www.youtube.com/watch?v=wm5gMKCOB4U",
    });
    setSections(updated);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Course created and published successfully!");
    router.push("/teacher/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Course Builder Studio</h1>
        <p className="text-xs text-slate-400 mt-1">Design your curriculum sections, lessons, videos, and pricing.</p>
      </div>

      <form onSubmit={handlePublish} className="space-y-8">
        {/* Basic Information */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white mb-2">1. Basic Details</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
            <input
              type="text"
              placeholder="e.g. Master Full-Stack Web Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Business">Business</option>
                <option value="AI">AI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Level</label>
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Course Description</label>
            <textarea
              rows={3}
              placeholder="Describe what students will learn in this course..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Curriculum Builder */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">2. Curriculum Builder</h3>
            <button
              type="button"
              onClick={addSection}
              className="px-3 py-1.5 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((sec, sIdx) => (
              <div key={sIdx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => {
                    const updated = [...sections];
                    updated[sIdx].title = e.target.value;
                    setSections(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                />

                <div className="space-y-2 pl-4 border-l-2 border-purple-500/30">
                  {sec.lessons.map((les, lIdx) => (
                    <div key={lIdx} className="flex items-center gap-2 text-xs">
                      <Video className="w-4 h-4 text-purple-400 shrink-0" />
                      <input
                        type="text"
                        value={les.title}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[sIdx].lessons[lIdx].title = e.target.value;
                          setSections(updated);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <span className="text-slate-500">{les.durationMinutes}m</span>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLesson(sIdx)}
                    className="text-[11px] font-bold text-purple-400 hover:underline pt-1"
                  >
                    + Add Lesson to Section
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl text-sm font-bold text-white gradient-button shadow-xl flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Save & Publish Course Now</span>
        </button>
      </form>
    </div>
  );
}
