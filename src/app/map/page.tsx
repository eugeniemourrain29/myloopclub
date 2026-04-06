export const dynamic = "force-dynamic";

import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import type { EventData } from "@/components/EventMarker";

// Dynamic import with SSR disabled — Leaflet requires browser APIs
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3 text-black/40">
        <div className="w-8 h-8 border-2 border-[#0e59c3] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Chargement de la carte…</span>
      </div>
    </div>
  ),
});

async function getUpcomingEvents(): Promise<EventData[]> {
  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      status: "UPCOMING",
      date: { gte: now },
      lat: { not: null },
      lng: { not: null },
    },
    include: {
      _count: { select: { registrations: true } },
    },
    orderBy: { date: "asc" },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    fripeirieName: e.fripeirieName,
    address: e.address,
    date: e.date.toISOString(),
    timeSlot: e.timeSlot,
    price: e.price,
    maxParticipants: e.maxParticipants,
    registrationCount: e._count.registrations,
    lat: e.lat!,
    lng: e.lng!,
  }));
}

export default async function MapPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="flex-none px-6 py-4 bg-[#fffcf5] border-b border-black/8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0e59c3]">Loop Clubs à Paris</h1>
          <p className="text-sm text-black/50 mt-0.5">
            {events.length} événement{events.length !== 1 ? "s" : ""} à venir
          </p>
        </div>
        <div className="text-xs text-black/30 hidden sm:block">
          Cliquez sur un marqueur pour voir les détails
        </div>
      </div>

      {/* Map container — fills remaining height */}
      <div className="flex-1 relative">
        <Map events={events} />

        {/* Legend overlay */}
        <div className="absolute bottom-16 left-4 z-[1000] bg-white/90 backdrop-blur-sm border border-black/10 rounded-xl px-4 py-3 shadow-md">
          <div className="flex items-center gap-2 text-xs text-black/60">
            <div className="w-3 h-3 rounded-full bg-black border border-white shadow-sm flex-none" />
            Loop Club disponible
          </div>
        </div>
      </div>
    </div>
  );
}
