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
  metadataBase: new URL('https://andresburbanonutricionista.com'),
  title: {
    default: 'Andrés Burbano | Nutricionista Clínico en Pasto y Online',
    template: '%s | Andrés Burbano Nutricionista',
  },
  description: 'Consulta nutricional personalizada presencial en Pasto y asesoría online. Planes de alimentación para pérdida de grasa, composición corporal y nutrición clínica basada en evidencia.',
  keywords: [
    'Nutricionista en Pasto',
    'Nutricionista Pasto',
    'Nutricionista clínico Pasto',
    'Consulta nutricional online',
    'Planes de alimentación Pasto',
    'Andrés Burbano Nutricionista',
  ],
  authors: [{ name: "Andrés Burbano" }],
  creator: "Andrés Burbano",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Andrés Burbano | Nutricionista Clínico en Pasto y Online',
    description: 'Planes nutricionales personalizados y basados en evidencia. Atención presencial en Pasto y online.',
    url: 'https://andresburbanonutricionista.com',
    siteName: 'Andrés Burbano Nutricionista',
    locale: 'es_CO',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
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
