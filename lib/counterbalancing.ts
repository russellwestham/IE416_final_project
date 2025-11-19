/**
 * 카운터밸런싱 로직
 * experiment-logic.md 기반
 */

// AUT 물건 목록
const AUT_OBJECT_LIST = ["벽돌", "클립", "종이컵"];

/**
 * 시드 기반 랜덤 함수 (Fisher-Yates shuffle)
 * 동일한 참가자는 항상 동일한 순서를 얻음
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;
  
  // 간단한 LCG (Linear Congruential Generator)
  const random = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  // Fisher-Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * 참가자별 AUT 물건 순서 생성
 * 각 참가자는 고유한 시드를 가지며, 동일한 참가자는 항상 같은 순서를 얻음
 */
function generateAUTObjectOrder(participantId: string): {
  pre: string;
  mid: string;
  post: string;
} {
  // 참가자 ID를 숫자로 변환하여 시드로 사용
  const seed = parseInt(participantId.replace("P", "")) || 1;
  const shuffled = seededShuffle(AUT_OBJECT_LIST, seed);
  
  return {
    pre: shuffled[0],
    mid: shuffled[1],
    post: shuffled[2],
  };
}

// Condition Type에 따른 과제 설정
export interface TaskConfig {
  task1: {
    problem: "A" | "B";
    llmCondition: "LLM" | "NoLLM";
  };
  task2: {
    problem: "A" | "B";
    llmCondition: "LLM" | "NoLLM";
  };
}

export const CONDITION_CONFIGS: { [key: number]: TaskConfig } = {
  1: {
    task1: { problem: "A", llmCondition: "NoLLM" },
    task2: { problem: "B", llmCondition: "LLM" },
  },
  2: {
    task1: { problem: "B", llmCondition: "NoLLM" },
    task2: { problem: "A", llmCondition: "LLM" },
  },
  3: {
    task1: { problem: "A", llmCondition: "LLM" },
    task2: { problem: "B", llmCondition: "NoLLM" },
  },
  4: {
    task1: { problem: "B", llmCondition: "LLM" },
    task2: { problem: "A", llmCondition: "NoLLM" },
  },
};

/**
 * Participant ID로부터 AUT Type 계산
 */
export function getAUTType(participantId: string): number {
  const num = parseInt(participantId.replace("P", ""));
  return ((num - 1) % 6) + 1;
}

/**
 * Participant ID로부터 Condition Type 계산
 */
export function getConditionType(participantId: string): number {
  const num = parseInt(participantId.replace("P", ""));
  return ((num - 1) % 4) + 1;
}

/**
 * Participant ID로부터 Group 계산
 */
export function getGroup(participantId: string): "수학" | "글쓰기" {
  const num = parseInt(participantId.replace("P", ""));
  return num % 2 === 1 ? "수학" : "글쓰기";
}

/**
 * AUT 물건 가져오기 (랜덤화)
 * 각 참가자는 고유한 순서를 가지며, 동일한 참가자는 항상 같은 순서를 얻음
 */
export function getAUTObject(
  participantId: string,
  point: "pre" | "mid" | "post"
): string {
  const objectOrder = generateAUTObjectOrder(participantId);
  return objectOrder[point];
}

/**
 * 과제 설정 가져오기
 */
export function getTaskConfig(
  participantId: string,
  taskNumber: 1 | 2
): {
  problem: "A" | "B";
  llmCondition: "LLM" | "NoLLM";
  group: "수학" | "글쓰기";
} {
  const conditionType = getConditionType(participantId);
  const group = getGroup(participantId);
  const config = CONDITION_CONFIGS[conditionType];

  const taskConfig = taskNumber === 1 ? config.task1 : config.task2;

  return {
    ...taskConfig,
    group,
  };
}
