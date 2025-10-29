import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "next-themes";
import { GlobalState } from "@/components/utility/global-state";
import { SearchProvider } from "@/components/search/search-provider";
import { PageTransition } from "@/components/ui/page-transition";

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
  title: "Wessley AI",
  description: "AI-assisted project-car companion",
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
        <link href="https://fonts.googleapis.com/css2?family=Keania+One&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${poppins.variable} ${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
