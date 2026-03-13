import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://omniclip.app"),
  title: { default: "OmniClip — Universal Clipboard Sync", template: "%s | OmniClip" },
  description: "Seamlessly sync your clipboard across all your devices. Copy on Mac, paste on Windows. OmniClip keeps you in flow.",
  keywords: ["clipboard sync", "universal clipboard", "cross-platform clipboard", "copy paste sync", "OmniClip"],
  authors: [{ name: "OmniClip" }],
  creator: "OmniClip",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://omniclip.app",
    siteName: "OmniClip",
    title: "OmniClip — Universal Clipboard Sync",
    description: "Seamlessly sync your clipboard across all your devices. Copy on Mac, paste on Windows.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OmniClip — Universal Clipboard Sync" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniClip — Universal Clipboard Sync",
    description: "Seamlessly sync your clipboard across all your devices.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
