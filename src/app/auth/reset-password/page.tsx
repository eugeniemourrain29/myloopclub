"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Une erreur est survenue.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          <Link href="/" className="text-3xl font-lazydog text-[#0e59c3]">
            My Loop Club
          </Link>
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            Ce lien est invalide ou a déjà été utilisé.
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-[#0e59c3] font-medium hover:underline text-sm inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-lazydog text-[#0e59c3]">
            My Loop Club
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-black">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm text-black/50">
            Choisis un nouveau mot de passe pour ton compte.
          </p>
        </div>

        {success ? (
          <div className="bg-white border border-black/10 rounded-xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-[#0e59c3]" />
            </div>
            <p className="text-lg font-semibold text-black">
              Mot de passe modifié !
            </p>
            <p className="text-sm text-black/60">
              Tu peux maintenant te connecter avec ton nouveau mot de passe.
            </p>
            <Link
              href="/auth/signin"
              className="mt-2 inline-block w-full bg-[#0e59c3] text-white font-medium py-3 rounded-xl hover:bg-[#0d4fad] transition-colors text-sm text-center"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
                {(error.includes("expiré") || error.includes("invalide")) && (
                  <p className="mt-2">
                    <Link
                      href="/auth/forgot-password"
                      className="text-red-700 font-medium underline"
                    >
                      Demander un nouveau lien
                    </Link>
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black mb-1.5"
                >
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
                    placeholder="Au moins 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-black mb-1.5"
                >
                  Confirme le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0e59c3] text-white font-medium py-3 rounded-xl hover:bg-[#0d4fad] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Modification…" : "Modifier le mot de passe"}
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-center text-sm text-black/50">
          <Link
            href="/auth/signin"
            className="text-[#0e59c3] font-medium hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fffcf5]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
