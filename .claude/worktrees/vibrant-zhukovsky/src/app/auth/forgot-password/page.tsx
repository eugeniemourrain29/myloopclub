"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Une erreur est survenue.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black text-[#0e59c3]">
            myloopclub
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-black">
            Mot de passe oublié ?
          </h1>
          <p className="mt-2 text-sm text-black/50">
            Saisis ton adresse email et on t&apos;envoie un lien de réinitialisation.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white border border-black/10 rounded-xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-[#0e59c3]" />
            </div>
            <p className="text-sm text-black/70 leading-relaxed">
              Si un compte existe avec cet email, tu recevras un lien dans quelques minutes.
            </p>
            <p className="text-xs text-black/40">
              Pense à vérifier tes spams si tu ne vois rien dans ta boîte principale.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black mb-1.5"
                >
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0e59c3] text-white font-medium py-3 rounded-xl hover:bg-[#0d4fad] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Envoi en cours…" : "Envoyer le lien"}
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
