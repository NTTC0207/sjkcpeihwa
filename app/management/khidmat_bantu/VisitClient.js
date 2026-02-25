"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

// INITIAL_LIMIT: how many items the server fetches for ISR
const INITIAL_LIMIT = 20;
// LOAD_MORE_LIMIT: how many items to fetch per "load more" click
const LOAD_MORE_LIMIT = 5;

// Helper: extract year list from data
function buildYearList(data) {
  const years = [
    ...new Set(data.map((a) => a.date?.split("-")[0]).filter(Boolean)),
  ];
  const today = new Date().getFullYear().toString();
  if (!years.includes(today)) years.push(today);
  return years.sort((a, b) => b - a);
}

export default function VisitClient({ initialItems }) {
  const { translations, locale } = useLanguage();

  const [items, setItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(
    (initialItems || []).length === INITIAL_LIMIT,
  );
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [showSubTooltip, setShowSubTooltip] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const subStatus = localStorage.getItem("fcm_subscribed");
      if (subStatus === "true" && Notification.permission === "granted") {
        setIsSubscribed(true);
      }
    }

    const unsubPromise = onForegroundMessage((payload) => {
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
        await saveFCMToken(token);
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
      }
    } catch (error) {
      console.error("Subscription error:", error);
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

  const [availableYears, setAvailableYears] = useState(() =>
    buildYearList(initialItems || []),
  );

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const lastDocRef = useRef(lastDoc);
  useEffect(() => {
    lastDocRef.current = lastDoc;
  }, [lastDoc]);

  const fetchData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setItems([]);
      setLastDoc(null);
      lastDocRef.current = null;
    }

    try {
      const batchSize = isLoadMore ? LOAD_MORE_LIMIT : INITIAL_LIMIT;
      const constraints = [
        where("badge", "==", "Kunjung Khidmat Bantu"),
        orderBy("date", "desc"),
        orderBy("__name__", "desc"),
        limit(batchSize),
      ];

      if (isLoadMore) {
        let cursor = lastDocRef.current;
        if (!cursor && itemsRef.current.length > 0) {
          const lastItem = itemsRef.current[itemsRef.current.length - 1];
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

      const lastVisible =
        querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const newItems = isLoadMore ? [...itemsRef.current, ...data] : data;
      const more = data.length === batchSize;

      setItems(newItems);
      setLastDoc(lastVisible);
      setHasMore(more);
      lastDocRef.current = lastVisible;

      if (!isLoadMore) {
        setAvailableYears(buildYearList(newItems));
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
    } finally {
      if (!isLoadMore) setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedYear !== "all") {
      list = list.filter((a) => a.date?.startsWith(selectedYear));
    }
    if (selectedMonth !== "all") {
      list = list.filter((a) => a.date?.split("-")[1] === selectedMonth);
    }
    return list;
  }, [items, selectedYear, selectedMonth]);

  if (loading && items.length === 0) {
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
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              {translations?.nav?.management?.visit ||
                "Lawatan & Khidmat Bantu"}
            </h1>
            <div className="w-20 h-1.5 mx-auto rounded-full mb-6 bg-yellow-500" />

            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              {locale === "zh"
                ? "由各界人士和机构提供的探访与协助，旨在提升学生的福利和学校的设施。"
                : "Aktiviti kunjung khidmat bantu daripada pelbagai pihak bagi menyokong kebajikan murid dan pembangunan sekolah."}
            </p>
          </div>

          {/* Filters */}
          <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {translations?.announcements?.filterYear || "Tahun"}
                </span>
                <div className="relative inline-block w-40">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm"
                  >
                    <option value="all">
                      {translations?.announcements?.allYears || "Semua Tahun"}
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

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {translations?.announcements?.filterMonth || "Bulan"}
                </span>
                <div className="relative inline-block w-40">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm"
                  >
                    <option value="all">
                      {translations?.announcements?.allMonths || "Semua Bulan"}
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

            <div className="text-sm text-gray-400 font-medium">
              {filteredItems.length}{" "}
              {translations?.nav?.management?.visit || "Lawatan"}
            </div>
          </div>

          {/* Listing */}
          <div className="grid gap-6 max-w-4xl mx-auto">
            {filteredItems.map((item) => (
              <VisitCard
                key={item.id}
                item={item}
                locale={locale}
                translations={translations}
              />
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-neutral-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiCalendar className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">
                  {translations?.announcements?.noAnnouncements ||
                    "Tiada rekod ditemui."}
                </h3>
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => fetchData(true)}
                  disabled={loadingMore}
                  className="group relative flex items-center gap-3 px-8 py-4 bg-white border-2 border-primary/10 rounded-2xl text-primary font-bold hover:border-primary/30 hover:bg-neutral-bg transition-all duration-300 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>
                        {translations?.announcements?.loadMore || "Lihat Lagi"}
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

const VisitCard = ({ item, locale, translations }) => {
  const monthLabel = useMemo(() => {
    if (!item.date) return "";
    return new Date(item.date).toLocaleString(
      locale === "zh" ? "zh-CN" : "en-US",
      { month: "short" },
    );
  }, [item.date, locale]);

  const dayLabel = item.date?.split("-")[2];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <Link
        href={`/announcements/${item.id}`}
        className="flex flex-col md:flex-row gap-0"
      >
        <div className="w-full md:w-56 h-[200px] md:h-[285px] shrink-0 overflow-hidden bg-neutral-bg relative">
          {item.image ? (
            <>
              <img
                src={item.image}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={item.title}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group-hover:bg-primary/[0.02] transition-colors duration-500">
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
              <HiMegaphone className="absolute bottom-3 right-3 w-8 h-8 text-primary/5 -rotate-12" />
            </div>
          )}
        </div>

        <div className="flex-grow p-6 md:p-8 flex flex-col">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg text-white ${item.badgeColor || "bg-primary"}`}
            >
              {item.badge}
            </span>
            <span className="flex items-center text-sm text-gray-400 font-medium">
              <HiCalendar className="mr-1.5 w-4 h-4 text-primary/40" />
              {item.date}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-display font-bold text-primary mb-3 group-hover:text-primary-dark transition-colors line-clamp-2 leading-tight">
            {item.title}
          </h2>

          <p className="text-gray-500 line-clamp-2 text-sm md:text-base leading-relaxed mb-6">
            {item.summary}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center text-primary font-bold text-sm tracking-tight group-hover:gap-1 transition-all">
              <span className="border-b-2 border-primary/0 group-hover:border-primary/20 transition-all">
                {translations?.announcements?.readMore || "Baca Selengkapnya"}
              </span>
              <HiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
