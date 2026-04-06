import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Euro,
  ArrowLeft,
  Shirt,
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { RegisterButton } from "./RegisterButton";

interface EventPageProps {
  params: { id: string };
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { registrations: true } },
      registrations: session?.user?.id
        ? {
            where: { userId: session.user.id },
            select: { id: true, paid: true },
          }
        : false,
    },
  });

  if (!event) notFound();

  // Auto-expire check
  const isPast = new Date(event.date) < new Date();
  if (isPast && event.status === "UPCOMING") {
    await prisma.event.update({
      where: { id: event.id },
      data: { status: "PAST" },
    });
  }

  const spotsLeft = event.maxParticipants - event._count.registrations;
  const isRegistered =
    session?.user?.id &&
    Array.isArray(event.registrations) &&
    event.registrations.length > 0;
  const registration =
    Array.isArray(event.registrations) ? event.registrations[0] : undefined;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] py-10 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/map"
          className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la carte
        </Link>

        {/* Status badge */}
        <div className="mb-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              event.status === "UPCOMING"
                ? "bg-green-100 text-green-700"
                : event.status === "PAST"
                ? "bg-gray-100 text-gray-500"
                : "bg-red-100 text-red-600"
            }`}
          >
            {event.status === "UPCOMING"
              ? "À venir"
              : event.status === "PAST"
              ? "Passé"
              : "Annulé"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#0e59c3] mb-1">{event.title}</h1>
        <p className="text-black/50 mb-8">{event.fripeirieName}</p>

        {/* Detail grid */}
        <div className="bg-white border border-black/8 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <DetailRow icon={<MapPin className="w-4 h-4 text-[#0e59c3]" />} label="Adresse">
              {event.address}
            </DetailRow>
            <DetailRow icon={<Calendar className="w-4 h-4 text-[#0e59c3]" />} label="Date">
              {formatDate(event.date)}
            </DetailRow>
            <DetailRow icon={<Clock className="w-4 h-4 text-[#0e59c3]" />} label="Créneau">
              {event.timeSlot}
            </DetailRow>
            <DetailRow icon={<Users className="w-4 h-4 text-[#0e59c3]" />} label="Participants">
              <span>
                {event._count.registrations}/{event.maxParticipants} inscrits
              </span>
              {spotsLeft > 0 && spotsLeft <= 5 && (
                <span className="ml-2 text-xs text-amber-600 font-medium">
                  (plus que {spotsLeft} place{spotsLeft > 1 ? "s" : ""} !)
                </span>
              )}
              {spotsLeft === 0 && (
                <span className="ml-2 text-xs text-red-600 font-medium">Complet</span>
              )}
            </DetailRow>
            <DetailRow icon={<Euro className="w-4 h-4 text-[#0e59c3]" />} label="Tarif">
              {formatPrice(event.price)}
            </DetailRow>
          </div>
        </div>

        {/* Points info */}
        <div className="bg-[#0e59c3]/5 border border-[#0e59c3]/15 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-[#0e59c3] mb-3 text-sm uppercase tracking-wide">
            Grille de points
          </h3>
          <div className="space-y-2 text-sm">
            {[
              { range: "≥ 80% fibres naturelles", points: 3 },
              { range: "50–79% fibres naturelles", points: 2 },
              { range: "< 50% fibres naturelles", points: 1 },
            ].map(({ range, points }) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-black/60">{range}</span>
                <span className="font-bold text-[#0e59c3]">
                  {points} pt{points > 1 ? "s" : ""} / vêtement
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Registration section */}
        {event.status === "UPCOMING" && !isPast && (
          <div className="bg-white border border-black/8 rounded-2xl p-6">
            {isRegistered ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-black mb-0.5">
                    Tu es inscrit à cet événement ✓
                  </p>
                  <p className="text-sm text-black/50">
                    {registration?.paid
                      ? "Paiement confirmé."
                      : "En attente de paiement."}
                  </p>
                </div>
                <Link
                  href={`/events/${event.id}/register-clothes`}
                  className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-black/80 transition-colors"
                >
                  <Shirt className="w-4 h-4" />
                  Enregistrer mes vêtements
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-black mb-0.5">
                    Prêt à rejoindre le Loop Club ?
                  </p>
                  <p className="text-sm text-black/50">
                    {spotsLeft} place{spotsLeft !== 1 ? "s" : ""} disponible
                    {spotsLeft !== 1 ? "s" : ""}
                  </p>
                </div>
                <RegisterButton
                  eventId={event.id}
                  isLoggedIn={!!session?.user}
                  isFull={spotsLeft === 0}
                />
              </div>
            )}
          </div>
        )}

        {event.status === "PAST" && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-black/40 text-sm">
            Cet événement est terminé.
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-none mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-black/40 uppercase tracking-wide block mb-0.5">
          {label}
        </span>
        <div className="text-sm text-black">{children}</div>
      </div>
    </div>
  );
}
