/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary school brand colors based on Peihwa logo
        primary: {
          DEFAULT: "#2a589c", // Main blue - headers, buttons, navbar
          dark: "#1f3d73", // Deep blue - hover states, cards, section backgrounds
        },
        accent: {
          yellow: "#eeb81b", // Feather yellow - highlights, icons, decorations
          red: "#ff0000", // Torch red - callout elements, badges, alerts
          green: "#3ca55c", // Friendly green - success messages, badges
        },
        neutral: {
          bg: "#f7f9fc", // Page background
          card: "#e2e8f0", // Cards/footer backgrounds
          text: "#1a202c", // Text color
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-gentle": "bounceGentle 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
