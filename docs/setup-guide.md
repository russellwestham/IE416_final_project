# 환경 설정 가이드 (Setup Guide)

> **이 문서는**: 프로젝트 초기 설정 및 배포 방법을 안내합니다.  
> **대상**: DevOps, 프로젝트 관리자, 신규 개발자  
> **목적**: 개발 환경 구축부터 배포까지 전체 프로세스 제공

---

## 📚 관련 문서

| 문서                                         | 역할             | 언제 보나요?             |
| -------------------------------------------- | ---------------- | ------------------------ |
| **setup-guide.md** (현재)                    | 환경 구축 가이드 | 프로젝트 초기 설정, 배포 |
| [`api-specs.md`](api-specs.md)               | API 명세         | API 구현 및 테스트       |
| [`data-schema.md`](data-schema.md)           | 데이터 구조 정의 | 데이터베이스 설계        |
| [`experiment-logic.md`](experiment-logic.md) | 실험 설계 로직   | 카운터밸런싱 데이터 생성 |

**💡 작업별 문서 조합**:

- **초기 환경 구축**: `setup-guide.md` (현재) + [`data-schema.md`](data-schema.md)
- **배포**: `setup-guide.md` (현재)
- **트러블슈팅**: `setup-guide.md` (현재) + [`api-specs.md`](api-specs.md)

---

## 목차

