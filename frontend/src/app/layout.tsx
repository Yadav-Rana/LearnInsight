import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/providers/LenisProvider";
import ReduxProvider from "@/providers/ReduxProvider";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "LearnInsight",
  description: "LearnInsight - AI-Powered Learning Progress & Insight Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik+Burned&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${spaceMono.variable} antialiased`}>
        <ReduxProvider>
          <LenisProvider>{children}</LenisProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
