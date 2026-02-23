import historyData from "@/src/data/history.json";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = historyData.find((h) => h.id === id);

  if (!item) {
    return {
      title: "Sejarah Tidak Dijumpai",
      description: "Halaman sejarah ini tidak dijumpai.",
    };
  }

  return {
    title: `${item.title} (${item.year})`,
    description: item.description,
    alternates: {
      canonical: `https://sjkcpeihwa.vercel.app/profile/history/${id}`,
    },
    openGraph: {
      title: `${item.title} | SJKC Pei Hwa`,
      description: item.description,
      url: `https://sjkcpeihwa.vercel.app/profile/history/${id}`,
      siteName: "SJKC Pei Hwa",
      type: "article",
    },
  };
}

export default function HistoryDetailLayout({ children }) {
  return children;
}
