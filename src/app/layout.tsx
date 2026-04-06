import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Trookie — Loop Clubs à Paris",
  description:
    "Échangez vos vêtements dans les meilleures friperies parisiennes. Rejoignez un Loop Club Trookie.",
  keywords: ["friperie", "échange vêtements", "Paris", "mode durable", "Loop Club"],
  openGraph: {
    title: "Trookie — Loop Clubs à Paris",
    description: "Échangez vos vêtements dans les meilleures friperies parisiennes.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-[#fffcf5] text-black antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
