# 제품 요구사항 명세서 (Product Requirements Document)

> **이 문서는**: 실험 플로우, 사용자 요구사항, 프로젝트 목표를 정의합니다.  
> **대상**: 기획자, 개발자, 연구팀 전체  
> **역할**: 무엇을 만들 것인가 (What), 왜 만드는가 (Why)

---

## 📚 관련 문서 체계

| 문서                                           | 역할          | 언제 보나요?            |
| ---------------------------------------------- | ------------- | ----------------------- |
| **product-requirements.md** (현재)             | 제품 요구사항 | 기획 이해, 플로우 파악  |
| [`design-system.md`](design-system.md)         | 디자인 시스템 | UI/UX 구현, 스타일 적용 |
| [`data-schema.md`](data-schema.md)             | 데이터 구조   | 데이터베이스 스키마     |
| [`api-specs.md`](api-specs.md)                 | API 명세      | API 연동, 요청/응답     |
| [`experiment-logic.md`](experiment-logic.md)   | 실험 설계     | 카운터밸런싱, 조건 배정 |
| [`setup-guide.md`](setup-guide.md)             | 환경 구축     | 초기 설정, 배포         |
| [`pending-decisions.md`](pending-decisions.md) | 미결정 사항   | 팀 논의 필요 항목       |

---

## 💡 작업별 문서 가이드

### 화면 구현 시

1. **현재 문서** (product-requirements.md) - 사용자 플로우 확인
2. [`design-system.md`](design-system.md) - 컬러, 폰트, 컴포넌트 스타일
3. [`api-specs.md`](api-specs.md) - API 연동

### 데이터 연동 시

1. [`data-schema.md`](data-schema.md) - 데이터 구조, 스키마
2. [`api-specs.md`](api-specs.md) - API 명세
3. **현재 문서** (product-requirements.md) - 요구사항 확인

### 카운터밸런싱 구현 시

1. [`experiment-logic.md`](experiment-logic.md) - 상세 로직, 타입 매핑
2. **현재 문서** (product-requirements.md) - 기능 요구사항

### 개발 로드맵 참고 시

1. **현재 문서** (product-requirements.md) - Phase 0/1/2 체크리스트
2. [`data-schema.md`](data-schema.md) + [`api-specs.md`](api-specs.md) - 기술 구현 상세

---

## 목차

