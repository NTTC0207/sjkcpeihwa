import {
  HiMagnifyingGlass,
  HiXMark,
  HiFunnel,
  HiChartBar,
  HiViewColumns,
} from "react-icons/hi2";
import { useLanguage } from "@lib/LanguageContext";

export default function FilterControls({
  t,
  searchTerm,
  setSearchTerm,
  selectedSubject,
  setSelectedSubject,
  selectedCategory,
  setSelectedCategory,
  subjects,
  categories,
}) {
  const { translations } = useLanguage();
  const tSubjects = translations?.subjects || {};

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-grow max-w-4xl">
          <div className="relative flex-grow">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-4">
            {subjects && (
              <div className="relative">
                <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="All">{t.allSubjects}</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {tSubjects[s] || s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {categories && (
              <div className="relative">
                <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="All">{t.allCategories}</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
