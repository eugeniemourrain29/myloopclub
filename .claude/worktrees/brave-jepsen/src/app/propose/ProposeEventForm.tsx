"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Info } from "lucide-react";
import { AddressAutocomplete, type AddressResult } from "@/components/AddressAutocomplete";

interface ProposeEventFormProps {
  accountType: "BUSINESS" | "PARTICULIER";
  friperies: { id: string; name: string; address: string }[];
  userId: string;
}

const TIME_SLOTS = [
  "10h00 – 12h00", "11h00 – 13h00", "12h00 – 14h00",
  "14h00 – 16h00", "15h00 – 17h00", "16h00 – 18h00",
  "17h00 – 19h00", "18h00 – 20h00", "19h00 – 21h00",
];

export function ProposeEventForm({ accountType, friperies, userId }: ProposeEventFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[5]);
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [price, setPrice] = useState(5);
  const [venueSuggestion, setVenueSuggestion] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venuePostalCode, setVenuePostalCode] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function handleAddressSelect(result: AddressResult) {
    setVenueAddress(result.label);
    setVenuePostalCode(result.postcode);
    setVenueCity(result.city);
    setLat(result.lat);
    setLng(result.lng);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!venuePostalCode || !venueCity) {
      setError("Sélectionne une adresse dans la liste pour valider le code postal et la ville.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          timeSlot,
          maxParticipants,
          price,
          venueSuggestion,
          venueAddress,
          venuePostalCode,
          venueCity,
          lat,
          lng,
          accountType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(accountType === "BUSINESS" ? "/dashboard/business" : "/map");
      }, 2000);
    } catch {
      setError("Impossible de soumettre l'événement. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-8 rounded-2xl text-center">
        <div className="text-3xl mb-3">🎉</div>
        <h2 className="font-bold text-lg mb-1">Proposition envoyée !</h2>
        <p className="text-sm text-green-700">
          {accountType === "BUSINESS"
            ? "Ton Loop Club est créé. Redirection vers ton dashboard…"
            : "On reviendra vers toi pour valider le lieu. Merci !"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {accountType === "PARTICULIER" && (
        <div className="flex gap-3 bg-[#0e59c3]/5 border border-[#0e59c3]/20 text-[#0e59c3] text-sm px-4 py-3 rounded-xl">
          <Info className="w-4 h-4 flex-none mt-0.5" />
          <span>
            Tu peux suggérer une friperie pour un Loop Club. Notre équipe validera
            le lieu et te contactera.
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-black mb-1.5">
          Titre de l&apos;événement
        </label>
        <input
          type="text" required value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Loop Club Marais — Printemps 2025"
          className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
        />
      </div>

      {/* Venue name */}
      <div>
        <label className="block text-sm font-medium text-black mb-1.5">
          Nom de la friperie
        </label>
        <input
          type="text" required value={venueSuggestion}
          onChange={(e) => setVenueSuggestion(e.target.value)}
          placeholder="Kilo Shop Marais"
          className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
        />
      </div>

      {/* Address autocomplete */}
      <div>
        <label className="block text-sm font-medium text-black mb-1.5">
          Adresse
        </label>
        <AddressAutocomplete
          value={venueAddress}
          onChange={handleAddressSelect}
          placeholder="69 rue Beaubourg…"
        />
      </div>

      {/* Postal code + city — filled automatically */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">
            Code postal
          </label>
          <input
            type="text" readOnly value={venuePostalCode}
            placeholder="75003"
            className="w-full px-4 py-3 rounded-xl border border-black/15 bg-black/5 text-black placeholder-black/30 focus:outline-none text-sm cursor-default"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">
            Ville
          </label>
          <input
            type="text" readOnly value={venueCity}
            placeholder="Paris"
            className="w-full px-4 py-3 rounded-xl border border-black/15 bg-black/5 text-black placeholder-black/30 focus:outline-none text-sm cursor-default"
          />
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-black mb-1.5">Date</label>
        <input
          type="date" required min={today} value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
        />
      </div>

      {/* Time slot */}
      <div>
        <label className="block text-sm font-medium text-black mb-1.5">
          Créneau horaire
        </label>
        <select
          required value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
        >
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </div>

      {/* Max participants + price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">
            Participants max
          </label>
          <input
            type="number" required min={2} max={100} value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">
            Prix (€)
          </label>
          <input
            type="number" required min={0} step={0.5} value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
          />
        </div>
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full bg-[#0e59c3] text-white font-medium py-3 rounded-xl hover:bg-[#0d4fad] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Envoi en cours…" : accountType === "BUSINESS" ? "Créer le Loop Club" : "Envoyer ma suggestion"}
      </button>
    </form>
  );
}
