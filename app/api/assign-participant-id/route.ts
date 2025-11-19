import { NextResponse } from "next/server";
import {
  getNextAvailableParticipantId,
  updateParticipant,
} from "@/lib/googleSheets";

export async function POST() {
  try {
    // 가장 작은 미사용 Participant ID 찾기
    const participantId = await getNextAvailableParticipantId();

    // 현재 시간 기록
    const startTime = new Date().toISOString();

    // ID 충돌 방지: 즉시 임시 name 설정하여 다른 사용자가 동일 ID를 받지 못하도록 함
    await updateParticipant(participantId, {
      name: "(할당됨)", // 임시값으로 즉시 사용중 표시
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
