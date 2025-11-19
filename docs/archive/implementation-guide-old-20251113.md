# 구현 가이드 (Implementation Guide)

> **이 문서는**: 전체 유저 플로우와 개발 개요를 제공합니다.  
> **대상**: 모든 개발자, 프로젝트 시작 시 필수 읽기

---

## 📚 관련 문서 체계

| 문서 | 역할 | 언제 보나요? |
|------|------|-------------|
| **implementation-guide.md** (현재) | 구현 가이드 | 전체 흐름 파악, 개발 시작 |
| [`design-system.md`](design-system.md) | 디자인 시스템 | UI/UX 구현, 스타일 적용 |
| [`technical-specs.md`](technical-specs.md) | 기술 명세 | 데이터 구조, API, 환경 설정 |
| [`experiment-design.md`](experiment-design.md) | 실험 설계 | 실험 이론, Mixed Design |
| [`pending-decisions.md`](pending-decisions.md) | 미결정 사항 | 팀 논의 필요 항목 |

---

## 💡 작업별 문서 가이드

### 화면 구현 시
1. **현재 문서** (implementation-guide.md) - 유저 플로우 확인
2. [`design-system.md`](design-system.md) - 컬러, 폰트, 컴포넌트 스타일
3. [`technical-specs.md`](technical-specs.md) - API 연동

### 데이터 연동 시
1. [`technical-specs.md`](technical-specs.md) - 데이터 구조, API 명세
2. **현재 문서** (implementation-guide.md) - 데이터 저장 흐름

### 카운터밸런싱 구현 시
1. [`technical-specs.md`](technical-specs.md) - 상세 로직, 타입 매핑
2. **현재 문서** (implementation-guide.md) - 전체 흐름

### 환경 설정 시
1. [`technical-specs.md`](technical-specs.md) - 환경 변수, Google Sheets API
2. **현재 문서** (implementation-guide.md) - 개발 단계

---

