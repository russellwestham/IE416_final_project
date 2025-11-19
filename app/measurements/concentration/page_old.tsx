"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConcentrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [participantId, setParticipantId] = useState("");

  const point = searchParams.get("point") || "pre"; // pre, mid, post

  useEffect(() => {
    const id = localStorage.getItem("participantId");
    if (!id) {
      router.push("/");
      return;
    }
    setParticipantId(id);
  }, [router]);

  const handleNext = async () => {
    try {
      // 더미 데이터 저장
      await fetch("/api/save-measurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          measurementType: "concentration",
          point,
          questionNumber: 1,
          response: "0", // 더미 데이터
          responseTime: 0,
          timestamp: new Date().toISOString(),
        }),
      });

      // 다음 단계로 이동
      if (point === "pre") {
        router.push("/task/intro?task=1");
      } else if (point === "mid") {
        router.push("/task/intro?task=2");
      } else if (point === "post") {
        router.push("/completion");
      }
    } catch (error) {
      console.error("Error saving measurement data:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  return (
    <main className="container-main min-h-screen py-8">
      <div className="card max-w-3xl mx-auto">
        <h1 className="mb-6 text-center">참을성/집중력 측정</h1>

        <div className="mb-6 p-4 bg-warning/10 rounded-lg text-center">
          <p className="text-lg font-semibold text-warning">
            ⚠️ 이 측정은 현재 준비 중입니다
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-center text-text-secondary">
            {point === "pre"
              ? "사전 측정"
              : point === "mid"
              ? "중간 측정"
              : "사후 측정"}
          </p>
          <p className="text-center">
            참을성 및 집중력 측정 문항이 여기에 표시됩니다.
          </p>
          <p className="text-center text-sm text-text-secondary">
            (현재는 스켈레톤 버전으로, 더미 데이터만 저장됩니다)
          </p>
        </div>

        <div className="flex justify-center">
          <button className="btn-primary" onClick={handleNext}>
            다음
          </button>
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
