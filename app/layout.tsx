import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Flash Orbit — Run your store. Know your numbers.",
  description:
    "Commerce, inventory and financial management for ambitious businesses. Flash Orbit is being built Nigeria first, with Africa next.",
  openGraph: {
    title: "Flash Orbit — Run your store. Know your numbers.",
    description:
      "Commerce, inventory and financial management for ambitious businesses. Nigeria first, Africa next.",
    siteName: "Flash Orbit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flash Orbit — Run your store. Know your numbers.",
    description:
      "Commerce, inventory and financial management for ambitious businesses. Nigeria first, Africa next.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} ${geist.variable}`}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
