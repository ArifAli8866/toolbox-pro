import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "ToolBox Pro — High-Performance In-Browser Developer & File Utilities",
  description:
    "Convert file formats, compress images & PDFs, format JSON, generate secure credentials, test regex, inspect JWTs, and more. 100% private in-browser utility suite.",
  keywords: [
    "developer tools",
    "file converter",
    "image compressor",
    "pdf tools",
    "json formatter",
    "password generator",
    "browser utilities",
    "privacy tools",
  ],
  authors: [{ name: "Arif Ali" }],
  creator: "Arif Ali",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 antialiased min-h-screen transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
