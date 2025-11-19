"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// AUT Type에 따른 물건 매핑
const AUT_OBJECTS: {
  [key: number]: { pre: string; mid: string; post: string };
} = {
  1: { pre: "500ml 페트병", mid: "클립", post: "종이컵" },
  2: { pre: "500ml 페트병", mid: "종이컵", post: "클립" },
  3: { pre: "클립", mid: "500ml 페트병", post: "종이컵" },
  4: { pre: "클립", mid: "종이컵", post: "500ml 페트병" },
  5: { pre: "종이컵", mid: "500ml 페트병", post: "클립" },
  6: { pre: "종이컵", mid: "클립", post: "500ml 페트병" },
};

function AUTContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [participantId, setParticipantId] = useState("");
  const [objectName, setObjectName] = useState("");
  const [response, setResponse] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2분 = 120초
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // URL 파라미터 읽기
  const point = searchParams.get("point") || "pre"; // pre, mid, post
  const round = searchParams.get("round") || "1"; // 1, 2, 3

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (isSubmitting) return; // 중복 제출 방지
      if (!startTime || !participantId || !objectName) return;

      setIsSubmitting(true);
      const responseTime = Date.now() - startTime;

      try {
        await fetch("/api/save-aut", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId,
            autRound: parseInt(round),
            point,
            objectName,
            response: response.trim(), // 현재 입력된 텍스트 그대로 저장
            responseTime,
            timestamp: new Date().toISOString(),
          }),
        });

        // 다음 단계로 이동
        if (point === "pre" && round === "1") {
          router.push("/measurements/concentration?point=pre");
        } else if (point === "mid" && round === "1") {
          router.push("/measurements/concentration?point=mid");
        } else if (point === "post" && round === "1") {
          router.push("/measurements/concentration?point=post");
        }
      } catch (error) {
        console.error("Error saving AUT data:", error);
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
      objectName,
      response,
      round,
      point,
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

    // Participant ID에서 AUT Type 계산 (P001 → 1, P002 → 2, ...)
    const participantNum = parseInt(id.replace("P", ""));
    const calculatedAutType = ((participantNum - 1) % 6) + 1;

    // AUT Type과 측정 시점에 따라 물건 결정
    const objects = AUT_OBJECTS[calculatedAutType];
    if (objects) {
      const obj =
        point === "pre"
          ? objects.pre
          : point === "mid"
          ? objects.mid
          : objects.post;
      setObjectName(obj);
    }

    // 타이머는 시작 버튼 클릭 시 시작
  }, [router, point, searchParams]);

  const handleStart = () => {
    setIsStarted(true);
    setStartTime(Date.now());
  };

  // 타이머 useEffect (별도 분리)
  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // 자동 제출 - 최신 response 값 사용
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 60) return "text-success";
    if (timeLeft > 30) return "text-warning";
    return "text-danger";
  };

  if (!objectName) {
    return (
      <div className="container-main min-h-screen py-8 flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <main className="container-main min-h-screen py-8">
      <div className="card max-w-3xl mx-auto">
        {!isStarted ? (
          // 시작 화면
          <>
            <div className="mb-6">
              <h1 className="text-h2 mb-4">AUT 창의성 테스트</h1>
              <p className="text-text-secondary mb-2">Alternative Uses Task</p>
              <p className="text-sm text-text-secondary">
                {point === "pre"
                  ? "사전 측정"
                  : point === "mid"
                  ? "중간 측정"
                  : "사후 측정"}{" "}
                - Round {round}
              </p>
            </div>

            <div className="mb-6 p-6 bg-surface rounded-lg space-y-4">
              <h2 className="text-h3 mb-3">테스트 안내</h2>

              <div className="space-y-3 text-base">
                <p>
                  <strong>📌 목적:</strong> 창의적 사고력을 측정합니다.
                </p>

                <p>
                  <strong>⏱️ 소요 시간:</strong> 2분
                </p>

                <p>
                  <strong>🎯 과제:</strong> 제시된 물건의 다양한 용도 생각하기
                </p>

                <div className="border-t border-border pt-3 mt-3">
                  <p className="font-semibold mb-2">✅ 진행 방법:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>제시된 물건의 독창적이고 다양한 용도를 생각하세요</li>
                    <li className="font-semibold text-primary">
                      ⚠️ 중요: 한 줄에 하나의 용도만 작성 (Enter로 줄바꿈)
                    </li>
                    <li>띄어쓰기로 여러 용도를 나열하면 1개로 인식됩니다</li>
                    <li>일반적인 용도보다 창의적인 용도를 생각해보세요</li>
                    <li>최대한 많이, 다양하게 작성할수록 좋습니다</li>
                  </ol>
                </div>

                <div className="border-t border-border pt-3 mt-3">
                  <p className="font-semibold mb-2">
                    📝 작성 예시 (예시용 물건: 빈 병):
                  </p>
                  <div className="bg-background p-3 rounded font-mono text-sm">
                    화분으로 사용
                    <br />
                    촛대로 사용
                    <br />
                    저금통으로 사용
                    <br />
                    <span className="text-text-secondary">...</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 mt-3">
                  <p className="font-semibold mb-2">📌 주의사항:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>제한 시간 내에 최대한 많이 작성하세요</li>
                    <li>테스트 중에는 페이지를 벗어나지 마세요</li>
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
          <>
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-h2 mb-2">AUT 창의성 테스트</h1>
                <p className="text-text-secondary">
                  {point === "pre"
                    ? "사전 측정"
                    : point === "mid"
                    ? "중간 측정"
                    : "사후 측정"}{" "}
                  - Round {round}
                </p>
              </div>
              <div className={`text-3xl font-bold ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* 물건 표시 */}
            <div className="mb-6 p-6 bg-primary-light/10 rounded-lg text-center">
              <p className="text-lg mb-2 text-text-secondary">
                다음 물건의 다양한 용도를 생각해주세요:
              </p>
              <h2 className="text-4xl font-bold text-primary">{objectName}</h2>
            </div>

            {/* 안내문 */}
            <div className="mb-6 p-4 bg-surface rounded-lg">
              <h3 className="font-semibold mb-2">📝 작성 안내</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                <li>
                  제시된 물건의 독창적이고 다양한 용도를 최대한 많이 적어주세요
                </li>
                <li className="font-semibold text-primary">
                  ⚠️ 중요: 한 줄에 하나의 용도만 작성해주세요 (Enter로 줄바꿈)
                </li>
                <li>띄어쓰기로 여러 용도를 나열하면 1개로 인식됩니다</li>
                <li>일반적인 용도보다 창의적인 용도를 생각해보세요</li>
                <li>제한 시간: 2분</li>
              </ul>
            </div>

            {/* 입력 영역 */}
            <div className="mb-6">
              <textarea
                className="input-field min-h-[300px] font-mono"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="예시:&#10;망치로 사용&#10;책받침으로 사용&#10;문진으로 사용&#10;(한 줄에 하나씩 작성)"
                disabled={timeLeft === 0}
              />
              <p className="text-sm text-text-secondary mt-2">
                💡 작성한 용도 수:{" "}
                <span className="font-semibold text-primary">
                  {response.split("\n").filter((line) => line.trim()).length}개
                </span>
                <span className="text-xs ml-2">(줄바꿈으로 구분됩니다)</span>
              </p>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end">
              <button
                className="btn-primary"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || !response.trim()}
              >
                {isSubmitting ? "저장 중..." : "다음"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function AUTPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main min-h-screen py-8 flex items-center justify-center">
          <p>로딩 중...</p>
        </div>
      }
    >
      <AUTContent />
    </Suspense>
  );
}
