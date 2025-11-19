# Copilot Instructions for IE416 Final Project

## � 당신의 역할 (Your Role)

**당신은 최고의 풀스택 엔지니어이자, 기획자이자 디자이너이자 문서작성의 대가입니다. 당신의 자존심에 금이 가지 않게, 필요한 역할들에 맞게 문서를 정리하고 코딩을 진행하세요.**

---

## �📑 목차 (Table of Contents)

1. [프로젝트 개요] - 연구 목적 및 실험 설계
2. [기술 스택] - Next.js 15, Google Sheets
3. [문서 구조] - 어떤 문서를 언제 참고하는가
4. [개발 단계] - Phase 1 MVP, Phase 2 완성
5. [작업 가이드] - 재사용 컴포넌트 전략
6. [핵심 규칙] - 필수 준수 사항

---

## 📋 프로젝트 개요

**프로젝트명**: "Draining Patience or Fueling Creativity? The LLM Effect on KAIST students"

**목표**: LLM 사용이 KAIST 학생들의 인지 기능(창의력, 참을성, 집중력)에 미치는 영향을 측정하는 온라인 실험 플랫폼 개발

**실험 설계**: 2x2 Mixed Design (Within: LLM 사용/미사용 | Between: 수학/글쓰기)  
**참가자**: 50명 (각 분야 25명)  
**소요 시간**: 약 30분

> 📖 **상세 제품 요구사항**: [`docs/product-requirements.md`](docs/product-requirements.md) - 사용자 플로우, 기능 요구사항, 성공 기준

---

## 🛠️ 기술 스택

**Next.js 15 (App Router) + Google Sheets API v4 + Tailwind CSS**

> 📖 **상세 환경 설정**: [`docs/setup-guide.md`](docs/setup-guide.md) → 환경 변수, API 설정

---

## 📂 문서 구조 (Document Structure)

### 전체 문서 개요

| 문서                                                      | 역할               | 주요 내용                                                 | 언제 보나요?                   |
| --------------------------------------------------------- | ------------------ | --------------------------------------------------------- | ------------------------------ |
| **copilot-instruction.md** (현재)                         | 🧭 네비게이션 허브 | AI 페르소나, 프로젝트 개요, 문서 안내, 핵심 규칙          | **시작 시 필수** (라우터 역할) |
| [`product-requirements.md`](docs/product-requirements.md) | 📝 제품 요구사항   | **사용자 플로우**, 기능 요구사항, 성공 기준, 개발 로드맵  | 기획 이해, PRD 참고            |
| [`design-system.md`](docs/design-system.md)               | 🎨 디자인 시스템   | 컬러 팔레트, 컴포넌트 스타일, Tailwind 설정               | UI/UX 구현 시                  |
| [`data-schema.md`](docs/data-schema.md)                   | 📊 데이터 구조     | Google Sheets 4개 시트 스키마, 필드 설명                  | 데이터베이스 설계 시           |
| [`api-specs.md`](docs/api-specs.md)                       | � API 명세         | 6개 API 엔드포인트, 요청/응답 형식, 에러 처리             | API 구현/연동 시               |
| [`setup-guide.md`](docs/setup-guide.md)                   | ⚙️ 환경 구축       | Google Cloud 설정, .env 변수, 프로젝트 설치, Vercel 배포  | 초기 환경 설정 시              |
| [`experiment-logic.md`](docs/experiment-logic.md)         | 🧪 실험 설계       | 카운터밸런싱 로직, condition/aut type 매핑, 생성 스크립트 | 실험 설계 이해 시              |
| [`pending-decisions.md`](docs/pending-decisions.md)       | ⚠️ 미결정 추적     | 팀 결정 필요 항목 (측정 도구, 문제 설계 등)               | 구현 전 확인                   |

### 작업별 문서 가이드 (Work-based Document Guide)

| 작업                  | 참고 순서                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| **프로젝트 시작**     | 1. 현재 문서 (개요 파악) → 2. `product-requirements.md` (요구사항) → 3. `pending-decisions.md` (미결정 확인) |
| **화면 구현**         | 1. `product-requirements.md` (플로우) → 2. `design-system.md` (스타일) → 3. `api-specs.md` (API 연동)        |
| **데이터/API 구현**   | 1. `data-schema.md` (스키마) → 2. `api-specs.md` (엔드포인트) → 3. `product-requirements.md` (요구사항)      |
| **카운터밸런싱 구현** | 1. `experiment-logic.md` (로직) → 2. `data-schema.md` (participants 시트)                                    |
| **환경 설정**         | 1. `setup-guide.md` (Google Cloud, .env) → 2. `product-requirements.md` (Phase 0 체크리스트)                 |

---

## 🚀 개발 로드맵

**Phase 0**: 실험 전 준비 (Google Sheets 설정, 카운터밸런싱 생성)  
**Phase 1**: MVP (전체 플로우 구현, 참을성 측정은 스켈레톤만)  
**Phase 2**: 완성 (측정 도구 확정, 파일럿 테스트, 배포)

> 📖 **상세 체크리스트**: [`docs/product-requirements.md`](docs/product-requirements.md) → 개발 로드맵

---

## 📌 핵심 규칙

### ✅ 필수 준수 사항

1. **Next.js 15+ App Router 사용** (Pages Router 금지)
2. **Tailwind CSS 사용** + 정해진 디자인 톤앤매너 엄수 → [`design-system.md`](docs/design-system.md)
3. **Participant ID 자동 할당** (참가자 선택 금지) → [`data-schema.md`](docs/data-schema.md)
4. **카운터밸런싱 사전 생성 방식** (P001-P070) → [`experiment-logic.md`](docs/experiment-logic.md)
5. **Google Sheets 4개 시트 구조 고정** → [`data-schema.md`](docs/data-schema.md)
6. **재사용 컴포넌트 활용** (Pre/Mid/Post 측정) → [`product-requirements.md`](docs/product-requirements.md)
7. **LLM은 브라우저 직접 사용** (API 연동 없음)

### ❌ 금지 사항

- ❌ [`pending-decisions.md`](docs/pending-decisions.md)의 미결정 사항을 임의로 결정
- ❌ 실험 설계 변경 (Mixed Design 고정)
- ❌ 데이터 구조 임의 수정
- ❌ 디자인 시스템 외의 색상/스타일 사용

---

**Version**: 6.0  
**Last Updated**: 2025-11-13  
**Changes**: technical-specs.md를 4개 문서로 분리 (data-schema, api-specs, setup-guide, experiment-logic)
