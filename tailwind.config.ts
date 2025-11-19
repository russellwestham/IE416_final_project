import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System 컬러 팔레트
        primary: {
          DEFAULT: "#2563eb", // blue-600
          light: "#3b82f6", // blue-500
          dark: "#1e40af", // blue-700
        },
        secondary: {
          DEFAULT: "#64748b", // slate-500
          light: "#94a3b8", // slate-400
          dark: "#475569", // slate-600
        },
        success: "#22c55e", // green-500
        warning: "#f59e0b", // amber-500
        danger: "#ef4444", // red-500
        background: "#f8fafc", // slate-50 (전체 배경을 연한 회색으로)
        surface: "#ffffff", // white (카드를 흰색으로)
        text: {
          primary: "#0f172a", // slate-900 (더 진한 텍스트)
          secondary: "#64748b", // slate-500
        },
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          '"Pretendard"',
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          "sans-serif",
        ],
      },
      fontSize: {
        h1: ["2.5rem", { lineHeight: "3rem", fontWeight: "700" }],
        h2: ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        small: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
      },
      spacing: {
        section: "3rem",
        card: "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
