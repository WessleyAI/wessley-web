import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import "@/styles/design-system.css";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "next-themes";
import { GlobalState } from "@/components/utility/global-state";
import { SearchProvider } from "@/components/search/search-provider";
import { PageTransition } from "@/components/ui/page-transition";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from '@next/third-parties/google';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://wessley.ai'),
  title: {
    default: "Wessley | Automotive Intelligence",
    template: "%s | Wessley"
  },
  description: "The world's first AI-powered automotive platform. Wessley understands every circuit, system, and connection in your car — helping you diagnose faults, plan repairs, and discover exactly what parts you need instantly.",
  keywords: [
    "automotive AI",
    "car repair",
    "vehicle diagnostics",
    "auto parts marketplace",
    "car restoration",
    "automotive intelligence",
    "3D electrical system",
    "3D visualization",
    "3D car diagnostics",
    "automotive wiring diagram",
    "AI vehicle assistant",
    "electric vehicle diagnostics",
    "interactive car diagrams",
    "automotive virtual garage",
    "car parts finder",
    "AI-powered repair guidance"
  ],
  authors: [{ name: "Wessley AI" }],
  creator: "Wessley AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wessley.ai",
    siteName: "Wessley",
    title: "Wessley | Automotive Intelligence",
    description: "The world's first AI-powered automotive platform. Diagnose, repair, and restore with precision.",
    images: [
      {
        url: "/header/logo.svg",
        width: 1200,
        height: 630,
        alt: "Wessley - Automotive Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wessley | Automotive Intelligence",
    description: "The world's first AI-powered automotive platform. Diagnose, repair, and restore with precision.",
    images: ["/header/logo.svg"],
    creator: "@wessley_ai",
  },
  icons: {
    icon: "/header/logo.svg",
    shortcut: "/header/logo.svg",
    apple: "/header/logo.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${poppins.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
          <SearchProvider>
            <GlobalState>
              {/* Full screen SVG grid background */}
              <div 
                className="fixed inset-0 z-0"
                style={{
                  backgroundColor: '#f8f9fa', // Light gray for light mode
                  backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid-light' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23cccccc' stroke-width='1' stroke-opacity='0.2'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid-light)' /%3e%3c/svg%3e")`,
                }}
              />
              <div 
                className="fixed inset-0 opacity-0 dark:opacity-100 transition-opacity duration-300 z-0"
                style={{
                  backgroundColor: '#161616', // Very dark gray for dark mode
                  backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid-dark' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23444444' stroke-width='1' stroke-opacity='0.2'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid-dark)' /%3e%3c/svg%3e")`,
                }}
              />
              
              {/* All content above backgrounds */}
              <div className="relative z-10">
                <AppShell>
                  <PageTransition>
                    {children}
                  </PageTransition>
                </AppShell>
              </div>
            </GlobalState>
          </SearchProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
        <GoogleAnalytics gaId="G-95HGMDBT28" />
      </body>
    </html>
  );
}
