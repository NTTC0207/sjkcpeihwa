"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import { HiArrowLeft, HiCalendar, HiShare, HiTag } from "react-icons/hi2";

const CATEGORY_META = {
  persaraan: {
    key: "persaraan",
    labelKey: "nav.management.retirement",
    color: "bg-yellow-500",
  },
  pertukaran: {
    key: "pertukaran",
    labelKey: "nav.management.transfer",
    color: "bg-amber-500",
  },
  bangunan: {
    key: "bangunan",
    labelKey: "nav.management.new_building",
    color: "bg-blue-500",
  },
  penyelenggaraan: {
    key: "penyelenggaraan",
    labelKey: "nav.management.maintenance",
    color: "bg-yellow-500",
  },
  khidmat_bantu: {
    key: "khidmat_bantu",
    labelKey: "nav.management.visit",
    color: "bg-purple-500",
  },
};

export default function ManagementDetailClient({ item, category }) {
  const { translations, locale } = useLanguage();
  const categoryMeta = CATEGORY_META[category] || CATEGORY_META.persaraan;

  const tNav = (key, fallback) => {
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) value = value?.[k];
    return value || fallback;
  };

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
              href={`/management/${category}`}
              className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors"
            >
              <HiArrowLeft className="mr-2" />
              {locale === "zh" ? "返回列表" : "Kembali ke Senarai"}
            </Link>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Image Section */}
            {item.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto object-cover max-h-[600px]"
                />
              </motion.div>
            )}

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100"
            >
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span
                  className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-white ${categoryMeta.color} shadow-lg`}
                >
                  {tNav(categoryMeta.labelKey, category)}
                </span>
                <span className="flex items-center text-gray-400 font-bold text-sm">
                  <HiCalendar className="mr-2 w-5 h-5 text-primary/40" />
                  {item.date}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-8 leading-tight">
                {item.title}
              </h1>

              <div className="flex items-center justify-between py-6 border-y border-gray-50 mb-10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                    <img src="/logo.png" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-primary">
                      SJKC Pei Hwa
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      Urusan Pentadbiran
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="p-4 bg-gray-50 hover:bg-primary/10 text-gray-400 hover:text-primary rounded-2xl transition-all group"
                >
                  <HiShare className="w-5 h-5 transition-transform group-hover:scale-110" />
                </button>
              </div>

              <div className="prose prose-lg max-w-none text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
