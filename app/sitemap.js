import historyData from "@/src/data/history.json";

export default async function sitemap() {
  const baseUrl = "https://sjkcpeihwa.vercel.app";

  // Static routes with appropriate priorities
  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/announcements", priority: 0.9, changeFrequency: "daily" },
    { path: "/organization", priority: 0.8, changeFrequency: "monthly" },
    { path: "/organization/pta", priority: 0.8, changeFrequency: "monthly" },
    { path: "/organization/lps", priority: 0.8, changeFrequency: "monthly" },
    { path: "/profile/history", priority: 0.7, changeFrequency: "monthly" },
    { path: "/profile/anthem", priority: 0.6, changeFrequency: "yearly" },
    { path: "/profile/motto", priority: 0.6, changeFrequency: "yearly" },
    { path: "/profile/landscape", priority: 0.6, changeFrequency: "monthly" },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // Dynamic history routes
  const historyRoutes = historyData.map((item) => ({
    url: `${baseUrl}/profile/history/${item.id}`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...historyRoutes];
}
