import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/points";
import { z } from "zod";

const clothingSchema = z.object({
  registrationId: z.string(),
  brand: z.string().min(1),
  naturalFiberPercent: z.number().int().min(0).max(100),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = clothingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const { registrationId, brand, naturalFiberPercent } = parsed.data;

    // Verify the registration belongs to this user and this event
    const registration = await prisma.registration.findFirst({
      where: {
        id: registrationId,
        userId: session.user.id,
        eventId: params.id,
      },
      include: {
        event: true,
        _count: { select: { clothingItems: true } },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Inscription introuvable." },
        { status: 404 }
      );
    }

    // Window check: must be before event start
    if (new Date(registration.event.date) <= new Date()) {
      return NextResponse.json(
        { error: "La fenêtre d'enregistrement est fermée." },
        { status: 400 }
      );
    }

    // Max 5 items per registration
    if (registration._count.clothingItems >= 5) {
      return NextResponse.json(
        { error: "Tu ne peux pas enregistrer plus de 5 vêtements." },
        { status: 400 }
      );
    }

    const points = calculatePoints(naturalFiberPercent);

    const clothingItem = await prisma.$transaction(async (tx) => {
      const item = await tx.clothingItem.create({
        data: {
          registrationId,
          brand,
          naturalFiberPercent,
          points,
        },
      });

      // Update user total points
      await tx.userPoints.upsert({
        where: { userId: session.user.id! },
        update: { totalPoints: { increment: points } },
        create: { userId: session.user.id!, totalPoints: points },
      });

      return item;
    });

    return NextResponse.json({ clothingItem }, { status: 201 });
  } catch (err) {
    console.error("[register-clothes POST] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
