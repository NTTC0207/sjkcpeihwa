"use client";

import { useState } from "react";
import { HiArrowPath } from "react-icons/hi2";

export default function RevalidateButton({ path, label = "Laman Utama" }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const data = await response.json();
      if (data.revalidated) {
        setLastRefreshed(new Date().toLocaleTimeString());
        alert(`Laman ${label} telah dikemas kini untuk semua pelawat!`);
      }
    } catch (error) {
      console.error("Revalidation error:", error);
      alert("Gagal mengemas kini halaman. Sila cuba lagi.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      <div>
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <span>🔄</span> Kemas Kini Kandungan Laman Web
        </h3>
        <p className="text-sm text-gray-500">
          Klik butang ini untuk memastikan semua pelawat melihat maklumat
          terbaru di laman <strong>{label}</strong> dengan segera.
          {lastRefreshed && (
            <span className="ml-2 text-accent-green font-medium">
              (Terakhir dikemas kini: {lastRefreshed})
            </span>
          )}
        </p>
      </div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
          isRefreshing
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 active:scale-95"
        }`}
      >
        {isRefreshing ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Menyegarkan...
          </>
        ) : (
          <>
            <HiArrowPath className="w-5 h-5" />
            <span>Segarkan Sekarang</span>
          </>
        )}
      </button>
    </div>
  );
}
