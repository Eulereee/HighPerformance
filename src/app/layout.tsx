import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HPL Pure Mathematics",
  description: "Cambridge A Level Pure Mathematics, taught the HPL way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
