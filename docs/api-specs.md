# API 명세서 (API Specifications)

> **이 문서는**: 백엔드 API 엔드포인트와 에러 처리를 정의합니다.  
> **대상**: 백엔드 개발자, 프론트엔드 개발자  
> **목적**: API 요청/응답 형식과 에러 처리 방법을 명확히 정의

---

## 📚 관련 문서

| 문서                                         | 역할             | 언제 보나요?                  |
| -------------------------------------------- | ---------------- | ----------------------------- |
| **api-specs.md** (현재)                      | API 명세         | API 구현, 프론트엔드 연동     |
| [`data-schema.md`](data-schema.md)           | 데이터 구조 정의 | 데이터베이스 스키마 확인      |
| [`experiment-logic.md`](experiment-logic.md) | 실험 설계 로직   | 카운터밸런싱 로직 이해        |
| [`setup-guide.md`](setup-guide.md)           | 환경 구축 가이드 | 환경 변수, Google Sheets 설정 |

**💡 작업별 문서 조합**:

- **API 개발**: `api-specs.md` (현재) + [`data-schema.md`](data-schema.md)
- **프론트엔드 개발**: `api-specs.md` (현재) + [`product-requirements.md`](product-requirements.md)
- **에러 디버깅**: `api-specs.md` (현재) + [`setup-guide.md`](setup-guide.md)

---

## 목차

