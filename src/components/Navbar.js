"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

/**
 * Navbar Component
 * Features:
 * - Responsive design with hamburger menu on mobile
 * - Sticky navigation on scroll
 * - Language switcher for i18n
 * - Smooth animations
 * - Brand colors from Peihwa logo
 * - Dropdown menus for nested navigation
 */
export default function Navbar({
  translations,
  currentLocale,
  onLocaleChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    // Set initial state
    setIsScrolled(window.scrollY > 20);

    const handleScroll = () => {
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu and dropdowns when route changes
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileExpanded({});
  }, [pathname]);

  // Read translations with safe fallbacks
  const t = (key, fallback) => {
    // Handle nested keys like 'nav.profile.title'
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || fallback;
  };

  const navLinks = [
    { href: "/", label: t("nav.home", "Home") },
    {
      label: t("nav.profile.title", "School Profile"),
      children: [
        {
          href: "/profile/anthem",
          label: t("nav.profile.anthem", "School Anthem"),
        },
        {
          href: "/profile/motto",
          label: t("nav.profile.motto", "School Motto"),
        },
        {
          href: "/profile/landscape",
          label: t("nav.profile.landscape", "Campus Landscape"),
        },
        {
          href: "/profile/history",
          label: t("nav.profile.calendar"),
        },
      ],
    },
    {
      label: t("nav.announcements", "Announcements"),
      children: [
        {
          href: "/announcements",
          label: t("announcements.title"),
          category: "academic",
        },
        {
          href: "/announcements?category=academic",
          label: t("nav.manage.academic"),
          category: "academic",
        },
        {
          href: "/announcements?category=hem",
          label: t("nav.manage.hem"),
          category: "hem",
        },
        {
          href: "/announcements?category=curriculum",
          label: t("nav.manage.curriculum"),
          category: "curriculum",
        },
      ],
    },
    { href: "/penghargaan", label: t("nav.penghargaan", "Penghargaan") },
    {
      label: t("nav.organization.title", "Organization"),
      children: [
        {
          href: "/organization?view=chart",
          label: t("nav.organization.chart", "Organization Chart"),
        },
        {
          href: "/organization/pta",
          label: t("nav.profile.pta", "PTA"),
        },
        {
          href: "/organization/lps",
          label: t("nav.profile.lps", "LPS"),
        },
        {
          href: "/organization?view=grid",
          label: t("nav.organization.staff", "Teachers & Staff"),
        },
      ],
    },
    { href: "/#contact", label: t("nav.contact", "Contact") },
  ];

  const languages = [
    { code: "ms", label: "BM", name: "Malay" },
    { code: "zh", label: "中文", name: "中文" },
  ];

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileExpand = (label) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg py-3"
          : "bg-white/95 backdrop-blur-sm py-4"
      }`}
      ref={dropdownRef}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm border border-gray-100">
              <img
                src="/logo.png"
                alt="Peihwa Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-bold text-primary">
                {t("nav.name", "SJKC Pei Hwa")}
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                {t("nav.place", "Machang")}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.children ? (
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === link.label ? null : link.label,
                      )
                    }
                    className="flex items-center text-neutral-text font-medium hover:text-primary transition-colors duration-300 focus:outline-none"
                  >
                    {link.label}
                    <IoChevronDown
                      className={`ml-1 w-4 h-4 transition-transform duration-300 ${
                        activeDropdown === link.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="text-neutral-text font-medium hover:text-primary transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-yellow transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {link.children && (
                  <div
                    className={`absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 origin-top-left ${
                      activeDropdown === link.label
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="py-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                            pathname === "/announcements" &&
                            child.category &&
                            typeof window !== "undefined" &&
                            new URLSearchParams(window.location.search).get(
                              "category",
                            ) === child.category
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                          }`}
                          onClick={() => setActiveDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Language Switcher Dropdown */}
            <div className="flex items-center border-l pl-2">
              <div className="relative group">
                <select
                  value={currentLocale}
                  onChange={(e) => onLocaleChange?.(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 cursor-pointer hover:bg-white"
                  aria-label="Select Language"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-primary transition-all duration-300 ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`w-full h-0.5 bg-primary transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`w-full h-0.5 bg-primary transition-all duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-[32rem] mt-4" : "max-h-0"
          }`}
        >
          <div className="py-4 space-y-3 border-t overflow-y-auto max-h-[70vh]">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.children ? (
                  <>
                    <button
                      onClick={() => toggleMobileExpand(link.label)}
                      className="flex items-center justify-between w-full px-4 py-2 text-neutral-text font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-300"
                    >
                      {link.label}
                      {mobileExpanded[link.label] ? (
                        <IoChevronUp className="w-4 h-4" />
                      ) : (
                        <IoChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 pl-4 space-y-1 ${
                        mobileExpanded[link.label] ? "max-h-64 mt-1" : "max-h-0"
                      }`}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-primary rounded-lg transition-colors border-l-2 border-transparent hover:border-primary"
                          onClick={() => {
                            setIsOpen(false);
                            setMobileExpanded({});
                          }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="block px-4 py-2 text-neutral-text font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}

            <div className="px-4 pt-3 border-t">
              <p className="text-sm text-gray-600 mb-2">Language</p>
              <div className="relative">
                <select
                  value={currentLocale}
                  onChange={(e) => onLocaleChange?.(e.target.value)}
                  className="appearance-none w-full bg-gray-100 border border-transparent text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all duration-300"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
