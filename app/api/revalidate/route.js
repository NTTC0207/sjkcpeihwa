import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { message: "Path is required" },
        { status: 400 },
      );
    }

    // Trigger revalidation for the specified path
    revalidatePath(path);

    // Also revalidate sub-paths and home if needed
    if (path === "/announcements") {
      revalidatePath("/", "layout"); // Revalidate home and everything under it if needed
      revalidatePath("/announcements");
      revalidatePath("/announcements/[id]", "page");
      revalidatePath("/management/khidmat_bantu");
    } else if (path === "/management/khidmat_bantu") {
      revalidatePath("/management/khidmat_bantu");
      revalidatePath("/announcements"); // They share data
    } else if (path === "/organization") {
      revalidatePath("/organization/lps");
      revalidatePath("/organization/pta");
    } else if (path === "/penghargaan") {
      revalidatePath("/penghargaan");
      revalidatePath("/penghargaan/[id]", "page");
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