1. [API 개요](#-api-개요)
2. [공통 사항](#-공통-사항)
3. [API 엔드포인트](#-api-엔드포인트)
4. [에러 처리](#-에러-처리)
5. [타이머 로직](#-타이머-로직)
6. [에러 로깅](#-에러-로깅)

---

## 🔌 API 개요

**프레임워크**: Next.js 15 App Router API Routes  
**인증**: 없음 (실험용 내부 앱)  
**데이터베이스**: Google Sheets API v4  
**응답 형식**: JSON

### API 설계 원칙

1. **RESTful 설계**: 리소스 중심 엔드포인트
2. **일관된 응답 형식**: `{ success: boolean, ... }` 구조
3. **명확한 에러 메시지**: 사용자가 이해할 수 있는 메시지
4. **원자적 작업**: 각 API는 하나의 책임만 수행
5. **멱등성 보장**: 동일한 요청을 여러 번 보내도 결과 동일

---

## 📋 공통 사항

### 요청 헤더

```http
Content-Type: application/json
```

### 공통 응답 형식

**성공**:

```json
{
  "success": true,
  "message": "작업이 완료되었습니다.",
  "data": {
    /* 응답 데이터 */
  }
}
```

**실패**:

```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

### 에러 코드

| 코드                    | HTTP Status | 설명                         |
| ----------------------- | ----------- | ---------------------------- |
| `NO_AVAILABLE_ID`       | 503         | 사용 가능한 참가자 ID 없음   |
| `PARTICIPANT_NOT_FOUND` | 404         | 참가자 ID를 찾을 수 없음     |
| `INVALID_REQUEST`       | 400         | 잘못된 요청 (필수 필드 누락) |
| `SHEETS_API_ERROR`      | 500         | Google Sheets API 오류       |
| `DUPLICATE_ENTRY`       | 409         | 중복된 데이터 (이메일 등)    |
| `VALIDATION_ERROR`      | 400         | 데이터 유효성 검증 실패      |

---

## 🔌 API 엔드포인트

### 1. Participant ID 자동 할당

참가자 정보 입력 페이지에서 가장 작은 미사용 ID를 자동으로 할당합니다.

**Endpoint**: `POST /api/assign-participant-id`

**요청**: Body 없음

**응답 (성공)**:

```json
{
  "success": true,
  "participant_id": "P003",
  "group": "수학",
  "condition_type": 3,
  "aut_type": 3
}
```

**응답 (실패)**:

```json
{
  "success": false,
  "error": "사용 가능한 참가자 ID가 없습니다.",
  "code": "NO_AVAILABLE_ID"
}
```

**로직**: `participants` 시트에서 `name`이 NULL인 첫 번째 행을 찾아 해당 ID 반환

---

### 2. 참가자 정보 조회

특정 참가자의 정보를 조회합니다.

**Endpoint**: `GET /api/get-participant?id=P003`

**요청**: Query Parameter `id` (required)

**응답 (성공)**:

```json
{
  "success": true,
  "data": {
    "participant_id": "P003",
    "name": "홍길동",
    "student_id": "20240001",
    "email": "hong@kaist.ac.kr",
    "group": "수학",
    "condition_type": 3,
    "aut_type": 3,
    "timestamp": "2025-11-13T14:30:00Z"
  }
}
```

**응답 (실패)**:

```json
{
  "success": false,
  "error": "참가자를 찾을 수 없습니다.",
  "code": "PARTICIPANT_NOT_FOUND"
}
```

**로직**: `participants` 시트에서 `participant_id`가 일치하는 행 찾아 반환

---

### 3. 참가자 정보 업데이트

참가자의 기본 정보 (이름, 학번, 이메일)를 업데이트합니다.

**Endpoint**: `PATCH /api/update-participant`

**요청**:

```json
{
  "participant_id": "P003",
  "name": "홍길동",
  "student_id": "20240001",
  "email": "hong@kaist.ac.kr"
}
```

**응답 (성공)**:

```json
{
  "success": true,
  "message": "참가자 정보가 업데이트되었습니다."
}
```

**응답 (실패)**:

```json
{
  "success": false,
  "error": "이미 사용 중인 이메일입니다.",
  "code": "DUPLICATE_ENTRY"
}
```

**유효성 검증**:

- `name`: 1~50자
- `student_id`: 정확히 8자리 숫자
- `email`: 이메일 형식 + 중복 확인

**로직**:

1. `participants` 시트에서 참가자 행 찾기
2. 이메일 중복 체크 (다른 참가자가 사용 중인지)
3. `name`, `student_id`, `email`, `timestamp` 업데이트

---

### 4. AUT 데이터 저장

AUT (Alternative Uses Test) 수행 결과를 저장합니다.

**Endpoint**: `POST /api/save-aut`

**요청**:

```json
{
  "participant_id": "P003",
  "measurement_point": "Pre",
  "object": "클립",
  "ideas": "서류 정리\n장신구 만들기\n도구 제작",
  "idea_count": 8
}
```

**응답 (성공)**:

```json
{
  "success": true,
  "message": "AUT 데이터가 저장되었습니다."
}
```

**유효성 검증**:

- `measurement_point`: "Pre", "Mid", "Post" 중 하나
- `ideas`: 1~5000자
- `idea_count`: 0 이상의 정수

**로직**: `aut_data` 시트에 새 행 추가 (append)

---

### 5. 측정 데이터 저장 (참을성/집중력)

참을성 및 집중력 측정 결과를 저장합니다.

**Endpoint**: `POST /api/save-measurement`

**요청**:

```json
{
  "participant_id": "P003",
  "measurement_point": "Pre",
  "measurement_type": "Skeleton",
  "metric_name": "dummy_value",
  "value": 0
}
```

**응답 (성공)**:

```json
{
  "success": true,
  "message": "측정 데이터가 저장되었습니다."
}
```

**유효성 검증**:

- `measurement_point`: "Pre", "Mid", "Post" 중 하나
- `measurement_type`: "SART", "Unsolvable", "Skeleton" 중 하나
- `value`: 숫자형

**로직**: `measurement_data` 시트에 새 행 추가 (append)

---

### 6. 과제 데이터 저장

수학/글쓰기 과제 수행 결과를 저장합니다.

**Endpoint**: `POST /api/save-task`

**요청**:

```json
{
  "participant_id": "P003",
  "task_number": 1,
  "problem_version": "A",
  "llm_condition": "Yes",
  "answer": "답변 내용...",
  "time_spent": 280
}
```

**응답 (성공)**:

```json
{
  "success": true,
  "message": "과제 데이터가 저장되었습니다."
}
```

**유효성 검증**:

- `task_number`: 1 또는 2
- `problem_version`: "A" 또는 "B"
- `llm_condition`: "Yes" 또는 "No"
- `answer`: 1~10000자
- `time_spent`: 0 이상의 정수 (초)

**로직**: `task_data` 시트에 새 행 추가. `correct_answer`, `is_correct`, `score`, `evaluation_notes`는 NULL로 저장 (실험 후 채점)

---

## 🚨 에러 처리

### 에러 복구 전략

**에러 발생 시 자동 처리 순서**:

1. 현재 데이터 → 로컬 스토리지 백업
2. 에러 로깅 (console + 서버)
3. 사용자에게 메시지 표시
4. "다시 시도" / "처음부터" 옵션 제공
5. 필요시 participant_id 재할당
6. 연구자가 에러 로그 검토

### 주요 에러 상황

#### 1. Google Sheets API 오류

**원인**: 네트워크 끊김, 인증 실패, API Quota 초과 (분당 100회)

**처리**:

- 로컬스토리지에 데이터 백업
- 2초 간격으로 최대 3회 재시도
- 최종 실패 시 사용자에게 안내

#### 2. Participant ID 고갈

**원인**: P001~P070 모두 사용됨

**처리**: 사용자에게 안내 후 홈으로 리다이렉트

#### 3. 세션 데이터 손실

**원인**: 브라우저 종료, 새로고침, 탭 전환

**처리**: `sessionStorage`로 자동 저장/복원 (`ExperimentContext` 사용)

#### 4. 유효성 검증 실패

**처리**: 프론트엔드에서 API 호출 전 검증, 명확한 에러 메시지 표시

---

## ⏱️ 타이머 로직

**문제**: `setInterval`은 백그라운드 탭에서 부정확

**해결**: `Date.now()`로 절대 시간 계산

**구현**: `useTimer(totalSeconds, onTimeout)` 훅 사용

- 100ms마다 경과 시간 체크
- 남은 시간 반환
- 시간 초과 시 `onTimeout` 콜백 실행

---

## 📝 에러 로깅

**파일**: `lib/errorLogger.js`

**기능**:

- `logError(context, error, data)`: 에러 정보를 localStorage와 서버에 기록
- 포함 정보: timestamp, context, error message, stack trace, data, userAgent, URL

**조회**: 브라우저 콘솔에서 `JSON.parse(localStorage.getItem("error_logs"))` 실행

---

## 🔗 다음 단계

1. **데이터 스키마 확인**: [`data-schema.md`](data-schema.md)에서 각 API가 저장하는 데이터 구조 확인
2. **카운터밸런싱 이해**: [`experiment-logic.md`](experiment-logic.md)에서 condition_type과 aut_type의 매핑 규칙 확인
3. **환경 설정**: [`setup-guide.md`](setup-guide.md)에서 Google Sheets API 설정 및 인증 방법 확인

---

**Last Updated**: 2025-11-13  
**Version**: 1.0 (technical-specs.md에서 분리)  
**Related**: [`data-schema.md`](data-schema.md), [`experiment-logic.md`](experiment-logic.md), [`setup-guide.md`](setup-guide.md)
