import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Shirt } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

interface PaymentPageProps {
  params: { id: string };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const session = await auth();
  if (!session?.user) redirect(`/auth/signin?callbackUrl=/events/${params.id}/payment`);

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) notFound();

  const registration = await prisma.registration.findUnique({
    where: {
      userId_eventId: {
        userId: session.user.id!,
        eventId: params.id,
      },
    },
  });

  if (!registration) redirect(`/events/${params.id}`);
  if (registration.paid) redirect(`/events/${params.id}/register-clothes`);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] py-10 px-6">
      <div className="max-w-md mx-auto">
        <Link
          href={`/events/${params.id}`}
          className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="text-3xl font-bold text-[#0e59c3] mb-1">
          Finalise ton inscription
        </h1>
        <p className="text-black/50 mb-8">{event.title}</p>

        {/* Summary */}
        <div className="bg-white border border-black/8 rounded-2xl p-5 mb-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-black/50">Événement</span>
              <span className="font-medium">{event.fripeirieName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Date</span>
              <span className="font-medium">{formatDate(event.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Créneau</span>
              <span className="font-medium">{event.timeSlot}</span>
            </div>
            <div className="flex justify-between border-t border-black/8 pt-3 mt-3">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-[#0e59c3] text-base">
                {formatPrice(event.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment placeholder */}
        <div className="bg-white border border-black/8 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium text-black">
            <CreditCard className="w-4 h-4 text-[#0e59c3]" />
            Paiement sécurisé
          </div>

          {/* In production, integrate Stripe Elements here */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Numéro de carte"
              className="w-full px-4 py-3 rounded-xl border border-black/15 bg-gray-50 text-black placeholder-black/30 text-sm"
              disabled
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/AA"
                className="w-full px-4 py-3 rounded-xl border border-black/15 bg-gray-50 text-black placeholder-black/30 text-sm"
                disabled
              />
              <input
                type="text"
                placeholder="CVC"
                className="w-full px-4 py-3 rounded-xl border border-black/15 bg-gray-50 text-black placeholder-black/30 text-sm"
                disabled
              />
            </div>
          </div>
          <p className="text-xs text-black/30 mt-3">
            Intégration Stripe à connecter. Le paiement est désactivé en mode démo.
          </p>
        </div>

        {/* Demo: mark as paid via server action */}
        <form
          action={async () => {
            "use server";
            await prisma.registration.update({
              where: { id: registration.id },
              data: { paid: true },
            });
            redirect(`/events/${params.id}/register-clothes`);
          }}
        >
          <button
            type="submit"
            className="w-full bg-[#0e59c3] text-white font-medium py-3 rounded-xl hover:bg-[#0d4fad] transition-colors text-sm flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Payer {formatPrice(event.price)} (Démo)
          </button>
        </form>

        <Link
          href={`/events/${params.id}/register-clothes`}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-black/50 hover:text-black transition-colors py-3"
        >
          <Shirt className="w-4 h-4" />
          Enregistrer mes vêtements sans payer (démo)
        </Link>
      </div>
    </div>
  );
}
