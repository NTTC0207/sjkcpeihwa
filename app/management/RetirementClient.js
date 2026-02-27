"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import {
  HiCalendar,
  HiChevronDown,
  HiAcademicCap,
  HiHeart,
  HiSparkles,
} from "react-icons/hi2";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@lib/firebase";
import { motion } from "framer-motion";

export default function RetirementClient({ initialItems }) {
  const { translations, locale, isMounted } = useLanguage();
  const [items, setItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems?.length === 5);

  const tNav = (key, fallback) => {
    if (!isMounted) return fallback;
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) value = value?.[k];
    return value || fallback;
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fetchMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const q = query(
        collection(db, "persaraan"),
        orderBy("date", "desc"),
        limit(10),
      );

      const snap = await getDocs(q);
      const allFetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const existingIds = new Set(items.map((i) => i.id));
      const newItems = allFetched.filter((i) => !existingIds.has(i.id));

      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
        setHasMore(allFetched.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more retirement items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg pt-32 pb-24">
      <div className="container-custom">
        <div className="text-center mb-16 px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4 leading-tight">
            {locale === "zh" ? "荣休志" : "Jasamu Dikenang"}
          </h1>
          <div className="w-20 h-1.5 mx-auto rounded-full mb-6 bg-yellow-400" />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {locale === "zh"
              ? "向为培华学校付出毕生心血的教育工作者致敬。您的奉献将永远铭刻在校史之中。"
              : "Menghargai jasa dan bakti para pendidik yang telah mencurahkan sepenuh jiwa bagi kecemerlangan SJKC Pei Hwa."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {items.map((item, index) => (
            <RetirementStaffCard
              key={item.id}
              staff={item}
              locale={locale}
              index={index}
            />
          ))}

          {items.length === 0 && (
            <div className="col-span-full py-24 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6 relative">
                <HiHeart className="w-10 h-10 text-yellow-300" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <HiSparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-500" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-400 mb-3">
                {locale === "zh"
                  ? "一段崭新的篇章"
                  : "Segalanya Bermula di Sini"}
              </h3>
              <p className="text-gray-400 text-sm max-w-sm leading-relaxed px-6 italic">
                {locale === "zh"
                  ? "目前暂无荣休记录。每一份奉献都值得被铭记，我们期待着在这里记录更多感动。 "
                  : "Puan/Tuan/Encik, tiada rekod persaraan ditemui buat masa ini. Namun, setiap jasa tetap tersemat di sanubari."}
              </p>
            </div>
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-20">
            <button
              onClick={fetchMore}
              disabled={loading}
              className="group relative px-10 py-5 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 border border-yellow-100 flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${loading ? "animate-spin border-2 border-primary border-t-transparent" : "bg-yellow-400 group-hover:rotate-180"}`}
              >
                {!loading && <HiChevronDown className="w-5 h-5 text-white" />}
              </div>
              <span className="font-black text-primary uppercase tracking-widest text-sm">
                {loading ? "..." : locale === "zh" ? "查看更多" : "Lihat Lagi"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RetirementStaffCard({ staff, locale, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/management/persaraan/${staff.id}`}
        className="group relative block bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 h-full flex flex-col items-center text-center"
      >
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-[3rem] -z-0 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:rounded-[2rem]" />

        <div className="relative z-10 flex flex-col items-center h-full">
          {/* Compact Avatar */}
          <div className="relative mb-5">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-105">
              {staff.image ? (
                <img
                  src={staff.image}
                  className="w-full h-full object-cover"
                  alt={
                    staff.titleZh
                      ? `${staff.title} ${staff.titleZh}`
                      : staff.title
                  }
                />
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                  <HiAcademicCap className="w-12 h-12 text-slate-200" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 z-20 bg-yellow-400 text-white p-2 rounded-xl shadow-lg border-2 border-white transform group-hover:rotate-12 transition-transform duration-300">
              <HiHeart className="w-4 h-4" />
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-display font-bold text-primary mb-1 group-hover:text-primary-dark transition-colors">
              {staff.title}
              {staff.titleZh && (
                <span className="block text-lg font-medium opacity-80 mt-1">
                  {staff.titleZh}
                </span>
              )}
            </h2>
            <p className="text-primary/70 font-bold text-[10px] uppercase tracking-wider mb-2">
              {staff.jawatan || "Pendidik"}
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold text-[9px] tracking-wide bg-yellow-50/80 py-1 px-3 rounded-full mx-auto w-fit">
              <HiCalendar className="w-3 h-3" />
              <span>{staff.yearsOfService || staff.date?.split("-")[0]}</span>
            </div>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-2 italic px-2">
            "{staff.summary || "Sebuah kenangan abadi di SJKC Pei Hwa."}"
          </p>

          <div className="mt-auto w-full py-2.5 bg-neutral-bg group-hover:bg-primary group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300">
            {locale === "zh" ? "了解更多" : "Profil Penuh"}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
