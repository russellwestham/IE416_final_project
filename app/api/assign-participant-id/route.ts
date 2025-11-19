import { NextResponse } from "next/server";
import {
  getNextAvailableParticipantId,
  updateParticipant,
} from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    // 가장 작은 미사용 Participant ID 찾기
    const participantId = await getNextAvailableParticipantId();

    // 현재 시간 기록
    const startTime = new Date().toISOString();

    // Participant 상태를 'in-progress'로 업데이트
    await updateParticipant(participantId, {
      startTime,
      status: "in-progress",
    });

    return NextResponse.json({
      success: true,
      participantId,
      startTime,
    });
  } catch (error) {
    console.error("Error assigning participant ID:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign participant ID" },
      { status: 500 }
    );
  }
}
