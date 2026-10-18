import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import HistoryBackHandler from "../components/HistoryBackHandler";
import CookieBanner from "../components/CookieBanner";
import Analytics from "../components/Analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Andrés Burbano | Nutricionista Deportivo y Clínico en Quito",
  description: "Planes de nutrición deportiva basados en evidencia científica, antropometría ISAK 2 y acompañamiento integral en Quito y virtual.",
  keywords: ["nutricionista deportivo", "nutrición quito", "andres burbano nutricionista", "antropometria isak 2", "planes nutricionales ecuador"],
  authors: [{ name: "Andrés Burbano" }],
  creator: "Andrés Burbano",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col bg-brand-light text-brand-navy selection:bg-brand-electric/20 selection:text-brand-electric">
        <HistoryBackHandler />
        <Navbar />
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
