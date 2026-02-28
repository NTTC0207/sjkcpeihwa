"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@lib/LanguageContext";
import {
  HiMegaphone,
  HiArrowRight,
  HiArrowLeft,
  HiCalendar,
  HiChevronDown,
  HiCheckCircle,
  HiXMark,
  HiShare,
  HiPaperClip,
  HiDocumentText,
  HiArrowTopRightOnSquare,
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
import {
  db,
  requestNotificationPermission,
  saveFCMToken,
  onForegroundMessage,
} from "@lib/firebase";

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

// INITIAL_LIMIT: how many items the server fetches for ISR
const INITIAL_LIMIT = 20;
// LOAD_MORE_LIMIT: how many items to fetch per "load more" click
const LOAD_MORE_LIMIT = 5;

// Helper: extract year list from announcements data
function buildYearList(data) {
  const years = [
    ...new Set(data.map((a) => a.date?.split("-")[0]).filter(Boolean)),
  ];
  const today = new Date().getFullYear().toString();
  if (!years.includes(today)) years.push(today);
  return years.sort((a, b) => b - a);
}

export default function AnnouncementsClient({
  initialAnnouncements,
  initialCategory,
}) {
  const { translations, locale, isMounted } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe translation helper
  const t = useCallback(
    (key, fallback) => {
      if (!mounted || !isMounted) return fallback;
      const keys = key.split(".");
      let val = translations;
      for (const k of keys) {
        val = val?.[k];
      }
      return val || fallback;
    },
    [translations, mounted, isMounted],
  );

  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(initialCategory || null);
  const categoryMeta = activeCategory ? CATEGORY_META[activeCategory] : null;

  const [announcements, setAnnouncements] = useState(
    initialAnnouncements || [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(
    (initialAnnouncements || []).length === INITIAL_LIMIT,
  );
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [showSubTooltip, setShowSubTooltip] = useState(false);

  // ── Inline detail view ───────────────────────────────────────────────────
  // Holds the announcement object to display in the detail view.
  // null = show list, non-null = show detail inline (no page reload).
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    // Check if user has already granted permission and we have a token
    if (typeof window !== "undefined") {
      const subStatus = localStorage.getItem("fcm_subscribed");
      if (subStatus === "true" && Notification.permission === "granted") {
        setIsSubscribed(true);
      }
    }

    // Set up foreground message listener
    const unsubPromise = onForegroundMessage((payload) => {
      console.log("Foreground message received in Client:", payload);

      // Trigger a NATIVE system notification in foreground
      if (payload.notification && Notification.permission === "granted") {
        const { title, body } = payload.notification;
        const notification = new Notification(title, {
          body: body,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: "announcement-notification",
        });

        notification.onclick = (e) => {
          e.preventDefault();
          const targetUrl = payload.data?.url || "/announcements";
          window.location.href = targetUrl;
          window.focus();
        };
      }
    });

    return () => {
      unsubPromise.then((unsub) => unsub?.());
    };
  }, []);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        // 1. Save token to Firestore (for direct pushes if needed)
        await saveFCMToken(token);

        // 2. Subscribe to topic via API
        const response = await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, topic: "announcements" }),
        });

        if (response.ok) {
          setIsSubscribed(true);
          localStorage.setItem("fcm_subscribed", "true");
          localStorage.setItem("fcm_token", token);
          alert(
            t(
              "announcements.subscribeSuccess",
              "Anda telah berjaya melanggan pengumuman!",
            ),
          );
        } else {
          throw new Error("Failed to subscribe to topic");
        }
      } else {
        alert(
          t(
            "announcements.subscribeDenied",
            "Kebenaran notifikasi ditolak atau tidak disokong.",
          ),
        );
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Gagal melanggan. Sila cuba lagi kemudian.");
    } finally {
      setSubscribing(false);
    }
  };

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

  // Local cache — avoids redundant Firebase reads on category revisits
  // Pre-seeded with server-provided announcements to respect ISR (revalidate=false)
  const dataCacheRef = useRef(null);
  if (!dataCacheRef.current) {
    const initialItems = initialAnnouncements || [];
    dataCacheRef.current = {
      all: {
        items: initialItems,
        lastDoc: null,
        hasMore: initialItems.length === INITIAL_LIMIT,
      },
    };

    // Pre-seed category caches from the ISR batch.
    // If the ISR batch was truncated (== INITIAL_LIMIT), a category's slice may
    // also be truncated, so we conservatively mark hasMore=true so "Load More"
    // remains available.  If the batch was smaller than INITIAL_LIMIT we know
    // we received everything and hasMore stays false.
    const isrTruncated = initialItems.length === INITIAL_LIMIT;
    initialItems.forEach((ann) => {
      if (ann.department) {
        if (!dataCacheRef.current[ann.department]) {
          dataCacheRef.current[ann.department] = {
            items: [],
            lastDoc: null,
            hasMore: isrTruncated, // might have more if ISR batch was full
          };
        }
        dataCacheRef.current[ann.department].items.push(ann);
      }
    });
  }

  const [availableYears, setAvailableYears] = useState(() =>
    buildYearList(initialAnnouncements || []),
  );

  const activeCategoryRef = useRef(activeCategory);
  const announcementsRef = useRef(announcements);
  const lastDocRef = useRef(lastDoc);

  // Sync refs immediately on render to avoid dependency-lag in callbacks
  activeCategoryRef.current = activeCategory;
  announcementsRef.current = announcements;
  lastDocRef.current = lastDoc;

  // Helper to read nested translation keys — memoized so it's stable across renders
  const tNav = t;

  // Core fetch function — stable identity via useCallback.
  // Only called for: (a) first visit to an uncached category, (b) "Load More".
  const fetchAnnouncements = useCallback(
    async (isLoadMore = false, catOverride = null) => {
      const targetCategory =
        catOverride !== null ? catOverride : activeCategoryRef.current;
      const cacheKey = targetCategory || "all";

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setAnnouncements([]);
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

        // Always exclude Kunjung Khidmat Bantu from the general announcements views
        // as it has its own dedicated page.
        constraints.unshift(
          where("badge", "in", [
            "Penting",
            "Acara",
            "Mesyuarat",
            "Cuti",
            "Berita",
            "Notis",
            "Pekeliling",
          ]),
        );

        if (targetCategory) {
          constraints.unshift(where("department", "==", targetCategory));
        }

        if (isLoadMore) {
          let cursor = lastDocRef.current;
          if (!cursor && announcementsRef.current.length > 0) {
            const lastItem =
              announcementsRef.current[announcementsRef.current.length - 1];
            const docRef = doc(db, "announcement", lastItem.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              cursor = docSnap;
              lastDocRef.current = docSnap;
            }
          }
          if (cursor) constraints.push(startAfter(cursor));
        }

        const q = query(collection(db, "announcement"), ...constraints);
        const querySnapshot = await getDocs(q);

        // Discard stale results if the user changed category mid-flight
        if (
          activeCategoryRef.current !== targetCategory &&
          catOverride === null
        ) {
          return;
        }

        const lastVisible =
          querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const newItems = isLoadMore
          ? [...announcementsRef.current, ...data]
          : data;
        const more = querySnapshot.docs.length === batchSize;

        setAnnouncements(newItems);
        setLastDoc(lastVisible);
        setHasMore(more);
        lastDocRef.current = lastVisible;

        // Persist to cache
        dataCacheRef.current[cacheKey] = {
          items: newItems,
          lastDoc: lastVisible,
          hasMore: more,
        };

        // update years only when not loading more (avoid extra recalc)
        if (!isLoadMore) {
          setAvailableYears(buildYearList(newItems));
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        if (!isLoadMore) setLoading(false);
        setLoadingMore(false);
      }
    },
    [], // deliberately empty — uses refs for mutable state
  );

  // Category switch handler — stable identity
  const handleCategoryChange = useCallback(
    (newCat) => {
      if (newCat === activeCategoryRef.current) return;

      const url = newCat
        ? `/announcements?category=${newCat}`
        : "/announcements";

      // Use Next.js router for consistent state management
      router.push(url, { scroll: false });

      setActiveCategory(newCat);
      setSelectedYear("all");
      activeCategoryRef.current = newCat;

      const cacheKey = newCat || "all";
      let cached = dataCacheRef.current[cacheKey];

      // ── ISR-first strategy ────────────────────────────────────────────────
      // If the specific category wasn't pre-seeded but we DO have the full
      // "all" ISR batch, derive the category slice from it client-side.
      // This avoids a Firebase round-trip for data already delivered by ISR.
      if ((!cached || cached.items.length === 0) && newCat) {
        const allCached = dataCacheRef.current["all"];
        if (allCached && allCached.items.length > 0) {
          const filtered = allCached.items.filter(
            (a) => a.department === newCat,
          );
          // Only skip Firebase if the ISR batch was NOT truncated (we have all
          // data) OR the filter returned some results (good enough to show).
          if (!allCached.hasMore || filtered.length > 0) {
            cached = {
              items: filtered,
              lastDoc: null,
              // If ISR was truncated there may be more category-specific items
              hasMore: allCached.hasMore,
            };
            dataCacheRef.current[cacheKey] = cached;
          }
        }
      }

      if (cached && cached.items.length > 0) {
        setAnnouncements(cached.items);
        setLastDoc(cached.lastDoc);
        setHasMore(cached.hasMore);
        lastDocRef.current = cached.lastDoc;
        setAvailableYears(buildYearList(cached.items));
      } else {
        // Only reaches Firebase if category truly has no items in the ISR seed
        fetchAnnouncements(false, newCat);
      }
    },
    [fetchAnnouncements, router],
  );

  // ─── React to URL ?category= changes ─────────────────────────────────────
  useEffect(() => {
    const urlCategory = searchParams.get("category") || null;

    // Only sync if there's a real mismatch between URL and state
    if (urlCategory !== activeCategoryRef.current) {
      handleCategoryChange(urlCategory);
    }
  }, [searchParams, handleCategoryChange]);

  // ─── Selection Logic (No-Flick History Management) ──────────────────────
  // We use window.history directly for detail views to avoid Next.js route
  // transition flickers, while maintaining shareable URLs and back-button.

  const handleSelectAnnouncement = useCallback((announcement) => {
    setSelectedAnnouncement(announcement);
    window.history.pushState(
      { announcementId: announcement.id },
      "",
      `/announcements/${announcement.id}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedAnnouncement(null);
    const cat = activeCategoryRef.current;
    const url = cat ? `/announcements?category=${cat}` : "/announcements";
    window.history.pushState({ category: cat }, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const idMatch = path.match(/^\/announcements\/(.+)$/);

      if (idMatch) {
        const id = idMatch[1];
        // Check current list or cache for the item to show it instantly
        let found = announcementsRef.current.find((a) => a.id === id);
        if (!found && dataCacheRef.current) {
          Object.values(dataCacheRef.current).some((cache) => {
            found = cache.items.find((a) => a.id === id);
            return !!found;
          });
        }

        if (found) {
          setSelectedAnnouncement(found);
        } else {
          // If not in cache, we let Next.js handle a fresh load
          window.location.reload();
        }
      } else {
        setSelectedAnnouncement(null);
        // If we returned to the list, sync the category filter from URL if needed
        const params = new URLSearchParams(window.location.search);
        const cat = params.get("category") || null;
        if (cat !== activeCategoryRef.current) {
          setActiveCategory(cat);
          activeCategoryRef.current = cat;
          const cached = dataCacheRef.current?.[cat || "all"];
          if (cached) setAnnouncements(cached.items);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Compute filtered list once — avoid triple inline filter in JSX
  const filteredAnnouncements = useMemo(() => {
    let items = announcements;
    if (selectedYear !== "all") {
      items = items.filter((a) => a.date?.startsWith(selectedYear));
    }
    if (selectedMonth !== "all") {
      items = items.filter((a) => a.date?.split("-")[1] === selectedMonth);
    }
    return items;
  }, [announcements, selectedYear, selectedMonth]);

  if (loading && announcements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ── Inline detail view ───────────────────────────────────────────────────
  if (selectedAnnouncement) {
    const ann = selectedAnnouncement;
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <button
                onClick={handleBackToList}
                className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors"
              >
                <HiArrowLeft className="mr-2" />
                {t("penghargaan.backToList", "Back to List")}
              </button>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {/* Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-t-[3rem] p-8 pb-0 shadow-sm border-x border-t border-gray-100"
              >
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span
                    className={`text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-full text-white ${
                      ann.badgeColor || "bg-primary"
                    }`}
                  >
                    {ann.badge}
                  </span>
                  <span className="flex items-center text-gray-500 font-medium">
                    <HiCalendar className="mr-2 w-5 h-5 text-primary/60" />
                    {ann.date}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-6 leading-tight">
                  {ann.title}
                </h1>

                <div className="flex items-center justify-between py-6 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">
                        SJKC Pei Hwa
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-b-[3rem] p-8 pt-0 md:px-12 shadow-xl border-x border-b border-gray-100 mb-12"
              >
                <div className="overflow-x-auto pt-8">
                  <div
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: ann.content }}
                  />
                </div>

                {/* Attachments */}
                {ann.attachments?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <HiPaperClip className="w-4 h-4" />
                      Attachments ({ann.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {ann.attachments.map((att, i) => (
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
                <button
                  onClick={handleBackToList}
                  className="btn-primary-accent"
                >
                  {t("penghargaan.viewMore", "View More")}
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
          {/* Header */}
          <div className="text-center mb-16">
            {/* Category breadcrumb */}
            {categoryMeta && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  {t("announcements.title", "Pengumuman")}
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
                ? tNav(categoryMeta.labelKey, categoryMeta.fallback)
                : t("announcements.title", "Pengumuman")}
            </h1>
            <div
              className={`w-20 h-1.5 mx-auto rounded-full mb-6 ${
                categoryMeta ? categoryMeta.color : "bg-accent-yellow"
              }`}
            />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {t("announcements.subtitle", "Berita dan pengumuman terkini.")}
            </p>

            {/* Removed the large subscription section from here */}

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
                {t("announcements.allYears", "All")}
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
              <div className="flex flex-wrap items-center gap-6">
                {/* Year Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {t("announcements.filterYear", "Tahun")}
                  </span>
                  <div className="relative inline-block w-40">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <option value="all">
                        {t("announcements.allYears", "Semua Tahun")}
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

                {/* Month Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {t("announcements.filterMonth", "Bulan")}
                  </span>
                  <div className="relative inline-block w-40">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <option value="all">
                        {t("announcements.allMonths", "Semua Bulan")}
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
              {filteredAnnouncements.length}{" "}
              {t("announcements.title", "Pengumuman")}
            </div>
          </div>

          {/* Listing */}
          <div className="grid gap-6 max-w-4xl mx-auto">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                locale={locale}
                t={t}
                isMounted={isMounted}
                onSelect={handleSelectAnnouncement}
              />
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-neutral-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiCalendar className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">
                  {t(
                    "announcements.noAnnouncements",
                    "No announcements found for this year",
                  )}
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
                        {t(
                          "announcements.loadMore",
                          "Request More Announcements",
                        )}
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

      {/* Floating Subscription Button */}
      <div className="fixed bottom-8 right-8 z-[90]">
        <div className="relative">
          {/* Tooltip-like status message */}
          <div
            className={`absolute bottom-full right-0 mb-4 w-64 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-300 transform ${
              showSubTooltip
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible translate-y-2"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Notifikasi
              </p>
              <button
                onClick={() => setShowSubTooltip(false)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              {isSubscribed
                ? t("announcements.subscribeStatus", "Anda sudah melanggan.")
                : t("announcements.subtitle", "Berita dan pengumuman terkini.")}
            </p>
            <button
              onClick={async () => {
                await handleSubscribe();
                setShowSubTooltip(false);
              }}
              disabled={subscribing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSubscribed
                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                  : "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20"
              }`}
            >
              {subscribing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isSubscribed ? (
                <>
                  <HiCheckCircle className="w-4 h-4" />
                  {t("announcements.subscribed", "Sudah Dilanggan")}
                </>
              ) : (
                <>
                  <HiMegaphone className="w-4 h-4" />
                  {t("announcements.subscribeAction", "Langgan")}
                </>
              )}
            </button>
          </div>

          {/* The actual floating button */}
          <button
            onClick={() => setShowSubTooltip(!showSubTooltip)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              isSubscribed
                ? "bg-white text-green-500 border-2 border-green-500/20"
                : "bg-primary text-white"
            }`}
          >
            {isSubscribed ? (
              <HiCheckCircle className="w-7 h-7" />
            ) : (
              <HiMegaphone className="w-7 h-7" />
            )}
            {/* Red dot if not subscribed */}
            {!isSubscribed && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Extracted & Memoized card component ────────────────────────────────────
// Prevents individual cards from re-rendering when unrelated state (e.g.
// selectedYear counter, loadingMore, hasMore) changes at the list level.
const AnnouncementCard = ({ announcement, locale, t, isMounted, onSelect }) => {
  // Parse date once at card-creation time, not on every parent render
  const monthLabel = useMemo(() => {
    if (!announcement.date) return "";
    // Use a stable locale during hydration to match server (ms -> en-US)
    const activeLocale = !isMounted
      ? "en-US"
      : locale === "zh"
        ? "zh-CN"
        : "en-US";
    return new Date(announcement.date).toLocaleString(activeLocale, {
      month: "short",
    });
  }, [announcement.date, locale, isMounted]);

  const dayLabel = announcement.date?.split("-")[2];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <button
        onClick={() => onSelect(announcement)}
        className="w-full text-left flex flex-col md:flex-row gap-0"
      >
        {/* Thumbnail Area */}
        <div className="w-full md:w-56 h-[200px] md:h-[285px] shrink-0 overflow-hidden bg-neutral-bg relative">
          {announcement.image ? (
            <>
              <img
                src={announcement.image}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={announcement.title}
                loading="lazy"
                decoding="async"
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
                  {dayLabel}
                </span>
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
                  {monthLabel}
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
                {t("announcements.readMore", "Read More")}
              </span>
              <HiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
