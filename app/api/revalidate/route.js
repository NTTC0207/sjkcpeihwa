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

    // Also revalidate the layout if needed, or specific sub-paths
    // For announcements, we mostly care about the main listing
    if (path === "/announcements") {
      revalidatePath("/announcements/[id]", "page");
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
