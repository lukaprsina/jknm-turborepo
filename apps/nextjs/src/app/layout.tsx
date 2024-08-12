import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toaster";
import { TooltipProvider } from "@acme/ui/tooltip";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://jknm.si"
      : "http://localhost:3000",
  ),
  title: "Jamarski klub Novo mesto",
  description:
    "Smo specialisti za dokumentirano raziskovanje in ohranjanje čistega ter zdravega podzemskega sveta.",
  openGraph: {
    title: "Jamarski klub Novo mesto",
    description:
      "Smo specialisti za dokumentirano raziskovanje in ohranjanje čistega ter zdravega podzemskega sveta.",
    url: "https://jknm.si",
    siteName: "Jamarski klub Novo mesto",
  },
  twitter: {
    card: "summary_large_image",
    site: "@lukaprsina",
    creator: "@lukaprsina",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const open_sans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-opensans",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="sl" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          open_sans.variable,
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <TooltipProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TRPCReactProvider>{props.children}</TRPCReactProvider>
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
