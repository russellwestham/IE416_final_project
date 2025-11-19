const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function generateParticipants() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

  try {
    console.log('📊 Participants 시트에 P001~P070 생성 중...\n');

    const participantsHeader = [
      'participant_id',
      'name',
      'student_id',
      'phone_number',
      'group',
      'condition_type',
      'aut_type',
      'timestamp',
      'researcher_name',
    ];

    const participants = [participantsHeader];

    // 70명 참가자 데이터 생성
    for (let i = 1; i <= 70; i++) {
      const participantId = `P${i.toString().padStart(3, '0')}`;
      const group = i % 2 === 1 ? '수학' : '글쓰기';
      const conditionType = ((i - 1) % 4) + 1;
      const autType = ((i - 1) % 6) + 1;

      participants.push([
        participantId,
        '', // name (빈 문자열)
        '', // student_id
        '', // phone_number
        group,
        conditionType,
        autType,
        '', // timestamp
        '', // researcher_name
      ]);
    }

    // 기존 데이터 삭제
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'participants!A:Z',
    });

    // 새 데이터 삽입
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'participants!A1',
      valueInputOption: 'RAW',
      requestBody: { values: participants },
    });

    console.log('✅ P001~P070 생성 완료!');
    console.log('\n📊 카운터밸런싱 정보:');
    console.log('- Condition Type: 1~4 순환 배정');
    console.log('- AUT Type: 1~6 순환 배정');
    console.log('- Group: 홀수(수학), 짝수(글쓰기)');
    console.log('\n✨ 참가자 등록을 시작할 수 있습니다!');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

generateParticipants();
