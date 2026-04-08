"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Star, CheckCircle } from "lucide-react";
import { calculatePoints, getPointsLabel } from "@/lib/points";
import { useRouter } from "next/navigation";

interface ClothingItem {
  id: string;
  brand: string;
  naturalFiberPercent: number;
  points: number;
  validated: boolean;
}

interface ClothingRegistrationFormProps {
  registrationId: string;
  eventId: string;
  existingItems: ClothingItem[];
}

interface NewItem {
  brand: string;
  naturalFiberPercent: number;
}

const EMPTY_ITEM: NewItem = { brand: "", naturalFiberPercent: 0 };

export function ClothingRegistrationForm({
  registrationId,
  eventId,
  existingItems,
}: ClothingRegistrationFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<ClothingItem[]>(existingItems);
  const [newItem, setNewItem] = useState<NewItem>({ ...EMPTY_ITEM });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const previewPoints = calculatePoints(newItem.naturalFiberPercent);
  const totalPoints = items.reduce((s, i) => s + i.points, 0);

  async function handleAdd() {
    if (!newItem.brand.trim()) {
      setError("Indique la marque du vêtement.");
      return;
    }
    if (newItem.naturalFiberPercent < 0 || newItem.naturalFiberPercent > 100) {
      setError("Le pourcentage doit être entre 0 et 100.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/events/${eventId}/register-clothes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registrationId,
            brand: newItem.brand,
            naturalFiberPercent: newItem.naturalFiberPercent,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Impossible d'ajouter le vêtement.");
        return;
      }

      setItems((prev) => [...prev, data.clothingItem]);
      setNewItem({ ...EMPTY_ITEM });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(itemId: string) {
    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/clothing/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        router.refresh();
      }
    } catch {
      // silent fail
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing items */}
      {items.length > 0 && (
        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/8">
            <h3 className="font-semibold text-black text-sm">
              Vêtements enregistrés ({items.length})
            </h3>
            <div className="flex items-center gap-1.5 text-[#0e59c3] font-bold text-sm">
              <Star className="w-4 h-4" />
              {totalPoints} point{totalPoints !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="divide-y divide-black/5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-black">{item.brand}</span>
                    {item.validated && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Validé
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-black/40 mt-0.5">
                    {getPointsLabel(item.naturalFiberPercent)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-none ml-4">
                  <span className="text-[#0e59c3] font-bold text-sm">
                    +{item.points} pt{item.points !== 1 ? "s" : ""}
                  </span>
                  {!item.validated && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="text-black/20 hover:text-red-500 transition-colors"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add item form */}
      <div className="bg-white border border-black/8 rounded-2xl p-5">
        <h3 className="font-semibold text-black text-sm mb-4">
          Ajouter un vêtement
        </h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Vêtement ajouté !
          </div>
        )}

        <div className="space-y-4">
          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">
              Marque
            </label>
            <input
              type="text"
              value={newItem.brand}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, brand: e.target.value }))
              }
              placeholder="Sézane, Jacquemus, Veja…"
              className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
            />
          </div>

          {/* Fiber percentage */}
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">
              Composition — % de fibres naturelles
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={newItem.naturalFiberPercent}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    naturalFiberPercent: Number(e.target.value),
                  }))
                }
                className="flex-1 accent-[#0e59c3]"
              />
              <div className="flex items-center gap-1 w-20">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newItem.naturalFiberPercent}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      naturalFiberPercent: Math.min(
                        100,
                        Math.max(0, Number(e.target.value))
                      ),
                    }))
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-black/15 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#0e59c3]"
                />
                <span className="text-sm text-black/40">%</span>
              </div>
            </div>

            {/* Live points preview */}
            <div
              className={`mt-2 text-sm font-medium flex items-center gap-1.5 ${
                newItem.naturalFiberPercent >= 80
                  ? "text-green-600"
                  : newItem.naturalFiberPercent >= 50
                  ? "text-amber-600"
                  : "text-black/40"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              {getPointsLabel(newItem.naturalFiberPercent)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={loading || !newItem.brand.trim()}
            className="w-full bg-[#0e59c3] text-white font-medium py-3 rounded-xl hover:bg-[#0d4fad] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {loading ? "Ajout en cours…" : "Ajouter ce vêtement"}
          </button>
        </div>
      </div>

      {/* Total summary */}
      {items.length > 0 && (
        <div className="flex items-center justify-between bg-black text-white rounded-2xl px-6 py-4">
          <span className="font-medium">Total points pour cet événement</span>
          <span className="text-2xl font-black">
            {totalPoints} <span className="text-sm font-normal text-white/60">pts</span>
          </span>
        </div>
      )}
    </div>
  );
}
