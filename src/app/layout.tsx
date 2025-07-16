import './globals.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SupportOnlyProvider } from "@/context/SupportOnlyContext";
import { CityProvider } from '@/context/CityContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ростелеком - Подключение интернета в России",
  description: "Подключите интернет Ростелеком в России. Выгодные тарифы, быстрая установка, надежное соединение.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <CityProvider>
          <SupportOnlyProvider>
            {children}
          </SupportOnlyProvider>
        </CityProvider>
      </body>
    </html>
  );
}