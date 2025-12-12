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
  metadataBase: new URL('https://numeros-magicos.vercel.app'),
  title: {
    default: "Números Mágicos 🔮 | Previsões EuroMilhões AI",
    template: "%s | Números Mágicos"
  },
  description: "Sistema avançado de previsão de lotaria (EuroMilhões) utilizando Inteligência Artificial, Redes Neuronais e Análise Estatística.",
  keywords: ["EuroMilhões", "Previsões", "AI", "Inteligência Artificial", "Lotaria", "Sorteio", "Números", "Estrelas", "Probabilidades"],
  authors: [{ name: "Paulo Batista" }],
  creator: "Paulo Batista",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://numeros-magicos.vercel.app",
    title: "Números Mágicos 🔮 | Previsões EuroMilhões AI",
    description: "Aumente as suas probabilidades com o nosso sistema de Inteligência Artificial.",
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
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔮</text></svg>"
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
