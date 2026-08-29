import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import { SplashScreen } from "@/components/splash-screen";
import { UpdateScreen } from "@/components/update-screen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Club",
  description: "Weekly movie club: picks, spin the wheel, ratings.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Movie Club",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-neutral-100">
        <SplashScreen />
        <UpdateScreen />
        {children}
      </body>
    </html>
  );
}
