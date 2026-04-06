"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const TIME_SLOTS = [
  "10h00 – 12h00", "11h00 – 13h00", "12h00 – 14h00",
  "14h00 – 16h00", "15h00 – 17h00", "16h00 – 18h00",
  "17h00 – 19h00", "18h00 – 20h00", "19h00 – 21h00",
];

interface EditEventFormProps {
  event: {
    id: string;
    title: string;
    venueSuggestion: string;
    venueAddress: string;
    date: string;
    timeSlot: string;
    maxParticipants: number;
    price: number;
  };
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(event.title);
  const [venueSuggestion, setVenueSuggestion] = useState(event.venueSuggestion);
  const [venueAddress, setVenueAddress] = useState(event.venueAddress);
  const [date, setDate] = useState(event.date);
  const [timeSlot, setTimeSlot] = useState(event.timeSlot);
  const [maxParticipants, setMaxParticipants] = useState(event.maxParticipants);
  const [price, setPrice] = useState(event.price);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, venueSuggestion, venueAddress, date, timeSlot, maxParticipants, price }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      router.push("/dashboard/business");
    } catch {
      setError("Impossible de modifier l'événement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-black mb-1.5">Titre</label>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1.5">Nom de la friperie</label>
        <input type="text" required value={venueSuggestion} onChange={(e) => setVenueSuggestion(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1.5">Adresse</label>
        <input type="text" required value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1.5">Date</label>
        <input type="date" required min={today} value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1.5">Créneau horaire</label>
        <select required value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm">
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">Participants max</label>
          <input type="number" required min={2} max={100} value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">Prix (€)</label>
          <input type="number" required min={0} step={0.5} value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="flex-1 border border-black/20 text-black/70 font-medium py-3 rounded-xl hover:bg-black/5 transition-colors text-sm">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-[#0e59c3] text-white font-medium py-3 rounded-xl hover:bg-[#0d4fad] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Modification…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
