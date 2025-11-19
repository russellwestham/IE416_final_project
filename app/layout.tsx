import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IE416 실험 플랫폼",
  description: "LLM의 창의적 과제 수행 능력에 대한 사용자 인식 연구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="min-h-screen bg-background relative">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,_rgba(15,23,42,0.03)_0%,_rgba(15,23,42,0)_60%)]" />
          <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
