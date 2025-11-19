"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [participantId, setParticipantId] = useState("");
  const [measurementPoint, setMeasurementPoint] = useState<
    "pre" | "mid" | "post"
  >("pre");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 7점 척도 응답 (1~7)
  const [q1Response, setQ1Response] = useState<number | null>(null);
  const [q2Response, setQ2Response] = useState<number | null>(null);
  const [q3Response, setQ3Response] = useState<number | null>(null);
  const [q4Response, setQ4Response] = useState<number | null>(null);
  const [q5Response, setQ5Response] = useState<number | null>(null);

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
  }, [router, searchParams]);

  const handleSubmit = async () => {
    if (
      isSubmitting ||
      q1Response === null ||
      q2Response === null ||
      q3Response === null ||
      q4Response === null ||
      q5Response === null
    ) {
      alert("모든 질문에 답변해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch("/api/save-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          measurementPoint,
          q1_cognitive_effort: q1Response,
          q2_concentration: q2Response,
          q3_idea_fluency: q3Response,
          q4_idea_originality: q4Response,
          q5_satisfaction: q5Response,
          timestamp: new Date().toISOString(),
        }),
      });

      // 다음 단계로 이동: AUT로
      if (measurementPoint === "mid") {
        router.push("/measurements/aut?point=mid&round=1");
      } else {
        // post
        router.push("/measurements/aut?point=post&round=1");
      }
    } catch (error) {
      console.error("Error saving survey data:", error);
      setIsSubmitting(false);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  const isAllAnswered =
    q1Response !== null &&
    q2Response !== null &&
    q3Response !== null &&
    q4Response !== null &&
    q5Response !== null;

  return (
    <main className="container-main min-h-screen py-8">
      <div className="card max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-h2 mb-4">주관적 상태 설문조사</h1>
          <p className="text-text-secondary">
            {measurementPoint === "pre"
              ? "사전 측정"
              : measurementPoint === "mid"
              ? "중간 측정"
              : "사후 측정"}
          </p>
          <p className="text-sm text-text-secondary mt-2">
            현재 느끼는 상태를 솔직하게 평가해주세요. (7점 척도)
          </p>
        </div>

        <div className="space-y-8">
          {/* 질문 1: 인지적 노력 */}
          <div className="p-6 bg-surface rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-center">
              Q1. 방금 문제를 풀 때, 머리를 얼마나 많이 써야 했나요?
            </h3>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                거의 안 썼다
              </span>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    onClick={() => setQ1Response(value)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      q1Response === value
                        ? "bg-primary text-white border-primary scale-110"
                        : "bg-white border-border hover:border-primary"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                머리를 쥐어짜듯
                <br /> 많이 썼다
              </span>
            </div>
          </div>

          {/* 질문 2: 주관적 집중감 */}
          <div className="p-6 bg-surface rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-center">
              Q2. 과제를 수행하는 동안 딴생각 없이 얼마나 깊이 몰입했나요?
            </h3>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                전혀 집중하지 못했다
              </span>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    onClick={() => setQ2Response(value)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      q2Response === value
                        ? "bg-primary text-white border-primary scale-110"
                        : "bg-white border-border hover:border-primary"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                시간 가는 줄<br /> 모르고 몰입했다
              </span>
            </div>
          </div>

          {/* 질문 3: 아이디어 유창성 */}
          <div className="p-6 bg-surface rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-center">
              Q3. 문제를 해결하거나 글을 쓸 때, 아이디어나 문장이 막힘없이
              떠올랐나요?
            </h3>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                꽉 막힌 느낌이었다
              </span>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    onClick={() => setQ3Response(value)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      q3Response === value
                        ? "bg-primary text-white border-primary scale-110"
                        : "bg-white border-border hover:border-primary"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                술술 잘 풀렸다
              </span>
            </div>
          </div>

          {/* 질문 4: 아이디어 독창성 */}
          <div className="p-6 bg-surface rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-center">
              Q4. 나의 해결 방식이나 글의 내용이 남들과 다르게 참신하다고
              느끼나요?
            </h3>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                뻔하고 평범하다
              </span>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    onClick={() => setQ4Response(value)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      q4Response === value
                        ? "bg-primary text-white border-primary scale-110"
                        : "bg-white border-border hover:border-primary"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                독창적이고 참신하다
              </span>
            </div>
          </div>

          {/* 질문 5: 결과 만족도 */}
          <div className="p-6 bg-surface rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-center">
              Q5. 본인이 작성한 답안(또는 글)의 퀄리티에 대해 얼마나 만족하나요?
            </h3>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                전혀 만족하지 않는다
              </span>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    onClick={() => setQ5Response(value)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      q5Response === value
                        ? "bg-primary text-white border-primary scale-110"
                        : "bg-white border-border hover:border-primary"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-sm text-text-secondary min-w-[140px] text-center">
                매우 만족한다
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!isAllAnswered || isSubmitting}
            className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "저장 중..." : "다음"}
          </button>
        </div>

        {!isAllAnswered && (
          <p className="text-center text-sm text-text-secondary mt-4">
            모든 질문에 답변해주세요
          </p>
        )}
      </div>
    </main>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SurveyContent />
    </Suspense>
  );
}
