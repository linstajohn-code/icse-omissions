import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { FilmGrain } from "@/components/film-grain";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://icse-syllabus.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(40, 15%, 97%)" },
    { media: "(prefers-color-scheme: dark)",  color: "hsl(0, 0%, 5%)" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "ICSE Syllabus 2027-28",
    template: "%s | ICSE Syllabus",
  },
  description:
    "Official CISCE omissions for ICSE Class 9 & 10, session 2027-28. Every topic is cited to the source PDF — page number and verbatim excerpt.",
  keywords: ["ICSE", "CISCE", "Class 9", "Class 10", "syllabus", "2027-28", "omissions", "board exam"],
  metadataBase: new URL(BASE),
  openGraph: {
    type: "website",
    siteName: "ICSE Syllabus 2027-28",
    title: "ICSE Syllabus 2027-28",
    description:
      "Official CISCE omissions for Class 9 & 10 — every topic cited to the source PDF.",
    url: BASE,
  },
  twitter: {
    card: "summary_large_image",
    title: "ICSE Syllabus 2027-28",
    description:
      "Official CISCE omissions for Class 9 & 10 — every topic cited to the source PDF.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FilmGrain />
          <SiteHeader />
          <main className="container mx-auto px-4 pt-6 pb-16 max-w-5xl">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
