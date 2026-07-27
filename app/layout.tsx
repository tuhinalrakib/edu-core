import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "EduCore LMS - Next-Gen SaaS Learning & Education Platform",
    template: "%s | EduCore LMS",
  },
  description:
    "EduCore is a full-featured Next-Gen SaaS Learning Management System (LMS) built for creators, instructors, and academies. Features interactive video courses, AI study assistants, live quizzes, automated certificates, and teacher analytics.",
  keywords: [
    "EduCore",
    "SaaS LMS",
    "Learning Management System",
    "Online Education",
    "Course Platform",
    "AI Learning Assistant",
    "E-Learning",
    "Interactive Quizzes",
    "Teacher Studio",
  ],
  authors: [{ name: "EduCore Team", url: "http://localhost:3000" }],
  creator: "EduCore SaaS LMS",
  metadataBase: new URL("http://localhost:3000"),

  // Icons configuration
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },

  // Open Graph Social Media Link Sharing Configuration
  openGraph: {
    title: "EduCore LMS - Next-Gen SaaS Learning Platform",
    description:
      "Transform learning with EduCore LMS. Interactive video lessons, real-time AI tutor, automated grading, quizzes, certificates, and teacher analytics.",
    url: "http://localhost:3000",
    siteName: "EduCore LMS",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "EduCore SaaS LMS Platform Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter / X Card Link Sharing
  twitter: {
    card: "summary_large_image",
    title: "EduCore LMS - Next-Gen SaaS Learning Platform",
    description:
      "Transform learning with EduCore LMS. Interactive video lessons, real-time AI tutor, automated grading, quizzes, certificates, and teacher analytics.",
    images: ["/og-image.svg"],
    creator: "@educorelms",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <meta property="og:image" content="/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og-image.svg" />
      </head>
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
