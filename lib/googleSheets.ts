import { google } from "googleapis";

// Google Sheets API 클라이언트 초기화
function getGoogleSheetsClient() {
  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || "{}"
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

/**
 * 특정 시트의 데이터를 읽어옵니다
 * @param sheetName - 시트 이름 (participants, aut_data, measurement_data, task_data)
 * @param range - 읽을 범위 (예: 'A1:Z100')
 */
export async function readSheet(sheetName: string, range: string) {
  const sheets = getGoogleSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
    });

    return response.data.values || [];
  } catch (error) {
    console.error("Error reading sheet:", error);
    throw error;
  }
}

/**
 * 특정 시트에 데이터를 추가합니다 (append)
 * @param sheetName - 시트 이름
 * @param values - 추가할 데이터 (2D 배열)
 */
export async function appendToSheet(sheetName: string, values: any[][]) {
  const sheets = getGoogleSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:A`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error appending to sheet:", error);
    throw error;
  }
}

/**
 * 특정 시트의 특정 범위를 업데이트합니다
 * @param sheetName - 시트 이름
 * @param range - 업데이트할 범위 (예: 'A2:E2')
 * @param values - 업데이트할 데이터 (2D 배열)
 */
export async function updateSheet(
  sheetName: string,
  range: string,
  values: any[][]
) {
  const sheets = getGoogleSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating sheet:", error);
    throw error;
  }
}

/**
 * Participants 시트에서 모든 참가자 정보를 가져옵니다
 */
export async function getAllParticipants() {
  const data = await readSheet("participants", "A2:I1000");

  return data.map((row) => ({
    participantId: row[0],
    name: row[1],
    studentId: row[2],
    phoneNumber: row[3],
    group: row[4],
    conditionType: row[5],
    autType: row[6],
    timestamp: row[7],
    researcherName: row[8],
  }));
}

/**
 * 가장 작은 미사용 Participant ID를 찾습니다
 */
export async function getNextAvailableParticipantId(): Promise<string> {
  const participants = await getAllParticipants();

  // name이 비어있거나 NULL인 참가자 찾기 (미사용 ID)
  const usedIds = new Set(
    participants
      .filter((p) => p.name && p.name !== "")
      .map((p) => parseInt(p.participantId.replace("P", "")))
  );

  for (let i = 1; i <= 70; i++) {
    if (!usedIds.has(i)) {
      return `P${String(i).padStart(3, "0")}`;
    }
  }

  throw new Error("All participant IDs are used");
}

/**
 * Participant ID로 참가자 정보를 조회합니다
 */
export async function getParticipantById(participantId: string) {
  const participants = await getAllParticipants();
  return participants.find((p) => p.participantId === participantId);
}

/**
 * Participant 정보를 업데이트합니다
 */
export async function updateParticipant(
  participantId: string,
  updates: Partial<{
    name: string;
    studentId: string;
    phoneNumber: string;
    startTime: string;
    endTime: string;
    status: string;
    completionRate: string;
    notes: string;
    researcherName: string;
  }>
) {
  const participants = await getAllParticipants();
  const rowIndex = participants.findIndex(
    (p) => p.participantId === participantId
  );

  if (rowIndex === -1) {
    throw new Error(`Participant ${participantId} not found`);
  }

  const row = participants[rowIndex];
  const updatedRow = [
    row.participantId, // A: participant_id
    updates.name ?? row.name, // B: name
    updates.studentId ?? row.studentId, // C: student_id
    updates.phoneNumber ?? row.phoneNumber, // D: phone_number
    row.group, // E: group
    row.conditionType, // F: condition_type
    row.autType, // G: aut_type
    updates.startTime ?? row.timestamp, // H: timestamp
    updates.researcherName ?? row.researcherName, // I: researcher_name
  ];

  await updateSheet("participants", `A${rowIndex + 2}:I${rowIndex + 2}`, [
    updatedRow,
  ]);
}

/**
 * AUT 데이터를 저장합니다
 */
export async function saveAUTData(data: {
  participantId: string;
  autRound: number;
  point: string;
  objectName: string;
  response: string;
  responseTime: number;
  timestamp: string;
}) {
  const row = [
    data.participantId,
    data.autRound,
    data.point,
    data.objectName,
    data.response,
    data.responseTime,
    data.timestamp,
  ];

  await appendToSheet("aut_data", [row]);
}

/**
 * Measurement 데이터를 저장합니다
 */
export async function saveMeasurementData(data: {
  participantId: string;
  measurementType: string;
  point: string;
  questionNumber: number;
  response: string;
  responseTime: number;
  timestamp: string;
}) {
  const row = [
    data.participantId,
    data.measurementType,
    data.point,
    data.questionNumber,
    data.response,
    data.responseTime,
    data.timestamp,
  ];

  await appendToSheet("measurement_data", [row]);
}

/**
 * Task 데이터를 저장합니다
 */
export async function saveTaskData(data: {
  participantId: string;
  taskNumber: number;
  taskType: string;
  problemVersion: string;
  llmCondition: string;
  startTime: string;
  submitTime: string;
  duration: number;
  answer: string;
  wordCount: number;
}) {
  const row = [
    data.participantId,
    data.taskNumber,
    data.taskType,
    data.problemVersion,
    data.llmCondition,
    data.startTime,
    data.submitTime,
    data.duration,
    data.answer,
    data.wordCount,
  ];

  await appendToSheet("task_data", [row]);
}
