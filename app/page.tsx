"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="container-main min-h-[calc(100vh-4rem)] flex items-center justify-center text-center">
      <div className="w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 mx-auto">
          <span className="h-2 w-2 rounded-full bg-primary" />
          IE416 Experiment Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-6">
          Draining Patience or Fueling Creativity?
          <br className="hidden sm:block" />
          <span className="text-3xl sm:text-4xl font-normal text-text-secondary">
            The LLM Effect on KAIST Students
          </span>
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-2xl mx-auto">
          LLM 사용 조건과 과제 유형을 자동으로 조합하여
          <span className="text-text-primary font-semibold"> 공정하고 반복 가능한 실험 경험</span>을 제공합니다.
          모든 응답은 실시간으로 저장됩니다.
        </p>
        <div className="flex justify-center">
          <button
            className="btn-primary text-lg px-8 py-4"
            onClick={() => router.push("/irb-consent")}
          >
            실험 시작하기
          </button>
        </div>
      </div>
    </main>
  );
}
