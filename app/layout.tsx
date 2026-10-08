import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gavel House — Curated Objects at Auction",
  description: "Bid on exceptional design, art, timepieces, and rare objects.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
