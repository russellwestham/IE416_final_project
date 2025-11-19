# 데이터 스키마 (Data Schema)

> **이 문서는**: Google Sheets 데이터베이스 구조를 정의합니다.  
> **대상**: 데이터 엔지니어, 백엔드 개발자  
> **목적**: 저장할 데이터의 구조와 제약조건을 명확히 정의

---

## 📚 관련 문서

| 문서                                         | 역할             | 언제 보나요?                    |
| -------------------------------------------- | ---------------- | ------------------------------- |
| **data-schema.md** (현재)                    | 데이터 구조 정의 | DB 설계, 데이터 저장/조회       |
| [`api-specs.md`](api-specs.md)               | API 명세         | 엔드포인트 구현, 요청/응답 처리 |
| [`experiment-logic.md`](experiment-logic.md) | 실험 설계 로직   | 카운터밸런싱 이해, 조건 배정    |
| [`setup-guide.md`](setup-guide.md)           | 환경 구축 가이드 | 프로젝트 초기 설정              |

**💡 작업별 문서 조합**:

- **데이터베이스 설계**: `data-schema.md` (현재)
- **API 개발**: [`api-specs.md`](api-specs.md) + `data-schema.md` (현재)
- **데이터 분석**: `data-schema.md` (현재) + [`experiment-logic.md`](experiment-logic.md)

---

## 목차

