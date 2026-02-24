import { NextResponse } from "next/server";
import { messaging } from "@lib/firebase-admin";

export async function POST(request) {
  try {
    const { token, topic = "announcements" } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Subscribe the token to the topic
    const response = await messaging.subscribeToTopic(token, topic);

    console.log(`Successfully subscribed to topic ${topic}:`, response);

    return NextResponse.json({
      success: true,
      message: `Subscribed to ${topic}`,
      results: response,
    });
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
