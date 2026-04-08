import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Star, Calendar, Shirt, ChevronRight, MapPin } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function UserDashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard/user");

  const accountType = session.user.accountType;
  if (accountType === "BUSINESS") redirect("/dashboard/business");

  const userWithData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      points: true,
      registrations: {
        include: {
          event: true,
          clothingItems: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!userWithData) redirect("/auth/signin");

  const totalPoints = userWithData.points?.totalPoints ?? 0;
  const registrations = userWithData.registrations;
  const attendedCount = registrations.filter(
    (r) => new Date(r.event.date) < new Date()
  ).length;
  const upcomingRegistrations = registrations.filter(
    (r) => r.event.status === "UPCOMING"
  );
  const pastRegistrations = registrations.filter(
    (r) => r.event.status === "PAST"
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] py-10 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm text-[#0e59c3] font-medium mb-1">Mon espace</p>
          <h1 className="text-3xl font-bold text-black">
            Bonjour, {userWithData.name.split(" ")[0]} 👋
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-black/8 rounded-2xl p-5">
            <Star className="w-5 h-5 text-[#0e59c3] mb-3" />
            <div className="text-3xl font-black text-black mb-1">{totalPoints}</div>
            <div className="text-xs text-black/50">Points gagnés</div>
          </div>
          <div className="bg-white border border-black/8 rounded-2xl p-5">
            <Calendar className="w-5 h-5 text-[#0e59c3] mb-3" />
            <div className="text-3xl font-black text-black mb-1">{attendedCount}</div>
            <div className="text-xs text-black/50">Events attendus</div>
          </div>
          <div className="bg-white border border-black/8 rounded-2xl p-5">
            <Shirt className="w-5 h-5 text-[#0e59c3] mb-3" />
            <div className="text-3xl font-black text-black mb-1">
              {registrations.reduce((s, r) => s + r.clothingItems.length, 0)}
            </div>
            <div className="text-xs text-black/50">Vêtements échangés</div>
          </div>
        </div>

        {/* Points info banner */}
        {totalPoints > 0 && (
          <div className="mb-8 bg-[#0e59c3]/5 border border-[#0e59c3]/15 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0e59c3] rounded-full flex items-center justify-center flex-none">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#0e59c3]">
                Tu as {totalPoints} points myloopclub !
              </p>
              <p className="text-xs text-[#0e59c3]/70 mt-0.5">
                Continue d&apos;apporter des fibres naturelles pour maximiser tes points.
              </p>
            </div>
          </div>
        )}

        {/* Upcoming events */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-black">
              Mes prochains Loop Clubs
              <span className="ml-2 text-sm font-normal text-black/40">
                ({upcomingRegistrations.length})
              </span>
            </h2>
            <Link
              href="/map"
              className="text-sm text-[#0e59c3] font-medium hover:underline flex items-center gap-1"
            >
              Explorer la carte <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingRegistrations.length === 0 ? (
            <div className="bg-white border border-black/8 rounded-2xl p-8 text-center">
              <p className="text-black/40 text-sm mb-4">
                Tu n&apos;es inscrit à aucun Loop Club à venir.
              </p>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0e59c3] hover:underline"
              >
                <MapPin className="w-4 h-4" />
                Trouver un Loop Club
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingRegistrations.map((reg) => (
                <RegistrationCard key={reg.id} registration={reg} type="upcoming" />
              ))}
            </div>
          )}
        </section>

        {/* Past events */}
        {pastRegistrations.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-black mb-4">
              Historique
              <span className="ml-2 text-sm font-normal text-black/40">
                ({pastRegistrations.length})
              </span>
            </h2>
            <div className="space-y-3">
              {pastRegistrations.map((reg) => (
                <RegistrationCard key={reg.id} registration={reg} type="past" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function RegistrationCard({
  registration,
  type,
}: {
  registration: {
    id: string;
    paid: boolean;
    event: {
      id: string;
      title: string;
      fripeirieName: string;
      date: Date;
      timeSlot: string;
      price: number;
    };
    clothingItems: {
      id: string;
      brand: string;
      naturalFiberPercent: number;
      points: number;
    }[];
  };
  type: "upcoming" | "past";
}) {
  const totalPoints = registration.clothingItems.reduce((s, c) => s + c.points, 0);

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                registration.paid
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {registration.paid ? "Payé" : "En attente de paiement"}
            </span>
            {type === "past" && totalPoints > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#0e59c3]/10 text-[#0e59c3] font-medium flex items-center gap-1">
                <Star className="w-3 h-3" />
                +{totalPoints} pts
              </span>
            )}
          </div>
          <h3 className="font-bold text-black text-base truncate">
            {registration.event.title}
          </h3>
          <p className="text-sm text-black/50 mt-0.5">
            {registration.event.fripeirieName} · {formatDate(registration.event.date)} ·{" "}
            {registration.event.timeSlot}
          </p>
        </div>
        {type === "upcoming" && (
          <Link
            href={`/events/${registration.event.id}/register-clothes`}
            className="flex-none inline-flex items-center gap-1 text-sm text-[#0e59c3] font-medium hover:underline whitespace-nowrap"
          >
            <Shirt className="w-4 h-4" />
            Mes vêtements
          </Link>
        )}
      </div>

      {/* Clothing items */}
      {registration.clothingItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/8">
          <p className="text-xs font-medium text-black/40 uppercase tracking-wide mb-2">
            Vêtements enregistrés ({registration.clothingItems.length})
          </p>
          <div className="space-y-1.5">
            {registration.clothingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-black/70">
                  {item.brand} —{" "}
                  <span className="text-black/40">{item.naturalFiberPercent}% naturel</span>
                </span>
                <span className="text-[#0e59c3] font-medium text-xs">
                  +{item.points} pt{item.points > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
