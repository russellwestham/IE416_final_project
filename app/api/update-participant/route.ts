import { NextResponse } from "next/server";
import { updateParticipant } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { participantId, name, studentId, phoneNumber, researcherName } = body;

    await updateParticipant(participantId, {
      name,
      studentId,
      phoneNumber,
      researcherName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update participant" },
      { status: 500 }
    );
  }
}
