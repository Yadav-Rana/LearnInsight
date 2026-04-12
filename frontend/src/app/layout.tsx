import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/providers/LenisProvider";
import ReduxProvider from "@/providers/ReduxProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LearnInsight - AI Companion",
  description: "LearnInsight - AI-Powered Learning Progress & Insight Platform",
  icons: {
    icon: "/learnInsight.svg",
    shortcut: "/learnInsight.svg",
    apple: "/learnInsight.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <ReduxProvider>
          <LenisProvider>{children}</LenisProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
