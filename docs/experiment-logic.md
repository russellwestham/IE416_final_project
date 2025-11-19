# 실험 설계 로직 (Experiment Logic)

> **이 문서는**: 카운터밸런싱 로직과 실험 조건 매핑을 정의합니다.  
> **대상**: 연구자, 데이터 분석가, 백엔드 개발자  
> **목적**: 실험 설계의 원리와 구현 방법을 명확히 이해

---

## 📚 관련 문서

| 문서                               | 역할             | 언제 보나요?                   |
| ---------------------------------- | ---------------- | ------------------------------ |
| **experiment-logic.md** (현재)     | 실험 설계 로직   | 카운터밸런싱 이해, 데이터 분석 |
| [`data-schema.md`](data-schema.md) | 데이터 구조 정의 | 카운터밸런싱 데이터 저장       |
| [`api-specs.md`](api-specs.md)     | API 명세         | 조건 배정 API 구현             |
| [`setup-guide.md`](setup-guide.md) | 환경 구축 가이드 | 카운터밸런싱 데이터 생성       |

**💡 작업별 문서 조합**:

- **실험 설계 이해**: `experiment-logic.md` (현재)
- **데이터 생성**: `experiment-logic.md` (현재) + [`setup-guide.md`](setup-guide.md)
- **데이터 분석**: `experiment-logic.md` (현재) + [`data-schema.md`](data-schema.md)

---

## 목차

