/**
 * @file app/layout.tsx
 * @description 루트 레이아웃 — Geist 폰트, KaTeX CSS, RoleProvider, Header
 * @domain shared
 * @access shared
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { RoleProvider } from "@/components/layout/RoleProvider";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "풀다 AI — 수업 후 보충 AI 코치",
  description:
    "교사의 수업자료에 근거해 학생의 막힘 지점을 Grill-Me 질문법으로 해결하고, 교사에게는 오개념 대시보드를 제공합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <RoleProvider>
          <Header />
          {children}
          <Toaster />
        </RoleProvider>
      </body>
    </html>
  );
}
