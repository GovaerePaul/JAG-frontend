import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ClientAppWrapper from '../components/ClientAppWrapper';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "JustGift - Organisez vos cadeaux",
  description: "Plateforme pour organiser et planifier vos cadeaux",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body className={roboto.className} suppressHydrationWarning>
        <ClientAppWrapper>
          {children}
        </ClientAppWrapper>
      </body>
    </html>
  );
}
