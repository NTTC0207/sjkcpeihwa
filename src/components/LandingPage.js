"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
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
  HiArrowRight,
  HiCalendar,
  HiUserGroup,
} from "react-icons/hi2";

/**
 * Landing Page Component
 * Features:
 * - Hero section with school logo and motto
 * - Announcements section (Latest 3-5)
 * - About section
 * - Programs section
 * - Fully responsive design
 * - Multi-language support (i18n)
 * - Smooth animations
 */
export default function LandingPage({ initialAnnouncements = [] }) {
  const { translations } = useLanguage();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(
    initialAnnouncements.length === 0,
  );

  useEffect(() => {
    const fetchLatestAnnouncements = async () => {
      try {
        const q = query(
          collection(db, "announcement"),
          where("badge", "in", [
            "Penting",
            "Acara",
            "Mesyuarat",
            "Cuti",
            "Berita",
            "Notis",
            "Pekeliling",
          ]),
          orderBy("date", "desc"),
          limit(3),
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching latest announcements:", error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    if (initialAnnouncements.length === 0) {
      fetchLatestAnnouncements();
    }
  }, [initialAnnouncements]);

  const currentYear = new Date().getFullYear();
  const historyYears = currentYear - 1938;

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

  // Parallax effects
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotateHero = useTransform(scrollY, [0, 500], [0, 5]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0.5]);

  return (
    <main className="min-h-screen bg-neutral-bg overflow-x-hidden mesh-gradient">
      {/* Navbar handled by ClientLayout */}

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            style={{ y: y1 }}
            className="absolute top-20 right-[10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
          ></motion.div>
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-20 left-[10%] w-[500px] h-[500px] bg-accent-yellow/15 rounded-full blur-[120px]"
          ></motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] bg-center opacity-[0.03]"></div>
        </div>

        <div className="container-custom relative">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 text-center lg:text-left z-20"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm uppercase tracking-widest"
              >
                {translations?.nav?.name || "SJKC Pei Hwa"}
              </motion.div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold mb-6 leading-[1.1] tracking-tight">
                <span className="text-primary">
                  {translations?.hero?.welcome?.split(" Machang")[0]}
                </span>
                {translations?.hero?.welcome?.includes("Machang") && (
                  <span className="block text-gradient mt-2 whitespace-nowrap">
                    Machang
                  </span>
                )}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {translations?.hero?.motto}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/profile/history">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary-accent text-lg w-full sm:w-auto"
                  >
                    {translations?.hero?.cta}
                  </motion.button>
                </Link>
                <Link href="/announcements">
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(26, 73, 147, 0.05)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-2xl font-bold text-primary border-2 border-primary/20 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {translations?.announcements?.title}
                    <HiArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Image & Logo */}
            <motion.div
              style={{ rotate: rotateHero, opacity: opacityHero }}
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 relative group"
            >
              {/* Dynamic Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent-yellow/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

              <div className="relative">
                {/* Main Hero Image */}
                <motion.div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-[12px] border-white z-10 aspect-[4/5] sm:aspect-square lg:aspect-[4/5] xl:aspect-square">
                  <img
                    src="/gallery/landing-hero.avif"
                    alt="SJKC Pei Hwa Hero"
                    className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-60"></div>
                </motion.div>

                {/* Floating Logo Badge */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-10 -left-10 md:-left-16 w-36 h-36 md:w-48 md:h-48 glass rounded-full flex items-center justify-center shadow-2xl z-20 border-8 border-white p-6 md:p-8"
                >
                  <img
                    src="/logo.png"
                    alt="School Logo"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 20 }}
                  className="absolute -top-8 -right-8 w-24 h-24 bg-accent-yellow rounded-3xl flex items-center justify-center shadow-xl z-20 rotate-12 cursor-pointer"
                >
                  <HiAcademicCap className="w-12 h-12 text-white" />
                </motion.div>

                <div className="absolute -top-20 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section
          id="announcements"
          className="section relative overflow-hidden"
        >
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
            >
              <div>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="inline-block text-accent-yellow font-black tracking-[0.3em] uppercase text-sm mb-4"
                >
                  {translations?.announcements?.stayUpdated || "Stay Updated"}
                </motion.span>
                <h2 className="text-4xl md:text-5xl font-display font-extrabold text-primary">
                  {translations?.announcements?.title}
                </h2>
              </div>
              <Link href="/announcements">
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all font-bold text-primary"
                >
                  {translations?.announcements?.viewAll}
                  <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {announcements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -12 }}
                  className="relative group h-full"
                >
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary/10 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Link
                    href={`/announcements/${announcement.id}`}
                    className="relative flex flex-col h-full bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 group-hover:border-primary/20 transition-all duration-500 overflow-hidden"
                  >
                    {/* Date Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] flex items-center justify-center -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors">
                      <div className="text-primary/20 group-hover:text-primary/30 transition-colors rotate-12">
                        <HiCalendar className="w-12 h-12" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-8">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${announcement.badgeColor || "bg-primary"}`}
                      >
                        {announcement.badge}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        {announcement.date}
                      </span>
                    </div>

                    <h3 className="text-2xl font-display font-extrabold text-primary mb-6 group-hover:text-primary-dark transition-colors leading-tight min-h-[4rem] line-clamp-2">
                      {announcement.title}
                    </h3>

                    <p className="text-gray-500 leading-relaxed line-clamp-3 mb-10 text-sm font-medium">
                      {announcement.summary ||
                        (announcement.content
                          ? announcement.content
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 120) + "..."
                          : "")}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-primary font-bold text-sm uppercase tracking-widest border-b-2 border-primary/10 group-hover:border-primary transition-all pb-1">
                        {translations?.announcements?.readMore || "Read More"}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-primary/5 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all">
                        <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="section relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white aspect-[4/3] group">
                <img
                  src="/gallery/frontview.avif"
                  alt="About SJKC Pei Hwa"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
              </div>
              {/* Floating Stat Badge */}
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-8 -right-8 glass p-8 rounded-[2.5rem] shadow-2xl z-20 hidden md:block border-white/40"
              >
                <div className="text-primary font-display font-black text-4xl mb-1">
                  {historyYears}+
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {translations?.about?.yearsOfExcellence ||
                    "Tahun Kecemerlangan"}
                </div>
              </motion.div>
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-accent-yellow font-black tracking-[0.3em] uppercase text-sm mb-4 block"
              >
                {translations?.about?.title || "Tentang Kami"}
              </motion.span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-primary mb-10 leading-[1.1]">
                {translations?.about?.subtitle || "Membentuk Peribadi Unggul"}
              </h2>

              <div className="space-y-10">
                <motion.div whileHover={{ x: 10 }} className="flex gap-8 group">
                  <div className="w-16 h-16 shrink-0 rounded-[1.25rem] bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <HiStar className="w-9 h-9 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-primary mb-3">
                      {translations?.about?.vision || "Visi Kami"}
                    </h3>
                    <p className="text-gray-600 font-medium italic text-lg leading-relaxed">
                      "{translations?.about?.visionText}"
                    </p>
                  </div>
                </motion.div>

                <motion.div whileHover={{ x: 10 }} className="flex gap-8 group">
                  <div className="w-16 h-16 shrink-0 rounded-[1.25rem] bg-accent-yellow/5 flex items-center justify-center group-hover:bg-accent-yellow group-hover:text-white transition-all duration-500">
                    <HiCheckBadge className="w-9 h-9 text-accent-yellow group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-primary mb-3">
                      {translations?.about?.mission || "Misi Kami"}
                    </h3>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.15em] leading-loose max-w-md">
                      {translations?.about?.missionText}
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-14">
                <Link href="/profile/history">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 bg-primary/5 px-8 py-4 rounded-2xl text-primary font-bold group hover:bg-primary hover:text-white transition-all duration-500"
                  >
                    <span>{translations?.hero?.cta}</span>
                    <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section
        id="programs"
        className="section relative overflow-hidden bg-white/40"
      >
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary font-black tracking-[0.3em] uppercase text-sm mb-4 block"
            >
              {translations?.programs?.excellenceInEverything ||
                "Excellence in Everything"}
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-primary mb-6">
              {translations?.programs?.subtitle || "Program Kami"}
            </h2>
            <div className="w-24 h-1.5 bg-accent-yellow mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {programs.map((program, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -15, scale: 1.02 }}
                className="relative group isolate"
              >
                <div className="absolute -inset-2 bg-gradient-to-tr from-primary/10 to-accent-yellow/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                <div className="glass rounded-[2.5rem] p-10 h-full flex flex-col items-start border-white/60 hover:bg-white transition-all duration-500">
                  <div
                    className={`w-16 h-16 rounded-2xl ${program.color} flex items-center justify-center mb-8 shadow-xl shadow-black/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <program.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-primary mb-4">
                    {translations?.programs?.[program.titleKey]?.title}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">
                    {translations?.programs?.[program.titleKey]?.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charter Section */}
      {translations?.charter && (
        <section
          id="charter"
          className="section relative overflow-hidden mesh-gradient"
        >
          <div className="container-custom">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-10">
              <div className="max-w-2xl">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-accent-yellow font-black tracking-[0.3em] uppercase text-sm mb-4 block"
                >
                  {translations?.charter?.ourCommitment || "Our Commitment"}
                </motion.span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-primary mb-6">
                  {translations?.charter?.title}
                </h2>
                <div className="w-24 h-1.5 bg-primary/20 rounded-full"></div>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center text-primary/10 transform rotate-12">
                  <HiCheckBadge className="w-16 h-16" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {translations?.charter?.items?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] -z-10 transition-transform duration-500 group-hover:bg-primary/10 group-hover:scale-110"></div>
                  <div className="p-10 rounded-[2.5rem] bg-white shadow-sm border border-gray-100 flex gap-8 group-hover:shadow-2xl group-hover:shadow-primary/5 transition-all duration-500 h-full">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/5 text-primary flex items-center justify-center font-black text-xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                      {index + 1}
                    </div>
                    <p className="text-gray-600 font-medium leading-relaxed text-lg pt-1">
                      {item}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section
        id="contact"
        className="section relative overflow-hidden bg-white"
      >
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <span className="text-primary font-black tracking-[0.3em] uppercase text-sm mb-4 block">
                {translations?.footer?.contact || "Hubungi Kami"}
              </span>
              <h2 className="text-5xl md:text-6xl font-display font-extrabold text-primary mb-14 leading-[1.1]">
                Mari Berhubung
                <br />
                Dengan Kami
              </h2>

              <div className="space-y-8">
                {[
                  {
                    icon: HiMapPin,
                    title: translations?.contact?.visit || "Alamat",
                    content: translations?.footer?.address,
                    color: "bg-primary/10 text-primary",
                  },
                  {
                    icon: HiPhone,
                    title: translations?.contact?.call || "Telefon",
                    content: "+60 9-9751046",
                    color: "bg-accent-green/10 text-accent-green",
                  },
                  {
                    icon: HiEnvelope,
                    title: translations?.contact?.email || "E-mel",
                    content: "dbc2185@moe.edu.my",
                    color: "bg-accent-yellow/10 text-accent-yellow",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{
                      x: 15,
                      backgroundColor: "rgba(26, 73, 147, 0.02)",
                    }}
                    className="flex gap-8 p-8 rounded-[2.5rem] bg-white shadow-sm border border-gray-100 transition-all duration-500 group"
                  >
                    <div
                      className={`w-16 h-16 shrink-0 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-black/5`}
                    >
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xl text-primary mb-2">
                        {item.title}
                      </h4>
                      <p className="text-gray-500 font-medium text-base leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border-[12px] border-white min-h-[500px] transform-gpu group cursor-crosshair"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.638125010755!2d102.22062047495648!3d5.765101731511689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31b685332f7428b9%3A0x9723d38c28a38913!2sSJKC%20Pei%20Hwa!5e0!3m2!1sen!2smy!4v1771335891513!5m2!1sen!2smy"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 transition-opacity duration-[1s]"
                title="SJKC Pei Hwa Location"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-[20px] border-primary/5 rounded-[2.5rem] transition-all group-hover:border-primary/0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer handled by ClientLayout */}
    </main>
  );
}
