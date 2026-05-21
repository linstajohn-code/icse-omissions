import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ICSE Syllabus 2027-28",
    template: "%s | ICSE Syllabus",
  },
  description:
    "Browse the complete ICSE Class 9 & 10 syllabus for the 2027-28 session. Every topic is cited to the official CISCE PDF.",
  keywords: ["ICSE", "CISCE", "Class 9", "Class 10", "syllabus", "2027-28"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          <main className="container mx-auto px-4 py-8 max-w-5xl">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
