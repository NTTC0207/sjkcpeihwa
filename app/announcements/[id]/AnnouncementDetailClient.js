"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import {
  HiArrowLeft,
  HiCalendar,
  HiShare,
  HiPaperClip,
  HiDocumentText,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";

export default function AnnouncementDetailClient({ announcement }) {
  const { translations } = useLanguage();

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <main className="pt-32 pb-24">
        <div className="container-custom">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/announcements"
              className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors"
            >
              <HiArrowLeft className="mr-2" />
              Back to Announcements
            </Link>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-t-[3rem] p-8 pb-0 md shadow-sm border-x border-t border-gray-100"
            >
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span
                  className={`text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-full text-white ${announcement.badgeColor || "bg-primary"}`}
                >
                  {announcement.badge}
                </span>
                <span className="flex items-center text-gray-500 font-medium">
                  <HiCalendar className="mr-2 w-5 h-5 text-primary/60" />
                  {announcement.date}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-6 leading-tight">
                {announcement.title}
              </h1>

              <div className="flex items-center justify-between py-6 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">
                      SJK(C) Pei Hwa
                    </p>
                    <p className="text-xs text-gray-500">
                      Official Announcement
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="p-3 bg-neutral-bg hover:bg-gray-200 rounded-full transition-colors group"
                  title="Share"
                >
                  <HiShare className="w-5 h-5 text-gray-600 group-hover:text-primary" />
                </button>
              </div>
            </motion.div>

            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-b-[3rem] p-8 pt-0 md:px-12 shadow-xl border-x border-b border-gray-100 mb-12"
            >
              <div
                className="prose prose-lg max-w-none text-gray-700 pt-8"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />

              {/* Attachments */}
              {announcement.attachments?.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <HiPaperClip className="w-4 h-4" />
                    Attachments ({announcement.attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {announcement.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors group"
                      >
                        <HiDocumentText className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                        <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                          {att.name}
                        </span>
                        <HiArrowTopRightOnSquare className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Bottom Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <Link href="/announcements" className="btn-primary-accent">
                View More Announcements
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
