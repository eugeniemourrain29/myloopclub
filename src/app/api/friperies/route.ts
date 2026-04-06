import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const friperieSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const accountType = session.user.accountType;
  if (accountType !== "BUSINESS") {
    return NextResponse.json({ error: "Réservé aux comptes Business." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = friperieSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Profil Business introuvable." }, { status: 404 });
    }

    const friperie = await prisma.friperie.create({
      data: {
        businessId: business.id,
        name: parsed.data.name,
        address: parsed.data.address,
        lat: parsed.data.lat,
        lng: parsed.data.lng,
      },
    });

    return NextResponse.json({ friperie }, { status: 201 });
  } catch (err) {
    console.error("[friperies POST] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
    include: { friperies: true },
  });

  return NextResponse.json({ friperies: business?.friperies ?? [] });
}
