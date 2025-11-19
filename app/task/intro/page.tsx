"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTaskConfig } from "@/lib/counterbalancing";

function TaskIntroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [participantId, setParticipantId] = useState("");
  const [taskConfig, setTaskConfig] = useState<any>(null);

  const taskNumber = parseInt(searchParams.get("task") || "1") as 1 | 2;

  useEffect(() => {
    const id = localStorage.getItem("participantId");
    if (!id) {
      router.push("/");
      return;
    }
    setParticipantId(id);

    // 카운터밸런싱 정보 가져오기
    const config = getTaskConfig(id, taskNumber);
    setTaskConfig(config);
  }, [router, taskNumber]);

  const handleStart = () => {
    router.push(`/task/perform?task=${taskNumber}`);
  };

  if (!taskConfig) {
    return (
      <div className="container-main min-h-screen py-8 flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <main className="container-main min-h-screen">
      <div className="card max-w-3xl mx-auto bg-white/95 backdrop-blur">
        <h1 className="mb-6 text-center">과제 {taskNumber} 안내</h1>

        {/* LLM 조건 배너 */}
        <div
          className={`mb-6 p-4 rounded-lg text-center text-white font-bold text-lg ${
            taskConfig.llmCondition === "LLM" ? "bg-primary" : "bg-danger"
          }`}
        >
          {taskConfig.llmCondition === "LLM" ? (
            <>
              🤖{" "}
              <span className="ml-2">
                이번 과제에서는 LLM(AI)을 사용할 수 있습니다
              </span>
            </>
          ) : (
            <>
              ⛔{" "}
              <span className="ml-2">
                이번 과제에서는 LLM(AI)을 사용할 수 없습니다
              </span>
            </>
          )}
        </div>

        <div className="space-y-6 mb-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">과제 정보</h2>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>
                과제 분야: <strong>{taskConfig.group}</strong>
              </li>
              <li>
                문제 버전: <strong>Problem {taskConfig.problem}</strong>
              </li>
              <li>
                LLM 조건:{" "}
                <strong>
                  {taskConfig.llmCondition === "LLM"
                    ? "LLM 사용 가능"
                    : "LLM 사용 금지"}
                </strong>
              </li>
              <li>
                제한 시간: <strong>5분</strong>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">주의사항</h2>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>화면 상단의 조건 배너를 항상 확인해주세요</li>
              <li>제한 시간 5분이 지나면 자동으로 제출됩니다</li>
              {taskConfig.llmCondition === "LLM" ? (
                <li className="text-primary font-semibold">
                  LLM(Gemini 2.5 pro로 제한)을 자유롭게 사용할 수 있습니다
                </li>
              ) : (
                <li className="text-danger font-semibold">
                  이번 과제에서는 LLM을 사용하지 말아주세요
                </li>
              )}
              <li>답안은 자동으로 저장됩니다</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-center">
          <button
            className="btn-primary text-lg px-8 py-4"
            onClick={handleStart}
          >
            과제 시작
          </button>
        </div>
      </div>
    </main>
  );
}

export default function TaskIntroPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main min-h-screen py-8 flex items-center justify-center">
          <p>로딩 중...</p>
        </div>
      }
    >
      <TaskIntroContent />
    </Suspense>
  );
}
