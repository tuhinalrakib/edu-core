"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, BookOpen } from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { API_BASE_URL, CourseType } from "@/lib/api";
import { EduCoreLoader } from "@/components/EduCoreLoader";

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("category") || "All";

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState("All");

  const levels = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];

  useEffect(() => {
    const fetchCatalogData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch real courses
        const res = await fetch(`${API_BASE_URL}/courses`);
        const data = await res.json();
        const loadedCourses: CourseType[] = data.success && Array.isArray(data.courses) ? data.courses : [];
        setCourses(loadedCourses);

        // 2. Fetch real categories
        const catRes = await fetch(`${API_BASE_URL}/categories`);
        const catData = await catRes.json();
        const dbCats: string[] = catData.success && Array.isArray(catData.categories)
          ? catData.categories.map((c: any) => (typeof c === "string" ? c : c.name))
          : [];

        // Extract from courses as fallback/supplement
        const courseCats = Array.from(new Set(loadedCourses.map((c) => c.category).filter(Boolean)));
        const allUniqueCats = Array.from(new Set(["All", ...dbCats, ...courseCats]));
        setCategories(allUniqueCats);
      } catch (err) {
        console.warn("Backend catalog fetch fallback:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

  useEffect(() => {
    const catQuery = searchParams?.get("category");
    if (catQuery) {
      setSelectedCategory(catQuery);
    }
  }, [searchParams]);

  const filteredCourses = courses.filter((c) => {
    const titleMatch = c.title ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const descMatch = c.description ? c.description.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSearch = titleMatch || descMatch;
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || c.level === selectedLevel;

    // Show only approved/published courses to students
    const isApproved = c.status === "approved" || c.status === "published" || c.status === "Approved" || c.status === "Published";

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
        <div className="py-12">
          <EduCoreLoader message="Loading available catalog courses" />
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

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <EduCoreLoader message="Loading course catalog..." />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
