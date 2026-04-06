"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";

// Custom black dot icon — no external image dependency
const blackDotIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 14px;
    height: 14px;
    background: #000;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

export interface EventData {
  id: string;
  title: string;
  fripeirieName: string;
  address: string;
  date: string;
  timeSlot: string;
  price: number;
  maxParticipants: number;
  registrationCount: number;
  lat: number;
  lng: number;
}

interface EventMarkerProps {
  event: EventData;
}

export function EventMarker({ event }: EventMarkerProps) {
  const router = useRouter();
  const spotsLeft = event.maxParticipants - event.registrationCount;

  return (
    <Marker position={[event.lat, event.lng]} icon={blackDotIcon}>
      <Popup minWidth={260} maxWidth={300}>
        <div className="font-sans p-1">
          {/* Friperie name */}
          <h3 className="font-bold text-base text-black mb-0.5 leading-tight">
            {event.fripeirieName}
          </h3>

          {/* Event title */}
          <p className="text-xs text-gray-500 mb-3">{event.title}</p>

          {/* Details */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-start gap-1.5 text-sm">
              <span className="text-gray-400 mt-0.5">📍</span>
              <span className="text-gray-700">{event.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-400">📅</span>
              <span className="text-gray-700">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-400">🕐</span>
              <span className="text-gray-700">{event.timeSlot}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                <span className="text-gray-400">👥 </span>
                {event.registrationCount}/{event.maxParticipants} inscrits
              </span>
              <span className="font-semibold text-[#0e59c3]">
                {formatPrice(event.price)}
              </span>
            </div>
          </div>

          {/* Spots badge */}
          {spotsLeft <= 3 && spotsLeft > 0 && (
            <div className="mb-3 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
              Plus que {spotsLeft} place{spotsLeft > 1 ? "s" : ""} disponible
              {spotsLeft > 1 ? "s" : ""} !
            </div>
          )}
          {spotsLeft === 0 && (
            <div className="mb-3 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
              Complet
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => router.push(`/events/${event.id}`)}
            disabled={spotsLeft === 0}
            className="w-full bg-[#0e59c3] text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-[#0d4fad] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Je m&apos;inscris
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
