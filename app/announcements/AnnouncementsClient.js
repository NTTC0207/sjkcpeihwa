"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import {
  HiMegaphone,
  HiArrowRight,
  HiCalendar,
  HiChevronDown,
  HiCheckCircle,
  HiXMark,
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

// Toast notification component for client side
function ClientToast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${
        type === "success" ? "bg-primary" : "bg-red-600"
      }`}
    >
      <HiMegaphone className="w-5 h-5 shrink-0" />
      <div className="flex flex-col">
        <span className="leading-tight">{message.title}</span>
        {message.body && (
          <span className="text-[10px] opacity-80 font-normal mt-0.5">
            {message.body}
          </span>
        )}
      </div>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <HiXMark className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AnnouncementsClient({
  initialAnnouncements,
  initialCategory,
}) {
  const { translations, locale } = useLanguage();
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
            translations.announcements.subscribeSuccess ||
              "Anda telah berjaya melanggan pengumuman!",
          );
        } else {
          throw new Error("Failed to subscribe to topic");
        }
      } else {
        alert(
          translations.announcements.subscribeDenied ||
            "Kebenaran notifikasi ditolak atau tidak disokong.",
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
  // Always seed under "all" because server always fetches without category filter (ISR)
  const dataCacheRef = useRef({
    all: {
      items: initialAnnouncements || [],
      lastDoc: null,
      hasMore: (initialAnnouncements || []).length === INITIAL_LIMIT,
    },
  });

  const [availableYears, setAvailableYears] = useState(() =>
    buildYearList(initialAnnouncements || []),
  );

  const activeCategoryRef = useRef(activeCategory);
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  // Stable reference to announcements for the load-more cursor
  const announcementsRef = useRef(announcements);
  useEffect(() => {
    announcementsRef.current = announcements;
  }, [announcements]);

  const lastDocRef = useRef(lastDoc);
  useEffect(() => {
    lastDocRef.current = lastDoc;
  }, [lastDoc]);

  // Helper to read nested translation keys — memoized so it's stable across renders
  const tNav = useCallback(
    (key, fallback) => {
      const keys = key.split(".");
      let value = translations;
      for (const k of keys) value = value?.[k];
      return value || fallback;
    },
    [translations],
  );

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

        if (targetCategory) {
          constraints.unshift(where("department", "==", targetCategory));
        } else {
          // Exclude Kunjung Khidmat Bantu using 'in' filter for the "All" view
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
      window.history.pushState({ category: newCat }, "", url);
      setActiveCategory(newCat);
      setSelectedYear("all");
      activeCategoryRef.current = newCat;

      const cacheKey = newCat || "all";
      const cached = dataCacheRef.current[cacheKey];
      if (cached) {
        setAnnouncements(cached.items);
        setLastDoc(cached.lastDoc);
        setHasMore(cached.hasMore);
        lastDocRef.current = cached.lastDoc;
        setAvailableYears(buildYearList(cached.items));
      } else {
        fetchAnnouncements(false, newCat);
      }
    },
    [fetchAnnouncements],
  );

  // ─── React to URL ?category= changes ─────────────────────────────────────
  // This fires on:
  //   (a) first mount — applies the category from the URL (e.g. navbar link)
  //   (b) every Next.js navigation that changes searchParams (navbar, back/forward)
  // Using searchParams (from useSearchParams) means we never rely on the
  // always-null initialCategory prop the server passes for ISR.
  useEffect(() => {
    const urlCategory = searchParams.get("category") || null;

    if (urlCategory === activeCategoryRef.current) {
      // Same category — just make sure we have data displayed (first mount)
      if (announcements.length === 0 && !loading) {
        const cacheKey = urlCategory || "all";
        const cached = dataCacheRef.current[cacheKey];
        if (cached && cached.items.length > 0) {
          setAnnouncements(cached.items);
          setLastDoc(cached.lastDoc);
          setHasMore(cached.hasMore);
          setAvailableYears(buildYearList(cached.items));
        } else {
          fetchAnnouncements(false, urlCategory);
        }
      }
      return;
    }

    // Category changed — apply it (handleCategoryChange reads cache or fetches)
    handleCategoryChange(urlCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  // NOTE: intentionally omitting handleCategoryChange & fetchAnnouncements from
  // deps — both are stable useCallback refs; adding them would cause double-fires.

  // Handle browser back/forward — stable: no deps that change frequently
  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      handleCategoryChange(cat);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [handleCategoryChange]); // handleCategoryChange is stable (useCallback with empty deps chain)

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
                  {translations?.announcements?.title || "Pengumuman"}
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
                : translations?.announcements?.title || "Pengumuman"}
            </h1>
            <div
              className={`w-20 h-1.5 mx-auto rounded-full mb-6 ${
                categoryMeta ? categoryMeta.color : "bg-accent-yellow"
              }`}
            />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {translations?.announcements?.subtitle ||
                "Berita dan pengumuman terkini."}
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
                {translations?.announcements?.allYears
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
              <div className="flex flex-wrap items-center gap-6">
                {/* Year Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {translations.announcements.filterYear}
                  </span>
                  <div className="relative inline-block w-40">
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

                {/* Month Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {translations.announcements.filterMonth}
                  </span>
                  <div className="relative inline-block w-40">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <option value="all">
                        {translations.announcements.allMonths}
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
              {filteredAnnouncements.length} {translations.announcements.title}
            </div>
          </div>

          {/* Listing */}
          <div className="grid gap-6 max-w-4xl mx-auto">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                locale={locale}
                translations={translations}
              />
            ))}

            {filteredAnnouncements.length === 0 && (
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
                ? translations.announcements.subscribeStatus
                : translations.announcements.subtitle}
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
                  {translations.announcements.subscribed}
                </>
              ) : (
                <>
                  <HiMegaphone className="w-4 h-4" />
                  {translations.announcements.subscribeAction}
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
const AnnouncementCard = ({ announcement, locale, translations }) => {
  // Parse date once at card-creation time, not on every parent render
  const monthLabel = useMemo(() => {
    if (!announcement.date) return "";
    return new Date(announcement.date).toLocaleString(
      locale === "zh" ? "zh-CN" : "en-US",
      { month: "short" },
    );
  }, [announcement.date, locale]);

  const dayLabel = announcement.date?.split("-")[2];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <Link
        href={`/announcements/${announcement.id}`}
        className="flex flex-col md:flex-row gap-0"
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
                {translations?.announcements?.readMore}
              </span>
              <HiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
