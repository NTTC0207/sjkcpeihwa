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
      canonical: `https://sjkcpeihwa.edu.my/profile/history/${id}`,
    },
    openGraph: {
      title: `${item.title} | SJK(C) Pei Hwa`,
      description: item.description,
      url: `https://sjkcpeihwa.edu.my/profile/history/${id}`,
      type: "article",
    },
  };
}

export default function HistoryDetailLayout({ children }) {
  return children;
}
