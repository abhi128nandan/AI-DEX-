import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: {
    default: "AIDex — Discover the Best AI Tools",
    template: "%s | AIDex",
  },
  description: "Discover and vote on the best AI tools. Curated directory of AI tools sorted by community votes, views, and categories.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aidex.app'),
  openGraph: {
    type: 'website',
    siteName: 'AIDex',
    title: 'AIDex — Discover the Best AI Tools',
    description: 'Discover and vote on the best AI tools. Community-curated directory.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIDex — Discover the Best AI Tools',
    description: 'Discover and vote on the best AI tools. Community-curated directory.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans min-h-screen bg-[var(--surface-base)] text-slate-100 flex flex-col antialiased selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden`}>
        <ErrorBoundary>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

