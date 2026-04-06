import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    const item = await prisma.clothingItem.findUnique({
      where: { id: params.itemId },
      include: {
        registration: {
          include: { event: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Vêtement introuvable." }, { status: 404 });
    }

    // Check ownership
    if (item.registration.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    // Can't delete if already validated
    if (item.validated) {
      return NextResponse.json(
        { error: "Ce vêtement a déjà été validé." },
        { status: 400 }
      );
    }

    // Can't delete after event has started
    if (new Date(item.registration.event.date) <= new Date()) {
      return NextResponse.json(
        { error: "L'événement a déjà commencé." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.clothingItem.delete({ where: { id: params.itemId } });
      // Deduct points
      await tx.userPoints.update({
        where: { userId: session.user.id! },
        data: { totalPoints: { decrement: item.points } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[clothing DELETE] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Only business owners can validate clothing items
  const body = await req.json();
  const { validated } = body;

  if (typeof validated !== "boolean") {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const item = await prisma.clothingItem.findUnique({
    where: { id: params.itemId },
    include: {
      registration: {
        include: {
          event: {
            include: { createdBy: true },
          },
        },
      },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Vêtement introuvable." }, { status: 404 });
  }

  // Only event organiser can validate
  if (item.registration.event.createdById !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const updated = await prisma.clothingItem.update({
    where: { id: params.itemId },
    data: { validated },
  });

  return NextResponse.json({ clothingItem: updated });
}
