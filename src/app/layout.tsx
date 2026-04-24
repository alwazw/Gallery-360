import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Memorial 3D Wall | Digital Life Closeout",
  description: "An immersive multimedia gallery celebrating the life and memories of your loved ones. Share, explore, and preserve precious moments in a beautiful 3D experience.",
  keywords: ["memorial", "gallery", "tribute", "memories", "celebration of life"],
  openGraph: {
    title: "Memorial 3D Wall",
    description: "Celebrate life through shared memories",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#0a0a1a]">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
