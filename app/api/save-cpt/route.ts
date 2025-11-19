import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      participantId,
      measurementPoint,
      testNumber,
      targetStimuli,
      sequence,
      responses,
      correctHits,
      falsePositives,
      misses,
      avgReactionTime,
      timestamp,
    } = body;

    // 필수 필드 검증
    if (
      !participantId ||
      !measurementPoint ||
      !testNumber ||
      !targetStimuli ||
      !sequence
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Google Sheets에 저장
    const row = [
      participantId,
      measurementPoint,
      testNumber,
      targetStimuli,
      sequence,
      responses, // JSON string
      correctHits,
      falsePositives,
      misses,
      avgReactionTime,
      timestamp,
    ];

    await appendToSheet("cpt_data", [row]);

    return NextResponse.json({
      success: true,
      message: "CPT data saved successfully",
    });
  } catch (error) {
    console.error("Error saving CPT data:", error);
    return NextResponse.json(
      { error: "Failed to save CPT data" },
      { status: 500 }
    );
  }
}
