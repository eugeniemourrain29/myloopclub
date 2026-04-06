import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Users, Plus, ChevronRight, CheckCircle2, Clock, Pencil } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function BusinessDashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard/business");

  const accountType = session.user.accountType;
  if (accountType !== "BUSINESS") redirect("/dashboard/user");

  const now = new Date();

  // Auto-expire past events
  await prisma.event.updateMany({
    where: {
      createdById: session.user.id,
      status: "UPCOMING",
      date: { lt: now },
    },
    data: { status: "PAST" },
  });

  const events = await prisma.event.findMany({
    where: { createdById: session.user.id },
    include: {
      registrations: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { date: "desc" },
  });

  const upcomingEvents = events.filter((e) => e.status === "UPCOMING");
  const pastEvents = events.filter((e) => e.status === "PAST");

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm text-[#0e59c3] font-medium mb-1">Dashboard Business</p>
            <h1 className="text-3xl font-bold text-black">
              {business?.companyName ?? session.user.name}
            </h1>
          </div>
          <Link
            href="/propose"
            className="inline-flex items-center gap-2 bg-[#0e59c3] text-white font-medium px-5 py-3 rounded-xl hover:bg-[#0d4fad] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Créer un Loop Club
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={<Calendar className="w-5 h-5 text-[#0e59c3]" />}
            label="Events organisés"
            value={events.length}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-[#0e59c3]" />}
            label="À venir"
            value={upcomingEvents.length}
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-[#0e59c3]" />}
            label="Participants total"
            value={events.reduce((sum, e) => sum + e.registrations.length, 0)}
          />
        </div>

        {/* Upcoming events */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-black mb-4">
            Prochains Loop Clubs
            <span className="ml-2 text-sm font-normal text-black/40">
              ({upcomingEvents.length})
            </span>
          </h2>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              message="Aucun Loop Club à venir."
              cta={{ label: "Créer mon premier event", href: "/propose" }}
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} type="upcoming" />
              ))}
            </div>
          )}
        </section>

        {/* Past events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-black mb-4">
              Events passés
              <span className="ml-2 text-sm font-normal text-black/40">
                ({pastEvents.length})
              </span>
            </h2>
            <div className="space-y-3">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} type="past" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="mb-3">{icon}</div>
      <div className="text-3xl font-black text-black mb-1">{value}</div>
      <div className="text-xs text-black/50">{label}</div>
    </div>
  );
}

function EmptyState({
  message,
  cta,
}: {
  message: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-8 text-center">
      <p className="text-black/40 text-sm mb-4">{message}</p>
      <Link
        href={cta.href}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#0e59c3] hover:underline"
      >
        {cta.label}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function EventCard({
  event,
  type,
}: {
  event: {
    id: string;
    title: string;
    fripeirieName: string;
    date: Date;
    timeSlot: string;
    price: number;
    maxParticipants: number;
    registrations: { user: { name: string } }[];
  };
  type: "upcoming" | "past";
}) {
  const spots = event.maxParticipants - event.registrations.length;

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                type === "upcoming"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {type === "upcoming" ? (
                <><Clock className="w-3 h-3" /> À venir</>
              ) : (
                <><CheckCircle2 className="w-3 h-3" /> Passé</>
              )}
            </span>
            <span className="text-xs text-black/30">{formatPrice(event.price)}</span>
          </div>
          <h3 className="font-bold text-black text-base truncate">{event.title}</h3>
          <p className="text-sm text-black/50 mt-0.5">
            {event.fripeirieName} · {formatDate(event.date)} · {event.timeSlot}
          </p>
        </div>

        <div className="flex-none flex items-center gap-3">
          {type === "upcoming" && (
            <Link
              href={`/dashboard/business/events/${event.id}/edit`}
              className="inline-flex items-center gap-1 text-sm text-black/50 hover:text-black transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier
            </Link>
          )}
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 text-sm text-[#0e59c3] font-medium hover:underline"
          >
            Voir détails <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Participants list */}
      {event.registrations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/8">
          <p className="text-xs font-medium text-black/40 mb-2 uppercase tracking-wide">
            Participants ({event.registrations.length}/{event.maxParticipants})
          </p>
          <div className="flex flex-wrap gap-2">
            {event.registrations.map((r, i) => (
              <span
                key={i}
                className="bg-[#0e59c3]/8 text-[#0e59c3] text-xs px-2.5 py-1 rounded-full font-medium"
              >
                {r.user.name.split(" ")[0]}
              </span>
            ))}
            {spots > 0 && (
              <span className="text-xs text-black/30 self-center">
                + {spots} place{spots > 1 ? "s" : ""} libre{spots > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
