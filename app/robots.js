export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin", "/api/"],
      },
      {
        // Block common AI scrapers from heavy crawling
        userAgent: ["GPTBot", "Claude-Web", "CCBot"],
        disallow: "/",
      },
    ],
    sitemap: "https://sjkcpeihwa.vercel.app/sitemap.xml",
    host: "https://sjkcpeihwa.vercel.app",
  };
}
