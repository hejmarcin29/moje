// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Prime Panel",
    template: "%s — Prime Panel",
  },
  description: "Panel firmowy Prime Podłoga — logowanie i strefa pracy.",
  applicationName: "Prime Panel",
  keywords: ["panel", "prime podłoga", "egibi", "montażyści", "zlecenia"],
  authors: [{ name: "Prime Podłoga" }],
  creator: "Prime Podłoga",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Prime Panel",
    description: "Panel firmowy Prime Podłoga — logowanie i strefa pracy.",
    url: "/",
    siteName: "Prime Panel",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh`}>
        {children}
      </body>
    </html>
  );
}
// app/layout.tsx
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = { title: "App" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
