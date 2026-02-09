import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import { PropsWithChildren } from "react";
import { Providers } from "~/components/providers";
import { cn } from "~/lib/utils";
import "./globals.css";

const nunitoSans = Nunito_Sans({ variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WeWitnessed - Capture Wedding Memories",
  description: "Capture and share precious moments from your special day",
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" className={nunitoSans.variable} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
        vaul-drawer-wrapper=""
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
