"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// AUT Type에 따른 물건 매핑
const AUT_OBJECTS: {
  [key: number]: { pre: string; mid: string; post: string };
} = {
  1: { pre: "벽돌", mid: "클립", post: "종이컵" },
  2: { pre: "벽돌", mid: "종이컵", post: "클립" },
  3: { pre: "클립", mid: "벽돌", post: "종이컵" },
  4: { pre: "클립", mid: "종이컵", post: "벽돌" },
  5: { pre: "종이컵", mid: "벽돌", post: "클립" },
  6: { pre: "종이컵", mid: "클립", post: "벽돌" },
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

  // URL 파라미터 읽기
  const point = searchParams.get("point") || "pre"; // pre, mid, post
  const round = searchParams.get("round") || "1"; // 1, 2, 3

  const handleSubmit = useCallback(async (autoSubmit = false) => {
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
  }, [isSubmitting, startTime, participantId, objectName, response, round, point, router]);

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

    // 타이머 시작
    setStartTime(Date.now());
  }, [router, point, searchParams]);

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

  return (
    <main className="container-main min-h-screen py-8">
      <div className="card max-w-3xl mx-auto">
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
            <li>한 줄에 하나씩, 간단명료하게 작성해주세요</li>
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
            disabled={timeLeft === 0}
          />
          <p className="text-sm text-text-secondary mt-2">
            작성한 용도 수:{" "}
            {response.split("\n").filter((line) => line.trim()).length}개
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
