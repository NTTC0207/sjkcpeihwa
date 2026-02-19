"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@lib/LanguageContext";
import { FaMusic, FaQuoteLeft, FaPlayCircle, FaVolumeUp } from "react-icons/fa";

export default function SchoolAnthemPage() {
  const { translations } = useLanguage();
  const t = translations?.nav?.profile?.anthem || "School Anthem";

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const lyricRefs = useRef([]);

  const lyrics = [
    { time: 9, text: "美哉！ 我們的培华" },
    { time: 13, text: "历史久. 长" },
    { time: 17, text: "青山如怀抱" },
    { time: 21, text: "葱茏书满岗" },
    { time: 25, text: "听弦歌， 共一堂" },
    { time: 29, text: "歌声悠扬！" },
    { time: 33, text: "看桃李满门墙" },
    { time: 37, text: "清风细雨凉" },
    { time: 41, text: "要知道， 将来的" },
    { time: 45, text: "责任要担当" },
    { time: 49, text: "锻炼身体强" },
    { time: 53, text: "锻炼意志刚" },
    { time: 57, text: "不畏难， 不怕苦" },
    { time: 60, text: "能牺牲能奋斗" },
    { time: 64, text: "前进莫彷徨" },
    { time: 68, text: "振山河， 守四方" },
    { time: 72, text: "兴民族， 刷文化" },
    { time: 75.5, text: "增我培华光！" },
  ];

  const activeIndex = lyrics.reduce((acc, lyric, index) => {
    if (currentTime >= lyric.time) {
      return index;
    }
    return acc;
  }, -1);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  useEffect(() => {
    if (activeIndex !== -1 && lyricRefs.current[activeIndex]) {
      lyricRefs.current[activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  return (
    <div className="min-h-screen bg-neutral-bg pt-28 pb-16">
      <div className="container-custom">
        {/* Header Section */}
        <header className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-primary mb-4"
          >
            {t}
          </motion.h1>
          <div className="w-20 h-1.5 bg-accent-yellow mx-auto rounded-full"></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 lg:sticky lg:top-32"
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black group">
              <video
                ref={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                className="w-full h-full object-cover"
                controls
                poster="/logo.png" // Using existing logo as poster
              >
                <source src="/folder/anthem.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-start space-x-4">
              <div className="p-3 bg-accent-yellow/10 rounded-xl">
                <FaPlayCircle className="text-2xl text-accent-yellow" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{translations.anthem.playbackInstructions}</h3>
                <p className="text-sm text-gray-600">
                 {translations.anthem.description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Lyrics Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden border border-gray-50"
          >
            {/* Decorative background element */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-accent-yellow/5 rounded-full blur-3xl"></div>

            <div className="relative">
              <FaQuoteLeft className="text-4xl text-primary/10 mb-6" />

              <div
                className={`space-y-4 text-center transition-all duration-1000 ${
                  activeIndex === -1
                    ? "max-h-none py-4"
                    : "max-h-[460px] overflow-y-auto scrollbar-hide py-[200px]"
                } px-4`}
              >
                {lyrics.map((line, index) => (
                  <motion.div
                    key={index}
                    ref={(el) => (lyricRefs.current[index] = el)}
                    className="relative py-2 px-6 rounded-2xl"
                    animate={{
                      scale: activeIndex === index ? 1.1 : 1,
                      backgroundColor:
                        activeIndex === index
                          ? "rgba(var(--primary-rgb, 26, 73, 147), 0.08)"
                          : "transparent",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 30,
                      backgroundColor: { duration: 0.3 },
                    }}
                  >
                    <motion.p
                      animate={{
                        color:
                          activeIndex === index ? "var(--primary)" : "#1F2937",
                        fontWeight: activeIndex === index ? 700 : 500,
                        opacity:
                          isPlaying && activeIndex !== -1
                            ? activeIndex === index
                              ? 1
                              : 0.3
                            : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`text-lg md:text-xl tracking-wide cursor-pointer ${
                        activeIndex === index ? "drop-shadow-sm" : ""
                      }`}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = line.time;
                          videoRef.current.play();
                        }
                      }}
                    >
                      {line.text}
                    </motion.p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
