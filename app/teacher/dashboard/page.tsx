"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  DollarSign,
  Plus,
  Star,
  CheckCircle,
  FileText,
  TrendingUp,
  Clock,
  ShieldCheck,
  Award,
  Edit,
  Trash2,
  Eye,
  Archive,
  Send,
  ExternalLink,
  HelpCircle,
  Search,
  Filter,
  X,
  Check,
  Loader2,
  User,
  Camera,
  Shield,
  Save,
  Key,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  Radio,
  Calendar,
  Video,
  CheckCircle2,
  MessageSquare,
  BarChart3,
  Layers,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { API_BASE_URL } from "@/lib/api";
import { TeacherCharts } from "@/components/charts/TeacherCharts";
import { useAuth } from "@/context/AuthContext";
import { EduCoreLoader } from "@/components/EduCoreLoader";
import Swal from "sweetalert2";

export default function TeacherDashboard() {
  const { user, token, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "students" | "liveClasses" | "assignments" | "quizzes" | "profile"
  >("overview");

  // Enrolled Students state
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [enrolledCounts, setEnrolledCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");


  // Teacher Profile State
  const [profileName, setProfileName] = useState(user?.name || "Asma Akter");
  const [profileTitle, setProfileTitle] = useState(user?.title || "Senior Full-Stack Instructor & Educator");
  const [profileEmail, setProfileEmail] = useState(user?.email || "asmaulhosna77901@gmail.com");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "+880 1700-000000");
  const [profileBio, setProfileBio] = useState(
    user?.bio || "Experienced instructor teaching modern web development, TypeScript, React, and cloud applications on EduCore LMS."
  );
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setProfileName(user.name);
      if (user.title) setProfileTitle(user.title);
      if (user.email) setProfileEmail(user.email);
      if (user.phone) setProfilePhone(user.phone);
      if (user.bio) setProfileBio(user.bio);
      if (user.avatar) setProfileAvatar(user.avatar);
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (res.ok && data.url) {
        setProfileAvatar(data.url);
        updateUser({ avatar: data.url });
        Swal.fire({
          icon: "success",
          title: "Avatar Uploaded!",
          text: "Profile photo updated successfully.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          timer: 1500,
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message || "Failed to upload avatar image.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password Too Short",
        text: "New password must be at least 6 characters.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "Please make sure your new password and confirmation match.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: profileName,
          title: profileTitle,
          bio: profileBio,
          phone: profilePhone,
          avatar: profileAvatar,
          password: newPassword ? newPassword : undefined,
        }),
      });

      const data = await res.json();

      updateUser({
        name: profileName,
        title: profileTitle,
        bio: profileBio,
        phone: profilePhone,
        avatar: profileAvatar,
      });

      setNewPassword("");
      setConfirmPassword("");

      Swal.fire({
        icon: "success",
        title: "Profile Updated! 🎉",
        text: "Your teacher profile and details have been successfully saved.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } catch (err: any) {
      updateUser({
        name: profileName,
        title: profileTitle,
        bio: profileBio,
        phone: profilePhone,
        avatar: profileAvatar,
      });
      Swal.fire({
        icon: "success",
        title: "Profile Saved!",
        text: "Profile saved locally.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Courses State fetched dynamically from DB
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Hydrate courses from MongoDB Database API
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const res = await fetch(`${API_BASE_URL}/courses?status=all&t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.courses)) {
          // If teacher is logged in, show all courses or teacher's courses
          setCourses(data.courses);
          return;
        }
        const stored = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
        if (stored.length > 0) setCourses(stored);
      } catch (err) {
        console.warn("Backend fetch teacher courses fallback:", err);
        const stored = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
        if (stored.length > 0) setCourses(stored);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchTeacherCourses();
  }, [user]);

  // Live Classes State
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [isLoadingLiveClasses, setIsLoadingLiveClasses] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCourseForLive, setSelectedCourseForLive] = useState("");
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDescription, setLiveDescription] = useState("");
  const [liveDate, setLiveDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [liveTime, setLiveTime] = useState("20:00");
  const [liveDuration, setLiveDuration] = useState("60");
  const [isSubmittingLive, setIsSubmittingLive] = useState(false);


  const fetchLiveClasses = async () => {
    const activeToken = token || localStorage.getItem("token") || localStorage.getItem("educore_token");
    if (!activeToken) return;

    setIsLoadingLiveClasses(true);
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/my/classes?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.liveClasses)) {
        setLiveClasses(data.liveClasses);
      }
    } catch (e) {
      console.warn("Live classes fetch error:", e);
    } finally {
      setIsLoadingLiveClasses(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, [user]);

  const handleScheduleLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLive || !liveTitle || !liveDate || !liveTime) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please select a course, enter session topic, and choose date & time.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    setIsSubmittingLive(true);
    const activeToken = token || localStorage.getItem("token") || localStorage.getItem("educore_token");
    const scheduledStartTime = new Date(`${liveDate}T${liveTime}`);

    try {
      const res = await fetch(`${API_BASE_URL}/live-classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          courseId: selectedCourseForLive,
          title: liveTitle,
          description: liveDescription,
          scheduledStartTime: scheduledStartTime.toISOString(),
          durationMinutes: Number(liveDuration) || 60,
        }),
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Live Class Scheduled! 🚀",
          text: "Live session is ready. All enrolled students have been automatically sent invitation emails!",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });

        setShowScheduleModal(false);
        setLiveTitle("");
        setLiveDescription("");
        fetchLiveClasses();
      } else {
        throw new Error(data.message || "Failed to schedule live class");
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Scheduling Failed",
        text: err.message || "Could not schedule live class.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setIsSubmittingLive(false);
    }
  };


  const handleDeleteLiveClass = async (classId: string) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Cancel Live Session?",
      text: "Are you sure you want to remove this live class session?",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel Session",
      confirmButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#ffffff",
    });

    if (confirm.isConfirmed) {
      const activeToken = token || localStorage.getItem("token") || localStorage.getItem("educore_token");
      try {
        await fetch(`${API_BASE_URL}/live-classes/${classId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        fetchLiveClasses();
      } catch (e) {}
    }
  };


  // Student Assignment Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<"all" | "pending" | "graded">("all");
  const [submissionCourseFilter, setSubmissionCourseFilter] = useState("all");
  const [showAddMockSubModal, setShowAddMockSubModal] = useState(false);
  const [isCreatingMockSub, setIsCreatingMockSub] = useState(false);
  const [mockStudentName, setMockStudentName] = useState("");
  const [mockAssignmentTitle, setMockAssignmentTitle] = useState("");
  const [mockCourseTitle, setMockCourseTitle] = useState("");
  const [mockFileType, setMockFileType] = useState("ZIP Archive");
  const [mockFileUrl, setMockFileUrl] = useState("");
  const [mockNotes, setMockNotes] = useState("");

  // Selected Submission for Review Modal
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [givenMarks, setGivenMarks] = useState<number | "">("");
  const [givenFeedback, setGivenFeedback] = useState("");

  // Fetch real submissions dynamically from MongoDB API
  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("educore_token") : null);

    try {
      const res = await fetch(`${API_BASE_URL}/assignments/submissions?t=${Date.now()}`, {
        headers: {
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        const formatted = data.submissions.map((sub: any) => ({
          id: sub._id || sub.id,
          studentName: sub.studentName || (typeof sub.student === "object" ? sub.student?.name : null) || "Student",
          studentAvatar:
            sub.studentAvatar ||
            (typeof sub.student === "object" ? sub.student?.avatar : null) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.studentName || "Student")}&background=7c3aed&color=fff&bold=true`,
          studentEmail: sub.studentEmail || (typeof sub.student === "object" ? sub.student?.email : "") || "",
          courseTitle: sub.courseTitle || (typeof sub.course === "object" ? sub.course?.title : null) || "Course",
          assignmentTitle: sub.assignmentTitle || (typeof sub.assignment === "object" ? sub.assignment?.title : null) || "Assignment",
          fileType: sub.fileType || "File / Link",
          fileUrl: sub.fileUrl || "#",
          linkType: sub.fileType || "Submission File",
          submittedDate: sub.submittedAt
            ? new Date(sub.submittedAt).toLocaleString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recent",
          status: String(sub.status).toLowerCase() === "graded" ? "Graded" : "Pending Review",
          marks: sub.grade !== undefined && sub.grade !== null ? sub.grade : null,
          feedback: sub.feedback || "",
          notes: sub.notes || "",
        }));

        setSubmissions(formatted);
        return;
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.warn("Dynamic assignment submissions fetch error:", err);
      setSubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("educore_assignment_submissions");
    }
    fetchSubmissions();
  }, [user, activeTab]);


  const handleDeleteSubmission = async (subId: string) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete Submission?",
      text: "Are you sure you want to remove this student submission record?",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#ffffff",
    });

    if (confirm.isConfirmed) {
      const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("educore_token") : null);
      try {
        await fetch(`${API_BASE_URL}/assignments/submissions/${subId}`, {
          method: "DELETE",
          headers: {
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
        });
      } catch (e) {
        console.warn("Backend delete submission fallback:", e);
      }

      setSubmissions((prev) => {
        const updated = prev.filter((s) => s.id !== subId);
        localStorage.setItem("educore_assignment_submissions", JSON.stringify(updated));
        return updated;
      });

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Student submission removed.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        timer: 1500,
      });
    }
  };

  const handleCreateMockSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingMockSub(true);
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("educore_token") : null);

    const newSubPayload = {
      studentName: mockStudentName,
      courseTitle: mockCourseTitle,
      assignmentTitle: mockAssignmentTitle,
      fileType: mockFileType,
      fileUrl: mockFileUrl,
      notes: mockNotes,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/assignments/mock-submission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify(newSubPayload),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddMockSubModal(false);
        fetchSubmissions();
        Swal.fire({
          icon: "success",
          title: "New Submission Created! 🚀",
          text: `Sample submission from ${mockStudentName} added for review.`,
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });
        return;
      }
    } catch (e) {
      console.warn("Backend mock submission creation fallback:", e);
    } finally {
      setIsCreatingMockSub(false);
    }

    const localSub = {
      id: "sub_" + Date.now(),
      studentName: mockStudentName,
      studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mockStudentName)}&background=7c3aed&color=fff&bold=true`,
      studentEmail: `${mockStudentName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      courseTitle: mockCourseTitle,
      assignmentTitle: mockAssignmentTitle,
      fileType: mockFileType,
      fileUrl: mockFileUrl,
      linkType: mockFileType,
      submittedDate: new Date().toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Pending Review",
      marks: null,
      feedback: "",
      notes: mockNotes,
    };

    setSubmissions((prev) => {
      const updated = [localSub, ...prev];
      localStorage.setItem("educore_assignment_submissions", JSON.stringify(updated));
      return updated;
    });

    setShowAddMockSubModal(false);
    Swal.fire({
      icon: "success",
      title: "New Submission Added! 🚀",
      text: `Sample submission from ${mockStudentName} added for review.`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    });
  };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    const normStatus = newStatus.toLowerCase();
    setCourses((prev) => {
      const updated = prev.map((c) => (c._id === courseId ? { ...c, status: normStatus } : c));
      localStorage.setItem("educore_created_courses", JSON.stringify(updated));
      return updated;
    });

    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("educore_token")) : null;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      await fetch(`${API_BASE_URL}/courses/${courseId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: normStatus }),
      });
    } catch (err) {
      console.warn("Backend status update failed:", err);
    }

    const isPending = normStatus === "pending";
    const isDraft = normStatus === "draft";

    Swal.fire({
      icon: "success",
      title: isPending ? "Submitted for Admin Approval! 🚀" : `Course Status Updated`,
      text: isPending
        ? "Course submitted to Admin. It will be published to the catalog once approved."
        : isDraft
          ? "Course moved to Draft mode."
          : `Course marked as ${newStatus.toUpperCase()}`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    Swal.fire({
      icon: "warning",
      title: "Delete Course?",
      text: "Are you sure you want to delete this course from your instructor studio?",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setCourses((prev) => {
          const updated = prev.filter((c) => c._id !== courseId);
          localStorage.setItem("educore_created_courses", JSON.stringify(updated));
          return updated;
        });

        try {
          await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            method: "DELETE",
          });
        } catch (err) {
          console.warn("Backend delete course failed:", err);
        }

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Course removed.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });
      }
    });
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || givenMarks === "") return;

    setIsSubmittingGrade(true);
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("educore_token") : null);

    try {
      const res = await fetch(`${API_BASE_URL}/assignments/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          grade: Number(givenMarks),
          feedback: givenFeedback,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) => {
          const updated = prev.map((s) =>
            s.id === selectedSub.id
              ? {
                  ...s,
                  status: "Graded",
                  marks: Number(givenMarks),
                  feedback: givenFeedback,
                }
              : s
          );
          localStorage.setItem("educore_assignment_submissions", JSON.stringify(updated));
          return updated;
        });

        Swal.fire({
          icon: "success",
          title: "Assignment Graded! 🎓",
          text: `Grade of ${givenMarks}/100 and feedback sent to ${selectedSub.studentName}.`,
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });

        setSelectedSub(null);
        setGivenMarks("");
        setGivenFeedback("");
        fetchSubmissions();
      } else {
        throw new Error(data.message || "Failed to submit grade");
      }
    } catch (err: any) {
      setSubmissions((prev) => {
        const updated = prev.map((s) =>
          s.id === selectedSub.id
            ? {
                ...s,
                status: "Graded",
                marks: Number(givenMarks),
                feedback: givenFeedback,
              }
            : s
        );
        localStorage.setItem("educore_assignment_submissions", JSON.stringify(updated));
        return updated;
      });

      Swal.fire({
        icon: "success",
        title: "Assignment Graded! 🎓",
        text: `Grade of ${givenMarks}/100 and feedback recorded.`,
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });

      setSelectedSub(null);
      setGivenMarks("");
      setGivenFeedback("");
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const pendingSubmissionsCount = submissions.filter(
    (s) => s.status === "Pending Review" || String(s.status).toLowerCase().includes("pending")
  ).length;

  const gradedSubmissionsCount = submissions.filter(
    (s) => s.status === "Graded" || String(s.status).toLowerCase().includes("graded")
  ).length;

  // Load Enrolled Students for Teacher
  const fetchTeacherEnrollments = async () => {
    setIsLoadingEnrolled(true);
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("educore_token") || localStorage.getItem("token") : null);
    try {
      const res = await fetch(`${API_BASE_URL}/teacher/enrollments?t=${Date.now()}`, {
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setEnrolledStudents(data.enrollments || []);
        if (data.counts) setEnrolledCounts(data.counts);
      }
    } catch (e) {
      console.warn("Failed to load teacher enrollments:", e);
    } finally {
      setIsLoadingEnrolled(false);
    }
  };

  useEffect(() => {
    fetchTeacherEnrollments();
  }, [token]);

  const gradedSubmissionsWithMarks = submissions.filter((s) => s.marks !== null && s.marks !== undefined);
  const averageGrade =
    gradedSubmissionsWithMarks.length > 0
      ? Math.round(gradedSubmissionsWithMarks.reduce((acc, curr) => acc + Number(curr.marks), 0) / gradedSubmissionsWithMarks.length)
      : 0;

  // Filtered Submissions list based on search and filters
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      submissionSearch.trim() === "" ||
      s.studentName?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.studentEmail?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.assignmentTitle?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.courseTitle?.toLowerCase().includes(submissionSearch.toLowerCase());

    const matchesStatus =
      submissionStatusFilter === "all" ||
      (submissionStatusFilter === "pending" && (s.status === "Pending Review" || String(s.status).toLowerCase().includes("pending"))) ||
      (submissionStatusFilter === "graded" && (s.status === "Graded" || String(s.status).toLowerCase() === "graded"));

    const matchesCourse =
      submissionCourseFilter === "all" || s.courseTitle === submissionCourseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Instructor Command Center
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Teacher Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build interactive courses, grade student assignments, create quizzes, and monitor revenue analytics.
          </p>
        </div>

        <Link
          href="/teacher/courses/create"
          className="px-6 py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* 6 Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Students" value="2,310" icon={Users} change="12% MoM" gradient="from-purple-600 to-indigo-600" />
        <StatCard
          title="Total Courses"
          value={isLoadingCourses ? "..." : courses.length.toString()}
          icon={BookOpen}
          change={isLoadingCourses ? "Loading..." : `${courses.filter((c) => c.status === "Published" || c.status === "published").length} Published`}
          gradient="from-emerald-600 to-teal-600"
        />
        <StatCard title="Revenue" value="$4,520.00" icon={DollarSign} change="18% MoM" gradient="from-blue-600 to-cyan-600" />
        <StatCard title="Pending Assignments" value={pendingSubmissionsCount.toString()} icon={Clock} change={pendingSubmissionsCount > 0 ? "Requires Review" : "All Graded"} gradient="from-amber-600 to-orange-600" />
        <StatCard title="Completion Rate" value="84.5%" icon={CheckCircle} change="+5% vs last month" gradient="from-indigo-600 to-purple-600" />
        <StatCard title="Average Rating" value="4.8 ★" icon={Star} change="450 Reviews" gradient="from-rose-600 to-pink-600" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-3 no-scrollbar">
        {[
          { id: "overview", label: "Dashboard Analytics", icon: TrendingUp },
          { id: "courses", label: isLoadingCourses ? "Course Management (Loading...)" : `Course Management (${courses.length})`, icon: BookOpen },
          {
            id: "students",
            label: `Enrolled Students (${enrolledCounts.total})`,
            icon: Users,
            badge: enrolledCounts.pending,
          },
          {
            id: "liveClasses",
            label: `Live Classes (${liveClasses.length})`,
            icon: Radio,
            badge: liveClasses.filter((l) => l.status === "live").length,
          },
          {
            id: "assignments",
            label: `Assignment Reviews (${pendingSubmissionsCount})`,
            icon: FileText,
            badge: pendingSubmissionsCount,
          },
          { id: "quizzes", label: "Quizzes Overview", icon: HelpCircle },
          { id: "profile", label: "Instructor Profile & Settings", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${isActive
                  ? "bg-purple-900/50 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>


      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <TeacherCharts />
        </div>
      )}

      {/* TAB 2: COURSE MANAGEMENT */}
      {activeTab === "courses" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Your Courses</h2>
              <p className="text-xs text-slate-400">Publish, draft, archive, or manage your curriculum content.</p>
            </div>
            <Link
              href="/teacher/courses/create"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </Link>
          </div>

          {isLoadingCourses ? (
            <div className="py-12 border border-slate-800/60 rounded-2xl bg-slate-950/40">
              <EduCoreLoader message="Loading instructor courses from database" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 border border-slate-800/60 rounded-2xl bg-slate-950/40 text-center p-6">
              <BookOpen className="w-10 h-10 text-slate-600 mb-1" />
              <h3 className="text-sm font-bold text-white">No courses created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Get started by creating your first course using the &quot;Add New Course&quot; button above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Course Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Students</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-white flex items-center gap-3">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-12 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-8 rounded bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-[11px] font-bold text-purple-300 shrink-0">
                            {course.title ? course.title.charAt(0) : "C"}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate max-w-xs">{course.title}</span>
                          {course.hasCertificate && (
                            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                              <Award className="w-3 h-3" /> Certificate Enabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{course.category}</td>
                      <td className="p-3 font-bold text-emerald-400">${course.price}</td>
                      <td className="p-3 font-medium">{course.totalStudents || 0}</td>
                      <td className="p-3 font-bold text-amber-400">{course.rating || "5.0"} ★</td>
                      <td className="p-3">
                        {(() => {
                          const st = String(course.status || "pending").toLowerCase();
                          const isPub = st === "published" || st === "approved";
                          const isPend = st === "pending";
                          const isRej = st === "rejected";
                          return (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border inline-flex items-center gap-1.5 ${
                                isPub
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : isPend
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                                    : isRej
                                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                      : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isPub ? "bg-emerald-400" : isPend ? "bg-amber-400" : isRej ? "bg-rose-400" : "bg-slate-400"}`} />
                              <span>{isPub ? "Published" : isPend ? "Pending Approval" : isRej ? "Rejected" : "Draft"}</span>
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/student/learn/${course.slug || course._id}`}
                            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex items-center justify-center shadow-sm"
                            title="Preview Course Player"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/teacher/courses/create?id=${course._id}`}
                            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all flex items-center justify-center shadow-sm"
                            title="Edit Course"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all flex items-center justify-center shadow-sm"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: ENROLLED STUDENTS & APPROVAL STATUS */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Student Access Oversight</span>
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">Enrolled Students & Course Access</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  View students who have enrolled in your courses. Student video access is approved and controlled securely by platform administrators.
                </p>
              </div>

              <button
                onClick={fetchTeacherEnrollments}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2 self-start sm:self-auto transition-all"
              >
                <span>Refresh Students</span>
              </button>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrollments</span>
                <span className="text-2xl font-black text-white mt-1">{enrolledCounts.total}</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Pending Admin Review</span>
                </span>
                <span className="text-2xl font-black text-amber-300 mt-1">{enrolledCounts.pending}</span>
                <span className="text-[10px] text-amber-400/80 mt-1">Videos locked</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Approved Learners</span>
                <span className="text-2xl font-black text-emerald-300 mt-1">{enrolledCounts.approved}</span>
                <span className="text-[10px] text-emerald-400/80 mt-1">Full video access</span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Declined / Revoked</span>
                <span className="text-2xl font-black text-rose-300 mt-1">{enrolledCounts.rejected}</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
                {[
                  { key: "all", label: "All Students", count: enrolledCounts.total },
                  { key: "pending", label: "Pending Admin Approval", count: enrolledCounts.pending },
                  { key: "approved", label: "Approved Learners", count: enrolledCounts.approved },
                  { key: "rejected", label: "Declined", count: enrolledCounts.rejected },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStudentFilter(f.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                      studentFilter === f.key
                        ? f.key === "pending"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow"
                          : f.key === "approved"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow"
                          : f.key === "rejected"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow"
                          : "bg-purple-900/50 text-purple-200 border-purple-500 shadow"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-slate-950/60 text-[10px]">
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student or course..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Enrolled Students Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            {isLoadingEnrolled ? (
              <div className="py-16 text-center">
                <EduCoreLoader message="Loading enrolled students list..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Enrolled Course</th>
                      <th className="p-4">Enrolled Date</th>
                      <th className="p-4">Video Access Status</th>
                      <th className="p-4 text-right">Admin Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {enrolledStudents
                      .filter((en) => {
                        if (studentFilter !== "all" && en.status !== studentFilter) return false;
                        if (studentSearch) {
                          const sLower = studentSearch.toLowerCase();
                          const sName = en.student?.name?.toLowerCase() || "";
                          const sEmail = en.student?.email?.toLowerCase() || "";
                          const cTitle = en.course?.title?.toLowerCase() || "";
                          return sName.includes(sLower) || sEmail.includes(sLower) || cTitle.includes(sLower);
                        }
                        return true;
                      })
                      .map((en: any) => {
                        const studentName = en.student?.name || "Student";
                        const courseTitle = en.course?.title || "Course";

                        return (
                          <tr key={en._id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={en.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=7c3aed&color=fff`}
                                  alt={studentName}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-800"
                                />
                                <div>
                                  <span className="font-bold text-white block text-sm">{studentName}</span>
                                  <span className="text-xs text-slate-400">{en.student?.email}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-3 max-w-sm">
                                {en.course?.thumbnail && (
                                  <img
                                    src={en.course.thumbnail}
                                    alt={courseTitle}
                                    className="w-12 h-8 rounded-lg object-cover border border-slate-800 shrink-0"
                                  />
                                )}
                                <span className="font-bold text-white line-clamp-1 block">{courseTitle}</span>
                              </div>
                            </td>

                            <td className="p-4 text-slate-400">
                              <span className="text-xs text-white font-medium block">
                                {en.enrolledAt ? new Date(en.enrolledAt).toLocaleDateString() : "Today"}
                              </span>
                            </td>

                            <td className="p-4">
                              {en.status === "approved" ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Approved & Active (Videos Unlocked)</span>
                                </span>
                              ) : en.status === "rejected" ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 w-fit">
                                  <span>Declined by Admin (Access Denied)</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
                                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                  <span>Pending Admin Review (Videos Locked)</span>
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <span className="text-[11px] text-slate-400 font-medium">
                                {en.status === "approved"
                                  ? "Approved ✓"
                                  : en.status === "rejected"
                                  ? "Declined ✗"
                                  : "Awaiting Admin Action"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                    {enrolledStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-500 space-y-2">
                          <Users className="w-10 h-10 text-slate-600 mx-auto opacity-40" />
                          <p className="text-sm font-medium text-slate-400">No students have enrolled in your courses yet.</p>
                          <p className="text-xs text-slate-600">When students enroll, their enrollment requests and approval status will appear here.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: LIVE CLASSES MANAGEMENT */}
      {activeTab === "liveClasses" && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span>Live Interactive Classes</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Schedule live video sessions for your courses. Enrolled students will automatically receive invitation emails and real-time join alerts.
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-900/30 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Live Class</span>
              </button>
            </div>

            {isLoadingLiveClasses ? (
              <div className="py-12 border border-slate-800/60 rounded-2xl bg-slate-950/40">
                <EduCoreLoader message="Loading scheduled live classes..." />
              </div>
            ) : liveClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 border border-slate-800/60 rounded-2xl bg-slate-950/40 text-center p-6">
                <Radio className="w-12 h-12 text-slate-600 mb-1" />
                <h3 className="text-sm font-bold text-white">No Live Classes Scheduled</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Click the &quot;Schedule Live Class&quot; button to set up your next live interactive session with your students.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveClasses.map((session) => {
                  const isLive = session.status === "live";
                  const isCompleted = session.status === "completed";
                  const courseTitle = session.course?.title || "Course Session";
                  const attendeesCount = session.attendees?.length || 0;
                  const dateStr = new Date(session.scheduledStartTime).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={session._id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isLive
                          ? "bg-slate-900/90 border-rose-500/50 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500/30"
                          : "bg-slate-950 border-slate-800 hover:border-purple-500/30"
                      } space-y-4`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 truncate max-w-[200px]">
                              {courseTitle}
                            </span>
                            {isLive ? (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                <span>LIVE NOW</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                                {session.status}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white line-clamp-1">{session.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{session.description || "Live lecture, interactive coding, and student Q&A."}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate">{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{session.durationMinutes} mins</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{attendeesCount} Joined</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-emerald-400">Emails Sent ✓</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleDeleteLiveClass(session._id)}
                          className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                          title="Cancel Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/live/${session._id}`}
                            className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md transition-all ${
                              isLive
                                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 animate-pulse"
                                : "gradient-button shadow-purple-600/20 hover:scale-105"
                            }`}
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>{isLive ? "Enter Live Classroom" : "Start Live Class"}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCHEDULE LIVE CLASS MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-purple-500/30 max-w-lg w-full bg-slate-900 shadow-2xl space-y-4 max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 animate-pulse" />
                  <span>Schedule Live Class</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Students enrolled in this course will automatically receive invitation emails.
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleLiveClass} className="space-y-3 text-xs overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Course *</label>
                <select
                  required
                  value={selectedCourseForLive}
                  onChange={(e) => setSelectedCourseForLive(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Live Session Topic / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js 15 Full-Stack Live Q&A & Code Review"
                  value={liveTitle}
                  onChange={(e) => setLiveTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Agenda & Description</label>
                <textarea
                  rows={2}
                  placeholder="What topics will be covered in this live session..."
                  value={liveDescription}
                  onChange={(e) => setLiveDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Scheduled Date & Time Pickers */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Class Date *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={liveDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setLiveDate(e.target.value)}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      style={{ colorScheme: "dark" }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Start Time *</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={liveTime}
                      onChange={(e) => setLiveTime(e.target.value)}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      style={{ colorScheme: "dark" }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-400">Quick Pick:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      setLiveDate(d.toISOString().split("T")[0]);
                      setLiveTime("20:00");
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-[10px] text-purple-300 font-semibold transition-all cursor-pointer"
                  >
                    Today 8:00 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setLiveDate(d.toISOString().split("T")[0]);
                      setLiveTime("19:00");
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-[10px] text-blue-300 font-semibold transition-all cursor-pointer"
                  >
                    Tomorrow 7:00 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 30 * 60 * 1000);
                      setLiveDate(d.toISOString().split("T")[0]);
                      const hours = String(d.getHours()).padStart(2, "0");
                      const mins = String(d.getMinutes()).padStart(2, "0");
                      setLiveTime(`${hours}:${mins}`);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-[10px] text-rose-300 font-semibold transition-all cursor-pointer"
                  >
                    ⚡ In 30 Mins
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Session Duration</span>
                </label>
                <select
                  value={liveDuration}
                  onChange={(e) => setLiveDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes (1 Hour)</option>
                  <option value="90">90 Minutes (1.5 Hours)</option>
                  <option value="120">120 Minutes (2 Hours)</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[10px]">
                ⚡ <strong>Instant Delivery:</strong> Enrolled students will automatically receive personalized invitation emails.
              </div>


              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80 shrink-0">

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLive}
                  className="px-5 py-2 rounded-xl gradient-button text-white font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {isSubmittingLive ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Schedule & Notify Students</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* TAB 3: ASSIGNMENTS REVIEW & GRADING */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {/* Top Quick Stats for Assignments */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-white">{submissions.length}</p>
                <p className="text-[11px] text-slate-400 font-medium">Total Submissions</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-black text-amber-300">{pendingSubmissionsCount}</p>
                  {pendingSubmissionsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Pending Review</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-emerald-400">{gradedSubmissionsCount}</p>
                <p className="text-[11px] text-slate-400 font-medium">Graded & Returned</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-blue-300">{averageGrade > 0 ? `${averageGrade}%` : "N/A"}</p>
                <p className="text-[11px] text-slate-400 font-medium">Avg. Assignment Score</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            {/* Header with Title & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>Student Assignment Submissions</span>
                  {pendingSubmissionsCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pendingSubmissionsCount} Pending Review
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review student code repositories, design prototypes, and document submissions, assign scores, and provide structured feedback.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMockSubModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sample Submission</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student, email, assignment, or course..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                {submissionSearch && (
                  <button
                    onClick={() => setSubmissionSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="md:col-span-4 flex items-center gap-1.5">
                <select
                  value={submissionCourseFilter}
                  onChange={(e) => setSubmissionCourseFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">All Courses ({submissions.length})</option>
                  {Array.from(new Set(submissions.map((s) => s.courseTitle).filter(Boolean))).map((title: any) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 flex items-center justify-end gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmissionStatusFilter("all")}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    submissionStatusFilter === "all"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({submissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionStatusFilter("pending")}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    submissionStatusFilter === "pending"
                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Pending ({pendingSubmissionsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionStatusFilter("graded")}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    submissionStatusFilter === "graded"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Graded ({gradedSubmissionsCount})
                </button>
              </div>
            </div>

            {/* Submissions Table */}
            {isLoadingSubmissions ? (
              <div className="py-12 border border-slate-800/60 rounded-2xl bg-slate-950/40">
                <EduCoreLoader message="Loading student assignment submissions & project files" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">Assignment Title</th>
                      <th className="p-3.5">Submission File / Link</th>
                      <th className="p-3.5">Submitted Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Marks</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-400">
                          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                          <p className="font-semibold text-slate-300 text-sm">No Student Submissions Found</p>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            {submissionSearch || submissionStatusFilter !== "all" || submissionCourseFilter !== "all"
                              ? "Try adjusting your search query or filters to see more results."
                              : "When students submit course project assignments, they will appear here for review and grading."}
                          </p>
                          {(submissionSearch || submissionStatusFilter !== "all" || submissionCourseFilter !== "all") && (
                            <button
                              onClick={() => {
                                setSubmissionSearch("");
                                setSubmissionStatusFilter("all");
                                setSubmissionCourseFilter("all");
                              }}
                              className="mt-3 text-xs text-purple-400 hover:underline font-semibold"
                            >
                              Clear all filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3.5 font-bold text-white">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={sub.studentAvatar}
                                alt={sub.studentName}
                                className="w-9 h-9 rounded-full object-cover border border-purple-500/40 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="truncate max-w-[150px]">{sub.studentName}</p>
                                <p className="text-[10px] text-slate-400 font-normal truncate max-w-[170px]">
                                  {sub.courseTitle}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <p className="font-semibold text-slate-200 line-clamp-1">{sub.assignmentTitle}</p>
                            {sub.notes && (
                              <p className="text-[10px] text-slate-500 line-clamp-1 italic mt-0.5">
                                Note: &quot;{sub.notes}&quot;
                              </p>
                            )}
                          </td>
                          <td className="p-3.5">
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 hover:text-white font-bold text-[11px] transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                              <span className="truncate max-w-[110px]">{sub.fileType}</span>
                            </a>
                          </td>
                          <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">{sub.submittedDate}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                sub.status === "Graded"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold">
                            {sub.marks !== null ? (
                              <span className="text-emerald-400 font-mono text-sm">{sub.marks} <span className="text-slate-500 text-xs font-normal">/ 100</span></span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedSub(sub);
                                  setGivenMarks(sub.marks !== null ? sub.marks : "");
                                  setGivenFeedback(sub.feedback || "");
                                }}
                                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] shadow-sm transition-all cursor-pointer ${
                                  sub.status === "Graded"
                                    ? "bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700"
                                    : "gradient-button text-white shadow-purple-600/30 hover:scale-105"
                                }`}
                              >
                                {sub.status === "Graded" ? "Edit Grade" : "Review & Grade"}
                              </button>
                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 flex items-center justify-center transition-colors"
                                title="Delete Submission"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}


      {/* TAB 4: QUIZZES OVERVIEW */}
      {activeTab === "quizzes" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Course Quizzes & Assessments</h2>
              <p className="text-xs text-slate-400">Configure quiz pass marks, time limits, MCQ questions, and auto-grading.</p>
            </div>
            <Link
              href="/teacher/courses/create"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300">
                    Next.js Masterclass
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">Quiz 1: React Server Components & App Router</h4>
                </div>
                <span className="text-xs font-bold text-emerald-400">Pass Mark: 80%</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>⏱️ Time Limit: 15 mins</span>
                <span>❓ 10 MCQ Questions</span>
                <span>⭐ Randomize: Enabled</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300">
                    UI/UX Design
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">Quiz 2: Figma Design System & Wireframing</h4>
                </div>
                <span className="text-xs font-bold text-emerald-400">Pass Mark: 75%</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>⏱️ Time Limit: 20 mins</span>
                <span>❓ 12 Questions (MCQ & True/False)</span>
                <span>⭐ Randomize: Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INSTRUCTOR PROFILE & SETTINGS */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Avatar & Profile Card Preview */}
          <div className="lg:col-span-1 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 text-center">
            <div className="relative inline-block mx-auto">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-500/40 shadow-2xl bg-purple-900/30 mx-auto flex items-center justify-center">
                {profileAvatar ? (
                  <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-button flex items-center justify-center text-3xl font-black text-white">
                    {profileName ? profileName.slice(0, 2).toUpperCase() : "AA"}
                  </div>
                )}
              </div>
              <label
                htmlFor="teacher-avatar-file"
                className="absolute bottom-0 right-0 p-2.5 rounded-full gradient-button text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                title="Change Photo"
              >
                {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input
                  id="teacher-avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-[11px] font-bold mb-2">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Verified Educator</span>
              </div>
              <h3 className="text-xl font-black text-white">{profileName}</h3>
              <p className="text-xs text-purple-400 font-medium mt-0.5">{profileTitle}</p>
              <p className="text-xs text-slate-400 mt-1">{profileEmail}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-left space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Instructor Bio</span>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                {profileBio || "No bio added yet. Write your background and experience to help students learn about you."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-lg font-black text-white">{courses.length}</span>
                <p className="text-[10px] text-slate-400">Total Courses</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-lg font-black text-amber-400">4.8 ★</span>
                <p className="text-[10px] text-slate-400">Instructor Rating</p>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile & Security Form */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                <span>Teacher Profile & Account Settings</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize how your name, credentials, and bio appear across all your courses and to your students.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
                  General Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Asma Akter"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>Professional Title / Designation</span>
                    </label>
                    <input
                      type="text"
                      value={profileTitle}
                      onChange={(e) => setProfileTitle(e.target.value)}
                      placeholder="e.g. Senior Full-Stack Instructor & Lead Developer"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profileEmail}
                      className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone / Contact Number</span>
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. +880 1700-000000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>Avatar Image URL (or upload via camera button)</span>
                  </label>
                  <input
                    type="url"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Section 2: Biography */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>About Instructor / Biography</span>
                </label>
                <textarea
                  rows={4}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Share your expertise, achievements, industry experience, and what students will learn from your courses..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
                />
                <p className="text-[11px] text-slate-500">
                  This biography will appear on the course landing pages and instructor profile cards for your students.
                </p>
              </div>

              {/* Section 3: Security / Password */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Change Password (Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGNMENT REVIEW & GRADING */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/30 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span>Review & Grade Assignment</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Assign marks, provide detailed feedback, and return assessment results.</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 text-xs">
              {/* Student Card */}
              <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <img
                  src={selectedSub.studentAvatar}
                  alt={selectedSub.studentName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{selectedSub.studentName}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedSub.status === "Graded"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {selectedSub.status}
                    </span>
                  </div>
                  <p className="text-xs text-purple-400 font-medium truncate mt-0.5">{selectedSub.courseTitle}</p>
                  <p className="text-[11px] text-slate-500 truncate">{selectedSub.studentEmail}</p>
                </div>
              </div>

              {/* Assignment Topic */}
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-300">Assignment Title:</p>
                <p className="text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-medium">
                  {selectedSub.assignmentTitle}
                </p>
              </div>

              {/* Submission Link */}
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-300">Student Submission File / Project Link:</p>
                <a
                  href={selectedSub.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 p-3 rounded-xl text-purple-300 font-bold hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ExternalLink className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">{selectedSub.fileUrl}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-900/60 text-[10px] uppercase font-bold shrink-0 ml-2">
                    {selectedSub.fileType} ↗
                  </span>
                </a>
              </div>

              {/* Student Notes */}
              {selectedSub.notes && (
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-300">Student Project Notes:</p>
                  <div className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed max-h-28 overflow-y-auto">
                    {selectedSub.notes}
                  </div>
                </div>
              )}

              {/* Grading Form */}
              <form onSubmit={handleGradeSubmit} className="space-y-4 pt-2 border-t border-slate-800/80">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-300">Assign Score (Out of 100) *</label>
                    <span className="text-[11px] text-purple-400 font-bold">
                      {typeof givenMarks === "number" && givenMarks >= 0 ? `${givenMarks}% Grade` : ""}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={givenMarks}
                    onChange={(e) => setGivenMarks(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    placeholder="Enter marks from 0 to 100 (e.g. 95)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[10px] text-slate-500 font-medium">Quick Score:</span>
                    {[
                      { pts: 100, label: "100 (A+)" },
                      { pts: 95, label: "95 (A)" },
                      { pts: 90, label: "90 (A-)" },
                      { pts: 85, label: "85 (B+)" },
                      { pts: 80, label: "80 (B)" },
                      { pts: 75, label: "75 (C)" },
                    ].map((preset) => (
                      <button
                        key={preset.pts}
                        type="button"
                        onClick={() => setGivenMarks(preset.pts)}
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                          givenMarks === preset.pts
                            ? "bg-purple-600 border-purple-500 text-white shadow-sm"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-purple-500/40 hover:text-white"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Instructor Feedback & Comments</label>
                  <textarea
                    rows={3}
                    value={givenFeedback}
                    onChange={(e) => setGivenFeedback(e.target.value)}
                    placeholder="Provide constructive suggestions, commend good practices, and highlight improvements..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                  />

                  {/* Quick Feedback Snippet Chips */}
                  <div className="space-y-1 pt-1.5">
                    <span className="text-[10px] text-slate-500 block">Feedback Snippets (Click to insert):</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "🌟 Outstanding work! Clean code architecture and comprehensive features.",
                        "👍 Great job! All core requirements and tests passed successfully.",
                        "💡 Good effort! Consider refining error handling and adding modular comments.",
                        "⚡ Excellent project! Postman documentation and CRUD routes verified.",
                      ].map((snippet, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setGivenFeedback(snippet)}
                          className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/30 text-[10px] text-slate-300 hover:text-purple-200 text-left transition-all cursor-pointer"
                        >
                          {snippet.slice(0, 35)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGrade}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-1.5 shadow-lg shadow-purple-600/30 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingGrade ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Grade...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Return Graded Assignment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SAMPLE / TEST STUDENT SUBMISSION */}
      {showAddMockSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/30 max-w-lg w-full rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  <span>Create Sample Student Submission</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Inject a mock student project submission to test grading, scoring, and review workflows.
                </p>
              </div>
              <button
                onClick={() => setShowAddMockSubModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMockSubmission} className="space-y-3 text-xs overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={mockStudentName}
                  onChange={(e) => setMockStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Course *</label>
                <select
                  value={mockCourseTitle}
                  onChange={(e) => setMockCourseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {courses.length > 0 ? (
                    courses.map((c) => (
                      <option key={c._id} value={c.title}>
                        {c.title}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Next.js 15 & React 19 Full-Stack SaaS Masterclass">
                        Next.js 15 & React 19 Full-Stack SaaS Masterclass
                      </option>
                      <option value="UI/UX Design Masterclass 2026">UI/UX Design Masterclass 2026</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assignment Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build a Full-Stack E-Commerce API with Express"
                  value={mockAssignmentTitle}
                  onChange={(e) => setMockAssignmentTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">File / Submission Type</label>
                  <select
                    value={mockFileType}
                    onChange={(e) => setMockFileType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="ZIP Archive">ZIP Archive</option>
                    <option value="GitHub Repo">GitHub Repo</option>
                    <option value="Figma Link">Figma Link</option>
                    <option value="PDF Document">PDF Document</option>
                    <option value="Live Project Link">Live Project Link</option>
                    <option value="Google Drive Link">Google Drive Link</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Submission URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/student/project"
                    value={mockFileUrl}
                    onChange={(e) => setMockFileUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student Notes & Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes about implementation..."
                  value={mockNotes}
                  onChange={(e) => setMockNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddMockSubModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingMockSub}
                  className="px-5 py-2 rounded-xl gradient-button text-white font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {isCreatingMockSub ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Submission</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

