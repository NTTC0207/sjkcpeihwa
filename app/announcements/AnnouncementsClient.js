"use client";

import { useState, useEffect, useRef } from "react";
// Animations removed for performance
import { useSearchParams } from "next/navigation";
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
  getDoc,
  doc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@lib/firebase";

// Category metadata for display
const CATEGORY_META = {
  academic: {
    key: "academic",
    labelKey: "nav.manage.academic",
    fallback: "Academic & Curriculum",
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  hem: {
    key: "hem",
    labelKey: "nav.manage.hem",
    fallback: "Student Affairs (HEM)",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  curriculum: {
    key: "curriculum",
    labelKey: "nav.manage.curriculum",
    fallback: "Co-Curriculum",
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    textColor: "text-orange-600",
  },
};

export default function AnnouncementsClient({
  initialAnnouncements,
  initialCategory,
}) {
  const { translations, locale } = useLanguage();
  const searchParams = useSearchParams();

  // Use state for instant UI response, sync with URL manually
  const [activeCategory, setActiveCategory] = useState(initialCategory || null);
  const categoryMeta = activeCategory ? CATEGORY_META[activeCategory] : null;

  const [announcements, setAnnouncements] = useState(
    initialAnnouncements || [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(
    (initialAnnouncements || []).length === 5,
  );
  const [selectedYear, setSelectedYear] = useState("all");

  // Local cache for avoiding redundant reads
  const [dataCache, setDataCache] = useState({
    [initialCategory || "all"]: {
      items: initialAnnouncements || [],
      lastDoc: null,
      hasMore: (initialAnnouncements || []).length === 5,
    },
  });

  const [availableYears, setAvailableYears] = useState(() => {
    // Initial years from server data
    const levels = (initialAnnouncements || [])
      .map((a) => a.date?.split("-")[0])
      .filter(Boolean);
    const currentYear = new Date().getFullYear().toString();
    const years = [...new Set(levels)];
    if (!years.includes(currentYear)) years.push(currentYear);
    return years.sort((a, b) => b - a);
  });

  // Helper to read nested translation keys
  const tNav = (key, fallback) => {
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) value = value?.[k];
    return value || fallback;
  };

  const fetchAnnouncements = async (isLoadMore = false, catOverride = null) => {
    const targetCategory = catOverride !== null ? catOverride : activeCategory;
    const cacheKey = targetCategory || "all";

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      if (!isLoadMore) {
        setAnnouncements([]);
        setLastDoc(null);
      }
    }

    try {
      let q;
      const constraints = [
        orderBy("date", "desc"),
        orderBy("__name__", "desc"),
        limit(5),
      ];

      if (targetCategory) {
        constraints.unshift(where("department", "==", targetCategory));
      }

      let currentLastDoc = lastDoc;

      if (isLoadMore) {
        if (currentLastDoc) {
          constraints.push(startAfter(currentLastDoc));
        } else if (announcements.length > 0) {
          const lastItem = announcements[announcements.length - 1];
          const docRef = doc(db, "announcement", lastItem.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            currentLastDoc = docSnap;
            constraints.push(startAfter(docSnap));
          }
        }
      }

      q = query(collection(db, "announcement"), ...constraints);
      const querySnapshot = await getDocs(q);

      // Protection: if user switched while fetching
      const isStillRelevant =
        catOverride !== null
          ? catOverride === targetCategory
          : activeCategory === targetCategory;

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newItems = isLoadMore ? [...announcements, ...data] : data;

      if (isStillRelevant && !isLoadMore) {
        setAnnouncements(newItems);
        setLastDoc(lastVisible);
        setHasMore(data.length === 5);
      } else if (isStillRelevant && isLoadMore) {
        setAnnouncements(newItems);
        setLastDoc(lastVisible);
        setHasMore(data.length === 5);
      }

      // Always update cache
      setDataCache((prev) => ({
        ...prev,
        [cacheKey]: {
          items: newItems,
          lastDoc: lastVisible,
          hasMore: data.length === 5,
        },
      }));
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      if (catOverride === null || catOverride === activeCategory) {
        setLoading(false);
      }
      setLoadingMore(false);
    }
  };

  const updateYearsFromData = (data) => {
    const years = [
      ...new Set(data.map((a) => a.date?.split("-")[0]).filter(Boolean)),
    ];
    const today = new Date().getFullYear().toString();
    if (!years.includes(today)) years.push(today);
    setAvailableYears(years.sort((a, b) => b - a));
  };

  const handleCategoryChange = (newCat) => {
    if (newCat === activeCategory) return;

    // Instant URL and State update
    const url = newCat ? `/announcements?category=${newCat}` : "/announcements";
    window.history.pushState({ category: newCat }, "", url);
    setActiveCategory(newCat);
    setSelectedYear("all");

    const cacheKey = newCat || "all";
    if (dataCache[cacheKey]) {
      const cached = dataCache[cacheKey];
      setAnnouncements(cached.items);
      setLastDoc(cached.lastDoc);
      setHasMore(cached.hasMore);
      updateYearsFromData(cached.items);
    } else {
      fetchAnnouncements(false, newCat);
    }
  };

  // Sync state if props change (e.g. Navigation from another link)
  useEffect(() => {
    if (initialCategory !== activeCategory) {
      // Only update if we aren't already loading something or if it's a fresh entry
      handleCategoryChange(initialCategory || null);
    } else if (announcements.length === 0 && !loading) {
      // Deep check to ensure we have data on initial load if props were empty
      if (initialAnnouncements?.length > 0) {
        setAnnouncements(initialAnnouncements);
        setHasMore(initialAnnouncements.length === 5);
        updateYearsFromData(initialAnnouncements);
      } else {
        fetchAnnouncements();
      }
    }
  }, [initialCategory, initialAnnouncements]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      handleCategoryChange(cat);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [dataCache, activeCategory]);

  // Sync years when announcements change
  useEffect(() => {
    updateYearsFromData(announcements);
  }, [announcements]);

  // Animations removed for performance

  if (loading && announcements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <main className="pt-32 pb-24">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-16">
            {/* Category breadcrumb */}
            {categoryMeta && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  {translations.announcements.title}
                </button>
                <span className="text-gray-300">/</span>
                <span
                  className={`text-sm font-semibold ${categoryMeta.textColor}`}
                >
                  {tNav(categoryMeta.labelKey, categoryMeta.fallback)}
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              {categoryMeta
                ? tNav(categoryMeta.labelKey, categoryMeta.fallback)
                : translations.announcements.title}
            </h1>
            <div
              className={`w-20 h-1.5 mx-auto rounded-full mb-6 ${
                categoryMeta ? categoryMeta.color : "bg-accent-yellow"
              }`}
            />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {translations.announcements.subtitle}
            </p>

            {/* Category filter tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  !activeCategory
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {translations.announcements.allYears
                  ? tNav("announcements.title", "All")
                  : "All"}
              </button>
              {Object.values(CATEGORY_META).map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat.key
                      ? `${cat.color} text-white shadow-md`
                      : `bg-white border border-gray-200 ${cat.textColor} hover:border-current`
                  }`}
                >
                  {tNav(cat.labelKey, cat.fallback)}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {translations.announcements.filterYear}
                </span>
                <div className="relative inline-block w-48">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <option value="all">
                      {translations.announcements.allYears}
                    </option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                    <HiChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-400 font-medium">
              {
                announcements.filter((a) =>
                  selectedYear === "all"
                    ? true
                    : a.date.startsWith(selectedYear),
                ).length
              }{" "}
              {translations.announcements.title}
            </div>
          </div>

          {/* Listing */}
          <div className="grid gap-6 max-w-4xl mx-auto">
            {announcements
              .filter((a) =>
                selectedYear === "all" ? true : a.date.startsWith(selectedYear),
              )
              .map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  <Link
                    href={`/announcements/${announcement.id}`}
                    className="flex flex-col md:flex-row gap-0"
                  >
                    {/* Thumbnail Area */}
                    <div className="w-full md:w-56 h-48 md:h-auto shrink-0 overflow-hidden bg-neutral-bg relative">
                      {announcement.image ? (
                        <>
                          <img
                            src={announcement.image}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt={announcement.title}
                          />
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group-hover:bg-primary/[0.02] transition-colors duration-500">
                          {/* School Name Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-12 -translate-y-4">
                            <span className="text-6xl font-black whitespace-nowrap tracking-tighter">
                              培华 • 培华 • 培华
                            </span>
                          </div>

                          {/* Date Block */}
                          <div className="relative z-10 flex flex-col items-center bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-50 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
                            <span className="text-primary font-black text-3xl leading-none">
                              {announcement.date?.split("-")[2]}
                            </span>
                            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
                              {new Date(announcement.date).toLocaleString(
                                locale === "zh" ? "zh-CN" : "en-US",
                                { month: "short" },
                              )}
                            </span>
                          </div>

                          {/* Faint Megaphone Icon */}
                          <HiMegaphone className="absolute bottom-3 right-3 w-8 h-8 text-primary/5 -rotate-12" />
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow p-6 md:p-8 flex flex-col">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg text-white ${announcement.badgeColor || "bg-primary"}`}
                        >
                          {announcement.badge}
                        </span>
                        <span className="flex items-center text-sm text-gray-400 font-medium">
                          <HiCalendar className="mr-1.5 w-4 h-4 text-primary/40" />
                          {announcement.date}
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-display font-bold text-primary mb-3 group-hover:text-primary-dark transition-colors line-clamp-2 leading-tight">
                        {announcement.title}
                      </h2>

                      <p className="text-gray-500 line-clamp-2 text-sm md:text-base leading-relaxed mb-6">
                        {announcement.summary}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center text-primary font-bold text-sm tracking-tight group-hover:gap-1 transition-all">
                          <span className="border-b-2 border-primary/0 group-hover:border-primary/20 transition-all">
                            {translations?.announcements?.readMore}
                          </span>
                          <HiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}

            {announcements.filter((a) =>
              selectedYear === "all" ? true : a.date.startsWith(selectedYear),
            ).length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-neutral-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiCalendar className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">
                  {translations.announcements.noAnnouncements ||
                    "No announcements found for this year"}
                </h3>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => fetchAnnouncements(true)}
                  disabled={loadingMore}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-white border-2 border-primary/10 rounded-2xl text-primary font-bold hover:border-primary/30 hover:bg-neutral-bg transition-all duration-300 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>
                        {translations.announcements.loadMore ||
                          "Request More Announcements"}
                      </span>
                      <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
