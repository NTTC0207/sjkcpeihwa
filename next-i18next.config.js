// i18n configuration for multi-language support
// Supports: English (en), Chinese (zh), Malay (ms)

module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh", "ms"],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
