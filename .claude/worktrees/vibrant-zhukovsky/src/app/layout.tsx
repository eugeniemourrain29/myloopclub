import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { auth } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "myloopclub — Loop Clubs à Paris",
  description:
    "Échangez vos vêtements dans les meilleures friperies parisiennes. Rejoignez un Loop Club myloopclub.",
  keywords: ["friperie", "échange vêtements", "Paris", "mode durable", "Loop Club"],
  openGraph: {
    title: "myloopclub — Loop Clubs à Paris",
    description: "Échangez vos vêtements dans les meilleures friperies parisiennes.",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-[#fffcf5] text-black antialiased">
        <Navbar
          isLoggedIn={!!session?.user}
          userName={session?.user?.name ?? undefined}
          accountType={session?.user?.accountType ?? undefined}
        />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
