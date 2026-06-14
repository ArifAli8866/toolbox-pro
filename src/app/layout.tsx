import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToolBox Pro — Free Online File Converter, Compressor & Utilities",
  description: "Convert file formats, compress images & documents, download media, format JSON, generate passwords, and more. 15+ free tools running in your browser.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">{children}</body>
    </html>
  );
}
