export const API_BASE_URL = "http://localhost:5000/api";

export interface UserType {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  avatar?: string;
  bio?: string;
  title?: string;
  earnings?: number;
  withdrawBalance?: number;
}

export interface LessonType {
  _id: string;
  title: string;
  type: "video" | "pdf" | "audio" | "attachment";
  videoProvider?: "cloudinary" | "youtube" | "vimeo" | "mp4";
  contentUrl: string;
  durationMinutes: number;
  description: string;
  isFreePreview: boolean;
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
  teacher: { _id?: string; name: string; avatar?: string; title?: string; bio?: string };
  thumbnail: string;
  previewVideo?: string;
  status: "draft" | "pending" | "approved" | "rejected" | "archived";
  isFeatured: boolean;
  sections: SectionType[];
  totalLessons: number;
  totalDurationMinutes: number;
  averageRating: number;
  totalReviews: number;
  totalStudents: number;
  requirements: string[];
  learningOutcomes: string[];
}

// Initial mock data fallback if backend API is offline
export const MOCK_COURSES: CourseType[] = [
  {
    _id: "c1",
    title: "Complete React 19 & Next.js 16 Masterclass (SaaS Edition)",
    slug: "complete-react-nextjs-masterclass",
    description: "Learn Next.js 16, App Router, TypeScript, Redux Toolkit, Stripe, Tailwind CSS and deploy a real SaaS product.",
    shortDescription: "Master modern web development from scratch with hands-on SaaS projects.",
    category: "Programming",
    tags: ["React", "Next.js", "TypeScript", "Tailwind CSS", "SaaS"],
    level: "All Levels",
    language: "English",
    price: 89.99,
    discountPrice: 49.99,
    teacher: {
      name: "Dr. Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      title: "Senior Full-Stack Engineer & Instructor",
      bio: "10+ years of software architecture experience at top tech companies.",
    },
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    previewVideo: "https://www.youtube.com/watch?v=wm5gMKCOB4U",
    status: "approved",
    isFeatured: true,
    totalStudents: 1420,
    averageRating: 4.9,
    totalReviews: 128,
    requirements: ["Basic HTML & JavaScript knowledge", "A computer with Internet access"],
    learningOutcomes: [
      "Build full-stack Next.js 16 applications with Server Components",
      "Implement JWT & NextAuth authentication and Stripe payments",
      "Deploy production applications on Vercel and Railway",
    ],
    sections: [
      {
        _id: "sec1",
        title: "Section 1: Introduction to Next.js 16 App Router",
        lessons: [
          {
            _id: "l1",
            title: "Lesson 1: Course Overview & SaaS Architecture",
            type: "video",
            videoProvider: "youtube",
            contentUrl: "https://www.youtube.com/watch?v=wm5gMKCOB4U",
            durationMinutes: 12,
            description: "Welcome to the course! Overview of the SaaS architecture we will build.",
            isFreePreview: true,
          },
          {
            _id: "l2",
            title: "Lesson 2: Setting Up Next.js 16 & Tailwind CSS",
            type: "video",
            videoProvider: "youtube",
            contentUrl: "https://www.youtube.com/watch?v=wm5gMKCOB4U",
            durationMinutes: 18,
            description: "Initializing the codebase, environment variables, and component setup.",
            isFreePreview: false,
          },
        ],
      },
      {
        _id: "sec2",
        title: "Section 2: Advanced React Hooks & State Management",
        lessons: [
          {
            _id: "l3",
            title: "Lesson 3: Mastering useActionState & useOptimistic",
            type: "video",
            videoProvider: "youtube",
            contentUrl: "https://www.youtube.com/watch?v=wm5gMKCOB4U",
            durationMinutes: 24,
            description: "Deep dive into new React 19 hooks for responsive user interfaces.",
            isFreePreview: false,
          },
        ],
      },
    ],
    totalLessons: 3,
    totalDurationMinutes: 54,
  },
  {
    _id: "c2",
    title: "UI/UX & Modern Web Design System with Figma and Tailwind",
    slug: "ui-ux-design-system-figma-tailwind",
    description: "Design pixel-perfect interfaces, dark mode color palettes, glassmorphism UI, and custom component libraries.",
    shortDescription: "Create stunning visuals that wow users and convert visitors.",
    category: "Design",
    tags: ["UI/UX", "Figma", "Design System", "Tailwind CSS"],
    level: "Beginner",
    language: "English",
    price: 69.99,
    discountPrice: 29.99,
    teacher: {
      name: "Dr. Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      title: "Senior Full-Stack Engineer & Instructor",
    },
    thumbnail: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800",
    status: "approved",
    isFeatured: true,
    totalStudents: 890,
    averageRating: 4.8,
    totalReviews: 64,
    requirements: ["No prior design experience needed"],
    learningOutcomes: ["Master Figma auto-layout", "Design reusable UI token systems", "Export code to Tailwind CSS"],
    sections: [
      {
        _id: "sec101",
        title: "Section 1: Color Systems & Typography",
        lessons: [
          {
            _id: "l101",
            title: "Lesson 1: Color Contrast & Palette Creation",
            type: "video",
            videoProvider: "youtube",
            contentUrl: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
            durationMinutes: 15,
            description: "Learn color rules for dark mode and accessibility.",
            isFreePreview: true,
          },
        ],
      },
    ],
    totalLessons: 1,
    totalDurationMinutes: 15,
  },
];
