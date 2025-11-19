"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExperimentIntro() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("participantId");
    if (!id) {
      router.push("/");
    } else {
      setParticipantId(id);
    }
  }, [router]);

  return (
    <main className="container-main min-h-screen">
      <div className="card max-w-3xl mx-auto bg-white/95 backdrop-blur">
        <h1 className="mb-6 text-center">실험 안내</h1>

        {participantId && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-lg font-semibold text-primary">
              참가자 번호: {participantId}
            </p>
          </div>
        )}

        <div className="space-y-6 mb-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">실험 흐름</h2>
            <p className="mb-4">
              본 실험은 다음과 같은 순서로 진행됩니다 (총 약 30분):
            </p>
            <ol className="list-decimal list-inside space-y-2 text-text-secondary">
              <li>
                <strong>사전 측정 (Pre-Measurement)</strong>
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>창의력 테스트 (AUT): 2분</li>
                  <li>집중력 테스트 (CPT): 1분</li>
                </ul>
              </li>
              <li>
                <strong>첫 번째 과제 (Task 1)</strong> - 수학 또는 글쓰기 과제
                수행, 제한 시간 5분
              </li>
              <li>
                <strong>중간 측정 (Mid-Measurement)</strong>
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>창의력 테스트 (AUT): 2분</li>
                  <li>집중력 테스트 (CPT): 1분</li>
                  <li>주관적 상태 설문조사 (5개 질문): 1분</li>
                </ul>
              </li>
              <li>
                <strong>두 번째 과제 (Task 2)</strong> - 수학 또는 글쓰기 과제
                수행, 제한 시간 5분
              </li>
              <li>
                <strong>사후 측정 (Post-Measurement)</strong>
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>창의력 테스트 (AUT): 2분</li>
                  <li>집중력 테스트 (CPT): 1분</li>
                  <li>주관적 상태 설문조사 (5개 질문): 1분</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">주의사항</h2>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li>총 소요 시간: 약 30분</li>
              <li>
                각 단계는 순서대로 진행되며, 이전 단계로 돌아갈 수 없습니다
              </li>
              <li>
                창의력 테스트(AUT)는 각 2분, 집중력 테스트(CPT)는 각 1분, 과제는
                각 5분 제한이 있습니다
              </li>
              <li>
                집중력 테스트(CPT)는 빠르게 나타나는 자극에 반응하는
                테스트입니다
              </li>
              <li>일부 과제에서는 LLM(AI) 사용 가능/금지 조건이 주어집니다</li>
              <li>화면 상단의 조건 배너를 잘 확인해주세요</li>
              <li>모든 응답은 자동으로 저장되니 안심하고 진행해주세요</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">데이터 보호</h2>
            <p className="text-text-secondary">
              실험 중 수집된 모든 데이터는 연구 목적으로만 사용되며, 개인 식별
              정보는 철저히 보호됩니다.
            </p>
          </section>
        </div>

        <div className="flex justify-center">
          <button
            className="btn-primary text-lg px-8 py-4"
            onClick={() => router.push("/measurements/aut?round=1&object=1")}
          >
            실험 시작
          </button>
        </div>
      </div>
    </main>
  );
}
