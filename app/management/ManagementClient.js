"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import {
  HiMegaphone,
  HiArrowRight,
  HiCalendar,
  HiChevronDown,
} from "react-icons/hi2";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@lib/firebase";

const CATEGORY_META = {
  persaraan: {
    key: "persaraan",
    labelKey: "nav.management.retirement",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
  },
  pertukaran: {
    key: "pertukaran",
    labelKey: "nav.management.transfer",
    color: "bg-amber-500",
    textColor: "text-amber-600",
  },
  bangunan: {
    key: "bangunan",
    labelKey: "nav.management.new_building",
    color: "bg-blue-500",
    textColor: "text-blue-600",
  },
  penyelenggaraan: {
    key: "penyelenggaraan",
    labelKey: "nav.management.maintenance",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
  },
  khidmat_bantu: {
    key: "khidmat_bantu",
    labelKey: "nav.management.visit",
    color: "bg-purple-500",
    textColor: "text-purple-600",
  },
};

export default function ManagementClient({ initialItems, category }) {
  const { translations, locale, isMounted } = useLanguage();
  const [items, setItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(initialItems?.length === 5);
  const categoryMeta = CATEGORY_META[category] || CATEGORY_META.persaraan;

  const tNav = useCallback(
    (key, fallback) => {
      if (!isMounted) return fallback;
      const keys = key.split(".");
      let value = translations;
      for (const k of keys) {
        if (!value) break;
        value = value?.[k];
      }
      return value || fallback;
    },
    [translations],
  );

  const fetchMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const isDedicatedCollection = ["persaraan", "pertukaran"].includes(
        category,
      );
      const collectionName = isDedicatedCollection ? category : "management";

      let q;
      if (isDedicatedCollection) {
        q = query(
          collection(db, collectionName),
          orderBy("date", "desc"),
          limit(5),
        );
      } else {
        q = query(
          collection(db, "management"),
          where("category", "==", category),
          orderBy("date", "desc"),
          limit(5),
        );
      }

      const snap = await getDocs(q);
      const allFetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Filter out items already in the list
      const existingIds = new Set(items.map((i) => i.id));
      const newItems = allFetched.filter((i) => !existingIds.has(i.id));

      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
        setHasMore(allFetched.length === 5);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more management items:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg pt-32 pb-24">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            {tNav(categoryMeta.labelKey, category)}
          </h1>
          <div
            className={`w-20 h-1.5 mx-auto rounded-full mb-6 ${categoryMeta.color}`}
          />
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {items.map((item, index) => (
            <ManagementCard
              key={item.id}
              item={item}
              locale={locale}
              translations={translations}
              categoryMeta={categoryMeta}
              index={index}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={fetchMore}
                disabled={loading}
                className="group relative px-8 py-4 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex items-center gap-3 active:scale-95 disabled:opacity-50"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-primary/10 ${loading ? "animate-spin border-2 border-primary border-t-transparent" : ""}`}
                >
                  {!loading && (
                    <HiChevronDown className="w-5 h-5 text-primary" />
                  )}
                </div>
                <span className="font-bold text-primary">
                  {loading
                    ? locale === "zh"
                      ? "加载中..."
                      : "Memuatkan..."
                    : locale === "zh"
                      ? "加载更多"
                      : "Lihat Lagi"}
                </span>
              </button>
            </div>
          )}

          {items.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-neutral-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <HiCalendar className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-400">
                {["bangunan", "penyelenggaraan"].includes(category)
                  ? tNav(
                      "coming_soon",
                      locale === "zh" ? "敬请期待" : "Akan Datang",
                    )
                  : locale === "zh"
                    ? "暂无相关记录"
                    : "Tiada rekod ditemui."}
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ManagementCard({ item, locale, translations, categoryMeta, index }) {
  const monthLabel = useMemo(() => {
    if (!item.date) return "";
    return new Date(item.date).toLocaleString(
      locale === "zh" ? "zh-CN" : "ms-MY",
      { month: "short" },
    );
  }, [item.date, locale]);

  const dayLabel = item.date?.split("-")[2];
  const isRetirement = categoryMeta.key === "persaraan";

  const tNav = (key, fallback) => {
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) value = value?.[k];
    return value || fallback;
  };

  return (
    <Link
      href={`/management/${categoryMeta.key}/${item.id}`}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100 group block relative"
    >
      {/* Premium Flair for Retirement */}
      {isRetirement && (
        <div className="absolute top-6 right-6 z-10 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-yellow-200 transform group-hover:rotate-12 transition-transform duration-500">
          <span className="text-xl">⭐</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-0">
        <div className="w-full md:w-64 h-[220px] md:h-auto shrink-0 overflow-hidden bg-neutral-bg relative">
          {item.image ? (
            <img
              src={item.image}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt={item.title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center bg-white px-6 py-5 rounded-[2rem] shadow-sm border border-gray-50">
                <span className="text-primary font-black text-4xl leading-none">
                  {dayLabel}
                </span>
                <span className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-2">
                  {monthLabel}
                </span>
              </div>
              <HiMegaphone className="absolute bottom-4 right-4 w-10 h-10 text-primary/5 -rotate-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="flex-grow p-8 md:p-10 flex flex-col">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl text-white ${categoryMeta.color} shadow-lg shadow-black/5`}
            >
              {tNav(categoryMeta.labelKey, "")}
            </span>
            <span className="flex items-center text-xs text-gray-400 font-bold">
              <HiCalendar className="mr-2 w-4 h-4 text-primary/40" />
              {item.date}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-4 leading-tight group-hover:text-primary-dark transition-colors duration-300">
            {item.title}
          </h2>

          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 line-clamp-2">
            {item.summary}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center text-primary font-black text-sm uppercase tracking-wider">
              <span>{locale === "zh" ? "阅读更多" : "Baca Selengkapnya"}</span>
              <HiArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-3" />
            </div>
            {isRetirement && (
              <span className="text-[10px] font-bold text-gray-300 uppercase italic">
                #PeihwaFamily
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
