import { NextResponse } from "next/server";
import { saveSurveyData } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      participantId,
      measurementPoint,
      q1_cognitive_effort,
      q2_concentration,
      q3_idea_fluency,
      q4_idea_originality,
      q5_satisfaction,
      timestamp,
    } = body;

    // 필수 필드 검증
    if (
      !participantId ||
      !measurementPoint ||
      q1_cognitive_effort === undefined ||
      q2_concentration === undefined ||
      q3_idea_fluency === undefined ||
      q4_idea_originality === undefined ||
      q5_satisfaction === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 범위 검증 (1~7)
    const responses = [
      q1_cognitive_effort,
      q2_concentration,
      q3_idea_fluency,
      q4_idea_originality,
      q5_satisfaction,
    ];
    if (
      responses.some(
        (r) => typeof r !== "number" || r < 1 || r > 7 || !Number.isInteger(r)
      )
    ) {
      return NextResponse.json(
        { error: "All responses must be integers between 1 and 7" },
        { status: 400 }
      );
    }

    // Google Sheets에 저장
    await saveSurveyData({
      participantId,
      measurementPoint,
      q1_cognitive_effort,
      q2_concentration,
      q3_idea_fluency,
      q4_idea_originality,
      q5_satisfaction,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving survey data:", error);
    return NextResponse.json(
      { error: "Failed to save survey data" },
      { status: 500 }
    );
  }
}
