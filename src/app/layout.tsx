import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Syne } from "next/font/google";
import "./globals.css";
import MainNavigation from "@/components/MainNavigation";
import LegalFooter from "@/components/LegalFooter";
import EntryGuard from "@/components/EntryGuard";
import MobileBottomNav from "@/components/MobileBottomNav";
import { auth } from "@/auth";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import AdLayoutWrapper from "@/components/ads/AdLayoutWrapper";
import Script from "next/script";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://numerosmagicos.com'),
  title: {
    default: "Números Mágicos | Estatísticas, Previsões e Desdobramentos (Euromilhões, Totoloto, Lotofácil e Mega-Sena)",
    template: "%s | Números Mágicos"
  },
  description: "Portal 100% gratuito de análise estatística, previsões matemáticas e desdobramentos para Euromilhões, Totoloto, EuroDreams, Mega-Sena e Lotofácil. 20 sistemas testados contra 20 anos de histórico real.",
  keywords: [
    "Euromilhões", "Totoloto", "EuroDreams", "Mega-Sena", "Lotofácil",
    "estatísticas euromilhões", "previsões euromilhões", "números quentes totoloto",
    "palpites lotofácil grátis", "estatísticas lotofácil", "fechamento lotofácil grátis",
    "desdobramento mega-sena", "números mais sorteados mega-sena",
    "sistemas matemáticos lotaria", "desdobramentos euromilhões grátis"
  ],
  authors: [{ name: "Paulo Batista" }],
  creator: "Paulo Batista",
  alternates: {
    canonical: "https://numerosmagicos.com",
  },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    alternateLocale: ["pt_BR"],
    url: "https://numerosmagicos.com",
    title: "Números Mágicos | Estatísticas e Previsões (Euromilhões, Lotofácil, Mega-Sena, Totoloto)",
    description: "Análise estatística 100% gratuita, ranking de sistemas e desdobramentos para Euromilhões, Totoloto, EuroDreams, Mega-Sena e Lotofácil.",
    siteName: "Números Mágicos",
    images: [{ url: "/crystal-ball.png", width: 800, height: 600, alt: "Números Mágicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Números Mágicos | Estatísticas e Previsões de Lotarias",
    description: "Análise estatística 100% gratuita para Euromilhões, Totoloto, EuroDreams, Mega-Sena e Lotofácil.",
    images: ["/crystal-ball.png"],
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/crystal-ball.png', type: 'image/png' }],
    shortcut: '/crystal-ball.png',
    apple: '/crystal-ball.png',
  }
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const locale = await getLocale();
  const messages = await getMessages();
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${dmSans.variable} ${dmMono.variable} ${syne.variable} antialiased relative flex flex-col min-h-screen`}
        style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WY6JFPZ40C"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-WY6JFPZ40C');
          `}
        </Script>
        {adsenseClientId && (
          <Script
            id="google-adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <NextIntlClientProvider messages={messages}>
          <MainNavigation session={session} />
          <AdLayoutWrapper>
            {children}
          </AdLayoutWrapper>
          <LegalFooter />
          <EntryGuard />
          <MobileBottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
