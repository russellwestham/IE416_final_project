"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompletionPage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantInfo, setParticipantInfo] = useState<any>(null);

  useEffect(() => {
    const id = localStorage.getItem("participantId");
    const name = localStorage.getItem("participantName");
    const info = localStorage.getItem("participantInfo");

    if (!id) {
      router.push("/");
      return;
    }

    setParticipantId(id);
    setParticipantName(name || "");
    if (info) {
      setParticipantInfo(JSON.parse(info));
    }

    // 실험 완료 상태 업데이트
    updateCompletionStatus(id);
  }, [router]);

  const updateCompletionStatus = async (id: string) => {
    try {
      await fetch("/api/update-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: id,
          status: "completed",
          endTime: new Date().toISOString(),
          completionRate: "100",
        }),
      });
    } catch (error) {
      console.error("Error updating completion status:", error);
    }
  };

  return (
    <main className="container-main min-h-screen py-8 flex items-center justify-center">
      <div className="card max-w-2xl text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="mb-4">실험이 완료되었습니다!</h1>
          <p className="text-lg text-text-secondary">
            실험에 참여해주셔서 진심으로 감사드립니다.
          </p>
        </div>

        {participantId && (
          <div className="mb-8 p-6 bg-surface rounded-lg">
            <h2 className="text-xl font-semibold mb-4">참가자 정보</h2>
            <div className="space-y-2 text-left">
              <p>
                <strong>참가자 번호:</strong> {participantId}
              </p>
              {participantName && (
                <p>
                  <strong>이름:</strong> {participantName}
                </p>
              )}
              <p>
                <strong>완료 시간:</strong> {new Date().toLocaleString("ko-KR")}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <p className="text-text-secondary">
            모든 응답이 안전하게 저장되었습니다.
          </p>
          <p className="text-text-secondary">
            연구 결과에 대한 문의사항이 있으시면
            <br />
            연구팀에 연락해주시기 바랍니다.
          </p>
        </div>

        <button
          className="btn-primary text-lg px-8 py-4"
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
        >
          처음으로 돌아가기
        </button>
      </div>
    </main>
  );
}
