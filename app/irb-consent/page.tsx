"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IRBConsent() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [researcherName, setResearcherName] = useState("");

  const handleNext = () => {
    if (agreed && participantName.trim() && researcherName.trim()) {
      // 참가자 성명과 연구자 성명을 localStorage에 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("participantName", participantName);
        localStorage.setItem("researcherName", researcherName);
      }
      router.push("/participant-info");
    }
  };

  return (
    <main className="container-main min-h-screen">
      <div className="card max-w-3xl mx-auto bg-white/95 backdrop-blur">
        <h1 className="mb-6 text-center">연구 참여 동의서</h1>

        <div className="mb-8 p-6 bg-surface rounded-xl border border-gray-100 max-h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            실험 참가 동의서{" "}
            <span className="text-base">(Informed Consent Form)</span>
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed">
            <li>
              <b>연구 과제명:</b> AI 챗봇(LLM) 사용이 과제 수행 및 인지 기능에
              미치는 영향
            </li>
            <li>
              <b>연구 책임자:</b> 셔핑숑 교수님
              <br />
              <span className="ml-4">
                • 학생 연구원: 박서영, 유지은, 이건희
                <br />• 연락처: yje5234@kaist.ac.kr
              </span>
            </li>
            <li>
              <b>연구의 목적</b>
              <br />본 연구는 AI 챗봇(LLM)의 사용 여부가 참가자의 &apos;수학 및
              글쓰기&apos; 과제 수행 능력과 &apos;창의성&apos; 및 &apos;집중력&apos;과 같은 인지 기능에
              어떠한 영향을 미치는지 분석하는 것을 목적으로 합니다. 본 연구는
              KAIST 산업및시스템공학과 IE416 수업 프로젝트의 일환으로
              수행됩니다.
            </li>
            <li>
              <b>연구 절차</b>
              <br />
              귀하는 본 실험에 참여하는 동안 다음의 절차를 순서대로 수행하게
              됩니다.
              <ol className="list-decimal ml-6 mt-1 space-y-1">
                <li>사전 인지 테스트: 창의력 테스트 및 집중력 테스트</li>
                <li>
                  과제 세션 1: (LLM 사용 또는 미사용) 수학 및 글쓰기 과제 수행
                </li>
                <li>중간 인지 테스트: 창의력 테스트 및 집중력 테스트</li>
                <li>
                  과제 세션 2: (LLM 사용 또는 미사용) 수학 및 글쓰기 과제 수행
                </li>
                <li>최종 인지 테스트: 창의력 테스트 및 집중력 테스트</li>
              </ol>
            </li>
            <li>
              <b>예상 소요 시간</b>
              <br />본 실험에 참여하는 총 시간은 약 30분에서 40분 정도 소요될
              예정입니다.
            </li>
            <li>
              <b>위험 및 이익 (Risks & Benefits)</b>
              <br />
              <span className="ml-4">
                • 위험: 본 실험은 일상적인 수준의 인지 과제와 문제 풀이로
                구성되어 있으며, 참가자에게 일상생활에서 겪을 수 있는 수준
                이상의 신체적, 심리적 위험(Minimal Risk)을 포함하지 않습니다.
                <br />• 이익: 본 실험 참여에 대한 직접적인 이익은 없습니다.
                하지만 귀하의 참여로 수집된 데이터는 AI와 인간의 상호작용을
                이해하는 데 학술적으로 기여할 수 있습니다.
              </span>
            </li>
            <li>
              <b>참여 보상</b>
              <br />본 실험에 참여를 완료하신 분께는 감사의 의미로 커피
              기프티콘을 드립니다. (실험 종료 후 지급)
            </li>
            <li>
              <b>자발적 참여 및 중단 권리</b>
              <br />
              귀하의 실험 참여는 전적으로 자발적으로 이루어집니다. 귀하는 실험에
              참여하지 않을 권리가 있으며, 실험 도중 언제든지, 어떠한 불이익
              없이 참여를 중단할 수 있습니다. 중단하시더라도 수집된 데이터는
              즉시 파기됩니다.
            </li>
            <li>
              <b>개인정보 수집 및 비밀 보장</b>
              <br />
              <span className="ml-4">
                • 개인정보 수집 동의: 본 연구팀은 보상 지급 및 참가자 식별, 중복
                참여 방지를 위해 귀하의 개인정보(이름, 학번, 연락처)를
                수집합니다.
                <br />
                • 파기 시점: 수집된 개인정보는 프로젝트 종료 후(또는 보상 지급
                완료 후) 즉시 파기될 예정입니다.
                <br />• 비밀 보장: 실험을 통해 수집된 모든 응답(과제 결과,
                테스트 점수)은 철저히 익명으로 처리됩니다. 데이터 분석 시 개인을
                식별할 수 있는 정보는 사용되지 않으며, 연구 결과는 수업 최종
                보고서 및 발표 목적으로만 사용됩니다.
              </span>
            </li>
            <li>
              <b>연구 문의</b>
              <br />본 연구에 대해 질문이 있으시면 언제든 위 연락처(학생 연구원
              유지은)로 문의해 주시기 바랍니다.
            </li>
          </ol>
          <div className="mt-6 border-t pt-4 text-sm">
            <b>참가자 확인 및 서명</b>
            <br />
            본인은 위 내용을 모두 읽었으며, 연구자가 설명하는 내용(목적, 절차,
            위험, 보상, 비밀 보장, 중단 권리)을 충분히 이해하였습니다. 이에
            본인은 자발적인 의사로 본 연구에 참여하는 것과 개인정보 수집에
            동의합니다.
            <br />
            <br />
            {(() => {
              const now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth() + 1;
              const day = now.getDate();
              return `${year}년 ${month}월 ${day}일`;
            })()}
            <br />
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 items-center justify-center">
            <label className="flex items-center space-x-2">
              <span className="w-24 text-right">참가자 성명</span>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="input input-bordered input-sm w-48 bg-white border-2 border-gray-700 shadow-md focus:border-primary focus:ring-2 focus:ring-primary/40 placeholder-gray-400"
                placeholder="이름 입력"
              />
            </label>
            <label className="flex items-center space-x-2">
              <span className="w-24 text-right">연구자 성명</span>
              <input
                type="text"
                value={researcherName}
                onChange={(e) => setResearcherName(e.target.value)}
                className="input input-bordered input-sm w-48 bg-white border-2 border-gray-700 shadow-md focus:border-primary focus:ring-2 focus:ring-primary/40 placeholder-gray-400"
                placeholder="이름 입력"
              />
            </label>
          </div>
          <label className="flex items-center justify-center space-x-3 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary rounded"
            />
            <span className="text-lg">
              본인은 위 내용을 충분히 이해하였으며, 자발적으로 연구에 참여하는
              것에 동의합니다.
            </span>
          </label>
        </div>

        <div className="flex justify-center space-x-4">
          <button className="btn-secondary" onClick={() => router.push("/")}>
            취소
          </button>
          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={
              !(agreed && participantName.trim() && researcherName.trim())
            }
          >
            다음
          </button>
        </div>
      </div>
    </main>
  );
}
