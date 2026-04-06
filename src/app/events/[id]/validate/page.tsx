import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ValidateClothingList } from "./ValidateClothingList";

interface ValidatePageProps {
  params: { id: string };
}

export default async function ValidatePage({ params }: ValidatePageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const accountType = session.user.accountType;
  if (accountType !== "BUSINESS") redirect("/dashboard/user");

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        include: {
          user: { select: { name: true, id: true } },
          clothingItems: true,
        },
      },
    },
  });

  if (!event) notFound();

  // Verify this business owns the event
  if (event.createdById !== session.user.id) {
    redirect("/dashboard/business");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard/business"
          className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-[#0e59c3] mb-1">
          Valider les vêtements
        </h1>
        <p className="text-black/50 mb-8">
          {event.title} · {formatDate(event.date)} · {event.timeSlot}
        </p>

        {event.registrations.length === 0 ? (
          <div className="bg-white border border-black/8 rounded-2xl p-8 text-center text-black/40 text-sm">
            Aucun participant inscrit.
          </div>
        ) : (
          <div className="space-y-6">
            {event.registrations.map((reg) => (
              <div key={reg.id} className="bg-white border border-black/8 rounded-2xl p-5">
                <h3 className="font-bold text-black mb-4">
                  {reg.user.name.split(" ")[0]}
                  <span className="ml-2 text-xs font-normal text-black/40">
                    {reg.clothingItems.length} vêtement
                    {reg.clothingItems.length !== 1 ? "s" : ""}
                  </span>
                </h3>

                {reg.clothingItems.length === 0 ? (
                  <p className="text-sm text-black/40">Aucun vêtement enregistré.</p>
                ) : (
                  <ValidateClothingList items={reg.clothingItems} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
