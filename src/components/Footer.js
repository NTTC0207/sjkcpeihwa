"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import { HiArrowRight, HiMail } from "react-icons/hi";

/**
 * Footer Component
 * Features:
 * - Contact information
 * - Quick links
 * - Social media links
 * - Responsive layout
 * - Brand colors from Peihwa logo
 */
export default function Footer({ translations }) {
  const quickLinks = [
    { href: "/", label: translations?.nav?.home || "Home" },
    {
      href: "/profile/history",
      label: translations?.nav?.profile?.calendar || "School History",
    },
    {
      href: "/announcements",
      label: translations?.nav?.announcements || "Announcements",
    },
    {
      href: "/organization?view=chart",
      label: translations?.nav?.organization?.chart || "Organization Chart",
    },
    { href: "/#contact", label: translations?.nav?.contact || "Contact Us" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      href: "https://www.facebook.com/sjkcpeihwa.machang",
      color: "hover:text-blue-600",
    },
    {
      name: "YouTube",
      icon: <FaYoutube />,
      href: "https://www.youtube.com/@SJKCPEIHWAMACHANG",
      color: "hover:text-red-600",
    },
    {
      name: "Email",
      icon: <HiMail />,
      href: "mailto:dbc2185@moe.edu.my",
      color: "hover:text-accent-yellow",
    },
  ];

  return (
    <footer className="bg-primary-dark text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
                <img
                  src="/logo.png"
                  alt="Peihwa Logo"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">
                  SJK(C) Pei Hwa
                </h3>
                <p className="text-sm text-gray-300">Machang</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {translations?.hero?.motto ||
                "Nurturing Young Minds, Building Bright Futures"}
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-accent-yellow">
              {translations?.footer?.contact || "Contact Us"}
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <MdLocationOn className="mr-2 mt-1 text-accent-yellow text-lg" />
                <a
                  href="https://www.google.com/maps/place/SJK(C)+Pei+Hwa/@5.7651017,102.2206205,17z/data=!3m1!4b1!4m6!3m5!1s0x31b685332f7428b9:0x9723d38c28a38913!8m2!3d5.7650964!4d102.2231954!16s%2Fg%2F122np819?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-yellow transition-colors duration-300"
                >
                  <span>
                    {translations?.footer?.address ||
                      "123 Education Street, Learning District"}
                  </span>
                </a>
              </li>
              <li className="flex items-center">
                <MdPhone className="mr-2 text-accent-yellow text-lg" />
                <span>
                  {translations?.footer?.phone || "Phone: +60 9-9751046"}
                </span>
              </li>
              <li className="flex items-center">
                <MdEmail className="mr-2 text-accent-yellow text-lg" />
                <span>
                  {translations?.footer?.email || "Email: dbc2185@moe.edu.my"}
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-accent-yellow">
              {translations?.footer?.quickLinks || "Quick Links"}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-accent-yellow transition-colors duration-300 text-sm flex items-center group"
                  >
                    <HiArrowRight className="mr-2 text-[10px] transition-transform duration-300 group-hover:translate-x-1" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-accent-yellow">
              {translations?.footer?.followUs || "Follow Us"}
            </h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl transition-all duration-300 hover:scale-125 ${social.color}`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-300 mb-2">
                {translations?.footer?.hours || "School Hours:"}
              </p>
              <p className="text-sm text-gray-400">
                {translations?.footer?.days || "Sun - Thu: 7:30 AM - 4:30 PM"}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">
            {translations?.footer?.copyright
              ? translations.footer.copyright.replace(
                  "{{year}}",
                  new Date().getFullYear(),
                )
              : `© ${new Date().getFullYear()} SJK(C) Pei Hwa Machang. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
