"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import {
  HiTrophy,
  HiCalendar,
  HiChevronDown,
  HiChevronRight,
  HiAcademicCap,
  HiUserGroup,
  HiStar,
  HiArrowRight,
} from "react-icons/hi2";

const CATEGORY_META = {
  Akademik: {
    key: "Akademik",
    labelKey: "penghargaan.categories.Akademik",
    fallback: "Akademik",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600",
    icon: <HiAcademicCap className="w-6 h-6" />,
  },
  Sukan: {
    key: "Sukan",
    labelKey: "penghargaan.categories.Sukan",
    fallback: "Sukan",
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    textColor: "text-orange-600",
    icon: <HiTrophy className="w-6 h-6" />,
  },
  "Ko-Kurikulum": {
    key: "Ko-Kurikulum",
    labelKey: "penghargaan.categories.Ko-Kurikulum",
    fallback: "Ko-Kurikulum",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    icon: <HiUserGroup className="w-6 h-6" />,
  },
  "Seni & Kebudayaan": {
    key: "Seni & Kebudayaan",
    labelKey: "penghargaan.categories.Seni & Kebudayaan",
    fallback: "Seni & Kebudayaan",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-600",
    icon: <HiStar className="w-6 h-6" />,
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

export default function PenghargaanClient({ initialAwards }) {
  const { translations, locale } = useLanguage();
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const years = useMemo(() => {
    const y = [
      ...new Set(initialAwards.map((a) => a.date?.split("-")[0])),
    ].filter(Boolean);
    return y.sort((a, b) => b - a);
  }, [initialAwards]);

  const filteredAwards = useMemo(() => {
    return initialAwards.filter((a) => {
      const matchYear =
        selectedYear === "all" || a.date?.startsWith(selectedYear);
      const matchCat =
        selectedCategory === "all" || a.category === selectedCategory;
      return matchYear && matchCat;
    });
  }, [initialAwards, selectedYear, selectedCategory]);

  const t = useCallback(
    (key, fallback) => {
      const keys = key.split(".");
      let value = translations;
      for (const k of keys) value = value?.[k];
      return value || fallback;
    },
    [translations],
  );

  const categoryMeta =
    selectedCategory !== "all" ? CATEGORY_META[selectedCategory] : null;

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
                  onClick={() => setSelectedCategory("all")}
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
                "Meraikan kecemerlangan dan kejayaan murid-murid SJK(C) Pei Hwa dalam pelbagai bidang.",
              )}
            </p>

            {/* Category filter tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === "all"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {t("penghargaan.all", "Semua")}
              </button>
              {Object.values(CATEGORY_META).map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === cat.key
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
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {t("penghargaan.yearLabel", "Tahun")}
                </span>
                <div className="relative inline-block w-48">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <option value="all">
                      {t("penghargaan.allYears", "Semua Tahun")}
                    </option>
                    {years.map((y) => (
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
                awardId={award.id}
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
                <p className="text-gray-400 mt-2">
                  {t(
                    "penghargaan.tryAgain",
                    "Sila cuba tapis mengikut tahun atau kategori lain.",
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const AwardCard = ({ award, locale, translations, t, awardId }) => {
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
      <div className="flex flex-col md:flex-row gap-0">
        {/* Thumbnail Area */}
        <div className="w-full md:w-56 h-48 md:h-auto shrink-0 overflow-hidden bg-neutral-bg relative">
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

              {/* Category Icon Watermark */}
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
            <Link
              href={`/penghargaan/${awardId}`}
              className="flex items-center text-primary font-bold text-sm tracking-tight group/btn hover:gap-1 transition-all"
            >
              <span className="border-b-2 border-primary/0 group-hover/btn:border-primary/20 transition-all">
                {t("penghargaan.viewDetails", "Lihat Butiran")}
              </span>
              <HiArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
