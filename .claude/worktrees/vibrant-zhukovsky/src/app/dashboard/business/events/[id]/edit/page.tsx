import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditEventForm } from "./EditEventForm";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "BUSINESS") {
    redirect("/auth/signin");
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event || event.createdById !== session.user.id) notFound();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] py-12 px-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#0e59c3]">Modifier le Loop Club</h1>
          <p className="mt-2 text-black/50 text-sm">
            {event._count.registrations > 0
              ? `${event._count.registrations} inscrit(s) seront notifiés par email.`
              : "Aucun inscrit pour l'instant."}
          </p>
        </div>
        <EditEventForm event={{
          id: event.id,
          title: event.title,
          venueSuggestion: event.fripeirieName,
          venueAddress: event.address,
          date: event.date.toISOString().split("T")[0],
          timeSlot: event.timeSlot,
          maxParticipants: event.maxParticipants,
          price: event.price,
        }} />
      </div>
    </div>
  );
}
