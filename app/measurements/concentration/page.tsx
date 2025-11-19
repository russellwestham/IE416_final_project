"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCPTTest,
  isTargetStimulus,
  CPT_CONFIG,
  type CPTResponse,
} from "@/lib/cptConfig";

function ConcentrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [participantId, setParticipantId] = useState("");
  const [measurementPoint, setMeasurementPoint] = useState<
    "pre" | "mid" | "post"
  >("pre");

  // CPT 상태
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStimulus, setCurrentStimulus] = useState("");
  const [showStimulus, setShowStimulus] = useState(false);
  const [responses, setResponses] = useState<CPTResponse[]>([]);
  const [stimulusStartTime, setStimulusStartTime] = useState<number | null>(
    null
  );
  const [hasResponded, setHasResponded] = useState(false);

  // 테스트 설정 (초기값은 null로 시작)
  const [test, setTest] = useState<ReturnType<typeof getCPTTest> | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("participantId");
    if (!id) {
      router.push("/");
      return;
    }
    setParticipantId(id);

    const point = (searchParams.get("point") || "pre") as
      | "pre"
      | "mid"
      | "post";
    setMeasurementPoint(point);
    setTest(getCPTTest(point, id)); // participantId 전달
  }, [router, searchParams]);

  // 반응 처리 함수
  const handleResponse = useCallback(() => {
    if (!showStimulus || hasResponded || !stimulusStartTime || !test) return;

    const reactionTime = Date.now() - stimulusStartTime;
    const isTarget = isTargetStimulus(currentStimulus, test.targets);

    const response: CPTResponse = {
      index: currentIndex,
      stimulus: currentStimulus,
      isTarget,
      responded: true,
      reactionTime,
      correct: isTarget, // 타겟에 반응했으므로 타겟이면 correct
    };

    setResponses((prev) => [...prev, response]);
    setHasResponded(true);
  }, [
    showStimulus,
    hasResponded,
    stimulusStartTime,
    currentStimulus,
    test,
    currentIndex,
  ]);

  // 키보드/마우스 입력 감지
  useEffect(() => {
    if (!isStarted) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handleResponse();
      }
    };

    const handleClick = () => {
      handleResponse();
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", handleClick);
    };
  }, [isStarted, handleResponse]);

  // CPT 메인 루프
  useEffect(() => {
    if (!isStarted || !test || currentIndex >= test.sequence.length) {
      if (isStarted && test && currentIndex >= test.sequence.length) {
        // 테스트 완료
        handleComplete();
      }
      return;
    }

    const stimulus = test.sequence[currentIndex];
    setCurrentStimulus(stimulus);

    // 자극 표시
    setShowStimulus(true);
    setStimulusStartTime(Date.now());
    setHasResponded(false);

    const stimulusTimer = setTimeout(() => {
      setShowStimulus(false);

      // 반응하지 않은 경우 기록
      if (!hasResponded && test) {
        const isTarget = isTargetStimulus(stimulus, test.targets);
        const response: CPTResponse = {
          index: currentIndex,
          stimulus,
          isTarget,
          responded: false,
          reactionTime: null,
          correct: !isTarget, // 타겟이 아닌 경우 반응 안 하면 correct
        };
        setResponses((prev) => [...prev, response]);
      }
    }, CPT_CONFIG.STIMULUS_DISPLAY_TIME);

    // 다음 자극으로 이동
    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setStimulusStartTime(null);
    }, CPT_CONFIG.STIMULUS_DURATION);

    return () => {
      clearTimeout(stimulusTimer);
      clearTimeout(nextTimer);
    };
  }, [isStarted, currentIndex, test, hasResponded]);

  const handleStart = () => {
    setIsStarted(true);
    setCurrentIndex(0);
    setResponses([]);
  };

  const handleComplete = useCallback(async () => {
    if (!test) return;

    // 통계 계산
    const correctHits = responses.filter(
      (r) => r.isTarget && r.responded && r.correct
    ).length;
    const falsePositives = responses.filter(
      (r) => !r.isTarget && r.responded
    ).length;
    const misses = responses.filter((r) => r.isTarget && !r.responded).length;

    const reactionTimes = responses
      .filter((r) => r.correct && r.reactionTime !== null)
      .map((r) => r.reactionTime as number);

    const avgReactionTime =
      reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 0;

    // 데이터 저장
    try {
      await fetch("/api/save-cpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          measurementPoint,
          testNumber: test.testNumber,
          targetStimuli: test.targets.join(","),
          sequence: test.sequence,
          responses: JSON.stringify(responses),
          correctHits,
          falsePositives,
          misses,
          avgReactionTime: Math.round(avgReactionTime * 10) / 10,
          timestamp: new Date().toISOString(),
        }),
      });

      // 다음 단계로 이동
      if (measurementPoint === "pre") {
        // 사전 측정: Task 1으로
        router.push("/task/intro?task=1");
      } else if (measurementPoint === "mid") {
        // 중간 측정: Task 2로
        router.push("/task/intro?task=2");
      } else {
        // 사후 측정: 완료 페이지로
        router.push("/completion");
      }
    } catch (error) {
      console.error("Error saving CPT data:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  }, [test, responses, participantId, measurementPoint, router]);

  if (!participantId || !test) {
    return (
      <div className="container-main min-h-screen py-8 flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container-main py-8">
        <div className="card max-w-4xl mx-auto">
          {!isStarted ? (
            // 시작 화면
            <>
              <div className="mb-6">
                <h1 className="text-h2 mb-4">집중력 테스트 (CPT)</h1>
                <p className="text-text-secondary mb-4">
                  Continuous Performance Test
                </p>
              </div>

              <div className="mb-6 p-6 bg-surface rounded-lg space-y-4">
                <h2 className="text-h3 mb-3">테스트 안내</h2>

                <div className="space-y-3 text-base">
                  <p>
                    <strong>📌 목적:</strong> 집중력과 주의력을 측정합니다.
                  </p>

                  <p>
                    <strong>⏱️ 소요 시간:</strong> 약 1분
                  </p>

                  <p>
                    <strong>🎯 타겟 자극:</strong>
                    <span className="ml-2 px-3 py-1 bg-primary text-white rounded-lg font-bold text-xl">
                      {test.targets.join(", ")}
                    </span>
                  </p>

                  <div className="border-t border-border pt-3 mt-3">
                    <p className="font-semibold mb-2">✅ 진행 방법:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>화면에 숫자나 알파벳이 빠르게 나타납니다</li>
                      <li>
                        <strong className="text-primary">
                          위에 표시된 타겟 자극
                        </strong>
                        이 나타나면 <strong>스페이스바</strong>로 반응하세요
                      </li>
                      <li>다른 자극에는 반응하지 마세요</li>
                      <li>최대한 빠르고 정확하게 반응하세요</li>
                    </ol>
                  </div>

                  <div className="border-t border-border pt-3 mt-3 bg-warning-light/20 p-3 rounded">
                    <p className="font-semibold mb-2 text-warning">
                      ⚠️ 중요: 타겟 자극을 꼭 기억하세요!
                    </p>
                    <p className="text-sm">
                      테스트가 시작되면 타겟 정보가 사라집니다.
                      <br />
                      <strong className="text-primary text-lg">
                        {test.targets.join(", ")}
                      </strong>{" "}
                      ← 이 자극들을 기억해주세요.
                    </p>
                  </div>

                  <div className="border-t border-border pt-3 mt-3">
                    <p className="font-semibold mb-2">📌 주의사항:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>테스트 중에는 페이지를 벗어나지 마세요</li>
                      <li>최대한 집중하여 진행해주세요</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  className="btn-primary text-lg px-8 py-4"
                  onClick={handleStart}
                >
                  테스트 시작
                </button>
              </div>
            </>
          ) : (
            // 테스트 진행 화면
            <div className="flex flex-col items-center justify-center min-h-[600px]">
              <div className="mb-8 text-center">
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentIndex + 1) / test.totalStimuli) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="relative w-64 h-64 flex items-center justify-center border-4 border-border rounded-lg bg-white">
                {showStimulus && (
                  <div className="text-9xl font-bold text-text-primary animate-pulse">
                    {currentStimulus}
                  </div>
                )}
              </div>

              <div className="mt-8 text-center text-text-secondary">
                <p className="text-lg">
                  <strong>스페이스바</strong>로 반응
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ConcentrationPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main min-h-screen py-8 flex items-center justify-center">
          <p>로딩 중...</p>
        </div>
      }
    >
      <ConcentrationContent />
    </Suspense>
  );
}
