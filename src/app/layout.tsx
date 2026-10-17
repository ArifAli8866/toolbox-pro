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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('toolbox-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme='light';}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-white text-[#0f172a] dark:bg-[#0e0e10] dark:text-[#f1f1f4] antialiased min-h-screen selection:bg-[#2563eb]/20 selection:text-[#2563eb] transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
