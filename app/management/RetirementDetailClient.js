"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import {
  HiArrowLeft,
  HiCalendar,
  HiShare,
  HiAcademicCap,
  HiSparkles,
  HiBriefcase,
  HiHeart,
} from "react-icons/hi2";

export default function RetirementDetailClient({ item }) {
  const { locale } = useLanguage();

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
            className="mb-12"
          >
            <Link
              href="/management/persaraan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-xl hover:bg-primary hover:text-white transition-all duration-300"
            >
              <HiArrowLeft />
              {locale === "zh" ? "返回荣休志" : "Kembali ke Hall of Honor"}
            </Link>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Portrait & Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-4 sticky top-40"
              >
                <div className="relative">
                  <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={
                          item.titleZh
                            ? `${item.title} ${item.titleZh}`
                            : item.title
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <HiAcademicCap className="w-32 h-32" />
                      </div>
                    )}
                  </div>

                  {/* Decorative Honor Badge */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-400 rounded-3xl shadow-2xl flex items-center justify-center text-white border-8 border-[#FDFCF7] rotate-12">
                    <HiHeart className="w-10 h-10" />
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-yellow-50 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                      <HiCalendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {locale === "zh" ? "服务年限" : "Sesi Perkhidmatan"}
                      </p>
                      <p className="text-xl font-display font-black text-primary">
                        {item.yearsOfService || item.date?.split("-")[0]}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-yellow-50 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                      <HiBriefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {locale === "zh" ? "退休前职位" : "Jawatan Terakhir"}
                      </p>
                      <p className="text-lg font-display font-black text-primary">
                        {item.jawatan ||
                          (locale === "zh"
                            ? "培华小学教师"
                            : "Guru SJKC Pei Hwa")}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="w-full mt-8 py-4 bg-white hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 border border-gray-100 rounded-3xl font-bold text-sm flex items-center justify-center gap-3 transition-all"
                >
                  <HiShare className="w-5 h-5" />
                  {locale === "zh" ? "分享致敬" : "Share Tribute"}
                </button>
              </motion.div>

              {/* Right Column: Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-8"
              >
                <div className="bg-white rounded-[4rem] p-10 md:p-16 shadow-xl border border-yellow-50 relative overflow-hidden">
                  {/* Decorative Background Icon */}
                  <HiSparkles className="absolute -top-10 -left-10 w-64 h-64 text-yellow-50 opacity-50" />

                  <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-display font-black text-primary mb-8 leading-tight">
                      {item.title}
                      {item.titleZh && (
                        <span className="block text-3xl md:text-5xl mt-2 opacity-80 font-medium">
                          {item.titleZh}
                        </span>
                      )}
                    </h1>

                    <div className="flex items-center gap-3 mb-12">
                      <span className="w-12 h-1.5 bg-yellow-400 rounded-full" />
                      <span className="text-sm font-black uppercase tracking-[0.3em] text-yellow-600">
                        {locale === "zh"
                          ? "感恩有您，老师"
                          : "Terima Kasih Cikgu"}
                      </span>
                    </div>

                    <div className="bg-yellow-50/50 p-8 rounded-[2.5rem] mb-12 border border-yellow-100 relative italic text-gray-600 text-lg leading-relaxed quotes">
                      <HiSparkles className="w-8 h-8 text-yellow-200 mb-4" />
                      {(locale === "zh" && item.summaryZh
                        ? item.summaryZh
                        : item.summary) ||
                        (locale === "zh"
                          ? "您的奉献将永远激励培华学校的未来一代。"
                          : "Bakti yang dicurahkan akan sentiasa menjadi inspirasi kepada generasi masa hadapan di SJKC Pei Hwa.")}
                    </div>

                    <div className="prose prose-xl prose-slate max-w-none text-gray-700 font-medium leading-[1.8]">
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            locale === "zh" && item.contentZh
                              ? item.contentZh
                              : item.content,
                        }}
                      />
                    </div>

                    <div className="mt-20 pt-12 border-t border-gray-100 flex flex-col items-center text-center">
                      <div className="w-20 h-20  rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/30">
                        <img
                          src="/logo.png"
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <p className="text-primary font-black text-xl mb-1">
                        SJKC Pei Hwa Machang
                      </p>
                      <p className="text-gray-400 font-bold text-sm tracking-widest uppercase italic">
                        #PeihwaFamily #HallOfHonor
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
