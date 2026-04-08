"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, MapPin } from "lucide-react";

export interface AddressResult {
  label: string;       // full address: "69 Rue Beaubourg 75003 Paris"
  street: string;      // "69 Rue Beaubourg"
  postcode: string;    // "75003"
  city: string;        // "Paris"
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (result: AddressResult) => void;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, placeholder }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  async function search(q: string) {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`
      );
      const data = await res.json();
      const results: AddressResult[] = (data.features ?? []).map((f: {
        properties: { label: string; name: string; postcode: string; city: string };
        geometry: { coordinates: [number, number] };
      }) => ({
        label: f.properties.label,
        street: f.properties.name,
        postcode: f.properties.postcode,
        city: f.properties.city,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }));
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
  }

  function handleSelect(result: AddressResult) {
    setQuery(result.label);
    setSuggestions([]);
    setOpen(false);
    onChange(result);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          required
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder ?? "69 rue Beaubourg, Paris"}
          className="w-full px-4 py-3 pr-10 rounded-xl border border-black/15 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#0e59c3] focus:border-transparent transition text-sm"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 animate-spin" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-black/10 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#0e59c3]/5 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#0e59c3] flex-none mt-0.5" />
                <div>
                  <span className="text-sm text-black">{s.street}</span>
                  <span className="ml-2 text-sm text-black/40">{s.postcode} {s.city}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
