import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import LenisProvider from "@/providers/LenisProvider";
import ReduxProvider from "@/providers/ReduxProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const hkGrotesk = localFont({
  src: [
    {
      path: "./fonts/HKGrotesk-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/HKGrotesk-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/HKGrotesk-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/HKGrotesk-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/HKGrotesk-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/HKGrotesk-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/HKGrotesk-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-hk-grotesk",
  display: "swap",
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
      <body className={`${poppins.variable} ${hkGrotesk.variable} antialiased`}>
        <ReduxProvider>
          <LenisProvider>{children}</LenisProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
