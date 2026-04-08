import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const friperieSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const POST = auth(async function POST(req) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  if (req.auth.user.accountType !== "BUSINESS") {
    return NextResponse.json({ error: "Réservé aux comptes Business." }, { status: 403 });
  }
  const userId = req.auth.user.id;

  try {
    const body = await req.json();
    const parsed = friperieSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return NextResponse.json({ error: "Profil Business introuvable." }, { status: 404 });

    const friperie = await prisma.friperie.create({
      data: { businessId: business.id, ...parsed.data },
    });
    return NextResponse.json({ friperie }, { status: 201 });
  } catch (err) {
    console.error("[friperies POST] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
});

export const GET = auth(async function GET(req) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const business = await prisma.business.findUnique({
    where: { userId: req.auth.user.id },
    include: { friperies: true },
  });
  return NextResponse.json({ friperies: business?.friperies ?? [] });
});
