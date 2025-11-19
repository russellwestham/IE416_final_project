# 디자인 시스템 (Design System)

> **이 문서는**: 전체 UI/UX 디자인 규칙을 정의합니다.  
> **대상**: 프론트엔드 개발자  
> **역할**: 일관된 사용자 경험을 위한 디자인 가이드

---

## 📚 관련 문서

| 문서                                                 | 역할          | 언제 보나요?             |
| ---------------------------------------------------- | ------------- | ------------------------ |
| **design-system.md** (현재)                          | 디자인 명세   | UI 구현, 스타일 적용     |
| [`product-requirements.md`](product-requirements.md) | 제품 요구사항 | 사용자 플로우, 기능 이해 |
| [`data-schema.md`](data-schema.md)                   | 데이터 구조   | 데이터베이스 스키마      |
| [`api-specs.md`](api-specs.md)                       | API 명세      | API 연동                 |

---

## 목차

1. [디자인 원칙](#-디자인-원칙)
2. [디자인 토큰](#-디자인-토큰)
3. [레이아웃 시스템](#-레이아웃-시스템)
4. [컴포넌트 라이브러리](#-컴포넌트-라이브러리)
5. [페이지 템플릿](#-페이지-템플릿)
6. [Tailwind 설정](#-tailwind-css-설정)

---

## � 디자인 원칙

### 컨셉

**프로페셔널하고 깔끔한 실험 환경** - 참가자의 집중력을 방해하지 않는 미니멀한 디자인

### 핵심 원칙

1. **미니멀리즘** (Minimalism)

   - 불필요한 장식 제거
   - 정보 중심의 디자인
   - 화이트 스페이스 적극 활용

2. **명확성** (Clarity)

   - 직관적인 UI
   - 명확한 시각적 계층
   - 읽기 쉬운 타이포그래피

3. **일관성** (Consistency)

   - 모든 페이지에서 동일한 패턴
   - 예측 가능한 인터랙션
   - 통일된 컬러/폰트 시스템

4. **집중력 유지** (Focus)
   - 산만하지 않은 중성적 배경
   - 중요 정보만 강조
   - 부드러운 애니메이션

---

## 🎨 디자인 토큰

### 컬러 시스템 (Colors)

**⚠️ 중요**: 아래 10가지 색상만 사용 (임의의 색상 코드 사용 금지)

### Primary (메인 색상)

| 컬러명                | Hex Code  | RGB              | 사용처                                   |
| --------------------- | --------- | ---------------- | ---------------------------------------- |
| **Deep Blue**         | `#2563EB` | rgb(37, 99, 235) | 버튼(활성), 강조 텍스트, 링크, 진행률 바 |
| **Dark Blue** (hover) | `#1E40AF` | rgb(30, 64, 175) | 버튼 호버 상태                           |

### Semantic Colors (의미 색상)

| 컬러명           | Hex Code  | RGB               | 사용처                                         |
| ---------------- | --------- | ----------------- | ---------------------------------------------- |
| **Forest Green** | `#16A34A` | rgb(22, 163, 74)  | 성공 메시지, 완료 상태, 체크 아이콘            |
| **Amber**        | `#F59E0B` | rgb(245, 158, 11) | 타이머 경고 (마지막 1분), 주의 메시지          |
| **Red**          | `#DC2626` | rgb(220, 38, 38)  | 에러, 타이머 긴급 (마지막 10초), LLM 금지 배너 |

### Neutral (중성 색상)

| 컬러명            | Hex Code  | RGB             | 사용처                                |
| ----------------- | --------- | --------------- | ------------------------------------- |
| **Cool Gray 900** | `#111827` | rgb(17, 24, 39) | 본문 텍스트, 제목                     |
| **Cool Gray 600** | `#4B5563` | rgb(75, 85, 99) | 보조 텍스트, 안내 문구, 비활성 텍스트 |

### Background & Surface (배경)

| 컬러명            | Hex Code  | RGB                | 사용처                                      |
| ----------------- | --------- | ------------------ | ------------------------------------------- |
| **White**         | `#FFFFFF` | rgb(255, 255, 255) | 기본 배경, 입력 필드 배경, 카드 배경        |
| **Cool Gray 50**  | `#F9FAFB` | rgb(249, 250, 251) | 카드 배경, 입력 필드 배경 (대안), 예시 박스 |
| **Cool Gray 300** | `#D1D5DB` | rgb(209, 213, 219) | 구분선, 테두리, 비활성 버튼 배경            |

### 색상 사용 예시

```css
/* Primary 사용 */
.button-primary {
  background-color: #2563eb; /* Deep Blue */
  color: #ffffff;
}

.button-primary:hover {
  background-color: #1e40af; /* Dark Blue */
}

/* 타이머 색상 변화 */
.timer-normal {
  color: #111827;
} /* Cool Gray 900 */
.timer-warning {
  color: #f59e0b;
} /* Amber */
.timer-danger {
  color: #dc2626;
} /* Red */

/* 텍스트 계층 */
.text-primary {
  color: #111827;
} /* 본문 */
.text-secondary {
  color: #4b5563;
} /* 보조 */

/* 배경 */
.bg-main {
  background-color: #ffffff;
} /* 기본 */
.bg-surface {
  background-color: #f9fafb;
} /* 카드 */
.border {
  border-color: #d1d5db;
} /* 테두리 */
```

---

### 간격 시스템 (Spacing)

일관된 여백을 위한 8px 기반 스케일:

| 이름  | 값   | 사용처                     |
| ----- | ---- | -------------------------- |
| `xs`  | 4px  | 밀집된 요소 간격           |
| `sm`  | 8px  | 작은 여백                  |
| `md`  | 16px | 기본 여백 (가장 많이 사용) |
| `lg`  | 24px | 섹션 간격                  |
| `xl`  | 32px | 큰 섹션 구분               |
| `2xl` | 48px | 페이지 상하단 여백         |

**Tailwind 클래스**:

```jsx
<div className="p-4">     {/* padding: 16px */}
<div className="mt-6">    {/* margin-top: 24px */}
<div className="gap-2">   {/* gap: 8px */}
```

---

### 그림자 (Shadows)

최소한의 그림자만 사용:

| 이름     | 값                           | 사용처            |
| -------- | ---------------------------- | ----------------- |
| `soft`   | `0 2px 4px rgba(0,0,0,0.1)`  | 버튼, 카드        |
| `medium` | `0 4px 6px rgba(0,0,0,0.15)` | 버튼 호버         |
| `none`   | `0`                          | 입력 필드, 텍스트 |

---

### 모서리 (Border Radius)

| 이름   | 값     | 사용처                 |
| ------ | ------ | ---------------------- |
| `sm`   | 4px    | 작은 요소              |
| `md`   | 8px    | 버튼, 입력 필드 (기본) |
| `lg`   | 12px   | 카드                   |
| `full` | 9999px | 원형 (아이콘, 프로필)  |

---

### 타이포그래피 (Typography)

### 폰트 패밀리

```css
font-family: "Pretendard", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
  system-ui, sans-serif;
```

- **한글**: Pretendard (Variable)
- **영문**: Inter
- **Fallback**: 시스템 폰트

### 폰트 크기 & 용도

| 용도            | 크기 | Line Height | Font Weight     | Color     | 예시                             |
| --------------- | ---- | ----------- | --------------- | --------- | -------------------------------- |
| **제목 (H1)**   | 32px | 1.3         | 700 (Bold)      | `#111827` | "실험에 참여해주셔서 감사합니다" |
| **부제목 (H2)** | 24px | 1.4         | 700 (Bold)      | `#111827` | "참가자 정보 입력"               |
| **소제목 (H3)** | 20px | 1.5         | 600 (Semi-bold) | `#111827` | "AUT 창의력 측정"                |
| **본문**        | 16px | 1.6         | 400 (Regular)   | `#111827` | "한 줄에 하나씩 작성해주세요"    |
| **보조 텍스트** | 14px | 1.5         | 400 (Regular)   | `#4B5563` | "자동으로 배정되었습니다"        |
| **버튼**        | 16px | 1           | 600 (Semi-bold) | `#FFFFFF` | "다음"                           |
| **타이머**      | 20px | 1.2         | 600 (Semi-bold) | 동적      | "남은 시간 04:32"                |

### 텍스트 정렬

- **제목**: 중앙 정렬 (center)
- **본문**: 왼쪽 정렬 (left)
- **버튼**: 중앙 정렬 (center)
- **LLM 배너**: 중앙 정렬 (center)

### 예시 코드

```css
/* 제목 */
.heading-1 {
  font-size: 32px;
  line-height: 1.3;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

/* 본문 */
.body-text {
  font-size: 16px;
  line-height: 1.6;
  font-weight: 400;
  color: #111827;
}

/* 보조 텍스트 */
.caption {
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  color: #4b5563;
}
```

---

## 📐 레이아웃 시스템

### 기본 레이아웃

```
┌─────────────────────────────────┐
│  Header (Progress Bar)          │ ← 고정, 4px 높이
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────┐        │
│  │                     │        │
│  │  Main Content       │        │ ← max-width: 800px, 중앙 정렬
│  │  (중앙 정렬)        │        │
│  │                     │        │
│  └─────────────────────┘        │
│                                 │
└─────────────────────────────────┘
```

### 페이지 구조

```css
.page-container {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px 24px;
}

.content-wrapper {
  width: 100%;
  max-width: 800px;
}
```

### Progress Bar (헤더)

```css
.progress-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  z-index: 1000;
}

.progress-bar {
  height: 100%;
  background-color: #2563eb;
  transition: width 0.3s ease;
}
```

**표시 규칙**:

- 21단계 중 현재 위치 (1/21 = 4.76%, 21/21 = 100%)
- 매끄러운 애니메이션

---

## 🧩 컴포넌트 라이브러리

### 1. 버튼

#### Primary 버튼 (다음, 시작, 제출)

```css
.button-primary {
  /* 배경 & 텍스트 */
  background-color: #2563eb;
  color: #ffffff;

  /* 크기 & 간격 */
  padding: 12px 32px;
  border-radius: 8px;

  /* 폰트 */
  font-size: 16px;
  font-weight: 600;

  /* 효과 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
}

.button-primary:hover {
  background-color: #1e40af;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.button-primary:active {
  transform: translateY(1px);
}
```

#### 비활성 버튼

```css
.button-disabled {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}
```

**사용 예시**:

- IRB 동의서: 체크박스 선택 후 활성화
- 참가자 정보: 모든 필드 입력 후 활성화
- AUT/과제: 자동 활성화

---

### 2. 입력 필드 (Input, Textarea)

#### 기본 스타일

```css
.input-field {
  /* 배경 & 테두리 */
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;

  /* 크기 & 간격 */
  padding: 12px 16px;
  width: 100%;

  /* 폰트 */
  font-size: 16px;
  color: #111827;

  /* 효과 */
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border: 2px solid #2563eb;
  border-color: #2563eb;
}

.input-field::placeholder {
  color: #9ca3af;
}
```

#### Textarea (AUT 입력)

```css
.textarea-aut {
  min-height: 200px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}
```

**사용 예시**:

- 이름, 학번, 이메일 입력
- AUT 창의력 아이디어 입력
- 과제 답안 입력

---

### 3. 로딩 스피너

```css
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 버튼 내부 스피너 */
.button-loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  opacity: 0.7;
  cursor: wait;
}
```

**사용 시나리오**:

- 데이터 저장 중
- 페이지 전환 중
- API 요청 대기 중

**Tailwind 예시**:

```jsx
<button className="flex items-center gap-2" disabled>
  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
  저장 중...
</button>
```

---

### 4. 타이머

#### 스타일 정의

```css
.timer {
  /* 위치 */
  position: fixed;
  top: 24px;
  right: 24px;

  /* 배경 (선택사항) */
  background-color: #f9fafb;
  padding: 12px 24px;
  border-radius: 8px;

  /* 폰트 */
  font-size: 20px;
  font-weight: 600;

  /* 효과 */
  transition: color 0.3s ease;
}

/* 상태별 색상 */
.timer-normal {
  color: #111827;
}
.timer-warning {
  color: #f59e0b;
}
.timer-danger {
  color: #dc2626;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50%,
  100% {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0.5;
  }
}
```

**동작 규칙**:

- **60초 이상**: `#111827` (Neutral)
- **60초~10초**: `#F59E0B` (Amber)
- **10초 미만**: `#DC2626` (Red) + 깜빡임

---

### 5. IRB 동의서 컨테이너

```css
.consent-container {
  /* 스크롤 영역 */
  max-height: 400px;
  overflow-y: auto;

  /* 배경 & 테두리 */
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;

  /* 스크롤바 스타일 (선택사항) */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}

.consent-container::-webkit-scrollbar {
  width: 8px;
}

.consent-container::-webkit-scrollbar-track {
  background: #f9fafb;
}

.consent-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.consent-text {
  font-size: 14px;
  line-height: 1.8;
  color: #111827;
}

.consent-text h3 {
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 8px;
}

.consent-text p {
  margin-bottom: 12px;
}
```

**특징**:

- 약 2-4페이지 분량 (A4 기준)
- 스크롤 필요 (max-height: 400px)
- 읽기 쉬운 line-height: 1.8

---

### 6. 과제 문제 영역

```css
.problem-container {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.problem-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.problem-content {
  font-size: 16px;
  line-height: 1.8;
  color: #111827;
}

/* 이미지 */
.problem-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
}

/* 수식 (선택사항 - MathJax 사용 시) */
.math-expression {
  font-size: 18px;
  margin: 16px 0;
  text-align: center;
}
```

**지원 형식**:

- 텍스트 + 이미지 (가장 높은 확률)
- 수식 (MathJax 가능)
- 다이어그램

---

### 7. LLM 조건 배너

#### LLM 사용 가능

```css
.banner-llm-allowed {
  /* 배경 & 텍스트 */
  background-color: #2563eb;
  color: #ffffff;

  /* 크기 & 간격 */
  padding: 16px;
  width: 100%;

  /* 폰트 */
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}
```

#### LLM 사용 금지

```css
.banner-llm-forbidden {
  background-color: #dc2626;
  color: #ffffff;
  padding: 16px;
  width: 100%;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}
```

**텍스트 예시**:

- 사용 가능: "🤖 LLM 사용 가능 (브라우저를 열어 Gemini를 사용하세요)"
- 사용 금지: "⛔ LLM 사용 금지 (스스로 문제를 풀어주세요)"

---

### 8. 카드 / 박스

#### 기본 카드

```css
.card {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

#### 예시 박스 (AUT 예시)

```css
.example-box {
  background-color: #f9fafb;
  border-left: 4px solid #2563eb;
  padding: 16px;
  border-radius: 4px;
  margin-top: 12px;
}

.example-box-title {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 8px;
}

.example-box-content {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}
```

---

### 9. 에러 메시지

```css
.error-message {
  /* 배경 & 테두리 */
  background-color: #fee2e2;
  border-left: 4px solid #dc2626;

  /* 크기 & 간격 */
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;

  /* 폰트 */
  color: #dc2626;
  font-size: 16px;
  font-weight: 500;
}

.error-icon {
  display: inline-block;
  margin-right: 8px;
}
```

**텍스트 예시**: "⚠️ 네트워크 오류가 발생했습니다. 다시 시도해주세요."

---

### 10. 체크박스 (IRB 동의)

```css
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox:checked {
  background-color: #2563eb;
  border-color: #2563eb;
}

.checkbox-label {
  font-size: 16px;
  color: #111827;
  cursor: pointer;
}
```

---

## � 페이지 템플릿

### 기본 페이지

```jsx
export default function BasicPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: "23.8%" }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <h1 className="text-heading-1 text-neutral text-center mb-8">
            페이지 제목
          </h1>
          <p className="text-body text-neutral-light text-center mb-12">
            안내 문구
          </p>

          {/* 컨텐츠 */}

          <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-lg">
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 타이머 페이지 (AUT, 과제)

```jsx
export default function TimerPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div className="h-full bg-primary" style={{ width: "38%" }} />
      </div>

      {/* Timer */}
      <div className="fixed top-6 right-6 px-6 py-3 bg-surface rounded-lg">
        <span className="text-xl font-semibold text-warning">
          남은 시간 01:32
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl">{/* 컨텐츠 */}</div>
      </div>
    </div>
  );
}
```

### LLM 배너 페이지 (과제)

```jsx
export default function TaskPage({ llmAllowed }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div className="h-full bg-primary" style={{ width: "52%" }} />
      </div>

      {/* LLM Banner */}
      <div
        className={`w-full py-4 text-center text-lg font-bold text-white ${
          llmAllowed ? "bg-primary" : "bg-danger"
        }`}
      >
        {llmAllowed ? "🤖 LLM 사용 가능" : "⛔ LLM 사용 금지"}
      </div>

      {/* Timer */}
      <div className="fixed top-20 right-6 px-6 py-3 bg-surface rounded-lg">
        <span className="text-xl font-semibold text-neutral">
          남은 시간 04:32
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto">{/* 과제 컨텐츠 */}</div>
      </div>
    </div>
  );
}
```

---

## �🛠️ Tailwind CSS 설정

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1E40AF",
        },
        // Semantic
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        // Neutral
        neutral: {
          DEFAULT: "#111827",
          light: "#4B5563",
        },
        // Background & Surface
        surface: "#F9FAFB",
        border: "#D1D5DB",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        "heading-1": ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        "heading-2": ["24px", { lineHeight: "1.4", fontWeight: "700" }],
        "heading-3": ["20px", { lineHeight: "1.5", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      boxShadow: {
        soft: "0 2px 4px rgba(0, 0, 0, 0.1)",
        medium: "0 4px 6px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
```

### 사용 예시 (Tailwind 클래스)

```jsx
// 버튼
<button className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-lg shadow-soft transition-all">
  다음
</button>

// 입력 필드
<input
  className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:border-primary focus:outline-none"
  placeholder="이름을 입력하세요"
/>

// 카드
<div className="bg-surface rounded-xl p-6 shadow-soft">
  <h2 className="text-heading-2 text-neutral mb-4">AUT 창의력 측정</h2>
  <p className="text-body text-neutral">한 줄에 하나씩 작성해주세요.</p>
</div>

// 타이머 (동적 색상)
<div className={`fixed top-6 right-6 px-6 py-3 bg-surface rounded-lg text-xl font-semibold ${
  timeLeft > 60 ? 'text-neutral' : timeLeft > 10 ? 'text-warning' : 'text-danger'
}`}>
  남은 시간 {formatTime(timeLeft)}
</div>
```

---

## ✅ 구현 체크리스트

### Phase 1 (필수)

- [ ] Progress Bar (헤더 고정)
- [ ] 기본 레이아웃 (중앙 정렬, max-width: 800px)
- [ ] 컬러 팔레트 (10가지만 사용)
- [ ] 타이포그래피 (Pretendard, Inter)
- [ ] 버튼 (Primary, Disabled)
- [ ] 입력 필드 (Text, Textarea)
- [ ] 타이머 (3단계 색상 변화)
- [ ] LLM 배너 (사용 가능/금지)
- [ ] IRB 동의서 컨테이너 (스크롤)
- [ ] 체크박스

### Phase 2 (선택)

- [ ] 로딩 스피너
- [ ] 과제 이미지 표시
- [ ] 에러 메시지
- [ ] 카드/박스 컴포넌트

---

## 📏 디자인 제약사항

**필수 준수 사항**:

- ✅ **데스크톱 전용** (모바일 지원 불필요)
- ✅ **최소 해상도**: 1280px
- ✅ **10가지 색상만 사용** (임의 색상 금지)
- ✅ **이모지 아이콘 사용** (아이콘 라이브러리 불필요)

**선택 사항**:

- ⚠️ 수식 표시 (MathJax) - 필요 시 추가
- ⚠️ 다이어그램 - 이미지로 제공

---

**Last Updated**: 2025-11-13  
**Version**: 2.0 (레이아웃 시스템, 페이지 템플릿 추가)  
**Related**: [`product-requirements.md`](product-requirements.md), [`data-schema.md`](data-schema.md), [`api-specs.md`](api-specs.md)
