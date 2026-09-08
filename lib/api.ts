export const API_BASE_URL: string = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5000/api";


export interface UserType {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  avatar?: string;
  bio?: string;
  title?: string;
  phone?: string;
  earnings?: number;
  withdrawBalance?: number;
  enrolledCourses?: any[];
}

export interface LessonType {
  _id: string;
  title: string;
  type: "video" | "pdf" | "audio" | "attachment" | "quiz" | "assignment";
  videoProvider?: "cloudinary" | "youtube" | "gdrive" | "googledrive" | "vimeo" | "mp4";
  contentUrl: string;
  durationMinutes?: number;
  description: string;
  isFreePreview: boolean;
  unlockAt?: string;
  isScheduled?: boolean;
  isLocked?: boolean;
  resources?: any[];
  quiz?: any;
  assignment?: any;
}

export interface SectionType {
  _id: string;
  title: string;
  lessons: LessonType[];
}

export interface CourseType {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  language: string;
  price: number;
  discountPrice?: number;
  teacher: { _id?: string; name: string; avatar?: string; title?: string; bio?: string } | any;
  teacherName?: string;
  instructorName?: string;
  teacherAvatar?: string;
  teacherTitle?: string;
  teacherBio?: string;
  thumbnail: string;
  previewVideo?: string;
  status: "draft" | "pending" | "approved" | "rejected" | "archived" | string;
  isFeatured: boolean;
  sections: SectionType[];
  totalLessons: number;
  totalDurationMinutes: number;
  averageRating: number;
  totalReviews: number;
  totalStudents: number;
  requirements: string[];
  learningOutcomes: string[];
  hasCertificate?: boolean;
  isEnrolled?: boolean;
}

// Dynamic course list placeholder
export const MOCK_COURSES: CourseType[] = [];
