"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTaskConfig } from "@/lib/counterbalancing";

// 수학 문제 풀 (M1, M2만 사용)
const MATH_PROBLEMS = [
  {
    id: "M1",
    title: "수학 문제",
    description: "다음 수학 문제를 풀어주세요.",
    content: `KAIST 기숙사 실거주 인원 모델링을 하고싶다.
기숙사 목록은 본인이 아는 범위 내에서 캠퍼스 내(문지, 화암 제외)만 포함하고, 방 타입: 1인실, 2인실, 3인실으로 가정하고 추정하시오.
단, 운영 변수 및 가정 스스로 정의 5개 이상 반드시 포함.
(ex. r_k: type K의 가용률, x_k: type k의 점유율)`,
  },
  {
    id: "M2",
    title: "수학 문제",
    description: "다음 수학 문제를 풀어주세요.",
    content: `KAIST 학부생 19학번 기준 '정규 4년 내 졸업 비율 (8학기 이내 졸업자)'을 모델링 후 추정하시오.
단, 운영 변수 및 가정 스스로 정의 5개 이상 반드시 포함.
(ex. 남여비율, 전문연구요원 비율, 복수전공 비율)`,
  },
];

// 2개의 수학 문제를 순서대로 반환 (A에는 M1, B에는 M2)
function selectMathProblems(): [
  (typeof MATH_PROBLEMS)[0],
  (typeof MATH_PROBLEMS)[0]
] {
  // A에는 항상 M1, B에는 항상 M2
  return [MATH_PROBLEMS[0], MATH_PROBLEMS[1]];
}

// 문제 데이터
const PROBLEMS = {
  수학: {
    A: {
      title: "수학 문제",
      description: "다음 수학 문제를 풀어주세요.",
      content: "", // 동적으로 채워짐 (M1 or M3)
      grading:
        "채점기준:\n- 변수 + 가정 정의의 사실성 (20점)\n- 논리성 (30점)\n- 타당성 일관성 (30점)\n- 표현 형식 (20점)",
    },
    B: {
      title: "수학 문제",
      description: "다음 수학 문제를 풀어주세요.",
      content: "", // 동적으로 채워짐 (M2 or M3)
      grading:
        "채점기준:\n- 변수 + 가정 정의의 사실성 (20점)\n- 논리성 (30점)\n- 타당성 일관성 (30점)\n- 표현 형식 (20점)",
    },
  },
  글쓰기: {
    A: {
      title: "글쓰기 문제 (W1)",
      description: "다음 주제에 대해 250자 내외로 논리적으로 서술하세요.",
      content:
        "W1: 학과설명회 요약본에 넣을 본인 전공 소개 1문단을 250자 내외로 작성하시오.\n\n반드시 포함:\n1. 사용하는 건물 및 주 연구 분야\n2. 대표 과목명 및 테크트리 요약\n3. 학과 복지 및 장점\n\n채점기준:\n- 사실성 정확성 (25점)\n- 구체성 명료성 (25점)\n- 논리성 (25점)\n- 필수요소 충족 (15점)\n- 분량 + 형식 준수 (10점)",
    },
    B: {
      title: "글쓰기 문제 (W2)",
      description: "다음 주제에 대해 250자 내외로 논리적으로 서술하세요.",
      content:
        'W2: KAIST에서 한 가장 의미있는 경험 1문단을 250자 내외로 작성하시오.\n\n반드시 포함:\n1. 언제, 무엇을, 어떻게?\n2. 왜 가장 의미있었는지\n3. 무엇을 배웠는지, 미래에 어떻게 도움이 될 것 같은지\n\n형식 제한: 구체 명사, 동사 사용 (모호어 금지: "열심히", "최선")\n\n채점기준:\n- 사실성 정확성 (25점)\n- 구체성 명료성 (25점)\n- 논리성 (25점)\n- 필수요소 충족 (15점)\n- 분량 + 형식 준수 (10점)',
    },
  },
};

interface TaskConfig {
  group: string;
  problem: string;
  llmCondition: string;
}

function TaskPerformContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [participantId, setParticipantId] = useState("");
  const [taskConfig, setTaskConfig] = useState<TaskConfig | null>(null);
  const [answer, setAnswer] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taskNumber = parseInt(searchParams.get("task") || "1") as 1 | 2;

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (isSubmitting) return; // 중복 제출 방지
      if (!startTime || !participantId || !taskConfig) return;

      // Soft limit: Warn if over 250 chars for writing problems
      if (
        taskConfig.group === "글쓰기" &&
        answer.replace(/\s/g, "").length > 250 &&
        !autoSubmit
      ) {
        if (
          !window.confirm("250자 내외로 작성해 주세요. 계속 제출하시겠습니까?")
        ) {
          return;
        }
      }

      setIsSubmitting(true);
      const duration = Date.now() - startTime;
      const wordCount = answer
        .trim()
        .split(/\s+/)
        .filter((w) => w).length;

      try {
        await fetch("/api/save-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId,
            taskNumber,
            taskType: taskConfig.group,
            problemVersion: taskConfig.problem,
            llmCondition: taskConfig.llmCondition,
            startTime: new Date(startTime).toISOString(),
            submitTime: new Date().toISOString(),
            duration,
            answer: answer.trim(),
            wordCount,
          }),
        });

        // 다음 단계로 이동
        if (taskNumber === 1) {
          router.push("/measurements/survey?point=mid");
        } else {
          router.push("/measurements/survey?point=post");
        }
      } catch (error) {
        console.error("Error saving task data:", error);
        setIsSubmitting(false);
        if (!autoSubmit) {
          alert("데이터 저장에 실패했습니다.");
        }
      }
    },
    [
      isSubmitting,
      startTime,
      participantId,
      taskConfig,
      answer,
      taskNumber,
      router,
    ]
  );

  useEffect(() => {
    const id = localStorage.getItem("participantId");
    if (!id) {
      router.push("/");
      return;
    }
    setParticipantId(id);

    const config = getTaskConfig(id, taskNumber);

    // 수학 문제인 경우, M1과 M2를 순서대로 할당
    if (config.group === "수학") {
      const [problem1, problem2] = selectMathProblems();
      PROBLEMS.수학.A.content = problem1.content;
      PROBLEMS.수학.B.content = problem2.content;
    }

    setTaskConfig(config);

    // 타이머 시작
    setStartTime(Date.now());
  }, [router, taskNumber]);

  // 글자 수 카운트
  useEffect(() => {
    setCharCount(answer.replace(/\s/g, "").length);
  }, [answer]);

  // 타이머 useEffect (절대 시간 기반)
  useEffect(() => {
    if (!startTime) return;

    const TOTAL_TIME = 300; // 5분 = 300초
    const endTime = startTime + TOTAL_TIME * 1000; // 종료 시각 계산

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

      setTimeLeft(remaining);

      if (remaining <= 0) {
        handleSubmit(true); // 자동 제출
      }
    };

    // 즉시 한 번 업데이트
    updateTimer();

    // 100ms마다 체크 (더 정확한 타이머)
    const timer = setInterval(updateTimer, 100);

    return () => clearInterval(timer);
  }, [startTime, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!taskConfig) {
    return (
      <div className="container-main min-h-screen py-8 flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  const problem =
    PROBLEMS[taskConfig.group as "수학" | "글쓰기"][
      taskConfig.problem as "A" | "B"
    ];

  return (
    <main className="min-h-screen">
      {/* LLM 조건 배너 (상단 고정) */}
      <div
        className={`w-full p-4 text-center text-white font-bold text-lg sticky top-0 z-10 ${
          taskConfig.llmCondition === "LLM" ? "bg-primary" : "bg-danger"
        }`}
      >
        {taskConfig.llmCondition === "LLM" ? (
          <>🤖 LLM 사용 가능</>
        ) : (
          <>⛔ LLM 사용 금지</>
        )}
        <span className="ml-4 font-mono text-2xl">{formatTime(timeLeft)}</span>
      </div>

      <div className="container-main py-8">
        <div className="card max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-h2 mb-2">{problem.title}</h1>
            <p className="text-text-secondary">{problem.description}</p>
          </div>

          {/* 문제 */}
          <div className="mb-6 p-6 bg-surface rounded-lg">
            <p className="text-lg whitespace-pre-line">{problem.content}</p>

            {/* 채점기준 표시 */}
            {taskConfig.group === "수학" && "grading" in problem && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-text-secondary whitespace-pre-line">
                  {problem.grading}
                </p>
              </div>
            )}
          </div>

          {/* 답안 입력 */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold">답안 작성</label>
            <textarea
              className="input-field min-h-[400px] font-mono text-base"
              placeholder="답안을 입력하세요..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={timeLeft === 0}
              maxLength={taskConfig.group === "글쓰기" ? 400 : undefined}
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-2">
              <p className="text-sm text-text-secondary">
                작성한 단어 수:{" "}
                {
                  answer
                    .trim()
                    .split(/\s+/)
                    .filter((w) => w).length
                }
                개
              </p>
              {taskConfig.group === "글쓰기" && (
                <p
                  className={`text-sm ${
                    charCount > 250 ? "text-danger" : "text-text-secondary"
                  }`}
                >
                  글자 수(공백 제외): {charCount} / 250자
                  {charCount > 250 && " (초과)"}
                </p>
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end">
            <button
              className="btn-primary text-lg px-8 py-4"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !answer.trim()}
            >
              {isSubmitting ? "저장 중..." : "제출"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TaskPerformPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main min-h-screen py-8 flex items-center justify-center">
          <p>로딩 중...</p>
        </div>
      }
    >
      <TaskPerformContent />
    </Suspense>
  );
}
