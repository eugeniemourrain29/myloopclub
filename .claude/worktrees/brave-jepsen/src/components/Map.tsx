"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EventMarker, type EventData } from "./EventMarker";

// Fix Leaflet's default icon path issue with Webpack
import L from "leaflet";
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapProps {
  events: EventData[];
}

// Paris centre coordinates
const PARIS_CENTER: [number, number] = [48.8566, 2.3522];
const DEFAULT_ZOOM = 13;

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

export default function Map({ events }: MapProps) {
  return (
    <MapContainer
      center={PARIS_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      style={{ width: "100%", height: "100%" }}
      className="z-0"
    >
      <TileLayer
        url={TILE_URL}
        attribution={TILE_ATTRIBUTION}
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />

      {events.map((event) => (
        <EventMarker key={event.id} event={event} />
      ))}
    </MapContainer>
  );
}
