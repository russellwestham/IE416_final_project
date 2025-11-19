"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ParticipantInfo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    phoneNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Participant ID 할당 받기
      const response = await fetch("/api/assign-participant-id", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        // Participant ID를 localStorage에 저장
        localStorage.setItem("participantId", data.participantId);
        localStorage.setItem("participantInfo", JSON.stringify(formData));

        // 동의서에서 받은 참가자 성명과 연구자 성명 불러오기
        let participantName = "";
        let researcherName = "";
        if (typeof window !== "undefined") {
          participantName = localStorage.getItem("participantName") || "";
          researcherName = localStorage.getItem("researcherName") || "";
        }

        // 참가자 정보 + 연구자명 업데이트
        await fetch("/api/update-participant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId: data.participantId,
            name: participantName,
            ...formData,
            researcherName,
          }),
        });

        // 다음 페이지로 이동
        router.push("/experiment-intro");
      } else {
        alert("참가자 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-main min-h-screen">
      <div className="card max-w-2xl mx-auto bg-white/95 backdrop-blur">
        <h1 className="mb-6 text-center">참가자 정보 입력</h1>

        <p className="text-center text-text-secondary mb-8">
          입력하신 정보는 실험 배정 및 사후 연락 용도로만 사용되며, 모든
          데이터는 암호화된 채널을 통해 전송됩니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold">학번 *</label>
            <input
              type="text"
              className="input-field"
              value={formData.studentId}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
              required
              placeholder="20240001"
              pattern="[0-9]{8}"
              title="8자리 숫자를 입력하세요"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              연락처 (전화번호) *
            </label>
            <input
              type="tel"
              className="input-field"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              required
              placeholder="010-1234-5678"
              pattern="[0-9]{3}-[0-9]{3,4}-[0-9]{4}"
              title="010-1234-5678 형식으로 입력하세요"
            />
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/irb-consent")}
              disabled={loading}
            >
              이전
            </button>
            <button
              type="submit"
              className="btn-primary px-10"
              disabled={loading}
            >
              {loading ? "등록 중..." : "다음"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
