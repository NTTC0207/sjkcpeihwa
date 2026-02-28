"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import { motion } from "framer-motion";
import {
  HiTrophy,
  HiCalendar,
  HiChevronDown,
  HiAcademicCap,
  HiUserGroup,
  HiStar,
  HiArrowRight,
  HiArrowLeft,
  HiShare,
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
  "Ko-akademik": {
    key: "Ko-akademik",
    labelKey: "penghargaan.categories.Ko-akademik",
    fallback: "Ko-akademik",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    icon: <HiAcademicCap className="w-6 h-6" />,
  },
  "Badan Beruniform": {
    key: "Badan Beruniform",
    labelKey: "penghargaan.categories.Badan Beruniform",
    fallback: "Badan Beruniform",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    icon: <HiUserGroup className="w-6 h-6" />,
  },
  "Kelab & Persatuan": {
    key: "Kelab & Persatuan",
    labelKey: "penghargaan.categories.Kelab & Persatuan",
    fallback: "Kelab & Persatuan",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
    icon: <HiStar className="w-6 h-6" />,
  },
  "Sukan & Permainan": {
    key: "Sukan & Permainan",
    labelKey: "penghargaan.categories.Sukan & Permainan",
    fallback: "Sukan & Permainan",
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    textColor: "text-orange-600",
    icon: <HiTrophy className="w-6 h-6" />,
  },
  "Lain-lain": {
    key: "Lain-lain",
    labelKey: "penghargaan.categories.Lain-lain",
    fallback: "Lain-lain",
    color: "bg-slate-500",
    lightColor: "bg-slate-50",
    textColor: "text-slate-600",
    icon: <HiTrophy className="w-6 h-6" />,
  },
};

// INITIAL_LIMIT: how many items the server fetches for ISR
const INITIAL_LIMIT = 20;

// Helper to normalize category from URL
const normalizeCategory = (cat) => {
  if (!cat) return null;
  const lowerCat = cat.toLowerCase();
  if (lowerCat.includes("kelab")) return "Kelab & Persatuan";
  if (lowerCat.includes("sukan")) return "Sukan & Permainan";
  if (lowerCat.includes("uniform")) return "Badan Beruniform";
  if (lowerCat.includes("ko") || lowerCat.includes("academic"))
    return "Ko-akademik";
  if (lowerCat.includes("lain")) return "Lain-lain";

  // Check if it's already a valid key in CATEGORY_META
  if (CATEGORY_META[cat]) return cat;

  return cat;
};
// LOAD_MORE_LIMIT: how many items to fetch per "load more" click
const LOAD_MORE_LIMIT = 5;

// Helper: extract year list from awards data
function buildYearList(data) {
  const years = [
    ...new Set(data.map((a) => a.date?.split("-")[0]).filter(Boolean)),
  ];
  const today = new Date().getFullYear().toString();
  if (!years.includes(today)) years.push(today);
  return years.sort((a, b) => b - a);
}

