import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const DELETE = auth(async function DELETE(req, ctx) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const userId = req.auth.user.id;
  const itemId = (ctx?.params as { itemId: string })?.itemId;

  try {
    const item = await prisma.clothingItem.findUnique({
      where: { id: itemId },
      include: { registration: { include: { event: true } } },
    });
    if (!item) return NextResponse.json({ error: "Vêtement introuvable." }, { status: 404 });
    if (item.registration.userId !== userId) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    if (item.validated) return NextResponse.json({ error: "Ce vêtement a déjà été validé." }, { status: 400 });
    if (new Date(item.registration.event.date) <= new Date()) return NextResponse.json({ error: "L'événement a déjà commencé." }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      await tx.clothingItem.delete({ where: { id: itemId } });
      await tx.userPoints.update({ where: { userId }, data: { totalPoints: { decrement: item.points } } });
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[clothing DELETE] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
});

export const PATCH = auth(async function PATCH(req, ctx) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const userId = req.auth.user.id;
  const itemId = (ctx?.params as { itemId: string })?.itemId;

  const body = await req.json();
  const { validated } = body;
  if (typeof validated !== "boolean") return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const item = await prisma.clothingItem.findUnique({
    where: { id: itemId },
    include: { registration: { include: { event: { include: { createdBy: true } } } } },
  });
  if (!item) return NextResponse.json({ error: "Vêtement introuvable." }, { status: 404 });
  if (item.registration.event.createdById !== userId) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const updated = await prisma.clothingItem.update({ where: { id: itemId }, data: { validated } });
  return NextResponse.json({ clothingItem: updated });
});
