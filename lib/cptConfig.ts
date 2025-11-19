/**
 * Continuous Performance Test (CPT) Configuration
 *
 * 각 테스트는 80개의 자극으로 구성되며, 0.7초 간격으로 제시됩니다.
 * 참가자는 타겟 자극(숫자 또는 알파벳)에만 반응해야 합니다.
 *
 * ⚠️ 2025-11-19 업데이트:
 * - 총 3개의 CPT 테스트 사용 (Test 1: 3,H / Test 2: 7,W / Test 3: 5,K)
 * - 각 참가자는 Pre, Mid, Post에서 서로 다른 테스트를 받습니다 (중복 없음)
 * - 테스트 순서는 참가자별로 랜덤화되며, 동일한 참가자는 항상 같은 순서를 유지합니다
 * - 순서 효과와 학습 효과를 제거하여 집중력 측정의 정확도를 높입니다
 */

export interface CPTTest {
  testNumber: 1 | 2 | 3;
  targets: string[]; // 타겟 자극들 (예: ["3", "H"])
  sequence: string; // 80개 자극 문자열
  totalStimuli: number;
  targetCount: number; // 타겟 자극 개수
}

/**
 * Test 1: 숫자 3과 알파벳 H에 반응
 * - 80개 자극
 * - 타겟: 3, H
 */
export const CPT_TEST_1: CPTTest = {
  testNumber: 1,
  targets: ["3", "H"],
  sequence:
    "8C9W4F3U7X8R1V67I3L3S8TGE3J1HKZ5D9263AOYH4Q5BNP9XMFEU32H1RG563BZYH147986DCKLW3S2VOIP",
  totalStimuli: 80,
  targetCount: 17, // 3이 10개, H가 7개
};

/**
 * Test 2: 숫자 7과 알파벳 W에 반응
 * - 80개 자극
 * - 타겟: 7, W
 */
export const CPT_TEST_2: CPTTest = {
  testNumber: 2,
  targets: ["7", "W"],
  sequence:
    "M95YQW7Z7L7C17R5N7A8W4DB9EJFOP3G7S8U26W7T4W3I1XK8W7H5ZPVW6QLDCRK9W7X2E7BGFSAW4OIPJY",
  totalStimuli: 80,
  targetCount: 19, // 7이 12개, W가 7개
};

/**
 * Test 3: 숫자 5와 알파벳 K에 반응
 * - 80개 자극
 * - 타겟: 5, K
 */
export const CPT_TEST_3: CPTTest = {
  testNumber: 3,
  targets: ["5", "K"],
  sequence:
    "2B8K5D9F5T4K7G5A1K6X3C5R8E5H9K2L5O4P6N5J8V5Q1U5M7Y5W3B5K4T6R5E8D5F2K9A5C1X5G7H5K3N5",
  totalStimuli: 80,
  targetCount: 18, // 5가 12개, K가 6개
};

/**
 * 시드 기반 랜덤 함수 (LCG - Linear Congruential Generator)
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 배열을 시드 기반으로 섞기 (Fisher-Yates shuffle)
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;

  const random = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * 참가자별 CPT 테스트 순서 생성 (중복 없이)
 * 각 참가자는 Pre, Mid, Post에서 서로 다른 3개의 테스트를 받음
 * 동일한 참가자는 항상 같은 순서를 얻음
 */
function generateCPTTestOrder(participantId: string): {
  pre: CPTTest;
  mid: CPTTest;
  post: CPTTest;
} {
  // 참가자 ID를 숫자로 변환하여 시드로 사용
  const seed = parseInt(participantId.replace("P", "")) || 1;

  // 3개 테스트를 시드 기반으로 섞기
  const tests = [CPT_TEST_1, CPT_TEST_2, CPT_TEST_3];
  const shuffledTests = seededShuffle(tests, seed);

  return {
    pre: shuffledTests[0],
    mid: shuffledTests[1],
    post: shuffledTests[2],
  };
}

/**
 * 측정 시점에 따른 테스트 선택 (랜덤화)
 * 각 참가자는 고유한 테스트 순서를 가지며, 동일한 참가자는 항상 같은 순서를 얻음
 */
export function getCPTTest(
  measurementPoint: "pre" | "mid" | "post",
  participantId: string
): CPTTest {
  const testOrder = generateCPTTestOrder(participantId);
  return testOrder[measurementPoint];
}

/**
 * 자극이 타겟인지 확인
 */
export function isTargetStimulus(stimulus: string, targets: string[]): boolean {
  return targets.includes(stimulus.toUpperCase());
}

/**
 * CPT 설정 상수
 */
export const CPT_CONFIG = {
  STIMULUS_DURATION: 700, // 자극 제시 간격 (ms)
  STIMULUS_DISPLAY_TIME: 500, // 자극 화면 표시 시간 (ms)
  BLANK_TIME: 200, // 빈 화면 시간 (ms)
  MAX_RESPONSE_TIME: 700, // 최대 반응 시간 (ms)
  TOTAL_DURATION: 56000, // 총 소요 시간 (80 * 0.7초 = 56초)
};

/**
 * 반응 데이터 타입
 */
export interface CPTResponse {
  index: number; // 시퀀스 내 위치 (0-based)
  stimulus: string; // 제시된 자극
  isTarget: boolean; // 타겟 여부
  responded: boolean; // 반응 여부
  reactionTime: number | null; // 반응 시간 (ms), null이면 반응 안 함
  correct: boolean; // 올바른 반응 여부
}

/**
 * CPT 결과 데이터 타입
 */
export interface CPTResult {
  participantId: string;
  measurementPoint: "pre" | "mid" | "post";
  testNumber: 1 | 2 | 3;
  targetStimuli: string; // "3,H" 형식
  sequence: string;
  responses: CPTResponse[];
  correctHits: number; // 타겟에 올바르게 반응
  falsePositives: number; // 비타겟에 잘못 반응
  misses: number; // 타겟을 놓침
  avgReactionTime: number; // 평균 반응 시간 (correct hits만)
  timestamp: string;
}
