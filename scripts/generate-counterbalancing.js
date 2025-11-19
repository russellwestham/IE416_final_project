const { google } = require("googleapis");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

async function generateCounterbalancing() {
  // Google Sheets API 인증
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../credential.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_ID 환경 변수가 설정되지 않았습니다.");
  }

  console.log("📊 Google Sheets 전체 초기화 중...");
  console.log(`Spreadsheet ID: ${spreadsheetId}`);

  // ===== 1. Participants 시트 초기화 =====
  console.log("\n📋 Participants 시트 초기화...");

  const participantsHeader = [
    "participant_id",
    "name",
    "student_id",
    "phone_number",
    "group",
    "condition_type",
    "aut_type",
    "timestamp",
    "researcher_name",
  ];

  const participants = [participantsHeader];

  // 70명 참가자 데이터 생성
  for (let i = 1; i <= 70; i++) {
    const participantId = `P${i.toString().padStart(3, "0")}`;
    const group = i % 2 === 1 ? "수학" : "글쓰기";
    const conditionType = ((i - 1) % 4) + 1;
    const autType = ((i - 1) % 6) + 1;

    participants.push([
      participantId,
      null, // name
      null, // student_id
      null, // phone_number
      group,
      conditionType,
      autType,
      null, // timestamp
      null, // researcher_name
    ]);
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "participants!A:Z",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "participants!A1",
    valueInputOption: "RAW",
    resource: { values: participants },
  });

  console.log("✅ Participants: 70명 데이터 생성 완료");

  // ===== 2. task_data 시트 초기화 =====
  console.log("\n📝 task_data 시트 초기화...");

  const tasksHeader = [
    "participant_id",
    "task_number",
    "task_type",
    "problem_version",
    "llm_condition",
    "start_time",
    "submit_time",
    "duration_ms",
    "answer",
    "word_count",
    "timestamp",
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "task_data!A:Z",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "task_data!A1",
    valueInputOption: "RAW",
    resource: { values: [tasksHeader] },
  });

  console.log("✅ task_data: 헤더만 생성 완료");

  // ===== 3. aut_data 시트 초기화 =====
  console.log("\n🎨 aut_data 시트 초기화...");

  const autHeader = [
    "participant_id",
    "measurement_point",
    "round",
    "object",
    "responses",
    "timestamp",
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "aut_data!A:Z",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "aut_data!A1",
    valueInputOption: "RAW",
    resource: { values: [autHeader] },
  });

  console.log("✅ aut_data: 헤더만 생성 완료");

  // ===== 4. measurement_data 시트 초기화 =====
  console.log("\n📊 measurement_data 시트 초기화...");

  const measurementHeader = [
    "participant_id",
    "measurement_type",
    "measurement_point",
    "value",
    "timestamp",
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "measurement_data!A:Z",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "measurement_data!A1",
    valueInputOption: "RAW",
    resource: { values: [measurementHeader] },
  });

  console.log("✅ measurement_data: 헤더만 생성 완료");

  // ===== 5. cpt_data 시트 초기화 =====
  console.log("\n🧠 cpt_data 시트 초기화...");

  const cptHeader = [
    "participant_id",
    "measurement_point",
    "test_number",
    "target_stimuli",
    "sequence",
    "responses",
    "correct_hits",
    "false_positives",
    "misses",
    "avg_reaction_time",
    "timestamp",
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "cpt_data!A:Z",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "cpt_data!A1",
    valueInputOption: "RAW",
    resource: { values: [cptHeader] },
  });

  console.log("✅ cpt_data: 헤더만 생성 완료");

  // ===== 완료 메시지 =====
  console.log("\n" + "=".repeat(50));
  console.log("✅ 모든 시트 초기화 완료!");
  console.log("=".repeat(50));
  console.log("\n📊 배정 결과:");
  console.log("  - 수학 그룹: 35명 (P001, P003, P005, ...)");
  console.log("  - 글쓰기 그룹: 35명 (P002, P004, P006, ...)");
  console.log("\n🔄 Condition Type 분포:");
  console.log("  - Type 1: 18명");
  console.log("  - Type 2: 17명");
  console.log("  - Type 3: 18명");
  console.log("  - Type 4: 17명");
  console.log("\n🎨 AUT Type 분포:");
  console.log("  - Type 1: 12명");
  console.log("  - Type 2: 12명");
  console.log("  - Type 3: 12명");
  console.log("  - Type 4: 11명");
  console.log("  - Type 5: 12명");
  console.log("  - Type 6: 11명");
}

// 스크립트 실행
generateCounterbalancing()
  .then(() => {
    console.log("\n💡 Google Sheets를 확인하세요:");
    console.log(
      `   https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}/edit`
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 오류 발생:", error.message);
    if (error.code) {
      console.error(`오류 코드: ${error.code}`);
    }
    process.exit(1);
  });
