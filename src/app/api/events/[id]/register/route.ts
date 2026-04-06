import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = auth(async function POST(req, ctx) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const userId = req.auth.user.id;
  const eventId = (ctx?.params as { id: string })?.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  if (event.status !== "UPCOMING") return NextResponse.json({ error: "Cet événement n'est plus disponible." }, { status: 400 });
  if (new Date(event.date) < new Date()) return NextResponse.json({ error: "Cet événement est passé." }, { status: 400 });
  if (event._count.registrations >= event.maxParticipants) return NextResponse.json({ error: "L'événement est complet." }, { status: 400 });

  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) return NextResponse.json({ error: "Tu es déjà inscrit à cet événement." }, { status: 409 });

  const registration = await prisma.registration.create({
    data: { userId, eventId, paid: false },
  });

  return NextResponse.json({ registration }, { status: 201 });
});