1. [카운터밸런싱 개요](#-카운터밸런싱-개요)
2. [Condition Type (조건 타입)](#-condition-type-조건-타입)
3. [AUT Type (AUT 타입)](#-aut-type-aut-타입)
4. [Group (과제 그룹)](#-group-과제-그룹)
5. [카운터밸런싱 생성 스크립트](#-카운터밸런싱-생성-스크립트)
6. [매핑 함수 (Runtime)](#-매핑-함수-runtime)
7. [데이터 분석 가이드](#-데이터-분석-가이드)

---

## 🎯 카운터밸런싱 개요

### 목적

**순서 효과(Order Effect) 제거**를 통한 실험의 내적 타당도 확보

1. **과제 순서 효과 제거**

   - Problem A/B 순서
   - LLM 조건 순서 (NoLLM → LLM vs LLM → NoLLM)

2. **학습 효과 제거**

   - AUT 물건 순서 (벽돌, 클립, 종이컵)
   - 측정 시점별 물건 다양화 (Pre/Mid/Post)

3. **균등 분배**
   - 모든 조건에 동일한(±1명) 참가자 배정
   - 통계 분석 시 비교 그룹 크기 균형

### 카운터밸런싱 변수 3가지

| 변수             | 범위        | 설명                      | 배정 방식       |
| ---------------- | ----------- | ------------------------- | --------------- |
| `condition_type` | 1~4         | 과제 순서 + LLM 조건 순서 | 순환 배정 (4개) |
| `aut_type`       | 1~6         | AUT 물건 순서             | 순환 배정 (6개) |
| `group`          | 수학/글쓰기 | 과제 도메인               | 홀짝 번호 기반  |

### 사전 생성 방식

**핵심 원칙**:

- 70명의 카운터밸런싱 정보는 **실험 전 사전 생성** (변경 불가)
- 참가자는 빈 ID 중 **가장 작은 번호를 자동 할당**받음
- 할당된 ID의 카운터밸런싱 정보를 그대로 사용

**장점**:

- 실험 중 조건 배정 오류 방지
- 데이터 분석 시 일관성 보장
- 참가자 모집 순서와 무관하게 균형 유지

---

## 🔄 Condition Type (조건 타입)

### 정의

**Condition Type**은 **과제 순서**와 **LLM 조건 순서**를 결정합니다.

### 4가지 타입

| condition_type | LLM 순서    | 문제 순서 | Task 1             | Task 2             |
| -------------- | ----------- | --------- | ------------------ | ------------------ |
| **1**          | NoLLM → LLM | A → B     | Problem A / No LLM | Problem B / LLM    |
| **2**          | NoLLM → LLM | B → A     | Problem B / No LLM | Problem A / LLM    |
| **3**          | LLM → NoLLM | A → B     | Problem A / LLM    | Problem B / No LLM |
| **4**          | LLM → NoLLM | B → A     | Problem B / LLM    | Problem A / No LLM |

### 설계 의도

**LLM 순서 균형**:

- Type 1, 2: NoLLM → LLM (35명)
- Type 3, 4: LLM → NoLLM (35명)
- → LLM 사용 순서에 따른 편향 제거

**문제 순서 균형**:

- Type 1, 3: A → B (35명)
- Type 2, 4: B → A (35명)
- → 문제 난이도 차이에 따른 편향 제거

### 배정 로직

```javascript
// 참가자 번호 1~70
for (let i = 1; i <= 70; i++) {
  const conditionType = ((i - 1) % 4) + 1;
  // P001 → 1, P002 → 2, P003 → 3, P004 → 4, P005 → 1, ...
}
```

### 배정 결과 (70명 기준)

| condition_type | 참가자 수 | 참가자 ID 예시        |
| -------------- | --------- | --------------------- |
| 1              | 18명      | P001, P005, P009, ... |
| 2              | 17명      | P002, P006, P010, ... |
| 3              | 18명      | P003, P007, P011, ... |
| 4              | 17명      | P004, P008, P012, ... |

---

## 📝 AUT Type (AUT 타입)

### 정의

**AUT Type**은 **Alternative Uses Test**에서 제시되는 **물건의 순서**를 결정합니다.

### ⚠️ 중요 변경사항 (2025-11-19)

**물건 순서는 이제 참가자별로 랜덤화됩니다.**

- 각 참가자는 "벽돌", "클립", "종이컵" 3개 물건을 랜덤한 순서로 받습니다
- 동일한 참가자는 항상 같은 순서를 유지합니다 (시드 기반 랜덤)
- 순서 효과(order effect)를 제거하여 물건 자체의 영향만 측정합니다

### 랜덤화 로직

```typescript
// 시드 기반 Fisher-Yates shuffle
// 참가자 ID(예: P001 → seed=1)를 시드로 사용
function generateAUTObjectOrder(participantId: string): {
  pre: string;
  mid: string;
  post: string;
} {
  const seed = parseInt(participantId.replace("P", ""));
  const shuffled = seededShuffle(["벽돌", "클립", "종이컵"], seed);

  return {
    pre: shuffled[0],
    mid: shuffled[1],
    post: shuffled[2],
  };
}
```

### 예시

| participant_id | Pre    | Mid    | Post   |
| -------------- | ------ | ------ | ------ |
| P001           | 클립   | 종이컵 | 벽돌   |
| P002           | 벽돌   | 클립   | 종이컵 |
| P003           | 종이컵 | 벽돌   | 클립   |

**각 참가자마다 순서가 다르지만, 동일한 참가자는 항상 같은 순서를 받습니다.**

### 설계 의도

**순서 효과 제거**:

- 이전에는 모든 참가자가 동일한 순서를 따랐으나, 이는 순서 효과를 유발할 수 있습니다
- 랜덤화를 통해 순서 효과를 균등하게 분산시킵니다
- 물건 자체의 창의력 자극 효과만을 순수하게 측정할 수 있습니다

### 배정 로직

```javascript
// 참가자 번호 1~70
for (let i = 1; i <= 70; i++) {
  const autType = ((i - 1) % 6) + 1;
  // P001 → 1, P002 → 2, P003 → 3, P004 → 4, P005 → 5, P006 → 6, P007 → 1, ...
}
```

### 배정 결과 (70명 기준)

| aut_type | 참가자 수 | 참가자 ID 예시        |
| -------- | --------- | --------------------- |
| 1        | 12명      | P001, P007, P013, ... |
| 2        | 12명      | P002, P008, P014, ... |
| 3        | 12명      | P003, P009, P015, ... |
| 4        | 11명      | P004, P010, P016, ... |
| 5        | 12명      | P005, P011, P017, ... |
| 6        | 11명      | P006, P012, P018, ... |

---

## 👥 Group (과제 그룹)

### 정의

**Group**은 참가자가 수행할 **과제 도메인** (수학 vs 글쓰기)을 결정합니다.

### 2가지 그룹

| group  | 참가자 수 | 과제 내용                                                         |
| ------ | --------- | ----------------------------------------------------------------- |
| 수학   | 35명      | 수학 문제 2개                                                     |
| 글쓰기 | 35명      | 글쓰기 문제 2개 (W1: 전공 소개문, W2: 셔틀 공지문, 각 250자 내외) |

### 배정 로직

```javascript
// 참가자 번호 1~70
for (let i = 1; i <= 70; i++) {
  const group = i % 2 === 1 ? "수학" : "글쓰기";
  // 홀수: 수학, 짝수: 글쓰기
}
```

### 배정 결과 (70명 기준)

| group  | 참가자 수 | 참가자 ID 예시              |
| ------ | --------- | --------------------------- |
| 수학   | 35명      | P001, P003, P005, ..., P069 |
| 글쓰기 | 35명      | P002, P004, P006, ..., P070 |

---

## 🛠️ 카운터밸런싱 생성 스크립트

### 스크립트 개요

**목적**: Google Sheets `participants` 시트에 P001~P070 행을 사전 생성

**파일**: `scripts/generate-counterbalancing.js`

### 전체 코드

```javascript
const { google } = require("googleapis");
const path = require("path");

async function generateCounterbalancing() {
  // Google Sheets API 인증
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../credentials.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_ID 환경 변수가 설정되지 않았습니다.");
  }

  // 참가자 데이터 생성
  const participants = [];

  // 헤더 행
  const header = [
    "participant_id",
    "name",
    "student_id",
    "email",
    "group",
    "condition_type",
    "aut_type",
    "timestamp",
  ];
  participants.push(header);

  // 70명 참가자 데이터 생성
  for (let i = 1; i <= 70; i++) {
    const participantId = `P${i.toString().padStart(3, "0")}`;

    // 그룹 배정: 홀수는 수학, 짝수는 글쓰기
    const group = i % 2 === 1 ? "수학" : "글쓰기";

    // Condition Type: 1~4 순환
    const conditionType = ((i - 1) % 4) + 1;

    // AUT Type: 1~6 순환
    const autType = ((i - 1) % 6) + 1;

    participants.push([
      participantId, // A: participant_id
      null, // B: name (실험 시 채움)
      null, // C: student_id (실험 시 채움)
      null, // D: email (실험 시 채움)
      group, // E: group
      conditionType, // F: condition_type
      autType, // G: aut_type
      null, // H: timestamp (실험 시 채움)
    ]);
  }

  // Google Sheets에 저장
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "participants!A1",
    valueInputOption: "RAW",
    resource: {
      values: participants,
    },
  });

  console.log("✅ 70명분 카운터밸런싱 데이터 생성 완료");
  console.log("\n=== 배정 결과 ===");
  console.log("- 수학 그룹: 35명");
  console.log("- 글쓰기 그룹: 35명");
  console.log("- Condition Type 1: 18명");
  console.log("- Condition Type 2: 17명");
  console.log("- Condition Type 3: 18명");
  console.log("- Condition Type 4: 17명");
  console.log("- AUT Type 1: 12명");
  console.log("- AUT Type 2: 12명");
  console.log("- AUT Type 3: 12명");
  console.log("- AUT Type 4: 11명");
  console.log("- AUT Type 5: 12명");
  console.log("- AUT Type 6: 11명");
}

// 스크립트 실행
generateCounterbalancing()
  .then(() => {
    console.log("\n✅ 카운터밸런싱 데이터 생성 완료!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
```

### 실행 방법

```bash
# 환경 변수와 함께 실행
GOOGLE_SHEETS_ID=your_spreadsheet_id node scripts/generate-counterbalancing.js

# 또는 .env.local 사용
node -r dotenv/config scripts/generate-counterbalancing.js
```

### 실행 결과

Google Sheets `participants` 시트에 다음과 같은 데이터가 생성됩니다:

| participant_id | name | student_id | email | group  | condition_type | aut_type | timestamp |
| -------------- | ---- | ---------- | ----- | ------ | -------------- | -------- | --------- |
| P001           | NULL | NULL       | NULL  | 수학   | 1              | 1        | NULL      |
| P002           | NULL | NULL       | NULL  | 글쓰기 | 2              | 2        | NULL      |
| P003           | NULL | NULL       | NULL  | 수학   | 3              | 3        | NULL      |
| ...            | ...  | ...        | ...   | ...    | ...            | ...      | ...       |
| P070           | NULL | NULL       | NULL  | 글쓰기 | 2              | 4        | NULL      |

---

## 🔌 매핑 함수 (Runtime)

### 함수 개요

실험 실행 중 참가자의 `condition_type`과 `aut_type`을 기반으로 실제 조건을 매핑합니다.

**파일**: `lib/counterbalancing.js`

### 전체 코드

```javascript
/**
 * Condition Type에 따른 Task 구성 반환
 * @param {number} conditionType - 1~4
 * @returns {Object} - { task1: { problem, llm }, task2: { problem, llm } }
 */
export function getTaskConfig(conditionType) {
  const configs = {
    1: {
      task1: { problem: "A", llm: "No" },
      task2: { problem: "B", llm: "Yes" },
    },
    2: {
      task1: { problem: "B", llm: "No" },
      task2: { problem: "A", llm: "Yes" },
    },
    3: {
      task1: { problem: "A", llm: "Yes" },
      task2: { problem: "B", llm: "No" },
    },
    4: {
      task1: { problem: "B", llm: "Yes" },
      task2: { problem: "A", llm: "No" },
    },
  };

  if (!(conditionType in configs)) {
    throw new Error(`Invalid condition_type: ${conditionType}. Must be 1-4.`);
  }

  return configs[conditionType];
}

/**
 * AUT Type에 따른 물건 순서 반환
 * @param {number} autType - 1~6
 * @returns {Object} - { pre, mid, post }
 */
export function getAUTObjects(autType) {
  const objects = {
    1: { pre: "벽돌", mid: "클립", post: "종이컵" },
    2: { pre: "벽돌", mid: "종이컵", post: "클립" },
    3: { pre: "클립", mid: "벽돌", post: "종이컵" },
    4: { pre: "클립", mid: "종이컵", post: "벽돌" },
    5: { pre: "종이컵", mid: "벽돌", post: "클립" },
    6: { pre: "종이컵", mid: "클립", post: "벽돌" },
  };

  if (!(autType in objects)) {
    throw new Error(`Invalid aut_type: ${autType}. Must be 1-6.`);
  }

  return objects[autType];
}

/**
 * 측정 시점에 따른 AUT 물건 반환
 * @param {number} autType - 1~6
 * @param {string} point - 'pre' | 'mid' | 'post'
 * @returns {string} - 물건 이름
 */
export function getAUTObject(autType, point) {
  const objects = getAUTObjects(autType);

  const pointMap = {
    Pre: "pre",
    Mid: "mid",
    Post: "post",
  };

  const normalizedPoint = pointMap[point] || point.toLowerCase();

  if (!(normalizedPoint in objects)) {
    throw new Error(
      `Invalid measurement point: ${point}. Must be 'Pre', 'Mid', or 'Post'.`
    );
  }

  return objects[normalizedPoint];
}

/**
 * 참가자 ID로부터 카운터밸런싱 정보 계산 (백업용)
 * @param {string} participantId - P001~P070
 * @returns {Object} - { group, conditionType, autType }
 */
export function calculateCounterbalancing(participantId) {
  const match = participantId.match(/^P(\d{3})$/);
  if (!match) {
    throw new Error(`Invalid participant_id format: ${participantId}`);
  }

  const num = parseInt(match[1], 10);

  if (num < 1 || num > 70) {
    throw new Error(
      `Participant ID out of range: ${participantId}. Must be P001-P070.`
    );
  }

  const group = num % 2 === 1 ? "수학" : "글쓰기";
  const conditionType = ((num - 1) % 4) + 1;
  const autType = ((num - 1) % 6) + 1;

  return { group, conditionType, autType };
}
```

### 사용 예시

```javascript
import {
  getTaskConfig,
  getAUTObject,
  getAUTObjects,
  calculateCounterbalancing,
} from "@/lib/counterbalancing";

// 예시 1: Condition Type 1 참가자의 Task 구성
const taskConfig = getTaskConfig(1);
console.log(taskConfig);
// {
//   task1: { problem: 'A', llm: 'No' },
//   task2: { problem: 'B', llm: 'Yes' }
// }

// 예시 2: AUT Type 3 참가자의 Pre 시점 물건
const object = getAUTObject(3, "Pre");
console.log(object); // '클립'

// 예시 3: AUT Type 3 참가자의 전체 물건 순서
const objects = getAUTObjects(3);
console.log(objects); // { pre: '클립', mid: '벽돌', post: '종이컵' }

// 예시 4: 참가자 ID로 카운터밸런싱 계산 (백업용)
const info = calculateCounterbalancing("P015");
console.log(info);
// { group: '수학', conditionType: 3, autType: 3 }
```

### 프론트엔드 통합

```javascript
// app/experiment/task/page.js
import { useExperiment } from "@/contexts/ExperimentContext";
import { getTaskConfig } from "@/lib/counterbalancing";

export default function TaskPage() {
  const { experimentData } = useExperiment();
  const { condition_type, currentTask } = experimentData;

  // Task 조건 가져오기
  const taskConfig = getTaskConfig(condition_type);
  const currentTaskConfig = taskConfig[`task${currentTask}`];

  return (
    <div>
      <h1>Task {currentTask}</h1>
      <p>문제: {currentTaskConfig.problem}</p>
      <p>LLM 조건: {currentTaskConfig.llm}</p>
    </div>
  );
}
```

---

## 🔗 다음 단계

1. **데이터 생성**: [`setup-guide.md`](setup-guide.md)에서 카운터밸런싱 스크립트 실행 방법 확인
2. **데이터 저장**: [`data-schema.md`](data-schema.md)에서 각 시트의 구조 확인
3. **API 구현**: [`api-specs.md`](api-specs.md)에서 조건 매핑 API 구현 방법 확인

---

**Last Updated**: 2025-11-13  
**Version**: 1.0 (technical-specs.md에서 분리)  
**Related**: [`data-schema.md`](data-schema.md), [`api-specs.md`](api-specs.md), [`setup-guide.md`](setup-guide.md)
