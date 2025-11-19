const { google } = require("googleapis");
require("dotenv").config({ path: ".env.local" });

async function setupSurveySheet() {
  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
  );
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

  try {
    // 1. 시트 목록 확인
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets.map(
      (s) => s.properties.title
    );
    console.log("기존 시트:", existingSheets);

    // 2. survey_data 시트가 없으면 생성
    if (!existingSheets.includes("survey_data")) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "survey_data",
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 8,
                  },
                },
              },
            },
          ],
        },
      });
      console.log("✅ survey_data 시트 생성 완료");
    } else {
      console.log("⚠️  survey_data 시트가 이미 존재합니다");
    }

    // 3. 헤더 설정
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "survey_data!A1:H1",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "participant_id",
            "measurement_point",
            "q1_cognitive_effort",
            "q2_concentration",
            "q3_idea_fluency",
            "q4_idea_originality",
            "q5_satisfaction",
            "timestamp",
          ],
        ],
      },
    });
    console.log("✅ 헤더 설정 완료");
  } catch (error) {
    console.error("❌ 오류 발생:", error.message);
  }
}

setupSurveySheet();
