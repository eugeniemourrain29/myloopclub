import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ClothingRegistrationForm } from "./ClothingRegistrationForm";

interface RegisterClothesPageProps {
  params: { id: string };
}

export default async function RegisterClothesPage({ params }: RegisterClothesPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/events/${params.id}/register-clothes`);
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
  });

  if (!event) notFound();

  // Check user is registered for this event
  const registration = await prisma.registration.findUnique({
    where: {
      userId_eventId: {
        userId: session.user.id!,
        eventId: params.id,
      },
    },
    include: {
      clothingItems: true,
    },
  });

  if (!registration) {
    redirect(`/events/${params.id}`);
  }

  // Registration window: from now until event start time
  const now = new Date();
  const eventDate = new Date(event.date);
  const isWindowOpen = now < eventDate;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] py-10 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href={`/events/${params.id}`}
          className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;événement
        </Link>

        <h1 className="text-3xl font-bold text-[#0e59c3] mb-1">
          Mes vêtements
        </h1>
        <p className="text-black/50 mb-2">
          {event.title} · {formatDate(event.date)} · {event.timeSlot}
        </p>

        {/* Registration window info */}
        <div className="flex gap-3 bg-[#0e59c3]/5 border border-[#0e59c3]/20 text-[#0e59c3] text-sm px-4 py-3 rounded-xl mb-8">
          <Info className="w-4 h-4 flex-none mt-0.5" />
          <span>
            Tu peux enregistrer tes vêtements jusqu&apos;au début de l&apos;événement
            ({formatDate(event.date)} à {event.timeSlot.split("–")[0].trim()}).
          </span>
        </div>

        {/* Points grid reminder */}
        <div className="bg-white border border-black/8 rounded-2xl p-5 mb-8">
          <h3 className="font-semibold text-black text-sm mb-3">
            Comment les points sont calculés
          </h3>
          <div className="space-y-2 text-sm">
            {[
              { range: "≥ 80% fibres naturelles", points: 3, color: "text-green-600" },
              { range: "50–79% fibres naturelles", points: 2, color: "text-amber-600" },
              { range: "< 50% fibres naturelles", points: 1, color: "text-black/50" },
            ].map(({ range, points, color }) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-black/60">{range}</span>
                <span className={`font-bold ${color}`}>
                  {points} pt{points > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-black/40 mt-3 pt-3 border-t border-black/8">
            Les fibres naturelles incluent : coton, lin, laine, soie, bambou, chanvre…
          </p>
        </div>

        {/* Form or closed window message */}
        {isWindowOpen ? (
          <ClothingRegistrationForm
            registrationId={registration.id}
            eventId={params.id}
            existingItems={registration.clothingItems}
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-black/50 text-sm">
              La fenêtre d&apos;enregistrement des vêtements est fermée.
              <br />
              L&apos;événement a déjà commencé.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
