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

// Stamen Toner tile URL (black & white, fine lines)
// Using the Stadia Maps hosted version of Stamen Toner (free with attribution)
const STAMEN_TONER_URL =
  "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png";
const STAMEN_TONER_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com">Stamen Design</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

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
        url={STAMEN_TONER_URL}
        attribution={STAMEN_TONER_ATTRIBUTION}
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />

      {events.map((event) => (
        <EventMarker key={event.id} event={event} />
      ))}
    </MapContainer>
  );
}