export default function PenghargaanClient({ initialAwards }) {
  const { translations, locale } = useLanguage();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(null);
  const categoryMeta = activeCategory ? CATEGORY_META[activeCategory] : null;

  const [awards, setAwards] = useState(initialAwards || []);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(
    (initialAwards || []).length === INITIAL_LIMIT,
  );
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // --- Inline detail view ---
  const [selectedAward, setSelectedAward] = useState(null);

  const months = useMemo(
    () => [
      { value: "01", label: locale === "zh" ? "一月" : "Januari" },
      { value: "02", label: locale === "zh" ? "二月" : "Februari" },
      { value: "03", label: locale === "zh" ? "三月" : "Mac" },
      { value: "04", label: locale === "zh" ? "四月" : "April" },
      { value: "05", label: locale === "zh" ? "五月" : "Mei" },
      { value: "06", label: locale === "zh" ? "六月" : "Jun" },
      { value: "07", label: locale === "zh" ? "七月" : "Julai" },
      { value: "08", label: locale === "zh" ? "八月" : "Ogos" },
      { value: "09", label: locale === "zh" ? "九月" : "September" },
      { value: "10", label: locale === "zh" ? "十月" : "Oktober" },
      { value: "11", label: locale === "zh" ? "十一月" : "November" },
      { value: "12", label: locale === "zh" ? "十二月" : "Disember" },
    ],
    [locale],
  );

  // Local cache — avoids redundant Firebase reads on category revisits.
  // Pre-seeded with server-provided awards to respect ISR (revalidate=false):
  // we bucket each award by its category so that switching to a category tab
  // that is already covered by the initial payload never fires a Firebase read.
  const dataCacheRef = useRef(null);
  if (!dataCacheRef.current) {
    const initialItems = initialAwards || [];
    dataCacheRef.current = {
      all: {
        items: initialItems,
        lastDoc: null,
        hasMore: initialItems.length === INITIAL_LIMIT,
      },
    };

    // Pre-seed each category bucket from the initial payload
    initialItems.forEach((award) => {
      if (award.category) {
        if (!dataCacheRef.current[award.category]) {
          dataCacheRef.current[award.category] = {
            items: [],
            lastDoc: null,
            hasMore: false, // Initial chunk doesn't guarantee full category list
          };
        }
        dataCacheRef.current[award.category].items.push(award);
      }
    });
  }

  const [availableYears, setAvailableYears] = useState(() =>
    buildYearList(initialAwards || []),
  );

  const activeCategoryRef = useRef(activeCategory);
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  const awardsRef = useRef(awards);
  useEffect(() => {
    awardsRef.current = awards;
  }, [awards]);

  const lastDocRef = useRef(lastDoc);
  useEffect(() => {
    lastDocRef.current = lastDoc;
  }, [lastDoc]);

  const t = useCallback(
    (key, fallback) => {
      const keys = key.split(".");
      let value = translations;
      for (const k of keys) value = value?.[k];
      return value || fallback;
    },
    [translations],
  );

  const fetchAwards = useCallback(
    async (isLoadMore = false, catOverride = null) => {
      const targetCategory =
        catOverride !== null ? catOverride : activeCategoryRef.current;
      const cacheKey = targetCategory || "all";

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setAwards([]);
        setLastDoc(null);
        lastDocRef.current = null;
      }

      try {
        const batchSize = isLoadMore ? LOAD_MORE_LIMIT : INITIAL_LIMIT;
        const constraints = [
          orderBy("date", "desc"),
          orderBy("__name__", "desc"),
          limit(batchSize),
        ];

        if (targetCategory) {
          constraints.unshift(where("category", "==", targetCategory));
        }

        if (isLoadMore) {
          let cursor = lastDocRef.current;
          if (!cursor && awardsRef.current.length > 0) {
            const lastItem = awardsRef.current[awardsRef.current.length - 1];
            const docRef = doc(db, "penghargaan", lastItem.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              cursor = docSnap;
              lastDocRef.current = docSnap;
            }
          }
          if (cursor) constraints.push(startAfter(cursor));
        }

        const q = query(collection(db, "penghargaan"), ...constraints);
        const querySnapshot = await getDocs(q);

        if (
          activeCategoryRef.current !== targetCategory &&
          catOverride === null
        ) {
          return;
        }

        const lastVisible =
          querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const newItems = isLoadMore ? [...awardsRef.current, ...data] : data;
        const more = data.length === batchSize;

        setAwards(newItems);
        setLastDoc(lastVisible);
        setHasMore(more);
        lastDocRef.current = lastVisible;

        dataCacheRef.current[cacheKey] = {
          items: newItems,
          lastDoc: lastVisible,
          hasMore: more,
        };

        if (!isLoadMore) {
          setAvailableYears(buildYearList(newItems));
        }
      } catch (error) {
        console.error("Error fetching awards:", error);
      } finally {
        if (!isLoadMore) setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  const handleCategoryChange = useCallback(
    (newCat) => {
      if (newCat === activeCategoryRef.current) return;

      const url = newCat ? `/penghargaan?category=${newCat}` : "/penghargaan";
      window.history.pushState({ category: newCat }, "", url);
      setActiveCategory(newCat);
      setSelectedYear("all");
      activeCategoryRef.current = newCat;

      const cacheKey = newCat || "all";
      const cached = dataCacheRef.current[cacheKey];
      if (cached && cached.items.length > 0) {
        setAwards(cached.items);
        setLastDoc(cached.lastDoc);
        setHasMore(cached.hasMore);
        lastDocRef.current = cached.lastDoc;
        setAvailableYears(buildYearList(cached.items));
      } else {
        fetchAwards(false, newCat);
      }
    },
    [fetchAwards],
  );

  useEffect(() => {
    const rawUrlCategory = searchParams.get("category") || null;
    const urlCategory = normalizeCategory(rawUrlCategory);

    if (urlCategory === activeCategoryRef.current) {
      if (awards.length === 0 && !loading) {
        const cacheKey = urlCategory || "all";
        const cached = dataCacheRef.current[cacheKey];
        if (cached && cached.items.length > 0) {
          setAwards(cached.items);
          setLastDoc(cached.lastDoc);
          setHasMore(cached.hasMore);
          setAvailableYears(buildYearList(cached.items));
        } else {
          fetchAwards(false, urlCategory);
        }
      }
      return;
    }

    handleCategoryChange(urlCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      if (path === "/penghargaan") {
        setSelectedAward(null);
        const params = new URLSearchParams(window.location.search);
        const cat = params.get("category");
        handleCategoryChange(cat);
      } else {
        const idMatch = path.match(/^\/penghargaan\/(.+)$/);
        if (idMatch) {
          const id = idMatch[1];
          const found = awardsRef.current.find((a) => a.id === id);
          if (found) {
            setSelectedAward(found);
          } else {
            window.location.href = path;
          }
        }
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [handleCategoryChange]);

  const handleSelectAward = useCallback((award) => {
    setSelectedAward(award);
    window.history.pushState(
      { awardId: award.id },
      "",
      `/penghargaan/${award.id}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedAward(null);
    const cat = activeCategoryRef.current;
    const url = cat ? `/penghargaan?category=${cat}` : "/penghargaan";
    window.history.pushState({ category: cat }, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredAwards = useMemo(() => {
    let items = awards;
    if (selectedYear !== "all") {
      items = items.filter((a) => a.date?.startsWith(selectedYear));
    }
    if (selectedMonth !== "all") {
      items = items.filter((a) => a.date?.split("-")[1] === selectedMonth);
    }
    return items;
  }, [awards, selectedYear, selectedMonth]);

  if (loading && awards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Inline detail view ---
  if (selectedAward) {
    const award = selectedAward;
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
              <button
                onClick={handleBackToList}
                className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors"
              >
                <HiArrowLeft className="mr-2" />
                {t("penghargaan.backToList", "Kembali ke Senarai")}
              </button>
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
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden">
                      <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">
                        {t("nav.name", "SJKC Pei Hwa")}
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

                  {award.summary && (
                    <div className="mb-10 text-xl text-gray-700 font-medium italic border-l-4 border-primary/20 pl-6 py-2">
                      {award.summary}
                    </div>
                  )}

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
                <button
                  onClick={handleBackToList}
                  className="btn-primary-accent"
                >
                  {t("penghargaan.viewMore", "Lihat Lebih Banyak Penghargaan")}
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <main className="pt-32 pb-24">
        <div className="container-custom">
          {/* Header Section */}
          <div className="text-center mb-16">
            {/* Category breadcrumb */}
            {categoryMeta && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  {t("penghargaan.title", "Penghargaan")}
                </button>
                <span className="text-gray-300">/</span>
                <span
                  className={`text-sm font-semibold ${categoryMeta.textColor}`}
                >
                  {t(categoryMeta.labelKey, categoryMeta.fallback)}
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              {categoryMeta
                ? t(categoryMeta.labelKey, categoryMeta.fallback)
                : t("penghargaan.title", "Penghargaan")}
            </h1>
            <div
              className={`w-20 h-1.5 mx-auto rounded-full mb-6 ${
                categoryMeta ? categoryMeta.color : "bg-accent-yellow"
              }`}
            />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {t(
                "penghargaan.subtitle",
                "Meraikan kecemerlangan dan kejayaan murid-murid SJKC Pei Hwa dalam pelbagai bidang.",
              )}
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
                {t("penghargaan.all", "Semua")}
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
                  {t(cat.labelKey, cat.fallback)}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-6">
                {/* Year Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {t("penghargaan.yearLabel", "Tahun")}
                  </span>
                  <div className="relative inline-block w-40">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <option value="all">
                        {t("penghargaan.allYears", "Semua Tahun")}
                      </option>
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                      <HiChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Month Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {t("penghargaan.filterMonth", "Bulan")}
                  </span>
                  <div className="relative inline-block w-40">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <option value="all">
                        {t("penghargaan.allMonths", "Semua Bulan")}
                      </option>
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                      <HiChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-400 font-medium">
              {filteredAwards.length} {t("penghargaan.title", "Penghargaan")}
            </div>
          </div>

          {/* Awards Listing */}
          <div className="grid gap-6 max-w-4xl mx-auto">
            {filteredAwards.map((award) => (
              <AwardCard
                key={award.id}
                award={award}
                locale={locale}
                translations={translations}
                t={t}
                onSelect={handleSelectAward}
              />
            ))}

            {filteredAwards.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-neutral-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiTrophy className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">
                  {t(
                    "penghargaan.noRecords",
                    "Tiada rekod penghargaan ditemui.",
                  )}
                </h3>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => fetchAwards(true)}
                  disabled={loadingMore}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-white border-2 border-primary/10 rounded-2xl text-primary font-bold hover:border-primary/30 hover:bg-neutral-bg transition-all duration-300 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>
                        {t("penghargaan.viewMore", "Muat Lagi Penghargaan")}
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

const AwardCard = ({ award, locale, translations, t, onSelect }) => {
  const monthLabel = useMemo(() => {
    if (!award.date) return "";
    return new Date(award.date).toLocaleString(
      locale === "zh" ? "zh-CN" : "ms-MY",
      { month: "short" },
    );
  }, [award.date, locale]);

  const dayLabel = award.date?.split("-")[2];
  const categoryMeta =
    CATEGORY_META[award.category] || CATEGORY_META["Lain-lain"];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <button
        onClick={() => onSelect(award)}
        className="w-full flex flex-col md:flex-row gap-0 text-left"
      >
        {/* Thumbnail Area */}
        <div className="w-full md:w-56 h-[200px] md:h-[285px] shrink-0 overflow-hidden bg-neutral-bg relative">
          {award.image ? (
            <>
              <img
                src={award.image}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={award.title}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
            </>
          ) : (
            <div
              className={`w-full h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group-hover:opacity-90 transition-opacity duration-500`}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-12 -translate-y-4">
                <span className="text-6xl font-black whitespace-nowrap tracking-tighter">
                  培华 • 培华 • 培华
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-50 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
                <span className="text-primary font-black text-3xl leading-none">
                  {dayLabel}
                </span>
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
                  {monthLabel}
                </span>
              </div>

              <div className="absolute bottom-3 right-3 opacity-10 -rotate-12 transition-transform duration-500 group-hover:scale-110">
                {categoryMeta.icon}
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-grow p-6 md:p-8 flex flex-col">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg text-white ${categoryMeta.color}`}
            >
              {t(`penghargaan.categories.${award.category}`, award.category)}
            </span>
            <span className="flex items-center text-sm text-gray-400 font-medium">
              <HiCalendar className="mr-1.5 w-4 h-4 text-primary/40" />
              {award.date}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-display font-bold text-primary mb-3 group-hover:text-primary-dark transition-colors line-clamp-2 leading-tight">
            {award.title}
          </h2>

          {award.studentNames && (
            <div className="flex items-start gap-2 mb-4 text-gray-600">
              <HiUserGroup className="w-5 h-5 text-primary/40 shrink-0 mt-0.5" />
              <p className="text-sm font-medium line-clamp-1">
                {award.studentNames}
              </p>
            </div>
          )}

          <div className="text-gray-500 line-clamp-2 text-sm md:text-base leading-relaxed mb-6">
            {award.summary ||
              (award.description ? (
                <div
                  className="line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: award.description }}
                />
              ) : (
                "Tiada ringkasan."
              ))}
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center text-primary font-bold text-sm tracking-tight group/btn hover:gap-1 transition-all">
              <span className="border-b-2 border-primary/0 group-hover/btn:border-primary/20 transition-all">
                {t("penghargaan.viewDetails", "Lihat Butiran")}
              </span>
              <HiArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
