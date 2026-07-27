"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import {
  ShieldAlert,
  Users,
  DollarSign,
  BookOpen,
  CheckCircle,
  XCircle,
  Plus,
  Percent,
  TrendingUp,
  AlertTriangle,
  Eye,
  Trash2,
  Award,
  Zap,
  Tag,
  FolderPlus,
  CreditCard,
  RefreshCw,
  Star,
  Calendar,
  BarChart3,
  Search,
  Filter,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Layers,
  X,
  User,
  GraduationCap,
  Upload,
  Camera,
  Mail,
  Settings,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { AdminCharts } from "@/components/charts/AdminCharts";
import { EduCoreLoader } from "@/components/EduCoreLoader";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "overview";
  const { user, updateUser, token } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "overview" | "teachers" | "students" | "courses" | "coupons" | "payments" | "analytics" | "profile"
  >(initialTab);

  // Admin Profile Form State
  const [profileName, setProfileName] = useState(user?.name || "Super Admin");
  const [profileEmail, setProfileEmail] = useState(user?.email || "admin@educore.com");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || "");
  const [profileTitle, setProfileTitle] = useState(user?.title || "Super Platform Administrator");
  const [profileBio, setProfileBio] = useState(user?.bio || "Platform Administrator managing EduCore SaaS LMS operations.");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setProfileName(user.name);
      if (user.email) setProfileEmail(user.email);
      if (user.avatar) setProfileAvatar(user.avatar);
      if (user.title) setProfileTitle(user.title);
      if (user.bio) setProfileBio(user.bio);
    }
  }, [user]);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "educore/avatars");

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        setProfileAvatar(data.url);
        updateUser({ avatar: data.url });
        Swal.fire({
          icon: "success",
          title: "Image Uploaded to Cloudinary! ☁️",
          text: "Profile picture uploaded and updated successfully.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          timer: 2000,
        });
      } else {
        throw new Error(data.message || "Cloudinary upload failed");
      }
    } catch (err: any) {
      console.warn("Cloudinary upload fallback:", err.message);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfileAvatar(reader.result);
          updateUser({ avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      updateUser({
        name: profileName,
        email: profileEmail,
        avatar: profileAvatar,
        title: profileTitle,
        bio: profileBio,
      });

      if (token) {
        await fetch(`${API_BASE_URL}/users/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profileName,
            email: profileEmail,
            avatar: profileAvatar,
            title: profileTitle,
            bio: profileBio,
          }),
        });
      }

      Swal.fire({
        icon: "success",
        title: "Profile Updated Successfully! 🎉",
        text: "Your admin profile details and picture have been updated.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        customClass: {
          popup: "rounded-2xl border border-slate-800 shadow-2xl",
        },
      });
    } catch (err: any) {
      console.error("Save profile error:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Search Filters
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // Modals States
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // 1. Teachers State
  const [teachers, setTeachers] = useState([
    {
      id: "t1",
      name: "Dr. Sarah Jenkins",
      email: "teacher@educore.com",
      title: "Senior Full-Stack Instructor",
      status: "approved", // approved, pending, suspended, rejected
      coursesCount: 8,
      studentsCount: 12450,
      totalEarnings: 45200,
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      joinedDate: "2025-01-15",
      bio: "Ph.D. in Computer Science with 12+ years of software engineering experience at Tech Giants.",
    },
    {
      id: "t2",
      name: "Alex Mercer",
      email: "alex.m@educore.com",
      title: "DevOps & Cloud Architect",
      status: "pending",
      coursesCount: 3,
      studentsCount: 3200,
      totalEarnings: 18400,
      rating: 4.7,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      joinedDate: "2026-03-10",
      bio: "AWS Certified Solutions Architect & Docker Core Contributor.",
    },
    {
      id: "t3",
      name: "Elena Rostova",
      email: "elena.r@educore.com",
      title: "UI/UX Design Lead",
      status: "approved",
      coursesCount: 5,
      studentsCount: 8900,
      totalEarnings: 29800,
      rating: 4.85,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      joinedDate: "2025-08-22",
      bio: "Product Designer with 8+ years leading design systems at Figma agency partners.",
    },
  ]);

  // 2. Students State
  const [students, setStudents] = useState([
    {
      id: "s1",
      name: "Alex Rivera",
      email: "student@educore.com",
      status: "active", // active, suspended
      joinedDate: "2026-02-01",
      enrolledCount: 6,
      completedCount: 3,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      purchasedCourses: [
        { title: "Next.js 15 & React 19 Full-Stack SaaS Masterclass", progress: 85, price: 99.99 },
        { title: "Node.js & Microservices Architecture", progress: 100, price: 79.99 },
        { title: "UI/UX Design Systems with Figma", progress: 40, price: 49.99 },
      ],
    },
    {
      id: "s2",
      name: "Jessica Chen",
      email: "jessica.c@gmail.com",
      status: "active",
      joinedDate: "2026-04-12",
      enrolledCount: 4,
      completedCount: 2,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
      purchasedCourses: [
        { title: "Python for Data Science & Machine Learning", progress: 60, price: 89.99 },
        { title: "Docker & Kubernetes Deployment Handbook", progress: 100, price: 69.99 },
      ],
    },
    {
      id: "s3",
      name: "Michael Vance",
      email: "michael.v@yahoo.com",
      status: "suspended",
      joinedDate: "2025-11-05",
      enrolledCount: 2,
      completedCount: 0,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      purchasedCourses: [{ title: "Cyber Security Fundamentals", progress: 15, price: 59.99 }],
    },
  ]);

  // 3. Courses Management State
  const [adminCourses, setAdminCourses] = useState([
    {
      id: "c1",
      title: "Next.js 15 & React 19 Full-Stack SaaS Masterclass",
      teacher: "Dr. Sarah Jenkins",
      category: "Web Development",
      price: 99.99,
      status: "published", // published, pending, rejected
      isFeatured: true,
      students: 4520,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    },
    {
      id: "c2",
      title: "Advanced Cloud Architecture & Kubernetes",
      teacher: "Alex Mercer",
      category: "DevOps",
      price: 89.99,
      status: "pending",
      isFeatured: false,
      students: 0,
      thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400",
    },
    {
      id: "c3",
      title: "UI/UX Design Systems & Micro-Interactions",
      teacher: "Elena Rostova",
      category: "Design",
      price: 69.99,
      status: "published",
      isFeatured: true,
      students: 2180,
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400",
    },
    {
      id: "c4",
      title: "Python AI & LLM Engineering Guide",
      teacher: "Dr. Sarah Jenkins",
      category: "Data Science",
      price: 119.99,
      status: "pending",
      isFeatured: false,
      students: 0,
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
    },
  ]);

  // 4. Categories & Tags Dynamic State
  const [categories, setCategories] = useState<any[]>([
    { _id: "cat1", name: "Web Development", count: 42 },
    { _id: "cat2", name: "DevOps & Cloud", count: 18 },
    { _id: "cat3", name: "UI/UX Design", count: 25 },
    { _id: "cat4", name: "Data Science & AI", count: 31 },
  ]);

  const [tags, setTags] = useState<any[]>([
    { _id: "t1", name: "React" },
    { _id: "t2", name: "Next.js" },
    { _id: "t3", name: "TypeScript" },
    { _id: "t4", name: "Docker" },
    { _id: "t5", name: "Python" },
    { _id: "t6", name: "Figma" },
    { _id: "t7", name: "AWS" },
    { _id: "t8", name: "GraphQL" },
  ]);

  const [newCatName, setNewCatName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);

  // Fetch dynamic Categories & Tags from Backend API
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const resCat = await fetch(`${API_BASE_URL}/categories`);
        const dataCat = await resCat.json();
        if (dataCat.success && Array.isArray(dataCat.categories)) {
          setCategories(dataCat.categories);
        }

        const resTags = await fetch(`${API_BASE_URL}/categories/tags`);
        const dataTags = await resTags.json();
        if (dataTags.success && Array.isArray(dataTags.tags)) {
          setTags(dataTags.tags);
        }
      } catch (err) {
        console.warn("Backend categories/tags load error:", err);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  // 5. Coupons Management State
  const [coupons, setCoupons] = useState([
    {
      id: "cp1",
      code: "WELCOME50",
      type: "Percentage",
      value: "50%",
      expiry: "2026-12-31",
      usage: "128 / 500",
      status: "Active",
    },
    {
      id: "cp2",
      code: "EDUCORE10",
      type: "Fixed",
      value: "$10.00",
      expiry: "2026-08-31",
      usage: "45 / 1000",
      status: "Active",
    },
    {
      id: "cp3",
      code: "FLASH30",
      type: "Percentage",
      value: "30%",
      expiry: "2026-09-15",
      usage: "92 / 200",
      status: "Active",
    },
  ]);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "Percentage" as "Percentage" | "Fixed",
    value: "",
    expiry: "",
    limit: "100",
  });

  // 6. Payment & Withdrawals State
  const [transactions, setTransactions] = useState([
    {
      id: "TXN-98421",
      student: "Alex Rivera",
      course: "Next.js 15 & React 19 Full-Stack SaaS Masterclass",
      amount: 99.99,
      commission: 19.99,
      date: "2026-07-27 10:14 AM",
      status: "Completed",
      gateway: "Stripe",
    },
    {
      id: "TXN-98420",
      student: "Jessica Chen",
      course: "Python for Data Science",
      amount: 89.99,
      commission: 17.99,
      date: "2026-07-27 09:30 AM",
      status: "Completed",
      gateway: "PayPal",
    },
    {
      id: "TXN-98419",
      student: "Michael Vance",
      course: "Cyber Security Fundamentals",
      amount: 59.99,
      commission: 11.99,
      date: "2026-07-26 04:12 PM",
      status: "Refunded",
      gateway: "Stripe",
    },
  ]);

  const [withdrawals, setWithdrawals] = useState([
    {
      id: "WDR-101",
      teacher: "Dr. Sarah Jenkins",
      amount: 1200.0,
      account: "Bank Transfer (**** 4892)",
      requestedDate: "2026-07-25",
      status: "Pending",
    },
    {
      id: "WDR-102",
      teacher: "Elena Rostova",
      amount: 850.0,
      account: "PayPal (elena.r@educore.com)",
      requestedDate: "2026-07-24",
      status: "Approved",
    },
  ]);

  // Action Handlers
  const handleTeacherStatusChange = (teacherId: string, newStatus: "approved" | "suspended" | "rejected") => {
    setTeachers((prev) => prev.map((t) => (t.id === teacherId ? { ...t, status: newStatus } : t)));
    Swal.fire({
      icon: "success",
      title: "Teacher Status Updated",
      text: `Teacher account status updated to ${newStatus.toUpperCase()}`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    });
  };

  const handleStudentStatusChange = (studentId: string, newStatus: "active" | "suspended") => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s)));
    Swal.fire({
      icon: "success",
      title: "Student Status Updated",
      text: `Student account status updated to ${newStatus.toUpperCase()}`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    Swal.fire({
      title: "Delete Student Account?",
      text: "This action will permanently delete the student account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
    }).then((res) => {
      if (res.isConfirmed) {
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        Swal.fire({
          icon: "success",
          title: "Student Deleted",
          text: "Student account has been removed.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });
      }
    });
  };

  const handleCourseStatusChange = (courseId: string, newStatus: "published" | "rejected") => {
    setAdminCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c)));
    Swal.fire({
      icon: "success",
      title: "Course Status Updated",
      text: `Course has been ${newStatus === "published" ? "APPROVED & PUBLISHED" : "REJECTED"}`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    Swal.fire({
      title: "Delete Course?",
      text: "Are you sure you want to remove this course from the platform?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
    }).then((res) => {
      if (res.isConfirmed) {
        setAdminCourses((prev) => prev.filter((c) => c.id !== courseId));
        Swal.fire({
          icon: "success",
          title: "Course Removed",
          text: "Course has been deleted from EduCore.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });
      }
    });
  };

  const handleToggleFeatureCourse = (courseId: string) => {
    setAdminCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, isFeatured: !c.isFeatured } : c))
    );
    Swal.fire({
      icon: "success",
      title: "Featured Status Toggled",
      text: "Featured status updated for this course.",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isAddingCategory) return;

    setIsAddingCategory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCategories((prev) => [data.category, ...prev]);
        setNewCatName("");
        Swal.fire({
          icon: "success",
          title: "Category Created",
          text: `Category "${data.category.name}" created successfully in backend!`,
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to create category.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });
      }
    } catch (err: any) {
      console.warn("Backend add category error:", err);
      const fallbackCat = { _id: "cat-" + Date.now(), name: newCatName.trim(), count: 0 };
      setCategories((prev) => [fallbackCat, ...prev]);
      setNewCatName("");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await fetch(`${API_BASE_URL}/categories/${catId}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c: any) => c._id !== catId && c.id !== catId));
      Swal.fire({
        icon: "success",
        title: "Category Removed",
        text: "Category deleted successfully from database.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } catch (err) {
      setCategories((prev) => prev.filter((c: any) => c._id !== catId && c.id !== catId));
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || isAddingTag) return;

    setIsAddingTag(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTags((prev) => [data.tag, ...prev]);
        setNewTagName("");
        Swal.fire({
          icon: "success",
          title: "Tag Created",
          text: `Tag #${data.tag.name} created successfully in backend!`,
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to create tag.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });
      }
    } catch (err: any) {
      const fallbackTag = { _id: "tag-" + Date.now(), name: newTagName.trim() };
      setTags((prev) => [fallbackTag, ...prev]);
      setNewTagName("");
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await fetch(`${API_BASE_URL}/categories/tags/${tagId}`, { method: "DELETE" });
      setTags((prev) => prev.filter((t: any) => t._id !== tagId && t.id !== tagId && t.name !== tagId));
      Swal.fire({
        icon: "success",
        title: "Tag Removed",
        text: "Tag deleted successfully from database.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } catch (err) {
      setTags((prev) => prev.filter((t: any) => t._id !== tagId && t.id !== tagId && t.name !== tagId));
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim() || isAddingCoupon) return;

    setIsAddingCoupon(true);
    try {
      setCoupons((prev) => [
        ...prev,
        {
          id: "cp-" + Date.now(),
          code: newCoupon.code.toUpperCase().trim(),
          type: newCoupon.type,
          value: newCoupon.type === "Percentage" ? `${newCoupon.value}%` : `$${newCoupon.value}`,
          expiry: newCoupon.expiry || "2026-12-31",
          usage: `0 / ${newCoupon.limit}`,
          status: "Active",
        },
      ]);
      setNewCoupon({ code: "", type: "Percentage", value: "", expiry: "", limit: "100" });
      Swal.fire({
        icon: "success",
        title: "Coupon Published",
        text: "New promotional discount code is active.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setIsAddingCoupon(false);
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
  };

  const handleWithdrawAction = (withdrawId: string, action: "Approved" | "Rejected") => {
    setWithdrawals((prev) => prev.map((w) => (w.id === withdrawId ? { ...w, status: action } : w)));
    Swal.fire({
      icon: action === "Approved" ? "success" : "info",
      title: `Withdrawal ${action}`,
      text: `Payout request marked as ${action.toUpperCase()}`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    });
  };

  const handleRefundTransaction = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: "Refunded" } : t))
    );
    Swal.fire({
      icon: "info",
      title: "Transaction Refunded",
      text: `Transaction ${txnId} has been refunded to the student.`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    });
  };

  const pendingCoursesCount = adminCourses.filter((c) => c.status === "pending").length;

  return (
    <>
      {isUploadingAvatar && (
        <EduCoreLoader
          message="Uploading Profile Image to Cloudinary Server..."
          fullScreen={true}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Super Admin Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Super Admin Operations Console
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">EduCore SaaS Platform Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage teachers, students, course approvals, promotional coupons, payouts, and revenue analytics.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white gradient-button shadow-lg shadow-purple-500/20 self-start sm:self-auto shrink-0"
        >
          <Settings className="w-4 h-4 text-white" />
          <span>Edit Admin Profile</span>
        </button>
      </div>

      {/* 8 Primary Key Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value="25,410" icon={Users} change="18% MoM" gradient="from-blue-600 to-cyan-600" />
        <StatCard title="Total Teachers" value="450" icon={UserCheck} change="12% MoM" gradient="from-rose-600 to-pink-600" />
        <StatCard title="Total Courses" value="1,280" icon={BookOpen} change="24% MoM" gradient="from-purple-600 to-indigo-600" />
        <StatCard title="Platform Revenue" value="$128,450.00" icon={DollarSign} change="32% MoM" gradient="from-emerald-600 to-teal-600" />

        <StatCard title="Today's Sales" value="$2,840.00" icon={TrendingUp} change="+14% vs yesterday" gradient="from-emerald-600 to-cyan-600" />
        <StatCard title="Monthly Sales" value="$38,450.00" icon={CreditCard} change="+28% vs last month" gradient="from-amber-600 to-orange-600" />
        <StatCard title="New Users (This Week)" value="+380" icon={User} change="+45 new today" gradient="from-indigo-600 to-purple-600" />
        <StatCard
          title="Pending Courses"
          value={pendingCoursesCount.toString()}
          icon={Clock}
          change={pendingCoursesCount > 0 ? "Requires Review" : "All Approved"}
          gradient="from-rose-600 to-red-600"
        />
      </div>

      {/* Admin Module Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-3 no-scrollbar">
        {[
          { id: "overview", label: "Dashboard", icon: BarChart3 },
          { id: "teachers", label: "Teacher Management", icon: UserCheck },
          { id: "students", label: "Student Management", icon: GraduationCap },
          { id: "courses", label: "Course Management", icon: BookOpen },
          { id: "coupons", label: "Coupon Management", icon: Tag },
          { id: "payments", label: "Payment & Withdrawals", icon: CreditCard },
          { id: "analytics", label: "Analytics Hub", icon: TrendingUp },
          { id: "profile", label: "My Profile Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-purple-900/50 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === "courses" && pendingCoursesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingCoursesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <AdminCharts />

          {/* Pending Course Approvals Quick Widget */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Pending Course Approvals</span>
                  {pendingCoursesCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {pendingCoursesCount} Action Required
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">Review teacher submissions before publishing live on catalog.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Course</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {adminCourses
                    .filter((c) => c.status === "pending")
                    .map((course) => (
                      <tr key={course.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-bold text-white flex items-center gap-3">
                          <img src={course.thumbnail} alt={course.title} className="w-12 h-8 rounded object-cover" />
                          <span className="truncate max-w-xs">{course.title}</span>
                        </td>
                        <td className="p-3">{course.teacher}</td>
                        <td className="p-3">{course.category}</td>
                        <td className="p-3 font-bold text-emerald-400">${course.price}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pending Review
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleCourseStatusChange(course.id, "published")}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30 border border-emerald-500/30"
                          >
                            Approve & Publish
                          </button>
                          <button
                            onClick={() => handleCourseStatusChange(course.id, "rejected")}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30 border border-rose-500/30"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  {adminCourses.filter((c) => c.status === "pending").length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500">
                        ✨ No pending course approvals! All submissions have been reviewed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TEACHER MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === "teachers" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Teacher Management</h2>
              <p className="text-xs text-slate-400">Approve new teacher applications, view profiles, earnings, and manage status.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teacher by name/email..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Instructor</th>
                  <th className="p-3">Title / Specialization</th>
                  <th className="p-3">Courses & Students</th>
                  <th className="p-3">Total Earnings</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teachers
                  .filter(
                    (t) =>
                      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                      t.email.toLowerCase().includes(teacherSearch.toLowerCase())
                  )
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={t.avatar} className="w-9 h-9 rounded-full object-cover border border-purple-500/30" />
                          <div>
                            <p className="font-bold text-white">{t.name}</p>
                            <p className="text-[11px] text-slate-400">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{t.title}</td>
                      <td className="p-3 font-semibold text-slate-300">
                        {t.coursesCount} Courses • {t.studentsCount.toLocaleString()} Students
                      </td>
                      <td className="p-3 font-bold text-emerald-400">${t.totalEarnings.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{t.rating}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                            t.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : t.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedTeacher(t)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                          title="View Profile & Analytics"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" /> Profile
                        </button>
                        {t.status !== "approved" && (
                          <button
                            onClick={() => handleTeacherStatusChange(t.id, "approved")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold"
                          >
                            Approve
                          </button>
                        )}
                        {t.status === "approved" && (
                          <button
                            onClick={() => handleTeacherStatusChange(t.id, "suspended")}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => handleTeacherStatusChange(t.id, "rejected")}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STUDENT MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === "students" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Student Management</h2>
              <p className="text-xs text-slate-400">View enrolled students, check progress, manage account status, or delete accounts.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student by name/email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3">Purchased Courses</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students
                  .filter(
                    (s) =>
                      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      s.email.toLowerCase().includes(studentSearch.toLowerCase())
                  )
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={s.avatar} className="w-9 h-9 rounded-full object-cover border border-blue-500/30" />
                          <span className="font-bold text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">{s.email}</td>
                      <td className="p-3">{s.joinedDate}</td>
                      <td className="p-3 font-semibold text-purple-400">{s.enrolledCount} Enrolled</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                            s.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                          title="View Progress & Purchased Courses"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" /> Progress
                        </button>
                        {s.status === "active" ? (
                          <button
                            onClick={() => handleStudentStatusChange(s.id, "suspended")}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStudentStatusChange(s.id, "active")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COURSE MANAGEMENT TAB (Includes Categories & Tags) */}
      {/* ========================================================================= */}
      {activeTab === "courses" && (
        <div className="space-y-8">
          {/* Courses Table */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">All Platform Courses</h2>
                <p className="text-xs text-slate-400">Approve, reject, delete, or toggle featured status for any course.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search course title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Course</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Featured</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {adminCourses
                    .filter((c) => c.title.toLowerCase().includes(courseSearch.toLowerCase()))
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-bold text-white flex items-center gap-3">
                          <img src={c.thumbnail} className="w-12 h-8 rounded object-cover" />
                          <span className="truncate max-w-xs">{c.title}</span>
                        </td>
                        <td className="p-3">{c.teacher}</td>
                        <td className="p-3">{c.category}</td>
                        <td className="p-3 font-bold text-emerald-400">${c.price}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleFeatureCourse(c.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.isFeatured
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {c.isFeatured ? "⭐ Featured" : "Standard"}
                          </button>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                              c.status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : c.status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {c.status !== "published" && (
                            <button
                              onClick={() => handleCourseStatusChange(c.id, "published")}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30"
                            >
                              Approve
                            </button>
                          )}
                          {c.status === "published" && (
                            <button
                              onClick={() => handleCourseStatusChange(c.id, "rejected")}
                              className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Categories & Tags Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Management */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-400" />
                <span>Categories Management</span>
              </h3>

              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={isAddingCategory || !newCatName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-button whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 min-w-[120px]"
                >
                  {isAddingCategory ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    "+ Add Category"
                  )}
                </button>
              </form>

              <div className="divide-y divide-slate-800/60 pt-2 text-xs">
                {categories.map((cat: any) => {
                  const catId = cat._id || cat.id;
                  return (
                    <div key={catId} className="py-2.5 flex items-center justify-between">
                      <span className="font-bold text-white">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">{cat.count || 0} courses</span>
                        <button onClick={() => handleDeleteCategory(catId)} className="text-rose-400 hover:text-rose-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tags Management */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-400" />
                <span>Course Tags Management</span>
              </h3>

              <form onSubmit={handleAddTag} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New tag name (e.g. Next.js)..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={isAddingTag || !newTagName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 min-w-[100px]"
                >
                  {isAddingTag ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    "+ Add Tag"
                  )}
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag: any) => {
                  const tagName = typeof tag === "string" ? tag : tag.name;
                  const tagId = typeof tag === "string" ? tag : (tag._id || tag.id);
                  return (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      <span>#{tagName}</span>
                      <button onClick={() => handleDeleteTag(tagId)} className="text-slate-500 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. COUPON MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === "coupons" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Promotional Coupon Management</h2>
              <p className="text-xs text-slate-400">Configure percentage or fixed discount coupons with expiration dates and usage limits.</p>
            </div>
          </div>

          {/* New Coupon Creation Form */}
          <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. SUMMER50"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Discount Type</label>
              <select
                value={newCoupon.type}
                onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Percentage">Percentage Discount (%)</option>
                <option value="Fixed">Fixed Discount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Value ({newCoupon.type === "Percentage" ? "%" : "$"})</label>
              <input
                type="number"
                placeholder={newCoupon.type === "Percentage" ? "20" : "15"}
                value={newCoupon.value}
                onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiration Date</label>
              <input
                type="date"
                value={newCoupon.expiry}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isAddingCoupon || !newCoupon.code.trim()}
                className="w-full py-2 rounded-xl text-xs font-bold text-white gradient-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isAddingCoupon ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Creating...</span>
                  </>
                ) : (
                  "+ Create Coupon"
                )}
              </button>
            </div>
          </form>

          {/* Active Coupons List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Coupon Code</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Discount Value</th>
                  <th className="p-3">Expiration Date</th>
                  <th className="p-3">Usage Limit</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-purple-400">{c.code}</td>
                    <td className="p-3">{c.type}</td>
                    <td className="p-3 font-bold text-emerald-400">{c.value}</td>
                    <td className="p-3 text-slate-400">{c.expiry}</td>
                    <td className="p-3">{c.usage}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeleteCoupon(c.id)} className="text-rose-400 hover:text-rose-300 font-bold">
                        <Trash2 className="w-4 h-4 inline" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PAYMENT MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === "payments" && (
        <div className="space-y-8">
          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Gross Sales</span>
              <p className="text-2xl font-black text-white mt-1">$128,450.00</p>
              <span className="text-[11px] text-emerald-400 font-semibold">+24% MoM</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Admin Commission (20%)</span>
              <p className="text-2xl font-black text-purple-400 mt-1">$25,690.00</p>
              <span className="text-[11px] text-purple-300 font-semibold">Net Platform Revenue</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Instructor Payouts (80%)</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">$102,760.00</p>
              <span className="text-[11px] text-slate-400 font-semibold">Disbursed to Teachers</span>
            </div>
          </div>

          {/* Teacher Withdrawal Requests */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">Teacher Payout / Withdraw Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment Account</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-mono text-purple-400">{w.id}</td>
                      <td className="p-3 font-bold text-white">{w.teacher}</td>
                      <td className="p-3 font-bold text-emerald-400">${w.amount.toFixed(2)}</td>
                      <td className="p-3 text-slate-400">{w.account}</td>
                      <td className="p-3">{w.requestedDate}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                            w.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : w.status === "Pending"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {w.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleWithdrawAction(w.id, "Approved")}
                              className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30"
                            >
                              Approve Payout
                            </button>
                            <button
                              onClick={() => handleWithdrawAction(w.id, "Rejected")}
                              className="px-3 py-1 rounded bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions Log & Refund Management */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">Payment Transactions & Refund Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Transaction ID</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Admin Fee</th>
                    <th className="p-3">Gateway</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-mono text-slate-400">{t.id}</td>
                      <td className="p-3 font-bold text-white">{t.student}</td>
                      <td className="p-3 truncate max-w-xs">{t.course}</td>
                      <td className="p-3 font-bold text-emerald-400">${t.amount}</td>
                      <td className="p-3 text-purple-400 font-semibold">${t.commission}</td>
                      <td className="p-3">{t.gateway}</td>
                      <td className="p-3 text-slate-400">{t.date}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {t.status === "Completed" && (
                          <button
                            onClick={() => handleRefundTransaction(t.id)}
                            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30 text-[11px]"
                          >
                            Process Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ANALYTICS HUB TAB */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          <AdminCharts />

          {/* Leaderboards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Best Selling Courses */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Best Selling Courses</span>
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                {adminCourses.slice(0, 3).map((c, idx) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white truncate max-w-[140px]">{c.title}</p>
                        <p className="text-[11px] text-slate-400">{c.teacher}</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">${(c.price * (c.students || 120)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active Student */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span>Most Active Students</span>
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                {students.map((s, idx) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={s.avatar} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-white">{s.name}</p>
                        <p className="text-[11px] text-slate-400">{s.completedCount} Courses Completed</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                      {s.enrolledCount} Enrolled
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active Instructor */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-rose-400" />
                <span>Top Rated Instructors</span>
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                {teachers.map((t, idx) => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-white">{t.name}</p>
                        <p className="text-[11px] text-slate-400">{t.studentsCount.toLocaleString()} Students</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{t.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. ADMIN PROFILE SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
                <span>Admin Profile & Account Settings</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Update your administrator profile picture, name, designation title, and personal credentials.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Avatar Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="relative group">
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt={profileName}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500/40 shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-3xl ring-4 ring-purple-500/40 uppercase shadow-xl">
                      {profileName ? profileName.charAt(0) : "A"}
                    </div>
                  )}
                  <label
                    htmlFor="avatar-file-input"
                    className="absolute bottom-0 right-0 p-2.5 rounded-full gradient-button text-white cursor-pointer shadow-lg hover:scale-110 transition-transform"
                    title="Upload New Profile Picture"
                  >
                    {isUploadingAvatar ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </label>
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h3 className="text-sm font-bold text-white">Profile Photo</h3>
                  <p className="text-xs text-slate-400">
                    Upload a photo or paste a direct image URL. Images are uploaded securely via Cloudinary.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      placeholder="https://example.com/avatar.jpg"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <label
                      htmlFor="avatar-file-input"
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-900/60 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      placeholder="Admin Name"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      required
                      placeholder="admin@educore.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Admin Designation / Role Title</label>
                  <input
                    type="text"
                    value={profileTitle}
                    onChange={(e) => setProfileTitle(e.target.value)}
                    placeholder="Super Platform Administrator"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">System Role Permissions</label>
                  <div className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-rose-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Super Administrator (Full Access)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Bio / Admin Description</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Tell students and instructors about your administrative role..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW TEACHER PROFILE & ANALYTICS */}
      {/* ========================================================================= */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Teacher Profile & Analytics</h3>
              <button onClick={() => setSelectedTeacher(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img src={selectedTeacher.avatar} className="w-16 h-16 rounded-2xl object-cover border border-purple-500/40 shadow-lg" />
              <div>
                <h4 className="text-lg font-bold text-white">{selectedTeacher.name}</h4>
                <p className="text-xs text-purple-400 font-semibold">{selectedTeacher.title}</p>
                <p className="text-xs text-slate-400">{selectedTeacher.email}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p className="font-bold text-slate-400 mb-1">Biography:</p>
              {selectedTeacher.bio}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Courses</span>
                <span className="text-lg font-black text-white">{selectedTeacher.coursesCount}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Students</span>
                <span className="text-lg font-black text-purple-400">{selectedTeacher.studentsCount.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Earnings</span>
                <span className="text-lg font-black text-emerald-400">${selectedTeacher.totalEarnings.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW STUDENT PROGRESS & PURCHASED COURSES */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Student Progress & Purchased Courses</h3>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img src={selectedStudent.avatar} className="w-16 h-16 rounded-2xl object-cover border border-blue-500/40 shadow-lg" />
              <div>
                <h4 className="text-lg font-bold text-white">{selectedStudent.name}</h4>
                <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Joined: {selectedStudent.joinedDate}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Enrolled Courses & Progress</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedStudent.purchasedCourses?.map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-white">
                      <span className="truncate max-w-[260px]">{item.title}</span>
                      <span className="text-emerald-400">${item.price}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Completion Progress</span>
                        <span className="font-bold text-purple-400">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700"
              >
                Close Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
);
}
