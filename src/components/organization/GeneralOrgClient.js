"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@lib/LanguageContext";
import FilterControls from "@components/organization/FilterControls";
import StaffCard from "@components/organization/StaffCard";
import OrgChart from "@components/organization/OrgChart";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useOrgView } from "@hooks/useOrgView";

export default function GeneralOrgClient({
  initialData,
  translationKey = "organization",
  showFilters = true,
}) {
  const { translations, locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useOrgView("chart");

  // Use initial data from server
  const data = initialData;

  // States for filtering - synced with URL search query
  const searchTerm = searchParams.get("search") || "";
  const selectedSubject = searchParams.get("subject") || "All";
  const selectedCategory = searchParams.get("category") || "All";

  const t = translations[translationKey];

  // Filter setters that update the URL
  const updateQuery = useCallback(
    (key, value, replace = true) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "All") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const queryString = params.toString();
      const url = queryString ? `?${queryString}` : window.location.pathname;

      if (replace) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }
    },
    [router, searchParams],
  );

  const setSearchTerm = (val) => updateQuery("search", val, true);
  const setSelectedSubject = (val) => updateQuery("subject", val, false);
  const setSelectedCategory = (val) => updateQuery("category", val, false);

  const getLocalizedRole = (staff) => {
    if (locale === "zh") return staff.role_zh;
    if (locale === "ms") return staff.role_ms;
    return staff.role_en || staff.role;
  };

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.name_zh && item.name_zh.includes(searchTerm)) ||
        (item.role &&
          item.role.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSubject =
        selectedSubject === "All" ||
        (item.subject && item.subject.includes(selectedSubject));

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesSubject && matchesCategory;
    });
  }, [data, searchTerm, selectedSubject, selectedCategory]);

  // Build Tree Structure
  const treeData = useMemo(() => {
    const map = {};
    data.forEach((item) => (map[item.id] = { ...item, children: [] }));
    const tree = [];
    data.forEach((item) => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else if (!item.parentId) {
        tree.push(map[item.id]);
      }
    });
    return tree;
  }, [data]);

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col">
      <main className="flex-grow pt-28 pb-16">
        <div
          className={
            view === "chart"
              ? "w-full max-w-none px-4 sm:px-6 lg:px-12"
              : "container-custom"
          }
        >
          <header className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold text-primary mb-4"
            >
              {t.title}
            </motion.h1>
            <div className="w-20 h-1.5 bg-accent-yellow mx-auto rounded-full mb-6"></div>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              {t.subtitle}
            </motion.p>
          </header>

          {view === "grid" && (
            <FilterControls
              t={t}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              view={view}
              setView={setView}
              subjects={showFilters ? [] : null} // Can pass subjects if needed
              categories={showFilters ? [] : null}
              showAdvanced={showFilters}
            />
          )}

          <div className="relative">
            <AnimatePresence mode="wait">
              {view === "chart" ? (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex justify-center mb-8">
                    <button
                      onClick={() => setView("grid")}
                      className="px-6 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-primary font-bold hover:bg-primary hover:text-white transition-all"
                    >
                      {t.gridView}
                    </button>
                  </div>
                  <OrgChart staffTree={treeData} getRole={getLocalizedRole} />
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex justify-center mb-8">
                    <button
                      onClick={() => setView("chart")}
                      className="px-6 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-primary font-bold hover:bg-primary hover:text-white transition-all"
                    >
                      {t.chartView}
                    </button>
                  </div>
                  {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredData.map((staff, index) => (
                        <StaffCard
                          key={staff.id}
                          staff={staff}
                          getRole={getLocalizedRole}
                          index={index}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <HiMagnifyingGlass className="w-10 h-10" />
                      </div>
                      <p className="text-gray-500 text-lg">{t.noResults}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