1. [사전 준비사항](#-사전-준비사항)
2. [Google Sheets API 설정](#-google-sheets-api-설정)
3. [프로젝트 설치 및 실행](#-프로젝트-설치-및-실행)
4. [환경 변수 설정](#-환경-변수-설정)
5. [Tailwind CSS 설정](#-tailwind-css-설정)
6. [카운터밸런싱 데이터 생성](#-카운터밸런싱-데이터-생성)
7. [배포 (Vercel)](#-배포-vercel)
8. [트러블슈팅](#-트러블슈팅)

---

## 🔧 사전 준비사항

### 필수 도구

| 도구        | 버전   | 설치 링크                      |
| ----------- | ------ | ------------------------------ |
| **Node.js** | 18.17+ | https://nodejs.org/            |
| **npm**     | 9.0+   | (Node.js와 함께 설치됨)        |
| **Git**     | 2.0+   | https://git-scm.com/           |
| **VS Code** | 최신   | https://code.visualstudio.com/ |

### Google 계정 준비

- Google Cloud Console 접근 권한
- Google Sheets 사용 권한

---

## 🔐 Google Sheets API 설정 ✅ **완료**

**✅ 완료된 설정**:

- Google Cloud 프로젝트: `IE416-Experiment`
- Google Sheets API 활성화 완료
- 서비스 계정: `experiment-service-account@ie416-experiment.iam.gserviceaccount.com`
- Spreadsheet ID: `1qO3Xfi3pFzhHi3TxvSO_06TLHC89DJM2l8LSyea3Tn0`
- 카운터밸런싱 데이터: P001~P070 (70개 행) 생성 완료

**설정 파일 위치**:

- `credential.json`: 서비스 계정 JSON 키
- `.env.local`: 환경 변수 (Spreadsheet ID, credentials)
- `scripts/generate-counterbalancing.js`: 카운터밸런싱 생성 스크립트

**Google Sheets 확인**:
https://docs.google.com/spreadsheets/d/1qO3Xfi3pFzhHi3TxvSO_06TLHC89DJM2l8LSyea3Tn0/edit

---

## 📦 프로젝트 설치 및 실행 ✅ **완료**

**✅ 완료된 설정**:

- Next.js 15 프로젝트 생성 완료
- TypeScript, Tailwind CSS, App Router 적용
- 필수 패키지 설치 완료

### 로컬 개발 서버 실행

```bash
# 프로젝트 디렉토리로 이동
cd final_project

# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:3000 (또는 3001)
```

### 프로젝트 구조

```
final_project/
├── app/                          # Next.js App Router 페이지
│   ├── api/                      # API Routes
│   │   ├── assign-participant-id/
│   │   ├── update-participant/
│   │   ├── save-aut/
│   │   ├── save-measurement/
│   │   └── save-task/
│   ├── measurements/             # 측정 페이지
│   │   ├── aut/
│   │   └── concentration/
│   ├── task/                     # 과제 페이지
│   │   ├── intro/
│   │   └── perform/
│   ├── irb-consent/
│   ├── participant-info/
│   ├── experiment-intro/
│   ├── completion/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/                          # 유틸리티 함수
│   ├── googleSheets.ts           # Google Sheets API
│   └── counterbalancing.ts       # 카운터밸런싱 로직
├── scripts/                      # 스크립트
│   └── generate-counterbalancing.js
├── docs/                         # 문서
├── .env.local                    # 환경 변수
├── credential.json               # Google 서비스 계정 키
├── package.json
├── tailwind.config.ts
└── next.config.js
```

```bash
cd experiment-app
```

### Step 3: 의존성 설치

```bash
# Google Sheets API 라이브러리
npm install googleapis

# 추가 의존성 (필요 시)
npm install date-fns    # 날짜 포맷팅
```

### Step 4: 폴더 구조 생성

```bash
mkdir -p lib contexts components scripts
```

**예상 구조**:

```
experiment-app/
├── app/
│   ├── api/
│   │   ├── assign-participant-id/
│   │   ├── get-participant/
│   │   ├── update-participant/
│   │   ├── save-aut/
│   │   ├── save-measurement/
│   │   └── save-task/
│   ├── layout.js
│   └── page.js
├── components/
├── contexts/
├── lib/
│   └── googleSheets.js
├── scripts/
│   └── generate-counterbalancing.js
├── .env.local
├── .gitignore
├── package.json
└── tailwind.config.js
```

### Step 5: 개발 서버 실행

```bash
npm run dev
```

**접속**: http://localhost:3000

---

## ⚙️ 환경 변수 설정 ✅ **완료**

**파일 위치**: `.env.local`

**설정된 환경 변수**:

```bash
GOOGLE_SHEETS_ID=1qO3Xfi3pFzhHi3TxvSO_06TLHC89DJM2l8LSyea3Tn0
GOOGLE_SERVICE_ACCOUNT_EMAIL=experiment-service-account@ie416-experiment.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**추가 설정 (Phase 1에서 필요 시)**:

```bash
NEXT_PUBLIC_TIMER_TASK_SECONDS=300   # 5분 (과제 제한 시간)
NEXT_PUBLIC_TIMER_AUT_SECONDS=120    # 2분 (AUT 제한 시간)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**보안 확인**:

- ✅ `.env.local`이 `.gitignore`에 포함됨
- ✅ `credential.json`도 `.gitignore`에 포함됨

---

## 🎨 Tailwind CSS 설정

> **전체 디자인 설정**: [`design-system.md`](design-system.md) → Tailwind 설정 참조

**핵심 설정만 요약**:

```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", hover: "#1E40AF" },
        // 나머지는 design-system.md 참조
      },
      fontFamily: {
        sans: ["Pretendard", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
};
```

---

## 🔄 카운터밸런싱 데이터 생성 ✅ **완료**

**실행 완료**:

```bash
node scripts/generate-counterbalancing.js
```

**생성 결과**:

- ✅ P001~P070 (70개 행) 생성
- ✅ 수학 그룹: 35명 (홀수 ID)
- ✅ 글쓰기 그룹: 35명 (짝수 ID)
- ✅ Condition Type: 1~4 균등 분배 (17-18명)
- ✅ AUT Type: 1~6 균등 분배 (11-12명)

**스크립트 파일**: `scripts/generate-counterbalancing.js`
**전체 로직 설명**: [`experiment-logic.md`](experiment-logic.md)

---

## 🚀 배포 (Vercel)

### Step 1: Vercel 계정 생성

https://vercel.com/signup

### Step 2: GitHub 저장소 연결

```bash
# Git 저장소 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub 원격 저장소 추가
git remote add origin https://github.com/your-username/experiment-app.git
git push -u origin main
```

### Step 3: Vercel 배포

**방법 1: Vercel CLI**

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

**방법 2: Vercel Dashboard**

1. Vercel Dashboard 접속
2. **Import Project** 클릭
3. GitHub 저장소 선택
4. **Import** 클릭
5. 환경 변수 설정 (아래 참조)
6. **Deploy** 클릭

### Step 4: 환경 변수 설정 (Vercel Dashboard)

1. Vercel 프로젝트 페이지 → **Settings** → **Environment Variables**
2. 다음 환경 변수 추가:

| 변수                                 | 값 (`.env.local`에서 복사)                     |
| ------------------------------------ | ---------------------------------------------- |
| `GOOGLE_SHEETS_ID`                   | `1qO3Xfi3pFzhHi3TxvSO_06TLHC89DJM2l8LSyea3Tn0` |
| `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` | (`.env.local`의 전체 JSON 문자열 복사)         |

**주의사항**:

- `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`는 한 줄 JSON 문자열입니다
- 개행 문자(`\n`)가 포함되어 있어야 합니다
- 복사-붙여넣기 시 따옴표가 깨지지 않도록 주의

3. **Environment**: `Production`, `Preview`, `Development` 모두 체크
4. **Add** 클릭하여 각 변수 저장

### Step 4: 배포 및 확인

1. 환경 변수 설정 후 자동으로 배포가 시작됩니다
2. **Deployments** 탭에서 배포 진행 상황 확인
3. 배포 완료 후 Vercel URL 확인 (예: `https://ie416-experiment.vercel.app`)

### Step 5: 배포 후 테스트

✅ **필수 테스트 항목**:

```bash
# 1. 기본 페이지 로드 확인
curl https://your-app.vercel.app

# 2. Participant ID 할당 테스트
# 브라우저에서: 시작 → IRB 동의 → 정보 입력 → ID 할당 확인

# 3. Google Sheets 데이터 저장 확인
# 테스트 참가자로 전체 플로우 완료 후 스프레드시트 확인
```

**체크리스트**:

- [ ] 메인 페이지 로드 확인
- [ ] Participant ID 자동 할당 작동
- [ ] AUT 페이지 타이머 작동
- [ ] Task 페이지 LLM 배너 표시
- [ ] Google Sheets 데이터 저장 확인
- [ ] 완료 페이지까지 전체 플로우 완주

### Step 6: 도메인 설정 (선택사항)

커스텀 도메인을 사용하려면:

1. Vercel 프로젝트 → **Settings** → **Domains**
2. 도메인 추가 및 DNS 설정
3. SSL 자동 적용 확인

---

## 🛠️ 트러블슈팅

### 1. Google Sheets API 인증 실패

**증상**:

```
Error: Unable to authenticate with Google Sheets API
```

**해결**:

1. `credentials.json` 파일이 프로젝트 루트에 있는지 확인
2. `.env.local`의 `GOOGLE_PRIVATE_KEY`에 `\n`이 올바르게 포함되었는지 확인
3. 서비스 계정 이메일에 Google Sheets 편집 권한이 부여되었는지 확인

### 2. CORS 에러

**증상**:

```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**해결**:

- Next.js API Routes는 기본적으로 CORS를 지원하지 않습니다.
- 프론트엔드와 API가 같은 도메인에 있어야 합니다 (Next.js App Router 사용 시 자동 해결).

### 3. 환경 변수 로드 안 됨

**증상**:

```
process.env.GOOGLE_SHEETS_ID is undefined
```

**해결**:

1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 개발 서버 재시작: `npm run dev`
3. 환경 변수 이름이 정확한지 확인 (대소문자 구분)

### 4. Participant ID 고갈

**증상**:

```
사용 가능한 참가자 ID가 없습니다.
```

**해결**:

- Google Sheets에서 수동으로 참가자 행 추가 (P071, P072, ...)
- 또는 `generate-counterbalancing.js` 스크립트의 `i <= 70`을 `i <= 100`으로 수정

### 5. 타이머 정확도 문제

**증상**: 백그라운드 탭에서 타이머가 느려짐

**해결**:

- [`api-specs.md`](api-specs.md)의 타이머 로직 참조
- `Date.now()` 기반 절대 시간 계산 사용

---

## 📚 추가 참고 자료

- **Next.js 문서**: https://nextjs.org/docs
- **Google Sheets API 문서**: https://developers.google.com/sheets/api
- **Tailwind CSS 문서**: https://tailwindcss.com/docs
- **Vercel 배포 가이드**: https://vercel.com/docs

---

## 🔗 다음 단계

1. **API 구현**: [`api-specs.md`](api-specs.md)에서 각 엔드포인트 구현 방법 확인
2. **데이터 스키마 이해**: [`data-schema.md`](data-schema.md)에서 저장할 데이터 구조 확인
3. **카운터밸런싱 로직**: [`experiment-logic.md`](experiment-logic.md)에서 실험 설계 로직 확인

---

**Last Updated**: 2025-11-13  
**Version**: 1.0 (technical-specs.md에서 분리)  
**Related**: [`api-specs.md`](api-specs.md), [`data-schema.md`](data-schema.md), [`experiment-logic.md`](experiment-logic.md)
