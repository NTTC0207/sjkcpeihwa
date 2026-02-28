"use client";

import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@lib/LanguageContext";
import {
  HiCalendar,
  HiXMark,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_META = {
  bangunan: {
    key: "bangunan",
    labelKey: "nav.management.new_building",
    color: "bg-yellow-500",
    lightColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    icon: "🏗️",
  },
  penyelenggaraan: {
    key: "penyelenggaraan",
    labelKey: "nav.management.maintenance",
    color: "bg-yellow-500",
    lightColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    icon: "🛠️",
  },
};

export default function TimelineClient({ initialItems, category }) {
  const { translations, locale } = useLanguage();
  const [items] = useState(initialItems || []);
  const [selectedItem, setSelectedItem] = useState(null);
  const categoryMeta = CATEGORY_META[category] || CATEGORY_META.bangunan;

  const tNav = (key, fallback) => {
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) {
      if (!value) break;
      value = value?.[k];
    }
    return value || fallback;
  };

  const groupedItems = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const year = item.date?.split("-")[0] || "Unknown";
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });
    return Object.entries(groups).sort((a, b) => b[0] - a[0]);
  }, [items]);

  // Handle body scroll locking when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedItem]);

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="container-custom">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            {tNav(categoryMeta.labelKey, category)}
          </h1>
          <div className="w-20 h-1.5 mx-auto rounded-full mb-6 bg-yellow-500" />
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            {locale === "zh"
              ? "记录学校在基建与各项维护工程中的点滴进展，共同见证培华校园的华丽蜕变。"
              : "Merakam setiap detik kemajuan dalam pembangunan infrastruktur dan pelbagai projek penyelenggaraan sekolah, menyaksikan transformasi kampus Pei Hwa."}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 mt-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <HiCalendar className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              {locale === "zh" ? "即将上线" : "Akan Datang"}
            </h3>
            <p className="text-gray-400">
              {locale === "zh"
                ? "目前暂无相关记录。"
                : "Tiada rekod perkembangan buat masa ini."}
            </p>
          </div>
        ) : (
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-100 -translate-x-1/2 hidden md:block" />

            {groupedItems.map(([year, yearItems]) => (
              <div key={year} className="mb-16 last:mb-0">
                <div className="relative z-10 flex justify-center mb-10">
                  <div
                    className={`px-8 py-2 rounded-full text-white font-black text-xl shadow-lg ${categoryMeta.color} border-4 border-white`}
                  >
                    {year}
                  </div>
                </div>

                <div className="space-y-8 md:space-y-0">
                  {yearItems.map((item, idx) => (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      isLeft={idx % 2 === 0}
                      colorClass={categoryMeta.color}
                      locale={locale}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            colorClass={categoryMeta.color}
            locale={locale}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TimelineItem({ item, isLeft, colorClass, locale, onClick }) {
  // Support both single image and multiple images
  const images = useMemo(() => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    }
    return item.image ? [item.image] : [];
  }, [item.image, item.images]);

  const [currentImg, setCurrentImg] = useState(0);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className={`relative flex flex-col md:flex-row items-center justify-between mb-12 md:mb-16 last:mb-0 ${isLeft ? "md:flex-row-reverse" : ""}`}
    >
      <div
        className={`absolute left-1/2 top-10 w-4 h-4 rounded-full border-4 border-white shadow-md z-20 -translate-x-1/2 hidden md:block ${colorClass}`}
      />

      <div className="w-full md:w-[46%]">
        <motion.div
          whileHover={{ y: -4 }}
          onClick={onClick}
          className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group"
        >
          {images.length > 0 && (
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img
                src={images[currentImg]}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                  >
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="absolute bottom-3 right-4">
                <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold rounded-full">
                  {currentImg + 1} / {images.length}
                </span>
              </div>
            </div>
          )}

          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-white ${colorClass}`}
              >
                {item.date}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 leading-tight group-hover:text-primary-dark transition-colors line-clamp-2">
              {locale === "zh" && item.titleZh ? item.titleZh : item.title}
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-2">
              {locale === "zh" && (item.summaryZh || item.contentZh)
                ? item.summaryZh || item.contentZh?.replace(/<[^>]*>/g, "")
                : item.summary || item.content?.replace(/<[^>]*>/g, "")}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden md:block w-8 shrink-0" />
      <div className="hidden md:block md:w-[46%]" />
    </div>
  );
}

function DetailModal({ item, onClose, colorClass, locale }) {
  const images = useMemo(() => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    }
    return item.image ? [item.image] : [];
  }, [item.image, item.images]);

  const [activeImg, setActiveImg] = useState(images[0] || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-6xl h-full max-h-[85vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white md:text-gray-400 md:bg-gray-100 md:hover:bg-gray-200 transition-all"
        >
          <HiXMark className="w-6 h-6" />
        </button>

        {/* Left Side: Images */}
        <div className="w-full md:w-3/5 bg-gray-100 relative flex flex-col">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={activeImg}
                className="w-full h-full object-contain"
              />
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <div className="p-4 bg-white/80 backdrop-blur-md overflow-x-auto flex gap-3 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === img ? "border-primary scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Message/Details */}
        <div className="w-full md:w-2/5 p-8 md:p-10 overflow-y-auto flex flex-col">
          <div className="mb-6">
            <span
              className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white mb-4 ${colorClass}`}
            >
              {item.date}
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-primary leading-tight">
              {locale === "zh" && item.titleZh ? item.titleZh : item.title}
            </h2>
          </div>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed">
            {locale === "zh" && (item.contentZh || item.summaryZh) ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: item.contentZh || item.summaryZh,
                }}
              />
            ) : item.content || item.summary ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: item.content || item.summary,
                }}
              />
            ) : null}
          </div>

          <div className="mt-auto pt-10 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <HiCalendar className="w-4 h-4" />
              <span>{item.date}</span>
            </div>
            <div className="font-bold tracking-tight text-primary/40">
              SJK (C) PEI HWA
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
