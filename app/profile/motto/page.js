"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@lib/LanguageContext";
import {
  FaHeart,
  FaBook,
  FaHandHoldingHeart,
  FaUsers,
  FaLanguage,
  FaShieldAlt,
  FaCheckCircle,
  FaRunning,
  FaPiggyBank,
  FaLeaf,
} from "react-icons/fa";

export default function SchoolMottoPage() {
  const { translations } = useLanguage();
  const tTitle = translations?.nav?.profile?.motto || "校训";

  const matlamatItems = [
    {
      malay: "Berakhlak Mulia",
      chinese: "培养德性",
      icon: <FaHeart />,
      color: "from-rose-400 to-rose-600",
      delay: 0.1,
    },
    {
      malay: "Berilmu",
      chinese: "求取知识",
      icon: <FaBook />,
      color: "from-blue-400 to-blue-600",
      delay: 0.2,
    },
    {
      malay: "Kesejahteraan",
      chinese: "爱好和平",
      icon: <FaHandHoldingHeart />,
      color: "from-emerald-400 to-emerald-600",
      delay: 0.3,
    },
    {
      malay: "Perpaduan",
      chinese: "团结一致",
      icon: <FaUsers />,
      color: "from-amber-400 to-amber-600",
      delay: 0.4,
    },
    {
      malay: "Penguasaan Tiga Bahasa",
      chinese: "掌握三语",
      icon: <FaLanguage />,
      color: "from-indigo-400 to-indigo-600",
      delay: 0.5,
    },
  ];

  const prinsipItems = [
    {
      malay: "Kesetiaan",
      chinese: "忠",
      icon: <FaShieldAlt />,
      color: "border-blue-500",
      delay: 0.6,
    },
    {
      malay: "Kejujuran",
      chinese: "诚",
      icon: <FaCheckCircle />,
      color: "border-emerald-500",
      delay: 0.7,
    },
    {
      malay: "Kerajinan",
      chinese: "勤",
      icon: <FaRunning />,
      color: "border-amber-500",
      delay: 0.8,
    },
    {
      malay: "Berjimat Cermat",
      chinese: "俭",
      icon: <FaPiggyBank />,
      color: "border-purple-500",
      delay: 0.9,
    },
    {
      malay: "Kesederhanaan",
      chinese: "朴",
      icon: <FaLeaf />,
      color: "border-rose-500",
      delay: 1.0,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-24 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent-yellow/5 rounded-full blur-[100px]" />
      </div>

      <div className="container-custom px-4 relative z-10">
        {/* Header Section */}
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4 tracking-tight">
              {tTitle}
            </h1>
            <div className="w-24 h-1.5 bg-accent-yellow mx-auto rounded-full"></div>
          </motion.div>
        </header>

        {/* Matlamat Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="h-10 w-2 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
              MATLAMAT{" "}
              <span className="text-primary/60 font-medium ml-2">目标</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {matlamatItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group overflow-hidden relative flex flex-col h-full"
              >
                <div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${item.color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-bl-full`}
                ></div>

                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-primary/10 flex-shrink-0`}
                >
                  {item.icon}
                </div>

                <div className="flex-grow flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 leading-snug min-h-[3rem] flex items-center">
                    {item.malay}
                  </h3>
                  <p className="text-primary font-medium text-xl mt-auto">
                    {item.chinese}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Prinsip Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="h-10 w-2 bg-accent-yellow rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
              PRINSIP{" "}
              <span className="text-primary/60 font-medium ml-2">原则</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
            {prinsipItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay, duration: 0.5 }}
                className="relative flex flex-col items-center group h-full"
              >
                <div
                  className={`w-full h-full min-h-[340px] bg-white rounded-[2.5rem] shadow-sm border-t-8 ${item.color} flex flex-col items-center p-8 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2`}
                >
                  <div className="text-4xl text-gray-200 group-hover:text-primary/50 transition-colors duration-300 mb-6 flex-shrink-0">
                    {item.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 tracking-wider uppercase text-center leading-tight min-h-[3.5rem] flex items-center justify-center flex-shrink-0">
                    {item.malay}
                  </h3>
                  <div className="w-10 h-1 bg-gray-100 group-hover:w-16 group-hover:bg-accent-yellow transition-all duration-300 mb-8 flex-shrink-0"></div>
                  <div className="flex-grow flex items-center justify-center">
                    <span className="text-7xl md:text-8xl font-serif text-primary font-bold">
                      {item.chinese}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