## 목차
1. [유저 플로우 (21단계)](#-유저-플로우-21단계)
2. [카운터밸런싱 개요](#-카운터밸런싱-개요)
3. [데이터 저장 흐름](#-데이터-저장-흐름)
4. [개발 단계](#-개발-단계)

---

## 🗺️ 유저 플로우 (21단계)

**핵심 원칙**:
- Pre/Mid/Post 측정은 **재사용 컴포넌트** 사용 (URL 파라미터로 구분)
- Participant ID는 **자동 할당** (가장 작은 미사용 ID)
- 모든 단계는 Google Sheets에 **실시간 저장**

### 전체 흐름

```
1. 시작 화면
   └─ "실험 시작하기" 버튼

2. IRB 동의서
   ├─ 동의 내용 표시
   ├─ "동의합니다" 체크박스
   └─ "다음" 버튼 (체크 후 활성화)

3. 참가자 정보 입력
   ├─ **Participant ID 자동 할당** ⚠️
   │  └─ API 호출: /api/assign-participant-id
   │  └─ 결과: 가장 작은 미사용 ID (예: P003)
   ├─ 배정된 ID 화면에 표시
   ├─ 이름 입력
   ├─ 학번 입력 (8자리)
   ├─ 이메일 입력
   └─ "다음" 버튼
   └─ → Google Sheets 업데이트 (name, student_id, email, timestamp)

4. [자동] 카운터밸런싱 정보 로드
   ├─ API 호출: /api/get-participant?id={assigned_id}
   ├─ group, condition_type, aut_type 가져오기
   └─ 세션에 저장

5. 실험 안내
   ├─ "총 30분 소요"
   ├─ "배정된 분야: [수학/글쓰기]" (동적 표시)
   ├─ "각 문제 제한 시간: 5분"
   └─ "시작하기" 버튼

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Pre-Measurement (사전 측정)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. Pre-측정 안내
   └─ "다음" 버튼

7. AUT 지시문 (간단)
   └─ "시작" 버튼

8. AUT 수행 (Pre)
   ├─ 경로: `/measurements/aut?point=pre&object={물건}`
   ├─ 물건: 카운터밸런싱된 값 (예: "벽돌")
   ├─ 2분 타이머 (화면 우상단)
   ├─ 자유 텍스트 입력 (textarea)
   ├─ 자동 저장 → Google Sheets (aut_data)
   └─ 자동 다음 단계

9. 참을성/집중력 측정 안내
   └─ "시작" 버튼

10. 참을성/집중력 수행 (Pre) ⚠️ **스켈레톤만**
    ├─ 경로: `/measurements/concentration?point=pre`
    ├─ 현재: 안내 문구 + "다음" 버튼만
    ├─ 더미 데이터 저장 (value: 0)
    └─ [실제 로직은 추후 구현]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Task 1 (과제 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. 과제 1 안내
    ├─ 조건 표시 (카운터밸런싱에 따라):
    │  ├─ 🤖 "LLM 사용 가능" (배경: Primary Blue) 또는
    │  └─ ⛔ "LLM 사용 금지" (배경: Danger Red)
    ├─ 문제 버전: A 또는 B
    ├─ "제한 시간: 5분"
    └─ "시작" 버튼

12. 과제 1 수행
    ├─ 상단: LLM 조건 배너 (전체 폭)
    ├─ 타이머: 화면 우상단 (색상 변화)
    ├─ 문제 영역
    ├─ 답안 입력 (textarea)
    ├─ 5분 Hard Limit
    ├─ 자동 저장 → Google Sheets (task_data)
    └─ 자동 다음 단계

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mid-Measurement (중간 측정)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

13. Mid-측정 안내
    └─ "다음" 버튼

14. AUT 수행 (Mid)
    └─ 경로: `/measurements/aut?point=mid&object={물건}`

15. 참을성/집중력 수행 (Mid) ⚠️ **스켈레톤만**
    └─ 경로: `/measurements/concentration?point=mid`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Task 2 (과제 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

16. 과제 2 안내
    └─ 조건 반대 (카운터밸런싱)

17. 과제 2 수행

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Post-Measurement (사후 측정)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

18. Post-측정 안내
    └─ "다음" 버튼

19. AUT 수행 (Post)
    └─ 경로: `/measurements/aut?point=post&object={물건}`

20. 참을성/집중력 수행 (Post) ⚠️ **스켈레톤만**
    └─ 경로: `/measurements/concentration?point=post`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  End (종료)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

21. 종료 화면
    ├─ "실험에 참여해주셔서 감사합니다!"
    ├─ 참가자 정보 재확인
    └─ "완료" 버튼
```

### 예상 소요 시간

| 단계 | 소요 시간 | 누적 |
|------|----------|------|
| 1-5: 시작~안내 | 3분 | 3분 |
| 6-10: Pre 측정 | 5분 | 8분 |
| 11-12: Task 1 | 6분 | 14분 |
| 13-15: Mid 측정 | 5분 | 19분 |
| 16-17: Task 2 | 6분 | 25분 |
| 18-20: Post 측정 | 5분 | 30분 |
| 21: 종료 | 1분 | 31분 |

**총 예상 시간**: 약 30분

---

## 🔄 카운터밸런싱 개요

> **상세 내용**: [`technical-specs.md`](technical-specs.md) → 카운터밸런싱 상세

### 사전 생성 방식 (Pre-allocation)

**실험 전**:
1. 스크립트 실행: `node scripts/generate-counterbalancing.js`
2. Google Sheets에 P001~P070 생성
3. condition_type (1~4), aut_type (1~6), group (수학/글쓰기) 자동 계산

**실험 중**:
1. 가장 작은 미사용 ID 자동 할당
2. 해당 행의 카운터밸런싱 정보 조회
3. 실험 진행

### Condition Type (1~4)

| Type | LLM 순서 | 문제 순서 |
|------|----------|----------|
| 1 | NoLLM → LLM | A → B |
| 2 | NoLLM → LLM | B → A |
| 3 | LLM → NoLLM | A → B |
| 4 | LLM → NoLLM | B → A |

### AUT Type (1~6)

| Type | Pre | Mid | Post |
|------|-----|-----|------|
| 1 | 벽돌 | 클립 | 종이컵 |
| 2 | 벽돌 | 종이컵 | 클립 |
| 3 | 클립 | 벽돌 | 종이컵 |
| 4 | 클립 | 종이컵 | 벽돌 |
| 5 | 종이컵 | 벽돌 | 클립 |
| 6 | 종이컵 | 클립 | 벽돌 |

**균등 분배**:
- 수학/글쓰기: 각 35명
- Condition Type: 각 17~18명
- AUT Type: 각 11~12명

---

## 💾 데이터 저장 흐름

> **상세 내용**: [`technical-specs.md`](technical-specs.md) → 데이터 구조

### 실험 전 (1회만 실행)

```
scripts/generate-counterbalancing.js 실행
  └─ Sheet 1 (participants)에 P001~P070 생성
  └─ condition_type, aut_type, group 채워짐
  └─ name, student_id, email, timestamp는 NULL
```

### 실험 중 (참가자 1명당)

```
1. 참가자 정보 입력
   └─ /api/assign-participant-id → 가장 작은 미사용 ID
   └─ Sheet 1: 1개 행 UPDATE (name, email, timestamp)

2. AUT 수행 (Pre)
   └─ /api/save-aut
   └─ Sheet 2 (aut_data): 1개 행 INSERT

3. 참을성/집중력 (Pre)
   └─ /api/save-measurement
   └─ Sheet 3 (measurement_data): 1개 행 INSERT
   └─ ⚠️ 현재는 더미 데이터 (value: 0)

4. 과제 1
   └─ /api/save-task
   └─ Sheet 4 (task_data): 1개 행 INSERT

... (반복)

최종 결과 (참가자 1명):
- Sheet 1: 1개 행 업데이트
- Sheet 2: 3개 행 추가 (Pre/Mid/Post)
- Sheet 3: 3개 행 추가 (Pre/Mid/Post)
- Sheet 4: 2개 행 추가 (Task 1/2)
```

### Google Sheets 구조

| 시트 | 행 수 (70명 기준) | 역할 |
|------|------------------|------|
| **participants** | 70개 (사전 생성) | 참가자 정보, 카운터밸런싱 |
| **aut_data** | 210개 (70×3) | AUT 창의력 데이터 |
| **measurement_data** | 210개 (70×3) | 참을성/집중력 데이터 |
| **task_data** | 140개 (70×2) | 과제 수행 데이터 |

**총 630개 행** (70명 완료 시)

---

## 🚀 개발 단계

### Phase 0: 실험 전 준비 (1회만)

- [ ] 1. Google Sheets 문서 생성
  - 시트 4개: participants, aut_data, measurement_data, task_data
  - 서비스 계정에 편집 권한 부여
  
- [ ] 2. 환경 변수 설정
  - `.env.local` 파일 생성
  - Google Sheets ID, API 키 입력
  
- [ ] 3. 카운터밸런싱 데이터 생성
  - `node scripts/generate-counterbalancing.js` 실행
  - Google Sheets 확인 (P001~P070 생성됨)

**완료 조건**: Google Sheets에 70개 행 생성 확인

---

### Phase 1: MVP (핵심 플로우)

- [ ] 1. **프로젝트 초기화**
  - Next.js 15 프로젝트 생성 (App Router + Tailwind CSS)
  - 폴더 구조 생성 (app/, components/, lib/, scripts/)
  
- [ ] 2. **디자인 시스템 설정**
  - `tailwind.config.js` 수정 (컬러 팔레트)
  - 전역 스타일 (`app/globals.css`)
  - 폰트 로드 (Pretendard, Inter)
  
- [ ] 3. **Google Sheets API 연동**
  - `lib/googleSheets.js` 작성
  - 읽기/쓰기 함수 구현
  
- [ ] 4. **Participant ID 자동 할당**
  - `/api/assign-participant-id` 구현
  - 가장 작은 미사용 ID 로직
  
- [ ] 5. **기본 화면 구현**
  - 시작 화면 (`/`)
  - IRB 동의서 (`/consent`)
  - 참가자 정보 입력 (`/info`)
  - 실험 안내 (`/instructions`)
  
- [ ] 6. **재사용 측정 페이지**
  - AUT 페이지 (`/measurements/aut`)
  - URL 파라미터 처리 (point, object)
  - 타이머 컴포넌트
  
- [ ] 7. **참을성 측정 스켈레톤**
  - `/measurements/concentration` 페이지
  - 안내 문구 + 다음 버튼만
  - 더미 데이터 저장
  
- [ ] 8. **과제 수행 페이지**
  - Task 1/2 안내 및 수행 페이지
  - LLM 조건 배너
  - 타이머 + 답안 입력
  
- [ ] 9. **카운터밸런싱 로직**
  - `lib/counterbalancing.js` 작성
  - 타입 매핑 함수
  
- [ ] 10. **데이터 저장 API**
  - `/api/save-aut`
  - `/api/save-measurement`
  - `/api/save-task`

**완료 조건**: 전체 플로우 실행 가능, 데이터 저장 확인

**⚠️ 중요**:
- 디자인 톤앤매너 엄수 (컬러 팔레트만 사용)
- 참을성 측정은 스켈레톤만 구현
- Participant ID는 자동 할당 (수동 선택 금지)

---

### Phase 2: 완성 & 테스트

- [ ] 1. **참을성/집중력 측정 최종 구현**
  - 측정 방법 확정 후 (SART or Unsolvable Task)
  - 실제 로직 추가
  
- [ ] 2. **수학/글쓰기 문제 A/B 추가**
  - 팀에서 제공한 문제 삽입
  - 난이도 동등성 확인
  
- [ ] 3. **UI/UX 마무리**
  - 디자인 시스템 전면 적용
  - 반응형 확인 (최소 1280px)
  - 접근성 체크
  
- [ ] 4. **파일럿 테스트**
  - 3~5명 대상 실험
  - 버그 수집 및 수정
  - 소요 시간 확인 (30분 이내)
  
- [ ] 5. **배포 준비**
  - Vercel 배포
  - 환경 변수 Production 설정
  - 에러 로깅 설정

**완료 조건**: 70명 데이터 수집 준비 완료

---

## 🔗 빠른 참조

### 디자인 관련
- **컬러 팔레트**: [`design-system.md`](design-system.md) → 컬러 팔레트
- **버튼 스타일**: [`design-system.md`](design-system.md) → 컴포넌트 스타일
- **타이머 디자인**: [`design-system.md`](design-system.md) → 타이머 표시

### 데이터 관련
- **Google Sheets 구조**: [`technical-specs.md`](technical-specs.md) → 데이터 구조
- **API 명세**: [`technical-specs.md`](technical-specs.md) → API 명세
- **카운터밸런싱 코드**: [`technical-specs.md`](technical-specs.md) → 카운터밸런싱 상세

### 환경 설정
- **Google Sheets API**: [`technical-specs.md`](technical-specs.md) → 환경 설정
- **Tailwind CSS**: [`design-system.md`](design-system.md) → Tailwind CSS 설정

### 실험 이론
- **Mixed Design**: [`experiment-design.md`](experiment-design.md)
- **측정 도구**: [`pending-decisions.md`](pending-decisions.md) → 측정 도구 선택

---

**Last Updated**: 2025-11-13  
**Version**: 4.0 (문서 분리)  
**Changes**: implementation-guide.md를 3개 문서로 분리 (design-system, technical-specs 신규 생성)

### 🎨 디자인 톤앤매너

**컨셉**: 프로페셔널하고 깔끔한 실험 환경

**디자인 원칙**:
- ✅ 미니멀리즘: 불필요한 장식 제거, 정보 중심
- ✅ 가독성 우선: 충분한 여백, 명확한 계층 구조
- ✅ 일관성: 모든 화면에서 동일한 컬러/폰트/버튼 스타일
- ✅ 집중력 유지: 산만하지 않은 중성적 배경색

**컬러 팔레트** (전체 앱에서 이 색상만 사용):

| 용도 | 컬러명 | Hex Code | 사용처 |
|------|--------|----------|--------|
| **Primary** | Deep Blue | `#2563EB` | 버튼(활성), 강조 텍스트, 링크 |
| **Primary Hover** | Dark Blue | `#1E40AF` | 버튼 호버 상태 |
| **Success** | Forest Green | `#16A34A` | 성공 메시지, 완료 상태 |
| **Warning** | Amber | `#F59E0B` | 타이머 경고 (마지막 1분) |
| **Danger** | Red | `#DC2626` | 에러, 타이머 긴급 (마지막 10초) |
| **Neutral** | Cool Gray 900 | `#111827` | 본문 텍스트 |
| **Neutral Light** | Cool Gray 600 | `#4B5563` | 보조 텍스트, 비활성 |
| **Background** | White | `#FFFFFF` | 기본 배경 |
| **Surface** | Cool Gray 50 | `#F9FAFB` | 카드, 입력 필드 배경 |
| **Border** | Cool Gray 300 | `#D1D5DB` | 구분선, 테두리 |

**타이포그래피**:
- **폰트**: Pretendard (한글), Inter (영문) - 시스템 폰트 fallback
- **본문**: 16px / line-height 1.6 / `#111827`
- **제목**: 24-32px / font-weight 700 / `#111827`
- **보조**: 14px / `#4B5563`

**컴포넌트 스타일**:
- **버튼**: 둥근 모서리 (8px), 충분한 padding (12px 20px), 명확한 호버 효과
- **입력 필드**: 테두리 (1px `#D1D5DB`), 포커스 시 Primary 색상 강조
- **카드**: 그림자 최소화 (subtle shadow), 배경 `#F9FAFB`

### Participant ID 자동 할당 ⚠️ **변경됨**

**이전 방식** (수동 선택): ❌ 사용 안 함
- 참가자가 드롭다운에서 직접 선택

**새로운 방식** (자동 할당): ✅ 적용
- **로직**: Google Sheets에서 `name`이 NULL인 행 중 가장 작은 participant_id 자동 할당
- **UI**: 할당된 ID를 화면에 표시 (참가자는 선택하지 않음)

**구현 예시**:
```javascript
async function assignNextParticipantId() {
  // 1. Google Sheets에서 participants 시트 조회
  const allParticipants = await getParticipantsSheet();
  
  // 2. name이 NULL인 행 필터링 (미사용 ID)
  const availableIds = allParticipants
    .filter(row => row.name === null || row.name === '')
    .map(row => row.participant_id)
    .sort(); // P001, P002, ... 정렬
  
  // 3. 가장 작은 ID 반환
  if (availableIds.length === 0) {
    throw new Error('사용 가능한 참가자 ID가 없습니다.');
  }
  
  return availableIds[0]; // 예: "P001"
}
```

**UI 표시**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━
  실험 참가자 정보 입력
━━━━━━━━━━━━━━━━━━━━━━━━━━

배정된 참가자 번호: P003
(자동으로 배정되었습니다)

이름: [입력 필드]
학번: [입력 필드]
이메일: [입력 필드]

[다음] 버튼
```

**에러 처리**:
- 모든 ID가 사용된 경우: "현재 모든 참가자 슬롯이 사용 중입니다. 연구자에게 문의하세요."

### 타이머 표시
- **위치**: 화면 상단 우측
- **형식**: `남은 시간 MM:SS` (예: `남은 시간 04:32`)
- **스타일**:
  - 폰트 크기: 20px
  - 폰트 굵기: 600 (Semi-bold)
  - 배경: 투명 또는 `#F9FAFB` 카드
- **색상** (톤앤매너 팔레트 준수):
  - **정상 (60초 이상)**: `#111827` (Neutral)
  - **경고 (60초~10초)**: `#F59E0B` (Warning Amber)
  - **긴급 (10초 미만)**: `#DC2626` (Danger Red) + 깜빡임 애니메이션
- **동작**: 0:00 도달 시 자동으로 다음 단계 진행

### AUT (창의력) 입력
- **입력 방식**: 여러 줄 텍스트박스 (textarea)
- **스타일**:
  - 배경: `#FFFFFF` (White)
  - 테두리: 1px solid `#D1D5DB` (Border)
  - 포커스 시: 2px solid `#2563EB` (Primary)
  - 둥근 모서리: 8px
  - Padding: 16px
  - 최소 높이: 200px
  - 폰트: 16px / `#111827`
- **안내 문구**: "한 줄에 하나씩 작성해주세요" (색상: `#4B5563`)
- **Placeholder**: "예) 벽돌로 책상 고정하기"
- **예시 제공**: 별도 작은 카드로 표시 (배경: `#F9FAFB`)
  ```
  💡 예시
  - 문진으로 사용
  - 무기로 사용
  - 예술 작품 재료
  ```
- **데이터 처리**: 줄바꿈(`\n`)으로 split하여 아이디어 개수 카운트

### LLM 조건 표시 (과제 수행 화면)
- **위치**: 화면 최상단, 전체 폭 배너
- **스타일**:
  - **LLM 사용 가능**:
    - 배경: `#2563EB` (Primary Deep Blue)
    - 텍스트: `#FFFFFF` (White)
    - 아이콘: 🤖
    - 문구: "LLM 사용 가능 (브라우저를 열어 Gemini를 사용하세요)"
  - **LLM 사용 금지**:
    - 배경: `#DC2626` (Danger Red)
    - 텍스트: `#FFFFFF` (White)
    - 아이콘: ⛔
    - 문구: "LLM 사용 금지 (스스로 문제를 풀어주세요)"
  - 폰트 크기: 18px
  - 폰트 굵기: 700 (Bold)
  - Padding: 16px
  - 텍스트 정렬: 중앙

### 버튼 스타일
- **Primary 버튼** (다음, 시작, 제출):
  - 배경: `#2563EB` (Primary Deep Blue)
  - 텍스트: `#FFFFFF` (White)
  - 호버: `#1E40AF` (Primary Hover)
  - 둥근 모서리: 8px
  - Padding: 12px 32px
  - 폰트 크기: 16px
  - 폰트 굵기: 600
  - 그림자: 0 2px 4px rgba(0,0,0,0.1)
  
- **비활성 버튼**:
  - 배경: `#D1D5DB` (Border Gray)
  - 텍스트: `#9CA3AF` (Gray 400)
  - 커서: not-allowed
  
- **조건부 활성화**:
  - IRB 동의: 체크박스 선택 후 활성화
  - 참가자 정보: 모든 필드 입력 후 활성화

### 진행률 표시 (선택 사항)
- **위치**: 화면 하단 고정
- **스타일**:
  - 진행된 부분: `#2563EB` (Primary)
  - 미진행 부분: `#E5E7EB` (Gray 200)
  - 높이: 4px
  - 전체 폭
- **형식**: 프로그레스 바 (0-100%)
- **텍스트**: "21단계 중 5단계" (색상: `#4B5563`)

### 참을성/집중력 측정 ⚠️ **중요: 스켈레톤만 구현**

**현재 구현 범위**:
- `/measurements/concentration?point=pre/mid/post` 페이지만 생성
- 간단한 안내 문구 표시: "참을성/집중력 측정 화면입니다"
- "다음" 버튼만 배치 (측정 로직 없음)
- 더미 데이터로 Google Sheets에 저장 (예: `value: 0`)

**구현하지 말 것**:
- ❌ SART 로직 구현
- ❌ Unsolvable Task 로직 구현
- ❌ 실제 측정 계산 로직
- ❌ 복잡한 UI 구성

**이유**: 측정 방법이 아직 확정되지 않음 (SART vs Unsolvable Task 선택 보류)

**추후 작업**: 측정 방법 확정 후 해당 페이지만 업데이트하여 실제 로직 추가

---

## 데이터 구조 (Google Sheets)

### ⚠️ 중요: 데이터 초기화 방식

**실험 전 준비**:
1. `scripts/generate-counterbalancing.js` 실행
2. Google Sheets `participants` 시트에 P001~P070 행 자동 생성
3. 각 행의 `condition_type`, `aut_type`, `group`은 채워짐
4. `name`, `student_id`, `email`, `timestamp`는 NULL 상태

**실험 중**:
- 참가자가 ID를 선택하면 해당 행의 NULL 컬럼들만 업데이트
- 카운터밸런싱 정보는 변경되지 않음

### Sheet 1: participants (참가자 기본 정보)

**초기 상태** (실험 전):
| participant_id | name | student_id | email | group | condition_type | aut_type | timestamp |
|----------------|------|------------|-------|-------|----------------|----------|-----------|
| P001 | NULL | NULL | NULL | 수학 | 1 | 1 | NULL |
| P002 | NULL | NULL | NULL | 글쓰기 | 2 | 2 | NULL |
| ... | ... | ... | ... | ... | ... | ... | ... |

**실험 후** (P001 참가자가 완료한 경우):
| participant_id | name | student_id | email | group | condition_type | aut_type | timestamp |
|----------------|------|------------|-------|-------|----------------|----------|-----------|
| P001 | 홍길동 | 20240001 | hong@kaist.ac.kr | 수학 | 1 | 1 | 2025-11-13 14:30:00 |
| P002 | NULL | NULL | NULL | 글쓰기 | 2 | 2 | NULL |
| ... | ... | ... | ... | ... | ... | ... | ... |

**컬럼 상세**:
| 컬럼명 | 타입 | 초기값 | 업데이트 시점 | 설명 | 예시 |
|--------|------|--------|--------------|------|------|
| participant_id | string | ✅ 사전 생성 | - | 고유 ID | P001 |
| name | string | NULL | 실험 시 | 이름 | 홍길동 |
| student_id | string | NULL | 실험 시 | 학번 | 20240001 |
| email | string | NULL | 실험 시 | 이메일 | hong@kaist.ac.kr |
| group | string | ✅ 사전 생성 | - | 배정 그룹 | 수학 / 글쓰기 |
| condition_type | int | ✅ 사전 생성 | - | 조건 순서 타입 | 1~4 |
| aut_type | int | ✅ 사전 생성 | - | AUT 물건 순서 타입 | 1~6 |
| timestamp | datetime | NULL | 실험 시 | 실험 시작 시간 | 2025-11-13 14:30:00 |

**참고**:
- ✅ 사전 생성: `scripts/generate-counterbalancing.js`로 실험 전 채워짐
- NULL: 실험 시 참가자가 입력하면 업데이트

### Sheet 2: aut_data (창의력 데이터)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| participant_id | string | 참가자 ID | P001 |
| measurement_point | string | 측정 시점 | Pre / Mid / Post |
| object | string | 제시된 물건 | 벽돌 |
| ideas | text | 아이디어 전체 | "문진\n무기\n..." |
| idea_count | int | 아이디어 개수 | 15 |
| timestamp | datetime | 완료 시간 | 2025-11-13 14:35:00 |

### Sheet 3: measurement_data (참을성/집중력 데이터)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| participant_id | string | 참가자 ID | P001 |
| measurement_point | string | 측정 시점 | Pre / Mid / Post |
| measurement_type | string | 측정 유형 | SART / Unsolvable |
| metric_name | string | 지표 이름 | persistence_time |
| value | float | 측정값 | 180.5 |
| timestamp | datetime | 완료 시간 | 2025-11-13 14:40:00 |

### Sheet 4: task_data (과제 수행 데이터)
| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| participant_id | string | 참가자 ID | P001 |
| task_type | int | 과제 타입 | 1 / 2 |
| problem_version | string | 문제 버전 | math / writing |
| llm_condition | string | LLM 조건 | Yes / No |
| answer | text | 답안 내용 | "답변 텍스트..." |
| correct_answer | text | 정답 (연구자 작성) | "정답 또는 모범 답안" |
| is_correct | boolean | 정답 여부 (연구자 평가) | TRUE / FALSE / NULL |
| score | float | 점수 (연구자 평가) | 0~100 또는 NULL |
| evaluation_notes | text | 평가 메모 (선택) | "부분 정답, 논리 전개 우수" |
| time_spent | int | 소요 시간(초) | 280 |
| timestamp | datetime | 완료 시간 | 2025-11-13 14:50:00 |

**평가 컬럼 설명**:
- `correct_answer`: 연구자가 사전에 정의한 정답 또는 모범 답안
- `is_correct`: 연구자가 답안을 검토 후 정답 여부 판정 (TRUE/FALSE/NULL)
- `score`: 부분 점수가 필요한 경우 0~100 점수 부여 (선택사항)
- `evaluation_notes`: 평가 시 특이사항이나 메모 기록 (선택사항)

**참고**: 평가 컬럼들은 데이터 수집 후 연구자가 수동으로 채워넣음

---

## 카운터밸런싱 타입 매핑 참고표

실험 진행 중 특정 참가자의 조건을 확인할 때 참고

### Condition Type → Task 구성
```
condition_type == 1:
  Task 1: Problem A / No LLM
  Task 2: Problem B / LLM

condition_type == 2:
  Task 1: Problem B / No LLM
  Task 2: Problem A / LLM

condition_type == 3:
  Task 1: Problem A / LLM
  Task 2: Problem B / No LLM

condition_type == 4:
  Task 1: Problem B / LLM
  Task 2: Problem A / No LLM
```

### AUT Type → 물건 배정
```
aut_type == 1: 벽돌 → 클립 → 종이컵
aut_type == 2: 벽돌 → 종이컵 → 클립
aut_type == 3: 클립 → 벽돌 → 종이컵
aut_type == 4: 클립 → 종이컵 → 벽돌
aut_type == 5: 종이컵 → 벽돌 → 클립
aut_type == 6: 종이컵 → 클립 → 벽돌
```

---

## 데이터 저장 흐름

### 실험 전 (1회만 실행)
```
0. scripts/generate-counterbalancing.js 실행
   └─ Sheet 1 (participants)에 P001~P070 생성
   └─ 각 행에 condition_type, aut_type, group 채워넣기
   └─ name, student_id, email, timestamp는 NULL로 남김
```

### 실험 중 (참가자 1명당)
```
1. 참가자 정보 입력 완료
   └─ Sheet 1 (participants)에서 선택한 participant_id 행 찾기
   └─ name, student_id, email, timestamp만 업데이트 (UPDATE)
   └─ condition_type, aut_type, group은 읽어오기만 함 (조회)

2. AUT 수행 완료 (Pre)
   └─ Sheet 2 (aut_data)에 새 행 추가 (INSERT)
   └─ measurement_point = "Pre"

3. 참을성/집중력 수행 완료 (Pre)
   └─ Sheet 3 (measurement_data)에 새 행 추가 (INSERT)
   └─ measurement_point = "Pre"
   └─ ⚠️ 현재는 더미 데이터(value: 0)

4. 과제 1 수행 완료
   └─ Sheet 4 (task_data)에 새 행 추가 (INSERT)
   └─ task_number = 1

... (반복)

최종: 참가자 1명당
- Sheet 1 (participants): 1개 행 업데이트
- Sheet 2 (aut_data): 3개 행 추가 (Pre/Mid/Post)
- Sheet 3 (measurement_data): 3개 행 추가 (Pre/Mid/Post)
- Sheet 4 (task_data): 2개 행 추가 (Task 1/2)
- Sheet 2: 3행 (Pre, Mid, Post)
- Sheet 3: 3행 (Pre, Mid, Post)
- Sheet 4: 2행 (Task 1, 2)
```

---

## 에러 처리

### 에러 복구 전략
```
에러 발생 시:
1. 현재 진행 중인 데이터를 임시 저장
2. 에러 내용과 함께 "participant_{ID}_error" 시트에 백업
3. 사용자에게 에러 메시지 표시 (디자인 톤앤매너 준수)
4. "처음부터 다시 시작" 옵션 제공
5. 새로운 participant_id 자동 재할당
6. 연구자가 나중에 에러 데이터 검토
```

### 일반적인 에러 상황
- 네트워크 끊김 → Google Sheets 저장 실패
- 브라우저 종료 → 세션 데이터 손실
- 타이머 오류 → 시간 측정 부정확
- 입력 데이터 누락 → 유효성 검사 실패
- **모든 ID 사용됨** → "사용 가능한 참가자 슬롯이 없습니다" 표시

### 에러 메시지 디자인
- **배경**: `#FEE2E2` (Red 100)
- **텍스트**: `#DC2626` (Danger Red)
- **아이콘**: ⚠️
- **버튼**: `#DC2626` 배경, `#FFFFFF` 텍스트
- **예시**: "⚠️ 네트워크 오류가 발생했습니다. 다시 시도해주세요."

### 예방 조치
- 각 단계마다 즉시 저장 (실시간)
- 로컬 스토리지에 중복 백업
- 타임아웃 설정 (네트워크 요청)
- 데이터 유효성 검사

---

## 프로젝트 구조 (Next.js 15 App Router)

**핵심 원칙**: Pre/Mid/Post 측정은 재사용 컴포넌트 사용

```
experiment-app/
├── app/
│   ├── layout.js                      # 전역 레이아웃
│   ├── page.js                        # 시작 화면 (/)
│   │
│   ├── consent/
│   │   └── page.js                    # IRB 동의서
│   │
│   ├── info/
│   │   └── page.js                    # 참가자 정보 입력
│   │
│   ├── instructions/
│   │   └── page.js                    # 실험 안내
│   │
│   ├── measurements/                  # ⭐ 재사용 측정 페이지
│   │   ├── aut/
│   │   │   └── page.js                # AUT 측정 (Pre/Mid/Post 공통)
│   │   │                              # URL: ?point=pre&object=벽돌
│   │   └── concentration/
│   │       └── page.js                # 참을성/집중력 측정 (Pre/Mid/Post 공통)
│   │                                  # URL: ?point=pre
│   │
│   ├── task1/
│   │   ├── instructions/
│   │   │   └── page.js                # 과제 1 안내
│   │   └── perform/
│   │       └── page.js                # 과제 1 수행
│   │
│   ├── task2/
│   │   ├── instructions/
│   │   │   └── page.js                # 과제 2 안내
│   │   └── perform/
│   │       └── page.js                # 과제 2 수행
│   │
│   ├── complete/
│   │   └── page.js                    # 종료 화면
│   │
│   └── api/                           # Route Handlers
│       ├── assign-participant-id/
│       │   └── route.js               # ⚠️ 가장 작은 미사용 ID 자동 할당
│       ├── get-participant/
│       │   └── route.js               # 참가자 카운터밸런싱 정보 조회
│       ├── update-participant/
│       │   └── route.js               # 참가자 정보 업데이트 (name, email 등)
│       ├── save-aut/
│       │   └── route.js               # AUT 데이터 저장
│       ├── save-measurement/
│       │   └── route.js               # 측정 데이터 저장
│       └── save-task/
│           └── route.js               # 과제 데이터 저장
│
├── components/
│   ├── Timer.js                       # 타이머 컴포넌트
│   ├── ProgressBar.js                 # 진행률 표시
│   ├── AUTForm.js                     # AUT 입력 폼
│   └── ConcentrationTest.js           # ⚠️ 스켈레톤만: 안내 문구 + 다음 버튼
│
├── lib/
│   ├── googleSheets.js                # Google Sheets API 연동
│   ├── counterbalancing.js            # 카운터밸런싱 타입 매핑 함수
│   └── utils.js                       # 유틸리티 함수
│
├── scripts/
│   └── generate-counterbalancing.js   # ⚠️ 실험 전 1회 실행: P001~P070 생성
│
├── contexts/
│   └── ExperimentContext.js           # 실험 데이터 전역 상태
│
├── .env.local                         # 환경 변수
├── package.json
└── next.config.js
```

### 재사용 컴포넌트 구조 상세

**`app/measurements/aut/page.js`**:
```javascript
// URL 파라미터로 point(pre/mid/post)와 object(물건) 받음
export default function AUTPage({ searchParams }) {
  const { point, object } = searchParams;
  // point: "pre" | "mid" | "post"
  // object: "벽돌" | "클립" | "종이컵"
  
  return <AUTForm point={point} object={object} />;
}
```

**`app/measurements/concentration/page.js`**:
```javascript
// URL 파라미터로 point(pre/mid/post) 받음
// ⚠️ 현재는 스켈레톤만 구현 (측정 로직 없음)
export default function ConcentrationPage({ searchParams }) {
  const { point } = searchParams;
  // point: "pre" | "mid" | "post"
  
  return <ConcentrationTest point={point} />;
}
```

**⚠️ ConcentrationTest 컴포넌트 구현 지침**:
- 간단한 안내 문구만 표시: "{point} 단계 참을성/집중력 측정 화면입니다"
- "다음" 버튼 하나만 배치
- 실제 측정 로직은 구현하지 말 것
- 더미 데이터(value: 0)로 저장 처리

---

## 환경 설정

### 환경 변수 (`.env.local`)
```bash
# Google Sheets API
GOOGLE_SHEETS_ID=your_sheet_id_here
GOOGLE_API_KEY=your_api_key_here

# App Settings
NEXT_PUBLIC_TIMER_TASK_SECONDS=300  # 5분 (과제 제한 시간)
NEXT_PUBLIC_TIMER_AUT_SECONDS=120   # 2분 (AUT 제한 시간)
```

### 프로젝트 시작 명령어

```bash
# 1. Next.js 15 프로젝트 생성 (App Router 사용)
npx create-next-app@15 experiment-app
# 선택 옵션:
# - Use App Router? Yes ✅ (필수)
# - Use TypeScript? No (또는 Yes, 선택사항)
# - Use Tailwind CSS? Yes ✅ (디자인 톤앤매너 구현용)
# - Use Tailwind CSS? Yes (권장)

# 2. 프로젝트 디렉토리 이동
cd experiment-app

# 3. 의존성 설치
npm install googleapis

# 4. 환경 변수 파일 생성
touch .env.local
# (위의 환경 변수 내용 입력)

# 5. 개발 서버 실행
npm run dev
```

### Google Sheets API 설정

1. **Google Cloud Console** (https://console.cloud.google.com/)에서 프로젝트 생성
2. **Google Sheets API** 활성화
3. **서비스 계정** 생성 및 JSON 키 다운로드
4. Google Sheets 문서 생성 후 서비스 계정 이메일에 편집 권한 부여
5. `.env.local`에 Sheets ID와 API 키 입력

### Tailwind CSS 설정 (디자인 톤앤매너 적용)

**`tailwind.config.js` 수정**:
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 프로젝트 전용 컬러 팔레트
        primary: {
          DEFAULT: '#2563EB',  // Deep Blue
          hover: '#1E40AF',     // Dark Blue
        },
        success: '#16A34A',     // Forest Green
        warning: '#F59E0B',     // Amber
        danger: '#DC2626',      // Red
        neutral: {
          DEFAULT: '#111827',   // Cool Gray 900
          light: '#4B5563',     // Cool Gray 600
        },
        surface: '#F9FAFB',     // Cool Gray 50
        border: '#D1D5DB',      // Cool Gray 300
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

**Last Updated**: 2025-11-13  
**Version**: 3.0 (디자인 톤앤매너 추가, Participant ID 자동 할당)
