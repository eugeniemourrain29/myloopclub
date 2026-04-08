"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, Star } from "lucide-react";
import { getPointsLabel } from "@/lib/points";

interface ClothingItem {
  id: string;
  brand: string;
  naturalFiberPercent: number;
  points: number;
  validated: boolean;
}

interface ValidateClothingListProps {
  items: ClothingItem[];
}

export function ValidateClothingList({ items }: ValidateClothingListProps) {
  const [localItems, setLocalItems] = useState<ClothingItem[]>(items);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(itemId: string, validated: boolean) {
    setLoadingId(itemId);
    try {
      const res = await fetch(`/api/clothing/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validated }),
      });

      if (res.ok) {
        setLocalItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, validated } : i))
        );
      }
    } finally {
      setLoadingId(null);
    }
  }

  const validatedCount = localItems.filter((i) => i.validated).length;
  const totalPoints = localItems
    .filter((i) => i.validated)
    .reduce((s, i) => s + i.points, 0);

  return (
    <div>
      <div className="space-y-3 mb-4">
        {localItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
              item.validated
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm text-black">{item.brand}</span>
              <p className="text-xs text-black/40 mt-0.5">
                {getPointsLabel(item.naturalFiberPercent)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-none ml-3">
              <span className="text-[#0e59c3] font-bold text-xs">
                +{item.points} pt{item.points !== 1 ? "s" : ""}
              </span>

              {loadingId === item.id ? (
                <Loader2 className="w-5 h-5 animate-spin text-black/30" />
              ) : item.validated ? (
                <button
                  onClick={() => handleToggle(item.id, false)}
                  className="text-green-600 hover:text-red-500 transition-colors"
                  title="Annuler la validation"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => handleToggle(item.id, true)}
                  className="text-black/20 hover:text-green-600 transition-colors"
                  title="Valider"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-black/50 pt-3 border-t border-black/8">
        <span>
          {validatedCount}/{localItems.length} vêtements validés
        </span>
        {validatedCount > 0 && (
          <span className="flex items-center gap-1 text-[#0e59c3] font-medium">
            <Star className="w-3 h-3" />
            {totalPoints} points attribués
          </span>
        )}
      </div>
    </div>
  );
}
