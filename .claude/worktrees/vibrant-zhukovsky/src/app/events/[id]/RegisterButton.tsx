"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface RegisterButtonProps {
  eventId: string;
  isLoggedIn: boolean;
  isFull: boolean;
}

export function RegisterButton({ eventId, isLoggedIn, isFull }: RegisterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!isLoggedIn) {
      router.push(`/auth/signin?callbackUrl=/events/${eventId}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Inscription impossible.");
        return;
      }

      // Redirect to payment or confirmation
      router.push(`/events/${eventId}/payment`);
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleRegister}
        disabled={loading || isFull}
        className="flex items-center gap-2 bg-[#0e59c3] text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-[#0d4fad] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isFull ? "Complet" : loading ? "Inscription…" : "Je m'inscris"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
