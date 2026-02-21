"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@lib/LanguageContext";
import { FaHistory, FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import historyData from "@/src/data/history.json";

export default function HistoryPage() {
  const { translations } = useLanguage();
  const t = translations?.nav?.profile?.calendar || "School History";

  return (
    <div className="min-h-screen bg-neutral-bg pt-24 pb-16">
      <div className="container-custom">
        {/* Header Section */}
        <header className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-primary mb-6"
          >
            {t}
          </motion.h1>
          <div className="w-20 h-1.5 bg-accent-yellow mx-auto rounded-full"></div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
          >
           {translations.history?.subtitle}
          </motion.p>
        </header>

        {/* Timeline Component */}
        <div className="relative max-w-5xl mx-auto px-4">
          {/* Central Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/10 via-primary/30 to-primary/5 hidden md:block"></div>

          <div className="space-y-10 md:space-y-14">
            {historyData.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  className={`relative flex items-center justify-between w-full ${
                    isEven ? "md:flex-row-reverse" : "md:flex-row"
                  } flex-col`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 z-20 hidden md:block">
                    <div className="w-8 h-8 bg-white rounded-full border-4 border-primary shadow-xl flex items-center justify-center transition-transform hover:scale-125 duration-300">
                      <div className="w-2.5 h-2.5 bg-accent-yellow rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div
                    className={`w-full md:w-[45%] ${isEven ? "md:text-left" : "md:text-right"}`}
                  >
                    <Link
                      href={`/profile/history/${item.id}`}
                      className="group block bg-white rounded-3xl p-5 md:p-7 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden"
                    >
                      {/* Decorative Background */}
                      <div
                        className={`absolute top-0 ${isEven ? "right-0" : "left-0"} w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500`}
                      ></div>

                      <div className="relative z-10">
                        <div
                          className={`flex items-center gap-3 mb-3 ${isEven ? "md:justify-start" : "md:justify-end"} justify-start`}
                        >
                          <span className="px-4 py-1.5 bg-primary/10 text-primary font-bold rounded-full text-xs md:text-sm border border-primary/20">
                            {item.year}
                          </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-display font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors leading-tight">
                          {item.title}
                        </h3>

                        <p className="text-gray-600 mb-6 leading-relaxed text-base line-clamp-2">
                          {item.description}
                        </p>

                        <div
                          className={`flex items-center text-primary font-bold ${isEven ? "md:justify-start" : "md:justify-end"} justify-start group-hover:gap-4 transition-all duration-300`}
                        >
                          <span className="border-b-2 border-primary pb-1">
                            阅读这一章
                          </span>
                          <FaArrowRight className="ml-2 text-sm" />
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Empty space for the other side */}
                  <div className="hidden md:block md:w-[45%]"></div>
                </motion.div>
              );
            })}
          </div>

          {/* Timeline Bottom Marker */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-10 hidden md:block">
            <div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
