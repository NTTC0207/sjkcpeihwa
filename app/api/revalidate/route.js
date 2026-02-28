import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/revalidate
 *
 * Body: { path: "/announcements" | "/penghargaan" | etc. }
 *
 * Invalidates both:
 *  1. Cache TAGS (used by unstable_cache in server pages — required for
 *     Firebase Admin SDK calls that don't go through fetch())
 *  2. Path cache (for any pages that still use fetch-based ISR)
 */
export async function POST(request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { message: "Path is required" },
        { status: 400 },
      );
    }

    if (path === "/announcements") {
      // Invalidate the data cache tag (unstable_cache)
      revalidateTag("announcements", "max");
      // Also revalidate path-based cache for [id] detail pages
      revalidatePath("/", "page");
      revalidatePath("/announcements", "page");
      revalidatePath("/announcements/[id]", "page");
      revalidatePath("/management/khidmat_bantu", "page");
      revalidatePath("/management/majlis_rasmi", "page");
    } else if (path === "/management/khidmat_bantu") {
      revalidateTag("khidmat_bantu", "max");
      revalidatePath("/management/khidmat_bantu", "page");
      // Khidmat Bantu shares the "announcement" collection
      revalidateTag("announcements", "max");
      revalidatePath("/announcements", "page");
    } else if (path === "/management/majlis_rasmi") {
      revalidateTag("majlis_rasmi", "max");
      revalidatePath("/management/majlis_rasmi", "page");
      revalidateTag("announcements", "max");
    } else if (path === "/organization") {
      revalidateTag("organization", "max");
      revalidatePath("/organization", "page");
      revalidatePath("/organization/lps", "page");
      revalidatePath("/organization/pta", "page");
    } else if (path === "/penghargaan") {
      revalidateTag("penghargaan", "max");
      revalidatePath("/penghargaan", "page");
      revalidatePath("/penghargaan/[id]", "page");
    } else if (path === "/management") {
      revalidateTag("management", "max");
      revalidatePath("/management/[category]", "page");
      revalidatePath("/management/[category]/[id]", "page");
    } else {
      // Generic fallback — revalidate the given path
      revalidatePath(path, "page");
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: `Revalidation triggered for ${path}`,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: err.message },
      { status: 500 },
    );
  }
}