1. [제품 개요](#-제품-개요)
2. [사용자 플로우](#-사용자-플로우-21단계)
3. [핵심 기능 요구사항](#-핵심-기능-요구사항)
4. [제약사항 및 비기능 요구사항](#-제약사항-및-비기능-요구사항)
5. [개발 로드맵](#-개발-로드맵)

---

## � 제품 개요

### 제품 목표

**실험 참가자를 위한 온라인 실험 플랫폼**으로, 30분 이내에 완료 가능한 인지 기능 실험을 제공합니다.

**핵심 가치**:

- ✅ **피험자 경험**: 명확한 안내, 직관적인 인터페이스
- ✅ **실험 무결성**: 자동화된 카운터밸런싱, 실시간 데이터 저장
- ✅ **연구자 편의**: 최소한의 개입, 자동 데이터 수집

### 성공 지표

- **완료율**: 100% (시작한 참가자가 끝까지 완료)
- **평균 소요 시간**: 30분 ± 5분
- **데이터 손실률**: 0% (모든 응답 저장)
- **오류 발생률**: 3% 미만

### 타겟 사용자

**Primary**: KAIST 학부생 50명 (수학 25명, 글쓰기 25명)  
**Secondary**: 실험 진행자 (데이터 수집 및 관리)

---

## �🗺️ 사용자 플로우 (21단계)

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

| 단계             | 소요 시간 | 누적 |
| ---------------- | --------- | ---- |
| 1-5: 시작~안내   | 3분       | 3분  |
| 6-10: Pre 측정   | 5분       | 8분  |
| 11-12: Task 1    | 6분       | 14분 |
| 13-15: Mid 측정  | 5분       | 19분 |
| 16-17: Task 2    | 6분       | 25분 |
| 18-20: Post 측정 | 5분       | 30분 |
| 21: 종료         | 1분       | 31분 |

**총 예상 시간**: 약 30분

---

## ✨ 핵심 기능 요구사항

### 1. Participant ID 자동 할당

**요구사항**: 참가자가 ID를 선택하지 않고, 시스템이 자동으로 미사용 ID를 할당합니다.

**이유**:

- 참가자 혼란 방지 (어떤 ID를 선택해야 하는지 모름)
- 균등 분배 보장 (순차 할당)
- 카운터밸런싱 무결성

**동작**:

1. 실험 전 P001-P070 사전 생성
2. 참가자 정보 입력 시 가장 작은 미사용 ID 자동 할당
3. 할당된 ID를 화면에 표시

> **기술 명세**: [`technical-specs.md`](technical-specs.md) → API: assign-participant-id

---

### 2. 재사용 측정 컴포넌트

**요구사항**: AUT와 참을성/집중력 측정은 Pre/Mid/Post에서 동일한 페이지를 사용합니다.

**이유**:

- 일관된 사용자 경험
- 코드 중복 방지
- 유지보수 용이

**동작**:

- AUT: `/measurements/aut?point=pre&object=벽돌`
- 참을성: `/measurements/concentration?point=pre`

---

### 3. 카운터밸런싱

**요구사항**: 모든 참가자는 사전 정의된 카운터밸런싱 조건을 따릅니다.

**이유**:

- 순서 효과 제거 (Order Effect)
- 학습 효과 제거 (Learning Effect)
- 실험 설계 무결성

**구성**:

- **Condition Type (1~4)**: LLM 사용 순서 + 문제 순서
- **AUT Type (1~6)**: 물건 제시 순서 (벽돌/클립/종이컵)

> **기술 명세**: [`technical-specs.md`](technical-specs.md) → 카운터밸런싱 상세

---

### 4. 실시간 데이터 저장

**요구사항**: 각 단계 완료 시 즉시 Google Sheets에 저장합니다.

**이유**:

- 데이터 손실 방지 (브라우저 종료, 네트워크 끊김)
- 에러 복구 가능
- 실험 진행 중 데이터 확인 가능

**데이터 저장 시점**:

- 참가자 정보 입력 완료
- AUT 측정 완료 (Pre/Mid/Post 각각)
- 참을성 측정 완료 (Pre/Mid/Post 각각)
- 과제 수행 완료 (Task 1/2 각각)

> **기술 명세**: [`technical-specs.md`](technical-specs.md) → 데이터 구조, API 명세

---

### 5. 타이머 및 시간 제한

**요구사항**:

- AUT: 2분 고정 타이머 (시각적 피드백)
- 과제: 5분 Hard Limit (강제 종료)

**시각적 피드백**:

- 정상 (0-60%): Neutral Gray
- 주의 (60-80%): Warning Yellow
- 긴급 (80-100%): Danger Red
- Hard Limit: 자동 다음 단계

> **디자인 명세**: [`design-system.md`](design-system.md) → 타이머 컴포넌트

---

### 6. LLM 사용 조건 표시

**요구사항**: 과제 수행 시 LLM 사용 가능/금지를 명확히 표시합니다.

**시각적 구분**:

**중요 안내**:

- LLM은 "협업 파트너" (힌트, 아이디어 제공)
- 최종 답안은 참가자가 직접 작성

---

## 🚫 제약사항 및 비기능 요구사항

### 제약사항

1. **실험 설계 고정**: Mixed Design (2x2) 변경 불가
2. **참가자 수**: 50명 (+ 20명 여유 = 총 70명)
3. **소요 시간**: 30분 이내 (Hard Requirement)
4. **측정 도구**:
   - AUT 확정
   - 참을성/집중력 미확정 (Phase 1에서는 스켈레톤만)

### 비기능 요구사항

**성능**:

- 페이지 로딩 시간: 3초 이내
- 데이터 저장 응답: 2초 이내
- 타이머 정확도: ±0.5초

**접근성**:

- 최소 해상도: 1280px 이상
- 키보드 네비게이션 지원
- 명확한 안내 문구 (한국어)

**보안**:

- Google Sheets API: 서버 사이드만
- 개인정보: 이름, 학번, 이메일만 수집
- 데이터 암호화: HTTPS

**디자인**:

- 프로페셔널하고 깔끔한 톤앤매너
- 정해진 컬러 팔레트만 사용
- 일관된 UI/UX

> **디자인 명세**: [`design-system.md`](design-system.md) → 전체 디자인 시스템

---

## �️ 개발 로드맵

### Phase 0: 실험 전 준비 ✅ **완료**

- [x] 1. Google Sheets 문서 생성
  - 시트 4개: participants, aut_data, measurement_data, task_data
  - Spreadsheet ID: `1qO3Xfi3pFzhHi3TxvSO_06TLHC89DJM2l8LSyea3Tn0`
- [x] 2. Google Cloud Console 설정
  - 프로젝트 생성 및 Google Sheets API 활성화
  - 서비스 계정 생성 및 권한 부여
- [x] 3. 환경 변수 설정
  - `.env.local` 파일 생성
  - Google Sheets ID 및 credentials 저장
- [x] 4. 카운터밸런싱 데이터 생성
  - `node scripts/generate-counterbalancing.js` 실행
  - P001~P070 (70개 행) 생성 완료
  - 균등 분배 확인: 수학 35명, 글쓰기 35명

**✅ 완료 확인**: Google Sheets에서 70개 참가자 행 확인됨

---

### Phase 1: MVP (핵심 플로우)

- [x] 1. **프로젝트 초기화**
  - Next.js 15 프로젝트 생성 (App Router + Tailwind CSS)
  - 폴더 구조 생성 (app/, components/, lib/, scripts/)
- [x] 2. **디자인 시스템 설정**
  - `tailwind.config.ts` 수정 (컬러 팔레트)
  - 전역 스타일 (`app/globals.css`)
  - 폰트 로드 (Pretendard)
- [x] 3. **Google Sheets API 연동**
  - `lib/googleSheets.ts` 작성
  - 읽기/쓰기 함수 구현
- [x] 4. **Participant ID 자동 할당**
  - `/api/assign-participant-id` 구현
  - 가장 작은 미사용 ID 로직
- [x] 5. **기본 화면 구현**
  - 시작 화면 (`/`)
  - IRB 동의서 (`/irb-consent`)
  - 참가자 정보 입력 (`/participant-info`)
  - 실험 안내 (`/experiment-intro`)
- [x] 6. **재사용 측정 페이지**
  - AUT 페이지 (`/measurements/aut`)
  - URL 파라미터 처리 (point, object)
  - 타이머 컴포넌트
  - 카운터밸런싱 기반 물건 자동 매핑
- [x] 7. **참을성 측정 스켈레톤**
  - `/measurements/concentration` 페이지
  - 안내 문구 + 다음 버튼만
  - 더미 데이터 저장
- [x] 8. **과제 수행 페이지**
  - Task 안내 페이지 (`/task/intro`)
  - Task 수행 페이지 (`/task/perform`)
  - LLM 조건 배너 (상단 고정)
  - 타이머 + 답안 입력
  - 종료 페이지 (`/completion`)
- [x] 9. **카운터밸런싱 로직**
  - `lib/counterbalancing.ts` 작성
  - 타입 매핑 함수 (getTaskConfig, getAUTObject, getGroup)
- [x] 10. **데이터 저장 API**
  - `/api/save-aut`
  - `/api/save-measurement`
  - `/api/save-task`

**✅ Phase 1 완료**: 전체 플로우 실행 가능, 데이터 저장 확인

---

### Phase 2: 콘텐츠 추가 & 배포 🚀

**팀원 결정 대기 중인 항목:**

- [ ] 1. **참을성/집중력 측정 최종 구현**

  - 📌 **현재 상태**: 스켈레톤 구현 완료 (`/measurements/concentration`)
  - ⏳ **대기 중**: 측정 방법 확정 (SART, Unsolvable Task, 또는 다른 방식)
  - 🔧 **작업 필요**:
    - 팀에서 결정된 측정 방식에 따라 UI/로직 구현
    - 더미 데이터 대신 실제 응답 저장
  - 📝 **참고 파일**: `/app/measurements/concentration/page.tsx`

  - [x] 2. **수학/글쓰기 문제 A/B → W1/W2 최종 버전 반영**
    - 📌 **현재 상태**: 실제 문제 반영 완료 (`/app/task/perform/page.tsx`)
    - ✅ **글쓰기 문제 W1**: "학과설명회 요약본에 넣을 본인 전공 소개 1문단을 250자 내외로 작성하시오. 반드시 포함: 1. 사용하는 건물 및 주 연구 분야 2. 대표 과목명 및 테크트리 요약 3. 학과 복지 및 장점"
    - ✅ **글쓰기 문제 W2**: "KAIST 메일로 보낼 'KAIST 셔틀 지연 대응 공지' 관련 행정 공지문을 250자 내외로 작성하시오. 반드시 포함: 1. ‘N1_Library 9–10시 평균 지연값’을 정확 인용 2. 구체적 시간의 데이터 결측(장비 재부팅) 사실 언급 3. 혼잡 대응 안내 1–2가지"
    - 🔧 **작업 완료**:
      - `PROBLEMS` 객체에 실제 문제(W1/W2) 삽입
      - 난이도 동등성 검토
      - 문제 길이/복잡도 확인 (250자 내외 안내)
    - 📝 **참고 파일**: `/app/task/perform/page.tsx` (lines 15-35)

**배포 준비 작업:**

- [ ] 3. **Vercel 배포 설정**

  - GitHub 저장소 연결
  - 환경 변수 Production 설정
  - 빌드 테스트
  - 도메인 설정 (선택)

- [ ] 4. **파일럿 테스트**

  - 3~5명 대상 실험 진행
  - 버그 수집 및 수정
  - 평균 소요 시간 확인 (목표: 30분 ± 5분)
  - 사용자 피드백 반영

- [ ] 5. **최종 점검**
  - 전체 플로우 테스트 (시작 → 완료)
  - Google Sheets 데이터 저장 확인
  - 에러 핸들링 확인
  - 모바일/반응형 확인 (최소 1280px)

**✅ 완료 조건**: 70명 데이터 수집 준비 완료

---

## � 프로젝트 성공 기준

### 출시 전 검증 항목

**기능 검증**:

- [ ] 전체 21단계 플로우 완료 가능
- [ ] Participant ID 자동 할당 정상 작동
- [ ] 카운터밸런싱 균등 분배 (타입별 11~18명)
- [ ] 모든 데이터 Google Sheets 저장 확인
- [ ] 타이머 정확도 ±0.5초 이내

**사용자 테스트**:

- [ ] 파일럿 테스트 3~5명 완료
- [ ] 평균 소요 시간 30분 ± 5분
- [ ] 완료율 90% 이상
- [ ] 사용자 피드백 수집 및 반영

**품질 검증**:

- [ ] 디자인 시스템 100% 적용
- [ ] 반응형 확인 (1280px 이상)
- [ ] 에러 처리 시나리오 테스트
- [ ] 네트워크 끊김 복구 테스트

---

## �🔗 상세 문서 링크

### 기획 & 요구사항

- **현재 문서** (PRD): 제품 요구사항, 사용자 플로우
- [`pending-decisions.md`](pending-decisions.md): 미결정 사항

### 디자인

- [`design-system.md`](design-system.md): 컬러 팔레트, 컴포넌트 스타일, 타이머 디자인

### 기술 구현

- [`data-schema.md`](data-schema.md): 데이터베이스 스키마
- [`api-specs.md`](api-specs.md): API 명세, 요청/응답
- [`experiment-logic.md`](experiment-logic.md): 카운터밸런싱 로직
- [`setup-guide.md`](setup-guide.md): 환경 설정, 배포

---

**Last Updated**: 2025-11-13  
**Version**: 4.0 (PRD 형태로 재구성)
