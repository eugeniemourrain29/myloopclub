"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountType = "PARTICULIER" | "BUSINESS";

export default function SignUpPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<AccountType>("PARTICULIER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Business-only fields
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          accountType,
          ...(accountType === "BUSINESS" && { companyName, address }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      // Auto-redirect to sign-in after successful registration
      router.push("/auth/signin?registered=1");
    } catch {
      setError("Impossible de créer le compte. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black text-[#0e59c3]">
            Trookie
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-black">Crée ton compte</h1>
          <p className="mt-2 text-sm text-black/50">
            Rejoins la communauté des échanges circulaires
          </p>
        </div>

        {/* Account type selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-black mb-3">Tu es :</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType("PARTICULIER")}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all text-left",
                accountType === "PARTICULIER"
                  ? "border-[#0e59c3] bg-[#0e59c3]/5"
                  : "border-black/10 bg-white hover:border-black/20"
              )}
            >
              <User
                className={cn(
                  "w-5 h-5 flex-none",
                  accountType === "PARTICULIER" ? "text-[#0e59c3]" : "text-black/30"
                )}
              />
              <div>
                <div
                  className={cn(
                    "text-sm font-semibold",
                    accountType === "PARTICULIER" ? "text-[#0e59c3]" : "text-black"
                  )}
                >
                  Particulier
                </div>
                <div className="text-xs text-black/40 mt-0.5">Je viens échanger</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("BUSINESS")}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all text-left",
                accountType === "BUSINESS"
                  ? "border-[#0e59c3] bg-[#0e59c3]/5"
                  : "border-black/10 bg-white hover:border-black/20"
              )}
            >
              <Building2
                className={cn(
                  "w-5 h-5 flex-none",
                  accountType === "BUSINESS" ? "text-[#0e59c3]" : "text-black/30"
                )}
              />
              <div>
                <div
                  className={cn(
                    "text-sm font-semibold",
                    accountType === "BUSINESS" ? "text-[#0e59c3]" : "text-black"
                  )}
                >
                  Business
                </div>
                <div className="text-xs text-black/40 mt-0.5">J&apos;organise des events</div>
              </div>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-black mb-1.5">
              {accountType === "BUSINESS" ? "Nom complet (gérant)" : "Prénom"}
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
              placeholder={accountType === "BUSINESS" ? "Marie Dupont" : "Marie"}
            />
          </div>

          {/* Business-only fields */}
          {accountType === "BUSINESS" && (
            <>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-black mb-1.5">
                  Nom de la friperie / entreprise
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
                  placeholder="La Belle Friperie"
                />
              </div>
              <div>
                <label htmlFor="bizAddress" className="block text-sm font-medium text-black mb-1.5">
                  Adresse
                </label>
                <input
                  id="bizAddress"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
                  placeholder="12 rue de la Mode, 75003 Paris"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-1.5">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
              placeholder="toi@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
                placeholder="8 caractères minimum"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0e59c3] text-white font-medium py-3 rounded-xl hover:bg-[#0d4fad] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Création du compte…" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-black/50">
          Déjà un compte ?{" "}
          <Link href="/auth/signin" className="text-[#0e59c3] font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
