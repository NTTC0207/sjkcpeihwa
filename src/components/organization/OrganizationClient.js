"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useOrgView("chart");

  // Use initial data from server
  const staffData = initialStaffData;

  // States for filtering - synced with URL search query
  const searchTerm = searchParams.get("search") || "";
  const selectedSubject = searchParams.get("subject") || "All";
  const selectedCategory = searchParams.get("category") || "All";

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
    return staffData.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.name_zh && staff.name_zh.includes(searchTerm)) ||
        (staff.role &&
          staff.role.toLowerCase().includes(searchTerm.toLowerCase()));
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
