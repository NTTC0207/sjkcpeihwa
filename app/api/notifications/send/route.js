import { NextResponse } from "next/server";
import { messaging } from "@lib/firebase-admin";

export async function POST(request) {
  try {
    const {
      title,
      body,
      topic = "announcements",
      url = "/announcements",
    } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 },
      );
    }

    const message = {
      topic: topic,
      notification: {
        title: title,
        body: body,
      },
      webpush: {
        fcmOptions: {
          link: url,
        },
      },
      data: {
        url: url,
      },
    };

    const response = await messaging.send(message);
    console.log("Successfully sent message:", response);

    return NextResponse.json({ success: true, messageId: response });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