1. [데이터베이스 개요](#-데이터베이스-개요)
2. [데이터 초기화 방식](#-데이터-초기화-방식)
3. [Sheet 1: participants](#sheet-1-participants-참가자-기본-정보)
4. [Sheet 2: aut_data](#sheet-2-aut_data-창의력-데이터)
5. [Sheet 3: measurement_data](#sheet-3-measurement_data-참을성집중력-데이터)
6. [Sheet 4: task_data](#sheet-4-task_data-과제-수행-데이터)
7. [데이터 저장 흐름](#-데이터-저장-흐름)

---

## 🗄️ 데이터베이스 개요

**플랫폼**: Google Sheets (Google Sheets API v4 사용)  
**스프레드시트**: 1개 (4개 시트로 구성)

**시트 구성**:

| 시트명         | 역할                       | 행 수 (70명 기준) | 업데이트 시점 |
| -------------- | -------------------------- | ----------------- | ------------- |
| `participants` | 참가자 기본 정보           | 71 (헤더 + 70명)  | 실험 전 + 중  |
| `aut_data`     | 창의력 테스트 데이터       | 211 (헤더 + 210)  | 실험 중       |
| `cpt_data`     | 집중력 테스트 (CPT) 데이터 | 211 (헤더 + 210)  | 실험 중       |
| `task_data`    | 과제 수행 데이터           | 141 (헤더 + 140)  | 실험 중       |

**총 데이터 행 수**: 약 634행 (헤더 포함)

---

## ⚠️ 데이터 초기화 방식

### 실험 전 준비

**1회 실행**: `scripts/generate-counterbalancing.js`

```
실행 결과:
└─ Google Sheets `participants` 시트에 P001~P070 행 자동 생성
   ├─ condition_type: 1~4 순환 배정
   ├─ aut_type: 1~6 순환 배정
   ├─ group: 홀수는 "수학", 짝수는 "글쓰기"
   └─ name, student_id, phone_number, timestamp, researcher_name: NULL 상태
```

### 실험 중 데이터 저장

```
참가자 등록 시:
1. participants 시트에서 name이 NULL인 가장 작은 ID 찾기
2. 해당 행의 NULL 컬럼만 업데이트 (name, student_id, email, timestamp)
2. 해당 행의 NULL 컬럼만 업데이트 (name, student_id, phone_number, timestamp, researcher_name)
3. 카운터밸런싱 정보(condition_type, aut_type, group)는 변경 안 함
```

**핵심 원칙**:

- ✅ 70명의 카운터밸런싱 정보는 **사전 생성** (변경 불가)
- ✅ 참가자 정보는 **실험 중 추가**만 가능 (행 삭제/재생성 불가)
- ✅ 다른 3개 시트(aut_data, measurement_data, task_data)는 **INSERT만** 수행

---

## Sheet 1: participants (참가자 기본 정보)

### 📋 용도

- 참가자의 기본 정보와 카운터밸런싱 조건 저장
- 실험 참가자 1명당 **1개 행**

### 초기 상태 (실험 전)

| participant_id | name | student_id | phone_number | group  | condition_type | aut_type | timestamp | researcher_name |
| -------------- | ---- | ---------- | ------------ | ------ | -------------- | -------- | --------- | --------------- |
| P001           | NULL | NULL       | NULL         | 수학   | 1              | 1        | NULL      |
| P002           | NULL | NULL       | NULL         | 글쓰기 | 2              | 2        | NULL      |
| P003           | NULL | NULL       | NULL         | 수학   | 3              | 3        | NULL      |
| ...            | ...  | ...        | ...          | ...    | ...            | ...      | ...       |
| P070           | NULL | NULL       | NULL         | 글쓰기 | 2              | 4        | NULL      |

### 실험 후 (P001 참가자가 완료한 경우)

| participant_id | name   | student_id | phone_number  | group  | condition_type | aut_type | timestamp           | researcher_name |
| -------------- | ------ | ---------- | ------------- | ------ | -------------- | -------- | ------------------- | --------------- |
| P001           | 홍길동 | 20240001   | 010-1234-5678 | 수학   | 1              | 1        | 2025-11-13 14:30:00 | 김연구          |
| P002           | NULL   | NULL       | NULL          | 글쓰기 | 2              | 2        | NULL                |
| ...            | ...    | ...        | ...           | ...    | ...            | ...      | ...                 |

### 스키마

| 컬럼명            | 데이터 타입 | 초기값       | 업데이트 시점 | 제약조건                      | 설명                            |
| ----------------- | ----------- | ------------ | ------------- | ----------------------------- | ------------------------------- |
| `participant_id`  | STRING      | ✅ 사전 생성 | -             | PRIMARY KEY, UNIQUE, NOT NULL | 고유 ID (P001~P070)             |
| `name`            | STRING      | NULL         | 실험 시       | NOT NULL (실험 후)            | 참가자 이름                     |
| `student_id`      | STRING      | NULL         | 실험 시       | NOT NULL (실험 후)            | 학번 (8자리)                    |
| `phone_number`    | STRING      | NULL         | 실험 시       | NOT NULL (실험 후)            | 연락처 (전화번호)               |
| `group`           | STRING      | ✅ 사전 생성 | -             | ENUM("수학", "글쓰기")        | 배정된 과제 그룹                |
| `condition_type`  | INTEGER     | ✅ 사전 생성 | -             | RANGE(1, 4)                   | 조건 순서 타입                  |
| `aut_type`        | INTEGER     | ✅ 사전 생성 | -             | RANGE(1, 6) [⚠️ 사용 안 함]   | AUT 물건 순서 (랜덤화로 대체됨) |
| `timestamp`       | DATETIME    | NULL         | 실험 시       | ISO 8601 FORMAT               | 실험 시작 시간                  |
| `researcher_name` | STRING      | NULL         | 실험 시       | NOT NULL (실험 후)            | 연구자 이름                     |

### 인덱스 및 제약조건

- **PRIMARY KEY**: `participant_id`
- **INDEX**: `name` (NULL 체크용 - 미사용 ID 검색에 사용)
- **UNIQUE**: `participant_id`, `email` (중복 방지)

### 카운터밸런싱 배정 규칙

```javascript
// 참가자 번호 i (1~70)
group = i % 2 === 1 ? "수학" : "글쓰기"; // 홀수: 수학, 짝수: 글쓰기
condition_type = ((i - 1) % 4) + 1; // 1~4 순환
aut_type = ((i - 1) % 6) + 1; // 1~6 순환
```

**분포**:

- 수학 그룹: 35명 (P001, P003, P005, ...)
- 글쓰기 그룹: 35명 (P002, P004, P006, ...) - 글쓰기 문제는 W1(전공 소개), W2(셔틀 공지)로 출제 (각 250자 내외)
- Condition Type 1~4: 각 17~18명
- AUT Type 1~6: 각 11~12명

---

## Sheet 2: aut_data (창의력 데이터)

### 📋 용도

- Alternative Uses Test (AUT) 결과 저장
- 참가자 1명당 **3개 행** (Pre/Mid/Post)

### 스키마

| 컬럼명              | 데이터 타입 | 제약조건                   | 설명                        | 예시                    |
| ------------------- | ----------- | -------------------------- | --------------------------- | ----------------------- |
| `participant_id`    | STRING      | FOREIGN KEY, NOT NULL      | 참가자 ID                   | P001                    |
| `measurement_point` | STRING      | ENUM("Pre", "Mid", "Post") | 측정 시점                   | Pre                     |
| `object`            | STRING      | NOT NULL                   | 제시된 물건                 | 벽돌                    |
| `ideas`             | TEXT        | NOT NULL                   | 아이디어 전체 (줄바꿈 구분) | "문진\n무기\n책상 고정" |
| `idea_count`        | INTEGER     | NOT NULL, >= 0             | 아이디어 개수               | 15                      |
| `timestamp`         | DATETIME    | NOT NULL, ISO 8601         | 완료 시간                   | 2025-11-13T14:35:00Z    |

### 데이터 예시

```csv
participant_id,measurement_point,object,ideas,idea_count,timestamp
P001,Pre,벽돌,"문진으로 사용\n무기로 사용\n예술 작품 재료",12,2025-11-13T14:35:00Z
P001,Mid,클립,"서류 정리\n장신구 만들기\n도구 제작",8,2025-11-13T14:42:00Z
P001,Post,종이컵,"화분으로 사용\n스피커 만들기\n장난감 재료",10,2025-11-13T14:55:00Z
```

### 측정 시점별 물건 배정

- **⚠️ 2025-11-19 업데이트**: 물건 배정은 이제 참가자별로 랜덤화됩니다
- 각 참가자는 "벽돌", "클립", "종이컵"을 랜덤한 순서로 받습니다 (시드 기반)
- 동일한 참가자는 항상 같은 순서를 유지합니다
- 상세한 매핑 규칙은 [`experiment-logic.md`](experiment-logic.md) 참조

---

## Sheet 3: cpt_data (집중력 테스트 데이터)

### 📋 용도

- Continuous Performance Test (CPT) 결과 저장
- 참가자 1명당 **3개 행** (Pre/Mid/Post)

### 스키마

| 컬럼명              | 데이터 타입 | 제약조건                   | 설명                   | 예시                                                     |
| ------------------- | ----------- | -------------------------- | ---------------------- | -------------------------------------------------------- |
| `participant_id`    | STRING      | FOREIGN KEY, NOT NULL      | 참가자 ID              | P001                                                     |
| `measurement_point` | STRING      | ENUM("pre", "mid", "post") | 측정 시점              | pre                                                      |
| `test_number`       | INTEGER     | ENUM(1, 2)                 | 테스트 번호 (1 또는 2) | 1                                                        |
| `target_stimuli`    | STRING      | NOT NULL                   | 타겟 자극 (콤마 구분)  | "3,H"                                                    |
| `sequence`          | STRING      | NOT NULL                   | 제시된 자극 시퀀스     | "8C9W4F3U7X8R..."                                        |
| `responses`         | TEXT        | NOT NULL                   | 반응 기록 (JSON 배열)  | [{"index":5,"stimulus":"3","rt":420,"correct":true},...] |
| `correct_hits`      | INTEGER     | NOT NULL, >= 0             | 올바른 반응 횟수       | 12                                                       |
| `false_positives`   | INTEGER     | NOT NULL, >= 0             | 잘못된 반응 횟수       | 3                                                        |
| `misses`            | INTEGER     | NOT NULL, >= 0             | 누락된 반응 횟수       | 2                                                        |
| `avg_reaction_time` | FLOAT       | NOT NULL, >= 0             | 평균 반응 시간 (ms)    | 485.5                                                    |
| `timestamp`         | DATETIME    | NOT NULL, ISO 8601         | 완료 시간              | 2025-11-19T14:35:00Z                                     |

### 데이터 예시

```csv
participant_id,measurement_point,test_number,target_stimuli,sequence,responses,correct_hits,false_positives,misses,avg_reaction_time,timestamp
P001,pre,1,"3,H","8C9W4F3U7X8R1V67I3L3S8TGE3J1HKZ5D9263AOYH4Q5BNP9XMFEU32H1RG563BZYH147986DCKLW3S2VOIP","[{""index"":5,""stimulus"":""3"",""rt"":420,""correct"":true},{""index"":17,""stimulus"":""3"",""rt"":380,""correct"":true}]",12,3,2,485.5,2025-11-19T14:35:00Z
P001,mid,2,"7,W","M95YQW7Z7L7C17R5N7A8W4DB9EJFOP3G7S8U26W7T4W3I1XK8W7H5ZPVW6QLDCRK9W7X2E7BGFSAW4OIPJY","[{""index"":6,""stimulus"":""7"",""rt"":390,""correct"":true}]",15,2,1,410.2,2025-11-19T14:45:00Z
P001,post,1,"3,H","8C9W4F3U7X8R1V67I3L3S8TGE3J1HKZ5D9263AOYH4Q5BNP9XMFEU32H1RG563BZYH147986DCKLW3S2VOIP","[{""index"":5,""stimulus"":""3"",""rt"":350,""correct"":true}]",13,1,1,395.8,2025-11-19T14:55:00Z
```

### 측정 시점별 테스트 배정

**⚠️ 2025-11-19 업데이트**: CPT 테스트 순서는 이제 참가자별로 랜덤화됩니다.

- **총 3개의 테스트 사용**: Test 1 (3, H), Test 2 (7, W), Test 3 (5, K)
- 각 참가자는 Pre, Mid, Post에서 **서로 다른 3개의 테스트**를 받습니다 (중복 없음)
- 테스트 순서는 시드 기반 랜덤으로 결정됩니다
- 동일한 참가자는 항상 같은 순서를 유지합니다
- 학습 효과와 순서 효과를 완전히 제거하여 집중력 측정의 정확도를 높입니다

**예시 (중복 없는 배정):**

| participant_id | Pre (Test)    | Mid (Test)    | Post (Test)   |
| -------------- | ------------- | ------------- | ------------- |
| P001           | Test 1 (3, H) | Test 2 (7, W) | Test 3 (5, K) |
| P002           | Test 2 (7, W) | Test 3 (5, K) | Test 1 (3, H) |
| P003           | Test 3 (5, K) | Test 1 (3, H) | Test 2 (7, W) |

**사용 가능한 테스트:**

| Test Number | Target Stimuli | Sequence Length | 타겟 개수 |
| ----------- | -------------- | --------------- | --------- |
| 1           | 3, H           | 80 stimuli      | 17개      |
| 2           | 7, W           | 80 stimuli      | 19개      |
| 3           | 5, K           | 80 stimuli      | 18개      |

### Response 데이터 구조

각 반응은 JSON 배열로 저장되며, 다음 정보를 포함:

```json
{
  "index": 5, // 시퀀스 내 위치 (0-based)
  "stimulus": "3", // 제시된 자극
  "rt": 420, // 반응 시간 (ms)
  "correct": true // 올바른 반응 여부
}
```

### 측정 지표 설명

| 지표                | 계산 방법                        | 의미                             |
| ------------------- | -------------------------------- | -------------------------------- |
| `correct_hits`      | 타겟 자극에 올바르게 반응한 횟수 | 집중력 유지 능력                 |
| `false_positives`   | 비타겟 자극에 잘못 반응한 횟수   | 충동 제어 능력 (낮을수록 좋음)   |
| `misses`            | 타겟 자극을 놓친 횟수            | 주의력 지속 능력 (낮을수록 좋음) |
| `avg_reaction_time` | 올바른 반응의 평균 반응 시간     | 처리 속도 (빠를수록 집중적)      |

---

## Sheet 4: measurement_data (참을성/집중력 데이터) [DEPRECATED]

### ⚠️ 상태: 사용 중단 (CPT로 대체됨)

### 📋 이전 용도

- 참을성 및 집중력 측정 결과 저장
- 참가자 1명당 **3개 행** (Pre/Mid/Post)

### 스키마

| 컬럼명              | 데이터 타입 | 제약조건                               | 설명      | 예시                 |
| ------------------- | ----------- | -------------------------------------- | --------- | -------------------- |
| `participant_id`    | STRING      | FOREIGN KEY, NOT NULL                  | 참가자 ID | P001                 |
| `measurement_point` | STRING      | ENUM("Pre", "Mid", "Post")             | 측정 시점 | Pre                  |
| `measurement_type`  | STRING      | ENUM("SART", "Unsolvable", "Skeleton") | 측정 유형 | Skeleton             |
| `metric_name`       | STRING      | NOT NULL                               | 지표 이름 | persistence_time     |
| `value`             | FLOAT       | NOT NULL                               | 측정값    | 180.5                |
| `timestamp`         | DATETIME    | NOT NULL, ISO 8601                     | 완료 시간 | 2025-11-13T14:40:00Z |

### 현재 상태 (Phase 0 - Skeleton)

```csv
participant_id,measurement_point,measurement_type,metric_name,value,timestamp
P001,Pre,Skeleton,dummy_value,0,2025-11-13T14:37:00Z
P001,Mid,Skeleton,dummy_value,0,2025-11-13T14:44:00Z
P001,Post,Skeleton,dummy_value,0,2025-11-13T14:57:00Z
```

### 추후 변경 예정 (Phase 1/2)

**SART 방식**:

```csv
P001,Pre,SART,commission_errors,5,2025-11-13T14:37:00Z
P001,Mid,SART,commission_errors,3,2025-11-13T14:44:00Z
P001,Post,SART,commission_errors,7,2025-11-13T14:57:00Z
```

**Unsolvable 방식**:

```csv
P001,Pre,Unsolvable,persistence_time,180.5,2025-11-13T14:37:00Z
P001,Mid,Unsolvable,persistence_time,240.2,2025-11-13T14:44:00Z
P001,Post,Unsolvable,persistence_time,150.8,2025-11-13T14:57:00Z
```

### 스키마 확장성

- `measurement_type`과 `metric_name`은 실험 방법 확정 후 변경 가능
- 현재는 "Skeleton" 타입으로 더미 데이터 저장
- 데이터 구조는 변경 없이 값만 업데이트 예정

---

## Sheet 5: task_data (과제 수행 데이터)

### 📋 용도

- 수학/글쓰기 과제 수행 결과 저장
- 참가자 1명당 **2개 행** (Task 1/2)

### 스키마

| 컬럼명             | 데이터 타입 | 제약조건              | 설명           | 예시                                                        |
| ------------------ | ----------- | --------------------- | -------------- | ----------------------------------------------------------- |
| `participant_id`   | STRING      | FOREIGN KEY, NOT NULL | 참가자 ID      | P001                                                        |
| `task_number`      | INTEGER     | ENUM(1, 2)            | 과제 번호      | 1                                                           |
| `problem_version`  | STRING      | ENUM("A", "B")        | 문제 버전      | A (글쓰기는 W1: 전공 소개, B: 셔틀 공지에 매핑, 250자 내외) |
| `llm_condition`    | STRING      | ENUM("Yes", "No")     | LLM 조건       | No                                                          |
| `answer`           | TEXT        | NOT NULL              | 답안 내용      | "답변 텍스트..."                                            |
| `correct_answer`   | TEXT        | NULL (실험 후 채움)   | 정답/모범 답안 | "정답 또는 모범 답안"                                       |
| `is_correct`       | BOOLEAN     | NULL (실험 후 채움)   | 정답 여부      | TRUE / FALSE / NULL                                         |
| `score`            | FLOAT       | NULL, RANGE(0, 100)   | 부분 점수      | 85.5                                                        |
| `evaluation_notes` | TEXT        | NULL                  | 평가 메모      | "논리 전개 우수"                                            |
| `time_spent`       | INTEGER     | NOT NULL, >= 0        | 소요 시간(초)  | 280                                                         |
| `timestamp`        | DATETIME    | NOT NULL, ISO 8601    | 완료 시간      | 2025-11-13T14:50:00Z                                        |

### 데이터 예시 (실험 중)

```csv
participant_id,task_number,problem_version,llm_condition,answer,correct_answer,is_correct,score,evaluation_notes,time_spent,timestamp
P001,1,A,No,"답변 내용...",NULL,NULL,NULL,NULL,280,2025-11-13T14:50:00Z
P001,2,B,Yes,"답변 내용...",NULL,NULL,NULL,NULL,295,2025-11-13T14:53:00Z
```

### 데이터 예시 (평가 완료 후)

```csv
participant_id,task_number,problem_version,llm_condition,answer,correct_answer,is_correct,score,evaluation_notes,time_spent,timestamp
P001,1,A,No,"답변 내용...","모범 답안",TRUE,95.0,"논리 전개 우수",280,2025-11-13T14:50:00Z
P001,2,B,Yes,"답변 내용...","모범 답안",FALSE,65.5,"개념 이해 부족",295,2025-11-13T14:53:00Z
```

### 평가 컬럼 설명

| 컬럼명             | 채워지는 시점 | 담당자 | 목적                             |
| ------------------ | ------------- | ------ | -------------------------------- |
| `correct_answer`   | 실험 후       | 연구자 | 정답 또는 모범 답안 기준 설정    |
| `is_correct`       | 실험 후       | 연구자 | 정답 여부 판정 (TRUE/FALSE/NULL) |
| `score`            | 실험 후       | 연구자 | 부분 점수 부여 (선택사항)        |
| `evaluation_notes` | 실험 후       | 연구자 | 평가 시 특이사항 메모            |

**평가 프로세스**:

1. 실험 중: `answer`, `time_spent`만 저장 (자동)
2. 실험 후: 연구자가 Google Sheets에서 직접 평가 컬럼 입력 (수동)
3. 데이터 분석: 평가 컬럼 기준으로 성적 분석

### 과제 조건 배정

- `problem_version`과 `llm_condition`은 `condition_type`에 따라 결정
- 상세한 매핑 규칙은 [`experiment-logic.md`](experiment-logic.md) 참조

---

## 📊 데이터 저장 흐름

### Phase 0: 실험 전 준비 (1회만 실행)

```
Step 1: 카운터밸런싱 데이터 생성
└─ scripts/generate-counterbalancing.js 실행
   └─ Sheet 1 (participants)에 P001~P070 생성
      ├─ condition_type: 1~4 순환 배정
      ├─ aut_type: 1~6 순환 배정
      ├─ group: 홀수는 수학, 짝수는 글쓰기
      └─ name, student_id, email, timestamp: NULL
     └─ name, student_id, phone_number, timestamp, researcher_name: NULL
```

### Phase 1: 실험 중 (참가자 1명당)

```
Step 1: 참가자 정보 입력
├─ 프론트엔드: 이름, 학번, 이메일 입력
├─ API: POST /api/participants
└─ Google Sheets 업데이트:
   └─ Sheet 1 (participants): 1개 행 UPDATE
      ├─ 가장 작은 미사용 ID 찾기 (WHERE name IS NULL)
      ├─ name, student_id, email, timestamp 업데이트
     ├─ name, student_id, phone_number, timestamp, researcher_name 업데이트
      └─ condition_type, aut_type, group 조회 및 반환

Step 2: AUT 수행 (Pre)
├─ 프론트엔드: AUT 완료 (아이디어 입력)
├─ API: POST /api/aut
└─ Google Sheets 업데이트:
   └─ Sheet 2 (aut_data): 1개 행 INSERT
      └─ participant_id, measurement_point="Pre", object, ideas, idea_count, timestamp

Step 3: 참을성/집중력 측정 (Pre)
├─ 프론트엔드: 측정 완료
├─ API: POST /api/measurement
└─ Google Sheets 업데이트:
   └─ Sheet 3 (measurement_data): 1개 행 INSERT
      └─ participant_id, measurement_point="Pre", measurement_type, metric_name, value, timestamp

Step 4: 과제 1 수행
├─ 프론트엔드: 과제 완료 (답변 입력)
├─ API: POST /api/task
└─ Google Sheets 업데이트:
   └─ Sheet 4 (task_data): 1개 행 INSERT
      └─ participant_id, task_number=1, problem_version, llm_condition, answer, time_spent, timestamp

Step 5: AUT 수행 (Mid)
└─ Step 2와 동일 (measurement_point="Mid")

Step 6: 참을성/집중력 측정 (Mid)
└─ Step 3과 동일 (measurement_point="Mid")

Step 7: 과제 2 수행
└─ Step 4와 동일 (task_number=2)

Step 8: AUT 수행 (Post)
└─ Step 2와 동일 (measurement_point="Post")

Step 9: 참을성/집중력 측정 (Post)
└─ Step 3과 동일 (measurement_point="Post")
```

### Phase 2: 실험 후 평가 (연구자가 수동으로 수행)

```
Step 1: Google Sheets에서 task_data 시트 열기

Step 2: 각 참가자의 답안 검토 후 평가 컬럼 입력
├─ correct_answer: 정답/모범 답안
├─ is_correct: TRUE/FALSE/NULL
├─ score: 0~100 점수
└─ evaluation_notes: 메모

Step 3: 데이터 분석 수행
└─ 평가 완료된 데이터를 기준으로 통계 분석
```

---

## 📈 데이터 용량 예측

**70명 참가 기준**:

| 시트명       | 행 수      | 예상 용량      |
| ------------ | ---------- | -------------- |
| participants | 71         | ~5 KB          |
| aut_data     | 211        | ~50 KB         |
| cpt_data     | 211        | ~100 KB        |
| task_data    | 141        | ~200 KB (답안) |
| **합계**     | **634 행** | **~355 KB**    |

**Google Sheets 제한**:

- 최대 셀 수: 1,000만 개 (현재 사용: ~4,500셀 ✅ 안전)
- 최대 파일 크기: 100 MB (현재 사용: ~355 KB ✅ 안전)

---

## 🔗 다음 단계

1. **API 구현**: [`api-specs.md`](api-specs.md)에서 각 시트에 데이터를 저장하는 API 엔드포인트 확인
2. **카운터밸런싱 이해**: [`experiment-logic.md`](experiment-logic.md)에서 condition_type과 aut_type의 매핑 규칙 확인
3. **환경 설정**: [`setup-guide.md`](setup-guide.md)에서 Google Sheets API 설정 방법 확인

---

**Last Updated**: 2025-11-13  
**Version**: 3.0 (technical-specs.md에서 분리)  
**Related**: [`api-specs.md`](api-specs.md), [`experiment-logic.md`](experiment-logic.md), [`setup-guide.md`](setup-guide.md)
