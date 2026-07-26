import React from "react";
import Link from "next/link";
import { BookOpen, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
        <div className="md:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-button flex items-center justify-center text-white font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white">
              Edu<span className="gradient-text">Core</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            EduCore is an all-in-one SaaS Learning Management System built for modern creators, instructors, and corporate academies. Build, sell, and scale video courses with real-time analytics.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Categories</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/courses?category=Programming" className="hover:text-purple-400">Programming & Web Dev</Link></li>
            <li><Link href="/courses?category=Design" className="hover:text-purple-400">UI/UX & Design</Link></li>
            <li><Link href="/courses?category=Marketing" className="hover:text-purple-400">Digital Marketing</Link></li>
            <li><Link href="/courses?category=AI" className="hover:text-purple-400">Artificial Intelligence & ML</Link></li>
            <li><Link href="/courses?category=Business" className="hover:text-purple-400">Business & SaaS</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/courses" className="hover:text-purple-400">Browse Catalog</Link></li>
            <li><Link href="/teacher/dashboard" className="hover:text-purple-400">Teach on EduCore</Link></li>
            <li><Link href="/admin/dashboard" className="hover:text-purple-400">Admin Control</Link></li>
            <li><Link href="/pricing" className="hover:text-purple-400">Pricing & SaaS Plans</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Newsletter</h4>
          <p className="text-xs text-slate-400 mb-3">Get the latest course releases and instructor guides.</p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email..."
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 flex-1"
            />
            <button className="gradient-button text-white text-xs px-3 py-2 rounded-lg font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 EduCore LMS SaaS Platform. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for global creators.
        </p>
      </div>
    </footer>
  );
};
