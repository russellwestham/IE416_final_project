import { NextResponse } from "next/server";
import { saveMeasurementData } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      participantId,
      measurementType,
      point,
      questionNumber,
      response,
      responseTime,
      timestamp,
    } = body;

    await saveMeasurementData({
      participantId,
      measurementType,
      point,
      questionNumber,
      response,
      responseTime,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving measurement data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save measurement data" },
      { status: 500 }
    );
  }
}
