"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Custom hook to manage organization view mode (chart or grid)
 * and synchronize it with the URL query parameters.
 *
 * @param {string} defaultValue - Initial view mode if not in URL
 * @returns {[string, function]} - Current view and setter function
 */
export function useOrgView(defaultValue = "chart") {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || defaultValue;

  const setView = useCallback(
    (newView) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", newView);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return [currentView, setView];
}
