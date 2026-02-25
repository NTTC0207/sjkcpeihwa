"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";
import {
  HiBookOpen,
  HiPaintBrush,
  HiTrophy,
  HiStar,
  HiAcademicCap,
  HiCheckBadge,
  HiMegaphone,
  HiMapPin,
  HiPhone,
  HiEnvelope,
} from "react-icons/hi2";

/**
 * Landing Page Component
 * Features:
 * - Hero section with school logo and motto
 * - About section
 * - Programs section
 * - Announcements section
 * - Fully responsive design
 * - Multi-language support (i18n)
 * - Smooth animations
 */
export default function LandingPage() {
  const { translations, locale, changeLocale } = useLanguage();
  const currentYear = new Date().getFullYear();
  const historyYears = currentYear - 1939;

  // Programs data
  const programs = [
    {
      icon: HiBookOpen,
      titleKey: "academic",
      color: "bg-primary",
      hoverColor: "hover:bg-primary-dark",
    },
    {
      icon: HiPaintBrush,
      titleKey: "arts",
      color: "bg-accent-yellow",
      hoverColor: "hover:bg-yellow-500",
    },
    {
      icon: HiTrophy,
      titleKey: "sports",
      color: "bg-accent-green",
      hoverColor: "hover:bg-green-600",
    },
    {
      icon: HiStar,
      titleKey: "character",
      color: "bg-primary-dark",
      hoverColor: "hover:bg-primary",
    },
  ];

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    viewport: { once: true },
  };

  const itemFadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  // Translations are handled by LanguageContext/ClientLayout

  return (
    <div className="min-h-screen bg-neutral-bg overflow-x-hidden">
      {/* Navbar handled by ClientLayout */}

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-20 right-10 w-72 h-72 bg-accent-yellow/10 rounded-full blur-3xl"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          ></motion.div>
        </div>

        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary mb-4 leading-tight">
                {translations?.hero.welcome}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 font-medium">
                {translations?.hero.motto}
              </p>
              <Link href="/profile/history">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary-accent text-lg"
                >
                  {translations?.hero.cta}
                </motion.button>
              </Link>
            </motion.div>

            {/* Right: Image & Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 relative"
            >
              <div className="relative group">
                {/* Main Hero Image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white z-10"
                >
                  <img
                    src="/gallery/landing-hero.avif"
                    alt="SJKC Pei Hwa Hero"
                    className="w-full h-[350px] md:h-[450px] lg:h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-60"></div>
                </motion.div>

                {/* Floating Logo Badge */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-8 -left-8 md:-left-12 w-32 h-32 md:w-44 md:h-44 bg-white rounded-full flex items-center justify-center shadow-2xl z-20 border-8 border-primary/5 p-4 md:p-6"
                >
                  <img
                    src="/logo.png"
                    alt="School Logo"
                    className="w-full h-full object-contain"
                  />
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="absolute -top-6 -right-6 w-20 h-20 bg-accent-yellow rounded-2xl flex items-center justify-center shadow-lg z-20 rotate-12"
                >
                  <HiAcademicCap className="w-10 h-10 text-white" />
                </motion.div>

                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-green/10 rounded-full blur-2xl -z-10"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section bg-white overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-yellow/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50"></div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title mb-4">{translations?.about.title}</h2>
            <div className="w-20 h-1.5 bg-accent-yellow mx-auto rounded-full mb-6"></div>
            <p className="section-subtitle max-w-2xl">
              {translations?.about.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="relative group h-full"
            >
              <div className="absolute inset-0 bg-accent-yellow/5 rounded-[2.5rem] blur-2xl transform group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative h-full p-10 md:p-12 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                {/* Decorative background icon */}
                <HiStar className="absolute -bottom-10 -right-10 w-48 h-48 text-accent-yellow/5 -rotate-12" />

                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-accent-yellow/10 flex items-center justify-center shadow-inner">
                    <HiStar className="w-9 h-9 text-accent-yellow" />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-primary">
                    {translations?.about.vision}
                  </h3>
                </div>

                <div className="relative flex-grow">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-yellow/30 rounded-full"></div>
                  <p className="pl-8 text-2xl md:text-3xl font-display font-medium leading-relaxed italic text-gray-700">
                    "{translations?.about.visionText}"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="relative group h-full"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl transform group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative h-full p-10 md:p-12 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                {/* Decorative background icon */}
                <HiCheckBadge className="absolute -bottom-10 -right-10 w-48 h-48 text-primary/5 rotate-12" />

                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                    <HiCheckBadge className="w-9 h-9 text-primary" />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-primary">
                    {translations?.about.mission}
                  </h3>
                </div>

                <div className="relative flex-grow">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 rounded-full"></div>
                  <p className="pl-8 text-lg md:text-xl font-bold leading-relaxed text-gray-600 uppercase tracking-wide">
                    {translations?.about.missionText}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Highlights Section */}
          {/* <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-24 pt-16 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                label: translations?.stats?.students || "Students",
                val: "100+",
                icon: HiAcademicCap,
                color: "bg-primary/10 text-primary",
                delay: 0,
              },
              {
                label: translations?.stats?.staff || "Dedicated Staff",
                val: "20+",
                icon: HiStar,
                color: "bg-accent-yellow/10 text-accent-yellow",
                delay: 0.1,
              },
              {
                label: translations?.stats?.history || "History",
                val: `${historyYears} ${locale === "zh" ? "年" : locale === "ms" ? "Tahun" : "Years"}`,
                icon: HiBookOpen,
                color: "bg-accent-green/10 text-accent-green",
                delay: 0.2,
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.3 + stat.delay,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="p-8 rounded-[2rem] bg-white border border-gray-50 shadow-sm text-center group hover:bg-neutral-bg hover:shadow-xl transition-all duration-500 flex flex-col items-center"
              >
                <div
                  className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm`}
                >
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl md:text-4xl font-black font-display text-primary mb-1 tracking-tight">
                  {stat.val}
                </div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div> */}
        </div>
      </section>

      {/* Charter Section */}
      {translations?.charter && (
        <section
          id="charter"
          className="section bg-white border-t border-gray-100"
        >
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="section-title">{translations?.charter.title}</h2>
              <div className="w-24 h-1.5 bg-accent-yellow mx-auto mt-4 rounded-full"></div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            >
              {translations?.charter.items.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemFadeIn}
                  whileHover={{
                    y: -10,
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  className="bg-neutral-bg p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl -mr-4 -mt-4 transition-transform duration-500 group-hover:bg-primary/10 group-hover:scale-125"></div>
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-6 shadow-lg shadow-primary/20">
                    {index + 1}
                  </div>
                  <p className="text-neutral-text leading-relaxed font-medium">
                    {item}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section
        id="contact"
        className="section bg-gradient-to-b from-neutral-bg to-white"
      >
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="section-title">{translations?.footer.contact}</h2>
            <div className="w-20 h-1.5 bg-accent-yellow mx-auto rounded-full mb-6"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch max-w-6xl mx-auto">
            {/* Left: Contact Info */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="flex flex-col justify-center space-y-6"
            >
              <motion.div
                variants={itemFadeIn}
                className="card flex items-start space-x-4 shadow-lg hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <HiMapPin className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-primary mb-1">
                    {translations?.contact?.visit || "Visit Us"}
                  </h3>
                  <a
                    href="https://www.google.com/maps/place/SJKC+Pei+Hwa/@5.7651017,102.2206205,17z/data=!3m1!4b1!4m6!3m5!1s0x31b685332f7428b9:0x9723d38c28a38913!8m2!3d5.7650964!4d102.2231954!16s%2Fg%2F122np819?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 leading-relaxed font-medium hover:text-primary transition-colors duration-300"
                  >
                    {translations?.footer.address}
                  </a>
                </div>
              </motion.div>

              <motion.div
                variants={itemFadeIn}
                className="card flex items-start space-x-4 shadow-lg hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="w-14 h-14 bg-accent-green/10 rounded-xl flex items-center justify-center shrink-0">
                  <HiPhone className="w-7 h-7 text-accent-green" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-accent-green mb-1">
                    {translations?.contact?.call || "Call / Fax Us"}
                  </h3>
                  <p className="text-gray-600 font-medium">+60 9-9751046</p>
                </div>
              </motion.div>

              <motion.div
                variants={itemFadeIn}
                className="card flex items-start space-x-4 shadow-lg hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="w-14 h-14 bg-accent-yellow/10 rounded-xl flex items-center justify-center shrink-0">
                  <HiEnvelope className="w-7 h-7 text-accent-yellow" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-accent-yellow mb-1">
                    {translations?.contact?.email || "Email Us"}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    dbc2185@moe.edu.my
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Map Container */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white min-h-[400px] lg:min-h-full group"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.638125010755!2d102.22062047495648!3d5.765101731511689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31b685332f7428b9%3A0x9723d38c28a38913!2sSJKC%20Pei%20Hwa!5e0!3m2!1sen!2smy!4v1771335891513!5m2!1sen!2smy"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                title="SJKC Pei Hwa Location"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer handled by ClientLayout */}
    </div>
  );
}
