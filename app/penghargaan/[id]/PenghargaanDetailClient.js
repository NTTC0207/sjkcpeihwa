"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import { useCallback } from "react";
import {
  HiCalendar,
  HiUserGroup,
  HiArrowLeft,
  HiAcademicCap,
  HiTrophy,
  HiStar,
  HiShare,
} from "react-icons/hi2";

const CATEGORY_META = {
  "Ko-akademik": {
    color: "bg-blue-500",
    textColor: "text-blue-600",
    icon: <HiAcademicCap className="w-5 h-5" />,
  },
  "Badan Beruniform": {
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    icon: <HiUserGroup className="w-5 h-5" />,
  },
  "Kelab & Persatuan": {
    color: "bg-purple-500",
    textColor: "text-purple-600",
    icon: <HiStar className="w-5 h-5" />,
  },
  "Sukan & Permainan": {
    color: "bg-orange-500",
    textColor: "text-orange-600",
    icon: <HiTrophy className="w-5 h-5" />,
  },
  "Lain-lain": {
    color: "bg-slate-500",
    textColor: "text-slate-600",
    icon: <HiTrophy className="w-5 h-5" />,
  },
};

export default function PenghargaanDetailClient({ award }) {
  const { translations } = useLanguage();

  const t = useCallback(
    (key, fallback) => {
      const keys = key.split(".");
      let value = translations;
      for (const k of keys) value = value?.[k];
      return value || fallback;
    },
    [translations],
  );

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert(t("penghargaan.shareLinkCopied", "Link copied to clipboard!"));
    }
  };

  const meta = CATEGORY_META[award.category] || CATEGORY_META["Lain-lain"];

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
              href="/penghargaan"
              className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors"
            >
              <HiArrowLeft className="mr-2" />
              {t("penghargaan.backToList", "Kembali ke Senarai")}
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
                  className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-white ${meta.color}`}
                >
                  {t(
                    `penghargaan.categories.${award.category}`,
                    award.category,
                  )}
                </span>
                <span className="flex items-center text-gray-500 font-medium">
                  <HiCalendar className="mr-2 w-5 h-5 text-primary/60" />
                  {award.date}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-6 leading-tight">
                {award.title}
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
                      {t("nav.name", "SJK(C) Pei Hwa")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Official Penghargaan
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
              className="bg-white rounded-b-[3rem] p-8 pt-0 md:px-12 shadow-xl border-x border-b border-gray-100 mb-12 overflow-hidden"
            >
              <div className="pt-8">
                {/* Image Header if exists */}
                {award.image && (
                  <div className="w-full aspect-video relative rounded-2xl overflow-hidden mb-8">
                    <img
                      src={award.image}
                      className="w-full h-full object-cover"
                      alt={award.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {/* Student Names */}
                {award.studentNames && (
                  <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10 mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <HiUserGroup className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-primary/60 uppercase tracking-widest block mb-1">
                        {t(
                          "penghargaan.recipientLabel",
                          "Penerima / Murid terlibat",
                        )}
                      </span>
                      <p className="text-lg font-bold text-gray-800">
                        {award.studentNames}
                      </p>
                    </div>
                  </div>
                )}

                {/* Summary */}
                {award.summary && (
                  <div className="mb-10 text-xl text-gray-700 font-medium italic border-l-4 border-primary/20 pl-6 py-2">
                    {award.summary}
                  </div>
                )}

                {/* Content Description */}
                <div className="overflow-x-auto">
                  <div
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: award.description }}
                  />
                </div>

                {!award.description && (
                  <p className="text-gray-400 italic py-8">
                    {t("penghargaan.noDetails", "Tiada butiran tambahan.")}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Bottom Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <Link href="/penghargaan" className="btn-primary-accent">
                {t("penghargaan.viewMore", "Lihat Lebih Banyak Penghargaan")}
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
