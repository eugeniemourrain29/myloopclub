import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/points";
import { z } from "zod";

const clothingSchema = z.object({
  registrationId: z.string(),
  brand: z.string().min(1),
  naturalFiberPercent: z.number().int().min(0).max(100),
});

export const POST = auth(async function POST(req, ctx) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const userId = req.auth.user.id;
  const eventId = (ctx?.params as { id: string })?.id;

  try {
    const body = await req.json();
    const parsed = clothingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

    const { registrationId, brand, naturalFiberPercent } = parsed.data;

    const registration = await prisma.registration.findFirst({
      where: { id: registrationId, userId, eventId },
      include: { event: true, _count: { select: { clothingItems: true } } },
    });

    if (!registration) return NextResponse.json({ error: "Inscription introuvable." }, { status: 404 });
    if (new Date(registration.event.date) <= new Date()) return NextResponse.json({ error: "La fenêtre d'enregistrement est fermée." }, { status: 400 });
    if (registration._count.clothingItems >= 5) return NextResponse.json({ error: "Tu ne peux pas enregistrer plus de 5 vêtements." }, { status: 400 });

    const points = calculatePoints(naturalFiberPercent);
    const clothingItem = await prisma.$transaction(async (tx) => {
      const item = await tx.clothingItem.create({ data: { registrationId, brand, naturalFiberPercent, points } });
      await tx.userPoints.upsert({
        where: { userId },
        update: { totalPoints: { increment: points } },
        create: { userId, totalPoints: points },
      });
      return item;
    });

    return NextResponse.json({ clothingItem }, { status: 201 });
  } catch (err) {
    console.error("[register-clothes POST] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
});
