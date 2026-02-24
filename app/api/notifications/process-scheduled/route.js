import { NextResponse } from "next/server";
import { db, messaging } from "@lib/firebase-admin";

export async function GET(request) {
  // This route can be called by a CRON job to process scheduled notifications
  try {
    const now = new Date().toISOString();

    // Find pending notifications that are due
    const q = await db
      .collection("scheduled_notifications")
      .where("status", "==", "pending")
      .where("scheduledFor", "<=", now)
      .get();

    if (q.empty) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    const processed = [];
    const errors = [];

    for (const doc of q.docs) {
      const data = doc.data();

      try {
        const message = {
          topic: data.topic || "announcements",
          notification: {
            title: data.title,
            body: data.body,
          },
          webpush: {
            fcmOptions: {
              link: data.url,
            },
          },
          data: {
            url: data.url,
          },
        };

        await messaging.send(message);

        // Mark as sent
        await doc.ref.update({
          status: "sent",
          sentAt: new Date().toISOString(),
        });

        processed.push(doc.id);
      } catch (err) {
        console.error(`Failed to send scheduled notification ${doc.id}:`, err);
        await doc.ref.update({
          status: "failed",
          error: err.message,
          updatedAt: new Date().toISOString(),
        });
        errors.push({ id: doc.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: processed.length,
      failed: errors.lengthRow,
      processedIds: processed,
      errors: errors,
    });
  } catch (error) {
    console.error("Error processing scheduled notifications:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
