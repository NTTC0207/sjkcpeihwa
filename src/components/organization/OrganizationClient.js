"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@lib/LanguageContext";
import {
  subjects as localSubjects,
  categories as localCategories,
} from "@lib/staffData";
import FilterControls from "@components/organization/FilterControls";
import StaffCard from "@components/organization/StaffCard";
import OrgChart from "@components/organization/OrgChart";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useOrgView } from "@hooks/useOrgView";

export default function OrganizationClient({ initialStaffData }) {
  const { translations, locale } = useLanguage();
  const searchParams = useSearchParams();
  const [view, setView] = useOrgView("chart");

  // Use initial data from server
  const staffData = initialStaffData;

  // States for filtering - local state to avoid unnecessary Firestore requests
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedSubject, setSelectedSubject] = useState(
    searchParams.get("subject") || "All",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );

  // Sync state to URL without triggering server-side re-render
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");

    if (selectedSubject !== "All") params.set("subject", selectedSubject);
    else params.delete("subject");

    if (selectedCategory !== "All") params.set("category", selectedCategory);
    else params.delete("category");

    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;

    // Use replaceState to update URL without triggering Next.js routing/data fetch
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      "",
      newUrl,
    );
  }, [searchTerm, selectedSubject, selectedCategory]);

  const getLocalizedRole = useCallback(
    (staff) => {
      if (locale === "zh") return staff.role_zh;
      if (locale === "ms") return staff.role_ms;
      return staff.role_en || staff.role;
    },
    [locale],
  );

  // Dynamically extract categories from data
  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    staffData.forEach((staff) => {
      if (staff.category) {
        staff.category.split(",").forEach((c) => cats.add(c.trim()));
      }
    });
    return Array.from(cats).sort();
  }, [staffData]);

  // Filter staff data
  const filteredStaff = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return staffData.filter((staff) => {
      const nameMatch =
        (staff.name && staff.name.toLowerCase().includes(searchLower)) ||
        (staff.name_zh && staff.name_zh.includes(searchTerm));

      const roleMatch =
        (staff.role && staff.role.toLowerCase().includes(searchLower)) ||
        (staff.role_ms && staff.role_ms.toLowerCase().includes(searchLower)) ||
        (staff.role_zh && staff.role_zh.includes(searchTerm));

      const matchesSearch = nameMatch || roleMatch;

      const matchesSubject =
        selectedSubject === "All" ||
        (staff.subject && staff.subject.includes(selectedSubject));
      const matchesCategory =
        selectedCategory === "All" ||
        (staff.category &&
          staff.category
            .split(",")
            .map((c) => c.trim())
            .includes(selectedCategory));

      return matchesSearch && matchesSubject && matchesCategory;
    });
  }, [staffData, searchTerm, selectedSubject, selectedCategory]);

  // Build Tree Structure
  const staffTree = useMemo(() => {
    const map = {};
    staffData.forEach((item) => (map[item.id] = { ...item, children: [] }));
    const tree = [];
    staffData.forEach((item) => {
      // Combine parentId and parentIds into a unique list of parent IDs
      const pIds = [
        ...(Array.isArray(item.parentIds) ? item.parentIds : []),
        ...(item.parentId ? [item.parentId] : []),
      ].filter((id, index, self) => id && self.indexOf(id) === index);

      let isAssignedAsChild = false;
      if (pIds.length > 0) {
        pIds.forEach((pId) => {
          if (map[pId]) {
            map[pId].children.push(map[item.id]);
            isAssignedAsChild = true;
          }
        });
      }

      // If no valid parent was found in the map, this node is treated as a root
      if (!isAssignedAsChild) {
        tree.push(map[item.id]);
      }
    });
    return tree;
  }, [staffData]);

  const t = translations.organization;

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col">
      <main className="flex-grow pt-28 pb-10">
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
              {view === "chart"
                ? translations.nav.organization.chart
                : translations.nav.organization.staff}
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
              subjects={localSubjects}
              categories={uniqueCategories}
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
                  <OrgChart staffTree={staffTree} getRole={getLocalizedRole} />
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  {filteredStaff.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredStaff.map((staff, index) => (
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
