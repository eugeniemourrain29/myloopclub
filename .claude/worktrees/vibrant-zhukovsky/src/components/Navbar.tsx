"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

// We import auth lazily on the server via a separate server action approach,
// but for the client navbar we rely on a session context. For simplicity
// in this scaffold we expose a client-side session check via a hook pattern.
// In production, wrap with <SessionProvider> from next-auth/react.

interface NavbarProps {
  userName?: string;
  accountType?: "BUSINESS" | "PARTICULIER";
  isLoggedIn?: boolean;
}

export function Navbar({ userName, accountType, isLoggedIn }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/map", label: "Carte" },
    { href: "/propose", label: "Proposer" },
    ...(isLoggedIn && accountType === "BUSINESS"
      ? [{ href: "/dashboard/business", label: "Mon espace" }]
      : []),
    ...(isLoggedIn && accountType === "PARTICULIER"
      ? [{ href: "/dashboard/user", label: "Mon espace" }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#fffcf5]/90 backdrop-blur-sm border-b border-black/8">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black text-[#0e59c3] tracking-tight hover:opacity-80 transition-opacity"
        >
          myloopclub
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === href
                  ? "text-[#0e59c3]"
                  : "text-black/60 hover:text-black"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-black/50 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {userName}
              </span>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-black/70 hover:text-black transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-medium bg-[#0e59c3] text-white px-4 py-2 rounded-lg hover:bg-[#0d4fad] transition-colors"
              >
                Inscription
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-black/8 bg-[#fffcf5] px-6 py-4 flex flex-col gap-3">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium py-1 transition-colors",
                pathname === href ? "text-[#0e59c3]" : "text-black/70"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-black/8 flex flex-col gap-2">
            {isLoggedIn ? (
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="text-sm text-black/50 text-left">
                  Déconnexion
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-sm text-black/70"
                  onClick={() => setMobileOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium bg-[#0e59c3] text-white px-4 py-2 rounded-lg text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
