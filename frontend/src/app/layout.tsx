import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/providers/LenisProvider";
import ReduxProvider from "@/providers/ReduxProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      <body className={`${poppins.variable} antialiased`}>
        <ReduxProvider>
          <LenisProvider>{children}</LenisProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
