"use client";

import React, { useState, useEffect } from "react";
import { Search, BookOpen, Loader2 } from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { API_BASE_URL, CourseType } from "@/lib/api";

export default function CatalogPage() {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const categories = ["All", "Programming", "Design", "Marketing", "Business", "AI", "Data Science"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/courses`);
        const data = await res.json();
        const serverCourses: CourseType[] = data.success && Array.isArray(data.courses) ? data.courses : [];

        // Combine with localStorage created courses if any
        const localCreated: CourseType[] = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
        const serverIds = new Set(serverCourses.map((c) => String(c._id)));
        const combined = [
          ...serverCourses,
          ...localCreated.filter((c) => !serverIds.has(String(c._id))),
        ];

        setCourses(combined);
      } catch (err) {
        console.warn("Backend course fetch fallback:", err);
        const localCreated: CourseType[] = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
        setCourses(localCreated);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const titleMatch = c.title ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const descMatch = c.description ? c.description.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSearch = titleMatch || descMatch;
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || c.level === selectedLevel;

    // ONLY show courses that have been approved & published by Admin
    const isApproved =
      c.status === "published" ||
      c.status === "Published" ||
      c.status === "approved" ||
      c.status === "Approved";

    return matchesSearch && matchesCategory && matchesLevel && isApproved;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Course Catalog</h1>
        <p className="text-slate-400 text-sm mt-1">Explore real video courses stored in database.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, keywords or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Level Dropdown */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                Level: {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-xs font-semibold">Loading courses from EduCore database...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Courses Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or creating a new course in Teacher Studio.</p>
        </div>
      )}
    </div>
  );
}
