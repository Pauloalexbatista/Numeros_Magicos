import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://numerosmagicos.com'),
  title: {
    default: "Números Mágicos 🔮 | Previsões EuroMilhões AI",
    template: "%s | Números Mágicos"
  },
  description: "Aumente as suas probabilidades no EuroMilhões com Inteligência Artificial. Previsões diárias, estatísticas avançadas e análise de padrões.",
  keywords: ["EuroMilhões", "Previsões", "AI", "Inteligência Artificial", "Lotaria", "Sorteio", "Números", "Estrelas", "Probabilidades"],
  authors: [{ name: "Paulo Batista" }],
  creator: "Paulo Batista",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://numerosmagicos.com",
    title: "Números Mágicos 🔮 | Previsões EuroMilhões AI",
    description: "Jogue com inteligência. Use a nossa IA para gerar as suas chaves do EuroMilhões.",
    siteName: "Números Mágicos",
    images: [
      {
        url: "/crystal-ball.png",
        width: 800,
        height: 600,
        alt: "Números Mágicos AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Números Mágicos 🔮 | Previsões AI",
    description: "Sistema avançado de previsão de lotaria com IA.",
    images: ["/crystal-ball.png"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/crystal-ball.png', type: 'image/png' },
    ],
    shortcut: '/crystal-ball.png',
    apple: '/crystal-ball.png',
  }
};

import MainNavigation from "@/components/MainNavigation";
import LegalFooter from "@/components/LegalFooter";

import { auth } from "@/auth";

import AdLayoutWrapper from "@/components/ads/AdLayoutWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative flex flex-col min-h-screen`}
      >
        <MainNavigation session={session} />
        <AdLayoutWrapper>
          {children}
        </AdLayoutWrapper>
        <LegalFooter />
      </body>
    </html>
  );
}
