"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTaskConfig } from "@/lib/counterbalancing";

// 수학 문제 풀 (M1~M4)
const MATH_PROBLEMS = [
  {
    id: "M1",
    title: "수학 문제",
    description: "다음 수학 문제를 풀어주세요.",
    content: `KAIST 학생 일주일 지출 모델링
1. 기준 주간 지출 합계를 구하시오.
2. Cafeteria 항목에 +5% 인상이 적용될 때 주간 총 지출은?
3. Card 결제에는 2% 캐시백, AppPay에는 1% 수수료가 적용될 때 주간 총지출은?
4. 위 네 금액을 budget_won(=90,000)과 비교하여, 예산 내/초과를 표기하고, 가장 효과적인 절감 포인트 1가지를 한 줄로 제안하시오.`,
  },
  {
    id: "M2",
    title: "수학 문제",
    description: "다음 수학 문제를 풀어주세요.",
    content: `KAIST 기숙사 실거주 인원 모델링
기숙사 목록은 본인이 아는 범위 내에서 캠퍼스 내(문지, 화암 제외)만 포함.
방 타입: 1인실, 2인실, 3인실
운영 변수 및 가정 스스로 정의 5개 이상 (ex. r_k: type K의 가용률, x_k: type k의 점유율)`,
  },
  {
    id: "M3",
    title: "수학 문제",
    description: "다음 수학 문제를 풀어주세요.",
    content: `2023년 7월 육군 입대한 병사가 한 푼도 안쓴채 월급을 모았다면, 전역할 때 모으는 돈은 얼마일까?`,
  },
  {
    id: "M4",
    title: "수학 문제",
    description: "다음 수학 문제를 풀어주세요.",
    content: `오늘은 2023년 10월 21일 토요일
은평구에 사는 민규가 편의점에서 음식을 쓰레기봉투 10L 크기를 3개 구매했다.
이후 같은 건물 2층 CGV에서 오후 8시, A열 좌석 2D 티켓 1장을 현금으로 예매해 영화를 찾다면, 민규가 쓴 돈의 총액은 얼마일까?`,
  },
];

// 랜덤으로 2개의 수학 문제 선택 (시드 기반으로 일관성 유지)
function selectMathProblems(
  participantId: string
): [(typeof MATH_PROBLEMS)[0], (typeof MATH_PROBLEMS)[0]] {
  // 참가자 ID를 기반으로 시드 생성 (P001 -> 1, P002 -> 2, ...)
  const seed = parseInt(participantId.replace("P", "")) || 1;

  // 시드 기반 랜덤 함수 (동일한 참가자는 항상 동일한 문제 조합)
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  // 4개 중 2개 선택
  const indices = [0, 1, 2, 3];
  const random1 = Math.floor(seededRandom(seed) * 4);
  const firstIndex = indices.splice(random1, 1)[0];
  const random2 = Math.floor(seededRandom(seed + 100) * 3);
  const secondIndex = indices[random2];

  return [MATH_PROBLEMS[firstIndex], MATH_PROBLEMS[secondIndex]];
}

// 문제 데이터
const PROBLEMS = {
  수학: {
    A: {
      title: "수학 문제",
      description: "다음 수학 문제를 풀어주세요.",
      content: "", // 동적으로 채워짐
    },
    B: {
      title: "수학 문제",
      description: "다음 수학 문제를 풀어주세요.",
      content: "", // 동적으로 채워짐
    },
  },
  글쓰기: {
    A: {
      title: "글쓰기 문제",
      description: "다음 주제에 대해 250자 내외로 논리적으로 서술하세요.",
      content:
        "학과설명회 요약본에 넣을 본인 전공 소개 1문단을 250자 내외로 작성하시오.\n\n반드시 포함:\n1. 사용하는 건물 및 주 연구 분야\n2. 대표 과목명 및 테크트리 요약\n3. 학과 복지 및 장점",
    },
    B: {
      title: "글쓰기 문제",
      description: "다음 주제에 대해 250자 내외로 논리적으로 서술하세요.",
      content:
        "KAIST 메일로 보낼 'KAIST 셔틀 지연 대응 공지' 관련 행정 공지문을 250자 내외로 작성하시오.\n\n반드시 포함:\n1. 'N1_Library 9–10시 평균 지연값'을 정확 인용\n2. 구체적 시간의 데이터 결측(장비 재부팅) 사실 언급\n3. 혼잡 대응 안내 1–2가지",
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
          router.push("/measurements/aut?point=mid&round=1");
        } else {
          router.push("/measurements/aut?point=post&round=1");
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

    // 수학 문제인 경우, 랜덤으로 선택된 2개 문제를 할당
    if (config.group === "수학") {
      const [problem1, problem2] = selectMathProblems(id);
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

            {/* M1 문제일 때 데이터 파일 다운로드 버튼 표시 */}
            {taskConfig.group === "수학" &&
              (PROBLEMS.수학.A.content.includes(
                "KAIST 학생 일주일 지출 모델링"
              ) ||
                PROBLEMS.수학.B.content.includes(
                  "KAIST 학생 일주일 지출 모델링"
                )) &&
              problem.content.includes("KAIST 학생 일주일 지출 모델링") && (
                <div className="mt-4 pt-4 border-t border-border">
                  <a
                    href="/data/kaist_spending.csv"
                    download="kaist_spending.csv"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    데이터 파일 다운로드 (kaist_spending.csv)
                  </a>
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
