import { NextResponse } from "next/server";
import { saveTaskData } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      participantId,
      taskNumber,
      taskType,
      problemVersion,
      llmCondition,
      startTime,
      submitTime,
      duration,
      answer,
      wordCount,
    } = body;

    await saveTaskData({
      participantId,
      taskNumber,
      taskType,
      problemVersion,
      llmCondition,
      startTime,
      submitTime,
      duration,
      answer,
      wordCount,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving task data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save task data" },
      { status: 500 }
    );
  }
}
