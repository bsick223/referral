import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReferralTracker - Organize Your Job Search Referrals",
  description: "Track and manage your job application referrals in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#090d1b]`}
      >
        <Analytics />
        <SpeedInsights />
        <ClientWrapper>
          <ScrollToTop />
          <Header />
          <main>{children}</main>
          <Toaster position="bottom-center" />
        </ClientWrapper>
      </body>
    </html>
  );
}
