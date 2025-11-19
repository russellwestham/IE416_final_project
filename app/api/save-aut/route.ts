import { NextResponse } from "next/server";
import { saveAUTData } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      participantId,
      autRound,
      point,
      objectName,
      response,
      responseTime,
      timestamp,
    } = body;

    await saveAUTData({
      participantId,
      autRound,
      point,
      objectName,
      response,
      responseTime,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving AUT data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save AUT data" },
      { status: 500 }
    );
  }
}
