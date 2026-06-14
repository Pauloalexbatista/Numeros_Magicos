import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Syne } from "next/font/google";
import "./globals.css";
import MainNavigation from "@/components/MainNavigation";
import LegalFooter from "@/components/LegalFooter";
import { auth } from "@/auth";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import AdLayoutWrapper from "@/components/ads/AdLayoutWrapper";

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
    default: "Números Mágicos | Análise Estatística de Lotarias",
    template: "%s | Números Mágicos"
  },
  description: "Análise estatística gratuita do Euromilhões, Totoloto e EuroDreams. Testámos todos os sistemas matemáticos contra 20 anos de histórico real.",
  keywords: [
    "EuroMilhões", "Totoloto", "EuroDreams", "Mega-Sena",
    "análise estatística lotaria", "sistemas lotaria",
    "previsão euromilhões", "estatísticas euromilhões",
    "números quentes euromilhões", "padrões lotaria Portugal",
    "jackpot euromilhões", "sorteio portugal"
  ],
  authors: [{ name: "Paulo Batista" }],
  creator: "Paulo Batista",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://numerosmagicos.com",
    title: "Números Mágicos | Análise Estatística de Lotarias",
    description: "Análise estatística gratuita. Testámos todos os sistemas matemáticos contra 20 anos de histórico real.",
    siteName: "Números Mágicos",
    images: [{ url: "/crystal-ball.png", width: 800, height: 600, alt: "Números Mágicos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Números Mágicos | Análise Estatística de Lotarias",
    description: "Análise estatística gratuita de lotarias.",
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

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${dmSans.variable} ${dmMono.variable} ${syne.variable} antialiased relative flex flex-col min-h-screen`}
        style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}
      >
        <NextIntlClientProvider messages={messages}>
          <MainNavigation session={session} />
        <AdLayoutWrapper>
          {children}
        </AdLayoutWrapper>
        <LegalFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
