const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function resetAllSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

  try {
    console.log('🔄 Google Sheets 초기화 시작...\n');

    // 1. participants 시트 초기화 (헤더만 남기고 데이터 삭제)
    console.log('1️⃣ participants 시트 초기화 중...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'participants!A2:Z',
    });
    console.log('✅ participants 데이터 삭제 완료\n');

    // 2. cpt_data 시트 초기화
    console.log('2️⃣ cpt_data 시트 초기화 중...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'cpt_data!A2:Z',
    });
    console.log('✅ cpt_data 데이터 삭제 완료\n');

    // 3. aut_data 시트 초기화
    console.log('3️⃣ aut_data 시트 초기화 중...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'aut_data!A2:Z',
    });
    console.log('✅ aut_data 데이터 삭제 완료\n');

    // 4. measurement_data 시트 초기화
    console.log('4️⃣ measurement_data 시트 초기화 중...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'measurement_data!A2:Z',
    });
    console.log('✅ measurement_data 데이터 삭제 완료\n');

    // 5. task_data 시트 초기화
    console.log('5️⃣ task_data 시트 초기화 중...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'task_data!A2:Z',
    });
    console.log('✅ task_data 데이터 삭제 완료\n');

    // 6. survey_data 시트 초기화
    console.log('6️⃣ survey_data 시트 초기화 중...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'survey_data!A2:Z',
    });
    console.log('✅ survey_data 데이터 삭제 완료\n');

    console.log('🎉 모든 시트 초기화 완료!');
    console.log('📊 헤더는 유지되었으며, 데이터만 삭제되었습니다.');
    console.log('\n✨ Mock test를 시작할 준비가 완료되었습니다!');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (error.response) {
      console.error('상세:', error.response.data);
    }
  }
}

resetAllSheets();
